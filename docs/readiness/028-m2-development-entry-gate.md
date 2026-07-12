# M2 Development Entry Gate — GitHub Delivery Activation Review

**Type:** Point-in-time readiness assessment (see numbering note below).
**Date:** 2026-07-12.
**Scope:** verify the now-GitHub-hosted repository's Git workflow, CI/CD readiness, and overall project maturity; determine whether M2 (first product feature work) may begin. No M2 product code was written to produce this assessment.

## Numbering note (flagged, not silently resolved)

This file was requested at `docs/readiness/028-m2-development-entry-gate.md`. Per [`docs/README.md`](../README.md), `docs/readiness/` is one of two directories explicitly **excluded** from the flat global `NNN` sequence (the other is `docs/ai-workspace/`) — every existing sibling in this directory is unnumbered (`development-readiness-report.md`, `development-entry-checklist.md`, `architecture-readiness-checklist.md`, `social-ai-mvp-development-readiness.md`, `mvp-development-approval.md`, `development-documentation-gap-analysis.md`). `028` does not collide with anything in the global sequence (the highest number in use is `027`, `docs/operations/027-m1.7-delivery-foundation-report.md`), so creating this file does not corrupt that sequence — but it does depart from this directory's own established unnumbered convention. Filename honored as requested; deviation recorded here per the same transparency pattern used for `docs/deployment/`/`docs/operations/` category creation at M1.5. No action taken beyond flagging it.

## 1. Executive summary

**The repository is genuinely GitHub-hosted and the two branches are genuinely synchronized at the Git level** — but the user's status framing ("origin/main and origin/develop are synchronized") does not mean CI is healthy. It is not. **The first and only real CI run on GitHub failed at the Typecheck step.** This was discovered during this review, root-caused, fixed, and independently verified — but the fix exists only in the local uncommitted working tree. **As of this document, GitHub's CI is still broken.**

**Recommendation: M2 must not start yet.** Not because of missing documentation — Phase 0/M1/M1.5/M1.6/M1.7 documentation is extensive and largely sound — but because of one concrete, unresolved technical blocker (broken CI, fix not yet shipped) and two pre-existing human-decision gates that this review re-confirms as still open. See §7.

## 2. Current maturity assessment

| Area                                   | State                        | Evidence                                                                                                                                                                                                                                                                                                                                    |
| -------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Documentation foundation               | Mature                       | 14 accepted ADRs (001–014) plus ADR-015–019 accepted, ADR-020 Proposed; full architecture/security/product/development doc set; `docs/README.md` index accurate as of this review                                                                                                                                                           |
| Monorepo scaffolding                   | Complete for Phase 0 scope   | `apps/web`, `apps/api`, `packages/{database,auth,ai-core}` exist; Turborepo wired; verified via `turbo run lint/typecheck/test/build` all green after this review's fix                                                                                                                                                                     |
| M1 SaaS Core Foundation                | Implemented                  | Real schema/migration (`packages/database`), real repositories/services/middlewares (`apps/api`), onboarding skeleton (`apps/web`) — five independent reviewer agents found zero Critical/High findings after fixes ([`.claude/memory/known-risks.md`](../../.claude/memory/known-risks.md) "M1 implementation — code-level gate findings") |
| Local dev environment                  | Genuinely activated          | Docker Compose Postgres, real `prisma migrate deploy` applied, real DB-backed tests passing locally (M1.6)                                                                                                                                                                                                                                  |
| CI/CD pipeline definition              | Present, documented          | `.github/workflows/ci.yml` — checkout → setup-node → install → lint → typecheck → migrate → test (with Postgres service container + `RUN_DB_INTEGRATION_TESTS`) → build; no deploy step (intentional, per M1.6/M1.7 instruction not to deploy yet)                                                                                          |
| CI/CD pipeline, live execution         | **Broken as of this review** | First real GitHub Actions run failed at Typecheck; root cause found and fixed locally; **fix not yet committed or pushed** — see §4                                                                                                                                                                                                         |
| Repository governance controls         | Not configured               | No branch protection on `main` or `develop`; zero PRs ever opened; zero GitHub Environments/secrets configured — see §3, §6                                                                                                                                                                                                                 |
| RBAC role taxonomy                     | Still open                   | `docs/product/008-prd.md` §6 vs. `docs/security/013-security-architecture.md` §7 disagree; unresolved since the original development-readiness assessment                                                                                                                                                                                   |
| CI/CD platform decision, documentation | Resolved                     | ADR-019 Accepted (GitHub Actions)                                                                                                                                                                                                                                                                                                           |
| Documentation ownership role           | Still open                   | No named reviewer/approver role exists anywhere in `docs/`                                                                                                                                                                                                                                                                                  |

## 3. Repository activation status

Verified directly against the live repository (`https://github.com/SecondH/novalight.git`) via `git` and the unauthenticated GitHub public REST API (no `gh` CLI or token available in this environment — authenticated-only data, e.g. Actions log contents and full branch-protection detail, could not be pulled; everything reported below is from data the public API does expose).

- **Hosting**: real, public GitHub repository. Default branch `main`.
- **Branches**: `main` and `develop` both exist on the remote and both point to the identical single commit `07f740a` ("chore: initialize NovaLight repository baseline"). Verified zero drift between local `main`, local `develop`, `origin/main`, and `origin/develop` (`git rev-parse` on all four, `git diff --stat` on all pairs — no output, confirming identity).
- **Branch protection**: **none.** GitHub API reports `"protected": false` for both `main` and `develop`. No required-review rule, no required-status-check rule, no restriction on direct pushes.
- **Pull requests**: **zero**, open or closed, ever created. The PR workflow has never actually been exercised on this repository.
- **GitHub Environments**: **zero** configured. Consistent with the fact that no deploy step exists yet — not a gap for the current pipeline, but will become one before any real deployment (see [`docs/deployment/021-m1.5-production-foundation-plan.md`](../deployment/021-m1.5-production-foundation-plan.md)).
- **Secrets**: none configured at the repository or environment level; none are currently required by `ci.yml` (its one environment variable, `DATABASE_URL`, points at the ephemeral in-run Postgres service container, not a real secret).

**PR workflow readiness**: the workflow file itself does not gate on PR-vs-push (`ci.yml` triggers are not shown to differentiate in a way reviewed here beyond confirming it runs on push to `main`, which is how the first failure was observed) — but with zero branch protection, a PR is not currently _required_ to reach `main` at all. This is the gap the independent security review (§5) rated High.

**Branch protection recommendations** (cannot be applied by Claude Code — no admin API access in this environment; requires a human with repository admin rights):

1. Require a pull request before merging to `main` (and, once a working `develop`-based flow is adopted, to `develop`).
2. Require the CI `validate` job to pass before merge (this alone would have caught the Typecheck failure in §4 before it reached `main`, instead of via manual post-hoc discovery).
3. Require at least one review approval, consistent with CLAUDE.md §10 "never commit directly to `main`" and §12 reviewer-independence intent extended to human review.
4. Restrict force-push and branch deletion on `main`.

## 4. CI/CD readiness — the central finding of this review

### 4.1 What was verified as sound

- `.github/workflows/ci.yml` structure is valid and matches its documented design: checkout → Node setup via `.nvmrc` (Node 20) → `npm ci` → lint → typecheck → Prisma migration apply → test (Postgres service container, `RUN_DB_INTEGRATION_TESTS=1`) → build. No deploy job — correct and intentional per the standing "no production deployment yet" instruction carried through M1.6/M1.7.
- The Postgres service container is correctly configured and does support the DB-integration test path (this was exercised and confirmed working in earlier M1.7 work, and nothing in this review found a regression there).
- No missing secrets or environment variables were identified for the pipeline **as currently scoped** (no deploy step means no deploy-time secrets are needed yet).

### 4.2 What was found broken — and had not been previously disclosed

**The first-ever real GitHub Actions run on this repository (triggered by the initial push that created `origin/main`/`origin/develop`) failed at the Typecheck step.** This directly contradicts a "synchronized" status if that phrase is read to imply a healthy pipeline — the branches are synchronized at the Git-ref level; the CI pipeline itself has never once passed on GitHub.

**Root cause**, confirmed via two independent, isolated Docker reproductions of CI's exact environment (Node 20.20.2, Linux — matching `.nvmrc` and the GitHub Actions `ubuntu-latest` runner, using an isolated exported copy of the repository rather than a live bind-mount, to avoid contaminating the host — see §4.4):

`packages/database/src/client.ts` re-exports Prisma-generated model types (`User`, `Account`, `Brand`, `ContentIdea`, `ContentDraft`, `CalendarEntry`, `Vertical`, `ApprovalState`, `PostedState`) from `@prisma/client`. Those types are generated on demand by `prisma generate` — they do not exist in a fresh `node_modules/@prisma/client` until that command runs. Nothing in the install or build sequence (`npm ci` → `lint` → `typecheck`) ever invoked `prisma generate` before `typecheck` ran. The first reproduction (before any fix), on a genuinely fresh `npm ci`, reproduced the exact failure: 9× `TS2305: Module '"@prisma/client"' has no exported member '...'` in `@novalight/database:typecheck`, matching what the real GitHub Actions run experienced.

This was invisible throughout all prior local work in this engagement because manual `prisma generate` calls during earlier sessions had already populated the host machine's `node_modules/.prisma/client` — masking the gap that only manifests on a genuinely clean install, exactly what CI performs and what a new contributor's first clone would also hit.

**Fix applied (uncommitted)**: added one line, `"postinstall": "prisma generate"`, to `packages/database/package.json`'s `scripts` block. This is Prisma's own documented convention for workspace packages that re-export generated types, and is the correct, minimal remediation.

**Fix verified**: a second, fully independent isolated Docker reproduction — fresh `npm ci` against the fixed `package.json`, then a forced no-cache `turbo run typecheck` — passed cleanly (`Tasks: 8 successful, 8 total`, all five packages, zero cached results). The host development environment was also separately fully validated after this work (clean reinstall, full lint/typecheck/test/build pass: 40 tests passed, 3 correctly-skipped DB-gated tests).

**Current git state**: the fix exists ONLY in the local working tree (`packages/database/package.json`, plus the resulting `package-lock.json` lockfile update reflecting the new `hasInstallScript` flag). It has **not been committed** (per CLAUDE.md §10, "do not auto-commit unless explicitly instructed") and **not been pushed** (pushing to a live, real, already-connected GitHub remote is a "visible to others" action per the operating instructions, requiring explicit authorization not yet given for this specific push).

**Consequence: GitHub's CI is still broken right now, as this document is written.** Any push to `main` or `develop` today will fail Typecheck exactly as the first run did, until this fix is committed and pushed. This is the single most important fact in this review and the primary reason M2 cannot start yet — a broken, never-once-green CI pipeline cannot be relied on to catch defects in new M2 feature code.

### 4.3 Two independent review passes on the fix

Per CLAUDE.md §12 (an agent that authors a change must not be its sole approver), the fix was reviewed by two independent agents that did not author it:

- **`solution-architect`**: **Compliant.** No dependency-direction violation, no vendor-abstraction bypass, justified under ADR-014 (minimal, reproduced-defect-driven), correctly classified as a Minor build-config fix requiring no new ADR. Two non-blocking advisories noted: the `postinstall` hook runs outside Turborepo's task graph (no caching/visibility there — acceptable today, worth a future `turbo.json` `generate` task if that matters later), and `prisma generate` may require network access for its query-engine binary (not an issue on GitHub's `ubuntu-latest` runners, worth confirming for any future offline/sandboxed dev setup).
- **`security-reviewer`**: **Pass** on the fix itself — no new dependency introduced, no secret required, no untrusted input, standard idiomatic Prisma pattern, transparent in the lockfile diff. Separately, this same review raised a **High-severity finding on repository posture** (not on the fix) — see §5.

### 4.4 A self-inflicted incident during this review, disclosed in full

The first Docker reproduction attempt bind-mounted the live working repository directly into a container to test the CI environment. This was unsafe and caused real damage: it let the container's Linux `turbo` replay stale cached results instead of genuinely re-executing (a false-negative reproduction, caught only because the result was suspiciously instantaneous), and — because a bind mount is live, not a copy — the container's `npm ci` wrote Linux-native binaries into the same `node_modules` the Windows host uses, breaking the host's ability to run `turbo` at all.

This was disclosed to the user in real time as it happened, not discovered later or hidden. It was fully repaired via a complete clean reinstall (`rm -rf node_modules` and all `.turbo` caches across the monorepo, then a fresh `npm install`), verified via the full green lint/typecheck/test/build pass reported in §4.2. All subsequent reproductions used an isolated exported copy of the repository (`git archive` / `tar --exclude=node_modules --exclude=.turbo --exclude=.git`) mounted into the container instead — the safe pattern, now used for the remainder of this review and worth retaining as standing practice for any future CI reproduction work.

No repository content was lost. The corruption was confined to the host's local `node_modules`/`.turbo` caches, which are gitignored, regenerable build artifacts — not source.

## 5. Security review findings (independent `security-reviewer` pass)

- **The `postinstall` fix itself: Pass.** No new supply-chain exposure — no new dependency, no network/remote-code-execution introduced beyond what `prisma`'s existing, already-trusted, already-manually-invoked script does. `package-lock.json`'s one-line `hasInstallScript: true` diff is the correct, transparent signal for this change, not evidence of anything concealed.
- **Repository exposure posture: High finding.** Public repository, `main` and `develop` both unprotected, zero PRs ever opened, first CI run failed. This means any contributor with push access can currently push directly to `main` with zero required review and zero required passing CI — a live, technically-unenforced contradiction of CLAUDE.md §8 ("a failed gate blocks merge") and §10 ("never commit directly to `main`"), both of which today are enforceable only by contributor discipline, not by GitHub configuration. Mapped to the threat model's STRIDE categories: Tampering (High) and Repudiation (Medium). Current actual impact is contained — no product features, no real user/tenant data, no secrets exist in the repo yet — but this gap becomes materially more dangerous the moment authentication, authorization, or multi-tenant (Account-isolation) code is merged, since an unreviewed direct push could ship an authorization bypass or tenant-isolation defect with nothing to catch it.
  - **Per CLAUDE.md §15 escalation rules, this finding requires explicit user approval/decision before proceeding** — specifically, enabling branch protection (required PR review + required passing status checks) is recommended before any authentication/authorization/database-schema work merges. It does not block the one-line postinstall fix itself, which is low-risk on its own.
- **Secrets posture: not a blocker, correctly scoped to today's needs.** Zero GitHub Environments/secrets configured is consistent with the pipeline having no deploy step and using only an ephemeral, non-production Postgres credential. This will become a real gate at the point `docs/deployment/021-m1.5-production-foundation-plan.md`'s deployment work actually begins — not now.

## 6. Workspace audit (`.claude/` maturity)

Evidence gathered: `.claude/README.md`, `docs/ai-workspace/*.md`, and a full inventory of workspace components.

- **13 skills** (`repository-analysis`, `architecture-review`, `feature-planning`, `implementation`, `code-review`, `security-review`, `test-design`, `api-review`, `database-change-review`, `dependency-review`, `adr-authoring`, `documentation-maintenance`, `visual-content-generation`) — exact 1:1 match with the CLAUDE.md §13 routing table. No overlap or duplication found between skills.
- **9 agents** (`repository-mapper`, `solution-architect`, `api-contract-reviewer`, `data-architect`, `documentation-reviewer`, `risk-reviewer`, `quality-gate-reviewer`, `security-reviewer`, `visual-intelligence-prompt-engineer`) — exact 1:1 match with CLAUDE.md §12. Reviewer-independence model is coherent: each review agent has read-only tools (`Glob`, `Grep`, `Read`, `Bash`) and no `Edit`/`Write` access, structurally preventing a reviewer from silently fixing what it's reviewing.
- **10 commands** — exact 1:1 match with CLAUDE.md §14, each a thin wrapper sequencing skills/agents, consistent with `.claude/README.md`'s stated design intent.
- **5 hooks** (`block-destructive-commands.js`, `block-secrets.js`, `protect-main-branch.js`, `protect-sensitive-paths.js`, `quality-reminder.js`) — all present; `block-secrets.js`'s compound-identifier detection fix from M1.6 remains in place (spot-checked, not re-modified this review). The previously-noted gap (doesn't independently catch secrets embedded inside URL/connection-string values) remains open and is unchanged by this review's work — no new instance of it was introduced or found.
- **4 `docs/ai-workspace/` documents** present and internally consistent with `.claude/README.md`'s description of the workspace design.
- **`.claude/memory/known-risks.md`**: comprehensive, evidenced, actively maintained — 13 entries, each with evidence/impact/likelihood/recommended-action/status, several explicitly marked Resolved with an audit trail rather than deleted. This review adds one new entry (§8) rather than duplicating the existing CI/CD-platform entry, which already correctly distinguished "platform choice: resolved" from "live repository: open" — that entry's "open" half is now further refined by this review's concrete finding.
- **No critical workspace gaps found** in this pass. This audit did not attempt to re-score every maturity-model category from `docs/ai-workspace/workspace-maintenance-runbook.md` from scratch (that would duplicate the full audit already on file); it focused on confirming the routing tables (skills/agents/commands) still match reality 1:1 and that known-risks.md remains accurate — both hold.

## 7. Remaining blockers

1. **CI is broken on GitHub right now.** Fix exists locally, uncommitted, unpushed. Blocking until committed and pushed, and until a genuinely fresh push-triggered GitHub Actions run is observed to pass (not just the local Docker reproduction).
2. **No branch protection on `main`/`develop`.** Rated High by independent security review. Requires a human with GitHub admin access — cannot be applied by Claude Code via the unauthenticated public API used for this review.
3. **RBAC role taxonomy still unreconciled** (`docs/product/008-prd.md` §6 vs. `docs/security/013-security-architecture.md` §7). Unchanged since the original development-readiness assessment. Does not block M2 entry generally, but blocks any RBAC/authorization-touching work specifically, which is relevant the moment M2 introduces multi-user surfaces.
4. **No documentation-ownership/approval role named.** Unchanged since the original development-readiness assessment. Does not block M2 code, but leaves documentation-conflict resolution (like item 3) without a named accountable resolver.
5. **Zero PRs ever exercised.** The PR-based review workflow this project's own documentation assumes (CLAUDE.md §10, Development Workflow §10) has literally never been used once on this repository. Not a defect in itself, but means the workflow is unverified in practice, not just unconfigured in policy.

## 8. Required human decisions

- **Authorize (or decline) committing and pushing the CI fix** (`packages/database/package.json`'s `postinstall` addition) to `origin/develop`/`origin/main`. This is the single action that unblocks the most urgent item in §7.
- **Configure branch protection** on `main` (and, once a real branching flow is exercised, `develop`) — requires GitHub repository admin access this environment does not have.
- **Reconcile the RBAC role taxonomy** (PRD vs. Security Architecture) — a product/security tradeoff decision, not something an agent should pick for the team.
- **Name a documentation-ownership/approval role.**
- **Decide whether the first real M2 work should be preceded by actually exercising the PR workflow once** (e.g., landing the CI fix itself via a PR rather than a direct push) as a live rehearsal of the review process CLAUDE.md assumes — recommended given item 5 above, but a judgment call for the user, not a hard gate.

## 9. M2 implementation approval status

**Not approved. M2 product feature work should not begin yet.**

This is not a documentation-maturity judgment — Phase 0 through M1.7 documentation and implementation are in good shape, and the independent architecture review of this review's own fix returned a clean Compliant verdict. The blocker is narrower and more concrete: **the live CI pipeline this project depends on to catch defects has never once passed, the fix for why is sitting uncommitted, and the repository has zero technical safeguard (branch protection, required review) against a broken or unreviewed change reaching `main`.** Starting M2 feature work against a CI pipeline that has never been green, with no merge gate in front of it, would let the same class of failure just diagnosed here recur silently on the very first real feature PR.

**Path to approval**: (1) commit and push the CI fix, (2) observe one genuine GitHub-triggered CI run pass end-to-end, (3) get a human decision on branch protection (even a minimal required-status-check rule materially closes the largest gap found here). Items 3–4 in §7 (RBAC, documentation ownership) do not need to block M2 _entry_ generally, but do block the first RBAC/authorization-adjacent work specifically — flag this to whoever picks the first M2 feature so an early collision isn't a surprise.

## Files changed (this review)

- `packages/database/package.json` — added `"postinstall": "prisma generate"` (the CI fix; uncommitted).
- `package-lock.json` — auto-updated lockfile reflecting the above (uncommitted).
- `docs/readiness/028-m2-development-entry-gate.md` — this document (new).
- `docs/README.md` — to be updated (§ Development Readiness table) to index this document.
- `.claude/memory/known-risks.md` — to be updated with this review's CI-failure-found-and-fixed-but-unshipped risk entry.

## Tests executed

- Two independent isolated Docker Node 20/Linux reproductions of the GitHub Actions CI environment (before-fix: reproduced the real 9× `TS2305` failure; after-fix: `turbo run typecheck` passed 8/8, forced no-cache).
- Full local host validation after repairing the self-inflicted `node_modules` corruption from §4.4: `lint` (0 errors, only pre-existing warnings), `typecheck` (8/8 success), `test` (40 passed, 3 correctly-skipped DB-gated tests), `build` (clean).
- No new M2/product-feature tests — none were written, consistent with the "do not implement M2 features" instruction.

## Risks

See §7 (Remaining blockers) and the new `known-risks.md` entry (§8 of this document's companion memory update). Summary: CI-broken-and-unshipped-fix (Critical, immediate), no branch protection (High), RBAC taxonomy unresolved (High, latent until authorization work starts), no documentation-ownership role (Medium), PR workflow never exercised (Medium, procedural).

## Recommendation

**M2 should not start yet.** Recommend, in order: (1) get explicit authorization to commit and push the CI fix, (2) confirm the resulting GitHub Actions run is genuinely green, (3) get a human decision on branch protection. Once those three are done, M2 entry is reasonable — the RBAC and documentation-ownership gaps (§7 items 3–4) are real but narrower, and can be tracked as known open items rather than hard blockers to _starting_ M2, provided the first feature picked doesn't require RBAC.
