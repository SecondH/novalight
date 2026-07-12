#!/usr/bin/env node
/**
 * PostToolUse hook for Write/Edit.
 * After a source-code-like file is written, reminds (does not claim) that quality gates
 * should be run. Never asserts a check passed — only reminds which ones apply.
 * Exit 0 always (advisory only, cannot fail this hook).
 */
const fs = require('fs');

const CODE_EXTENSIONS = /\.(ts|tsx|js|jsx|prisma|sql)$/i;

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
if (!filePath || !CODE_EXTENSIONS.test(filePath)) process.exit(0);

console.error(
  `[quality-reminder] "${filePath}" was changed. Per CLAUDE.md §8, before considering this ` +
    `done: run lint, type check, tests, and build validation IF that tooling exists in the ` +
    `repository — do not report a check as passed unless it was actually executed. As of ` +
    `Phase 0, no such tooling exists yet in this repository; skip this reminder's specifics ` +
    `until it does, but still review the diff manually.`,
);
process.exit(0);
