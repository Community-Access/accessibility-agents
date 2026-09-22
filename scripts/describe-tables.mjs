#!/usr/bin/env node
/**
 * describe-tables.mjs - give every table a sentence introducing it.
 *
 * A screen reader user entering table navigation gets the cells, not the point.
 * A sentence before the table says what the rows are and what the columns hold,
 * so they know whether to read it at all. That is WCAG 1.3.1 in practice, and
 * it is what `md-table-desc` is asking for.
 *
 * ## Why this is generated rather than hand-written
 *
 * There are 706 of them. Hand-writing 706 sentences invites 706 variations of
 * "The following table shows...", which is filler that costs a listener time
 * and tells them nothing. A sentence derived from the table's own headers says
 * something true and specific every time: what one row is, and what is recorded
 * about it.
 *
 * The description is built from the table, not from a template bank:
 *
 *   | Level | Meaning |          ->  Each level, with its meaning.
 *   | Tool | Purpose | Notes |   ->  Each tool, with its purpose and notes.
 *   | Skill | Use it for |       ->  Each skill, with what to use it for.
 *
 * Where the first column is not a noun that names a row, the nearest heading
 * supplies the subject instead.
 *
 * Usage:
 *   node scripts/describe-tables.mjs --dry-run          show what it would write
 *   node scripts/describe-tables.mjs --sample 25        show 25 examples
 *   node scripts/describe-tables.mjs --apply
 *   node scripts/describe-tables.mjs --apply --path docs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

const IGNORED = new Set([
  'node_modules',
  'vendor',
  '.git',
  'dist',
  'build',
  'out',
  '.next',
  '.nuxt',
  'coverage',
  'artifacts',
  '.history',
  '.vscode-test',
]);

const argv = process.argv.slice(2);
const apply = argv.includes('--apply');
const sampleIdx = argv.indexOf('--sample');
const sampleSize = sampleIdx === -1 ? 0 : Number(argv[sampleIdx + 1] || 20);
const pathIdx = argv.indexOf('--path');
const scanRoot = pathIdx === -1 ? ROOT : path.resolve(ROOT, argv[pathIdx + 1]);
const rewrite = argv.includes("--rewrite") || argv.includes("--rewrite-only");
const rewriteOnly = argv.includes("--rewrite-only");

/**
 * Sentences this tool writes. Recognising its own output is what lets a later
 * run improve the wording in place instead of stacking a second sentence on
 * top of the first, and it is deliberately narrow so a hand-written
 * introduction is never mistaken for a generated one.
 */
const GENERATED = /^(Each .+\.|One .+ per row\.|The table below records .+\.)$/;

// ------------------------------------------------------------------ language

/**
 * Turn a column header into the noun for one row.
 *
 * Deliberately conservative: it only strips a plural where doing so is safe,
 * because "Each statuse" is worse than "Each statuses".
 */
function singular(word) {
  const w = word.trim();
  if (/\b(ies)$/i.test(w)) return w.replace(/ies$/i, 'y');
  if (/(s|x|z|ch|sh)es$/i.test(w)) return w.replace(/es$/i, '');
  if (/[^s]s$/i.test(w) && !/(ss|us|is)$/i.test(w)) return w.replace(/s$/i, '');
  return w;
}

function lower(text) {
  // Keep acronyms and proper-looking names as written; lowercase ordinary words.
  return text
    .split(/\s+/)
    .map((w) => (/^[A-Z]{2,}$/.test(w) || /^[A-Z][a-z]*[A-Z]/.test(w) ? w : w.toLowerCase()))
    .join(' ');
}

function joinList(items) {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/** Strip markdown emphasis, code ticks and links from a header cell. */
function cleanCell(cell) {
  return cell
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_]{1,3}([^*_]*)[*_]{1,3}/g, '$1')
    .replace(/<[^>]+>/g, '')
    .trim();
}

/**
 * Some headers are clauses rather than nouns: "What it does", "Use it for",
 * "Where in UI". They name what is recorded, not what a row is, so they cannot
 * become the subject and they must not take a possessive.
 */
function isClause(header) {
  const h = header.trim();
  if (!/\s/.test(h)) return false;
  if (/^(use|used|what|when|why|how|where|who|which|if|does|do|can|should)\b/i.test(h)) return true;
  // A header that starts with a verb and a preposition, such as "Connect to".
  if (/^[a-z]+\s+(to|for|in|on|with|from|by|at)$/i.test(h)) return true;
  return false;
}

/** Headers that number rows rather than name them. */
function isOrdinal(header) {
  return /^(#|no\.?|num(ber)?|index|id|rank|order)$/i.test(header.trim());
}

/**
 * A heading can only stand in for the subject when it reads as a noun. Section
 * titles like "Group 2: Web accessibility (9 skills)" do not, and produce
 * sentences nobody would say out loud.
 */
function headingIsUsable(heading) {
  if (!heading) return false;
  const h = heading.trim();
  if (h.length > 30) return false;
  if (/[:()\d]/.test(h)) return false;
  return true;
}

/** Column names carry punctuation that does not belong mid-sentence. */
function tidyAttribute(header) {
  return header
    .replace(/\s*\?\s*$/, '')
    .replace(/\s*\/\s*/g, ' or ')
    .replace(/\s*<\s*/g, ' under ')
    .replace(/\s*>\s*/g, ' over ')
    .trim();
}

/**
 * Attributes that are verbs rather than nouns. "with its governs" is not
 * English; these become "with what it <verb>" instead.
 */
const VERB_ATTRIBUTE = /^(governs|covers|shows|means|does|holds|records|applies|returns|checks|proves|replaces)$/i;

function describe(headers, heading) {
  const cells = headers.map(cleanCell).filter((c) => c.length > 0);
  const subjectFromHeading = headingIsUsable(heading) ? lower(singular(heading)) : null;

  if (!cells.length) {
    return subjectFromHeading
      ? `The table below records ${subjectFromHeading}.`
      : 'The table below records the values described above.';
  }

  const [first, ...rest] = cells;

  // A first column that is a clause, an ordinal, or a whole sentence cannot
  // name a row. The heading is the next best subject, and "row" is the honest
  // fallback when the heading cannot stand in either.
  const firstNamesTheRow = !isClause(first) && !isOrdinal(first) && first.length <= 40;
  const subject = firstNamesTheRow ? lower(singular(first)) : subjectFromHeading || 'row';

  // When the heading supplied the subject, the first column is data like any
  // other and belongs in the attribute list.
  const attributes = (firstNamesTheRow ? rest : cells).map((c) => lower(tidyAttribute(c))).filter(Boolean);

  if (!attributes.length) {
    return `One ${subject} per row.`;
  }

  // A verb attribute cannot take a possessive: "with its governs" is not
  // English. Rephrase it as the question the column answers.
  const phrased = attributes.map((a) => (VERB_ATTRIBUTE.test(a) ? `what it ${a}` : a));
  const anyClause = phrased.some((a) => isClause(a) || a.startsWith('what it '));

  // "with its name and severity" reads better than "with name and severity",
  // but a clause already carries its own subject: "with what it does".
  const possessive = anyClause ? '' : 'its ';

  return `Each ${subject}, with ${possessive}${joinList(phrased)}.`;
}

// -------------------------------------------------------------------- parsing

function walk(dir, out = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (IGNORED.has(entry)) continue;
    const full = path.join(dir, entry);
    let stat;
    try {
      stat = fs.lstatSync(full);
    } catch {
      continue;
    }
    if (stat.isSymbolicLink()) continue;
    if (stat.isDirectory()) walk(full, out);
    else if (full.endsWith('.md')) out.push(full);
  }
  return out;
}

/**
 * Find every table that no sentence introduces, and work out what to say.
 *
 * Fence-aware, and it looks back past blank lines the same way the linter does,
 * so the two agree about what counts as described.
 */
function findTables(text) {
  const lines = text.split('\n');
  const found = [];
  let fence = null;
  let heading = null;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    const fenceMatch = line.match(/^\s{0,3}(```+|~~~+)/);
    if (fenceMatch) {
      const marker = fenceMatch[1][0].repeat(3);
      if (!fence) fence = marker;
      else if (marker === fence) fence = null;
      continue;
    }
    if (fence) continue;

    const h = line.match(/^#{1,6}\s+(.*\S)\s*$/);
    if (h) {
      heading = cleanCell(h[1]);
      continue;
    }

    if (!/^\s*\|/.test(line)) continue;
    // The delimiter row is what makes this a table rather than a stray pipe.
    if (!/^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(lines[i + 1] || '')) continue;
    // Already inside a table body.
    if (/^\s*\|/.test(lines[i - 1] || '')) continue;

    let j = i - 1;
    while (j >= 0 && lines[j].trim() === '') j -= 1;
    const introducer = j >= 0 ? lines[j].trim() : '';
    const described = introducer !== '' && !/^#{1,6}\s/.test(introducer);

    const headers = line.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|');
    const sentence = describe(headers, heading);

    // In rewrite mode, a sentence this tool wrote earlier is replaced rather
    // than left alone, so improvements to the wording reach existing files
    // instead of only new ones. A hand-written introduction is never touched.
    if (described) {
      if (!rewrite || !GENERATED.test(introducer)) continue;
      if (introducer === sentence) continue;
      found.push({ line: i, replaceAt: j, insertAfter: null, headers, heading, sentence, previous: introducer });
      continue;
    }
    if (rewriteOnly) continue;

    found.push({
      line: i,
      insertAfter: j, // the heading, or -1 at the top of a file
      replaceAt: null,
      headers,
      heading,
      sentence,
    });
  }

  return found;
}

function insertDescriptions(text, tables) {
  const lines = text.split('\n');
  // Work from the bottom so earlier line indices stay valid.
  for (const t of [...tables].reverse()) {
    if (typeof t.replaceAt === 'number') {
      lines[t.replaceAt] = t.sentence;
      continue;
    }
    if (typeof t.insertAfter !== 'number') {
      // Neither an insertion point nor a replacement target. Skipping is the
      // only safe response: an earlier version of this function treated a
      // missing index as zero and wrote the sentence to the top of the file.
      continue;
    }
    lines.splice(t.insertAfter + 1, 0, '', t.sentence);
  }
  return lines.join('\n');
}

// ----------------------------------------------------------------------- main

const files = walk(scanRoot);
const changes = [];
let tableCount = 0;

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const tables = findTables(text);
  if (!tables.length) continue;
  tableCount += tables.length;
  changes.push({ file, tables, text });
}

if (sampleSize) {
  const all = changes.flatMap((c) => c.tables.map((t) => ({ file: c.file, ...t })));
  const step = Math.max(1, Math.floor(all.length / sampleSize));
  console.log(`Sample of ${Math.min(sampleSize, all.length)} from ${all.length} tables:`);
  console.log('');
  for (let i = 0; i < all.length && i / step < sampleSize; i += step) {
    const t = all[i];
    console.log(`  ${path.relative(ROOT, t.file).split(path.sep).join('/')}:${t.line + 1}`);
    console.log(`    heading   ${t.heading || '(none)'}`);
    console.log(`    columns   ${t.headers.map(cleanCell).filter(Boolean).join(' | ')}`);
    console.log(`    sentence  ${t.sentence}`);
    console.log('');
  }
  process.exit(0);
}

if (apply) {
  for (const c of changes) {
    fs.writeFileSync(c.file, insertDescriptions(c.text, c.tables), 'utf8');
  }
}

console.log(`describe-tables (${apply ? 'applied' : 'dry run'})`);
console.log('');
console.log(`  files scanned     ${files.length}`);
console.log(`  files changed     ${changes.length}`);
console.log(`  tables described  ${tableCount}`);
console.log('');
console.log(apply ? 'Re-run the markdown gate to confirm.' : 'Use --sample 25 to review wording, --apply to write.');
process.exit(0);
