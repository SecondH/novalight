# ADR-019 — CI/CD Platform Decision

> Not a converted source document. Authored during the NovaLight M1.5 Production Foundation planning session, following the ADR pattern in [006-initial-architecture-decisions.md](./006-initial-architecture-decisions.md). Numbered `024` in the flat top-level sequence (cross-cutting infrastructure decision, not part of the Social AI MVP vertical — does not belong in `docs/architecture/social-ai-platform/`).

## Document Metadata

| Field            | Value                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Document Version | 1.1 — finalized during M1.7 Delivery Foundation                                                                                                                                                                                                                                                                                                                                                                                                  |
| Status           | **Accepted** (2026-07-12) — the platform choice (GitHub Actions) is finalized. **This does not mean a live GitHub repository exists.** No `gh` CLI is available in this environment and no repository was created or pushed to this session; that remains a separate action requiring the user directly (creating/authorizing a remote is a "visible to others" action this session does not take unprompted). See §"What This ADR Does Not Do." |
| Document Purpose | Formalize the CI/CD platform choice and extend the existing gate sequence to real deployment automation.                                                                                                                                                                                                                                                                                                                                         |

## Context

[Project Charter §5](../project/001-project-charter.md) lists "CI/CD foundation" as a chartered Phase 0 deliverable. `.github/workflows/ci.yml` implements the quality-gate sequence (install→lint→typecheck→test→build per [Development Workflow §13](../development/015-development-workflow.md)) using GitHub Actions, added during Phase 0 scaffolding as an explicit, disclosed **default** — its own header comment states this was never a ratified decision. No deploy step exists. `docs/deployment/021-m1.5-production-foundation-plan.md` needs an actual deploy pipeline to reach staging.

**New finding this session:** no git remote is configured in this repository (`git remote -v` returns empty). The GitHub Actions recommendation assumes GitHub hosting — that assumption is unverified and must be confirmed by whoever makes this decision, not assumed by this ADR.

## Decision

**GitHub Actions, finalized.** Continues the existing default rather than replacing it — it already implements the full quality-gate sequence correctly (re-validated this session, see [027-m1.7-delivery-foundation-report.md](../operations/027-m1.7-delivery-foundation-report.md)), requires no migration, and is free for a project of this scale.

**Basis for finalizing without a live remote to confirm against:** across three prior sessions (M1.5, M1.6, and this one), no evidence anywhere in NovaLight's documentation, codebase, or user instructions ever named an alternative hosting platform (GitLab, Bitbucket, or otherwise) or a reason to prefer one. `.github/workflows/ci.yml` already existed pre-dating all of this ADR's own analysis. Absent any counter-evidence across that much surface area, GitHub is the reasonable default to finalize — but this is explicitly a documentation/planning decision, not proof a repository exists. **If a live repository is ever created on a different platform, this ADR must be revisited before its CI/CD implications are trusted** — that risk is accepted, not eliminated, by finalizing now.

A deploy job (migration deploy → backend deploy → frontend deploy, staging-only, triggered on merge to `main`, per [021-m1.5-production-foundation-plan.md](../deployment/021-m1.5-production-foundation-plan.md) §7) remains **not implemented** — this ADR's acceptance authorizes the platform choice, not an automatic production/staging deploy, which still requires real Vercel/Railway/Supabase credentials that don't exist in this environment.

## Reasoning

- Already implemented and validated locally (per [016-phase-0-implementation-status.md](../development/016-phase-0-implementation-status.md) and this session's own CI validation pass) — lowest-migration-cost option.
- No documented requirement (cost, compliance, existing team tooling) favors an alternative platform — nothing in NovaLight's documentation names a reason to prefer GitLab CI, CircleCI, or another platform.
- Consistent with ADR-014: adopt what already works rather than introducing a new tool without a stated need.

## Alternatives Considered

1. **GitLab CI / CircleCI / other** — no evidence anywhere in NovaLight's documentation favors these; would require migrating the existing, working `.github/workflows/ci.yml` for no documented benefit. Rejected absent a reason to prefer them.
2. **No formal CI/CD platform, deploy manually** — rejected: contradicts the chartered Phase 0 "CI/CD foundation" deliverable and [Development Workflow §18](../development/015-development-workflow.md)'s "deployment validated" release requirement.

## Consequences

Positive:

- Closes a risk item open since Phase 0.
- Unblocks [021-m1.5-production-foundation-plan.md](../deployment/021-m1.5-production-foundation-plan.md) §7's implementation sequence.

Trade-offs:

- If the hosting-platform assumption (GitHub) is wrong, this ADR must be revisited — not a silent risk, called out in Context above.
- Deploy credentials (Vercel/Railway/Supabase tokens) must be added to GitHub Actions' secrets store once this is accepted — new secrets-management surface, covered by [023-environment-strategy.md](../operations/023-environment-strategy.md) §3.

## What This ADR Does Not Do

- Does not create, push to, or configure a live GitHub repository — no `gh` CLI is available in this environment, and repository creation is a "visible to others" action requiring the user's direct action.
- Does not provision any actual CI/CD secrets or deploy job — that is implementation work, still gated, per [021-m1.5-production-foundation-plan.md](../deployment/021-m1.5-production-foundation-plan.md) §7.
- Does not guarantee GitHub is where this repository will actually live — it records the best-evidenced default and accepts the risk of being wrong (see Decision), rather than leaving the "CI/CD foundation" chartered deliverable permanently undecided over an assumption no one has ever contradicted.
