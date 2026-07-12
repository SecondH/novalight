# Development Entry Checklist

Before writing first production code, per the [Development Readiness Report](./development-readiness-report.md). Checked items are evidenced as of this assessment; unchecked items name exactly what's missing and who must resolve it.

- [x] **Product scope approved** — [Project Charter §5](../project/001-project-charter.md), [PRD §8 MVP Definition](../product/008-prd.md)
- [x] **MVP boundary defined** — [PRD §8](../product/008-prd.md) (Included/Excluded lists)
- [x] **Architecture baseline approved** — [System Architecture](../architecture/004-system-architecture.md), [C4 Model](../architecture/005-c4-model.md), 14 accepted ADRs in [006](../architecture/006-initial-architecture-decisions.md)
- [x] **Technology choices documented** — ADR-001 through ADR-012
- [x] **Security baseline defined** — [Security Architecture](../security/013-security-architecture.md), [Threat Model](../security/014-novalight-threat-model.md)
- [x] **Data model approach defined** — [Database Architecture](../architecture/012-database-architecture.md); Phase 0 scope explicitly limited to the `User` model
- [x] **Testing strategy defined** — [Engineering Constitution §7](../engineering/002-engineering-constitution.md), [Development Workflow](../development/015-development-workflow.md); backend tooling firmly named (Jest/Supertest), frontend tooling named as "recommended" (softer — see gap analysis "Important Missing Documents")
- [x] **Development workflow defined** — [Development Workflow](../development/015-development-workflow.md)
- [ ] **CI/CD approach defined** — **Not defined.** No CI platform or gate-to-automation mapping exists anywhere in `docs/`. Blocks completion of Phase 0's own "CI/CD foundation" deliverable, not the scaffolding milestone. Resolution: human/team decision, then a short ADR.
- [ ] **Documentation ownership defined** — **Not defined.** No named reviewer/approver role for documentation changes. Resolution: human decision, one paragraph added to [Development Workflow](../development/015-development-workflow.md).

## Additional gate specific to this assessment

- [ ] **RBAC role taxonomy reconciled** — `docs/product/008-prd.md` §6 and `docs/security/013-security-architecture.md` §7 name different role sets. Not required to begin the scaffolding milestone; **required before any authorization/RBAC-touching code is written.** Resolution: human/team decision (ADR or PRD/security addendum).

## How to use this checklist

- The first eight items are satisfied — the monorepo-scaffolding milestone (see [Development Readiness Report](./development-readiness-report.md) "Recommended First Development Milestone") may begin without waiting on the remaining three.
- The remaining three items must be resolved by a human decision before Phase 0 is declared complete; none of them can be closed by writing more documentation without a real decision behind it.
- Re-run this checklist (or `/project-status`) after each remaining item is resolved to confirm the change is reflected in `docs/` and `.claude/memory/active-decisions.md`.
