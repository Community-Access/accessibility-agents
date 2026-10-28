#!/usr/bin/env node
/**
 * merge-findings.mjs - combine findings payloads into one scored result.
 *
 * Every scanning skill returns JSON matching schemas/findings.schema.json.
 * This merges them: validates each payload, deduplicates findings that several
 * skills found in the same place, groups repeats that share a component, and
 * computes the score and grade.
 *
 * Exported for render-report.mjs; runnable on its own to inspect a merge.
 *
 * Usage:
 *   node skills/a11y-core/scripts/merge-findings.mjs .a11y-history/run/*.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const SCHEMA_PATH = path.resolve(HERE, '..', 'schemas', 'findings.schema.json');

export const SEVERITIES = ['critical', 'serious', 'moderate', 'minor'];

/**
 * Weights come from the severity scoring reference shipped with this package.
 * They are deliberately steep: one critical finding should outweigh a handful
 * of minor ones, because one critical finding locks a person out.
 */
export const SEVERITY_WEIGHT = { critical: 10, serious: 5, moderate: 2, minor: 1 };

/** Confidence scales a finding's weight; an unverified guess counts for less. */
const CONFIDENCE_FACTOR = { high: 1, medium: 0.7, low: 0.4 };

const GRADES = [
  [90, 'A'],
  [80, 'B'],
  [70, 'C'],
  [60, 'D'],
  [0, 'F'],
];

// --------------------------------------------------------------- validation

/**
 * Minimal JSON Schema check, limited to the constructs findings.schema.json
 * actually uses. A dependency-free validator keeps this runnable anywhere the
 * skills run, which is the point of shipping it inside the package.
 */
export function validatePayload(payload, schema, where = 'payload') {
  const errors = [];

  const checkObject = (value, node, pointer) => {
    if (node.type === 'object') {
      if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        errors.push(`${pointer}: expected an object`);
        return;
      }
      for (const key of node.required || []) {
        if (!(key in value)) errors.push(`${pointer}: missing required property "${key}"`);
      }
      if (node.additionalProperties === false) {
        for (const key of Object.keys(value)) {
          if (!node.properties || !(key in node.properties)) {
            errors.push(`${pointer}: unexpected property "${key}"`);
          }
        }
      }
      for (const [key, sub] of Object.entries(node.properties || {})) {
        if (key in value) checkObject(value[key], sub, `${pointer}/${key}`);
      }
      return;
    }

    if (node.type === 'array') {
      if (!Array.isArray(value)) {
        errors.push(`${pointer}: expected an array`);
        return;
      }
      if (node.items) value.forEach((item, i) => checkObject(item, node.items, `${pointer}[${i}]`));
      return;
    }

    if (node.enum) {
      if (!node.enum.includes(value)) {
        errors.push(`${pointer}: "${value}" is not one of ${node.enum.join(', ')}`);
      }
      return;
    }

    if (node.type === 'string') {
      if (typeof value !== 'string') {
        errors.push(`${pointer}: expected a string`);
        return;
      }
      if (node.minLength != null && value.length < node.minLength) {
        errors.push(`${pointer}: shorter than ${node.minLength} characters`);
      }
      if (node.maxLength != null && value.length > node.maxLength) {
        errors.push(`${pointer}: longer than ${node.maxLength} characters`);
      }
      if (node.pattern && !new RegExp(node.pattern).test(value)) {
        errors.push(`${pointer}: does not match ${node.pattern}`);
      }
    }
  };

  checkObject(payload, schema, where);
  return errors;
}

// ------------------------------------------------------------------- merging

function normalise(text) {
  return String(text || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Two findings are the same defect when the same rule fires in the same place. */
function fingerprint(f) {
  return normalise(f.rule) + '\u0000' + normalise(f.location);
}

export function mergeFindings(payloads) {
  const byFingerprint = new Map();
  const scope = new Set();
  const passed = new Set();
  const notes = [];
  const skills = [];

  for (const p of payloads) {
    skills.push(p.skill);
    for (const s of p.scope || []) scope.add(s);
    for (const c of p.passed || []) passed.add(c);
    for (const n of p.notes || []) notes.push({ skill: p.skill, note: n });

    for (const f of p.findings || []) {
      const key = fingerprint(f);
      const existing = byFingerprint.get(key);
      if (!existing) {
        byFingerprint.set(key, { ...f, foundBy: [p.skill] });
        continue;
      }
      // Two skills found the same defect. Keep the more severe reading and the
      // more confident one, and record that both saw it.
      if (SEVERITY_WEIGHT[f.severity] > SEVERITY_WEIGHT[existing.severity]) {
        existing.severity = f.severity;
      }
      const rank = { high: 3, medium: 2, low: 1 };
      if ((rank[f.confidence] || 3) > (rank[existing.confidence] || 3)) {
        existing.confidence = f.confidence;
      }
      if (!existing.foundBy.includes(p.skill)) existing.foundBy.push(p.skill);
      if (!existing.evidence && f.evidence) existing.evidence = f.evidence;
    }
  }

  const findings = collapseSameDefect([...byFingerprint.values()]).sort((a, b) => {
    const s = SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity];
    if (s) return s;
    const r = String(a.rule).localeCompare(String(b.rule));
    if (r) return r;
    return String(a.location).localeCompare(String(b.location));
  });

  return {
    skills: [...new Set(skills)].sort(),
    scope: [...scope].sort(),
    findings,
    passed: [...passed].sort(),
    notes,
    counts: countBySeverity(findings),
    components: groupByComponent(findings),
    ...score(findings, passed.size),
  };
}

/** Words too common in accessibility prose to identify a specific defect. */
const COMMON = new Set([
  'the', 'a', 'an', 'and', 'or', 'is', 'are', 'not', 'no', 'to', 'of', 'for', 'with', 'without',
  'that', 'this', 'it', 'its', 'so', 'has', 'have', 'be', 'been', 'on', 'in', 'at', 'by', 'as',
  'can', 'cannot', 'will', 'would', 'should', 'must', 'add', 'use', 'using', 'used', 'when',
  'which', 'their', 'there', 'they', 'them', 'any', 'all', 'only', 'from', 'into', 'element',
  'elements', 'content', 'page', 'user', 'users', 'screen', 'reader', 'readers', 'assistive',
  'technology', 'accessible', 'accessibility', 'aria', 'html', 'css', 'attribute', 'attributes',
]);

function distinctive(text) {
  return new Set(
    String(text)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !COMMON.has(w)),
  );
}

/**
 * Collapse findings that describe the same defect in the same place.
 *
 * The fingerprint pass above keys on rule plus location, which only merges
 * findings that agree on a rule identifier. Specialists do not: each invents
 * its own namespace, so one div used as a button came back as ARIA-006,
 * FORM-007, FORM-008, KBD-002 and four more, at the same line, and the merge
 * kept all eight. A real audit of a 156-line page produced 141 findings for
 * roughly 60 distinct defects, and the report told the reader to fix each one
 * separately.
 *
 * So co-located findings are compared on what they say. Similarity has to be
 * high, because one line legitimately carries several different defects: the
 * phone input at index.html:91 has both no label and a positive tabindex, and
 * those must stay apart.
 *
 * The survivor keeps the worst severity, every skill that reported it, and
 * every rule identifier, so nothing is lost by merging.
 */
const SIMILAR_ENOUGH = 0.45;

export function collapseSameDefect(findings) {
  const byLocation = new Map();
  for (const f of findings) {
    const key = normalise(f.location);
    if (!byLocation.has(key)) byLocation.set(key, []);
    byLocation.get(key).push(f);
  }

  const out = [];
  for (const group of byLocation.values()) {
    if (group.length === 1) {
      out.push(group[0]);
      continue;
    }

    const clusters = [];
    for (const f of group) {
      const terms = distinctive(`${f.summary} ${f.fix}`);
      let joined = null;

      for (const c of clusters) {
        let shared = 0;
        for (const t of terms) if (c.terms.has(t)) shared += 1;
        // Jaccard-style overlap against the smaller set, so a terse summary
        // and a verbose one can still be recognised as the same defect.
        const ratio = shared / Math.max(1, Math.min(terms.size, c.terms.size));
        if (ratio >= SIMILAR_ENOUGH) {
          joined = c;
          break;
        }
      }

      if (!joined) {
        clusters.push({ terms, members: [f] });
        continue;
      }
      joined.members.push(f);
      for (const t of terms) joined.terms.add(t);
    }

    for (const c of clusters) {
      out.push(mergeCluster(c.members));
    }
  }
  return out;
}

/** One finding standing for several reports of the same defect. */
function mergeCluster(members) {
  if (members.length === 1) return members[0];

  const rank = { high: 3, medium: 2, low: 1 };
  const winner = members.reduce((best, f) =>
    SEVERITY_WEIGHT[f.severity] > SEVERITY_WEIGHT[best.severity] ? f : best,
  );

  const merged = { ...winner };
  merged.foundBy = [...new Set(members.flatMap((m) => m.foundBy || [m.skill]).filter(Boolean))];
  merged.alsoReportedAs = [...new Set(members.map((m) => m.rule).filter((r) => r !== winner.rule))];
  merged.confidence = members.reduce(
    (best, f) => ((rank[f.confidence] || 3) > (rank[best] || 3) ? f.confidence : best),
    winner.confidence,
  );
  if (!merged.evidence) merged.evidence = members.find((m) => m.evidence)?.evidence;
  if (!merged.component) merged.component = members.find((m) => m.component)?.component;
  return merged;
}

export function countBySeverity(findings) {
  const counts = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  for (const f of findings) {
    if (counts[f.severity] != null) counts[f.severity] += 1;
  }
  return counts;
}

/**
 * The same defect repeated across pages is usually one component, and fixing
 * the component fixes every instance. Surfacing that turns a list of 40
 * findings into a list of 4 jobs.
 */
function groupByComponent(findings) {
  const groups = new Map();
  for (const f of findings) {
    if (!f.component) continue;
    const g = groups.get(f.component) || { component: f.component, count: 0, worst: 'minor', rules: new Set() };
    g.count += 1;
    g.rules.add(f.rule);
    if (SEVERITY_WEIGHT[f.severity] > SEVERITY_WEIGHT[g.worst]) g.worst = f.severity;
    groups.set(f.component, g);
  }
  return [...groups.values()]
    .map((g) => ({ ...g, rules: [...g.rules].sort() }))
    .filter((g) => g.count > 1)
    .sort((a, b) => b.count - a.count);
}

/**
 * Score out of 100. Penalty is the confidence-weighted severity sum, scaled
 * against the amount actually checked so a large clean audit is not punished
 * for its size and a tiny one cannot hide behind it.
 */
export function score(findings, passedCount = 0) {
  let penalty = 0;
  for (const f of findings) {
    penalty += SEVERITY_WEIGHT[f.severity] * (CONFIDENCE_FACTOR[f.confidence] ?? 1);
  }
  const checks = Math.max(findings.length + passedCount, 10);
  const value = Math.max(0, Math.round(100 - (penalty / checks) * 20));
  const grade = GRADES.find(([floor]) => value >= floor)[1];
  return { score: value, grade, penalty: Math.round(penalty * 10) / 10, checks };
}

/**
 * Compare against a previous merge. Fixed, new, persistent and regressed are
 * what a second audit is for; without them a re-run is just another list.
 */
export function delta(current, previous) {
  if (!previous) return null;
  const now = new Map(current.findings.map((f) => [fingerprint(f), f]));
  const before = new Map((previous.findings || []).map((f) => [fingerprint(f), f]));

  const fixed = [];
  const added = [];
  const persistent = [];
  const regressed = [];

  for (const [key, f] of before) {
    if (!now.has(key)) fixed.push(f);
  }
  for (const [key, f] of now) {
    const was = before.get(key);
    if (!was) {
      added.push(f);
      continue;
    }
    if (SEVERITY_WEIGHT[f.severity] > SEVERITY_WEIGHT[was.severity]) regressed.push({ ...f, was: was.severity });
    else persistent.push(f);
  }

  return {
    fixed,
    new: added,
    persistent,
    regressed,
    scoreBefore: previous.score ?? null,
    scoreAfter: current.score,
  };
}

// ---------------------------------------------------------------------- load

export function loadPayloads(files, { strict = true } = {}) {
  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  const payloads = [];
  const problems = [];

  for (const file of files) {
    let parsed;
    try {
      parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) {
      problems.push(`${file}: not valid JSON (${e.message})`);
      continue;
    }
    const errors = validatePayload(parsed, schema, path.basename(file));
    if (errors.length) {
      problems.push(...errors.map((e) => `${file}: ${e}`));
      if (strict) continue;
    }
    payloads.push(parsed);
  }

  return { payloads, problems, schema };
}

// ---------------------------------------------------------------------- main

function isMain() {
  return process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

if (isMain()) {
  const files = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  if (!files.length) {
    console.error('Usage: merge-findings.mjs <findings.json>...');
    process.exit(2);
  }
  const { payloads, problems } = loadPayloads(files);
  for (const p of problems) console.error('invalid: ' + p);
  if (!payloads.length) {
    console.error('No valid payloads.');
    process.exit(1);
  }
  const merged = mergeFindings(payloads);
  console.log(JSON.stringify(merged, null, 2));
  process.exit(problems.length ? 1 : 0);
}
