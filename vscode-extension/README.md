# Accessibility Agents for VS Code

An accessibility-first chat extension for GitHub Copilot. Type **`@a11y`** in Copilot Chat and get expert WCAG guidance from a growing team of specialist agents — no configuration required.

## Features

- **80 agents total** — 61 user-invokable specialists available as slash commands, plus 18 internal helpers used behind the scenes via handoffs and orchestration
- **Dynamic agent discovery** — drop new `.agent.md` files into your workspace and they're available instantly, no reload needed
- **Smart routing** — slash commands for direct access, or just describe your problem and the router finds the right specialist
- **Rich frontmatter** — agents declare tools, models, handoffs for multi-agent orchestration, and `user-invokable: false` for internal helpers
- **Configurable conformance level** — target WCAG A, AA, or AAA across all agents
- **Works with any Copilot model** — uses whichever model you have selected in the Chat view

## Quick start

1. Install the extension (see [Installation](#installation) below)
2. Open Copilot Chat (`Ctrl+Shift+I` / `Cmd+Shift+I`)
3. Type `@a11y` followed by your question

That's it. The Accessibility Lead agent responds by default. Use a slash command to talk to a specific specialist.

## Slash commands

### Web Accessibility

| Command | What it covers |
|---------|---------------|
| `/accessibility-lead` | Team lead and orchestrator — coordinates specialists, final review |
| `/aria-specialist` | ARIA roles, states, properties for custom widgets and live regions |
| `/alt-text-headings` | Alt text, heading hierarchy, landmarks, image descriptions |
| `/contrast-master` | Color contrast ratios, themes, dark mode, focus indicators |
| `/cognitive-accessibility` | Plain language, COGA, auth patterns, reading level, timeouts |
| `/forms-specialist` | Form labels, validation, error handling, grouping, autocomplete |
| `/keyboard-navigator` | Tab order, focus traps, skip links, shortcuts |
| `/link-checker` | Detect ambiguous link text — "click here", "read more" |
| `/live-region-controller` | Live regions, dynamic content, toasts, AJAX, progress updates |
| `/modal-specialist` | Modals, dialogs, popovers — focus trap, return, escape |
| `/tables-data-specialist` | Data tables — headers, scope, caption, sortable, ARIA grid roles |
| `/web-accessibility-wizard` | Interactive guided WCAG audit with prioritized action plan |
| `/design-system-auditor` | Design tokens, color tokens, focus rings, motion, touch targets |
| `/mobile-accessibility` | React Native, Expo, iOS, Android, touch targets |

### Desktop Accessibility

| Command | What it covers |
|---------|---------------|
| `/desktop-a11y-specialist` | Platform APIs — UI Automation, MSAA/IAccessible2, NSAccessibility |
| `/desktop-a11y-testing-coach` | Testing with NVDA, JAWS, Narrator, and VoiceOver |

### Document & Markdown Accessibility

| Command | What it covers |
|---------|---------------|
| `/document-accessibility-wizard` | Guided audit — Word, Excel, PowerPoint, PDF, ePub |
| `/word-accessibility` | Word documents — titles, headings, alt text, tables |
| `/excel-accessibility` | Excel — sheet names, table headers, alt text, merged cells |
| `/powerpoint-accessibility` | PowerPoint — slide titles, alt text, reading order |
| `/pdf-accessibility` | PDF — PDF/UA, Matterhorn Protocol, tagged structure |
| `/epub-accessibility` | ePub — EPUB 1.1, reading order, navigation, metadata |
| `/markdown-a11y-assistant` | Markdown audit — links, alt text, headings, emoji, Mermaid |

### WCAG & Testing

| Command | What it covers |
|---------|---------------|
| `/wcag-guide` | WCAG 2.2 AA reference — criteria explanations, conformance |
| `/testing-coach` | Screen reader, keyboard, axe-core, test plans |
| `/a11y-tool-builder` | Build scanning tools, rule engines, parsers, audit automation |

### Developer Tools

| Command | What it covers |
|---------|---------------|
| `/developer-hub` | Developer command center — Python, wxPython, desktop, routing |
| `/python-specialist` | Python — debugging, packaging, testing, async, performance |
| `/wxpython-specialist` | wxPython GUI — sizers, events, AUI, threading, desktop a11y |

### GitHub Workflows

| Command | What it covers |
|---------|---------------|
| `/github-hub` | GitHub command center — plain English routing to all agents |
| `/nexus` | Intelligent GitHub orchestrator — any GitHub action |
| `/analytics` | Team velocity, review turnaround, contribution metrics |
| `/daily-briefing` | Daily briefing — issues, PRs, reviews, releases, discussions |
| `/issue-tracker` | Issues — find, triage, review, respond with reports |
| `/pr-review` | Pull requests — diffs, snapshots, comments, reactions |
| `/contributions-hub` | Discussions, community health, contributor management |
| `/insiders-a11y-tracker` | Track VS Code Insiders accessibility improvements |
| `/repo-admin` | Collaborators, branch protection, webhooks, settings |
| `/repo-manager` | Issue templates, CI workflows, releases, labels |
| `/team-manager` | Teams — create, manage, onboard/offboard, sync access |
| `/template-builder` | Guided wizard for issue, PR, discussion templates |

### Internal Helpers (14)

These agents are not directly invokable — they're used behind the scenes via handoffs from other agents:

`cross-document-analyzer`, `cross-page-analyzer`, `document-csv-reporter`, `document-inventory`, `epub-scan-config`, `lighthouse-bridge`, `markdown-csv-reporter`, `markdown-fixer`, `markdown-scanner`, `office-scan-config`, `pdf-scan-config`, `scanner-bridge`, `web-csv-reporter`, `web-issue-fixer`

> **Tip:** New agents are discovered automatically. If your team adds a `custom-specialist.agent.md` file to the workspace, it becomes available without any extension update.

## Examples

```text
@a11y review this component for accessibility issues
@a11y /aria-specialist check my tab panel implementation
@a11y /contrast-master are these colors AA compliant? #1a1a2e on #e0e0e0
@a11y /keyboard-navigator audit the focus order of this page
@a11y /forms-specialist review my login form
@a11y /web-accessibility-wizard full WCAG 2.2 AA audit of my checkout page
@a11y /document-accessibility-wizard check this Word document for accessibility
@a11y /markdown-a11y-assistant audit my README for accessibility
```

## Installation

### Option A: Install from VSIX file

1. Download the latest `.vsix` file from the [Releases](https://github.com/Community-Access/accessibility-agents/releases) page
2. In VS Code, open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
3. Run **Extensions: Install from VSIX...**
4. Select the downloaded `.vsix` file

### Option B: Build from source

```bash
git clone https://github.com/Community-Access/accessibility-agents.git
cd accessibility-agents/vscode-extension
npm install
npm run package
```

This produces an `a11y-agent-team-<version>.vsix` file. Install it using Option A step 2–4.

## Requirements

- **VS Code 1.99** or later (Insiders recommended for latest Chat API)
- **GitHub Copilot** extension installed and signed in
- A workspace containing `.agent.md` files (included with the [accessibility-agents](https://github.com/Community-Access/accessibility-agents) repository)

## Settings

Open **Settings** (`Ctrl+,` / `Cmd+,`) and search for **a11y** to configure:

| Setting | Default | Description |
|---------|---------|-------------|
| `a11y.registrationMode` | `slash-commands` | How agents appear in Copilot Chat. See [Registration Modes](#registration-modes) below. |
| `a11y.agentsPaths` | `[]` (auto-discover) | Directories containing `.agent.md` files. Leave empty to auto-scan `.github/agents/`, `copilot-agents/`, and `agents/` in your workspace. |
| `a11y.defaultAgent` | `accessibility-lead` | Agent used when `@a11y` is invoked without a slash command. |
| `a11y.conformanceLevel` | `AA` | Target WCAG conformance level (`A`, `AA`, or `AAA`). |
| `a11y.watchForChanges` | `true` | Automatically detect new, changed, or removed `.agent.md` files. |

### Registration Modes

The `a11y.registrationMode` setting controls how agents are exposed in Copilot Chat. Changing this setting requires a **window reload**.

#### `slash-commands` (default)

All agents live under a single **`@a11y`** chat participant. You invoke them with slash commands:

```text
@a11y /aria-specialist check my tab panel
@a11y /contrast-master review my color palette
@a11y /web-accessibility-wizard full audit of my page
```

**Pros:** Clean participant picker — only one `@a11y` entry. All 41 agents are organized as `/` commands.
**Cons:** You must type `@a11y /` first, then the agent name.

#### `individual-participants`

Each user-invokable agent is registered as its own **`@agent-name`** chat participant. You invoke them directly:

```text
@aria-specialist check my tab panel
@contrast-master review my color palette
@web-accessibility-wizard full audit of my page
```

The hub `@a11y` is still available for routing by topic (no slash commands in this mode — just describe your problem).

**Pros:** Direct `@` access to any agent — faster if you know the agent name.
**Cons:** Adds 41 entries to the chat participant picker alongside Copilot, Workspace, etc.

#### `both`

Agents are available **both ways** — as `@a11y /agent-name` slash commands AND as individual `@agent-name` participants.

```text
@a11y /aria-specialist check my tab panel    ← slash command
@aria-specialist check my tab panel          ← direct participant
```

**Pros:** Maximum flexibility — use whichever style you prefer.
**Cons:** Adds 41 entries to the participant picker AND slash commands to `@a11y`.

## Commands

Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

| Command | Description |
|---------|-------------|
| **A11y: Reload Agent Index** | Re-scan all agent directories and refresh the index |
| **A11y: List Discovered Agents** | Browse all loaded agents in a quick-pick list |

## Adding your own agents

1. Create a file ending in `.agent.md` in one of the discovered directories (e.g. `copilot-agents/my-specialist.agent.md`)
2. Add optional YAML frontmatter for metadata:

```yaml
---
name: My Specialist
description: Handles a specific accessibility concern
commands: my-specialist, my-alias
tags: wcag, custom, specialist
argument-hint: "e.g. 'check my form labels'"
tools: ['read', 'search', 'edit']
model: ['Claude Sonnet 4.5 (copilot)']
user-invokable: true
---
```

3. Write the agent's system prompt as the body of the file (Markdown)
4. The agent appears immediately — use `@a11y /my-specialist` or let smart routing match it by topic

## How routing works

1. **Exact command match** — `@a11y /contrast-master` routes directly to `contrast-master.agent.md`
2. **Tag match** — keywords in your prompt are matched against agent tags
3. **Keyword search** — if no tag match, the router searches agent names and descriptions
4. **Default fallback** — the Accessibility Lead handles anything unmatched

When multiple agents match, their expertise is combined into a single response.

## License

MIT
