#!/usr/bin/env node
/**
 * PreToolUse hook for Bash/PowerShell.
 * Blocks a narrow, high-confidence set of destructive command patterns.
 * Exit 0 = allow. Exit 2 = block (stderr is shown to the user/model as the reason).
 * See docs/ai-workspace/workspace-maintenance-runbook.md for the test procedure.
 */
const fs = require('fs');

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function getCommand(input) {
  try {
    const data = JSON.parse(input);
    const ti = data.tool_input || {};
    return ti.command || '';
  } catch {
    return '';
  }
}

const DANGEROUS_RULES = [
  {
    name: 'rm -rf against root/cwd/home/wildcard',
    test: (cmd) =>
      /\brm\s+(-[a-z]*r[a-z]*f[a-z]*|-[a-z]*f[a-z]*r[a-z]*)\s+(\/\s*$|\/\s|\.\s*$|\.\.\s*$|~\s*$|\*\s*$|--no-preserve-root)/i.test(
        cmd,
      ),
  },
  { name: 'git reset --hard', test: (cmd) => /\bgit\s+reset\s+--hard\b/i.test(cmd) },
  { name: 'git clean -fd', test: (cmd) => /\bgit\s+clean\s+-[a-z]*f[a-z]*d[a-z]*\b/i.test(cmd) },
  {
    name: 'git push --force / -f (not --force-with-lease)',
    test: (cmd) =>
      /\bgit\s+push\b/i.test(cmd) &&
      !/--force-with-lease\b/i.test(cmd) &&
      (/--force\b/i.test(cmd) || /(^|\s)-f(\s|$)/.test(cmd)),
  },
  { name: 'DROP DATABASE', test: (cmd) => /\bDROP\s+DATABASE\b/i.test(cmd) },
  { name: 'TRUNCATE', test: (cmd) => /\bTRUNCATE\s+(TABLE\s+)?/i.test(cmd) },
  {
    name: 'docker system prune -a',
    test: (cmd) => /\bdocker\s+system\s+prune\b/i.test(cmd) && /-a\b/i.test(cmd),
  },
  {
    name: 'PowerShell Remove-Item -Recurse -Force on root/cwd-shaped path',
    test: (cmd) =>
      /Remove-Item\b/i.test(cmd) &&
      /-Recurse\b/i.test(cmd) &&
      /-Force\b/i.test(cmd) &&
      /(['"]?[\\/]\s*['"]?\s*$|['"]?\.\s*['"]?\s*$)/.test(cmd),
  },
];

const input = readStdin();
const command = getCommand(input);

if (!command) process.exit(0);

for (const rule of DANGEROUS_RULES) {
  if (rule.test(command)) {
    console.error(
      `[block-destructive-commands] Blocked a command matching a destructive pattern.\n` +
        `Command: ${command}\n` +
        `Matched rule: ${rule.name}\n` +
        `If this is intentional, ask the user to confirm explicitly, then run it outside this guarded flow or ask the user to run it themselves.`,
    );
    process.exit(2);
  }
}

process.exit(0);
