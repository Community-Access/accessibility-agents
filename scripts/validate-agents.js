#!/usr/bin/env node
/**
 * Agent and Skill Validation Script
 * 
 * Validates that all agent and skill files have:
 * - Valid YAML frontmatter
 * - Required fields (description for agents, name+description for skills)
 * - Valid tool names (CLI-compatible for Copilot agents)
 * 
 * Usage:
 *   node scripts/validate-agents.js [--fix]
 * 
 * Exit codes:
 *   0 - All validations passed
 *   1 - Validation errors found
 */

const fs = require('fs');
const path = require('path');

// CLI-compatible tool names (what Copilot CLI understands)
const VALID_COPILOT_TOOLS = new Set([
  // Core CLI tools
  'read', 'edit', 'search', 'execute', 'agent', 'web',
  // VS Code tools (mapped or gracefully ignored by CLI)
  'runInTerminal', 'askQuestions', 'getDiagnostics', 'listDirectory',
  'getTerminalOutput', 'createFile', 'fetch', 'createDirectory',
  // GitHub MCP tools (VS Code Copilot Chat with GitHub extension)
  'github/*', 'codebase',
  // MCP tools (Playwright)
  'run_playwright_keyboard_scan', 'run_playwright_state_scan',
  'run_playwright_viewport_scan', 'run_playwright_contrast_scan',
  'run_playwright_a11y_tree'
]);

// VS Code-specific tools that should be replaced with CLI equivalents
const TOOL_REPLACEMENTS = {
  'readFile': 'read',
  'editFiles': 'edit',
  'textSearch': 'search',
  'fileSearch': 'search',
  'runSubagent': 'agent'
};

// Required fields per file type
const REQUIRED_FIELDS = {
  agent: ['description'],
  skill: ['name', 'description']
};

let errors = [];
let warnings = [];

/**
 * Parse YAML frontmatter from markdown file
 */
function parseFrontmatter(content) {
  // Handle different line endings
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  
  const yaml = match[1];
  const result = {};
  
  // Simple YAML parser for our needs
  const lines = yaml.split('\n');
  let currentKey = null;
  let inArray = false;
  let arrayItems = [];
  
  for (const line of lines) {
    // Array item
    if (line.match(/^\s+-\s+/)) {
      const value = line.replace(/^\s+-\s+/, '').trim();
      arrayItems.push(value);
      continue;
    }
    
    // End of array
    if (inArray && currentKey && !line.match(/^\s+-/)) {
      result[currentKey] = arrayItems;
      inArray = false;
      arrayItems = [];
      currentKey = null;
    }
    
    // Key-value pair
    const kvMatch = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (kvMatch) {
      const [, key, value] = kvMatch;
      
      if (value === '' || value === '|' || value === '>') {
        // Start of array or multiline
        currentKey = key;
        inArray = true;
        arrayItems = [];
      } else if (value.startsWith('[')) {
        // Inline array
        const items = value
          .replace(/^\[|\]$/g, '')
          .split(',')
          .map(s => s.trim().replace(/^['"]|['"]$/g, ''));
        result[key] = items;
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
 * Validate a Copilot agent file
 */
function validateCopilotAgent(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const frontmatter = parseFrontmatter(content);
  const relativePath = path.relative(process.cwd(), filePath);
  
  if (!frontmatter) {
    errors.push(`${relativePath}: Missing YAML frontmatter`);
    return;
  }
  
  // Check required fields
  for (const field of REQUIRED_FIELDS.agent) {
    if (!frontmatter[field]) {
      errors.push(`${relativePath}: Missing required field '${field}'`);
    }
  }
  
  // Check tool names
  if (frontmatter.tools && Array.isArray(frontmatter.tools)) {
    for (const tool of frontmatter.tools) {
      if (TOOL_REPLACEMENTS[tool]) {
        warnings.push(`${relativePath}: Tool '${tool}' should be '${TOOL_REPLACEMENTS[tool]}' for CLI compatibility`);
      } else if (!VALID_COPILOT_TOOLS.has(tool)) {
        warnings.push(`${relativePath}: Unknown tool '${tool}' (may not work in Copilot CLI)`);
      }
    }
  }
}

/**
 * Validate a skill SKILL.md file
 */
function validateSkill(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const frontmatter = parseFrontmatter(content);
  const relativePath = path.relative(process.cwd(), filePath);
  
  if (!frontmatter) {
    errors.push(`${relativePath}: Missing YAML frontmatter`);
    return;
  }
  
  // Check required fields
  for (const field of REQUIRED_FIELDS.skill) {
    if (!frontmatter[field]) {
      errors.push(`${relativePath}: Missing required field '${field}'`);
    }
  }
  
  // Check that folder name matches skill name
  const folderName = path.basename(path.dirname(filePath));
  if (frontmatter.name && frontmatter.name !== folderName) {
    warnings.push(`${relativePath}: Skill name '${frontmatter.name}' doesn't match folder name '${folderName}'`);
  }
}

/**
 * Validate a Claude Code agent file
 */
function validateClaudeAgent(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const frontmatter = parseFrontmatter(content);
  const relativePath = path.relative(process.cwd(), filePath);
  
  if (!frontmatter) {
    errors.push(`${relativePath}: Missing YAML frontmatter`);
    return;
  }
  
  // Check required fields
  for (const field of REQUIRED_FIELDS.agent) {
    if (!frontmatter[field]) {
      errors.push(`${relativePath}: Missing required field '${field}'`);
    }
  }
}

/**
 * Find and validate all agent/skill files
 */
function validateAll() {
  console.log('Validating agent and skill files...\n');
  
  // Copilot agents
  const copilotAgentsDir = path.join(process.cwd(), '.github', 'agents');
  if (fs.existsSync(copilotAgentsDir)) {
    const files = fs.readdirSync(copilotAgentsDir).filter(f => f.endsWith('.agent.md'));
    console.log(`Found ${files.length} Copilot agents`);
    for (const file of files) {
      validateCopilotAgent(path.join(copilotAgentsDir, file));
    }
  }
  
  // Copilot skills
  const copilotSkillsDir = path.join(process.cwd(), '.github', 'skills');
  if (fs.existsSync(copilotSkillsDir)) {
    const skillDirs = fs.readdirSync(copilotSkillsDir, { withFileTypes: true })
      .filter(d => d.isDirectory());
    console.log(`Found ${skillDirs.length} Copilot skills`);
    for (const dir of skillDirs) {
      const skillFile = path.join(copilotSkillsDir, dir.name, 'SKILL.md');
      if (fs.existsSync(skillFile)) {
        validateSkill(skillFile);
      } else {
        errors.push(`.github/skills/${dir.name}: Missing SKILL.md`);
      }
    }
  }
  
  // Claude Code agents
  const claudeAgentsDir = path.join(process.cwd(), '.claude', 'agents');
  if (fs.existsSync(claudeAgentsDir)) {
    const files = fs.readdirSync(claudeAgentsDir).filter(f => f.endsWith('.md'));
    console.log(`Found ${files.length} Claude Code agents`);
    for (const file of files) {
      validateClaudeAgent(path.join(claudeAgentsDir, file));
    }
  }
  
  // Report results
  console.log('\n' + '='.repeat(60) + '\n');
  
  if (errors.length > 0) {
    console.log(`❌ ${errors.length} ERROR(S):\n`);
    for (const error of errors) {
      console.log(`  • ${error}`);
    }
    console.log('');
  }
  
  if (warnings.length > 0) {
    console.log(`⚠️  ${warnings.length} WARNING(S):\n`);
    for (const warning of warnings) {
      console.log(`  • ${warning}`);
    }
    console.log('');
  }
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All validations passed!\n');
  }
  
  // Summary
  console.log('='.repeat(60));
  console.log(`Errors: ${errors.length}  Warnings: ${warnings.length}`);
  
  return errors.length === 0 ? 0 : 1;
}

// Run validation
const exitCode = validateAll();
process.exit(exitCode);
