/**
 * Runs before every test file, before any module (and therefore env.ts's `dotenv/config`) loads.
 * dotenv never overwrites a key that is already set, so pinning values here makes every test run
 * see the same configuration as CI, never a developer's local apps/api/.env:
 *
 * - AI: no Groq activation (AI_ENABLED=true, AI_PROVIDER=groq, a real GROQ_API_KEY) can leak in
 *   and make paid network calls. Tests that need a specific AI configuration (e.g.
 *   ai-text-generation.test.ts) set process.env themselves.
 * - Clerk: middlewares/authentication.ts requires CLERK_SECRET_KEY at import (fail closed at
 *   startup). A non-secret placeholder lets the app load in tests; no test may use a real key.
 *   Tests that exercise ClerkAuthProvider mock @clerk/backend; the rest only send missing or
 *   malformed tokens, which are rejected before any Clerk network call.
 */
process.env.AI_ENABLED = 'false';
process.env.AI_PROVIDER = 'mock';
process.env.CLERK_SECRET_KEY = 'jest-placeholder-not-a-real-clerk-key';
