#!/usr/bin/env node
/**
 * PreToolUse hook for Write/Edit.
 * Warns (does not hard-block) when a write touches a path pattern that historically
 * corresponds to a sensitive area (auth, payments, migrations, infra, CI/CD, secrets).
 * This is forward-looking: as of Phase 0 no such paths exist yet in NovaLight, so this
 * hook is a no-op today and activates automatically once those paths are created.
 * Exit 0 always (advisory only) — see docs/ai-workspace/workspace-maintenance-runbook.md
 * for why this one warns instead of blocks (low false-positive tolerance for a hard block
 * on substring path matches).
 */
const fs = require('fs');

const SENSITIVE_PATH_SEGMENTS = [
  /\bauth\b/i,
  /\bpayment/i,
  /\bbilling\b/i,
  /\bledger\b/i,
  /migrations?[\\/]/i,
  /\binfrastructure\b/i,
  /\.github[\\/]workflows/i,
  /\bsecrets?\b/i,
  /schema\.prisma$/i,
];

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function getFilePath(input) {
  try {
    const data = JSON.parse(input);
    const ti = data.tool_input || {};
    return ti.file_path || '';
  } catch {
    return '';
  }
}

const input = readStdin();
const filePath = getFilePath(input);
if (!filePath) process.exit(0);

for (const pattern of SENSITIVE_PATH_SEGMENTS) {
  if (pattern.test(filePath)) {
    console.error(
      `[protect-sensitive-paths] Advisory: "${filePath}" matches a sensitive-path pattern (${pattern}).\n` +
        `Per CLAUDE.md §15, confirm this change has the required review (security-review / data-architect / ` +
        `architecture-review as applicable) and explicit user approval before proceeding.`,
    );
    break; // advisory only — do not exit(2)
  }
}

process.exit(0);
