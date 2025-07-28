import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from 'drizzle-orm/node-postgres/migrator';

import app from './app.ts';

// // Running db migrations at runtime for simplicity         // TODO
// console.log('Running any new database migrations...');
// const db = drizzle(process.env.DB_URL);
// await migrate(db, { migrationsFolder: './drizzle' });
// console.log('Done with database migrations');


const port = 3001;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
});