# Claude Code Operating Model (NovaLight Workspace)

This document describes the standard task lifecycle this workspace is built around. It complements — and does not replace — [docs/engineering/003-claude-code-operating-model.md](../engineering/003-claude-code-operating-model.md), which is the authoritative engineering document; this file describes how the `.claude/` workspace components map onto that lifecycle.

## Lifecycle

```text
Understand
  → Plan
    → Implement
      → Test
        → Review
          → Secure
            → Document
              → Validate
                → Report
```

## Stage-by-stage mapping to workspace components

| Stage          | Workspace component(s)                                                                  | Purpose                                                                                                                                              |
| -------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Understand** | `repository-analysis` skill, `repository-mapper` agent                                  | Establish evidence-based ground truth before anything else — critical in a repository where documentation describes a target ahead of implementation |
| **Plan**       | `feature-planning` skill, `/plan-feature` command, `feature-plan-template.md`           | Produce an implementation-ready plan without touching source                                                                                         |
| **Implement**  | `implementation` skill                                                                  | Execute the smallest coherent, architecture-compliant change                                                                                         |
| **Test**       | `test-design` skill, `test-plan-template.md`                                            | Define what to test at what level, without inventing coverage thresholds                                                                             |
| **Review**     | `code-review` skill, `quality-gate-reviewer` agent, `/review-change` command            | Independent correctness/architecture/quality check                                                                                                   |
| **Secure**     | `security-review` skill, `security-reviewer` agent, `/security-review` command          | Threat-model-driven check for auth/data/integration changes                                                                                          |
| **Document**   | `documentation-maintenance` skill, `/update-docs` command                               | Reconcile `docs/` with the approved change                                                                                                           |
| **Validate**   | `pre-change-checklist.md`, `implementation-checklist.md`, and stage-specific checklists | Verification against a concrete list, not a vibe check                                                                                               |
| **Report**     | Final summary to the user                                                               | State what changed, what was tested, what remains a risk — per [CLAUDE.md §16](../../CLAUDE.md#16-definition-of-done)                                |

## Change-classification gate

Not every task needs the full lifecycle. Per [docs/engineering/003-claude-code-operating-model.md §8](../engineering/003-claude-code-operating-model.md):

- **Minor** (typo, formatting, isolated utility): proceed directly — skip straight to Implement → Report.
- **Medium** (component addition, API extension, package update): full lifecycle, but agent-based review is optional unless the risk matrix requires it.
- **Major** (architecture modification, database redesign, authentication change): full lifecycle, ADR required, agent-based review required, explicit user approval required before Implement begins.

## Continuous improvement

Per [docs/engineering/003-claude-code-operating-model.md §14](../engineering/003-claude-code-operating-model.md), technical debt, missing documentation, and architectural risk discovered during any stage should be recorded (in `.claude/memory/known-risks.md`, following the evidence-based structure already established there) — not silently fixed outside the requested scope, and not silently ignored.
