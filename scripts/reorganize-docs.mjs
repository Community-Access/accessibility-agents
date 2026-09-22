#!/usr/bin/env node
/**
 * reorganize-docs.mjs - put the documentation into one framework, once.
 *
 * Before this ran, `docs/` held 238 files with no index: 22 planning documents
 * from earlier releases at the top level, 58 pages documenting prompt files
 * that no longer exist, 81 per-agent pages, 18 knowledge-domain pages, and a
 * dozen guides, with 79 of them still describing directories that Phase 6
 * deleted. A reader could not tell what was current.
 *
 * The framework it moves everything into:
 *
 *   docs/README.md          the index; every section below is reachable from it
 *   docs/getting-started/   install, first audit, first fix
 *   docs/guides/            how to do one thing
 *   docs/reference/         skills, knowledge domains, findings schema, hooks, MCP tools
 *   docs/standards/         one page per standard this package conforms to
 *   docs/architecture/      how it fits together and why
 *   docs/history/           everything that describes a past state, kept for the record
 *
 * Nothing is deleted. A document about a past state moves to history with a
 * banner saying so; a document about the present is moved to where a reader
 * would look for it and its links are repointed.
 *
 * Usage:
 *   node scripts/reorganize-docs.mjs --dry-run
 *   node scripts/reorganize-docs.mjs --apply
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DOCS = path.join(ROOT, 'docs');
const apply = process.argv.includes('--apply');

/** Documents that describe a past state of the repository. */
const HISTORY = [
  '5.0-RELEASE-PLAN.md',
  'CLI-UTILITIES-SPECIFICATION.md',
  'CONFORMANCE-AUDIT-2026-09.md',
  'GH-SKILL-ADOPTION-PLAN.md',
  'GH-SKILL-MIGRATION.md',
  'GITHUB-SKILLS-MASTER-ROADMAP.md',
  'GITHUB-SKILLS-SPEC-COMPLIANCE-PLAN.md',
  'GITHUB-SKILLS-SPEC-QUICK-REFERENCE.md',
  'HOOKS-CROSS-PLATFORM-STRATEGY.md',
  'INSTALLATION-GUIDE-5.0.md',
  'INSTALLER-FUNCTIONALITY-AUDIT.md',
  'MIGRATION-COMPLETE-DOCUMENTATION.md',
  'MIGRATION-SAFETY-GUARANTEE.md',
  'PHASE-0-7-MASTER-CHECKLIST.md',
  'PHASE-2-COMPLETION-SUMMARY.md',
  'PHASE-2-DELETION-SAFETY-GATE.md',
  'PHASE-2-DESCRIPTION-REMEDIATION.md',
  'PHASE-3-VALIDATION-ENHANCEMENT.md',
  'PHASES-4-5-6-ROADMAP.md',
  'README-5.0-MIGRATION-COMPLETE.md',
  'SKILLS-COMPLIANCE-AUDIT.md',
  'deployment-layout.md',
  'subagent-architecture.md',
  'cross-platform-tool-mapping.md',
  'agent-reference.md',
  'repository-conventions.md',
  'context-baseline-2026-09.json',
  'context-after-phase-1.json',
  'context-after-phase-6.json',
  'guides/GITHUB-SKILLS-CLI-READINESS.md',
  'guides/SKILLS-RELEASE-READINESS-TEST-PLAN.md',
  'guides/ci-integrity-guards.md',
  'guides/codex-experimental-multi-agent.md',
  'guides/release-communications-checklist.md',
  'guides/vscode-builtin-skill-comparison.md',
  'guides/agent-debug-panel.md',
  'guides/debug-panel-workflows.md',
];

/** Whole directories that document things which no longer exist. */
const HISTORY_DIRS = ['prompts', 'beacon', 'templates'];

/** Present-tense documents, and where a reader would look for them. */
const MOVES = [
  ['getting-started.md', 'getting-started/README.md'],
  ['USER_GUIDE.md', 'getting-started/user-guide.md'],
  ['configuration.md', 'reference/configuration.md'],
  ['troubleshooting.md', 'guides/troubleshooting.md'],
  ['hooks-guide.md', 'reference/hooks.md'],
  ['architecture.md', 'architecture/README.md'],
  ['MODERNIZATION-CONFORMANCE.md', 'standards/conformance.md'],
  ['RESEARCH-SOURCES.md', 'standards/research-sources.md'],
  ['citation-policy.md', 'standards/citation-policy.md'],
  ['source-registry.json', 'standards/source-registry.json'],
  ['preferences.example.md', 'reference/preferences.example.md'],
  ['AGENTIC-BROWSER-TOOLS.md', 'reference/browser-tools.md'],
  ['BROWSER-TOOLS-TESTING.md', 'guides/browser-tools-testing.md'],
  ['guides/hooks-guide.md', 'guides/hooks.md'],
];

/** Directories renamed to say what they hold. */
const DIR_MOVES = [
  ['agents', 'reference/skills'],
  ['skills', 'reference/knowledge-domains'],
  ['scanning', 'guides/scanning'],
  ['tools', 'reference/tools'],
  ['advanced', 'guides/advanced'],
];

/** Files outside docs/ that belong to the record. */
const FROM_ROOT = [
  ['modern.md', 'history/2026-09-modernization.md'],
  ['build/drift-report.md', 'history/2026-09-legacy-drift-report.md'],
  ['ENHANCEMENTS.md', 'history/enhancements-through-6.0.md'],
  ['MARKETPLACE_SUBMISSION.md', 'history/marketplace-submission-6.0.md'],
  ['prd.md', 'history/product-requirements-5.0.md'],
];

const BANNER = (originalPath) =>
  [
    '> **Historical.** This document describes the repository as it was before',
    '> version 7.0, when agents lived in six per-client directories. It is kept',
    '> for the record and is not maintained. The current layout is one `skills/`',
    '> directory; start at [the documentation index](../README.md).',
    `> Original path: \`${originalPath}\`.`,
    '',
  ].join('\n');

// ---------------------------------------------------------------- helpers

const planned = []; // { from, to, banner }

function plan(fromRel, toRel, banner = false, base = DOCS) {
  const from = path.join(base, fromRel);
  if (!fs.existsSync(from)) return;
  planned.push({ from, to: path.join(DOCS, toRel), banner, fromRel: path.relative(ROOT, from).split(path.sep).join('/') });
}

function planDir(fromRel, toRel, banner) {
  const dir = path.join(DOCS, fromRel);
  if (!fs.existsSync(dir)) return;
  const walk = (d, rel) => {
    for (const e of fs.readdirSync(d)) {
      const full = path.join(d, e);
      const r = rel ? rel + '/' + e : e;
      if (fs.statSync(full).isDirectory()) walk(full, r);
      else plan(fromRel + '/' + r, toRel + '/' + r, banner);
    }
  };
  walk(dir, '');
}

for (const f of HISTORY) plan(f, 'history/' + path.basename(f), true);
for (const d of HISTORY_DIRS) planDir(d, 'history/' + d, true);
for (const [from, to] of MOVES) plan(from, to, false);
for (const [from, to] of DIR_MOVES) planDir(from, to, false);
for (const [from, to] of FROM_ROOT) plan(from, to, from !== 'modern.md' && from !== 'build/drift-report.md', ROOT);

/** Old repo-relative path -> new repo-relative path, for link rewriting. */
const remap = new Map();
for (const p of planned) {
  remap.set(p.fromRel, path.relative(ROOT, p.to).split(path.sep).join('/'));
}

/**
 * Rewrite a relative link in a moved (or unmoved) document so it still points
 * at the file it pointed at before. Links into a moved directory are resolved
 * per file, so a link to docs/agents/x.md becomes docs/reference/skills/x.md.
 */
function rewriteLinks(text, fileNewAbs, fileOldAbs) {
  return text.replace(/(\]\()(?!https?:|#|mailto:)([^)\s#]+)(#[^)]*)?\)/g, (whole, open, target, hash = '') => {
    const oldAbs = path.resolve(path.dirname(fileOldAbs), target);
    const oldRel = path.relative(ROOT, oldAbs).split(path.sep).join('/');
    const newRel = remap.get(oldRel);
    const destAbs = newRel ? path.join(ROOT, newRel) : oldAbs;
    if (!fs.existsSync(destAbs) && !newRel) return whole;
    let rel = path.relative(path.dirname(fileNewAbs), destAbs).split(path.sep).join('/');
    if (!rel.startsWith('.')) rel = './' + rel;
    return `${open}${rel}${hash})`;
  });
}

// ------------------------------------------------------------------- apply

console.log(`reorganize-docs (${apply ? 'applied' : 'dry run'})`);
console.log('');
const byKind = { history: 0, moved: 0 };
for (const p of planned) (p.banner ? byKind.history++ : byKind.moved++);
console.log(`  to history      ${byKind.history} files`);
console.log(`  moved in place  ${byKind.moved} files`);

if (!apply) {
  console.log('');
  for (const p of planned.slice(0, 20)) console.log(`  ${p.fromRel} -> ${path.relative(ROOT, p.to).split(path.sep).join('/')}`);
  if (planned.length > 20) console.log(`  ... and ${planned.length - 20} more`);
  console.log('');
  console.log('Nothing changed. Re-run with --apply.');
  process.exit(0);
}

// Read every planned file before moving anything, so link rewriting sees the
// original locations.
const contents = new Map();
for (const p of planned) contents.set(p.from, fs.readFileSync(p.from));

for (const p of planned) {
  fs.mkdirSync(path.dirname(p.to), { recursive: true });
  let data = contents.get(p.from);
  if (p.to.endsWith('.md')) {
    let text = data.toString('utf8');
    text = rewriteLinks(text, p.to, p.from);
    if (p.banner) {
      // Place the banner after the first heading so the title stays the title.
      const m = text.match(/^(#\s.*\r?\n)/);
      text = m ? text.replace(m[1], m[1] + '\n' + BANNER(p.fromRel)) : BANNER(p.fromRel) + text;
    }
    data = Buffer.from(text, 'utf8');
  }
  fs.writeFileSync(p.to, data);
  fs.rmSync(p.from);
}

// Remove directories emptied by the moves.
for (const d of [...HISTORY_DIRS, ...DIR_MOVES.map(([from]) => from), 'guides']) {
  const abs = path.join(DOCS, d);
  try {
    if (fs.existsSync(abs) && fs.readdirSync(abs).length === 0) fs.rmdirSync(abs);
  } catch {
    /* not empty, keep */
  }
}
try {
  if (fs.existsSync(path.join(ROOT, 'build')) && fs.readdirSync(path.join(ROOT, 'build')).length === 0) fs.rmdirSync(path.join(ROOT, 'build'));
} catch {
  /* keep */
}

// Repoint links in documents that did not move but pointed at ones that did.
let repointed = 0;
const walkAll = (d) => {
  for (const e of fs.readdirSync(d)) {
    const full = path.join(d, e);
    if (fs.statSync(full).isDirectory()) walkAll(full);
    else if (full.endsWith('.md')) {
      const before = fs.readFileSync(full, 'utf8');
      const after = rewriteLinks(before, full, full);
      if (after !== before) {
        fs.writeFileSync(full, after, 'utf8');
        repointed += 1;
      }
    }
  }
};
walkAll(DOCS);
for (const f of ['README.md', 'CONTRIBUTING.md', 'AGENTS.md', 'CHANGELOG.md', 'ROADMAP.md']) {
  const full = path.join(ROOT, f);
  if (!fs.existsSync(full)) continue;
  const before = fs.readFileSync(full, 'utf8');
  const after = rewriteLinks(before, full, full);
  if (after !== before) {
    fs.writeFileSync(full, after, 'utf8');
    repointed += 1;
  }
}

console.log(`  links repointed ${repointed} files`);
console.log('');
console.log('Done. Write docs/README.md next; it is the index every section hangs from.');
process.exit(0);
