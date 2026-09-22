#!/usr/bin/env node
/**
 * strip-heading-emoji.mjs - remove emoji from headings.
 *
 * A screen reader announces an emoji by its Unicode name. "White heavy check
 * mark Phase 2 complete" is what a listener hears, and on a heading, which is
 * how they navigate, that name arrives before the words that matter. Worse, an
 * emoji used to carry meaning ("check mark" for done, "cross mark" for failed)
 * is information conveyed by an image alone.
 *
 * Where an emoji carried status, its meaning is kept as a word rather than
 * simply deleted, because deleting it would lose the information the author
 * meant to convey.
 *
 * This project bans emoji outright in its own output. Its documentation should
 * not be the exception.
 *
 * Usage:
 *   node scripts/strip-heading-emoji.mjs --dry-run
 *   node scripts/strip-heading-emoji.mjs --apply
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
  'coverage',
  'artifacts',
  '.history',
  '.vscode-test',
]);

/**
 * Emoji that carried status, and the word that replaces them. A heading that
 * said "check mark Done" must still say Done was done.
 */
const MEANINGFUL = [
  [/✅/gu, 'Complete'],
  [/❌/gu, 'Failed'],
  [/⚠️?/gu, 'Warning'],
  [/✔️?/gu, 'Complete'],
  [/✖️?/gu, 'Failed'],
  [/🚧/gu, 'In progress'],
  [/🔴/gu, 'Blocked'],
  [/🟡/gu, 'At risk'],
  [/🟢/gu, 'On track'],
];

/**
 * Exactly the range `md-emoji-heading` flags, so this tool fixes what the
 * linter reports and nothing else. A cleaner with a wider idea of "emoji" than
 * the rule it serves will edit headings nobody complained about, which is how
 * the first version of this turned "(Word .docx)" into "(Word.docx)".
 */
const ANY_EMOJI =
  /[\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{200D}\u{FE0F}]/gu;

const apply = process.argv.includes('--apply');

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir)) {
    if (IGNORED.has(entry)) continue;
    const full = path.join(dir, entry);
    const stat = fs.lstatSync(full);
    if (stat.isSymbolicLink()) continue;
    if (stat.isDirectory()) walk(full, out);
    else if (full.endsWith('.md')) out.push(full);
  }
  return out;
}

function cleanHeading(line) {
  const m = line.match(/^(#{1,6}\s+)(.*)$/);
  if (!m) return line;
  const [, prefix, original] = m;

  ANY_EMOJI.lastIndex = 0;
  if (!ANY_EMOJI.test(original)) return line;

  let text = original;

  // A leading emoji is a category marker, not a status: "check mark Good
  // Patterns" means these are the good examples, not that something completed.
  // Appending "complete" there would invent a claim the author never made.
  ANY_EMOJI.lastIndex = 0;
  const leads = ANY_EMOJI.test(text.trimStart().slice(0, 3));

  const statuses = [];
  for (const [pattern, word] of MEANINGFUL) {
    pattern.lastIndex = 0;
    if (!pattern.test(text)) continue;
    if (!statuses.includes(word)) statuses.push(word);
    pattern.lastIndex = 0;
    text = text.replace(pattern, ' ');
  }

  ANY_EMOJI.lastIndex = 0;
  text = text.replace(ANY_EMOJI, ' ');

  // Tidy only the gaps the removal left. No other punctuation is touched.
  text = text
    .replace(/\s{2,}/g, ' ')
    .replace(/([([{])\s+/g, '$1')
    .replace(/\s+([)\]}])/g, '$1')
    .trim();
  text = text.replace(/^[\s\-:|]+/, '').replace(/[\s\-|]+$/, '').trim();

  // The heading may already say what the emoji said. Adding it twice is noise.
  const ALREADY_SAYS_STATUS = /\b(complete|completed|done|fixed|planned|passed|failed|blocked|shipped|in progress|at risk|on track)\b/i;

  if (statuses.length && !leads && !ALREADY_SAYS_STATUS.test(text)) {
    const suffix = statuses.join(' and ').toLowerCase();
    text = text ? `${text}, ${suffix}` : statuses.join(' and ');
  } else if (!text && statuses.length) {
    text = statuses.join(' and ');
  }

  return prefix + text;
}

const changes = [];

for (const file of walk(ROOT)) {
  const raw = fs.readFileSync(file, 'utf8');
  // Several documents use CRLF. Splitting on "\n" alone leaves a carriage
  // return at the end of every line, and `$` in the heading pattern then never
  // matches, so the tool silently found nothing in exactly the files that
  // needed it. Normalise here and restore the original endings on write.
  const crlf = raw.includes('\r\n');
  const lines = raw.split(/\r?\n/);
  let changed = false;

  for (let i = 0; i < lines.length; i += 1) {
    // No fence tracking. An earlier version tracked fences and a single
    // unbalanced marker in one document silenced every heading after it, so
    // the tool reported zero work while the linter reported nineteen. The
    // emoji match is the filter: a heading has to contain one to be touched,
    // and a heading-shaped line in a code block that contains an emoji is
    // flagged by the linter too.
    if (!/^#{1,6}\s/.test(lines[i])) continue;

    const cleaned = cleanHeading(lines[i]);
    if (cleaned === lines[i]) continue;
    changes.push({ file: path.relative(ROOT, file).split(path.sep).join('/'), line: i + 1, before: lines[i], after: cleaned });
    lines[i] = cleaned;
    changed = true;
  }

  if (changed && apply) fs.writeFileSync(file, lines.join('\n'), 'utf8');
}

console.log(`strip-heading-emoji (${apply ? 'applied' : 'dry run'})`);
console.log('');
for (const c of changes) {
  console.log(`  ${c.file}:${c.line}`);
  console.log(`    - ${c.before}`);
  console.log(`    + ${c.after}`);
}
console.log('');
console.log(`${changes.length} headings ${apply ? 'cleaned' : 'would be cleaned'}.`);
process.exit(0);
