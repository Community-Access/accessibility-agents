#!/usr/bin/env node
/**
 * audit-recall.mjs - grade an audit against a fixture's answer key.
 *
 * `example/` is a page with defects planted on purpose, each marked with an
 * ISSUE comment. That makes it the one target where recall can be measured
 * rather than guessed: strip the comments, audit the result, and check which
 * planted defects came back.
 *
 * Every other gate in this repository proves the pipeline runs. This is the
 * only one that says anything about whether the findings are any good.
 *
 * Matching is by line proximity and keyword overlap, not string equality: a
 * specialist writes its own words, and demanding they match the fixture's
 * comment would measure phrasing rather than detection. A planted defect
 * counts as found when a finding lands within a few lines of it and shares
 * the terms that identify it.
 *
 * Usage:
 *   node scripts/audit-recall.mjs <findings-dir> [--json]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const findingsDir = argv.find((a) => !a.startsWith('--'));
const runDir = findingsDir ? path.dirname(path.resolve(findingsDir)) : null;

if (!findingsDir) {
  console.error('Usage: audit-recall.mjs <findings-dir> [--json]');
  process.exit(2);
}

/** Words that identify a defect but say nothing on their own. */
const STOP = new Set([
  'issue', 'the', 'a', 'an', 'no', 'not', 'on', 'in', 'to', 'of', 'for', 'with', 'without',
  'and', 'or', 'is', 'are', 'be', 'as', 'at', 'by', 'it', 'its', 'this', 'that', 'should',
  'must', 'has', 'have', 'used', 'use', 'page', 'element', 'elements', 'via', 'attribute',
]);

function terms(text) {
  return new Set(
    String(text)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w)),
  );
}

/**
 * The map from original line numbers to their position in the stripped copy.
 * Without it the key and the findings are numbered against different files,
 * which is how the first run of this reported seven misses that had all
 * actually been found.
 */
function lineMap() {
  const file = path.join(runDir, 'linemap.json');
  if (!fs.existsSync(file)) {
    console.error('No linemap.json beside the findings. Run scripts/audit-fixture.mjs first.');
    process.exit(2);
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/** Read the planted defects out of the fixture. */
function answerKey() {
  const map = lineMap();
  const planted = [];
  for (const file of ['index.html', 'styles.css']) {
    const full = path.join(ROOT, 'example', file);
    const lines = fs.readFileSync(full, 'utf8').split('\n');
    lines.forEach((line, i) => {
      const m = line.match(/ISSUE:\s*(.+?)\s*(?:-->|\*\/)?\s*$/);
      if (!m) return;
      const original = i + 1;
      const fileMap = map[file] || {};
      let mapped = fileMap[original];
      for (let d = 1; mapped == null && d <= 3; d += 1) {
        mapped = fileMap[original + d] ?? fileMap[original - d];
      }

      // The comment alone is a poor fingerprint: "2.23:1 on #333 - FAILS"
      // shares almost no words with a finding that says the same thing in
      // prose. The code the comment is about is the strong signal, so the
      // defect's terms include its own line and the next line of real content.
      const context = [line];
      for (let d = 1, added = 0; d <= 4 && added < 2; d += 1) {
        const next = lines[i + d];
        if (next == null) break;
        if (!next.trim() || /ISSUE:/.test(next)) continue;
        context.push(next);
        added += 1;
      }
      const codeTerms = terms(context.join(' ').replace(/ISSUE:[^*\-]*/g, ' '));

      planted.push({
        file,
        line: original,
        stripped: mapped ?? null,
        text: m[1].trim(),
        terms: terms(m[1]),
        codeTerms,
      });
    });
  }
  return planted;
}

/** Load every findings payload a specialist wrote. */
function loadFindings(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir).sort()) {
    if (!f.endsWith('.json')) continue;
    let payload;
    try {
      payload = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    } catch (e) {
      console.error(`could not parse ${f}: ${e.message}`);
      continue;
    }
    for (const finding of payload.findings || []) {
      const loc = String(finding.location || '');
      const lm = loc.match(/(index\.html|styles\.css)\D*(\d+)/);
      out.push({
        skill: payload.skill || f.replace('.json', ''),
        file: lm ? lm[1] : null,
        line: lm ? Number(lm[2]) : null,
        rule: finding.rule,
        severity: finding.severity,
        terms: terms(`${finding.summary} ${finding.rule} ${finding.fix}`),
        summary: finding.summary,
      });
    }
  }
  return out;
}

/**
 * A planted defect is found when some finding is near it and describes it.
 * The window is generous because a specialist may cite the element, the rule
 * or the stylesheet line rather than the exact comment line.
 */
const NEAR = 6;
const OVERLAP = 2;

function match(planted, findings) {
  let best = null;
  for (const f of findings) {
    const sameFile = f.file === planted.file;
    const target = planted.stripped ?? planted.line;
    const distance = sameFile && f.line != null ? Math.abs(f.line - target) : Infinity;

    let shared = 0;
    for (const t of planted.terms) if (f.terms.has(t)) shared += 1;

    // Distinctive tokens from the code itself: a colour, a property, an
    // attribute name. Two of these is a near-certain identification.
    let code = 0;
    for (const t of planted.codeTerms) if (f.terms.has(t)) code += 1;

    let score = shared * 2 + code;
    if (distance <= NEAR) score += 4;
    else if (sameFile) score += 1;

    // Any one of: the right place and on topic; strong agreement on the code;
    // or strong agreement on the description.
    const hit =
      (distance <= NEAR && (shared >= 1 || code >= 2)) ||
      (sameFile && code >= 3) ||
      shared >= OVERLAP + 1;

    if (hit && (!best || score > best.score)) best = { ...f, score, distance, shared, code };
  }
  return best;
}

const planted = answerKey();
const findings = loadFindings(path.resolve(findingsDir));

const rows = planted.map((p) => ({ planted: p, found: match(p, findings) }));
const found = rows.filter((r) => r.found);
const missed = rows.filter((r) => !r.found);

// A finding that matched nothing planted is not necessarily wrong: the fixture
// is not an exhaustive list of everything wrong with the page.
const matchedFindings = new Set(found.map((r) => r.found.summary));
const unmatched = findings.filter((f) => !matchedFindings.has(f.summary));

const bySkill = {};
for (const f of findings) {
  bySkill[f.skill] = bySkill[f.skill] || { total: 0, matched: 0 };
  bySkill[f.skill].total += 1;
  if (matchedFindings.has(f.summary)) bySkill[f.skill].matched += 1;
}

const report = {
  planted: planted.length,
  found: found.length,
  missed: missed.length,
  recall: Math.round((found.length / planted.length) * 100),
  findingsTotal: findings.length,
  findingsBeyondTheKey: unmatched.length,
  bySkill,
  missedDetail: missed.map((r) => ({ file: r.planted.file, line: r.planted.line, text: r.planted.text })),
};

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

console.log('Audit recall against the fixture answer key');
console.log('');
console.log(`  planted defects     ${report.planted}`);
console.log(`  found               ${report.found}`);
console.log(`  missed              ${report.missed}`);
console.log(`  recall              ${report.recall}%`);
console.log(`  findings returned   ${report.findingsTotal}`);
console.log(`  beyond the key      ${report.findingsBeyondTheKey} (not necessarily wrong; the key is not exhaustive)`);
console.log('');
console.log('By skill');
for (const [skill, s] of Object.entries(bySkill).sort()) {
  console.log(`  ${skill.padEnd(26)} ${String(s.total).padStart(3)} findings, ${s.matched} matched a planted defect`);
}

if (missed.length) {
  console.log('');
  console.log('Missed');
  for (const m of report.missedDetail) {
    console.log(`  ${m.file}:${String(m.line).padEnd(4)} ${m.text.slice(0, 96)}`);
  }
}
process.exit(0);
