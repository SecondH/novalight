# MVP Competitive Positioning

> Not a converted source document. Authored during the NovaLight MVP Pivot planning session, per [ADR-015](../../architecture/017-documentation-structure-for-product-verticals.md). Competitor category descriptions below are general market characterizations, not verified competitive research — flagged rather than presented as sourced fact.

## Document Metadata

| Field            | Value                             |
| ---------------- | --------------------------------- |
| Document Version | 1.0                               |
| Status           | Proposed — pending human approval |

## 1. Competitive Categories

### General SMM Scheduling Tools (e.g. Buffer, Hootsuite, Later)

- **What they do well:** scheduling, multi-platform publishing, basic analytics.
- **Gap for this MVP's target customer:** assume the user already has content to schedule; do not generate ideas, captions, or visuals grounded in the business's brand. Solve the "when to post" problem, not the "what to post" problem — which [017-product-vision.md](./017-product-vision.md) §5 identifies as the actual bottleneck for SMB owner-operators.

### Generic AI Writing/Creative Tools (e.g. ChatGPT, Jasper, Copy.ai, Canva AI)

- **What they do well:** flexible, general-purpose generation.
- **Gap for this MVP's target customer:** no persistent brand memory — every session starts from a blank prompt; no vertical fluency; requires the user to know how to prompt effectively, which contradicts the "no marketing background" persona in [019-personas.md](./019-personas.md) §1.

### Full-Service Agencies / Freelance Social Managers

- **What they do well:** human judgment, full ownership of the problem.
- **Gap for this MVP's target customer:** cost — priced for businesses that can afford $500–$2000+/month retainers, well above what the [018-target-customer-definition.md](./018-target-customer-definition.md) segment typically budgets for marketing.

## 2. NovaLight's Positioning

NovaLight positions between "generic AI tool" and "agency" — AI-native, brand-persistent, vertical-fluent content generation at a price point closer to a scheduling tool than an agency retainer, with a clear (not silently assumed) path to automation once trust is earned (see [020-user-journeys.md](./020-user-journeys.md) §6).

```text
Agency (high cost, full ownership)
   ↑
NovaLight (brand-grounded AI + gradual automation)  ← positioning
   ↓
Generic AI tools (low cost, no brand memory)
Scheduling tools (low cost, no generation)
```

## 3. Deferred Positioning Question — Agency/Multi-Brand Market

[018-target-customer-definition.md](./018-target-customer-definition.md) §3 excludes agencies/freelance social managers as MVP customers, even though §1 of this document lists them as a competitive category NovaLight indirectly displaces for the owner-operator who would otherwise hire one. Whether NovaLight later sells _to_ that same freelance/agency segment as a tool (the "Priya" persona in [019-personas.md](./019-personas.md) §3) is a distinct, later go-to-market question — not resolved here, and not to be conflated with competing _against_ agencies for the owner-operator's business.

## 4. Relationship to Existing Competitive Positioning

[007-product-vision.md](../007-product-vision.md) §10 states NovaLight's differentiators as AI-native architecture, workflow automation, brand intelligence, and enterprise readiness. This document's positioning is consistent with the first three; "enterprise readiness" is explicitly not a Stage 1 claim (see [021-mvp-scope.md](./021-mvp-scope.md) §4) and remains a later-phase differentiator per [009-roadmap.md](../009-roadmap.md), reached via the convergence stage in [026-mvp-roadmap.md](./026-mvp-roadmap.md).
