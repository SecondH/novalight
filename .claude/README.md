# NovaLight Claude Code Workspace

This directory configures how Claude Code operates in the NovaLight repository. It implements the rules in [../CLAUDE.md](../CLAUDE.md) as reusable, discoverable components. Full architectural rationale lives in [docs/ai-workspace/](../docs/ai-workspace/).

## Directory structure

```text
.claude/
├── settings.json                 Committed: hooks wiring (safe to share with the team)
├── settings.local.json.example   Template for machine-specific overrides — copy to settings.local.json
├── settings.local.json           Machine-local, gitignored, never committed (already existed pre-bootstrap)
├── memory/                       Curated, verified project context loaded to ground Claude Code's understanding
├── skills/                       Reusable, deterministic workflows (SKILL.md per skill directory)
├── agents/                       Bounded-responsibility subagents for independent review/analysis
├── commands/                     Slash commands (thin wrappers that invoke skills/agents)
├── hooks/                        Deterministic safety scripts wired into settings.json
├── templates/                    Output format skeletons (what a deliverable should look like)
└── checklists/                   Verification item lists (what to check before calling something done)
```

## How skills are selected

Skills are deterministic workflows for a specific situation (e.g. `architecture-review`, `security-review`). Claude Code should self-select a skill when the situation in its `description` frontmatter matches the task at hand — see the routing table in [CLAUDE.md §13](../CLAUDE.md#13-skill-routing). Skills never modify files outside their stated scope, and several (`feature-planning`, `code-review`, `security-review`) are explicitly read-only/advisory by design — they inform a decision, they don't make it unilaterally.

## How subagents are routed

Agents in `agents/` are used when a task benefits from an independent, separately-scoped reasoning pass — most often for **review** work, where the same reasoning pass that implemented a change should not be its sole approver (see [agent-governance.md](../docs/ai-workspace/agent-governance.md)). Route by task type per [CLAUDE.md §12](../CLAUDE.md#12-subagent-routing). Do not spawn an agent for trivial changes — match effort to the risk-based routing matrix.

One agent, `visual-intelligence-prompt-engineer`, is **generative** rather than a reviewer: it turns a product/business/technical/marketing/executive need into a ready-to-use prompt for an external visual-generation tool (ChatGPT Image Generation, DALL-E, Midjourney, Canva AI, Figma AI, presentation tools). It produces prompts only — it never generates the image itself and never touches repository files. Its governing discipline is not reviewer independence but no-fabrication: it must not assert a NovaLight fact (capability, architecture detail, brand element) that isn't evidenced in `docs/`, and NovaLight currently has no established brand identity (no logo, palette, or typography system), so it defaults to a generic, professional style rather than inventing one. The matching `visual-content-generation` skill implements the same prompt-construction method for direct use without spawning the agent. See [agent-governance.md](../docs/ai-workspace/agent-governance.md) "Generative vs. review agents."

## How commands are used

Commands in `commands/` are user-invoked (`/command-name`) thin wrappers that sequence the relevant skills/agents for a common workflow (e.g. `/plan-feature`, `/review-change`). They exist for discoverability and consistency, not to duplicate skill logic — if you're editing workflow logic, edit the skill; if you're editing how the command is invoked, edit the command file.

## How hooks operate

Hooks in `hooks/` are deterministic Node.js scripts wired into `settings.json` under `PreToolUse`/`PostToolUse`. They read the tool-call JSON from stdin and communicate via exit code: `0` = allow, `2` = block (stderr is shown as the reason). They exist for rules that must be **enforced**, not merely suggested — everything else belongs in `CLAUDE.md` or a skill instead. See [workspace-maintenance-runbook.md](../docs/ai-workspace/workspace-maintenance-runbook.md) for the test procedure each hook was validated against, and the platform-specific pitfalls discovered during that testing (notably: avoid `child_process.execSync`/`execFileSync` for git branch detection on Windows — subprocess PATH resolution was unreliable in testing; `protect-main-branch.js` reads `.git/HEAD` directly instead).

**Known limitation**: a hook added to `settings.json` after a session has already started is not hot-loaded — the settings watcher only watches directories that had a settings file when the session started. Run `/hooks` once (or restart) to activate hooks added in this bootstrap.

## How local settings work

`settings.json` is committed and shared — it should only contain team-wide, safe configuration (currently: hook wiring). `settings.local.json` is machine-specific, gitignored, and never committed — copy `settings.local.json.example` to get started. Never put a real secret in either file; secrets belong in environment variables, per [CLAUDE.md §7](../CLAUDE.md#7-security-and-privacy-rules).

## How to add or modify workspace components

See [workspace-maintenance-runbook.md](../docs/ai-workspace/workspace-maintenance-runbook.md) for the step-by-step procedure for adding a skill, agent, command, or hook, and for testing a hook safely before wiring it into `settings.json`.

## Governance and review process

See [agent-governance.md](../docs/ai-workspace/agent-governance.md) for reviewer-independence rules, escalation, and how conflicting instructions between components should be resolved (report, don't silently pick a winner — same rule as documentation conflicts in `CLAUDE.md` §3).

## Troubleshooting

- **A hook doesn't seem to run**: confirm `settings.json` is valid JSON (`node -e "JSON.parse(require('fs').readFileSync('.claude/settings.json','utf8'))"`), confirm the matcher matches the actual tool name, and confirm the settings watcher has picked up the file (see the hooks limitation above — `/hooks` or restart).
- **A skill/agent references a path that doesn't exist**: the repository is Phase 0 (documentation only) — most architecture-document paths (`apps/`, `packages/`) are aspirational. Run `repository-analysis` to confirm current reality before trusting a path reference.
- **Two documents (or a document and this workspace) disagree**: report it; do not silently pick one. See the known Phase-naming conflict tracked in `.claude/memory/known-risks.md` as the canonical example of how to handle this.
