import { Router } from 'express';
import { handleClerkWebhook } from './clerk.controller';
import { clerkWebhookRateLimit } from '../../middlewares/rate-limit';

export const webhooksRouter = Router();

// Unauthenticated-but-signed (no requireAuthentication) -- the Svix signature check inside
// handleClerkWebhook is the real security boundary, per ADR-029. No validateBody: the body
// arrives as a raw Buffer (see apps/api/src/app.ts's express.raw() route), not parsed JSON.
webhooksRouter.post('/webhooks/clerk', clerkWebhookRateLimit, handleClerkWebhook);
