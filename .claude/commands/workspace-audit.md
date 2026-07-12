---
description: Score this Claude Code workspace's own maturity and report gaps
---

# /workspace-audit

## Purpose

Evaluate the `.claude/` workspace itself (not the NovaLight product) for clarity, coverage, redundancy, and staleness, using the maturity model in `docs/ai-workspace/workspace-maintenance-runbook.md`.

## Workflow

1. Read `.claude/README.md` and `docs/ai-workspace/claude-workspace-architecture.md` for the intended design.
2. For each category in the maturity model (instruction clarity, documentation coverage, skill quality, agent specialization, command usefulness, hook effectiveness, security controls, testing integration, architectural alignment, redundancy, stale content, false-positive hooks, missing escalation rules, context efficiency), gather evidence:
   - List all skills/agents/commands/hooks and check for overlapping responsibility.
   - Check every skill/agent references real repository paths (spot-check a sample).
   - Check hooks against their documented test cases in `docs/ai-workspace/workspace-maintenance-runbook.md`.
   - Check for components unused since creation (best-effort, no telemetry available — note this limitation).
3. Score each category 0–10 **only where evidence supports a score**; otherwise mark "insufficient evidence" rather than guessing.

## Output

- Per-category score (or "insufficient evidence") with the evidence behind it.
- Critical gaps.
- Duplicate or conflicting instructions found.
- Unused components (best-effort).
- Prioritized remediation plan.
- Target maturity and what would need to be true to reach it.

## Prohibited Actions

- Do not assign a numeric score without evidence.
- Do not silently delete a component this audit flags as unused — recommend, don't act.
