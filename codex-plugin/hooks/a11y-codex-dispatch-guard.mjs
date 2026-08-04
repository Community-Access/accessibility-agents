#!/usr/bin/env node
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const input = await readJsonFromStdin();
const eventName = input.hook_event_name || input.hookEventName || "";
const sessionId = sanitize(input.session_id || "session");
const turnId = sanitize(input.turn_id || "turn");
const dataDir = process.env.PLUGIN_DATA || process.env.CLAUDE_PLUGIN_DATA || "/tmp/a11y-agents-codex";
const dispatchDir = join(dataDir, "dispatch");
const turnPath = join(dispatchDir, `${sessionId}-${turnId}-turn.json`);
const recentMarkerWindowMs = 30 * 60 * 1000;

if (eventName === "UserPromptSubmit") {
  handleUserPrompt(input);
} else if (eventName === "SubagentStart") {
  handleSubagentLifecycle(input, "started");
} else if (eventName === "SubagentStop") {
  handleSubagentLifecycle(input, "completed");
} else if (eventName === "AccessibilityReviewReceipt") {
  handleAccessibilityReviewReceipt(input);
} else if (eventName === "PreToolUse") {
  handlePreToolUse(input);
} else if (eventName === "Stop") {
  handleStop(input);
}

function handleAccessibilityReviewReceipt(input) {
  const state = input.state === "started" ? "started" : input.state === "completed" ? "completed" : "";
  const agentType = String(input.agent_type || "");
  if (input.receipt_source !== "codex-collaboration" || !state || !isTrackedAgent(agentType)) {
    return;
  }
  handleSubagentLifecycle(input, state);
}

async function readJsonFromStdin() {
  let raw = "";
  for await (const chunk of process.stdin) {
    raw += chunk;
  }
  if (!raw.trim()) {
    return {};
  }
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function handleUserPrompt(input) {
  const prompt = String(input.prompt || "");
  if (!requiresAccessibilityDispatch(prompt)) {
    return;
  }
  const requiredSpecialists = selectRequiredSpecialists(prompt);
  writeTurnState({
    sessionId: input.session_id || null,
    turnId: input.turn_id || null,
    prompt,
    requiredSpecialists,
    recordedAt: new Date().toISOString()
  });
  writeJson({
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext: [
        "Accessibility Agents Codex dispatch is required for this UI/web task.",
        `Before editing UI files, use the web-accessibility router and spawn accessibility-lead plus these required specialists: ${requiredSpecialists.join(", ")}.`,
        "If the subagent tool is not visible, call tool_search for multi-agent subagent accessibility.",
        "Do not continue with a local-only accessibility review unless the user explicitly overrides this requirement.",
        "Before finalizing, wait for accessibility-lead and every required specialist to complete, then synthesize their findings."
      ].join(" ")
    }
  });
}

function handleSubagentLifecycle(input, state) {
  const agentType = String(input.agent_type || "");
  if (!isTrackedAgent(agentType)) {
    return;
  }
  mkdirSync(dispatchDir, { recursive: true });
  const marker = {
    sessionId: input.session_id || null,
    parentThreadId: input.parent_thread_id || input.parentThreadId || null,
    threadId: input.thread_id || input.threadId || null,
    turnId: input.turn_id || null,
    agentId: input.agent_id || null,
    agentType,
    state,
    recordedAt: new Date().toISOString()
  };
  for (const markerFile of markerPaths(input, agentType, state)) {
    writeFileSync(markerFile, JSON.stringify(marker) + "\n", "utf8");
  }
}

function handlePreToolUse(input) {
  if (!touchesUiFile(input.tool_input)) {
    return;
  }
  const turn = readTurnState();
  if (hasAgentStateSince(input, "accessibility-lead", "started", turn?.recordedAt)) {
    return;
  }
  writeJson({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: [
        "Accessibility Agents dispatch is required before editing UI files.",
        "Spawn accessibility-lead first for this turn, using tool_search if the subagent tool is lazy-loaded, then retry the edit."
      ].join(" ")
    }
  });
}

function handleStop(input) {
  const turn = readTurnState();
  if (!turn || input.stop_hook_active) {
    return;
  }
  const requiredSpecialists = Array.isArray(turn.requiredSpecialists) ? turn.requiredSpecialists : [];
  const missing = [];
  if (!hasAgentStateSince(input, "accessibility-lead", "completed", turn.recordedAt)) {
    missing.push("accessibility-lead completion");
  }
  for (const specialist of requiredSpecialists) {
    if (!hasAgentStateSince(input, specialist, "completed", turn.recordedAt)) {
      missing.push(`${specialist} completion`);
    }
  }
  if (missing.length === 0) {
    return;
  }
  writeJson({
    decision: "block",
    reason: [
      "Accessibility Agents review is not complete for this UI/web task.",
      `Wait for or spawn the missing reviews: ${missing.join(", ")}.`,
      "If nested dispatch was unavailable, the root session must spawn accessibility-lead and the required specialists directly, wait for all of them, then provide the lead synthesis before finalizing."
    ].join(" ")
  });
}

function touchesUiFile(toolInput) {
  const text = JSON.stringify(toolInput || {});
  const filePatterns = [
    /(?:^|[/"'` ])(?:app|pages|src|components|layouts|views|routes)\/[^"'`\n]*(?:\.jsx|\.tsx|\.vue|\.svelte|\.astro|\.css|\.scss|\.sass|\.less|\.html)\b/i,
    /(?:^|[/"'` ])[^"'`\n]*(?:\.jsx|\.tsx|\.vue|\.svelte|\.astro|\.css|\.scss|\.sass|\.less|\.html)\b/i,
    /\*\*\* (?:Add|Update) File: [^\n]*(?:\.jsx|\.tsx|\.vue|\.svelte|\.astro|\.css|\.scss|\.sass|\.less|\.html)\b/i
  ];
  return filePatterns.some((pattern) => pattern.test(text));
}

function looksLikeUiWork(prompt) {
  return /\b(ui|user interface|frontend|front-end|react|next\.?js|vue|svelte|astro|html|css|jsx|tsx|component|modal|dialog|form|button|link|menu|navigation|page|screen|layout|aria|keyboard|focus|contrast|wcag|accessib)/i.test(prompt);
}

function requiresAccessibilityDispatch(prompt) {
  return looksLikeUiWork(prompt) && /\b(add|build|create|make|implement|edit|update|change|fix|remove|refactor|review|audit|check|test|verify|ship|find|scan|inspect|look for|search for|homepage|component|page|modal|dialog|form|button|link|menu|navigation|layout)\b/i.test(prompt);
}

function selectRequiredSpecialists(prompt) {
  const specialists = new Set(["aria-specialist", "keyboard-navigator"]);
  if (/\b(add|build|create|make|new|homepage|page|screen|component|route)\b/i.test(prompt)) {
    specialists.add("alt-text-headings");
  }
  if (/\b(modal|dialog|drawer|popover|overlay|sheet|toast)\b/i.test(prompt)) {
    specialists.add("modal-specialist");
  }
  if (/\b(form|input|select|checkbox|radio|field|validation|error)\b/i.test(prompt)) {
    specialists.add("forms-specialist");
  }
  if (/\b(color|contrast|theme|css|style|visual|focus indicator)\b/i.test(prompt)) {
    specialists.add("contrast-master");
  }
  if (/\b(live region|alert|status|toast|loading|progress|dynamic|announcement)\b/i.test(prompt)) {
    specialists.add("live-region-controller");
  }
  if (/\b(table|grid|data grid|sortable|caption)\b/i.test(prompt)) {
    specialists.add("tables-data-specialist");
  }
  if (/\b(link|href|navigation|nav|menu)\b/i.test(prompt)) {
    specialists.add("link-checker");
  }
  if (/\b(full|complete|comprehensive|audit|wcag|accessibility review|a11y review)\b/i.test(prompt)) {
    for (const name of [
      "contrast-master",
      "forms-specialist",
      "modal-specialist",
      "live-region-controller",
      "alt-text-headings",
      "tables-data-specialist",
      "link-checker"
    ]) {
      specialists.add(name);
    }
  }
  return Array.from(specialists);
}

function writeTurnState(value) {
  mkdirSync(dispatchDir, { recursive: true });
  writeFileSync(turnPath, JSON.stringify(value) + "\n", "utf8");
}

function readTurnState() {
  if (!existsSync(turnPath)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(turnPath, "utf8"));
  } catch {
    return null;
  }
}

function dispatchPath(agentType, state) {
  return join(dispatchDir, `${sessionId}-${turnId}-${sanitize(agentType)}-${state}.json`);
}

function markerPaths(input, agentType, state) {
  const paths = new Set([dispatchPath(agentType, state)]);
  for (const key of sessionKeys(input)) {
    paths.add(join(dispatchDir, `${key}-${sanitize(agentType)}-${state}-latest.json`));
  }
  paths.add(join(dispatchDir, `global-${sanitize(agentType)}-${state}-latest.json`));
  return Array.from(paths);
}

function hasAgentStateSince(input, agentType, state, sinceIso) {
  const paths = new Set([dispatchPath(agentType, state)]);
  for (const key of sessionKeys(input)) {
    paths.add(join(dispatchDir, `${key}-${sanitize(agentType)}-${state}-latest.json`));
  }
  paths.add(join(dispatchDir, `global-${sanitize(agentType)}-${state}-latest.json`));
  for (const markerFile of paths) {
    const marker = readMarker(markerFile);
    if (!marker) {
      continue;
    }
    if (sinceIso ? isSameOrAfter(marker.recordedAt, sinceIso) : isRecent(marker.recordedAt)) {
      return true;
    }
  }
  return false;
}

function readMarker(markerFile) {
  if (!existsSync(markerFile)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(markerFile, "utf8"));
  } catch {
    return null;
  }
}

function sessionKeys(input) {
  return [
    input.session_id,
    input.parent_session_id,
    input.parentSessionId,
    input.parent_thread_id,
    input.parentThreadId,
    input.thread_id,
    input.threadId
  ]
    .filter(Boolean)
    .map(sanitize);
}

function isSameOrAfter(valueIso, sinceIso) {
  const valueMs = Date.parse(valueIso || "");
  const sinceMs = Date.parse(sinceIso || "");
  return Number.isFinite(valueMs) && Number.isFinite(sinceMs) && valueMs >= sinceMs;
}

function isRecent(valueIso) {
  const valueMs = Date.parse(valueIso || "");
  return Number.isFinite(valueMs) && Date.now() - valueMs <= recentMarkerWindowMs;
}

function isTrackedAgent(agentType) {
  return new Set([
    "accessibility-lead",
    "aria-specialist",
    "keyboard-navigator",
    "contrast-master",
    "forms-specialist",
    "modal-specialist",
    "live-region-controller",
    "alt-text-headings",
    "tables-data-specialist",
    "link-checker",
    "web-accessibility-wizard"
  ]).has(agentType);
}

function sanitize(value) {
  return String(value).replace(/[^A-Za-z0-9_.-]/g, "_").slice(0, 120) || "unknown";
}

function writeJson(value) {
  process.stdout.write(JSON.stringify(value));
}
