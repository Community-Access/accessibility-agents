#!/usr/bin/env node
/**
 * render-report.mjs - turn findings JSON into the audit report.
 *
 * The model's job ends at findings. This renders them, because a 60-finding
 * report costs roughly 15,000 output tokens to type and nothing to generate,
 * and because a generated report cannot quietly omit a required section.
 *
 * Every report carries the seven sections a11y-core requires, and ends with the
 * merged findings in a fenced JSON block so the next run can compute a delta
 * without re-parsing prose.
 *
 * Usage:
 *   node render-report.mjs .a11y-history/run/*.json --template web --out WEB-ACCESSIBILITY-AUDIT.md
 *   node render-report.mjs --self-test
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPayloads, mergeFindings, delta, SEVERITIES } from './merge-findings.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..');

const TEMPLATES = {
  web: { title: 'Web Accessibility Audit', subject: 'web content', defaultOut: 'WEB-ACCESSIBILITY-AUDIT.md' },
  document: { title: 'Document Accessibility Audit', subject: 'documents', defaultOut: 'DOCUMENT-ACCESSIBILITY-AUDIT.md' },
  markdown: { title: 'Markdown Accessibility Audit', subject: 'markdown documentation', defaultOut: 'MARKDOWN-ACCESSIBILITY-AUDIT.md' },
};

/** The sections a11y-core requires. --self-test asserts every one is present. */
const REQUIRED_SECTIONS = [
  'Metadata',
  'Executive summary',
  'Findings',
  'Severity breakdown',
  'Remediation priorities',
  'Next steps',
];

const VERDICT = {
  pass: 'Pass. No critical or serious findings.',
  fail: 'Fail. Critical or serious findings must be fixed before this ships.',
};

function esc(text) {
  return String(text ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function heading(level, text) {
  return '#'.repeat(level) + ' ' + text;
}

/** "is" for one, "are" for any other count. */
function agree(count, singular, pluralForm) {
  return count === 1 ? singular : pluralForm;
}

/**
 * A count written next to its noun. Reports get read aloud from top to bottom,
 * so a sentence that says "1 findings" makes a listener stop and re-read it.
 */
function counted(count, noun) {
  return `${count} ${agree(count, noun, noun + 's')}`;
}

/** Pull the embedded findings block out of a previous report, if there is one. */
export function readPreviousMerge(outPath) {
  if (!fs.existsSync(outPath)) return null;
  const text = fs.readFileSync(outPath, 'utf8');
  const m = text.match(/```json a11y-findings\n([\s\S]*?)\n```/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

function severityTable(counts) {
  const lines = [
    'Counts by severity, highest impact first.',
    '',
    '| Severity | Count | What it means |',
    '|---|---:|---|',
  ];
  const meaning = {
    critical: 'Blocks a person from completing the task',
    serious: 'Major barrier with a difficult workaround',
    moderate: 'Real friction, workaround exists',
    minor: 'Noticeable but rarely blocking',
  };
  for (const s of SEVERITIES) {
    lines.push(`| ${s} | ${counts[s]} | ${meaning[s]} |`);
  }
  return lines.join('\n');
}

function findingsSection(merged) {
  if (!merged.findings.length) {
    return 'No findings. Every check listed under "What passed" ran and came back clean.';
  }

  const out = [
    `${counted(merged.findings.length, 'finding')}, ordered by severity then by rule.`,
    '',
  ];

  for (const s of SEVERITIES) {
    const group = merged.findings.filter((f) => f.severity === s);
    if (!group.length) continue;
    out.push(heading(3, `${s[0].toUpperCase() + s.slice(1)} (${group.length})`), '');
    out.push('Each row names the rule, the criterion it fails, where it is, and what to change.');
    out.push('');
    out.push('| Rule | WCAG | Location | Problem | Fix |');
    out.push('|---|---|---|---|---|');
    for (const f of group) {
      out.push(
        `| \`${esc(f.rule)}\` | ${esc(f.wcag)} | ${esc(f.location)} | ${esc(f.summary)} | ${esc(f.fix)} |`,
      );
    }
    out.push('');

    const lowConfidence = group.filter((f) => f.confidence === 'low');
    if (lowConfidence.length) {
      out.push(
        `${lowConfidence.length} of these ${agree(lowConfidence.length, 'is', 'are')} low confidence and ` +
          `${agree(lowConfidence.length, 'needs', 'need')} a human to confirm: ` +
          lowConfidence.map((f) => '`' + f.rule + '` at ' + f.location).join(', ') +
          '.',
        '',
      );
    }
  }
  return out.join('\n').trim();
}

function prioritiesSection(merged) {
  if (!merged.findings.length) return 'Nothing to remediate.';

  const out = [];
  if (merged.components.length) {
    out.push(
      'Fix these components first. Each one carries the same defect in several places, so one fix clears every instance.',
      '',
      '| Component | Instances | Worst severity | Rules |',
      '|---|---:|---|---|',
    );
    for (const c of merged.components) {
      out.push(`| ${esc(c.component)} | ${c.count} | ${c.worst} | ${c.rules.map((r) => '`' + r + '`').join(', ')} |`);
    }
    out.push('');
  }

  const blocking = merged.findings.filter((f) => f.severity === 'critical' || f.severity === 'serious');
  if (blocking.length) {
    // "Then" only works as a follow-on to something. With no component table
    // above it, the list has to open on its own.
    out.push(
      merged.components.length
        ? `Then the ${counted(blocking.length, 'remaining blocking finding')}, in this order:`
        : `The ${counted(blocking.length, 'blocking finding')}, in this order:`,
      '',
    );
    blocking.slice(0, 20).forEach((f, i) => {
      out.push(`${i + 1}. \`${f.rule}\` at ${f.location}. ${f.fix}`);
    });
    if (blocking.length > 20) {
      const more = blocking.length - 20;
      out.push(`${more} more ${agree(more, 'is', 'are')} in the findings table above.`);
    }
    out.push('');
  }

  const rest = merged.findings.length - blocking.length;
  if (rest > 0) {
    out.push(
      rest === 1
        ? 'The remaining moderate or minor finding can follow in normal work.'
        : `The remaining ${rest} moderate and minor findings can follow in normal work.`,
    );
  }
  return out.join('\n').trim();
}

function deltaSection(d) {
  const lines = [
    'Movement since the previous report.',
    '',
    '| Change | Count |',
    '|---|---:|',
    `| Fixed | ${d.fixed.length} |`,
    `| New | ${d.new.length} |`,
    `| Persistent | ${d.persistent.length} |`,
    `| Regressed | ${d.regressed.length} |`,
    '',
    `Score moved from ${d.scoreBefore ?? 'unknown'} to ${d.scoreAfter}.`,
  ];
  if (d.regressed.length) {
    lines.push('', 'Regressions, which are findings that got worse rather than better:', '');
    for (const f of d.regressed) {
      lines.push(`- \`${f.rule}\` at ${f.location}: ${f.was} became ${f.severity}.`);
    }
  }
  return lines.join('\n');
}

export function renderReport({ merged, template, scope, previous, toolVersions, configs }) {
  const t = TEMPLATES[template];
  const now = new Date().toISOString().slice(0, 10);
  const blocking = merged.counts.critical + merged.counts.serious;
  const d = delta(merged, previous);

  const out = [];
  out.push(heading(1, t.title), '');
  out.push(
    `An audit of ${t.subject}, run on ${now}. Read the executive summary for the verdict, ` +
      'the priorities section for what to do first, and the findings tables for detail.',
    '',
  );

  out.push(heading(2, 'Metadata'), '');
  out.push('What was audited, with what, and under which settings.', '');
  out.push('| Field | Value |', '|---|---|');
  out.push(`| Date | ${now} |`);
  out.push(`| Scope | ${scope.length} ${scope.length === 1 ? 'item' : 'items'} |`);
  out.push(`| Skills run | ${merged.skills.join(', ') || 'none'} |`);
  out.push(`| Tooling | ${toolVersions} |`);
  out.push(`| Scan configuration | ${configs.length ? configs.join(', ') : 'defaults, no config file found'} |`);
  out.push(`| Checks counted | ${merged.checks} |`);
  out.push('');
  if (scope.length) {
    out.push('Audited:', '');
    for (const s of scope.slice(0, 50)) out.push(`- \`${s}\``);
    if (scope.length > 50) out.push(`- and ${scope.length - 50} more`);
    out.push('');
  }

  out.push(heading(2, 'Executive summary'), '');
  out.push(blocking ? VERDICT.fail : VERDICT.pass, '');
  out.push('The headline numbers for this run.', '');
  out.push('| Measure | Value |', '|---|---|');
  out.push(`| Score | ${merged.score} out of 100 |`);
  out.push(`| Grade | ${merged.grade} |`);
  out.push(`| Findings | ${merged.findings.length} |`);
  out.push(`| Blocking (critical plus serious) | ${blocking} |`);
  out.push(`| Verdict | ${blocking ? 'Fail' : 'Pass'} |`);
  out.push('');

  out.push(heading(2, 'Severity breakdown'), '');
  out.push(severityTable(merged.counts), '');

  out.push(heading(2, 'Findings'), '');
  out.push(findingsSection(merged), '');

  out.push(heading(2, 'Remediation priorities'), '');
  out.push(prioritiesSection(merged), '');

  if (d) {
    out.push(heading(2, 'Delta tracking'), '');
    out.push(deltaSection(d), '');
  }

  if (merged.passed.length) {
    out.push(heading(2, 'What passed'), '');
    out.push(`${counted(merged.passed.length, 'check')} ran and found nothing.`, '');
    for (const p of merged.passed) out.push(`- ${p}`);
    out.push('');
  }

  if (merged.notes.length) {
    out.push(heading(2, 'Needs a human'), '');
    out.push('Items a skill could not decide, or could not check automatically.', '');
    for (const n of merged.notes) out.push(`- **${n.skill}**: ${n.note}`);
    out.push('');
  }

  out.push(heading(2, 'Next steps'), '');
  out.push(
    blocking
      ? `1. Fix the ${counted(blocking, 'blocking finding')} above, starting with any repeated component.\n` +
          '2. Re-run this audit and check the delta section for regressions.\n' +
          '3. Wire the scan into continuous integration so the next regression is caught before review.'
      : '1. Keep the current checks in continuous integration so this does not regress.\n' +
          '2. Re-audit when the interface changes materially, or quarterly.\n' +
          '3. Confirm the automated result with a manual screen reader and keyboard pass.',
    '',
  );
  out.push(
    'Automated checks find a minority of accessibility barriers. A passing score is a floor, not a guarantee.',
    '',
  );

  out.push(heading(2, 'Findings data'), '');
  out.push(
    'The merged findings, embedded so the next run can compute a delta without parsing this document.',
    '',
  );
  out.push('```json a11y-findings');
  out.push(JSON.stringify({ ...merged, generated: now, template }, null, 2));
  out.push('```', '');

  return out.join('\n');
}

// ----------------------------------------------------------------- self test

function selfTest() {
  const sample = [
    {
      skill: 'aria-specialist',
      scope: ['src/Modal.tsx'],
      findings: [
        {
          rule: 'ARIA-002',
          wcag: '4.1.2 A',
          severity: 'critical',
          location: 'src/Modal.tsx:42',
          summary: 'Dialog has no accessible name.',
          fix: 'Add aria-labelledby pointing at the dialog title element.',
          component: 'Modal',
        },
        {
          rule: 'ARIA-007',
          wcag: '1.3.1 A',
          severity: 'minor',
          confidence: 'low',
          location: 'src/Card.tsx:12',
          summary: 'Redundant role on a semantic element.',
          fix: 'Remove role="article" from the article element.',
        },
      ],
      passed: ['No aria-hidden on a focusable element'],
      notes: ['Could not verify the live region without running the app.'],
    },
    {
      skill: 'keyboard-navigator',
      scope: ['src/Modal.tsx'],
      findings: [
        {
          rule: 'ARIA-002',
          wcag: '4.1.2 A',
          severity: 'serious',
          location: 'src/Modal.tsx:42',
          summary: 'Dialog has no accessible name.',
          fix: 'Add aria-labelledby pointing at the dialog title element.',
          component: 'Modal',
        },
        {
          rule: 'KBD-001',
          wcag: '2.1.2 A',
          severity: 'critical',
          location: 'src/Modal.tsx:58',
          summary: 'Focus is not trapped inside the open dialog.',
          fix: 'Cycle Tab within the dialog and restore focus to the opener on close.',
          component: 'Modal',
        },
      ],
      passed: ['Visible focus indicator on every control'],
    },
  ];

  const merged = mergeFindings(sample);
  const failures = [];

  if (merged.findings.length !== 3) failures.push(`expected 3 findings after dedupe, got ${merged.findings.length}`);

  const dup = merged.findings.find((f) => f.rule === 'ARIA-002');
  if (!dup) failures.push('the deduplicated finding is missing');
  else {
    if (dup.severity !== 'critical') failures.push(`dedupe kept ${dup.severity}, expected the more severe critical`);
    if (!dup.foundBy || dup.foundBy.length !== 2) failures.push('dedupe did not record both reporting skills');
  }

  if (merged.counts.critical !== 2) failures.push(`expected 2 critical, got ${merged.counts.critical}`);
  if (!merged.components.some((c) => c.component === 'Modal' && c.count === 2)) {
    failures.push('repeated component grouping did not find Modal twice');
  }
  if (merged.score < 0 || merged.score > 100) failures.push(`score ${merged.score} out of range`);
  if (!'ABCDF'.includes(merged.grade)) failures.push(`grade ${merged.grade} is not a letter grade`);

  const report = renderReport({
    merged,
    template: 'web',
    scope: merged.scope,
    previous: null,
    toolVersions: 'self-test',
    configs: [],
  });

  for (const section of REQUIRED_SECTIONS) {
    if (!report.includes('## ' + section)) failures.push(`report is missing the required section "${section}"`);
  }
  if (!/```json a11y-findings/.test(report)) failures.push('report does not embed the findings block');
  if (!report.includes('Fail.')) failures.push('report did not state a verdict for a run with critical findings');

  // Every count in a sentence has to agree with its noun, and the blocking list
  // may only open with "Then" when the component table above it printed.
  const pluralForms = [
    ['3 findings, ordered by severity then by rule.', 'the findings count'],
    ['Then the 2 remaining blocking findings, in this order:', 'the blocking list opener after a component table'],
    ['2 checks ran and found nothing.', 'the passed count'],
    ['Fix the 2 blocking findings above', 'the next steps count'],
  ];
  for (const [needle, what] of pluralForms) {
    if (!report.includes(needle)) failures.push(`multi-finding report lost the plural for ${what}`);
  }

  const single = renderReport({
    merged: mergeFindings([
      {
        skill: 'aria-specialist',
        scope: ['src/Dialog.tsx'],
        findings: [
          {
            rule: 'ARIA-002',
            wcag: '4.1.2 A',
            severity: 'critical',
            location: 'src/Dialog.tsx:9',
            summary: 'Dialog has no accessible name.',
            fix: 'Add aria-labelledby pointing at the dialog title element.',
          },
        ],
        passed: ['No aria-hidden on a focusable element'],
      },
    ]),
    template: 'web',
    scope: ['src/Dialog.tsx'],
    previous: null,
    toolVersions: 'self-test',
    configs: [],
  });

  const singularForms = [
    ['1 finding, ordered by severity then by rule.', 'the findings count'],
    ['The 1 blocking finding, in this order:', 'the blocking list opener when no component table printed'],
    ['1 check ran and found nothing.', 'the passed count'],
    ['Fix the 1 blocking finding above', 'the next steps count'],
  ];
  for (const [needle, what] of singularForms) {
    if (!single.includes(needle)) failures.push(`one-finding report did not use the singular for ${what}`);
  }
  if (single.includes('Then the')) {
    failures.push('one-finding report opened the blocking list with "Then" and no component table above it');
  }

  // A second run with one finding fixed must produce a delta section.
  const previous = JSON.parse(report.match(/```json a11y-findings\n([\s\S]*?)\n```/)[1]);
  const fewer = mergeFindings([{ ...sample[0], findings: [sample[0].findings[1]] }]);
  const second = renderReport({
    merged: fewer,
    template: 'web',
    scope: fewer.scope,
    previous,
    toolVersions: 'self-test',
    configs: [],
  });
  if (!second.includes('## Delta tracking')) failures.push('second run produced no delta section');
  if (!second.includes('| Fixed | 2 |')) failures.push('delta did not count the two fixed findings');

  if (failures.length) {
    console.error('render-report self-test FAILED');
    for (const f of failures) console.error('  - ' + f);
    return 1;
  }
  console.log('render-report self-test OK');
  console.log(`  merged ${sample.length} payloads into ${merged.findings.length} findings`);
  console.log(`  score ${merged.score}, grade ${merged.grade}`);
  console.log(
    `  all ${REQUIRED_SECTIONS.length} required sections present, findings block embedded, delta verified`,
  );
  console.log('  singular and plural counts verified against a one-finding report');
  return 0;
}

// ---------------------------------------------------------------------- main

function toolVersionString() {
  const parts = [`node ${process.version}`];
  const pkg = path.join(ROOT, 'mcp-server', 'package.json');
  if (fs.existsSync(pkg)) {
    try {
      parts.push('a11y-mcp-server ' + JSON.parse(fs.readFileSync(pkg, 'utf8')).version);
    } catch {
      /* version is a nicety, not a requirement */
    }
  }
  return parts.join(', ');
}

function findConfigs() {
  return [
    '.a11y-web-config.json',
    '.a11y-office-config.json',
    '.a11y-pdf-config.json',
    '.a11y-epub-config.json',
    '.a11y-markdown-config.json',
  ].filter((f) => fs.existsSync(path.join(process.cwd(), f)));
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.includes('--self-test')) return selfTest();

  const files = argv.filter((a) => !a.startsWith('--') && !isOptionValue(argv, a));
  const template = optionValue(argv, '--template') || 'web';
  if (!TEMPLATES[template]) {
    console.error(`Unknown template "${template}". Use one of: ${Object.keys(TEMPLATES).join(', ')}`);
    return 2;
  }
  if (!files.length) {
    console.error('Usage: render-report.mjs <findings.json>... [--template web|document|markdown] [--out FILE]');
    return 2;
  }

  const out = optionValue(argv, '--out') || TEMPLATES[template].defaultOut;
  const { payloads, problems } = loadPayloads(files);

  for (const p of problems) console.error('invalid: ' + p);
  if (!payloads.length) {
    console.error('No valid findings payloads. Nothing rendered.');
    return 1;
  }

  const merged = mergeFindings(payloads);
  const previous = readPreviousMerge(path.resolve(process.cwd(), out));
  const report = renderReport({
    merged,
    template,
    scope: merged.scope,
    previous,
    toolVersions: toolVersionString(),
    configs: findConfigs(),
  });

  fs.writeFileSync(path.resolve(process.cwd(), out), report, 'utf8');
  console.log(`Wrote ${out}`);
  console.log(`  ${counted(merged.findings.length, 'finding')}, score ${merged.score}, grade ${merged.grade}`);
  if (previous) console.log('  delta computed against the previous report');
  if (problems.length) console.log(`  ${counted(problems.length, 'payload')} rejected as invalid`);
  return problems.length ? 1 : 0;
}

function optionValue(argv, name) {
  const i = argv.indexOf(name);
  return i === -1 ? null : argv[i + 1];
}

function isOptionValue(argv, value) {
  const i = argv.indexOf(value);
  return i > 0 && argv[i - 1].startsWith('--');
}

/**
 * Only run when invoked directly. The MCP `render_accessibility_report` tool
 * imports `renderReport` and `readPreviousMerge` from here, and a module that
 * calls process.exit on import would take the server down with it.
 */
function isMain() {
  return process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

if (isMain()) process.exit(main());
