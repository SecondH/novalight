# NovaLight Development Documentation Gap Analysis

> Produced by the Development Readiness Board assessment (Phase 0 — Engineering Foundation). Path note: this document and its companions in `docs/readiness/` deliberately do not follow the `docs/<category>/<NNN>-<kebab-case-name>.md` numbering convention used by project documentation — like `docs/ai-workspace/`, this is a point-in-time assessment artifact about the documentation, not a piece of the documented system itself. See `docs/README.md` for the same exception applied to `docs/ai-workspace/`.

## Executive Summary

NovaLight's documentation is unusually mature for a pre-code repository: 15 converted source documents plus `CLAUDE.md` give consistent, cross-referenced coverage of architecture, security, and engineering process, backed by 14 accepted ADRs. Independent specialist review (four dedicated subagents: `solution-architect`, `security-reviewer`, `data-architect`, `api-contract-reviewer`, plus a `documentation-reviewer` integrity sweep and a `risk-reviewer` cross-cutting pass) scored Architecture, Security, Data, and API/Integration domains between 5/10 and 7/10 — Adequate to Professional.

The weighted composite score (5.3/10 — see below) looks more cautionary than the evidence actually supports, because four heavily-weighted domains (Business Requirements, Functional Requirements, UX, AI Architecture) score low **by design**, not by neglect: Phase 0 is explicitly an engineering-foundation phase that excludes business logic, AI features, and customer-facing UX (`docs/project/001-project-charter.md` §5). Documenting those domains in depth right now would mean inventing requirements for features not yet approved — a violation of this project's own no-speculation principle (ADR-014, `CLAUDE.md` §3 rule 3).

**The genuine findings are three specific, narrow gaps** — none of which can be closed by writing a document, because each is an **undecided fact**, not an **undocumented existing decision**:

1. A newly discovered RBAC role-taxonomy conflict between `docs/product/008-prd.md` and `docs/security/013-security-architecture.md`.
2. No CI/CD platform or pipeline-automation decision, despite "CI/CD foundation" being an explicit Phase 0 deliverable.
3. No named documentation ownership/approval role.

All three require a human (or team) decision. Authoring a document to paper over an undecided fact would itself violate this project's evidence-based documentation standard — so Phase 5 of this assessment creates **zero new speculative project-domain documents**, and instead names the decisions explicitly in the readiness package below.

## Documentation Inventory

Every document under `docs/` plus `CLAUDE.md`, read directly (not inferred from filename). "Authority" distinguishes documents that are the source of truth for a topic from ones that are reference/point-in-time material only.

### Governance & Process

| File path                                             | Document type                       | Purpose                                                 | Status                                                                                                | Authority level                                                 | Dependencies        | Development importance |
| ----------------------------------------------------- | ----------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------- | ---------------------- |
| `CLAUDE.md`                                           | Governance / operating instructions | Governs Claude Code behavior in this repo               | Complete                                                                                              | Source of truth (behavior; defers to `docs/` for project facts) | All of `docs/`      | Critical               |
| `docs/README.md`                                      | Documentation index                 | Navigation/routing across all documents                 | Complete (was missing `ai-workspace/`; fixed this session)                                            | Reference                                                       | All docs            | Important              |
| `docs/project/001-project-charter.md`                 | Vision / charter                    | Why NovaLight exists; Phase 0 scope (included/excluded) | Complete                                                                                              | Source of truth for phase scope                                 | None (foundational) | Critical               |
| `docs/engineering/002-engineering-constitution.md`    | Engineering standards               | Non-negotiable engineering principles                   | Complete                                                                                              | Source of truth                                                 | `001`               | Critical               |
| `docs/engineering/003-claude-code-operating-model.md` | AI operating model                  | How Claude Code should operate here                     | Complete (one stale cross-reference to a nonexistent path)                                            | Source of truth (extended in practice by `CLAUDE.md`)           | `002`               | Critical               |
| `docs/development/015-development-workflow.md`        | Process                             | Dev lifecycle, branching, review, release               | Partial — no CI/CD platform named, no documentation-ownership role named, references three dead paths | Source of truth for process                                     | `002`, `003`        | Critical               |

### Architecture

| File path                                                 | Document type           | Purpose                                                  | Status                                                                                                                    | Authority level                                  | Dependencies | Development importance |
| --------------------------------------------------------- | ----------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------ | ---------------------- |
| `docs/architecture/004-system-architecture.md`            | Architecture            | High-level system architecture                           | Complete                                                                                                                  | Source of truth                                  | `001`, `006` | Critical               |
| `docs/architecture/005-c4-model.md`                       | Architecture (C4)       | Context/container/component/code views                   | Complete (diagrams are ASCII sketches only — polish gap, not a completeness gap)                                          | Source of truth                                  | `004`        | Critical               |
| `docs/architecture/006-initial-architecture-decisions.md` | ADRs                    | 14 foundational architecture decisions                   | Complete                                                                                                                  | Source of truth (constraint, per `CLAUDE.md` §5) | `001`        | Critical               |
| `docs/architecture/010-backend-architecture.md`           | Architecture (backend)  | Layering, modules, API/error standards                   | Complete (§15–23 headings were reconstructed by the docx→md conversion — flagged for human spot-check, not a content gap) | Source of truth                                  | `004`, `006` | Critical               |
| `docs/architecture/011-frontend-architecture.md`          | Architecture (frontend) | Feature-based frontend architecture/standards            | Complete (frontend test tooling stated more softly — "recommended" — than backend's firmer commitment)                    | Source of truth                                  | `004`, `006` | Critical               |
| `docs/architecture/012-database-architecture.md`          | Architecture (data)     | Schema conventions, multi-tenancy, governance principles | Complete (backup/recovery and retention explicitly self-flagged as deferred to "before production launch")                | Source of truth                                  | `006`        | Critical               |

### Product

| File path                            | Document type        | Purpose                                              | Status                                                                                                       | Authority level                                                                        | Dependencies | Development importance                                                                                |
| ------------------------------------ | -------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------- |
| `docs/product/007-product-vision.md` | Product vision       | Vision, mission, target users, value proposition     | Complete                                                                                                     | Source of truth for product direction (conflicts with `009` on Phase 1–5 naming)       | `001`        | Important (Optional for the Phase 0 coding milestone itself, since Phase 0 excludes product features) |
| `docs/product/008-prd.md`            | Product requirements | Modules, MVP scope, user journeys, future user roles | Partial — RBAC role list conflicts with `013`                                                                | Source of truth for product scope; **not** authoritative for RBAC roles (see conflict) | `007`        | Important                                                                                             |
| `docs/product/009-roadmap.md`        | Roadmap              | Phase 0–5 evolution strategy                         | Partial — Phase 1–5 naming conflicts with `004`/`007`; explicitly self-described as "directional," not fixed | Reference (directional)                                                                | `007`        | Important                                                                                             |

### Security

| File path                                     | Document type         | Purpose                                                     | Status                                                                                                                      | Authority level                         | Dependencies | Development importance |
| --------------------------------------------- | --------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------------ | ---------------------- |
| `docs/security/013-security-architecture.md`  | Security architecture | Identity, authorization, secrets, API security requirements | Partial — RBAC role list conflicts with `008`; compliance requirements (GDPR/SOC2/etc.) entirely absent                     | Source of truth for security principles | `004`, `006` | Critical               |
| `docs/security/014-novalight-threat-model.md` | Threat model          | STRIDE analysis, risk matrix, pre-release checklist         | Complete (§8 subsection headings were promoted by the docx→md conversion — flagged for human spot-check, not a content gap) | Source of truth                         | `013`        | Critical               |

### Traceability & Workspace (reference material, not project-domain documentation)

| File path                                                  | Document type            | Purpose                                                | Status   | Authority level                           | Dependencies     | Development importance                                             |
| ---------------------------------------------------------- | ------------------------ | ------------------------------------------------------ | -------- | ----------------------------------------- | ---------------- | ------------------------------------------------------------------ |
| `docs/_source/document-conversion-manifest.md`             | Traceability             | Source `.docx` → `.md` mapping                         | Complete | Reference                                 | None             | Optional                                                           |
| `docs/_source/word-to-markdown-conversion-report.md`       | Traceability             | Conversion report, normalization actions, open items   | Complete | Reference                                 | None             | Optional (source of several tracked risks)                         |
| `docs/ai-workspace/claude-workspace-architecture.md`       | Workspace infrastructure | `.claude/` component map and instruction flow          | Complete | Reference (workspace, not project domain) | `CLAUDE.md`      | Important for Claude Code operation; Optional for human developers |
| `docs/ai-workspace/claude-operating-model.md`              | Workspace infrastructure | Standard task lifecycle mapped to workspace components | Complete | Reference                                 | `CLAUDE.md`      | Important / Optional (as above)                                    |
| `docs/ai-workspace/agent-governance.md`                    | Workspace infrastructure | Agent ownership, reviewer independence, risk routing   | Complete | Reference                                 | `CLAUDE.md`      | Important / Optional (as above)                                    |
| `docs/ai-workspace/workspace-maintenance-runbook.md`       | Workspace infrastructure | How to add/test skills, agents, commands, hooks        | Complete | Reference                                 | `CLAUDE.md`      | Important / Optional (as above)                                    |
| `docs/readiness/development-documentation-gap-analysis.md` | Assessment               | This document                                          | Complete | Point-in-time reference                   | All of the above | Important                                                          |
| `docs/readiness/development-readiness-report.md`           | Assessment               | Executive readiness decision                           | Complete | Point-in-time reference                   | This document    | Important                                                          |
| `docs/readiness/development-entry-checklist.md`            | Assessment               | Actionable pre-coding gate                             | Complete | Point-in-time reference                   | This document    | Important                                                          |
| `docs/readiness/architecture-readiness-checklist.md`       | Assessment               | Architecture-specific readiness gate                   | Complete | Point-in-time reference                   | This document    | Important                                                          |

**Filenames were not trusted as a proxy for maturity** — every "Status" and "Authority" judgment above is backed by content actually read (directly, or via the four specialist subagent reviews and the documentation-integrity sweep), not inferred from a document's title.

## Current Readiness Score

| Domain                     | Weight | Score /10 | Band         |
| -------------------------- | -----: | --------: | ------------ |
| Product Definition         |    15% |         7 | Professional |
| Business Requirements      |    10% |         3 | Initial      |
| Functional Requirements    |    10% |         3 | Initial      |
| Architecture               |    15% |         7 | Professional |
| Data Design                |    10% |         5 | Adequate     |
| Security Design            |    10% |         7 | Professional |
| API and Integration Design |    10% |         6 | Adequate     |
| UX/Product Experience      |     5% |         3 | Initial      |
| Testing Strategy           |     5% |         6 | Adequate     |
| DevOps/Operations          |     5% |         3 | Initial      |
| AI Architecture            |     5% |         3 | Initial      |

**Overall Documentation Readiness Score: 5.3 / 10 (Adequate)**

Weighted calculation: (0.15×7) + (0.10×3) + (0.10×3) + (0.15×7) + (0.10×5) + (0.10×7) + (0.10×6) + (0.05×3) + (0.05×6) + (0.05×3) + (0.05×3) = 5.25, rounded to 5.3.

**Read this score in context, not in isolation.** Four of the five lowest-scoring domains (Business Requirements, Functional Requirements, UX, AI Architecture — 15% of total weight combined) are low because Phase 0 explicitly defers them, not because they were neglected. A composite score computed against a generic enterprise-SaaS rubric will always understate readiness for a project that deliberately scope-gates documentation depth to what's currently approved for implementation (ADR-013, ADR-014). Treat the per-domain scores and their classification (below) as the decision-relevant signal, not the single composite number.

## Critical Missing Documents

**None.** Every domain that scored below Adequate does so because the underlying requirements are genuinely undecided or explicitly out of Phase 0 scope — not because an existing decision went undocumented. Writing a document to fill any of these gaps right now would mean inventing the missing decision, which this assessment declines to do. See "Development Blocking Issues" for the three items that must instead be resolved by a human decision.

## Important Missing Documents

**None identified as safely creatable without fabricating a decision.** One item is worth flagging for a lightweight human confirmation rather than authored content: the Testing Strategy domain (6/10) has a firmer backend tooling commitment (`docs/architecture/010-backend-architecture.md` names Jest/Supertest directly) than frontend (`docs/architecture/011-frontend-architecture.md` calls Vitest/React Testing Library/Playwright "recommended tools," softer language) — given "Testing foundation" is an explicit Phase 0 deliverable (`docs/project/001-project-charter.md` §5), formalizing the frontend tooling commitment at the same confidence level as backend (via a short ADR addendum, once a human confirms the choice) would raise this domain's score without requiring new invented content.

## Optional Improvements

- Two content-ambiguity items flagged by the original docx→md conversion remain unreviewed by a human: reconstructed headings in `docs/architecture/010-backend-architecture.md` §15–23, and promoted subsections in `docs/security/014-novalight-threat-model.md` §8 (tracked in `.claude/memory/known-risks.md`).
- `docs/README.md` did not list `docs/ai-workspace/` at all despite `CLAUDE.md` routing to it — this is a mechanical completeness fix (not a content decision) and has been corrected as part of this assessment.
- No rendered C4/architecture diagrams exist (only ASCII sketches) — a visual polish item, not a documentation-completeness gap; the `visual-intelligence-prompt-engineer` agent created in this workspace can produce diagram-generation prompts for this if wanted.

## Development Blocking Issues

These block **completing** Phase 0 as chartered — none block **starting** Phase 0 scaffolding/tooling work, since the tech-stack, module-boundary, and abstraction-interface decisions needed for that are already fully documented (14 accepted ADRs).

| Issue                                                                              | Blocks                                                                                                         | Cannot be resolved by                                                    | Must be resolved by                                                                                                 |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| RBAC role-taxonomy conflict (`008-prd.md` §6 vs `013-security-architecture.md` §7) | Any authorization/RBAC-touching implementation                                                                 | Authoring a document that picks a side                                   | A human/team decision reconciling the two role lists into one canonical taxonomy (ADR or PRD/security addendum)     |
| No CI/CD platform or pipeline-automation decision                                  | Completing the chartered "CI/CD foundation" Phase 0 deliverable                                                | Authoring a document naming a platform without a real decision behind it | A human/team decision selecting a CI platform and mapping the documented quality gates to it (new ADR)              |
| No documentation ownership/approval role                                           | Completing Phase 0's governance foundation; accountable resolution of future conflicts like the RBAC one above | Authoring a document that assigns a role without authority to do so      | A human decision naming an owner/approver (person, role, or team) in `docs/development/015-development-workflow.md` |

Carried-forward, previously-tracked, non-blocking risks (unchanged status, re-verified during this assessment): the Phase 1–5 roadmap naming conflict, dead documentation paths (`docs/decisions/`, `docs/api/`, `docs/engineering/technical-debt.md`), the deferred database recovery/backup strategy, and the absence of a numeric test-coverage threshold. Full detail in `.claude/memory/known-risks.md`.

## Recommended Documentation Roadmap

1. **Before any RBAC/authorization code is written**: resolve the role-taxonomy conflict (human decision).
2. **Before Phase 0's CI/CD foundation deliverable is considered complete**: select a CI platform and author the mapping ADR (human decision, then a short ADR — the ADR itself is not speculative once the decision exists).
3. **Before Phase 0's governance foundation is considered complete**: name a documentation owner/approver (human decision, one paragraph added to `015-development-workflow.md`).
4. **At the Phase 0 → Phase 1 transition**: reconcile the Phase 1–5 roadmap naming conflict; this is the point at which the ambiguity stops being harmless.
5. **Before any production database is provisioned**: author the recovery/backup strategy (already self-flagged by `012-database-architecture.md`).
6. **As Phase 1+ capabilities are actually approved for implementation** (not before): author functional requirements, detailed personas, and AI product strategy for each capability as it comes into scope — writing these now would be speculative.

## Decision

**Conditionally Ready.**

Phase 0's _first_ development milestone — monorepo scaffolding, tooling setup, abstraction-interface stubs for auth/storage/AI, and the minimal `User` database model — is backed by complete, non-conflicting documentation and can begin immediately. Phase 0 as a _whole_, however, has three specific, named conditions (above) that must be resolved by human decision before its own chartered deliverables (CI/CD foundation, governance foundation, and any RBAC-adjacent work) can be considered complete. See `docs/readiness/development-readiness-report.md` for the full decision rationale and `docs/readiness/development-entry-checklist.md` for the actionable gate.
