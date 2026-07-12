# MVP Development Plan

> Not a converted source document. Authored during the NovaLight MVP Pivot planning session, per [ADR-015](../../architecture/017-documentation-structure-for-product-verticals.md). Planning artifact only — per the user's explicit instruction, no application code is written as part of this document or the pass that produced it.

## Document Metadata

| Field            | Value                                                                                                                                                                       |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document Version | 1.0                                                                                                                                                                         |
| Status           | Proposed — pending human approval, and pending the gates in [docs/readiness/social-ai-mvp-development-readiness.md](../../readiness/social-ai-mvp-development-readiness.md) |

## 1. Preconditions Before Any Line of This Plan Is Executed

Per [Development Entry Checklist](../../readiness/development-entry-checklist.md), the following must be resolved by human decision first — this plan does not resolve them:

1. CI/CD platform decision (currently a documented default only, per `docs/readiness/development-entry-checklist.md`)
2. Documentation ownership role named
3. RBAC role taxonomy reconciled — blocking specifically for Stage 3 (multi-user) work, see §4 below

Additionally, per [Project Charter §5](../../project/001-project-charter.md), this plan's work belongs to the phase(s) **after** Phase 0 — Phase 0 itself must reach its own completion criteria first (see [docs/development/016-phase-0-implementation-status.md](../../development/016-phase-0-implementation-status.md)).

## 2. MVP Backlog (Stage 1 — "Content Assistant")

Grouped by the features in [022-feature-roadmap.md](./022-feature-roadmap.md) Stage 1:

1. `packages/database`: add Brand, ContentIdea, ContentDraft, CalendarEntry entities — requires the data-model ADR ([social-ai-platform/027-data-model-scope-decision.md](../../architecture/social-ai-platform/027-data-model-scope-decision.md)) to be accepted first, since it changes the current Phase-0 "User model only" constraint.
2. `packages/ai-core` consumers: implement Brand Strategist, Content Planner, Copywriter, Visual Prompt Engineer agents against the existing `AgentExecutor`/`PromptManager`/`ModelProvider` interfaces (no new interfaces needed per [social-ai-platform/019-ai-agent-architecture.md](../../architecture/social-ai-platform/019-ai-agent-architecture.md)).
3. `apps/api`: brand intake endpoints, content generation endpoints, calendar endpoints — under `/api/v1`, response contract per [Backend Architecture](../../architecture/010-backend-architecture.md).
4. `apps/web`: brand intake flow, content review/approval UI, calendar UI.
5. `packages/ui` (does not yet exist): first real consumer would be item 4 — creation of this package becomes justified at this point, per ADR-014's "create when a real consumer needs it," not before.

## 3. Technical Milestones

| Milestone               | Contains         | Exit criteria                                                                                                                                                                                                                  |
| ----------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| M1 — Data foundation    | Backlog item 1   | Migrations applied in dev; Brand/ContentIdea/ContentDraft/CalendarEntry entities exist and are covered by the data-model ADR                                                                                                   |
| M2 — Agent layer        | Backlog item 2   | Each of the 4 Stage-1 agents (see [020-ai-agent-specifications.md](../../architecture/social-ai-platform/020-ai-agent-specifications.md)) callable in isolation with test fixtures, no live vendor call required to pass tests |
| M3 — API surface        | Backlog item 3   | Endpoints pass contract review per [api-review skill](../../../.claude/skills) / [api-contract-reviewer agent](../../../.claude/agents)                                                                                        |
| M4 — Web experience     | Backlog item 4   | Owner persona (`019-personas.md` §1) can complete the brand-setup and content-ideation journeys (`020-user-journeys.md` §1–2) end to end in a review environment                                                               |
| M5 — Stage 1 acceptance | All of the above | All criteria in [023-acceptance-criteria.md](./023-acceptance-criteria.md) verified                                                                                                                                            |

## 4. Implementation Sequence

M1 → M2 → M3 → M4 → M5, sequentially — later milestones consume earlier ones' outputs (agents need entities to persist against; API needs agents to call; UI needs API). No milestone after M1 should begin before the data-model ADR is accepted, since a later schema change would invalidate M2's entity assumptions.

Stage 3 (Publishing Automation) work does not enter any sprint until the RBAC taxonomy is reconciled (§1 item 3) — this is a hard gate, not a soft preference, because Stage 3 is the first stage with a real multi-user authorization surface.

## 5. Illustrative Sprint Plan

Sprint-length and team size are not decided anywhere in NovaLight's documentation — the breakdown below is a sequencing illustration against the milestones above, not a committed schedule:

- **Sprint 1:** M1 (data foundation) + ADR acceptance
- **Sprint 2–3:** M2 (agent layer)
- **Sprint 4:** M3 (API surface)
- **Sprint 5–6:** M4 (web experience)
- **Sprint 7:** M5 (acceptance hardening, bug fixing, review passes)

## 6. Testing Strategy

Per [Engineering Constitution §7](../../engineering/002-engineering-constitution.md):

- **Unit tests:** each agent's prompt-construction and output-parsing logic (`packages/ai-core` consumers); entity validation logic.
- **Integration tests:** API endpoints against a real (test) database and mocked `ModelProvider`; no test should make a live paid AI call, consistent with the existing Phase-0 scaffold's "no paid API calls" posture (`docs/development/016-phase-0-implementation-status.md`).
- **End-to-end tests:** the brand-setup and content-ideation journeys ([020-user-journeys.md](./020-user-journeys.md) §1–2), per [Frontend Architecture](../../architecture/011-frontend-architecture.md)'s recommended Playwright.

No numeric coverage threshold is invented here — none exists elsewhere in NovaLight's documentation (`.claude/memory/known-risks.md` "No numeric quality thresholds defined").

## 7. Deployment Plan

Follows existing targets — no new infrastructure decision required:

- **Frontend:** Vercel (ADR-012)
- **Backend:** Railway (ADR-012)
- **Database:** Supabase PostgreSQL (ADR-012)
- Deployment remains blocked on the same open CI/CD platform decision noted in §1 — this plan does not pick a platform, it inherits the open item.

## 8. Recommended First Sprint

See the chat-level "Recommended First Sprint" summary delivered alongside this documentation package — Sprint 1 above (M1: data foundation + ADR acceptance) is the concrete recommendation, chosen because every later milestone depends on it and because it is the sprint least likely to be blocked by the still-open CI/CD and documentation-ownership gates (schema/ADR work does not require either to be resolved first).
