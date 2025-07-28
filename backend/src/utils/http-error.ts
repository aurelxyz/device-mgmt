import { z } from 'zod';

// Type of errors that indicates the status code to be sent in the http response
export interface HttpError extends Error {
  statusCode?: number
}

// Utility function to throw an HttpError from within a route handler
export const httpError = (statusCode: number, message: string) => {
  const err: HttpError = new Error(message);
  err.statusCode = statusCode;
  return err;
}

// Validation schema for the json body of failed http responses
export const HttpErrorBody = z.object({
  status: z.int(),
  message: z.string()
});