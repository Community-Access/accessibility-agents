#!/usr/bin/env node
/**
 * check-release-consistency.js - one version, everywhere it is published.
 *
 * Before 7.0 this compared five manifests across five per-client trees, and it
 * still missed the MCP server hard-coding "4.6.0" in three places while its own
 * package.json said 6.0.0. There are now four manifests and one server, and the
 * server reads its version from its manifest rather than repeating it.
 *
 * A mismatch here means a user cannot tell which build they are running, which
 * is the difference between "this bug is fixed" and "this bug is fixed in a
 * version you may or may not have".
 *
 * Usage:
 *   node scripts/check-release-consistency.js
 *   node scripts/check-release-consistency.js --json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

/** Every file that states the package version, and how to read it out. */
const SOURCES = [
  { file: 'package.json', read: (t) => JSON.parse(t).version, why: 'the package manifest' },
  { file: 'plugin.json', read: (t) => JSON.parse(t).version, why: 'the Agent Plugins 1.0 manifest' },
  { file: '.claude-plugin/plugin.json', read: (t) => JSON.parse(t).version, why: 'what Claude Code and VS Code read' },
  { file: '.codex-plugin/plugin.json', read: (t) => JSON.parse(t).version, why: 'what Codex reads' },
  { file: 'mcp-server/package.json', read: (t) => JSON.parse(t).version, why: 'the MCP server, which reports this at its handshake' },
];

/** Version strings that must not be hard-coded anywhere. */
const NO_HARDCODED = [
  { dir: 'mcp-server', files: ['server.js', 'server-core.js', 'stdio.js'] },
];

const problems = [];
const found = [];

for (const source of SOURCES) {
  const abs = path.join(ROOT, source.file);
  if (!fs.existsSync(abs)) {
    problems.push(`${source.file} is missing (${source.why})`);
    continue;
  }
  try {
    const version = source.read(fs.readFileSync(abs, 'utf8'));
    if (!version) problems.push(`${source.file} states no version`);
    else found.push({ file: source.file, version, why: source.why });
  } catch (e) {
    problems.push(`${source.file} could not be read: ${e.message}`);
  }
}

const versions = [...new Set(found.map((f) => f.version))];
if (versions.length > 1) {
  problems.push(`versions disagree: ${found.map((f) => `${f.file}=${f.version}`).join(', ')}`);
}

// A hard-coded version drifts the moment someone bumps the manifest and
// forgets the source file. This is exactly how the server came to advertise a
// version that had not existed for two releases.
for (const group of NO_HARDCODED) {
  for (const file of group.files) {
    const abs = path.join(ROOT, group.dir, file);
    if (!fs.existsSync(abs)) continue;
    const text = fs.readFileSync(abs, 'utf8');
    // Only a value assigned to a `version` key. Matching every dotted triple
    // flagged the SARIF schema version and WCAG criterion numbers, which are
    // not this package's version and must not be rewritten.
    for (const m of text.matchAll(/\bversion\s*[:=]\s*["'](\d+\.\d+\.\d+)["']/g)) {
      if (m[1] === '2.1.0') continue; // SARIF schema version, fixed by that spec
      problems.push(
        `${group.dir}/${file} hard-codes version "${m[1]}"; import SERVER_VERSION from version.js instead`,
      );
    }
  }
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ version: versions[0] || null, sources: found, problems }, null, 2));
  process.exit(problems.length ? 1 : 0);
}

console.log('Release version consistency');
console.log('');
for (const f of found) {
  console.log(`  ${f.version.padEnd(10)} ${f.file.padEnd(30)} ${f.why}`);
}
console.log('');

if (problems.length) {
  console.error(`Problems (${problems.length})`);
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}

console.log(`All ${found.length} manifests agree on ${versions[0]}, and nothing hard-codes it.`);
process.exit(0);
