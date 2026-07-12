---
description: Summarize current NovaLight phase, what actually exists vs. what is documented-but-not-built
---

# /project-status

## Purpose

Give a truthful, evidence-based snapshot of where the NovaLight project actually stands, distinct from what the documentation aspires to.

## Workflow

1. Invoke the `repository-analysis` skill (or `repository-mapper` agent) to enumerate what currently exists on disk.
2. Read `docs/project/001-project-charter.md` §4-5 to restate the current phase (Phase 0 — Engineering Foundation) and its included/excluded scope.
3. Read `.claude/memory/active-decisions.md` for the current ADR index.
4. Read `.claude/memory/known-risks.md` for open items.
5. Cross-check Phase 0 success criteria (Project Charter §9) against actual repository state.

## Output

- Current phase and its defined scope (included/excluded).
- What exists on disk right now (from repository-analysis), vs. what's documented as a future target.
- Open risks/decisions from memory.
- A one-line honest verdict: how close is the repository to Phase 0's success criteria?

## Prohibited Actions

- Do not claim progress that isn't evidenced by an actual file/directory.
