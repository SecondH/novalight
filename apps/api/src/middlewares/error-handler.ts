import type { NextFunction, Request, Response } from 'express';
import { errorTracker } from '../monitoring/error-tracker';

/**
 * Centralized error handling per docs/architecture/010-backend-architecture.md §15
 * "Error Handling Strategy" -- five error categories (Validation, Authentication,
 * Authorization, Business, System), all exercised by the M1 accounts/brands/content modules.
 */
export type ErrorCategory =
  'validation' | 'authentication' | 'authorization' | 'business' | 'system';

export class ApiError extends Error {
  constructor(
    public readonly category: ErrorCategory,
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const CATEGORY_TO_CODE: Record<ErrorCategory, string> = {
  validation: 'VALIDATION_ERROR',
  authentication: 'AUTHENTICATION_ERROR',
  authorization: 'AUTHORIZATION_ERROR',
  business: 'BUSINESS_ERROR',
  system: 'SYSTEM_ERROR',
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: { code: CATEGORY_TO_CODE[err.category], message: err.message },
    });
    return;
  }

  // Never expose internal error details to the client -- per CLAUDE.md §7 and
  // docs/architecture/010-backend-architecture.md §15 ("Sensitive internal details
  // must never be exposed"). The real error is still logged server-side via pino-http, and
  // reported via errorTracker (Sentry if SENTRY_DSN is set, console/Pino fallback otherwise --
  // see apps/api/src/monitoring/error-tracker.ts). Only unhandled/System errors are tracked
  // here -- an ApiError (validation, auth, business) is expected application behavior, not an
  // exception, so it isn't sent to error tracking.
  req.log?.error({ err }, 'Unhandled error');
  errorTracker.captureException(err, { requestId: String(req.id ?? '') });
  res.status(500).json({
    success: false,
    error: { code: 'SYSTEM_ERROR', message: 'An unexpected error occurred.' },
  });
}
