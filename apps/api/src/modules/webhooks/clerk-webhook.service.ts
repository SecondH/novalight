import { Webhook } from 'svix';
import { env } from '../../config/env';
import { ApiError } from '../../middlewares/error-handler';
import { UserProvisioningService } from '../../services/user-provisioning.service';
import { auditLogger } from '../../audit/pino-audit-logger';
import { clerkWebhookEventSchema, type ClerkWebhookEvent } from './clerk-webhook.validators';

export interface SvixHeaders {
  'svix-id'?: string;
  'svix-timestamp'?: string;
  'svix-signature'?: string;
}

type ClerkWebhookEventData = ClerkWebhookEvent['data'];
type EventHandler = (data: ClerkWebhookEventData, eventType: string) => Promise<void>;

/**
 * Verifies and dispatches Clerk `user.*` webhook events -- ADR-029
 * (docs/architecture/029-clerk-identity-mapping-and-provisioning.md). Signature verification
 * uses svix's own Webhook class directly against the raw request body (apps/api/src/app.ts's
 * express.raw() route), Clerk's documented pattern for non-Next.js/Express integrations.
 * `verify()` also rejects stale-timestamped payloads internally (svix's own replay-window
 * check) -- not re-implemented here.
 *
 * Dispatch is a handler map (event type -> handler), not a growing switch/if-chain -- adding a
 * future event type (e.g. an organization or SCIM event, per ADR-029's future-readiness notes)
 * is a one-line addition to `this.handlers`, never a change to `verifyAndDispatch` itself.
 * Unrecognized event types remain a forward-compatible no-op, unchanged from before this
 * refactor -- Clerk may add new event types this service doesn't yet need to react to.
 */
export class ClerkWebhookService {
  // Map, not a plain object -- event.type is an externally-supplied string (Svix-verified, but
  // still not a fixed literal), and a plain-object lookup would silently resolve to an inherited
  // Object.prototype member (e.g. `constructor`, `toString`) if it ever matched one of those
  // names, instead of correctly falling through to the "unknown type" no-op.
  private readonly handlers = new Map<string, EventHandler>([
    ['user.created', (data, eventType) => this.handleUserUpsert(data, eventType)],
    ['user.updated', (data, eventType) => this.handleUserUpsert(data, eventType)],
    ['user.deleted', (data, eventType) => this.handleUserDeleted(data, eventType)],
  ]);

  constructor(
    private readonly userProvisioningService: UserProvisioningService = new UserProvisioningService(),
  ) {}

  async verifyAndDispatch(rawBody: Buffer, headers: SvixHeaders): Promise<void> {
    const correlationId = headers['svix-id'] ?? 'unknown';
    await auditLogger.record({
      actor: correlationId,
      action: 'webhook.clerk.received',
      resource: 'clerk_webhook',
      timestamp: new Date().toISOString(),
      result: 'success',
    });

    if (!env.CLERK_WEBHOOK_SIGNING_SECRET) {
      await this.recordRejected(correlationId);
      throw new ApiError('authentication', 400, 'Webhook signature verification failed');
    }

    let event: ClerkWebhookEvent;
    try {
      const webhook = new Webhook(env.CLERK_WEBHOOK_SIGNING_SECRET);
      const verified = webhook.verify(rawBody.toString('utf8'), {
        'svix-id': headers['svix-id'] ?? '',
        'svix-timestamp': headers['svix-timestamp'] ?? '',
        'svix-signature': headers['svix-signature'] ?? '',
      });
      event = clerkWebhookEventSchema.parse(verified);
    } catch {
      // Invalid signature, missing headers, stale timestamp (svix's own replay-window check),
      // or a payload shape we don't recognize -- never leak which, same posture as
      // ClerkAuthProvider.verifySession's catch-and-return-null.
      await this.recordRejected(correlationId);
      throw new ApiError('authentication', 400, 'Webhook signature verification failed');
    }

    await auditLogger.record({
      actor: event.data.id,
      action: 'webhook.clerk.verified',
      resource: `clerk_user:${event.data.id}`,
      timestamp: new Date().toISOString(),
      result: 'success',
    });

    await this.dispatch(event);
  }

  private async recordRejected(correlationId: string): Promise<void> {
    await auditLogger.record({
      actor: correlationId,
      action: 'webhook.clerk.rejected',
      resource: 'clerk_webhook',
      timestamp: new Date().toISOString(),
      result: 'failure',
    });
  }

  private async dispatch(event: ClerkWebhookEvent): Promise<void> {
    const handler = this.handlers.get(event.type);
    if (!handler) {
      return; // Forward-compatible no-op for event types this handler doesn't react to.
    }
    await handler(event.data, event.type);
  }

  private async handleUserUpsert(data: ClerkWebhookEventData, eventType: string): Promise<void> {
    const primaryEmail = data.email_addresses?.find(
      (e) => e.id === data.primary_email_address_id,
    )?.email_address;
    if (!primaryEmail) {
      await auditLogger.record({
        actor: data.id,
        action: `webhook.clerk.${eventType}`,
        resource: `clerk_user:${data.id}`,
        timestamp: new Date().toISOString(),
        result: 'failure',
      });
      return;
    }
    await this.userProvisioningService.upsertFromWebhook({
      clerkUserId: data.id,
      email: primaryEmail,
    });
    await auditLogger.record({
      actor: data.id,
      action: `webhook.clerk.${eventType}`,
      resource: `clerk_user:${data.id}`,
      timestamp: new Date().toISOString(),
      result: 'success',
    });
  }

  private async handleUserDeleted(data: ClerkWebhookEventData, eventType: string): Promise<void> {
    await this.userProvisioningService.deactivateByClerkUserId(data.id);
    await auditLogger.record({
      actor: data.id,
      action: `webhook.clerk.${eventType}`,
      resource: `clerk_user:${data.id}`,
      timestamp: new Date().toISOString(),
      result: 'success',
    });
  }
}
