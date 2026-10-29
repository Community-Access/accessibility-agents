#!/usr/bin/env node
/**
 * sync-wiki.mjs - make the GitHub wiki a mirror of docs/.
 *
 * Every Markdown file under docs/ becomes one wiki page, and the wiki's Home
 * and sidebar come from .github/wiki/. A page with no source is removed, so a
 * document deleted or renamed in the repository does not live on in the wiki,
 * and a page is rewritten whenever its source changes.
 *
 * Page names: a few pages keep the names they have always had (PAGE_NAMES),
 * so links to them keep working. Every other page is named from its file
 * name, capitalised at each hyphen: docs/guides/troubleshooting.md becomes
 * Troubleshooting.md. Two sources that would get the same name are a build
 * error, not a silent overwrite; add one of them to PAGE_NAMES.
 *
 * Headings: the wiki shows the page name as the page's H1, so every heading
 * in the wiki copy is demoted one level (scripts/wiki-headings.mjs, issue
 * #274). The repository copy keeps its own H1.
 *
 * Usage:
 *   node scripts/sync-wiki.mjs <wiki-checkout>            sync, then list changes
 *   node scripts/sync-wiki.mjs <wiki-checkout> --dry-run  list changes only
 *   node scripts/sync-wiki.mjs --check                    check names only
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { demoteHeadings } from './wiki-headings.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Pages whose names predate this script, and the names that break a tie. */
const PAGE_NAMES = {
  'docs/README.md': 'Documentation.md',
  'docs/getting-started/README.md': 'Getting-Started.md',
  'docs/architecture/README.md': 'Architecture.md',
  'docs/standards/README.md': 'Standards.md',
  'docs/reference/configuration.md': 'Configuration.md',
  'docs/reference/hooks.md': 'Hooks.md',
  'docs/guides/hooks.md': 'Hooks-Guide.md',
  'docs/reference/mcp-tools.md': 'MCP-Tools.md',
  'docs/standards/osaf.md': 'Open-Source-Accessibility-Framework.md',
  'docs/standards/wcag.md': 'WCAG.md',
  'docs/reference/tools/vpat-generation.md': 'VPAT-Generation.md',
  'docs/guides/scanning/pdf-scanning.md': 'PDF-Scanning.md',
  'docs/reference/knowledge-domains/mobile-accessibility.md': 'Knowledge-Mobile-Accessibility.md',
  'docs/reference/knowledge-domains/cognitive-accessibility.md': 'Knowledge-Cognitive-Accessibility.md',
  'docs/reference/skills/README.md': 'Agents-Overview.md',
  'docs/reference/skills/accessibility-lead.md': 'Agent:-Accessibility-Lead.md',
  'docs/reference/skills/web-accessibility-wizard.md': 'Agent:-Web-Accessibility-Wizard.md',
  'docs/reference/skills/document-accessibility-wizard.md': 'Agent:-Document-Accessibility-Wizard.md',
  'docs/reference/skills/alt-text-headings.md': 'Agent:-Alt-Text-and-Headings.md',
  'docs/reference/skills/aria-specialist.md': 'Agent:-ARIA-Specialist.md',
  'docs/reference/skills/contrast-master.md': 'Agent:-Contrast-Master.md',
  'docs/reference/skills/forms-specialist.md': 'Agent:-Forms-Specialist.md',
  'docs/reference/skills/keyboard-navigator.md': 'Agent:-Keyboard-Navigator.md',
  'docs/reference/skills/link-checker.md': 'Agent:-Link-Checker.md',
  'docs/reference/skills/live-region-controller.md': 'Agent:-Live-Region-Controller.md',
  'docs/reference/skills/modal-specialist.md': 'Agent:-Modal-Specialist.md',
  'docs/reference/skills/tables-data-specialist.md': 'Agent:-Tables-Data-Specialist.md',
  'docs/reference/skills/testing-coach.md': 'Agent:-Testing-Coach.md',
  'docs/reference/skills/wcag-guide.md': 'Agent:-WCAG-Guide.md',
  'docs/reference/skills/word-accessibility.md': 'Agent:-Word-Accessibility.md',
  'docs/reference/skills/excel-accessibility.md': 'Agent:-Excel-Accessibility.md',
  'docs/reference/skills/powerpoint-accessibility.md': 'Agent:-PowerPoint-Accessibility.md',
  'docs/reference/skills/pdf-accessibility.md': 'Agent:-PDF-Accessibility.md',
  'docs/reference/skills/office-scan-config.md': 'Agent:-Office-Scan-Config.md',
  'docs/reference/skills/pdf-scan-config.md': 'Agent:-PDF-Scan-Config.md',
};

/** Wiki pages written by hand in the repository rather than taken from docs/. */
const WIKI_SOURCE = '.github/wiki';

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

function derivedName(rel) {
  const base = path.basename(rel, '.md').replace(/ /g, '-');
  return base.replace(/^./, (c) => c.toUpperCase()).replace(/-(.)/g, (_, c) => '-' + c.toUpperCase()) + '.md';
}

/** Map of wiki page name to the repository file it comes from. */
function plan() {
  const pages = new Map();
  const clashes = [];
  const add = (name, rel) => {
    if (pages.has(name)) clashes.push(`${name}: ${pages.get(name)} and ${rel}`);
    else pages.set(name, rel);
  };
  for (const file of walk(path.join(ROOT, 'docs')).sort()) {
    const rel = path.relative(ROOT, file).split(path.sep).join('/');
    add(PAGE_NAMES[rel] || derivedName(rel), rel);
  }
  for (const file of walk(path.join(ROOT, WIKI_SOURCE)).sort()) {
    const rel = path.relative(ROOT, file).split(path.sep).join('/');
    add(path.basename(file), rel);
  }
  for (const rel of Object.keys(PAGE_NAMES)) {
    if (!fs.existsSync(path.join(ROOT, rel))) clashes.push(`PAGE_NAMES lists ${rel}, which does not exist`);
  }
  return { pages, clashes };
}

const args = process.argv.slice(2);
const { pages, clashes } = plan();
if (clashes.length) {
  console.error('Wiki page names clash. Add one of each pair to PAGE_NAMES in scripts/sync-wiki.mjs:');
  for (const c of clashes) console.error('  ' + c);
  process.exit(1);
}
if (args.includes('--check')) {
  console.log(`${pages.size} wiki pages, no clashes.`);
  process.exit(0);
}

const wiki = args.find((a) => !a.startsWith('--'));
if (!wiki || !fs.existsSync(path.join(wiki, '.git'))) {
  console.error('Usage: node scripts/sync-wiki.mjs <wiki-checkout> [--dry-run]');
  process.exit(2);
}
const dryRun = args.includes('--dry-run');
let changes = 0;

for (const [name, rel] of pages) {
  const dest = path.join(wiki, name);
  const content = Buffer.from(demoteHeadings(fs.readFileSync(path.join(ROOT, rel), 'utf8')), 'utf8');
  if (fs.existsSync(dest) && fs.readFileSync(dest).equals(content)) continue;
  console.log(`${fs.existsSync(dest) ? 'update' : 'add   '} ${name}  <- ${rel}`);
  if (!dryRun) fs.writeFileSync(dest, content);
  changes += 1;
}

for (const entry of fs.readdirSync(wiki)) {
  if (entry.startsWith('.') || pages.has(entry)) continue;
  const full = path.join(wiki, entry);
  if (fs.statSync(full).isDirectory()) continue;
  console.log(`remove ${entry}`);
  if (!dryRun) fs.rmSync(full);
  changes += 1;
}

console.log(`${changes} change${changes === 1 ? '' : 's'}${dryRun ? ' (dry run)' : ''}; ${pages.size} pages.`);
