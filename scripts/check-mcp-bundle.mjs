#!/usr/bin/env node
/**
 * check-mcp-bundle.mjs - the committed MCP server bundle matches its source.
 *
 * A plugin install is a git checkout with no node_modules, so the plugin
 * manifests start mcp-server/dist/stdio.mjs, a single file built by esbuild
 * from mcp-server/stdio.js and everything it imports. The optional scanners
 * (Playwright, axe, pdf-lib) are left out and stay optional.
 *
 * This rebuilds the bundle into a temporary file and compares it byte for
 * byte with the committed one. A difference means someone changed the server
 * without rebuilding: run `npm run build --prefix mcp-server` and commit.
 *
 * Usage:
 *   node scripts/check-mcp-bundle.mjs
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SERVER = path.join(ROOT, 'mcp-server');
const COMMITTED = path.join(SERVER, 'dist', 'stdio.mjs');

const pkg = JSON.parse(fs.readFileSync(path.join(SERVER, 'package.json'), 'utf8'));
const build = pkg.scripts && pkg.scripts.build;
if (!build) {
  console.error('mcp-server/package.json has no build script');
  process.exit(1);
}
if (!fs.existsSync(COMMITTED)) {
  console.error('mcp-server/dist/stdio.mjs is missing. Run: npm run build --prefix mcp-server');
  process.exit(1);
}

const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-bundle-')), 'stdio.mjs');
const cmd = build.replace('--outfile=dist/stdio.mjs', `--outfile=${JSON.stringify(tmp)}`);
const r = spawnSync(cmd, { cwd: SERVER, shell: true, encoding: 'utf8', env: { ...process.env, PATH: `${path.join(SERVER, 'node_modules', '.bin')}${path.delimiter}${process.env.PATH}` } });
if (r.status !== 0) {
  console.error('esbuild failed. Run npm install --prefix mcp-server first.');
  console.error(r.stderr || r.stdout);
  process.exit(1);
}

const a = fs.readFileSync(COMMITTED);
const b = fs.readFileSync(tmp);
if (!a.equals(b)) {
  console.error('mcp-server/dist/stdio.mjs is stale: it does not match a fresh build of the source.');
  console.error('Run: npm run build --prefix mcp-server, then commit the result.');
  process.exit(1);
}
console.log(`MCP server bundle is current (${(a.length / 1024 / 1024).toFixed(2)} MB, built from mcp-server/stdio.js).`);
