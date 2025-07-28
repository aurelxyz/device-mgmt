import type { Express } from 'express';
import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';

import { httpError, HttpErrorBody } from '../utils/http-error.ts';
import { CreateDeviceSchema, ModifyDeviceSchema, DeviceId, ModelId, MacAddress, DeviceStatus, ModelName, TypeId, TypeName } from '../validation/device.ts';
import { deviceTable, deviceModelTable, deviceTypeTable } from '../db/db-schema.ts';

export const register = (app: Express, doc: OpenAPIRegistry, db: NodePgDatabase) => {

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
    request: {
      query: DeviceQueryParamsSchema,
    },
    responses: {
      200: {
        description: 'Devices returned',
        content: { 'application/json': { schema: z.array(DeviceInfoSchema) } }
      }
    },
    tags: ['Devices']
  });

  app.get('/devices', async (req, res) => {
    const queryParams = DeviceQueryParamsSchema.safeParse(req.query);
    if (!queryParams.success) {
      throw httpError(400, z.prettifyError(queryParams.error));
    }

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
        .innerJoin(deviceTypeTable, eq(deviceTypeTable.id, deviceModelTable.typeId));

    const {
        mac: filterMac, 
        model: filterModel,
        type: filterType,
        status: filterStatus
      } = queryParams.data;

    if (filterMac) devices = devices.filter(d => d.mac.includes(filterMac));                // TODO: apply filters in SQL query
    if (filterModel) devices = devices.filter(d => d.modelName.includes(filterModel));
    if (filterType) devices = devices.filter(d => d.typeName.includes(filterType));
    if (filterStatus) devices = devices.filter(d => d.status?.includes(filterStatus));
    
    res.json(devices);
  });

  // --------------------------------------------------------------------------------
  // GET one
  doc.registerPath({
    method: 'get',
    path: '/devices/{id}',
    description: 'Get a device by ID',
    summary: 'Get Device',
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      200: {
        description: 'Device found',
        content: { 'application/json': { schema: DeviceInfoSchema } }
      },
      404: {
        description: 'Device not found',
        content: { 'application/json': { schema: HttpErrorBody } }
      }
    },
    tags: ['Devices']
  });

  app.get('/devices/:id', async (req, res) => {
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
  doc.registerPath({
    method: 'post',
    path: '/devices',
    description: 'Create a new device',
    summary: 'Create Device',
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
      400: {
        description: 'Invalid request',
        content: { 'application/json': { schema: HttpErrorBody } }
      }
    },
    tags: ['Devices']
  });

  app.post('/devices', async (req, res) => {
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

  doc.registerPath({
    method: 'patch',
    path: '/devices/{id}',
    description: 'Modify a device',
    summary: 'Modify Device',
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
      400: {
        description: 'Invalid request',
        content: { 'application/json': { schema: HttpErrorBody } }
      }
    },
    tags: ['Devices']
  });

  app.patch('/devices/:id', async (req, res) => {
    const params = ModifyDeviceParamsSchema.safeParse(req.params);
    if (!params.success) {
      throw httpError(400, z.prettifyError(params.error));
    }
    const input = ModifyDeviceSchema.safeParse(req.body);
    if (!input.success) {
      throw httpError(400, z.prettifyError(input.error));
    }

    const inserted = 
      await db
        .update(deviceTable)
        .set(input.data)
        .where(eq(deviceTable.id, params.data.id))
        .returning({ insertedId: deviceTable.id });
    const id = inserted[0]?.insertedId;
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
    request: {
      params: DeleteDeviceParamsSchema,
    },
    responses: {
      200: {
        description: 'Device deleted',
        content: { 'application/json': { schema: z.object({ id: DeviceId }) } }
      },
      400: {
        description: 'Invalid request',
        content: { 'application/json': { schema: HttpErrorBody } }
      }
    },
    tags: ['Devices']
  });

  app.delete('/devices/:id', async (req, res) => {
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