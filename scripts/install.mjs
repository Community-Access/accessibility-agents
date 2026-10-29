#!/usr/bin/env node
/**
 * install.mjs - install Accessibility Agents for every client.
 *
 * It replaces two installers totalling 200 KB of shell and PowerShell, which
 * existed because six clients each needed a different directory of a different
 * file format. They now all read the same one.
 *
 * ## What it does
 *
 * Copies `skills/` to `~/.agents/skills`, the personal skills location read by
 * Codex, the Copilot CLI, VS Code and Gemini CLI, and registers the hook
 * manifest for whichever clients are present. Claude Code and Antigravity do
 * not read that location: Claude Code installs the package as a plugin, which
 * this prints instructions for, and Antigravity gets its own copy.
 *
 * Run it with `npm run setup`, or directly. It is deliberately not npm's
 * `install` lifecycle script: that ran it, for real, on every `npm install`
 * and `npm ci`, before anyone could pass --dry-run.
 *
 * ## What it will not do
 *
 * Overwrite a skill you have edited, without being told to. Touch a client that
 * is not installed. Write outside the home directory. Every action is printed
 * before it happens, and `--dry-run` prints them without doing them.
 *
 * Usage:
 *   node scripts/install.mjs --dry-run
 *   node scripts/install.mjs
 *   node scripts/install.mjs --clients codex,gemini
 *   node scripts/install.mjs --uninstall
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const HOME = os.homedir();

const argv = process.argv.slice(2);
const help = argv.includes('--help') || argv.includes('-h');
const dryRun = argv.includes('--dry-run');
const uninstall = argv.includes('--uninstall');
const force = argv.includes('--force');

/**
 * The shared personal skills location. Codex, the Copilot CLI, VS Code and
 * Gemini CLI all read it, which is the whole reason this installer is short.
 * Sources: learn.chatgpt.com/docs/build-skills, docs.github.com (Copilot CLI
 * create-skills), code.visualstudio.com/docs/agent-customization/agent-skills,
 * geminicli.com/docs/cli/skills.
 */
const SHARED_SKILLS = path.join(HOME, '.agents', 'skills');

/**
 * Clients that need a hook manifest placed somewhere specific. A client is
 * only touched when its configuration directory already exists: installing
 * into a client the user does not have is how the old installer created
 * directories nobody asked for.
 */
const CLIENTS = [
  {
    id: 'claude',
    name: 'Claude Code',
    detect: () => path.join(HOME, '.claude'),
    // No hook file is written: Claude Code does not read ~/.agents/skills, so
    // gate hooks merged into settings.json on their own would refuse every UI
    // edit in a session where accessibility-lead cannot load. Older versions
    // wrote this file; --uninstall still removes it.
    hooks: null,
    legacyHooks: [path.join(HOME, '.claude', 'a11y-hooks.json'), path.join(HOME, '.claude', 'a11y-hooks.a11y.json')],
    note:
      'Claude Code does not read ~/.agents/skills. Install the plugin (below),\n' +
      '    or start Claude Code with --plugin-dir pointing at this checkout: either\n' +
      '    loads the skills, the hooks and the MCP server together.',
  },
  {
    id: 'codex',
    name: 'Codex',
    detect: () => path.join(HOME, '.codex'),
    // ~/.codex/hooks.json is Codex's own file and may hold the user's hooks.
    hooks: { from: 'hooks/codex.hooks.json', to: path.join(HOME, '.codex', 'hooks.json'), shared: true },
    note:
      'Codex reads ~/.agents/skills and ~/.codex/hooks.json directly. If a merge\n' +
      '    file was written above, merge it. For the scanners, register the server:\n' +
      `    codex mcp add accessibility-agents -- node "${path.join(ROOT, 'mcp-server', 'dist', 'stdio.mjs').replace(/\\/g, '/')}"\n` +
      '    (The Codex plugin gives skills and the server but no gate: Codex no\n' +
      '    longer loads plugin hooks. Use this route, not both.)',
  },
  {
    id: 'copilot',
    name: 'Copilot CLI',
    detect: () => path.join(HOME, '.copilot'),
    hooks: null,
    note:
      'The Copilot CLI reads ~/.agents/skills. For the hooks, install the plugin\n' +
      '    (below), or copy hooks/copilot.hooks.json to .github/hooks/ in a\n' +
      '    repository you want gated (the cloud agent reads it from the default\n' +
      '    branch).',
  },
  {
    id: 'gemini',
    name: 'Gemini CLI',
    detect: () => path.join(HOME, '.gemini'),
    hooks: { from: 'hooks/gemini.hooks.json', to: path.join(HOME, '.gemini', 'a11y-hooks.json') },
    note:
      'Gemini reads ~/.agents/skills. Merge ~/.gemini/a11y-hooks.json into\n' +
      '    ~/.gemini/settings.json under "hooks", and add "AGENTS.md" to\n' +
      '    context.fileName so the contract is loaded.',
  },
  {
    id: 'antigravity',
    name: 'Antigravity',
    detect: () => path.join(HOME, '.gemini', 'config'),
    skills: path.join(HOME, '.gemini', 'config', 'skills'),
    // ~/.gemini/config/hooks.json is Antigravity's own global hooks file.
    hooks: { from: 'hooks/antigravity.hooks.json', to: path.join(HOME, '.gemini', 'config', 'hooks.json'), shared: true },
    note:
      'Antigravity reads ~/.gemini/config/skills, not ~/.agents/skills, so the\n' +
      '    skills were copied there too, and its global hooks file gates edits. If\n' +
      '    a merge file was written above, add its a11y-* entries to hooks.json.',
  },
];

// ------------------------------------------------------------------- helpers

const actions = [];

function say(action, detail) {
  actions.push({ action, detail });
  console.log(`  ${action.padEnd(10)} ${detail}`);
}

function copyTree(from, to) {
  if (dryRun) return;
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.cpSync(from, to, { recursive: true });
}

/**
 * A skill the user has edited is theirs. Report it and leave it, unless they
 * asked for --force.
 */
function locallyModified(installed) {
  if (!fs.existsSync(installed)) return [];
  const changed = [];
  for (const dir of fs.readdirSync(installed)) {
    const mine = path.join(ROOT, 'skills', dir, 'SKILL.md');
    const theirs = path.join(installed, dir, 'SKILL.md');
    if (!fs.existsSync(mine) || !fs.existsSync(theirs)) continue;
    if (fs.readFileSync(mine, 'utf8') !== fs.readFileSync(theirs, 'utf8')) changed.push(dir);
  }
  return changed;
}

/**
 * The hook manifest as written for a direct install. The manifests use a
 * plugin-root placeholder; a direct install has no plugin root, so point
 * them at this checkout.
 */
function renderManifest(client) {
  const manifest = fs.readFileSync(path.join(ROOT, client.hooks.from), 'utf8');
  return manifest.replace(/\$\{CLAUDE_PLUGIN_ROOT\}|\$\{PLUGIN_ROOT\}|\$\{extensionPath\}/g, ROOT.replace(/\\/g, '/'));
}

/**
 * Remove this package's a11y-* entries from an Antigravity hooks file the
 * user also uses. Returns false if the file could not be read as JSON.
 */
function removeNamedHooks(file) {
  let json;
  try {
    json = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return false;
  }
  if (!json || typeof json !== 'object' || Array.isArray(json)) return false;
  const ours = Object.keys(json).filter((k) => /^a11y-/.test(k));
  if (!ours.length) return true;
  say('edit', `${file} (removed ${ours.join(', ')}; your other hooks kept)`);
  if (!dryRun) {
    for (const k of ours) delete json[k];
    fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n', 'utf8');
  }
  return true;
}

// ---------------------------------------------------------------- arguments
// Arguments are checked before anything is installed. A typo used to be
// silently ignored, and --help used to run a real install; both now stop with
// a one-line message and a non-zero exit, so a mistaken flag cannot touch the
// home directory. --clients used to crash on a missing value and to answer a
// bad id with "no supported client found"; it now names the problem instead.

const KNOWN_FLAGS = new Set(['--dry-run', '--force', '--uninstall', '--help', '-h']);
const CLIENT_IDS = CLIENTS.map((c) => c.id);

function printUsage() {
  console.log('Usage: node scripts/install.mjs [--dry-run] [--clients <ids>] [--force] [--uninstall]');
  console.log('');
  console.log('  --dry-run        print what would happen, change nothing');
  console.log(`  --clients <ids>  comma-separated subset of: ${CLIENT_IDS.join(', ')}`);
  console.log('  --force          overwrite skills and hook files you have edited');
  console.log('  --uninstall      remove this package\'s skills and hook files');
  console.log('  --help, -h       print this help and exit');
}

if (help) {
  printUsage();
  process.exit(0);
}

let wanted = null;
for (let i = 0; i < argv.length; i += 1) {
  const arg = argv[i];
  if (arg === '--clients') {
    const value = argv[i + 1];
    if (!value || value.startsWith('-')) {
      console.error(`--clients needs a value; valid ids: ${CLIENT_IDS.join(', ')}`);
      process.exit(2);
    }
    i += 1;
    const ids = value.split(',');
    const bad = ids.filter((id) => !CLIENT_IDS.includes(id));
    if (bad.length) {
      console.error(`Unknown client id "${bad[0]}"; valid ids: ${CLIENT_IDS.join(', ')}`);
      process.exit(2);
    }
    wanted = new Set(ids);
    continue;
  }
  if (KNOWN_FLAGS.has(arg)) continue;
  console.error(`Unknown option "${arg}"; run with --help to see the options.`);
  process.exit(2);
}

// --------------------------------------------------------------------- main

console.log(`Accessibility Agents installer${dryRun ? ' (dry run)' : ''}`);
console.log('');

if (uninstall) {
  console.log('Removing:');
  // Remove only the skills this package installed. The skills folders are
  // shared with every other package and with the user's own skills, so
  // deleting the folder itself would take those with it.
  const ours = fs.readdirSync(path.join(ROOT, 'skills'));
  for (const dir of [SHARED_SKILLS, ...CLIENTS.filter((c) => c.skills).map((c) => c.skills)]) {
    const present = ours.filter((name) => fs.existsSync(path.join(dir, name)));
    if (!present.length) continue;
    say('remove', `${present.length} skills from ${dir}`);
    if (!dryRun) for (const name of present) fs.rmSync(path.join(dir, name), { recursive: true, force: true });
  }
  for (const client of CLIENTS) {
    for (const legacy of client.legacyHooks || []) {
      if (!fs.existsSync(legacy)) continue;
      say('remove', legacy);
      if (!dryRun) fs.rmSync(legacy, { force: true });
    }
    if (!client.hooks) continue;
    // The side file written for merging is always ours, and so is a hooks
    // file named for this package. A client's own hooks file (shared) is
    // removed only if it holds exactly what this installer would write.
    const side = client.hooks.to.replace(/\.json$/, '.a11y.json');
    if (fs.existsSync(side)) {
      say('remove', side);
      if (!dryRun) fs.rmSync(side, { force: true });
    }
    if (!fs.existsSync(client.hooks.to)) continue;
    if (!client.hooks.shared || fs.readFileSync(client.hooks.to, 'utf8') === renderManifest(client)) {
      say('remove', client.hooks.to);
      if (!dryRun) fs.rmSync(client.hooks.to, { force: true });
    } else if (client.id === 'antigravity' && removeNamedHooks(client.hooks.to)) {
      // Antigravity names each hook at the top level, so ours can be taken
      // out of the user's file without touching theirs.
    } else {
      say('keep', `${client.hooks.to} (differs from what this installer writes; remove any guard.mjs entries by hand)`);
    }
  }
  console.log('');
  console.log(!actions.length ? 'Nothing was installed.' : dryRun ? 'Dry run: nothing was removed.' : 'Removed. Your own edits under other paths were not touched.');
  process.exit(0);
}

const modified = locallyModified(SHARED_SKILLS);
if (modified.length && !force) {
  console.error(`${modified.length} installed skills differ from this package:`);
  for (const m of modified.slice(0, 10)) console.error('  ' + m);
  if (modified.length > 10) console.error(`  and ${modified.length - 10} more`);
  console.error('');
  console.error('These may be your edits. Re-run with --force to replace them,');
  console.error('or move them aside first.');
  process.exit(1);
}

console.log('Skills:');
say('copy', `skills/ -> ${SHARED_SKILLS}`);
copyTree(path.join(ROOT, 'skills'), SHARED_SKILLS);

const skillCount = fs.readdirSync(path.join(ROOT, 'skills')).length;
console.log(`             ${skillCount} skills, of which 6 are model-invocable routers`);
console.log('');

console.log('Clients:');
let touched = 0;
for (const client of CLIENTS) {
  if (wanted && !wanted.has(client.id)) continue;
  const dir = client.detect();
  if (!fs.existsSync(dir)) {
    console.log(`  skip       ${client.name} (not installed)`);
    continue;
  }
  touched += 1;
  console.log(`  found      ${client.name}`);
  if (client.skills) {
    say('copy', `skills/ -> ${client.skills}`);
    copyTree(path.join(ROOT, 'skills'), client.skills);
  }
  if (client.hooks) {
    // A client's hooks file may already hold the user's own hooks. Overwriting
    // it would silently delete them, so an existing file is never replaced
    // without --force; the manifest is written beside it instead, to merge.
    // A file holding exactly what this installer writes is ours, from an
    // earlier run: replace it rather than asking the user to merge a copy.
    const exists = fs.existsSync(client.hooks.to) && fs.readFileSync(client.hooks.to, 'utf8') !== renderManifest(client);
    const target = exists && !force ? client.hooks.to.replace(/\.json$/, '.a11y.json') : client.hooks.to;

    if (exists && !force) {
      console.log(`  keep       ${client.hooks.to} (yours, not overwritten)`);
    }
    say('write', target);

    if (!dryRun) {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, renderManifest(client), 'utf8');
    }

    if (exists && !force) {
      const what = client.id === 'antigravity' ? 'the a11y-* entries' : 'the "hooks" block';
      console.log(`    Merge ${what} of ${path.basename(target)} into ${path.basename(client.hooks.to)}.`);
    }
  }
  console.log(`    ${client.note}`);
  console.log('');
}

if (!touched) {
  console.log('  No supported client found in your home directory.');
  console.log('  The skills are installed; point your client at ~/.agents/skills.');
  console.log('');
}

console.log('Plugin install, which loads the skills, the hooks and the MCP server:');
console.log('  Claude Code   /plugin marketplace add Community-Access/accessibility-agents');
console.log('                /plugin install accessibility-agents@community-access');
console.log('  Copilot CLI   copilot plugin marketplace add Community-Access/accessibility-agents');
console.log('                copilot plugin install accessibility-agents@community-access');
console.log('  Codex         codex plugin marketplace add Community-Access/accessibility-agents');
console.log('                codex plugin add accessibility-agents@community-access');
console.log('                (skills and MCP server only: Codex does not load plugin hooks)');
console.log('  VS Code       Chat: Install Plugin From Source, with this repository\'s URL');
console.log('');
console.log('The MCP server ships bundled and needs no install. The optional scanners do:');
console.log('  npm install --prefix mcp-server, then npx playwright install chromium there.');
console.log('');
console.log('Verify anything installed here with: npm run verify');
process.exit(0);
