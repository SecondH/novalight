# Active Decisions

Full ADR content lives in [docs/architecture/006-initial-architecture-decisions.md](../../docs/architecture/006-initial-architecture-decisions.md). This file is an index only — do not duplicate ADR bodies here; update this index when ADRs are added, superseded, or their status changes.

| ADR     | Title                                                                                                                  | Status   |
| ------- | ---------------------------------------------------------------------------------------------------------------------- | -------- |
| ADR-001 | Monorepo Architecture (Turborepo)                                                                                      | Accepted |
| ADR-002 | Turborepo Build System                                                                                                 | Accepted |
| ADR-003 | Frontend Framework Selection (Next.js 15, React 19, TypeScript)                                                        | Accepted |
| ADR-004 | Frontend Styling System (TailwindCSS, shadcn/ui)                                                                       | Accepted |
| ADR-005 | Backend Architecture (Node.js, Express, TypeScript, Clean Architecture)                                                | Accepted |
| ADR-006 | Database Selection (PostgreSQL, Prisma ORM)                                                                            | Accepted |
| ADR-007 | Authentication Architecture (provider abstraction; future: Clerk)                                                      | Accepted |
| ADR-008 | Storage Architecture (abstraction; future: Supabase Storage)                                                           | Accepted |
| ADR-009 | AI Integration Architecture (provider abstraction, Strategy Pattern)                                                   | Accepted |
| ADR-010 | API Architecture (versioned REST, `/api/v1`)                                                                           | Accepted |
| ADR-011 | Security Architecture (Secure-by-Design)                                                                               | Accepted |
| ADR-012 | Deployment Strategy (Vercel / Railway / Supabase PostgreSQL)                                                           | Accepted |
| ADR-013 | Documentation Driven Development                                                                                       | Accepted |
| ADR-014 | Future Scalability Strategy (support mobile, workers, AI agents, multi-tenant SaaS without premature over-engineering) | Accepted |

## ADR maintenance rule

Per [006 §"ADR Maintenance Rule"](../../docs/architecture/006-initial-architecture-decisions.md): when a major architectural decision changes, create `ADR-XXX-new-decision.md` documenting context, alternatives, decision, and consequences. Do not edit an existing accepted ADR to change its decision — supersede it.

## Open decisions not yet recorded as ADRs

- Phase 1–5 roadmap naming reconciliation (see [[known-risks]]) — no ADR exists; a Product Decision Record or ADR is called for by [Roadmap governance](../../docs/product/009-roadmap.md).
- Whether to create `docs/decisions/` and `docs/api/` or update the documents that reference them (see [[known-risks]]).
- Database recovery/backup strategy (see [[known-risks]]) — required "before production launch," not yet authored.
- RBAC role taxonomy reconciliation between `docs/product/008-prd.md` and `docs/security/013-security-architecture.md` (see [[known-risks]]) — blocking for RBAC-touching work.
- CI/CD platform selection and gate-to-automation mapping (see [[known-risks]]) — blocking for completing Phase 0's "CI/CD foundation" deliverable.
- Documentation ownership/approval role (see [[known-risks]]) — blocking for completing Phase 0's governance deliverable.
