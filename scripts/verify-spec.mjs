#!/usr/bin/env node
/**
 * verify-spec.mjs - validate every skill against the Agent Skills reference
 * implementation from agentskills.io.
 *
 * It is deliberately the specification authors' validator rather than ours.
 * `validate-skills.mjs` encodes this project's own rules on top of the spec,
 * and a house validator agreeing with itself proves nothing about conformance.
 *
 * ## The one deviation, stated plainly
 *
 * The specification allows six frontmatter fields: name, description, license,
 * compatibility, metadata and allowed-tools. Its reference validator rejects
 * anything else.
 *
 * This package also sets two fields the specification does not define:
 *
 *   disable-model-invocation   keeps a skill out of the model's catalog
 *   user-invocable             keeps a skill out of the user's slash menu
 *
 * Both are read by Claude Code and by VS Code Copilot, and they are the entire
 * mechanism by which 101 of this package's 107 skills cost nothing until a
 * router names one. Dropping them to satisfy the validator would put every
 * specialist description back into every client's context on every turn, which
 * is the cost this modernization exists to remove.
 *
 * So they stay, and this script is explicit about it: a skill whose only
 * unexpected fields are those two is reported as conformant with a documented
 * extension. Any other unexpected field is a failure. Clients that do not know
 * these fields ignore them, which is the behaviour the specification requires
 * of unknown keys.
 *
 * Sources:
 *   https://agentskills.io/specification
 *   https://code.claude.com/docs/en/skills
 *   https://code.visualstudio.com/docs/copilot/customization/agent-skills
 *
 * Usage:
 *   node scripts/verify-spec.mjs
 *   node scripts/verify-spec.mjs --json
 *   node scripts/verify-spec.mjs --strict   treat the documented extension as a failure too
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SKILLS = path.join(ROOT, 'skills');

/** Fields this package sets that the specification does not define. */
const DOCUMENTED_EXTENSIONS = new Set(['disable-model-invocation', 'user-invocable']);

const isWindows = process.platform === 'win32';
const BIN = path.join(ROOT, 'node_modules', '.bin', isWindows ? 'skills-ref.cmd' : 'skills-ref');

if (!fs.existsSync(BIN)) {
  console.error('skills-ref is not installed. Run: npm install');
  process.exit(2);
}

/**
 * Split a validator failure into the part explained by the documented
 * extension and the part that is a real conformance problem.
 */
function classify(output) {
  const lines = output
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('-'));

  const realProblems = [];
  const extensionFields = new Set();

  for (const line of lines) {
    const m = line.match(/Unexpected fields in frontmatter:\s*([^.]+)\./);
    if (!m) {
      realProblems.push(line.replace(/^-\s*/, ''));
      continue;
    }
    const fields = m[1].split(',').map((f) => f.trim());
    const unknown = fields.filter((f) => !DOCUMENTED_EXTENSIONS.has(f));
    for (const f of fields) if (DOCUMENTED_EXTENSIONS.has(f)) extensionFields.add(f);
    if (unknown.length) realProblems.push(`undocumented frontmatter fields: ${unknown.join(', ')}`);
  }

  return { realProblems, extensionFields: [...extensionFields] };
}

const strict = process.argv.includes('--strict');
const dirs = fs
  .readdirSync(SKILLS)
  .filter((d) => fs.existsSync(path.join(SKILLS, d, 'SKILL.md')))
  .sort();

const failures = [];
const usingExtension = [];
let checked = 0;

for (const dir of dirs) {
  const result = spawnSync(BIN, ['validate', path.join('skills', dir)], {
    cwd: ROOT,
    encoding: 'utf8',
    shell: isWindows,
  });
  checked += 1;
  if (result.status === 0) continue;

  const output = ((result.stdout || '') + (result.stderr || '')).trim();
  const { realProblems, extensionFields } = classify(output);

  if (extensionFields.length) usingExtension.push({ skill: dir, fields: extensionFields });
  if (realProblems.length || (strict && extensionFields.length)) {
    failures.push({
      skill: dir,
      problems: realProblems.length ? realProblems : [`uses the documented extension: ${extensionFields.join(', ')}`],
    });
  }
}

const report = {
  validator: 'skills-ref (agentskills.io reference implementation)',
  skills: checked,
  conformant: checked - failures.length,
  failed: failures.length,
  usingDocumentedExtension: usingExtension.length,
  documentedExtensionFields: [...DOCUMENTED_EXTENSIONS],
  failures,
};

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log('Agent Skills specification, reference validator');
  console.log(`  skills checked          ${checked}`);
  console.log(`  conformant              ${report.conformant}`);
  console.log(
    `  using documented ext    ${usingExtension.length} (${[...DOCUMENTED_EXTENSIONS].join(', ')})`,
  );
  console.log(`  failures                ${failures.length}`);
  for (const f of failures) {
    console.error(`  - ${f.skill}: ${f.problems.join('; ')}`);
  }
  if (!failures.length) {
    console.log('  result                  conformant, with one documented extension');
    console.log('  see the header of this file for why the extension is kept');
  }
}

process.exit(failures.length ? 1 : 0);
