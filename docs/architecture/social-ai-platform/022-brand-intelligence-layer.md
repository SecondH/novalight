# Brand Intelligence Layer

> Not a converted source document. Authored during the NovaLight MVP Pivot planning session, per [ADR-015](../017-documentation-structure-for-product-verticals.md).

## Document Metadata

| Field            | Value                             |
| ---------------- | --------------------------------- |
| Document Version | 1.0                               |
| Status           | Proposed — pending human approval |

## 1. Purpose

Describes how the Brand Profile ([021-knowledge-model.md](./021-knowledge-model.md)) goes from a one-time intake artifact (Stage 1) to a continuously-refined asset (Stage 2), and how that refinement stays bounded and explainable rather than an opaque drift.

## 2. Stage 1 — Static Brand Profile

The Brand Profile is created once via guided intake ([product/mvp-social-ai/020-user-journeys.md](../../product/mvp-social-ai/020-user-journeys.md) §1) and edited only by explicit user action. The Brand Strategist Agent ([020-ai-agent-specifications.md](./020-ai-agent-specifications.md) §1) interprets intake answers into structure but does not autonomously change the profile afterward.

## 3. Stage 2 — Learning from Approval History

The Brand Strategist Agent additionally consumes Approval History ([021-knowledge-model.md](./021-knowledge-model.md)) — patterns in what the business approves unedited, edits before approving, or discards — to propose refinements to the Brand Profile.

**Design constraint:** refinements are proposed, not silently applied. Per [017-product-vision.md](../../product/mvp-social-ai/017-product-vision.md) §7 ("the human as the approver of what goes out"), the same principle extends to the brand profile itself — the business reviews and confirms any Brand-Strategist-proposed change before it takes effect, consistent with [Product Vision §9](../../product/007-product-vision.md) "AI recommendations must be explainable and controllable."

## 4. Brand Consistency Scoring

A downstream consumer of the Brand Profile: before a Copywriter or Visual Prompt Engineer draft reaches the user, it can be checked against the current Brand Profile for tone/style drift ([product/mvp-social-ai/022-feature-roadmap.md](../../product/mvp-social-ai/022-feature-roadmap.md) Stage 2 "Brand consistency scoring"). This is a filtering/flagging mechanism, not a hard block — flagged drafts still reach the user for review, they are simply marked.

## 5. What This Layer Does Not Do

- Does not scrape or ingest competitor content or external brand data without the business's explicit input — [018-target-customer-definition.md](../../product/mvp-social-ai/018-target-customer-definition.md) and vertical-pattern awareness ([product/mvp-social-ai/022-feature-roadmap.md](../../product/mvp-social-ai/022-feature-roadmap.md) Stage 2) are aggregate, cross-account patterns, not per-competitor surveillance — a boundary worth stating explicitly given the security/privacy rules in [CLAUDE.md §7](../../../CLAUDE.md#7-security-and-privacy-rules).
- Does not share one account's Brand Profile or Approval History with another account's agent context — no cross-tenant learning in this MVP.
