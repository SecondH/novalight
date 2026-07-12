# Future Social API Integration

> Not a converted source document. Authored during the NovaLight MVP Pivot planning session, per [ADR-015](../017-documentation-structure-for-product-verticals.md).

## Document Metadata

| Field            | Value                                                                                                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Document Version | 1.0                                                                                                                                                                                              |
| Status           | Proposed — pending human approval                                                                                                                                                                |
| Scope            | Directional only. [Project Charter §5](../../project/001-project-charter.md) explicitly excludes "Instagram API integration" from current scope; this document does not override that exclusion. |

## 1. Purpose

Records where platform publishing integration would fit in this MVP's architecture _when_ it is explicitly re-scoped by a human decision — so that MVP Track Stage 3–5 automation features ([product/mvp-social-ai/022-feature-roadmap.md](../../product/mvp-social-ai/022-feature-roadmap.md)) are designed with a known extension point, without building any of it now.

## 2. Extension Point

```text
Calendar Entry (approved, scheduled)
  ↓
Publishing Interface (new — does not exist yet; would follow the same abstraction pattern as
Auth (ADR-007) and Storage (ADR-008): Application → Publishing Interface → Platform Provider)
  ↓
Platform Provider (future: Instagram, TikTok, LinkedIn — per 008-prd.md §11 "Future Expansion Areas"
and 009-roadmap.md Phase 4 "Social Integrations")
```

## 3. Why Deferred, Not Designed in Detail

- Each platform's API has distinct auth, rate-limit, and content-format constraints that would be premature to design against without a committed vendor/platform priority order — a human/product decision not made in this document.
- Building this before Stage 3's manual-publish workflow has real usage data risks designing against assumptions rather than observed behavior (same reasoning as [ADR-014](../006-initial-architecture-decisions.md)).

## 4. What Is Already Decided (Inherited, Not New)

- Any future platform integration goes through an abstraction interface, not direct vendor calls — consistent with [ADR-007](../006-initial-architecture-decisions.md)/[ADR-008](../006-initial-architecture-decisions.md)'s existing pattern for Auth/Storage.
- Publishing automation remains opt-in and revocable per content type/channel ([product/mvp-social-ai/020-user-journeys.md](../../product/mvp-social-ai/020-user-journeys.md) §6) — a product constraint that would apply to any platform integration, not just the manual-to-automated transition within NovaLight itself.

## 5. Trigger for Revisiting This Document

This document should be revisited (and very likely superseded by a real ADR selecting specific platforms and auth approach) only when: (a) MVP Track Stage 3 automation has real, validated usage, and (b) a human/business decision names which platform(s) to integrate first. Neither condition is met by this documentation pass.
