#!/usr/bin/env node
/**
 * Install git hooks for the agents repository.
 *
 * Copies scripts/pre-commit to .git/hooks/pre-commit so that agent/skill
 * files are validated before every commit.
 *
 * Usage:
 *   node scripts/install-hooks.js
 *
 * This is safe to run multiple times — it overwrites any previous hook.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, 'scripts', 'pre-commit');
const HOOKS_DIR = path.join(ROOT, '.git', 'hooks');
const TARGET = path.join(HOOKS_DIR, 'pre-commit');

// Verify we're inside a git repo
if (!fs.existsSync(path.join(ROOT, '.git'))) {
  console.error('Error: .git directory not found. Run this from the repository root.');
  process.exit(1);
}

// Create hooks directory if missing (bare repos may not have it)
if (!fs.existsSync(HOOKS_DIR)) {
  fs.mkdirSync(HOOKS_DIR, { recursive: true });
}

// Check if a pre-commit hook already exists and isn't ours
if (fs.existsSync(TARGET)) {
  const existing = fs.readFileSync(TARGET, 'utf8');
  if (!existing.includes('validate-agents')) {
    // Back up the existing hook
    const backup = TARGET + '.backup';
    fs.copyFileSync(TARGET, backup);
    console.log(`Backed up existing pre-commit hook to ${path.relative(ROOT, backup)}`);
  }
}

// Copy the hook
fs.copyFileSync(SOURCE, TARGET);

// Make it executable (no-op on Windows but needed for WSL/Git Bash)
try {
  fs.chmodSync(TARGET, 0o755);
} catch (e) {
  // chmod may fail on Windows — that's fine, git for Windows handles it
}

console.log('Pre-commit hook installed successfully.');
console.log(`  ${path.relative(ROOT, TARGET)}`);
console.log('');
console.log('Agent and skill files will be validated before each commit.');
console.log('To bypass (not recommended): git commit --no-verify');
