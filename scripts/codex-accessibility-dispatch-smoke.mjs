#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const args = new Set(process.argv.slice(2));
const live = args.has("--live");
const repoRoot = process.cwd();
const skillPath = "codex-plugin/skills/web-accessibility/SKILL.md";
const hookManifestPath = "codex-plugin/hooks/hooks.json";
const hookScriptPath = "codex-plugin/hooks/a11y-codex-dispatch-guard.mjs";

const requiredSkillPhrases = [
  "starts accessibility-lead first",
  "Explicitly spawn `accessibility-lead`",
  "call `tool_search` for `multi-agent subagent accessibility`",
  "Do not downgrade to local-only review just because the spawn tool was lazy-loaded",
  "stop and ask the user to enable subagents/Accessibility Agents",
  "Pass skill context to every spawned Accessibility Agents subagent",
  '"type": "skill", "name": "web-accessibility"',
  "Wait for `accessibility-lead` and every selected specialist to complete",
  "New modal/dialog/overlay",
];

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function requireFile(path) {
  if (!existsSync(path)) {
    fail(`Missing required file: ${path}`);
    return "";
  }
  return readFileSync(path, "utf8");
}

const skill = requireFile(skillPath);
for (const phrase of requiredSkillPhrases) {
  if (!skill.includes(phrase)) {
    fail(`${skillPath}: missing dispatch smoke phrase "${phrase}".`);
  }
}

const hookManifest = requireFile(hookManifestPath);
for (const phrase of [
  "UserPromptSubmit",
  "SubagentStart",
  "SubagentStop",
  "PreToolUse",
  "Stop",
  "modal-specialist",
  "apply_patch|Edit|Write",
  "Checking Accessibility Agents synthesis",
]) {
  if (!hookManifest.includes(phrase)) {
    fail(`${hookManifestPath}: missing dispatch hook phrase "${phrase}".`);
  }
}

const hookScript = requireFile(hookScriptPath);
for (const phrase of [
  "Accessibility Agents Codex dispatch is required",
  "permissionDecision: \"deny\"",
  "Spawn accessibility-lead first",
  "handleStop",
  "parent_thread_id",
  "hasAgentStateSince",
  "look for",
  "selectRequiredSpecialists",
  "modal-specialist",
  "AccessibilityReviewReceipt",
]) {
  if (!hookScript.includes(phrase)) {
    fail(`${hookScriptPath}: missing dispatch guard phrase "${phrase}".`);
  }
}

if (!live) {
  if (!process.exitCode) {
    console.log("Codex accessibility dispatch source checks passed.");
  }
  process.exit();
}

const codexProbe = spawnSync("codex", ["--version"], {
  cwd: repoRoot,
  encoding: "utf8",
  stdio: "pipe",
});

if (codexProbe.status !== 0) {
  fail("codex CLI is not available; install Codex before running --live.");
  process.exit();
}

const prompt = [
  "Do not edit files.",
  "This is an Accessibility Agents dispatch smoke test.",
  "Use the installed web-accessibility workflow for a hypothetical JSX progress bar accessibility review.",
  "If multi_agent_v1.spawn_agent is not visible, use tool_search first.",
  "Spawn accessibility-lead and the relevant specialist subagents if possible.",
  "Wait for all spawned Accessibility Agents to complete before answering.",
  "Return one final line exactly in this format:",
  "A11Y_DISPATCH_SMOKE accessibilityLeadSpawned=<yes|no> specialistsSpawned=<yes|no> waitedForAgents=<yes|no> toolSearchUsed=<yes|no|already-visible> localFallback=<yes|no>",
].join(" ");

const result = spawnSync(
  "codex",
  [
    "exec",
    "--ephemeral",
    "-C",
    repoRoot,
    "--sandbox",
    "read-only",
    prompt,
  ],
  {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: "pipe",
    timeout: 240000,
  }
);

const combined = `${result.stdout || ""}\n${result.stderr || ""}`;
process.stdout.write(result.stdout || "");
process.stderr.write(result.stderr || "");

if (result.status !== 0) {
  fail(`codex exec smoke test failed with status ${result.status}.`);
  process.exit();
}

const summary = combined.match(
  /A11Y_DISPATCH_SMOKE\s+accessibilityLeadSpawned=(yes|no)\s+specialistsSpawned=(yes|no)\s+waitedForAgents=(yes|no)\s+toolSearchUsed=(yes|no|already-visible)\s+localFallback=(yes|no)/
);

if (!summary) {
  fail("Live smoke test did not emit the expected A11Y_DISPATCH_SMOKE summary line.");
} else {
  const [, accessibilityLeadSpawned, specialistsSpawned, waitedForAgents, , localFallback] = summary;
  if (accessibilityLeadSpawned !== "yes") {
    fail("Live smoke test did not spawn accessibility-lead.");
  }
  if (specialistsSpawned !== "yes") {
    fail("Live smoke test did not spawn specialist subagents.");
  }
  if (waitedForAgents !== "yes") {
    fail("Live smoke test did not wait for Accessibility Agents completion.");
  }
  if (localFallback !== "no") {
    fail("Live smoke test used a local-only fallback.");
  }
}

if (!process.exitCode) {
  console.log("Codex accessibility dispatch live smoke test passed.");
}
