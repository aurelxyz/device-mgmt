import type { Express } from 'express';
import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';

import { httpError, HttpErrorBody } from '../utils/http-error.ts';
import { CreateDeviceSchema, DeviceSchema, type Device } from '../validation/device.ts';
import { deviceTable } from '../db/db-schema.ts';

export const register = (app: Express, doc: OpenAPIRegistry, db: NodePgDatabase) => {
  // --------------------------------------------------------------------------------
  doc.registerPath({
    method: 'get',
    path: '/devices',
    description: 'Get devices',
    summary: 'Get Devices',
    responses: {
      200: {
        description: 'Devices returned',
        content: { 'application/json': { schema: z.array(DeviceSchema) } }
      }
    },
    tags: ['Devices']
  });

  app.get('/devices', async (req, res) => {
    const devices: Device[] = await db.select().from(deviceTable);      // TODO: Validation
    res.json(devices);
  });

  // --------------------------------------------------------------------------------
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
        content: { 'application/json': { schema: DeviceSchema } }
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
    const devices: Device[] = await db.select().from(deviceTable).where(eq(deviceTable.id, id));      
    if (devices.length === 0) {                                   // TODO: Validation
      throw httpError(404, 'Not found');
    }
    res.json(devices[0]);
  });

  // --------------------------------------------------------------------------------
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
        content: { 'application/json': { schema: DeviceSchema } }
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
      throw httpError(400, input.error.message);      // TODO: check if Zod error message is adequate here
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

    res.json({ ...input.data, id });          // TODO: Do we want to send back all columns of the object or just the id?
  });

}