# Troubleshooting Guide

Problems people hit with Accessibility Agents 7.x, grouped by symptom. For the
Copilot CLI specifically, see [Copilot CLI troubleshooting](copilot-cli-troubleshooting.md).

## Skills

### Symptom: the skills do not appear

Check the install path against what your client reads.

| Client | Where the skills must be |
|---|---|
| Claude Code | the installed plugin (`/plugin install accessibility-agents@community-access`), or `claude --plugin-dir <checkout>`. Claude Code does not read `~/.agents/skills` |
| Codex, Copilot CLI, VS Code, Gemini CLI | `~/.agents/skills` (written by `npm run setup`), or `.agents/skills` in the workspace (`node scripts/dev-link.mjs` in a checkout) |
| VS Code, plugin route | Chat: Install Plugin From Source, with `chat.plugins.enabled` on |
| Antigravity | `~/.gemini/config/skills` (written by `npm run setup` when Antigravity is present), or `.agents/skills` in the workspace |

A root `skills/` folder in a repository you open is not discovered by any of
these clients on its own. A GitHub Codespace on this repository is the
exception in practice: its dev container runs `npm run setup` on first start,
which copies the skills to `~/.agents/skills`.

### Symptom: only six skills are listed

That is intended. Six routers are model-invocable. 57 specialists are in the
`/` menu by name (for example `/aria-specialist`), and the 45 reference and
helper skills set `user-invocable: false`, so they appear in no menu; a router
dispatches them.

### Symptom: a skill fails to load or validate

```bash
npm run verify:spec          # Agent Skills frontmatter, every skill
npm run verify:conformance   # name matches folder, no byte-order mark
npm run verify:skills        # package rules: tiers, body size, links
```

## The edit gate

### Symptom: "Accessibility review required before editing this file"

The gate is working. Dispatch `accessibility-lead` (describe the change, or
type `/accessibility-lead`), let it finish, then retry the edit. Build output,
tests, stories and dependencies are exempt. See [Hooks](../reference/hooks.md).

### Symptom: the gate never opens

- Claude Code: the plugin's `hooks/hooks.json` opens the gate on `PostToolUse`
  for the Skill tool and on `SubagentStop`, when the skill named is
  `accessibility-lead` or `web-accessibility-wizard`. Use the plugin or
  `claude --plugin-dir <checkout>`. If an older installer left
  `~/.claude/a11y-hooks.json` and you merged it into your settings, remove
  those entries: on their own they refuse UI edits whenever the skills are not
  loaded. `npm run setup -- --uninstall` deletes the old file.
- Copilot: the gate opens on `postToolUse` after the lead runs. The plugin
  wires this through `com.github.copilot/hooks/hooks.json`.
- Antigravity: no manifest ships, because no documented Antigravity hook signal tells the guard that `accessibility-lead` ran, so the gate could never open.

To test the guard by hand, see "Testing a manifest by hand" in
[Hooks](../reference/hooks.md).

## MCP server

### Symptom: the server does not start

The plugins and `.vscode/mcp.json` launch the bundle, `mcp-server/dist/stdio.mjs`,
which needs no `npm install`. Run it directly to see any error:

```bash
node mcp-server/dist/stdio.mjs    # the stdio bundle the plugins launch
npm install --prefix mcp-server   # only for the HTTP server or the unbundled source
node mcp-server/server.js         # Streamable HTTP on 127.0.0.1:3100
```

Common errors:

- `ERR_MODULE_NOT_FOUND` from `server.js` or `stdio.js`: the source needs its dependencies; run the install above, or use the bundle
- `EADDRINUSE`: port 3100 is in use; set `PORT` to a free port
- a Node.js version error: use an LTS release (26, 24 or 22)

### Symptom: Playwright tools fail even though npm install succeeded

You may see errors similar to these:

- Cannot find module `playwright-core/lib/cli/program`
- Cannot find package `playwright-core` imported from `node_modules/playwright/index.mjs`

This usually means npm finished with a partial dependency graph.
`playwright` brings `playwright-core` with it, so reinstall it. From
`mcp-server/`:

```bash
cd mcp-server
npm install playwright @axe-core/playwright
npx playwright install chromium
```

Then verify Chromium resolution, still in `mcp-server/`:

```bash
node -e "import('playwright').then(async ({ chromium }) => { const fs = await import('node:fs'); const exe = chromium.executablePath(); console.log(exe); console.log(fs.existsSync(exe)); }).catch((e) => { console.error(e.message); process.exit(1); })"
```

Expected output ends with `true` on the second line.

### Symptom: VS Code does not list the server

VS Code reads MCP servers from `.vscode/mcp.json` in the workspace (key
`servers`) or from the user configuration (**MCP: Open User Configuration**).
This repository's own `.vscode/mcp.json` registers the bundle, so a checkout or
codespace of it lists the server. The root `mcp.json` is the Agent Plugins file,
read only when the repository is installed as a plugin. In another workspace,
add:

```json
{
  "servers": {
    "a11y-agent-team": {
      "type": "stdio",
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/stdio.mjs"]
    }
  }
}
```

Then run **MCP: List Servers** to see its status. If VS Code asked whether to
trust the server and you declined, start it again from that list.

### Symptom: an MCP tool is missing

Run `npm run probe:mcp` from the repository root. It connects a real client
and lists the 39 tools. If a Playwright or veraPDF tool reports that its
dependency is missing, install the optional dependency named in
[the MCP server README](../../mcp-server/README.md).

## Verifying the whole installation

```bash
npm run verify        # every gate
npm run verify:live   # what an installed client actually loads
```

## Resources

- [Getting Started](../getting-started/README.md): first-time setup
- [Configuration](../reference/configuration.md): scan configs, preferences, client settings
- [Hooks](../reference/hooks.md): the enforcement gate
- [GitHub Repository Issues](https://github.com/Community-Access/accessibility-agents/issues): report bugs
- [CHANGELOG](../../CHANGELOG.md): what is new in each version, and known issues
