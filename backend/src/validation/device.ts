import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const DeviceId = z.int().min(1).openapi({ description: 'Unique identifier for the device' });
export const MacAddress = z.string().min(1).openapi({ description: 'MAC address of the device' });                                                    // TODO: review
export const DeviceStatus = z.enum(["installé", "maintenance", "stock"]).nullable().openapi({ description: 'Status of the device' });          // TODO: review
export const ModelId = z.int().min(1).openapi({ description: 'Unique identifier for the device model' });
export const ModelName = z.string().min(1).openapi({ description: 'Name of the device model' });                                                    // TODO: review
export const TypeId = z.int().min(1).openapi({ description: 'Unique identifier for the device type' });
export const TypeName = z.string().min(1).openapi({ description: 'Name of the device type' });                                                    // TODO: review


// export const DeviceSchema = z.object({
//   id: DeviceId,
//   modelId: ModelId,
//   mac: MacAddress,
//   status: DeviceStatus
// }).openapi({ description: 'Device Schema' });

// export type Device = z.infer<typeof DeviceSchema>;


export const CreateDeviceSchema = z.object({
  modelId: ModelId,
  mac: MacAddress,
  status: DeviceStatus
}).openapi({ description: 'Create Device Schema' });

export type CreateDevice = z.infer<typeof CreateDeviceSchema>;


export const ModifyDeviceSchema = z.object({
  mac: MacAddress.optional(),
  status: DeviceStatus.optional()
}).openapi({ description: 'Modify Device Schema' });

export type ModifyDevice = z.infer<typeof ModifyDeviceSchema>;