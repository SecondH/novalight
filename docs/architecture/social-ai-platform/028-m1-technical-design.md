# M1 — SaaS Core Foundation: Technical Design

> Not a converted source document. Authored during the NovaLight MVP M1 planning session, per [ADR-015](../017-documentation-structure-for-product-verticals.md). Numbered `028` (not `020`) to avoid colliding with the existing [020-ai-agent-specifications.md](./020-ai-agent-specifications.md) in this same local sequence.

## Document Metadata

| Field            | Value                                                                                                                                                                                                                                                                                                                                                                   |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document Version | 1.1 — status updated to Accepted; §2.2/§3.7/§3.8 amended post-gate-review; see change notes inline                                                                                                                                                                                                                                                                      |
| Status           | **Accepted** — [ADR-018](./027-data-model-scope-decision.md) accepted 2026-07-11; implementation approved per [docs/readiness/mvp-development-approval.md](../../readiness/mvp-development-approval.md); M1 implementation completed 2026-07-12 against this design (flagged stale by independent solution-architect review during the code-level gate, corrected here) |
| Scope            | MVP Track Stage 1 ("Content Assistant") minimum SaaS foundation: user accounts, business ownership, brand profiles, AI content workflows. Companion to [docs/development/018-mvp-m1-plan.md](../../development/018-mvp-m1-plan.md) (delivery sequencing) and [docs/development/019-mvp-m1-test-strategy.md](../../development/019-mvp-m1-test-strategy.md) (testing).   |
| Implementation   | `packages/database/prisma/schema.prisma` + migration, `apps/api/src/{repositories,modules,ai,auth,middlewares,audit}/**`, `apps/web/src/{features/brand-setup,app/(onboarding),lib}/**`.                                                                                                                                                                                |

## 1. Data Model

Formal entity approval lives in [ADR-018](./027-data-model-scope-decision.md) (amended in this session to add `Account`) — this section restates it at implementation-planning detail. Do not create migrations from this section alone; ADR-018 must be `Accepted` first.

### 1.1 `User` (exists — Phase 0, unchanged)

- **Purpose:** login identity, per `packages/database/prisma/schema.prisma` today.
- **Fields (existing):** `id` (UUID PK), `email` (unique), `createdAt`, `updatedAt`.
- **Relationships:** owns one `Account` at Stage 1 (see 1.2); may belong to multiple `Account`s only from Stage 3 onward, once RBAC is reconciled.
- **Ownership rules:** none — `User` is the authentication root, not an owned resource.
- **Future extension points:** Stage 3 introduces a `User`↔`Account` join (many-to-many) to support staff/delegated personas ([product/mvp-social-ai/019-personas.md](../../product/mvp-social-ai/019-personas.md) §2) — not built now.

### 1.2 `Account` (new — ADR-018 v1.1)

- **Purpose:** the business/tenant ownership root. Separates "who can log in" (`User`) from "what business this data belongs to" (`Account`), so Stage 3's multi-user-per-business need doesn't require re-keying every other table.
- **Fields (direction, not final column types — see [ADR-018 §5](./027-data-model-scope-decision.md)):** `id` (UUID PK), `owner_user_id` (FK → `User`, Stage 1: the sole user), `vertical` (one of the five in [product/mvp-social-ai/018-target-customer-definition.md](../../product/mvp-social-ai/018-target-customer-definition.md)), `created_at`/`updated_at`.
- **Relationships:** one `User` (Stage 1) → one `Account` → one `Brand` (single-brand-per-account, [product/mvp-social-ai/021-mvp-scope.md](../../product/mvp-social-ai/021-mvp-scope.md) §2) → many `ContentIdea`/`ContentDraft`/`CalendarEntry`.
- **Ownership rules:** `Account` is the ownership root all downstream entities scope against directly (`account_id` FK on each, not a join chain — [ADR-018](./027-data-model-scope-decision.md) Consequences).
- **Future extension points:** Stage 5 convergence ([product/mvp-social-ai/026-mvp-roadmap.md](../../product/mvp-social-ai/026-mvp-roadmap.md) §2) is where `Account` plausibly becomes, or maps onto, an `Organization` entity from [007-product-vision.md](../../product/007-product-vision.md) Phase 1 — not decided now, deliberately left open rather than pre-named.

### 1.3 `Brand`

- **Purpose:** persistent brand understanding (tone, audience, visual style, offerings) — conceptually defined in [021-knowledge-model.md](./021-knowledge-model.md) §2.
- **Fields (direction):** `id`, `account_id` (FK), `vertical`, `tone_descriptors`, `audience_description`, `visual_style_descriptors`, `offerings_summary`, `created_at`/`updated_at`.
- **Relationships:** belongs to one `Account`; read by all five agents ([020-ai-agent-specifications.md](./020-ai-agent-specifications.md)).
- **Ownership rules:** `account_id` scoping, enforced at Repository layer (§2.2).
- **Future extension points:** Stage 2 adds Brand Intelligence fields sourced from `ApprovalHistory` ([022-brand-intelligence-layer.md](./022-brand-intelligence-layer.md)) — additive columns/relations, not a redesign.

### 1.4 `ContentIdea`

- **Purpose:** Content Planner Agent output.
- **Fields (direction):** `id`, `account_id` (FK), `brand_id` (FK), `topic`, `intended_format`, `target_date`, `created_at`/`updated_at`.
- **Relationships:** belongs to `Account` and `Brand`; expands into one `ContentDraft`.
- **Ownership rules:** `account_id` direct FK (not inferred via `brand_id`).
- **Future extension points:** Stage 4 adds a link to `PerformanceRecord`-informed ranking — additive.

### 1.5 `ContentDraft`

- **Purpose:** Copywriter + Visual Prompt Engineer output, plus approval state (draft/edited/approved/discarded).
- **Fields (direction):** `id`, `account_id` (FK), `content_idea_id` (FK), `caption_text`, `visual_prompt_text`, `approval_state`, `created_at`/`updated_at`.
- **Relationships:** belongs to `Account` and `ContentIdea`; placed on one `CalendarEntry` once approved.
- **Ownership rules:** `account_id` direct FK.
- **Future extension points:** `ApprovalHistory` (Stage 2) records transitions of `approval_state` over time — `ContentDraft` itself doesn't need a Stage 2 schema change, `ApprovalHistory` is additive.

### 1.6 `CalendarEntry`

- **Purpose:** scheduled/posted content.
- **Fields (direction):** `id`, `account_id` (FK), `content_draft_id` (FK), `scheduled_date`, `posted_state` (`scheduled`/`posted`/`discarded`), `created_at`/`updated_at`.
- **Relationships:** belongs to `Account` and `ContentDraft`; produces zero-or-one `PerformanceRecord` once posted (Stage 4).
- **Ownership rules:** `account_id` direct FK.
- **Future extension points:** Stage 3 adds an `automation_scope` field (which channels/content-types are opted into auto-scheduling) — gated on RBAC reconciliation, not built in M1.

### 1.7 Not in M1 (confirmed, not omitted by oversight)

`ApprovalHistory` (Stage 2) and `PerformanceRecord` (Stage 4) remain out of M1's migration set per [ADR-018](./027-data-model-scope-decision.md)'s staged introduction — M1 delivers exactly the Stage 1 entities (`Account`, `Brand`, `ContentIdea`, `ContentDraft`, `CalendarEntry`) plus the unchanged `User`.

## 2. Security Model

Baseline: [Security Architecture](../../security/013-security-architecture.md), [Threat Model](../../security/014-novalight-threat-model.md), and the corrections already made to [018-saas-architecture.md](./018-saas-architecture.md) §4 during the implementation-readiness gate.

### 2.1 Authentication Boundary

Unchanged from ADR-007: `packages/auth`'s `AuthProvider` interface (future: Clerk) is the sole authentication boundary. `apps/api`'s Authentication Middleware ([010-backend-architecture.md](../010-backend-architecture.md) §12) validates identity and attaches `{ userId }` to request context before any controller runs. No M1 controller or service performs its own credential checking.

### 2.2 Account Ownership Enforcement (Repository Filtering Rules)

This is the load-bearing control for M1, per the correction already made during the readiness gate:

- **Enforcement point:** the Repository layer, not `AuthorizationProvider`. Every repository method touching `Brand`/`ContentIdea`/`ContentDraft`/`CalendarEntry` takes the requesting `account_id` as a mandatory parameter and applies it as a `WHERE account_id = :accountId` filter (Prisma `where` clause) on every read and write — no method may omit it.
- **Where `account_id` comes from:** resolved once per request, from the authenticated `userId` → that user's `Account` (Stage 1: 1:1 lookup), by a single Service-layer helper (not re-derived ad hoc in each service) — e.g. a `resolveAccountForUser(userId)` call at the top of each Service method, so the account-scoping value has one source of truth per request.
- **Why not `AuthorizationProvider` alone:** its `can(context, permission)` shape ([packages/auth/src/authorization.interface.ts](../../../packages/auth/src/authorization.interface.ts)) checks resource-type/action permissions (e.g. "can this role read brand resources"), not a specific record's owner — confirmed by direct reading of the interface during the readiness gate review. It remains available as a complementary, type-level check once roles exist (Stage 3+), never as a substitute for row-level scoping.
- **Negative test requirement:** every M1 endpoint must have a corresponding ownership-isolation test proving Account A cannot read/write Account B's records — see [docs/development/019-mvp-m1-test-strategy.md](../../development/019-mvp-m1-test-strategy.md) §3.
- **`Account` lookups must never accept a client-supplied `account_id`/`id` to fetch a record directly** (added after independent data-architect review — `Account` is the ownership root and, unlike its downstream entities, has no scoping FK of its own to enforce against). Every `Account` lookup must be derived server-side from the authenticated `userId` via `resolveAccountForUser(userId)`, never from a request parameter or body field. An endpoint that accepted `GET /api/v1/accounts/:id` with a client-supplied `:id` would reintroduce the same IDOR class §2.5 exists to prevent, one layer up.
- **Indexing:** `account_id` must be an indexed column on `Brand`/`ContentIdea`/`ContentDraft`/`CalendarEntry` in the actual migration (added after independent data-architect review) — it is the mandatory filter on every query per this section, not an incidental column.

### 2.3 Authorization Abstraction

`AuthorizationProvider` is still wired in for the type/action checks that do apply even at Stage 1 — but `Role` remains the deliberately generic `string` type per its own interface comment, because the RBAC taxonomy conflict is still unresolved. M1 must not hardcode a role name anywhere; if a permission check is needed, express it against `Permission { resource, action }` shapes that don't presume a specific role list. **Correction after independent architecture review:** an earlier version of this section used "a not-yet-onboarded `User` shouldn't be able to call content-generation endpoints before completing brand intake" as an example of an `AuthorizationProvider` check. That's the wrong classification — brand-intake completeness is workflow state, not a permission, and `Permission { resource, action }` doesn't naturally express it. This case is a **Business Error** (§3.6), enforced by the Service layer checking whether the account's `Brand` exists/is confirmed before proceeding — not an `AuthorizationProvider` call. `AuthorizationProvider` has no concrete M1 use case yet beyond being wired in for when Stage 3 roles exist; that's expected and not a gap.

### 2.4 Audit Requirements

Per [Security Architecture](../../security/013-security-architecture.md) and `packages/auth`'s existing `AuditLogger` interface (`record({ actor, action, resource, timestamp, result })`): M1 must call `AuditLogger.record(...)` for account-creation, brand-profile changes, and content-approval actions (Content Draft approval/discard) — these are the "sensitive operations" ([CLAUDE.md §7](../../../CLAUDE.md#7-security-and-privacy-rules)) in M1's scope. Read operations (viewing ideas/drafts/calendar) are not audited, consistent with the interface's existing "no sensitive operation to audit yet" posture being narrowed, not expanded wholesale, for M1.

### 2.5 Explicitly Prevented

- **Cross-account access:** closed by §2.2's mandatory repository-level scoping — no endpoint may skip it, including internal/admin-style endpoints (none are in M1 scope; if one is added later it needs its own explicit review, not an exemption from this rule).
- **IDOR:** the specific failure mode §2.2 exists to prevent — a request for `ContentDraft` `id=X` must fail (404, not 403, to avoid confirming the record's existence to an unauthorized caller) if `X`'s `account_id` doesn't match the requester's resolved account.

## 3. Backend Architecture

Follows [Backend Architecture](../010-backend-architecture.md) unchanged — no new architectural pattern introduced.

### 3.1 Modules

Per [010-backend-architecture.md](../010-backend-architecture.md) §7, M1 introduces these modules under `apps/api/src/modules/`:

```text
modules/
├── accounts/       # Account creation, brand-vertical selection
├── brands/         # Brand profile CRUD, brand intake
├── content/        # ContentIdea, ContentDraft, CalendarEntry
```

`agents/` (Brand Strategist / Content Planner / Copywriter / Visual Prompt Engineer consumption of `packages/ai-core`) is **not** a Controller-facing module — agent invocation is Service-layer logic inside `brands/` (Brand Strategist) and `content/` (the other three), per [019-ai-agent-architecture.md](./019-ai-agent-architecture.md)'s decision that composition happens at the Service layer, not as its own exposed module.

### 3.2 Services

- `AccountService` — creates `Account` on first login/onboarding, resolves `account_id` for a given `userId` (the §2.2 helper).
- `BrandService` — brand intake processing, invokes Brand Strategist Agent, persists `Brand`.
- `ContentService` — invokes Content Planner / Copywriter / Visual Prompt Engineer agents per [023-content-generation-pipeline.md](./023-content-generation-pipeline.md), persists `ContentIdea`/`ContentDraft`/`CalendarEntry`.

All services depend on Repositories and `packages/ai-core` interfaces only — never Express request/response objects (§9 of [010-backend-architecture.md](../010-backend-architecture.md)), never Prisma directly.

### 3.3 Controllers

One controller per module (`AccountController`, `BrandController`, `ContentController`), each: receive request → validate (§3.5) → call the corresponding Service with `{ userId, ...validated input }` → map Service result to the `{ success, data }` / `{ success: false, error }` contract ([010-backend-architecture.md](../010-backend-architecture.md) §14). No controller constructs a Prisma query or calls `packages/ai-core` directly.

### 3.4 Repositories

`AccountRepository`, `BrandRepository`, `ContentIdeaRepository`, `ContentDraftRepository`, `CalendarEntryRepository` — each wraps Prisma, each method requires `account_id` as described in §2.2 (except `AccountRepository`, which is keyed by `userId`/`id` since `Account` is the ownership root).

### 3.5 Validation

Zod schemas per endpoint, per [010-backend-architecture.md](../010-backend-architecture.md) §11: brand-intake payload shape, content-idea-selection payload, caption/visual-prompt edit payload, calendar reschedule payload. Invalid input fails with a `400`-class `Validation Error` per §3.6, never reaches the Service layer.

### 3.6 Error Handling

Follows [010-backend-architecture.md](../010-backend-architecture.md) §15's five categories unchanged: Validation Error, Authentication Error, Authorization Error (now including the §2.2 ownership-scoping failure, surfaced as 404 per §2.5), Business Error (e.g. "brand intake incomplete, cannot generate content"), System Error (AI provider failure — must not leak provider error details to the client, per [CLAUDE.md §7](../../../CLAUDE.md#7-security-and-privacy-rules)).

### 3.7 Logging

Structured (Pino, per [010-backend-architecture.md](../010-backend-architecture.md) §2/§18), request-scoped, includes `account_id` and `userId` for traceability but never brand content text or AI prompt/response bodies at `info` level (avoid incidentally logging business-sensitive content). **Error-level boundary, made explicit after independent security review** (an earlier version left this "reviewed case by case," which the review correctly flagged as undefined for exactly the log level most likely to include debug context): error-level logs may include the error type, stack trace, `account_id`, and `userId`, but must **never** include the raw brand-content or AI prompt/response body even on failure — log a truncated hash or length, not the content itself, per [Security Architecture §15](../../security/013-security-architecture.md) ("never log ... private user information"). This is a hard rule for M1, not a case-by-case judgment call.

### 3.8 Rate Limiting

**Added after independent security review found this entirely absent** — [Security Architecture §10](../../security/013-security-architecture.md) mandates rate limiting for "all APIs," and [Threat Model §4.5](../../security/014-novalight-threat-model.md) rates Denial of Service "High" and names "expensive AI requests" specifically, which directly describes M1's content-generation endpoints (`/api/v1/brands` brand-intake processing, `/api/v1/content-ideas`, and any endpoint that invokes an agent). This was a real, unaddressed gap, not a deferred one — closed here:

- Per-account rate limits on all endpoints that invoke an agent (Brand Strategist, Content Planner, Copywriter, Visual Prompt Engineer), enforced at the Controller or a dedicated middleware layer before the Service/agent call — not left to the AI provider's own rate limiting, since M1 uses a test/fake `ModelProvider` with no real vendor-side limit to rely on.
- Limits are account-scoped (using the same `account_id` resolved in §2.2), not IP-scoped alone — an authenticated attacker cycling accounts is the more realistic threat than an anonymous flood, given every agent-invoking endpoint requires authentication.
- Exceeding the limit returns a distinct, documented error code (not a generic System Error) so the frontend can show a clear "try again shortly" message rather than a confusing failure.
- Specific numeric limits are not set in this document — no NovaLight document defines a numeric threshold for anything else either (`.claude/memory/known-risks.md` "No numeric quality thresholds defined"), and setting one without real usage data would be invented, not evidenced. The requirement is that a limit **exists and is enforced**; the number is an implementation-time decision informed by [product/mvp-social-ai/024-pricing-model.md](../../product/mvp-social-ai/024-pricing-model.md) §4's volume-cap reasoning.

## 4. Frontend Architecture

Follows [Frontend Architecture](../011-frontend-architecture.md) unchanged.

### 4.1 Routes (App Router, route groups per [011-frontend-architecture.md](../011-frontend-architecture.md) §6)

```text
app/
├── (auth)/                  # existing, Phase 0/Clerk — unchanged by M1
├── (onboarding)/
│   └── brand-setup/         # guided brand intake journey (product/mvp-social-ai/020-user-journeys.md §1)
└── (dashboard)/
    ├── content/             # idea generation, review, approve/discard (journey §2)
    └── calendar/            # calendar view (journey §3)
```

### 4.2 Components

Feature-based per [011-frontend-architecture.md](../011-frontend-architecture.md) §8:

```text
features/
├── brand-setup/{components,hooks,api,schemas,types}
├── content/{components,hooks,api,schemas,types}
└── calendar/{components,hooks,api,schemas,types}
```

Shared UI (Button/Input/Modal/Card) comes from `packages/ui` — per [018-saas-architecture.md](./018-saas-architecture.md) §2, M1 is the real consumer that justifies finally creating this package (still not created by this documentation pass).

### 4.3 State Management

- **Server state:** TanStack Query for all Brand/ContentIdea/ContentDraft/CalendarEntry data — no manual fetch/useEffect data-loading.
- **Client state:** Zustand only if a genuine cross-component UI state need emerges (e.g. multi-step brand-intake wizard progress) — not pre-built speculatively.
- **Form state:** React Hook Form + Zod for brand intake and content-edit forms, schemas shared conceptually (not necessarily code-shared yet) with `apps/api`'s validators.

### 4.4 API Integration

Centralized API client (`lib/api/api-client.ts` per [011-frontend-architecture.md](../011-frontend-architecture.md) §12) — no feature component calls `fetch` directly. Handles auth headers, error normalization to the backend's `{success, error}` shape, and response typing.

### 4.5 Onboarding Flow

Maps to [product/mvp-social-ai/020-user-journeys.md](../../product/mvp-social-ai/020-user-journeys.md) §1: account creation (via existing auth) → vertical selection → guided brand-intake Q&A → Brand Strategist Agent-produced profile shown for review → confirm/edit → redirect to dashboard.

### 4.6 Dashboard Structure

Two primary views for M1: Content (idea generation → review → approve, journey §2) and Calendar (journey §3). No settings/team/billing UI in M1 — out of scope per [product/mvp-social-ai/021-mvp-scope.md](../../product/mvp-social-ai/021-mvp-scope.md) §4.

## 5. AI Foundation (Interfaces Only)

**No external AI provider is connected in M1.** Consistent with Phase 0's existing "no paid API calls" posture ([docs/development/016-phase-0-implementation-status.md](../../development/016-phase-0-implementation-status.md)) and this document's own scope limit.

- **Agent runtime:** `packages/ai-core`'s existing `AgentExecutor` interface (unchanged, no new interface) — M1's `BrandService`/`ContentService` construct agent invocations against it per [019-ai-agent-architecture.md](./019-ai-agent-architecture.md).
- **Prompt templates:** `packages/ai-core`'s existing `PromptManager` interface — M1 adds four concrete prompt templates (Brand Strategist intake-interpretation, Content Planner idea-generation, Copywriter caption-drafting, Visual Prompt Engineer prompt-drafting per [020-ai-agent-specifications.md](./020-ai-agent-specifications.md)), each built from the per-agent field allow-list required by [product/mvp-social-ai/023-acceptance-criteria.md](../../product/mvp-social-ai/023-acceptance-criteria.md) Cross-Cutting.
- **Model provider abstraction:** `packages/ai-core`'s existing `ModelProvider` interface — M1 implements it against a test/fake provider only (for the unit/integration tests in [019-mvp-m1-test-strategy.md](../../development/019-mvp-m1-test-strategy.md)), not a real vendor SDK. Wiring a real vendor (OpenAI/Claude/Gemini per ADR-009) is explicitly deferred past M1 — a distinct, later milestone, not silently assumed to happen "at some point during M1."

## 6. Relationship to the Implementation Readiness Gate

This document is technical design, not authorization to build. Per [docs/readiness/mvp-development-approval.md](../../readiness/mvp-development-approval.md) Precondition 1, no migration or code implementing §1–§5 above may begin until [ADR-018](./027-data-model-scope-decision.md) (as amended in this session to include `Account`) is formally accepted by a human.
