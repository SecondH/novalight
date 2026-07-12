# MVP Product Vision — Social AI Content Platform for SMB Verticals

> Not a converted source document. Authored during the NovaLight MVP Pivot planning session, per [ADR-015](../../architecture/017-documentation-structure-for-product-verticals.md). Governed by [CLAUDE.md](../../../CLAUDE.md); does not supersede [007-product-vision.md](../007-product-vision.md).

## Document Metadata

| Field                       | Value                                                                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Document Version            | 1.0                                                                                                                                         |
| Status                      | Proposed — pending human approval                                                                                                           |
| Document Type               | Product Strategy — vertical entry point                                                                                                     |
| Relationship to core vision | Additive. Does not delete, replace, or contradict [007-product-vision.md](../007-product-vision.md) or [009-roadmap.md](../009-roadmap.md). |

## 1. Relationship to the Existing NovaLight Vision

[007-product-vision.md](../007-product-vision.md) defines NovaLight's long-term destination: an AI-native Social Media Management Platform serving SMBs, marketing teams, content creators, and (eventually) enterprise multi-brand organizations. This document does not change that destination.

What changes is the **entry sequence**. Instead of building general-purpose SaaS platform capabilities (organizations, teams, subscriptions) first and layering AI features on later — the order implied by [009-roadmap.md](../009-roadmap.md) Phases 1–4 — NovaLight's first shipped product is a narrow, AI-native content intelligence tool for five SMB verticals. Platform capabilities (multi-user orgs, publishing automation, analytics) are built as this vertical product's needs demand them, not speculatively ahead of a real user.

```text
Existing vision (007-product-vision.md §8):
Phase 0 Foundation → Phase 1 SaaS Foundation → Phase 2 Content Mgmt → Phase 3 AI Assistant → Phase 4 Automation → Phase 5 AI Social OS

This MVP (see 026-mvp-roadmap.md):
Phase 0 Foundation → MVP Track (Stage 1–5, vertical-first) → converges into the existing Phase 1–5 sequence once
the vertical product outgrows single-vertical, single-user assumptions
```

This is recorded as a strategic decision in [social-ai-platform/017-mvp-pivot-decision.md](../../architecture/social-ai-platform/017-mvp-pivot-decision.md), not silently implied here.

## 2. Product Overview

An AI-powered content intelligence and gradual-automation platform for small and medium businesses that have a social media presence but no dedicated marketing function. Initial target verticals: beauty salons, restaurants, cafes, local service businesses, and retail businesses (see [018-target-customer-definition.md](./018-target-customer-definition.md)).

The platform helps a business:

- understand and articulate its own brand (tone, visual identity, audience) — see [022-brand-intelligence-layer.md](../../architecture/social-ai-platform/022-brand-intelligence-layer.md)
- generate content ideas grounded in that brand and vertical
- draft social media posts and captions
- generate visual prompts (for use with external or integrated image-generation tools)
- build and maintain a content calendar
- get engagement-optimization feedback
- gradually hand off manual publishing to automated publishing, at the business's own pace

## 3. Vision Statement

Give every small business the content capability of a marketing team, without requiring them to hire one.

## 4. Mission Statement

Make professional, on-brand social media content achievable for a business owner with no marketing background and limited time, by combining AI content generation with a brand-intelligence layer that keeps output consistent and on-strategy — then, only once trust is established, extend that assistance into automated publishing.

## 5. Problem Statement (Vertical-Specific)

The problems in [007-product-vision.md](../007-product-vision.md) §4 (manual workload, lack of strategic intelligence, fragmented tools, scaling challenges) apply, but manifest specifically for SMB verticals as:

- **No marketing skill in-house.** A salon or cafe owner is not a copywriter or designer; existing SMM tools (Buffer, Hootsuite, Later) assume the user already knows what to post — they schedule content, they don't generate it.
- **Generic AI tools produce generic output.** General-purpose AI writing/image tools (ChatGPT, Jasper, Canva AI) have no persistent memory of the business's brand, audience, or vertical, so every generation starts from zero and output drifts in tone.
- **Time, not budget, is the binding constraint.** These businesses often can afford a modest SaaS subscription but cannot afford the time cost of learning a complex platform or briefing an agency.
- **Trust must be earned before automation.** A business owner will not hand over their public brand voice to full automation on day one — the product must prove content quality before the business will accept less human review.

## 6. Value Proposition

- **Brand-grounded generation** — every output (caption, idea, visual prompt) is generated against a persistent brand profile, not a blank prompt (see [021-knowledge-model.md](../../architecture/social-ai-platform/021-knowledge-model.md)).
- **Vertical fluency** — content suggestions are informed by patterns specific to the business's vertical (a salon's content cadence and voice differ from a restaurant's), not generic marketing advice.
- **Progressive trust** — the product's value is available immediately at the "assistant" stage (Stage 1) without requiring the business to accept any automation; automation is opt-in and gradual (see [026-mvp-roadmap.md](./026-mvp-roadmap.md)).
- **Low time cost to value** — a usable first content calendar should be achievable in a single onboarding session, not a multi-week setup.

## 7. Product Philosophy

Consistent with [007-product-vision.md](../007-product-vision.md) §7: NovaLight is not designed to replace the business owner's judgment or creativity. It is designed to remove the blank-page problem and the skill gap, while keeping the human as the approver of what goes out under their brand name — especially in the earliest MVP stages, before automation is introduced.

## 8. Product Constraints (inherited and vertical-specific)

In addition to [007-product-vision.md](../007-product-vision.md) §12 (avoid unnecessary complexity, AI features without user value, vendor lock-in, poor security, short-term hacks):

- No social platform publishing integration in the initial MVP stages (see [021-mvp-scope.md](./021-mvp-scope.md) Excluded, and [026-future-social-api-integration.md](../../architecture/social-ai-platform/026-future-social-api-integration.md)) — Instagram/TikTok/LinkedIn integration remains excluded per [Project Charter §5](../../project/001-project-charter.md).
- No claim of full autonomous operation in the MVP; automation is explicitly gradual and business-controlled.
- Must not require the business to understand AI, prompting, or the underlying agent architecture to get value.

## 9. Open Items Not Resolved by This Document

- Pricing is proposed, not committed — see [024-pricing-model.md](./024-pricing-model.md).
- User/role taxonomy (owner vs. staff) does not resolve the open RBAC conflict between [008-prd.md](../008-prd.md) §6 and [013-security-architecture.md](../../security/013-security-architecture.md) §7 — see [019-personas.md](./019-personas.md) §4 and `.claude/memory/known-risks.md`.
