import { type Request, type Response, type NextFunction } from 'express';
import { httpError } from './http-error.ts';

const API_KEY = '1234'; // TODO

// Middleware to check the API key
export const checkApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];

  // Check if the API key is provided and matches the expected value
  if (!apiKey || apiKey !== API_KEY) {
    const err = httpError(401, "Unauthorized");
    return next(err);
  }

  // If the API key is valid, proceed to the next middleware or route handler
  next();
};