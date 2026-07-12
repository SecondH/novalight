# MVP Target Customer Definition

> Not a converted source document. Authored during the NovaLight MVP Pivot planning session, per [ADR-015](../../architecture/017-documentation-structure-for-product-verticals.md).

## Document Metadata

| Field            | Value                                                                                                                                                                                                                                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Document Version | 1.0                                                                                                                                                                                                                                                                                                                            |
| Status           | Proposed — pending human approval                                                                                                                                                                                                                                                                                              |
| Note on figures  | Business-size and market figures below are illustrative segment descriptions based on general SMB characteristics, not sourced market research. Flagged here rather than presented as verified data — see [025-competitive-positioning.md](./025-competitive-positioning.md) for the same caveat applied to competitor claims. |

## 1. Common Segment Criteria

Across all five verticals, the target customer:

- is a single-location or small multi-location (1–5 locations) independent business, not a franchise head office or enterprise chain
- has an existing social media presence (at least one active platform) but no dedicated marketing employee or agency retainer
- makes content decisions personally (owner) or delegates to one general-purpose staff member, not a marketing team
- is price-sensitive relative to enterprise SaaS, but willing to pay for a tool that visibly saves time

## 2. Vertical Profiles

### 2.1 Beauty Salons (hair, nails, skincare, spa)

- **Content needs:** before/after visuals, service promotions, stylist spotlights, seasonal/holiday campaigns, booking-driving posts
- **Pain points:** visually-driven platform (Instagram) with high content frequency expectations; owner often also the primary service provider with no time during business hours
- **Buying trigger:** wanting a more consistent posting cadence without hiring a social media freelancer

### 2.2 Restaurants

- **Content needs:** menu/dish highlights, daily specials, events, behind-the-scenes, reviews amplification
- **Pain points:** highly time-sensitive content (daily specials), needs to look appetizing (visual quality matters), frequent posting expectation
- **Buying trigger:** wanting to keep up a daily/near-daily posting cadence without a dedicated person

### 2.3 Cafes

- **Content needs:** similar to restaurants but lighter weight — new drinks/seasonal menu, ambiance, community/local-event tie-ins
- **Pain points:** smaller team, often the most resource-constrained of the five verticals
- **Buying trigger:** wanting "always something to post" without daily creative effort

### 2.4 Local Service Businesses (salons aside — e.g. gyms, repair services, cleaning, personal trainers, contractors)

- **Content needs:** trust-building content (testimonials, before/after for physical work, expertise demonstration), local-area targeting, service explainers
- **Pain points:** less inherently visual than food/beauty, so content ideation is the harder problem, not just asset creation
- **Buying trigger:** wanting to look professional and active online to compete with larger local competitors

### 2.5 Retail Businesses (independent shops, boutiques)

- **Content needs:** product highlights, new arrivals, promotions, styling/use-case content
- **Pain points:** inventory changes frequently, content needs to track it; competing with e-commerce-native brands' polish
- **Buying trigger:** wanting professional-looking product content without a photographer/designer on staff

## 3. Explicitly Out of Scope for the MVP

- Franchise/multi-brand corporate accounts (their needs — brand-guideline enforcement across locations, approval hierarchies — map to the existing enterprise vision in [007-product-vision.md](../007-product-vision.md), not this MVP)
- Agencies managing many unrelated client brands (a related but distinct product surface — see [025-competitive-positioning.md](./025-competitive-positioning.md) §3 for why this is deferred, not rejected)
- Verticals not listed above (e.g. professional services like law/accounting, e-commerce-only brands) — may be considered once the initial five are validated, not before

## 4. Relationship to Existing PRD Target Users

[008-prd.md](../008-prd.md) does not define vertical-specific target customers; it names broad user categories (Individual User, Team Member, Organization Owner, Administrator — see the open RBAC conflict noted in [019-personas.md](./019-personas.md) §4). This document narrows "Small and Medium Businesses" from [007-product-vision.md](../007-product-vision.md) §5 into five concrete, addressable segments for MVP go-to-market — it does not redefine or conflict with the PRD's role list.
