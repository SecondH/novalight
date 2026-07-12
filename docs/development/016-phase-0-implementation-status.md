# Phase 0 Implementation Status

> Source: none (this document describes the repository's own current state, not a converted source document). Follows the standard `docs/<category>/<NNN>-<kebab-case-name>.md` convention — unlike `docs/ai-workspace/` and `docs/readiness/`, this is a normal, numbered project document since it describes the actual system, not a meta-assessment of the documentation.

## Purpose

Track what has actually been scaffolded for Phase 0 — Engineering Foundation, as distinct from what the architecture documents describe as the target. Update this document whenever the scaffold changes; do not let it drift out of sync with reality the way `docs/architecture/005-c4-model.md`'s aspirational paths were allowed to for the rest of Phase 0.

## What exists

```text
novalight/
├── apps/
│   ├── web/     Next.js app (ADR-003/004) — default starter page only, no product UI
│   └── api/     Express app (ADR-005) — health endpoint only, no business endpoints
├── packages/
│   ├── database/  Prisma + PostgreSQL (ADR-006) — schema.prisma has the Phase-0-scope User model only
│   ├── auth/      Interfaces only (ADR-007) — AuthProvider, AuthorizationProvider, AuditLogger; no Clerk or any concrete implementation
│   └── ai-core/   Interfaces only (ADR-009) — ModelProvider, PromptManager, AgentExecutor, Evaluator; no vendor SDK, no paid API calls
├── turbo.json, tsconfig.base.json, eslint.config.mjs, .prettierrc.json  — root tooling (ADR-001/002)
└── .github/workflows/ci.yml — install/lint/typecheck/test/build; no deploy step
```

`packages/ui`, `packages/utils`, and `packages/storage`, named in `docs/architecture/005-c4-model.md`'s target Level 2 container list, were **not** created in this pass — nothing in the current scaffold needs them yet, and creating empty/near-empty packages ahead of a real consumer would be exactly the kind of premature complexity ADR-014 warns against. Create them when an actual consumer needs them.

`services/` and `infrastructure/` top-level directories were requested in the implementation prompt that produced this scaffold but were deliberately **not** created — they aren't part of ADR-001's documented monorepo shape (`apps/`, `packages/`, `docs/` only), no standalone service exists beyond `apps/api`, and deployment is via managed platforms (Vercel/Railway/Supabase, ADR-012) rather than self-managed infrastructure-as-code. If a real service or IaC need arises later, create the directory then, backed by a dedicated ADR — not speculatively now.

## Naming discrepancy

`packages/ai-core` is named `packages/ai` in `docs/architecture/005-c4-model.md`. The implementation prompt for this scaffold explicitly requested `ai-core`; that name was used, but the two documents now disagree. Recommend a documentation-sync pass to reconcile one of the two names as canonical.

## Version discrepancy found during scaffolding

ADR-003 specifies Next.js 15. Running `create-next-app@latest` at scaffold time resolved to Next.js 16.x, since Next.js has released a new major version since the ADR was written. The scaffold was pinned back to Next.js 15.x to honor the accepted ADR rather than silently drifting to an undecided newer major version — see `.claude/memory/known-risks.md` for this tracked item. If the team wants Next.js 16, that requires a superseding ADR, not a silent version bump.

## What does not exist yet

No business logic, no real authentication flow, no real AI provider call, no deployed environment, no `packages/ui`/`packages/utils`/`packages/storage`, no CI/CD platform decision beyond the default described in `.github/workflows/ci.yml`'s own header comment. See `docs/readiness/development-entry-checklist.md` for the specific items still gating Phase 0 completion.

## Commands

Run from the repository root unless noted:

| Command                                                                             | Effect                                                                                               |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `npm install`                                                                       | Install all workspace dependencies                                                                   |
| `npm run dev`                                                                       | Run all apps in dev mode (Turborepo)                                                                 |
| `npm run build`                                                                     | Build all apps/packages (Turborepo)                                                                  |
| `npm run lint`                                                                      | Lint all apps/packages (Turborepo)                                                                   |
| `npm run typecheck`                                                                 | Type-check all apps/packages (Turborepo)                                                             |
| `npm run test`                                                                      | Run all tests (Turborepo)                                                                            |
| `npm run format`                                                                    | Format the repo with Prettier                                                                        |
| `npm run --workspace apps/api generate` _(run from `packages/database`, see below)_ | n/a — see next row                                                                                   |
| `npm run generate --workspace @novalight/database`                                  | Generate the Prisma client from `packages/database/prisma/schema.prisma`                             |
| `npm run migrate:dev --workspace @novalight/database`                               | Create/apply a local dev migration (requires `DATABASE_URL` — copy `packages/database/.env.example`) |

## Known limitations

- No database is provisioned; `packages/database` requires a real `DATABASE_URL` to generate/migrate against.
- No CI has actually run yet in this repository (no GitHub remote configured as of this writing) — `.github/workflows/ci.yml` is validated locally by running the same commands it invokes, not by a real CI execution.
- `apps/web`'s only page is the Next.js default starter — no NovaLight UI exists yet, intentionally.
