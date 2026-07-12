---
name: documentation-maintenance
description: Keep NovaLight's documentation consistent with actual repository state and internally consistent with itself — fix broken links, flag (not silently resolve) conflicting content, update docs after an approved implementation change. Use after any change that alters documented behavior, and periodically to check link/content integrity.
---

# Documentation Maintenance

## Purpose

Keep `docs/` accurate, internally consistent, and traceable to the code it describes — without ever silently inventing or resolving a conflict on the documentation author's behalf.

## Use When

- After an approved implementation change alters previously documented behavior.
- Backing skill for `/update-docs` and `/verify-links`.
- Periodic integrity checks of the documentation set.

## Required Inputs

- Either the implementation change that needs reflecting, or a request for a documentation integrity check.

## Preconditions

- None.

## Workflow

1. For an implementation-driven update: identify every document the routing table in [CLAUDE.md §3](../../../CLAUDE.md#3-authoritative-documentation) associates with the change area, and update only what actually changed.
2. For an integrity check: verify every relative link in `docs/**/*.md` and `CLAUDE.md` resolves to an existing file.
3. Check for content conflicts between documents (e.g. the known Phase 1–5 naming conflict across `004`, `007`, `009` — see [[known-risks]] in memory) — report, do not silently pick a winner.
4. Preserve the `docs/<category>/<NNN>-<kebab-case-name>.md` numbering convention for any new document, numbered sequentially across the whole tree.
5. Never modify a `.docx` file — edit the corresponding `.md` only.
6. If a document references a path that doesn't exist (`docs/decisions/`, `docs/api/`, `docs/engineering/technical-debt.md`), do not create the path speculatively — ask whether it should be created, or whether the stale reference should be corrected.

## Validation Checklist

- [ ] Every link checked resolves, or is explicitly reported as broken.
- [ ] No document conflict was resolved without flagging it to the user first.
- [ ] New documents follow the numbering/naming convention.
- [ ] No `.docx` file was modified.

## Outputs

- Either the updated document(s), or an integrity report (broken links, conflicts found, stale references).

## Escalation Conditions

- A conflict is found between two authoritative documents — report it; do not decide which is correct.

## Prohibited Actions

- Do not modify `docs/**/*.docx`.
- Do not silently reconcile conflicting documentation content.
- Do not create `docs/decisions/`, `docs/api/`, or similar referenced-but-missing paths without asking first.
