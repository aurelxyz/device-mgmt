import type { Express } from 'express';
import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';

import { httpError, HttpErrorBody } from '../utils/http-error.ts';
import { ModelId, ModelName, TypeId, TypeName } from '../validation/device.ts';
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

  const DeviceModelSchema = z.object({
    modelId: ModelId,
    modelName: ModelName,
    typeId: TypeId,
    typeName: TypeName,
  }).openapi({ description: 'Device Model Schema' });

  type DeviceModel = z.infer<typeof DeviceModelSchema>;

  // --------------------------------------------------------------------------------
  // GET
  const DeviceModelQueryParamsSchema = z.object({ 
    name: ModelName.optional(),
    type: TypeName.optional(),
  });

  doc.registerPath({
    method: 'get',
    path: '/device-models',
    description: 'Get device models',
    summary: 'Get Device Models',
    security: [{ [apiKeyAuth.name]: [] }],
    request: {
      query: DeviceModelQueryParamsSchema,
    },
    responses: {                                                                    // TODO: add 401
      200: {
        description: 'Device models returned',
        content: { 'application/json': { schema: z.array(DeviceModelSchema) } }
      }
    },
    tags: ['Device Models']
  });

  app.get('/device-models', checkApiKey, async (req, res) => {
    const queryParams = DeviceModelQueryParamsSchema.safeParse(req.query);
    if (!queryParams.success) {
      throw httpError(400, z.prettifyError(queryParams.error));
    }

    let deviceModels: DeviceModel[] = 
      await db
        .select({
          modelId: deviceModelTable.id,
          modelName: deviceModelTable.name,
          typeId: deviceModelTable.typeId,
          typeName: deviceTypeTable.name
        })
        .from(deviceModelTable)
        .innerJoin(deviceTypeTable, eq(deviceTypeTable.id, deviceModelTable.typeId));

    const {
      name: filterModel,
      type: filterType,
    } = queryParams.data;

    if (filterModel) deviceModels = deviceModels.filter(d => d.modelName.includes(filterModel));      // TODO: filter in db query
    if (filterType) deviceModels = deviceModels.filter(d => d.typeName.includes(filterType));
    
    res.json(deviceModels);
  });

  // --------------------------------------------------------------------------------
  // GET one
  doc.registerPath({
    method: 'get',
    path: '/device-models/{id}',
    description: 'Get a device model by ID',
    summary: 'Get Device Model',
    security: [{ [apiKeyAuth.name]: [] }],
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      200: {
        description: 'Device  model found',
        content: { 'application/json': { schema: DeviceModelSchema } }
      },
      404: {
        description: 'Device model not found',
        content: { 'application/json': { schema: HttpErrorBody } }
      }
    },
    tags: ['Device Models']
  });

  app.get('/device-models/:id', checkApiKey, async (req, res) => {
    const id = Number(req.params.id);
    const deviceModels: DeviceModel[] = 
      await db
        .select({
          modelId: deviceTable.modelId,
          modelName: deviceModelTable.name,
          typeId: deviceModelTable.typeId,
          typeName: deviceTypeTable.name
        })
        .from(deviceModelTable)
        .innerJoin(deviceTypeTable, eq(deviceTypeTable.id, deviceModelTable.typeId))
        .where(eq(deviceModelTable.id, id));      
    if (deviceModels.length === 0) {
      throw httpError(404, 'Not found');
    }
    res.json(deviceModels[0]);
  });

  // --------------------------------------------------------------------------------
  // POST
  const CreateDeviceModelSchema = z.object({
    name: ModelName,
    typeId: TypeId,
  }).openapi({ description: 'Create Device Model Schema' });

  doc.registerPath({
    method: 'post',
    path: '/device-models',
    description: 'Create a new device model',
    summary: 'Create Device Model',
    security: [{ [apiKeyAuth.name]: [] }],
    request: {
      body: {
        content: { 'application/json': { schema: CreateDeviceModelSchema } }
      }
    },
    responses: {
      200: {
        description: 'Device model created',
        content: { 'application/json': { schema: z.object({ id: ModelId }) } }
      },
      400: {
        description: 'Invalid request',
        content: { 'application/json': { schema: HttpErrorBody } }
      }
    },
    tags: ['Device Models']
  });

  app.post('/device-models', checkApiKey, async (req, res) => {
    const input = CreateDeviceModelSchema.safeParse(req.body);
    if (!input.success) {
      throw httpError(400, z.prettifyError(input.error));
    }

    const inserted = 
      await db
        .insert(deviceModelTable)
        .values(input.data)
        .returning({ insertedId: deviceModelTable.id });
    const id = inserted[0]?.insertedId;
    if (!id) {
      throw httpError(500, 'Insert in DB failed');
    }

    res.json({ id });
  });

  // --------------------------------------------------------------------------------
  // PATCH
  const ModifyDeviceModelParamsSchema = z.object({ id: z.coerce.number().int() });

  const ModifyDeviceModelSchema = z.object({
    name: ModelName.optional(),
    typeId: TypeId.optional()
  }).openapi({ description: 'Modify Device Model Schema' });

  doc.registerPath({
    method: 'patch',
    path: '/device-models/{id}',
    description: 'Modify a device model',
    summary: 'Modify Device model',
    security: [{ [apiKeyAuth.name]: [] }],
    request: {
      params: ModifyDeviceModelParamsSchema,
      body: {
        content: { 'application/json': { schema: ModifyDeviceModelSchema } }
      }
    },
    responses: {
      200: {
        description: 'Device model modified',
        content: { 'application/json': { schema: z.object({ id: ModelId }) } }
      },
      400: {
        description: 'Invalid request',
        content: { 'application/json': { schema: HttpErrorBody } }
      }
    },
    tags: ['Device Models']
  });

  app.patch('/device-models/:id', checkApiKey, async (req, res) => {
    const params = ModifyDeviceModelParamsSchema.safeParse(req.params);
    if (!params.success) {
      throw httpError(400, z.prettifyError(params.error));
    }
    const input = ModifyDeviceModelSchema.safeParse(req.body);
    if (!input.success) {
      throw httpError(400, z.prettifyError(input.error));
    }

    const updated = 
      await db
        .update(deviceModelTable)
        .set(input.data)
        .where(eq(deviceModelTable.id, params.data.id))
        .returning({ updatedId: deviceModelTable.id });
    const id = updated[0]?.updatedId;
    if (!id) {
      throw httpError(404, 'Device not found');
    }

    res.json({ id });
  });

  // --------------------------------------------------------------------------------
  // DELETE
  const DeleteDeviceModelParamsSchema = z.object({ id: z.coerce.number().int() });

  doc.registerPath({
    method: 'delete',
    path: '/device-models/{id}',
    description: 'Delete a device model',
    summary: 'Delete Device Model',
    security: [{ [apiKeyAuth.name]: [] }],
    request: {
      params: DeleteDeviceModelParamsSchema,
    },
    responses: {
      200: {
        description: 'Device model deleted',
        content: { 'application/json': { schema: z.object({ id: ModelId }) } }
      },
      400: {
        description: 'Invalid request',
        content: { 'application/json': { schema: HttpErrorBody } }
      }
    },
    tags: ['Device Models']
  });

  app.delete('/device-models/:id', checkApiKey, async (req, res) => {
    const input = DeleteDeviceModelParamsSchema.safeParse(req.params);
    if (!input.success) {
      throw httpError(400, z.prettifyError(input.error));
    }

    const deleted = 
      await db
        .delete(deviceModelTable)
        .where(eq(deviceModelTable.id, input.data.id))
        .returning({ deletedId: deviceModelTable.id });
    const id = deleted[0]?.deletedId;
    if (!id) {
      throw httpError(404, 'Device model not found');
    }

    res.json({ id });
  });

}