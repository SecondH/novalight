---
description: Produce a current, evidence-based repository map
---

# /repo-map

## Purpose

Produce an accurate map of the repository as it exists right now.

## Workflow

1. Run the `repository-analysis` skill (or delegate to the `repository-mapper` agent for a larger sweep).
2. List actual top-level and second-level directories/files with a one-line purpose each, sourced from `docs/README.md` where applicable.
3. Explicitly separate "exists" from "documented as a future target" (e.g. `apps/`, `packages/` do not exist as of Phase 0).

## Output

- A directory tree of what's actually present, annotated with purpose.
- A short "future/aspirational structure" section listing documented-but-unbuilt paths (`apps/web`, `apps/api`, `packages/ui`, `packages/database`, `packages/ai`, `packages/auth`, `packages/storage`, etc.) with the ADR/doc that specifies each.

## Prohibited Actions

- Do not present an aspirational path as if it currently exists.
