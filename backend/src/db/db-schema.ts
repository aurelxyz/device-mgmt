import { pgTable, varchar, integer, pgEnum } from "drizzle-orm/pg-core";

export const deviceTypeTable = pgTable("device_type", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 100 }).notNull(),
});

export const deviceModelTable = pgTable("device_model", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 100 }).notNull(),
  typeId: integer('type_id').notNull().references(() => deviceTypeTable.id),
});


export const deviceStatusEnum = pgEnum('device_status_enum', ['installé', 'maintenance', 'stock']);

export const deviceTable = pgTable("device", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  modelId: integer('model_id').notNull().references(() => deviceModelTable.id),
  mac: varchar({ length: 17 }).notNull().unique(),
  status: deviceStatusEnum().default("stock"),
});