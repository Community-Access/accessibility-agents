#!/usr/bin/env node
import { mkdirSync, writeFileSync, existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

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
} else if (eventName === "PreToolUse") {
  handlePreToolUse(input);
} else if (eventName === "Stop") {
  handleStop(input);
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
  const surface = detectProjectSurface(input, prompt);
  if (!requiresAccessibilityDispatch(prompt, surface)) {
    return;
  }
  const requiredSpecialists = selectRequiredSpecialists(prompt, surface);
  writeTurnState({
    sessionId: input.session_id || null,
    turnId: input.turn_id || null,
    prompt,
    surface,
    coordinator: surface.coordinator,
    requiredSpecialists,
    recordedAt: new Date().toISOString()
  });
  writeJson({
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext: [
        "Accessibility Agents Codex dispatch is required for this accessibility task.",
        `Detected project surface: ${surface.primary}. Before editing relevant files, use the ${surface.router} router and spawn ${surface.coordinator} as coordinator plus these required specialists: ${requiredSpecialists.join(", ")}.`,
        "If the subagent tool is not visible, call tool_search for multi-agent subagent accessibility.",
        "Do not continue with a local-only accessibility review unless the user explicitly overrides this requirement.",
        `Before finalizing, wait for ${surface.coordinator} and every required specialist to complete, then synthesize their findings.`
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
  const turn = readTurnState();
  if (!turn || !touchesRelevantFile(input.tool_input, turn.surface?.primary)) {
    return;
  }
  if (hasAgentStateSince(input, turn.coordinator || "accessibility-lead", "started", turn.recordedAt)) {
    return;
  }
  writeJson({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: [
        "Accessibility Agents dispatch is required before editing UI files.",
        `Spawn ${turn.coordinator || "accessibility-lead"} first for this turn, using tool_search if the subagent tool is lazy-loaded, then retry the edit.`
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
  const coordinator = turn.coordinator || "accessibility-lead";
  if (!hasAgentStateSince(input, coordinator, "completed", turn.recordedAt)) {
    missing.push(`${coordinator} completion`);
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
      "Accessibility Agents review is not complete for this accessibility task.",
      `Wait for or spawn the missing reviews: ${missing.join(", ")}.`,
      `If nested dispatch was unavailable, the root session must spawn ${coordinator} and the required specialists directly, wait for all of them, then provide the coordinator synthesis before finalizing.`
    ].join(" ")
  });
}

function touchesRelevantFile(toolInput, surface) {
  const text = JSON.stringify(toolInput || {});
  const webPatterns = [
    /(?:^|[/"'` ])(?:app|pages|src|components|layouts|views|routes)\/[^"'`\n]*(?:\.jsx|\.tsx|\.vue|\.svelte|\.astro|\.css|\.scss|\.sass|\.less|\.html)\b/i,
    /(?:^|[/"'` ])[^"'`\n]*(?:\.jsx|\.tsx|\.vue|\.svelte|\.astro|\.css|\.scss|\.sass|\.less|\.html)\b/i,
    /\*\*\* (?:Add|Update) File: [^\n]*(?:\.jsx|\.tsx|\.vue|\.svelte|\.astro|\.css|\.scss|\.sass|\.less|\.html)\b/i
  ];
  if (surface === "desktop") {
    return /(?:^|[/'` ])[^"'`\n]*\.(?:py|pyw|cs|cpp|cxx|java|kt|swift|rs)\b/i.test(text);
  }
  if (surface === "documents") {
    return /(?:^|[/'` ])[^"'`\n]*\.(?:docx|xlsx|pptx|pdf|epub)\b/i.test(text);
  }
  if (surface === "markdown") {
    return /(?:^|[/'` ])[^"'`\n]*\.md\b/i.test(text);
  }
  return webPatterns.some((pattern) => pattern.test(text));
}

function looksLikeUiWork(prompt) {
  return /\b(ui|user interface|frontend|front-end|react|next\.?js|vue|svelte|astro|html|css|jsx|tsx|component|modal|dialog|form|button|link|menu|navigation|page|screen|layout|aria|keyboard|focus|contrast|wcag|accessib\w*|screen reader|nvda|jaws|voiceover|pdf|docx|xlsx|pptx|epub|markdown|readme|heading|alt text)\b/i.test(prompt);
}

function requiresAccessibilityDispatch(prompt, surface) {
  const isAction = /\b(add|build|create|make|implement|edit|update|change|fix|remove|refactor|review|audit|check|test|verify|ship|find|scan|inspect|look for|search for|homepage|component|page|modal|dialog|form|button|link|menu|navigation|layout)\b/i.test(prompt);
  return isAction && looksLikeUiWork(prompt);
}

function selectRequiredSpecialists(prompt, surface) {
  if (surface.primary === "desktop") {
    const specialists = new Set(["desktop-a11y-specialist", "desktop-a11y-testing-coach"]);
    if (surface.signals.includes("wxpython")) {
      specialists.add("wxpython-specialist");
    }
    if (surface.signals.includes("nvda-addon")) {
      specialists.add("nvda-addon-specialist");
    }
    return Array.from(specialists);
  }
  if (surface.primary === "documents") {
    const specialists = new Set(["document-accessibility-wizard"]);
    if (surface.signals.includes("pdf")) specialists.add("pdf-accessibility");
    if (surface.signals.includes("docx")) specialists.add("word-accessibility");
    if (surface.signals.includes("xlsx")) specialists.add("excel-accessibility");
    if (surface.signals.includes("pptx")) specialists.add("powerpoint-accessibility");
    if (surface.signals.includes("epub")) specialists.add("epub-accessibility");
    return Array.from(specialists);
  }
  if (surface.primary === "markdown") {
    return ["markdown-a11y-assistant"];
  }
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

function detectProjectSurface(input, prompt) {
  const workspace = workspaceRoot(input);
  const taskSignals = new Set(promptSignals(prompt));
  const workspaceSignals = new Set();
  const files = workspaceFiles(workspace);
  for (const file of files) {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (["docx", "xlsx", "pptx", "pdf", "epub"].includes(extension)) workspaceSignals.add(extension);
    if (extension === "md" || file.name.toLowerCase() === "readme") workspaceSignals.add("markdown");
    if (["jsx", "tsx", "vue", "svelte", "astro", "html", "css", "scss", "sass", "less"].includes(extension)) workspaceSignals.add("web");
    if (extension === "py") workspaceSignals.add("python");
  }
  const pythonSourceHints = readPythonSourceHints(files);
  const configuration = `${readProjectConfiguration(workspace)}\n${pythonSourceHints}`;
  if (/\b(wxpython|wx\.|pygame|pyside|pyqt|tkinter|kivy|pyglet|nuitka|pyinstaller)\b/i.test(configuration)) {
    workspaceSignals.add("desktop");
  }
  if (/\bwxpython\b/i.test(configuration)) workspaceSignals.add("wxpython");
  if (/\b(globalPluginHandler|appModuleHandler|addonHandler|nvdaHelper)\b/i.test(pythonSourceHints)) workspaceSignals.add("nvda-addon");
  if (/\b(react|next|vite|vue|svelte|astro|angular|nuxt|gatsby)\b/i.test(configuration)) workspaceSignals.add("web");

  const signals = taskSignals.size > 0 ? taskSignals : workspaceSignals;
  if (signals.has("nvda-addon")) signals.add("desktop");
  const hasDocuments = ["docx", "xlsx", "pptx", "pdf", "epub"].some((signal) => signals.has(signal));
  if (signals.has("desktop") || signals.has("python")) return { primary: "desktop", router: "developer-tools", coordinator: "developer-hub", signals: Array.from(signals) };
  if (hasDocuments) return { primary: "documents", router: "document-accessibility", coordinator: "document-accessibility-wizard", signals: Array.from(signals) };
  if (signals.has("markdown") && !signals.has("web")) return { primary: "markdown", router: "markdown-accessibility", coordinator: "markdown-a11y-assistant", signals: Array.from(signals) };
  return { primary: "web", router: "web-accessibility", coordinator: "accessibility-lead", signals: Array.from(signals) };
}

function promptSignals(prompt) {
  const signals = [];
  const text = String(prompt || "").toLowerCase();
  if (/\b(wxpython|pygame|pyside|pyqt|tkinter|kivy|pyglet|desktop app|native app)\b/.test(text)) signals.push("desktop");
  if (/\bwxpython\b/.test(text)) signals.push("wxpython");
  if (/\bnvda(?:[- ](?:add-on|addon)| plugin)\b/.test(text)) signals.push("nvda-addon");
  if (/\b(react|next\.?js|vue|svelte|astro|web app|web page|html|jsx|tsx)\b/.test(text)) signals.push("web");
  for (const extension of ["docx", "xlsx", "pptx", "pdf", "epub"]) {
    if (new RegExp(`\\b${extension}\\b`).test(text)) signals.push(extension);
  }
  if (/\b(markdown|readme|\.md\b)\b/.test(text)) signals.push("markdown");
  return signals;
}

function workspaceRoot(input) {
  const candidates = [input.workspace_root, input.workspaceRoot, input.cwd, input.working_directory, input.workingDirectory, process.cwd()];
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const resolved = resolve(String(candidate));
      if (statSync(resolved).isDirectory()) return resolved;
    } catch {
      // Try the next hook payload capability or process working directory.
    }
  }
  return null;
}

function workspaceFiles(workspace) {
  if (!workspace) return [];
  const files = [];
  const ignored = new Set([".git", "node_modules", ".venv", "venv", "dist", "build", ".next"]);
  const visit = (directory, depth) => {
    if (depth > 2 || files.length >= 200) return;
    let entries = [];
    try {
      entries = readdirSync(directory, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (ignored.has(entry.name)) continue;
      if (entry.isDirectory()) visit(join(directory, entry.name), depth + 1);
      else files.push({ name: entry.name, path: join(directory, entry.name) });
      if (files.length >= 200) return;
    }
  };
  visit(workspace, 0);
  return files;
}

function readPythonSourceHints(files) {
  return files
    .filter((file) => /\.pyw?$/i.test(file.name))
    .slice(0, 25)
    .map((file) => {
      try {
        return readFileSync(file.path, "utf8").slice(0, 4096);
      } catch {
        return "";
      }
    })
    .join("\n");
}

function readProjectConfiguration(workspace) {
  if (!workspace) return "";
  const files = ["package.json", "pyproject.toml", "requirements.txt", "setup.py", "Pipfile", "Cargo.toml", "go.mod", ".csproj"];
  return files.map((file) => {
    const path = join(workspace, file);
    try {
      return existsSync(path) ? readFileSync(path, "utf8") : "";
    } catch {
      return "";
    }
  }).join("\n");
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
    "web-accessibility-wizard",
    "developer-hub",
    "wxpython-specialist",
    "nvda-addon-specialist",
    "desktop-a11y-specialist",
    "desktop-a11y-testing-coach",
    "document-accessibility-wizard",
    "word-accessibility",
    "excel-accessibility",
    "powerpoint-accessibility",
    "pdf-accessibility",
    "epub-accessibility",
    "markdown-a11y-assistant"
  ]).has(agentType);
}

function sanitize(value) {
  return String(value).replace(/[^A-Za-z0-9_.-]/g, "_").slice(0, 120) || "unknown";
}

function writeJson(value) {
  process.stdout.write(JSON.stringify(value));
}
