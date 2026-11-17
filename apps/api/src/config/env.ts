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
  // Optional -- unset means the Clerk webhook route (apps/api/src/modules/webhooks) rejects
  // every request (no signing secret to verify against). Required only once the webhook is
  // configured in the Clerk dashboard for the NovaLight application. See ADR-029
  // (docs/architecture/029-clerk-identity-mapping-and-provisioning.md).
  CLERK_WEBHOOK_SIGNING_SECRET: z.string().optional(),
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
  // Defaults to enabled -- preserves ADR-029's original JIT-fallback behavior (immediate
  // consistency when a session arrives before its webhook has been processed). Set to "false"
  // to require the webhook to provision a User row before that identity can authenticate --
  // an operational toggle for environments wanting stricter control over identity-creation
  // timing, not a behavior change to the default path.
  ENABLE_JIT_PROVISIONING: z.enum(['true', 'false']).default('true'),
  // AI text-generation foundation (Groq). Master kill-switch -- default false means the
  // /api/v1/ai/text/generate endpoint always responds with a clear "disabled" error, regardless
  // of AI_PROVIDER, until an operator deliberately opts in. Real Groq calls additionally require
  // AI_PROVIDER=groq; AI_ENABLED=true with the default AI_PROVIDER=mock only exercises the mock
  // provider (e.g. for tests/CI), never a real vendor call.
  // The same pair also drives the Brand/Content agent pipeline (ai/agent-pipeline.ts):
  // AI_ENABLED=true + AI_PROVIDER=groq -> real Groq output; anything else -> FakeModelProvider's
  // canned output. See docs/architecture/035-agent-pipeline-real-provider-wiring.md.
  AI_ENABLED: z.enum(['true', 'false']).default('false'),
  // Explicit selection only -- no hidden fallback. Unknown values are rejected here at startup
  // (fail fast), not discovered later inside the provider factory.
  AI_PROVIDER: z.enum(['mock', 'groq']).default('mock'),
  // Optional -- required only when AI_PROVIDER=groq. Never logged, never included in any error
  // message. Get a real value from the Groq console -- never commit a real key.
  GROQ_API_KEY: z.string().optional(),
  // Optional -- required only when AI_PROVIDER=groq. No default model id is hardcoded in source
  // (per the operator's own Groq console model selection) -- see docs/architecture/
  // 028-groq-ai-provider-foundation.md "Model Handling".
  GROQ_MODEL: z.string().optional(),
  AI_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
  AI_MAX_OUTPUT_TOKENS: z.coerce.number().int().positive().default(1200),
  AI_MAX_PROMPT_CHARS: z.coerce.number().int().positive().default(12_000),
  AI_RETRY_COUNT: z.coerce.number().int().min(0).default(1),
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
