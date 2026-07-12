# Knowledge Model

> Not a converted source document. Authored during the NovaLight MVP Pivot planning session, per [ADR-015](../017-documentation-structure-for-product-verticals.md).

## Document Metadata

| Field            | Value                                                                                                                                                                                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Document Version | 1.0                                                                                                                                                                                                                                                                                  |
| Status           | Proposed — pending human approval                                                                                                                                                                                                                                                    |
| Note             | This document describes the conceptual data model the agents read/write. It is not a Prisma schema — schema authorship is implementation work gated by [027-data-model-scope-decision.md](./027-data-model-scope-decision.md) and [database-change-review](../../../.claude/skills). |

## 1. Purpose

Defines what "brand knowledge" and "content memory" mean structurally for this MVP, so [020-ai-agent-specifications.md](./020-ai-agent-specifications.md)'s agents have a shared, unambiguous data contract rather than each agent inventing its own representation.

## 2. Core Concepts

### Brand Profile

The account's persistent, structured understanding of the business, owned and refined by the Brand Strategist Agent:

- Vertical (one of the five in [product/mvp-social-ai/018-target-customer-definition.md](../../product/mvp-social-ai/018-target-customer-definition.md))
- Tone descriptors
- Audience description
- Visual style descriptors
- Offerings/services summary (used to ground content ideas in what the business actually sells/does)

### Content Idea

A single proposed content concept, produced by the Content Planner Agent, referencing the Brand Profile and intended for downstream expansion by Copywriter/Visual Prompt Engineer.

### Content Draft

The expanded, user-facing artifact for a Content Idea — caption text (Copywriter) and visual prompt text (Visual Prompt Engineer), plus its approval state (draft / edited / approved / discarded).

### Calendar Entry

A Content Draft placed on a date, with a posted/not-posted state (manual in Stage 1, see [product/mvp-social-ai/021-mvp-scope.md](../../product/mvp-social-ai/021-mvp-scope.md)).

### Approval History (Stage 2+)

The record of how each Content Draft was disposed (approved as-is / edited then approved / discarded), consumed by the Brand Strategist Agent to refine the Brand Profile — see [022-brand-intelligence-layer.md](./022-brand-intelligence-layer.md).

### Performance Record (Stage 4+)

Engagement/outcome data associated with a posted Calendar Entry, consumed by the Analytics Agent.

## 3. Relationships

```text
Brand Profile (1) ──── read by ──── all agents
Brand Profile (1) ──── refined by ── Approval History (many)
Content Idea (1) ──── expands to ── Content Draft (1)
Content Draft (1) ──── placed on ── Calendar Entry (1)
Calendar Entry (1) ──── produces ── Performance Record (0..1, once posted + Stage 4 active)
```

## 4. Scope Boundary

This model is intentionally minimal for Stage 1–2 needs. It does not define organization/team/multi-brand structures (those belong to MVP Track Stage 5 convergence, [product/mvp-social-ai/026-mvp-roadmap.md](../../product/mvp-social-ai/026-mvp-roadmap.md) §2) and does not define publishing/scheduling state beyond manual posted/not-posted (Stage 3 automation extends this, not redefines it).

## 5. Relationship to Database Architecture

This is a conceptual model, not a schema. [027-data-model-scope-decision.md](./027-data-model-scope-decision.md) records the decision to extend Phase 0's database scope to cover it; actual entity/column design happens at implementation time under [Database Architecture](../012-database-architecture.md)'s existing rules (snake_case naming, UUID primary keys, `created_at`/`updated_at`, migrations required).
