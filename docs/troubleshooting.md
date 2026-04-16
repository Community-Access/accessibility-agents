# Troubleshooting Guide

## MCP Troubleshooting

### Symptom: Playwright install fails even though npm install succeeded

You may see errors similar to these:

- Cannot find module `playwright-core/lib/cli/program`
- Cannot find package `playwright-core` imported from `node_modules/playwright/index.mjs`

This usually means npm finished with a partial dependency graph where `playwright` exists but `playwright-core` is missing.

#### What the installer now does

The installer now checks for `playwright-core` after installing Playwright browser tooling.
If `playwright-core` is missing, it attempts an automatic repair by installing `playwright-core` (matching the detected Playwright version when possible), then retries Chromium installation.

If setup still fails, the installer now prints the relevant npm and Playwright error output tail instead of a generic failure message.

#### Manual recovery

From the MCP server folder:

```bash
cd mcp-server
npm install playwright @axe-core/playwright
npm install playwright-core
npx playwright install chromium
```

Then verify Chromium resolution:

```bash
node -e "import('playwright').then(async ({ chromium }) => { const fs = await import('node:fs'); const exe = chromium.executablePath(); console.log(exe); console.log(fs.existsSync(exe)); }).catch((e) => { console.error(e.message); process.exit(1); })"
```

Expected output ends with `true` on the second line.

### Run Full Post-Install Validation and Repair

Use the repair scripts to run an extensive validation pass across everything the installer configured, then automatically repair common issues.

Windows PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/repair-install.ps1
```

Shell (macOS/Linux/Git Bash):

```bash
bash scripts/repair-install.sh
```

What these scripts validate and repair:

- Destination paths recorded by the install summary JSON
- MCP base dependencies (`@modelcontextprotocol/sdk`, `zod`)
- Playwright dependency integrity (`playwright` + `playwright-core`)
- Playwright Chromium availability and executable resolution
- Stale duplicate Copilot assets in VS Code profile roots

Outputs:

- Updates install summary JSON and appends structured findings to `issues`
- Updates `issueCount` and `lastRepairRun` metadata
- Writes a standalone repair report:
  - Project scope: `.a11y-agent-team-repair-summary.json`
  - Global scope: `~/.a11y-agent-team-repair-summary.json`

Recommended cadence:

- Run once after install or update
- Run in CI or scheduled maintenance for managed environments
- Run after any npm cache reset, Node runtime change, or profile migration

### Symptom: "MCP connection refused" or Agent can't reach MCP tools

#### Step 1: Verify MCP Server is Running

**VS Code Copilot (Insiders):**
```
Command Palette → MCP: List Servers
(or Ctrl+Shift+P, type "list servers")
```

This shows all registered MCP servers and their connection status. Look for:
- ✅ **Connected** — Server is running and accessible
- ❌ **Failed** — Server errored on startup
- ⏳ **Connecting** — Server is booting (may take a few seconds)

#### Step 2: Check Workspace vs Profile Configuration

MCP servers are registered in **two possible places**:

**Workspace-level** (`~/workspace/.vscode/settings.json` or `.code-workspace`):
```json
{
  "mcpServers": {
    "accessibility": {
      "command": "node",
      "args": ["path/to/mcp-server/server.js"]
    }
  }
}
```

**Profile-level** (`~/.vscode/settings.json`):
```json
{
  "mcpServers": {
    "accessibility": {
      "command": "node",
      "args": ["path/to/mcp-server/server.js"]
    }
  }
}
```

**VS Code 1.113 Behavior:**
- Workspace MCP servers **override** profile MCP servers with the same name
- Both are merged if names don't conflict
- Check **both locations** if a server is not appearing

**To Debug:**
1. Open Settings (`Ctrl+,`)
2. Search for "MCP" — shows active MCP configuration
3. Look for `mcpServers` object
4. Verify `command` path is correct and executable
5. Verify `args` array has correct server path and arguments

#### Step 3: Verify Trust Prompt

When an MCP server first connects, VS Code may show:

```
Allow MCP server 'accessibility-agents' to run?
[Allow]  [Deny]  [Don't ask again]
```

If you clicked **Deny**, the server is blocked:

**To Re-enable:**
1. Command Palette → **Preferences: Open Settings (JSON)**
2. Find `"untrustedMcpServers"` (if it exists)
3. Remove the server name from the list or delete the property
4. Restart VS Code
5. Trust prompt will reappear

**Or use CLI:**
```bash
# List all denied MCP servers
code --list-extensions --show-versions

# To reset (use with caution):
rm ~/.vscode/mcp-trust.json  # (macOS/Linux)
# or
Remove-Item $env:APPDATA\Code\mcp-trust.json  # (Windows PowerShell)
```

#### Step 4: Check Server Logs

If `MCP: List Servers` shows the server as **Failed**:

**For Stdio-based servers** (local Node.js):
```bash
# Run the server directly to see errors:
node path/to/mcp-server/server.js
```

Look for:
- Port binding errors (address already in use)
- File not found errors (bad path in settings)
- Module import errors (missing dependencies)
- Proxy/firewall errors (if server makes HTTP requests)

**For HTTP-based servers** (this repo's default):
1. Check if HTTP port is open: `netstat -an | grep LISTEN` (Windows) or `lsof -i -P -n | grep LISTEN` (macOS/Linux)
2. Verify server process is running: `ps aux | grep mcp-server`
3. Check server logs file (if configured): `tail -f /tmp/mcp-server.log`

#### Step 5: Verify MCP Bridging (VS Code 1.113+)

**New in 1.113:** MCP servers registered in VS Code are bridged to Copilot CLI and Claude agents.

**If using Copilot CLI:**
```bash
copilot /agent accessibility-lead
# If MCP is not bridged, agent won't have access to MCP tools
```

**To verify bridging:**
1. Check `copilot config show` — lists active profiles
2. Ensure VS Code workspace is the active Copilot profile: `copilot profile set --workspace`
3. Run `copilot /agent` without args — shows available agents; look for "MCP tools" section

**If MCP not showing in Copilot CLI:**
- MCP servers must be in **workspace-level** `.vscode/settings.json` or `.code-workspace` file
- Profile-level MCP servers are **not** bridged to CLI
- Move the `mcpServers` configuration to `.vscode/settings.json` in your workspace root

### Symptom: Agent Can't Use MCP Tools

If an agent is invoked but complains "Tool not found" or "MCP tool unavailable":

#### Check 1: Tool Name Mismatch

MCP tools are namespaced. The agent must reference them correctly:

```yaml
tools:
  - read        # Built-in VS Code tool
  - mcp: axe-core/scan          # MCP-based tool (MCP 1.113 format)
  - mcp: accessibility/batch-scan  # Different MCP namespace
```

**Old vs New format:**
- **Pre-1.113:** `axe-core-scan` (just a name)
- **1.113+:** `mcp: namespace/tool-name` (explicit namespace)

Check the agent's `tools:` list — ensure MCP tools use the **new `mcp:` prefix** format.

#### Check 2: MCP Tool Availability

Not all MCP tools are available from all servers. Verify the tool exists:

```
Command Palette → MCP: Debug Tools
(Shows all tools provided by all MCP servers)
```

Look for the tool in this list. If missing:
1. Verify MCP server is Connected (not Failed)
2. Check server configuration — may need to enable the tool in `mcpServers` settings
3. Restart VS Code to reload MCP servers

#### Check 3: MCP Server Permissions

Some MCP tools require file system or network access. Check:
1. Does the node process running the MCP server have read/write permissions?
2. Is the server in a restricted folder (e.g., `/Program Files`, cloud-synced folder)?
3. Are firewall rules blocking HTTP requests (if server makes external calls)?

**Solution:** Run MCP server with elevated permissions or move to a user-writable directory.

### Symptom: MCP Server Crashes on Agent Startup

If `MCP: List Servers` shows a server as **Failed** every time you restart:

#### Step 1: Check Prerequisites

The MCP server in this repo requires:
- **Node.js 18+** (check: `node --version`)
- **npm or yarn** (for dependency installation)
- **Port 8000 available** (for HTTP server; configurable in `mcp-server/server.js`)

```bash
# Verify Node.js version
node --version
# Should output: v18.0.0 or higher

# Install dependencies
cd mcp-server
npm install  # or: yarn install
```

#### Step 2: Run Server Standalone

```bash
cd mcp-server
node server.js
```

Watch for errors:
- `EADDRINUSE` → Port 8000 in use; change port in `server.js` line ~XX
- `ERR_MODULE_NOT_FOUND` → Missing dependencies; run `npm install`
- `Permission denied` → File permission issue; check folder ownership

#### Step 3: Check VS Code MCP Config

In settings.json, verify the path to server is correct:

```json
{
  "mcpServers": {
    "accessibility": {
      "command": "node",
      "args": [
        "/full/path/to/mcp-server/server.js"
      ]
    }
  }
}
```

**Use absolute paths**, not relative paths. Example:
- ✅ `c:\\Users\\username\\code\\agents\\mcp-server\\server.js` (Windows)
- ✅ `/Users/username/code/agents/mcp-server/server.js` (macOS)
- ❌ `./mcp-server/server.js` (relative — may fail if cwd changes)

#### Step 4: Enable MCP Debug Logging

Add to settings.json:
```json
{
  "mcp.debug": true,
  "mcp.logLevel": "debug"
}
```

Then check **Output** panel (`Ctrl+Shift+U`) → **MCP** tab for detailed logs.

### Symptom: MCP Server Too Slow / High Latency

If agents are taking a very long time to respond:

#### Step 1: Check Network

```bash
# Test connectivity to MCP server
curl http://localhost:8000/health

# If using remote MCP server, measure latency:
ping mcp-server-host.com
```

#### Step 2: Check Agent Call Graph

Open **Agent Debug Log** (`chat.agentDebugLog.enabled: true`):
1. Run the agent
2. Watch MCP tool invocations in the log
3. Note which tools are slow (high duration)
4. Slow tools are likely: file I/O, network bounds, or complex computation

#### Step 3: Optimize Server Configuration

In `mcp-server/server.js`, consider:
- Caching results (avoid re-scanning same content)
- Batching tool calls (fewer roundtrips)
- Reducing output verbosity (less data over wire)

Or in agent instructions, consider:
- Reducing scope (scan fewer files)
- Using internal helpers in parallel instead of serial calls

## Agent Troubleshooting

### Symptom: Agent Not Appearing in Agent Picker

#### Check 1: Agent File Location

Agent files must be in `.github/agents/` (for Copilot) or `.claude/agents/` (for Claude Code).

```bash
ls -la .github/agents/ | grep "^-" | wc -l
# Should show 80+ agent files
```

#### Check 2: Frontmatter Syntax

Open the agent file and verify YAML frontmatter is valid:

```yaml
---
name: my-agent
description: What this agent does
tools: ['read', 'edit', 'runInTerminal']
---

Agent instructions in markdown...
```

**Common errors:**
- Missing `---` delimiters
- Indentation in YAML (must be 2 spaces, not tabs)
- Unclosed quotes or brackets
- Reserved characters not escaped (`|`, `&`, `*` in YAML need quotes)

#### Check 3: Run Validator

```bash
node scripts/validate-agents.js
```

Look for errors like:
- `Invalid frontmatter` — fix YAML syntax
- `Missing description` — all agents must have `description:`
- `Unknown tool` — check tool name spelling
- `Tool not prefixed` — MCP tools must have `mcp:` prefix in 1.113+

#### Check 4: Clear Agent Cache

VS Code caches agent definitions. Reload:
```
Command Palette → Developer: Restart Extension Host
(or close/reopen VS Code)
```

### Symptom: Agent Gives Wrong Guidance or Hangs

#### Check 1: Review Instructions

Open the agent file and read the instructions section. Is it clear? Does it match the agent's purpose?

#### Check 2: Check Agent Allowlist (If Coordinator)

If the agent is a coordinator (e.g., `accessibility-lead`), verify its `agents:` frontmatter list:

```yaml
agents:
  - web-accessibility-wizard
  - aria-specialist
  # ... all agents it can invoke
```

Missing agents in this list won't be invoked. Add them if needed and run the validator.

#### Check 3: Check for Circular Delegation

Verify no agent delegates to itself, and no agent chain forms a cycle:

```bash
# Build a delegation graph:
grep -h "^agents:" .github/agents/*.agent.md | sort -u
```

Look for cycles like:
- A → B → A
- A → B → C → A

If found, remove the cycle-closing delegation.

#### Check 4: Enable Agent Debug Log

```
Command Palette → Developer: Toggle Developer Tools
(or F12)
```

Switch to the **Console** tab and run the agent. Watch for:
- JavaScript errors
- Server connection errors
- Tool invocation failures

### Symptom: Validator Rejects New Agent

Run validator and note the error:

```bash
node scripts/validate-agents.js 2>&1 | grep "ERROR"
```

**Common validator errors:**

| Error | Fix |
|-------|-----|
| `Missing frontmatter` | Add `---` delimiters |
| `Invalid YAML` | Check indentation (2 spaces) |
| `Missing 'name'` | Add `name: agent-name` to frontmatter |
| `Missing 'description'` | Add `description: What this agent does` |
| `Unknown tool 'xyz'` | Use correct tool name; prefix MCP tools with `mcp:` |
| `Tool not in agents list` | If agent uses `agent` tool, must have `agents:` frontmatter |
| `Agents list incomplete` | Coordinator must list *all* agents it calls |

## Configuration Troubleshooting

### Symptom: Agent Settings Not Taking Effect

#### Check 1: Setting Format

VS Code settings for agents are in Copilot's namespace. Verify:

```json
{
  "github.copilot.chat.agentDebugLog.enabled": true,
  "chat.useCustomizationsInParentRepositories": true,
  "chat.subagents.allowInvocationsFromSubagents": false
}
```

Not:
```json
{
  "agent.debug": true  // ❌ Wrong namespace
}
```

#### Check 2: Workspace vs Profile

Settings in `.vscode/settings.json` override global settings. If a setting isn't working:

1. Check **Workspace settings** (`.vscode/settings.json`)
2. Check **Global settings** (`~/.config/Code/user/settings.json`)
3. Workspace wins if both exist

#### Check 3: Customizations Discovery

If `.github/copilot-instructions.md` changes aren't picked up:

```
Command Palette → Copilot: Reload Customizations
```

Or enable monorepo discovery:

```json
{
  "chat.useCustomizationsInParentRepositories": true
}
```

This loads customizations from parent folders (helps in monorepos where you open a subfolder).

## Performance Troubleshooting

### Slow Agent Response

**Symptom:** Agent takes 30+ seconds to respond

#### Check 1: Agent Parallelism

If the agent spawns many subagents, they should run **in parallel**, not serial:

```yaml
# Good: Spawn multiple agents in parallel
agents:
  - aria-specialist     # parallel
  - keyboard-navigator  # parallel
  - contrast-master     # parallel
```

If response is slow, the agent might be calling agents **sequentially**. Review agent instructions for `then`, `after`, `following` — these hint at serial execution.

#### Check 2: MCP Tool Latency

Use Agent Debug Log to identify slow MCP tool calls:
1. Open Agent Debug Log
2. Look for `mcp: tool-name` entries with high duration (ms)
3. That tool is the bottleneck

Optimization:
- Reduce tool scope (fewer files to scan)
- Cache results (don't re-scan same content)
- Use parallel tool calls instead of serial

#### Check 3: Token Budget

If the agent stops early, it may have hit token budget. Check:
- Does the output say "response was truncated"?
- Are instructions too verbose? Consider shortening them
- Are examples too large? Inline only essential examples

## Resources

- [Configuration Guide](configuration.md) — Agent settings and options
- [Subagent Architecture](subagent-architecture.md) — How agents delegate to each other
- [Getting Started](getting-started.md) — First-time setup
- [GitHub Repository Issues](https://github.com/Community-Access/accessibility-agents/issues) — Report bugs
- [CHANGELOG](../CHANGELOG.md) — What's new in each version (check for known issues)
