# NovaLight Documentation

This directory contains the NovaLight project documentation. All documents listed below were converted from the original Word source files under the same folders (kept unchanged) into clean, professional Markdown.

## Structure

```text
docs/
├── project/        Project governance and charter
├── engineering/     Engineering standards and Claude Code operating model
├── architecture/     System, container, backend, frontend, and database architecture; ADRs
├── product/         Product vision, requirements, and roadmap
├── security/         Security architecture, threat model, and production auth strategy
├── development/      Development lifecycle, workflow, and M1 planning/status
├── deployment/        Production/staging deployment planning (new at M1.5 — see note below)
├── operations/         Environment, secrets, and monitoring strategy (new at M1.5 — see note below)
├── ai-workspace/      Claude Code workspace architecture documentation (not part of the NNN-numbered project-document sequence — see note below)
├── readiness/         Point-in-time development-readiness assessments (also not part of the NNN-numbered sequence)
└── _source/          Conversion manifest and conversion report (traceability only)
```

`ai-workspace/` and `readiness/` are intentional exceptions to the `docs/<category>/<NNN>-<kebab-case-name>.md` numbering convention used everywhere else in this tree: they document the Claude Code workspace itself and point-in-time assessments of the documentation, not the NovaLight system being built, so they aren't part of the same sequentially-numbered set of authoritative project documents.

`docs/product/mvp-social-ai/` and `docs/architecture/social-ai-platform/` are a second, distinct kind of exception, per [ADR-015](./architecture/017-documentation-structure-for-product-verticals.md): they group a major product-vertical initiative (the Social AI MVP for SMB verticals) as a named subdirectory, with their own **domain-local** NNN numbering starting at `017` — independent of, and not unique against, the top-level flat sequence. Unlike `ai-workspace/`/`readiness/`, these directories _are_ part of the core NovaLight product-document set; they are just grouped rather than flattened. Always cite the full path, not just the number, when referencing a document inside them.

`docs/deployment/` and `docs/operations/` are new top-level categories added at M1.5 (2026-07-12), following the _standard flat NNN convention_ like every other substantive category (not a subdirectory exception, not unnumbered) — see [021-m1.5-production-foundation-plan.md](./deployment/021-m1.5-production-foundation-plan.md) §0 for why these earned new categories where an earlier, smaller "testing" question did not (folded into `docs/development/` instead — that precedent stands; this one is a genuinely different-sized, growing domain).

**Numbering note:** `docs/development/018-020` were briefly, incorrectly numbered `017-019` (colliding with `docs/architecture/017-...`) before being caught and corrected — see `.claude/memory/known-risks.md` "Correction: global doc-numbering collision" for the full account. `docs/development/` is a flat top-level category and does **not** have ADR-015's local-numbering exception; its numbers are part of the single global sequence like every category except the two documented exceptions above.

Each `.md` file has a same-named `.docx` original alongside it — the source Word files are preserved unchanged.

## Foundational / Mandatory Reading

Read these first, in order, before planning or implementing any change:

1. [Project Charter](./project/001-project-charter.md) — why NovaLight exists, Phase 0 scope
2. [Engineering Constitution](./engineering/002-engineering-constitution.md) — non-negotiable engineering rules
3. [Claude Code Operating Model](./engineering/003-claude-code-operating-model.md) — how Claude Code should work in this repository
4. [System Architecture](./architecture/004-system-architecture.md) — high-level architecture
5. [Product Vision](./product/007-product-vision.md) — product direction

## Project Governance

| Document                                            | Status             | Description                                          |
| --------------------------------------------------- | ------------------ | ---------------------------------------------------- |
| [Project Charter](./project/001-project-charter.md) | Initial Foundation | Vision, mission, Phase 0 scope, technology direction |

## Engineering

| Document                                                                        | Status              | Description                                                           |
| ------------------------------------------------------------------------------- | ------------------- | --------------------------------------------------------------------- |
| [Engineering Constitution](./engineering/002-engineering-constitution.md)       | Foundation Rulebook | Non-negotiable engineering principles and standards                   |
| [Claude Code Operating Model](./engineering/003-claude-code-operating-model.md) | Foundation Rule     | How Claude Code should operate as an engineering partner in this repo |

## Architecture

| Document                                                                                                                       | Status                  | Description                                                   |
| ------------------------------------------------------------------------------------------------------------------------------ | ----------------------- | ------------------------------------------------------------- |
| [System Architecture](./architecture/004-system-architecture.md)                                                               | Foundation Architecture | High-level system architecture and components                 |
| [C4 Architecture Model](./architecture/005-c4-model.md)                                                                        | Foundation Architecture | Context, container, component, and code-level views           |
| [Initial Architecture Decisions (ADR-001 – ADR-014)](./architecture/006-initial-architecture-decisions.md)                     | Accepted                | Foundational architecture decision records                    |
| [Backend Architecture](./architecture/010-backend-architecture.md)                                                             | Foundation Architecture | Backend layering, modules, API and error standards            |
| [Frontend Architecture](./architecture/011-frontend-architecture.md)                                                           | Foundation Architecture | Frontend feature-based architecture and standards             |
| [Database Architecture](./architecture/012-database-architecture.md)                                                           | Foundation Architecture | Schema, multi-tenancy, and data governance principles         |
| [ADR-015 — Documentation Structure for Product Verticals](./architecture/017-documentation-structure-for-product-verticals.md) | Accepted                | Governs the subdirectory + local-numbering pattern used below |

### Social AI Platform Architecture (`architecture/social-ai-platform/`)

| Document                                                                                                        | Status          | Description                                                                                                                 |
| --------------------------------------------------------------------------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------- |
| [017 — MVP Pivot Decision (ADR-016)](./architecture/social-ai-platform/017-mvp-pivot-decision.md)               | Accepted        | Strategic decision to sequence a vertical MVP ahead of general SaaS platform capabilities                                   |
| [018 — SaaS Architecture](./architecture/social-ai-platform/018-saas-architecture.md)                           | Proposed        | Placement of the MVP within existing containers                                                                             |
| [019 — AI Agent Architecture (ADR-017)](./architecture/social-ai-platform/019-ai-agent-architecture.md)         | Accepted        | Multi-agent pattern on top of `packages/ai-core`                                                                            |
| [020 — AI Agent Specifications](./architecture/social-ai-platform/020-ai-agent-specifications.md)               | Proposed        | Brand Strategist, Content Planner, Copywriter, Visual Prompt Engineer, Analytics agents                                     |
| [021 — Knowledge Model](./architecture/social-ai-platform/021-knowledge-model.md)                               | Proposed        | Brand/content conceptual data model                                                                                         |
| [022 — Brand Intelligence Layer](./architecture/social-ai-platform/022-brand-intelligence-layer.md)             | Proposed        | Brand profile learning loop                                                                                                 |
| [023 — Content Generation Pipeline](./architecture/social-ai-platform/023-content-generation-pipeline.md)       | Proposed        | Agent composition sequence                                                                                                  |
| [024 — Image Generation Integration](./architecture/social-ai-platform/024-image-generation-integration.md)     | Proposed        | Visual prompt vs. image rendering boundary                                                                                  |
| [025 — Analytics Architecture](./architecture/social-ai-platform/025-analytics-architecture.md)                 | Proposed        | Performance data intake and recommendation flow                                                                             |
| [026 — Future Social API Integration](./architecture/social-ai-platform/026-future-social-api-integration.md)   | Proposed        | Deferred extension point; not built                                                                                         |
| [027 — Data Model Scope Decision (ADR-018)](./architecture/social-ai-platform/027-data-model-scope-decision.md) | Accepted (v1.2) | Target entities beyond Phase 0's `User`-only constraint; amended to add `Account`, then to correct ownership-chain notation |
| [028 — M1 Technical Design](./architecture/social-ai-platform/028-m1-technical-design.md)                       | Proposed        | Data model, security model, backend/frontend architecture, AI foundation for M1                                             |
| [ADR-019 — CI/CD Platform Decision](./architecture/024-cicd-platform-decision.md)                               | Accepted (v1.1) | GitHub Actions finalized; no live repository exists yet -- separate, still-open item                                        |
| [ADR-020 — Clerk Development Integration](./architecture/026-clerk-development-integration-decision.md)         | Proposed        | Retroactive authorization for clerk-auth-provider.ts (written, tested, **not activated**)                                   |

## Product

| Document                                                   | Status                      | Description                                      |
| ---------------------------------------------------------- | --------------------------- | ------------------------------------------------ |
| [Product Vision](./product/007-product-vision.md)          | Product Foundation          | Vision, mission, target users, value proposition |
| [Product Requirement Document (PRD)](./product/008-prd.md) | Product Foundation          | Product modules, MVP scope, user journeys        |
| [Product Roadmap](./product/009-roadmap.md)                | Product Planning Foundation | Phase 0 – Phase 5 evolution strategy             |

### MVP Social AI Product Documentation (`product/mvp-social-ai/`)

| Document                                                                                      | Status   | Description                                                              |
| --------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| [017 — Product Vision](./product/mvp-social-ai/017-product-vision.md)                         | Proposed | Vertical-first entry point; does not replace 007                         |
| [018 — Target Customer Definition](./product/mvp-social-ai/018-target-customer-definition.md) | Proposed | Five SMB verticals                                                       |
| [019 — Personas](./product/mvp-social-ai/019-personas.md)                                     | Proposed | Owner-Operator, Delegated Content Staff; RBAC naming explicitly deferred |
| [020 — User Journeys](./product/mvp-social-ai/020-user-journeys.md)                           | Proposed | Brand setup through gradual automation                                   |
| [021 — MVP Scope](./product/mvp-social-ai/021-mvp-scope.md)                                   | Proposed | Included/Excluded per stage                                              |
| [022 — Feature Roadmap](./product/mvp-social-ai/022-feature-roadmap.md)                       | Proposed | Feature-level detail per stage                                           |
| [023 — Acceptance Criteria](./product/mvp-social-ai/023-acceptance-criteria.md)               | Proposed | Stage 1 testable criteria                                                |
| [024 — Pricing Model](./product/mvp-social-ai/024-pricing-model.md)                           | Proposed | Illustrative, not committed                                              |
| [025 — Competitive Positioning](./product/mvp-social-ai/025-competitive-positioning.md)       | Proposed | vs. scheduling tools, generic AI tools, agencies                         |
| [026 — MVP Roadmap](./product/mvp-social-ai/026-mvp-roadmap.md)                               | Proposed | MVP Track Stage 1–5; avoids deepening the existing Phase-naming conflict |
| [027 — Development Plan](./product/mvp-social-ai/027-development-plan.md)                     | Proposed | Backlog, milestones, sprint plan, testing, deployment                    |

## Security

| Document                                                                                   | Status                  | Description                                                                       |
| ------------------------------------------------------------------------------------------ | ----------------------- | --------------------------------------------------------------------------------- |
| [Security Architecture](./security/013-security-architecture.md)                           | Foundation Architecture | Identity, authorization, secrets, and API security requirements                   |
| [Threat Model](./security/014-novalight-threat-model.md)                                   | Security Foundation     | STRIDE-based threat analysis and risk matrix                                      |
| [Authentication Production Strategy](./security/022-authentication-production-strategy.md) | Proposed                | Clerk confirmed (ADR-007); production integration approach; does not resolve RBAC |

## Development

| Document                                                                            | Status                         | Description                                                                 |
| ----------------------------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------- |
| [Development Workflow](./development/015-development-workflow.md)                   | Engineering Process Foundation | Development lifecycle, branching, review, and release process               |
| [MVP M1 — SaaS Core Foundation: Engineering Plan](./development/018-mvp-m1-plan.md) | Proposed                       | Deliverables, sequencing, exit criteria for M1; gated on ADR-018 acceptance |
| [MVP M1 — Test Strategy](./development/019-mvp-m1-test-strategy.md)                 | Proposed                       | Unit/integration/ownership-isolation/API/security/e2e tests specific to M1  |
| [M1 Implementation Status](./development/020-m1-implementation-status.md)           | Implemented                    | What actually exists in code for M1, as distinct from the design            |

## Deployment

| Document                                                                                 | Status   | Description                                                                                           |
| ---------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| [M1.5 — Production Foundation Plan](./deployment/021-m1.5-production-foundation-plan.md) | Proposed | Current-state review, architecture recommendation, implementation sequence, production readiness gate |

## Operations

| Document                                                                                     | Status   | Description                                                                                                                                                         |
| -------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Environment Strategy](./operations/023-environment-strategy.md)                             | Proposed | Dev/staging/production topology, secrets management, deployment triggers                                                                                            |
| [M1.6 Operational Activation Report](./operations/025-m1.6-operational-activation-report.md) | Complete | Local dev environment genuinely activated (Docker Postgres, real migration, real tests); repo hosting/CI-CD deferred per correction; M2 not ready                   |
| [M1.7 Delivery Foundation Report](./operations/027-m1.7-delivery-foundation-report.md)       | Complete | CI/CD platform finalized (ADR-019 Accepted), CI validation pipeline enhanced with real DB tests, CORS environment-aware; no live repository yet; M2 still not ready |

## Claude Code Workspace

| Document                                                                         | Status                   | Description                                                            |
| -------------------------------------------------------------------------------- | ------------------------ | ---------------------------------------------------------------------- |
| [Workspace Architecture](./ai-workspace/claude-workspace-architecture.md)        | Workspace Infrastructure | Components, instruction flow, precedence, routing/review/hook model    |
| [Operating Model](./ai-workspace/claude-operating-model.md)                      | Workspace Infrastructure | Standard task lifecycle mapped to workspace components                 |
| [Agent Governance](./ai-workspace/agent-governance.md)                           | Workspace Infrastructure | Agent ownership, reviewer independence, escalation, risk-based routing |
| [Workspace Maintenance Runbook](./ai-workspace/workspace-maintenance-runbook.md) | Workspace Infrastructure | How to add/test skills, agents, commands, and hooks                    |

## Development Readiness

| Document                                                                                        | Status                   | Description                                                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Development Documentation Gap Analysis](./readiness/development-documentation-gap-analysis.md) | Point-in-Time Assessment | Documentation maturity scoring and gap classification                                                                                                                                                          |
| [Development Readiness Report](./readiness/development-readiness-report.md)                     | Point-in-Time Assessment | Executive decision on Phase 0 development readiness                                                                                                                                                            |
| [Development Entry Checklist](./readiness/development-entry-checklist.md)                       | Point-in-Time Assessment | Gate checklist before writing first production code                                                                                                                                                            |
| [Architecture Readiness Checklist](./readiness/architecture-readiness-checklist.md)             | Point-in-Time Assessment | Architecture-specific readiness gate                                                                                                                                                                           |
| [Social AI MVP Development Readiness](./readiness/social-ai-mvp-development-readiness.md)       | Point-in-Time Assessment | Readiness review specific to the Social AI MVP pivot                                                                                                                                                           |
| [Social AI MVP Development Approval Gate](./readiness/mvp-development-approval.md)              | Point-in-Time Assessment | Approved With Conditions — final go/no-go gate before Stage 1 implementation                                                                                                                                   |
| [028 — M2 Development Entry Gate](./readiness/028-m2-development-entry-gate.md)                 | Point-in-Time Assessment | GitHub Delivery Activation Review — found and fixed a real CI failure (fix uncommitted); M2 **not** approved to start; numbering deviates from this directory's unnumbered convention, see the file's own note |

## Source Traceability

- [`_source/document-conversion-manifest.md`](./_source/document-conversion-manifest.md) — source-to-Markdown mapping table
- [`_source/word-to-markdown-conversion-report.md`](./_source/word-to-markdown-conversion-report.md) — full conversion report, normalization actions, and open items for human review
