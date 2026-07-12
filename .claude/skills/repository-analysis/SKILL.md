---
name: repository-analysis
description: Build an evidence-based picture of the current NovaLight repository state (what actually exists vs. what documentation describes) before planning or implementing anything. Use at the start of any task touching an unfamiliar area, or whenever a documented path/module needs to be verified.
---

# Repository Analysis

## Purpose

Produce a factual, evidence-based inventory of what currently exists in the repository, distinguishing it clearly from what `docs/` describes as a future target. NovaLight's documentation was authored ahead of implementation (Phase 0), so most documented paths do not exist yet — this skill exists specifically to prevent Claude Code from treating aspirational documentation as current reality.

## Use When

- Starting any task in a part of the repository not recently inspected.
- Before referencing a path from `docs/` (e.g. `apps/web`, `packages/database`) in a plan or implementation.
- Before claiming "the codebase already does X."
- At the start of `/repo-map` or `/project-status`.

## Do Not Use When

- The repository area was already verified earlier in the same session and has not changed.

## Required Inputs

- None beyond filesystem access.

## Preconditions

- None.

## Workflow

1. Run a directory listing (`git status --short`, `find`/`Glob` at shallow depth) — do not assume structure from memory or documentation.
2. Cross-reference any path mentioned in the task against actual filesystem state.
3. Check `docs/README.md` and `CLAUDE.md` for the current authoritative document list.
4. Note discrepancies between documented paths and real paths explicitly (do not silently reconcile).
5. Summarize: what exists, what's documented-but-missing, and what's genuinely ambiguous.

## Validation Checklist

- [ ] Every path claimed to exist was actually verified this session.
- [ ] Every documented-but-missing path is called out, not assumed present.
- [ ] No fabricated file names, exports, or configuration values.

## Outputs

- A short inventory: Exists / Documented-but-missing / Ambiguous, each with the evidence (command run or file read).

## Escalation Conditions

- Documentation and repository state conflict in a way that changes the task's feasibility — report to the user before proceeding.

## Prohibited Actions

- Do not create directories or files as a side effect of analysis.
- Do not treat a documented future path as if it currently exists.
