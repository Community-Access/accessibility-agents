# Cross-Platform Tool Mapping

This document defines the canonical tool names for each platform and the mapping strategy used across all agent files in this repository.

## Platform Overview

| Platform | Agent Location | Tool Declaration Format | File Extension |
|----------|---------------|------------------------|----------------|
| Claude Code | `.claude/agents/` | YAML list (PascalCase) | `.md` |
| Copilot CLI | `.github/agents/` or `~/.copilot/agents/` | YAML array (camelCase) | `.agent.md` |
| VS Code Copilot | `.github/agents/` or VS Code User folder | YAML array (camelCase) | `.agent.md` |
| Codex CLI | `.codex/` | TOML | `.toml` |
| Gemini CLI | `.gemini/extensions/` | JSON manifest + skills | `.md` |

## Canonical Tool Mapping

### Core Operations

| Operation | Claude Code | Copilot CLI | VS Code Copilot | Codex | Notes |
|-----------|-------------|-------------|-----------------|-------|-------|
| Read file | `Read` | `read` | `readFile` | `read` | All platforms support |
| Edit file | `Edit` | `edit` | `editFiles` | `edit` | All platforms support |
| Create file | `Write` | `edit` | `createFile` | `write` | CLI uses `edit` for create |
| Search content | `Grep` | `search` | `textSearch` | `grep` | Pattern search in files |
| Find files | `Glob` | `search` | `fileSearch` | `glob` | Find by name pattern |
| Run command | `Bash` | `execute` | `runInTerminal` | `shell` | Shell command execution |
| Sub-agent | `Task` | `agent` | `runSubagent` | N/A | Delegate to another agent |
| Web fetch | `WebFetch` | `web` | `fetch` | `web` | HTTP requests |
| User input | `ask_user` | N/A | `askQuestions` | N/A | Prompt for user input |

### Platform-Specific Tools

| Tool | Platform | Purpose |
|------|----------|---------|
| `getDiagnostics` | VS Code only | Access editor diagnostic messages |
| `listDirectory` | VS Code only | List directory contents |
| `getTerminalOutput` | VS Code only | Read from terminal buffer |
| `NotebookRead` / `NotebookEdit` | VS Code only | Jupyter notebook operations |
| `TodoWrite` | VS Code only | VS Code task management |
| `WebSearch` | Claude Code | Web search (distinct from fetch) |

### MCP Tools (Desktop Extension)

| Tool | Platform | Purpose |
|------|----------|---------|
| `run_playwright_keyboard_scan` | Claude Desktop MCP | Keyboard navigation testing |
| `run_playwright_state_scan` | Claude Desktop MCP | ARIA state validation |
| `run_playwright_viewport_scan` | Claude Desktop MCP | Responsive testing |
| `run_playwright_contrast_scan` | Claude Desktop MCP | Color contrast analysis |
| `run_playwright_a11y_tree` | Claude Desktop MCP | Accessibility tree inspection |

## Strategy: Canonical Names per Platform

### Why Not Use One Universal Set?

Each platform has different capabilities and different tool availability:

1. **Claude Code** - Uses PascalCase tool names from Anthropic's tool spec
2. **Copilot CLI** - Uses lowercase aliases that map internally
3. **VS Code Copilot** - Uses camelCase with richer tool set (diagnostics, notebooks)
4. **Codex** - Uses its own TOML-based tool declarations

Attempting to use one set everywhere fails because:
- Claude Code doesn't recognize `readFile` (only `Read`)
- Copilot CLI silently ignores `Read` (only recognizes `read`)
- VS Code-specific tools like `getDiagnostics` don't exist in CLI

### Solution: Maintain Separate Agent Files

This repository maintains parallel agent definitions:

```
.github/agents/        # Copilot (VS Code + CLI)
.claude/agents/        # Claude Code
.codex/roles/          # Codex CLI
.gemini/extensions/    # Gemini CLI
```

Each set uses the **canonical tool names for that platform**.

## Copilot Agent File Standard

For `.github/agents/*.agent.md` files, use these tool names:

```yaml
tools: ['read', 'edit', 'search', 'runInTerminal', 'askQuestions']
```

### Preferred (CLI-compatible) Names

| Use This | Instead Of | Reason |
|----------|------------|--------|
| `read` | `readFile` | CLI canonical |
| `edit` | `editFiles` | CLI canonical |
| `search` | `textSearch`, `fileSearch` | CLI canonical (both map to it) |
| `agent` | `runSubagent` | CLI canonical |

### VS Code-Only Tools (Keep As-Is)

These are VS Code-specific and won't work in CLI anyway:

| Tool | Keep? | Reason |
|------|-------|--------|
| `getDiagnostics` | Yes | VS Code editor integration |
| `listDirectory` | Yes | VS Code file explorer |
| `getTerminalOutput` | Yes | VS Code terminal integration |
| `askQuestions` | Yes | User interaction (CLI has equivalent) |
| `runInTerminal` | Yes | Maps to `execute` in CLI |

### Recommended Copilot Agent Tool Declaration

```yaml
# Most agents
tools: ['read', 'edit', 'search', 'runInTerminal', 'askQuestions']

# Read-only agents (scanners, analyzers)
tools: ['read', 'search']

# Orchestrator agents (wizards, leads)
tools: ['agent', 'read', 'search', 'edit', 'runInTerminal', 'askQuestions']
```

## Claude Code Agent File Standard

For `.claude/agents/*.md` files, use these tool names:

```yaml
tools:
  - Read
  - Edit
  - Grep
  - Glob
  - Bash
  - Task
```

### Full Claude Code Tool Set

| Tool | Purpose |
|------|---------|
| `Read` | Read file contents |
| `Edit` | Modify existing files |
| `Write` | Create new files |
| `Bash` | Run shell commands |
| `Grep` | Search file contents |
| `Glob` | Find files by pattern |
| `Task` | Delegate to sub-agent |
| `WebFetch` | HTTP requests |
| `ask_user` | Prompt for user input |

## Migration Checklist

When updating agent files for cross-platform compatibility:

### Copilot Agents (`.github/agents/*.agent.md`)

- [ ] Replace `readFile` → `read`
- [ ] Replace `editFiles` → `edit`
- [ ] Replace `textSearch` → `search`
- [ ] Replace `fileSearch` → `search`
- [ ] Replace `runSubagent` → `agent`
- [ ] Keep `runInTerminal` (maps to `execute`)
- [ ] Keep `askQuestions` (platform-specific)
- [ ] Keep `getDiagnostics` (VS Code-only, graceful degrade)
- [ ] Keep `createFile` (VS Code-only, graceful degrade)
- [ ] Keep `listDirectory` (VS Code-only, graceful degrade)

### Claude Code Agents (`.claude/agents/*.md`)

- [ ] Use PascalCase: `Read`, `Edit`, `Grep`, `Glob`, `Bash`, `Task`
- [ ] Do not use: `readFile`, `editFiles`, `search`, `runInTerminal`

## Validation

Run this to check Copilot agent files for non-canonical tool names:

```bash
# Find VS Code-specific names that should be CLI aliases
grep -rn "readFile\|editFiles\|textSearch\|fileSearch\|runSubagent" .github/agents/
```

Run this to check Claude Code agent files:

```bash
# Find non-PascalCase tool names
grep -rn "tools:" .claude/agents/ | grep -E "'[a-z]"
```
