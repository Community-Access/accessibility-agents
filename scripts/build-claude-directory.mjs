#!/usr/bin/env node
/**
 * build-claude-directory.mjs - the edition the Claude plugin directory lists.
 *
 * The Claude plugin directory accepts command hooks, MCP servers that run on
 * the user's computer, and script files only from Verified organizations.
 * Until Community Access is one, the directory lists this edition, built from
 * the same skills:
 *
 *   skills/                         every skill, Markdown, JSON and YAML only
 *   .claude-plugin/plugin.json      the manifest, with the MCP server at its
 *                                   public HTTPS address instead of a local
 *                                   program
 *   .claude-plugin/icon.png         the icon
 *   README.md                       what this edition is, and how to install
 *                                   the full one
 *   PRIVACY.md, LICENSE
 *
 * Left out: the edit-gate hooks, the local MCP server, and the report
 * scripts. The full plugin, with all three, is installed from this
 * repository's own marketplace; README.md says how. A note added to
 * skills/a11y-core/SKILL.md, which every skill reads for its shared rules,
 * tells Claude what this edition lacks and what to do instead.
 *
 * The build fails if any file is outside the types the directory accepts, or
 * starts with #!, or is not UTF-8 text without NUL bytes.
 *
 * Usage:
 *   node scripts/build-claude-directory.mjs [out-dir]   default dist/claude-directory
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'dist', 'claude-directory'));
const REPO = 'https://github.com/Community-Access/accessibility-agents';
export const HOSTED_MCP_URL = 'https://letitglow.app/a11y/mcp';

const TEXT = /\.(md|json|ya?ml|txt)$/i;
const IMAGE = /\.(png|jpe?g|gif|webp|ico)$/i;

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const write = (rel, contents) => {
  const dest = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, contents);
};

// Skills: only the file types the directory accepts.
let skipped = 0;
const copySkills = (dir) => {
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) copySkills(rel);
    else if (TEXT.test(e.name) || IMAGE.test(e.name)) write(rel, fs.readFileSync(path.join(ROOT, rel)));
    else skipped += 1;
  }
};
copySkills('skills');

// The shared rules every skill reads: say what this edition lacks.
const INSTALL_FULL = [
  '```bash',
  'claude plugin marketplace add Community-Access/accessibility-agents',
  'claude plugin install accessibility-agents@community-access',
  '```',
].join('\n');
const EDITION_NOTE = `
## This is the directory edition

This copy of the skills came from the Claude plugin directory. It has no
edit-gate hooks, no local scanners and no report scripts; its MCP server runs
at ${HOSTED_MCP_URL} and offers the checks that work on what you send it:
contrast, color blindness, reading level, guidelines, and heading, link-text
and form-label checks on HTML.

- Where a skill says to run a script under \`a11y-core/scripts/\`, do that step
  yourself by the same rules: score and order findings as
  \`schemas/findings.schema.json\` describes, and write the report in Markdown.
- Where a skill names a tool this server does not list (a file scan, a browser
  scan, veraPDF, GLOW, audit history), say that the full edition does it, and
  review what you can see instead.
- Nothing stops an edit before review in this edition. Review first anyway.

To get the hooks and local scanners, the user can install the full edition:

${INSTALL_FULL}
`;
const corePath = path.join(OUT, 'skills', 'a11y-core', 'SKILL.md');
const core = fs.readFileSync(corePath, 'utf8');
// After the front matter, before the first section.
const frontMatter = /^---\r?\n[\s\S]*?\r?\n---\r?\n/.exec(core);
if (!frontMatter) throw new Error('skills/a11y-core/SKILL.md has no front matter');
const at = frontMatter[0].length;
fs.writeFileSync(corePath, core.slice(0, at) + EDITION_NOTE + core.slice(at));

// Manifest: the full one, with the server at its public address.
const full = JSON.parse(fs.readFileSync(path.join(ROOT, '.claude-plugin', 'plugin.json'), 'utf8'));
const manifest = {
  name: full.name,
  version: full.version,
  description:
    'WCAG 2.2 AA review for web, document, Markdown, desktop and GitHub work: router skills dispatch the accessibility specialist team, with hosted contrast, reading-level and HTML checks.',
  author: full.author,
  license: full.license,
  homepage: full.homepage,
  repository: full.repository,
  privacyPolicyUrl: full.privacyPolicyUrl,
  mcpServers: {
    'accessibility-agents': { type: 'http', url: HOSTED_MCP_URL },
  },
};
write('.claude-plugin/plugin.json', JSON.stringify(manifest, null, 2) + '\n');
write('.claude-plugin/icon.png', fs.readFileSync(path.join(ROOT, '.claude-plugin', 'icon.png')));
write('LICENSE', fs.readFileSync(path.join(ROOT, 'LICENSE')));

// Relative links point into folders this tree leaves out; send them to the
// repository instead.
const absolute = (text) =>
  text.replace(/\]\((?!https?:|mailto:|#)([^)\s]+)\)/g, (_, target) => {
    const clean = target.replace(/^\.\//, '');
    const kind = /\.[a-z0-9]+(#.*)?$/i.test(clean) ? 'blob' : 'tree';
    return `](${REPO}/${kind}/main/${clean})`;
  });
write('PRIVACY.md', absolute(fs.readFileSync(path.join(ROOT, 'PRIVACY.md'), 'utf8')));

write(
  'README.md',
  `# Accessibility Agents (directory edition)

WCAG 2.2 AA review inside Claude. Six router skills hand web, document,
Markdown, desktop and GitHub work to a team of accessibility specialists, each
of which cites the success criterion, the severity and the fix for every issue
it finds.

This is the edition the Claude plugin directory lists. It holds the skills,
and connects to the Accessibility Agents MCP server at
<${HOSTED_MCP_URL}> for checks that work on what you send them: color
contrast (WCAG and APCA), color blindness simulation, reading level,
component guidelines, and heading, link-text and form-label checks on HTML.

## What the hosted server receives

Only the arguments of a check you run: colors, a passage of text, or an HTML
snippet. It reads no files, fetches no addresses, keeps no history and needs
no account. The privacy policy is in [PRIVACY.md](PRIVACY.md).

## The full edition

The full edition adds an edit gate, hooks that stop Claude from changing
user-facing files until the accessibility review has run, and a local MCP
server that scans Office, PDF, ePub and Markdown files and runs axe against
pages on your own computer, so those files never leave it. Install it from
this repository's marketplace:

${INSTALL_FULL}

Source, documentation and issues: <${REPO}>.
`,
);

// Prove the tree is one the directory accepts.
const problems = [];
let files = 0;
const check = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, e.name);
    const rel = path.relative(OUT, abs).replace(/\\/g, '/');
    if (e.isDirectory()) {
      check(abs);
      continue;
    }
    files += 1;
    const isLicense = rel === 'LICENSE';
    if (!TEXT.test(e.name) && !IMAGE.test(e.name) && !isLicense) problems.push(`${rel}: type not accepted`);
    if (IMAGE.test(e.name)) continue;
    const buf = fs.readFileSync(abs);
    if (buf.includes(0)) problems.push(`${rel}: contains a NUL byte`);
    if (buf.subarray(0, 2).toString() === '#!') problems.push(`${rel}: starts with #!`);
    try {
      new TextDecoder('utf-8', { fatal: true }).decode(buf);
    } catch {
      problems.push(`${rel}: not UTF-8`);
    }
    if (buf.length >= 256 * 1024) problems.push(`${rel}: 256 KiB or more`);
  }
};
check(OUT);
if (files > 512) problems.push(`${files} files; the directory holds a plugin with more than 512`);
if (problems.length) {
  for (const p of problems) console.error(p);
  process.exit(1);
}
console.log(
  `Built ${path.relative(ROOT, OUT) || OUT}: ${files} files (${skipped} skill files left out), MCP server ${HOSTED_MCP_URL}.`,
);
