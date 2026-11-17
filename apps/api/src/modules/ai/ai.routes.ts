import { Router } from 'express';
import { generateText } from './ai.controller';
import { requireAuthentication } from '../../middlewares/authentication';
import { validateBody } from '../../middlewares/validate-body';
import { agentInvocationRateLimit } from '../../middlewares/rate-limit';
import { generateTextSchema } from './ai.validators';

export const aiRouter = Router();

aiRouter.post(
  '/ai/text/generate',
  requireAuthentication,
  agentInvocationRateLimit,
  validateBody(generateTextSchema),
  generateText,
);
