---
description: Check that all relative links in docs/ and CLAUDE.md resolve
---

# /verify-links

## Purpose

Verify every relative link in `docs/**/*.md` and `CLAUDE.md` points to a file that actually exists.

## Workflow

1. Invoke the `documentation-maintenance` skill / `documentation-reviewer` agent.
2. Extract every markdown relative link from `docs/**/*.md` and `CLAUDE.md`.
3. Resolve each against the filesystem.
4. Separately note known, already-flagged dead references (`docs/decisions/`, `docs/api/`, `docs/engineering/technical-debt.md`, `docs/engineering/engineering-constitution.md`) versus any newly discovered broken link.

## Output

A list of broken links (source file, line, target) and a confirmation count of links checked/resolved.

## Prohibited Actions

- Do not silently fix a broken link by creating the missing target file.
