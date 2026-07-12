# MVP M1 — Test Strategy

> Not a converted source document. Authored during the NovaLight MVP M1 planning session. Numbered `018` (continuing this directory's flat sequence) and placed in `docs/development/` rather than a new `docs/testing/` category — testing-process content already lives here ([015-development-workflow.md](./015-development-workflow.md)) and [Engineering Constitution §7](../engineering/002-engineering-constitution.md) lives in `docs/engineering/`; creating a new top-level category for one document would be exactly the premature structure [ADR-014](../architecture/006-initial-architecture-decisions.md) warns against. Extends, does not replace, [product/mvp-social-ai/027-development-plan.md](../product/mvp-social-ai/027-development-plan.md) §6's general MVP testing strategy — this document is M1-specific and more granular, especially on ownership isolation.

## Document Metadata

| Field            | Value                                                                                                                                                                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Document Version | 1.0                                                                                                                                                                                                                                                                      |
| Status           | Proposed — pending human approval                                                                                                                                                                                                                                        |
| Baseline         | [Engineering Constitution §7](../engineering/002-engineering-constitution.md) (unit/integration/e2e required levels), [Backend Architecture §19](../architecture/010-backend-architecture.md), [Frontend Architecture §19](../architecture/011-frontend-architecture.md) |

## 1. Unit Tests

- **Repository layer:** each `account_id`-scoping repository method ([028-m1-technical-design.md](../architecture/social-ai-platform/028-m1-technical-design.md) §2.2) has a unit test asserting the generated query includes the `account_id` filter — not just that it returns correct data for a single-account fixture (which could pass even if the filter were silently missing).
- **Service layer:** `AccountService.resolveAccountForUser`, `BrandService` intake-processing logic, `ContentService` pipeline orchestration ([023-content-generation-pipeline.md](../architecture/social-ai-platform/023-content-generation-pipeline.md)) — each tested against fakes/mocks for Repository and `packages/ai-core`, no real database or model call.
- **Agent prompt construction:** each of the four agents' `PromptManager` template-building logic, asserting the field allow-list from [product/mvp-social-ai/023-acceptance-criteria.md](../product/mvp-social-ai/023-acceptance-criteria.md) Cross-Cutting is respected (e.g. a Copywriter prompt-construction test asserts `ApprovalHistory` fields never appear in the built prompt, since Copywriter's spec doesn't list them as an input).
- **Validators:** each Zod schema (brand-intake, content-idea-selection, caption/visual-prompt edit, calendar reschedule) tested for both valid and invalid input shapes.

## 2. Integration Tests

- **API endpoints against a real test database** (per existing Jest/Supertest tooling, [016-phase-0-implementation-status.md](./016-phase-0-implementation-status.md)) with a mocked `ModelProvider` — no test makes a live paid AI call, consistent with Phase 0's existing posture.
- **Full Controller→Service→Repository path** for each M1 endpoint (`accounts`, `brands`, `content`), asserting the `{success, data}` / `{success: false, error}` contract ([Backend Architecture §14](../architecture/010-backend-architecture.md)).
- **Database interaction:** migration applies cleanly against a fresh test database; entity relationships (`Account`→`Brand`→`ContentIdea`→`ContentDraft`→`CalendarEntry`) resolve correctly.

## 3. Ownership Isolation Tests (M1-specific — the load-bearing security test category)

Directly verifies the fix made during the implementation-readiness gate. For **every** M1 endpoint that reads or writes `Brand`/`ContentIdea`/`ContentDraft`/`CalendarEntry`:

1. Create two `Account`s (A and B) with one `User` each, and at least one record of the relevant entity under each.
2. Authenticate as Account A's user; call the endpoint with Account B's record ID.
3. Assert the response is a 404-class error (per [028-m1-technical-design.md](../architecture/social-ai-platform/028-m1-technical-design.md) §2.5 — not 403, to avoid confirming the record's existence), **not** Account B's data.
4. Assert no other side effect occurred (e.g. a PATCH attempt against Account B's `ContentDraft` must not modify it).
5. **`Account`-specific case** (added after independent data-architect review found `Account` itself lacked a test, since it's the ownership root and has no scoping FK of its own to isolate against): assert that no endpoint accepts a client-supplied `account_id`/`id` to fetch a different `Account`'s record — i.e. Account A's authenticated user, given Account B's ID in a request, still only ever resolves to Account A's own account server-side (per [028-m1-technical-design.md](../architecture/social-ai-platform/028-m1-technical-design.md) §2.2's `resolveAccountForUser` rule).

This is a mandatory test category, not an optional hardening pass — every one of the four review agents in the implementation-readiness gate treated missing ownership enforcement as the primary risk in this documentation set, so its test coverage is treated the same way here.

## 4. API Tests

Contract-level tests (distinct from integration tests' behavior focus) verifying: `/api/v1` versioning prefix present on every route; response shape matches [Backend Architecture §14](../architecture/010-backend-architecture.md) exactly (no extra/missing top-level fields); error codes are stable, documented values, not ad hoc strings. Aligns with the `api-review` skill / `api-contract-reviewer` agent per [CLAUDE.md §12](../../CLAUDE.md#12-subagent-routing) — run that review before merging any M1 endpoint, not only at final gate.

## 5. Security Tests

Distinct from ownership isolation (§3), which is IDOR-specific:

- **Brand-intake-gating (Business Error, not authorization):** an account without a confirmed `Brand` profile is rejected with a Business Error, not a generic success or a silent no-op, when calling content-generation endpoints — added after independent architecture review reclassified this from an `AuthorizationProvider` check to a Business Error ([028-m1-technical-design.md](../architecture/social-ai-platform/028-m1-technical-design.md) §2.3); this test closes the gap where an earlier version of the design described this control without any corresponding planned test.
- **Rate limiting:** calling an agent-invoking endpoint (brand intake, content-idea generation, caption/visual-prompt generation) past the account-scoped limit returns the documented rate-limit error code, not a generic System Error or a silent pass-through — added after independent security review found rate limiting entirely undocumented for M1 ([028-m1-technical-design.md](../architecture/social-ai-platform/028-m1-technical-design.md) §3.8). The specific numeric limit is an implementation-time value, not asserted here; the test asserts the mechanism exists and triggers.

- **Authentication boundary:** every M1 endpoint rejects unauthenticated requests (401-class), verified per endpoint, not sampled.
- **Input validation fails safely:** malformed/oversized payloads to brand-intake and content-generation endpoints return a Validation Error, never reach the Service layer or an AI provider call (verified by asserting the mocked `ModelProvider` was not invoked on invalid input).
- **No sensitive data leakage in errors:** System Error responses (e.g. simulated `ModelProvider` failure) never include the underlying provider error message or stack trace in the client-facing response, per [CLAUDE.md §7](../../CLAUDE.md#7-security-and-privacy-rules).
- **Audit logging fires:** account creation, brand-profile changes, and content-draft approval/discard each produce an `AuditLogger.record(...)` call with the correct `actor`/`action`/`resource`/`result` — verified by asserting on a test double, not a real audit backend (none is wired yet).
- **Logging hygiene:** structured logs from M1 endpoints, inspected in tests, must not contain brand content text, AI prompt/response bodies, or credentials at `info` level, per [028-m1-technical-design.md](../architecture/social-ai-platform/028-m1-technical-design.md) §3.7.

## 6. End-to-End Tests

Per [product/mvp-social-ai/027-development-plan.md](../product/mvp-social-ai/027-development-plan.md) §6, using Playwright: the brand-setup journey and the content-ideation journey ([product/mvp-social-ai/020-user-journeys.md](../product/mvp-social-ai/020-user-journeys.md) §1–2) driven end to end against a review environment with a fake `ModelProvider` seeded with deterministic responses (not a real vendor).

## 7. What This Strategy Does Not Define

- No numeric coverage threshold — none exists anywhere in NovaLight's documentation (`.claude/memory/known-risks.md` "No numeric quality thresholds defined"); not invented here.
- No load/performance testing — out of scope until real usage data exists, consistent with [018-saas-architecture.md](../architecture/social-ai-platform/018-saas-architecture.md) §4a's scalability-risk framing (directional, not a Stage 1 requirement).
- No test for MVP Track Stage 2–5 features — this document is M1-scoped only.
