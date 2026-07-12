---
description: Draft a new ADR in the established NovaLight format
argument-hint: <decision being made>
---

# /create-adr

## Purpose

Draft a new Architecture Decision Record using the `adr-authoring` skill.

## Workflow

1. Confirm the decision in `$ARGUMENTS` rises to ADR significance (framework, database, auth, infrastructure, or architectural-pattern change — `docs/engineering/002-engineering-constitution.md` §14).
2. Read `docs/architecture/006-initial-architecture-decisions.md` for the current ADR index and format, and to check for conflicts/supersession needs.
3. Ask whether the new ADR should extend the existing consolidated file or start a new one — this repository's current convention is a single file for ADR-001–014; do not silently deviate.
4. Draft: Status, Decision, Reasoning, Consequences.
5. If superseding an existing ADR, cross-reference it and update its status.
6. Update `.claude/memory/active-decisions.md`.

## Output

The drafted ADR content plus the updated `active-decisions.md` index.

## Prohibited Actions

- Do not edit an existing accepted ADR's Decision to reflect a new choice — supersede it.
