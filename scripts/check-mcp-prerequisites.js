#!/usr/bin/env node
/**
 * Small consistency check to keep MCP prerequisite docs aligned with the
 * installer/runtime model.
 *
 * Fails when the expected prerequisite matrix rows are missing from the docs
 * or when installer readiness output drops the baseline/Python messaging that
 * the docs depend on.
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const docTargets = [
  'mcp-server/README.md',
  'mcp-server/PDF-QUICKSTART.md',
  'docs/USER_GUIDE.md',
  'docs/getting-started.md',
];

const expectedRows = [
  '| Runtime | Node.js 18+',
  '| Runtime | npm |',
  '| Optional feature | Java 11+ + `verapdf` |',
  '| Optional feature | `pdf-lib` |',
  '| Installer-only | Python 3 |',
];

const expectedDocPhrases = [
  'Python is not required',
  'MCP-compatible client',
];

const installerChecks = [
  {
    file: 'install.sh',
    snippets: [
      'Baseline PDF scan (scan_pdf_document):',
      'Python 3 helper (installer only):',
      'Python 3 is not required for MCP runtime.',
    ],
  },
  {
    file: 'install.ps1',
    snippets: [
      'Baseline PDF scan (scan_pdf_document):',
      'Python 3 helper (installer only):',
      'Python is not required for MCP runtime on Windows.',
    ],
  },
];

const failures = [];

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

for (const relPath of docTargets) {
  const content = read(relPath);
  for (const row of expectedRows) {
    if (!content.includes(row)) {
      failures.push(`${relPath}: missing expected prerequisite row: ${row}`);
    }
  }
  for (const phrase of expectedDocPhrases) {
    if (!content.includes(phrase)) {
      failures.push(`${relPath}: missing expected prerequisite guidance: ${phrase}`);
    }
  }
}

for (const check of installerChecks) {
  const content = read(check.file);
  for (const snippet of check.snippets) {
    if (!content.includes(snippet)) {
      failures.push(`${check.file}: missing expected installer prerequisite string: ${snippet}`);
    }
  }
}

if (failures.length > 0) {
  console.error('MCP prerequisite consistency check failed:\n');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('MCP prerequisite consistency check passed.');