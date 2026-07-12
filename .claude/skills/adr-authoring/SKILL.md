---
name: adr-authoring
description: Draft a new Architecture Decision Record in NovaLight's established ADR format when a major architectural decision is made or an existing ADR needs to be superseded. Use for framework changes, database strategy, authentication approach, infrastructure changes, or new architectural patterns.
---

# ADR Authoring

## Purpose

Record a major architectural decision in the format established by [docs/architecture/006-initial-architecture-decisions.md](../../../docs/architecture/006-initial-architecture-decisions.md), preserving NovaLight's architectural memory.

## Use When

- A framework change, database strategy change, authentication approach change, infrastructure change, or new architectural pattern is being decided ([Engineering Constitution §14](../../../docs/engineering/002-engineering-constitution.md)).
- An existing accepted ADR needs to be superseded.
- Backing skill for `/create-adr`.

## Required Inputs

- The decision being made, and the alternatives considered.

## Preconditions

- Confirm this rises to the level of an ADR (not every choice needs one — only decisions matching [Engineering Constitution §14](../../../docs/engineering/002-engineering-constitution.md) examples).
- Read existing ADRs to check for conflicts or supersession needs.

## Workflow

1. Determine the next ADR number by inspecting `docs/architecture/006-initial-architecture-decisions.md` for the highest existing ADR number (currently ADR-001–014, all in one file — confirm whether new ADRs should extend this file or start a new one; ask if unclear, since the existing pattern is a single consolidated file, not one-file-per-ADR).
2. Draft using the established structure: Status, Decision, Reasoning, Consequences (Positive/Trade-off where applicable).
3. If superseding an existing ADR, state which ADR is superseded and why, and update that ADR's status rather than silently leaving it contradicted.
4. Update [.claude/memory/active-decisions.md](../../memory/active-decisions.md) index with the new/changed entry.

## Validation Checklist

- [ ] ADR number doesn't collide with an existing one.
- [ ] Status, Decision, Reasoning, Consequences all present.
- [ ] Any superseded ADR is explicitly cross-referenced and its status updated.
- [ ] `active-decisions.md` index updated.

## Outputs

- The ADR entry (or new file, per the placement decision above) and an updated `active-decisions.md`.

## Escalation Conditions

- Ambiguity about whether to extend the existing consolidated ADR file or create a new per-decision file — ask the user; do not decide silently, since it changes the project's documentation convention.

## Prohibited Actions

- Do not edit the Decision/Consequences of an existing accepted ADR to reflect a new choice — supersede it instead, preserving history.
- Do not author an ADR for a decision that doesn't rise to architectural significance.
