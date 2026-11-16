# ADR-035 — Agent Pipeline on a Real AI Provider (Groq)

> Not a converted source document. Follows the ADR pattern in [006-initial-architecture-decisions.md](./006-initial-architecture-decisions.md). Numbered `035` in the flat top-level sequence, after [034](./034-application-shell-and-module-scope.md).

## Document Metadata

| Field      | Value                                                                                                                                                                                                                                                                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Status     | **Accepted (direction)**: the repository owner approved wiring Groq into the content flow in-session on 2026-11-16. Prompt wording, temperature and output limits are first-pass values, open to revision once real usage data exists.                                                                                                                             |
| Supersedes | The "no external AI provider in M1" limit of [028-m1-technical-design.md §5](./social-ai-platform/028-m1-technical-design.md) and the "does not modify the agent pipeline" scope note in [ADR-021 (028)](./028-groq-ai-provider-foundation.md). Both described M1. This ADR records the later milestone they deferred to. Both documents now carry a pointer here. |
| Related    | [ADR-009](./006-initial-architecture-decisions.md), [ADR-017 (019)](./social-ai-platform/019-ai-agent-architecture.md), [020-ai-agent-specifications.md](./social-ai-platform/020-ai-agent-specifications.md), [ADR-033](./033-bilingual-i18n-architecture.md), [ADR-034](./034-application-shell-and-module-scope.md)                                             |

## Context

[ADR-034](./034-application-shell-and-module-scope.md) found that every brand profile, content idea, caption and visual prompt a user saw was canned output from `FakeModelProvider`. Two separate AI paths existed in `packages/ai-core`: `AiProvider` (Groq, used only by the generic `/ai/text/generate` endpoint) and `ModelProvider` (used by the four M1 agents, implemented only by the fake). The product's core value, brand-grounded generation, therefore did not reach users.

## Decision

1. **Adapter, not a new interface.** `AiProviderModelAdapter` (`apps/api/src/ai/ai-provider-model-adapter.ts`) implements `ModelProvider` on top of any `AiProvider`, as `ai-provider.interface.ts` already anticipated. No `packages/ai-core` interface changes and no agent constructor changes.
2. **One composition root.** `apps/api/src/ai/agent-pipeline.ts` builds the shared `PromptManager` and `AgentExecutor` once at module load, for both `BrandsService` and `ContentService`.
3. **Explicit selection, fail closed** (`agent-model-provider-factory.ts`):
   - With `AI_ENABLED=true` and `AI_PROVIDER=groq`, the pipeline uses Groq through the adapter.
   - With any other setting, outside production, it uses `FakeModelProvider`, so local development and tests are unchanged.
   - With any other setting, in production, it uses `DisabledModelProvider`: every brand or content generation answers **503**, the same response `/ai/text/generate` gives when disabled. Flipping `AI_ENABLED=false` as a kill switch therefore stops generation; it never stores canned content as real data.
   - `AI_PROVIDER=mock` maps to the fake, because `MockAiProvider` only echoes the prompt.
   - A misconfigured Groq setup throws at startup and never falls back to canned output.
4. **All prompt text lives in the PromptManager.** Each `StaticPromptManager` template renders a `TASK:` block (agent instructions and output format) and then a `BUSINESS DATA:` block. The `BUSINESS DATA` block contains the existing per-agent field allow-list, unchanged.
   - The shared system prompt (`AGENT_SYSTEM_PROMPT`) and the allowed idea formats (`CONTENT_IDEA_FORMATS`) are also defined in `static-prompt-manager.ts`. The adapter receives the system prompt through its config and carries no prompt text of its own.
   - The `[TEMPLATE:id]` marker and the `field: value` lines are kept, so `FakeModelProvider` keeps working.
   - Every line-break character inside a value is collapsed: `\n`, `\r`, U+2028, U+2029 and U+0085. Owner text therefore cannot forge extra field lines.
5. **Model output is untrusted input.**
   - The JSON agents validate their output with Zod through `parseJsonModelOutput`, which tolerates code fences and surrounding prose. The Brand Strategist requires all four profile fields. The Content Planner accepts 1–10 ideas, with `intendedFormat` restricted to `photo-post`, `carousel`, `reel` or `story`.
   - The text agents are trimmed and length-bounded. A caption may be at most 2,000 characters, which matches the owner's own draft-edit limit and stays under Instagram's 2,200. A visual prompt may be at most 1,500 characters.
   - Malformed output becomes `AiProviderError('upstream_error')`, which reaches the client as a safe 502.
6. **One error mapping, with an operator trail.** `apps/api/src/ai/ai-error-mapping.ts` holds the single mapping from `AiProviderError` to `ApiError` (429/502/504/500, with safe fixed messages). The generic endpoint and the agent pipeline (`withAiErrorMapping`) share it. Each pipeline failure logs its error code, never the message. A `configuration_error` (revoked key, retired model) is also sent to error tracking.
7. **Language.** No per-account language is stored yet, so owner-facing output follows the language of the business data: a Persian intake produces Persian profiles, ideas and captions. Visual prompts are always written in English, because image generators follow English best.
8. **Test isolation.** `apps/api/jest.setup-env.js` pins `AI_ENABLED=false` and `AI_PROVIDER=mock` before any module loads. A developer's local Groq-enabled `.env` therefore never causes paid calls from `npm test`.

## Verification (2026-11-16)

- **Checks:** API lint (0 errors), typecheck and build pass.
- **Tests:** the full jest suite has 147 passed and 3 skipped.
  - The 3 skipped tests are the DB-gated ownership tests. They need Docker, which was not running locally; CI runs them.
  - One pre-existing test, the first in `ai-text-generation.test.ts`, failed intermittently (2 of 5 full-suite runs) and passed on re-run. Its own file comment documents a timeout risk under parallel load. The cause was not confirmed.
  - New suites cover the adapter, provider selection (including the production 503 path), output parsing, the format enum, line-separator collapsing, error mapping, and the service-level error paths (`brands.service.ai-errors.test.ts`).
- **Live smoke run:** `npm run smoke:agents` is new and manual; it makes 4 real Groq calls. With `openai/gpt-oss-120b` it produced:
  - a coherent Persian brand profile
  - 5 ideas in the requested formats
  - a Persian caption
  - an English visual prompt

  Every call finished with `stop`, and the largest used 559 of the 1,200 output tokens, so reasoning tokens do not truncate output.

- **Independent reviews:** `solution-architect` returned Compliant-with-advisories, and advisories A1–A8 were addressed. `security-reviewer` returned Pass-with-conditions; M1, M2 and L1–L3 were fixed, and the remaining items are below.

## Consequences and open items

- **Configured model is gone.** The local `.env`'s `GROQ_MODEL=llama-3.3-70b-versatile` is no longer available to the Groq account and returns 404. The existing `smoke:groq` fails for the same reason. The operator must pick a model from the Groq console; `openai/gpt-oss-120b` was verified. `qwen/qwen3.8-27b` hit the free-tier rate limit after one call and added style details the owner never gave.
- **Ideas invent offers.** The Content Planner's allow-list (vertical, tone, audience) excludes `offeringsSummary`, so the model invents products and promotions (a peach iced coffee and a discount night in the smoke run). Adding `offeringsSummary` is an allow-list change under [023-acceptance-criteria.md "Cross-Cutting"](../product/mvp-social-ai/023-acceptance-criteria.md) and needs a human decision.
- **Persian quality is unproven.** Output is fluent but has occasional nonsense words. No quality threshold is defined (see `.claude/memory/known-risks.md`). An evaluation set is needed before launch.
- **No spend ceiling (security M3, open).** The only limit is the existing per-user, in-memory limit of 20 requests per minute. There is no daily per-account quota and no global budget. Combined with open sign-up and JIT provisioning, cost is unbounded. Add a quota, a shared-store limiter and a spend alert before user-facing launch, or accept the risk explicitly.
- **Vendor data flow (security L4, open).** Owner intake answers and topics now go to Groq. Free-text answers may contain the owner's own contact details. Groq's data-retention terms need confirming, and users should be told their answers go to a third party.
- **No per-account attribution (security L5, open).** AI telemetry carries no account or request id, so cost and abuse cannot be traced to an account yet.
