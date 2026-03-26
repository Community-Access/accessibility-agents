#!/usr/bin/env node

/**
 * check-release-consistency.js
 * 
 * Verifies that all release manifest files have matching version numbers.
 * Useful as a pre-release CI check to prevent version drift.
 * 
 * Files checked:
 * - CHANGELOG.md (version from first heading, e.g., "## 4.5.0")
 * - plugin.yaml (version: field)
 * - mcp-server/package.json (version field)
 * - gemini-extension.json (version field)
 * 
 * Exit codes:
 * - 0: All versions match
 * - 1: Version mismatch or file not found
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');

// Files to check
const FILES_TO_CHECK = [
  { file: 'CHANGELOG.md', type: 'changelog' },
  { file: 'plugin.yaml', type: 'yaml' },
  { file: 'mcp-server/package.json', type: 'json' },
  { file: 'gemini-extension.json', type: 'json' },
];

// Extract version from CHANGELOG.md
// Expects format: ## [4.5.0] or ## 4.5.0
function extractChangelogVersion() {
  const filePath = path.join(REPO_ROOT, 'CHANGELOG.md');
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/^##\s+\[?([\d.]+)\]?/m);
    if (match) {
      return match[1];
    }
  } catch (err) {
    throw new Error(`Failed to read CHANGELOG.md: ${err.message}`);
  }
  throw new Error('CHANGELOG.md: No version found (expected format: ## [4.5.0] or ## 4.5.0)');
}

// Extract version from YAML file
function extractYamlVersion() {
  const filePath = path.join(REPO_ROOT, 'plugin.yaml');
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/^version:\s*["']?([\d.]+)["']?$/m);
    if (match) {
      return match[1];
    }
  } catch (err) {
    throw new Error(`Failed to read plugin.yaml: ${err.message}`);
  }
  throw new Error('plugin.yaml: No version found (expected format: version: 4.5.0)');
}

// Extract version from JSON file
function extractJsonVersion(filePath) {
  const fullPath = path.join(REPO_ROOT, filePath);
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const json = JSON.parse(content);
    if (json.version) {
      return json.version;
    }
  } catch (err) {
    throw new Error(`Failed to read ${filePath}: ${err.message}`);
  }
  throw new Error(`${filePath}: No "version" field found`);
}

// Main check
function main() {
  const versions = {};
  let hasError = false;

  for (const { file, type } of FILES_TO_CHECK) {
    try {
      let version;
      if (type === 'changelog') {
        version = extractChangelogVersion();
      } else if (type === 'yaml') {
        version = extractYamlVersion();
      } else if (type === 'json') {
        version = extractJsonVersion(file);
      }
      versions[file] = version;
      console.log(`✓ ${file}: ${version}`);
    } catch (err) {
      console.error(`✗ ${file}: ${err.message}`);
      hasError = true;
    }
  }

  // Check consistency
  const uniqueVersions = new Set(Object.values(versions));
  if (uniqueVersions.size === 1 && !hasError) {
    const version = [...uniqueVersions][0];
    console.log(`\n✅ All versions aligned: ${version}`);
    process.exit(0);
  } else {
    if (!hasError) {
      console.error(`\n❌ Version mismatch detected:`);
      for (const [file, version] of Object.entries(versions)) {
        console.error(`   ${file}: ${version}`);
      }
    }
    process.exit(1);
  }
}

main();
