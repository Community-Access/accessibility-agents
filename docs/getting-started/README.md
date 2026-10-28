# Getting started

Ten minutes from clone to a first audit, on any of the five clients. Nothing
here needs a compiler, an extension, or a per-client layout: the package is one
`skills/` directory that every client reads.

## What you need

- Node.js on an LTS line: 26, 24 or 22 (Node 20 reached end of life on 30 April 2026)
- One of: Claude Code, Codex CLI, GitHub Copilot CLI or VS Code, Gemini CLI, Antigravity
- For document scanning, nothing extra; for PDF/UA validation, veraPDF; for
  behavioural web scans, Playwright. Each is detected and reported, never assumed.

## Install

### As a plugin, which loads the skills, the hooks and the MCP server registration

```text
Claude Code   /plugin marketplace add Community-Access/accessibility-agents
              /plugin install accessibility-agents@community-access
Copilot CLI   copilot plugin marketplace add Community-Access/accessibility-agents
              copilot plugin install accessibility-agents@community-access
Codex         codex plugin marketplace add Community-Access/accessibility-agents
              codex plugin add accessibility-agents@community-access
              (skills and MCP server only; no edit gate, see below)
VS Code       Chat: Install Plugin From Source, with the repository URL
              (requires the chat.plugins.enabled setting)
Gemini CLI    gemini extensions install https://github.com/Community-Access/accessibility-agents
              (uses the extension archive attached to each release, from 7.1.0)
```

The MCP server ships as a single bundle (`mcp-server/dist/stdio.mjs`), so the
plugin starts it with no `npm install`. Only the optional scanners need
installing: Playwright and `@axe-core/playwright` for the browser scans,
`pdf-lib` for PDF form conversion, and the veraPDF CLI. The tools that need
them say how when they are missing.

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

### Directly from a checkout, for any client

```bash
git clone https://github.com/Community-Access/accessibility-agents
cd accessibility-agents
npm install
npm run setup -- --dry-run
npm run setup
```

`npm install` only installs the development tooling; it no longer runs the
installer. The MCP server's stdio bundle needs no install; run
`npm install --prefix mcp-server` only to use the HTTP server (`server.js`) or
to work on the server's source. `npm run setup` copies `skills/` to `~/.agents/skills`, the personal
location Codex, the Copilot CLI, VS Code and Gemini CLI read, and to
`~/.gemini/config/skills` when Antigravity is present. It writes a hook manifest
for Codex, Gemini CLI and Antigravity when it finds them and prints what is
left to merge by hand. It never overwrites a hooks file or a skill you have edited, and
`--dry-run` prints every action without doing it. Claude Code does not read
`~/.agents/skills`, so the installer writes nothing for it: use the plugin, or
`claude --plugin-dir <checkout>`. For the optional scanners, run
`npm install --prefix mcp-server`, then `npx playwright install chromium` in
`mcp-server/`. Antigravity gets its own hook manifest, written to
`~/.gemini/config/hooks.json`; its gate opens when Antigravity reads the lead's
`SKILL.md`, and it is tested against the payloads Antigravity documents, not yet in a live Antigravity session.

### In a GitHub Codespace

The repository has a dev container (`.devcontainer/devcontainer.json`, Node 24).
On first start it installs the root and MCP server dependencies, installs
Playwright's Chromium for the browser scans, and runs `npm run setup`, which
copies the skills to `~/.agents/skills`, a location VS Code reads. The
workspace's `.vscode/mcp.json` registers the bundled MCP server. So Copilot Chat
in a codespace has the skills, the MCP server and the browser scanners with no
further steps. veraPDF is not installed; add it if you need PDF/UA validation.

### For developing this repository

```bash
node scripts/dev-link.mjs
```

Links `.agents/skills` to `skills/` so Codex, Copilot, VS Code, Gemini CLI and Antigravity read the checkout directly.
Claude Code needs no link: run it with `--plugin-dir .`.

## Your first audit

Describe the problem. You do not need to name a skill, but you can.

| Say something like | What happens |
|---|---|
| "Review this modal for accessibility" | `accessibility-lead` picks the modal, keyboard and ARIA specialists, runs them in parallel, and tells you whether it ships |
| "Audit the whole site" | `web-accessibility-wizard` asks four questions, then runs every domain and writes `WEB-ACCESSIBILITY-AUDIT.md` |
| "Check these PDFs" | `document-accessibility-wizard` scans each file and writes a scored report |
| "Fix the markdown in docs/" | `markdown-a11y-assistant` scans, shows you the fixes it wants to make, and waits |

Six skills are model-invocable; they are the only ones the model sees. A router
dispatches the other 102 by name without loading their instructions into its
own context. 57 of those, such as `/aria-specialist`, are also in the slash
menu; the 45 reference and helper skills set `user-invocable: false` and are
not.

## What the gate does

Once installed, an edit to a user-facing file is refused until
`accessibility-lead` has completed in the session:

```text
Accessibility review required before editing this file. Dispatch the
accessibility-lead skill, let it finish, then retry the edit.
```

That is the intended behaviour, not a fault. Build output, tests, stories and
dependencies are exempt. The reminder that explains the gate appears once per
session, not on every prompt.

## Reading a report

Every accessibility audit report has the same seven sections, because a script writes them from the
skills' findings rather than the model typing them:

1. Metadata: what was audited, with what, under which settings
2. Executive summary: score out of 100, grade, verdict
3. Severity breakdown
4. Findings: rule, criterion, location, problem, fix
5. Remediation priorities, with repeated components first
6. Next steps
7. Delta against the previous report, when there is one

The merged findings are embedded at the end of the report, which is what makes
the next run's delta free.

## Verify the installation

```bash
npm run verify        # every gate
npm run verify:live   # what a real client session actually loads
npm run measure       # what the package costs, per client
```

## Next

- [Skills reference](../reference/skills/README.md): every skill, by tier and domain
- [Configuration](../reference/configuration.md): scan config files and budgets
- [Hooks](../reference/hooks.md): the gate in detail, per client
- [Troubleshooting](../guides/troubleshooting.md)
