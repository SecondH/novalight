import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler';
import { ClerkWebhookService } from './clerk-webhook.service';

const clerkWebhookService = new ClerkWebhookService();

/**
 * Unauthenticated-but-signed -- no requireAuthentication, no req.userId. req.body is a raw
 * Buffer (apps/api/src/app.ts mounts express.raw() ahead of the global express.json() for this
 * exact path, per ADR-029), never a parsed JS object.
 */
export const handleClerkWebhook = asyncHandler(async (req: Request, res: Response) => {
  await clerkWebhookService.verifyAndDispatch(req.body as Buffer, {
    'svix-id': req.header('svix-id'),
    'svix-timestamp': req.header('svix-timestamp'),
    'svix-signature': req.header('svix-signature'),
  });
  res.status(200).json({ success: true, data: { received: true } });
});
