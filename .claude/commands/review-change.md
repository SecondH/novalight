---
description: Review the current diff against NovaLight's architecture, security, and quality rules
---

# /review-change

## Purpose

Independently review the current working diff before it's considered complete.

## Workflow

1. Run `git diff` (and `git diff --stat`) to get the full change set.
2. Apply the `code-review` skill for correctness/maintainability findings.
3. If the diff touches auth, sensitive data, or external integrations, additionally invoke `security-reviewer`.
4. If the diff touches module boundaries, new packages, or dependencies, additionally invoke `solution-architect`.
5. If the diff touches API endpoints, additionally invoke `api-contract-reviewer`.
6. If the diff touches schema/migrations, additionally invoke `data-architect`.
7. Consolidate all findings, classified P0–P3.

## Output

A single findings list ordered P0 → P3 (file/line, issue, impact, evidence, recommended fix, confidence), or an explicit "no findings."

## Prohibited Actions

- Do not modify the reviewed code as part of this command — review only.
