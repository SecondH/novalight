import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { ClerkAuthProvider } from '../auth/clerk-auth-provider';
import { ApiError } from './error-handler';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
  }
}

// Fail closed at startup, not on the first request, if Clerk isn't configured -- same posture
// as env.ts's own loadEnv() and the Groq provider factory. InMemoryAuthProvider stays available
// for tests (imported directly there, never through this file) but is no longer reachable from
// any live request path.
if (!env.CLERK_SECRET_KEY) {
  throw new Error('CLERK_SECRET_KEY is required to activate ClerkAuthProvider.');
}
const authProvider = new ClerkAuthProvider(env.CLERK_SECRET_KEY);

/**
 * Validates identity and attaches user context to the request, before any controller runs --
 * per docs/architecture/010-backend-architecture.md §12 and
 * docs/architecture/social-ai-platform/028-m1-technical-design.md §2.1. Goes through the
 * AuthProvider interface (ADR-007). ClerkAuthProvider activated per ADR-029/ADR-030 --
 * InMemoryAuthProvider remains available for tests only (apps/api/src/auth/in-memory-auth-
 * provider.ts), never imported here.
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
