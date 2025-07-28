import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

const DeviceId = z.int().openapi({ description: 'Unique identifier for the device' });         // TODO: review
const ModelId = z.int().openapi({ description: 'Unique identifier for the device model' });    // TODO: review
const MacAddress = z.string().min(1).openapi({ description: 'MAC address of the device' });    // TODO: review
const DeviceStatus = z.string().nullable().openapi({ description: 'Status of the device' });   // TODO: review

export const DeviceSchema = z.object({
  id: DeviceId,
  modelId: ModelId,
  mac: MacAddress,
  status: DeviceStatus
}).openapi({ description: 'Device Schema' });

export type Device = z.infer<typeof DeviceSchema>;


export const CreateDeviceSchema = z.object({
  modelId: ModelId,
  mac: MacAddress,
  // status: DeviceStatus       // TODO
}).openapi({ description: 'Create User Schema' });

export type CreateDevice = z.infer<typeof CreateDeviceSchema>;
