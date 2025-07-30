import type { Express } from 'express';
import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, ilike, and } from 'drizzle-orm';

import { httpError, HttpErrorBody } from '../utils/http-error.ts';
import { DeviceId, ModelId, MacAddress, DeviceStatus, ModelName, TypeId, TypeName } from '../validation/device.ts';
import { deviceTable, deviceModelTable, deviceTypeTable } from '../db/db-schema.ts';
import { checkApiKey } from '../utils/checkApiKey.ts';

export const register = (app: Express, doc: OpenAPIRegistry, db: NodePgDatabase) => {

  const apiKeyAuth = doc.registerComponent(
    'securitySchemes',
    'ApiKeyAuth',
    {
      type: 'apiKey',
      in: 'header',
      name: 'X-API-KEY',
    }
  );

  const errorResponses = {
    400: { description: 'Invalid request', content: { 'application/json': { schema: HttpErrorBody } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: HttpErrorBody } } },
    404: { description: 'Device not found', content: { 'application/json': { schema: HttpErrorBody } } },
    500: { description: 'Server error', content: { 'application/json': { schema: HttpErrorBody } } },
  }


  const DeviceInfoSchema = z.object({
    deviceId: DeviceId,
    mac: MacAddress,
    status: DeviceStatus,
    modelId: ModelId,
    modelName: ModelName,
    typeId: TypeId,
    typeName: TypeName,
  }).openapi({ description: 'Device Schema' });

  type DeviceInfo = z.infer<typeof DeviceInfoSchema>;

  // --------------------------------------------------------------------------------
  // GET
  const DeviceQueryParamsSchema = z.object({ 
    status: DeviceStatus.optional(),
    model: ModelName.optional(),
    type: TypeName.optional(),
    mac: MacAddress.optional(),
  });

  doc.registerPath({
    method: 'get',
    path: '/devices',
    description: 'Get devices',
    summary: 'Get Devices',
    security: [{ [apiKeyAuth.name]: [] }],
    request: {
      query: DeviceQueryParamsSchema,
    },
    responses: {
      200: {
        description: 'Devices returned',
        content: { 'application/json': { schema: z.array(DeviceInfoSchema) } }
      },
      ...errorResponses
    },
    tags: ['Devices']
  });

  app.get('/devices', checkApiKey, async (req, res) => {
    const queryParams = DeviceQueryParamsSchema.safeParse(req.query);
    if (!queryParams.success) {
      throw httpError(400, z.prettifyError(queryParams.error));
    }

    const {
        mac: filterMac, 
        model: filterModel,
        type: filterType,
        status: filterStatus
      } = queryParams.data;

    let devices: DeviceInfo[] = 
      await db
        .select({
          deviceId: deviceTable.id,
          mac: deviceTable.mac,
          status: deviceTable.status,
          modelId: deviceTable.modelId,
          modelName: deviceModelTable.name,
          typeId: deviceModelTable.typeId,
          typeName: deviceTypeTable.name
        })
        .from(deviceTable)
        .innerJoin(deviceModelTable, eq(deviceModelTable.id, deviceTable.modelId))
        .innerJoin(deviceTypeTable, eq(deviceTypeTable.id, deviceModelTable.typeId))
        .where(
          and(
            (filterMac ? ilike(deviceTable.mac, `%${filterMac}%`) : undefined),
            (filterModel ? ilike(deviceModelTable.name, `%${filterModel}%`) : undefined),
            (filterType ? ilike(deviceTypeTable.name, `%${filterType}%`) : undefined),
            (filterStatus ? eq(deviceTable.status, filterStatus) : undefined),
          )      
        );
    
    res.json(devices);
  });

  // --------------------------------------------------------------------------------
  // GET one
  doc.registerPath({
    method: 'get',
    path: '/devices/{id}',
    description: 'Get a device by ID',
    summary: 'Get Device',
    security: [{ [apiKeyAuth.name]: [] }],
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      200: {
        description: 'Device found',
        content: { 'application/json': { schema: DeviceInfoSchema } }
      },
      ...errorResponses
    },
    tags: ['Devices']
  });

  app.get('/devices/:id', checkApiKey, async (req, res) => {
    const id = Number(req.params.id);
    const devices: DeviceInfo[] = 
      await db
        .select({
          deviceId: deviceTable.id,
          mac: deviceTable.mac,
          status: deviceTable.status,
          modelId: deviceTable.modelId,
          modelName: deviceModelTable.name,
          typeId: deviceModelTable.typeId,
          typeName: deviceTypeTable.name
        })
        .from(deviceTable)
        .innerJoin(deviceModelTable, eq(deviceModelTable.id, deviceTable.modelId))
        .innerJoin(deviceTypeTable, eq(deviceTypeTable.id, deviceModelTable.typeId))
        .where(eq(deviceTable.id, id));      
    if (devices.length === 0) {
      throw httpError(404, 'Not found');
    }
    res.json(devices[0]);
  });

  // --------------------------------------------------------------------------------
  // POST
  const CreateDeviceSchema = z.object({
    modelId: ModelId,
    mac: MacAddress,
    status: DeviceStatus
  }).openapi({ description: 'Create Device Schema' });

  doc.registerPath({
    method: 'post',
    path: '/devices',
    description: 'Create a new device',
    summary: 'Create Device',
    security: [{ [apiKeyAuth.name]: [] }],
    request: {
      body: {
        content: { 'application/json': { schema: CreateDeviceSchema } }
      }
    },
    responses: {
      200: {
        description: 'Device created',
        content: { 'application/json': { schema: z.object({ id: DeviceId }) } }
      },
      ...errorResponses
    },
    tags: ['Devices']
  });

  app.post('/devices', checkApiKey, async (req, res) => {
    const input = CreateDeviceSchema.safeParse(req.body);
    if (!input.success) {
      throw httpError(400, z.prettifyError(input.error));
    }

    const inserted = 
      await db
        .insert(deviceTable)
        .values(input.data)
        .returning({ insertedId: deviceTable.id });
    const id = inserted[0]?.insertedId;
    if (!id) {
      throw httpError(500, 'Insert in DB failed');
    }

    res.json({ id });
  });

  // --------------------------------------------------------------------------------
  // PATCH
  const ModifyDeviceParamsSchema = z.object({ id: z.coerce.number().int() });

  const ModifyDeviceSchema = z.object({
    mac: MacAddress.optional(),
    status: DeviceStatus.optional()
  }).openapi({ description: 'Modify Device Schema' });

  doc.registerPath({
    method: 'patch',
    path: '/devices/{id}',
    description: 'Modify a device',
    summary: 'Modify Device',
    security: [{ [apiKeyAuth.name]: [] }],
    request: {
      params: ModifyDeviceParamsSchema,
      body: {
        content: { 'application/json': { schema: ModifyDeviceSchema } }
      }
    },
    responses: {
      200: {
        description: 'Device modified',
        content: { 'application/json': { schema: z.object({ id: DeviceId }) } }
      },
      ...errorResponses
    },
    tags: ['Devices']
  });

  app.patch('/devices/:id', checkApiKey, async (req, res) => {
    const params = ModifyDeviceParamsSchema.safeParse(req.params);
    if (!params.success) {
      throw httpError(400, z.prettifyError(params.error));
    }
    const input = ModifyDeviceSchema.safeParse(req.body);
    if (!input.success) {
      throw httpError(400, z.prettifyError(input.error));
    }

    if (input.data.status) {
      const statuses = [
        { name: 'stock', canTransitionFrom: ['stock', 'maintenance'] }, 
        { name: 'installé', canTransitionFrom: ['installé', 'stock'] }, 
        { name: 'maintenance', canTransitionFrom: ['maintenance', 'installé'] }
      ];

      const currentDevice = 
        await db
          .select({
            id: deviceTable.id, 
            status: deviceTable.status
          })
          .from(deviceTable)
          .where(eq(deviceTable.id, params.data.id))
        if (!currentDevice || currentDevice.length === 0) {
          throw httpError(404, 'Device not found');
        }
        const currentStatus = currentDevice[0]?.status ?? '';
        const acceptedPreviousStatuses = statuses.find(s => s.name === input.data.status)?.canTransitionFrom;

        if (!acceptedPreviousStatuses?.includes(currentStatus)) {
          throw httpError(400, `Cannot change status from ${currentStatus} to ${input.data.status}`);
        }
    }

    const updated = 
      await db
        .update(deviceTable)
        .set(input.data)
        .where(eq(deviceTable.id, params.data.id))
        .returning({ updatedId: deviceTable.id });
    const id = updated[0]?.updatedId;
    if (!id) {
      throw httpError(404, 'Device not found');
    }

    res.json({ id });
  });

  // --------------------------------------------------------------------------------
  // DELETE
  const DeleteDeviceParamsSchema = z.object({ id: z.coerce.number().int() });

  doc.registerPath({
    method: 'delete',
    path: '/devices/{id}',
    description: 'Delete a device',
    summary: 'Delete Device',
    security: [{ [apiKeyAuth.name]: [] }],
    request: {
      params: DeleteDeviceParamsSchema,
    },
    responses: {
      200: {
        description: 'Device deleted',
        content: { 'application/json': { schema: z.object({ id: DeviceId }) } }
      },
      ...errorResponses
    },
    tags: ['Devices']
  });

  app.delete('/devices/:id', checkApiKey, async (req, res) => {
    const input = DeleteDeviceParamsSchema.safeParse(req.params);
    if (!input.success) {
      throw httpError(400, z.prettifyError(input.error));
    }

    const deleted = 
      await db
        .delete(deviceTable)
        .where(eq(deviceTable.id, input.data.id))
        .returning({ deletedId: deviceTable.id });
    const id = deleted[0]?.deletedId;
    if (!id) {
      throw httpError(404, 'Device not found');
    }

    res.json({ id });
  });

}