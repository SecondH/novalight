# MVP Scope

> Not a converted source document. Authored during the NovaLight MVP Pivot planning session, per [ADR-015](../../architecture/017-documentation-structure-for-product-verticals.md). Mirrors the Included/Excluded style of [008-prd.md](../008-prd.md) §8.

## Document Metadata

| Field            | Value                             |
| ---------------- | --------------------------------- |
| Document Version | 1.0                               |
| Status           | Proposed — pending human approval |

## 1. Scope Principle

Consistent with [008-prd.md](../008-prd.md) §8: this MVP should not attempt to build the entire NovaLight vision. It targets the smallest product that delivers the value proposition in [017-product-vision.md](./017-product-vision.md) §6 to a single owner-operator business, then expands only as [026-mvp-roadmap.md](./026-mvp-roadmap.md) stages are validated.

## 2. Included (MVP Track Stage 1 — "Content Assistant")

- Single-brand account (one business per account; no multi-brand/agency support — see [019-personas.md](./019-personas.md) §3)
- Guided brand-intake and brand profile (vertical, tone, audience, visual style)
- AI-generated content ideas grounded in brand profile + vertical
- AI-generated captions per idea
- AI-generated visual prompts per idea (prompt text only — see [024-image-generation-integration.md](../../architecture/social-ai-platform/024-image-generation-integration.md) for whether/how an image is actually rendered in this stage)
- Content calendar (view, approve, reschedule, discard)
- Manual publish workflow (business posts themselves; no platform API integration)
- Single-user account (no team roles, no multi-user approval — defers the RBAC-dependent parts of [019-personas.md](./019-personas.md) §4 entirely)

## 3. Included (Later MVP Track Stages — Not Stage 1)

See [026-mvp-roadmap.md](./026-mvp-roadmap.md) for staging detail:

- **Stage 2 — Brand Intelligence:** deeper brand learning from approved/rejected content history, competitive/vertical pattern awareness
- **Stage 3 — Publishing Automation:** opt-in scoped automation, which is the first point multi-user/permission questions become load-bearing
- **Stage 4 — Business Intelligence:** engagement feedback loop, basic analytics
- **Stage 5 — convergence:** where this vertical product's needs begin to overlap with the general SaaS platform capabilities (organizations, teams, billing) described in [007-product-vision.md](../007-product-vision.md) Phases 1–2

## 4. Excluded (All MVP Track Stages, Not Just Stage 1)

- Instagram, TikTok, LinkedIn, or any social platform API integration — remains excluded per [Project Charter §5](../../project/001-project-charter.md); tracked as future work in [026-future-social-api-integration.md](../../architecture/social-ai-platform/026-future-social-api-integration.md)
- Multi-brand / agency account management (see [018-target-customer-definition.md](./018-target-customer-definition.md) §3)
- Franchise/enterprise multi-location brand-guideline enforcement
- Billing/subscription enforcement (pricing model is proposed in [024-pricing-model.md](./024-pricing-model.md); billing implementation is not MVP scope)
- Full autonomous/unattended publishing (automation is always opt-in and scoped, per [020-user-journeys.md](./020-user-journeys.md) §6)
- Any feature requiring the open RBAC conflict (see [019-personas.md](./019-personas.md) §4) to be resolved, until that human decision is made

## 5. Relationship to Phase 0

None of the above is implemented during Phase 0. Phase 0 remains scoped exactly as [Project Charter §5](../../project/001-project-charter.md) defines it (infrastructure only, no product features). This scope document defines the target for the phase(s) that follow Phase 0 — see [027-development-plan.md](./027-development-plan.md) and [docs/readiness/social-ai-mvp-development-readiness.md](../../readiness/social-ai-mvp-development-readiness.md) for what must be true before that work can begin.
