# Codex Subagents

> **Historical.** This document describes the repository as it was before
> version 7.0, when agents lived in six per-client directories. It is kept
> for the record and is not maintained. The current layout is one `skills/`
> directory; start at [the documentation index](../README.md).
> Original path: `docs/guides/codex-experimental-multi-agent.md`.

Accessibility Agents v6 includes a native Codex plugin and Codex custom subagent layer installed by the universal installer.

This guide explains what gets installed, why the plugin exists, and how users should ask Codex to use the Accessibility Agents team.

## Upstream Codex References

- [OpenAI Codex: Subagents](https://developers.openai.com/codex/subagents/)
- [OpenAI Codex: Agent Skills](https://developers.openai.com/codex/skills.md)
- [OpenAI Codex: Plugins](https://developers.openai.com/codex/plugins.md)
- [OpenAI Codex: Custom instructions with AGENTS.md](https://developers.openai.com/codex/guides/agents-md.md)

## Why Codex Uses a Plugin

Accessibility Agents has many specialists. If all specialists are installed as top-level Codex skills, Codex can hit skill-description context limits and shorten the visible skill descriptions.

The v6 plugin avoids that by using:

- a small router skill surface
- native Codex custom subagents
- lazy-loaded specialist references
- extension manifests for built-in and custom extension packs

This means Codex can see the Accessibility Agents entry points without loading every specialist instruction into the first turn.

Codex defaults `agents.max_depth` to `1`, which lets the root session spawn one child agent but prevents that child from spawning specialists. Accessibility Agents needs the Claude-style path `root session -> accessibility-lead -> specialist agents`, so the installer configures `agents.max_depth = 2` and `agents.max_threads = 10`.

Accessibility Agents also treats installation as the user's standing request to
use the lead-dispatch workflow for accessibility work. For web accessibility
tasks, the router should spawn `accessibility-lead` first unless the user asks
for a single-agent pass. During installation, the universal installer reads the
current Codex `model` from `config.toml` and stamps that model into the installed
agent TOML files. This keeps the source templates portable while avoiding an
unsupported custom-agent default in local ChatGPT Codex sessions.

When spawning a named Accessibility Agents subagent, pass task context explicitly
instead of requesting a full-history fork. Codex rejects typed custom-agent
spawns that also try to inherit the full parent history.

If the active tool list does not show `multi_agent_v1.spawn_agent`, the router
must call `tool_search` for multi-agent subagent tooling before claiming
subagents are unavailable. A local-only review is not an acceptable silent
fallback for Accessibility Agents workflows; if tool discovery still cannot
expose subagents, stop and ask the user to enable subagents or explicitly
approve a local fallback. Spawned Accessibility Agents subagents should receive
the router skill context so they follow the same lead-first dispatch contract.

There is no Codex config switch today that auto-spawns a custom subagent solely
because a skill matched. Accessibility Agents makes the workflow as seamless as
Codex allows by keeping the visible router description explicit, treating the
installation as standing authorization to dispatch the lead, and validating that
the router refuses silent local-only fallback.

The Codex plugin ships lifecycle hook files as a guardrail, and the installer
registers those files once in `~/.codex/hooks.json` for current Codex builds:

- `UserPromptSubmit` adds model-visible context when the user asks for UI or web work.
- `SubagentStart` records that `accessibility-lead` and tracked web specialists started for the current turn.
- `SubagentStop` records that `accessibility-lead` and tracked web specialists completed for the current turn.
- `PreToolUse` blocks UI file edits through supported edit tools until that turn has an `accessibility-lead` dispatch marker.
- `Stop` blocks the final response for UI or web work until `accessibility-lead` and the required specialists have completed.

Hooks are the enforcement layer, not the dispatcher. The model still needs to use
the router skill and spawn `accessibility-lead`; the hook prevents the common
failure mode where Codex notices the skill but decides to continue locally. It
also prevents the partial-dispatch failure mode where Codex starts the lead,
keeps working, and finalizes before the lead and specialists synthesize results.
Current Codex builds expose `hooks` as a stable feature while `plugin_hooks`
appears removed in `codex features list`; the user-level hook registration is
the active enforcement path. The plugin manifest intentionally does not
advertise hooks directly, because running both plugin-bundled hooks and the
user-level registration duplicates `UserPromptSubmit` context.
Codex requires non-managed command hooks to be reviewed and trusted before they
run, so a fresh install may prompt the user once before enforcement becomes
active.

## What Gets Installed

When you select Codex support, the universal installer installs:

- the Accessibility Agents Codex plugin
- router skills for web, documents, GitHub workflows, developer tools, and markdown
- all built-in Codex custom subagents
- lazy specialist reference files
- built-in extension manifests
- the Codex lifecycle hook guard for UI edit enforcement
- a user-level `~/.codex/hooks.json` mirror of the hook guard for current Codex builds
- install manifest entries for repair and uninstall

The old direct Codex skill pack remains in the repository as a fallback source, but the v6 installer prefers the plugin path.

For Codex marketplace loading, the installed marketplace entry uses the relative plugin path `./.agents/plugins/a11y-agents-codex`. Codex resolves personal marketplace paths from the home directory, not from the `~/.agents/plugins` folder itself. Absolute local paths are rejected by Codex marketplace loading and will make Codex skip the plugin payload.

The installer also runs:

```bash
codex plugin add a11y-agents-codex@accessibility-agents
```

That step is required for hooks. A visible router skill alone does not prove the
Codex plugin is installed, because the installer also mirrors router skills and
custom agents into global fallback locations. If `codex plugin list` shows
`a11y-agents-codex@accessibility-agents` as `not installed`, the hook guard will
not run even though the web-accessibility skill may still load.

The installer also writes `~/.codex/hooks.json` with the Accessibility Agents
guard. In interactive Codex, open `/hooks`, review the Accessibility Agents hook
entries, and trust them. For automated smoke tests only, use
`--dangerously-bypass-hook-trust` to prove the hook behavior without persisting
trust.

## Router Skills

Codex should see these small router skills:

- `web-accessibility`
- `document-accessibility`
- `github-workflows`
- `developer-tools`
- `markdown-accessibility`

Use these when you want a broad accessibility task. The router decides which specialists and extensions are relevant.

## Lead Subagents

Use lead agents when the task spans multiple specialists:

- `accessibility-lead` for web accessibility coordination
- `document-accessibility-wizard` for Office, PDF, EPUB, and document remediation
- `github-hub` or `nexus` for GitHub workflow coordination
- `developer-hub` for Python, wxPython, NVDA, desktop APIs, tools, and CI
- `markdown-a11y-assistant` for markdown documentation accessibility

The lead should gather specialist findings and produce the final severity-ordered summary.

## Specialist Subagents

The plugin includes the full Accessibility Agents specialist set as Codex subagents, including specialists for:

- ARIA
- keyboard navigation
- contrast
- forms
- modals
- live regions
- headings and alt text
- data tables
- links
- text quality
- i18n and RTL
- media
- mobile
- email
- web components
- cognitive accessibility
- data visualization
- performance accessibility
- Playwright scanning and verification
- web issue fixing
- Word
- Excel
- PowerPoint
- PDF
- EPUB
- Office remediation
- PDF remediation
- document inventory and reports
- markdown scanning, fixing, reporting, and assistance
- GitHub PRs, issues, projects, Actions, releases, security, notifications, repositories, teams, and wiki workflows
- Python
- wxPython
- NVDA add-ons
- desktop accessibility APIs
- desktop accessibility testing
- accessibility tool building
- CI accessibility
- compliance mapping
- WCAG education
- WCAG AAA
- WCAG 3 preview
- screen reader education
- accessibility statements
- regression detection

This list is intentionally broad. The point of the router layer is that Codex does not need to load every one of those specialists for every task.

## How to Ask Codex to Use Subagents

For web accessibility work, the installed router should spawn
`accessibility-lead` first by default. For non-web domains, use subagents when a
task benefits from independent specialist review or when a lead router applies.
For UI work, the final answer should come only after the lead and selected
specialists complete. If nested dispatch inside `accessibility-lead` is blocked
by a Codex limit, the root session must spawn the selected specialists directly
and ask the lead to synthesize their completed findings.

Good requests:

```text
Review this branch for accessibility issues. Use accessibility-lead, then dispatch Codex subagents for ARIA, keyboard, forms, contrast, and modals. Wait for all findings and summarize by severity with file references.
```

```text
Audit this documentation set. Use markdown-a11y-assistant and include markdown-scanner, markdown-fixer, and any matching installed extensions.
```

```text
Review this wxPython app with developer-hub. Include wxpython-specialist, desktop-a11y-specialist, desktop-a11y-testing-coach, and nvda-addon-specialist where relevant.
```

```text
Audit these Office and PDF files with document-accessibility-wizard. Include document, remediation, and reporting specialists, then separate PDF/UA, Office, and extension-specific findings.
```

## Extension Awareness

Subagents and routers check Accessibility Agents extensions.

Extensions can contribute:

- company standards
- design-system rules
- regional compliance checks
- framework-specific specialists
- document or markdown policies
- scanner mappings
- private remediation guidance

Matching extension agents should be included beside core agents and labeled by extension name in findings.

See [Accessibility Agents Extensions](../guides/accessibility-agent-extensions.md) for the extension format.

## Reporting Expectations

For broad audits, ask Codex to report:

- severity
- affected files
- evidence
- applicable public standard
- extension name when an extension contributed the finding
- whether the finding is a public-standard failure or company-specific policy issue
- recommended fix
- whether the fix should be applied automatically or reviewed first

Example:

```text
Report findings by severity. Label WCAG findings separately from extension policy findings. Include file paths and line numbers when available.
```

## Installation Notes

Run the universal installer:

```bash
./install.sh
```

On Windows:

```powershell
.\install.ps1
```

Select Codex support when prompted.

Start a new Codex session after installing or updating subagent files. Codex reads agent and skill files at session start.

## Troubleshooting

If Codex does not seem to see the plugin:

1. Re-run the universal installer and select Codex support.
2. Start a new Codex session.
3. Confirm the router skills were installed.
4. Confirm `.codex/agents/` or the global Codex agent directory contains Accessibility Agents TOML files.
5. Confirm built-in extension manifests were installed.
6. Confirm `~/.codex/hooks.json` contains `a11y-codex-dispatch-guard.mjs`.
7. Confirm Codex config contains `[agents]` with `max_depth = 2`.
8. Confirm the Codex marketplace entry points to `./.agents/plugins/a11y-agents-codex`.
9. Run `codex plugin list` and confirm `a11y-agents-codex@accessibility-agents` says `installed, enabled`.
10. Ask Codex to use a router skill or a named lead agent.

If Codex reports shortened skill descriptions, the old direct skill pack may still be installed. Re-run the v6 installer so Codex uses the plugin path and small router surface. The v6 installer prunes Accessibility Agents-owned legacy skill mirrors from `.codex/skills` while leaving unrelated personal skills alone.

## Maintainer Validation

Before claiming Codex support works:

```bash
node scripts/validate-codex-plugin.js
node scripts/codex-accessibility-dispatch-smoke.mjs
bash -n install.sh
```

After installing Codex support locally, maintainers can run the live smoke test:

```bash
node scripts/codex-accessibility-dispatch-smoke.mjs --live
```

The live test starts a read-only Codex session and expects
`accessibility-lead` to spawn without using a local-only fallback. Do not run the
live test in normal CI because it consumes Codex model/tool budget.

Also run the general agent validators:

```bash
node scripts/validate-agents.js --strict --validate-wcag --validate-urls --skip-url-checks
node scripts/check-skill-description-quality.js
```

Run PowerShell and Go checks when those tools are available.
