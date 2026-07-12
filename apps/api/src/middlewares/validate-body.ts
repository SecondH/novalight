import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';
import { ApiError } from './error-handler';

/**
 * All external input must be validated before it reaches the Service layer, per
 * docs/architecture/010-backend-architecture.md §11. Invalid input fails safely as a
 * Validation Error -- never a generic 500, never silently coerced.
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(new ApiError('validation', 400, result.error.issues.map((i) => i.message).join('; ')));
      return;
    }
    req.body = result.data;
    next();
  };
}
