# Configuration

## Character Budget (Claude Code only)

If you have many agents or skills installed, you may hit Claude Code's description character limit (defaults to 15,000 characters). Agents will silently stop loading. Increase the budget:

**macOS/Linux:**

```bash
export SLASH_COMMAND_TOOL_CHAR_BUDGET=30000
```

Add to `~/.bashrc`, `~/.zshrc`, or your shell profile.

**Windows (PowerShell):**

```powershell
$env:SLASH_COMMAND_TOOL_CHAR_BUDGET = "30000"
```

Add to your PowerShell profile (`$PROFILE`).

## Permission Levels (VS Code 1.112+)

VS Code 1.112 introduces permission levels that control how much autonomy agents have during a session. These are particularly relevant for accessibility audits.

### Available Permission Levels

| Level | Description | Use Case |
|-------|-------------|----------|
| **Default Approvals** | Uses your configured approval settings. Tools requiring approval show a confirmation dialog. | Normal interactive work. Recommended for fix-applying workflows. |
| **Bypass Approvals** | Auto-approves all tool calls without dialogs. Auto-retries on errors. | Batch scanning where you trust the agent. Use with read-only scans. |
| **Autopilot** (Preview) | Auto-approves tools, auto-responds to questions, continues autonomously until complete. | Hands-free accessibility audits. **Read-only scans only.** |

### Enable Autopilot

```json
{
  "chat.autopilot.enabled": true
}
```

Autopilot is enabled by default in Insiders builds.

### When to Use Each Level for Accessibility Work

**Default Approvals (Recommended for fixes):**

- When running `web-accessibility-wizard` in fix mode
- When applying document accessibility fixes
- Any workflow that edits files
- When you want to review each agent action

**Bypass Approvals:**

- Running batch scans across many files
- Document inventory and delta scanning
- When you trust the agent and want faster results
- Still shows tool results, just auto-approves

**Autopilot (Read-only scans only):**

- Full site accessibility audits
- Large document library scans
- Overnight or scheduled audit runs
- **Never use for fix-applying workflows** - too risky for unattended file changes

### Security Considerations

Both Bypass Approvals and Autopilot bypass manual approval prompts, including for potentially destructive actions:

- File edits
- Terminal commands
- External API calls

**Recommendations:**

1. Never use Autopilot in untrusted repositories
2. For fix workflows, always use Default Approvals
3. For scanning, Bypass Approvals is sufficient
4. Review the first time warning carefully

### Changing Permission Level

Select the permission level from the permissions dropdown in the Chat view input area. You can change it at any time during a session.

To stop an autonomous agent, click the stop button in the Chat view.

## Monorepo Configuration (VS Code 1.112+)

For monorepo setups where you open a package subfolder rather than the repo root:

```json
{
  "chat.useCustomizationsInParentRepositories": true
}
```

This discovers agent customizations from parent folders up to the `.git` root. See [Advanced Scanning Patterns](advanced/advanced-scanning-patterns.md#monorepo-customization-discovery-vs-code-1112) for details.

## Agent Debug Settings (VS Code 1.112+)

Enable these for debugging accessibility agent issues:

```json
{
  "github.copilot.chat.agentDebugLog.enabled": true,
  "github.copilot.chat.agentDebugLog.fileLogging.enabled": true
}
```

With both enabled:

- Use `/troubleshoot` to analyze agent behavior directly in chat
- Export debug sessions as JSONL for offline analysis
- Import sessions from teammates for troubleshooting

See [Agent Debug Panel Guide](guides/agent-debug-panel.md) for full details.

## Image Analysis Settings (VS Code 1.112+)

Enable for visual accessibility analysis:

```json
{
  "chat.imageSupport.enabled": true,
  "imageCarousel.explorerContextMenu.enabled": true
}
```

This allows:

- alt-text-headings to analyze actual images and compare against alt text
- contrast-master to analyze screenshots for visual contrast issues
- Batch image review via the carousel view

## Troubleshooting

### Agents not appearing (Claude Code)

Type `/agents` to see what is loaded. If agents do not appear:

1. **Check file location:** Agents must be `.md` files in `.claude/agents/` (project) or `~/.claude/agents/` (global)
2. **Check file format:** Each file must start with YAML front matter (`---` delimiters) containing `name`, `description`, and `tools`
3. **Check character budget:** Increase `SLASH_COMMAND_TOOL_CHAR_BUDGET` (see above)

### Extension not working (Claude Desktop)

1. **Check installation:** Settings > Extensions in Claude Desktop
2. **Try reinstalling:** Download latest .mcpb from Releases page
3. **Check version:** Requires Claude Desktop 0.10.0 or later

### Agents seem to miss things

1. Invoke the specific specialist directly: `/aria-specialist review components/modal.tsx`
2. Ask for a full audit: `/accessibility-lead audit the entire checkout flow`
3. Open an issue if a pattern is consistently missed

### Copilot CLI issues

See the dedicated [Copilot CLI Troubleshooting Guide](guides/copilot-cli-troubleshooting.md).

## Tool Alias Reference

Different platforms use different tool names. Agent files may declare platform-specific tools that get mapped to standard aliases.

### Copilot CLI Tool Aliases

CLI uses these standard aliases. Agent declarations using compatible aliases will work:

| CLI Alias | Compatible Declarations | Purpose |
|-----------|------------------------|---------|
| `read` | `Read`, `view`, `NotebookRead`, `readFile` | Read file contents |
| `edit` | `Edit`, `MultiEdit`, `Write`, `NotebookEdit`, `str_replace`, `str_replace_editor`, `editFiles` | Edit files |
| `search` | `Grep`, `Glob`, `textSearch`, `fileSearch` | Search files |
| `execute` | `Bash`, `shell`, `powershell`, `runInTerminal` | Run shell commands |
| `agent` | `Task`, `custom-agent`, `runSubagent` | Delegate to sub-agent |
| `web` | `WebSearch`, `WebFetch`, `fetch` | Fetch web content |
| `todo` | `TodoWrite` | Task management (VS Code only) |

### Claude Code Tool Names

Claude Code uses these native tool names:

| Tool | Purpose |
|------|---------|
| `Read` | Read files |
| `Edit` | Edit files |
| `Write` | Create files |
| `Bash` | Run shell commands |
| `Grep` | Search file contents |
| `Glob` | Find files by pattern |
| `Task` | Delegate to sub-agent |
| `WebFetch` | Fetch web content |

### VS Code Extension Tool Names

VS Code Copilot extension uses:

| Tool | Purpose |
|------|---------|
| `readFile` | Read files |
| `editFiles` | Edit files |
| `createFile` | Create files |
| `runInTerminal` | Run commands |
| `textSearch` | Search contents |
| `fileSearch` | Find files |
| `runSubagent` | Delegate to agent |
| `getDiagnostics` | Get editor diagnostics |
| `askQuestions` | Prompt user for input |
| `listDirectory` | List directory contents |
| `getTerminalOutput` | Read terminal output |

### Cross-Platform Agent Files

Agent files in this project use VS Code-style tool declarations because that's the most common deployment target. When running in Copilot CLI:

1. Compatible tools are mapped automatically (e.g., `readFile` → `read`)
2. Unknown tools are silently ignored
3. Core read/edit/search functionality works across all platforms

For maximum compatibility when creating new agents, use these universal tool names:

```yaml
tools: ['read', 'edit', 'search', 'execute', 'agent']
```
