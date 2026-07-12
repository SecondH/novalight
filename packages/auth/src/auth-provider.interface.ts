/**
 * Authentication abstraction per ADR-007 (docs/architecture/006-initial-architecture-decisions.md):
 * "Application -> Auth Interface -> Clerk Provider. The application depends on the interface,
 * not the provider." No provider implements this yet -- Phase 0 scope is the interface only
 * (Project Charter §5: "Authentication abstraction", not a working Clerk integration).
 *
 * Do not implement a concrete provider against this interface until Clerk (or another
 * provider) integration is an approved, in-scope piece of work -- see
 * docs/security/013-security-architecture.md §5 "Authentication Requirements" for what a
 * real implementation will need to satisfy (secure login, session management, token
 * validation, MFA readiness, account recovery).
 */
export interface AuthenticatedIdentity {
  userId: string;
  email: string;
}

export interface AuthProvider {
  verifySession(sessionToken: string): Promise<AuthenticatedIdentity | null>;
  invalidateSession(sessionToken: string): Promise<void>;
}
