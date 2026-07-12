# Social AI MVP — Development Readiness Review

> Point-in-time assessment, not part of the core numbered `docs/` sequence — matches the existing convention for this directory (see [docs/README.md](../README.md)). Authored during the NovaLight MVP Pivot planning session, per [ADR-015](../architecture/017-documentation-structure-for-product-verticals.md).

## Purpose

Determine whether the existing NovaLight architecture supports the Social AI MVP described in [docs/product/mvp-social-ai/](../product/mvp-social-ai/) and [docs/architecture/social-ai-platform/](../architecture/social-ai-platform/), what's required before implementation can begin, and what's still gated by open items already on record in [docs/readiness/development-entry-checklist.md](./development-entry-checklist.md). This document does not authorize implementation — see each linked item's own status.

## 1. Does Existing Architecture Support This MVP?

**Yes, additively.** No existing ADR is contradicted; [017-mvp-pivot-decision.md](../architecture/social-ai-platform/017-mvp-pivot-decision.md) confirms all 14 original ADRs remain in force. The MVP is realized entirely within existing containers (`apps/web`, `apps/api`, `packages/database`, `packages/ai-core`, `packages/auth`) per [018-saas-architecture.md](../architecture/social-ai-platform/018-saas-architecture.md) §1, using existing `packages/ai-core` interfaces unchanged per [019-ai-agent-architecture.md](../architecture/social-ai-platform/019-ai-agent-architecture.md).

## 2. Required ADRs

| ADR                                                     | File                                                                                                                                      | Status   |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| ADR-015 — Documentation structure for product verticals | [architecture/017-documentation-structure-for-product-verticals.md](../architecture/017-documentation-structure-for-product-verticals.md) | Proposed |
| ADR-016 — MVP vertical pivot decision                   | [architecture/social-ai-platform/017-mvp-pivot-decision.md](../architecture/social-ai-platform/017-mvp-pivot-decision.md)                 | Proposed |
| ADR-017 — Multi-agent AI architecture                   | [architecture/social-ai-platform/019-ai-agent-architecture.md](../architecture/social-ai-platform/019-ai-agent-architecture.md)           | Proposed |
| ADR-018 — Data model scope decision                     | [architecture/social-ai-platform/027-data-model-scope-decision.md](../architecture/social-ai-platform/027-data-model-scope-decision.md)   | Proposed |

All four require human acceptance before being cited as settled decisions — none is self-ratified by having been written. [018-saas-architecture.md](../architecture/social-ai-platform/018-saas-architecture.md), which §1 and §3 of this review rely on, is also `Status: Proposed` (not an ADR itself, but part of the same unaccepted documentation set) — flagged here after independent documentation review noted it wasn't called out alongside the four ADRs above.

## 3. Required Packages (Not Created in This Pass)

Per [018-saas-architecture.md](../architecture/social-ai-platform/018-saas-architecture.md) §2:

- `packages/storage` — needed once image rendering is added ([024-image-generation-integration.md](../architecture/social-ai-platform/024-image-generation-integration.md)); not needed for Stage 1 text-only output.
- `packages/ui` — needed once `apps/web` builds real UI beyond the starter page ([product/mvp-social-ai/027-development-plan.md](../product/mvp-social-ai/027-development-plan.md) M4).
- `packages/utils` — create only if/when shared logic actually emerges; not pre-created speculatively, per [ADR-014](../architecture/006-initial-architecture-decisions.md).

## 4. Required Database Entities (Direction Only — Not Migrated)

Per [ADR-018](../architecture/social-ai-platform/027-data-model-scope-decision.md): `Brand`, `ContentIdea`, `ContentDraft`, `CalendarEntry` (Stage 1); `ApprovalHistory` (Stage 2); `PerformanceRecord` (Stage 4). No migration exists yet; `packages/database/prisma/schema.prisma` is unmodified by this documentation pass.

## 5. Gates Inherited From the Existing Development Entry Checklist

Per [docs/readiness/development-entry-checklist.md](./development-entry-checklist.md), these are **not new** — they predate this MVP and are not resolved by it:

| Gate                              | Status      | Blocks                                                                                                                                         |
| --------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| CI/CD platform decision           | Not defined | Deployment of any MVP milestone (§7 of [product/mvp-social-ai/027-development-plan.md](../product/mvp-social-ai/027-development-plan.md))      |
| Documentation ownership role      | Not defined | Long-term maintenance of this new doc set, same as everywhere else in `docs/`                                                                  |
| RBAC role taxonomy reconciliation | Not defined | Specifically blocks MVP Track Stage 3 (Publishing Automation) and any multi-user feature — does **not** block Stage 1–2, which are single-user |

This MVP does not introduce a fifth gate beyond these three plus the four ADRs above needing acceptance.

## 6. New Risk Surfaced by This MVP

The RBAC gate above was previously "not blocking Phase 0 scaffolding/tooling setup" per `.claude/memory/known-risks.md`. This MVP reaches a real multi-user surface at MVP Track Stage 3 — a different position in the build sequence than the original Phase-1-first roadmap (where permissions/RBAC work was part of Phase 1, immediately after Phase 0). **Correction after independent risk review:** no NovaLight document estimates effort or calendar time for either sequence, so this should not be read as a claim that the gate now blocks "sooner" in wall-clock terms — only that its position relative to other MVP work changed. Severity is unaffected either way; MVP Track Stage 3 cannot proceed without this conflict resolved, exactly as Phase 1 could not have. See the `known-risks.md` update made alongside this document for the full correction.

A second, distinct risk was identified by independent security review and has been fixed in this pass, not merely flagged: [018-saas-architecture.md](../architecture/social-ai-platform/018-saas-architecture.md) §4 originally implied Stage 1 had no authorization surface to secure at all (true for RBAC/multi-tenancy, false for basic per-account resource ownership). Both that document and [027-data-model-scope-decision.md](../architecture/social-ai-platform/027-data-model-scope-decision.md) (ADR-018) now state explicitly that per-account ownership scoping on Brand/ContentIdea/ContentDraft/CalendarEntry is required from Stage 1's first endpoint, independent of the RBAC decision.

## 7. Recommended First Milestone

Per [product/mvp-social-ai/027-development-plan.md](../product/mvp-social-ai/027-development-plan.md) §8: M1 (data foundation — entities + ADR-018 acceptance) is the correct starting point. It is blocked only on ADR-018 acceptance, not on the CI/CD or documentation-ownership gates, since schema/ADR work requires neither.

## 8. What Remains Explicitly Open

- RBAC taxonomy conflict (`.claude/memory/known-risks.md`) — unresolved, human decision required, blocking Stage 3+.
- CI/CD platform — unresolved, human decision required, blocking deployment (not blocking M1–M4 development work itself).
- Documentation ownership — unresolved, human decision required.
- Phase-naming conflict across `004`/`007`/`009` — unresolved; this MVP's roadmap avoids deepening it ([product/mvp-social-ai/026-mvp-roadmap.md](../product/mvp-social-ai/026-mvp-roadmap.md) §3) but does not resolve it.
- Pricing (`product/mvp-social-ai/024-pricing-model.md`) is a proposal, not a committed figure.
