# Accessibility Agents for Codex

This plugin is the native Codex surface for Accessibility Agents v6.

It exists because Accessibility Agents has many specialists. If every specialist is exposed to Codex as a top-level skill, Codex can hit skill-description context limits and shorten the visible skill descriptions. That makes routing less reliable.

The v6 Codex plugin keeps the visible surface small and moves detailed specialist instructions into lazy-loaded references and custom subagents.

## What This Plugin Provides

- Small router skills for broad task discovery
- Codex custom subagents for specialist review
- Lazy specialist reference files
- Built-in extension manifests
- A first-class extension model for company and community standards

The universal installer owns installation. Users should not need to manually copy this plugin or run separate Codex setup steps.

## Installed Surface

`skills/`
: Small router layer for Codex skill discovery. These are the skills Codex should see up front.

`agents/`
: Codex custom subagents. The universal installer copies these into `.codex/agents/` or `~/.codex/agents/`.

`references/specialists/`
: Full specialist instructions. Routers and subagents load these only when they are relevant.

`references/specialists/index.json`
: Machine-readable index for specialist names, domains, and the default lead agent.

`extensions/`
: Built-in extension manifests and extension authoring documentation.

`hooks/`
: Codex lifecycle hooks that require `accessibility-lead` dispatch before UI file edits.

`.codex-plugin/plugin.json`
: Plugin metadata for Codex plugin discovery.

## Why Router Skills Exist

Codex skills are powerful, but a large skill catalog has a context cost. Accessibility Agents has dozens of specialists across web, documents, GitHub workflows, markdown, desktop, and developer tooling. Loading all of that into the first turn is wasteful.

Router skills solve that problem:

1. Codex sees a small number of broad skills.
2. The router identifies the task domain.
3. The router loads only the specialist references needed for that task.
4. The web router treats installation as standing authorization to dispatch `accessibility-lead` for web accessibility work.
5. Installed extensions are considered as first-class contributors.

The router layer is intentionally small. Specialist knowledge stays available without crowding the initial skill list.

## Dispatch Guard Hooks

The plugin includes Codex lifecycle hook files for the universal installer to
register as a single user-level guard for UI work:

- `UserPromptSubmit` detects UI and web prompts and injects the lead-dispatch requirement.
- `SubagentStart` records when `accessibility-lead` and tracked web specialists have started for the current turn.
- `SubagentStop` records when `accessibility-lead` and tracked web specialists have completed for the current turn.
- `PreToolUse` blocks edits to UI files until `accessibility-lead` has been dispatched in that same turn.
- `Stop` blocks final answers until `accessibility-lead` and required specialists have completed.

Codex surfaces that provide collaboration agents without emitting custom-subagent
lifecycle hooks can forward a review to the same guard over stdin using the
`AccessibilityReviewReceipt` event. Set `receipt_source` to
`codex-collaboration`, provide the tracked `agent_type`, and send `state` as
`started` or `completed`. Send completion only after the agent returns its final
result. Unknown sources, states, and agent types are ignored.

This is intentionally paired with the router skill. The hook enforces the rule at the edit boundary, while the router still owns the dispatch plan and specialist selection. If Codex has lazy-loaded the subagent tool, the router must use `tool_search` before claiming subagents are unavailable.

The Codex plugin manifest does not advertise hooks directly. The universal installer writes the hook guard into `~/.codex/hooks.json` because current Codex builds load normal hooks consistently while plugin-bundled hooks can also be loaded in some sessions, which would duplicate `UserPromptSubmit` context. Codex requires users to review and trust non-managed command hooks before they run. After the hook is trusted, users should not need to manually name every specialist for ordinary UI accessibility work.

## Router Skills

The plugin includes these router skills:

- `web-accessibility`
- `document-accessibility`
- `github-workflows`
- `developer-tools`
- `markdown-accessibility`

Each router explains:

- when it applies
- which specialist references to load
- which subagents are relevant
- how extension matches should be included
- how findings should be reported

## Subagents

The plugin ships Codex custom subagents for the full Accessibility Agents specialist set. They are installed into the Codex agent directory by the universal installer.

Subagents are useful for:

- parallel review across independent accessibility domains
- separating read-only audit work from fix work
- collecting findings from specialists before a lead summarizes them
- keeping each specialist focused on its own evidence and standards

Use the lead agents for broad routing:

- `accessibility-lead` for web accessibility
- `document-accessibility-wizard` for documents
- `github-hub` or `nexus` for GitHub workflow tasks
- `developer-hub` for desktop, Python, wxPython, NVDA, and tooling tasks
- `markdown-a11y-assistant` for markdown documentation work

## Example Codex Prompts

```text
Review this branch for accessibility issues. Use accessibility-lead, then dispatch Codex subagents for ARIA, keyboard, forms, contrast, and modals. Wait for all findings and summarize by severity with file references.
```

```text
Audit these markdown docs with the markdown accessibility router. Include installed extensions and label extension-specific findings separately from WCAG findings.
```

```text
Review this wxPython app using the developer tools extension. Include desktop accessibility APIs and NVDA guidance where relevant.
```

```text
Scan this PDF and Word document with document-accessibility-wizard. Report PDF/UA, Office accessibility, remediation, and extension-specific findings separately.
```

## Extension Model

Accessibility Agents extensions are first-class contributors.

The router checks:

- bundled extension manifests
- installed global extension manifests
- installed project extension manifests
- task domains
- trigger words
- file patterns
- compliance profiles

Matching extension agents can be included in the same dispatch plan as bundled agents. Findings should identify their source so users can distinguish:

- public standards, such as WCAG 2.2 AA
- platform standards, such as ARIA or PDF/UA
- built-in Community Access guidance
- company-specific extension policy

See `extensions/README.md` and `docs/guides/accessibility-agent-extensions.md` for the extension authoring guide.

## Built-In Extensions

The plugin bundles these first-party extensions:

- `core`
- `web`
- `documents`
- `markdown`
- `github`
- `developer-tools`

They are built in and installed automatically. They are still extensions because they use the same manifest format that company and marketplace extensions use.

## Installation

Use the universal installer from the repository root:

```bash
./install.sh
```

On Windows:

```powershell
.\install.ps1
```

Select Codex support when prompted. The installer copies the plugin, router skills, custom subagents, specialist references, and extension manifests.

After installing or updating Codex subagents or hooks, start a new Codex session so Codex picks up the new files. If Codex asks you to review the Accessibility Agents plugin hook definition, trust it to enable the UI edit guard.

If Codex shows a hooks review notice, open `/hooks`, review the Accessibility Agents entries that run `a11y-codex-dispatch-guard.mjs`, and trust them.

The Codex hook guard now tracks the full UI review lifecycle. It injects the
lead-plus-specialists requirement for UI prompts, records `SubagentStart` and
`SubagentStop` for the lead and tracked web specialists, blocks UI edits until
the lead has started, and blocks the final answer until the lead and required
specialists have completed.

## Expected User Experience

Users should be able to:

- install once with the universal installer
- ask Codex for accessibility work naturally
- request subagents for broad audits
- use built-in extensions without knowing they are separate packs
- install private extensions without forking this repository
- see extension findings labeled clearly

No user should need to understand this directory structure just to use Accessibility Agents. This README is for maintainers and advanced users who want to know how the Codex plugin works.

## Maintainer Notes

When changing the Codex plugin:

- keep the router skill count small
- add new specialist detail to references, not top-level skills
- keep `accessibility-lead` as the primary web lead
- keep extension manifests valid JSON
- update the universal installer when install paths change
- update validator coverage in `scripts/validate-codex-plugin.js`
- update docs when extension behavior changes
- keep the Codex hook guard aligned with the router skill dispatch contract

Validation:

```bash
node scripts/validate-codex-plugin.js
node scripts/codex-accessibility-dispatch-smoke.mjs
bash -n install.sh
```

Run `node scripts/codex-accessibility-dispatch-smoke.mjs --live` after a local
Codex install when you need proof that `accessibility-lead` actually spawns.
The live check is intentionally not a default CI gate because it spends Codex
model/tool budget.

Also run the repository agent validators before release.
