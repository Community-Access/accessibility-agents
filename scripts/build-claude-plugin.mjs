#!/usr/bin/env node
/**
 * build-claude-plugin.mjs - the plugin as its own tree, for Claude and Copilot.
 *
 * The Claude plugin directory installs a plugin by copying its folder, and
 * reads the whole folder when it reviews one. Submitted from the repository
 * root, that folder holds the development tooling too: the root package.json
 * and package-lock.json (which make Claude Code run `npm ci` on install), CI
 * scripts, documentation and over a thousand files, more than the directory
 * inspects. This builds the plugin alone, for the `plugin` branch that the
 * Claude plugin directory and Awesome Copilot follow (see
 * .github/workflows/plugin-branch.yml):
 *
 *   .claude-plugin/plugin.json and icon.png   the Claude Code manifest
 *   plugin.json, mcp.json                     the Agent Plugins manifest
 *                                             (Copilot CLI, VS Code)
 *   com.github.copilot/hooks/hooks.json       Copilot's edit gate
 *   skills/                                   every skill
 *   hooks/hooks.json, hooks/guard.mjs         the edit gate
 *   mcp-server/dist/stdio.mjs                 the bundled MCP server
 *   mcp-server/package.json                   name and version only, which
 *                                             the bundle reads at start-up
 *   README.md, PRIVACY.md, LICENSE            with links made absolute
 *
 * Usage:
 *   node scripts/build-claude-plugin.mjs [out-dir]   default dist/claude-plugin
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'dist', 'claude-plugin'));
const REPO = 'https://github.com/Community-Access/accessibility-agents';

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const copy = (rel) => {
  const dest = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(path.join(ROOT, rel), dest, { recursive: true });
};

copy('.claude-plugin/plugin.json');
copy('.claude-plugin/icon.png');
copy('plugin.json');
copy('mcp.json');
copy('com.github.copilot/hooks/hooks.json');
copy('skills');
copy('hooks/hooks.json');
copy('hooks/guard.mjs');
copy('mcp-server/dist/stdio.mjs');
copy('LICENSE');

const server = JSON.parse(fs.readFileSync(path.join(ROOT, 'mcp-server', 'package.json'), 'utf8'));
fs.writeFileSync(
  path.join(OUT, 'mcp-server', 'package.json'),
  JSON.stringify({ name: server.name, version: server.version, private: true }, null, 2) + '\n',
);

// Relative links point into folders this tree leaves out; send them to the
// repository instead. Anchors and absolute URLs are left alone.
const absolute = (text) =>
  text.replace(/\]\((?!https?:|mailto:|#)([^)\s]+)\)/g, (_, target) => {
    const clean = target.replace(/^\.\//, '');
    const kind = /\.[a-z0-9]+(#.*)?$/i.test(clean) ? 'blob' : 'tree';
    return `](${REPO}/${kind}/main/${clean})`;
  });
for (const doc of ['README.md', 'PRIVACY.md']) {
  fs.writeFileSync(path.join(OUT, doc), absolute(fs.readFileSync(path.join(ROOT, doc), 'utf8')));
}

let files = 0;
const count = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) count(path.join(dir, e.name));
    else files += 1;
  }
};
count(OUT);
console.log(`Built ${path.relative(ROOT, OUT) || OUT}: ${files} files, ${server.name} ${server.version}.`);
