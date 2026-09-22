#!/usr/bin/env node
/**
 * dev-link.mjs - make this checkout discoverable by every client, in place.
 *
 * Claude Code loads the package through `--plugin-dir .`. Codex, Copilot,
 * Gemini and Antigravity do not read a plugin directory; they look for
 * `.agents/skills` in the repository. Committing that directory would mean a
 * second copy of every skill, which is the thing 7.0 removed.
 *
 * So it is a link, created locally and gitignored: a directory junction on
 * Windows (no elevation needed), a symlink elsewhere. Run it once after
 * cloning; every client then reads `skills/` directly, so an edit is live in
 * the next session without an install step.
 *
 * Usage:
 *   node scripts/dev-link.mjs          create .agents/skills -> skills
 *   node scripts/dev-link.mjs --remove
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const TARGET = path.join(ROOT, 'skills');
const LINK_DIR = path.join(ROOT, '.agents');
const LINK = path.join(LINK_DIR, 'skills');

const remove = process.argv.includes('--remove');

function status() {
  try {
    const st = fs.lstatSync(LINK);
    if (st.isSymbolicLink()) return 'symlink';
    // A Windows junction reports as a directory to lstat; detect it by
    // comparing real paths, which resolve through the junction.
    if (st.isDirectory() && fs.realpathSync(LINK) === fs.realpathSync(TARGET)) return 'junction';
    return 'directory';
  } catch {
    return 'absent';
  }
}

const current = status();

if (remove) {
  if (current === 'absent') {
    console.log('.agents/skills is not present.');
    process.exit(0);
  }
  if (current === 'directory') {
    console.error('.agents/skills is a real directory, not a link. Not removing something that may hold your files.');
    process.exit(1);
  }
  fs.rmSync(LINK, { recursive: false, force: true });
  console.log('Removed .agents/skills.');
  process.exit(0);
}

if (current === 'symlink' || current === 'junction') {
  console.log(`.agents/skills already links to skills/ (${current}).`);
  process.exit(0);
}
if (current === 'directory') {
  console.error('.agents/skills exists as a real directory. Move it aside first; this must be a link, not a copy.');
  process.exit(1);
}

fs.mkdirSync(LINK_DIR, { recursive: true });

/**
 * Three attempts, most durable first. A junction needs a local NTFS volume; a
 * directory symlink needs Developer Mode or elevation on Windows; and when
 * neither is available (a network or subst drive, a locked-down machine) the
 * fallback is a copy, which is honest about being one.
 */
let how = null;
for (const type of ['junction', 'dir']) {
  try {
    fs.symlinkSync(TARGET, LINK, type);
    how = status();
    break;
  } catch {
    try {
      fs.rmSync(LINK, { force: true });
    } catch {
      /* nothing to clean */
    }
  }
}

if (!how) {
  fs.cpSync(TARGET, LINK, { recursive: true });
  console.log('Copied skills/ to .agents/skills (this volume allows neither junctions nor symlinks).');
  console.log('');
  console.log('This is a copy, not a link. Re-run this script after editing a skill, or the');
  console.log('other clients will read stale content. Claude Code is unaffected: it reads');
  console.log('skills/ directly through --plugin-dir . and needs no copy.');
  process.exit(0);
}

console.log('Linked .agents/skills -> skills/ (' + how + ').');
console.log('');
console.log('Codex, Copilot, Gemini and Antigravity now read this checkout directly.');
console.log('Claude Code: run with --plugin-dir . or install as a plugin.');
console.log('The link is gitignored; run this again after a fresh clone.');
process.exit(0);
