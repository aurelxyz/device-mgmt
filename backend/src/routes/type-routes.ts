import type { Express } from 'express';
import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';

import { httpError, HttpErrorBody } from '../utils/http-error.ts';
import { TypeId, TypeName } from '../validation/device.ts';
import { deviceTypeTable } from '../db/db-schema.ts';
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

  const DeviceTypeSchema = z.object({
    typeId: TypeId,
    typeName: TypeName,
  }).openapi({ description: 'Device Type Schema' });

  type DeviceTypeInfo = z.infer<typeof DeviceTypeSchema>;

  // --------------------------------------------------------------------------------
  // GET
  const DeviceTypeQueryParamsSchema = z.object({ 
    name: TypeName.optional(),
  });

  doc.registerPath({
    method: 'get',
    path: '/device-types',
    description: 'Get device types',
    summary: 'Get Device Types',
    security: [{ [apiKeyAuth.name]: [] }],
    request: {
      query: DeviceTypeQueryParamsSchema,
    },
    responses: {
      200: {
        description: 'Device types returned',
        content: { 'application/json': { schema: z.array(DeviceTypeSchema) } }
      }
    },
    tags: ['Device Types']
  });

  app.get('/device-types', checkApiKey, async (req, res) => {
    const queryParams = DeviceTypeQueryParamsSchema.safeParse(req.query);
    if (!queryParams.success) {
      throw httpError(400, z.prettifyError(queryParams.error));
    }

    let deviceTypes: DeviceTypeInfo[] = 
      await db
        .select({
          typeId: deviceTypeTable.id,
          typeName: deviceTypeTable.name
        })
        .from(deviceTypeTable)

    const {
      name: filterName, 
    } = queryParams.data;

    if (filterName) deviceTypes = deviceTypes.filter(d => d.typeName.includes(filterName));
    
    res.json(deviceTypes);
  });

  // --------------------------------------------------------------------------------
  // GET one
  doc.registerPath({
    method: 'get',
    path: '/device-types/{id}',
    description: 'Get a device type by ID',
    summary: 'Get Device Type',
    security: [{ [apiKeyAuth.name]: [] }],
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      200: {
        description: 'Device type found',
        content: { 'application/json': { schema: DeviceTypeSchema } }
      },
      404: {
        description: 'Device type not found',
        content: { 'application/json': { schema: HttpErrorBody } }
      }
    },
    tags: ['Device Types']
  });

  app.get('/device-types/:id', checkApiKey, async (req, res) => {
    const id = Number(req.params.id);
    const deviceTypes: DeviceTypeInfo[] = 
      await db
        .select({
          typeId: deviceTypeTable.id,
          typeName: deviceTypeTable.name
        })
        .from(deviceTypeTable)
        .where(eq(deviceTypeTable.id, id));      
    if (deviceTypes.length === 0) {
      throw httpError(404, 'Not found');
    }
    res.json(deviceTypes[0]);
  });

  // --------------------------------------------------------------------------------
  // POST
  const CreateDeviceTypeSchema = z.object({
    name: TypeName,
  }).openapi({ description: 'Create Device Type Schema' });

  doc.registerPath({
    method: 'post',
    path: '/device-types',
    description: 'Create a new device type',
    summary: 'Create Device Type',
    security: [{ [apiKeyAuth.name]: [] }],
    request: {
      body: {
        content: { 'application/json': { schema: CreateDeviceTypeSchema } }
      }
    },
    responses: {
      200: {
        description: 'Device type created',
        content: { 'application/json': { schema: z.object({ id: TypeId }) } }
      },
      400: {
        description: 'Invalid request',
        content: { 'application/json': { schema: HttpErrorBody } }
      }
    },
    tags: ['Device Types']
  });

  app.post('/device-types', checkApiKey, async (req, res) => {
    const input = CreateDeviceTypeSchema.safeParse(req.body);
    if (!input.success) {
      throw httpError(400, z.prettifyError(input.error));
    }

    const inserted = 
      await db
        .insert(deviceTypeTable)
        .values(input.data)
        .returning({ insertedId: deviceTypeTable.id });
    const id = inserted[0]?.insertedId;
    if (!id) {
      throw httpError(500, 'Insert in DB failed');
    }

    res.json({ id });
  });

  // --------------------------------------------------------------------------------
  // PATCH
  const ModifyDeviceTypeParamsSchema = z.object({ id: z.coerce.number().int() });

  const ModifyDeviceTypeSchema = z.object({
    name: TypeName.optional(),
  }).openapi({ description: 'Modify Device Type Schema' });

  doc.registerPath({
    method: 'patch',
    path: '/device-types/{id}',
    description: 'Modify a device type',
    summary: 'Modify Device Type',
    security: [{ [apiKeyAuth.name]: [] }],
    request: {
      params: ModifyDeviceTypeParamsSchema,
      body: {
        content: { 'application/json': { schema: ModifyDeviceTypeSchema } }
      }
    },
    responses: {
      200: {
        description: 'Device type modified',
        content: { 'application/json': { schema: z.object({ id: TypeId }) } }
      },
      400: {
        description: 'Invalid request',
        content: { 'application/json': { schema: HttpErrorBody } }
      }
    },
    tags: ['Device Types']
  });

  app.patch('/device-types/:id', checkApiKey, async (req, res) => {
    const params = ModifyDeviceTypeParamsSchema.safeParse(req.params);
    if (!params.success) {
      throw httpError(400, z.prettifyError(params.error));
    }
    const input = ModifyDeviceTypeSchema.safeParse(req.body);
    if (!input.success) {
      throw httpError(400, z.prettifyError(input.error));
    }

    const updated = 
      await db
        .update(deviceTypeTable)
        .set(input.data)
        .where(eq(deviceTypeTable.id, params.data.id))
        .returning({ updatedId: deviceTypeTable.id });
    const id = updated[0]?.updatedId;
    if (!id) {
      throw httpError(404, 'Device not found');
    }

    res.json({ id });
  });

  // --------------------------------------------------------------------------------
  // DELETE
  const DeleteDeviceTypeParamsSchema = z.object({ id: z.coerce.number().int() });

  doc.registerPath({
    method: 'delete',
    path: '/device-types/{id}',
    description: 'Delete a device type',
    summary: 'Delete Device Type',
    security: [{ [apiKeyAuth.name]: [] }],
    request: {
      params: DeleteDeviceTypeParamsSchema,
    },
    responses: {
      200: {
        description: 'Device type deleted',
        content: { 'application/json': { schema: z.object({ id: TypeId }) } }
      },
      400: {
        description: 'Invalid request',
        content: { 'application/json': { schema: HttpErrorBody } }
      }
    },
    tags: ['Device Types']
  });

  app.delete('/device-types/:id', checkApiKey, async (req, res) => {
    const input = DeleteDeviceTypeParamsSchema.safeParse(req.params);
    if (!input.success) {
      throw httpError(400, z.prettifyError(input.error));
    }

    const deleted = 
      await db
        .delete(deviceTypeTable)
        .where(eq(deviceTypeTable.id, input.data.id))
        .returning({ deletedId: deviceTypeTable.id });
    const id = deleted[0]?.deletedId;
    if (!id) {
      throw httpError(404, 'Device not found');
    }

    res.json({ id });
  });

}