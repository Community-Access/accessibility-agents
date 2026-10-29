import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'check-skill-conformance.mjs');

const HIDDEN = 'disable-model-invocation: true\nuser-invocable: false\n';

/** One skill. `hidden` sets both flags; `body` is where it names others. */
const skill = (name, { hidden = false, body = 'Body.' } = {}) =>
  `---\nname: ${name}\ndescription: A skill.\n${hidden ? HIDDEN : ''}---\n${body}\n`;

/** Run the checker in a fixture tree of skills, given as { folder: SKILL.md text }. */
function run(t, skills, extra = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'aa-conformance-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const [name, text] of Object.entries(skills)) {
    fs.mkdirSync(path.join(root, 'skills', name), { recursive: true });
    fs.writeFileSync(path.join(root, 'skills', name, 'SKILL.md'), text);
  }
  for (const [rel, text] of Object.entries(extra)) {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), text);
  }
  const out = spawnSync(process.execPath, [SCRIPT, '--json'], { cwd: root, encoding: 'utf8' });
  return { status: out.status, report: JSON.parse(out.stdout) };
}

const rules = (report) => report.findings.map((f) => `${f.rule} ${f.file}`);

test('a hidden skill a router names by name is reached', (t) => {
  const { status, report } = run(t, {
    router: skill('router', { body: 'Cite `kb-rules` for the table.' }),
    'kb-rules': skill('kb-rules', { hidden: true }),
  });
  assert.equal(status, 0, rules(report).join('\n'));
  assert.equal(report.reach.reached, 1);
});

test('a hidden skill a router opens by path is reached', (t) => {
  const { status } = run(t, {
    router: skill('router', { body: 'Read <skills-root>/scan-config/SKILL.md.' }),
    'scan-config': skill('scan-config', { hidden: true }),
  });
  assert.equal(status, 0);
});

test('a name in a router reference file counts', (t) => {
  const { status } = run(
    t,
    { router: skill('router'), 'kb-rules': skill('kb-rules', { hidden: true }) },
    { 'skills/router/references/dispatch-matrix.md': '| kb-rules | the table |\n' },
  );
  assert.equal(status, 0);
});

test('a hidden skill nothing names fails', (t) => {
  const { status, report } = run(t, {
    router: skill('router'),
    'kb-orphan': skill('kb-orphan', { hidden: true }),
  });
  assert.equal(status, 1);
  assert.deepEqual(rules(report), ['unreachable-reference skills/kb-orphan/SKILL.md']);
});

test('a hidden skill named only by another unreached hidden skill fails, both of them', (t) => {
  const { status, report } = run(t, {
    router: skill('router'),
    'kb-a': skill('kb-a', { hidden: true, body: 'See `kb-b`.' }),
    'kb-b': skill('kb-b', { hidden: true }),
  });
  assert.equal(status, 1);
  assert.deepEqual(rules(report).sort(), [
    'unreachable-reference skills/kb-a/SKILL.md',
    'unreachable-reference skills/kb-b/SKILL.md',
  ]);
});

test('reach follows a chain from a router through a helper', (t) => {
  const { status } = run(t, {
    router: skill('router', { body: 'Dispatch `bridge`.' }),
    bridge: skill('bridge', { hidden: true, body: 'Score with `kb-scoring`.' }),
    'kb-scoring': skill('kb-scoring', { hidden: true }),
  });
  assert.equal(status, 0);
});

test('a name that is only part of a longer name does not count', (t) => {
  const { status } = run(t, {
    router: skill('router', { body: 'Use `kb-rules-extended`.' }),
    'kb-rules': skill('kb-rules', { hidden: true }),
    'kb-rules-extended': skill('kb-rules-extended'),
  });
  assert.equal(status, 1);
});

test('a skill with only one of the two flags is not checked', (t) => {
  const { status } = run(t, {
    router: skill('router'),
    'model-only': `---\nname: model-only\ndescription: A skill.\nuser-invocable: false\n---\nBody.\n`,
  });
  assert.equal(status, 0);
});

test('a skill on the known-unreached list may stay unreached', (t) => {
  const { status, report } = run(t, {
    router: skill('router'),
    'kb-media-accessibility': skill('kb-media-accessibility', { hidden: true }),
  });
  assert.equal(status, 0);
  assert.deepEqual(report.reach.known, ['kb-media-accessibility']);
});

test('a known-unreached skill that becomes reached fails until the list shrinks', (t) => {
  const { status, report } = run(t, {
    router: skill('router', { body: 'Cite `kb-media-accessibility`.' }),
    'kb-media-accessibility': skill('kb-media-accessibility', { hidden: true }),
  });
  assert.equal(status, 1);
  assert.deepEqual(rules(report), ['known-unreached-now-reached skills/kb-media-accessibility/SKILL.md']);
});

test('the real tree has no new unreached skill', () => {
  const root = path.resolve(path.dirname(SCRIPT), '..');
  const out = spawnSync(process.execPath, [SCRIPT, '--json'], { cwd: root, encoding: 'utf8' });
  const report = JSON.parse(out.stdout);
  assert.equal(out.status, 0, rules(report).join('\n'));
  assert.equal(report.reach.hidden, report.reach.reached + report.reach.known.length);
});
