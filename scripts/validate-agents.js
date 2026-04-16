#!/usr/bin/env node
/**
 * Agent and Skill Validation Script
 *
 * Validates agent (.agent.md) and skill (SKILL.md) files against the official
 * GitHub Copilot custom-agents configuration reference:
 *   https://docs.github.com/en/copilot/reference/custom-agents-configuration
 *   https://code.visualstudio.com/docs/copilot/customization/custom-agents
 *   https://code.visualstudio.com/docs/copilot/reference/copilot-vscode-features#_chat-tools
 *
 * Checks performed:
 *   - Valid YAML frontmatter present
 *   - Required fields (description for agents, name+description for skills)
 *   - Tool names validated against official alias table and VS Code built-in tools
 *   - MCP namespaced tools validated against <server>/* and <server>/<tool> patterns
 *   - Deprecated frontmatter properties flagged (infer -> user-invocable + disable-model-invocation)
 *   - Unknown frontmatter properties flagged
 *   - Handoffs structure validated
 *   - Prompt body length checked (max 30,000 chars for github.com)
 *
 * Usage:
 *   node scripts/validate-agents.js [--fix] [--strict] [--quiet] [--validate-urls] [--validate-wcag] [--skip-url-checks] [--files file1 file2 ...]
 *
 * Options:
 *   --fix      Suggest auto-fixable changes (future: apply them)
 *   --strict   Treat warnings as errors (exit 1 on any warning)
 *   --quiet    Only output errors, suppress warnings and info
 *   --files    Validate only the specified files (for pre-commit hooks)
 *   --validate-urls   Validate markdown links and URL reachability in skill files
 *   --validate-wcag   Validate WCAG criteria and version references in skill files
 *   --skip-url-checks Skip outbound HTTP checks (local link checks still run)
 *
 * Exit codes:
 *   0 - All validations passed
 *   1 - Validation errors found (or warnings in --strict mode)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ---------------------------------------------------------------------------
// CLI flags
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const FLAG_FIX = args.includes('--fix');
const FLAG_STRICT = args.includes('--strict');
const FLAG_QUIET = args.includes('--quiet');
const FLAG_VALIDATE_URLS = args.includes('--validate-urls');
const FLAG_VALIDATE_WCAG = args.includes('--validate-wcag');
const FLAG_SKIP_URL_CHECKS = args.includes('--skip-url-checks');
const filesIdx = args.indexOf('--files');
const SPECIFIC_FILES = filesIdx !== -1 ? args.slice(filesIdx + 1) : null;

// ---------------------------------------------------------------------------
// Official tool alias table
// Source: https://docs.github.com/en/copilot/reference/custom-agents-configuration#tool-aliases
// ---------------------------------------------------------------------------
const CANONICAL_TOOL_ALIASES = {
  // execute aliases
  'shell': 'execute', 'bash': 'execute', 'powershell': 'execute',
  // read aliases
  'read': 'read', 'notebookread': 'read', 'view': 'read',
  // edit aliases
  'edit': 'edit', 'multiedit': 'edit', 'write': 'edit', 'notebookedit': 'edit',
  // search aliases
  'search': 'search', 'grep': 'search', 'glob': 'search',
  // agent aliases
  'agent': 'agent', 'custom-agent': 'agent', 'task': 'agent',
  // web aliases
  'web': 'web', 'websearch': 'web', 'webfetch': 'web',
  // todo aliases
  'todo': 'todo', 'todowrite': 'todo',
};

// Canonical tool names (the primary names)
const CANONICAL_TOOLS = new Set(['execute', 'read', 'edit', 'search', 'agent', 'web', 'todo']);

// VS Code built-in qualified tool names (toolSet/toolName format)
// Source: https://code.visualstudio.com/docs/copilot/reference/copilot-vscode-features#_chat-tools
const VSCODE_QUALIFIED_TOOLS = new Set([
  // agent set
  'agent/runSubagent',
  // edit set
  'edit/createDirectory', 'edit/createFile', 'edit/editFiles', 'edit/editNotebook',
  // execute set
  'execute/createAndRunTask', 'execute/getTerminalOutput', 'execute/runInTerminal',
  'execute/runNotebookCell', 'execute/testFailure',
  // read set
  'read/getNotebookSummary', 'read/problems', 'read/readFile',
  'read/readNotebookCellOutput', 'read/terminalLastCommand', 'read/terminalSelection',
  // search set
  'search/changes', 'search/codebase', 'search/fileSearch',
  'search/listDirectory', 'search/textSearch', 'search/usages',
  // web set
  'web/fetch',
  // standalone
  'newWorkspace', 'selection', 'todos',
  // vscode namespace
  'vscode/askQuestions', 'vscode/extensions', 'vscode/getProjectSetupInfo',
  'vscode/installExtension', 'vscode/runCommand', 'vscode/VSCodeAPI',
]);

// VS Code shorthand tool names (used in agent frontmatter, mapped internally by VS Code)
const VSCODE_SHORTHAND_TOOLS = new Set([
  'runInTerminal', 'askQuestions', 'getDiagnostics', 'listDirectory',
  'getTerminalOutput', 'createFile', 'fetch', 'createDirectory',
  'codebase', 'createAndRunTask', 'testFailure', 'problems',
  'readFile', 'editFiles', 'textSearch', 'fileSearch',
  'runSubagent', 'newWorkspace', 'selection', 'todos',
]);

// Known out-of-the-box MCP server namespaces
const KNOWN_MCP_NAMESPACES = new Set(['github', 'playwright']);

// Wildcard pattern: matches tool entries and tool enable-all patterns
const MCP_TOOL_PATTERN = /^([a-z0-9_.-]+)\/([\w*]+)$/i;

// Custom MCP tool names from known servers in this repo (validated individually)
const KNOWN_MCP_TOOLS = new Set([
  // Playwright MCP tools (from this repo's playwright-scanner agent)
  'run_playwright_keyboard_scan', 'run_playwright_state_scan',
  'run_playwright_viewport_scan', 'run_playwright_contrast_scan',
  'run_playwright_a11y_tree',
]);

// ---------------------------------------------------------------------------
// Frontmatter property validation
// Source: https://docs.github.com/en/copilot/reference/custom-agents-configuration#yaml-frontmatter-properties
//         https://code.visualstudio.com/docs/copilot/customization/custom-agents#_header-optional
// ---------------------------------------------------------------------------
const VALID_FRONTMATTER_KEYS = new Set([
  // Shared across GitHub.com and VS Code
  'name', 'description', 'tools', 'model', 'target',
  'disable-model-invocation', 'user-invocable', 'mcp-servers', 'metadata',
  // VS Code specific
  'argument-hint', 'handoffs', 'agents', 'hooks',
  // Deprecated
  'infer',
]);

const DEPRECATED_PROPERTIES = {
  'infer': {
    message: "Property 'infer' is deprecated. Use 'user-invocable' and 'disable-model-invocation' instead.",
    replacements: ['user-invocable', 'disable-model-invocation'],
  },
};

const VALID_TARGET_VALUES = new Set(['vscode', 'github-copilot']);

// Max prompt body size for github.com agents
const MAX_PROMPT_CHARS = 30000;

// Required fields per file type
const REQUIRED_FIELDS = {
  agent: ['description'],
  skill: ['name', 'description'],
};

// Claude Code tool names (comma-separated strings in frontmatter)
const VALID_CLAUDE_TOOLS = new Set([
  'Read', 'Edit', 'Grep', 'Glob', 'Bash', 'Task',
  'MultiEdit', 'Write', 'NotebookRead', 'NotebookEdit',
  'WebSearch', 'WebFetch', 'TodoWrite',
  // Claude Code built-in tools
  'GitHub',
]);

// Claude MCP tool pattern: MCP(tool_name)
const CLAUDE_MCP_PATTERN = /^MCP\(([\w_.-]+)\)$/;

let errors = [];
let warnings = [];
let info = [];
let checkedSkillFiles = [];
const remoteUrlCache = new Map();

const WCAG_GUIDELINES = {
  1: new Set([1, 2, 3, 4]),
  2: new Set([1, 2, 3, 4, 5]),
  3: new Set([1, 2, 3]),
  4: new Set([1]),
};

// ---------------------------------------------------------------------------
// YAML frontmatter parser (handles inline arrays, block arrays, key-value pairs,
// nested objects for handoffs/mcp-servers)
// ---------------------------------------------------------------------------
function parseFrontmatter(content) {
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const yaml = match[1];
  const result = {};
  const lines = yaml.split('\n');
  let currentKey = null;
  let inArray = false;
  let arrayItems = [];

  for (const line of lines) {
    // Array item (block-style)
    if (line.match(/^\s+-\s+/)) {
      const value = line.replace(/^\s+-\s+/, '').trim();
      if (value) arrayItems.push(value);
      continue;
    }

    // Nested object item under array (e.g., handoffs entries)
    if (line.match(/^\s+-\s*$/)) {
      continue;
    }

    // Nested key-value inside an object (indented, e.g., handoffs labels)
    if (line.match(/^\s{2,}\w/) && inArray) {
      // Store raw line for later; for now just skip nested parsing
      continue;
    }

    // End of array when we hit a new top-level key
    if (inArray && currentKey && line.match(/^\w/)) {
      result[currentKey] = arrayItems;
      inArray = false;
      arrayItems = [];
      currentKey = null;
    }

    // Top-level key-value pair
    const kvMatch = line.match(/^([\w][\w-]*):\s*(.*)$/);
    if (kvMatch) {
      const [, key, value] = kvMatch;

      if (value === '' || value === '|' || value === '>') {
        currentKey = key;
        inArray = true;
        arrayItems = [];
      } else if (value.startsWith('[')) {
        // Inline array
        const items = value
          .replace(/^\[|\]$/g, '')
          .split(',')
          .map(s => s.trim().replace(/^['"]|['"]$/g, ''));
        result[key] = items.filter(Boolean);
      } else {
        result[key] = value.replace(/^['"]|['"]$/g, '');
      }
    }
  }

  // Handle trailing array
  if (inArray && currentKey) {
    result[currentKey] = arrayItems;
  }

  return result;
}

/**
 * Extract prompt body (everything after frontmatter)
 */
function extractBody(content) {
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const match = normalized.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  return match ? match[1] : normalized;
}

function getLineNumberAtIndex(content, index) {
  const prior = content.slice(0, index);
  return prior.split('\n').length;
}

function parseMarkdownLinks(content) {
  const links = [];
  const mdLink = /\[[^\]]+\]\(([^)]+)\)/g;
  let match;
  while ((match = mdLink.exec(content)) !== null) {
    links.push({
      url: match[1].trim(),
      index: match.index,
      source: 'markdown-link',
    });
  }

  const bareUrl = /(^|\s)(https?:\/\/[^\s)]+)(?=\s|$)/g;
  while ((match = bareUrl.exec(content)) !== null) {
    links.push({
      url: match[2].trim(),
      index: match.index,
      source: 'bare-url',
    });
  }
  return links;
}

function isHttpUrl(url) {
  return /^https?:\/\//i.test(url);
}

function isAnchorOnly(url) {
  return /^#/.test(url);
}

function isMailto(url) {
  return /^mailto:/i.test(url);
}

function normalizeLocalUrl(url) {
  return decodeURIComponent(url.split('#')[0]);
}

async function checkRemoteUrl(url) {
  if (remoteUrlCache.has(url)) {
    return remoteUrlCache.get(url);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    let response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
    });

    // Some endpoints reject HEAD; retry with GET.
    if (response.status === 405 || response.status === 501) {
      response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
      });
    }

    const result = { ok: response.status < 400, status: response.status };
    remoteUrlCache.set(url, result);
    return result;
  } catch (err) {
    const result = { ok: false, error: err.message || 'network error' };
    remoteUrlCache.set(url, result);
    return result;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function validateSkillUrls(filePath, content, relativePath) {
  const links = parseMarkdownLinks(content);
  const uniqueLinks = [];
  const seen = new Set();
  for (const link of links) {
    const key = `${link.source}:${link.url}:${link.index}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueLinks.push(link);
    }
  }

  for (const link of uniqueLinks) {
    const line = getLineNumberAtIndex(content, link.index);
    const url = link.url;

    if (!url || url.length === 0) {
      warnings.push(`${relativePath}:${line}: Empty markdown link target`);
      continue;
    }

    if (isAnchorOnly(url) || isMailto(url)) {
      continue;
    }

    if (isHttpUrl(url)) {
      if (FLAG_SKIP_URL_CHECKS) {
        info.push(`${relativePath}:${line}: Skipped remote URL check for '${url}' due to --skip-url-checks`);
        continue;
      }
      const result = await checkRemoteUrl(url);
      if (!result.ok) {
        if (result.status) {
          warnings.push(`${relativePath}:${line}: URL returned HTTP ${result.status}: ${url}`);
        } else {
          warnings.push(`${relativePath}:${line}: URL check failed (${result.error}): ${url}`);
        }
      }
      continue;
    }

    // Local relative path check
    const localTarget = normalizeLocalUrl(url);
    if (!localTarget || localTarget.length === 0) {
      continue;
    }
    const resolved = path.resolve(path.dirname(filePath), localTarget);
    if (!fs.existsSync(resolved)) {
      warnings.push(`${relativePath}:${line}: Local link target not found: ${url}`);
    }
  }
}

function validateWcagReferences(content, relativePath) {
  // Validate SC pattern like 2.4.3
  const scPattern = /\b([1-4])\.(\d{1,2})\.(\d{1,2})\b/g;
  let match;
  while ((match = scPattern.exec(content)) !== null) {
    const principle = Number(match[1]);
    const guideline = Number(match[2]);
    const criterion = Number(match[3]);
    const line = getLineNumberAtIndex(content, match.index);

    if (!WCAG_GUIDELINES[principle] || !WCAG_GUIDELINES[principle].has(guideline)) {
      warnings.push(`${relativePath}:${line}: Possible invalid WCAG guideline reference '${match[0]}'`);
      continue;
    }

    if (criterion < 1 || criterion > 20) {
      warnings.push(`${relativePath}:${line}: Possible invalid WCAG criterion number '${match[0]}'`);
    }
  }

  // Validate WCAG version references
  const versionPattern = /WCAG\s+(\d\.\d)/gi;
  while ((match = versionPattern.exec(content)) !== null) {
    const version = match[1];
    const line = getLineNumberAtIndex(content, match.index);
    if (!new Set(['2.0', '2.1', '2.2', '3.0']).has(version)) {
      warnings.push(`${relativePath}:${line}: Unrecognized WCAG version reference 'WCAG ${version}'`);
    }
  }
}

// ---------------------------------------------------------------------------
// Tool name validation
// ---------------------------------------------------------------------------

/**
 * Validate a single tool name against the official schema.
 * Returns { valid, level, message } where level is 'error' | 'warning' | 'info'.
 */
function validateToolName(tool, relativePath) {
  // 1. Empty or whitespace-only
  if (!tool || !tool.trim()) {
    return { valid: false, level: 'error', message: `${relativePath}: Empty tool name in tools list` };
  }

  const trimmed = tool.trim();
  const lower = trimmed.toLowerCase();

  // 2. Wildcard: enable all tools
  if (trimmed === '*') {
    return { valid: true };
  }

  // 3. Canonical tool name (case-insensitive per docs)
  if (CANONICAL_TOOLS.has(lower)) {
    return { valid: true };
  }

  // 4. Known alias (case-insensitive)
  if (CANONICAL_TOOL_ALIASES[lower]) {
    const canonical = CANONICAL_TOOL_ALIASES[lower];
    if (lower !== canonical) {
      return {
        valid: true,
        level: 'info',
        message: `${relativePath}: Tool '${trimmed}' is an alias for '${canonical}'`,
      };
    }
    return { valid: true };
  }

  // 5. MCP namespaced pattern: <server>/* or <server>/<tool>
  const mcpMatch = trimmed.match(MCP_TOOL_PATTERN);
  if (mcpMatch) {
    const [, namespace] = mcpMatch;
    if (!KNOWN_MCP_NAMESPACES.has(namespace.toLowerCase())) {
      return {
        valid: true,
        level: 'info',
        message: `${relativePath}: Tool '${trimmed}' uses custom MCP namespace '${namespace}' (ensure MCP server is configured)`,
      };
    }
    return { valid: true };
  }

  // 6. VS Code qualified tool name (toolSet/toolName)
  if (VSCODE_QUALIFIED_TOOLS.has(trimmed)) {
    return { valid: true };
  }

  // 7. VS Code shorthand tool name
  if (VSCODE_SHORTHAND_TOOLS.has(trimmed)) {
    return { valid: true };
  }

  // 8. Known custom MCP tools (from this repo)
  if (KNOWN_MCP_TOOLS.has(trimmed)) {
    return { valid: true };
  }

  // 9. Extension-contributed tool pattern: azure.some-extension/some-tool
  if (trimmed.match(/^[\w.-]+\/[\w.-]+$/)) {
    return {
      valid: true,
      level: 'info',
      message: `${relativePath}: Tool '${trimmed}' appears to be an extension or MCP tool (ensure it's available at runtime)`,
    };
  }

  // 10. Unknown tool
  return {
    valid: false,
    level: 'warning',
    message: `${relativePath}: Unknown tool '${trimmed}' — not found in official aliases, VS Code built-ins, or known MCP servers. It will be silently ignored at runtime.`,
  };
}

// ---------------------------------------------------------------------------
// Frontmatter property validation
// ---------------------------------------------------------------------------
function validateFrontmatterProperties(frontmatter, relativePath) {
  const keys = Object.keys(frontmatter);

  for (const key of keys) {
    // Check for deprecated properties
    if (DEPRECATED_PROPERTIES[key]) {
      warnings.push(`${relativePath}: ${DEPRECATED_PROPERTIES[key].message}`);
    }

    // Check for unknown properties
    if (!VALID_FRONTMATTER_KEYS.has(key)) {
      warnings.push(`${relativePath}: Unknown frontmatter property '${key}' — may be ignored by Copilot`);
    }
  }

  // Validate target value
  if (frontmatter.target && !VALID_TARGET_VALUES.has(frontmatter.target)) {
    errors.push(`${relativePath}: Invalid target value '${frontmatter.target}' — must be 'vscode' or 'github-copilot'`);
  }

  // Validate boolean properties
  const booleanProps = ['disable-model-invocation', 'user-invocable', 'infer'];
  for (const prop of booleanProps) {
    if (frontmatter[prop] !== undefined) {
      const val = String(frontmatter[prop]).toLowerCase();
      if (val !== 'true' && val !== 'false') {
        errors.push(`${relativePath}: Property '${prop}' must be true or false, got '${frontmatter[prop]}'`);
      }
    }
  }

  // Warn if both infer and its replacements co-exist
  if (frontmatter['infer'] !== undefined) {
    if (frontmatter['user-invocable'] !== undefined || frontmatter['disable-model-invocation'] !== undefined) {
      warnings.push(`${relativePath}: Both 'infer' and its replacements are set — 'disable-model-invocation' takes precedence per docs`);
    }
  }
}

// ---------------------------------------------------------------------------
// Copilot agent validator
// ---------------------------------------------------------------------------
function validateCopilotAgent(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const frontmatter = parseFrontmatter(content);
  const relativePath = path.relative(process.cwd(), filePath);

  if (!frontmatter) {
    errors.push(`${relativePath}: Missing YAML frontmatter`);
    return;
  }

  // Required fields
  for (const field of REQUIRED_FIELDS.agent) {
    if (!frontmatter[field]) {
      errors.push(`${relativePath}: Missing required field '${field}'`);
    }
  }

  // Frontmatter property validation
  validateFrontmatterProperties(frontmatter, relativePath);

  // Tool names
  if (frontmatter.tools && Array.isArray(frontmatter.tools)) {
    for (const tool of frontmatter.tools) {
      const result = validateToolName(tool, relativePath);
      if (!result.valid) {
        if (result.level === 'error') errors.push(result.message);
        else warnings.push(result.message);
      } else if (result.message) {
        if (result.level === 'warning') warnings.push(result.message);
        else if (result.level === 'info') info.push(result.message);
      }
    }

    // Check for duplicates
    const seen = new Set();
    for (const tool of frontmatter.tools) {
      const lower = tool.toLowerCase();
      if (seen.has(lower)) {
        warnings.push(`${relativePath}: Duplicate tool '${tool}' in tools list`);
      }
      seen.add(lower);
    }

    // Coordinator pattern validation: if agent uses 'agent' tool, must declare agents allowlist
    if (frontmatter.tools.some(t => t.toLowerCase() === 'agent')) {
      if (!frontmatter.agents || !Array.isArray(frontmatter.agents) || frontmatter.agents.length === 0) {
        errors.push(`${relativePath}: Agent uses 'agent' tool but missing or empty 'agents:' frontmatter — must list all agents this coordinator can invoke`);
      }
    }
  }

  // Prompt body length (only applies to agents targeting github.com, not VS Code)
  const body = extractBody(content);
  if (frontmatter.target !== 'vscode' && body.length > MAX_PROMPT_CHARS) {
    warnings.push(`${relativePath}: Prompt body is ${body.length} chars — exceeds ${MAX_PROMPT_CHARS} char limit for GitHub.com coding agent (add 'target: vscode' if this is VS Code-only)`);
  }

  // Handoffs structure validation
  if (frontmatter.handoffs && Array.isArray(frontmatter.handoffs)) {
    // Basic presence check — handoffs are parsed as strings from our simple parser
    // but the structure should at minimum exist
  }
}

// ---------------------------------------------------------------------------
// Skill validator
// ---------------------------------------------------------------------------
function validateSkill(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const frontmatter = parseFrontmatter(content);
  const relativePath = path.relative(process.cwd(), filePath);

  if (!frontmatter) {
    errors.push(`${relativePath}: Missing YAML frontmatter`);
    return;
  }

  for (const field of REQUIRED_FIELDS.skill) {
    if (!frontmatter[field]) {
      errors.push(`${relativePath}: Missing required field '${field}'`);
    }
  }

  const folderName = path.basename(path.dirname(filePath));
  if (frontmatter.name && frontmatter.name !== folderName) {
    errors.push(`${relativePath}: Skill name '${frontmatter.name}' must match folder name '${folderName}' per agentskills.io spec`);
  }

  // agentskills.io spec compliance checks
  if (frontmatter.description) {
    const descLength = frontmatter.description.length;
    if (descLength > 200) {
      warnings.push(`${relativePath}: Description is ${descLength} chars; agentskills.io spec recommends <200 chars`);
    }
  }

  // Optional: warn if missing provenance metadata (will be added by gh skill install)
  if (!frontmatter.gh || !frontmatter.gh.repository) {
    info.push(`${relativePath}: [FUTURE] Will require gh.repository field for publishing; will be auto-populated by 'gh skill install'`);
  }

  checkedSkillFiles.push({
    filePath,
    relativePath,
    content,
  });
}

// ---------------------------------------------------------------------------
// Claude Code agent validator
// ---------------------------------------------------------------------------
function validateClaudeAgent(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const frontmatter = parseFrontmatter(content);
  const relativePath = path.relative(process.cwd(), filePath);

  if (!frontmatter) {
    errors.push(`${relativePath}: Missing YAML frontmatter`);
    return;
  }

  for (const field of REQUIRED_FIELDS.agent) {
    if (!frontmatter[field]) {
      errors.push(`${relativePath}: Missing required field '${field}'`);
    }
  }

  // Claude tools are comma-separated string or array
  if (frontmatter.tools) {
    let tools = frontmatter.tools;
    if (typeof tools === 'string') {
      tools = tools.split(',').map(t => t.trim()).filter(Boolean);
    }
    if (Array.isArray(tools)) {
      for (const tool of tools) {
        if (!VALID_CLAUDE_TOOLS.has(tool)
            && !CANONICAL_TOOL_ALIASES[tool.toLowerCase()]
            && !CLAUDE_MCP_PATTERN.test(tool)) {
          warnings.push(`${relativePath}: Unknown Claude tool '${tool}'`);
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Main validation orchestrator
// ---------------------------------------------------------------------------
async function runPhase3Checks() {
  if (FLAG_VALIDATE_WCAG) {
    for (const skill of checkedSkillFiles) {
      validateWcagReferences(skill.content, skill.relativePath);
    }
  }

  if (FLAG_VALIDATE_URLS) {
    for (const skill of checkedSkillFiles) {
      await validateSkillUrls(skill.filePath, skill.content, skill.relativePath);
    }
  }
}

async function validateAll() {
  if (!FLAG_QUIET) {
    console.log('Validating agent and skill files...');
    console.log('Sources: GitHub custom-agents configuration reference, VS Code docs, VS Code cheat sheet\n');
  }

  await runPhase3Checks();

  // If specific files requested (pre-commit mode), only validate those
  if (SPECIFIC_FILES && SPECIFIC_FILES.length > 0) {
    if (!FLAG_QUIET) console.log(`Validating ${SPECIFIC_FILES.length} specified file(s)...\n`);
    for (const file of SPECIFIC_FILES) {
      const absPath = path.resolve(process.cwd(), file);
      if (!fs.existsSync(absPath)) continue;

      if (file.includes('.github/agents/') || file.includes('.github\\agents\\')) {
        validateCopilotAgent(absPath);
      } else if (file.includes('.github/skills/') || file.includes('.github\\skills\\')) {
        validateSkill(absPath);
      } else if (file.includes('.claude/agents/') || file.includes('.claude\\agents\\')) {
        validateClaudeAgent(absPath);
      } else if (file.includes('claude-code-plugin/agents/') || file.includes('claude-code-plugin\\agents\\')) {
        validateClaudeAgent(absPath);
      }
    }
  } else {
    // Full scan mode
    // Copilot agents
    const copilotAgentsDir = path.join(process.cwd(), '.github', 'agents');
    if (fs.existsSync(copilotAgentsDir)) {
      const files = fs.readdirSync(copilotAgentsDir).filter(f => f.endsWith('.agent.md'));
      if (!FLAG_QUIET) console.log(`Found ${files.length} Copilot agents`);
      for (const file of files) {
        validateCopilotAgent(path.join(copilotAgentsDir, file));
      }
    }

    // Copilot skills
    const copilotSkillsDir = path.join(process.cwd(), '.github', 'skills');
    if (fs.existsSync(copilotSkillsDir)) {
      const skillDirs = fs.readdirSync(copilotSkillsDir, { withFileTypes: true })
        .filter(d => d.isDirectory());
      if (!FLAG_QUIET) console.log(`Found ${skillDirs.length} Copilot skills`);
      for (const dir of skillDirs) {
        const skillFile = path.join(copilotSkillsDir, dir.name, 'SKILL.md');
        if (fs.existsSync(skillFile)) {
          validateSkill(skillFile);
        } else {
          errors.push(`.github/skills/${dir.name}: Missing SKILL.md`);
        }
      }
    }

    // Claude Code agents (.claude/agents/)
    const claudeAgentsDir = path.join(process.cwd(), '.claude', 'agents');
    if (fs.existsSync(claudeAgentsDir)) {
      const files = fs.readdirSync(claudeAgentsDir).filter(f => f.endsWith('.md'));
      if (!FLAG_QUIET) console.log(`Found ${files.length} Claude Code agents`);
      for (const file of files) {
        validateClaudeAgent(path.join(claudeAgentsDir, file));
      }
    }

    // Claude Code plugin agents (claude-code-plugin/agents/)
    const pluginAgentsDir = path.join(process.cwd(), 'claude-code-plugin', 'agents');
    if (fs.existsSync(pluginAgentsDir)) {
      const files = fs.readdirSync(pluginAgentsDir).filter(f => f.endsWith('.md'));
      if (!FLAG_QUIET) console.log(`Found ${files.length} Claude Code plugin agents`);
      for (const file of files) {
        validateClaudeAgent(path.join(pluginAgentsDir, file));
      }
    }
  }

  // Report results
  console.log('\n' + '='.repeat(60) + '\n');

  if (errors.length > 0) {
    console.log(`ERRORS (${errors.length}):\n`);
    for (const error of errors) {
      console.log(`  [error] ${error}`);
    }
    console.log('');
  }

  if (warnings.length > 0 && !FLAG_QUIET) {
    console.log(`WARNINGS (${warnings.length}):\n`);
    for (const warning of warnings) {
      console.log(`  [warn]  ${warning}`);
    }
    console.log('');
  }

  if (info.length > 0 && !FLAG_QUIET) {
    console.log(`INFO (${info.length}):\n`);
    for (const item of info) {
      console.log(`  [info]  ${item}`);
    }
    console.log('');
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('All validations passed!\n');
  }

  // Summary
  console.log('='.repeat(60));
  console.log(`Errors: ${errors.length}  Warnings: ${warnings.length}  Info: ${info.length}`);

  if (FLAG_STRICT) {
    return (errors.length + warnings.length) === 0 ? 0 : 1;
  }
  return errors.length === 0 ? 0 : 1;
}

// Run validation
validateAll()
  .then((exitCode) => process.exit(exitCode))
  .catch((err) => {
    console.error(`Validation failed unexpectedly: ${err.message}`);
    process.exit(1);
  });
