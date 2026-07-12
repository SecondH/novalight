# ADR-016 — MVP Vertical Pivot: Social AI Content Platform for SMB Verticals

> Not a converted source document. Authored during the NovaLight MVP Pivot planning session, per [ADR-015](../017-documentation-structure-for-product-verticals.md).

## Document Metadata

| Field            | Value                                                                                                                                                            |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document Version | 1.0                                                                                                                                                              |
| Status           | **Accepted** (2026-07-11) — human acceptance confirmed at M1 implementation start                                                                                |
| Document Purpose | Record the strategic decision to sequence NovaLight's first shipped product as a narrow, vertical AI content tool rather than general SaaS platform capabilities |

## Context

[Project Charter §4](../../project/001-project-charter.md), [System Architecture §10](../004-system-architecture.md), and [Product Vision §8](../../product/007-product-vision.md) (via [009-roadmap.md](../../product/009-roadmap.md)) describe a Phase 1 "SaaS Foundation" (identity, organizations, teams, permissions, subscriptions) as the step immediately after Phase 0, with AI capabilities arriving later in Phase 3. Leadership has proposed instead beginning with a narrow, AI-native content product for five SMB verticals — see [product/mvp-social-ai/017-product-vision.md](../../product/mvp-social-ai/017-product-vision.md) for the full product rationale.

This ADR exists because [CLAUDE.md's change classification](../../../CLAUDE.md#4-mandatory-pre-change-workflow) treats "architecture modification" as Major, requiring an ADR before implementation — and re-sequencing which product capabilities get built first is an architecture-relevant decision, not merely a product one, because it changes which system components ([005-c4-model.md](../005-c4-model.md)) need to exist earliest.

## Decision

NovaLight's near-term development sequence changes from:

```text
Phase 0 → Phase 1 (SaaS Foundation) → Phase 2 (Content Mgmt) → Phase 3 (AI Assistant) → ...
```

to:

```text
Phase 0 → MVP Track Stage 1-5 (vertical-first, AI-native from the start) → converges into the
existing Phase 1+ sequence once genuine multi-user/organization needs emerge from real usage
```

See [product/mvp-social-ai/026-mvp-roadmap.md](../../product/mvp-social-ai/026-mvp-roadmap.md) for stage detail.

**What is explicitly preserved, not replaced:**

- The long-term vision in [007-product-vision.md](../../product/007-product-vision.md) — this ADR changes sequencing, not destination.
- All 14 existing ADRs in [006-initial-architecture-decisions.md](../006-initial-architecture-decisions.md) — technology choices (Next.js/React/TypeScript, Express, PostgreSQL/Prisma, Clerk, Supabase Storage, provider-abstracted AI, `/api/v1`, Vercel/Railway/Supabase) are unchanged. This MVP is built _on_ that foundation, not instead of it.
- Phase 0's own scope and exit criteria ([Project Charter §5](../../project/001-project-charter.md)) — unaffected; this MVP's implementation begins only after Phase 0 completes.

**What is new:**

- A multi-agent AI architecture ([019-ai-agent-architecture.md](./019-ai-agent-architecture.md)) as the first real consumer of `packages/ai-core`'s interfaces.
- New data-model direction beyond `User` ([027-data-model-scope-decision.md](./027-data-model-scope-decision.md)).
- A documentation-structure precedent ([ADR-015](../017-documentation-structure-for-product-verticals.md)).

## Reasoning

- **Faster path to real user validation.** A narrow AI content tool can prove or disprove NovaLight's core value proposition ([product vision §6](../../product/mvp-social-ai/017-product-vision.md)) with a single-user account, without first building organizations/teams/permissions that a solo owner-operator does not need on day one.
- **AI-native differentiation is the product's actual thesis.** [007-product-vision.md](../../product/007-product-vision.md) §10 already names "AI-Native Architecture" as a core differentiator; building AI capability first, rather than fourth, aligns the build order with the stated differentiator.
- **Avoids building unused platform capability early.** [ADR-014](../006-initial-architecture-decisions.md) already warns against premature complexity; building multi-tenant organization/team infrastructure before any user needs it would be exactly that.

## Consequences

Positive:

- Concrete, buildable Stage 1 scope exists today ([product/mvp-social-ai/021-mvp-scope.md](../../product/mvp-social-ai/021-mvp-scope.md)).
- `packages/ai-core`'s interfaces get a real consumer sooner, testing the abstraction under real usage rather than remaining speculative.

Trade-offs / risks (see [docs/readiness/social-ai-mvp-development-readiness.md](../../readiness/social-ai-mvp-development-readiness.md) for full detail):

- The RBAC role-taxonomy conflict (`docs/product/008-prd.md` §6 vs. `docs/security/013-security-architecture.md` §7) must be resolved before MVP Track Stage 3, sooner than it would otherwise have been forced, since this MVP reaches a multi-user surface faster than the original Phase 1-first sequence would have.
- Phase 0's database-scope constraint (`User` model only) must be formally extended by [027-data-model-scope-decision.md](./027-data-model-scope-decision.md) before Stage 1 implementation, not deferred to a later phase as originally implied.
- The existing Phase 1–5 phase-naming conflict (`.claude/memory/known-risks.md`) is not resolved by this pivot — [product/mvp-social-ai/026-mvp-roadmap.md](../../product/mvp-social-ai/026-mvp-roadmap.md) §3 explicitly avoids deepening it.

## Alternatives Considered

1. **Proceed with the existing Phase 1 (SaaS Foundation) first** — rejected for this pivot: delays validating the AI-native value proposition behind infrastructure a single-user MVP doesn't yet need.
2. **Build the vertical MVP as a completely separate product/repo** — rejected: duplicates Phase 0's foundation work, violates [ADR-001](../006-initial-architecture-decisions.md) Monorepo Architecture, and contradicts the user's explicit instruction to treat this as "the first vertical entry point into the broader NovaLight platform," not a separate product.
