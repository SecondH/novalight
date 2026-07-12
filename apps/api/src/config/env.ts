import 'dotenv/config';
import { z } from 'zod';

/**
 * Required environment variables are validated at startup, not discovered at first use --
 * per docs/architecture/010-backend-architecture.md "Configuration Management":
 * "validate required variables at startup." DATABASE_URL is optional here because Phase 0's
 * health endpoint does not touch the database yet; packages/database validates its own
 * connection string independently when a consumer actually needs a DB connection.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  DATABASE_URL: z.string().url().optional(),
  // Optional -- unset means apps/api/src/auth/in-memory-auth-provider.ts stays active (M1's
  // dev/test posture, unchanged default). Per docs/security/022-authentication-production-
  // strategy.md: no live Clerk account exists in this environment, so this is validated-if-
  // present but not required yet, and nothing currently reads it to select a provider (that
  // wiring is a follow-up, not part of this activation pass -- see
  // docs/operations/025-m1.6-operational-activation-report.md).
  CLERK_SECRET_KEY: z.string().optional(),
  // Optional -- unset means the ConsoleErrorTracker fallback stays active (see
  // apps/api/src/monitoring/error-tracker.ts). No live Sentry project exists in this
  // environment; see docs/operations/025-m1.6-operational-activation-report.md.
  SENTRY_DSN: z.string().url().optional(),
  // Comma-separated allow-list of origins, e.g. "https://app.novalight.com,https://staging.novalight.com".
  // Optional -- unset falls back to the pre-existing NODE_ENV-based default (permissive in
  // non-production, blocked in production) in apps/api/src/middlewares/security.ts. Added
  // during M1.7 (docs/operations/027-m1.7-delivery-foundation-report.md) because that binary
  // default doesn't distinguish staging from development -- both are "non-production" -- so
  // staging would otherwise inherit fully permissive CORS unless this is explicitly set.
  CORS_ALLOWED_ORIGINS: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    // Fail fast and loud -- never start the server with an invalid configuration.
    // eslint-disable-next-line no-console
    console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  return parsed.data;
}

export const env = loadEnv();
