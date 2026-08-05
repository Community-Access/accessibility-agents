#!/usr/bin/env node

/**
 * Build script for Antigravity CLI Agent & Plugin Files
 *
 * Generates .antigravity/ and antigravity-plugin/ directories containing:
 * - 80 accessibility agent definitions formatted for Antigravity CLI (agy)
 * - 26 accessibility skills
 * - ANTIGRAVITY.md instructions and rules
 * - mcp_config.json MCP server configuration
 * - hooks.json lifecycle hooks & enforcement scripts
 * - plugin.json manifest
 *
 * Ensures strict repository compliance: NO EMOJI in output files.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_AGENTS_DIR = path.join(ROOT, 'claude-code-plugin', 'agents');
const SOURCE_SKILLS_DIR = path.join(ROOT, '.github', 'skills');
const SOURCE_HOOK_SCRIPTS = path.join(ROOT, 'claude-code-plugin', 'scripts');

const TARGET_DOT_ANTIGRAVITY = path.join(ROOT, '.antigravity');
const TARGET_PLUGIN = path.join(ROOT, 'antigravity-plugin');

// Emoji removal helper (repository rule: no emoji)
function removeEmoji(text) {
  if (!text) return '';
  return text
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu, '')
    .replace(/\uFE0F/g, '');
}

// Convert Claude agent frontmatter & content to Antigravity agent format
function convertToAntigravityAgent(content) {
  let cleaned = removeEmoji(content);
  cleaned = cleaned.replace(/^tools:\s*.*$/m, 'tools: [read, edit, search, agent, execute, askQuestions]');
  return cleaned;
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyDirRecursive(src, dest) {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      let content = fs.readFileSync(srcPath, 'utf8');
      content = removeEmoji(content);
      fs.writeFileSync(destPath, content, 'utf8');
    }
  }
}

function main() {
  console.log('Building full-potential Antigravity CLI agent and plugin files...');

  const dotAgents = path.join(TARGET_DOT_ANTIGRAVITY, 'agents');
  const dotSkills = path.join(TARGET_DOT_ANTIGRAVITY, 'skills');
  const dotRules = path.join(TARGET_DOT_ANTIGRAVITY, 'rules');
  const dotHooks = path.join(TARGET_DOT_ANTIGRAVITY, 'hooks');
  const dotScripts = path.join(TARGET_DOT_ANTIGRAVITY, 'scripts');

  const pluginAgents = path.join(TARGET_PLUGIN, 'agents');
  const pluginSkills = path.join(TARGET_PLUGIN, 'skills');
  const pluginRules = path.join(TARGET_PLUGIN, 'rules');
  const pluginHooks = path.join(TARGET_PLUGIN, 'hooks');
  const pluginScripts = path.join(TARGET_PLUGIN, 'scripts');

  ensureDir(dotAgents);
  ensureDir(dotSkills);
  ensureDir(dotRules);
  ensureDir(dotHooks);
  ensureDir(dotScripts);

  ensureDir(pluginAgents);
  ensureDir(pluginSkills);
  ensureDir(pluginRules);
  ensureDir(pluginHooks);
  ensureDir(pluginScripts);

  // Copy and convert all 80 agents
  const agentFiles = fs.readdirSync(SOURCE_AGENTS_DIR).filter(f => f.endsWith('.md'));
  console.log(`Processing ${agentFiles.length} agents...`);

  for (const file of agentFiles) {
    const srcPath = path.join(SOURCE_AGENTS_DIR, file);
    const content = fs.readFileSync(srcPath, 'utf8');
    const converted = convertToAntigravityAgent(content);

    fs.writeFileSync(path.join(dotAgents, file), converted, 'utf8');
    fs.writeFileSync(path.join(pluginAgents, file), converted, 'utf8');
  }

  // Copy all skills
  if (fs.existsSync(SOURCE_SKILLS_DIR)) {
    console.log('Processing skills...');
    copyDirRecursive(SOURCE_SKILLS_DIR, dotSkills);
    copyDirRecursive(SOURCE_SKILLS_DIR, pluginSkills);
  }

  // Copy hook scripts if present
  if (fs.existsSync(SOURCE_HOOK_SCRIPTS)) {
    console.log('Processing hook scripts...');
    copyDirRecursive(SOURCE_HOOK_SCRIPTS, dotScripts);
    copyDirRecursive(SOURCE_HOOK_SCRIPTS, pluginScripts);
  }

  // Create rules
  const rulesContent = fs.readFileSync(path.join(ROOT, 'ANTIGRAVITY.md'), 'utf8');
  fs.writeFileSync(path.join(dotRules, 'ANTIGRAVITY.md'), rulesContent, 'utf8');
  fs.writeFileSync(path.join(pluginRules, 'ANTIGRAVITY.md'), rulesContent, 'utf8');

  // Create mcp_config.json
  const mcpConfig = {
    mcpServers: {
      "a11y-scanner": {
        command: "node",
        args: ["./mcp-server/stdio.js"],
        description: "Accessibility scanning tools (axe-core, Playwright, PDF, Office)"
      }
    }
  };
  const mcpConfigStr = JSON.stringify(mcpConfig, null, 2);
  fs.writeFileSync(path.join(TARGET_DOT_ANTIGRAVITY, 'mcp_config.json'), mcpConfigStr, 'utf8');
  fs.writeFileSync(path.join(TARGET_PLUGIN, 'mcp_config.json'), mcpConfigStr, 'utf8');

  // Create hooks.json
  const hooksConfig = {
    hooks: {
      UserPromptSubmit: [
        {
          hooks: [
            {
              type: "command",
              command: "./scripts/a11y-team-eval.sh",
              timeout: 10
            }
          ]
        }
      ],
      PreToolUse: [
        {
          matcher: "edit|write",
          hooks: [
            {
              type: "command",
              command: "./scripts/a11y-enforce-edit.sh",
              timeout: 10
            }
          ]
        }
      ],
      PostToolUse: [
        {
          matcher: "agent",
          hooks: [
            {
              type: "command",
              command: "./scripts/a11y-mark-reviewed.sh",
              timeout: 5
            }
          ]
        }
      ]
    }
  };
  const hooksConfigStr = JSON.stringify(hooksConfig, null, 2);
  fs.writeFileSync(path.join(TARGET_DOT_ANTIGRAVITY, 'hooks.json'), hooksConfigStr, 'utf8');
  fs.writeFileSync(path.join(TARGET_PLUGIN, 'hooks.json'), hooksConfigStr, 'utf8');

  console.log('Antigravity full-potential files generated successfully.');
}

main();
