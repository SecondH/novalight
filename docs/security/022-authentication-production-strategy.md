# Authentication Production Strategy

> Not a converted source document. Authored during the NovaLight M1.5 Production Foundation planning session. Numbered `022`, continuing the corrected global flat sequence (see [.claude/memory/known-risks.md](../../.claude/memory/known-risks.md) "Correction: global doc-numbering collision" for why this matters).

## Document Metadata

| Field            | Value                                                                                                                                                                                                                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document Version | 1.0                                                                                                                                                                                                                                                                             |
| Status           | Proposed — pending human approval                                                                                                                                                                                                                                               |
| Scope            | How M1's dev/test [InMemoryAuthProvider](../../apps/api/src/auth/in-memory-auth-provider.ts) is replaced by a real authentication vendor before staging/production deployment. Does not resolve the RBAC role-taxonomy conflict — authorization is a separate concern (see §5). |

## 1. Decision: Confirm Clerk (No Reconsideration Needed)

[ADR-007](../architecture/006-initial-architecture-decisions.md) already named Clerk as the future authentication provider, accepted before this session. Re-evaluated here as explicitly requested by this planning round — **no new information from M1's implementation changes that decision**:

- [Security Architecture §5](./013-security-architecture.md) requires secure login, session management, token validation, password protection, account recovery, MFA readiness, and future social login/SSO/enterprise-identity support. Clerk provides all of these natively, out of the box.
- `packages/auth`'s `AuthProvider` interface (`verifySession`, `invalidateSession`) was deliberately designed generic enough that M1's `InMemoryAuthProvider` and a future `ClerkAuthProvider` are interchangeable implementations — this is ADR-007's abstraction working as intended, not something this document needs to redesign.
- No competing requirement surfaced during M1 that Clerk can't satisfy (e.g., no requirement for a specific enterprise SSO protocol not supported by Clerk, no cost/compliance constraint documented anywhere that would rule it out).

**Recommendation: proceed with Clerk.** If this is to be reconsidered, that is a human/business decision (vendor cost, compliance requirements not yet documented) — not a technical finding from this review.

## 2. Production Integration Strategy

### 2.1 What Changes

Only `apps/api/src/auth/in-memory-auth-provider.ts` is replaced, plus a **one-line import swap** — everything downstream still depends on the `AuthProvider` interface, not the concrete class, so no _logic_ changes:

```text
apps/api/src/middlewares/authentication.ts  (imports the concrete provider by name -- one line changes)
  ↓ depends on (type-level, unchanged)
AuthProvider interface (packages/auth, unchanged)
  ↓ implemented by
InMemoryAuthProvider (M1, dev/test only)  →  ClerkAuthProvider (new, this work)
```

**Correction after independent review** (an earlier version of this section claimed "no consumer code changes" — inaccurate): `apps/api/src/middlewares/authentication.ts` currently does `import { authProvider } from '../auth/in-memory-auth-provider'` — a direct import of the concrete singleton, not a factory/DI-resolved dependency. Swapping to Clerk requires changing that one import line to point at a new `clerk-auth-provider.ts` export. This does not violate ADR-007 (the _type_ dependency stays on the `AuthProvider` interface throughout; no Clerk-specific type leaks into the middleware) — it's a one-line change, not a zero-line one, and this document should not have claimed otherwise.

### 2.2 New Work Required

1. **`apps/api/src/auth/clerk-auth-provider.ts`** — implements `AuthProvider` using Clerk's backend SDK (`@clerk/backend` or equivalent), verifying Clerk session tokens instead of the in-memory map.
2. **`apps/web`** — Clerk's frontend SDK (`@clerk/nextjs`) replaces `apps/web/src/app/(onboarding)/brand-setup/page.tsx`'s explicit `localStorage` placeholder (see that file's own comment: "This must be replaced by real session retrieval once Clerk is wired in, not extended").
3. **Account-creation trigger** — M1's `POST /api/v1/accounts` assumes a `User` row already exists (Phase 0's `User` model, keyed by `email`). A real integration needs a decision on when the `User` row is created relative to Clerk sign-up: recommended is a Clerk webhook (`user.created`) creating the corresponding `User` row server-side, rather than trusting client-supplied identity data — this is new work, not yet designed in detail here (see §6 Required ADRs).
4. **No RBAC/role wiring** — `AuthorizationProvider`'s `Role` type remains the deliberately generic `string` per its own interface comment; this work does not touch it (§5).

### 2.3 What Does Not Change

- `requireAuthentication` middleware's contract (`req.userId` populated before controllers run) — unchanged.
- Every repository's `account_id`/`owner_user_id` scoping — unaffected; ownership enforcement never depended on which auth provider issued the session.
- `AccountContextService.resolveAccountForUser(userId)` — unaffected; `userId` still comes from the verified session, now via Clerk instead of the in-memory map.

## 3. Session and Token Handling

- Clerk issues its own session tokens (JWTs); `ClerkAuthProvider.verifySession` verifies them via Clerk's SDK (signature + expiry + revocation check), returning the same `AuthenticatedIdentity { userId, email }` shape the interface already defines — no interface change.
- `invalidateSession` maps to Clerk's session-revocation API.
- No NovaLight-issued token or session store is introduced — Clerk owns session lifecycle entirely, consistent with "the application depends on the interface, not the provider" (ADR-007).

## 4. Secrets

Per [Security Architecture §11](./013-security-architecture.md) (env vars only, never in code/docs) and [§12](./013-security-architecture.md) (separate secrets per environment):

- `CLERK_SECRET_KEY` / `CLERK_PUBLISHABLE_KEY` (or equivalent) added to `apps/api`'s and `apps/web`'s env schemas (`apps/api/src/config/env.ts`'s existing Zod-validated, fail-fast-at-startup pattern — extend it, don't replace it).
- **Separate Clerk instances/environments for staging and production** (Clerk supports this natively via its own environment concept) — not the same keys reused across environments, matching [Security Architecture §12](./013-security-architecture.md)'s "separate secrets" rule.
- Actual secret storage/injection mechanism (CI/CD secrets store vs. hosting-platform environment variables) is addressed in [docs/operations/023-environment-strategy.md](../operations/023-environment-strategy.md), not duplicated here.

## 5. Explicitly Not Addressed Here — RBAC Remains Open

This document is authentication-only ("who is the user"). It does **not** resolve the RBAC role-taxonomy conflict between [008-prd.md](../product/008-prd.md) §6 and [013-security-architecture.md](./013-security-architecture.md) §7 (tracked in `.claude/memory/known-risks.md`), which remains a human decision blocking MVP Track Stage 3+ specifically. Clerk does support organization/role primitives natively if/when that decision is made — noted for future reference, not adopted now, since adopting Clerk's specific role model would itself silently pick a side in the still-open taxonomy conflict.

## 6. Required ADR

A new ADR should formally record this document's decision (Clerk confirmed, integration approach) before implementation — see [docs/deployment/021-m1.5-production-foundation-plan.md](../deployment/021-m1.5-production-foundation-plan.md) §6 "Required ADRs."

## 7. Out of Scope for M1.5

Per the explicit instruction for this planning round: this document is a strategy, not an implementation. `clerk-auth-provider.ts` is not written here. The webhook-driven `User`-row-creation design (§2.2 item 3) needs its own short design pass before implementation, not invented in full here.
