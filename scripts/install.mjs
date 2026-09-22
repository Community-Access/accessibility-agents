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
 * Copies `skills/` to `~/.agents/skills`, the shared location read natively by
 * Codex, Copilot, Gemini and Antigravity, and registers the hook manifest for
 * whichever clients are present. Claude Code and VS Code install the package as
 * a plugin instead, which this prints instructions for rather than faking.
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
const dryRun = argv.includes('--dry-run');
const uninstall = argv.includes('--uninstall');
const force = argv.includes('--force');
const clientsArg = argv.indexOf('--clients');
const wanted = clientsArg === -1 ? null : new Set(argv[clientsArg + 1].split(','));

/**
 * The shared skills location. Codex, Copilot, Gemini and Antigravity all read
 * it, which is the whole reason this installer is short.
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
    hooks: { from: 'hooks/claude.hooks.json', to: path.join(HOME, '.claude', 'a11y-hooks.json') },
    note:
      'Claude Code reads ~/.agents/skills. For the enforcement hooks, merge\n' +
      '    ~/.claude/a11y-hooks.json into ~/.claude/settings.json under "hooks",\n' +
      '    or install this repository as a plugin, which wires them for you.',
  },
  {
    id: 'codex',
    name: 'Codex',
    detect: () => path.join(HOME, '.codex'),
    hooks: { from: 'hooks/codex.hooks.json', to: path.join(HOME, '.codex', 'hooks.json') },
    note: 'Codex reads ~/.agents/skills and ~/.codex/hooks.json directly. Nothing further to do.',
  },
  {
    id: 'copilot',
    name: 'Copilot CLI',
    detect: () => path.join(HOME, '.copilot'),
    hooks: null,
    note:
      'Copilot reads ~/.agents/skills. Repository hooks live on the default branch\n' +
      '    at .github/hooks/, so copy hooks/copilot.hooks.json there in the repository\n' +
      '    you want gated.',
  },
  {
    id: 'gemini',
    name: 'Gemini CLI or Antigravity',
    detect: () => path.join(HOME, '.gemini'),
    hooks: { from: 'hooks/gemini.hooks.json', to: path.join(HOME, '.gemini', 'a11y-hooks.json') },
    note:
      'Gemini reads ~/.agents/skills. Merge ~/.gemini/a11y-hooks.json into\n' +
      '    ~/.gemini/settings.json under "hooks", and add "AGENTS.md" to\n' +
      '    context.fileName so the contract is loaded.',
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

// --------------------------------------------------------------------- main

console.log(`Accessibility Agents installer${dryRun ? ' (dry run)' : ''}`);
console.log('');

if (uninstall) {
  console.log('Removing:');
  if (fs.existsSync(SHARED_SKILLS)) {
    say('remove', SHARED_SKILLS);
    if (!dryRun) fs.rmSync(SHARED_SKILLS, { recursive: true, force: true });
  }
  for (const client of CLIENTS) {
    if (!client.hooks) continue;
    if (!fs.existsSync(client.hooks.to)) continue;
    say('remove', client.hooks.to);
    if (!dryRun) fs.rmSync(client.hooks.to, { force: true });
  }
  console.log('');
  console.log(actions.length ? 'Removed. Your own edits under other paths were not touched.' : 'Nothing was installed.');
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
  if (client.hooks) {
    // A client's hooks file may already hold the user's own hooks. Overwriting
    // it would silently delete them, so an existing file is never replaced
    // without --force; the manifest is written beside it instead, to merge.
    const exists = fs.existsSync(client.hooks.to);
    const target = exists && !force ? client.hooks.to.replace(/\.json$/, '.a11y.json') : client.hooks.to;

    if (exists && !force) {
      console.log(`  keep       ${client.hooks.to} (yours, not overwritten)`);
    }
    say('write', target);

    if (!dryRun) {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      const manifest = fs.readFileSync(path.join(ROOT, client.hooks.from), 'utf8');
      // The manifests use a plugin-root placeholder. A direct install has no
      // plugin root, so point them at this checkout.
      fs.writeFileSync(
        target,
        manifest.replace(/\$\{CLAUDE_PLUGIN_ROOT\}|\$\{PLUGIN_ROOT\}|\$\{extensionPath\}/g, ROOT.replace(/\\/g, '/')),
        'utf8',
      );
    }

    if (exists && !force) {
      console.log(`    Merge the "hooks" block of ${path.basename(target)} into ${path.basename(client.hooks.to)}.`);
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

console.log('Plugin install, which wires hooks automatically:');
console.log('  Claude Code   /plugin marketplace add Community-Access/accessibility-agents');
console.log('  Copilot       copilot plugin install accessibility-agents');
console.log('  Codex         /plugins, then add this repository');
console.log('');
console.log('Verify anything installed here with: npm run verify');
process.exit(0);
