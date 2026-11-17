import { z } from 'zod';

/**
 * Shape of the parsed Clerk `user.*` webhook event actually consumed by clerk-webhook.service.ts,
 * applied AFTER Svix signature verification (not as an Express validateBody middleware -- the
 * route's body is a raw Buffer until verification succeeds, per ADR-029). Only the fields this
 * handler reads are validated; Clerk's full event payload has many more fields we don't use.
 *
 * email_addresses/primary_email_address_id are optional -- a real Clerk `user.deleted` payload
 * only carries `{id, object, deleted: true}`, no email data at all (deactivateByClerkUserId
 * only needs `id`, never email).
 */
export const clerkUserEventDataSchema = z.object({
  id: z.string(),
  primary_email_address_id: z.string().nullable().optional(),
  email_addresses: z
    .array(
      z.object({
        id: z.string(),
        email_address: z.string().email(),
      }),
    )
    .optional(),
});

export const clerkWebhookEventSchema = z.object({
  type: z.string(),
  data: clerkUserEventDataSchema,
});

export type ClerkWebhookEvent = z.infer<typeof clerkWebhookEventSchema>;
