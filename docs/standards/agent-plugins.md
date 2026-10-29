# Agent Plugins 1.0

The packaging format that lets one directory install as a plugin on every
client that supports plugins.

| | |
|---|---|
| Specification | <https://agent-plugins.org/> |
| Schema | `https://agent-plugins.org/schemas/1.0.0/plugin.schema.json` |
| Steward | a technical steering committee with members from Amazon, Cursor, Microsoft, OpenAI and Vercel |
| Supported by | VS Code, Copilot CLI, the Copilot app and the Copilot SDK (GA, August 2026), Cursor, Kiro; Codex documents the 1.0 `plugin.json` as the portable entry point for new packages |
| Governs here | `plugin.json`, `mcp.json` and `com.github.copilot/` at the repository root |
| Checked by | `claude plugin validate .` and `scripts/check-release-consistency.js` |

## What the specification requires

A `plugin.json` at the plugin root. Its schema is closed: it allows only
`$schema`, `name`, `version`, `description`, `author`, `homepage`,
`repository`, `license`, `keywords` and `extensions`, and a client reports and
ignores anything else. Components are found at fixed paths rather than
declared: Agent Skills in `skills/`, MCP servers in `mcp.json`. `mcp.json` must
carry `$schema: https://agent-plugins.org/schemas/1.0.0/mcp.schema.json` and
`mcpServers` only, and every server needs a `type`; a client disables MCP for a
plugin whose `mcp.json` lacks the `$schema`. Client-specific extras go in
reverse-domain directories such as `com.github.copilot/`, so they cannot
collide.

This package's manifest, abridged (keywords omitted):

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  "name": "accessibility-agents",
  "version": "7.1.0",
  "description": "WCAG 2.2 AA enforcement across web UI, Office and PDF documents, markdown and desktop apps. ...",
  "author": { "name": "Community Access" },
  "license": "MIT",
  "homepage": "https://github.com/Community-Access/accessibility-agents",
  "repository": "https://github.com/Community-Access/accessibility-agents"
}
```

And its `mcp.json`:

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
  "mcpServers": {
    "accessibility-agents": {
      "type": "stdio",
      "command": "node",
      "args": ["${PLUGIN_ROOT}/mcp-server/dist/stdio.mjs"]
    }
  }
}
```

Both validate against the published 1.0.0 schemas. The Copilot and VS Code
hooks are in `com.github.copilot/hooks/hooks.json`, rooted at `${PLUGIN_ROOT}`.

Both manifests launch the bundled server, `mcp-server/dist/stdio.mjs` (built
with esbuild by `npm run build --prefix mcp-server`), so a plugin install, which
has no `node_modules`, starts it with no `npm install`. The optional scanners
(Playwright, `@axe-core/playwright`, `pdf-lib`, veraPDF) are left out of the
bundle and installed separately; the tools that need them say how.

## The client manifests beside it

Claude Code reads its own manifest format, and Codex keeps a compatibility
manifest. They carry the same version; `scripts/check-release-consistency.js`
fails if `package.json`, `plugin.json`, the two manifests below,
`mcp-server/package.json` or the MCP Registry entry `server.json` (its own
version and the npm package version it points at) disagree, seven versions in
all. It does not check
`.claude-plugin/marketplace.json`, which also says 7.1.0.

| File | Read by | Holds |
|---|---|---|
| `.claude-plugin/plugin.json` | Claude Code (VS Code also recognises it) | name, version, description, author (URL `https://community-access.org`), `mcpServers` launching `${CLAUDE_PLUGIN_ROOT}/mcp-server/dist/stdio.mjs`; the icon is the file `.claude-plugin/icon.png` beside it |
| `hooks/hooks.json` | Claude Code plugin | the hook registrations (Codex no longer loads plugin hooks; it gets the gate from `npm run setup`) |
| `.codex-plugin/plugin.json` | Codex, as a compatibility fallback to the root `plugin.json` | name, version, description, author (an object, URL `https://community-access.org`), license, homepage, repository, keywords, `skills` |

VS Code recognises root `plugin.json`, `.claude-plugin/plugin.json` and the
legacy `.plugin/plugin.json`; its documentation does not say which wins when
more than one is present.

`.claude-plugin/marketplace.json` lists this repository as a marketplace named
`community-access` with one plugin whose source is `.`, so
`/plugin marketplace add Community-Access/accessibility-agents` and
`/plugin install accessibility-agents@community-access` work against it
directly.

## What was removed

Before 7.0 there were five packaging surfaces: a Claude plugin directory, a
Codex plugin directory, a Gemini extension manifest, a Copilot `plugin.yaml`
and a VS Code extension. Each held its own copy of every agent. They are gone;
VS Code installs Agent Plugins natively now, so the extension has been removed
too.

## Installing

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
Gemini CLI    gemini extensions install https://github.com/Community-Access/accessibility-agents
              (uses the extension archive attached to each release, from 7.1.0)
Any client    npm run setup   (copies skills/ to ~/.agents/skills; see Getting started)
```

On Codex the command is `codex plugin add`, not `install`. Codex reads the
repository's `.claude-plugin/marketplace.json`. Tested live with Codex CLI
0.165.0: the install registers the MCP server (`codex mcp list` shows
`mcp-server/dist/stdio.mjs`) and `codex debug prompt-input` lists exactly the
six routers. The Codex plugin does not load hooks: Codex 0.165.0 lists its
`plugin_hooks` feature as removed, and after `codex plugin add` Codex reports
no hooks. So on Codex the plugin gives the skills and the MCP server but no
edit gate. For the gate, use `npm run setup` instead, which writes
`~/.codex/hooks.json` (it defines seven hooks; Codex loaded all six before the `PostToolUse` entry was added), and register the server
with `codex mcp add accessibility-agents -- node "<checkout>/mcp-server/dist/stdio.mjs"`.
Use one route, not both.

## The Gemini CLI extension

The Gemini CLI extension is a separate archive, `accessibility-agents.tar.gz`,
built by `node scripts/build-gemini-extension.mjs` and attached to each
published release by `.github/workflows/release-assets.yml`. It holds
`gemini-extension.json` at its root (with `AGENTS.md` as the context file),
the skills, the guard with Gemini's hook manifest as `hooks/hooks.json`, and
the bundled MCP server. It is separate because a Gemini extension reads
`hooks/hooks.json`, which in this repository is the Claude Code plugin's hook
manifest, and one file cannot serve both clients without each warning about
the other's events. Tested with Gemini CLI 0.66.0: `gemini extensions
validate` passes, and an install loads `AGENTS.md`, the MCP server and the
skills. The edit gate inside the extension was not exercised in a live, signed-in
Gemini session. Listing in the Gemini extensions gallery needs the
`gemini-cli-extension` repository topic; Gemini's documentation does not say
outright whether the gallery lists a manifest found only in a release archive.

## OpenAI plugin directory (ChatGPT and Codex)

ChatGPT and Codex share one plugin directory. Plugins are submitted through the
OpenAI Platform at <https://platform.openai.com/plugins>, and every submission
is reviewed by OpenAI. This package goes there as a skills-only plugin: OpenAI
limits local MCP servers to approved partners and to a desktop-only listing,
and its guide for submitting a Claude Code plugin says to remove hooks before
public submission and to leave MCP configuration out of a skills-only upload.

`npm run package:openai` builds `dist/accessibility-agents-openai-<version>.zip`
with one plugin root:

- `plugin.json`, generated from the repository's `plugin.json` with the author
  set to Jeff Bishop, a description that claims no hooks and no scanners, and
  the listing fields under `extensions.com.openai.interface` (display name,
  short and long description, developer name, category, capabilities, starter
  prompts, brand colour, logo, composer icon, and the website, support and
  privacy policy URLs). The repository's own `plugin.json` is not changed,
  because the other clients read it;
- `skills/`, every skill unchanged, each with the `agents/openai.yaml` that
  holds its display name, short description and implicit-invocation policy;
- `assets/logo.png` and `assets/icon.png`, both copies of
  `.claude-plugin/icon.png`;
- `LICENSE`, `PRIVACY.md` and `README.md`, with relative links pointed at the
  repository.

It leaves out `hooks/`, `mcp.json`, `.mcp.json`, `mcp-server/`,
`.claude-plugin/`, `.codex-plugin/`, `com.github.copilot/`, `scripts/`,
`docs/`, the CI and editor folders, `templates/`, `example/`, `action/`,
`manifest.json`, `server.json`, `budgets.json`, `AGENTS.md` and `CLAUDE.md`.
The portal generates the plugin's `.codex-plugin/plugin.json` from the upload;
the one in this repository is for the marketplace route and is not shipped.

Before it writes anything, the script checks OpenAI's limits and names the
file that breaks one: skill names present and unique, `accessibility-agents:<skill>`
at most 64 characters, skill descriptions at most 1,024, no skill folder
starting with a dot and no loose files under `skills/`; `agents/openai.yaml`
with `interface.display_name`, `interface.short_description`, and a `policy`
holding only `products` and `allow_implicit_invocation`; no hooks, MCP or app
configuration and no screenshots; square PNG images of 48 to 4,096 pixels
under 5 MiB; a display name and short description of at most 30 characters, a
long description of at most 4,000, a developer name of at most 80, at most
three starter prompts of at most 128 characters with no `@`; a category from
OpenAI's list; a six-digit hex brand colour with at least 2:1 contrast against
`#FFFFFF` and against `#212121` (`#2E7D32` has 5.1:1 and 3.1:1); HTTPS for every
URL; and an archive under 100 MB and 5,000 entries whose paths are relative,
use `/` and contain no `..`. `scripts/package-openai-plugin.test.mjs` has a
fixture that breaks each limit, and runs as the `package:openai` gate.

For ChatGPT users the directory listing replaces the marketplace route: open
Plugins, search for Accessibility Agents and install it. Codex users keep
`codex plugin marketplace add`, which also brings the MCP server. In ChatGPT
there are no hooks and no MCP server, so the edit gate does not exist there
and a skill that would need a scanner asks for the checker's results.
Whether an entry point in ChatGPT can reach a specialist whose
`allow_implicit_invocation` is false has not yet been tested.

## What is checked

Every claim above is checked by a tool.

| Claim | Tool |
|---|---|
| The marketplace and plugin manifests are valid | `claude plugin validate .`; on 2026-10-28 it warned only that `CLAUDE.md` is not loaded from a plugin, since the package ships `.claude-plugin/icon.png` (1024 px, white and yellow on #0B3D91, contrast 10.0:1 and 7.1:1) |
| All manifests and the MCP server agree on one version | `scripts/check-release-consistency.js` |
| Nothing hard-codes the version | `scripts/check-release-consistency.js` |
| The plugin loads and exposes exactly the six routers | `scripts/verify-live.mjs` |
| The OpenAI directory package meets every published limit and leaves out hooks and MCP | `scripts/package-openai-plugin.mjs`, tested by `scripts/package-openai-plugin.test.mjs` |

## Sources

- Agent Plugins: <https://agent-plugins.org/>
- Announcement, 2026-08-12: <https://github.blog/changelog/2026-08-12-agent-plugins-1-0-in-vs-code-copilot-cli-and-the-copilot-app/>
- Claude Code plugins: <https://code.claude.com/docs/en/plugins>
- Codex plugins: <https://learn.chatgpt.com/docs/plugins>
- Skills in ChatGPT and Codex: <https://learn.chatgpt.com/docs/build-skills>
- OpenAI plugin guidelines: <https://developers.openai.com/plugins/plugin-guidelines>
- Submitting to the OpenAI plugin directory: <https://developers.openai.com/plugins/deploy/submission>
- Submit your Claude Code plugin to OpenAI: <https://developers.openai.com/plugins/guides/submit-claude-plugin>
- Desktop-only plugins (local MCP): <https://developers.openai.com/plugins/deploy/desktop-only>
- Agent Plugins 1.0 specification and schemas: <https://github.com/agentplugins/agent-plugins-spec>
- VS Code agent plugin reference: <https://code.visualstudio.com/docs/agents/reference/agent-plugin-reference>
- Copilot CLI finding and installing plugins: <https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/plugins-finding-installing>
- Copilot CLI plugins: <https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-cli-plugins>
