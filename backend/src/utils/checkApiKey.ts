import { type Request, type Response, type NextFunction } from 'express';
import { httpError } from './http-error.ts';
import { trim } from 'zod';

const envKeys = process.env.API_KEYS;
if (!envKeys) {
  throw new Error('❌ Environment variable API_KEYS is not defined.')
}

const acceptedKeys = envKeys.split(',').map(key => key.trim());

// Middleware to check the API key
export const checkApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.header('x-api-key');

  // Check if the API key is provided and matches the expected value
  if (!apiKey || !acceptedKeys.includes(apiKey)) {
    const err = httpError(401, "Unauthorized");
    return next(err);
  }

  // If the API key is valid, proceed to the next middleware or route handler
  next();
};