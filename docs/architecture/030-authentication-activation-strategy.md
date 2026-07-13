# ADR-030 — Authentication Activation Strategy

> Not a converted source document. Authored during the NovaLight Clerk-activation release-readiness review, following the ADR pattern in [006-initial-architecture-decisions.md](./006-initial-architecture-decisions.md). Numbered `030` in the flat top-level sequence, immediately following [ADR-029](./029-clerk-identity-mapping-and-provisioning.md).

## Document Metadata

| Field            | Value                                                                                                                                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Document Version | 1.0                                                                                                                                                                                                                                        |
| Status           | Proposed — pending human approval                                                                                                                                                                                                          |
| Document Purpose | Record why authentication activation remains intentionally disabled after this release, enumerate the remaining production gates, and define the activation sequence, rollback strategy, and go-live checklist for when those gates close. |

## Context

Three pieces of Clerk-integration work now exist, built and tested but each explicitly withheld from taking effect:

- [ADR-020](./026-clerk-development-integration-decision.md): authorizes `apps/api/src/auth/clerk-auth-provider.ts` to exist, unit-tested, **inactive**.
- [ADR-029](./029-clerk-identity-mapping-and-provisioning.md): authorizes the `clerkUserId`/`deactivatedAt` schema, the webhook endpoint, and `UserProvisioningService` — again, built and tested, **not applied to any database, not wired into the request path**.
- This release's engineering-refinement pass (event-dispatcher extensibility, `ENABLE_JIT_PROVISIONING` flag, audit-completeness fixes) hardens that same inactive code — it does not activate it.

The one remaining switch neither ADR authorizes is the single-line import change in `apps/api/src/middlewares/authentication.ts`, from `InMemoryAuthProvider` to `ClerkAuthProvider`. This ADR exists to give that switch its own explicit, checkable gate — rather than leaving "when is it safe to flip this" as tribal knowledge scattered across two other ADRs and a security review.

## Decision

**Authentication activation remains explicitly deferred.** This ADR does not activate it, and does not set a date — it defines the conditions under which a future, separate change may.

### Why still disabled

1. The `packages/database/prisma/migrations/20260713000000_add_user_clerk_identity_and_deactivation` migration has been reviewed but **not applied to any real database**. Activating `ClerkAuthProvider` without the `clerk_user_id`/`deactivated_at` columns existing would make every `UsersRepository` call throw at runtime.
2. No live Clerk application keys have been exercised end-to-end against a running instance of this codebase — all verification to date is against mocked SDKs (`clerk-auth-provider.test.ts`) or synthetic Svix-signed payloads (`webhooks.test.ts`), not a real Clerk dashboard delivering real events.
3. ADR-020's own terms require an independent `security-reviewer` sign-off **on the activation specifically** (not just on the code as written) before the import swap happens. That sign-off has not been sought yet — the security reviews performed so far were scoped to "is the inactive code safe to merge," not "is it safe to activate."
4. No rollback drill has been exercised. The rollback strategy below is designed, not yet rehearsed.

### Remaining production gates

In the order they must close:

1. **Migration applied.** `prisma migrate deploy` run against the target environment's real database, verified via `\d users` (or equivalent) that `clerk_user_id`/`deactivated_at` exist with the expected constraints.
2. **Live Clerk application configured.** Real `CLERK_SECRET_KEY` and `CLERK_WEBHOOK_SIGNING_SECRET` provisioned for the target environment (never committed — environment-variable injection only, per [Security Architecture §11-12](../security/013-security-architecture.md)).
3. **Webhook endpoint reachable from Clerk.** The target environment's `/api/v1/webhooks/clerk` must be publicly reachable over HTTPS; the webhook registered in the Clerk dashboard pointing at it.
4. **At least one real webhook delivery observed end-to-end** — a real `user.created` event from the Clerk dashboard, not just the synthetic signed-payload integration test. This is the one verification step ADR-029 explicitly deferred past its own build-out pass.
5. **Activation-specific security review.** An independent `security-reviewer` pass scoped specifically to: the live webhook secret's storage/rotation plan, the blast radius of the import swap itself, and confirmation that `InMemoryAuthProvider`'s dev/test sessions cannot leak into a Clerk-activated environment.
6. **This ADR's Status moved to Accepted**, recording who approved activation and for which environment(s) — activation may be environment-scoped (e.g., staging first) rather than all-or-nothing.
7. **Explicit human approval** to perform the import swap itself, per [CLAUDE.md §15](../../CLAUDE.md#15-escalation-rules)'s Critical-risk row ("Authentication/authorization mechanism change ... requires explicit user approval").

### Activation sequence (once all gates above are closed)

1. Apply the migration to the target environment (gate 1) — done as its own change, reviewed and merged independently of the import swap.
2. Deploy the already-merged, already-tested Clerk code (this release) to the target environment with real secrets configured (gates 2-3) — at this point `ClerkAuthProvider` exists and is reachable, but `authentication.ts` still imports `InMemoryAuthProvider`, so **no live behavior changes yet**.
3. Trigger a real Clerk webhook delivery and confirm it's processed correctly (gate 4) — observable via the `webhook.clerk.received`/`verified`/`rejected` audit events this release adds, plus the resulting `user.provision.*` event.
4. Obtain the activation-specific security sign-off (gate 5).
5. In a small, dedicated, separately-reviewed PR: change the one import line in `apps/api/src/middlewares/authentication.ts` from `InMemoryAuthProvider` to `ClerkAuthProvider`. No other file changes belong in that PR.
6. Deploy that PR. Monitor the new `auth.clerk.deactivated_user_denied` audit event rate and the webhook audit trail for the first real-traffic window.

### Rollback strategy

Because activation is deliberately isolated to a **one-line import change**, rollback is symmetric and low-risk:

- **To roll back the import swap**: revert the single-file PR from the activation sequence's step 5. `authentication.ts` returns to importing `InMemoryAuthProvider`; every other file (schema, webhook, provisioning service) stays deployed and inert, exactly as it is in this release. No redeploy of unrelated code is needed.
- **To roll back the schema migration** (only if a defect is found in the columns themselves, a materially different and much higher-risk scenario): the migration is additive-only (two nullable columns, one unique index) — dropping them is a separate, reviewed migration, not a `git revert`. This should only be considered if the columns themselves are wrong, not as a routine response to an activation issue, since nothing else in the schema depends on them being absent.
- **Webhook endpoint**: can be disabled independently of the import swap at any time by removing the webhook's registration in the Clerk dashboard (stops delivery) and/or unsetting `CLERK_WEBHOOK_SIGNING_SECRET` (the endpoint then rejects every request with `webhook.clerk.rejected`, per this release's audit-completeness work — fails closed, not open).
- **JIT provisioning**: can be disabled independently via `ENABLE_JIT_PROVISIONING=false` (this release's feature flag) without touching the import swap at all — a lighter-weight partial rollback if the JIT path specifically is suspected, while keeping webhook-based provisioning and (if already activated) Clerk authentication itself running.

### Production checklist

Restates the gates above as a literal go/no-go list for whoever performs the activation:

- [ ] Migration applied to the target database, verified via schema inspection.
- [ ] `CLERK_SECRET_KEY` set in the target environment (not committed, not logged).
- [ ] `CLERK_WEBHOOK_SIGNING_SECRET` set in the target environment (not committed, not logged).
- [ ] Webhook endpoint publicly reachable over HTTPS and registered in the Clerk dashboard.
- [ ] At least one real `user.created` webhook delivery observed and confirmed processed (via audit log, not just a 200 response).
- [ ] Independent `security-reviewer` sign-off obtained, scoped to activation specifically.
- [ ] This ADR's Status field updated to Accepted, with the approving party and target environment(s) named.
- [ ] Explicit human approval recorded for the import-swap PR.
- [ ] Import-swap PR is a single-file diff (`apps/api/src/middlewares/authentication.ts`), reviewed independently of this release.
- [ ] Post-deploy: `webhook.clerk.*` and `auth.clerk.deactivated_user_denied` audit events monitored for at least one full traffic cycle before considering activation complete.

## Reasoning

Isolating activation to a single, reversible import line (already true of the design since ADR-020) means every gate above can be verified in the target environment **before** the one behavior-changing line ships — activation becomes the least risky part of the whole rollout, not the riskiest. This mirrors the same "authorize the code, not the activation" pattern ADR-020 established and ADR-029 continued, rather than inventing a new activation philosophy.

## Consequences

Positive:

- Gives future activation work an explicit, auditable checklist instead of relying on someone remembering which of three ADRs said what.
- Makes rollback a documented, rehearsable procedure rather than an improvisation under incident pressure.

Trade-offs:

- Six gates is a real gate, not a formality — activation will take real calendar time (provisioning a live Clerk account's production instance, a reachable webhook endpoint, and a dedicated security review are not same-day tasks). Accepted as correct given this is a Critical-risk authentication change per CLAUDE.md §15, not a reason to shortcut any gate.

## What This ADR Does Not Do

- Does not activate `ClerkAuthProvider` — `authentication.ts` is unchanged by this document.
- Does not name a target date or environment for activation — that's a human/business decision made when the gates above are ready to close.
- Does not resolve the RBAC role-taxonomy conflict tracked in `.claude/memory/known-risks.md` — a separate, still-open authorization concern, unaffected by authentication activation.
- Does not implement a `ProcessedWebhookEvent` deduplication table — noted as a future recommendation in the Clerk-activation release readiness report, not designed here.
