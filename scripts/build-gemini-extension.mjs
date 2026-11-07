#!/usr/bin/env node
/**
 * build-gemini-extension.mjs - the package as a Gemini CLI extension.
 *
 * A Gemini extension reads its hooks from hooks/hooks.json, which in this
 * repository is the Claude Code plugin's hook manifest: the two clients use
 * different event names, so one file cannot serve both without each client
 * warning about the other's events. Gemini also installs an extension from a
 * GitHub release archive, with gemini-extension.json at the archive root, so
 * the extension is built here as its own archive and attached to each
 * release (see .github/workflows/release-assets.yml).
 *
 * The archive holds what the extension needs and nothing else: the manifest,
 * AGENTS.md as context, the skills, the guard with Gemini's hook manifest,
 * and the bundled MCP server.
 *
 * Usage:
 *   node scripts/build-gemini-extension.mjs            builds dist/gemini/ and the archive
 *   node scripts/build-gemini-extension.mjs --no-archive
 *   node scripts/build-gemini-extension.mjs --write-root   also refresh ./gemini-extension.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { MCP_RUNTIME_FILES } from './mcp-runtime-files.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'dist', 'gemini');
const ARCHIVE = path.join(ROOT, 'dist', 'accessibility-agents.tar.gz');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const copy = (rel, to = rel) => {
  const dest = path.join(OUT, to);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(path.join(ROOT, rel), dest, { recursive: true });
};

copy('AGENTS.md');
copy('LICENSE');
copy('README.md');
copy('skills');
copy('hooks/guard.mjs');
for (const rel of MCP_RUNTIME_FILES) copy(`mcp-server/${rel}`);
// The server reads its version from mcp-server/package.json.
copy('mcp-server/package.json');

// Gemini's hook manifest, without the comment key: in an extension's
// hooks/hooks.json only the "hooks" object is read.
const hooks = JSON.parse(fs.readFileSync(path.join(ROOT, 'hooks', 'gemini.hooks.json'), 'utf8'));
delete hooks.$comment;
fs.writeFileSync(path.join(OUT, 'hooks', 'hooks.json'), JSON.stringify(hooks, null, 2) + '\n');

const manifest = {
  name: pkg.name,
  version: pkg.version,
  description: 'WCAG 2.2 AA enforcement: router skills, an edit gate for user-facing files, and accessibility scanners.',
  contextFileName: 'AGENTS.md',
  mcpServers: {
    'accessibility-agents': {
      command: 'node',
      args: ['${extensionPath}/mcp-server/dist/stdio.mjs'],
    },
  },
};
fs.writeFileSync(path.join(OUT, 'gemini-extension.json'), JSON.stringify(manifest, null, 2) + '\n');

// The extensions gallery (geminicli.com/extensions) crawls the repository and
// reads gemini-extension.json from its root, so the root carries the same
// manifest. Without it the gallery kept its listing from before 7.0.0. Run
// with --write-root after changing the manifest; a plain build fails if the
// two differ.
const ROOT_MANIFEST = path.join(ROOT, 'gemini-extension.json');
const manifestText = JSON.stringify(manifest, null, 2) + '\n';
if (process.argv.includes('--write-root')) {
  fs.writeFileSync(ROOT_MANIFEST, manifestText);
  console.log('Wrote gemini-extension.json at the repository root.');
} else if (
  !fs.existsSync(ROOT_MANIFEST) ||
  fs.readFileSync(ROOT_MANIFEST, 'utf8').replace(/\r\n/g, '\n') !== manifestText
) {
  console.error('gemini-extension.json at the repository root differs from the built manifest.');
  console.error('Run: node scripts/build-gemini-extension.mjs --write-root --no-archive, then commit it.');
  process.exit(1);
}

if (!process.argv.includes('--no-archive')) {
  fs.rmSync(ARCHIVE, { force: true });
  execFileSync('tar', ['-czf', ARCHIVE, '-C', OUT, '.']);
  console.log(`Wrote ${path.relative(ROOT, ARCHIVE)}`);
}
console.log(`Built ${path.relative(ROOT, OUT)} (${pkg.name} ${pkg.version})`);
