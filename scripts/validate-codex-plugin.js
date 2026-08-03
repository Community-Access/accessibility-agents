#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const pluginRoot = path.join(root, 'codex-plugin');
const requiredFiles = [
  'codex-plugin/.codex-plugin/plugin.json',
  'codex-plugin/README.md',
  'codex-plugin/hooks/hooks.json',
  'codex-plugin/hooks/a11y-codex-dispatch-guard.mjs',
  'codex-plugin/skills/web-accessibility/SKILL.md',
  'codex-plugin/skills/document-accessibility/SKILL.md',
  'codex-plugin/skills/github-workflows/SKILL.md',
  'codex-plugin/skills/developer-tools/SKILL.md',
  'codex-plugin/skills/markdown-accessibility/SKILL.md',
  'codex-plugin/agents/accessibility-lead.toml',
  'codex-plugin/agents/aria-specialist.toml',
  'codex-plugin/extensions/core/extension.json',
  'codex-plugin/extensions/README.md',
  'scripts/codex-accessibility-dispatch-smoke.mjs',
];

let failed = false;

function fail(message) {
  console.error(message);
  failed = true;
}

for (const rel of requiredFiles) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    fail(`Missing required Codex plugin file: ${rel}`);
  } else if (fs.statSync(abs).size === 0) {
    fail(`Empty required Codex plugin file: ${rel}`);
  }
}

const pluginJsonPath = path.join(pluginRoot, '.codex-plugin', 'plugin.json');
if (fs.existsSync(pluginJsonPath)) {
  try {
    const plugin = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8'));
    if (plugin.name !== 'a11y-agents-codex') {
      fail(`codex-plugin/.codex-plugin/plugin.json: expected name "a11y-agents-codex", got "${plugin.name}"`);
    }
    if (plugin.skills !== './skills/') {
      fail('codex-plugin/.codex-plugin/plugin.json: expected skills to be "./skills/"');
    }
    if (Object.prototype.hasOwnProperty.call(plugin, 'hooks')) {
      fail('codex-plugin/.codex-plugin/plugin.json: do not advertise hooks from the plugin manifest; the universal installer writes a single user-level hook guard.');
    }
  } catch (error) {
    fail(`codex-plugin/.codex-plugin/plugin.json is not valid JSON: ${error.message}`);
  }
}

const skillsDir = path.join(pluginRoot, 'skills');
if (fs.existsSync(skillsDir)) {
  const skillNames = fs.readdirSync(skillsDir).filter((name) => fs.existsSync(path.join(skillsDir, name, 'SKILL.md')));
  if (skillNames.length > 8) {
    fail(`Codex plugin exposes ${skillNames.length} top-level skills; keep the router surface at 8 or fewer.`);
  }
}

const legacyRolesDir = path.join(root, '.codex', 'roles');
if (fs.existsSync(legacyRolesDir)) {
  for (const file of fs.readdirSync(legacyRolesDir).filter((name) => name.endsWith('.toml'))) {
    const body = fs.readFileSync(path.join(legacyRolesDir, file), 'utf8');
    if (/^model\s*=/m.test(body)) {
      fail(`.codex/roles/${file}: legacy role templates must not pin a model; the installer stamps the configured Codex model dynamically.`);
    }
  }
}

const agentsDir = path.join(pluginRoot, 'agents');
const specialistsDir = path.join(pluginRoot, 'references', 'specialists');
if (fs.existsSync(agentsDir)) {
  const agentFiles = fs.readdirSync(agentsDir).filter((name) => name.endsWith('.toml'));
  const specialistFiles = fs.existsSync(specialistsDir)
    ? fs.readdirSync(specialistsDir).filter((name) => name.endsWith('.md') && name !== 'index.md')
    : [];
  if (agentFiles.length !== specialistFiles.length) {
    fail(`Codex subagent parity mismatch: found ${agentFiles.length} TOML agents but ${specialistFiles.length} specialist references.`);
  }
  for (const file of agentFiles) {
    const body = fs.readFileSync(path.join(agentsDir, file), 'utf8');
    for (const field of ['name =', 'description =', 'developer_instructions =']) {
      if (!body.includes(field)) {
        fail(`codex-plugin/agents/${file}: missing ${field}`);
      }
    }
    if (/^model\s*=/m.test(body)) {
      fail(`codex-plugin/agents/${file}: source agent templates must not pin a model; the installer stamps the configured Codex model dynamically.`);
    }
  }
}

const codexHookPath = path.join(pluginRoot, 'hooks', 'hooks.json');
if (fs.existsSync(codexHookPath)) {
  try {
    const hooks = JSON.parse(fs.readFileSync(codexHookPath, 'utf8'));
    for (const eventName of ['UserPromptSubmit', 'SubagentStart', 'SubagentStop', 'PreToolUse', 'Stop']) {
      if (!Array.isArray(hooks.hooks?.[eventName])) {
        fail(`codex-plugin/hooks/hooks.json: missing ${eventName} hook.`);
      }
    }
    const serialized = JSON.stringify(hooks);
    for (const phrase of [
      'a11y-codex-dispatch-guard.mjs',
      'modal-specialist',
      'desktop-a11y-specialist',
      'document-accessibility-wizard',
      'markdown-a11y-assistant',
      'SubagentStop',
      'Stop',
      'apply_patch|Edit|Write',
      'Enforcing Accessibility Agents review',
      'Checking Accessibility Agents synthesis',
    ]) {
      if (!serialized.includes(phrase)) {
        fail(`codex-plugin/hooks/hooks.json: missing dispatch hook phrase "${phrase}".`);
      }
    }
  } catch (error) {
    fail(`codex-plugin/hooks/hooks.json is not valid JSON: ${error.message}`);
  }
}

const codexHookScript = path.join(pluginRoot, 'hooks', 'a11y-codex-dispatch-guard.mjs');
if (fs.existsSync(codexHookScript)) {
  const body = fs.readFileSync(codexHookScript, 'utf8');
  for (const phrase of [
    'Accessibility Agents Codex dispatch is required',
    'permissionDecision: "deny"',
    'turn.coordinator || "accessibility-lead"',
    'handleStop',
    'parent_thread_id',
    'hasAgentStateSince',
    'look for',
    'SubagentStop',
    'selectRequiredSpecialists',
    'modal-specialist',
    'tool_search',
    'touchesRelevantFile',
    'looksLikeUiWork',
    'detectProjectSurface',
    'workspaceRoot',
    'desktop-a11y-specialist',
    'document-accessibility-wizard',
    'markdown-a11y-assistant',
  ]) {
    if (!body.includes(phrase)) {
      fail(`codex-plugin/hooks/a11y-codex-dispatch-guard.mjs: missing dispatch guard phrase "${phrase}".`);
    }
  }
}

const accessibilityLeadToml = path.join(pluginRoot, 'agents', 'accessibility-lead.toml');
if (fs.existsSync(accessibilityLeadToml)) {
  const body = fs.readFileSync(accessibilityLeadToml, 'utf8');
  for (const phrase of [
    'accessibility-lead is the lead agent',
    'dispatch matching Codex subagents by default',
    'same coordinator-worker pattern as Claude Code',
    'New modal, dialog, drawer, popover, sheet, or overlay',
    'Wait for every selected specialist to complete',
    'ship/no-ship call',
    'max_depth = 2',
  ]) {
    if (!body.includes(phrase)) {
      fail(`codex-plugin/agents/accessibility-lead.toml: missing lead-dispatch guidance phrase "${phrase}".`);
    }
  }
}

const webRouterSkill = path.join(pluginRoot, 'skills', 'web-accessibility', 'SKILL.md');
if (fs.existsSync(webRouterSkill)) {
  const body = fs.readFileSync(webRouterSkill, 'utf8');
  for (const phrase of [
    'starts accessibility-lead first',
    'Explicitly spawn `accessibility-lead` as a Codex custom subagent',
    "Installing Accessibility Agents for Codex is the user's standing request",
    'call `tool_search` for `multi-agent subagent accessibility`',
    'Do not downgrade to local-only review just because the spawn tool was lazy-loaded',
    'stop and ask the user to enable subagents/Accessibility Agents',
    'do not request a full-history fork',
    'Pass skill context to every spawned Accessibility Agents subagent',
    '"type": "skill", "name": "web-accessibility"',
    '~/.agents/plugins/a11y-agents-codex/references/specialists/',
    'Dispatch matching Codex custom subagents by default',
    'Do not make users manually name every specialist',
    'the root session must spawn `accessibility-lead` and the selected specialists directly',
    'Wait for `accessibility-lead` and every selected specialist to complete',
    'New modal/dialog/overlay',
    'The lead synthesizes specialist output',
  ]) {
    if (!body.includes(phrase)) {
      fail(`codex-plugin/skills/web-accessibility/SKILL.md: missing lead-router guidance phrase "${phrase}".`);
    }
  }
}

const codexDispatchSmoke = path.join(root, 'scripts', 'codex-accessibility-dispatch-smoke.mjs');
if (fs.existsSync(codexDispatchSmoke)) {
  const body = fs.readFileSync(codexDispatchSmoke, 'utf8');
  for (const phrase of [
    'A11Y_DISPATCH_SMOKE',
    '--live',
    'accessibilityLeadSpawned !== "yes"',
    'localFallback !== "no"',
    'Codex accessibility dispatch source checks passed',
  ]) {
    if (!body.includes(phrase)) {
      fail(`scripts/codex-accessibility-dispatch-smoke.mjs: missing smoke-test phrase "${phrase}".`);
    }
  }
}

for (const installerRel of ['install.sh', 'install.ps1']) {
  const installerPath = path.join(root, installerRel);
  if (fs.existsSync(installerPath)) {
    const body = fs.readFileSync(installerPath, 'utf8');
    for (const phrase of [
      'Pruned legacy Codex skill mirror',
      'CODEX_LEGACY_SKILL_NAMES',
      'codex-legacy-skill-pruned',
      'Configured Codex subagent nesting',
      'max_depth',
      'max_threads',
      'codex-agent-config',
      'codex-agent-model',
      './.agents/plugins/a11y-agents-codex',
      'codex plugin add a11y-agents-codex@accessibility-agents',
      'codex-plugin-enabled',
      'codex-hooks',
      'SubagentStop',
      'Checking Accessibility Agents synthesis',
      'Codex user-level hook guard installed',
      'codex-marketplace-repaired',
    ]) {
      if (!body.includes(phrase)) {
        fail(`${installerRel}: missing Codex legacy skill cleanup phrase "${phrase}".`);
      }
    }
    if (!body.includes('CODEX_AGENT_MODEL') && !body.includes('CodexAgentModel')) {
      fail(`${installerRel}: missing dynamic Codex agent model variable.`);
    }
    if (!body.includes('CODEX_HOOKS_JSON') && !body.includes('CodexHooksJson')) {
      fail(`${installerRel}: missing Codex user-level hooks file variable.`);
    }
  }
}

const extensionPath = path.join(pluginRoot, 'extensions', 'core', 'extension.json');
const extensionsDir = path.join(pluginRoot, 'extensions');
if (fs.existsSync(extensionsDir)) {
  const extensionFiles = fs.readdirSync(extensionsDir)
    .map((name) => path.join(extensionsDir, name, 'extension.json'))
    .filter((file) => fs.existsSync(file));
  const specialistFiles = fs.existsSync(specialistsDir)
    ? fs.readdirSync(specialistsDir).filter((name) => name.endsWith('.md') && name !== 'index.md')
    : [];
  const registeredAgents = new Map();
  if (extensionFiles.length < 2) {
    fail('codex-plugin/extensions: expected multiple built-in extension packs, not a single monolithic registry.');
  }
  for (const file of extensionFiles) {
    try {
      const extension = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (!extension.author || typeof extension.author !== 'string') {
        fail(`${path.relative(root, file)}: expected author string.`);
      }
      if (!Array.isArray(extension.extensionPoints) || !extension.extensionPoints.includes('agents')) {
        fail(`${path.relative(root, file)}: expected extensionPoints to include "agents".`);
      }
      if (!Array.isArray(extension.agents)) {
        fail(`${path.relative(root, file)}: expected agents array.`);
        continue;
      }
      for (const agent of extension.agents) {
        if (!agent.name) {
          fail(`${path.relative(root, file)}: agent entry missing name.`);
          continue;
        }
        if (registeredAgents.has(agent.name)) {
          fail(`${agent.name} is registered by multiple built-in extension packs: ${registeredAgents.get(agent.name)} and ${path.relative(root, file)}.`);
        }
        registeredAgents.set(agent.name, path.relative(root, file));
      }
    } catch (error) {
      fail(`${path.relative(root, file)} is not valid JSON: ${error.message}`);
    }
  }
  if (registeredAgents.size !== specialistFiles.length) {
    fail(`Built-in extension registry parity mismatch: ${registeredAgents.size} unique registered agents but ${specialistFiles.length} specialist references.`);
  }
}

if (failed) {
  process.exit(1);
}

console.log('Codex plugin structure is valid.');
