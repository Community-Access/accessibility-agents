#!/usr/bin/env node
/**
 * check-mcp-bundle.mjs - the MCP server a plugin ships can run, and can be read.
 *
 * A plugin install is a copy of the plugin folder with no node_modules. The
 * manifests start mcp-server/dist/stdio.mjs, which only imports
 * mcp-server/stdio.js; the server itself is readable source with no
 * dependencies outside Node. The plugin builds copy the files listed in
 * scripts/mcp-runtime-files.mjs.
 *
 * This proves three things about that list:
 *   - every import in a shipped file resolves to Node, to another shipped
 *     file, to skills/ (shipped beside the server), or to an optional scanner
 *     package that the tool checks for before loading;
 *   - every shipped file is under the plugin directory's 256 KiB limit, past
 *     which a version is held for a person to read;
 *   - the server reads no runtime package from node_modules, so a plugin
 *     install starts the same server the tests ran.
 *
 * Usage:
 *   node scripts/check-mcp-bundle.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { builtinModules } from 'node:module';
import { fileURLToPath } from 'node:url';
import { MCP_RUNTIME_FILES, MCP_OPTIONAL_PACKAGES } from './mcp-runtime-files.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SERVER = path.join(ROOT, 'mcp-server');
const LIMIT = 256 * 1024;

const shipped = [];
for (const rel of MCP_RUNTIME_FILES) {
  const abs = path.join(SERVER, rel);
  if (!fs.existsSync(abs)) {
    console.error(`mcp-server/${rel} is listed in scripts/mcp-runtime-files.mjs but does not exist.`);
    process.exit(1);
  }
  if (fs.statSync(abs).isDirectory()) {
    for (const name of fs.readdirSync(abs, { recursive: true })) {
      const file = path.join(abs, name);
      if (fs.statSync(file).isFile()) shipped.push(file);
    }
  } else {
    shipped.push(abs);
  }
}
const shippedSet = new Set(shipped.map((f) => path.resolve(f)));

const problems = [];
const builtins = new Set(builtinModules);
const IMPORT = /(?:^|[\s;])(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|(?:^|[\s;(])import\s*\(\s*['"]([^'"]+)['"]|(?:^|[\s;])import\s*['"]([^'"]+)['"]/gm;

for (const file of shipped) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const size = fs.statSync(file).size;
  if (size >= LIMIT) problems.push(`${rel} is ${(size / 1024).toFixed(0)} KiB; the plugin directory holds files of 256 KiB or more.`);
  if (!/\.(m?js)$/.test(file)) continue;

  const source = fs.readFileSync(file, 'utf8');
  for (const m of source.matchAll(IMPORT)) {
    const spec = m[1] || m[2] || m[3];
    if (spec.startsWith('node:') || builtins.has(spec)) continue;
    if (MCP_OPTIONAL_PACKAGES.includes(spec)) continue;
    if (spec.startsWith('.')) {
      const target = path.resolve(path.dirname(file), spec);
      const insideSkills = target.startsWith(path.join(ROOT, 'skills') + path.sep);
      if (shippedSet.has(target) || insideSkills) continue;
      problems.push(`${rel} imports ${spec}, which the plugin does not ship.`);
      continue;
    }
    problems.push(`${rel} imports the package ${spec}; a plugin install has no node_modules.`);
  }
}

if (problems.length) {
  for (const p of problems) console.error(p);
  console.error('Fix the server source, or the list in scripts/mcp-runtime-files.mjs.');
  process.exit(1);
}

const total = shipped.reduce((n, f) => n + fs.statSync(f).size, 0);
console.log(
  `MCP server ships as ${shipped.length} readable files (${(total / 1024).toFixed(0)} KiB), each under 256 KiB, with no package dependencies.`,
);
