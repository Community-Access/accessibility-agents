#!/usr/bin/env node
/**
 * phase6-retire-tooling.mjs - retire the tooling that served the deleted trees.
 *
 * The cutover removed six per-client copies of every agent. The scripts and
 * workflows that validated, generated, packaged and installed those copies now
 * point at nothing. A repository full of green checks that check nothing is
 * worse than one with fewer checks, so they go too.
 *
 * Retired, with what replaced each:
 *
 *   check-platform-parity.js          every tree existed -> one tree exists
 *   check-skill-description-quality   its own rules       -> validate-skills.mjs
 *   validate-codex-plugin.js          Codex plugin shape  -> verify-spec.mjs
 *   codex-accessibility-dispatch-smoke Codex dispatch     -> validate-skills.mjs dispatch contract
 *   validate-orchestrator-dispatch.js orchestrator paths  -> validate-skills.mjs dispatch contract
 *   install.sh / install.ps1          200 KB, six layouts -> scripts/install.mjs
 *
 * Kept and repointed: validate-agents.js still has the only WCAG and URL checks
 * in the repository, so it is narrowed to the skills tree rather than deleted.
 *
 * Everything removed is tracked in git.
 *
 * Usage:
 *   node scripts/phase6-retire-tooling.mjs --dry-run
 *   node scripts/phase6-retire-tooling.mjs --apply
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const apply = process.argv.includes('--apply');

/** Scripts whose subject no longer exists. */
const RETIRE_SCRIPTS = [
  ['scripts/check-platform-parity.js', 'one tree replaced six, so there is no parity left to check'],
  ['scripts/check-skill-description-quality.js', 'folded into validate-skills.mjs description limits'],
  ['scripts/validate-codex-plugin.js', 'the Codex plugin is gone; verify-spec.mjs validates the skills it held'],
  ['scripts/codex-accessibility-dispatch-smoke.mjs', 'the dispatch contract is enforced by validate-skills.mjs'],
  ['scripts/validate-orchestrator-dispatch.js', 'the dispatch contract is enforced by validate-skills.mjs'],
  ['scripts/generate-manifest.sh', 'the package manifest is plugin.json, written by hand'],
  ['scripts/generate-manifest.ps1', 'the package manifest is plugin.json, written by hand'],
  ['install.sh', 'replaced by scripts/install.mjs, which installs one standard layout'],
  ['install.ps1', 'replaced by scripts/install.mjs, which installs one standard layout'],
  ['scripts/installer-common.sh', 'only the retired installers used it'],
  ['scripts/Installer.Common.ps1', 'only the retired installers used it'],
  ['scripts/repair-install.sh', 'the new installer copies one directory; there is nothing to repair'],
  ['scripts/repair-install.ps1', 'the new installer copies one directory; there is nothing to repair'],
];

/** Workflows whose job is gone. */
const RETIRE_WORKFLOWS = [
  ['.github/workflows/skills-cli-readiness.yml', 'validated .github/skills, which no longer exists'],
  ['.github/workflows/skills-supply-chain.yml', 'signed a manifest of .github/skills'],
  ['.github/workflows/skills-release-readiness.yml', 'gated the Codex plugin release'],
  ['.github/workflows/validate-orchestrator-contracts.yml', 'folded into the verify workflow'],
  ['.github/workflows/repair-smoke-test.yml', 'tested the retired repair scripts'],
  ['.github/workflows/update-manifest.yml', 'generated .a11y-agent-manifest, which is gone'],
  ['.github/workflows/skill-conformance.yml', 'folded into the verify workflow'],
  ['.github/workflows/validate-agents.yml', 'folded into the verify workflow'],
];

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

const retired = [];
for (const [rel, why] of [...RETIRE_SCRIPTS, ...RETIRE_WORKFLOWS]) {
  if (!exists(rel)) continue;
  if (apply) fs.rmSync(path.join(ROOT, rel), { recursive: true, force: true });
  retired.push({ rel, why });
}

console.log(`Retire superseded tooling (${apply ? 'applied' : 'dry run'})`);
console.log('');
for (const r of retired) {
  console.log(`  ${r.rel}`);
  console.log(`      ${r.why}`);
}
console.log('');
console.log(`${retired.length} files ${apply ? 'retired' : 'would be retired'}. All are tracked in git.`);
process.exit(0);
