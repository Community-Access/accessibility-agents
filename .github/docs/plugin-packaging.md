# Plugin Packaging Guide

How Accessibility Agents is packaged, distributed and installed in 7.x. The
standard behind it, and exactly which manifest each client reads, is in
[Agent Plugins 1.0](../../docs/standards/agent-plugins.md).

## What ships

One repository, one copy of each skill. Every client reads the same files.

| Path | What it is |
|---|---|
| `skills/` | 108 Agent Skills: 6 routers, and the specialists, helpers and reference skills they dispatch |
| `plugin.json` | Agent Plugins 1.0 manifest |
| `mcp.json` | Agent Plugins 1.0 MCP registration |
| `com.github.copilot/hooks/hooks.json` | Copilot CLI and VS Code plugin hooks |
| `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` | Claude Code manifest and the `community-access` marketplace |
| `.codex-plugin/plugin.json` | Codex compatibility manifest |
| `hooks/` | the hook guard and the per-client hook manifests |
| `mcp-server/` | the MCP server (39 tools); `mcp-server/dist/stdio.mjs` is the committed stdio bundle the plugins launch |
| `templates/` | scan configuration profiles |

## Distribution formats

### 1. Plugin (recommended where available)

```text
Claude Code   /plugin marketplace add Community-Access/accessibility-agents
              /plugin install accessibility-agents@community-access
Copilot CLI   copilot plugin marketplace add Community-Access/accessibility-agents
              copilot plugin install accessibility-agents@community-access
Codex         codex plugin marketplace add Community-Access/accessibility-agents
              codex plugin add accessibility-agents@community-access
              (skills and MCP server only; no edit gate, see below)
VS Code       Chat: Install Plugin From Source, with the repository URL
              (requires chat.plugins.enabled)
```

The plugin loads the skills and the hooks and starts the MCP server from its
bundle, `mcp-server/dist/stdio.mjs`, with no `npm install`. Only the optional
scanners (Playwright, `@axe-core/playwright`, `pdf-lib`, veraPDF) need
installing; the tools that need them say how.

On Codex the command is `codex plugin add`, not `install`. Codex reads the
repository's `.claude-plugin/marketplace.json`. Tested live with Codex CLI
0.165.0: the install registers the MCP server (`codex mcp list` shows
`mcp-server/dist/stdio.mjs`) and `codex debug prompt-input` lists exactly the
six routers. The Codex plugin does not load hooks: Codex 0.165.0 lists its
`plugin_hooks` feature as removed, and after `codex plugin add` Codex reports
no hooks. So on Codex the plugin gives the skills and the MCP server but no
edit gate. For the gate, use `npm run setup` instead, which writes
`~/.codex/hooks.json` (Codex then lists all six hooks), and register the server
with `codex mcp add accessibility-agents -- node "<checkout>/mcp-server/dist/stdio.mjs"`.
Use one route, not both.

### 2. Direct install from a checkout

```bash
git clone https://github.com/Community-Access/accessibility-agents
cd accessibility-agents
npm install
npm run setup -- --dry-run
npm run setup
```

`npm run setup` copies `skills/` to `~/.agents/skills` (Codex, Copilot CLI,
VS Code, Gemini CLI) and to `~/.gemini/config/skills` when Antigravity is
present, and writes the hook manifest for each client it finds. Claude Code
does not read `~/.agents/skills`; use the plugin, or `claude --plugin-dir` on
the checkout. See [Getting started](../../docs/getting-started/README.md).

### 3. MCP server only

```bash
node mcp-server/dist/stdio.mjs   # stdio bundle, no install needed
cd mcp-server
npm install                      # needed for the HTTP server and for development
npm start                        # Streamable HTTP on 127.0.0.1:3100
```

Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "a11y-agent-team": {
      "command": "node",
      "args": ["<path-to>/mcp-server/dist/stdio.mjs"]
    }
  }
}
```

The server provides 39 tools; the generated
[MCP tools reference](../../docs/reference/mcp-tools.md) lists them with their
annotations. Without the skills, a client gets the tools but not the guided
workflows.

## Custom packages and extensions

To add organization-specific rules or skills:

1. Fork the repository
2. Add a skill with `node scripts/new-skill.mjs <name> --tier specialist --domain <domain>`
3. Rebuild the dispatch matrices and catalog (`node scripts/build-dispatch-matrices.mjs`, `node scripts/build-docs.mjs`) so a router can reach it
4. Add organization-specific scan configuration in `templates/`
5. Run `npm run verify`, then distribute the fork as a marketplace or checkout

Trimming the package to a subset of skills is possible, but the routers'
dispatch matrices are generated from the skills present, so rebuild them after
removing any.

## Version management

Pin to a release tag or commit:

```bash
git clone --branch <tag> https://github.com/Community-Access/accessibility-agents.git
```

`git tag` lists the tags; tags before 7.0 contain the old per-client layout,
not this one. A Claude Code marketplace can also be pinned with `#ref`, for
example `/plugin marketplace add Community-Access/accessibility-agents#<tag>`.

Nothing in this package updates itself. A plugin follows your client's plugin
update settings; a checkout updates when you pull and run `npm run setup`
again.
