#!/usr/bin/env node
/**
 * PreToolUse hook for Bash/PowerShell.
 * Blocks `git commit` while checked out directly on a protected branch.
 * Exit 0 = allow. Exit 2 = block.
 * Deliberately reads .git/HEAD directly instead of spawning `git` — subprocess PATH
 * resolution proved unreliable across shells/environments during hook testing; a plain
 * filesystem read is deterministic and has no shell/PATH dependency.
 * Limitation: cannot distinguish "user explicitly authorized this" from a routine attempt —
 * a genuine override requires the user to either run the commit themselves outside this
 * guarded flow, or ask a human to adjust this hook. See workspace-maintenance-runbook.md.
 */
const fs = require('fs');
const path = require('path');

const PROTECTED_BRANCHES = new Set(['main', 'master', 'production', 'release']);

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
    return { command: ti.command || '', cwd: data.cwd || process.cwd() };
  } catch {
    return { command: '', cwd: process.cwd() };
  }
}

function normalizeCwd(dir) {
  // Defensive: on win32, Node's path module does not understand git-bash-style POSIX
  // paths ("/c/Users/..."). If a hook caller ever supplies one (e.g. a Bash-tool-derived
  // cwd), path.resolve() silently mis-resolves it against the *current* drive rather than
  // erroring — a silent-wrong-answer failure mode worth guarding against explicitly.
  if (process.platform === 'win32') {
    const match = dir.match(/^\/([a-zA-Z])\/(.*)$/);
    if (match) return `${match[1].toUpperCase()}:\\${match[2].replace(/\//g, '\\')}`;
  }
  return dir;
}

function findGitDir(startDir) {
  let dir = path.resolve(normalizeCwd(startDir));
  for (;;) {
    const candidate = path.join(dir, '.git');
    if (fs.existsSync(candidate)) {
      const stat = fs.statSync(candidate);
      if (stat.isDirectory()) return candidate;
      // .git can be a file (worktrees/submodules) containing "gitdir: <path>"
      const contents = fs.readFileSync(candidate, 'utf8');
      const match = contents.match(/gitdir:\s*(.+)/);
      if (match) return path.resolve(dir, match[1].trim());
      return null;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null; // reached filesystem root
    dir = parent;
  }
}

function currentBranch(cwd) {
  const gitDir = findGitDir(cwd);
  if (!gitDir) return null;
  const headPath = path.join(gitDir, 'HEAD');
  if (!fs.existsSync(headPath)) return null;
  const head = fs.readFileSync(headPath, 'utf8').trim();
  const match = head.match(/^ref:\s*refs\/heads\/(.+)$/);
  return match ? match[1] : null; // null for detached HEAD (a raw SHA) — nothing to protect by name
}

const input = readStdin();
const { command, cwd } = getCommand(input);

if (!/\bgit\s+commit\b/i.test(command)) process.exit(0);
if (/--help\b|--dry-run\b/.test(command)) process.exit(0);

const branch = currentBranch(cwd);
if (!branch) process.exit(0); // not a git repo, or detached HEAD — nothing to protect by name

if (PROTECTED_BRANCHES.has(branch)) {
  console.error(
    `[protect-main-branch] Blocked a commit directly on protected branch "${branch}".\n` +
      `Create a feature branch first (e.g. "git checkout -b feature/<name>"), or ask the user ` +
      `to explicitly confirm committing to "${branch}" and have them run it directly.`,
  );
  process.exit(2);
}

process.exit(0);
