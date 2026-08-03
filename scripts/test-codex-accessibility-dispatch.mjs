#!/usr/bin/env node
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = process.cwd();
const hook = resolve(root, "codex-plugin/hooks/a11y-codex-dispatch-guard.mjs");
const fixtures = mkdtempSync(join(tmpdir(), "a11y-codex-dispatch-"));

function makeFixture(name, files) {
  const directory = join(fixtures, name);
  for (const [relativePath, content] of Object.entries(files)) {
    const path = join(directory, relativePath);
    mkdirSync(resolve(path, ".."), { recursive: true });
    writeFileSync(path, content);
  }
  return directory;
}

function dispatch(workspace, prompt, payloadKey = "workspace_root") {
  const output = runHook(workspace, {
    hook_event_name: "UserPromptSubmit", prompt, session_id: "surface-test", turn_id: "turn-1", [payloadKey]: workspace,
  });
  return output?.hookSpecificOutput?.additionalContext || "";
}

function runHook(workspace, input) {
  const stdout = execFileSync(process.execPath, [hook], {
    cwd: workspace,
    env: { ...process.env, PLUGIN_DATA: join(workspace, ".hook-data") },
    input: JSON.stringify(input),
    encoding: "utf8",
  });
  return stdout ? JSON.parse(stdout) : "";
}

function expectAgents(context, expected, unexpected = []) {
  for (const agent of expected) assert.match(context, new RegExp(`\\b${agent}\\b`));
  for (const agent of unexpected) assert.doesNotMatch(context, new RegExp(`\\b${agent}\\b`));
}

try {
  const web = makeFixture("web", {
    "package.json": JSON.stringify({ dependencies: { react: "^19.0.0" } }),
    "src/app.js": "export const App = () => null;",
  });
  expectAgents(dispatch(web, "Fix the accessible modal"), ["accessibility-lead", "aria-specialist", "keyboard-navigator", "modal-specialist"]);

  const desktop = makeFixture("desktop", {
    "pyproject.toml": '[project]\ndependencies = ["wxPython>=4.2"]\n',
    "src/main.py": "import wx\n",
  });
  expectAgents(dispatch(desktop, "Review the UI accessibility", "cwd"), ["developer-hub", "desktop-a11y-specialist", "desktop-a11y-testing-coach", "wxpython-specialist"], ["accessibility-lead", "keyboard-navigator"]);

  const documents = makeFixture("documents", { "report.pdf": "placeholder" });
  expectAgents(dispatch(documents, "Audit this report for accessibility"), ["document-accessibility-wizard", "pdf-accessibility"], ["accessibility-lead"]);

  const markdown = makeFixture("markdown", { "README.md": "# Guide\n" });
  expectAgents(dispatch(markdown, "Review the markdown accessibility"), ["markdown-a11y-assistant"], ["accessibility-lead"]);

  const mixed = makeFixture("mixed", { "report.pdf": "placeholder", "pyproject.toml": 'dependencies = ["pygame"]\n' });
  expectAgents(dispatch(mixed, "Review the React web app accessibility"), ["accessibility-lead", "aria-specialist", "keyboard-navigator"], ["desktop-a11y-specialist", "document-accessibility-wizard"]);
  expectAgents(dispatch(mixed, "Test the web app with NVDA accessibility"), ["accessibility-lead", "aria-specialist", "keyboard-navigator"], ["nvda-addon-specialist"]);

  const nvda = makeFixture("nvda", { "src/addon.py": "import nvdaHelper\n" });
  expectAgents(dispatch(nvda, "Review NVDA add-on accessibility"), ["developer-hub", "desktop-a11y-specialist", "desktop-a11y-testing-coach", "nvda-addon-specialist"], ["accessibility-lead"]);

  const python = makeFixture("python", { "app.py": "print('ready')\n", "README.md": "# Command line tool\n" });
  expectAgents(dispatch(python, "Review the UI accessibility"), ["developer-hub", "desktop-a11y-specialist", "desktop-a11y-testing-coach"], ["markdown-a11y-assistant"]);

  const plain = makeFixture("plain", { "notes.txt": "No framework signal" });
  assert.equal(dispatch(plain, "Fix this typo"), "");

  const gate = makeFixture("gate", { "pyproject.toml": 'dependencies = ["pygame"]\n', "app.py": "import pygame\n" });
  dispatch(gate, "Fix the desktop UI accessibility");
  const blocked = runHook(gate, {
    hook_event_name: "PreToolUse", session_id: "surface-test", turn_id: "turn-1", tool_input: { patch: "*** Update File: app.py" },
  });
  assert.equal(blocked.hookSpecificOutput.permissionDecision, "deny");
  runHook(gate, {
    hook_event_name: "SubagentStart", session_id: "surface-test", turn_id: "turn-1", agent_type: "developer-hub",
  });
  assert.equal(runHook(gate, {
    hook_event_name: "PreToolUse", session_id: "surface-test", turn_id: "turn-1", tool_input: { patch: "*** Update File: app.py" },
  }), "");
  const incompleteStop = runHook(gate, { hook_event_name: "Stop", session_id: "surface-test", turn_id: "turn-1" });
  assert.equal(incompleteStop.decision, "block");
  assert.match(incompleteStop.reason, /developer-hub completion/);
  assert.doesNotMatch(incompleteStop.reason, /accessibility-lead/);
  for (const agent_type of ["developer-hub", "desktop-a11y-specialist", "desktop-a11y-testing-coach"]) {
    runHook(gate, { hook_event_name: "SubagentStop", session_id: "surface-test", turn_id: "turn-1", agent_type });
  }
  assert.equal(runHook(gate, { hook_event_name: "Stop", session_id: "surface-test", turn_id: "turn-1" }), "");

  console.log("Codex accessibility project-surface routing tests passed.");
} finally {
  rmSync(fixtures, { recursive: true, force: true });
}
