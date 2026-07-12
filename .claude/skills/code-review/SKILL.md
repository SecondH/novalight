---
name: code-review
description: Review a diff for correctness, architecture compliance, security, performance, and maintainability, classifying findings by severity. Use before considering any non-trivial change complete, and always before merge once a review process exists.
---

# Code Review

## Purpose

Independently assess a diff against NovaLight's architecture rules and engineering standards, producing severity-classified, evidence-based findings.

## Use When

- Before finalizing any medium/major change.
- Backing skill for `/review-change`.

## Required Inputs

- The diff to review (`git diff`), and the plan/requirement it implements if available.

## Preconditions

- Reviewer should not be the same reasoning pass that wrote the change where independence is feasible (see [agent-governance.md](../../../docs/ai-workspace/agent-governance.md) reviewer-independence rule) — for agent-driven review, route to `quality-gate-reviewer` rather than self-approving.

## Workflow

1. Read the full diff — do not sample.
2. Check correctness: does the code do what it claims? Any logic errors, edge cases, off-by-ones?
3. Check architecture: layering respected (Controller/Service/Repository), no direct vendor coupling, dependency direction preserved.
4. Check security: input validation present, no secrets, no sensitive logging, authz checks present where required.
5. Check performance: obvious inefficiencies, N+1 patterns, unnecessary re-renders (frontend).
6. Check maintainability: naming, duplication, unnecessary abstraction, dead code.
7. Classify each finding.

## Severity classification

```text
P0 — Critical  (security hole, data loss risk, breaks architecture invariant)
P1 — High      (correctness bug, missing required validation/auth check)
P2 — Medium    (maintainability, missing test, minor architecture drift)
P3 — Low       (style, naming, non-blocking nit)
```

Each finding: file and line, issue, impact, evidence, recommended correction, confidence level.

## Validation Checklist

- [ ] Every finding cites a specific file/line and evidence, not a general impression.
- [ ] Findings are classified P0–P3.
- [ ] No finding fabricates behavior not present in the diff.

## Outputs

- A findings list ordered P0 → P3, or an explicit "no findings" if the diff is clean.

## Escalation Conditions

- Any P0 finding — do not let the change proceed to merge without it being resolved or explicitly accepted by the user.

## Prohibited Actions

- Do not modify the code being reviewed as part of this skill — review and implementation are separate passes.
- Do not soften a P0/P1 finding to avoid conflict.
