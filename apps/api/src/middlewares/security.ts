import cors from 'cors';
import helmet from 'helmet';
import type { Application } from 'express';
import { env } from '../config/env';

/**
 * Secure headers + CORS, per docs/security/013-security-architecture.md "API Security
 * Requirements" (Secure Headers, CORS Control: "Never use unrestricted production CORS").
 *
 * CORS origin resolution, updated during M1.7 (docs/operations/027-m1.7-delivery-foundation-
 * report.md) after independent review flagged the previous binary NODE_ENV check as not
 * distinguishing staging from development (both are "non-production", so staging would
 * silently inherit fully permissive CORS unless an explicit allow-list exists):
 *
 * - CORS_ALLOWED_ORIGINS set -> explicit per-environment allow-list (staging/production).
 * - CORS_ALLOWED_ORIGINS unset + NODE_ENV=production -> blocked (fail-safe default, unchanged).
 * - CORS_ALLOWED_ORIGINS unset + NODE_ENV!=production -> permissive (local dev default, unchanged).
 */
function resolveCorsOrigin(): boolean | string[] {
  if (env.CORS_ALLOWED_ORIGINS) {
    return env.CORS_ALLOWED_ORIGINS.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
  }
  return env.NODE_ENV === 'production' ? false : true;
}

export function applySecurityMiddleware(app: Application): void {
  app.use(helmet());
  app.use(cors({ origin: resolveCorsOrigin() }));
}
