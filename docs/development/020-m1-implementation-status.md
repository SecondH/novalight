# M1 Implementation Status

> Not a converted source document. Mirrors [016-phase-0-implementation-status.md](./016-phase-0-implementation-status.md)'s role: tracks what has actually been built for M1 — SaaS Core Foundation, as distinct from what [028-m1-technical-design.md](../architecture/social-ai-platform/028-m1-technical-design.md) describes as the design. Update whenever the implementation changes.

## Status

Implemented 2026-07-12, gated on [ADR-018 v1.2](../architecture/social-ai-platform/027-data-model-scope-decision.md) (Accepted 2026-07-11) and [docs/readiness/mvp-development-approval.md](../readiness/mvp-development-approval.md) (Approved With Conditions, Condition 1 satisfied). Reviewed by five independent agents (`solution-architect`, `security-reviewer`, `api-contract-reviewer`, `data-architect`, `quality-gate-reviewer`) — zero Critical/High/Blocking findings; two real Medium-severity bugs found and fixed same-session (see `.claude/memory/known-risks.md` "M1 implementation — code-level gate findings").

## What exists

```text
packages/database/
├── prisma/schema.prisma       User (Phase 0) + Account/Brand/ContentIdea/ContentDraft/CalendarEntry (M1)
└── prisma/migrations/20260712000000_m1_saas_core_foundation/  Generated offline (no live DB in this environment), NOT applied
apps/api/src/
├── repositories/               5 files, every method account_id-scoped (or owner_user_id for accounts)
├── modules/{accounts,brands,content}/  controllers, services, routes, validators
├── ai/                         FakeModelProvider, StaticPromptManager, SimpleAgentExecutor, 4 agents (test/fake only, no vendor)
├── auth/in-memory-auth-provider.ts     dev/test AuthProvider stand-in for Clerk
├── middlewares/{authentication,rate-limit,validate-body}.ts
├── audit/pino-audit-logger.ts  concrete AuditLogger, logs via existing Pino logger
└── services/account-context.service.ts  single source of truth for resolveAccountForUser
apps/web/src/
├── features/brand-setup/       BrandSetupForm (onboarding skeleton)
├── app/(onboarding)/brand-setup/page.tsx
└── lib/api-client.ts           centralized fetch wrapper
```

## What does not exist yet

- No live database is provisioned anywhere in this environment — the migration is generated and validated offline (`prisma validate`/`prisma migrate diff`) but never applied; `apps/api/src/ownership-isolation.test.ts`'s 3 DB-backed integration tests are gated behind `RUN_DB_INTEGRATION_TESTS=1` (default skipped) for this reason, same limitation already documented in [016-phase-0-implementation-status.md](./016-phase-0-implementation-status.md).
- No real AI vendor is wired in (`FakeModelProvider` only, per explicit instruction).
- No real authentication vendor is wired in (`InMemoryAuthProvider` only — Clerk integration remains future work per ADR-007).
- `ApprovalHistory`/`PerformanceRecord` (MVP Track Stage 2/4 entities) — correctly not created, per ADR-018's staged introduction.
- MVP Track Stage 3+ (multi-user, publishing automation) — blocked on the still-open RBAC role-taxonomy conflict.
- CI has not actually executed this code in GitHub Actions (no verified remote push) — validated locally by running the same lint/typecheck/test/build sequence `.github/workflows/ci.yml` invokes.

## Commands

Same as [016-phase-0-implementation-status.md](./016-phase-0-implementation-status.md)'s table, plus:

| Command                                                                                  | Effect                                                                        |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `RUN_DB_INTEGRATION_TESTS=1 DATABASE_URL=<real> npm run test --workspace=@novalight/api` | Run the 3 gated ownership-isolation integration tests against a real Postgres |
| `DATABASE_URL=<real> npm run migrate:dev --workspace=@novalight/database`                | Apply the M1 migration once a real database exists                            |

## Known limitations

- Everything under "What does not exist yet" above.
- `AccountsService.createAccount`'s check-then-create is now backed by a DB-level `@unique` constraint (fixed during the code-level gate) — the application-layer check remains only for a friendlier error message on the common (non-race) path.
