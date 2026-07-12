# Claude Code Workspace Architecture

> Source: this document describes the `.claude/` workspace bootstrapped for NovaLight. It is itself a `docs/ai-workspace/` document and follows the `docs/<category>/<NNN>-<kebab-case-name>.md` convention loosely — the `ai-workspace` category is workspace-infrastructure documentation, not project-domain documentation, so it is not numbered alongside the `NNN` sequence used for `docs/project/`, `docs/engineering/`, etc.

## Components and responsibilities

| Component             | Responsibility                                                                                    | Authority                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `CLAUDE.md`           | Top-level operating instructions; the single source Claude Code always loads                      | Governs everything below                                                                                                       |
| `.claude/memory/`     | Curated, verified project context (not raw documentation — a distilled, cross-referenced summary) | Informational; defers to `docs/` on conflict                                                                                   |
| `.claude/skills/`     | Deterministic, reusable workflows for a named situation                                           | Self-selected by matching task to skill `description`                                                                          |
| `.claude/agents/`     | Bounded-responsibility subagents, mostly for independent review                                   | Invoked explicitly for review/analysis needing separation from the implementer                                                 |
| `.claude/commands/`   | User-invoked thin wrappers sequencing skills/agents                                               | Invoked explicitly by the user via `/name`                                                                                     |
| `.claude/hooks/`      | Deterministic enforcement (not suggestion) wired into `settings.json`                             | Runs automatically on matching tool calls; can block                                                                           |
| `.claude/templates/`  | Output format skeletons                                                                           | Referenced by skills/commands for consistent output shape                                                                      |
| `.claude/checklists/` | Verification item lists                                                                           | Referenced by skills/agents/commands as a completeness check                                                                   |
| `docs/`               | Authoritative project documentation (product, architecture, security, engineering)                | Highest authority for project facts; `CLAUDE.md` and workspace components must not contradict it without flagging the conflict |

## Instruction and data flow

```text
User request
  → CLAUDE.md (top-level rules, routing tables)
    → relevant docs/ (authoritative facts, per routing table)
    → .claude/memory/ (fast-load context, cross-referenced to docs/)
    → .claude/skills/ or .claude/agents/ (situational workflow)
      → .claude/templates/ (output shape) + .claude/checklists/ (verification)
  → .claude/hooks/ (enforced on every matching tool call, independent of the above)
```

## Precedence of instructions

1. Explicit user instruction in the current conversation (can override a default, but not bypass an escalation rule without genuine explicit confirmation).
2. `CLAUDE.md` (this repository's top-level rules).
3. `docs/` authoritative documentation (via `CLAUDE.md`'s routing table).
4. `.claude/memory/` (a curated view of `docs/` — if it disagrees with `docs/`, `docs/` wins and the memory file is stale and should be corrected).
5. Skill/agent/command defaults.

Hooks are not part of this precedence chain — they are a separate, always-on enforcement layer that runs regardless of what the above chain concludes, per [agent-governance.md](./agent-governance.md).

## Routing model

- **Skill routing** is self-directed: Claude Code matches the task to a skill's `description` (see [CLAUDE.md §13](../../CLAUDE.md#13-skill-routing)).
- **Agent routing** is explicit and risk-based: reserved for tasks where independent review adds value, gated by the risk matrix in [agent-governance.md](./agent-governance.md).
- **Command routing** is user-directed: a human types `/command-name`.

## Review model

Reviewer independence is required wherever an agent exists specifically for review (`security-reviewer`, `solution-architect`, `api-contract-reviewer`, `data-architect`, `documentation-reviewer`, `quality-gate-reviewer`, `risk-reviewer`): the reasoning pass that implemented a change should not be its sole approver. See [agent-governance.md](./agent-governance.md) for the full model.

## Hook model

Hooks are the only enforcement layer that cannot be reasoned around — they run as separate OS processes with an exit-code contract (`0` = allow, `2` = block), independent of the model's own judgment. They are reserved for a small set of high-confidence, low-false-positive rules (destructive commands, secret-shaped writes, protected-branch commits) plus advisory reminders. See [workspace-maintenance-runbook.md](./workspace-maintenance-runbook.md) for the hook test procedures.

## Maintenance boundaries

- `CLAUDE.md` and `docs/ai-workspace/*` describe the workspace's intent; `.claude/*` implements it. A change to one without the other is a documentation/implementation drift and should be corrected together.
- `docs/` (project documentation) is owned by the project's human maintainers via the normal documentation process ([CLAUDE.md §9](../../CLAUDE.md#9-documentation-obligations)); the Claude Code workspace must never silently alter project-domain facts to make its own job easier.
- See [workspace-maintenance-runbook.md](./workspace-maintenance-runbook.md) for how to extend any component.
