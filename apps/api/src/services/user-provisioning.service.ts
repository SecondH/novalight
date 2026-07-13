import { UsersRepository, type ClerkIdentityInput } from '../repositories/users.repository';
import { isUniqueConstraintViolation } from '../utils/prisma-errors';
import { auditLogger } from '../audit/pino-audit-logger';
import { env } from '../config/env';

export type ClerkIdentity = ClerkIdentityInput;

/**
 * Maps a verified Clerk identity to the local User.id UUID that req.userId must carry
 * downstream (Account.ownerUserId is a hard FK to User.id, not to Clerk's own id) -- ADR-029
 * (docs/architecture/029-clerk-identity-mapping-and-provisioning.md). Two callers:
 *   - The Clerk webhook handler (apps/api/src/modules/webhooks) for user.created/updated/deleted,
 *     the authoritative, eventually-consistent sync path.
 *   - ClerkAuthProvider.verifySession, as a bounded just-in-time fallback for immediate
 *     consistency when a session arrives before its webhook has been processed.
 * Never called with client-supplied email or account data -- only the identity Clerk's own
 * token/webhook verification already vouched for.
 */
export class UserProvisioningService {
  constructor(
    private readonly usersRepository: UsersRepository = new UsersRepository(),
    private readonly jitProvisioningEnabled: boolean = env.ENABLE_JIT_PROVISIONING === 'true',
  ) {}

  /**
   * Webhook path for user.created/user.updated -- idempotent upsert by clerkUserId, and race-
   * safe against a concurrent duplicate delivery or the JIT fallback creating/linking the same
   * identity (P2002 on create/link is treated as "a concurrent writer already got there," not
   * an error -- same pattern as resolveOrProvisionLocalUserId's race handling).
   * Collision handling (confirmed decision, ADR-029): if a local User with this email already
   * exists but has a different (or no prior) clerkUserId link, link it only if that row is
   * currently unlinked; otherwise leave it alone and audit-log an anomaly rather than silently
   * reassigning an existing identity link.
   */
  async upsertFromWebhook(identity: ClerkIdentity): Promise<void> {
    const byClerkUserId = await this.usersRepository.findByClerkUserId(identity.clerkUserId);
    if (byClerkUserId) {
      // clerkUserId is immutable, but email can change at Clerk's side (user.updated) -- keep
      // the local copy current rather than letting it silently drift stale (flagged by
      // independent security-reviewer pass as a data-integrity gap adjacent to identity data).
      if (byClerkUserId.email !== identity.email) {
        await this.usersRepository.updateEmail(identity.clerkUserId, identity.email);
        await this.recordProvisionEvent('user.provision.email_updated', byClerkUserId.id, identity);
      }
      return;
    }

    const byEmail = await this.usersRepository.findByEmail(identity.email);
    if (!byEmail) {
      try {
        const created = await this.usersRepository.createFromClerkIdentity(identity);
        await this.recordProvisionEvent('user.provision.webhook_create', created.id, identity);
      } catch (error) {
        if (!isUniqueConstraintViolation(error)) {
          throw error;
        }
        // Lost a race against a concurrent webhook redelivery or the JIT fallback creating the
        // same identity -- same pattern as resolveOrProvisionLocalUserId's race handling below.
        // The concurrent writer already reached the correct end state (and recorded its own
        // audit event); nothing left for this call to do.
      }
      return;
    }

    if (!byEmail.clerkUserId) {
      try {
        await this.usersRepository.linkClerkUserId(identity.email, identity.clerkUserId);
        await this.recordProvisionEvent('user.provision.webhook_link', byEmail.id, identity);
      } catch (error) {
        if (!isUniqueConstraintViolation(error)) {
          throw error;
        }
        // Same race as above -- a concurrent writer already linked this identity.
      }
      return;
    }

    // byEmail.clerkUserId is set but doesn't match identity.clerkUserId (checked above) --
    // never silently overwrite an existing identity link.
    await auditLogger.record({
      actor: identity.clerkUserId,
      action: 'user.provision.email_collision',
      resource: `user:${byEmail.id}`,
      timestamp: new Date().toISOString(),
      result: 'failure',
    });
  }

  /** Webhook path for user.deleted -- idempotent, tolerant of "never provisioned". */
  async deactivateByClerkUserId(clerkUserId: string): Promise<void> {
    const existing = await this.usersRepository.findByClerkUserId(clerkUserId);
    if (!existing || existing.deactivatedAt) {
      return;
    }
    await this.usersRepository.deactivateByClerkUserId(clerkUserId);
    await auditLogger.record({
      actor: clerkUserId,
      action: 'user.provision.deactivate',
      resource: `user:${existing.id}`,
      timestamp: new Date().toISOString(),
      result: 'success',
    });
  }

  /** Every successful identity mutation gets an audit record -- Security Architecture §16. */
  private async recordProvisionEvent(
    action: string,
    userId: string,
    identity: ClerkIdentity,
  ): Promise<void> {
    await auditLogger.record({
      actor: identity.clerkUserId,
      action,
      resource: `user:${userId}`,
      timestamp: new Date().toISOString(),
      result: 'success',
    });
  }

  /**
   * JIT fallback -- called only from ClerkAuthProvider.verifySession, after token verification
   * has already succeeded. One lookup on the common (already-provisioned) path; a write only
   * when the mapping is missing, per ADR-029 (no unconditional write on every request). Returns
   * null if the resolved User is deactivated -- verifySession maps that to a failed-closed 401.
   */
  async resolveOrProvisionLocalUserId(identity: ClerkIdentity): Promise<string | null> {
    const existing = await this.usersRepository.findByClerkUserId(identity.clerkUserId);
    if (existing) {
      if (existing.deactivatedAt) {
        // Meaningful, not routine -- a valid Clerk session presented for an identity this
        // system has already deactivated. Deliberately NOT logging the routine invalid/expired
        // token case above (would fire on every ordinary session expiry, which is excessive);
        // this one is a distinct, actionable signal worth an audit trail.
        await auditLogger.record({
          actor: identity.clerkUserId,
          action: 'auth.clerk.deactivated_user_denied',
          resource: `user:${existing.id}`,
          timestamp: new Date().toISOString(),
          result: 'failure',
        });
        return null;
      }
      return existing.id;
    }

    if (!this.jitProvisioningEnabled) {
      // No mapping yet and JIT provisioning is disabled (ENABLE_JIT_PROVISIONING=false) --
      // wait for the webhook to provision this identity rather than creating it here. Fails
      // closed, same as any other unresolvable identity.
      return null;
    }

    try {
      const created = await this.usersRepository.createFromClerkIdentity(identity);
      // Creating a local identity as a side effect of authentication is itself an
      // authentication-relevant event -- Security Architecture §16 audit-record requirement,
      // flagged by independent security-reviewer pass as a Repudiation-category gap when this
      // JIT path (unlike the webhook path) had no audit trail for the rows it creates.
      await this.recordProvisionEvent('user.provision.jit_create', created.id, identity);
      return created.id;
    } catch (error) {
      if (!isUniqueConstraintViolation(error)) {
        throw error;
      }
      // Lost a race against a concurrent request or the webhook creating the same
      // clerkUserId/email -- single re-read, no retry loop.
      const raced = await this.usersRepository.findByClerkUserId(identity.clerkUserId);
      return raced && !raced.deactivatedAt ? raced.id : null;
    }
  }
}
