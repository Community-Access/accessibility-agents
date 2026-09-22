# Accessibility Agents

WCAG 2.2 AA enforcement for agentic coding, as a set of Agent Skills. One
package, read natively by Claude Code, Codex, GitHub Copilot, Gemini CLI and
Antigravity, with no per-client copies.

Models forget accessibility while generating code. This package makes that
harder: it routes the work to the right specialist, blocks edits to user-facing
files until the accessibility lead has reviewed, and renders audit reports from
structured findings rather than from memory.

## Install

```bash
npm install
node scripts/install.mjs
```

That copies the skills to `~/.agents/skills`, the shared location Codex,
Copilot, Gemini and Antigravity read, and writes the hook manifest for whichever
clients are present. It never overwrites a hooks file or a skill you have
edited. Add `--dry-run` to see what it would do.

As a plugin, which wires the hooks for you:

```text
Claude Code   /plugin marketplace add Community-Access/accessibility-agents
Copilot       copilot plugin install accessibility-agents
Codex         /plugins, then add this repository
```

## How to use it

Describe the problem. Six entry points route the rest.

| You are working on | Skill |
|---|---|
| HTML, JSX, TSX, Vue, Svelte, CSS, or a server template | `accessibility-lead` |
| A full site or app audit rather than one change | `web-accessibility-wizard` |
| Word, Excel, PowerPoint, PDF or ePub files | `document-accessibility-wizard` |
| Markdown documentation | `markdown-a11y-assistant` |
| Python, wxPython, desktop apps, NVDA add-ons, accessibility tooling | `developer-hub` |
| Issues, pull requests, releases, projects, actions, security, teams, wikis | `github-hub` |

Those six dispatch a further 102 specialist, helper and reference skills by
name. The other 102 are invisible to the model until a router names one, which
is why the whole package costs about 1,100 tokens before you have said anything.

## What it does

- **Reviews web UI** across ARIA, keyboard, focus, forms, contrast, modals, live
  regions, headings, tables, links, cognitive load, internationalisation,
  performance, mobile, email, data visualisation and web components.
- **Scans documents** for Office, PDF and ePub accessibility, one file or a
  whole tree, and generates remediation scripts.
- **Audits markdown** for link text, alt text, heading order, tables, emoji and
  diagrams.
- **Blocks unreviewed edits.** A hook refuses a write to a user-facing file
  until the accessibility lead completes, on every client that supports hooks.
- **Renders reports.** Findings are JSON; a script writes the report, computes
  the score, and shows the delta against the previous run.
- **Supplies scanners over MCP.** Thirty-nine tools: axe-core, Office, PDF,
  ePub, markdown, veraPDF, Playwright behavioural scans, audit history and
  report rendering.

## Layout

```text
AGENTS.md                the always-on contract, under 1,200 tokens
CLAUDE.md                one line, importing AGENTS.md
plugin.json              Agent Plugins 1.0 manifest
mcp.json                 MCP server registration
skills/                  108 skills
  a11y-core/             shared contract, findings schema, scripts
  <router>/              the six entry points
  <specialist>/          one domain each, dispatched by a router
  kb-<domain>/           reference data: rule tables, URL registries, formulas
hooks/                   one guard script, four client manifests
mcp-server/              the scanners
docs/                    conformance dossier, guides, release notes
```

## Verify

```bash
npm run verify
```

Fifteen gates, each naming the standard it checks and what a failure would
cost, including live sessions on Claude Code, Codex and Copilot.
The evidence, measured results and the one documented deviation from the Agent
Skills specification are in
[the conformance dossier](./docs/standards/conformance.md).

```bash
npm run measure           # what the package costs, per client
npm run measure:dispatch  # what dispatching a specialist costs
npm run probe:mcp         # the MCP tool surface
```

## Standards

Each standard, with what it governs.

| Standard | Governs |
|---|---|
| [Agent Skills](https://agentskills.io/specification) | every skill |
| [AGENTS.md](https://agents.md/) | the always-on contract |
| [Agent Plugins 1.0](https://agent-plugins.org/) | packaging |
| [Model Context Protocol](https://modelcontextprotocol.io/) | the scanners |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | every criterion a finding cites |

## Contributing

Edit `skills/<name>/SKILL.md`, keep the body under 6 KiB, put the long tail in
`references/`, and run `npm run verify`. Details in
[CONTRIBUTING.md](./CONTRIBUTING.md).

## History

Version 7.0 replaced six hand-maintained per-client trees with this one package.
The plan, the phases and the measured impact are in
[the modernization record](docs/history/2026-09-modernization.md). What comes
next is in [ROADMAP.md](ROADMAP.md).

## Licence

MIT. See [LICENSE](./LICENSE).
