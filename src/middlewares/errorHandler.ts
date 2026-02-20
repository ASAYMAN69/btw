import { Request, Response, NextFunction } from 'express';
import { ErrorResponse, BrowserToolError } from '../types';

/**
 * Global error handler middleware
 * Catches all errors and returns consistent JSON responses
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', error.message, error.stack);

  // Handle BrowserToolError
  if (error instanceof BrowserToolError) {
    const response: ErrorResponse = {
      success: false,
      error: error.message,
      message: error.message,
      details: error.details,
    };
    res.status(error.statusCode).json(response);
    return;
  }

  // Handle other errors
  const response: ErrorResponse = {
    success: false,
    error: 'Internal server error',
    message: error.message,
    details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  };
  res.status(500).json(response);
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  const response: ErrorResponse = {
    success: false,
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.path}`,
  };
  res.status(404).json(response);
}

export default {
  errorHandler,
  notFoundHandler,
};
