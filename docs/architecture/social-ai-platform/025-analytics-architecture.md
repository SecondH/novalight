# Analytics Architecture

> Not a converted source document. Authored during the NovaLight MVP Pivot planning session, per [ADR-015](../017-documentation-structure-for-product-verticals.md).

## Document Metadata

| Field            | Value                                                                                                                                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document Version | 1.0                                                                                                                                                                              |
| Status           | Proposed — pending human approval                                                                                                                                                |
| Scope            | MVP Track Stage 4 ("Business Intelligence"), per [product/mvp-social-ai/022-feature-roadmap.md](../../product/mvp-social-ai/022-feature-roadmap.md). Not required for Stage 1–3. |

## 1. Purpose

Defines how Performance Records ([021-knowledge-model.md](./021-knowledge-model.md) §2) are captured and turned into recommendations by the Analytics Agent ([020-ai-agent-specifications.md](./020-ai-agent-specifications.md) §5).

## 2. Data Intake

Two possible sources, not mutually exclusive:

1. **Manual entry** — the business reports basic outcomes (e.g. likes/comments/bookings attributed to a post) against a Calendar Entry.
2. **Connected reporting** — if a future social API integration exists ([026-future-social-api-integration.md](./026-future-social-api-integration.md)), engagement data could be pulled automatically. Not assumed for Stage 4 — Stage 4 must work with manual entry alone, since platform integration remains excluded per [Project Charter §5](../../project/001-project-charter.md).

## 3. Processing

```text
Performance Records (per Calendar Entry)
  ↓
Aggregation (non-AI statistical summary — e.g. average engagement by content type/day/idea category)
  ↓
Analytics Agent (ModelProvider-based summarization/recommendation, per 020-ai-agent-specifications.md §5)
  ↓
Two outputs:
  a) Human-readable dashboard summary (shown to the user)
  b) Structured signal consumed by Content Planner Agent's future idea generation
```

Aggregation is deliberately kept as plain statistical computation, not an LLM call, both for cost and for correctness — the Analytics Agent's LLM usage is reserved for turning already-correct aggregate numbers into readable recommendations, not for doing the arithmetic itself.

## 4. Dashboard (Conceptual)

A summary view showing, at minimum: content performance over time, and which content types/themes correlate with better outcomes for this specific account. No specific UI is designed here — that is `apps/web` implementation work under [Frontend Architecture](../011-frontend-architecture.md).

## 5. Explicit Non-Goals

- No cross-account benchmarking or competitor analytics in this MVP (would require data this platform does not collect from other businesses without their consent — out of scope, and not to be silently assumed as available).
- No claim of statistical significance for small accounts with low post volume — the Analytics Agent's recommendations must be treated as directional, not authoritative, an explainability requirement carried from [Product Vision §9](../../product/007-product-vision.md).
