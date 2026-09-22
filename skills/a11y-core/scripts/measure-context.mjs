#!/usr/bin/env node
/**
 * measure-context.mjs - context cost accounting for Accessibility Agents.
 *
 * Reports, per client harness, how many tokens the pack costs before the user
 * has said anything: instruction files the client always loads, plus the
 * name-and-description catalog entries it keeps resident for every skill or
 * agent it can invoke.
 *
 * Two subtotals per client:
 *   current - the standard package at the repo root (AGENTS.md + skills/)
 *   legacy  - the per-harness trees that 7.0 removes in Phase 6
 *
 * Budgets in budgets.json are checked against both, so today's tree cannot
 * regress while the Phase 6 targets stay visible.
 *
 * Usage:
 *   node skills/a11y-core/scripts/measure-context.mjs
 *   node skills/a11y-core/scripts/measure-context.mjs --json
 *   node skills/a11y-core/scripts/measure-context.mjs --check budgets.json
 *   node skills/a11y-core/scripts/measure-context.mjs --dispatch
 *   node skills/a11y-core/scripts/measure-context.mjs --baseline docs/context-baseline-2026-09.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..');

/**
 * Single point of truth for the estimate. Replace the body with a real
 * tokenizer when one is worth the dependency; every number in this file and in
 * budgets.json flows through here.
 */
export function estimateTokens(text) {
  if (!text) return 0;
  return Math.round(text.length / 4);
}

// 2% of the context window, per learn.chatgpt.com/docs/build-skills
const CODEX_CATALOG_CHAR_CAP = 8000;

// ---------------------------------------------------------------- utilities

function read(rel) {
  try {
    return fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/^﻿/, '');
  } catch {
    return null;
  }
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function listDir(rel) {
  try {
    return fs.readdirSync(path.join(ROOT, rel)).sort();
  } catch {
    return [];
  }
}

function stripQuotes(v) {
  if (v.length > 1 && ((v[0] === '"' && v.endsWith('"')) || (v[0] === "'" && v.endsWith("'")))) {
    return v.slice(1, -1);
  }
  return v;
}

/**
 * Small YAML-subset frontmatter reader. Handles scalars, folded/literal blocks,
 * one level of nested maps, and sequences - which is everything this repo uses.
 */
function parseFrontmatter(text) {
  if (!text) return { data: {}, body: '' };
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: text };

  const data = {};
  const lines = m[1].split(/\r?\n/);
  let i = 0;

  while (i < lines.length) {
    const kv = lines[i].match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/);
    if (!kv) {
      i += 1;
      continue;
    }
    const key = kv[1];
    const inline = kv[2].trim();
    i += 1;

    if (inline === '>' || inline === '>-' || inline === '|' || inline === '|-') {
      const parts = [];
      while (i < lines.length && (/^\s+\S/.test(lines[i]) || lines[i].trim() === '')) {
        parts.push(lines[i].trim());
        i += 1;
      }
      data[key] = parts.join(' ').trim();
      continue;
    }

    if (inline === '') {
      const seq = [];
      const map = {};
      let sawMap = false;
      while (i < lines.length && /^\s+\S/.test(lines[i])) {
        const item = lines[i].match(/^\s*-\s+(.*)$/);
        if (item) {
          seq.push(stripQuotes(item[1].trim()));
        } else {
          const sub = lines[i].match(/^\s+([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/);
          if (sub) {
            sawMap = true;
            map[sub[1]] = stripQuotes(sub[2].trim());
          }
        }
        i += 1;
      }
      data[key] = sawMap ? map : seq;
      continue;
    }

    data[key] = stripQuotes(inline);
  }

  return { data, body: text.slice(m[0].length) };
}

function isTruthy(v) {
  return v === true || v === 'true' || v === 'yes';
}

function isFalsey(v) {
  return v === false || v === 'false' || v === 'no';
}

/** A catalog entry costs its name plus its description plus framing overhead. */
function catalogCost(name, description) {
  return name + ': ' + (description || '');
}

/** Resolve one level of `@path` imports, the way CLAUDE.md and GEMINI.md do. */
function resolveImports(text, depth = 1) {
  if (!text || depth < 0) return text || '';
  return text.replace(/^@([^\s]+)[ \t]*$/gm, (whole, rel) => {
    const imported = read(rel.replace(/^\.\//, ''));
    if (imported == null) return whole;
    return resolveImports(imported, depth - 1);
  });
}

// ------------------------------------------------------------- collectors

/** Every skill directory in the standard package. */
function collectPackageSkills() {
  const out = [];
  for (const entry of listDir('skills')) {
    const rel = 'skills/' + entry + '/SKILL.md';
    const text = read(rel);
    if (!text) continue;
    const { data, body } = parseFrontmatter(text);
    const meta = typeof data.metadata === 'object' && !Array.isArray(data.metadata) ? data.metadata : {};
    out.push({
      name: data.name || entry,
      dir: entry,
      rel,
      description: typeof data.description === 'string' ? data.description : '',
      bodyBytes: body.length,
      modelInvocable: !isTruthy(data['disable-model-invocation']),
      userInvocable: !isFalsey(data['user-invocable']),
      tier: meta.tier || 'unknown',
    });
  }
  return out;
}

/** Markdown agent files with frontmatter (Claude, Copilot trees). */
function collectAgentDir(rel, suffix = '.md') {
  const out = [];
  for (const f of listDir(rel)) {
    if (!f.endsWith(suffix)) continue;
    const text = read(rel + '/' + f);
    if (!text) continue;
    const { data, body } = parseFrontmatter(text);
    if (!data.name && !data.description) continue;
    out.push({
      name: data.name || f.slice(0, -suffix.length),
      rel: rel + '/' + f,
      description: typeof data.description === 'string' ? data.description : '',
      bodyBytes: body.length,
    });
  }
  return out;
}

/** SKILL.md trees (Gemini extension, Codex packs, .github/skills). */
function collectSkillTree(rel) {
  const out = [];
  for (const entry of listDir(rel)) {
    const text = read(rel + '/' + entry + '/SKILL.md');
    if (!text) continue;
    const { data, body } = parseFrontmatter(text);
    out.push({
      name: data.name || entry,
      rel: rel + '/' + entry + '/SKILL.md',
      description: typeof data.description === 'string' ? data.description : '',
      bodyBytes: body.length,
    });
  }
  return out;
}

/** Codex role TOML files. */
function collectTomlAgents(rel) {
  const out = [];
  for (const f of listDir(rel)) {
    if (!f.endsWith('.toml')) continue;
    const text = read(rel + '/' + f);
    if (!text) continue;
    const name = (text.match(/^name\s*=\s*"(.*)"/m) || [])[1] || f.slice(0, -5);
    const description = (text.match(/^description\s*=\s*"(.*)"/m) || [])[1] || '';
    out.push({ name, rel: rel + '/' + f, description, bodyBytes: text.length });
  }
  return out;
}

function commandCatalog(rel) {
  return listDir(rel)
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({ name: '/' + f.slice(0, -3), description: '' }));
}

/**
 * Text the enforcement hooks inject into the model's context. Counted because
 * it is always-on cost that never shows up in a file listing.
 *
 * The current guard exports the exact strings it injects, so they are read
 * rather than guessed. Legacy hooks are scanned for their longest string
 * literal, which over-reports but is the only handle those scripts offer; the
 * estimate errs upward there on purpose, so the saving from replacing them is
 * never overstated.
 */
async function collectHookInjections() {
  const guard = 'hooks/guard.mjs';
  if (exists(guard)) {
    try {
      const mod = await import(pathToFileURL(path.join(ROOT, guard)).href);
      // Only the reminder is injected on a normal turn. The refusal appears
      // once, if an edit is actually blocked.
      return { rel: guard, tokens: estimateTokens(mod.REMINDER || '') };
    } catch {
      /* fall through to the literal scan */
    }
  }

  const legacy = [
    'claude-code-plugin/scripts/a11y-team-eval.sh',
    'codex-plugin/hooks/a11y-codex-dispatch-guard.mjs',
    '.github/hooks/scripts/detect-web-project.py',
    '.gemini/extensions/a11y-agents/hooks/detect-web-project.py',
  ];
  let worst = { rel: null, tokens: 0 };
  for (const rel of [guard, ...legacy]) {
    const text = read(rel);
    if (!text) continue;
    let longest = '';
    for (const m of text.matchAll(/(["'`])((?:\\.|(?!\1)[\s\S]){120,}?)\1/g)) {
      if (m[2].length > longest.length) longest = m[2];
    }
    const tokens = estimateTokens(longest);
    if (tokens > worst.tokens) worst = { rel, tokens };
  }
  return worst;
}

// ------------------------------------------------------------- client model

function addContext(parts, rel, onlyIfNotImporting) {
  const raw = read(rel);
  if (raw == null) return;
  if (onlyIfNotImporting) {
    const re = new RegExp('^@' + onlyIfNotImporting.replace('.', '\\.') + '[ \\t]*$', 'm');
    if (re.test(raw)) return;
  }
  parts.push({ item: rel, tokens: estimateTokens(raw) });
}

function addCatalog(parts, label, entries) {
  if (!entries.length) return;
  const text = entries.map((e) => catalogCost(e.name, e.description)).join('\n');
  parts.push({ item: label + ' (' + entries.length + ')', tokens: estimateTokens(text), chars: text.length });
}

/**
 * Codex decides catalog membership from `agents/openai.yaml`, not from the
 * frontmatter fields Claude Code and VS Code read. A skill is listed unless its
 * policy sets allow_implicit_invocation to false; a skill with no file at all
 * is listed. A live probe with `codex debug prompt-input` established this: 29
 * reference skills that lacked the file went straight into the model prompt,
 * and the 73 that carried it stayed out.
 */
function codexCatalogVisible(skill) {
  const yaml = read('skills/' + skill.dir + '/agents/openai.yaml');
  if (yaml == null) return true;
  return !/allow_implicit_invocation:\s*false/.test(yaml);
}

function buildCurrent(pkg, contextFiles, catalogIncludesUserOnly) {
  const parts = [];
  for (const f of contextFiles) {
    if (!exists(f)) continue;
    const raw = read(f);
    // CLAUDE.md belongs to `current` only once it is a pointer at AGENTS.md.
    // Until then the legacy column owns it, so it is never counted twice.
    if (f === 'CLAUDE.md' && contextFiles.includes('AGENTS.md')) {
      if (!/^@AGENTS\.md[ \t]*$/m.test(raw)) continue;
      parts.push({ item: 'CLAUDE.md (pointer)', tokens: estimateTokens(raw.replace(/^@AGENTS\.md[ \t]*$/m, '')) });
      continue;
    }
    parts.push({ item: f, tokens: estimateTokens(resolveImports(raw)) });
  }
  // The third argument is true for Codex, whose catalog rule differs (see
  // codexCatalogVisible). Every other client lists what is model-invocable.
  const visible = pkg.filter((s) => (catalogIncludesUserOnly ? codexCatalogVisible(s) : s.modelInvocable));
  const text = visible.map((s) => catalogCost(s.name, s.description)).join('\n');
  parts.push({
    item: 'skills/ catalog (' + visible.length + ' of ' + pkg.length + ' skills)',
    tokens: estimateTokens(text),
    chars: text.length,
  });
  return parts;
}

const CLIENTS = {
  claude: {
    label: 'Claude Code',
    current: (pkg) => buildCurrent(pkg, ['AGENTS.md', 'CLAUDE.md'], false),
    legacy: () => {
      const parts = [];
      addContext(parts, 'CLAUDE.md', 'AGENTS.md');
      addCatalog(parts, '.claude/agents', collectAgentDir('.claude/agents'));
      addCatalog(parts, 'claude-code-plugin/agents', collectAgentDir('claude-code-plugin/agents'));
      addCatalog(parts, 'claude-code-plugin/commands', commandCatalog('claude-code-plugin/commands'));
      return parts;
    },
  },
  codex: {
    label: 'Codex',
    current: (pkg) => buildCurrent(pkg, ['AGENTS.md'], true),
    legacy: () => {
      const parts = [];
      addCatalog(parts, 'codex-plugin/agents', collectTomlAgents('codex-plugin/agents'));
      addCatalog(parts, 'codex-plugin/skills', collectSkillTree('codex-plugin/skills'));
      addCatalog(parts, 'codex-skills', collectSkillTree('codex-skills'));
      return parts;
    },
  },
  copilot: {
    label: 'Copilot',
    current: (pkg) => buildCurrent(pkg, ['AGENTS.md'], false),
    legacy: () => {
      const parts = [];
      addContext(parts, '.github/copilot-instructions.md');
      addCatalog(parts, '.github/agents', collectAgentDir('.github/agents', '.agent.md'));
      addCatalog(parts, '.github/skills', collectSkillTree('.github/skills'));
      return parts;
    },
  },
  gemini: {
    label: 'Gemini / Antigravity',
    current: (pkg) => buildCurrent(pkg, ['AGENTS.md'], false),
    legacy: () => {
      const parts = [];
      addContext(parts, 'GEMINI.md');
      addCatalog(parts, '.gemini skills', collectSkillTree('.gemini/extensions/a11y-agents/skills'));
      return parts;
    },
  },
};

// ---------------------------------------------------------------- dispatch

/**
 * Router-side cost of dispatching one specialist.
 *
 * Pointer dispatch costs the prompt template. Paste dispatch costs the
 * specialist body twice: once to read it into the router, once to send it on.
 */
function measureDispatch() {
  const legacySpecialists = new Map();
  for (const f of listDir('.claude/specialists')) {
    const text = read('.claude/specialists/' + f);
    if (text) legacySpecialists.set(f.replace(/\.md$/, ''), parseFrontmatter(text).body.length);
  }

  const routers = [];
  for (const f of listDir('.claude/agents')) {
    routers.push({ kind: 'legacy', rel: '.claude/agents/' + f, text: read('.claude/agents/' + f) });
  }
  for (const s of collectPackageSkills()) {
    if (s.tier === 'router') routers.push({ kind: 'package', rel: s.rel, text: read(s.rel) });
  }

  const rows = [];
  for (const r of routers) {
    if (!r.text) continue;
    let worst = 0;
    let why = 'no dispatch found';

    for (const m of r.text.matchAll(/\.claude\/specialists\/([a-z0-9-]+)\.md/g)) {
      const bytes = legacySpecialists.get(m[1]);
      if (bytes == null) continue;
      const cost = estimateTokens(' '.repeat(bytes * 2));
      if (cost > worst) {
        worst = cost;
        why = 'reads and pastes ' + m[1] + ' (' + bytes + ' bytes, counted twice)';
      }
    }

    // A templated path such as `.claude/specialists/<name>.md` costs whatever
    // the largest specialist this router actually names happens to be, not the
    // largest in the repo - a markdown router never dispatches pr-review.
    if (worst === 0 && /\.claude\/specialists\/<[a-z-]+>\.md/.test(r.text)) {
      let biggest = null;
      for (const [name, bytes] of legacySpecialists) {
        const named = new RegExp('(^|[^a-z0-9-])' + name + '([^a-z0-9-]|$)').test(r.text);
        if (named && (!biggest || bytes > biggest[1])) biggest = [name, bytes];
      }
      if (biggest) {
        worst = estimateTokens(' '.repeat(biggest[1] * 2));
        why = 'templated read-and-paste, worst named specialist ' + biggest[0] + ' (' + biggest[1] + ' bytes, counted twice)';
      }
    }

    if (worst === 0) {
      for (const m of r.text.matchAll(/```[\s\S]*?```/g)) {
        if (!/Activate the skill|Return ONLY JSON|Return only JSON/i.test(m[0])) continue;
        const cost = estimateTokens(m[0]);
        if (cost > worst) {
          worst = cost;
          why = 'pointer dispatch prompt';
        }
      }
    }

    rows.push({ router: r.rel, kind: r.kind, tokens: worst, why });
  }
  rows.sort((a, b) => b.tokens - a.tokens);
  return rows;
}

// ------------------------------------------------------------------- report

function sum(parts) {
  return parts.reduce((s, p) => s + p.tokens, 0);
}

function legacyTreeSizes() {
  const trees = [
    '.claude/agents',
    '.claude/specialists',
    'claude-code-plugin/agents',
    'codex-skills',
    'codex-plugin/references/specialists',
    '.gemini/extensions/a11y-agents/skills',
    '.github/agents',
    '.github/prompts',
    'skills',
  ];
  const out = {};
  for (const t of trees) {
    if (!exists(t)) continue;
    let bytes = 0;
    let files = 0;
    const walk = (rel) => {
      for (const e of listDir(rel)) {
        const st = fs.statSync(path.join(ROOT, rel, e));
        if (st.isDirectory()) walk(rel + '/' + e);
        else {
          bytes += st.size;
          files += 1;
        }
      }
    };
    walk(t);
    out[t] = { files, bytes };
  }
  return out;
}

async function build() {
  const pkg = collectPackageSkills();
  const hook = await collectHookInjections();
  const clients = {};

  for (const [key, def] of Object.entries(CLIENTS)) {
    const current = def.current(pkg);
    const legacy = def.legacy();
    clients[key] = {
      label: def.label,
      current,
      legacy,
      hook,
      always_on_current: sum(current) + hook.tokens,
      always_on_legacy: sum(legacy),
      always_on_total: sum(current) + sum(legacy) + hook.tokens,
    };
  }

  const catalogChars = pkg
    .filter((s) => s.modelInvocable)
    .map((s) => catalogCost(s.name, s.description))
    .join('\n').length;
  const codexCatalogChars = pkg
    .filter(codexCatalogVisible)
    .map((s) => catalogCost(s.name, s.description))
    .join('\n').length;
  const dispatch = measureDispatch();
  const sorted = pkg.slice().sort((a, b) => b.bodyBytes - a.bodyBytes);

  return {
    generated: new Date().toISOString().slice(0, 10),
    estimator: 'chars/4',
    package: {
      skills: pkg.length,
      model_invocable: pkg.filter((s) => s.modelInvocable).length,
      routers: pkg.filter((s) => s.tier === 'router').length,
      specialists: pkg.filter((s) => s.tier === 'specialist').length,
      helpers: pkg.filter((s) => s.tier === 'helper').length,
      references: pkg.filter((s) => s.tier === 'reference').length,
      largest_body_bytes: sorted[0] ? sorted[0].bodyBytes : 0,
      largest_body_skill: sorted[0] ? sorted[0].name : null,
      largest_dispatchable_body_bytes: Math.max(
        0,
        ...pkg.filter((s) => s.tier !== 'reference').map((s) => s.bodyBytes),
      ),
      bodies_over_6144: pkg.filter((s) => s.tier !== 'reference' && s.bodyBytes > 6144).length,
      catalog_chars_model_invocable: catalogChars,
      catalog_chars_all: codexCatalogChars,
      codex_catalog_cap_chars: CODEX_CATALOG_CHAR_CAP,
      codex_catalog_within_cap: codexCatalogChars <= CODEX_CATALOG_CHAR_CAP,
    },
    clients,
    dispatch_max_tokens: dispatch.length ? dispatch[0].tokens : 0,
    dispatch,
    legacy_trees: legacyTreeSizes(),
  };
}

function pad(s, n) {
  s = String(s);
  return s.length >= n ? s : s + ' '.repeat(n - s.length);
}

function padLeft(s, n) {
  s = String(s);
  return s.length >= n ? s : ' '.repeat(n - s.length) + s;
}

function printReport(r) {
  console.log('Context cost, ' + r.generated + ' (estimator: ' + r.estimator + ')');
  console.log('');
  console.log(pad('Client', 22) + padLeft('current', 10) + padLeft('legacy', 10) + padLeft('total', 10));
  console.log('-'.repeat(52));
  for (const c of Object.values(r.clients)) {
    console.log(
      pad(c.label, 22) + padLeft(c.always_on_current, 10) + padLeft(c.always_on_legacy, 10) + padLeft(c.always_on_total, 10),
    );
  }
  console.log('');
  console.log('Package');
  console.log(
    '  skills                  ' +
      r.package.skills +
      ' (' +
      r.package.routers +
      ' routers, ' +
      r.package.specialists +
      ' specialists, ' +
      r.package.helpers +
      ' helpers, ' +
      r.package.references +
      ' references)',
  );
  console.log('  model-invocable         ' + r.package.model_invocable);
  console.log(
    '  largest dispatchable    ' + r.package.largest_dispatchable_body_bytes + ' bytes (over 6144: ' + r.package.bodies_over_6144 + ')',
  );
  console.log('  largest of any kind     ' + r.package.largest_body_bytes + ' bytes (' + r.package.largest_body_skill + ')');
  console.log(
    '  skill catalog           ' +
      r.package.catalog_chars_all +
      ' chars of ' +
      r.package.codex_catalog_cap_chars +
      ' Codex cap' +
      (r.package.codex_catalog_within_cap ? ' OK' : ' OVER'),
  );
  console.log('  dispatch worst case     ' + r.dispatch_max_tokens + ' tokens');
  console.log('');
  console.log('Per-client breakdown');
  for (const c of Object.values(r.clients)) {
    console.log('  ' + c.label);
    for (const p of c.current) console.log('    current  ' + padLeft(p.tokens, 7) + '  ' + p.item);
    for (const p of c.legacy) console.log('    legacy   ' + padLeft(p.tokens, 7) + '  ' + p.item);
    if (c.hook.rel) console.log('    hook     ' + padLeft(c.hook.tokens, 7) + '  ' + c.hook.rel);
  }
}

function printDispatch(r) {
  console.log('Router dispatch cost (tokens charged to the router, per specialist)');
  console.log('');
  console.log(pad('router', 50) + padLeft('tokens', 8) + '  why');
  console.log('-'.repeat(110));
  for (const d of r.dispatch) {
    console.log(pad(d.router, 50) + padLeft(d.tokens, 8) + '  ' + d.why);
  }
}

function checkBudgets(r, budgetsPath) {
  const budgets = JSON.parse(fs.readFileSync(path.resolve(ROOT, budgetsPath), 'utf8'));
  const failures = [];
  const notes = [];

  for (const [key, b] of Object.entries(budgets.clients || {})) {
    const c = r.clients[key];
    if (!c) {
      failures.push('unknown client in budgets.json: ' + key);
      continue;
    }
    if (b.always_on_total_max != null && c.always_on_total > b.always_on_total_max) {
      failures.push(c.label + ': always_on_total ' + c.always_on_total + ' exceeds ceiling ' + b.always_on_total_max);
    }
    if (b.always_on_current_target != null) {
      const met = c.always_on_current <= b.always_on_current_target;
      notes.push(
        c.label +
          ': always_on_current ' +
          c.always_on_current +
          ' vs Phase 6 target ' +
          b.always_on_current_target +
          ' ' +
          (met ? 'MET' : 'pending'),
      );
    }
  }

  const p = budgets.package || {};
  if (p.largest_body_bytes_max != null && r.package.largest_dispatchable_body_bytes > p.largest_body_bytes_max) {
    failures.push(
      'largest dispatchable SKILL.md body ' +
        r.package.largest_dispatchable_body_bytes +
        ' exceeds ' +
        p.largest_body_bytes_max,
    );
  }
  if (p.codex_catalog_chars_max != null && r.package.catalog_chars_all > p.codex_catalog_chars_max) {
    failures.push('skill catalog ' + r.package.catalog_chars_all + ' chars exceeds Codex cap ' + p.codex_catalog_chars_max);
  }
  if (p.dispatch_tokens_max != null && r.dispatch_max_tokens > p.dispatch_tokens_max) {
    failures.push('dispatch worst case ' + r.dispatch_max_tokens + ' exceeds ' + p.dispatch_tokens_max);
  }

  for (const n of notes) console.log('note: ' + n);
  if (failures.length) {
    console.error('');
    console.error('Budget check FAILED');
    for (const f of failures) console.error('  - ' + f);
    return 1;
  }
  console.log('');
  console.log('Budget check OK');
  return 0;
}

async function main() {
  const argv = process.argv.slice(2);
  const r = await build();

  if (argv.includes('--json')) {
    console.log(JSON.stringify(r, null, 2));
    return 0;
  }
  const baselineIdx = argv.indexOf('--baseline');
  if (baselineIdx !== -1) {
    const out = path.resolve(ROOT, argv[baselineIdx + 1]);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(r, null, 2) + '\n');
    console.log('Wrote ' + path.relative(ROOT, out).replace(/\\/g, '/'));
    return 0;
  }
  if (argv.includes('--dispatch')) {
    printDispatch(r);
    return 0;
  }
  const checkIdx = argv.indexOf('--check');
  if (checkIdx !== -1) {
    printReport(r);
    return checkBudgets(r, argv[checkIdx + 1] || 'budgets.json');
  }
  printReport(r);
  return 0;
}

main().then((code) => process.exit(code));
