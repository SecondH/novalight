import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Express 4 does not forward rejected promises to error middleware automatically -- this
 * wrapper ensures a thrown ApiError (e.g. from a Service or Repository P2025 mapping) reaches
 * the centralized errorHandler instead of crashing the process or hanging the request.
 */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}
