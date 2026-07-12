# MVP M1 — SaaS Core Foundation: Engineering Plan

> Not a converted source document. Authored during the NovaLight MVP M1 planning session. Numbered `017` (continuing this directory's existing flat sequence: `015`, `016`) rather than left unnumbered — `docs/development/` has no ADR-covered exception to [CLAUDE.md §9](../../CLAUDE.md#9-documentation-obligations)'s flat-numbering rule the way `docs/product/mvp-social-ai/` and `docs/architecture/social-ai-platform/` do under [ADR-015](../architecture/017-documentation-structure-for-product-verticals.md).

## Document Metadata

| Field            | Value                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document Version | 1.0                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Status           | Proposed — pending human approval                                                                                                                                                                                                                                                                                                                                                                                    |
| Gate             | [docs/readiness/mvp-development-approval.md](../readiness/mvp-development-approval.md) — APPROVED WITH CONDITIONS. Remaining condition: human acceptance of [ADR-018](../architecture/social-ai-platform/027-data-model-scope-decision.md) (amended in this session to add `Account` — see that file's "Amendment (v1.1)" note). **No production code is written by this document or the session that produced it.** |

## 1. What "M1" Means Here — Disambiguated

This is the first genuinely new MVP-specific milestone: new database entities (`Account`, `Brand`, `ContentIdea`, `ContentDraft`, `CalendarEntry`) plus their Service/Controller/Repository layers, minimal `apps/web` UI, and AI agent interface consumption. It is **not** the same thing as the "monorepo/database/backend/frontend skeleton/AI interfaces/CI foundation" already delivered in Phase 0 (see [016-phase-0-implementation-status.md](./016-phase-0-implementation-status.md)) — that scaffold already exists and is confirmed essentially complete by independent QA review during the implementation-readiness gate, except the three pre-existing governance gates in §2 below. This plan builds on top of that scaffold; it does not redo it.

## 2. Preconditions

Unchanged from [docs/readiness/mvp-development-approval.md](../readiness/mvp-development-approval.md):

1. Human acceptance of ADR-018 (as amended) — **blocking**, gates the first migration.
2. Implementers understand the ownership-enforcement correction: Repository-layer `account_id` scoping, not `AuthorizationProvider` alone (see [028-m1-technical-design.md](../architecture/social-ai-platform/028-m1-technical-design.md) §2.2).
3. CI/CD platform, documentation ownership, and RBAC taxonomy remain open but **do not block M1** (RBAC blocks MVP Track Stage 3 specifically; CI/CD blocks deployment, not development; doc ownership is a standing gap unrelated to M1's content).

## 3. Deliverables

| #   | Deliverable                                                                                                                                                                               | Depends on                                            |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| D1  | `packages/database` migration: `Account`, `Brand`, `ContentIdea`, `ContentDraft`, `CalendarEntry`                                                                                         | ADR-018 acceptance                                    |
| D2  | `apps/api` modules: `accounts/`, `brands/`, `content/` (Controller→Service→Repository per [028-m1-technical-design.md](../architecture/social-ai-platform/028-m1-technical-design.md) §3) | D1                                                    |
| D3  | Four agent implementations (Brand Strategist, Content Planner, Copywriter, Visual Prompt Engineer) against existing `packages/ai-core` interfaces, test/fake `ModelProvider` only         | D1 only (see §4 — corrected after independent review) |
| D4  | `apps/web` onboarding + content + calendar UI ([028-m1-technical-design.md](../architecture/social-ai-platform/028-m1-technical-design.md) §4)                                            | D2, D3                                                |
| D5  | `packages/ui` creation — first real consumer is D4                                                                                                                                        | D4's start                                            |

## 4. Sequencing

**Corrected after independent documentation review found a real scheduling conflict, not silently resolved:** an earlier version of this section claimed D1 → D2 → D3 → D4 (strictly sequential, D3 depending on D2) "supersedes... with no contradiction" the M1–M5 breakdown in [product/mvp-social-ai/027-development-plan.md](../product/mvp-social-ai/027-development-plan.md) §3–4, which sequences agent implementation (M2) _before_ API surface (M3) and treats them as independently gated (M2's own exit criteria require no API to exist — agents are unit-testable in isolation against fixtures, per [019-mvp-m1-test-strategy.md](./019-mvp-m1-test-strategy.md) §1). Those two claims — "D3 depends on D2" and "agents are independently testable before an API exists" — genuinely disagreed; the review was right to flag it rather than let both stand.

**Actual sequencing:** D1 (data foundation) is the only hard prerequisite for both D2 and D3 — D2 (`apps/api` modules) and D3 (agent implementations) can proceed **in parallel** once D1 is done. D3 only needs Service-layer _method signatures_ to exist (so agent output has somewhere to be called from eventually), not a complete, tested D2 — and D3's own unit tests ([019-mvp-m1-test-strategy.md](./019-mvp-m1-test-strategy.md) §1) run against fakes/mocks, requiring neither a real database nor a running API. D4 (web UI) depends on both D2 and D3 being far enough along to expose real endpoints and real agent output. This matches [product/mvp-social-ai/027-development-plan.md](../product/mvp-social-ai/027-development-plan.md)'s underlying intent (agents are independently buildable/testable) while also matching [028-m1-technical-design.md](../architecture/social-ai-platform/028-m1-technical-design.md)'s layering (data before everything else) — the two documents are compatible once D2/D3 are correctly described as parallel rather than sequential.

## 5. Exit Criteria

- All five Stage-1 entities migrated in a dev database, each with a working `account_id`-scoped repository method, per [028-m1-technical-design.md](../architecture/social-ai-platform/028-m1-technical-design.md) §1.
- Ownership-isolation tests (see [019-mvp-m1-test-strategy.md](./019-mvp-m1-test-strategy.md) §3) passing for every endpoint.
- The four agents callable end-to-end against a test `ModelProvider`, producing the outputs specified in [social-ai-platform/020-ai-agent-specifications.md](../architecture/social-ai-platform/020-ai-agent-specifications.md).
- Owner persona ([product/mvp-social-ai/019-personas.md](../product/mvp-social-ai/019-personas.md) §1) can complete brand-setup and content-ideation journeys ([product/mvp-social-ai/020-user-journeys.md](../product/mvp-social-ai/020-user-journeys.md) §1–2) end to end in a review environment.
- All items in [product/mvp-social-ai/023-acceptance-criteria.md](../product/mvp-social-ai/023-acceptance-criteria.md) verified, including the ownership and data-minimization additions made during the readiness gate.

## 6. Explicitly Out of Scope for M1

- Any real AI vendor connection (test/fake `ModelProvider` only — [028-m1-technical-design.md](../architecture/social-ai-platform/028-m1-technical-design.md) §5).
- `ApprovalHistory`, `PerformanceRecord` (Stage 2/4 entities).
- Any multi-user/RBAC-touching feature (MVP Track Stage 3+).
- Real deployment (CI/CD platform still undecided).

## 7. Final Review Before Implementation

Per explicit instruction, `/architecture-review`, `/security-review`, and `/review-change` are run against this planning batch before any implementation begins — see the review results appended to this documentation set (not a substitute for human ADR-018 acceptance, which remains the binding precondition).
