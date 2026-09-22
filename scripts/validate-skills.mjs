#!/usr/bin/env node
/**
 * validate-skills.mjs - conformance gate for the standard skills package.
 *
 * Checks the Agent Skills specification (agentskills.io) plus the rules this
 * package adds on top of it: tier discipline, catalog budget, the pointer
 * dispatch contract, and the requirement that no specialist is unreachable.
 *
 * Failures are things that would break a client or lose work. Warnings are
 * things a later phase fixes; they print but do not fail the build, so CI can
 * be green while the migration is still in flight.
 *
 * Usage:
 *   node scripts/validate-skills.mjs
 *   node scripts/validate-skills.mjs --strict          warnings fail too
 *   node scripts/validate-skills.mjs --no-shadow-trees legacy copies must be gone (Phase 6)
 *   node scripts/validate-skills.mjs --json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SKILLS = path.join(ROOT, 'skills');

// agentskills.io specification limits
const MAX_NAME = 64;
const MAX_DESCRIPTION = 1024;
// This package's own limits
const MAX_BODY_BYTES = 6144;
const MAX_ROUTER_DESCRIPTION = 160;
const MAX_OTHER_DESCRIPTION = 120;
const EXPECTED_ROUTERS = 6;
const CODEX_CATALOG_CAP = 8000;
const VALID_TIERS = new Set(['router', 'specialist', 'helper', 'reference']);
const VALID_OUTPUTS = new Set(['report', 'findings', 'guidance', 'artifact', 'none']);
const VALID_EFFORT = new Set(['high', 'medium', 'low']);

/** Legacy trees that still hold a copy of the same agent. Phase 6 deletes them. */
const SHADOW_TREES = [
  (n) => `.claude/agents/${n}.md`,
  (n) => `.claude/specialists/${n}.md`,
  (n) => `claude-code-plugin/agents/${n}.md`,
  (n) => `codex-skills/${n}/SKILL.md`,
  (n) => `codex-plugin/references/specialists/${n}.md`,
  (n) => `.gemini/extensions/a11y-agents/skills/${n}/SKILL.md`,
  (n) => `.github/agents/${n}.agent.md`,
];

const errors = [];
const warnings = [];
const backlog = [];

const fail = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

function readRaw(abs) {
  return fs.readFileSync(abs, 'utf8');
}

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return null;
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
    if (inline === '') {
      const map = {};
      while (i < lines.length && /^\s+\S/.test(lines[i])) {
        const sub = lines[i].match(/^\s+([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/);
        if (sub) map[sub[1]] = unquote(sub[2].trim());
        i += 1;
      }
      data[key] = map;
      continue;
    }
    data[key] = unquote(inline);
  }
  return { data, body: text.slice(m[0].length) };
}

function unquote(v) {
  if (v.length > 1 && ((v[0] === '"' && v.endsWith('"')) || (v[0] === "'" && v.endsWith("'")))) {
    try {
      return v[0] === '"' ? JSON.parse(v) : v.slice(1, -1);
    } catch {
      return v.slice(1, -1);
    }
  }
  return v;
}

// ------------------------------------------------------------------- collect

function collect() {
  if (!fs.existsSync(SKILLS)) {
    fail('skills/', 'directory does not exist');
    return [];
  }
  const out = [];
  for (const dir of fs.readdirSync(SKILLS).sort()) {
    const abs = path.join(SKILLS, dir);
    if (!fs.statSync(abs).isDirectory()) continue;
    const skillFile = path.join(abs, 'SKILL.md');
    if (!fs.existsSync(skillFile)) {
      fail(`skills/${dir}`, 'has no SKILL.md');
      continue;
    }
    const raw = readRaw(skillFile);
    const where = `skills/${dir}/SKILL.md`;

    if (raw.charCodeAt(0) === 0xfeff) fail(where, 'starts with a byte-order mark');

    const parsed = parseFrontmatter(raw.replace(/^\uFEFF/, ''));
    if (!parsed) {
      fail(where, 'has no YAML frontmatter');
      continue;
    }
    out.push({ dir, abs, where, raw, ...parsed });
  }
  return out;
}

// -------------------------------------------------------------------- checks

/**
 * Catch frontmatter that a real YAML parser would reject.
 *
 * This validator's own reader is a forgiving subset, and it silently accepted
 * two descriptions containing a colon followed by a space, which YAML reads as
 * a nested mapping. The agentskills.io reference validator rejected both. A
 * house validator more lenient than the specification's is worse than none, so
 * the specific trap is checked here rather than waiting for the other tool.
 */
function checkYamlSafety(s) {
  const { raw, where } = s;
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return;

  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s+(.*)$/);
    if (!kv) continue;
    const value = kv[2].trim();
    if (!value || /^["'|>]/.test(value)) continue;
    if (/:\s/.test(value)) {
      fail(
        where,
        `frontmatter "${kv[1]}" contains a colon followed by a space and is unquoted; YAML reads that as a nested mapping`,
      );
    }
    if (/^[[{@`*&!%]/.test(value)) {
      fail(where, `frontmatter "${kv[1]}" starts with a YAML indicator character and must be quoted`);
    }
  }
}

function checkSpec(s) {
  const { data, body, where, dir } = s;

  if (!data.name) fail(where, 'frontmatter has no name');
  else {
    if (data.name !== dir) fail(where, `name "${data.name}" must match its directory "${dir}"`);
    if (data.name.length > MAX_NAME) fail(where, `name is ${data.name.length} chars, over the ${MAX_NAME} limit`);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(data.name)) fail(where, `name "${data.name}" is not a lowercase hyphen slug`);
  }

  if (!data.description) fail(where, 'frontmatter has no description');
  else if (data.description.length > MAX_DESCRIPTION) {
    fail(where, `description is ${data.description.length} chars, over the spec limit of ${MAX_DESCRIPTION}`);
  }

  if (!body.trim()) fail(where, 'has an empty body');
}

function checkTier(s) {
  const { data, body, where } = s;
  const meta = data.metadata || {};
  const tier = meta.tier;

  if (!VALID_TIERS.has(tier)) {
    fail(where, `metadata.tier is "${tier || 'missing'}", expected one of ${[...VALID_TIERS].join(', ')}`);
    return;
  }
  if (!VALID_OUTPUTS.has(meta.output)) fail(where, `metadata.output is "${meta.output || 'missing'}"`);
  if (!VALID_EFFORT.has(meta.effort)) fail(where, `metadata.effort is "${meta.effort || 'missing'}"`);
  if (!meta.domain) fail(where, 'metadata.domain is missing');

  const modelInvocable = data['disable-model-invocation'] !== 'true';
  const userInvocable = data['user-invocable'] !== 'false';

  if (tier === 'router') {
    if (!modelInvocable) fail(where, 'a router must stay model-invocable');
    if (data.description && data.description.length > MAX_ROUTER_DESCRIPTION) {
      warn(where, `router description is ${data.description.length} chars, over the ${MAX_ROUTER_DESCRIPTION} house limit`);
    }
  } else {
    if (modelInvocable) {
      fail(where, `a ${tier} must set disable-model-invocation: true so it stays out of the model catalog`);
    }
    // The house limit exists to keep Codex's user-invocable catalog under its
    // two percent cap. Reference skills are in no catalog, so it does not
    // apply to them; only the spec limit does.
    if (tier !== 'reference' && data.description && data.description.length > MAX_OTHER_DESCRIPTION) {
      warn(where, `${tier} description is ${data.description.length} chars, over the ${MAX_OTHER_DESCRIPTION} house limit`);
    }
  }

  if ((tier === 'helper' || tier === 'reference') && userInvocable) {
    fail(where, `a ${tier} must set user-invocable: false; it is reached by pointer only`);
  }

  // Reference skills are lookup tables. Splitting them would make them slower
  // to use and nothing loads one unless a skill cites it.
  if (tier !== 'reference' && body.length > MAX_BODY_BYTES) {
    fail(where, `body is ${body.length} bytes, over the ${MAX_BODY_BYTES} budget`);
  }
}

function checkCodexInterface(s) {
  const { data, abs, where, dir } = s;
  const tier = (data.metadata || {}).tier;
  if (tier === 'reference') return;

  const yamlPath = path.join(abs, 'agents', 'openai.yaml');
  if (!fs.existsSync(yamlPath)) {
    fail(where, 'has no agents/openai.yaml; Codex needs it to keep non-routers out of implicit invocation');
    return;
  }
  const text = readRaw(yamlPath);
  const wantImplicit = tier === 'router';
  const m = text.match(/allow_implicit_invocation:\s*(true|false)/);
  if (!m) {
    fail(`skills/${dir}/agents/openai.yaml`, 'does not set policy.allow_implicit_invocation');
  } else if ((m[1] === 'true') !== wantImplicit) {
    fail(
      `skills/${dir}/agents/openai.yaml`,
      `allow_implicit_invocation is ${m[1]} but tier is ${tier}; routers are true, everything else false`,
    );
  }
}

/**
 * Six copies of every agent drifted apart, and the commonest artefact is the
 * same block pasted twice. A repeated heading is the visible symptom, and it
 * also breaks heading navigation for anyone reading the file with a screen
 * reader. Fence-aware: report templates are full of heading-shaped lines.
 */
function checkHeadings(s) {
  const { body, where } = s;
  // Reference skills are lookup data copied verbatim from existing documents.
  // Parallel sections repeat there by design, one per framework or platform.
  const flagRepeats = (s.data.metadata || {}).tier !== 'reference';
  const seen = new Map();
  let fence = null;
  let lineNo = 0;

  for (const line of body.split('\n')) {
    lineNo += 1;
    const fenceMatch = line.match(/^\s{0,3}(```+|~~~+)/);
    if (fenceMatch) {
      const marker = fenceMatch[1][0].repeat(3);
      if (!fence) fence = marker;
      else if (marker === fence) fence = null;
      continue;
    }
    if (fence) continue;

    if (/^# \S/.test(line)) {
      fail(where, `line ${lineNo}: body has an H1; the skill name is the title, so start at H2`);
      continue;
    }
    const h = line.match(/^(#{2,6})\s+(.*\S)\s*$/);
    if (!h) continue;
    const key = h[1].length + ' ' + h[2].toLowerCase();
    if (seen.has(key)) {
      if (flagRepeats) {
        warn(where, `line ${lineNo}: heading "${h[2]}" repeats line ${seen.get(key)}; likely a duplicated block`);
      }
    } else {
      seen.set(key, lineNo);
    }
  }
}

function checkReferences(s) {
  const { body, abs, where, dir } = s;
  for (const m of body.matchAll(/`references\/([a-z0-9._-]+\.md)`/g)) {
    const target = path.join(abs, 'references', m[1]);
    if (!fs.existsSync(target)) fail(where, `cites references/${m[1]} which does not exist`);
  }
  const refDir = path.join(abs, 'references');
  if (!fs.existsSync(refDir)) return;
  for (const f of fs.readdirSync(refDir)) {
    if (!f.endsWith('.md')) continue;
    if (!body.includes('`references/' + f + '`')) {
      warn(`skills/${dir}/references/${f}`, 'is not cited by SKILL.md, so nothing will ever open it');
    }
  }
}

function checkLinks(all) {
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir)) {
      const p = path.join(dir, e);
      if (fs.statSync(p).isDirectory()) {
        walk(p);
        continue;
      }
      if (!p.endsWith('.md')) continue;
      // Strip fenced blocks and inline code first: a path inside backticks is
      // an example of a link, not a link.
      const text = readRaw(p).replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
      const where = path.relative(ROOT, p).replace(/\\/g, '/');
      for (const m of text.matchAll(/\]\((\.\.?\/[^)\s#]+)/g)) {
        const target = path.resolve(path.dirname(p), m[1]);
        if (!fs.existsSync(target)) warn(where, `relative link does not resolve: ${m[1]}`);
      }
    }
  };
  walk(SKILLS);
}

/**
 * Specialists and helpers are invisible to the model on purpose. If no router
 * names one, it is unreachable - the failure mode this design has to guard.
 */
function checkReachability(all) {
  const routers = all.filter((s) => (s.metadata_tier || (s.data.metadata || {}).tier) === 'router');
  let routerText = '';
  for (const r of routers) {
    routerText += r.raw;
    const refDir = path.join(r.abs, 'references');
    if (!fs.existsSync(refDir)) continue;
    for (const f of fs.readdirSync(refDir)) routerText += readRaw(path.join(refDir, f));
  }

  for (const s of all) {
    const tier = (s.data.metadata || {}).tier;
    if (tier !== 'specialist' && tier !== 'helper') continue;
    const named = new RegExp('(^|[^a-z0-9-])' + s.dir + '([^a-z0-9-]|$)').test(routerText);
    if (!named) {
      warn(`skills/${s.dir}`, 'is named by no router, so nothing can dispatch it');
    }
  }
}

/**
 * The pointer dispatch contract, enforced.
 *
 * A router that reads a specialist's body into its own context and pastes it
 * into a prompt pays for that body twice, which is the single largest cost this
 * package was restructured to remove. Every router must carry the pointer
 * prompt, and no skill may cite a legacy tree path.
 */
function checkDispatchContract(all) {
  for (const s of all) {
    const tier = (s.data.metadata || {}).tier;

    for (const legacy of ['.claude/specialists/', '.claude/agents/', 'codex-skills/', 'claude-code-plugin/agents/']) {
      if (s.raw.includes(legacy)) {
        fail(s.where, `cites the legacy path "${legacy}"; dispatch by skill name instead`);
      }
    }

    if (tier !== 'router') continue;

    if (!/Activate the skill/i.test(s.raw)) {
      fail(s.where, 'has no pointer dispatch prompt; a router must dispatch by name, not by pasted body');
    }
    if (!/references\/dispatch-matrix\.md/.test(s.raw)) {
      fail(s.where, 'does not cite references/dispatch-matrix.md, so its specialists are unreachable');
    }
    if (/Read\s*\(\s*["'][^"']*specialists/i.test(s.raw)) {
      fail(s.where, 'reads a specialist file into its own context; dispatch by pointer instead');
    }
  }
}

function checkCatalog(all) {
  const visible = all.filter((s) => {
    const modelInvocable = s.data['disable-model-invocation'] !== 'true';
    const userInvocable = s.data['user-invocable'] !== 'false';
    return modelInvocable || userInvocable;
  });
  const chars = visible.map((s) => `${s.data.name}: ${s.data.description}`).join('\n').length;
  if (chars > CODEX_CATALOG_CAP) {
    fail('skills/', `catalog is ${chars} chars across ${visible.length} entries, over the Codex cap of ${CODEX_CATALOG_CAP}`);
  }
  return { chars, entries: visible.length };
}

function checkRouterCount(all) {
  const routers = all.filter((s) => (s.data.metadata || {}).tier === 'router');
  if (routers.length !== EXPECTED_ROUTERS) {
    fail('skills/', `${routers.length} routers, expected ${EXPECTED_ROUTERS}: ${routers.map((r) => r.dir).join(', ')}`);
  }
  return routers.length;
}

function checkShadowTrees(all, strictShadow) {
  let shadows = 0;
  for (const s of all) {
    for (const f of SHADOW_TREES) {
      const rel = f(s.dir.replace(/^kb-/, ''));
      if (fs.existsSync(path.join(ROOT, rel))) shadows += 1;
    }
  }
  if (!shadows) return 0;
  const msg = `${shadows} legacy copies of migrated skills still exist (Phase 6 removes them)`;
  if (strictShadow) fail('repository', msg);
  else backlog.push(`repository: ${msg}`);
  return shadows;
}

function checkManifests() {
  for (const rel of ['plugin.json', 'mcp.json', '.claude-plugin/plugin.json', '.codex-plugin/plugin.json']) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) {
      fail(rel, 'is missing');
      continue;
    }
    let json;
    try {
      json = JSON.parse(readRaw(abs));
    } catch (e) {
      fail(rel, `is not valid JSON: ${e.message}`);
      continue;
    }
    if (rel !== 'mcp.json') {
      if (!json.name) fail(rel, 'has no name');
      if (!json.version) fail(rel, 'has no version');
      if (!json.description) fail(rel, 'has no description');
    }
  }

  const agentsMd = path.join(ROOT, 'AGENTS.md');
  if (!fs.existsSync(agentsMd)) fail('AGENTS.md', 'is missing');
  else {
    const bytes = fs.statSync(agentsMd).size;
    if (bytes > 6000) warn('AGENTS.md', `is ${bytes} bytes; the always-on contract should stay near 4,800`);
  }

  const claudeMd = path.join(ROOT, 'CLAUDE.md');
  if (fs.existsSync(claudeMd) && !/^@AGENTS\.md\s*$/m.test(readRaw(claudeMd))) {
    warn('CLAUDE.md', 'does not import AGENTS.md, so Claude Code loads a second copy of the contract');
  }
}

// ---------------------------------------------------------------------- main

function main() {
  const argv = process.argv.slice(2);
  const strict = argv.includes('--strict');
  const strictShadow = argv.includes('--no-shadow-trees');

  const all = collect();
  for (const s of all) {
    checkYamlSafety(s);
    checkSpec(s);
    checkTier(s);
    checkCodexInterface(s);
    checkHeadings(s);
    checkReferences(s);
  }
  const routers = checkRouterCount(all);
  const catalog = checkCatalog(all);
  checkReachability(all);
  checkDispatchContract(all);
  checkLinks(all);
  const shadows = checkShadowTrees(all, strictShadow);
  checkManifests();

  const byTier = {};
  for (const s of all) {
    const t = (s.data.metadata || {}).tier || 'unknown';
    byTier[t] = (byTier[t] || 0) + 1;
  }

  if (argv.includes('--json')) {
    console.log(JSON.stringify({ skills: all.length, byTier, catalog, errors, warnings, backlog }, null, 2));
    return errors.length || (strict && warnings.length) ? 1 : 0;
  }

  console.log(`Validated ${all.length} skills: ` + Object.entries(byTier).map(([k, v]) => `${v} ${k}`).join(', '));
  console.log(`Catalog: ${catalog.entries} entries, ${catalog.chars} chars of ${CODEX_CATALOG_CAP} Codex cap`);
  console.log('');

  if (errors.length) {
    console.error(`Errors (${errors.length})`);
    for (const e of errors) console.error('  - ' + e);
    console.error('');
  }
  if (warnings.length) {
    console.log(`Warnings (${warnings.length})`);
    for (const w of warnings.slice(0, 40)) console.log('  - ' + w);
    if (warnings.length > 40) console.log(`  ... and ${warnings.length - 40} more`);
    console.log('');
  }
  if (backlog.length) {
    console.log(`Phase 2 and Phase 6 backlog (${backlog.length}, not failures)`);
    for (const b of backlog) console.log('  - ' + b);
    console.log('');
  }

  const bad = errors.length || (strict && warnings.length);
  console.log(bad ? 'validate-skills FAILED' : 'validate-skills OK');
  return bad ? 1 : 0;
}

process.exit(main());
