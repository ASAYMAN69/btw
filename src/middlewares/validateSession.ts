import { Request, Response, NextFunction } from 'express';
import { InvalidSessionError } from '../types';

/**
 * Validate that sessionId parameter exists and is valid
 * Add sessionId to req object
 */
export function validateSessionId(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { sessionId } = req.params;

  if (!sessionId) {
    res.status(400).json({
      success: false,
      error: 'Session ID is required',
    });
    return;
  }

  // Add sessionId to request for use in controllers
  (req as any).sessionId = sessionId;

  next();
}

/**
 * Validate JSON body and required fields
 */
export function validateBody(...requiredFields: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const body = req.body;

    if (!body || typeof body !== 'object') {
      res.status(400).json({
        success: false,
        error: 'Request body is required and must be valid JSON',
      });
      return;
    }

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        res.status(400).json({
          success: false,
          error: `Missing required field: ${field}`,
        });
        return;
      }
    }

    next();
  };
}

export default {
  validateSessionId,
  validateBody,
};
