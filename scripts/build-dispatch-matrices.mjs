#!/usr/bin/env node
/**
 * build-dispatch-matrices.mjs - derive each router's roster from frontmatter.
 *
 * Specialists are invisible to the model by design. The only place a router
 * learns they exist is its `references/dispatch-matrix.md`. If that file is
 * maintained by hand, adding a specialist and forgetting the matrix makes the
 * new skill unreachable, silently, on every client.
 *
 * So the matrix is generated. Each skill declares `metadata.domain`; each
 * router declares which domains it serves in `metadata.dispatches`. The matrix
 * is the join of those two facts, and `--check` fails CI when a committed
 * matrix differs from what the frontmatter says it should be.
 *
 * Usage:
 *   node scripts/build-dispatch-matrices.mjs           write all six
 *   node scripts/build-dispatch-matrices.mjs --check   fail if any is stale
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SKILLS = path.join(ROOT, 'skills');

/**
 * Which domains each router dispatches. Kept here rather than in frontmatter
 * for now because it is six lines and changes about as often as the routers
 * do; the generator reads everything else from the skills themselves.
 */
const ROUTER_DOMAINS = {
  'accessibility-lead': ['web', 'cross-cutting'],
  'web-accessibility-wizard': ['web', 'cross-cutting'],
  'document-accessibility-wizard': ['documents'],
  'markdown-a11y-assistant': ['markdown'],
  'developer-hub': ['developer', 'desktop'],
  'github-hub': ['github'],
};

function frontmatter(file) {
  const text = fs.readFileSync(file, 'utf8');
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const get = (key) => {
    const r = m[1].match(new RegExp('^\\s*' + key + ':\\s*(.*)$', 'm'));
    return r ? r[1].trim().replace(/^"|"$/g, '') : null;
  };
  return {
    name: get('name'),
    description: get('description'),
    tier: get('tier'),
    domain: get('domain'),
  };
}

const skills = [];
for (const dir of fs.readdirSync(SKILLS).sort()) {
  const file = path.join(SKILLS, dir, 'SKILL.md');
  if (!fs.existsSync(file)) continue;
  const fm = frontmatter(file);
  if (fm) skills.push({ dir, ...fm });
}

function members(router) {
  const domains = new Set(ROUTER_DOMAINS[router]);
  return skills
    .filter((s) => s.dir !== router && domains.has(s.domain) && (s.tier === 'specialist' || s.tier === 'helper'))
    .sort((a, b) => (a.tier === b.tier ? a.dir.localeCompare(b.dir) : a.tier === 'specialist' ? -1 : 1));
}

function render(router) {
  const rows = members(router);
  const specialists = rows.filter((r) => r.tier === 'specialist');
  const helpers = rows.filter((r) => r.tier === 'helper');

  const out = [
    `# Dispatch matrix: ${router}`,
    '',
    'Generated from skill frontmatter by `scripts/build-dispatch-matrices.mjs`.',
    'Do not edit by hand; change a skill\'s `metadata.domain` instead.',
    '',
    'Every skill this router can dispatch. They are invisible to the model by',
    'design, so this file is the only place they are named. Dispatch by the',
    'prompt shape in SKILL.md, never by pasting a body.',
    '',
    '## Specialists',
    '',
    `The ${specialists.length} reviewing skills in these domains, with the task each one answers.`,
    'Each returns findings JSON; none of them edits files.',
    '',
    '| Skill | Use it for |',
    '|---|---|',
  ];
  for (const s of specialists) out.push(`| \`${s.dir}\` | ${s.description} |`);

  if (helpers.length) {
    out.push(
      '',
      '## Helpers',
      '',
      `The ${helpers.length} mechanical skills in these domains: discovery, scanning, export and`,
      'configuration. Dispatch these without asking the user first.',
      '',
      '| Skill | Use it for |',
      '|---|---|',
    );
    for (const h of helpers) out.push(`| \`${h.dir}\` | ${h.description.replace(/^Internal helper: /, '')} |`);
  }

  out.push('', '## Outside this router', '', 'Hand off rather than improvise when the task leaves these domains:', '');
  for (const [other, domains] of Object.entries(ROUTER_DOMAINS)) {
    if (other !== router) out.push(`- \`${other}\` - ${domains.join(', ')}`);
  }
  out.push('');
  return out.join('\n');
}

const check = process.argv.includes('--check');
const stale = [];
let written = 0;

for (const router of Object.keys(ROUTER_DOMAINS)) {
  const target = path.join(SKILLS, router, 'references', 'dispatch-matrix.md');
  const wanted = render(router);
  const current = fs.existsSync(target) ? fs.readFileSync(target, 'utf8').replace(/\r\n/g, '\n') : null;

  if (current === wanted) continue;
  if (check) {
    stale.push(router);
    continue;
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, wanted, 'utf8');
  written += 1;
}

// A specialist or helper in no router's domains is unreachable. Say so here,
// where the fix is obvious, rather than only in the validator.
const reachable = new Set(Object.keys(ROUTER_DOMAINS).flatMap((r) => members(r).map((m) => m.dir)));
const orphans = skills.filter((s) => (s.tier === 'specialist' || s.tier === 'helper') && !reachable.has(s.dir));

if (check) {
  if (stale.length) {
    console.error(`Stale dispatch matrices: ${stale.join(', ')}`);
    console.error('Run: node scripts/build-dispatch-matrices.mjs');
  }
  if (orphans.length) {
    console.error(`Skills no router can reach: ${orphans.map((o) => `${o.dir} (domain ${o.domain})`).join(', ')}`);
  }
  if (stale.length || orphans.length) process.exit(1);
  console.log(`Dispatch matrices current for ${Object.keys(ROUTER_DOMAINS).length} routers; every specialist and helper is reachable.`);
  process.exit(0);
}

console.log(`Dispatch matrices: ${written} written, ${Object.keys(ROUTER_DOMAINS).length - written} already current.`);
if (orphans.length) {
  console.error(`Warning: ${orphans.length} skills are in no router's domains: ${orphans.map((o) => o.dir).join(', ')}`);
  process.exit(1);
}
process.exit(0);
