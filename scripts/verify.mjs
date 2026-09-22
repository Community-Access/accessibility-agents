#!/usr/bin/env node
/**
 * verify.mjs - run every gate, in one command, and say what each one proves.
 *
 * This is the evidence that the modernization is complete rather than claimed.
 * Each entry names the standard or contract it checks, the tool that checks it,
 * and what a failure would mean for a user. A gate nobody can explain is a gate
 * nobody will keep.
 *
 * Usage:
 *   npm run verify
 *   node scripts/verify.mjs --json
 *   node scripts/verify.mjs --only spec,skills
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

const NODE = process.execPath;

/**
 * Every gate. `proves` is the sentence that goes in the report; keep it about
 * what breaks for a person, not about the mechanism.
 */
const GATES = [
  {
    id: 'spec',
    name: 'Agent Skills specification',
    standard: 'agentskills.io/specification',
    command: [NODE, ['scripts/verify-spec.mjs']],
    proves: 'Every skill is readable by any client implementing the open standard, checked with the specification authors\' own validator rather than ours.',
  },
  {
    id: 'skills',
    name: 'Package rules',
    standard: 'this package: tiers, catalog budget, pointer dispatch',
    command: [NODE, ['scripts/validate-skills.mjs', '--no-shadow-trees']],
    proves: 'No specialist is unreachable, no router pastes a body into a prompt, no legacy copy shadows a skill, and the catalog fits the tightest client cap.',
  },
  {
    id: 'conformance',
    name: 'Frontmatter conformance',
    standard: 'slug names, no byte-order marks, name matches directory',
    command: [NODE, ['scripts/check-skill-conformance.mjs']],
    proves: 'No skill fails to load because of a byte-order mark or a name that does not match its folder.',
  },
  {
    id: 'budgets',
    name: 'Context budgets',
    standard: 'budgets.json',
    command: [NODE, ['skills/a11y-core/scripts/measure-context.mjs', '--check', 'budgets.json']],
    proves: 'The package still costs what it claims to cost, per client, before the user has said anything.',
  },
  {
    id: 'findings',
    name: 'Findings contract',
    standard: 'skills/a11y-core/schemas/findings.schema.json',
    command: [NODE, ['skills/a11y-core/scripts/test-findings-contract.mjs']],
    proves: 'A finding means the same thing whichever skill produced it, and malformed output is rejected before it reaches a report.',
  },
  {
    id: 'report',
    name: 'Report renderer',
    standard: 'the seven required report sections',
    command: [NODE, ['skills/a11y-core/scripts/render-report.mjs', '--self-test']],
    proves: 'Every audit report carries all seven required sections, a score, and a delta against the previous run.',
  },
  {
    id: 'hooks',
    name: 'Enforcement gate',
    standard: 'hooks/guard.mjs across four clients',
    command: [NODE, ['--test', 'hooks/guard.test.mjs']],
    proves: 'An edit to a user-facing file is refused until the accessibility lead completes, on every client, and the gate fails closed rather than open.',
  },
  {
    id: 'mcp',
    name: 'MCP server',
    standard: 'Model Context Protocol tools, annotations and structured content',
    command: [NODE, ['--test', 'mcp-server/server-core.test.js', 'mcp-server/mcp-conformance.test.js']],
    proves: 'A client can tell a read-only scan from a write without interrupting the user, and can parse a result instead of reading prose.',
  },
  {
    id: 'markdown',
    name: 'Markdown accessibility',
    standard: 'this project\'s own markdown rules',
    command: [NODE, ['.github/scripts/markdown-a11y-lint.mjs', '.', '--fail-on', 'error']],
    proves: 'The project\'s own documentation meets the standard it enforces on everyone else.',
  },
  {
    id: 'scanner',
    name: 'Markdown linter',
    standard: 'unit tests for the linter itself',
    command: [NODE, ['scripts/test-markdown-scanner.mjs']],
    proves: 'The linter reports what it should and stays quiet about what it should not, including the table rule that used to demand unrenderable markdown.',
  },
  {
    id: 'release',
    name: 'Version consistency',
    standard: 'one version across every manifest',
    command: [NODE, ['scripts/check-release-consistency.js']],
    proves: 'Every manifest and the MCP server agree on one version, so a user can tell which build they are running.',
  },
  {
    id: 'matrices',
    name: 'Dispatch matrices',
    standard: 'generated from skill frontmatter',
    command: [NODE, ['scripts/build-dispatch-matrices.mjs', '--check']],
    proves: 'Every router roster matches the skills that exist, so adding a specialist cannot leave it unreachable.',
  },
  {
    id: 'docs',
    name: 'Generated documentation',
    standard: 'reference pages derived from source',
    command: [NODE, ['scripts/build-docs.mjs', '--check']],
    proves: 'The skills catalog and MCP tools reference describe what is actually shipped.',
  },
  {
    id: 'live',
    name: 'Live client session',
    standard: 'what Claude Code actually loads',
    command: [NODE, ['scripts/verify-live.mjs']],
    proves: 'On every installed client, exactly the six routers reach the model and the other 102 do not, measured in a real session rather than inferred from frontmatter.',
    optional: true,
  },
];

const argv = process.argv.slice(2);
const onlyArg = argv.indexOf('--only');
const only = onlyArg === -1 ? null : new Set(argv[onlyArg + 1].split(','));
const asJson = argv.includes('--json');

const results = [];

for (const gate of GATES) {
  if (only && !only.has(gate.id)) continue;
  const started = Date.now();
  const [cmd, args] = gate.command;
  const run = spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8' });
  const output = ((run.stdout || '') + (run.stderr || '')).trim();

  results.push({
    id: gate.id,
    name: gate.name,
    standard: gate.standard,
    proves: gate.proves,
    ok: run.status === 0 || (gate.optional && run.status === 2),
    skipped: gate.optional && run.status === 2,
    ms: Date.now() - started,
    summary: summarise(output),
    output,
  });
}

/** The line a reader wants: the count, not the transcript. */
function summarise(output) {
  const lines = output.split('\n').map((l) => l.trim()).filter(Boolean);
  const interesting = lines.filter((l) =>
    /^(# (tests|pass|fail)|Validated|Catalog|skills checked|conformant|result|Budget check|render-report|findings contract|Results:|Found |Markdown accessibility|All skill)/.test(l),
  );
  return (interesting.length ? interesting : lines.slice(-3)).slice(0, 4).join(' | ');
}

const failed = results.filter((r) => !r.ok);

if (asJson) {
  console.log(JSON.stringify({ gates: results.length, failed: failed.length, results }, null, 2));
  process.exit(failed.length ? 1 : 0);
}

const width = Math.max(...results.map((r) => r.name.length));

console.log('Accessibility Agents, full verification');
console.log('');
for (const r of results) {
  console.log(`${r.skipped ? 'SKIP' : r.ok ? 'PASS' : 'FAIL'}  ${r.name.padEnd(width)}  ${String(r.ms).padStart(6)}ms  ${r.summary}`);
}
console.log('');

if (failed.length) {
  for (const r of failed) {
    console.error(`--- ${r.name} failed ---`);
    console.error(r.output.split('\n').slice(-25).join('\n'));
    console.error('');
  }
  console.error(`${failed.length} of ${results.length} gates failed.`);
  process.exit(1);
}

console.log(`All ${results.length} gates pass. What that establishes:`);
console.log('');
for (const r of results) {
  console.log(`  ${r.name}`);
  console.log(`    standard  ${r.standard}`);
  console.log(`    proves    ${r.proves}`);
}
console.log('');
console.log('Measurements: npm run measure, npm run measure:dispatch, npm run probe:mcp');
process.exit(0);
