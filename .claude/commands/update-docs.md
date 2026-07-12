---
description: Reconcile documentation with an approved implementation change
---

# /update-docs

## Purpose

Update `docs/` to reflect an approved implementation change, using the `documentation-maintenance` skill.

## Workflow

1. Identify what actually changed in the implementation.
2. Use the `CLAUDE.md` §3 routing table to find every document associated with the change area.
3. Update only what changed — do not rewrite unrelated sections.
4. Preserve the `docs/<category>/<NNN>-<kebab-case-name>.md` convention for any new document.
5. Never edit a `.docx` file — edit the corresponding `.md` only.

## Output

The updated document(s), and a note of what was changed and why.

## Prohibited Actions

- Do not modify `docs/**/*.docx`.
- Do not silently resolve a content conflict between documents while updating — flag it instead.
