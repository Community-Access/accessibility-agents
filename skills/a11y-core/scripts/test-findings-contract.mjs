#!/usr/bin/env node
/**
 * test-findings-contract.mjs - prove the findings contract holds end to end.
 *
 * Three things have to be true for the pipeline to work:
 *   1. The schema itself is well formed and its own example validates.
 *   2. Every example payload a skill ships validates against it.
 *   3. The validator actually rejects the mistakes it is there to catch.
 *
 * The third is the one that matters. A validator that accepts everything passes
 * every test and protects nothing, so each negative case below is a specific
 * defect the pipeline would otherwise pass downstream into a report.
 *
 * Usage: node skills/a11y-core/scripts/test-findings-contract.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validatePayload, mergeFindings, score, collapseSameDefect, SCHEMA_PATH } from './merge-findings.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SKILLS = path.resolve(HERE, '..', '..');

let passed = 0;
const failures = [];

function check(name, condition, detail = '') {
  if (condition) {
    passed += 1;
    return;
  }
  failures.push(name + (detail ? ': ' + detail : ''));
}

const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));

// 1. The schema is usable.
check('schema declares draft 2020-12', schema.$schema === 'https://json-schema.org/draft/2020-12/schema');
check('schema requires skill, scope and findings', ['skill', 'scope', 'findings'].every((k) => schema.required.includes(k)));
check('schema forbids unknown top-level keys', schema.additionalProperties === false);

const findingSchema = schema.properties.findings.items;
check(
  'a finding requires rule, wcag, severity, location, summary and fix',
  ['rule', 'wcag', 'severity', 'location', 'summary', 'fix'].every((k) => findingSchema.required.includes(k)),
);
check(
  'severity is a closed set of four levels',
  JSON.stringify(findingSchema.properties.severity.enum) === JSON.stringify(['critical', 'serious', 'moderate', 'minor']),
);

// 2. A canonical valid payload.
const valid = {
  skill: 'aria-specialist',
  scope: ['src/Tabs.tsx'],
  findings: [
    {
      rule: 'ARIA-011',
      wcag: '4.1.2 A',
      severity: 'serious',
      confidence: 'high',
      location: 'src/Tabs.tsx:31',
      summary: 'Tab list uses div elements with no roles.',
      fix: 'Add role="tablist", role="tab" and role="tabpanel", and wire aria-controls to each panel.',
      evidence: '<div class="tabs"><div class="tab">One</div></div>',
      component: 'Tabs',
    },
  ],
  passed: ['No redundant roles on semantic elements'],
  notes: ['Keyboard behaviour needs a runtime check.'],
};
check('a complete payload validates', validatePayload(valid, schema).length === 0, validatePayload(valid, schema).join('; '));

// 3. The negative cases. Each is a defect that must not reach a report.
const rejects = [
  ['a finding with no fix is not actionable', { ...valid, findings: [{ ...valid.findings[0], fix: undefined }] }],
  ['a finding with no location cannot be found', { ...valid, findings: [{ ...valid.findings[0], location: undefined }] }],
  ['an invented severity would break scoring', { ...valid, findings: [{ ...valid.findings[0], severity: 'blocker' }] }],
  ['an invented confidence would break weighting', { ...valid, findings: [{ ...valid.findings[0], confidence: 'certain' }] }],
  ['prose smuggled in an extra key', { ...valid, commentary: 'Here is what I found...' }],
  ['an extra key inside a finding', { ...valid, findings: [{ ...valid.findings[0], explanation: 'long prose' }] }],
  ['a skill name that is not a slug', { ...valid, skill: 'ARIA Specialist' }],
  ['findings as an object rather than an array', { ...valid, findings: { rule: 'X' } }],
  ['an empty location string', { ...valid, findings: [{ ...valid.findings[0], location: '' }] }],
  ['a summary longer than the limit', { ...valid, findings: [{ ...valid.findings[0], summary: 'x'.repeat(241) }] }],
];

for (const [name, payload] of rejects) {
  const clean = JSON.parse(JSON.stringify(payload));
  check('rejects ' + name, validatePayload(clean, schema).length > 0);
}

// 4. Scoring behaves the way a reader expects.
const oneCritical = score([{ severity: 'critical', confidence: 'high' }], 20);
const manyMinor = score(Array.from({ length: 8 }, () => ({ severity: 'minor', confidence: 'high' })), 20);
check('one critical outweighs eight minor findings', oneCritical.score < manyMinor.score);
check('a clean audit scores 100', score([], 40).score === 100);
check('a clean audit grades A', score([], 40).grade === 'A');
check('low confidence weighs less than high', score([{ severity: 'serious', confidence: 'low' }], 20).score > score([{ severity: 'serious', confidence: 'high' }], 20).score);

// 5. Merging is idempotent and order independent.
const a = { skill: 'aria-specialist', scope: ['x'], findings: [valid.findings[0]] };
const b = { skill: 'keyboard-navigator', scope: ['x'], findings: [valid.findings[0]] };
check('the same defect from two skills merges to one finding', mergeFindings([a, b]).findings.length === 1);
check('merge order does not change the result', JSON.stringify(mergeFindings([a, b]).counts) === JSON.stringify(mergeFindings([b, a]).counts));
check('merging a payload with itself is idempotent', mergeFindings([a, a]).findings.length === 1);

// 6. Criteria cited in examples must exist, at the level claimed.
//
// An invented criterion number in an audit report is worse than none: it looks
// authoritative, it survives into a compliance document, and nobody catches it
// until an auditor does.
const WCAG = JSON.parse(fs.readFileSync(path.join(HERE, '..', 'schemas', 'wcag22-criteria.json'), 'utf8'));

function checkCriterion(where, wcag) {
  if (!wcag || wcag === 'n/a') return;
  const m = String(wcag).match(/^(\d+\.\d+\.\d+)(?:\s+(A|AA|AAA))?$/);
  if (!m) {
    check(`${where} cites a parseable criterion`, false, `"${wcag}" is not "N.N.N" or "N.N.N LEVEL"`);
    return;
  }
  const [, number, level] = m;
  if (WCAG.obsoleted[number]) {
    check(`${where} does not cite an obsoleted criterion`, false, `${number} ${WCAG.obsoleted[number].note}`);
    return;
  }
  const criterion = WCAG.criteria[number];
  check(`${where} cites a real criterion`, Boolean(criterion), `${number} is not in WCAG 2.2`);
  if (criterion && level) {
    check(
      `${where} cites ${number} at its actual level`,
      criterion.level === level,
      `${number} is ${criterion.level}, not ${level}`,
    );
  }
}

check('the WCAG criterion list parses', Object.keys(WCAG.criteria).length > 80, `${Object.keys(WCAG.criteria).length} criteria`);
check('the obsoleted 4.1.1 Parsing is recorded', Boolean(WCAG.obsoleted['4.1.1']));

// 6b. Co-located findings that describe the same defect collapse to one.
//
// Every specialist invents its own rule identifier, so keying the merge on
// rule plus location merges nothing across skills. A real audit of a 156-line
// page returned 141 findings for roughly 60 distinct defects: one div used as
// a button came back eight times under eight rule ids. These cases are taken
// from that run.
const asFinding = (over) => ({
  rule: 'X-1',
  wcag: '4.1.2 A',
  severity: 'serious',
  location: 'index.html:103',
  summary: 'placeholder',
  fix: 'placeholder',
  ...over,
});

const sameDefect = [
  asFinding({
    rule: 'ARIA-006',
    severity: 'critical',
    skill: 'aria-specialist',
    summary: 'The Subscribe control is a div with onclick, so it is announced as plain text.',
    fix: 'Replace the div with a button element.',
  }),
  asFinding({
    rule: 'FORM-007',
    skill: 'forms-specialist',
    summary: 'The Subscribe control is a div with an onclick handler and no button semantics.',
    fix: 'Use a button element so it is announced and operable.',
  }),
  asFinding({
    rule: 'KBD-003',
    skill: 'keyboard-navigator',
    summary: 'The Subscribe div with onclick cannot be reached or operated by keyboard.',
    fix: 'Replace the div with a button element, which is focusable by default.',
  }),
];

const collapsedSame = collapseSameDefect(sameDefect);
check('three reports of one defect collapse to one finding', collapsedSame.length === 1, `got ${collapsedSame.length}`);
if (collapsedSame.length === 1) {
  const only = collapsedSame[0];
  check('the collapsed finding keeps the worst severity', only.severity === 'critical', `kept ${only.severity}`);
  check('the collapsed finding records every rule id', (only.alsoReportedAs || []).length === 2, JSON.stringify(only.alsoReportedAs));
  check('the collapsed finding records every reporting skill', (only.foundBy || []).length === 3, JSON.stringify(only.foundBy));
}

// One line legitimately carries several different defects. The phone input in
// that audit had no label and a positive tabindex; merging them would hide one.
const differentDefects = [
  asFinding({
    rule: 'SEM-011',
    severity: 'critical',
    skill: 'aria-specialist',
    location: 'index.html:91',
    summary: 'The phone field has no label element and is identified only by a placeholder.',
    fix: 'Add a label element associated with the input.',
  }),
  asFinding({
    rule: 'SEM-013',
    skill: 'aria-specialist',
    location: 'index.html:91',
    summary: 'Positive tabindex of 5 on the phone field pulls it out of document order.',
    fix: 'Remove the tabindex and rely on source order.',
  }),
];

check('different defects on one line stay separate', collapseSameDefect(differentDefects).length === 2);

// Collapsing must not invent or lose severity.
const before = countOf(sameDefect.concat(differentDefects));
const after = countOf(collapseSameDefect(sameDefect.concat(differentDefects)));
check('collapsing never raises a count', Object.keys(after).every((k) => after[k] <= before[k]));

function countOf(list) {
  const c = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  for (const f of list) c[f.severity] += 1;
  return c;
}

check('a single finding passes through untouched', collapseSameDefect([sameDefect[0]]).length === 1);
check('an empty set collapses to nothing', collapseSameDefect([]).length === 0);

// 7. Every example a skill ships must validate.
let examples = 0;
for (const dir of fs.readdirSync(SKILLS)) {
  const exampleDir = path.join(SKILLS, dir, 'examples');
  if (!fs.existsSync(exampleDir)) continue;
  for (const file of fs.readdirSync(exampleDir)) {
    if (!file.endsWith('.json')) continue;
    examples += 1;
    const full = path.join(exampleDir, file);
    let payload;
    try {
      payload = JSON.parse(fs.readFileSync(full, 'utf8'));
    } catch (e) {
      check(`example ${dir}/${file} is valid JSON`, false, e.message);
      continue;
    }
    const errors = validatePayload(payload, schema);
    check(`example ${dir}/${file} matches the schema`, errors.length === 0, errors.join('; '));
    check(`example ${dir}/${file} names its own skill`, payload.skill === dir, `says "${payload.skill}"`);
    for (const f of payload.findings || []) {
      checkCriterion(`${dir}/${file} finding ${f.rule}`, f.wcag);
    }
  }
}
check('at least one skill ships an example payload', examples > 0);

// ---------------------------------------------------------------- reporting

console.log('findings contract');
console.log(`  schema        ${path.relative(SKILLS, SCHEMA_PATH).replace(/\\/g, '/')}`);
console.log(`  examples      ${examples}`);
console.log(`  assertions    ${passed + failures.length}`);

if (failures.length) {
  console.error('');
  console.error(`FAILED (${failures.length})`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}

console.log(`  result        ${passed} passed, 0 failed`);
process.exit(0);
