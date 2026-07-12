---
name: implementation
description: Execute an approved plan as the smallest coherent, architecture-compliant change, test-alongside, with a security and documentation pass before completion. Use only after a plan exists (from feature-planning or explicit user direction) for medium/major changes.
---

# Implementation

## Purpose

Carry out an approved change while preserving Clean Architecture boundaries, type safety, and traceability back to the plan/requirement.

## Use When

- An approved plan exists (from `feature-planning`) or the user has given explicit, sufficiently-scoped direction for a minor change.

## Required Inputs

- The approved plan or explicit instruction.
- Confirmation of current repository state via `repository-analysis`.

## Preconditions

- For medium/major changes: a plan exists and required approvals (per [CLAUDE.md §15](../../../CLAUDE.md#15-escalation-rules)) have been obtained.
- Relevant architecture documents have been read per the routing table.

## Workflow

1. Requirements review — confirm the plan/instruction is still accurate against current repo state.
2. Acceptance criteria extraction — know what "done" means before writing anything.
3. Dependency analysis — identify what the change touches and what could break.
4. Minimal implementation plan — smallest coherent diff; no speculative abstraction ahead of requirements (ADR-014).
5. Test-alongside implementation — write/update tests as part of the change, not after.
6. Security review — apply [CLAUDE.md §7](../../../CLAUDE.md#7-security-and-privacy-rules); run `security-review` skill if the change touches auth, data protection, or external integrations.
7. Diff review — read back the full diff before considering the task done.
8. Documentation update — update `docs/` if documented behavior changed.
9. Final verification — run whatever lint/type-check/test/build tooling actually exists (never invent a command).

## Validation Checklist

- [ ] Diff matches the approved plan's scope — no unrelated changes folded in.
- [ ] TypeScript strict-mode compliant once TS exists; no `any`, no unsafe casting.
- [ ] No direct vendor coupling (auth/storage/AI) — abstraction interface used.
- [ ] No secrets introduced; no sensitive data logged.
- [ ] Tests added/updated for the change.
- [ ] Documentation updated if behavior changed.

## Outputs

- The code/config change itself, plus a short note of: what changed, what was tested, what documentation was updated, and any residual risk.

## Escalation Conditions

- The plan turns out to be infeasible or the repository state has diverged from what the plan assumed — stop and re-plan rather than improvising past the approved scope.
- A destructive operation appears necessary — stop and ask.

## Prohibited Actions

- Do not create unnecessary files or abstractions beyond what the plan requires.
- Do not bypass architecture boundaries "temporarily."
- Do not add a dependency without stating the justification.
- Do not implement business logic outside the approved/defined scope (e.g. Phase 0 must not implement product features — see [Project Charter §5](../../../docs/project/001-project-charter.md)).
