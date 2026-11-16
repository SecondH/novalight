/**
 * Runs before every test file, before any module (and therefore env.ts's `dotenv/config`) loads.
 * dotenv never overwrites a key that is already set, so pinning these here guarantees no test
 * ever inherits a developer's local apps/api/.env Groq activation (AI_ENABLED=true,
 * AI_PROVIDER=groq, a real GROQ_API_KEY) and makes paid network calls. Tests that need a
 * specific AI configuration (e.g. ai-text-generation.test.ts) set process.env themselves.
 */
process.env.AI_ENABLED = 'false';
process.env.AI_PROVIDER = 'mock';
