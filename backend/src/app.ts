import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';

import { type HttpError } from './utils/http-error.ts'
import * as deviceRoutes from './routes/device-routes.ts';
import * as dbClient from './db/db-client.ts';

const app = express();
app.use(cors());            // Enable CORS for all routes
app.use(express.json());

const db = await dbClient.connect();

const doc = new OpenAPIRegistry();

deviceRoutes.register(app, doc, db);

// Generate api docs and serve with swaggerUi
const docGenerator = new OpenApiGeneratorV3(doc.definitions);
const openApiSpec = docGenerator.generateDocument({
  openapi: '3.0.0',
  info: {
    title: 'Device Management API',
    version: '1.0.0',
  }
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

// The following middleware is used as a last resort if none of the routes are matching the request
app.use((req, res, next) => {
  res.status(404).end("404 not found");
});

// Express error handler (to catch errors from routes and return http response with relevant status code)
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  res
    .status(err.statusCode || 500)
    .json({ 
      status: err.statusCode || 500, 
      message: err.message 
    });
});

export default app;