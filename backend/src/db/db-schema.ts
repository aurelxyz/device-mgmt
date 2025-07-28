import { pgTable, varchar, integer } from "drizzle-orm/pg-core";

export const deviceTable = pgTable("device", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  modelId: integer('model_id').notNull(),
  mac: varchar({ length: 17 }).notNull().unique(),
  status: varchar({ length: 20 })
});