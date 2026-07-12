# MVP Feature Roadmap

> Not a converted source document. Authored during the NovaLight MVP Pivot planning session, per [ADR-015](../../architecture/017-documentation-structure-for-product-verticals.md). Feature-level detail; for stage-level sequencing and its relationship to the existing Phase 0–5 vision, see [026-mvp-roadmap.md](./026-mvp-roadmap.md).

## Document Metadata

| Field            | Value                             |
| ---------------- | --------------------------------- |
| Document Version | 1.0                               |
| Status           | Proposed — pending human approval |

## Stage 1 — Content Assistant

| Feature                   | Description                                                     | Depends on                         |
| ------------------------- | --------------------------------------------------------------- | ---------------------------------- |
| Guided brand intake       | Structured Q&A capturing vertical, tone, audience, visual style | —                                  |
| Brand profile             | Persisted, editable summary the agents read from                | Guided brand intake                |
| Content idea generation   | Brand- and vertical-grounded idea suggestions                   | Brand profile                      |
| Caption generation        | Draft captions per selected idea                                | Content idea generation            |
| Visual prompt generation  | Draft image-generation prompts per selected idea                | Content idea generation            |
| Content calendar (manual) | View/approve/reschedule/discard generated content               | Caption + visual prompt generation |

## Stage 2 — Brand Intelligence

| Feature                    | Description                                                                                                             | Depends on                |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| Approval-history learning  | Brand profile refines from what the business approves vs. edits vs. rejects                                             | Stage 1 calendar          |
| Vertical pattern awareness | Suggestions informed by cadence/format norms observed across the vertical (aggregate, not competitor-specific scraping) | Content idea generation   |
| Brand consistency scoring  | Flag drafts that drift from the established brand profile before they reach the owner                                   | Approval-history learning |

## Stage 3 — Publishing Automation

| Feature                        | Description                                                                   | Depends on                                                                      |
| ------------------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Scoped auto-schedule opt-in    | Business opts specific content types/channels into automated scheduling       | Stage 1 calendar, RBAC resolution (see [019-personas.md](./019-personas.md) §4) |
| Multi-user draft/approve roles | A staff persona can draft, only owner can approve for automated content types | RBAC resolution                                                                 |
| Automation revocation          | Any automation can be turned off per content type/channel at any time         | Scoped auto-schedule opt-in                                                     |

## Stage 4 — Business Intelligence

| Feature                          | Description                                                  | Depends on             |
| -------------------------------- | ------------------------------------------------------------ | ---------------------- |
| Engagement data intake           | Manual or connected reporting of post performance            | Stage 1 calendar       |
| Performance-informed suggestions | Content Planner Agent weights future ideas by what performed | Engagement data intake |
| Basic analytics dashboard        | Summary view of content performance over time                | Engagement data intake |

## Stage 5 — Convergence

| Feature                         | Description                                                                                        | Depends on                                                                                                                                                                          |
| ------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Multi-brand-per-account         | Supports the "Priya" freelance/outsourced persona noted in [019-personas.md](./019-personas.md) §3 | Stage 3 multi-user roles                                                                                                                                                            |
| Organization/team structures    | Aligns with [007-product-vision.md](../007-product-vision.md) Phase 1 "SaaS Foundation"            | Stage 3 multi-user roles                                                                                                                                                            |
| Platform publishing integration | First real social API integration                                                                  | [026-future-social-api-integration.md](../../architecture/social-ai-platform/026-future-social-api-integration.md), remains excluded per Project Charter until explicitly re-scoped |

## Explicitly Not Scheduled

Anything listed as Excluded in [021-mvp-scope.md](./021-mvp-scope.md) §4 has no place on this roadmap until a human decision changes that scope document.
