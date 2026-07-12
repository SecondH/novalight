# AI Agent Specifications

> Not a converted source document. Authored during the NovaLight MVP Pivot planning session, per [ADR-015](../017-documentation-structure-for-product-verticals.md). Implements the pattern decided in [019-ai-agent-architecture.md](./019-ai-agent-architecture.md) (ADR-017).

## Document Metadata

| Field            | Value                             |
| ---------------- | --------------------------------- |
| Document Version | 1.0                               |
| Status           | Proposed — pending human approval |

All five agents are consumers of the existing `packages/ai-core` interfaces (`ModelProvider`, `PromptManager`, `AgentExecutor`, `Evaluator`) per [ADR-009](../006-initial-architecture-decisions.md) — none calls an AI vendor directly.

## 1. Brand Strategist Agent

- **Responsibility:** interpret guided brand-intake answers into a structured brand profile (tone, audience, visual style, vertical-specific positioning); refine that profile over time from approval/edit/rejection history (MVP Track Stage 2).
- **Inputs:** raw brand-intake answers (Stage 1); approval/edit/rejection history on prior generated content (Stage 2, see [022-brand-intelligence-layer.md](./022-brand-intelligence-layer.md)).
- **Outputs:** structured brand profile (persisted entity, see [021-knowledge-model.md](./021-knowledge-model.md)); a brand-consistency signal consumable by other agents.
- **Tools:** `PromptManager` (brand-intake interpretation prompt template); `ModelProvider` (text generation/analysis).
- **Memory requirements:** long-lived, per-account — the brand profile itself is the agent's persistent memory, read by every other agent. Not session-scoped.
- **Evaluation criteria:** does the structured profile accurately reflect the intake answers (no invented attributes not stated or clearly implied by the user); does a human reviewer (owner persona) accept the profile without major edits on first pass at a target rate to be set once Stage 1 has real usage data (no numeric target invented here, consistent with `.claude/memory/known-risks.md` "No numeric quality thresholds defined").

## 2. Content Planner Agent

- **Responsibility:** propose content ideas grounded in the brand profile, vertical norms, and current calendar state (gaps, recent themes, upcoming dates relevant to the vertical).
- **Inputs:** brand profile (from Brand Strategist); current calendar state; (Stage 4) performance data from the Analytics Agent.
- **Outputs:** a ranked or grouped list of content ideas, each with enough structure (topic, intended format, target date) to hand to Copywriter and Visual Prompt Engineer.
- **Tools:** `PromptManager` (idea-generation prompt template, parameterized by vertical); `ModelProvider`.
- **Memory requirements:** reads brand profile and calendar state per request; does not need its own persistent memory beyond what those entities already store.
- **Evaluation criteria:** ideas are usable without the user needing to substantially reinterpret them; ideas are not duplicative of recent calendar entries; ideas reference the stated vertical/brand rather than generic marketing advice.

## 3. Copywriter Agent

- **Responsibility:** draft captions for a specific, already-selected content idea, in the brand's established tone.
- **Inputs:** selected content idea (from Content Planner); brand profile (tone specifically).
- **Outputs:** one or more caption drafts for the idea.
- **Tools:** `PromptManager` (caption-drafting prompt template); `ModelProvider`.
- **Memory requirements:** stateless per request beyond the brand profile and idea it's given — no independent persistent memory.
- **Evaluation criteria:** tone consistency with brand profile (feeds the brand-consistency scoring feature in [product/mvp-social-ai/022-feature-roadmap.md](../../product/mvp-social-ai/022-feature-roadmap.md) Stage 2); factual grounding in the idea it was given (no invented claims about the business not present in the brand profile or idea).

## 4. Visual Prompt Engineer Agent

- **Responsibility:** draft an image-generation prompt for a specific content idea, reflecting the brand's stated visual style.
- **Inputs:** selected content idea; brand profile (visual style specifically).
- **Outputs:** a textual image-generation prompt (Stage 1 — no image is necessarily rendered, see [024-image-generation-integration.md](./024-image-generation-integration.md) for when/whether rendering happens).
- **Tools:** `PromptManager` (visual-prompt-drafting template); `ModelProvider`. Does **not** itself call an image-generation vendor — that is a distinct, not-yet-decided integration ([024-image-generation-integration.md](./024-image-generation-integration.md)).
- **Memory requirements:** stateless per request, same posture as Copywriter.
- **Evaluation criteria:** prompt is specific enough to plausibly produce an on-brand image if rendered; prompt references the vertical appropriately (e.g. a salon prompt should read differently from a restaurant prompt for the same abstract idea like "before/after" or "new arrival").

## 5. Analytics Agent

- **Responsibility:** interpret engagement/performance data (MVP Track Stage 4) into recommendations that feed the Content Planner Agent's future suggestions.
- **Inputs:** engagement data intake (manual or connected, per [product/mvp-social-ai/022-feature-roadmap.md](../../product/mvp-social-ai/022-feature-roadmap.md) Stage 4); historical content and its outcomes.
- **Outputs:** performance-informed signals consumable by Content Planner (e.g. "content type X outperforms Y for this account"); human-readable summary for the dashboard ([025-analytics-architecture.md](./025-analytics-architecture.md)).
- **Tools:** `PromptManager` (analysis/summarization template); `ModelProvider`; may use non-LLM statistical aggregation ahead of the LLM summarization step, at implementation time — not decided in this document.
- **Memory requirements:** reads historical content/outcome data per request; does not require independent persistent memory beyond what those entities store.
- **Evaluation criteria:** recommendations are traceable to the underlying data (no unsupported claims); recommendations are actionable by the Content Planner Agent's existing input shape, not requiring a redesign of that agent.

## 6. Cross-Agent Rules

- No agent stores brand or business data beyond what its stated responsibility requires, per [CLAUDE.md §7](../../../CLAUDE.md#7-security-and-privacy-rules).
- No agent calls another agent's `ModelProvider` session directly — composition happens at the Service layer per [019-ai-agent-architecture.md](./019-ai-agent-architecture.md), keeping each agent independently testable.
- Every agent's prompt templates live behind `PromptManager`, not hardcoded in Service-layer code, preserving the ability to swap `ModelProvider` implementations without touching agent logic.
