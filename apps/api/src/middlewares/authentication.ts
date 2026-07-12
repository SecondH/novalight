import type { NextFunction, Request, Response } from 'express';
import { authProvider } from '../auth/in-memory-auth-provider';
import { ApiError } from './error-handler';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
  }
}

/**
 * Validates identity and attaches user context to the request, before any controller runs --
 * per docs/architecture/010-backend-architecture.md §12 and
 * docs/architecture/social-ai-platform/028-m1-technical-design.md §2.1. Goes through the
 * AuthProvider interface (ADR-007) -- swapping the dev/test InMemoryAuthProvider for a real
 * Clerk-backed implementation later requires no change here.
 */
export async function requireAuthentication(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.header('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;

  if (!token) {
    next(new ApiError('authentication', 401, 'Missing bearer token'));
    return;
  }

  const identity = await authProvider.verifySession(token);
  if (!identity) {
    next(new ApiError('authentication', 401, 'Invalid or expired session'));
    return;
  }

  req.userId = identity.userId;
  next();
}
