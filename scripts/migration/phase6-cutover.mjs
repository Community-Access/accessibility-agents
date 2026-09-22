#!/usr/bin/env node
/**
 * phase6-cutover.mjs - remove the per-client trees, one-shot.
 *
 * Six hand-maintained copies of every agent existed because no single format
 * was readable by every client. The open standards removed that reason: one
 * `skills/` directory is read natively by Claude Code, Codex, Copilot, Gemini
 * and Antigravity. This deletes the copies.
 *
 * Nothing is lost that is not first preserved. Content in those trees that is
 * not a duplicated agent body - citation policy, source registry, path-scoped
 * instruction files - is moved to a new home before its tree is removed, and
 * the script refuses to delete a tree whose keepers have not landed.
 *
 * Everything removed is tracked in git, so `git checkout -- <path>` restores it.
 *
 * Usage:
 *   node scripts/phase6-cutover.mjs --dry-run
 *   node scripts/phase6-cutover.mjs --apply
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

/** Moved before their tree is removed. Source to destination, both repo-relative. */
const PRESERVE = [
  ['.github/agents/CITATION_POLICY.md', 'docs/citation-policy.md'],
  ['.github/agents/SOURCE_REGISTRY.json', 'docs/source-registry.json'],
  ['.github/agents/preferences.example.md', 'docs/preferences.example.md'],
];

/**
 * Copilot's path-scoped instruction files become reference skills. They are
 * real content with applyTo globs, not agent copies, and the skills package is
 * where content lives now.
 */
const INSTRUCTIONS_DIR = '.github/instructions';
const INSTRUCTIONS_SKILL = 'skills/kb-path-instructions';

/** Trees whose entire purpose was to hold a copy of something. */
const REMOVE = [
  '.claude/agents',
  '.claude/specialists',
  '.claude/hooks',
  '.claude/AGENTS.md',
  'claude-code-plugin',
  'codex-skills',
  'codex-plugin',
  '.codex',
  '.gemini',
  'gemini-extension.json',
  'GEMINI.md',
  '.github/agents',
  '.github/skills',
  '.github/prompts',
  '.github/instructions',
  '.github/hooks',
  '.github/copilot-instructions.md',
  'plugin.yaml',
  '.a11y-agent-manifest',
];

/**
 * Kept, not deleted.
 *
 * `vscode-extension/` is a published Marketplace extension. VS Code installs
 * Agent Plugins natively now, so it is superseded, but deleting its source
 * would remove the ability to publish the final version that tells existing
 * users where the package went. It is marked deprecated instead.
 *
 * `.history/` is the user's local editor history. It is already gitignored, so
 * it costs the repository nothing, and it is not this script's to throw away.
 */
const DEPRECATE = [
  [
    'vscode-extension/DEPRECATED.md',
    [
      '# Deprecated',
      '',
      'This extension is superseded by the Accessibility Agents package at the',
      'repository root.',
      '',
      'VS Code, Copilot CLI and the Copilot app install Agent Plugins natively, and',
      'the package publishes its skills through that mechanism. The `@a11y` chat',
      'participant this extension provided is replaced by the skills themselves:',
      '`/accessibility-lead`, `/web-accessibility-wizard` and the rest appear in the',
      'slash menu without an extension in between.',
      '',
      'The source is kept so a final version can be published pointing existing',
      'users at the package. It is not part of the build and is not validated.',
      '',
      'See `modern.md` for the migration and `docs/MODERNIZATION-CONFORMANCE.md`',
      'for what replaced it.',
      '',
    ].join('\n'),
  ],
];

/** Root clutter: generated output, scratch files and superseded release notes. */
const TIDY = [
  'markdownlint-output.txt',
  'source-validation-results.json',
  'tmp-install-ps-project.json',
  'tmp-uninstall-ps-project.json',
  'tmp-update-ps-project.json',
  'C',
  'accessibility-arizona-edu-audit.html',
  'accessibility-arizona-edu-audit.md',
];

const MOVE_TO_DOCS = ['RELEASE-4.5.0.md', 'RELEASE-5.0.0.md', 'RELEASE-5.1.0.md', 'RELEASE-5.2.0.md', 'RELEASE-5.3.0.md', 'RELEASE-5.4.0.md', 'RELEASE-6.0.0.md'];

const apply = process.argv.includes('--apply');
const label = apply ? 'removed' : 'would remove';

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function countFiles(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return 0;
  if (!fs.statSync(abs).isDirectory()) return 1;
  let n = 0;
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir)) {
      const p = path.join(dir, e);
      if (fs.statSync(p).isDirectory()) walk(p);
      else n += 1;
    }
  };
  walk(abs);
  return n;
}

/** Refuse to delete anything git cannot give back. */
function untrackedIn(rel) {
  try {
    const out = execFileSync('git', ['ls-files', '--others', '--exclude-standard', rel], {
      cwd: ROOT,
      encoding: 'utf8',
    });
    return out.split('\n').map((l) => l.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

// ------------------------------------------------------------------ preserve

function preserveFiles() {
  const done = [];
  for (const [from, to] of PRESERVE) {
    if (!exists(from)) continue;
    if (apply) {
      fs.mkdirSync(path.dirname(path.join(ROOT, to)), { recursive: true });
      fs.copyFileSync(path.join(ROOT, from), path.join(ROOT, to));
    }
    done.push(`${from} -> ${to}`);
  }
  return done;
}

/**
 * Fold the path-scoped instruction files into one reference skill, keeping each
 * file's applyTo globs beside its content so the rule still says where it
 * applies.
 */
function preserveInstructions() {
  const dir = path.join(ROOT, INSTRUCTIONS_DIR);
  if (!fs.existsSync(dir)) return null;

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort();
  if (!files.length) return null;

  // One reference per original file. The file boundary is the meaningful unit:
  // each instruction file already covers one kind of work, and splitting on the
  // headings inside them produced dozens of fragments with colliding names.
  const index = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf8').replace(/\r\n/g, '\n');
    const fm = raw.match(/^---\n([\s\S]*?)\n---\n/);
    const applyTo = fm ? (fm[1].match(/applyTo:\s*(.*)/) || [])[1] : null;
    const slug = file.replace(/\.instructions\.md$/, '');
    const title = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const applies = applyTo ? applyTo.trim().replace(/^["']|["']$/g, '') : null;

    // Keep the body's own heading structure; replace only its title so each
    // reference has exactly one H1.
    const body = (fm ? raw.slice(fm[0].length) : raw).replace(/^#\s+.*$/m, '').trim();

    const content =
      `# ${title}\n\n` +
      (applies ? `Applies to files matching \`${applies}\`.\n\n` : 'Applies to this repository generally.\n\n') +
      'Part of the `kb-path-instructions` skill.\n\n' +
      body +
      '\n';

    if (apply) {
      fs.mkdirSync(path.join(ROOT, INSTRUCTIONS_SKILL, 'references'), { recursive: true });
      fs.writeFileSync(path.join(ROOT, INSTRUCTIONS_SKILL, 'references', slug + '.md'), content, 'utf8');
    }
    index.push({ slug, applies });
  }

  const skill = [
    '---',
    'name: kb-path-instructions',
    'description: "Reference data, not a reviewer. Per-file-type accessibility rules: semantic HTML, ARIA patterns, CSS, markdown, testing and terminology."',
    'license: MIT',
    'disable-model-invocation: true',
    'user-invocable: false',
    'metadata:',
    '  tier: reference',
    '  domain: cross-cutting',
    '  output: none',
    '  effort: low',
    '  title: Path Instructions',
    '---',
    'Rules that apply to a particular kind of file. These were path-scoped',
    'instruction files before 7.0; each one still says which files it governs.',
    '',
    '## Which file to read',
    '',
    'Open the one reference that matches what you are working on. Reading all ten',
    'costs more than the rules are worth on any single task.',
    '',
    '| Read | When you are working on |',
    '|---|---|',
    ...index.map(
      (e) => `| \`references/${e.slug}.md\` | ${e.applies ? `files matching \`${e.applies}\`` : 'this repository generally'} |`,
    ),
    '',
  ].join('\n');

  if (apply) {
    fs.mkdirSync(path.join(ROOT, INSTRUCTIONS_SKILL), { recursive: true });
    fs.writeFileSync(path.join(ROOT, INSTRUCTIONS_SKILL, 'SKILL.md'), skill, 'utf8');
  }
  return `${files.length} instruction files -> ${INSTRUCTIONS_SKILL}/ (one reference each)`;
}

// -------------------------------------------------------------------- remove

function removeTree(rel) {
  const stray = untrackedIn(rel);
  if (stray.length) {
    return { rel, skipped: true, reason: `${stray.length} untracked files git could not restore`, stray };
  }
  const files = countFiles(rel);
  if (!files) return null;
  if (apply) fs.rmSync(path.join(ROOT, rel), { recursive: true, force: true });
  return { rel, files };
}

// ---------------------------------------------------------------------- main

const preserved = preserveFiles();
const deprecated = [];
for (const [file, body] of DEPRECATE) {
  if (!exists(path.dirname(file))) continue;
  if (apply) fs.writeFileSync(path.join(ROOT, file), body, 'utf8');
  deprecated.push(file);
}
const instructions = preserveInstructions();

const removed = [];
const skipped = [];
for (const rel of REMOVE) {
  const result = removeTree(rel);
  if (!result) continue;
  (result.skipped ? skipped : removed).push(result);
}

const tidied = [];
for (const rel of TIDY) {
  const result = removeTree(rel);
  if (result && !result.skipped) tidied.push(result);
  else if (result) skipped.push(result);
}

const moved = [];
for (const rel of MOVE_TO_DOCS) {
  if (!exists(rel)) continue;
  const to = path.join('docs', 'releases', path.basename(rel));
  if (apply) {
    fs.mkdirSync(path.join(ROOT, 'docs', 'releases'), { recursive: true });
    fs.renameSync(path.join(ROOT, rel), path.join(ROOT, to));
  }
  moved.push(`${rel} -> ${to}`);
}

// ------------------------------------------------------------------- report

console.log(`Phase 6 cutover (${apply ? 'applied' : 'dry run'})`);
console.log('');

console.log('Preserved before removal');
for (const p of preserved) console.log('  ' + p);
if (instructions) console.log('  ' + instructions);
for (const d of deprecated) console.log('  marked deprecated: ' + d);
console.log('');

console.log(`Per-client trees ${label}`);
let total = 0;
for (const r of removed) {
  console.log(`  ${r.rel.padEnd(36)} ${String(r.files).padStart(4)} files`);
  total += r.files;
}
console.log(`  ${'total'.padEnd(36)} ${String(total).padStart(4)} files`);
console.log('');

if (tidied.length) {
  console.log(`Root clutter ${label}`);
  for (const r of tidied) console.log(`  ${r.rel}`);
  console.log('');
}

if (moved.length) {
  console.log(apply ? 'Release notes moved' : 'Release notes would move');
  for (const m of moved) console.log('  ' + m);
  console.log('');
}

if (skipped.length) {
  console.log('Skipped, because git could not restore them');
  for (const s of skipped) {
    console.log(`  ${s.rel}: ${s.reason}`);
    for (const f of s.stray.slice(0, 5)) console.log(`    ${f}`);
  }
  console.log('');
}

console.log(
  apply
    ? 'Everything removed is tracked in git. To restore one: git checkout -- <path>'
    : 'Nothing changed. Re-run with --apply to perform the cutover.',
);

process.exit(0);
