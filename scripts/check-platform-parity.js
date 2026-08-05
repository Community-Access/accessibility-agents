#!/usr/bin/env node

/**
 * Cross-Platform Agent Parity Checker
 *
 * Verifies that every Copilot agent has corresponding files on all supported
 * platforms: Claude Code, Claude Code Plugin, Gemini, and Antigravity CLI.
 *
 * Usage: node scripts/check-platform-parity.js
 */

import { readdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";

const ROOT = join(import.meta.dirname, "..");

const COPILOT_DIR = join(ROOT, ".github", "agents");
const CLAUDE_DIR = join(ROOT, ".claude", "agents");
const PLUGIN_DIR = join(ROOT, "claude-code-plugin", "agents");
const GEMINI_DIR = join(ROOT, ".gemini", "extensions", "a11y-agents", "skills");
const ANTIGRAVITY_DIR = join(ROOT, "antigravity-plugin", "agents");

// Files to skip (not agents)
const SKIP_FILES = new Set(["AGENTS.md", "ANTIGRAVITY.md"]);

function getCopilotAgents() {
  return readdirSync(COPILOT_DIR)
    .filter((f) => f.endsWith(".agent.md") && !SKIP_FILES.has(f))
    .map((f) => f.replace(".agent.md", ""));
}

function getClaudeAgents(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !SKIP_FILES.has(f))
    .map((f) => f.replace(".md", ""));
}

function getGeminiSkills() {
  if (!existsSync(GEMINI_DIR)) return [];
  return readdirSync(GEMINI_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function getAntigravityAgents() {
  if (!existsSync(ANTIGRAVITY_DIR)) return [];
  return readdirSync(ANTIGRAVITY_DIR)
    .filter((f) => f.endsWith(".md") && !SKIP_FILES.has(f))
    .map((f) => f.replace(".md", ""));
}

function main() {
  const copilot = getCopilotAgents();
  const claude = new Set(getClaudeAgents(CLAUDE_DIR));
  const plugin = new Set(getClaudeAgents(PLUGIN_DIR));
  const gemini = new Set(getGeminiSkills());
  const antigravity = new Set(getAntigravityAgents());

  let missingCount = 0;
  const gaps = [];

  for (const agent of copilot) {
    const missing = [];
    if (!claude.has(agent)) missing.push("Claude Code");
    if (!plugin.has(agent)) missing.push("Plugin");
    if (!gemini.has(agent)) missing.push("Gemini");
    if (!antigravity.has(agent)) missing.push("Antigravity");

    if (missing.length > 0) {
      missingCount += missing.length;
      gaps.push({ agent, missing });
    }
  }

  // Check for agents on other platforms that aren't on Copilot
  const copilotSet = new Set(copilot);
  const extraClaude = [...claude].filter((a) => !copilotSet.has(a));
  const extraPlugin = [...plugin].filter((a) => !copilotSet.has(a));
  const extraGemini = [...gemini].filter((a) => !copilotSet.has(a));
  const extraAntigravity = [...antigravity].filter((a) => !copilotSet.has(a));

  console.log("Cross-Platform Agent Parity Report");
  console.log("=".repeat(50));
  console.log(`Copilot agents: ${copilot.length}`);
  console.log(`Claude Code agents: ${claude.size}`);
  console.log(`Plugin agents: ${plugin.size}`);
  console.log(`Gemini skills: ${gemini.size}`);
  console.log(`Antigravity agents: ${antigravity.size}`);
  console.log();

  if (gaps.length === 0) {
    console.log("[OK] All Copilot agents have cross-platform equivalents.");
  } else {
    console.log(`[FAIL] ${gaps.length} agents have gaps (${missingCount} missing files):\n`);
    for (const { agent, missing } of gaps) {
      console.log(`  ${agent}: missing on ${missing.join(", ")}`);
    }
  }

  if (extraClaude.length || extraPlugin.length || extraGemini.length || extraAntigravity.length) {
    console.log("\n[WARN] Extra agents not on Copilot:");
    for (const a of extraClaude) console.log(`  Claude Code: ${a}`);
    for (const a of extraPlugin) console.log(`  Plugin: ${a}`);
    for (const a of extraGemini) console.log(`  Gemini: ${a}`);
    for (const a of extraAntigravity) console.log(`  Antigravity: ${a}`);
  }

  console.log();
  process.exit(gaps.length > 0 ? 1 : 0);
}

main();
