# Agent Plugins 1.0

The packaging format that lets one directory install as a plugin on every
client that supports plugins.

| | |
|---|---|
| Specification | <https://agent-plugins.org/> |
| Schema | `https://agent-plugins.org/schemas/1.0.0/plugin.schema.json` |
| Steward | a technical steering committee with members from Amazon, Cursor, Microsoft, OpenAI and Vercel |
| Supported by | VS Code, Copilot CLI, the Copilot app and SDK, Cursor, Kiro; Codex still reads its own manifest |
| Governs here | `plugin.json` at the repository root |
| Checked by | `claude plugin validate .` and `scripts/check-release-consistency.js` |

## What the specification requires

A `plugin.json` at the plugin root declaring the schema, a name, a version and
a description, with paths to the components: `skills/` for Agent Skills,
`mcp.json` for MCP servers. Client-specific extras go in reverse-domain
directories such as `com.github.copilot/`, so they cannot collide.

This package's manifest:

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  "name": "accessibility-agents",
  "version": "7.0.0",
  "skills": "./skills/",
  "mcp": "./mcp.json"
}
```

## The two thin manifests beside it

Two clients read their own manifest rather than the 1.0 one. Both point at the
same `skills/` directory and carry the same version, and a gate fails if the
versions disagree.

| File | Read by | Holds |
|---|---|---|
| `.claude-plugin/plugin.json` | Claude Code, and VS Code as a fallback | name, version, description |
| `.codex-plugin/plugin.json` | Codex | name, version, `skills: ./skills/`, `mcpServers: ./mcp.json` |

`.claude-plugin/marketplace.json` lists this repository as a marketplace with
one plugin whose source is `.`, so `/plugin marketplace add` and
`/plugin install` work against it directly.

## What was removed

Before 7.0 there were five packaging surfaces: a Claude plugin directory, a
Codex plugin directory, a Gemini extension manifest, a Copilot `plugin.yaml`
and a VS Code extension. Each held its own copy of every agent. They are gone;
VS Code installs Agent Plugins natively now, which is why the extension is
deprecated rather than kept.

## Installing

```text
Claude Code   /plugin marketplace add Community-Access/accessibility-agents
Copilot       copilot plugin install accessibility-agents
Codex         /plugins, then add this repository
Any client    node scripts/install.mjs   (copies skills/ to ~/.agents/skills)
```

## What is checked

Every claim above is checked by a tool.

| Claim | Tool |
|---|---|
| The marketplace and plugin manifests are valid | `claude plugin validate .` |
| All manifests and the MCP server agree on one version | `scripts/check-release-consistency.js` |
| Nothing hard-codes the version | `scripts/check-release-consistency.js` |
| The plugin loads and exposes exactly the six routers | `scripts/verify-live.mjs` |

## Sources

- Agent Plugins: <https://agent-plugins.org/>
- Announcement, 2026-08-12: <https://github.blog/changelog/2026-08-12-agent-plugins-1-0-in-vs-code-copilot-cli-and-the-copilot-app/>
- Claude Code plugins: <https://code.claude.com/docs/en/plugins>
- Codex plugins: <https://learn.chatgpt.com/docs/plugins>
- Copilot CLI plugins: <https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-cli-plugins>
