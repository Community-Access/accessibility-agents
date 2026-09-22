# Insiders Accessibility Tracker reference: VS Code 1.113 Features for Accessibility

Part of the `insiders-a11y-tracker` skill. Read this only when the task reaches these sections.

## VS Code 1.113 Features for Accessibility

VS Code 1.113 (March 2026) builds on the 1.112 accessibility workflow improvements. When reporting on recent VS Code updates, highlight these capabilities:

### Agent Debugging & Troubleshooting

- **`/troubleshoot` skill** — Type `/troubleshoot` in chat followed by a question to analyze agent debug logs directly. Use this to debug why accessibility instructions or agents aren't loading correctly.
- **Agent Debug Logs** — Enable `github.copilot.chat.agentDebugLog.enabled` and `github.copilot.chat.agentDebugLog.fileLogging.enabled` to export JSONL debug logs. Useful for sharing agent behavior analysis with teams.
- **Export/Import Debug Sessions** — Save agent debug sessions as OTLP JSON files for offline analysis or team sharing.
- **Copilot CLI and Claude session coverage** — Agent Debug Logs now cover Copilot CLI and Claude agent sessions, not just local sessions.

### MCP Across Agent Types

- **VS Code MCP bridging** — MCP servers registered in VS Code now flow into Copilot CLI and Claude agents too, including workspace `mcp.json` definitions.

### Chat Customizations and Orchestration

- **Chat Customizations editor** — Central UI for managing instructions, prompt files, agents, skills, MCP servers, and plugins.
- **Nested subagents** — `chat.subagents.allowInvocationsFromSubagents` enables recursive or coordinator-worker patterns when intentionally designed.

### Image Analysis for Accessibility

- **`chat.imageSupport.enabled`** — Agents can now read image files from disk natively. This enables:
  - Analyzing screenshots to suggest appropriate alt text
  - Visually detecting contrast violations in UI screenshots
  - Reviewing image-heavy pages for accessibility without manual descriptions
- **`imageCarousel.explorerContextMenu.enabled`** — Batch-browse images from the Explorer context menu.

### Monorepo Support

- **`chat.useCustomizationsInParentRepositories`** — VS Code now discovers agent customizations (instructions, agents, skills, hooks) from parent folders up to the repository root. Teams using accessibility agents in a monorepo subfolder can inherit all customizations without opening the full repo.

### Integrated Browser Debugging

- **`editor-browser` debug type** — Debug web apps directly in VS Code's integrated browser. Launch configurations work similarly to `chrome` or `msedge` types. This enables end-to-end accessibility testing without leaving VS Code.
- **Independent zoom levels** — The integrated browser has its own zoom, useful for testing reflow/zoom accessibility (WCAG 1.4.4, 1.4.10).
- **Self-signed certificate trust** — Local HTTPS accessibility testing is easier in the integrated browser during development.

### Permission Levels

- **Autopilot mode** (`chat.autopilot.enabled`) — Auto-approves all tool calls and continues working autonomously. Good for read-only accessibility scans. Use with caution for fix-applying workflows.
- **Bypass Approvals** — Auto-approves tools without dialog prompts. Useful for batch scanning but bypasses safety confirmations.

### MCP Server Sandboxing

- **`sandboxEnabled: true`** in `mcp.json` — Run MCP servers in a sandboxed environment with restricted file system and network access on supported hosts. Enhances security for accessibility scanning tools that only need read access.

When users ask about "what's new in VS Code for accessibility," include both GitHub issues with the `accessibility` label AND these platform features that enhance accessibility workflows.
