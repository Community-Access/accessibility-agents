#!/usr/bin/env node
/**
 * verify-dependencies.mjs - no known-vulnerable dependency ships.
 *
 * This repository carries three independent dependency trees, and until 7.0.1
 * nothing checked any of them. GitHub was reporting 58 advisories on the
 * default branch, 24 of them high, and the only reason anyone knew was the
 * warning `git push` prints. A project that enforces accessibility on other
 * people's code should not learn about its own supply chain from a push
 * message.
 *
 * What it checks, and why the thresholds differ:
 *
 *   mcp-server        runtime. Fails on high or critical, warns on moderate.
 *                     Its dependencies execute on a user's machine and read
 *                     their documents.
 *   root              tooling only, but it runs in CI on every pull request.
 *                     Same threshold.
 *   vscode-extension  deprecated, build-time only, published to nobody.
 *                     Reported, never fatal.
 *
 * Offline is not a pass. `npm audit` needs the registry, so when it cannot be
 * reached this exits 2 and says so rather than printing a green line.
 *
 * Usage:
 *   node scripts/verify-dependencies.mjs
 *   node scripts/verify-dependencies.mjs --json
 *   node scripts/verify-dependencies.mjs --offline-ok   (exit 0 when unreachable)
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const WIN = process.platform === 'win32';

const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const offlineOk = argv.includes('--offline-ok');

const TREES = [
  { dir: '.', label: 'root tooling', fatal: ['critical', 'high'] },
  { dir: 'mcp-server', label: 'MCP server', fatal: ['critical', 'high'] },
  { dir: 'vscode-extension', label: 'VS Code extension (deprecated)', fatal: [] },
];

const LEVELS = ['critical', 'high', 'moderate', 'low', 'info'];

function audit(dir) {
  const cwd = path.join(ROOT, dir);
  if (!fs.existsSync(path.join(cwd, 'package.json'))) return { skipped: 'no package.json' };
  if (!fs.existsSync(path.join(cwd, 'package-lock.json'))) return { skipped: 'no lockfile' };

  const r = spawnSync('npm', ['audit', '--json'], { cwd, encoding: 'utf8', timeout: 180000, shell: WIN });
  const text = (r.stdout || '').trim();
  if (!text) return { unreachable: (r.stderr || 'npm audit produced no output').split('\n')[0] };

  let report;
  try {
    report = JSON.parse(text);
  } catch {
    return { unreachable: 'npm audit did not return JSON' };
  }
  // A registry failure still exits non-zero with an error body rather than a
  // vulnerability summary; treat that as unreachable, not as clean.
  if (report.error) return { unreachable: report.error.summary || report.error.code || 'registry error' };
  if (!report.metadata || !report.metadata.vulnerabilities) return { unreachable: 'no vulnerability summary' };

  const counts = report.metadata.vulnerabilities;
  const advisories = Object.values(report.vulnerabilities || {})
    .filter((v) => v.severity === 'critical' || v.severity === 'high')
    .map((v) => ({ name: v.name, severity: v.severity, via: (v.via || []).map((x) => (typeof x === 'string' ? x : x.title)).slice(0, 2) }));

  return { counts, advisories };
}

const results = [];
let unreachable = 0;

for (const tree of TREES) {
  const out = audit(tree.dir);
  results.push({ ...tree, ...out });
  if (out.unreachable) unreachable += 1;
}

const failures = [];
for (const r of results) {
  if (r.skipped || r.unreachable) continue;
  for (const level of r.fatal) {
    if (r.counts[level] > 0) {
      failures.push(`${r.label}: ${r.counts[level]} ${level} ${r.counts[level] === 1 ? 'advisory' : 'advisories'}`);
    }
  }
}

if (asJson) {
  console.log(JSON.stringify({ results, failures, unreachable }, null, 2));
  process.exit(failures.length ? 1 : unreachable && !offlineOk ? 2 : 0);
}

console.log('Dependency advisories');
console.log('');
for (const r of results) {
  if (r.skipped) {
    console.log(`  SKIP  ${r.label.padEnd(32)} ${r.skipped}`);
    continue;
  }
  if (r.unreachable) {
    console.log(`  ????  ${r.label.padEnd(32)} could not audit: ${r.unreachable}`);
    continue;
  }
  const summary = LEVELS.filter((l) => r.counts[l] > 0).map((l) => `${r.counts[l]} ${l}`).join(', ') || 'none';
  const bad = r.fatal.some((l) => r.counts[l] > 0);
  console.log(`  ${bad ? 'FAIL' : 'PASS'}  ${r.label.padEnd(32)} ${summary}`);
  for (const a of r.advisories.slice(0, 6)) {
    console.log(`          ${a.severity} ${a.name}: ${a.via.join('; ').slice(0, 90)}`);
  }
}
console.log('');

if (failures.length) {
  console.error('FAILED');
  for (const f of failures) console.error('  - ' + f);
  console.error('');
  console.error('Fix with `npm audit fix` in that directory. When a transitive dependency');
  console.error('has no fixed parent, pin it in that package.json under "overrides" and say');
  console.error('why, as mcp-server/package.json does.');
  process.exit(1);
}

if (unreachable && !offlineOk) {
  console.error(`${unreachable} tree${unreachable === 1 ? '' : 's'} could not be audited. Offline is not a pass.`);
  console.error('Pass --offline-ok to accept that deliberately.');
  process.exit(2);
}

console.log('No high or critical advisories in any dependency tree.');
process.exit(0);
