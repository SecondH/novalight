# NovaLight Claude Code Operating Instructions

Guidance for Claude Code when working in the NovaLight repository. This file governs behavior; it does not replace the documents it references. Where this file and a document under `docs/` disagree, treat that as a conflict to report, not to silently resolve (see [Documentation Usage Rules](#3-authoritative-documentation)).

## 1. Project Overview

NovaLight is a cloud-native, AI-powered Social Media Management SaaS platform (Architecture Style: "Cloud Native Modular SaaS"). Source: [System Architecture](./docs/architecture/004-system-architecture.md), [Project Charter](./docs/project/001-project-charter.md).

**Current phase: Phase 0 — Engineering Foundation** ([Project Charter §4-5](./docs/project/001-project-charter.md)). Phase 0 goal: production-ready architecture, monorepo structure, development standards, security foundation, AI/auth/storage abstraction layers, documentation system, CI/CD and testing foundations. Phase 0 explicitly **excludes**: AI generation features, Instagram API integration, content automation, marketing workflows, business logic, billing, analytics engine, real customer features.

**Repository reality**: monorepo scaffolding now exists — `apps/web`, `apps/api`, `packages/database`, `packages/auth`, `packages/ai-core` — but contain **only Phase 0 foundation**, no product features (see [Phase 0 Implementation Status](./docs/development/016-phase-0-implementation-status.md) for exactly what was scaffolded and what wasn't). Several paths named in the architecture documents still do **not** exist and remain aspirational: `packages/ui`, `packages/utils`, `packages/storage` (named in [C4 Model](./docs/architecture/005-c4-model.md) but not yet created — nothing consumes them yet), and `services/`/`infrastructure/` top-level directories (not part of ADR-001's documented shape at all). Do not assume any undocumented-as-existing path is real — verify with a file-system check before referencing or writing to it.

Target technology direction, now scaffolded per the ADRs below (shadcn/ui and real hosting/deployment are still not wired): Next.js 15 / React 19 / TypeScript / TailwindCSS (frontend); Node.js / Express / TypeScript (backend); PostgreSQL / Prisma ORM (database); Vercel (frontend hosting) / Railway (backend hosting) / Supabase PostgreSQL (database hosting) — deployment not yet configured; Turborepo (monorepo). Source: [ADR-001 – ADR-014](./docs/architecture/006-initial-architecture-decisions.md).

## Development Phase Status

**Current phase: Phase 0 — Conditionally Ready for development.** Full evidence and rationale: [Development Readiness Report](./docs/readiness/development-readiness-report.md).

The monorepo-scaffolding milestone (Turborepo layout, `apps/web`/`apps/api` skeletons, Prisma with the Phase-0-scope `User` model, auth/storage/AI abstraction interface stubs) may begin immediately — every decision it needs is already documented across 14 accepted ADRs. Three specific items remain open and must be resolved by **human decision**, not by writing more documentation, before Phase 0's own chartered deliverables are complete: no CI/CD platform is chosen, no documentation-ownership role is named, and `docs/product/008-prd.md` §6 names a different RBAC role set than `docs/security/013-security-architecture.md` §7. None of these three block the scaffolding milestone; the RBAC item specifically blocks any authorization-touching code. See the [Development Entry Checklist](./docs/readiness/development-entry-checklist.md) for the actionable gate.

Before modifying source code:

1. Read the relevant requirements ([CLAUDE.md §3](#3-authoritative-documentation) routing table).
2. Read the applicable architecture documents.
3. Create an implementation plan (`feature-planning` skill / `/plan-feature`).
4. Identify risks — cross-check `.claude/memory/known-risks.md` and the [Development Entry Checklist](./docs/readiness/development-entry-checklist.md) for anything that gates the specific area you're touching.
5. Select appropriate reviewers per [§12 Subagent Routing](#12-subagent-routing).
6. Implement (`implementation` skill).
7. Test (`test-design` skill).
8. Review (`code-review` skill / `/review-change`).
9. Update documentation (`documentation-maintenance` skill / `/update-docs`).

## 2. Repository Map

```text
.
├── CLAUDE.md                  This file
├── .claude/                   Claude Code workspace (memory, skills, agents, commands, hooks, templates, checklists)
├── apps/
│   ├── web/                    Next.js app (ADR-003/004) — starter page only, no product UI
│   └── api/                    Express app (ADR-005) — health endpoint only, no business endpoints
├── packages/
│   ├── database/                Prisma + PostgreSQL (ADR-006) — Phase-0-scope User model only
│   ├── auth/                    Auth/authorization/audit interfaces only (ADR-007) — no provider implementation
│   └── ai-core/                 AI provider/prompt/agent/evaluation interfaces only (ADR-009) — no vendor SDK
├── .github/workflows/ci.yml   Install/lint/typecheck/test/build — no deploy step
├── docs/
│   ├── README.md               Documentation index
│   ├── project/                001 — Project Charter
│   ├── engineering/             002 — Engineering Constitution, 003 — Claude Code Operating Model
│   ├── architecture/            004–006, 010–012 — System/C4/ADRs/Backend/Frontend/Database architecture; 017 — ADR-015 (doc structure for verticals); 024 — ADR-019 (CI/CD platform, Proposed)
│   │   └── social-ai-platform/  017–028 — Social AI MVP + M1 architecture (domain-local numbering, ADR-015) — ADRs 016–018 Accepted, rest Proposed
│   ├── product/                 007–009 — Product Vision, PRD, Roadmap
│   │   └── mvp-social-ai/       017–027 — Social AI MVP product docs (domain-local numbering, ADR-015) — Proposed, pending approval
│   ├── security/                013–014 — Security Architecture, Threat Model; 022 — Authentication Production Strategy (Proposed)
│   ├── development/             015 — Development Workflow, 016 — Phase 0 Implementation Status, 018–020 — M1 plan/test-strategy/implementation-status
│   ├── deployment/              021 — M1.5 Production Foundation Plan (new category, Proposed)
│   ├── operations/              023 — Environment Strategy (new category, Proposed)
│   ├── _source/                 Conversion manifest + report (traceability only; each `.md` has a same-named `.docx` original)
│   ├── ai-workspace/            Claude Code workspace architecture documentation
│   └── readiness/               Point-in-time development-readiness assessments (see Development Phase Status above), incl. the Social AI MVP readiness review and M1 development-approval gate
```

**M1 status**: M1 — SaaS Core Foundation (Account/Brand/ContentIdea/ContentDraft/CalendarEntry + agent pipeline against a fake AI provider) is implemented in `apps/api`/`packages/database`/`apps/web` — see [M1 Implementation Status](./docs/development/020-m1-implementation-status.md). Phase 0's "no product features" framing above now describes the repository's starting point, not its current state; M1.5 production-foundation planning (deployment/auth/environment strategy) is underway but not yet implemented — see [M1.5 Production Foundation Plan](./docs/deployment/021-m1.5-production-foundation-plan.md).

`packages/ui`, `packages/utils`, `packages/storage` (named in the [C4 Model](./docs/architecture/005-c4-model.md)) and top-level `services/`/`infrastructure/` do not exist — see [Phase 0 Implementation Status](./docs/development/016-phase-0-implementation-status.md) for why.

Do not modify `docs/**/*.docx` files — they are preserved originals. Edit the corresponding `.md` file instead.

## 3. Authoritative Documentation

### Mandatory reading (read in order before planning or implementing anything)

1. [Documentation Index](./docs/README.md)
2. [Project Charter](./docs/project/001-project-charter.md)
3. [Engineering Constitution](./docs/engineering/002-engineering-constitution.md)
4. [Claude Code Operating Model](./docs/engineering/003-claude-code-operating-model.md)
5. [System Architecture](./docs/architecture/004-system-architecture.md)
6. [Product Vision](./docs/product/007-product-vision.md)

### Document routing table

| Work type                                          | Required documents                                                                                                                                                                                                                                                                                                                                                                                                |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product change                                     | [Product Vision](./docs/product/007-product-vision.md), [PRD](./docs/product/008-prd.md), [Roadmap](./docs/product/009-roadmap.md)                                                                                                                                                                                                                                                                                |
| Architecture change                                | [System Architecture](./docs/architecture/004-system-architecture.md), [C4 Model](./docs/architecture/005-c4-model.md), [ADRs](./docs/architecture/006-initial-architecture-decisions.md), [Security Architecture](./docs/security/013-security-architecture.md)                                                                                                                                                  |
| Social AI MVP work (any of the five SMB verticals) | [MVP Product Vision](./docs/product/mvp-social-ai/017-product-vision.md), [MVP Scope](./docs/product/mvp-social-ai/021-mvp-scope.md), [MVP Pivot Decision — ADR-016](./docs/architecture/social-ai-platform/017-mvp-pivot-decision.md), [Social AI MVP Development Readiness](./docs/readiness/social-ai-mvp-development-readiness.md) — **Proposed status; confirm human acceptance before treating as settled** |
| Backend / API change                               | [Backend Architecture](./docs/architecture/010-backend-architecture.md), [Engineering Constitution](./docs/engineering/002-engineering-constitution.md)                                                                                                                                                                                                                                                           |
| Frontend change                                    | [Frontend Architecture](./docs/architecture/011-frontend-architecture.md)                                                                                                                                                                                                                                                                                                                                         |
| Database change                                    | [Database Architecture](./docs/architecture/012-database-architecture.md)                                                                                                                                                                                                                                                                                                                                         |
| Security change                                    | [Security Architecture](./docs/security/013-security-architecture.md), [Threat Model](./docs/security/014-novalight-threat-model.md)                                                                                                                                                                                                                                                                              |
| Development process / CI / release                 | [Development Workflow](./docs/development/015-development-workflow.md)                                                                                                                                                                                                                                                                                                                                            |
| Claude Code workspace change                       | [.claude/README.md](./.claude/README.md), [docs/ai-workspace/](./docs/ai-workspace/)                                                                                                                                                                                                                                                                                                                              |

### Rules

1. Read the relevant documents under `docs/` before changing code, documentation, or architecture.
2. Treat the Engineering Constitution and accepted ADRs ([006](./docs/architecture/006-initial-architecture-decisions.md)) as project constraints, not suggestions.
3. Do not invent missing requirements — if something is not defined in the documentation, say so and ask rather than assuming.
4. Report conflicts between code, documentation, and repository configuration instead of silently resolving them. A known example: [System Architecture §10](./docs/architecture/004-system-architecture.md), [Product Vision §8](./docs/product/007-product-vision.md), and [Roadmap](./docs/product/009-roadmap.md) each name Phases 1–5 differently (e.g. Phase 5 is "Enterprise Platform" in `004` but "AI Social Operating System" in `007`/`009`) — treat phase names as directional, not literal, until reconciled by a human.
5. Update documentation when an approved implementation changes documented behavior.
6. Record significant architecture decisions as a new ADR in `docs/architecture/` before implementing them, following the pattern in [006](./docs/architecture/006-initial-architecture-decisions.md).
7. Preserve traceability between requirements, decisions, implementation, and tests.
8. Some source documents reference paths that do not exist and were preserved verbatim by the docx→md conversion — do not treat these as real: `docs/decisions/`, `docs/api/`, `docs/engineering/technical-debt.md`, `docs/engineering/engineering-constitution.md` (stale; actual file is `docs/engineering/002-engineering-constitution.md`). If a task requires one of these, ask whether to create it rather than assuming it should exist.

## 4. Mandatory Pre-Change Workflow

For every non-trivial task:

1. Inspect the relevant files and current repository state (do not assume paths from documentation exist).
2. Read the applicable documentation per the routing table above.
3. Identify dependencies and blast radius.
4. State assumptions explicitly — do not silently fill documentation gaps.
5. Produce a change plan (use a Plan for anything non-trivial; see [Claude Code Operating Model §8](./docs/engineering/003-claude-code-operating-model.md) change classification).
6. Implement the smallest coherent change.
7. Run relevant checks (lint, type check, tests, build — once these exist; see §8).
8. Review the diff before considering the task done.
9. Update documentation when behavior changes.
10. Report unresolved risks and open questions.

Change classification (from [Claude Code Operating Model §8](./docs/engineering/003-claude-code-operating-model.md)):

- **Minor** (typo, formatting, isolated utility): may proceed directly.
- **Medium** (component addition, API extension, package update): requires impact analysis.
- **Major** (architecture modification, database redesign, authentication changes): requires an ADR and architecture review.

## 5. Architecture Rules

From [Engineering Constitution](./docs/engineering/002-engineering-constitution.md) and [ADRs](./docs/architecture/006-initial-architecture-decisions.md):

- **Clean Architecture**: dependencies point inward; business rules must not depend on databases, frameworks, external APIs, or infrastructure.
- **Domain Driven Design**: the system evolves around business domains with clear ownership and independent evolution.
- **Separation of concerns** (backend): Controller (API communication) → Service (application logic) → Repository (data access) → Provider (external integrations). Direct Prisma/database usage inside controllers is prohibited once the backend exists.
- **Frontend/backend boundary**: the frontend must never access the database directly, call AI providers directly, or contain business rules. The backend must never expose database models directly or trust client input unchecked.
- **Monorepo package direction** (once `apps/`/`packages/` exist): `apps → packages → external libraries` only. Packages must never depend on applications.
- **Vendor abstraction is mandatory** for authentication (future: Clerk), storage (future: Supabase Storage), and AI providers (future: OpenAI, Claude, Gemini, Flux, Veo, Kling) — no application module may call these vendors directly; always go through an interface/abstraction layer (ADR-007, ADR-008, ADR-009).
- **API architecture**: versioned REST under `/api/v1` (ADR-010). Response contract: `{ "success": true, "data": {} }` or `{ "success": false, "error": { "code": "...", "message": "..." } }` ([Backend Architecture](./docs/architecture/010-backend-architecture.md)).
- **Database**: PostgreSQL via Prisma ORM only; schema changes require migrations; direct production schema modification is prohibited (ADR-006, [Database Architecture](./docs/architecture/012-database-architecture.md)). Phase 0 database scope was originally minimal (User model only); [ADR-018](./docs/architecture/social-ai-platform/027-data-model-scope-decision.md) (Accepted, v1.2) is the "requirements approved" event [Database Architecture §5](./docs/architecture/012-database-architecture.md) anticipated, and formally extends this to Account/Brand/ContentIdea/ContentDraft/CalendarEntry for the M1 Social AI MVP — see [M1 Implementation Status](./docs/development/020-m1-implementation-status.md). Any _further_ entity beyond ADR-018's approved list still requires the same approval discipline before implementation.
- Every addition must justify its business value, architectural impact, and maintenance cost — do not build unnecessary complexity ahead of approved requirements (ADR-014).

## 6. Engineering Standards

- TypeScript strict mode is mandatory once code exists. Avoid `any`, implicit assumptions, unsafe casting.
- Prefer meaningful names, small functions, clear structures; code must be understandable without added explanation.
- Avoid duplicate logic — shared functionality belongs in shared packages.
- Follow existing patterns and reuse existing components; do not add dependencies without justification; do not create placeholder business logic; do not bypass validation.
- Database: `snake_case` naming, UUID primary keys, `created_at`/`updated_at` on core entities ([Database Architecture](./docs/architecture/012-database-architecture.md)).

## 7. Security and Privacy Rules

From [Security Architecture](./docs/security/013-security-architecture.md) and [Threat Model](./docs/security/014-novalight-threat-model.md):

- Never commit secrets. All secrets come from environment variables — never source code, repositories, or documentation.
- Validate all external input (Zod once the backend exists); fail invalid input safely.
- Never log passwords, authentication tokens, API keys, or private user data.
- Apply least privilege; authorization is separate from authentication and must be centralized, explicit, testable, and auditable (RBAC — Platform Administrator / Organization Owner / Organization Member / Viewer, once implemented).
- Multi-tenant isolation is mandatory once organizations exist: a user must never access another organization's data, modify unauthorized resources, or bypass permission boundaries. This is rated **Critical** risk in the threat model.
- Never expose internal error details to clients; never use unrestricted CORS in production.
- Sensitive operations require authorization, validation, and audit capability (actor, action, resource, timestamp, result).
- AI providers must never receive unnecessary sensitive data (future AI features).
- Security review is required before: authentication changes, authorization changes, database changes, external integrations, sensitive features.

## 8. Testing and Quality Gates

No test suite, linter, or build tooling exists yet — do not invent or assume commands. Once tooling exists, per [Engineering Constitution §7](./docs/engineering/002-engineering-constitution.md) and [Development Workflow](./docs/development/015-development-workflow.md):

- Required levels: unit tests (utilities, services, business rules), integration tests (API behavior, database interaction), end-to-end tests (critical workflows).
- Quality gates before merge, sequential: **Lint → Type Check → Tests → Build Validation → Security Review**. A failed gate blocks merge.
- No numeric coverage threshold is defined anywhere in the documentation — do not invent one; flag this as an open item if asked.
- Frontend testing tools are only "recommended," not mandated: Vitest, React Testing Library, Playwright ([Frontend Architecture](./docs/architecture/011-frontend-architecture.md)).

## 9. Documentation Obligations

- Update documentation when an approved implementation changes documented behavior.
- New documentation follows the existing convention: `docs/<category>/<NNN>-<kebab-case-name>.md`, numbered sequentially across the whole `docs/` tree.
- Record major decisions as a new ADR in `docs/architecture/` (pattern: `docs/architecture/006-initial-architecture-decisions.md`), not in a `docs/decisions/` directory (which does not exist).
- Do not modify `docs/**/*.docx` files.

## 10. Git and Change Management

- Never commit directly to `main`; inspect the current branch before making changes.
- Use focused commits; do not mix unrelated changes; review `git diff` before finalizing.
- Never use destructive Git commands (`reset --hard`, `push --force`, `clean -fd`, history rewrites) without explicit user authorization.
- Do not auto-commit unless explicitly instructed.
- Recommended branch prefixes: `feature/`, `bugfix/`, `refactor/`, `docs/` ([Development Workflow §8](./docs/development/015-development-workflow.md)). Recommended commit format: `type(scope): description`.

## 11. Tool Usage Policy

- Prefer targeted file reads and searches over broad scans; do not re-read unchanged large files.
- Use read-only discovery commands (`git status --short`, `git diff --stat`, `git diff`, `git branch --show-current`) before and after changes.
- Detect the actual test/lint/build commands from repository configuration once it exists — never invent a command that isn't defined.
- Exclude generated/vendor directories (`node_modules`, `.git`, `dist`, `build`, `coverage`, `.next`, `.cache`, `venv`, `.venv`, `target`, `vendor`, `tmp`, `logs`) from broad searches.
- MCP/external tools: use only when they materially improve accuracy; never expose credentials; document any new external dependency.

## 12. Subagent Routing

See [.claude/agents/](./.claude/agents/) and [docs/ai-workspace/agent-governance.md](./docs/ai-workspace/agent-governance.md) for full definitions. Route by task type; do not run every agent for trivial changes — match effort to the risk table in §15.

| Task                                                      | Agent                                 |
| --------------------------------------------------------- | ------------------------------------- |
| Understand unfamiliar repo areas                          | `repository-mapper`                   |
| System/module design, boundaries, scalability             | `solution-architect`                  |
| Auth, authz, data protection, vulnerability review        | `security-reviewer`                   |
| REST contract, versioning, response-shape review          | `api-contract-reviewer`               |
| Schema, migration, multi-tenancy review                   | `data-architect`                      |
| Doc accuracy, link validity, routing-table consistency    | `documentation-reviewer`              |
| Cross-cutting risk / debt / gap surfacing                 | `risk-reviewer`                       |
| Final pre-merge gate once code exists                     | `quality-gate-reviewer`               |
| Visual asset creation (prompt only, not the image itself) | `visual-intelligence-prompt-engineer` |
| Presentation visuals                                      | `visual-intelligence-prompt-engineer` |
| Architecture diagrams                                     | `visual-intelligence-prompt-engineer` |
| Marketing graphics                                        | `visual-intelligence-prompt-engineer` |

`visual-intelligence-prompt-engineer` is a generative, not a review, agent — it is exempt from the reviewer-independence rule below but is bound by its own no-fabrication rule (see [docs/ai-workspace/agent-governance.md](./docs/ai-workspace/agent-governance.md)).

Reviewer independence: an agent that writes/plans a change must not be the sole approver of that same change (see [Claude Code Operating Model §5](./docs/engineering/003-claude-code-operating-model.md) and [agent-governance.md](./docs/ai-workspace/agent-governance.md)).

## 13. Skill Routing

See [.claude/skills/](./.claude/skills/) for full definitions.

| Situation                                                | Skill                       |
| -------------------------------------------------------- | --------------------------- |
| Starting work in an unfamiliar part of the repo          | `repository-analysis`       |
| Evaluating a structural/module/dependency change         | `architecture-review`       |
| Turning a requirement into an implementation-ready plan  | `feature-planning`          |
| Writing code/config against an approved plan             | `implementation`            |
| Reviewing a diff for correctness/architecture/security   | `code-review`               |
| Auth, data protection, or integration changes            | `security-review`           |
| Defining what to test for a change                       | `test-design`               |
| Creating or changing a REST endpoint                     | `api-review`                |
| Schema or migration changes                              | `database-change-review`    |
| Adding a third-party package                             | `dependency-review`         |
| Recording a major decision                               | `adr-authoring`             |
| Keeping docs in sync with reality                        | `documentation-maintenance` |
| Building a prompt for an external visual-generation tool | `visual-content-generation` |

## 14. Command Catalogue

See [.claude/commands/](./.claude/commands/) for full definitions.

| Command                | Purpose                                                             |
| ---------------------- | ------------------------------------------------------------------- |
| `/project-status`      | Summarize current phase, what exists vs. documented-but-not-built   |
| `/repo-map`            | Produce a current, evidence-based repository map                    |
| `/plan-feature`        | Produce an implementation-ready plan without touching source        |
| `/review-change`       | Review the current diff against architecture/security/quality rules |
| `/security-review`     | Run the security review checklist against a change                  |
| `/architecture-review` | Assess a proposed structural change against ADRs and C4 boundaries  |
| `/create-adr`          | Draft a new ADR in the established format                           |
| `/update-docs`         | Reconcile documentation with an approved implementation change      |
| `/verify-links`        | Check that all relative links in `docs/` and `CLAUDE.md` resolve    |
| `/workspace-audit`     | Score this Claude Code workspace's own maturity and report gaps     |

## 15. Escalation Rules

Stop and request explicit user approval before:

- Major architecture changes; schema-destructive migrations; authentication or authorization mechanism changes; encryption changes.
- Production infrastructure changes; new external vendors; new paid services; significant dependency replacements.
- Deletion of modules; changes affecting financial, personal, or sensitive data.
- Any destructive Git operation, or bypassing a quality gate.

### Risk-based routing matrix

| Change type                                |     Risk | Required workflow                                   |
| ------------------------------------------ | -------: | --------------------------------------------------- |
| Documentation typo/formatting              |      Low | Documentation review                                |
| Local UI adjustment (once frontend exists) |      Low | Implementation + targeted tests                     |
| New feature                                |   Medium | Planning + implementation + tests + review          |
| API contract change                        |     High | Architecture + API + tests + security review        |
| Database schema change                     |     High | Data review + migration review + rollback plan      |
| Authentication/authorization change        | Critical | Security + architecture + tests + explicit approval |
| Production infrastructure change           | Critical | DevOps + security + rollback + explicit approval    |

Full detail: [docs/ai-workspace/agent-governance.md](./docs/ai-workspace/agent-governance.md).

## 16. Definition of Done

A task is complete only when:

- The requirement is satisfied and matches documented scope (or a documented, approved deviation).
- Code follows the architecture rules in §5 and the conventions in §6.
- Tests are considered per §8 (once tooling exists).
- Security impact is reviewed per §7.
- Documentation is updated per §9.
- The Git diff has been reviewed and no destructive operation was taken without approval.
- Unresolved risks and open questions are explicitly reported to the user — not silently absorbed.
