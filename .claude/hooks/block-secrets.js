#!/usr/bin/env node
/**
 * PreToolUse hook for Write/Edit.
 * Blocks writes that look like they introduce a real secret.
 * Allows documented placeholders (e.g. "your_password_here", "<PASSWORD>", "changeme", "xxx").
 * Exit 0 = allow. Exit 2 = block.
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

function getContent(input) {
  try {
    const data = JSON.parse(input);
    const ti = data.tool_input || {};
    return {
      content: ti.content || ti.new_string || '',
      filePath: ti.file_path || '',
    };
  } catch {
    return { content: '', filePath: '' };
  }
}

const PLACEHOLDER =
  /^(your[_-].*|changeme|change_me|xxx+|placeholder|example|<.*>|\$\{.*\}|\.\.\.|redacted|dummy|test[_-]?value|not[_-]?a[_-]?real[_-]?secret)$/i;

const SECRET_PATTERNS = [
  // Fixed 2026-07-12 (workspace audit, docs/operations/025-m1.6-operational-activation-report.md):
  // the previous `\b(...)` matched only the bare keyword (PASSWORD, SECRET_KEY, ...) as a
  // complete token. Underscore is a \w character in JS regex, so a leading `\b` does NOT match
  // inside a compound identifier -- POSTGRES_PASSWORD, CLERK_SECRET_KEY, DATABASE_PASSWORD,
  // STRIPE_SECRET_KEY all silently bypassed detection. Verified empirically before/after fix.
  // `[A-Z0-9_]*` now allows any uppercase/underscore prefix immediately before the keyword.
  /(?:^|[^A-Za-z0-9_])([A-Z0-9_]*(?:API_KEY|SECRET|SECRET_KEY|PASSWORD|PRIVATE_KEY|ACCESS_TOKEN|CLIENT_SECRET))\s*[:=]\s*(.+)/i,
  /-----BEGIN (RSA|OPENSSH|EC|DSA|PGP) PRIVATE KEY-----/,
  /\bAKIA[0-9A-Z]{16}\b/, // AWS access key id shape
  /\bsk-[A-Za-z0-9]{20,}\b/, // common vendor "secret key" token shape
];

const input = readStdin();
const { content, filePath } = getContent(input);
if (!content) process.exit(0);

// .env.example / docs are expected to carry placeholder-shaped secrets; still scan, but placeholders pass.
for (const line of content.split(/\r?\n/)) {
  for (const pattern of SECRET_PATTERNS) {
    const match = line.match(pattern);
    if (!match) continue;
    const value = (match[2] || '').trim().replace(/^["']|["']$/g, '');
    if (pattern.source.startsWith('-----BEGIN') || !value) {
      console.error(
        `[block-secrets] Blocked a write that looks like it contains a real credential.\n` +
          `File: ${filePath || '(unknown)'}\nLine: ${line.trim()}\n` +
          `If this is a placeholder, use an obvious placeholder token (e.g. "your_api_key_here", "<SECRET>").`,
      );
      process.exit(2);
    }
    if (!PLACEHOLDER.test(value)) {
      console.error(
        `[block-secrets] Blocked a write that looks like it contains a real credential.\n` +
          `File: ${filePath || '(unknown)'}\nLine: ${line.trim()}\n` +
          `If this is a placeholder, use an obvious placeholder token (e.g. "your_api_key_here", "<SECRET>").`,
      );
      process.exit(2);
    }
  }
}

process.exit(0);
