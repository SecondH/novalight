# Environment Strategy

> Not a converted source document. Authored during the NovaLight M1.5 Production Foundation planning session. First document in a new `docs/operations/` category — flagged explicitly (see [docs/deployment/021-m1.5-production-foundation-plan.md](../deployment/021-m1.5-production-foundation-plan.md) for the reasoning behind creating `docs/deployment/` and `docs/operations/` as new top-level categories rather than folding into `docs/development/`).

## Document Metadata

| Field            | Value                                                                                                                                                                                                                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document Version | 1.0                                                                                                                                                                                                                                                                                                                       |
| Status           | Proposed — pending human approval                                                                                                                                                                                                                                                                                         |
| Baseline         | [System Architecture §6](../architecture/004-system-architecture.md) (Development/Staging/Production, "independent configuration... independent secrets... controlled deployment"), [Security Architecture §12](../security/013-security-architecture.md) ("separate secrets... separate databases... controlled access") |

## 1. Three Environments (Confirmed, Not New)

Both baseline documents already name Development/Staging/Production — this document operationalizes that, it doesn't decide it fresh.

| Environment | Purpose                   | Database                                        | Auth                                                     | Deploy trigger                                     |
| ----------- | ------------------------- | ----------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------- |
| Development | Local, per-engineer       | Local Postgres or a shared dev Supabase project | `InMemoryAuthProvider` (current) or a Clerk dev instance | Manual (`npm run dev`)                             |
| Staging     | Pre-production validation | Dedicated Supabase project (staging)            | Clerk staging instance                                   | Automatic on merge to `main` (recommended, see §4) |
| Production  | Customer-facing           | Dedicated Supabase project (production)         | Clerk production instance                                | Manual/gated (recommended, see §4)                 |

## 2. Configuration Strategy

Extends `apps/api/src/config/env.ts`'s existing pattern (Zod-validated, fail-fast at startup) — this document does not introduce a new configuration mechanism, only more variables and per-environment values:

- Every environment has its own `.env` (never committed — already enforced by `.gitignore`) or hosting-platform environment variable set.
- New variables anticipated for staging/production beyond today's `NODE_ENV`/`PORT`/`LOG_LEVEL`/`DATABASE_URL`: `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY` (per [022-authentication-production-strategy.md](../security/022-authentication-production-strategy.md) §4), and a CORS allow-list origin (currently permissive in non-production per `apps/api/src/middlewares/security.ts`'s own comment — **must** become a specific origin for staging/production, per [Security Architecture §10](../security/013-security-architecture.md) "Never use unrestricted production CORS").
- No new configuration _mechanism_ (e.g. a config service, a feature-flag platform) is introduced — none is justified by anything M1 or M1.5 actually needs yet, per ADR-014.

## 3. Secrets Management

- **Mechanism: hosting-platform environment variables** (Vercel project settings, Railway service variables, Supabase project settings), not a separate secrets vault — no NovaLight requirement documented anywhere justifies a dedicated secrets-management product (e.g. Vault, AWS Secrets Manager) over what Vercel/Railway/Supabase already provide natively, and introducing one would be exactly the premature complexity ADR-014 warns against.
- **CI/CD secrets** (for `prisma migrate deploy` during deployment, per [021-m1.5-production-foundation-plan.md](../deployment/021-m1.5-production-foundation-plan.md) §3): stored in the CI/CD platform's own secrets store (e.g. GitHub Actions repository/environment secrets), scoped per environment (a staging deploy job cannot see production secrets, and vice versa).
- No secret is ever committed, logged, or placed in documentation — unchanged, already-enforced rule (`.gitignore`, `apps/api/src/config/logger.ts`'s header redaction).

## 4. Deployment Triggers (Recommendation, Not Yet Decided)

Recommended, pending the CI/CD platform ADR ([021-m1.5-production-foundation-plan.md](../deployment/021-m1.5-production-foundation-plan.md) §6):

- **Staging:** automatic deploy on every merge to `main`, after the full quality-gate sequence (Lint → Type Check → Tests → Build) passes — fast feedback, low risk since staging holds no real customer data.
- **Production:** manual trigger (e.g. a tagged release or an explicit approval step), never automatic on merge — matches [Development Workflow §18](../development/015-development-workflow.md) "Before release... deployment validated" and the Critical-risk multi-tenant-isolation posture that should not ship on every commit without a human checkpoint.

## 5. Monitoring and Logging (Directional — Not Decided)

Per [System Architecture §9](../architecture/004-system-architecture.md) ("future architecture support: Logging, Metrics, Tracing, Error Monitoring") and [Security Architecture §21](../security/013-security-architecture.md) (static analysis, dependency scanning, API security testing, penetration testing "before production launch") — none of this is implemented today, and none is decided by this document:

- **Logging:** `apps/api`'s existing Pino structured logging (`apps/api/src/config/logger.ts`) is the foundation; centralized log aggregation/shipping (e.g. to a hosting-platform-native log viewer, or a dedicated log aggregator) is a real gap, not yet chosen — flagged in §7 Open Items, not invented here.
- **Error monitoring:** no vendor decided (e.g. Sentry). A real gap for production readiness (§4 Production Readiness Checklist in the companion deployment plan).
- **Metrics/tracing:** not decided; no NovaLight requirement yet justifies choosing a specific APM vendor speculatively.

## 6. Database Environment Isolation

Per [Security Architecture §14](../security/013-security-architecture.md) (restricted credentials, controlled connections, migration process, backup strategy) and §12 (separate databases per environment):

- Staging and production are **separate Supabase projects**, not separate schemas within one project — full isolation (connection credentials, backups, scaling) matches the existing multi-tenant-isolation posture applied one level up (environment isolation, not just account isolation).
- Migrations: `prisma migrate deploy` (non-interactive, CI/CD-driven) against each environment's own `DATABASE_URL` — never `prisma migrate dev` (interactive, dev-only) outside a developer's local machine.
- **Backup/recovery strategy: still not decided.** `.claude/memory/known-risks.md` already tracks "No recovery/backup strategy documented... must be documented before production launch" as an open item — this document does not close it. Recommendation (not a decision): enable Supabase's built-in automated backups/point-in-time recovery as the baseline, formalized via a dedicated ADR before any production database goes live, per the existing tracked risk.

## 7. Open Items (Not Resolved by This Document)

- CI/CD platform (blocks automating §4's deployment triggers) — see [021-m1.5-production-foundation-plan.md](../deployment/021-m1.5-production-foundation-plan.md) §6.
- Error monitoring / log aggregation vendor — not chosen.
- Backup/recovery strategy — not chosen, pre-existing tracked risk.
- RBAC role taxonomy — unrelated to environment strategy but still blocks Stage 3+ regardless of environment.
