# Social AI MVP — Development Approval Gate

> Point-in-time assessment, not part of the core numbered `docs/` sequence — matches the existing `docs/readiness/` convention. Authored during the NovaLight MVP Implementation Readiness Gate session, per [ADR-015](../architecture/017-documentation-structure-for-product-verticals.md).

## How This Decision Was Reached

This document was requested as an "Architecture Review Board" sign-off (CTO / Product Owner / Solution Architect / Security Architect / Data Architect / QA Lead). Per [CLAUDE.md §12](../../CLAUDE.md#12-subagent-routing) reviewer independence, whoever authors or plans a change must not be its sole approver — and Claude Code authored the entire Social AI MVP documentation set this gate is judging. The decision below is therefore synthesized from **four independent reviewer-agent passes** run against that documentation (solution-architect, data-architect, security-reviewer, risk-reviewer acting as QA Lead), not asserted unilaterally. Product Readiness was verified directly (an objective existence/completeness check, not a contested judgment call).

Two real issues these reviews found have already been **fixed in this pass** (not merely flagged — see §4 Technical Risks for what changed); this document reflects the documentation set _after_ those fixes.

**What this document cannot do:** issue genuine human/business acceptance of ADR-015 through ADR-018. Simulating a review board can synthesize technical readiness; it cannot substitute for the human decision [CLAUDE.md §3](../../CLAUDE.md#3-authoritative-documentation) requires before an ADR is "accepted." That remains outstanding regardless of this document's decision.

## Decision

**APPROVED WITH CONDITIONS** — **Condition 1 satisfied 2026-07-11.** ADR-015/016/017/018 were reviewed and accepted by the user at M1 implementation start; all four Status fields updated to Accepted (ADR-018 accepted as v1.2, after two independent-review-driven amendments). Conditions 2–3 below remain the operative constraints for implementation.

No independent reviewer found a substantive architecture, security, or product design flaw in the MVP documentation set. Every reviewer's verdict was READY or READY WITH CONDITIONS, except one specific procedural item (database entities "approved") which was NOT READY at the time of this gate — not because the design was wrong, but because [Database Architecture §5](../architecture/012-database-architecture.md) requires human-approved requirements before entity creation, and ADR-018 was still `Status: Proposed`. That was Condition 1 below; it is now closed.

## Preconditions

1. ~~**Human acceptance of ADR-015, ADR-016, ADR-017, ADR-018**~~ — **Satisfied 2026-07-11.** [Database Architecture §5](../architecture/012-database-architecture.md)'s "approved requirements" gate for the entities ADR-018 lists is now met.
2. Confirm the ownership-enforcement correction (see §4) is understood by whoever implements M1 — ownership scoping is a Repository-layer concern (`WHERE account_id = ...`), not something `packages/auth`'s `AuthorizationProvider` alone provides. Two independent reviewers (solution-architect, security-reviewer) converged on this same gap; it is now corrected in the documentation, but implementation must not regress to the original, incorrect assumption.
3. No precondition exists for CI/CD platform, documentation ownership, or RBAC reconciliation to begin **M1 specifically** — confirmed by `risk-reviewer`: these three pre-existing gates block deployment (CI/CD), long-term doc maintenance (ownership), and MVP Track Stage 3+ (RBAC) respectively, not schema/agent work.

## First Sprint Scope

**M1 — Data Foundation** (per [product/mvp-social-ai/027-development-plan.md](../product/mvp-social-ai/027-development-plan.md) §3, unchanged by this gate):

- Create `Brand`, `ContentIdea`, `ContentDraft`, `CalendarEntry` entities in `packages/database/prisma/schema.prisma`, each with a direct owning-account foreign key from its first migration (per amended [ADR-018](../architecture/social-ai-platform/027-data-model-scope-decision.md)).
- Repository-layer queries for all four entities must be account-scoped from the first implementation, not added later — this is now an explicit implementation rule (§6), not an optional hardening pass.
- Exit criteria unchanged: migrations applied in dev; entities exist and are covered by the (by then accepted) ADR-018.

Note: this is distinct from the "M1 SaaS Foundation" (monorepo/database/backend/frontend skeleton/AI interfaces/CI foundation) named in this gate's review request — that description matches the **already-built Phase 0 scaffold** ([docs/development/016-phase-0-implementation-status.md](../development/016-phase-0-implementation-status.md)), confirmed essentially complete by independent QA review except the three pre-existing governance gates in §2 above. The two "M1"s are not the same milestone; this gate does not conflate them.

## Technical Risks

| Risk                                                                                                                                                                                      | Status                                                                                                                                                                                                                                                                                            | Source                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `AuthorizationProvider.can()` checks resource-type/action permissions, not row-level ownership — citing it alone as sufficient for Stage 1 isolation would leave a cross-account IDOR gap | **Fixed this pass** — [018-saas-architecture.md](../architecture/social-ai-platform/018-saas-architecture.md) §4 and [ADR-018](../architecture/social-ai-platform/027-data-model-scope-decision.md) now specify Repository-layer `WHERE account_id = ...` scoping as the actual enforcement point | Found independently by `solution-architect` and `security-reviewer` |
| No scalability-risk documentation existed anywhere in the MVP architecture set                                                                                                            | **Fixed this pass** — new §4a in [018-saas-architecture.md](../architecture/social-ai-platform/018-saas-architecture.md) (agent invocation cost/latency, calendar-read growth, analytics deferred, horizontal-scaling fit)                                                                        | Found by `solution-architect`                                       |
| `ApprovalHistory`/`PerformanceRecord` (Stage 2/4 entities) weren't covered by the explicit owning-FK requirement, risking transitive-ownership inference later                            | **Fixed this pass** — ADR-018 now covers all six entities explicitly                                                                                                                                                                                                                              | Found by `data-architect`                                           |
| AI data-minimization was a narrative claim with no checkable technical control                                                                                                            | **Fixed this pass** — [023-acceptance-criteria.md](../product/mvp-social-ai/023-acceptance-criteria.md) now requires a per-agent field allow-list at prompt-construction time                                                                                                                     | Found by `security-reviewer`                                        |
| `.claude/memory/known-risks.md`'s "no code exists" entry was stale (Phase 0 scaffold and a real test file exist)                                                                          | **Fixed this pass**                                                                                                                                                                                                                                                                               | Found by `risk-reviewer`                                            |
| RBAC role-taxonomy conflict remains open                                                                                                                                                  | **Not fixed — inherited, human decision required**                                                                                                                                                                                                                                                | Pre-existing, confirmed still blocking Stage 3+ only                |
| CI/CD platform undecided                                                                                                                                                                  | **Not fixed — inherited, human decision required**                                                                                                                                                                                                                                                | Pre-existing, blocks deployment not M1                              |
| Documentation ownership role undefined                                                                                                                                                    | **Not fixed — inherited, human decision required**                                                                                                                                                                                                                                                | Pre-existing                                                        |

## Required ADRs

All four require human acceptance (not further documentation) before citing as settled:

- **ADR-015** — [Documentation Structure for Product Verticals](../architecture/017-documentation-structure-for-product-verticals.md)
- **ADR-016** — [MVP Vertical Pivot Decision](../architecture/social-ai-platform/017-mvp-pivot-decision.md)
- **ADR-017** — [Multi-Agent AI Architecture](../architecture/social-ai-platform/019-ai-agent-architecture.md)
- **ADR-018** — [Data Model Scope Decision](../architecture/social-ai-platform/027-data-model-scope-decision.md) (most urgent — gates M1 directly)

## Implementation Rules

Binding for whoever implements MVP Track Stage 1, derived from this gate's findings:

1. Do not create any entity in `packages/database/prisma/schema.prisma` before ADR-018 shows `Status: Accepted`.
2. Every Repository method touching `Brand`, `ContentIdea`, `ContentDraft`, or `CalendarEntry` must filter by the requesting account's ID at the query level — this is not optional hardening, it is the Stage 1 authorization control. `AuthorizationProvider` may be used additionally for type/action checks once roles exist, but never as a substitute for ownership scoping.
3. No agent implementation (`packages/ai-core` consumer) may call an AI vendor SDK directly — only through `ModelProvider`/`PromptManager`/`AgentExecutor`, per ADR-009, unchanged by this MVP.
4. Each agent's prompt construction must draw from an explicit per-agent field allow-list, not a full entity dump, per the corrected [023-acceptance-criteria.md](../product/mvp-social-ai/023-acceptance-criteria.md).
5. No MVP Track Stage 3 (multi-user/publishing automation) work begins until the RBAC role-taxonomy conflict is reconciled by human decision — this gate does not relax that.
6. No source code is written as part of this gate itself — this document is a readiness decision, not an implementation.
