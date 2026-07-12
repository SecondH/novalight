import rateLimit from 'express-rate-limit';
import type { Request } from 'express';
import { ApiError } from './error-handler';

/**
 * Per-account rate limiting for AI-invoking endpoints -- added per
 * docs/architecture/social-ai-platform/028-m1-technical-design.md §3.8, closing a High-severity
 * gap an independent security review found (Threat Model §4.5 rates DoS "High" and names
 * "expensive AI requests" specifically). Account-scoped, not IP-scoped alone, since every
 * agent-invoking endpoint requires authentication (§3.8's reasoning: an authenticated attacker
 * cycling accounts is the more realistic threat than an anonymous flood).
 *
 * The numeric limit is a placeholder, not a researched threshold -- no NovaLight document
 * defines one (.claude/memory/known-risks.md "No numeric quality thresholds defined"); revisit
 * once real usage data exists, per 028 §3.8.
 */
export const agentInvocationRateLimit = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => req.userId ?? req.ip ?? 'unknown',
  handler: (_req, _res, next) => {
    next(new ApiError('business', 429, 'Rate limit exceeded -- please try again shortly'));
  },
});
