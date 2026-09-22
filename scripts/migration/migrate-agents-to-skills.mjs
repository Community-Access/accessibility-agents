#!/usr/bin/env node
/**
 * migrate-agents-to-skills.mjs - one-shot Phase 1 migration.
 *
 * Reads the Claude agent tree (`.claude/agents` for routers, `.claude/specialists`
 * for everything else - the most-edited of the six drifted copies) and writes the
 * standard Agent Skills package at `skills/`.
 *
 * Per skill it produces:
 *   skills/<name>/SKILL.md            spec frontmatter + core body under the budget
 *   skills/<name>/references/*.md     every section the core body could not hold
 *   skills/<name>/agents/openai.yaml  Codex interface and implicit-invocation policy
 *
 * Nothing is deleted. The legacy trees stay until Phase 6.
 *
 * It also writes build/drift-report.md: for each skill, the lines that appear in
 * one legacy copy and not in the copy this migration used. Six copies of every
 * agent have drifted apart, so some of them hold fixes the source does not.
 * That report is the hand-review list.
 *
 * HISTORICAL. This ran once, in Phase 1. Since Phase 2 the routers are
 * hand-authored and `skills/` is the source of truth, so re-running this would
 * overwrite work rather than reproduce it. It refuses to run against an
 * existing `skills/` without --force, and is kept for provenance: it documents
 * exactly how the 7.0 package was derived from the six drifted agent trees.
 *
 * Usage:
 *   node scripts/migrate-agents-to-skills.mjs --dry-run
 *   node scripts/migrate-agents-to-skills.mjs --force     (destructive)
 *   node scripts/migrate-agents-to-skills.mjs --only aria-specialist --force
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

const MAX_BODY_BYTES = 6144; // Agent Skills guidance: body under ~5,000 tokens
const MAX_BUNDLE_BYTES = 12288; // one reference file holds at most this much
const OUT_DIR = path.join(ROOT, 'skills');

const SOURCES = [
  { dir: '.claude/agents', tier: 'router' },
  { dir: '.claude/specialists', tier: null },
];

/** The other five copies, checked for drift only. */
const DRIFT_COPIES = [
  { label: 'claude-plugin', file: (n) => `claude-code-plugin/agents/${n}.md` },
  { label: 'codex-skills', file: (n) => `codex-skills/${n}/SKILL.md` },
  { label: 'codex-references', file: (n) => `codex-plugin/references/specialists/${n}.md` },
  { label: 'gemini', file: (n) => `.gemini/extensions/a11y-agents/skills/${n}/SKILL.md` },
  { label: 'copilot', file: (n) => `.github/agents/${n}.agent.md` },
];

/**
 * Knowledge domains live in `.github/skills` today and are cited by agents as
 * `../skills/<name>/SKILL.md`. They migrate as reference-tier skills under a
 * `kb-` prefix: the prefix keeps `cognitive-accessibility` the knowledge base
 * distinct from `cognitive-accessibility` the specialist, and reference tier
 * keeps all 26 out of every client's catalog.
 */
const KB_SOURCE_DIR = '.github/skills';
const KB_PREFIX = 'kb-';

/**
 * Shared instruction files that are not in `.github/skills` but are cited the
 * same way. They migrate to the same reference tier so nothing in the package
 * points at a tree Phase 6 deletes.
 */
const EXTRA_REFERENCES = [
  {
    name: 'kb-github-shared-instructions',
    title: 'GitHub Shared Instructions',
    source: '.github/agents/shared-instructions.md',
    description:
      'Reference data, not a reviewer. Persona, authentication, output and reporting rules every GitHub skill follows.',
  },
];

/** Headings that earn a place in the core body before anything else. */
const CORE_HEADING = /^(your role|role|how you work|what you do|overview|output|output path|output format|dispatch|delegation|sub-?agent|workflow|process|steps|handoffs?|behavio(u)?ral rules|when to use|scope|phases?$|rules)/i;

// ------------------------------------------------------------------ helpers

function read(rel) {
  try {
    return fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  } catch {
    return null;
  }
}

function slug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'section';
}

function splitFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { fm: '', body: text };
  return { fm: m[1], body: text.slice(m[0].length) };
}

/**
 * Split a markdown body into a preamble plus level-two sections, ignoring
 * `## ` lines that live inside fenced code blocks - report templates in this
 * repo are full of them.
 */
function splitSections(body) {
  const lines = body.split('\n');
  const sections = [];
  let preamble = [];
  let current = null;
  let fence = null;

  for (const line of lines) {
    const fenceMatch = line.match(/^\s{0,3}(```+|~~~+)/);
    if (fenceMatch) {
      const marker = fenceMatch[1][0].repeat(3);
      if (!fence) fence = marker;
      else if (marker === fence) fence = null;
    }

    if (!fence && /^## \S/.test(line)) {
      if (current) sections.push(current);
      current = { heading: line.replace(/^##\s+/, '').trim(), lines: [line] };
      continue;
    }
    if (current) current.lines.push(line);
    else preamble.push(line);
  }
  if (current) sections.push(current);

  for (const s of sections) {
    s.text = s.lines.join('\n').replace(/\s+$/, '') + '\n';
    s.bytes = s.text.length;
    delete s.lines;
  }
  return { preamble: preamble.join('\n').replace(/\s+$/, ''), sections };
}

/**
 * Drop any paragraph repeated verbatim earlier in the same preamble. Several
 * agents carry their opening paragraph twice, separated by an unrelated note,
 * which an adjacent-only check would miss. Headings are compared whatever their
 * length: a repeated title line is short but still a duplicate.
 */
function dedupeParagraphs(text) {
  const paras = text.split(/\n{2,}/);
  const seen = new Set();
  const out = [];
  let removed = 0;
  for (const p of paras) {
    const key = p.trim();
    const worthTracking = key.length > 40 || /^#{1,6}\s/.test(key);
    if (worthTracking && seen.has(key)) {
      removed += 1;
      continue;
    }
    if (worthTracking) seen.add(key);
    out.push(p);
  }
  return { text: out.join('\n\n'), removed };
}

/**
 * A skill's title is its frontmatter name, so its body must not carry an H1.
 * Demote every top-level heading outside a fenced block to H2, which also puts
 * it in reach of the section splitter. Fence-aware, because shell and Python
 * blocks are full of lines that start with a hash.
 */
function demoteH1(body) {
  const lines = body.split('\n');
  let fence = null;
  let demoted = 0;
  for (let i = 0; i < lines.length; i += 1) {
    const fenceMatch = lines[i].match(/^\s{0,3}(```+|~~~+)/);
    if (fenceMatch) {
      const marker = fenceMatch[1][0].repeat(3);
      if (!fence) fence = marker;
      else if (marker === fence) fence = null;
      continue;
    }
    if (fence) continue;
    if (/^# \S/.test(lines[i])) {
      lines[i] = '#' + lines[i];
      demoted += 1;
    }
  }
  return { text: lines.join('\n'), demoted };
}

/**
 * Repoint every citation of a knowledge domain at its migrated skill, before
 * the body is split.
 *
 * Doing it here rather than afterwards matters: the same block often appears
 * twice in one agent with the two link spellings the old trees used, and only
 * once both are normalised can the duplicate be recognised and dropped.
 */
function rewriteKnowledgeLinksInText(text, kbNames) {
  let out = text;
  for (const n of kbNames) {
    out = out.split(`../skills/${n}/`).join(`../${KB_PREFIX}${n}/`);
    out = out.split(`../../.github/skills/${n}/`).join(`../${KB_PREFIX}${n}/`);
  }
  out = out.split('](../../.github/agents/shared-instructions.md)').join('](../kb-github-shared-instructions/SKILL.md)');
  out = out.split('](shared-instructions.md)').join('](../kb-github-shared-instructions/SKILL.md)');
  return out;
}

/**
 * Move a body's relative links down one directory level.
 *
 * Sections are written from SKILL.md into `references/`, so a link that was
 * correct at the skill root is one level short once it lands there.
 */
function reparentLinks(text) {
  return text.replace(/\]\((\.\.?\/)([^)\s]*)\)/g, (whole, prefix, rest) =>
    prefix === '../' ? `](../../${rest})` : `](../${rest})`,
  );
}

/** Paragraphs of a section, minus its heading and any horizontal rules. */
function sectionParagraphs(section) {
  return section.text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p && !/^#{1,6}\s/.test(p) && !/^(-{3,}|\*{3,}|_{3,})$/.test(p));
}

/** True when `candidate` adds nothing `earlier` does not already say. */
function isSubsetSection(candidate, earlier) {
  const have = new Set(sectionParagraphs(earlier));
  const want = sectionParagraphs(candidate);
  if (!want.length) return true;
  return want.every((p) => have.has(p));
}

function indexBlock(bundles) {
  if (!bundles.length) return '';
  const lines = [
    '',
    '## Reference files',
    '',
    'Read one only when the task reaches it. Do not read them all up front.',
    '',
  ];
  for (const b of bundles) {
    let covers = b.headings.join(', ');
    if (covers.length > 96) covers = covers.slice(0, 93).replace(/,?\s*\S*$/, '') + '...';
    lines.push(`- \`references/${b.name}.md\` - ${covers}`);
  }
  lines.push('');
  return lines.join('\n');
}

function footerBlock(meta) {
  const lines = ['', '## Output contract', ''];
  if (meta.output === 'findings') {
    lines.push(
      'Return only JSON matching `skills/a11y-core/schemas/findings.schema.json`.',
      'No prose, no summary, no restated instructions. One object, one array of findings.',
    );
  } else if (meta.output === 'report') {
    lines.push(
      'Collect findings as JSON from each specialist you dispatch, write them to',
      '`.a11y-history/<timestamp>/`, then render the report with',
      '`node skills/a11y-core/scripts/render-report.mjs`. Do not type the report by hand.',
    );
  } else if (meta.output === 'artifact') {
    lines.push(
      'Produce the file or script the task asks for. Report what you wrote as a short',
      'list of paths and what each one changes. Do not restate the file contents.',
    );
  } else {
    lines.push(
      'Answer the question. Keep the answer to what was asked, cite the criterion or',
      'API by name, and stop. Do not append a checklist that was not requested.',
    );
  }
  lines.push(
    '',
    'Shared rules, dispatch contract and schemas: `skills/a11y-core/SKILL.md`.',
    'Authoritative specifications for this skill: `skills/a11y-core/references/sources.md`.',
    '',
  );
  return lines.join('\n');
}

/**
 * Choose which sections stay in SKILL.md. Preamble always stays, and so does
 * anything pinned - a router's dispatch block is the reason the router exists
 * and may never be exiled to a reference file. Small and core-loop sections are
 * preferred after that. Everything evicted is bundled, in document order, into
 * reference files.
 */
function planSplit(preamble, sections, footerBytes, pinned = new Set()) {
  const order = sections.map((s, i) => i).filter((i) => !pinned.has(i));
  order.sort((a, b) => {
    const pa = CORE_HEADING.test(sections[a].heading) ? 0 : 1;
    const pb = CORE_HEADING.test(sections[b].heading) ? 0 : 1;
    if (pa !== pb) return pa - pb;
    return sections[a].bytes - sections[b].bytes;
  });

  const keep = new Set(pinned);
  let used = preamble.length + footerBytes;
  for (const i of pinned) used += sections[i].bytes;

  for (const i of order) {
    const projected = used + sections[i].bytes + estimateIndexBytes(sections.length - keep.size - 1);
    if (projected > MAX_BODY_BYTES) continue;
    keep.add(i);
    used += sections[i].bytes;
  }

  // If the preamble and pinned sections alone blow the budget there is nothing
  // to evict; the caller reports it rather than shipping an oversized body.
  return keep;
}

function assemble(preamble, sections, keep, bundles, footer) {
  const kept = sections.filter((_, i) => keep.has(i));
  return preamble + '\n\n' + kept.map((s) => s.text).join('\n') + indexBlock(bundles) + footer;
}

function estimateIndexBytes(movedCount) {
  if (movedCount <= 0) return 0;
  const bundles = Math.max(1, Math.ceil(movedCount / 4));
  return 120 + bundles * 90;
}

function bundleMoved(sections, keep) {
  const bundles = [];
  let current = null;
  for (let i = 0; i < sections.length; i += 1) {
    if (keep.has(i)) {
      current = null; // a kept section breaks the run
      continue;
    }
    const s = sections[i];
    if (!current || current.bytes + s.bytes > MAX_BUNDLE_BYTES) {
      current = { name: slug(s.heading), headings: [], parts: [], bytes: 0 };
      bundles.push(current);
    }
    current.headings.push(s.heading);
    current.parts.push(s.text);
    current.bytes += s.bytes;
  }

  const seen = new Map();
  for (const b of bundles) {
    const n = (seen.get(b.name) || 0) + 1;
    seen.set(b.name, n);
    if (n > 1) b.name = `${b.name}-${n}`;
  }
  return bundles;
}

function yamlEscape(v) {
  if (/^[\w][\w .,'()\/-]*$/.test(v) && !/:\s/.test(v)) return v;
  return JSON.stringify(v);
}

function buildSkillMd(name, meta, coreBody) {
  const fm = [
    '---',
    `name: ${name}`,
    `description: ${yamlEscape(meta.description)}`,
    'license: MIT',
  ];
  if (meta.tier !== 'router') fm.push('disable-model-invocation: true');
  if (meta.tier === 'helper') fm.push('user-invocable: false');
  fm.push(
    'metadata:',
    `  tier: ${meta.tier}`,
    `  domain: ${meta.domain}`,
    `  output: ${meta.output}`,
    `  effort: ${meta.effort}`,
    `  title: ${yamlEscape(meta.title)}`,
  );
  if (meta.aliases && meta.aliases.length) fm.push(`  aliases: ${meta.aliases.join(' ')}`);
  fm.push('---', '');
  return fm.join('\n') + coreBody.replace(/\n{3,}/g, '\n\n').replace(/^\n+/, '') + '\n';
}

function buildOpenAiYaml(name, meta) {
  const lines = [
    '# Codex interface for this skill.',
    '# Specialists and helpers are dispatched by a router, never picked implicitly,',
    '# so they stay out of the model-facing catalog and its two percent cap.',
    'interface:',
    `  display_name: ${JSON.stringify(meta.title)}`,
    `  short_description: ${JSON.stringify(meta.description)}`,
    'policy:',
    `  allow_implicit_invocation: ${meta.tier === 'router' ? 'true' : 'false'}`,
    '',
  ];
  return lines.join('\n');
}

// -------------------------------------------------------------- drift report

function bodyLines(text) {
  if (text == null) return null;
  const { body } = splitFrontmatter(text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n'));
  return new Set(
    body
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 24),
  );
}

function driftFor(name, sourceText) {
  const base = bodyLines(sourceText);
  const rows = [];
  for (const copy of DRIFT_COPIES) {
    const other = bodyLines(read(copy.file(name)));
    if (!other) continue;
    const onlyThere = [...other].filter((l) => !base.has(l));
    if (onlyThere.length) rows.push({ copy: copy.label, count: onlyThere.length, sample: onlyThere.slice(0, 3) });
  }
  return rows;
}

/**
 * Turn `- **WAI-ARIA 1.2** - https://...` into `- [WAI-ARIA 1.2](https://...)`.
 *
 * A bare URL read aloud is a string of characters; the specification's name is
 * what a person needs. This also drops the em-dash separators these lists used,
 * which this project's own markdown rules flag.
 */
function linkifyBullet(bullet) {
  const m = bullet.match(/^([-*])\s+\*\*(.+?)\*\*\s*[-–—:]?\s*(https?:\/\/\S+?)([.,;]?)$/);
  if (m) return `${m[1]} [${m[2].trim()}](${m[3]})`;

  // Label without bold, still followed by a bare URL.
  const plain = bullet.match(/^([-*])\s+(.+?)\s+[-–—:]\s*(https?:\/\/\S+?)([.,;]?)$/);
  if (plain && !/\]\(/.test(plain[2])) return `${plain[1]} [${plain[2].trim()}](${plain[3]})`;

  return bullet;
}

/** Which domains each router is responsible for dispatching. */
const ROUTER_DOMAINS = {
  'accessibility-lead': ['web', 'cross-cutting'],
  'web-accessibility-wizard': ['web', 'cross-cutting'],
  'document-accessibility-wizard': ['documents'],
  'markdown-a11y-assistant': ['markdown'],
  'developer-hub': ['developer', 'desktop'],
  'github-hub': ['github'],
};

function routerMembers(routerName, catalog) {
  const domains = new Set(ROUTER_DOMAINS[routerName] || []);
  const rows = [];
  for (const [name, entry] of Object.entries(catalog.skills)) {
    if (name === routerName) continue;
    if (entry.tier !== 'specialist' && entry.tier !== 'helper') continue;
    if (!domains.has(entry.domain)) continue;
    rows.push({ name, ...entry });
  }
  rows.sort((a, b) => (a.tier === b.tier ? a.name.localeCompare(b.name) : a.tier === 'specialist' ? -1 : 1));
  return rows;
}

/**
 * The pinned dispatch block. Every router carries the same prompt shape, so a
 * specialist receives the same contract no matter who sent it, and the router
 * never reads a specialist body into its own context.
 */
function dispatchSection(routerName, catalog) {
  const members = routerMembers(routerName, catalog);
  const lines = [
    '## Dispatching skills',
    '',
    'Pick the skills this task needs from `references/dispatch-matrix.md`, then',
    'dispatch each one with your client\'s subagent primitive using exactly this',
    'prompt shape. Do not read a skill\'s instructions into your own context, and',
    'do not paste its body into a prompt.',
    '',
    '```',
    'Activate the skill "<skill-name>". If skill activation is unavailable,',
    'read skills/<skill-name>/SKILL.md and follow it.',
    'Task: <one paragraph, what to check and why>',
    'Scope: <file list or glob>',
    'Rules: semantic HTML before ARIA; report, do not edit.',
    'Return ONLY JSON matching skills/a11y-core/schemas/findings.schema.json.',
    '```',
    '',
    `Dispatch in parallel where the skills are independent. ${members.length} skills are available to`,
    'this router; the matrix says which task each one answers. Merge what comes',
    'back, then follow the output contract at the end of this file.',
    '',
  ];
  return lines.join('\n');
}

/** The full roster for one router, as a reference it opens only when choosing. */
function dispatchMatrix(routerName, catalog) {
  const members = routerMembers(routerName, catalog);
  const lines = [
    `# Dispatch matrix: ${routerName}`,
    '',
    'Every skill this router can dispatch. They are invisible to the model by',
    'design, so this file is the only place they are named. Dispatch by the',
    'prompt shape in SKILL.md, never by pasting a body.',
    '',
    '## Specialists',
    '',
  ];
  const specialists = members.filter((x) => x.tier === 'specialist');
  lines.push(
    `The ${specialists.length} reviewing skills in these domains, with the task each one answers.`,
    'Each returns findings JSON; none of them edits files.',
    '',
    '| Skill | Use it for |',
    '|---|---|',
  );
  for (const m of specialists) {
    lines.push(`| \`${m.name}\` | ${m.description} |`);
  }
  const helpers = members.filter((x) => x.tier === 'helper');
  if (helpers.length) {
    lines.push(
      '',
      '## Helpers',
      '',
      `The ${helpers.length} mechanical skills in these domains: discovery, scanning, export and`,
      'configuration. Dispatch these without asking the user first.',
      '',
      '| Skill | Use it for |',
      '|---|---|',
    );
    for (const m of helpers) lines.push(`| \`${m.name}\` | ${m.description.replace(/^Internal helper: /, '')} |`);
  }
  lines.push(
    '',
    '## Outside this router',
    '',
    'Hand off rather than improvise when the task leaves these domains:',
    '',
  );
  for (const [other, domains] of Object.entries(ROUTER_DOMAINS)) {
    if (other === routerName) continue;
    lines.push(`- \`${other}\` - ${domains.join(', ')}`);
  }
  lines.push('');
  return lines.join('\n');
}

/**
 * Copy the knowledge domains across as reference-tier skills.
 *
 * These are data, not behaviour: rule tables, URL registries, scoring formulas.
 * They keep their whole body - splitting a lookup table across reference files
 * would make it slower to use, and nothing loads them unless a skill cites one.
 */
function migrateKnowledgeDomains(dryRun) {
  const names = [];
  let dirs;
  try {
    dirs = fs.readdirSync(path.join(ROOT, KB_SOURCE_DIR));
  } catch {
    return names;
  }

  for (const entry of dirs) {
    const raw = read(`${KB_SOURCE_DIR}/${entry}/SKILL.md`);
    if (!raw) continue;
    const { fm, body } = splitFrontmatter(raw);
    const desc = (fm.match(/^description:\s*(.*)$/m) || [])[1] || `Reference data for ${entry}.`;
    const name = KB_PREFIX + entry;
    names.push({ name, from: `${KB_SOURCE_DIR}/${entry}/SKILL.md`, bytes: body.length });
    if (dryRun) continue;

    const out = [
      '---',
      `name: ${name}`,
      `description: ${yamlEscape('Reference data, not a reviewer. ' + desc.replace(/^["']|["']$/g, '').trim())}`,
      'license: MIT',
      'disable-model-invocation: true',
      'user-invocable: false',
      'metadata:',
      '  tier: reference',
      '  domain: cross-cutting',
      '  output: none',
      '  effort: low',
      `  title: ${yamlEscape(entry.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()))}`,
      '---',
      '',
      demoteH1(body).text.trim(),
      '',
    ].join('\n');

    const dir = path.join(OUT_DIR, name);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'SKILL.md'), out, 'utf8');

    // Carry any supporting files the domain shipped with.
    for (const extra of fs.readdirSync(path.join(ROOT, KB_SOURCE_DIR, entry))) {
      if (extra === 'SKILL.md') continue;
      const src = path.join(ROOT, KB_SOURCE_DIR, entry, extra);
      fs.cpSync(src, path.join(dir, extra), { recursive: true });
    }
  }

  for (const extra of EXTRA_REFERENCES) {
    const raw = read(extra.source);
    if (!raw) continue;
    names.push({ name: extra.name, from: extra.source, bytes: raw.length });
    if (dryRun) continue;
    const { body } = splitFrontmatter(raw);
    const out = [
      '---',
      `name: ${extra.name}`,
      `description: ${yamlEscape(extra.description)}`,
      'license: MIT',
      'disable-model-invocation: true',
      'user-invocable: false',
      'metadata:',
      '  tier: reference',
      '  domain: cross-cutting',
      '  output: none',
      '  effort: low',
      `  title: ${yamlEscape(extra.title)}`,
      '---',
      '',
      demoteH1(body).text.trim(),
      '',
    ].join('\n');
    const dir = path.join(OUT_DIR, extra.name);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'SKILL.md'), out, 'utf8');
  }

  return names;
}

/**
 * Agents cite knowledge domains as `../skills/<name>/SKILL.md`, a path that
 * resolved to nothing from either the old or the new location. Point them at
 * the migrated reference skills.
 */
function rewriteKnowledgeLinks() {
  let files = 0;
  let links = 0;
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir)) {
      const p = path.join(dir, e);
      if (fs.statSync(p).isDirectory()) {
        walk(p);
        continue;
      }
      if (!p.endsWith('.md')) continue;
      const before = fs.readFileSync(p, 'utf8');
      const after = before.replace(/\.\.\/skills\/([a-z0-9-]+)\//g, (whole, n) => {
        if (!fs.existsSync(path.join(OUT_DIR, KB_PREFIX + n))) return whole;
        links += 1;
        return `../${KB_PREFIX}${n}/`;
      });
      if (after !== before) {
        fs.writeFileSync(p, after, 'utf8');
        files += 1;
      }
    }
  };
  walk(OUT_DIR);
  return { files, links };
}

/**
 * One shared sources reference, grouped by skill. Each skill's core body points
 * here instead of carrying its own copy of the same specification URLs.
 */
function writeSharedSources(sourcesBySkill, catalog) {
  const counts = new Map();
  for (const bullets of sourcesBySkill.values()) {
    for (const b of bullets) {
      const linked = linkifyBullet(b);
      counts.set(linked, (counts.get(linked) || 0) + 1);
    }
  }
  const shared = [...counts.entries()]
    .filter(([, n]) => n >= 8)
    .map(([b]) => b)
    .sort();
  const sharedSet = new Set(shared);

  const lines = [
    '# Authoritative sources',
    '',
    'Every specification, rule set and vendor reference the Accessibility Agents',
    'skills cite. Skills point here rather than each carrying its own copy.',
    '',
    'Cite by name and link when a finding rests on a specific criterion. The',
    'citation policy is in `docs/` and applies to every skill in this package.',
    '',
    '## Cited by most skills',
    '',
  ];
  for (const b of shared) lines.push(b);
  lines.push('', '## By skill', '');

  for (const name of Object.keys(catalog.skills)) {
    const bullets = (sourcesBySkill.get(name) || []).map(linkifyBullet).filter((b) => !sharedSet.has(b));
    if (!bullets.length) continue;
    lines.push(`### ${name}`, '');
    for (const b of bullets) lines.push(b);
    lines.push('');
  }

  const dir = path.join(OUT_DIR, 'a11y-core', 'references');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'sources.md'), lines.join('\n') + '\n', 'utf8');
  console.log(`Shared sources: skills/a11y-core/references/sources.md (${shared.length} common, ${sourcesBySkill.size} skills)`);
}

// --------------------------------------------------------------------- main

function main() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes('--dry-run');
  const onlyIdx = argv.indexOf('--only');
  const only = onlyIdx !== -1 ? new Set(argv[onlyIdx + 1].split(',')) : null;

  if (!dryRun && !argv.includes('--force') && fs.existsSync(OUT_DIR)) {
    console.error('skills/ already exists, and since Phase 2 it is the source of truth.');
    console.error('Re-running this migration would overwrite hand-authored routers.');
    console.error('Use --dry-run to inspect, or --force if you genuinely mean to regenerate.');
    return 1;
  }

  const catalog = JSON.parse(read('scripts/agent-catalog.json'));
  const defaults = catalog.defaults;

  // Locate every source file once.
  const sourceOf = new Map();
  for (const src of SOURCES) {
    for (const f of fs.readdirSync(path.join(ROOT, src.dir))) {
      if (!f.endsWith('.md') || f === 'AGENTS.md') continue;
      sourceOf.set(f.replace(/\.md$/, ''), src.dir + '/' + f);
    }
  }

  const aliasOf = new Map();
  for (const [name, meta] of Object.entries(catalog.skills)) {
    for (const a of meta.aliases || []) aliasOf.set(a, name);
  }

  const missing = [...Object.keys(catalog.skills)].filter((n) => !sourceOf.has(n));
  const uncatalogued = [...sourceOf.keys()].filter((n) => !catalog.skills[n] && !aliasOf.has(n));
  if (missing.length) {
    console.error('No source file for: ' + missing.join(', '));
    return 1;
  }

  const report = [];
  const driftRows = [];
  const sourcesBySkill = new Map();
  let written = 0;

  // Known before anything is written, so bodies can be repointed as they are
  // split rather than patched afterwards.
  let kbNames = [];
  try {
    kbNames = fs.readdirSync(path.join(ROOT, KB_SOURCE_DIR));
  } catch {
    kbNames = [];
  }

  for (const [name, entry] of Object.entries(catalog.skills)) {
    if (only && !only.has(name)) continue;

    const rel = sourceOf.get(name);
    const raw = read(rel);
    const { body } = splitFrontmatter(raw);

    const meta = {
      tier: entry.tier,
      domain: entry.domain,
      title: entry.title,
      description: entry.description,
      aliases: entry.aliases,
      output: entry.output || defaults[entry.tier].output,
      effort: entry.effort || defaults[entry.tier].effort,
    };

    let removedSections = 0;
    const { text: demotedBody, demoted } = demoteH1(rewriteKnowledgeLinksInText(body, kbNames));
    const { preamble: rawPreamble, sections: allSections } = splitSections(demotedBody);

    // Every agent opened with the same shape of "Authoritative Sources" list.
    // Those lists move to one shared reference, grouped by skill, so the core
    // body spends its budget on instructions instead of on URLs.
    const sections = [];
    const sectionsByHeading = new Map();
    let rescuedProse = '';
    for (const s of allSections) {
      // Copy drift duplicated whole sections, not just paragraphs, and the
      // second copy is often a shorter version of the first. Drop a repeat only
      // when it says nothing the earlier one did not.
      // The generated footer is the authoritative output contract; an older
      // hand-written one would sit beside it saying something slightly else.
      if (/^output contract$/i.test(s.heading)) {
        removedSections += 1;
        continue;
      }
      const earlier = sectionsByHeading.get(s.heading);
      if (earlier && isSubsetSection(s, earlier)) {
        removedSections += 1;
        continue;
      }
      if (!earlier) sectionsByHeading.set(s.heading, s);
      if (/^authoritative sources/i.test(s.heading)) {
        const bullets = [];
        const prose = [];
        for (const line of s.text.split('\n')) {
          if (/^##\s/.test(line)) continue;
          if (/^\s*[-*]\s+\S/.test(line)) bullets.push(line.trim());
          else prose.push(line);
        }
        sourcesBySkill.set(name, bullets);
        // These sections also carried the agent's identity paragraph. Keep the
        // prose; only the URL list moves to the shared reference.
        rescuedProse = prose.join('\n').trim();
        continue;
      }
      sections.push(s);
    }

    const pre = dedupeParagraphs(
      rescuedProse ? (rawPreamble.trim() ? rawPreamble.trim() + '\n\n' + rescuedProse : rescuedProse) : rawPreamble,
    );
    const preamble = pre.text;
    let removed = pre.removed;

    // Copy drift repeated whole paragraphs inside sections too. Sections that
    // contain a fence are left alone: paragraph splitting is not safe there.
    for (const s of sections) {
      if (/^\s{0,3}(```|~~~)/m.test(s.text)) continue;
      const d = dedupeParagraphs(s.text);
      if (!d.removed) continue;
      removed += d.removed;
      s.text = d.text.replace(/\s+$/, '') + '\n';
      s.bytes = s.text.length;
    }

    // A router's whole job is to dispatch. That block is written here, pinned
    // into the core body, and backed by a generated matrix of every skill in
    // its domains - which is also the only thing making those skills reachable,
    // since they are deliberately invisible to the model.
    const pinned = new Set();
    if (meta.tier === 'router') {
      const dispatch = dispatchSection(name, catalog);
      sections.unshift({ heading: 'Dispatching skills', text: dispatch, bytes: dispatch.length });
      pinned.add(0);
    }

    const footer = footerBlock(meta);
    const keep = planSplit(preamble, sections, footer.length, pinned);

    // The index block size is only estimated while planning. Measure the real
    // body and evict the largest unpinned section until it fits, so the budget
    // is met exactly rather than approximately.
    let bundles = bundleMoved(sections, keep);
    let coreBody = assemble(preamble, sections, keep, bundles, footer);
    while (coreBody.length > MAX_BODY_BYTES) {
      let biggest = null;
      for (const i of keep) {
        if (pinned.has(i)) continue;
        if (biggest === null || sections[i].bytes > sections[biggest].bytes) biggest = i;
      }
      if (biggest === null) break;
      keep.delete(biggest);
      bundles = bundleMoved(sections, keep);
      coreBody = assemble(preamble, sections, keep, bundles, footer);
    }

    const skillMd = buildSkillMd(name, meta, coreBody);

    report.push({
      name,
      tier: meta.tier,
      sourceBytes: body.length,
      coreBytes: coreBody.length,
      kept: keep.size,
      moved: sections.length - keep.size,
      bundles: bundles.length,
      dedupedParagraphs: removed,
      demotedH1: demoted,
      dedupedSections: removedSections,
      overBudget: coreBody.length > MAX_BODY_BYTES,
    });

    const drift = driftFor(name, raw);
    if (drift.length) driftRows.push({ name, drift });

    if (dryRun) continue;

    const dir = path.join(OUT_DIR, name);
    fs.rmSync(path.join(dir, 'references'), { recursive: true, force: true });
    fs.mkdirSync(path.join(dir, 'agents'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'SKILL.md'), skillMd, 'utf8');
    fs.writeFileSync(path.join(dir, 'agents', 'openai.yaml'), buildOpenAiYaml(name, meta), 'utf8');

    if (meta.tier === 'router') {
      fs.mkdirSync(path.join(dir, 'references'), { recursive: true });
      fs.writeFileSync(path.join(dir, 'references', 'dispatch-matrix.md'), dispatchMatrix(name, catalog), 'utf8');
    }

    if (bundles.length) {
      fs.mkdirSync(path.join(dir, 'references'), { recursive: true });
      for (const b of bundles) {
        const header = `# ${entry.title} reference: ${b.headings[0]}\n\nPart of the \`${name}\` skill. Read this only when the task reaches these sections.\n\n`;
        fs.writeFileSync(
          path.join(dir, 'references', b.name + '.md'),
          header + reparentLinks(b.parts.join('\n')),
          'utf8',
        );
      }
    }
    written += 1;
  }

  // ------------------------------------------------------------- reporting
  report.sort((a, b) => b.coreBytes - a.coreBytes);
  const over = report.filter((r) => r.overBudget);
  const deduped = report.filter((r) => r.dedupedParagraphs > 0);

  console.log(`Migrated ${written} skills into skills/ (${dryRun ? 'dry run' : 'written'})`);
  console.log('');
  console.log('Largest core bodies');
  for (const r of report.slice(0, 10)) {
    console.log(
      `  ${r.name.padEnd(34)} ${String(r.coreBytes).padStart(6)} bytes  from ${String(r.sourceBytes).padStart(6)}  kept ${r.kept}/${r.kept + r.moved} sections in ${r.bundles} reference files`,
    );
  }
  console.log('');
  console.log(`Over ${MAX_BODY_BYTES} bytes: ${over.length}` + (over.length ? ' - ' + over.map((r) => r.name).join(', ') : ''));
  console.log(`Duplicate paragraphs collapsed: ${deduped.length}` + (deduped.length ? ' - ' + deduped.map((r) => r.name).join(', ') : ''));
  if (uncatalogued.length) {
    console.log(`Not migrated (no catalog entry): ${uncatalogued.join(', ')}`);
  }

  const kb = migrateKnowledgeDomains(dryRun);
  console.log(`Knowledge domains migrated as reference skills: ${kb.length}`);

  if (!dryRun) {
    writeSharedSources(sourcesBySkill, catalog);
    const rewritten = rewriteKnowledgeLinks();
    console.log(`Knowledge-domain links repointed: ${rewritten.links} in ${rewritten.files} files`);

    const lines = [
      '# Legacy copy drift report',
      '',
      `Generated by \`scripts/migrate-agents-to-skills.mjs\` on ${new Date().toISOString().slice(0, 10)}.`,
      '',
      'Each agent existed in six hand-maintained copies. This migration used the',
      '`.claude/` copy. The table below lists substantive lines that appear in one of',
      'the other five copies and not in the one migrated - candidate fixes that would',
      'otherwise be lost. Review the web team and the wizards before Phase 6 deletes',
      'the legacy trees.',
      '',
      '| Skill | Copy | Lines only there |',
      '|---|---|---:|',
    ];
    for (const row of driftRows) {
      for (const d of row.drift) lines.push(`| ${row.name} | ${d.copy} | ${d.count} |`);
    }
    lines.push('', '## Samples', '');
    for (const row of driftRows.slice(0, 40)) {
      lines.push(`### ${row.name}`, '');
      for (const d of row.drift) {
        lines.push(`- **${d.copy}** (${d.count} lines), for example:`);
        for (const s of d.sample) lines.push(`  - ${s.replace(/\|/g, '\\|').slice(0, 160)}`);
      }
      lines.push('');
    }
    fs.mkdirSync(path.join(ROOT, 'build'), { recursive: true });
    fs.writeFileSync(path.join(ROOT, 'build', 'drift-report.md'), lines.join('\n') + '\n', 'utf8');
    console.log('');
    console.log(`Drift report: build/drift-report.md (${driftRows.length} skills differ from a legacy copy)`);
  }

  return over.length ? 2 : 0;
}

process.exit(main());
