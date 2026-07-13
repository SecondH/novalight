# ADR-021 — Groq AI Text-Generation Provider Foundation

> Not a converted source document. Authored during the NovaLight Groq AI provider implementation session, following the ADR pattern in [006-initial-architecture-decisions.md](./006-initial-architecture-decisions.md). Numbered `028` in the flat top-level sequence -- the highest number in use on this branch's base (`f251329`) was `027` ([027-m1.7-delivery-foundation-report.md](../operations/027-m1.7-delivery-foundation-report.md)); `docs/readiness/028-m2-development-entry-gate.md` uses `028` independently, in a directory excluded from this flat sequence per [docs/README.md](../README.md). ADR-numbered `021` in [ADR-009](./006-initial-architecture-decisions.md)'s sequence since it's the next accepted architecture decision after ADR-020 (Clerk), which lives on a separate branch not yet merged here.

## Document Metadata

| Field            | Value                                                                                                                                                                                                                  |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document Version | 1.0                                                                                                                                                                                                                    |
| Status           | Proposed — pending human approval                                                                                                                                                                                      |
| Document Purpose | Record the first concrete AI vendor integration under ADR-009's Provider Strategy pattern: a minimal, provider-neutral text-generation vertical slice backed by Groq, with a deterministic Mock provider for tests/CI. |

## Context

[ADR-009](./006-initial-architecture-decisions.md) established the AI Interface → Provider Strategy → AI Vendor architecture and named OpenAI, Claude, Gemini, and Flux as future providers — Groq was not named, but the pattern is explicitly designed to admit a provider not yet enumerated without redesign. `packages/ai-core` already contains a live, consumed abstraction (`ModelProvider`, implemented by `FakeModelProvider`, consumed by `SimpleAgentExecutor` and the four M1 content agents) — this work does not touch any of that. It introduces a second, sibling interface (`AiProvider`) for a different purpose: a public, application-facing text-generation capability exposed directly over the API, which `ModelProvider`'s minimal shape (a single prompt string in, text out) was never designed to carry.

## Decision

Implement a complete, minimal vertical slice: `POST /api/v1/ai/text/generate` → `AiTextGenerationService` → `AiProvider` → `GroqAiProvider` (or `MockAiProvider`) → normalized result. Explicitly out of scope for this pass: image/video generation, embeddings, RAG, agents, autonomous workflows, multi-provider fallback, persistent quotas, and any M2 content-intelligence business logic.

### Architecture

```text
Authenticated API request (requireAuthentication + agentInvocationRateLimit)
  │
  ▼
Zod validation (ai.validators.ts) -- rejects empty/oversized prompts, strips any client-
  │                                   supplied provider/model field
  ▼
AiTextGenerationService (services/ai-text-generation.service.ts)
  -- AI_ENABLED gate, error-code -> ApiError mapping, safe telemetry only
  │
  ▼
AiProvider (packages/ai-core) -- vendor-neutral interface, sibling to ModelProvider
  │
  ▼
GroqAiProvider (ai/providers/groq-ai-provider.ts) | MockAiProvider (tests/CI/local, no network)
  │
  ▼
Groq API (groq-sdk, server-side only)
```

`ModelProvider` (the M1 agent pipeline's completion primitive) is unchanged and unrelated to this request path — see "Relationship to ModelProvider" below.

### Configuration

Names only — no values are recorded here or anywhere in this document. See `apps/api/.env.example` for the placeholder file.

- `AI_ENABLED` — master kill-switch, default `false`.
- `AI_PROVIDER` — explicit provider selection, default `mock`. No hidden fallback.
- `GROQ_API_KEY` — required only when `AI_PROVIDER=groq`.
- `GROQ_MODEL` — required only when `AI_PROVIDER=groq`; no model id is hardcoded in source (see "Model Handling" below).
- `AI_REQUEST_TIMEOUT_MS` — default `30000`.
- `AI_MAX_OUTPUT_TOKENS` — default `1200`.
- `AI_MAX_PROMPT_CHARS` — default `12000`.
- `AI_RETRY_COUNT` — default `1` (one bounded retry, transient failures only).

Real Groq calls require **both** `AI_ENABLED=true` and `AI_PROVIDER=groq`. With `AI_PROVIDER=groq` and a missing key/model, provider construction fails at startup (fail-closed, same posture as `env.ts`'s own `loadEnv()`) — production never silently falls back to Mock.

### Provider selection

`createAiProvider()` (`ai/providers/ai-provider-factory.ts`) is a small switch, not a routing engine: `mock` → `MockAiProvider`; `groq` → `GroqAiProvider` if both `GROQ_API_KEY`/`GROQ_MODEL` are present, else throws; any other value throws. The client can never select or override provider/model — both come only from server configuration; the request schema has no `provider`/`model` field at all, so any client-supplied value is silently stripped by Zod.

### API endpoint contract

`POST /api/v1/ai/text/generate` — protected by the existing `requireAuthentication` middleware (`InMemoryAuthProvider` remains the active provider on this branch; Clerk activation is untouched and unrelated) and the existing `agentInvocationRateLimit` (20 req/min per authenticated user, the same limiter already used by the M1 content-generation endpoints).

Request:

```json
{
  "systemPrompt": "You are a professional social media content assistant.",
  "userPrompt": "Generate three concise Instagram caption ideas for a coffee shop.",
  "temperature": 0.7,
  "maxOutputTokens": 600
}
```

Response (success):

```json
{
  "success": true,
  "data": {
    "text": "...",
    "provider": "groq",
    "model": "...",
    "finishReason": "...",
    "usage": { "inputTokens": 0, "outputTokens": 0, "totalTokens": 0 },
    "latencyMs": 0
  }
}
```

Errors follow the existing `{success:false,error:{code,message}}` envelope: `VALIDATION_ERROR` (400, empty/oversized prompt or output-token ceiling), `AUTHENTICATION_ERROR` (401), `BUSINESS_ERROR` (429 rate-limited, 503 AI disabled, 502 upstream/network/timeout mapped from a normalized `AiProviderError`), `SYSTEM_ERROR` (500, configuration error — never exposes internals).

### Security boundaries

- No Groq-specific type (request or response) escapes `GroqAiProvider` — `AiTextGenerationService` and the controller only see `AiProvider`'s vendor-neutral `GenerateTextResult`/`AiProviderError`.
- `GROQ_API_KEY` is injected via constructor/config only, never read from `process.env` inside business methods; never logged, never included in any thrown error message.
- Every vendor error is classified into one of six safe `AiErrorCode`s and mapped to a fixed, safe message — the vendor's own error body/message never reaches a log line, an audit record, or an API response.
- Timeout via `AbortController` (configurable `AI_REQUEST_TIMEOUT_MS`); at most one bounded retry, only for `rate_limited`/`timeout`/`network_error`/`upstream_error` (never for `invalid_request`/`configuration_error`), with short exponential backoff plus jitter. The SDK's own built-in retry is disabled (`maxRetries: 0`) so this policy isn't doubled.
- Logging/audit records only safe metadata (provider, model, correlation id, latency, token counts, success/failure) — prompt content, response text, tokens-as-content, and the raw vendor payload are never logged. One audit record per generation call (a meaningful, cost-relevant event), not per word/token.
- Prompt-injection boundary: this endpoint is a raw text-generation primitive, not a business-logic-executing agent — no tool-calling, no function execution, no downstream side effects beyond returning text, so classic "prompt injection changes application behavior" risk is not applicable at this layer. Out of scope for this pass; revisit if/when this capability is wired into an agent or tool-calling context.

### Relationship to ModelProvider

`AiProvider` and `ModelProvider` are sibling abstractions, not a hierarchy — `GroqAiProvider` talks to Groq directly and does not route through `ModelProvider`. `ModelProvider` remains exactly as implemented (`FakeModelProvider` → `SimpleAgentExecutor` → the four M1 agents → `ContentService`), untouched by this work. A future adapter could let the M1 agent pipeline use a real Groq-backed `ModelProvider` implementation instead of `FakeModelProvider`, without changing any agent code — noted as a future option, not built here, since no current consumer needs it.

### Model handling

No Groq model id is hardcoded anywhere in source — `GROQ_MODEL` is operator-selected via the Groq console and supplied only through configuration. If the configured model is unavailable to the account (Groq returns a not-found/permission-denied-shaped error), `GroqAiProvider` classifies this as `configuration_error` and returns the same safe, fixed message as any other configuration problem — it never substitutes a different model automatically.

### Test strategy

- **Unit** (`ai/providers/*.test.ts`, `services/ai-text-generation.service.test.ts`): `MockAiProvider` determinism, Groq error classification/normalization (mocked at the `groq-sdk` module boundary — no real network calls, no quota consumed), timeout via `AbortSignal`, bounded retry on transient failures only, no-retry on 400/401-shaped failures, factory provider selection and fail-closed configuration errors, service-level error mapping and telemetry-safety.
- **Integration** (`ai-text-generation.test.ts`, top-level, real `createApp()` + supertest): unauthenticated → 401, invalid/oversized prompt → 400, AI disabled → 503, valid request against Mock → 200, client-supplied provider/model silently ignored, provider failure → normalized error, rate limit → 429.
- **Manual smoke test** (`npm run smoke:groq --workspace=@novalight/api`): the one path that touches the real Groq API. Skips safely (exit 0) if `GROQ_API_KEY`/`GROQ_MODEL` are unset; never prints the key; sends one minimal low-token request; prints only success/failure, model, latency, usage, and a short sanitized text preview; exits non-zero on real failure. Not run in CI, not run automatically — requires the user's explicit go-ahead once local `.env` configuration is ready.

### Known limitations

No persistent per-account quota (rate limiting is in-memory and per-process, matching the existing `agentInvocationRateLimit`'s own documented limitation). No job queue — requests are synchronous, bounded by `AI_REQUEST_TIMEOUT_MS`. No multi-provider fallback — if Groq is down, the request fails; no automatic Mock or alternate-vendor substitution in production, by design. No image/video/embedding/chat-history capability. Not wired into any M2 content-intelligence business logic.

### Future provider additions

Adding OpenAI, Claude, Gemini, DeepSeek, Mistral, or a local LLM later is a new class implementing `AiProvider` plus a new `case` in the factory switch — no change to `AiTextGenerationService`, the controller, or the route. Future capabilities (chat history, structured JSON output, image/video generation, embeddings, tool calling) extend as new methods or new sibling interfaces in `packages/ai-core`, never as a breaking change to `generateText`'s existing shape.

### Rollback

Every layer is independently revertible: the API route can be unmounted from `routes/index.ts` without touching the service/provider layer; `AI_ENABLED=false` (the default) disables the feature entirely without any code change; `AI_PROVIDER=mock` disables real Groq calls specifically while keeping the endpoint live for tests; removing the `groq-sdk` dependency and `GroqAiProvider` file leaves `MockAiProvider` and the rest of the stack intact.

## Reasoning

Official `groq-sdk` was chosen over an OpenAI-compatible client because no such client exists anywhere in this repo already, and `groq-sdk` itself declares zero runtime/peer dependencies — the smallest, most directly-supported option. `AiProvider` was kept separate from `ModelProvider` rather than generalizing the latter, to avoid touching the already-tested M1 agent pipeline for a use case (direct public API exposure with richer metadata) it was never designed for — see "Relationship to ModelProvider" above for the full reasoning.

## Consequences

Positive: NovaLight has a working, tested, minimal AI text-generation capability with a real vendor behind an interface no application code is coupled to; the M1 agent pipeline is completely unaffected; future providers/capabilities are additive, not breaking.

Trade-offs: two provider-shaped interfaces now exist in `packages/ai-core` (`ModelProvider`, `AiProvider`) rather than one — an intentional, documented choice (see Context/Relationship sections), not an oversight.

## What This ADR Does Not Do

- Does not implement image/video generation, embeddings, RAG, semantic search, AI agents, autonomous workflows, tool calling, persistent job queues, billing, or model-routing.
- Does not modify `ModelProvider`, `FakeModelProvider`, `SimpleAgentExecutor`, any M1 agent, or `ContentService`.
- Does not touch Clerk activation or `apps/api/src/middlewares/authentication.ts`.
- Does not change the Prisma schema or add any database table.
- Does not add multi-vendor fallback — if the configured provider fails, the request fails.
