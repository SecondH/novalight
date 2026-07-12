# Content Generation Pipeline

> Not a converted source document. Authored during the NovaLight MVP Pivot planning session, per [ADR-015](../017-documentation-structure-for-product-verticals.md).

## Document Metadata

| Field            | Value                             |
| ---------------- | --------------------------------- |
| Document Version | 1.0                               |
| Status           | Proposed — pending human approval |

## 1. Purpose

Defines the concrete agent-composition sequence for [product/mvp-social-ai/020-user-journeys.md](../../product/mvp-social-ai/020-user-journeys.md) §2 (Content Ideation & Generation), since [019-ai-agent-architecture.md](./019-ai-agent-architecture.md) establishes that composition happens at the Service layer and must be defined explicitly rather than left implicit.

## 2. Pipeline Sequence

```text
1. Trigger: user requests ideas, or a scheduled/proactive suggestion job runs
      ↓
2. Content Planner Agent reads Brand Profile + Calendar state (+ Performance Records, Stage 4)
      ↓ produces
   Content Idea(s)
      ↓
3. User selects one Content Idea
      ↓ (parallel, both read the same selected idea + Brand Profile)
4a. Copywriter Agent → caption draft(s)          4b. Visual Prompt Engineer Agent → visual prompt
      ↓                                                  ↓
5. Both outputs attached to a single Content Draft entity ↙
      ↓
6. User reviews, edits, approves/discards → Approval History recorded (Stage 2 input)
      ↓ (if approved)
7. Content Draft placed on Calendar as a Calendar Entry
```

## 3. Failure/Partial-Output Handling

If step 4a or 4b fails (provider error, timeout) the other can still succeed and be shown to the user — the pipeline does not require both halves to complete atomically, since a caption without a visual prompt (or vice versa) is still useful, unlike a database write that must be transactional. This is a product/UX decision recorded here so implementation doesn't default to unnecessary all-or-nothing coupling.

## 4. Where This Pipeline Does Not Reach (Stage 1)

- No automatic posting at the end of step 7 — that is Stage 3 scope ([product/mvp-social-ai/022-feature-roadmap.md](../../product/mvp-social-ai/022-feature-roadmap.md)).
- No image is necessarily rendered from the visual prompt in Stage 1 — see [024-image-generation-integration.md](./024-image-generation-integration.md).

## 5. Relationship to Existing Architecture

This pipeline is orchestration logic living in `apps/api`'s Service layer ([018-saas-architecture.md](./018-saas-architecture.md) §3) — it is not a new architectural component, and does not require any change to `packages/ai-core`, `packages/database`, or the Controller→Service→Repository/Provider layering rule in [Engineering Constitution §3](../../engineering/002-engineering-constitution.md).
