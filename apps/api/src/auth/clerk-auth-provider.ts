import { createClerkClient, verifyToken } from '@clerk/backend';
import type { AuthenticatedIdentity, AuthProvider } from '@novalight/auth';
import { UserProvisioningService } from '../services/user-provisioning.service';

/**
 * Production/development AuthProvider implementation using Clerk's backend SDK, per
 * docs/security/022-authentication-production-strategy.md. Goes through the same AuthProvider
 * interface as apps/api/src/auth/in-memory-auth-provider.ts -- swapping between them is a
 * one-line change in apps/api/src/middlewares/authentication.ts's import, per that document's
 * §2.1 correction. API surface (verifyToken, clerkClient.users.getUser,
 * clerkClient.sessions.revokeSession) verified directly against @clerk/backend's shipped type
 * definitions during implementation, not assumed from memory.
 *
 * Requires CLERK_SECRET_KEY (apps/api/src/config/env.ts). Not wired into
 * middlewares/authentication.ts by default yet -- no live Clerk account/keys exist in this
 * environment to validate against end-to-end (see docs/operations/025-m1.6-operational-
 * activation-report.md). This class is implemented and unit-tested (mocked SDK) so the
 * activation step, once real Clerk keys exist, is "flip the import," not "write the code."
 *
 * verifySession's userId is the local NovaLight User.id UUID, not Clerk's own sub claim --
 * Account.ownerUserId is a hard FK to User.id, so returning Clerk's raw id here would break
 * every ownership lookup. UserProvisioningService resolves (or, as a bounded JIT fallback,
 * provisions) that local id from the verified Clerk identity -- ADR-029
 * (docs/architecture/029-clerk-identity-mapping-and-provisioning.md).
 */
export class ClerkAuthProvider implements AuthProvider {
  private readonly clerkClient: ReturnType<typeof createClerkClient>;

  constructor(
    private readonly secretKey: string,
    private readonly userProvisioningService: UserProvisioningService = new UserProvisioningService(),
  ) {
    this.clerkClient = createClerkClient({ secretKey });
  }

  async verifySession(sessionToken: string): Promise<AuthenticatedIdentity | null> {
    let payload;
    try {
      payload = await verifyToken(sessionToken, { secretKey: this.secretKey });
    } catch {
      // Invalid, expired, or malformed token -- per AuthProvider's contract, return null
      // rather than throw; requireAuthentication (apps/api/src/middlewares/authentication.ts)
      // maps a null identity to a 401, never leaking why verification failed.
      return null;
    }

    try {
      const user = await this.clerkClient.users.getUser(payload.sub);
      const primaryEmail = user.emailAddresses.find(
        (e) => e.id === user.primaryEmailAddressId,
      )?.emailAddress;
      if (!primaryEmail) {
        return null;
      }

      const localUserId = await this.userProvisioningService.resolveOrProvisionLocalUserId({
        clerkUserId: payload.sub,
        email: primaryEmail,
      });
      if (!localUserId) {
        // Either provisioning failed to resolve a mapping, or the mapped User is deactivated --
        // both fail closed, same as an invalid token.
        return null;
      }

      return { userId: localUserId, email: primaryEmail };
    } catch {
      // A transient failure fetching the user from Clerk's API or provisioning/looking up the
      // local User row (e.g. a network blip, a momentary database error) must not crash the
      // process on an otherwise-valid token -- same fail-closed contract as the block above,
      // and exactly the behavior ADR-029 already documents: "A JIT provisioning failure during
      // a live request causes that request to fail authentication (401) rather than ever
      // silently proceeding without a local User row."
      return null;
    }
  }

  async invalidateSession(sessionToken: string): Promise<void> {
    let payload;
    try {
      payload = await verifyToken(sessionToken, { secretKey: this.secretKey });
    } catch {
      return; // Already invalid/expired -- nothing to revoke.
    }
    // The JWT's `sid` claim is the Clerk session id revokeSession expects, not the token itself.
    await this.clerkClient.sessions.revokeSession(payload.sid);
  }
}
