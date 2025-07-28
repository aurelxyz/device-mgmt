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
