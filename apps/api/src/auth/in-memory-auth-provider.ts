import { randomUUID } from 'node:crypto';
import type { AuthenticatedIdentity, AuthProvider } from '@novalight/auth';

/**
 * Dev/test-only AuthProvider implementation. ADR-007 (docs/architecture/006-initial-architecture-decisions.md)
 * names Clerk as the future concrete provider -- implementing that integration is explicitly
 * not part of M1 (docs/architecture/social-ai-platform/028-m1-technical-design.md §2.1 only
 * requires "the sole authentication boundary" to exist, not a real vendor).
 *
 * This stands in for Clerk the same way FakeModelProvider stands in for a real AI vendor:
 * goes through the real AuthProvider interface (ADR-007-compliant, no bypass), backed by an
 * in-memory session-token map instead of a real identity provider. `createSession` is a
 * test/dev-only surface -- a real deployment replaces this whole file with a Clerk-backed
 * implementation, not extends it.
 */
export class InMemoryAuthProvider implements AuthProvider {
  private readonly sessions = new Map<string, AuthenticatedIdentity>();

  createSession(identity: AuthenticatedIdentity): string {
    const token = randomUUID();
    this.sessions.set(token, identity);
    return token;
  }

  async verifySession(sessionToken: string): Promise<AuthenticatedIdentity | null> {
    return this.sessions.get(sessionToken) ?? null;
  }

  async invalidateSession(sessionToken: string): Promise<void> {
    this.sessions.delete(sessionToken);
  }
}

/**
 * Process-wide singleton so a session created via one request (e.g. a test's login helper)
 * is verifiable by a later request in the same process -- mirrors how a real session store
 * would be shared across requests, without introducing a real database table for it in M1.
 */
export const authProvider = new InMemoryAuthProvider();
