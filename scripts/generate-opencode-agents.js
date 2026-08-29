#!/usr/bin/env node

/**
 * OpenCode Agent Generator
 *
 * Generates `.opencode/agent/<name>.md` from the two sources that already
 * describe every Accessibility Agents specialist:
 *
 *   - `.claude/agents/*.md` and `.claude/specialists/*.md` supply the full
 *     description and the tool list the agent is trusted with.
 *   - `codex-plugin/agents/*.toml` supplies the platform-neutral operating
 *     instructions that were already written for a non-Claude runtime.
 *
 * OpenCode reads agents as markdown with YAML frontmatter from
 * `~/.config/opencode/agent/` (global) or `.opencode/agent/` (project), so the
 * generated files are the installable payload, not an intermediate format.
 *
 * Usage:
 *   node scripts/generate-opencode-agents.js          # write files
 *   node scripts/generate-opencode-agents.js --check  # fail if out of date
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CLAUDE_AGENTS_DIR = path.join(ROOT, '.claude', 'agents');
const CLAUDE_SPECIALISTS_DIR = path.join(ROOT, '.claude', 'specialists');
const CODEX_AGENTS_DIR = path.join(ROOT, 'codex-plugin', 'agents');
const OUT_DIR = path.join(ROOT, '.opencode', 'agent');

const CHECK_ONLY = process.argv.includes('--check');

// Claude tool name -> OpenCode permission key. Tools with no OpenCode
// equivalent (Task subagent nesting aside) are simply not represented.
const PERMISSION_FOR_TOOL = {
  Write: 'edit',
  Edit: 'edit',
  NotebookEdit: 'edit',
  Bash: 'bash',
  Task: 'task',
  WebFetch: 'webfetch',
  WebSearch: 'websearch',
};

// Permissions we decide on for every agent, in a stable order so regenerating
// produces no incidental diffs.
const MANAGED_PERMISSIONS = ['edit', 'bash', 'task', 'webfetch', 'websearch'];

function readFrontmatter(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { fields: {}, body: raw };

  const fields = {};
  let key = null;
  for (const line of match[1].split(/\r?\n/)) {
    const listItem = line.match(/^\s+-\s+(.*)$/);
    if (listItem && key) {
      fields[key] = fields[key] ? `${fields[key]}, ${listItem[1].trim()}` : listItem[1].trim();
      continue;
    }
    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!pair) continue;
    key = pair[1];
    fields[key] = pair[2].trim();
  }
  return { fields, body: raw.slice(match[0].length) };
}

function unquote(value) {
  if (!value) return '';
  const trimmed = value.trim();
  if (trimmed.length > 1 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1).replace(/\\"/g, '"');
  }
  return trimmed;
}

function readCodexAgent(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const effort = raw.match(/^model_reasoning_effort\s*=\s*"([^"]+)"/m);
  const instructions = raw.match(/^developer_instructions\s*=\s*"""\r?\n([\s\S]*?)\r?\n"""/m);
  return {
    reasoningEffort: effort ? effort[1] : 'medium',
    instructions: instructions ? instructions[1].trim() : '',
  };
}

/**
 * Rewrite the Codex operating instructions for OpenCode.
 *
 * The instructions are already platform-neutral in substance; what changes is
 * the runtime's name and where the specialist reference lands on disk. The
 * installer copies the reference pack to `~/.a11y-agents/references/`, which is
 * the same neutral location the extension registry already uses, so a reader
 * who only installed OpenCode still finds the file the text points at.
 */
function toOpenCodeInstructions(text, name) {
  return text
    .replace(/\bCodex subagent\b/g, 'OpenCode subagent')
    .replace(/\bCodex subagents\b/g, 'OpenCode subagents')
    .replace(/\bCodex custom subagents?\b/g, 'OpenCode subagents')
    .replace(/codex-plugin\/references\/specialists\//g, '~/.a11y-agents/references/specialists/')
    .replace(
      /when it is available in the workspace or installed plugin payload/g,
      'there or under .a11y-agents/references/specialists/ in the workspace',
    )
    .replace(/\bas Codex allows\b/g, 'as OpenCode allows')
    .replace(/\bthe relevant Codex subagents\b/g, 'the relevant OpenCode subagents')
    .replace(/\bCodex\b/g, 'OpenCode')
    .replace(/^You are the .+ OpenCode subagent for Accessibility Agents\./m,
      `You are the ${name} OpenCode subagent for Accessibility Agents.`);
}

function yamlQuote(value) {
  // Descriptions routinely contain colons, quotes and parentheses. Single
  // quoting with doubled single quotes is the one YAML form that survives all
  // of them without escaping anything else.
  return `'${String(value).replace(/'/g, "''")}'`;
}

function buildAgent(name) {
  const claudeFile = fs.existsSync(path.join(CLAUDE_AGENTS_DIR, `${name}.md`))
    ? path.join(CLAUDE_AGENTS_DIR, `${name}.md`)
    : path.join(CLAUDE_SPECIALISTS_DIR, `${name}.md`);

  if (!fs.existsSync(claudeFile)) {
    throw new Error(`No Claude source for OpenCode agent "${name}"`);
  }

  const isPrimary = claudeFile.startsWith(CLAUDE_AGENTS_DIR);
  const { fields } = readFrontmatter(claudeFile);
  const codex = readCodexAgent(path.join(CODEX_AGENTS_DIR, `${name}.toml`));

  const tools = unquote(fields.tools)
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  const granted = new Set(tools.map((t) => PERMISSION_FOR_TOOL[t]).filter(Boolean));

  const lines = ['---'];
  lines.push(`description: ${yamlQuote(unquote(fields.description))}`);
  // Hub agents are entry points a user picks directly; specialists are only
  // ever dispatched by a lead, so they stay out of the primary agent list.
  lines.push(`mode: ${isPrimary ? 'all' : 'subagent'}`);
  lines.push('permission:');
  // Reading the codebase is what every specialist does; nothing here needs to
  // be gated behind a prompt.
  for (const key of ['read', 'grep', 'glob', 'list']) {
    lines.push(`  ${key}: allow`);
  }
  for (const key of MANAGED_PERMISSIONS) {
    lines.push(`  ${key}: ${granted.has(key) ? 'allow' : 'deny'}`);
  }
  lines.push('---');
  lines.push('');
  lines.push(toOpenCodeInstructions(codex.instructions, name));
  lines.push('');
  lines.push(`Reasoning effort for this specialist: ${codex.reasoningEffort}.`);
  lines.push('');

  return lines.join('\n');
}

function main() {
  const names = fs
    .readdirSync(CODEX_AGENTS_DIR)
    .filter((f) => f.endsWith('.toml'))
    .map((f) => f.replace(/\.toml$/, ''))
    .sort();

  if (!CHECK_ONLY) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const stale = [];
  for (const name of names) {
    const content = buildAgent(name);
    const target = path.join(OUT_DIR, `${name}.md`);
    if (CHECK_ONLY) {
      const current = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null;
      if (current !== content) stale.push(name);
    } else {
      fs.writeFileSync(target, content, 'utf8');
    }
  }

  // An agent left behind after a rename would keep being dispatched, so the
  // generated directory is treated as fully owned by this script.
  const existing = fs.existsSync(OUT_DIR)
    ? fs.readdirSync(OUT_DIR).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''))
    : [];
  const orphans = existing.filter((n) => !names.includes(n));
  for (const orphan of orphans) {
    if (CHECK_ONLY) {
      stale.push(`${orphan} (orphan)`);
    } else {
      fs.unlinkSync(path.join(OUT_DIR, `${orphan}.md`));
    }
  }

  if (CHECK_ONLY) {
    if (stale.length > 0) {
      console.error('OpenCode agents are out of date. Run: node scripts/generate-opencode-agents.js');
      for (const name of stale) console.error(`  - ${name}`);
      process.exit(1);
    }
    console.log(`OpenCode agents are up to date (${names.length} agents).`);
    return;
  }

  console.log(`Generated ${names.length} OpenCode agents in .opencode/agent/`);
  if (orphans.length > 0) {
    console.log(`Removed ${orphans.length} orphaned agent file(s).`);
  }
}

main();
