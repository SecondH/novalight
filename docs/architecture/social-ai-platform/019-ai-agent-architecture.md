# ADR-017 — Multi-Agent AI Architecture for Content Intelligence

> Not a converted source document. Authored during the NovaLight MVP Pivot planning session, per [ADR-015](../017-documentation-structure-for-product-verticals.md).

## Document Metadata

| Field            | Value                                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Document Version | 1.0                                                                                                                                                    |
| Status           | **Accepted** (2026-07-11) — human acceptance confirmed at M1 implementation start                                                                      |
| Document Purpose | Record the decision to implement this MVP's AI capability as multiple cooperating agents composed on top of the existing `packages/ai-core` interfaces |

## Context

[docs/development/016-phase-0-implementation-status.md](../../development/016-phase-0-implementation-status.md) confirms `packages/ai-core` currently contains interfaces only — `ModelProvider`, `PromptManager`, `AgentExecutor`, `Evaluator` — with no vendor SDK and no concrete implementation. [ADR-009](../006-initial-architecture-decisions.md) mandates that AI capability be accessed only through this abstraction, using a Strategy Pattern for provider selection.

This MVP's product design ([product/mvp-social-ai/020-user-journeys.md](../../product/mvp-social-ai/020-user-journeys.md)) implies several distinct AI responsibilities (understanding brand, planning content, writing copy, generating visual prompts, analyzing performance) that could be built as one large prompt or as several smaller, purpose-specific agents.

## Decision

Implement five purpose-specific agents (full specifications in [020-ai-agent-specifications.md](./020-ai-agent-specifications.md)): Brand Strategist, Content Planner, Copywriter, Visual Prompt Engineer, and Analytics. Each agent is a consumer of the existing `AgentExecutor`/`PromptManager`/`ModelProvider` interfaces — **no new interfaces are added to `packages/ai-core`** for this MVP; the existing abstraction is sufficient.

```text
apps/api Service layer
  ↓
Agent implementations (Brand Strategist / Content Planner / Copywriter / Visual Prompt Engineer / Analytics)
  ↓ (each agent uses)
AgentExecutor  ← PromptManager  ← ModelProvider (packages/ai-core, unchanged interfaces)
  ↓
Provider Strategy (ADR-009) → AI Vendor
```

Agents may call each other's outputs as inputs (e.g. Content Planner's output feeds Copywriter and Visual Prompt Engineer — see [023-content-generation-pipeline.md](./023-content-generation-pipeline.md)), but this composition happens at the Service layer, not inside `packages/ai-core` itself — `packages/ai-core` remains a generic, product-agnostic abstraction, unaware of "Brand Strategist" or any other MVP-specific concept.

## Reasoning

- **Separation of concerns mirrors the product's own decomposition.** [product/mvp-social-ai/020-ai-agent-specifications.md](./020-ai-agent-specifications.md)'s five responsibilities are already distinct in the user journeys; one agent per responsibility keeps prompts focused and independently evaluable ([Evaluator](../../development/016-phase-0-implementation-status.md) interface already exists for this).
- **No abstraction changes needed.** Because `AgentExecutor` is already generic, this is additive at the application layer, not a `packages/ai-core` change — lowest-risk path per [ADR-014](../006-initial-architecture-decisions.md) (avoid unnecessary complexity/premature interface changes).
- **Provider independence preserved.** No agent implementation may call an AI vendor SDK directly, per [ADR-009](../006-initial-architecture-decisions.md) — this is a hard constraint carried forward unchanged.

## Consequences

Positive:

- `packages/ai-core`'s interfaces get exercised by five distinct real use cases, which will surface any interface gaps early.
- Agents can be evaluated and iterated independently (e.g. improving Copywriter output doesn't require touching Brand Strategist).

Trade-offs:

- Five agents mean five sets of prompts to maintain and evaluate — [Evaluator](../../development/016-phase-0-implementation-status.md) usage becomes load-bearing sooner than it would with a single-agent design; evaluation criteria per agent are defined in [020-ai-agent-specifications.md](./020-ai-agent-specifications.md).
- Composition/sequencing logic (which agent runs when, on whose output) lives in the Service layer and must be kept simple — [023-content-generation-pipeline.md](./023-content-generation-pipeline.md) defines this explicitly rather than leaving it implicit in code.

## Alternatives Considered

1. **Single large "content" agent handling all responsibilities** — rejected: harder to evaluate/improve individual capabilities, and conflates brand understanding (infrequent, stateful) with content drafting (frequent, stateless per-request).
2. **New `packages/ai-core` interfaces specific to this MVP** (e.g. a `ContentAgent` interface) — rejected for now: would couple a generic package to one product's vocabulary; revisit only if a second, unrelated AI use case later needs the same specific shape.
