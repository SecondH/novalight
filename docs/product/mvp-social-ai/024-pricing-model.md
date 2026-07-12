# MVP Pricing Model

> Not a converted source document. Authored during the NovaLight MVP Pivot planning session, per [ADR-015](../../architecture/017-documentation-structure-for-product-verticals.md).

## Document Metadata

| Field            | Value                                                                                                                                                                                                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document Version | 1.0                                                                                                                                                                                                                                                                          |
| Status           | **Proposed business-model input, not a committed price.** No pricing decision exists anywhere else in NovaLight's documentation to reconcile against — this is new ground, not a resolution of a conflict. Requires a human/business decision before being treated as final. |

## 1. Pricing Principle

Per [018-target-customer-definition.md](./018-target-customer-definition.md) §1, the target customer is price-sensitive relative to enterprise SaaS but willing to pay for visible time savings. Pricing should be simple (one or two tiers), usage-legible (the customer can tell what they're paying for), and should not require the customer to understand AI cost mechanics (tokens, generation counts) directly.

## 2. Proposed Tier Structure (Illustrative)

| Tier        | Target user                                 | Included (Stage 1 scope)                                                                                  | Notes                                                                                              |
| ----------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Starter** | Single owner-operator, Stage 1 only         | Brand profile, monthly content-idea/caption/visual-prompt generation up to a defined volume cap, calendar | Entry tier — must be priced low enough to remove trial friction for a first-time AI tool user      |
| **Growth**  | Owner-operator ready for Stage 2–3 features | Everything in Starter + brand-intelligence learning + (once available) scoped publishing automation       | Upsell path as [026-mvp-roadmap.md](./026-mvp-roadmap.md) stages ship, not available at MVP launch |

No agency/multi-brand tier is proposed, consistent with multi-brand accounts being excluded from MVP scope ([021-mvp-scope.md](./021-mvp-scope.md) §4).

## 3. What This Document Does Not Do

- Does not set actual currency amounts — those require market validation this document cannot substitute for.
- Does not define billing implementation (explicitly excluded from MVP scope, [021-mvp-scope.md](./021-mvp-scope.md) §4).
- Does not conflict with [007-product-vision.md](../007-product-vision.md) §11 "subscription growth" as a future metric — this is the first concrete pricing proposal toward that metric, not a redefinition of it.

## 4. Cost-Side Consideration

Per-generation AI provider cost (via `packages/ai-core`, [ADR-009](../../architecture/006-initial-architecture-decisions.md)) is the primary variable cost driver. The volume cap in the Starter tier exists specifically to bound that cost per account before real usage data exists to price more precisely — this is a placeholder mechanism, to be replaced once Stage 1 has real usage data.
