# MVP SaaS Architecture

> Not a converted source document. Authored during the NovaLight MVP Pivot planning session, per [ADR-015](../017-documentation-structure-for-product-verticals.md).

## Document Metadata

| Field                                 | Value                                                                                                                                                                                                      |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document Version                      | 1.0                                                                                                                                                                                                        |
| Status                                | Proposed — pending human approval                                                                                                                                                                          |
| Relationship to existing architecture | Additive to [004-system-architecture.md](../004-system-architecture.md) and [005-c4-model.md](../005-c4-model.md); introduces no new container beyond what those documents already describe as the target. |

## 1. Placement Within the Existing Container Model

This MVP does not introduce new top-level applications or infrastructure. It is realized entirely within the containers [005-c4-model.md](../005-c4-model.md) already names:

```text
apps/web        → brand intake UI, content review/calendar UI (existing container, new features)
apps/api         → brand/content/calendar endpoints under /api/v1 (existing container, new routes)
packages/database → Brand, ContentIdea, ContentDraft, CalendarEntry entities (existing container, new entities — see 027-data-model-scope-decision.md)
packages/ai-core  → consumed by new agent implementations (existing container, new consumers — see 019-ai-agent-architecture.md)
packages/auth     → consumed as-is for account/session handling; no change required for Stage 1 (single-user)
```

## 2. New Packages Implied, Not Created Now

[005-c4-model.md](../005-c4-model.md) names `packages/ui`, `packages/utils`, and `packages/storage` as target-state containers that [docs/development/016-phase-0-implementation-status.md](../../development/016-phase-0-implementation-status.md) confirms were deliberately not created in Phase 0, per [ADR-014](../006-initial-architecture-decisions.md) ("create when a real consumer needs them").

This MVP is plausibly the real consumer:

- `packages/storage` — needed once generated visual prompts produce actual stored images ([024-image-generation-integration.md](./024-image-generation-integration.md)).
- `packages/ui` — needed once `apps/web` builds more than a starter page ([product/mvp-social-ai/027-development-plan.md](../../product/mvp-social-ai/027-development-plan.md) backlog item 5).
- `packages/utils` — needed if/when shared logic emerges between `apps/web` and `apps/api` beyond what exists today.

Creating these packages is implementation work, out of scope for this documentation pass. Recorded here so the decision to create them, when it happens, is traceable to this MVP's needs rather than appearing speculative.

## 3. Request Flow (Stage 1 — Content Generation)

```text
apps/web (brand intake / content review UI)
  ↓ HTTPS
apps/api Routes (/api/v1/brands, /api/v1/content-ideas, /api/v1/calendar)
  ↓
Controllers → Services → Repositories (packages/database via Prisma)
  ↓
Services also call → AgentExecutor (packages/ai-core)
  ↓
AgentExecutor → PromptManager + ModelProvider → AI Vendor (via existing provider-strategy abstraction, ADR-009)
```

No controller calls `packages/ai-core` or `packages/database` directly — the existing layering rule (Controller → Service → Repository/Provider, [Engineering Constitution §3](../../engineering/002-engineering-constitution.md)) applies unchanged to this MVP's endpoints.

## 4. Multi-Tenancy Posture (Stage 1)

Stage 1 is single-user, single-brand-per-account ([product/mvp-social-ai/021-mvp-scope.md](../../product/mvp-social-ai/021-mvp-scope.md) §2) — there is no _multi-tenant_ (multi-user-per-account, organization-shaped) surface to secure yet, and the RBAC role-taxonomy conflict is genuinely not blocking at this stage. [Security Architecture](../../security/013-security-architecture.md)'s formal multi-tenant isolation requirement becomes load-bearing starting at MVP Track Stage 3 (multi-user), at which point it depends on the RBAC reconciliation already flagged as an open, blocking item throughout this documentation set.

**This is a distinct question from per-account resource ownership, which is required starting at Stage 1 and is not gated by the RBAC decision.** Stage 1 has many independent, concurrently-active single-user accounts; every `/api/v1/brands`, `/api/v1/content-ideas`, and `/api/v1/calendar` endpoint must scope reads and writes to the requesting account's own Brand/ContentIdea/ContentDraft/CalendarEntry records. Treating "no RBAC yet" as "no authorization check yet" would be a cross-account IDOR risk (Security Architecture, Threat Model §6 "Broken Authorization" / §7 "Cross Organization Data Access") — flagged explicitly here, per the independent security review of this documentation set, so it is not silently assumed away at implementation time.

**Enforcement mechanism, corrected after a second independent review round:** an earlier version of this section named `packages/auth`'s `AuthorizationProvider` interface as the enforcement point. That interface's `can(context, permission)` shape checks resource-_type_ + action permissions (e.g. "can this role read brand resources"), not resource-_instance_ ownership — it has no parameter for a specific record's owning-account ID, so calling it alone cannot prevent one account's request from reading another account's row. The actual enforcement point is the **Repository layer**: every query against Brand/ContentIdea/ContentDraft/CalendarEntry must be scoped with a `WHERE account_id = :requestingAccountId` clause (or equivalent Prisma `where` filter), using the owning-account foreign key required by [027-data-model-scope-decision.md](./027-data-model-scope-decision.md). `AuthorizationProvider` remains useful as a complementary, type/action-level check (e.g. once roles exist, "can this role create content drafts at all") — it is not sufficient by itself for ownership isolation and must not be documented or implemented as if it were.

## 4a. Scalability Risks (Directional)

Not previously documented in this set — added after independent architecture review found the gap. Known, foreseeable scaling pressure points for this MVP, none requiring action before Stage 1:

- **Per-account agent invocation cost/latency** — [020-ai-agent-specifications.md](./020-ai-agent-specifications.md)'s five agents each make at least one `ModelProvider` call; as account volume grows, this is the dominant cost and latency driver (see [product/mvp-social-ai/024-pricing-model.md](../../product/mvp-social-ai/024-pricing-model.md) §4's volume-cap mitigation). No queueing/rate-limiting design exists yet — acceptable for Stage 1's expected volume, revisit once real usage data exists.
- **Content Planner Agent's calendar-state read** ([023-content-generation-pipeline.md](./023-content-generation-pipeline.md)) grows with an account's content history; no pagination/windowing strategy is defined yet — a Stage 2+ concern, not Stage 1, given expected early account content volume.
- **Analytics aggregation** ([025-analytics-architecture.md](./025-analytics-architecture.md)) is deferred to Stage 4 specifically so this isn't designed against unknown data volume ahead of time.
- **Multi-tenant scale** (many accounts, not much data per account) is the MVP's actual shape, not few-accounts/huge-data — this favors horizontal, stateless scaling of `apps/api` (already the existing architecture per [System Architecture §7](../004-system-architecture.md) "Horizontal Scaling: Stateless backend services"), not a new scaling pattern.

None of the above blocks Stage 1 implementation; recorded so it isn't silently absent from the documentation set, per the independent review that flagged it missing.

## 5. What This Document Does Not Decide

- Does not select a CI/CD platform (open item, `docs/readiness/development-entry-checklist.md`).
- Does not create `packages/ui`/`packages/storage`/`packages/utils`.
- Does not modify `packages/database/prisma/schema.prisma` — see [027-data-model-scope-decision.md](./027-data-model-scope-decision.md) for the ADR that must precede any such change.
