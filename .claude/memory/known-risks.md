# Known Risks

Only evidenced risks are recorded here — no speculative risk assessment. See [[architecture-context]] and [[project-context]] for supporting detail.

## Process gap: ADR written after code, not before (2026-07-12, resolved)

- Evidence: during M1.6 Operational Activation, `apps/api/src/auth/clerk-auth-provider.ts` was implemented in direct response to the user's task list, without first authoring the ADR that both `packages/auth/src/auth-provider.interface.ts`'s own docstring and `docs/security/022-authentication-production-strategy.md` §6-7 explicitly said should precede it. Caught by an independent `solution-architect` review during the same session (the validation pass the user explicitly requested), not proactively.
- Impact: no live behavior changed (the new provider was never wired into `apps/api/src/middlewares/authentication.ts`), so blast radius was zero — but the _process_ (ADR before code, for authentication changes specifically) was violated. This is the second such gap this session (the first: the `docs/development/` numbering collision two sessions earlier). Recorded as a pattern worth attention, not just two unrelated one-offs.
- Recommended action: `docs/architecture/026-clerk-development-integration-decision.md` (ADR-020) now retroactively records the decision, honestly scoped (authorizes the code as written/tested/inactive; does NOT authorize activation, which still requires a real Clerk account, a dedicated `security-reviewer` sign-off, and this ADR moving to Accepted). No further action needed on the code itself.
- Owner: Unknown
- Status: Resolved (ADR authored); the underlying process discipline (write the ADR before, not after, code for authentication/authorization changes) is a standing note for future sessions, not something a memory entry can enforce by itself.

## M1.5 planning — review findings (2026-07-12, resolved)

- Evidence: three independent reviewers (`solution-architect`, `security-reviewer`, `risk-reviewer`) reviewed the M1.5 Production Foundation planning documents. No Critical/High/Blocking findings, but: (1) `docs/security/022-authentication-production-strategy.md` overstated the Clerk cutover as "no consumer code changes" — `apps/api/src/middlewares/authentication.ts` actually imports the concrete `InMemoryAuthProvider` singleton directly, so a real cutover needs a one-line import swap, not zero changes; (2) the repo's `.gitignore` was verified to NOT actually exclude `.env.production`-style files at the repo root or in `apps/api` (only `apps/web` had a real `.env*` wildcard) — a genuine gap, not just a doc inaccuracy; (3) `docs/deployment/021-m1.5-production-foundation-plan.md`'s CI/CD risk was rated "Medium-High" while the same document's own §7 called it a blocker for "everything downstream" — inconsistent severity.
- Impact: all three fixed same-session. `.gitignore` broadened to `.env` + `.env.*` (with `!.env.example` preserved), verified with `git check-ignore`. `022`'s claim corrected to describe the actual one-line change. `021`'s CI/CD risk severity corrected to High. A fourth, non-blocking advisory (whether `docs/operations/` deserves its own category for one file) was surfaced by two reviewers but not acted on — kept as-is since the user explicitly requested this categorization and "deployment" vs. "operations" is a defensible real-world distinction; worth revisiting if `docs/operations/` doesn't gain a second document soon.
- Recommended action: none further on items 1-3 — closed. Item 4 (operations/ category) is a soft, deferred watch-item, not a defect.
- Owner: Unknown
- Status: Resolved (items 1-3); Deferred/monitoring (item 4).

## Correction: global doc-numbering collision, self-caught and fixed (2026-07-12)

- Evidence: during M1 planning, `docs/development/017-mvp-m1-plan.md`, `018-mvp-m1-test-strategy.md`, `019-m1-implementation-status.md` were numbered as if `docs/development/` had its own local counter continuing from the pre-existing `015`/`016`. [ADR-015](../../docs/architecture/017-documentation-structure-for-product-verticals.md) only grants domain-local numbering to named _subdirectories_ of `docs/product/`/`docs/architecture/` — `docs/development/` is a flat top-level category, not a qualifying subdirectory, so this was a real (if easy to make) mistake: `docs/development/017-mvp-m1-plan.md` silently collided with `docs/architecture/017-documentation-structure-for-product-verticals.md`, both claiming "017" in what should be one shared global sequence.
- Impact: caught before it caused real confusion — self-identified at the start of M1.5 planning, before any further global-sequence documents were added on top of the broken state.
- Recommended action: none further — fixed. Renamed the three files to `018`/`019`/`020` (correct next-available global numbers) and updated all 7 referencing files (`docs/README.md`, this file, `docs/architecture/social-ai-platform/{027,028}-*.md`, `docs/readiness/mvp-development-approval.md`, and 3 code-comment references in `apps/api/src/`).
- Owner: Unknown
- Status: Resolved.

## M1 implementation — code-level gate findings (2026-07-12, resolved)

- Evidence: after M1 — SaaS Core Foundation was implemented (`packages/database` schema/migration, `apps/api` repositories/modules/AI-abstraction/auth/middlewares, `apps/web` onboarding skeleton), a five-agent independent review pass (`solution-architect`, `security-reviewer`, `api-contract-reviewer`, `data-architect`, `quality-gate-reviewer`) found zero Critical/High/Blocking findings, but three reviewers independently converged on the same real bug: `Account.ownerUserId` had no database-level unique constraint, so `AccountsService.createAccount`'s check-then-create was vulnerable to a concurrent-request race creating two `Account` rows for one `User`. A fourth reviewer separately found `ContentDraft.contentIdeaId`/`CalendarEntry.contentDraftId`'s existing `@unique` constraints had no P2002 handling in `ContentService`, so a duplicate `generateDraft`/`scheduleDraft` call surfaced as an unhelpful generic 500 instead of a 409.
- Impact: both fixed same-session — `owner_user_id @unique` added to `packages/database/prisma/schema.prisma` (migration regenerated), and `apps/api/src/utils/prisma-errors.ts` gained a `withUniqueConstraintAsBusinessError` helper wired into `accounts.service.ts`, `content.service.ts`'s `generateDraftForIdea`, and `scheduleDraft`. A redundant duplicate index on `Brand.accountId` (unique index already covered it) was also removed. Full lint/typecheck/test/build re-run clean after fixes.
- Recommended action: none further — closed. Retained as the audit trail for this gate, consistent with this file's role as evidenced project memory.
- Owner: Unknown
- Status: Resolved.

## Documentation phase-naming conflict

- Evidence: `docs/architecture/004-system-architecture.md` §10, `docs/product/007-product-vision.md` §8, and `docs/product/009-roadmap.md` each describe a 6-stage (Phase 0–5) evolution using three different sets of Phase 1–5 titles. `004`'s Phase 5 ("Enterprise Platform") differs materially from the product docs' Phase 5 ("AI Social Operating System").
- Impact: risk of building toward an inconsistent long-term target if one document is treated as canonical without reconciliation.
- Likelihood: Low near-term (Phase 0 scope is unaffected), rises at the Phase 0→1 transition.
- Recommended action: human decision to designate one document as canonical for phase naming, or issue a reconciling ADR.
- Owner: Unknown
- Status: Open — flagged in [CLAUDE.md §3](../../CLAUDE.md#3-authoritative-documentation), not resolved. **Update (NovaLight MVP Pivot, 2026-07-11):** `docs/product/mvp-social-ai/026-mvp-roadmap.md` introduces a fifth phase-like sequence ("MVP Track Stage 1–5"); it was deliberately named to avoid colliding with "Phase 1–5" rather than adding a fourth conflicting scheme, but the underlying conflict is still unresolved and now has one more document that will eventually need reconciling against it.

## Stale / dead documentation paths

- Evidence: `docs/engineering/003-claude-code-operating-model.md` references `docs/engineering/engineering-constitution.md` (actual file: `docs/engineering/002-engineering-constitution.md`). Documents `003`, `005`, `006`, `015` reference `docs/decisions/` and `docs/api/`; `015` references `docs/engineering/technical-debt.md`. None of these three paths exist.
- Impact: Claude Code or a contributor could attempt to read/write a nonexistent path, or silently invent a directory structure not decided by a human.
- Likelihood: Medium — these paths are referenced by name in current mandatory-reading documents.
- Recommended action: human decision on whether to create `docs/decisions/`, `docs/api/`, `docs/engineering/technical-debt.md`, or update the referencing documents to point at actual locations (ADRs already live in `docs/architecture/006-initial-architecture-decisions.md`).
- Owner: Unknown
- Status: Open — documented in [conversion report](../../docs/_source/word-to-markdown-conversion-report.md) "Recommended Follow-up Actions."

## Reconstructed document structure needing human review

- Evidence: `docs/architecture/010-backend-architecture.md` sections 15–23 had missing heading markers in the original `.docx` (soft line breaks) and were reconstructed by the conversion tool. `docs/security/014-novalight-threat-model.md` §8 subsections were promoted from H1 to H3 for structural consistency.
- Impact: low probability the reconstructed structure misrepresents original authorial intent, but not verified by a human.
- Likelihood: Low.
- Recommended action: human spot-check of both sections against the original `.docx` files (preserved unchanged alongside the `.md`).
- Owner: Unknown
- Status: Open.

## No recovery/backup strategy documented

- Evidence: [Database Architecture](../../docs/architecture/012-database-architecture.md) states verbatim: "Recovery strategy must be documented before production launch."
- Impact: Critical if reached before Phase 0 exit without remediation — no documented path to recovering from data loss.
- Likelihood: Certain to matter before production; not urgent during Phase 0 (no database exists yet).
- Recommended action: author a recovery/backup ADR or architecture addendum before any production database is provisioned.
- Owner: Unknown
- Status: Open, deferred (no near-term blocker).

## No numeric quality thresholds defined

- Evidence: no document defines a test-coverage percentage, performance SLO, or other numeric quality gate — only qualitative gates (Lint → Type Check → Tests → Build Validation → Security Review).
- Impact: quality-gate skill/agent output cannot claim a specific coverage number is required; risk of Claude Code inventing a threshold if not careful.
- Likelihood: Low if this file and [CLAUDE.md §8](../../CLAUDE.md#8-testing-and-quality-gates) are consulted.
- Recommended action: human decision on thresholds once a codebase exists to measure.
- Owner: Unknown
- Status: Open, deferred.

## RBAC role-taxonomy conflict between PRD and Security Architecture

- Evidence: `docs/product/008-prd.md` §6 "User Roles" lists Individual User / Team Member / Organization Owner / Administrator (labeled "Future roles"). `docs/security/013-security-architecture.md` §7 "RBAC Model" lists Platform Administrator / Organization Owner / Organization Member / Viewer (also labeled "Future roles"). Only "Organization Owner" is common to both; no permission/scope definitions accompany either list. Confirmed independently by both `documentation-reviewer` and `risk-reviewer` agents during the 2026 development-readiness assessment.
- Impact: High — RBAC is security-critical; starting authorization implementation from either document alone risks building an access-control model that diverges from the other, requiring a redesign mid-build.
- Likelihood: High if left unreconciled before any auth/authorization code is written; `CLAUDE.md` gives no precedence rule between PRD and Security Architecture.
- Recommended action: a single reconciling decision (ADR or PRD/security addendum) defining one canonical role taxonomy with explicit permissions, before RBAC-adjacent code is written. This is a product/security tradeoff requiring a human decision — not something to resolve by an agent picking one document as authoritative.
- Owner: Unknown
- Status: Open — newly identified during the development-readiness assessment (see `docs/readiness/development-documentation-gap-analysis.md`). Blocking for RBAC-touching work specifically; not blocking Phase 0 scaffolding/tooling setup. **Update (NovaLight MVP Pivot, 2026-07-11):** the Social AI MVP (`docs/product/mvp-social-ai/`, `docs/architecture/social-ai-platform/`) reaches a real multi-user surface at "MVP Track Stage 3" (Publishing Automation), the third of five MVP stages — a _different_ position in the build sequence than the original Phase-1-first roadmap, where permissions/RBAC work was part of Phase 1, the very next phase after Phase 0. **Correction (independent `risk-reviewer` pass, 2026-07-11):** an earlier version of this note claimed the pivot makes this conflict "block sooner" — that is not supported by the evidence; no effort/calendar estimate exists anywhere in NovaLight's documentation to compare wall-clock timing between the two sequences, and by stage-position alone the pivot arguably defers RBAC relevance (two single-user stages precede it) rather than accelerating it. What's actually true, and unchanged from before this pivot: severity is unaffected, and MVP Track Stage 3 (like the old Phase 1) still cannot proceed without this conflict being reconciled first. `docs/product/mvp-social-ai/019-personas.md` §4 and `022-feature-roadmap.md` Stage 3 both explicitly defer to this open item rather than inventing a role name. Also newly noted by security review: this conflict does **not** excuse Stage 1 from per-account resource-ownership enforcement, which is a separate, non-RBAC requirement — see `docs/architecture/social-ai-platform/018-saas-architecture.md` §4.

## No CI/CD platform or pipeline mechanics documented

- Evidence: `docs/project/001-project-charter.md` §5 lists "CI/CD foundation" as an explicit Phase 0 deliverable. `docs/development/015-development-workflow.md` §13 defines only the qualitative gate sequence (Lint → Type Check → Tests → Build Validation → Security Review) with no CI platform/service named anywhere in `docs/architecture/` or `docs/development/`. ADR-012 covers deployment targets (Vercel/Railway/Supabase) but not build/test automation.
- Impact: Medium-High — the chartered Phase 0 "CI/CD foundation" deliverable cannot be completed without a platform decision.
- Likelihood: Certain to block that specific deliverable if left unresolved; does not block earlier Phase 0 work (repo scaffolding, abstraction interfaces, User model).
- Recommended action: a new ADR selecting a CI platform and mapping the documented gates to actual automation steps. Requires a human/team decision — not something to author speculatively.
- Owner: Unknown
- Status: **Resolved (platform choice) / Open (live repository).** During Phase 0 scaffolding, `.github/workflows/ci.yml` was added implementing the documented gate sequence using GitHub Actions as a default. **Update (M1.5, 2026-07-12):** `docs/architecture/024-cicd-platform-decision.md` (ADR-019) formally proposed GitHub Actions, contingent on confirming GitHub hosting (no git remote configured). **Update (M1.7, 2026-07-12):** ADR-019 finalized to Accepted — across three sessions of work, no evidence anywhere ever named an alternative platform, so the default was accepted rather than left open indefinitely. This closes the "platform choice" half of this risk. **Still genuinely open**: no live repository exists (no `gh` CLI in this environment, no remote configured, zero commits) — that is a distinct, unresolved item requiring the user's direct action, not something ADR-019's acceptance can substitute for. If the eventual live repository is hosted somewhere other than GitHub, ADR-019 must be revisited.

## Next.js major-version drift from ADR-003 at scaffold time

- Evidence: ADR-003 (`docs/architecture/006-initial-architecture-decisions.md`) specifies Next.js 15. Running `create-next-app@latest` during Phase 0 scaffolding resolved to Next.js 16.2.10, since Next.js released a new major version after the ADR was written. `apps/web/package.json` was pinned back to `^15.4.6` to honor the accepted ADR rather than silently drifting to an unapproved newer major version.
- Impact: Low as resolved (pinned to the ADR'd version); would have been Medium if left silently on 16.x, since that's an undecided architectural deviation, not merely a patch update.
- Likelihood: Will recur any time a scaffolding tool is re-run with "latest" against a pinned ADR version — this is a structural risk of using "latest" installers in an ADR-governed repo, not a one-off.
- Recommended action: when re-scaffolding or upgrading, always check the target version against the relevant ADR first; upgrading to Next.js 16 requires a superseding ADR, not a version bump.
- Owner: Unknown
- Status: Resolved for this scaffold (pinned to 15.x); the underlying process risk (tooling drifting past ADR'd versions) remains open as a standing practice note.

## No documentation ownership or approval process defined

- Evidence: `docs/development/015-development-workflow.md` §10 "Pull Request Process" requires review but names no reviewer/approver role; §14 "Documentation Requirements" says what to update but not who approves. No "ownership"/"approval"/"steward" role appears anywhere in `docs/engineering/002-engineering-constitution.md` either.
- Impact: Medium — without a named owner, documentation drift (e.g. the RBAC conflict above) has no accountable resolver, and conflicts can persist indefinitely.
- Likelihood: Medium — already manifesting as the RBAC conflict above.
- Recommended action: human decision naming a documentation owner/approver (person, role, or team) in the development workflow doc.
- Owner: Unknown
- Status: Open — newly identified during the development-readiness assessment. Blocking for completing Phase 0 as chartered (governance foundation is in scope).

## M1 technical design — findings from /architecture-review, /security-review, /review-change (2026-07-11)

- Evidence: `docs/architecture/social-ai-platform/028-m1-technical-design.md`, `docs/architecture/social-ai-platform/027-data-model-scope-decision.md` (ADR-018, now v1.2), `docs/development/018-mvp-m1-plan.md`, and `docs/development/019-mvp-m1-test-strategy.md` were independently reviewed by `solution-architect`, `security-reviewer`, `data-architect`, and `documentation-reviewer` per CLAUDE.md §12 (I authored the documents and can't be the sole approver). One High-severity finding (security-reviewer: no rate-limiting design existed for AI-invoking endpoints — Threat Model §4.5 rates DoS "High" and names "expensive AI requests" specifically), two Medium findings (a stated permission check had no planned test; error-level logging content boundary was left undefined), a data-model condition (`Account` itself — unlike its downstream entities — had no IDOR rule for its own lookup path), an internal inconsistency (a workflow-state check was misclassified as an `AuthorizationProvider` call instead of a Business Error), and a genuine cross-document scheduling conflict (`018-mvp-m1-plan.md` claimed a strictly sequential API-before-agents order "superseded, no contradiction" an earlier plan that had agents independently testable before an API exists — the documentation-reviewer correctly refused to let that contradiction stand).
- Impact: all of the above were **fixed in the same session**, not merely flagged — §3.8 (rate limiting) and the §2.3 reclassification were added to `028-m1-technical-design.md`; the `Account`-lookup IDOR rule and cardinality-notation fix were added to both `028` and ADR-018 (bumped to v1.2); test coverage for both was added to `019-mvp-m1-test-strategy.md`; the scheduling conflict was resolved by correcting `018-mvp-m1-plan.md` to describe D2/D3 as parallel (matching both documents' actual underlying intent) rather than asserting a false "no contradiction." A solution-architect Advisory (terminology fork: `Account` vs. `Organization`/`organization_id`) was also closed with one-line cross-references added to `docs/architecture/004-system-architecture.md` §4.3 and `docs/architecture/012-database-architecture.md` §10.
- Likelihood: Low going forward for these specific items (fixed); the general pattern — independent review catching real gaps in Claude-authored planning docs — is expected to recur each time this workflow runs, which is the point of the reviewer-independence rule, not a defect in it.
- Recommended action: none further needed on the items above. Whoever accepts ADR-018 should review v1.2 in full, not just the v1.1 diff, since the cardinality-notation fix changes wording they may have already read.
- Owner: Unknown
- Status: Resolved (documentation fixes applied); underlying human-acceptance precondition for ADR-018 remains open, unaffected by this round's fixes.

## ADR-015/016/017/018 — accepted (was: "proposed but not yet accepted")

- Evidence: `docs/architecture/017-documentation-structure-for-product-verticals.md` (ADR-015), `docs/architecture/social-ai-platform/017-mvp-pivot-decision.md` (ADR-016), `docs/architecture/social-ai-platform/019-ai-agent-architecture.md` (ADR-017), and `docs/architecture/social-ai-platform/027-data-model-scope-decision.md` (ADR-018, v1.2) were authored by Claude Code during the 2026-07-11 MVP Pivot planning session, each marked Status: Proposed pending human review. **Resolved (2026-07-11):** the user opened the M1 implementation session with "ADR-015, ADR-016, ADR-017, and ADR-018 have been reviewed and accepted" — all four ADR documents' Status fields have been updated to Accepted accordingly. ADR-018's accepted version is v1.2 (includes the `Account` entity added in v1.1 and the cardinality-notation/IDOR-rule corrections added in v1.2), not the original v1.0.
- Impact: implementation work may now cite all four as authorizing the changes they describe, per [CLAUDE.md §3](../../CLAUDE.md#3-authoritative-documentation) rule 2. `docs/architecture/012-database-architecture.md` §5's "Phase 0 database scope is User-only" constraint is now formally superseded for the entities ADR-018 lists (Account, Brand, ContentIdea, ContentDraft, CalendarEntry now; ApprovalHistory/PerformanceRecord at their later stages) — this is the "requirements approved" event that constraint anticipated.
- Recommended action: none — closed. Retained here (rather than deleted) as the audit trail of when and how acceptance happened, consistent with this file's role as evidenced project memory.
- Owner: Unknown (the accepting party's identity/role wasn't stated in the acceptance message — worth naming for traceability if this matters later, per the still-open "no documentation ownership role defined" risk elsewhere in this file).
- Status: Resolved.

## GitHub Delivery Activation Review — real CI failure found, fixed, not yet shipped (2026-07-12)

- Evidence: the repository is now genuinely GitHub-hosted (`https://github.com/SecondH/novalight.git`); the user's status summary described `origin/main`/`origin/develop` as "synchronized," which is true at the Git-ref level (verified: both point to identical commit `07f740a`, zero drift) but was read as implying a healthy pipeline. It does not — the first and only real GitHub Actions run failed at Typecheck. Root cause (confirmed via two independent isolated Docker reproductions of CI's exact Node 20/Linux environment): `packages/database/src/client.ts` re-exports Prisma-generated types that only exist after `prisma generate` runs, and nothing in `npm ci` → `lint` → `typecheck` ever invoked it. Invisible locally throughout this whole engagement because earlier manual `prisma generate` calls had already populated the host's `node_modules/.prisma/client`, masking the gap that only a genuinely fresh install (exactly what CI does) exposes.
- Impact: **Critical, currently live.** GitHub's CI is broken right now. The fix (`"postinstall": "prisma generate"` added to `packages/database/package.json`) exists only in the local uncommitted working tree — not committed, not pushed, per "do not auto-commit unless explicitly instructed" and pushing-to-a-live-remote requiring explicit authorization not yet given. Independently reviewed: `solution-architect` returned Compliant (no ADR needed, minimal fix, two non-blocking advisories re: Turborepo cache visibility and CI network-egress assumption); `security-reviewer` returned Pass on the fix itself and separately raised a High finding on repository posture (see next entry).
- Recommended action: commit and push the fix once authorized; then confirm a genuine push-triggered GitHub Actions run passes end-to-end (the Docker reproduction, while faithful, is not a substitute for observing the real pipeline go green). Full detail: [`docs/readiness/028-m2-development-entry-gate.md`](../../docs/readiness/028-m2-development-entry-gate.md) §4.
- Owner: Unknown — awaiting user authorization to push.
- Status: Open. Root cause and fix are resolved in the working tree; the risk (broken live CI) remains open until the fix actually ships and a real CI run is observed passing.

## Repository posture — no branch protection, zero PRs ever exercised (2026-07-12)

- Evidence: independent `security-reviewer` pass during the GitHub Delivery Activation Review confirmed via GitHub's public REST API: `main` and `develop` both report `"protected": false`; zero pull requests (open or closed) have ever been created on this repository; zero GitHub Environments/secrets are configured (consistent with no deploy step existing yet — not itself a gap).
- Impact: **High.** Any contributor with push access can currently push directly to `main` with zero required review and zero required passing CI status check — a live, technically-unenforced contradiction of CLAUDE.md §8 ("a failed gate blocks merge") and §10 ("never commit directly to `main`"), both enforceable today only by discipline, not configuration. STRIDE mapping: Tampering (High), Repudiation (Medium) per the threat model. Low actual impact today (no product code, no real tenant data, no secrets in the repo), but becomes materially dangerous the moment authentication/authorization/multi-tenant (Account-isolation) code merges, since nothing would stop an unreviewed direct push from shipping an isolation defect.
- Recommended action: human with GitHub repository admin access enables branch protection on `main` (required PR review + required passing status checks), ideally exercised for the first time via the CI-fix PR itself rather than a direct push, before any auth/authz/database-schema work merges. Cannot be applied by Claude Code — no admin API access in this environment.
- Owner: Unknown — requires a human with repository admin rights.
- Status: Open. Per CLAUDE.md §15, this is an escalation-tier finding requiring explicit user approval/decision before proceeding with security-sensitive merges, though it does not block the one-line CI fix itself.

## Missing tests / fragile integrations / operational risks

- **Correction (2026-07-11, caught by independent QA/risk review during the MVP implementation-readiness gate):** this entry previously read "not applicable yet — no code, tests, or integrations exist in the repository." That is stale — the Phase 0 scaffold is physically present in the working tree (`apps/web`, `apps/api`, `packages/database`, `packages/auth`, `packages/ai-core`, `.github/workflows/ci.yml`) and includes at least one real test file (`apps/api/src/health.test.ts`).
- Current state: no _MVP-specific_ code, tests, or integrations exist yet (the Social AI MVP itself is still documentation-only, per `docs/readiness/mvp-development-approval.md`). Phase 0's own scaffold-level tests are minimal (a health-check test) and outside this MVP's scope to expand. Continue to add entries here only once evidenced by actual implementation — do not record speculative risk for code that doesn't exist yet.
