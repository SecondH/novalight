# ADR-029 — Clerk Identity Mapping, Webhooks, and Just-in-Time Provisioning

> Not a converted source document. Authored during the NovaLight Clerk-activation planning/build session, following the ADR pattern in [006-initial-architecture-decisions.md](./006-initial-architecture-decisions.md) and the retroactive-authorization precedent set by [ADR-020](./026-clerk-development-integration-decision.md). Numbered `029` in the flat top-level sequence — the highest number in use beforehand was `027` ([027-m1.7-delivery-foundation-report.md](../operations/027-m1.7-delivery-foundation-report.md)); `028` is used only inside `docs/readiness/` and `docs/product/mvp-social-ai/`, both of which are excluded from or independent of this flat sequence per [docs/README.md](../README.md).

## Document Metadata

| Field            | Value                                                                                                                                                                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document Version | 1.0                                                                                                                                                                                                                                                         |
| Status           | Proposed — pending human approval                                                                                                                                                                                                                           |
| Document Purpose | Authorize the schema, webhook, and provisioning design that maps a verified Clerk identity to a local `User` row — closing a gap ADR-020 and `docs/security/022-authentication-production-strategy.md` §2.2 both flagged but explicitly declined to design. |

## Context

[ADR-020](./026-clerk-development-integration-decision.md) retroactively authorized `apps/api/src/auth/clerk-auth-provider.ts` to exist as written, unit-tested, **inactive** code, and explicitly withheld authorization for: (a) activating it (the `authentication.ts` import swap), and (b) any `apps/web` Clerk integration. Both remain withheld here too — this ADR does not change that.

Investigation ahead of this work surfaced a real, previously undesigned gap: `Account.ownerUserId` is a foreign key to `User.id` (a NovaLight UUID). Clerk's verified session only yields Clerk's own user id (the JWT `sub` claim). `docs/security/022-authentication-production-strategy.md` §2.2 item 3 names this exact problem — "a decision on when the `User` row is created relative to Clerk sign-up" — recommends a webhook-driven approach, and explicitly states it "needs its own short design pass before implementation, not invented in full here." That design pass is this document.

A real Clerk application now exists for NovaLight (application id supplied out-of-band, never committed to this repository), making this design work timely, but **having a real account does not itself authorize activation** — that remains gated on this ADR reaching Accepted, plus an independent security-reviewer sign-off, per ADR-020's own terms.

## Decision

1. **Identity key: a nullable, unique `clerkUserId` column on `User` — never email.** Clerk's `sub` claim is the join key. Email is deliberately not used as a persistent identity key (see Reasoning).
2. **Webhook as the primary sync path.** A new, signature-verified endpoint receives Clerk's `user.created`, `user.updated`, and `user.deleted` events and keeps the local `User` row in sync — this is the system of record for provisioning, independent of whether the user ever calls the NovaLight API again after signing up.
3. **Bounded just-in-time (JIT) fallback for immediate consistency.** `ClerkAuthProvider.verifySession`, after verifying a session token, resolves the local `User` row by `clerkUserId`; if none exists yet (e.g. the webhook hasn't been delivered/processed yet), it provisions one transactionally from the verified Clerk identity — never from client-supplied email or account data. This is a single lookup plus, only on a cache-miss, a single write — not an unconditional write on every request.
4. **Soft deactivation, never hard delete, on `user.deleted`.** A nullable `deactivatedAt` timestamp is set instead. Enforcement is at the authentication boundary only: a deactivated `User`'s session verification returns `null` (fails closed), which blocks every downstream route without any cascading change to `Account`, `Brand`, or content rows.
5. **`Account.ownerUserId`'s foreign key to `User.id` is unchanged.** This design closes the identity-mapping gap without touching ownership/tenancy modeling at all.

## Reasoning

**Why not email as the identity key.** Clerk allows a user to change their primary email or hold multiple verified emails. If email were the join key, a legitimate email change at the Clerk side could silently re-point which local `User` row (and therefore which `Account`, via the existing hard FK) a given login resolves to — a security-relevant identity-confusion bug class, not just a data-modeling inconvenience. `clerkUserId` is Clerk's own immutable identifier and does not have this failure mode.

**Why webhook and JIT together, not either alone.** A webhook-only design leaves a window where a user who signs up and immediately calls the API has no local row yet (webhook delivery is asynchronous and, per Clerk's own model, not guaranteed to arrive before the user's next request). A JIT-only design has no mechanism to react to `user.deleted` in near-real-time if the deactivated user never calls the API again — the stale, still-active local row would persist indefinitely. Together: the webhook is the authoritative, eventually-consistent source of truth (including deactivation), and JIT is a narrow, bounded backstop for the specific case where a verified session arrives before the corresponding webhook has been processed.

**Idempotency.** Both `user.created` and `user.updated` map to the same upsert-by-`clerkUserId` operation, so redelivery (Clerk/Svix's own retry behavior) or receiving `created` after an out-of-order `updated` both converge to the same state. `user.deleted` deactivation is idempotent by construction (setting an already-set timestamp, or no-op on an unknown id, are both safe). The JIT path's only race is a concurrent create for the same `clerkUserId` (a real request racing the webhook, or two concurrent requests before either the webhook or a prior JIT call has completed); this is resolved by catching the resulting unique-constraint violation and re-reading once — no retry loop, no distributed lock.

**Deletion/deactivation semantics.** Deactivation is scoped deliberately narrowly: it stops future authentication, nothing else. It does not delete, anonymize, or restrict access to the `Account`/`Brand`/content rows a deactivated user previously owned — data retention, export, and reactivation policy are product/legal decisions this ADR does not make (see What This ADR Does Not Do).

**Failure and retry behavior.** An invalid or unverifiable webhook signature is rejected with a 400 and no state change — Clerk's own delivery system owns redelivery policy, so no NovaLight-side retry queue is introduced. A database failure while processing an otherwise-valid webhook event returns a 5xx, which causes Clerk to retry delivery — this is the intended recovery path, not an error to suppress. A JIT provisioning failure during a live request causes that request to fail authentication (401) rather than ever silently proceeding without a local `User` row.

**Local-development webhook limitations.** Clerk webhooks require a publicly reachable HTTPS endpoint; this repository's local development environment (Docker Compose Postgres, `next dev`/`tsx watch` on localhost) has no such endpoint by default. The default verification strategy for this work is therefore a signed-payload integration test that constructs a real, correctly-signed webhook payload against a fixed test secret and posts it through the actual Express app — this proves the signature-verification and raw-body wiring genuinely work without requiring a live tunnel. A live, Clerk-dashboard-triggered delivery (via a local tunneling tool) is a valid follow-up verification step but is explicitly not a gate for this pass.

## Alternatives Considered

1. **Email as the identity key.** Rejected — see Reasoning; breaks under Clerk-side email changes, which is a normal, expected event this design must not silently mishandle.
2. **No local `User` row; treat Clerk's claims as the identity for every request.** Rejected — `Account.ownerUserId` is a hard foreign key to `User.id`, adopted deliberately at the M1 schema stage; removing or bypassing that FK is a materially larger, unrelated change to the ownership model that this ADR does not propose.
3. **Polling Clerk's API instead of webhooks.** Rejected — no advantage over the JIT fallback for immediate consistency, and strictly worse for deactivation: a deleted Clerk user would remain locally active until the next poll, whereas a webhook (plus JIT's fail-closed check) reacts as soon as it's delivered.
4. **Hard delete on `user.deleted`.** Rejected — irreversible, and inconsistent with `Account`/content rows that reference the `User` via a `RESTRICT`-on-delete foreign key; deactivation achieves the actual security goal (stop authentication) without a destructive, hard-to-reverse operation.

## Consequences

Positive:

- Closes the identity-mapping gap ADR-020 and the authentication-production-strategy document both left open, without touching `Account`-level ownership/tenancy modeling.
- Makes the schema, webhook, and provisioning logic independently reviewable, testable, and mergeable without activating live authentication — consistent with ADR-020's own "authorize the code, not the activation" pattern.

Trade-offs:

- Two provisioning paths (webhook and JIT) must be kept behaviorally consistent (same upsert semantics) — more surface than a single path, accepted because neither alone is sufficient (see Reasoning).
- Full end-to-end webhook verification against a live Clerk dashboard delivery is deferred past this pass — accepted as a reasonable interim state given no public HTTPS endpoint exists in local development, not treated as equivalent to having verified it.

## What This ADR Does Not Do

- Does not activate `ClerkAuthProvider` in `apps/api/src/middlewares/authentication.ts` — that swap remains gated on this ADR reaching **Accepted**, plus an independent security-reviewer sign-off specifically on activation, plus a live webhook/JIT verification pass, per ADR-020's terms.
- Does not decide `Account`-level data retention, export, or reactivation policy for a deactivated user — flagged as an open product/legal decision, not resolved here.
- Does not resolve the RBAC role-taxonomy conflict tracked in `.claude/memory/known-risks.md` — authorization remains a separate, still-open concern from the authentication/identity-mapping question this ADR addresses.
- Does not provision or configure a live Clerk webhook endpoint in any dashboard — that is a deployment/operations action, not a design decision.
