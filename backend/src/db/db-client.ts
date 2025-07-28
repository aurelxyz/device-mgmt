import { drizzle } from 'drizzle-orm/node-postgres';
  
export const connect = async () => {
  if (!process.env.DB_URL) throw new Error("Missing environment variable: DB_URL");

  const db = drizzle(process.env.DB_URL!);

  // const device1: typeof deviceTable.$inferInsert = {
  //   modelId: 123,
  //   mac: '12:34:56:12:34:59',
  //   status: 'stock'
  // };

  // const inserted = await db.insert(deviceTable).values(device1).returning({ insertedId: deviceTable.id });
  // console.log('New device created!')

  // const insertedId = inserted[0]?.insertedId;

  // if (!insertedId) throw new Error("Inserted Id is missing");

  // const devices = await db.select().from(deviceTable);
  // console.log('Getting all devices from the database: ', devices)

  // await db
  //   .update(deviceTable)
  //   .set({
  //     status: "installed",
  //   })
  //   .where(eq(deviceTable.id, insertedId));
  // console.log('Device info updated!')

  // await db.delete(deviceTable).where(eq(deviceTable.id, insertedId));
  // console.log('Device deleted!')

  return db;
}
