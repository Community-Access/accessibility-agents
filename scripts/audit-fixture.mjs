#!/usr/bin/env node
/**
 * audit-fixture.mjs - prepare the fixture for an honest audit.
 *
 * `example/` marks each planted defect with an ISSUE comment. Auditing it as
 * written measures whether a specialist can read a comment, not whether it can
 * find a defect, so the comments are stripped first.
 *
 * Stripping changes line numbers, which broke the first recall run: it compared
 * findings numbered against the stripped copy with an answer key numbered
 * against the original, and reported seven misses that had all been found,
 * including four contrast failures every specialist caught. So this emits a
 * line map beside the copy, and `audit-recall.mjs` uses it.
 *
 * The map is derived by aligning the two files rather than predicted from the
 * edits, because the stripping uses multi-line regular expressions whose effect
 * on line numbering is not obvious from reading them. Alignment is checkable:
 * every kept line must equal its original with the comment removed.
 *
 * Usage:
 *   node scripts/audit-fixture.mjs <output-dir>
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

const out = process.argv[2];
if (!out) {
  console.error('Usage: audit-fixture.mjs <output-dir>');
  process.exit(2);
}

const FILES = ['index.html', 'styles.css'];

/** Remove the answer key, and nothing else. */
function strip(text) {
  return text
    .replace(/<!--[\s\S]*?-->/g, (m) => (/ISSUE|INTENTIONAL|anti-pattern/i.test(m) ? '' : m))
    .replace(/\/\*[\s\S]*?\*\//g, (m) => (/ISSUE/i.test(m) ? '' : m))
    .replace(/\/\/\s*ISSUE:.*$/gm, '')
    .replace(/;\s*\/\* ISSUE[^*]*\*\//g, ';')
    .replace(/\n{3,}/g, '\n\n');
}

/** What a line looks like once its answer-key comment is gone. */
function normalise(line) {
  return line
    .replace(/<!--[\s\S]*?-->/g, (m) => (/ISSUE|INTENTIONAL|anti-pattern/i.test(m) ? '' : m))
    .replace(/\/\*[^*]*(\*(?!\/)[^*]*)*\*\//g, (m) => (/ISSUE/i.test(m) ? '' : m))
    .replace(/\/\/\s*ISSUE:.*$/i, '')
    .replace(/\s+$/, '');
}

/**
 * Walk both files together. A line that matches is mapped; a line that does
 * not was removed by the strip. Mismatched drift would show up as an
 * unmapped line that is not blank and carries no ISSUE, which is reported.
 */
/**
 * Original line numbers that sit inside a comment the strip removes. Computed
 * from the comment spans themselves, so a continuation line in the middle of a
 * multi-line banner is known to be part of it rather than guessed at from how
 * that one line happens to look.
 */
function removedLines(text) {
  const set = new Set();
  const lineOf = (index) => text.slice(0, index).split('\n').length;

  for (const re of [/<!--[\s\S]*?-->/g, /\/\*[\s\S]*?\*\//g]) {
    for (const m of text.matchAll(re)) {
      if (!/ISSUE|INTENTIONAL|anti-pattern/i.test(m[0])) continue;
      const start = lineOf(m.index);
      const end = lineOf(m.index + m[0].length);
      for (let n = start; n <= end; n += 1) set.add(n);
    }
  }

  for (const m of text.matchAll(/^.*\/\/\s*ISSUE:.*$/gm)) set.add(lineOf(m.index));
  return set;
}

function alignment(originalLines, strippedLines, file, removed) {
  const map = {};
  const suspicious = [];
  let s = 0;

  originalLines.forEach((line, i) => {
    const originalNo = i + 1;
    const want = normalise(line).replace(/\s+$/, '');

    // Removing a comment leaves a blank line behind, and the blank-run collapse
    // then merges some of them, so the two files drift by a line or two at each
    // edit. Look ahead a short way rather than requiring the next line to match;
    // without this the walk stalls at the first edit and reports every line
    // after it as dropped.
    if (want !== '') {
      for (let ahead = 0; ahead < 4 && s + ahead < strippedLines.length; ahead += 1) {
        if (strippedLines[s + ahead].replace(/\s+$/, '') === want) {
          map[originalNo] = s + ahead + 1;
          s += ahead + 1;
          return;
        }
      }
    }

    map[originalNo] = null;

    // A blank line, or any line inside a comment the strip removed, is
    // expected to go. `removed` is computed from the actual comment spans
    // rather than guessed from how a line looks, so a continuation line in the
    // middle of a banner is recognised as part of it.
    if (want === '') return;
    if (removed.has(originalNo)) return;

    suspicious.push(`${file}:${originalNo} ${line.trim().slice(0, 70)}`);
  });

  return { map, suspicious, consumed: s, total: strippedLines.length };
}

const siteDir = path.join(out, 'site');
fs.mkdirSync(siteDir, { recursive: true });
fs.mkdirSync(path.join(out, 'findings'), { recursive: true });

const maps = {};
let planted = 0;
let remaining = 0;
const problems = [];

for (const file of FILES) {
  const original = fs.readFileSync(path.join(ROOT, 'example', file), 'utf8').replace(/\r\n/g, '\n');
  const stripped = strip(original);

  planted += (original.match(/ISSUE:/g) || []).length;
  remaining += (stripped.match(/ISSUE/gi) || []).length;

  fs.writeFileSync(path.join(siteDir, file), stripped, 'utf8');

  const removed = removedLines(original);
  const { map, suspicious, consumed, total } = alignment(original.split('\n'), stripped.split('\n'), file, removed);
  maps[file] = map;
  problems.push(...suspicious);
  if (consumed < total - 2) {
    problems.push(`${file}: alignment consumed ${consumed} of ${total} stripped lines`);
  }
}

fs.writeFileSync(path.join(out, 'linemap.json'), JSON.stringify(maps, null, 2) + '\n', 'utf8');

console.log(`Fixture prepared in ${out}`);
console.log(`  planted defects in the key   ${planted}`);
console.log(`  answer-key traces remaining  ${remaining}`);
console.log(`  stripped copy                ${FILES.map((f) => `${f} ${fs.readFileSync(path.join(siteDir, f), 'utf8').split('\n').length} lines`).join(', ')}`);
console.log(`  line map                     linemap.json`);

if (remaining) {
  console.error('');
  console.error('The stripped copy still mentions ISSUE. The audit would be reading the answers.');
  process.exit(1);
}
if (problems.length) {
  console.error('');
  console.error('Lines dropped that were not answer key:');
  for (const p of problems.slice(0, 10)) console.error('  ' + p);
  process.exit(1);
}
process.exit(0);
