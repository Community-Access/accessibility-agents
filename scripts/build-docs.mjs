#!/usr/bin/env node
/**
 * build-docs.mjs - generate the reference pages that describe the code.
 *
 * Two pages used to be maintained by hand and were wrong within a release:
 * the skills catalog, which listed agents that had been renamed or removed,
 * and the MCP tools table, which never mentioned annotations because the
 * tools had none. Both are now derived from the source they describe, and
 * `--check` fails CI when a committed page differs from what the source says.
 *
 * Generates:
 *   docs/reference/skills/README.md   every skill by tier and domain, from frontmatter
 *   docs/reference/mcp-tools.md       every tool with its annotations, from the running server
 *
 * Usage:
 *   node scripts/build-docs.mjs
 *   node scripts/build-docs.mjs --check
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

// The SDK is a dependency of mcp-server, not of the root. Resolve it from
// there through its exports map; a direct path into node_modules bypasses the
// map and lands on a file that does not exist.
const requireFromServer = createRequire(path.join(ROOT, 'mcp-server', 'package.json'));
const { Client } = await import(pathToFileURL(requireFromServer.resolve('@modelcontextprotocol/sdk/client/index.js')).href);
const { StdioClientTransport } = await import(pathToFileURL(requireFromServer.resolve('@modelcontextprotocol/sdk/client/stdio.js')).href);
const check = process.argv.includes('--check');

// ------------------------------------------------------------------ skills

function frontmatter(file) {
  const text = fs.readFileSync(file, 'utf8');
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const get = (key) => {
    const r = m[1].match(new RegExp('^\\s*' + key + ':\\s*(.*)$', 'm'));
    return r ? r[1].trim().replace(/^"|"$/g, '') : null;
  };
  return {
    name: get('name'),
    description: get('description'),
    tier: get('tier'),
    domain: get('domain'),
    output: get('output'),
    title: get('title'),
    modelInvocable: !/^disable-model-invocation:\s*true\s*$/m.test(m[1]),
    userInvocable: !/^user-invocable:\s*false\s*$/m.test(m[1]),
  };
}

function skillsCatalog() {
  const skills = [];
  for (const dir of fs.readdirSync(path.join(ROOT, 'skills')).sort()) {
    const file = path.join(ROOT, 'skills', dir, 'SKILL.md');
    if (!fs.existsSync(file)) continue;
    const fm = frontmatter(file);
    if (fm) skills.push({ dir, ...fm, hasPage: fs.existsSync(path.join(ROOT, 'docs', 'reference', 'skills', dir + '.md')) });
  }

  const tiers = ['router', 'specialist', 'helper', 'reference'];
  const domains = ['web', 'documents', 'markdown', 'github', 'developer', 'desktop', 'cross-cutting'];
  const byTier = Object.fromEntries(tiers.map((t) => [t, skills.filter((s) => s.tier === t)]));

  const out = [
    '# Skills catalog',
    '',
    'Every skill in the package, by tier and domain. Generated from frontmatter by',
    '`scripts/build-docs.mjs`; do not edit by hand. A skill with a page of its own',
    'links to it.',
    '',
    'The tier decides who can start a skill and what it costs before it is',
    'dispatched. Only routers are visible to the model.',
    '',
    '| Tier | Count | Model invokes | User invokes | Cost until dispatched |',
    '|---|---:|---|---|---|',
    `| Router | ${byTier.router.length} | yes | yes | one description line, every turn |`,
    `| Specialist | ${byTier.specialist.length} | no | by name | nothing |`,
    `| Helper | ${byTier.helper.length} | no | no | nothing |`,
    `| Reference | ${byTier.reference.length} | no | no | nothing |`,
    '',
    `${skills.length} skills in total.`,
    '',
  ];

  const link = (s) => (s.hasPage ? `[\`${s.dir}\`](${s.dir}.md)` : `\`${s.dir}\``);

  out.push('## Routers', '', 'The six entry points. Describe the task and one of these picks it up.', '', '| Skill | Use it for |', '|---|---|');
  for (const s of byTier.router) out.push(`| ${link(s)} | ${s.description} |`);
  out.push('');

  for (const domain of domains) {
    const specialists = byTier.specialist.filter((s) => s.domain === domain);
    const helpers = byTier.helper.filter((s) => s.domain === domain);
    if (!specialists.length && !helpers.length) continue;
    const label = domain.replace(/-/g, ' ');
    out.push(`## ${label[0].toUpperCase() + label.slice(1)}`, '');
    if (specialists.length) {
      out.push(`${specialists.length} specialists, each reviewing one domain and returning findings.`, '', '| Skill | Use it for |', '|---|---|');
      for (const s of specialists) out.push(`| ${link(s)} | ${s.description} |`);
      out.push('');
    }
    if (helpers.length) {
      out.push(`${helpers.length} helpers, dispatched by a router for mechanical work.`, '', '| Skill | Use it for |', '|---|---|');
      for (const s of helpers) out.push(`| ${link(s)} | ${s.description.replace(/^Internal helper: /, '')} |`);
      out.push('');
    }
  }

  out.push('## Reference skills', '', 'Lookup data cited by the skills above: rule tables, URL registries, formulas. Never dispatched.', '', '| Skill | Holds |', '|---|---|');
  for (const s of byTier.reference) out.push(`| \`${s.dir}\` | ${s.description.replace(/^Reference data, not a reviewer\.\s*/, '')} |`);
  out.push('');
  return out.join('\n');
}

// --------------------------------------------------------------- MCP tools

async function mcpTools() {
  const client = new Client({ name: 'build-docs', version: '1.0.0' }, { capabilities: {} });
  await client.connect(new StdioClientTransport({ command: process.execPath, args: [path.join(ROOT, 'mcp-server', 'stdio.js')] }));
  const { tools } = await client.listTools();
  const info = client.getServerVersion();
  await client.close();

  const flag = (t, k) => (t.annotations && t.annotations[k] === true ? 'yes' : 'no');
  const out = [
    '# MCP tools',
    '',
    `The ${tools.length} tools the server exposes, as a connected client sees them.`,
    'Generated by `scripts/build-docs.mjs` from a live listing; do not edit by hand.',
    '',
    `Server: \`${info.name}\` ${info.version}. Transports: Streamable HTTP (\`mcp-server/server.js\`) and stdio (\`mcp-server/stdio.js\`).`,
    '',
    '## Why the annotation columns matter',
    '',
    'A client uses `readOnlyHint` to decide whether it can call a tool without',
    'interrupting the user. Twenty-nine of these tools only read, so a bulk scan',
    'of forty documents no longer asks forty times. `destructiveHint` marks the',
    'tools a client must never auto-approve. `openWorldHint` marks the ones that',
    'load a page or call a service. Every tool declares an output schema, so a',
    'result can be parsed rather than read.',
    '',
    'Each tool, with the hints it declares and its one-sentence purpose.',
    '',
    '| Tool | Read-only | Destructive | Open world | Purpose |',
    '|---|---|---|---|---|',
  ];
  for (const t of tools) {
    out.push(`| \`${t.name}\` | ${flag(t, 'readOnlyHint')} | ${flag(t, 'destructiveHint')} | ${flag(t, 'openWorldHint')} | ${(t.description || '').replace(/\|/g, '\\|')} |`);
  }
  out.push('', 'Reproduce the listing: `npm run probe:mcp`.', '');
  return out.join('\n');
}

// ---------------------------------------------------------------------- main

const pages = [
  ['docs/reference/skills/README.md', skillsCatalog()],
  ['docs/reference/mcp-tools.md', await mcpTools()],
];

const stale = [];
for (const [rel, content] of pages) {
  const abs = path.join(ROOT, rel);
  const current = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8').replace(/\r\n/g, '\n') : null;
  if (current === content) continue;
  if (check) {
    stale.push(rel);
    continue;
  }
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, 'utf8');
  console.log('wrote ' + rel);
}

if (check) {
  if (stale.length) {
    console.error('Generated pages are stale: ' + stale.join(', '));
    console.error('Run: node scripts/build-docs.mjs');
    process.exit(1);
  }
  console.log(`Generated documentation is current (${pages.length} pages).`);
}
process.exit(0);
