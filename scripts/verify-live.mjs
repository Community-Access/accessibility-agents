#!/usr/bin/env node
/**
 * verify-live.mjs - check the package inside real client sessions.
 *
 * Every other gate reads files. This one loads the package into whichever of
 * the three clients are installed here and measures what each actually puts in
 * front of its model. It proves the two claims no static check can:
 *
 *   1. Exactly the six routers reach the model, on every client.
 *   2. The user can still reach every specialist by name.
 *
 * The first is the entire basis of the cost reduction, and it rests on
 * different mechanisms per client: `disable-model-invocation` for Claude Code
 * and Copilot, `agents/openai.yaml` for Codex. If any client ignored its
 * mechanism, every measurement in this repository would be wrong for that
 * client and nothing offline would notice. That happened once: Codex was
 * listing 29 reference skills that had no policy file, and only this probe
 * caught it.
 *
 * ## How each client is measured
 *
 *   Claude Code   The debug log reports the model-facing skill listing size.
 *                 Run with and without the plugin; the difference is ours. The
 *                 session init event carries the user menu.
 *   Codex         `codex debug prompt-input` renders the model-visible prompt
 *                 as JSON without calling a model. Run with and without
 *                 `.agents/skills` present in a scratch directory.
 *   Copilot       The debug log carries the system prompt, including the
 *                 `<skill>` listing sent to the model.
 *
 * None of these ask the model a question. An earlier version did, and the
 * answer depended on the model and on whichever hook replied first.
 *
 * A client that is not installed is skipped and reported as skipped, which
 * is not the same as passing.
 *
 * Usage:
 *   node scripts/verify-live.mjs
 *   node scripts/verify-live.mjs --json
 *   node scripts/verify-live.mjs --only claude,codex
 *
 * Exit codes: 0 every installed client verified, 1 a claim failed, 2 no client
 * could be run at all.
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const WIN = process.platform === 'win32';

const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const onlyIdx = argv.indexOf('--only');
const only = onlyIdx === -1 ? null : new Set(argv[onlyIdx + 1].split(','));
const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';
const PLUGIN_NAME = 'accessibility-agents';

// ------------------------------------------------------------- the package

function readPackage() {
  const routers = [];
  const userInvocable = [];
  const hidden = [];
  const codexHidden = [];

  for (const dir of fs.readdirSync(path.join(ROOT, 'skills')).sort()) {
    const file = path.join(ROOT, 'skills', dir, 'SKILL.md');
    if (!fs.existsSync(file)) continue;
    const head = fs.readFileSync(file, 'utf8').split('\n---')[0];
    const modelInvocable = !/^disable-model-invocation:\s*true\s*$/m.test(head);
    const userVisible = !/^user-invocable:\s*false\s*$/m.test(head);

    if (modelInvocable) routers.push(dir);
    if (userVisible) userInvocable.push(dir);
    else hidden.push(dir);

    const yaml = path.join(ROOT, 'skills', dir, 'agents', 'openai.yaml');
    if (fs.existsSync(yaml) && /allow_implicit_invocation:\s*false/.test(fs.readFileSync(yaml, 'utf8'))) {
      codexHidden.push(dir);
    }
  }
  return { routers, userInvocable, hidden, codexHidden, all: [...userInvocable, ...hidden].sort() };
}

function has(cmd) {
  const r = spawnSync(WIN ? 'where' : 'which', [cmd], { encoding: 'utf8' });
  return r.status === 0;
}

/**
 * On Windows the CLIs are .cmd shims and need a shell, but a shell splits any
 * argument containing a space. A multi-word prompt then arrives as several
 * positional arguments, and Copilot builds no request at all, which read as
 * "zero skills reach the model" until the real cause was found. Quote what
 * needs quoting.
 */
function run(cmd, args, opts = {}) {
  const safe = WIN ? args.map((a) => (/[\s"]/.test(a) ? '"' + a.replace(/"/g, '\\"') + '"' : a)) : args;
  return spawnSync(cmd, safe, { encoding: 'utf8', timeout: 240000, shell: WIN, ...opts });
}

const pkg = readPackage();
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'a11y-live-'));
const results = {};

// ------------------------------------------------------------------ Claude

function probeClaude() {
  if (!has('claude')) return { skipped: 'claude is not on PATH' };

  const session = (withPlugin) => {
    const log = path.join(scratch, 'claude-' + (withPlugin ? 'with' : 'without') + '.log');
    const args = ['--print', '--model', CLAUDE_MODEL, '--debug', '--debug-file', log];
    if (withPlugin) args.push('--plugin-dir', '.', '--output-format', 'stream-json', '--verbose');
    args.push('Reply with the single word: ok');
    const r = run('claude', args, { cwd: ROOT });
    let debug = '';
    try {
      debug = fs.readFileSync(log, 'utf8');
    } catch {
      /* no log written */
    }
    return { r, debug, stdout: r.stdout || '' };
  };

  const withP = session(true);
  if (withP.r.error || withP.r.status === null) return { error: 'the client did not run' };
  const without = session(false);

  const size = (d) => {
    const m = d.match(/Skill listing[^"]*?(\d+) skills,\s*(\d+) chars/);
    return m ? { skills: Number(m[1]), chars: Number(m[2]) } : null;
  };
  const before = size(without.debug);
  const after = size(withP.debug);

  let menu = null;
  for (const line of withP.stdout.split('\n')) {
    try {
      const e = JSON.parse(line);
      if (e.type === 'system' && Array.isArray(e.skills)) {
        menu = e.skills.map(String).filter((s) => s.startsWith(PLUGIN_NAME + ':')).map((s) => s.split(':')[1]);
        break;
      }
    } catch {
      /* not JSON */
    }
  }

  const out = { client: 'Claude Code', failures: [] };
  if (before && after) {
    out.modelFacing = after.skills - before.skills;
    out.modelFacingChars = after.chars - before.chars;
    out.detail = `without ${before.skills} skills / ${before.chars} chars, with ${after.skills} / ${after.chars}`;
    if (out.modelFacing !== pkg.routers.length) {
      out.failures.push(`the model sees ${out.modelFacing} of our skills, expected ${pkg.routers.length}`);
    }
  } else {
    out.failures.push('the client did not report a model-facing listing size');
  }
  if (menu) {
    const missing = pkg.userInvocable.filter((s) => !menu.includes(s));
    const leaked = pkg.hidden.filter((s) => menu.includes(s));
    out.menu = menu.length;
    if (missing.length) out.failures.push(`${missing.length} user-invocable skills missing from the menu`);
    if (leaked.length) out.failures.push(`${leaked.length} hidden skills present in the menu`);
  }
  return out;
}

// ------------------------------------------------------------------- Codex

function probeCodex() {
  if (!has('codex')) return { skipped: 'codex is not on PATH' };

  const dir = path.join(scratch, 'codex');
  fs.mkdirSync(path.join(dir, '.agents'), { recursive: true });
  run('git', ['init', '-q', '.'], { cwd: dir });

  const render = () => {
    const r = run('codex', ['debug', 'prompt-input', 'ok'], { cwd: dir });
    return r.status === 0 ? r.stdout || '' : null;
  };

  const without = render();
  fs.cpSync(path.join(ROOT, 'skills'), path.join(dir, '.agents', 'skills'), { recursive: true });
  const withP = render();

  const out = { client: 'Codex', failures: [] };
  if (without == null || withP == null) {
    out.failures.push('codex debug prompt-input did not run');
    return out;
  }

  const listed = pkg.all.filter((d) => withP.includes('- ' + d + ':'));
  out.modelFacing = listed.length;
  out.modelFacingChars = withP.length - without.length;
  out.detail = `prompt ${without.length} bytes without, ${withP.length} with`;

  const wrong = listed.filter((d) => !pkg.routers.includes(d));
  const missing = pkg.routers.filter((d) => !listed.includes(d));
  if (wrong.length) out.failures.push(`Codex lists skills it should not: ${wrong.slice(0, 5).join(', ')}${wrong.length > 5 ? '...' : ''}`);
  if (missing.length) out.failures.push(`Codex does not list routers: ${missing.join(', ')}`);

  // The mechanism that hides skills from Codex is the policy file; check the
  // package ships one for everything that must be hidden.
  const unguarded = pkg.all.filter((d) => !pkg.routers.includes(d) && !pkg.codexHidden.includes(d));
  if (unguarded.length) out.failures.push(`${unguarded.length} non-router skills have no Codex policy file`);
  return out;
}

// ----------------------------------------------------------------- Copilot

function probeCopilot() {
  if (!has('copilot')) return { skipped: 'copilot is not on PATH' };

  const dir = path.join(scratch, 'copilot');
  const logs = path.join(dir, 'logs');
  fs.mkdirSync(logs, { recursive: true });

  const r = run(
    'copilot',
    [
      '--plugin-dir',
      ROOT,
      '-p',
      'Reply with the single word: ok',
      '-s',
      '--no-ask-user',
      '--log-level',
      'debug',
      '--log-dir',
      logs,
      '--allow-all-tools',
    ],
    { cwd: dir },
  );

  const out = { client: 'Copilot CLI', failures: [] };
  if (r.error || r.status === null) {
    out.failures.push('the client did not run');
    return out;
  }

  let all = '';
  for (const f of fs.readdirSync(logs)) all += fs.readFileSync(path.join(logs, f), 'utf8');

  // The system prompt lists each skill as <skill><name>...</name>. Count ours.
  const listed = pkg.all.filter((d) => all.includes('<name>' + d + '</name>'));
  out.modelFacing = listed.length;
  out.detail = `${listed.length} <skill> entries from this package in the system prompt`;

  const wrong = listed.filter((d) => !pkg.routers.includes(d));
  const missing = pkg.routers.filter((d) => !listed.includes(d));
  if (wrong.length) out.failures.push(`Copilot lists skills it should not: ${wrong.slice(0, 5).join(', ')}`);
  if (missing.length) out.failures.push(`Copilot does not list routers: ${missing.join(', ')}`);
  return out;
}

// -------------------------------------------------------------------- main

const probes = { claude: probeClaude, codex: probeCodex, copilot: probeCopilot };
for (const [id, probe] of Object.entries(probes)) {
  if (only && !only.has(id)) continue;
  try {
    results[id] = probe();
  } catch (e) {
    results[id] = { client: id, failures: ['probe crashed: ' + e.message] };
  }
}
fs.rmSync(scratch, { recursive: true, force: true });

const ran = Object.values(results).filter((r) => !r.skipped);
const failed = ran.filter((r) => r.failures && r.failures.length);

if (asJson) {
  console.log(JSON.stringify({ package: { routers: pkg.routers.length, total: pkg.all.length }, results }, null, 2));
  process.exit(!ran.length ? 2 : failed.length ? 1 : 0);
}

console.log('Live client verification');
console.log('');
console.log(`  package         ${pkg.all.length} skills, ${pkg.routers.length} routers`);
console.log('');
for (const r of Object.values(results)) {
  if (r.skipped) {
    console.log(`  SKIP  ${r.client || ''}${r.skipped}`);
    continue;
  }
  const status = r.failures.length ? 'FAIL' : 'PASS';
  console.log(`  ${status}  ${r.client.padEnd(12)} model sees ${r.modelFacing} of ${pkg.all.length} skills` + (r.modelFacingChars != null ? `, ${r.modelFacingChars} chars` : ''));
  console.log(`        ${r.detail}`);
  if (r.menu != null) console.log(`        user menu: ${r.menu} of ${pkg.userInvocable.length} user-invocable skills`);
  for (const f of r.failures) console.error(`        - ${f}`);
}
console.log('');

if (!ran.length) {
  console.error('No client could be run. This gate needs claude, codex or copilot on PATH.');
  process.exit(2);
}
if (failed.length) {
  console.error(`${failed.length} of ${ran.length} clients failed.`);
  process.exit(1);
}
console.log(`Verified on ${ran.length} client${ran.length === 1 ? '' : 's'}: exactly the ${pkg.routers.length} routers reach the model; the other ${pkg.all.length - pkg.routers.length} do not.`);
process.exit(0);
