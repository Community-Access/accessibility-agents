# Accessibility Agents

WCAG 2.2 AA enforcement for agentic coding, as a set of Agent Skills. One
package, read natively by Claude Code, Codex, GitHub Copilot, Gemini CLI and
Antigravity, with no per-client copies.

Models forget accessibility while generating code. This package makes that
harder: it routes the work to the right specialist, blocks edits to user-facing
files until the accessibility lead has reviewed, and renders audit reports from
structured findings rather than from memory.

## Install

As a plugin (on Gemini CLI, an extension), which loads the skills, the hooks
and the MCP server registration (on Codex, the skills and the MCP server only: Codex no longer
loads plugin hooks, so use `npm run setup` there for the edit gate):

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

The MCP server ships as a single bundle, `mcp-server/dist/stdio.mjs`, so a
plugin install starts it with no `npm install`. Only the optional scanners
need installing: Playwright and `@axe-core/playwright` for the browser scans,
`pdf-lib` for PDF form conversion, and the veraPDF CLI. The tools that need
them say how when they are missing.

The MCP server on its own is published to npm as
`@community-access/accessibility-agents-mcp` and listed in the MCP Registry as
`io.github.Community-Access/accessibility-agents`, from 7.1.0 once the release
is published: `npx -y @community-access/accessibility-agents-mcp`. See
[the MCP server README](mcp-server/README.md).

Directly from a checkout, for Antigravity, or any client without
the plugin:

```bash
npm install
npm run setup -- --dry-run
npm run setup
```

`npm run setup` copies the skills to `~/.agents/skills`, the personal location
Codex, the Copilot CLI, VS Code and Gemini CLI read, and to
`~/.gemini/config/skills` when Antigravity is present. It writes the hook
manifest for Codex, Gemini CLI and Antigravity when they are present. It never overwrites a
hooks file or a skill you have edited, and `--dry-run` prints every action
without doing it. Claude Code does not read `~/.agents/skills`, so the
installer writes nothing for it: use the plugin, or start Claude Code with
`--plugin-dir` pointing at the checkout. For the optional scanners, run
`npm install --prefix mcp-server`, then `npx playwright install chromium` in
`mcp-server/`.

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

Those six dispatch a further 107 specialist, helper and reference skills by
name. The other 107 are invisible to the model until a router names one, which
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
skills/                  113 skills
  a11y-core/             shared contract, findings schema, scripts
  <router>/              the six entry points
  <specialist>/          one domain each, dispatched by a router
  kb-<domain>/           reference data: rule tables, URL registries, formulas
hooks/                   one guard script and the client hook manifests
com.github.copilot/      Copilot and VS Code plugin hooks (Agent Plugins 1.0)
mcp-server/              the scanners
docs/                    conformance dossier, guides, release notes
```

## Verify

```bash
npm run verify
```

Sixteen gates, each naming the standard it checks and what a failure would
cost; all sixteen passed on 2026-10-28. Two are optional: the dependency advisory check, and live sessions on
whichever of Claude Code, Codex and Copilot are installed.
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
| [Open Source Accessibility Framework](https://open-source-accessibility.github.io/Open-Source-Accessibility-Framework/) | how this project runs accessibility as an open source project, and what the agents help your project adopt |

## Privacy and data

Scanning runs on your machine. The package has no telemetry or analytics, needs
no account or key, and does not send your files or results to the project.
Outbound traffic happens only when you ask for it:

- the web scanners load the URLs you give them, in a local browser;
- the five GLOW tools (`glow_health_check`, `glow_audit_document`,
  `glow_fix_document`, `glow_convert_document`, `glow_generate_report`) send a
  request, and for the document tools the file you name, to the GLOW service at
  `https://letitglow.app/mcp`. GLOW is a separate service with its own terms;
  use these tools only on files you may share with it.

Details, including what is stored locally, are in [PRIVACY.md](PRIVACY.md).

## Accessibility of this project

How we work on our own accessibility, how to report a barrier (on GitHub or by
email) and how we respond are in [ACCESSIBILITY.md](ACCESSIBILITY.md). We
follow GitHub's [Open Source Accessibility Framework](https://open-source-accessibility.github.io/Open-Source-Accessibility-Framework/);
the agents can apply the same framework to your repository: ask your client to
adopt the Open Source Accessibility Framework, or one of its four phases
(foundational, workflow, testing, community).

[![Open Source Accessibility Framework progress for Accessibility Agents](https://img.shields.io/badge/Accessibility%20Framework-Accessibility%20Agents-F143AB?logo=github&logoColor=000000)](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/issues/52)

Our progress, action by action, is tracked in public in
[our framework tracking issue](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/issues/52).

## Contributing

Edit `skills/<name>/SKILL.md`, keep the body under 6 KiB, put the long tail in
`references/`, and run `npm run verify`. Details in
[CONTRIBUTING.md](./CONTRIBUTING.md), and the accessibility expectations for
every contribution in [ACCESSIBILITY.md](ACCESSIBILITY.md#contributor-expectations).

## History

Version 7.0 replaced six hand-maintained per-client trees with this one package.
The plan, the phases and the measured impact are in
[the modernization record](docs/history/2026-09-modernization.md). What comes
next is in [ROADMAP.md](ROADMAP.md).

## Licence

MIT. See [LICENSE](./LICENSE).
