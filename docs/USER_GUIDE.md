# Accessibility Agents — Complete User Guide

> **Your accessibility team in a pocket.** This guide walks you through every team, agent, skill, prompt, and workflow in the Accessibility Agents ecosystem. Whether you are brand new to accessibility or an experienced auditor, this guide will help you use the right tool at the right time.

---

## Table of Contents

1. [What Are Accessibility Agents?](#what-are-accessibility-agents)
2. [How the Ecosystem Fits Together](#how-the-ecosystem-fits-together)
3. [Quick Start (Pick Your Platform)](#quick-start-pick-your-platform)
4. [The Agent Teams](#the-agent-teams)
   - [Web Accessibility Team](#web-accessibility-team)
   - [Document Accessibility Team](#document-accessibility-team)
   - [Markdown Accessibility Team](#markdown-accessibility-team)
   - [GitHub Workflow Team](#github-workflow-team)
   - [Developer Tools Team](#developer-tools-team)
   - [Mobile Accessibility Team](#mobile-accessibility-team)
   - [Design System Team](#design-system-team)
   - [Cross-Cutting Specialists](#cross-cutting-specialists)
5. [Every Agent Explained](#every-agent-explained)
6. [Skills (Knowledge Libraries)](#skills-knowledge-libraries)
7. [Prompts (One-Click Workflows)](#prompts-one-click-workflows)
8. [Always-On Instructions](#always-on-instructions)
9. [MCP Server (24 Tools)](#mcp-server-24-tools)
10. [Working with Files](#working-with-files)
11. [Common Workflows and Recipes](#common-workflows-and-recipes)
12. [Platform Comparison](#platform-comparison)
13. [Troubleshooting](#troubleshooting)
14. [Glossary](#glossary)

---

## What Are Accessibility Agents?

Accessibility Agents is a collection of **80 AI-powered specialists** that help you build, audit, and fix accessibility issues in web apps, documents, mobile apps, and desktop software. They enforce **WCAG 2.2 AA** standards — the international benchmark for digital accessibility.

**Think of it like a team of accessibility consultants that live inside your code editor.** Each specialist knows one domain deeply:

- One agent knows everything about ARIA attributes
- Another specializes in keyboard navigation
- Another checks color contrast ratios
- Another audits Word and PDF documents
- Another manages your GitHub Projects boards, CI/CD workflows, security alerts, releases, notifications, and wiki pages — bypassing inaccessible GitHub web UI
- And so on — 80 specialists in total

You don't need to know which agent to call. The system includes **orchestrator agents** (like Accessibility Lead and the Wizards) that coordinate the right specialists automatically.

### What Problems Does This Solve?

1. **AI code generators don't write accessible code by default.** These agents catch issues that Copilot, Claude, and other tools typically miss.
2. **Accessibility audits are tedious.** The wizard agents automate multi-step audit workflows that would take hours manually.
3. **WCAG is complex.** 78 success criteria across 4 principles. The agents know all of them so you don't have to memorize them.
4. **Document accessibility is overlooked.** Word, Excel, PowerPoint, and PDF files need accessibility too. Dedicated agents handle that.
5. **GitHub's web UI has accessibility barriers.** Drag-and-drop kanban boards, nested collapsible log trees, and color-coded severity badges are difficult or impossible for screen reader users. Dedicated agents provide full-featured alternatives via the GitHub API.

---

## How the Ecosystem Fits Together

The system has five layers that work together. Here is how they connect:

### The Five Layers

| Layer | What It Is | Count |
|-------|-----------|-------|
| **Agents** | AI specialists that read, analyze, and fix code | 80 agents in 8 teams |
| **Skills** | Reference knowledge that agents draw from (WCAG rules, scoring formulas, etc.) | 25 knowledge modules |
| **Prompts** | Pre-built workflows you can launch with one click | 134 prompt files |
| **Instructions** | Always-on rules that fire on every code completion | 9 instruction files |
| **MCP Server** | Scanning tools that agents can call for automated analysis | 24 tools |

### How They Connect

**Your code editor** (VS Code, Claude Code, Gemini CLI, or Codex CLI) loads the agents. When you ask an agent to do something:

1. The **orchestrator agent** (like `accessibility-lead`) receives your request
2. It **delegates to specialist agents** based on what needs to be done
3. Each specialist draws on **skills** (knowledge libraries) for domain-specific rules
4. Specialists may call **MCP tools** for automated scanning (contrast checking, axe-core scans, document parsing)
5. **Instructions** fire automatically on every code completion for matching file types, providing baseline guidance without requiring any agent invocation
6. **Prompts** provide one-click entry points that combine multiple agents and tools into a structured workflow

### Platform Support

The 80 agents are available on all major AI coding platforms:

| Platform | Agent Format | Count | Location |
|----------|-------------|-------|----------|
| GitHub Copilot (VS Code / CLI) | `.agent.md` files | 80 | `.github/agents/` |
| Claude Code (CLI) | `.md` agent files | 80 | `.claude/agents/` |
| Claude Code Plugin | `.md` agent files | 80 | `claude-code-plugin/agents/` |
| Gemini CLI | Skill files | 98 (80 agents + 18 knowledge) | `.gemini/extensions/a11y-agents/skills/` |
| Codex CLI | Role files | 11 | `.codex/` |
| Claude Desktop | MCP server | 24 tools | `mcp-server/` |

---

## Quick Start (Pick Your Platform)

Choose the platform you use. Each section walks you through installation including how to verify it is working.

<details>
<summary><strong>GitHub Copilot (VS Code)</strong> — Click to expand</summary>

### Step 1: Prerequisites

- VS Code (latest stable version)
- GitHub Copilot extension installed
- GitHub Copilot Chat extension installed
- A Copilot subscription (Individual, Business, or Enterprise)

### Step 2: Install

**Option A — Per-project (recommended for teams):**

```bash
git clone https://github.com/Community-Access/accessibility-agents.git
cp -r accessibility-agents/.github /path/to/your/project/
```

This copies agents, skills, prompts, instructions, and workspace settings into your project. Commit it to your repo so your whole team benefits.

**Option B — Global (recommended for individuals):**

```bash
git clone https://github.com/Community-Access/accessibility-agents.git
cd accessibility-agents
bash install.sh --global --copilot
```

On Windows:

```powershell
git clone https://github.com/Community-Access/accessibility-agents.git
cd accessibility-agents
powershell -ExecutionPolicy Bypass -File install.ps1
```

### Step 3: Verify

1. Open VS Code and open the Copilot Chat panel
2. Click the **agent picker dropdown** at the top of the chat panel
3. You should see agents like `accessibility-lead`, `aria-specialist`, `contrast-master`, etc.
4. Select `accessibility-lead` and type: "What agents are available?"

> **First-use note:** Custom agents appear in the dropdown picker first. They won't show in `@` autocomplete until you've selected them from the picker at least once.

### Step 4: Your First Audit

Type in Copilot Chat:

```
@accessibility-lead review the accessibility of this page
```

Or use a one-click prompt:

```
@workspace /audit-web-page
```

### How Copilot Agents Work

- **80 agent files** in `.github/agents/*.agent.md`
- **25 skill folders** in `.github/skills/*/SKILL.md` — loaded automatically when relevant
- **134 prompt files** in `.github/prompts/*.prompt.md` — appear in the prompt picker
- **9 instruction files** in `.github/instructions/*.instructions.md` — fire on every completion for matching files
- **Workspace instructions** in `.github/copilot-instructions.md` — loaded into every chat conversation

Agents are invoked by selecting them from the agent picker or by mentioning `@agent-name` in chat.

</details>

<details>
<summary><strong>GitHub Copilot CLI</strong> — Click to expand</summary>

### Step 1: Prerequisites

- GitHub Copilot CLI installed (`npm install -g @github/copilot`)
- An active Copilot subscription

### Step 2: Install

**Global install (all projects):**

```bash
git clone https://github.com/Community-Access/accessibility-agents.git
cd accessibility-agents
bash install.sh --global --cli
```

This copies agents to `~/.copilot/agents/` and skills to `~/.copilot/skills/`.

**Per-project:** The agents work automatically from `.github/agents/` when you're in a project that has them.

### Step 3: Verify

```bash
# List available agents
/agent

# List loaded skills
/skills list
```

You should see all 80 agents and 25 skills.

### Step 4: Your First Audit

```bash
# Use the accessibility lead
Use the accessibility-lead agent to review src/components/ for accessibility issues
```

### Key Differences from VS Code

| Feature | VS Code | CLI |
|---------|---------|-----|
| Agent picker | Dropdown in chat | `/agent` command |
| Skills | Auto-loaded | `/skills` to manage |
| Global agents | VS Code profile folder | `~/.copilot/agents/` |

</details>

<details>
<summary><strong>Claude Code (CLI)</strong> — Click to expand</summary>

### Step 1: Prerequisites

- Claude Code CLI installed and working
- A Claude subscription (Pro, Max, or Team)

### Step 2: Install

**One-liner (recommended):**

macOS/Linux:
```bash
curl -fsSL https://raw.githubusercontent.com/Community-Access/accessibility-agents/main/install.sh | bash
```

Windows (PowerShell):
```powershell
irm https://raw.githubusercontent.com/Community-Access/accessibility-agents/main/install.ps1 | iex
```

This installs 80 agents to `~/.claude/agents/` and sets up three enforcement hooks.

### Step 3: Verify

```bash
# List all agents
/agents
```

You should see all agents listed. Then test the enforcement system:

1. Open a web project (one with React, Vue, etc.)
2. Type any prompt — you should see "DETECTED: This is a web project"
3. If Claude tries to edit a `.tsx` file without consulting accessibility-lead first, it gets **blocked**

### Step 4: Your First Audit

```bash
/accessibility-lead full audit of the checkout flow
/web-accessibility-wizard run a guided accessibility audit
```

### How the Hook Enforcement Works

Claude Code has a unique **three-hook enforcement gate** that no other platform has:

1. **Detection hook** (`UserPromptSubmit`) — Automatically detects web projects and injects accessibility guidance into every prompt
2. **Edit gate** (`PreToolUse`) — Blocks file edits to UI files (`.jsx`, `.tsx`, `.vue`, `.css`, `.html`) until accessibility-lead has been consulted
3. **Session marker** (`PostToolUse`) — Once accessibility-lead completes, the edit gate unlocks for the rest of the session

This means **accessibility review is mandatory** in web projects — Claude literally cannot skip it.

### Global vs Project Install

- **Project-level** (`.claude/agents/`): Agents travel with the repo. Great for teams.
- **Global** (`~/.claude/agents/`): Agents are available across all projects. Great for individuals.
- Project-level agents override global ones with the same name.

</details>

<details>
<summary><strong>Gemini CLI</strong> — Click to expand</summary>

### Step 1: Prerequisites

- Gemini CLI installed
- A Google AI subscription

### Step 2: Install

Clone the repo and ensure the `.gemini/` directory is in your project:

```bash
git clone https://github.com/Community-Access/accessibility-agents.git
```

Gemini reads skills from `.gemini/extensions/a11y-agents/skills/*/SKILL.md`.

### Step 3: Verify

Gemini discovers skills from the extension directory structure. You should have 98 skills available:
- 80 agent skills (one per agent)
- 18 knowledge skills (matching 18 of the 25 Copilot skill set — the remaining 7 are inlined)

### Step 4: Your First Audit

```
Use the accessibility-lead skill to review this component for accessibility
```

### How Gemini Skills Differ from Agents

Gemini doesn't have a native "agent" concept like Copilot or Claude Code. Instead, each agent is represented as a **skill** — a YAML-frontmatter markdown file that Gemini loads as reference knowledge. The LLM uses the skill's instructions to behave like the specialist agent.

</details>

<details>
<summary><strong>Codex CLI</strong> — Click to expand</summary>

### Step 1: Prerequisites

- OpenAI Codex CLI installed
- An OpenAI API key

### Step 2: Install

```bash
git clone https://github.com/Community-Access/accessibility-agents.git
cd accessibility-agents
bash install.sh --codex
```

Codex uses role files in `.codex/` — 11 predefined roles are included.

### Step 3: Available Roles

| Role | Purpose |
|------|---------|
| `accessibility-lead` | Coordinates web accessibility audits |
| `aria-specialist` | ARIA roles, states, properties |
| `keyboard-navigator` | Tab order, focus management |
| `contrast-master` | Color contrast checking |
| `forms-specialist` | Form labeling and validation |
| `modal-specialist` | Dialog focus trapping |
| `alt-text-headings` | Images and heading structure |
| `testing-coach` | Accessibility testing guidance |
| `wcag-guide` | WCAG criteria explanations |
| `document-wizard` | Office/PDF accessibility |
| `markdown-a11y` | Markdown accessibility |

### Step 4: Your First Audit

```bash
codex --role=accessibility-lead "Review this component for accessibility"
```

</details>

<details>
<summary><strong>Claude Desktop (MCP Extension)</strong> — Click to expand</summary>

### Step 1: Prerequisites

- Claude Desktop app installed (latest version)
- A Claude subscription (Pro plan or higher)

### Step 2: Install the MCP Server

The MCP server provides 24 scanning tools that Claude Desktop can call. Configure it in your Claude Desktop settings:

**Option A — stdio mode (simplest):**

Add to your Claude Desktop `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "a11y-agents": {
      "command": "node",
      "args": ["/path/to/accessibility-agents/mcp-server/stdio.js"]
    }
  }
}
```

**Option B — HTTP mode (for remote/shared use):**

Start the server:

```bash
cd accessibility-agents/mcp-server
npm install
node server.js
```

Then configure Claude Desktop to connect to `http://127.0.0.1:3456/mcp`.

### Step 3: Available Tools

Once connected, Claude Desktop has access to 24 scanning tools organized into four categories: core scanning (13 tools), Playwright browser testing (5 tools), PDF-specific tools (2 tools), and 4 additional utilities. See the [MCP Server section](#mcp-server-24-tools) for the full list.

### Step 4: Your First Scan

Ask Claude:

```
Check the contrast ratio between #333333 and #ffffff
```

```
Scan the file report.docx for accessibility issues
```

### Built-in MCP Prompts

The MCP server includes built-in prompts accessible from Claude Desktop's prompt menu:

- **Full Accessibility Audit** — Comprehensive WCAG review using multiple tools
- **ARIA Review** — Focused ARIA attribute audit
- **Color Contrast Review** — Visual contrast checking

</details>

---

## The Agent Teams

The 80 agents are organized into 8 teams. Each team has a lead agent that coordinates the specialists. You usually talk to the lead and let it delegate to the right specialists.

### Web Accessibility Team

**Lead: `accessibility-lead`**

This is the team you'll use most often. It handles everything related to web accessibility — HTML, CSS, JavaScript, React, Vue, Angular, Svelte, and more.

| Agent | What It Does | When to Use It |
|-------|-------------|----------------|
| `accessibility-lead` | Coordinates all web specialists, runs final review | Any web UI task — start here |
| `aria-specialist` | ARIA roles, states, properties, live regions | Custom widgets, interactive components |
| `keyboard-navigator` | Tab order, focus management, keyboard traps | Any component that users interact with |
| `contrast-master` | Color contrast ratios, visual accessibility | Styling, theming, CSS updates |
| `forms-specialist` | Form labeling, validation, error messages | Forms, inputs, checkboxes, selects |
| `modal-specialist` | Dialog focus trapping, escape behavior, focus return | Modals, drawers, popovers, overlays |
| `live-region-controller` | Dynamic content announcements | Toasts, loading states, real-time updates |
| `alt-text-headings` | Image alt text, SVGs, heading hierarchy, landmarks | Any images or page structure changes |
| `tables-data-specialist` | Data table headers, captions, sorting | Any tabular data display |
| `link-checker` | Ambiguous link text detection | Pages with hyperlinks |
| `text-quality-reviewer` | Non-visual text quality (alt text, ARIA labels) | Code review for text quality |
| `cognitive-accessibility` | WCAG 2.2 cognitive criteria, plain language | UX clarity, error messages, reading level |
| `i18n-accessibility` | Internationalization, RTL, multilingual | Multilingual apps, `lang` attributes |
| `web-accessibility-wizard` | Guided multi-phase web audit with scoring | Full site audits |
| `web-issue-fixer` | Applies fixes from audit reports | After running an audit |
| `web-csv-reporter` | Exports audit findings to CSV | Reporting and tracking |
| `cross-page-analyzer` | Cross-page pattern detection | Multi-page audits |
| `web-component-specialist` | Shadow DOM and custom element accessibility | Web Components, `ElementInternals` |
| `performance-accessibility` | Lazy loading, skeleton screens, CLS, code splitting | Performance-impacting a11y |
| `data-visualization-accessibility` | Chart, graph, dashboard accessibility | SVG ARIA, data tables, color-safe palettes |
| `email-accessibility` | HTML email under client rendering constraints | Email templates |
| `media-accessibility` | Captions, audio descriptions, transcripts, players | Video and audio content |

**Typical workflow:**

```
You: @accessibility-lead review the login page
Lead: I'll coordinate a review. Delegating to specialists...
  -> aria-specialist: checks ARIA on the form
  -> keyboard-navigator: checks tab order
  -> forms-specialist: checks labels and validation
  -> contrast-master: checks color contrast
Lead: Here's the consolidated report with 7 findings...
```

### Document Accessibility Team

**Lead: `document-accessibility-wizard`**

This team audits Office documents (Word, Excel, PowerPoint), PDFs, and ePubs for accessibility.

| Agent | What It Does | When to Use It |
|-------|-------------|----------------|
| `document-accessibility-wizard` | Guided document audit with scoring | Any document audit |
| `word-accessibility` | Microsoft Word (.docx) accessibility | Word documents |
| `excel-accessibility` | Microsoft Excel (.xlsx) accessibility | Spreadsheets |
| `powerpoint-accessibility` | Microsoft PowerPoint (.pptx) accessibility | Presentations |
| `pdf-accessibility` | PDF/UA conformance checking | PDF files |
| `epub-accessibility` | ePub accessibility auditing | eBooks |
| `pdf-remediator` | Programmatic and manual PDF fixes | After PDF audit |
| `office-remediator` | Programmatic Office document fixes | After Word/Excel/PowerPoint audit |
| `document-inventory` | File discovery and delta detection | Finding documents to audit |
| `cross-document-analyzer` | Cross-document patterns and scoring | Multi-document audits |
| `document-csv-reporter` | Export findings to CSV with help links | Reporting |
| `office-scan-config` | Scan configuration management | Customizing scan rules |
| `pdf-scan-config` | PDF scan configuration | Customizing PDF rules |
| `epub-scan-config` | ePub scan configuration | Customizing ePub rules |

**Typical workflow:**

```
You: @document-accessibility-wizard audit all files in docs/
Wizard: Phase 1 — Discovering files... Found 15 documents.
        Phase 2 — Scanning each document...
        Phase 3 — Scoring and report generation...
        Overall score: 72/100 (C) — 23 issues found.
```

### Markdown Accessibility Team

**Lead: `markdown-a11y-assistant`**

Markdown files need accessibility too — ambiguous links, missing alt text, broken heading hierarchy, emoji in headings, and more.

| Agent | What It Does | When to Use It |
|-------|-------------|----------------|
| `markdown-a11y-assistant` | Orchestrates markdown audits across 9 domains | Any `.md` file audit |
| `markdown-scanner` | Per-file scanning across 9 domains | Individual file scanning |
| `markdown-fixer` | Applies approved fixes | After scanning |
| `markdown-csv-reporter` | Export findings to CSV | Reporting |

### GitHub Workflow Team

**Lead: `github-hub` (guided menu) / `nexus` (auto-routing)**

This team manages GitHub operations — issues, PRs, CI, releases, analytics, projects, security, notifications, and wiki. Many of these agents exist specifically because GitHub's web UI has accessibility barriers for screen reader users (drag-and-drop boards, nested collapsible trees, color-coded badges). These agents provide full-featured alternatives via the GitHub REST and GraphQL APIs.

| Agent | What It Does | When to Use It |
|-------|-------------|----------------|
| `github-hub` | Guided GitHub menu (presents numbered options) | When you want to choose from a menu |
| `nexus` | Auto-routing orchestrator (infers intent) | When you want it to just do it |
| `daily-briefing` | Morning overview of issues, PRs, CI | Start of your day |
| `pr-review` | Code review with accessibility focus | Pull request reviews |
| `issue-tracker` | Issue triage and priority scoring | Managing issues |
| `analytics` | Repository health metrics and scoring | Tracking project health |
| `repo-admin` | Branch protection, collaborators | Repository settings |
| `repo-manager` | Repository configuration and management | Repo-level operations |
| `team-manager` | Organization team membership | Managing team members |
| `contributions-hub` | Contributor tracking and recognition | Community management |
| `insiders-a11y-tracker` | VS Code Insiders accessibility tracking | VS Code monitoring |
| `template-builder` | Issue/PR template creation | Creating templates |
| `projects-manager` | GitHub Projects v2 boards, views, custom fields, iterations | Project board management |
| `actions-manager` | Workflow runs, logs, re-runs, CI debugging | CI/CD operations |
| `security-dashboard` | Dependabot, code scanning, secret scanning alerts | Security alert triage |
| `release-manager` | Releases, tags, assets, release note generation | Release management |
| `notifications-manager` | Notification inbox, filtering, subscriptions | Notification management |
| `wiki-manager` | Wiki page CRUD, search, organization | Wiki management |
| `scanner-bridge` | GitHub Accessibility Scanner CI data | Scanner integration |
| `lighthouse-bridge` | Lighthouse CI accessibility data | Performance + a11y CI |

**Choosing between `github-hub` and `nexus`:**

- **`github-hub`** presents a numbered menu and waits for you to choose. Use it when you want to browse options or are unsure what's available.
- **`nexus`** silently infers your intent and routes to the right sub-agent. Use it when you know what you want and just want it done.

**Typical workflow with `nexus`:**

```
You: @nexus show me all open issues labeled "accessibility"
Nexus: (routes to issue-tracker)
       Found 12 open issues with the "accessibility" label...
```

**Typical workflow with `github-hub`:**

```
You: @github-hub I need help with GitHub
Hub: What would you like to do?
     1. Review pull requests
     2. Manage issues
     3. Check CI/CD status
     4. Manage project boards
     5. Review security alerts
     ...
You: 4
Hub: (routes to projects-manager)
```

### Developer Tools Team

**Lead: `developer-hub`**

This team handles desktop application development, Python packaging, screen reader addon creation, and accessibility tool building.

| Agent | What It Does | When to Use It |
|-------|-------------|----------------|
| `developer-hub` | Routes to the right specialist | Any dev tools task |
| `python-specialist` | Python debugging, packaging, testing | Python projects |
| `wxpython-specialist` | wxPython GUI development | Desktop GUI apps |
| `nvda-addon-specialist` | NVDA screen reader addon creation | Building NVDA addons |
| `desktop-a11y-specialist` | Desktop accessibility APIs (UIA, MSAA, ATK) | Desktop app accessibility |
| `desktop-a11y-testing-coach` | Screen reader testing for desktop apps | Desktop testing |
| `a11y-tool-builder` | Building accessibility scanning tools | Tool development |
| `playwright-scanner` | Playwright behavioral scanning | Automated browser testing |
| `playwright-verifier` | Post-fix verification via Playwright | Confirming fixes work |

### Mobile Accessibility Team

**Specialist: `mobile-accessibility`**

| Agent | What It Does | When to Use It |
|-------|-------------|----------------|
| `mobile-accessibility` | React Native, Expo, iOS, Android | Any mobile app |

Covers touch targets (44x44pt minimum), `accessibilityLabel`/`accessibilityRole`/`accessibilityState`, platform-specific screen reader testing (VoiceOver for iOS, TalkBack for Android), and WCAG 2.2 mobile success criteria.

### Design System Team

**Specialist: `design-system-auditor`**

| Agent | What It Does | When to Use It |
|-------|-------------|----------------|
| `design-system-auditor` | Token contrast, focus rings, spacing, motion | Design system work |

Validates color token pairs, focus ring tokens, spacing tokens, and motion tokens for Tailwind, MUI, Chakra, and shadcn/ui. Use this before tokens propagate to UI components.

### Cross-Cutting Specialists

These agents serve specific needs across multiple teams:

| Agent | What It Does | When to Use It |
|-------|-------------|----------------|
| `testing-coach` | Screen reader testing, keyboard testing guidance | Learning to test accessibility |
| `wcag-guide` | WCAG 2.2 criteria explanations | Understanding specific criteria |
| `ci-accessibility` | CI/CD accessibility pipeline setup | Setting up automated CI scanning |
| `screen-reader-lab` | Interactive screen reader simulation | Education, debugging reading order |
| `wcag3-preview` | WCAG 3.0 Working Draft preview | Future planning |
| `wcag-aaa` | AAA-level conformance checking | Going beyond AA requirements |
| `accessibility-statement` | Generate W3C/EU accessibility statements | Compliance documentation |
| `compliance-mapping` | Map findings to legal frameworks | Section 508, EN 301 549, EAA, ADA |
| `accessibility-regression-detector` | Detect regressions across commits | CI regression tracking |

---

## Every Agent Explained

This section documents every one of the 80 agents with capabilities, sample prompts, and usage scenarios. Agents are grouped alphabetically. For each agent you will find: what it does, when to use it, sample prompts showing different scenarios, and tips for getting the best results.

### a11y-tool-builder

**Team:** Developer Tools | **Type:** Specialist

Helps you build your own accessibility scanning tools — rule engines, document parsers, report generators, CLI/GUI scanner architecture, and CI/CD integration for accessibility tooling.

**Sample prompts:**

```
@a11y-tool-builder Design a rule engine that checks WCAG 2.2 AA criteria for React components
@a11y-tool-builder Help me build a CLI scanner that checks HTML files for heading hierarchy issues
@a11y-tool-builder Create a severity scoring algorithm for accessibility violations
@a11y-tool-builder Architect a document parser that extracts accessibility metadata from OOXML
```

**Tips:** This agent designs architecture and algorithms, not just code snippets. Give it your use case and constraints and it will propose a complete design.

---

### accessibility-lead

**Team:** Web Accessibility | **Type:** Orchestrator (team lead)

The main coordinator for web accessibility. Receives your request, delegates to the right specialists, consolidates their findings into a single report, and runs a final review to catch anything the specialists missed.

**Sample prompts:**

```
@accessibility-lead Review the accessibility of src/components/LoginForm.tsx
@accessibility-lead Full audit of the checkout flow — all pages from cart to confirmation
@accessibility-lead What agents are available and what does each one do?
@accessibility-lead Review this PR diff for accessibility regressions
@accessibility-lead Check if this component meets WCAG 2.2 AA requirements
```

**Tips:** Start here for any web accessibility task. The lead knows which specialists to call and in what order. You don't need to invoke individual specialists unless you want a focused review of one specific area.

---

### accessibility-regression-detector

**Team:** Cross-Cutting | **Type:** Specialist

Detects accessibility regressions by comparing audit results across commits or branches. Tracks score trends and classifies issues as new, fixed, persistent, or regressed.

**Sample prompts:**

```
@accessibility-regression-detector Compare the current audit results against the baseline from last sprint
@accessibility-regression-detector Show me what regressed between the main branch and this feature branch
@accessibility-regression-detector Track our accessibility score trend over the last 5 audits
```

---

### accessibility-statement

**Team:** Cross-Cutting | **Type:** Specialist

Generates W3C or EU model accessibility statements from audit results. Includes conformance claims, known limitations, feedback mechanism, and enforcement procedure references.

**Sample prompts:**

```
@accessibility-statement Generate a W3C accessibility statement from our latest audit report
@accessibility-statement Create an EU model accessibility statement for our public website
@accessibility-statement Update our existing statement with the latest audit findings
```

---

### actions-manager

**Team:** GitHub Workflow | **Type:** Specialist

Manages GitHub Actions workflow runs, logs, re-runs, and CI debugging. This agent exists because GitHub's Actions UI uses deeply nested collapsible log trees and small interactive targets that are difficult for screen reader users to navigate. The agent provides structured, searchable access to the same information via the GitHub REST API.

**Sample prompts:**

```
@actions-manager Show me all failed workflow runs from the last 24 hours
@actions-manager Get the logs for the latest CI failure on the main branch
@actions-manager Re-run the failed jobs in workflow run #1234
@actions-manager Which workflows are currently running?
@actions-manager Show me the test output from the "build-and-test" workflow
@actions-manager List all workflows in this repository and their recent status
@actions-manager Cancel the currently running deployment workflow
@actions-manager Compare the failure rate of our CI workflows this week vs last week
```

**Tips:** Use this agent instead of navigating the GitHub Actions web UI. It can filter runs by status, branch, workflow name, and date range. When debugging CI failures, ask for specific job logs rather than the full run output.

---

### alt-text-headings

**Team:** Web Accessibility | **Type:** Specialist

Reviews images for appropriate alt text, checks SVG accessibility, validates heading hierarchy (H1 through H6 must not skip levels, only one H1 per page), and verifies landmark regions (`<main>`, `<nav>`, `<aside>`, `<header>`, `<footer>`).

**Sample prompts:**

```
@alt-text-headings Check all images in src/pages/ for missing or poor alt text
@alt-text-headings Review the heading hierarchy of this page — are any levels skipped?
@alt-text-headings This SVG chart needs accessibility — how should I make it accessible?
@alt-text-headings Check that every page has exactly one H1 and proper landmark regions
@alt-text-headings Analyze this image and suggest appropriate alt text (with image attached)
```

**Tips:** When you attach an image, this agent can visually analyze it and suggest accurate alt text based on the actual content (requires `chat.imageSupport.enabled` in VS Code).

---

### analytics

**Team:** GitHub Workflow | **Type:** Specialist

Repository health metrics — issue velocity, PR merge rates, contributor stats, bottleneck detection. Uses a 0-100 scoring system with A-F grades.

**Sample prompts:**

```
@analytics Give me a health score for this repository
@analytics What's our average PR merge time this month?
@analytics Show me contributor activity for the last 30 days
@analytics Where are the bottlenecks in our development process?
@analytics Compare this month's issue velocity to last month
```

---

### aria-specialist

**Team:** Web Accessibility | **Type:** Specialist

Deep knowledge of WAI-ARIA 1.2 (and 1.3 draft). Reviews roles, states, and properties. Catches common ARIA misuse like putting `role="button"` on a `<div>` instead of using a `<button>`, or using `aria-label` when `aria-labelledby` would be more appropriate.

**Sample prompts:**

```
@aria-specialist Review the ARIA usage in src/components/Dropdown.tsx
@aria-specialist Is this the correct ARIA pattern for a combobox?
@aria-specialist I have a custom tab widget — what ARIA roles and states does it need?
@aria-specialist Check if any ARIA attributes in this file conflict with implicit roles
@aria-specialist What's the correct ARIA pattern for a tree view component?
```

**Tips:** Remember: semantic HTML before ARIA. If a native HTML element exists for what you're building (`<button>`, `<dialog>`, `<details>`), use that instead of ARIA. This agent will tell you when ARIA is unnecessary.

---

### ci-accessibility

**Team:** Cross-Cutting | **Type:** Specialist

Sets up CI/CD accessibility pipelines. Supports 5 phases: detection, configuration, baseline management, PR annotation, and monitoring. Works with GitHub Actions, Azure DevOps, GitLab CI, CircleCI, and Jenkins.

**Sample prompts:**

```
@ci-accessibility Set up axe-core scanning in our GitHub Actions pipeline
@ci-accessibility Add accessibility gating to our PR checks — fail if critical issues are found
@ci-accessibility Create a baseline so existing issues don't block PRs but new ones do
@ci-accessibility Configure Lighthouse CI to track our accessibility score over time
@ci-accessibility Set up accessibility scanning for our Azure DevOps pipeline
```

---

### cognitive-accessibility

**Team:** Web Accessibility | **Type:** Specialist

WCAG 2.2 cognitive success criteria (3.3.7 Redundant Entry, 3.3.8 Accessible Authentication, 3.3.9 Accessible Authentication Enhanced), COGA guidance, plain language analysis, authentication UX patterns, and reading level assessment.

**Sample prompts:**

```
@cognitive-accessibility Review our login flow for WCAG 2.2 authentication requirements
@cognitive-accessibility Analyze the reading level of our error messages — are they plain language?
@cognitive-accessibility Does our multi-step form comply with the Redundant Entry criterion?
@cognitive-accessibility Review our CAPTCHA implementation for cognitive accessibility
@cognitive-accessibility Check if our instructions use plain language and are easy to understand
```

---

### compliance-mapping

**Team:** Cross-Cutting | **Type:** Specialist

Maps audit results to legal frameworks — Section 508 (US), EN 301 549 (EU), European Accessibility Act (EAA), ADA (US), AODA (Canada). Generates VPAT 2.5 documents.

**Sample prompts:**

```
@compliance-mapping Map our audit findings to Section 508 requirements
@compliance-mapping Generate a VPAT 2.5 Rev 508 from our latest web audit
@compliance-mapping Which EN 301 549 clauses do our document audit findings violate?
@compliance-mapping Create a compliance gap analysis for the European Accessibility Act
```

---

### contrast-master

**Team:** Web Accessibility | **Type:** Specialist

Calculates WCAG contrast ratios. Normal text requires 4.5:1, large text requires 3:1, UI components require 3:1. Checks themes, dark mode, CSS custom properties, and design tokens.

**Sample prompts:**

```
@contrast-master Check the contrast ratio between #6B7280 and #F9FAFB
@contrast-master Review all color pairs in our Tailwind config for WCAG AA compliance
@contrast-master Our dark mode theme has complaints about readability — check the contrast
@contrast-master Is our primary button color (#2563EB on #FFFFFF) accessible for normal text?
@contrast-master Find all contrast failures in src/styles/theme.css
```

---

### contributions-hub

**Team:** GitHub Workflow | **Type:** Specialist

Tracks contributors, contribution patterns, and recognition. Useful for community management and contributor acknowledgment.

**Sample prompts:**

```
@contributions-hub Who are the most active contributors this month?
@contributions-hub Generate a contributors report for our last release
@contributions-hub List first-time contributors from the last 30 days
@contributions-hub Show contribution patterns — code vs issues vs reviews
```

---

### cross-document-analyzer

**Team:** Document Accessibility | **Type:** Helper (internal)

Finds patterns across multiple documents — common template issues, severity scoring, template analysis. This agent is typically invoked by `document-accessibility-wizard` rather than directly, but direct use is supported.

**Sample prompts:**

```
@cross-document-analyzer Analyze these 10 documents for common accessibility patterns
@cross-document-analyzer What template-level issues are causing repeated findings?
@cross-document-analyzer Score the overall accessibility maturity of our document library
```

---

### cross-page-analyzer

**Team:** Web Accessibility | **Type:** Helper (internal)

Finds patterns across multiple web pages — repeated navigation issues, global ARIA problems, site-wide heading structure. Typically invoked by `web-accessibility-wizard`.

**Sample prompts:**

```
@cross-page-analyzer Compare accessibility patterns across our 5 main pages
@cross-page-analyzer Are there site-wide issues that appear on every page?
@cross-page-analyzer Detect navigation inconsistencies across pages
```

---

### daily-briefing

**Team:** GitHub Workflow | **Type:** Specialist

Morning overview: open issues, pending PRs, CI status, recent activity. Start your day here and let the agent tell you what needs attention.

**Sample prompts:**

```
@daily-briefing Give me my morning briefing
@daily-briefing What needs attention today?
@daily-briefing Show me a summary of activity since yesterday 5pm
@daily-briefing List PRs awaiting my review
```

---

### data-visualization-accessibility

**Team:** Web Accessibility | **Type:** Specialist

Chart, graph, and dashboard accessibility — SVG ARIA patterns, data table alternatives, color-safe palettes with patterns/textures, and keyboard interaction for interactive charts. Covers Highcharts, Chart.js, D3, and Recharts.

**Sample prompts:**

```
@data-visualization-accessibility Make this D3 bar chart accessible to screen readers
@data-visualization-accessibility What's the best way to provide a data table alternative for this pie chart?
@data-visualization-accessibility Review our chart color palette — is it safe for color-blind users?
@data-visualization-accessibility Add keyboard navigation to this interactive Recharts dashboard
@data-visualization-accessibility Our Highcharts configuration needs accessibility — what options should I set?
```

---

### design-system-auditor

**Team:** Design System | **Type:** Specialist

Validates design tokens for accessibility — color token contrast pairs, focus ring visibility (WCAG 2.4.13 Focus Appearance), spacing tokens (touch targets), and motion preferences (`prefers-reduced-motion`). Supports Tailwind, MUI, Chakra, and shadcn/ui.

**Sample prompts:**

```
@design-system-auditor Audit our Tailwind color tokens for contrast compliance
@design-system-auditor Check if our focus ring tokens meet WCAG 2.4.13 Focus Appearance
@design-system-auditor Validate our spacing tokens against touch target requirements
@design-system-auditor Review our motion tokens — do they respect prefers-reduced-motion?
@design-system-auditor Audit our shadcn/ui theme for accessibility token issues
```

---

### desktop-a11y-specialist

**Team:** Developer Tools | **Type:** Specialist

Desktop app accessibility via platform APIs — UI Automation (Windows), MSAA/IAccessible2, ATK/AT-SPI (Linux), NSAccessibility (macOS). Covers screen reader Name/Role/Value/State, focus management, high contrast mode, and custom widget accessibility.

**Sample prompts:**

```
@desktop-a11y-specialist Make this custom WPF control accessible via UI Automation
@desktop-a11y-specialist What UIA patterns should I implement for a custom tree view?
@desktop-a11y-specialist Review my wxPython app for screen reader compatibility
@desktop-a11y-specialist How do I expose accessible Name and Role for a custom canvas control?
@desktop-a11y-specialist My app needs to work in Windows High Contrast mode — what do I need to handle?
```

---

### desktop-a11y-testing-coach

**Team:** Developer Tools | **Type:** Specialist

Teaches desktop accessibility testing — how to test with NVDA, JAWS, Narrator, VoiceOver, and Orca. Covers Accessibility Insights for Windows, automated UIA testing, keyboard-only testing flows, and high contrast verification.

**Sample prompts:**

```
@desktop-a11y-testing-coach Create a test plan for our desktop app using NVDA and Narrator
@desktop-a11y-testing-coach How do I run Accessibility Insights for Windows on our application?
@desktop-a11y-testing-coach Write automated UIA tests for our main window controls
@desktop-a11y-testing-coach Walk me through keyboard-only testing of our settings dialog
@desktop-a11y-testing-coach What should I verify in Windows High Contrast mode?
```

---

### developer-hub

**Team:** Developer Tools | **Type:** Orchestrator (team lead)

Routes you to the right developer tools specialist — Python, wxPython, NVDA addons, desktop accessibility, accessibility tool building. Ask it anything in the developer tools domain and it will delegate to the right specialist.

**Sample prompts:**

```
@developer-hub I need to package my Python app with PyInstaller
@developer-hub Help me build an NVDA addon that announces heading levels
@developer-hub I want to make my wxPython app accessible
@developer-hub Help me build a rule engine for accessibility scanning
@developer-hub Debug why my Python script crashes on Unicode input
```

---

### document-accessibility-wizard

**Team:** Document Accessibility | **Type:** Orchestrator (team lead)

Runs guided document audits with severity scoring (0-100, A-F grades), delta detection (only scan changed files), VPAT/ACR export, CSV export with help links, and remediation tracking across re-scans. Supports `.docx`, `.xlsx`, `.pptx`, `.pdf`, and `.epub`.

**Sample prompts:**

```
@document-accessibility-wizard Audit the file report.docx for accessibility
@document-accessibility-wizard Scan all documents in the docs/ folder recursively
@document-accessibility-wizard Only scan documents that changed since the last commit
@document-accessibility-wizard Re-scan and compare against our previous audit to show progress
@document-accessibility-wizard Generate a VPAT from this audit for our procurement team
@document-accessibility-wizard Export the findings to CSV for our tracking spreadsheet
```

**Tips:** Point this agent at a single file or an entire directory. For large document libraries, use delta scanning to only check what changed.

---

### document-csv-reporter

**Team:** Document Accessibility | **Type:** Helper (internal)

Exports document audit findings to CSV with Microsoft Office and Adobe PDF help links. Typically invoked by `document-accessibility-wizard`.

**Sample prompts:**

```
@document-csv-reporter Export the latest document audit findings to CSV
@document-csv-reporter Include help links for each finding in the export
```

---

### document-inventory

**Team:** Document Accessibility | **Type:** Helper (internal)

Discovers documents for auditing — recursive file search, delta detection (changed since last commit), inventory building. Reports file counts by type.

**Sample prompts:**

```
@document-inventory Show me all documents in the project directory
@document-inventory Which documents changed since the last commit?
@document-inventory Count how many .docx, .xlsx, .pptx, and .pdf files are in docs/
```

---

### email-accessibility

**Team:** Web Accessibility | **Type:** Specialist

HTML email accessibility under email client rendering constraints — table-based layout, inline styles, image fallbacks, screen reader compatibility, dark mode handling. Covers MJML and Foundation for Emails.

**Sample prompts:**

```
@email-accessibility Audit this HTML email template for accessibility
@email-accessibility Make this promotional email screen-reader friendly
@email-accessibility Add proper alt text fallbacks for images in this email
@email-accessibility Convert this email to work in Outlook's Word rendering engine while staying accessible
@email-accessibility Review our MJML template for accessibility issues
```

---

### epub-accessibility

**Team:** Document Accessibility | **Type:** Specialist

ePub/eBook accessibility auditing — EPUB Accessibility 1.1, reading order, navigation, alt text, language declarations, and metadata.

**Sample prompts:**

```
@epub-accessibility Audit this ePub file for accessibility compliance
@epub-accessibility Check the reading order and navigation structure
@epub-accessibility Does this ePub have proper accessibility metadata?
```

---

### epub-scan-config

**Team:** Document Accessibility | **Type:** Helper (internal)

Manages ePub scan configuration — rule enable/disable and severity filters.

---

### excel-accessibility

**Team:** Document Accessibility | **Type:** Specialist

Microsoft Excel accessibility — sheet names, table headers, cell descriptions, chart alt text, named ranges, and reading order.

**Sample prompts:**

```
@excel-accessibility Audit report.xlsx for accessibility issues
@excel-accessibility Are all tables properly structured with headers?
@excel-accessibility Check if all charts have alt text
@excel-accessibility Review sheet names for clarity and uniqueness
```

---

### forms-specialist

**Team:** Web Accessibility | **Type:** Specialist

Form accessibility — every input needs a visible programmatic label, error messages need `aria-describedby`, required fields need `aria-required="true"`, and related inputs need `<fieldset>` and `<legend>` grouping.

**Sample prompts:**

```
@forms-specialist Review the registration form in src/components/RegisterForm.tsx
@forms-specialist Are all inputs properly labeled? Check for any label-less inputs
@forms-specialist How should I structure error messages for this multi-step form?
@forms-specialist This form uses placeholder text as labels — fix it
@forms-specialist Check if required fields are properly indicated to screen readers
@forms-specialist Review our form validation — do error messages use aria-describedby?
```

---

### github-hub

**Team:** GitHub Workflow | **Type:** Orchestrator (guided menu)

Presents a numbered menu of GitHub operations and waits for you to choose. Routes to the appropriate sub-agent based on your selection. Good when you want to browse what's available.

**Sample prompts:**

```
@github-hub I need help with GitHub
@github-hub What can you help me with?
@github-hub Show me the menu
```

---

### i18n-accessibility

**Team:** Web Accessibility | **Type:** Specialist

Internationalization and accessibility intersection — `lang` attributes, `dir="rtl"` for right-to-left languages, bidirectional text handling, BCP 47 language tags, WCAG 3.1.1 Language of Page, and 3.1.2 Language of Parts.

**Sample prompts:**

```
@i18n-accessibility Check that all pages have proper lang attributes
@i18n-accessibility This page has mixed Arabic and English content — is the bidi handling correct?
@i18n-accessibility Review our multilingual site for WCAG 3.1.1 and 3.1.2 compliance
@i18n-accessibility Are we correctly marking language changes within the page content?
```

---

### insiders-a11y-tracker

**Team:** GitHub Workflow | **Type:** Specialist

Tracks accessibility-related changes in VS Code Insiders builds — regression detection, changelog parsing, and issue correlation.

**Sample prompts:**

```
@insiders-a11y-tracker What accessibility changes landed in the latest VS Code Insiders?
@insiders-a11y-tracker Track accessibility regressions in Insiders this week
```

---

### issue-tracker

**Team:** GitHub Workflow | **Type:** Specialist

Issue triage, priority scoring, label management, and duplicate detection. Uses a structured scoring system to prioritize issues.

**Sample prompts:**

```
@issue-tracker Triage the 10 most recent unlabeled issues
@issue-tracker Score and prioritize all open bugs
@issue-tracker Find potential duplicate issues
@issue-tracker Label all new accessibility-related issues
@issue-tracker Show me issues that have been open for more than 30 days with no activity
```

---

### keyboard-navigator

**Team:** Web Accessibility | **Type:** Specialist

Tab order, focus management, keyboard traps, skip links, focus indicators (`outline`), and `tabindex` usage. Every interactive element must be keyboard-operable. Focus must be managed on route changes, dynamic content, and deletions.

**Sample prompts:**

```
@keyboard-navigator Check the tab order of this page — is it logical?
@keyboard-navigator Is there a keyboard trap in this modal dialog?
@keyboard-navigator This dropdown menu isn't accessible by keyboard — fix it
@keyboard-navigator Add skip links to this page layout
@keyboard-navigator Where does focus go after this item is deleted from the list?
@keyboard-navigator Check for any positive tabindex values (they should almost never be used)
```

---

### lighthouse-bridge

**Team:** GitHub Workflow | **Type:** Helper (internal)

Bridges Lighthouse CI accessibility audit data into the agent ecosystem — score interpretation, weight-to-severity mapping, and score regression tracking.

**Sample prompts:**

```
@lighthouse-bridge Import our latest Lighthouse CI accessibility scores
@lighthouse-bridge Track our Lighthouse accessibility score over the last 10 builds
```

---

### link-checker

**Team:** Web Accessibility | **Type:** Specialist

Detects ambiguous link text — "click here", "read more", "learn more", "more info", bare URLs as link text. Links must clearly describe their destination without relying on surrounding context.

**Sample prompts:**

```
@link-checker Find all ambiguous link text in src/pages/
@link-checker Check this page for any "click here" or "read more" links
@link-checker Are all links in this navigation descriptive of their destination?
@link-checker Review our footer links for accessible text
```

---

### live-region-controller

**Team:** Web Accessibility | **Type:** Specialist

Dynamic content announcements — `aria-live="polite"` and `aria-live="assertive"`, `role="alert"`, `role="status"`, `role="log"`. Used for toasts, loading states, real-time updates, chat messages, and form validation status.

**Sample prompts:**

```
@live-region-controller This toast notification isn't announced by screen readers — fix it
@live-region-controller What live region settings should I use for a chat message feed?
@live-region-controller How should I announce loading and success/error states?
@live-region-controller Review our notification system for proper live region usage
@live-region-controller This search results count updates dynamically — should it be a live region?
```

---

### markdown-a11y-assistant

**Team:** Markdown Accessibility | **Type:** Orchestrator (team lead)

Orchestrates markdown audits across 9 domains — links, alt text, headings, tables, emoji, Mermaid diagrams, em-dashes, anchor link validation, and reading order.

**Sample prompts:**

```
@markdown-a11y-assistant Audit all markdown files in docs/
@markdown-a11y-assistant Check README.md for accessibility issues
@markdown-a11y-assistant Fix the accessibility issues found in the last audit
@markdown-a11y-assistant Quick check — are there any critical issues in CONTRIBUTING.md?
```

---

### markdown-csv-reporter

**Team:** Markdown Accessibility | **Type:** Helper (internal)

Exports markdown audit findings to CSV with WCAG help links and markdownlint rule references.

---

### markdown-fixer

**Team:** Markdown Accessibility | **Type:** Helper (internal)

Applies approved markdown fixes and presents human-judgment items for review. Auto-fixes things like heading hierarchy and em-dash normalization; presents ambiguous link text for human decision.

---

### markdown-scanner

**Team:** Markdown Accessibility | **Type:** Helper (internal)

Per-file markdown scanning across all 9 accessibility domains. Invoked in parallel by `markdown-a11y-assistant` for speed.

---

### media-accessibility

**Team:** Web Accessibility | **Type:** Specialist

Video and audio accessibility — WebVTT/SRT/TTML captions, caption quality metrics, audio descriptions, transcripts, media player controls, and WCAG 1.2.x compliance (1.2.1 through 1.2.9).

**Sample prompts:**

```
@media-accessibility Does this video have captions? Check the WebVTT file quality
@media-accessibility What do we need for WCAG AA compliance on this video player?
@media-accessibility Review our media player controls for keyboard accessibility
@media-accessibility Create an audio description script for this training video
@media-accessibility Check if our podcast page has proper transcript links
```

---

### mobile-accessibility

**Team:** Mobile Accessibility | **Type:** Specialist

React Native props (`accessibilityLabel`, `accessibilityRole`, `accessibilityState`), iOS VoiceOver, Android TalkBack, 44x44pt minimum touch targets, and WCAG 2.2 mobile success criteria.

**Sample prompts:**

```
@mobile-accessibility Audit this React Native component for accessibility
@mobile-accessibility Are all touch targets at least 44x44 points?
@mobile-accessibility Check accessibilityLabel values on all interactive elements
@mobile-accessibility How should I make this custom gesture accessible?
@mobile-accessibility Test this screen with VoiceOver — what should I verify?
```

---

### modal-specialist

**Team:** Web Accessibility | **Type:** Specialist

Focus trapping in dialogs, escape-to-close behavior, focus return to the trigger element when the dialog closes, `role="dialog"`, `aria-modal="true"`, and proper labeling.

**Sample prompts:**

```
@modal-specialist Review this modal dialog for proper focus management
@modal-specialist Does focus return to the trigger button when this dialog closes?
@modal-specialist Is focus properly trapped inside this modal?
@modal-specialist Check if Escape closes this dialog and where focus goes
@modal-specialist This drawer component needs accessibility — what should I add?
@modal-specialist Review our confirmation dialog pattern
```

---

### nexus

**Team:** GitHub Workflow | **Type:** Orchestrator (auto-routing)

Auto-routing orchestrator — infers your intent from natural language and routes to the right GitHub sub-agent silently. Use `github-hub` if you want to see options instead.

**Sample prompts:**

```
@nexus What PRs need my review?
@nexus Create an issue about the broken navigation on the settings page
@nexus Show me the CI status for this branch
@nexus Draft release notes for v2.1.0
@nexus Check our security alerts
@nexus Add the "accessibility" label to issue #45
@nexus Show my project board for the current sprint
```

---

### notifications-manager

**Team:** GitHub Workflow | **Type:** Specialist

Manages GitHub notification inbox — listing, filtering, marking as read/done, subscribing/unsubscribing from threads. This agent exists because GitHub's notification web UI uses complex interactive patterns (hover-to-reveal actions, drag-to-dismiss) that are difficult for screen reader users.

**Sample prompts:**

```
@notifications-manager Show my unread notifications
@notifications-manager Mark all CI notifications as read
@notifications-manager Show notifications from the last 24 hours filtered by mentions
@notifications-manager Unsubscribe me from issue #123
@notifications-manager Show only notifications where I was directly mentioned
@notifications-manager Mark all notifications in the accessibility-agents repo as done
@notifications-manager How many unread notifications do I have across all repos?
```

**Tips:** Use filters to manage notification overload. You can filter by reason (mention, review_requested, assign), repository, or time range.

---

### nvda-addon-specialist

**Team:** Developer Tools | **Type:** Specialist

NVDA screen reader addon development — addon structure, manifest files, NVDA API usage, event handling, braille support, and distribution packaging.

**Sample prompts:**

```
@nvda-addon-specialist Scaffold a new NVDA addon that announces heading levels
@nvda-addon-specialist How do I handle focus events in an NVDA addon?
@nvda-addon-specialist Package my addon for distribution on the NVDA addon store
@nvda-addon-specialist My addon needs to intercept browse mode navigation — how?
@nvda-addon-specialist Add braille output support to my existing addon
```

---

### office-remediator

**Team:** Document Accessibility | **Type:** Specialist

Programmatic Office document remediation via python-docx, openpyxl, and python-pptx. Provides auto-fixable and manual-fix tables for Word, Excel, and PowerPoint, generates Python/PowerShell remediation scripts, and offers a 4-phase remediation process (scan, classify, auto-fix, manual guidance).

**Sample prompts:**

```
@office-remediator Fix the heading structure in report.docx using python-docx
@office-remediator Generate a remediation script for all Word docs in docs/
@office-remediator Which issues in this spreadsheet can be auto-fixed vs need manual work?
@office-remediator Create a PowerShell COM automation script to fix alt text in this PowerPoint
```

---

### office-scan-config

**Team:** Document Accessibility | **Type:** Helper (internal)

Manages Office document scan configuration — rule enable/disable, severity filters, and scan profiles (strict/moderate/minimal).

---

### pdf-accessibility

**Team:** Document Accessibility | **Type:** Specialist

PDF/UA conformance — tagged PDF structure, reading order, alt text for images, form fields, language declaration, bookmarks, and metadata.

**Sample prompts:**

```
@pdf-accessibility Audit report.pdf for PDF/UA conformance
@pdf-accessibility Is this PDF properly tagged for screen reader access?
@pdf-accessibility Check the reading order of this PDF document
@pdf-accessibility Does this PDF have proper form field labels?
@pdf-accessibility What's missing for this PDF to meet PDF/UA requirements?
```

---

### pdf-remediator

**Team:** Document Accessibility | **Type:** Specialist

Programmatic PDF fixes — 8 auto-fixable issues via pdf-lib/qpdf/ghostscript (metadata, language, bookmarks, etc.) and 6 manual-fix issues requiring Acrobat Pro (tag structure, reading order, etc.). Generates batch remediation scripts.

**Sample prompts:**

```
@pdf-remediator Fix the metadata and language tag in this PDF
@pdf-remediator Generate a batch fix script for all PDFs in this folder
@pdf-remediator Which issues in this PDF can be fixed programmatically vs need Acrobat Pro?
@pdf-remediator Create a PowerShell script to set the document title on all our PDFs
```

---

### pdf-scan-config

**Team:** Document Accessibility | **Type:** Helper (internal)

Manages PDF scan configuration — rule enable/disable, severity filters.

---

### performance-accessibility

**Team:** Web Accessibility | **Type:** Specialist

The intersection of web performance and accessibility — lazy loading impacts on screen readers, skeleton screen announcements, Cumulative Layout Shift (CLS), code splitting that breaks focus, and progressive enhancement.

**Sample prompts:**

```
@performance-accessibility Our lazy-loaded images aren't accessible — how should we handle this?
@performance-accessibility Does our skeleton screen announce loading state to screen readers?
@performance-accessibility Check if our code splitting breaks focus management on route changes
@performance-accessibility How do we lazy-load content without disrupting screen reader users?
```

---

### playwright-scanner

**Team:** Developer Tools | **Type:** Specialist

Behavioral accessibility scanning via Playwright — keyboard traversal testing, dynamic state verification, viewport/reflow testing, contrast scanning at runtime, and accessibility tree inspection.

**Sample prompts:**

```
@playwright-scanner Run a keyboard traversal test on http://localhost:3000/login
@playwright-scanner Inspect the accessibility tree of our homepage
@playwright-scanner Test viewport reflow at 320px wide for our settings page
@playwright-scanner Run a full behavioral scan of the checkout flow
```

---

### playwright-verifier

**Team:** Developer Tools | **Type:** Specialist

Post-fix verification — re-runs targeted Playwright scans to confirm accessibility fixes work at runtime. Use this after applying fixes to verify they work in a real browser.

**Sample prompts:**

```
@playwright-verifier Verify that the focus trap fix works on the login modal
@playwright-verifier Re-run the keyboard scan on the form page to confirm our fixes
@playwright-verifier Check if the contrast fix on the nav bar passes at runtime
```

---

### powerpoint-accessibility

**Team:** Document Accessibility | **Type:** Specialist

Microsoft PowerPoint accessibility — slide titles (every slide must have a unique title), reading order, alt text for images and shapes, slide masters/layouts, and speaker notes.

**Sample prompts:**

```
@powerpoint-accessibility Audit presentation.pptx for accessibility
@powerpoint-accessibility Do all slides have unique titles?
@powerpoint-accessibility Check the reading order on each slide
@powerpoint-accessibility Are all images and shapes given alt text?
```

---

### pr-review

**Team:** GitHub Workflow | **Type:** Specialist

Pull request code review with an accessibility focus — catches accessibility regressions in diffs before they merge. Reviews changed files for ARIA issues, missing labels, contrast problems, and semantic HTML violations.

**Sample prompts:**

```
@pr-review Review PR #42 for accessibility regressions
@pr-review Check the diff in this PR for any new accessibility issues
@pr-review Are there any WCAG violations in the files changed by this PR?
@pr-review Summarize the accessibility impact of this PR
```

---

### projects-manager

**Team:** GitHub Workflow | **Type:** Specialist

Manages GitHub Projects v2 boards, views, custom fields, and iterations via the GraphQL API. This agent exists because GitHub Projects uses drag-and-drop kanban boards that are inaccessible to screen reader users. The agent provides full project board management through structured text commands.

**Sample prompts:**

```
@projects-manager List all projects in this repository
@projects-manager Show me all items in the "Sprint 5" iteration
@projects-manager Move issue #23 to the "In Progress" column
@projects-manager Create a new project board called "Q2 Accessibility Roadmap"
@projects-manager Add a custom field "Priority" with options High, Medium, Low
@projects-manager Show me all items assigned to me across all project boards
@projects-manager Create a new iteration "Sprint 6" starting next Monday
@projects-manager Set the status of issue #45 to "Done" on the project board
@projects-manager List all items in the "Backlog" status sorted by priority
@projects-manager Archive completed items from the current sprint
```

**Tips:** This agent uses the GitHub GraphQL API, which requires a token with `project` scope. If you get permission errors, check your token scopes.

---

### python-specialist

**Team:** Developer Tools | **Type:** Specialist

Python debugging, packaging (PyInstaller, Nuitka, cx_Freeze), testing (pytest, unittest), type checking (mypy, pyright), async programming, and optimization.

**Sample prompts:**

```
@python-specialist Package my Flask app with PyInstaller for Windows distribution
@python-specialist Debug why this async function deadlocks under high load
@python-specialist Set up pytest with coverage for my accessibility scanner project
@python-specialist Convert this synchronous file processor to async
@python-specialist My Nuitka build is missing DLLs — help me troubleshoot
```

---

### release-manager

**Team:** GitHub Workflow | **Type:** Specialist

Manages GitHub releases, tags, assets, and release note generation via the REST API. This agent exists because GitHub's release creation UI has accessibility barriers — small form controls, markdown preview that screen readers can't navigate easily, and asset upload via drag-and-drop.

**Sample prompts:**

```
@release-manager Draft release notes for v3.0.0 based on commits since v2.9.0
@release-manager Create a new release tagged v3.0.0 with the generated notes
@release-manager Upload build artifacts to the latest release
@release-manager List all releases and their download counts
@release-manager Create a pre-release for v3.0.0-beta.1
@release-manager Compare what changed between v2.8.0 and v2.9.0
@release-manager Delete the draft release for v3.0.0-alpha.1
@release-manager Generate a changelog from merged PRs since the last release
```

**Tips:** The agent generates release notes from commit messages and PR titles. Use conventional commits (`feat:`, `fix:`, `docs:`) for best results.

---

### repo-admin

**Team:** GitHub Workflow | **Type:** Specialist

Repository administration — branch protection rules, collaborator management, webhook configuration.

**Sample prompts:**

```
@repo-admin Set up branch protection requiring 2 reviews on main
@repo-admin Add a new collaborator with write access
@repo-admin List all branch protection rules
@repo-admin Configure status checks required before merging
```

---

### repo-manager

**Team:** GitHub Workflow | **Type:** Specialist

Repository-level configuration and management — settings, labels, topics, visibility, and general repository operations.

**Sample prompts:**

```
@repo-manager Update the repository description and topics
@repo-manager Create labels for our accessibility triage workflow
@repo-manager Configure repository settings for auto-merge
@repo-manager List all labels and their usage counts
```

---

### scanner-bridge

**Team:** GitHub Workflow | **Type:** Helper (internal)

Bridges GitHub Accessibility Scanner CI data into the agent ecosystem — parses scanner issues, maps severity levels, and correlates with axe-core rules.

---

### screen-reader-lab

**Team:** Cross-Cutting | **Type:** Specialist

Interactive screen reader simulation — walks through how a screen reader would experience a page. Shows reading order traversal, tab/focus navigation, heading navigation, form navigation, and accessible name computation.

**Sample prompts:**

```
@screen-reader-lab Simulate how NVDA would read this login form
@screen-reader-lab Walk through the heading navigation of this page
@screen-reader-lab Show me the reading order of this card component
@screen-reader-lab What would a screen reader announce for this custom dropdown?
@screen-reader-lab Simulate tab navigation through this navigation menu
```

**Tips:** This agent simulates screen reader behavior — it doesn't replace testing with actual screen readers. Use it for quick feedback during development, then verify with real screen readers.

---

### security-dashboard

**Team:** GitHub Workflow | **Type:** Specialist

Manages Dependabot alerts, code scanning alerts (CodeQL), and secret scanning alerts via the GitHub REST API. This agent exists because GitHub's security dashboard uses color-coded severity badges (red/orange/yellow) that convey severity by color alone, and complex expandable/collapsible alert detail panels that are difficult for screen reader users to navigate.

**Sample prompts:**

```
@security-dashboard Show me all critical Dependabot alerts
@security-dashboard List code scanning alerts sorted by severity
@security-dashboard Are there any exposed secrets in this repository?
@security-dashboard Dismiss Dependabot alert #12 as "not applicable" with a comment
@security-dashboard Show me all high and critical alerts across all categories
@security-dashboard How many security alerts are open vs dismissed?
@security-dashboard Show alerts that were introduced in the last 7 days
@security-dashboard Generate a security status report for stakeholders
```

**Tips:** This agent provides a text-based interface to security data that would otherwise require navigating color-coded visual interfaces. It can filter by severity, state, and alert type.

---

### tables-data-specialist

**Team:** Web Accessibility | **Type:** Specialist

Data table accessibility — `<th>` elements with `scope` attributes, `<caption>` for table purpose, sortable tables, comparison tables, pricing tables, and grid patterns (ARIA grid role).

**Sample prompts:**

```
@tables-data-specialist Review this data table for proper header markup
@tables-data-specialist This table is sortable — what ARIA do I need?
@tables-data-specialist Make this pricing comparison table accessible
@tables-data-specialist Should I use a table or an ARIA grid for this interactive data?
@tables-data-specialist Check all tables in this file for missing captions and header associations
```

---

### team-manager

**Team:** GitHub Workflow | **Type:** Specialist

Organization team membership management — listing team members, adding/removing members, and managing team permissions.

**Sample prompts:**

```
@team-manager List members of the "frontend" team
@team-manager Add @username to the "accessibility-reviewers" team
@team-manager What teams does @username belong to?
```

---

### template-builder

**Team:** GitHub Workflow | **Type:** Specialist

Creates issue and PR templates with accessibility checklists. Generates properly structured YAML-based templates.

**Sample prompts:**

```
@template-builder Create an issue template for accessibility bug reports
@template-builder Build a PR template with an accessibility checklist
@template-builder Create a feature request template that asks about accessibility impact
@template-builder Generate all standard issue templates for our project
```

---

### testing-coach

**Team:** Cross-Cutting | **Type:** Specialist

Teaches accessibility testing — screen reader testing (NVDA, JAWS, VoiceOver), keyboard testing flows, axe-core setup, Playwright accessibility testing, and creating comprehensive test plans.

**Sample prompts:**

```
@testing-coach How do I test this component with NVDA?
@testing-coach Create a keyboard testing checklist for our checkout flow
@testing-coach Set up axe-core as a development dependency with automated testing
@testing-coach What should my accessibility acceptance criteria look like?
@testing-coach Help me write Playwright accessibility tests for our login page
@testing-coach What browser + screen reader combinations should we test?
```

---

### text-quality-reviewer

**Team:** Web Accessibility | **Type:** Specialist

Scans for broken alt text (template variables like `{product.name}`), template variables leaked into ARIA labels, placeholder text used as labels, duplicate accessible names on different elements, and other non-visual text quality issues.

**Sample prompts:**

```
@text-quality-reviewer Scan src/components/ for broken alt text and ARIA labels
@text-quality-reviewer Find any template variables that leaked into accessible names
@text-quality-reviewer Check for duplicate accessible names on interactive elements
@text-quality-reviewer Are there any inputs using placeholder text as their only label?
```

---

### wcag-aaa

**Team:** Cross-Cutting | **Type:** Specialist

AAA-level conformance — the 28 additional criteria beyond AA. Organized by WCAG principle: Perceivable (8), Operable (12), Understandable (8). AAA is aspirational for most sites but may be required for specific government or education contexts.

**Sample prompts:**

```
@wcag-aaa What would it take to reach AAA compliance for our main pages?
@wcag-aaa Check this page against the AAA contrast requirement (7:1)
@wcag-aaa Which AAA criteria are practical to implement on our site?
@wcag-aaa Review our sign language interpretation provisions for SC 1.2.6
```

---

### wcag-guide

**Team:** Cross-Cutting | **Type:** Specialist

WCAG 2.2 explanations — what each criterion means, how to test it, common failures, and examples. Use this when you need to understand a specific WCAG success criterion.

**Sample prompts:**

```
@wcag-guide Explain WCAG 2.4.7 Focus Visible in plain language
@wcag-guide What changed in WCAG 2.2 compared to 2.1?
@wcag-guide How do I test for SC 1.4.3 Contrast (Minimum)?
@wcag-guide What are the most commonly failed WCAG criteria?
@wcag-guide Explain the difference between A, AA, and AAA conformance levels
```

---

### wcag3-preview

**Team:** Cross-Cutting | **Type:** Specialist

WCAG 3.0 Working Draft preview — APCA contrast algorithm, Bronze/Silver/Gold conformance levels, outcome-based testing. This is a draft specification and is not yet final.

**Sample prompts:**

```
@wcag3-preview What's different about WCAG 3.0 compared to 2.2?
@wcag3-preview Explain the APCA contrast method and how it differs from the current algorithm
@wcag3-preview What are Bronze, Silver, and Gold conformance levels?
@wcag3-preview Should we start preparing for WCAG 3.0 now?
```

---

### web-accessibility-wizard

**Team:** Web Accessibility | **Type:** Orchestrator

Full guided web accessibility audit — multi-phase workflow with axe-core scanning, manual code review, cross-page analysis, severity scoring (0-100, A-F grades), and remediation tracking.

**Sample prompts:**

```
@web-accessibility-wizard Run a full audit of http://localhost:3000
@web-accessibility-wizard Audit our 5 main pages and compare patterns across them
@web-accessibility-wizard Re-audit and compare against our previous report
@web-accessibility-wizard Generate a detailed report with priorities and remediation steps
```

---

### web-component-specialist

**Team:** Web Accessibility | **Type:** Specialist

Shadow DOM and custom element accessibility — `ElementInternals`, cross-shadow ARIA, form-associated custom elements, and focus delegation.

**Sample prompts:**

```
@web-component-specialist Make this Shadow DOM component accessible to screen readers
@web-component-specialist How do I use ElementInternals for form participation?
@web-component-specialist My custom element needs to expose ARIA states across the shadow boundary
@web-component-specialist How should focus delegation work in my web component?
```

---

### web-csv-reporter

**Team:** Web Accessibility | **Type:** Helper (internal)

Exports web audit findings to CSV with Deque University help links for each violation.

---

### web-issue-fixer

**Team:** Web Accessibility | **Type:** Helper (internal)

Applies fixes from web audit reports. Separates auto-fixable issues (missing alt text, label associations) from human-judgment items (ambiguous alt text, complex ARIA patterns) and presents both.

**Sample prompts:**

```
@web-issue-fixer Apply fixes from our latest audit report
@web-issue-fixer Show me which issues can be auto-fixed vs need human judgment
@web-issue-fixer Fix all auto-fixable issues in src/components/
```

---

### wiki-manager

**Team:** GitHub Workflow | **Type:** Specialist

Manages GitHub wiki pages — creating, reading, updating, deleting, searching, and organizing wiki content. This agent works by cloning the `{repo}.wiki.git` repository and performing git operations, because GitHub wiki has no REST API. The wiki web UI relies on drag-to-reorder sidebar navigation that is inaccessible to screen reader users.

**Sample prompts:**

```
@wiki-manager List all wiki pages in this repository
@wiki-manager Create a new wiki page called "Accessibility Guidelines"
@wiki-manager Update the "Getting Started" wiki page with new installation instructions
@wiki-manager Search the wiki for pages mentioning "WCAG"
@wiki-manager Delete the outdated "Old Setup Guide" wiki page
@wiki-manager Show me the content of the "Architecture" wiki page
@wiki-manager Reorganize the wiki sidebar order
@wiki-manager Create a wiki page from the contents of docs/setup.md
```

**Tips:** The wiki is a separate git repository (`{owner}/{repo}.wiki.git`). This agent clones it to a temporary directory, makes changes, and pushes. Ensure your GitHub token has wiki permissions.

---

### word-accessibility

**Team:** Document Accessibility | **Type:** Specialist

Microsoft Word accessibility — styles (using Heading 1/2/3 styles instead of bold text), heading hierarchy, lists (using real list formats), tables (with header rows), alt text for images, reading order, and language declarations.

**Sample prompts:**

```
@word-accessibility Audit report.docx for accessibility
@word-accessibility Is this document using proper heading styles or just bold text?
@word-accessibility Check if all images have alt text
@word-accessibility Review table structure — are header rows marked?
@word-accessibility Does this document declare its language?
```

---

### wxpython-specialist

**Team:** Developer Tools | **Type:** Specialist

wxPython GUI development — sizer layouts, event handling, AUI (Advanced User Interface), custom controls, threading, and desktop accessibility integration.

**Sample prompts:**

```
@wxpython-specialist Scaffold an accessible wxPython app with proper sizer layout
@wxpython-specialist My custom control needs keyboard navigation — how do I add it?
@wxpython-specialist Fix the threading issue in my wxPython file processor
@wxpython-specialist Make this dialog accessible to screen readers
@wxpython-specialist How do I handle AUI pane management in an accessible way?
```

---

## Skills (Knowledge Libraries)

Skills are **reference knowledge modules** that agents draw from automatically when they need domain-specific information. You don't invoke skills directly — agents load them as needed. There are **25 skills** organized by domain.

<details>
<summary><strong>All 25 Skills</strong> — Click to expand</summary>

| # | Skill | What Knowledge It Contains |
|---|-------|---------------------------|
| 1 | `accessibility-rules` | Cross-format accessibility rule reference with WCAG 2.2 mapping for DOCX, XLSX, PPTX, and PDF |
| 2 | `ci-integration` | axe-core CLI reference, WCAG 2.2 tag set, baseline file schema, CI/CD templates for GitHub Actions/Azure DevOps/GitLab CI, SARIF integration, gating strategies |
| 3 | `cognitive-accessibility` | WCAG 2.2 cognitive SC reference tables, plain language analysis, COGA guidance, auth pattern detection |
| 4 | `design-system` | Color token contrast computation, framework token paths (Tailwind/MUI/Chakra/shadcn), focus ring validation, WCAG 2.4.13 Focus Appearance |
| 5 | `document-scanning` | File discovery commands, delta detection, scan configuration profiles |
| 6 | `framework-accessibility` | Framework-specific accessibility patterns and fix templates for React, Vue, Angular, Svelte, Tailwind |
| 7 | `github-a11y-scanner` | GitHub Accessibility Scanner detection, issue parsing, severity mapping, axe-core correlation, Copilot fix tracking |
| 8 | `github-analytics-scoring` | Repo health scoring (0-100, A-F), issue/PR priority scoring, confidence levels, delta tracking, velocity metrics |
| 9 | `github-scanning` | GitHub search patterns by intent, date range handling, parallel stream collection, cross-repo intelligence |
| 10 | `github-workflow-standards` | Core standards for GitHub workflow agents — auth, discovery, dual MD+HTML output, HTML accessibility, safety |
| 11 | `help-url-reference` | Deque University URLs, Microsoft Office help URLs, Adobe PDF help URLs, WCAG understanding document URLs |
| 12 | `lighthouse-scanner` | Lighthouse CI audit detection, score interpretation, weight-to-severity mapping, score regression tracking |
| 13 | `markdown-accessibility` | Ambiguous link patterns, anchor validation, emoji handling, Mermaid diagram alternatives, heading structure, severity scoring |
| 14 | `mobile-accessibility` | React Native prop reference, iOS/Android API quick reference, touch target rules, violation patterns |
| 15 | `playwright-testing` | Playwright accessibility testing patterns — a11y tree inspection, keyboard navigation, contrast scanning, viewport testing |
| 16 | `python-development` | Python and wxPython development patterns, packaging, testing, cross-platform paths |
| 17 | `report-generation` | Audit report formatting, severity scoring formulas (0-100, A-F grades), VPAT/ACR compliance export |
| 18 | `web-scanning` | Web content discovery, URL crawling, axe-core CLI commands, framework detection |
| 19 | `web-severity-scoring` | Web severity scoring formulas, confidence levels, remediation tracking |
| 20 | `data-visualization-accessibility` | Chart accessibility patterns, SVG ARIA, charting library APIs, color-safe palettes |
| 21 | `email-accessibility` | Email client rendering constraints, table-based layout, bulletproof buttons, dark mode patterns |
| 22 | `legal-compliance-mapping` | Section 508, ADA, EN 301 549, EAA, AODA framework mapping, VPAT 2.5 editions |
| 23 | `media-accessibility` | WebVTT/SRT/TTML caption formats, caption quality metrics, audio description requirements, WCAG 1.2.x mapping |
| 24 | `testing-strategy` | Automated vs manual testing coverage, browser+AT compatibility matrix, regression patterns, acceptance criteria |
| 25 | `office-remediation` | Office document OOXML manipulation patterns, python-docx/openpyxl/python-pptx API references, PowerShell COM automation, direct OOXML XML manipulation |

</details>

### Where Skills Live Per Platform

| Platform | Location | Format |
|----------|----------|--------|
| **GitHub Copilot** | `.github/skills/skill-name/SKILL.md` | YAML frontmatter + markdown |
| **Gemini CLI** | `.gemini/extensions/a11y-agents/skills/skill-name/SKILL.md` | YAML frontmatter + markdown |
| **Claude Code** | Knowledge is inlined into agent instructions | Part of agent files |
| **Codex** | Not applicable | Knowledge in role files |

---

## Prompts (One-Click Workflows)

Prompts are **pre-built workflows** that you can launch with a single click or command. They combine multiple agents and tools into a structured flow. There are **134 prompt files** organized by category.

### How to Use Prompts

- **VS Code:** Open the Copilot Chat prompt picker and select a prompt, or type `@workspace /prompt-name`
- **Claude Code:** Type `/prompt-name` or describe the workflow
- **Gemini CLI:** Describe the workflow — Gemini will match it to the appropriate skill

### Web Accessibility Prompts

| Prompt | What It Does | When to Use It |
|--------|-------------|----------------|
| `audit-web-page` | Full single-page audit with axe-core scan and code review | Comprehensive page audit |
| `quick-web-check` | Fast axe-core triage — runtime scan only, pass/fail | Quick pass/fail check |
| `audit-web-multi-page` | Multi-page comparison audit with cross-page pattern detection | Site-wide audit |
| `compare-web-audits` | Compare two audit reports to track remediation progress | After fixing issues |
| `fix-web-issues` | Interactive fix mode — auto-fixable and human-judgment items | Applying fixes from audit |
| `export-web-csv` | Export web audit findings to CSV with Deque University help links | Reporting |
| `setup-web-cicd` | Configure CI/CD accessibility scanning pipeline | Setting up CI |
| `setup-github-scanner` | Set up GitHub Accessibility Scanner | CI integration |
| `setup-lighthouse-scanner` | Set up Lighthouse CI accessibility scanning | CI integration |
| `a11y-pr-check` | Analyze PR diffs for accessibility regressions | Before merging PRs |

### Document Accessibility Prompts

| Prompt | What It Does | When to Use It |
|--------|-------------|----------------|
| `audit-single-document` | Scan a single `.docx`/`.xlsx`/`.pptx`/`.pdf` with severity scoring | Single file audit |
| `audit-document-folder` | Recursively scan an entire folder of documents | Bulk document audit |
| `audit-changed-documents` | Delta scan — only audit documents changed since last commit | Incremental scanning |
| `quick-document-check` | Fast triage — errors only, pass/fail verdict | Quick check |
| `compare-audits` | Compare two audit reports to track remediation progress | Progress tracking |
| `generate-vpat` | Generate a VPAT 2.5 / ACR compliance report | Procurement |
| `generate-remediation-scripts` | Create PowerShell/Bash scripts to batch-fix common issues | Automated fixes |
| `create-accessible-template` | Guidance for creating accessible document templates | Template creation |
| `setup-document-cicd` | Set up CI/CD pipelines for automated document scanning | CI integration |
| `export-document-csv` | Export findings to CSV with help links | Reporting |

### Markdown Accessibility Prompts

| Prompt | What It Does | When to Use It |
|--------|-------------|----------------|
| `audit-markdown` | Full markdown audit with scoring and saved report | Comprehensive audit |
| `quick-markdown-check` | Fast triage — errors only, inline pass/fail | Quick check |
| `fix-markdown-issues` | Interactive fix mode from saved report | Applying fixes |
| `compare-markdown-audits` | Track remediation progress between audits | Progress tracking |
| `export-markdown-csv` | Export findings to CSV | Reporting |

### GitHub Workflow Prompts

| Prompt | What It Does | When to Use It |
|--------|-------------|----------------|
| `daily-briefing` | Morning overview of issues, PRs, CI | Start of day |
| `review-pr` | Review a pull request with accessibility focus | PR review |
| `pr-report` | PR summary report | Reporting |
| `pr-comment` | Comment on a PR | Collaboration |
| `merge-pr` | Merge a pull request | Merging |
| `create-issue` | Create a new issue | Issue creation |
| `manage-issue` | Update issue labels/assignees | Issue management |
| `triage` | Issue triage workflow | Prioritization |
| `my-issues` | List your assigned issues | Personal dashboard |
| `my-prs` | List your open PRs | Personal dashboard |
| `my-stats` | Your contribution statistics | Personal metrics |
| `ci-status` | CI/CD pipeline status | CI monitoring |
| `project-status` | Overall project health | Project monitoring |
| `security-dashboard` | Security overview | Security monitoring |
| `notifications` | GitHub notifications | Notification management |
| `draft-release` | Draft release notes | Release management |
| `release-prep` | Release preparation | Release management |
| `build-template` | Build issue/PR templates | Template creation |
| `add-collaborator` | Add a collaborator to the repository | Repo administration |
| `address-comments` | Address PR review comments | PR workflow |
| `issue-reply` | Reply to an issue with context | Issue communication |
| `manage-branches` | Branch management operations | Branch operations |
| `onboard-repo` | Onboard a new repository with labels, templates, and settings | New repo setup |
| `pr-author-checklist` | PR author self-review checklist | PR quality |
| `refine-issue` | Refine and improve an issue description | Issue quality |
| `sprint-review` | Sprint review summary and metrics | Sprint management |
| `team-dashboard` | Team activity dashboard | Team visibility |
| `wiki-manager` | Manage wiki pages | Wiki management |

### Developer Tools Prompts

| Prompt | What It Does | When to Use It |
|--------|-------------|----------------|
| `scaffold-wxpython-app` | Scaffold an accessible wxPython desktop app | New desktop app |
| `scaffold-nvda-addon` | Scaffold an NVDA screen reader addon | New NVDA addon |
| `package-python-app` | Package Python app with PyInstaller/Nuitka/cx_Freeze | Distribution |
| `audit-desktop-a11y` | Desktop app accessibility audit | Desktop testing |
| `test-desktop-a11y` | Desktop accessibility test plan | Test planning |
| `review-text-quality` | Scan for broken alt text, placeholder labels | Code review |
| `generate-a11y-tests` | Generate accessibility test cases | Test generation |

### Cross-Cutting Prompts

| Prompt | What It Does | When to Use It |
|--------|-------------|----------------|
| `generate-accessibility-statement` | Generate W3C or EU model accessibility statement | Compliance |
| `audit-email-template` | Audit HTML email for accessibility | Email development |
| `audit-media-content` | Audit video/audio for captions and descriptions | Media content |
| `onboard-team` | Role-specific accessibility onboarding document | Team onboarding |
| `accessibility-dashboard` | Aggregate all audits into unified dashboard | Executive reporting |
| `audit-document-conversion` | Compare source document against exported PDF for accessibility preservation | Document conversion |
| `audit-native-app` | Accessibility audit for React Native, Expo, iOS, and Android apps | Mobile app audit |
| `build-a11y-template` | Build an accessible document template with guidance | Template creation |
| `component-library-audit` | Per-component accessibility scorecard across a component directory | Component library |
| `document-training` | Role-specific accessibility training materials for document authors | Author training |
| `explain-code` | Explain code with accessibility context | Code understanding |
| `react` | React component accessibility review | React development |
| `training-scenario` | Interactive accessibility training with quizzes and before/after comparisons | Education |

### Agent-Specific Prompts

Every user-facing agent has a matching prompt file that invokes it directly. For example:

- `accessibility-lead.prompt.md` invokes `accessibility-lead`
- `aria-specialist.prompt.md` invokes `aria-specialist`
- `contrast-master.prompt.md` invokes `contrast-master`

These are useful when you know exactly which agent you want and want to skip the orchestrator.

---

## Always-On Instructions

Instructions are **rules that fire automatically on every code completion** for matching files. You don't invoke them — they work silently in the background. There are **9 instruction files**.

| Instruction | Applies To | What It Enforces |
|-------------|-----------|------------------|
| `web-accessibility-baseline` | `*.html, *.jsx, *.tsx, *.vue, *.svelte, *.astro` | Interactive elements, images, forms, headings, color/contrast, live regions, ARIA rules, motion |
| `semantic-html` | `*.html, *.jsx, *.tsx, *.vue, *.svelte, *.astro` | Landmark structure, buttons vs links, lists, tables, forms, disclosure widgets, heading hierarchy |
| `aria-patterns` | `*.html, *.jsx, *.tsx, *.vue, *.svelte, *.astro` | Correct ARIA role/state/property usage, common widget patterns |
| `markdown-accessibility` | `*.md` | Ambiguous links, alt text, heading hierarchy, tables, emoji, Mermaid diagrams, em-dashes, anchors |
| `multi-agent-reliability` | All files | Agent delegation reliability, error handling, graceful fallbacks |
| `powershell-terminal-ops` | All files | PowerShell-specific terminal operation best practices |
| `data-viz-accessibility` | `*.html, *.jsx, *.tsx, *.vue, *.svelte` | Chart and visualization accessibility, SVG ARIA, data table alternatives |
| `testing-accessibility` | `*.test.*, *.spec.*` | Accessibility testing patterns and assertions |
| `css-accessibility` | `*.css, *.scss, *.less` | Focus visibility, motion safety (`prefers-reduced-motion`), high contrast, touch target sizing, `outline: none` prevention |
| `document-generation` | `*.py, *.js, *.ts, *.mjs, *.cjs` | Catches document generation library imports and enforces accessibility metadata, heading structure, alt text, table headers, language settings |

These instructions are the **highest-leverage accessibility enforcement** — they provide correction guidance at the point of code generation without requiring any agent to be invoked.

---

## MCP Server (24 Tools)

The MCP (Model Context Protocol) server provides **24 scanning tools** that Claude Desktop, agents, and other MCP-compatible clients can call for automated accessibility analysis.

### What Is the MCP Server?

The MCP server is a standalone Node.js application that exposes accessibility scanning functionality as callable tools. When connected to Claude Desktop (or any MCP client), Claude can directly execute contrast checks, scan documents, run axe-core against live URLs, and more — without you needing to run commands manually.

### Installation

```bash
cd accessibility-agents/mcp-server
npm install
```

### Running Modes

**stdio mode (for Claude Desktop — recommended for local use):**

Add to your Claude Desktop `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "a11y-agents": {
      "command": "node",
      "args": ["/path/to/accessibility-agents/mcp-server/stdio.js"]
    }
  }
}
```

Replace `/path/to/` with the actual path to where you cloned the repository. On Windows, use forward slashes or escaped backslashes:

```json
"args": ["C:/Users/you/accessibility-agents/mcp-server/stdio.js"]
```

**HTTP mode (for remote/shared use or CI/CD):**

```bash
node server.js
# Server starts on http://127.0.0.1:3456
# MCP endpoint: http://127.0.0.1:3456/mcp
# Health check: http://127.0.0.1:3456/health
```

Environment variables:
- `PORT` — Server port (default: 3456)
- `HOST` — Bind address (default: 127.0.0.1)
- `MCP_STATELESS` — Stateless mode for CI/CD (default: false)

### Interacting with the MCP Server

Once the MCP server is connected to Claude Desktop, you interact with it by asking Claude questions in natural language. Claude will call the appropriate MCP tools automatically.

**You don't need to know the tool names.** Just describe what you want:

| What You Say to Claude | Tool Called Behind the Scenes |
|------------------------|------------------------------|
| "Check the contrast between #333 and #fff" | `check_contrast` |
| "Is this heading structure valid?" (paste HTML) | `check_heading_structure` |
| "Find ambiguous link text in this page" (paste HTML) | `check_link_text` |
| "Check if all form inputs have labels" (paste HTML) | `check_form_labels` |
| "What WCAG guidelines apply to modal dialogs?" | `get_accessibility_guidelines` |
| "Scan report.docx for accessibility" | `scan_office_document` |
| "Check this PDF for accessibility" | `scan_pdf_document` |
| "Scan all documents in the reports/ folder" | `batch_scan_documents` |
| "Run an accessibility scan on http://localhost:3000" | `run_axe_scan` |
| "Show me the accessibility tree of this page" | `run_playwright_a11y_tree` |
| "Test keyboard navigation on the login page" | `run_playwright_keyboard_scan` |

### Complete Tool Reference

#### Core Scanning Tools (13)

| Tool | Input | What It Does | Example Usage |
|------|-------|-------------|---------------|
| `check_contrast` | Two hex colors | Returns contrast ratio, WCAG AA/AAA pass/fail for text and UI components | "Is #6B7280 on #FFFFFF accessible for body text?" |
| `get_accessibility_guidelines` | Component type | Returns detailed WCAG guidelines for 9 component types: button, form, modal, table, navigation, image, heading, link, list | "What accessibility requirements apply to data tables?" |
| `check_heading_structure` | HTML string | Finds heading hierarchy issues — skipped levels, multiple H1s, empty headings | "Paste your page HTML and ask for heading analysis" |
| `check_link_text` | HTML string | Detects ambiguous link text — "click here", "read more", bare URLs | "Check these links for accessible text" |
| `check_form_labels` | HTML string | Validates every input has an associated `<label>` or `aria-label` | "Are all my form inputs properly labeled?" |
| `scan_office_document` | File path | Scans `.docx`/`.xlsx`/`.pptx` for accessibility issues with severity scoring | "Scan C:/docs/report.docx" |
| `scan_pdf_document` | File path | Scans PDF for tagged structure, alt text, reading order, form fields | "Check report.pdf for accessibility" |
| `extract_document_metadata` | File path | Extracts title, author, language, creation date, and other properties | "What metadata does this document have?" |
| `batch_scan_documents` | Directory path | Scans all documents in a directory with aggregate scoring | "Scan everything in the reports folder" |
| `fix_document_metadata` | File path + fixes | Generates PowerShell/Bash scripts to fix document metadata | "Fix the missing title in report.docx" |
| `fix_document_headings` | File path | Parses `.docx` heading structure from OOXML and identifies issues | "Analyze the heading structure in manual.docx" |
| `check_audit_cache` | File paths | Checks which files changed since last scan (for incremental scanning) | "Which documents changed since my last audit?" |
| `update_audit_cache` | Scan results | Saves scan results so next run only checks changed files | Automatic — called after scanning |

#### Playwright Browser Testing Tools (5)

These tools require Playwright and a browser to be available. They test against live, running web pages.

| Tool | Input | What It Does | Example Usage |
|------|-------|-------------|---------------|
| `run_axe_scan` | URL | Runs the axe-core accessibility engine against a live URL and returns all violations | "Run an axe scan on http://localhost:3000/login" |
| `run_playwright_a11y_tree` | URL | Captures the full accessibility tree as seen by assistive technology | "Show me the a11y tree of our homepage" |
| `run_playwright_keyboard_scan` | URL | Tests keyboard navigation — tab order, focus indicators, keyboard traps | "Test keyboard nav on the checkout page" |
| `run_playwright_contrast_scan` | URL | Screenshots and analyzes actual rendered colors for contrast | "Check contrast on our dark theme" |
| `run_playwright_viewport_scan` | URL + viewport size | Tests reflow at different viewport widths (WCAG 1.4.10) | "Test our page at 320px wide" |

#### PDF-Specific Tools (2)

| Tool | Input | What It Does | Example Usage |
|------|-------|-------------|---------------|
| `run_verapdf_scan` | File path | PDF/UA validation via the veraPDF engine | "Validate this PDF against PDF/UA" |
| `convert_pdf_form_to_html` | File path | Converts PDF form fields to accessible HTML form | "Convert this PDF application form to HTML" |

### Built-in MCP Prompts

The MCP server includes built-in prompts accessible from Claude Desktop's prompt menu:

| Prompt | What It Does |
|--------|-------------|
| `audit-page` | Structured WCAG audit instruction with tool sequence and scoring |
| `Full Accessibility Audit` | Comprehensive WCAG review |
| `ARIA Review` | Focused ARIA attribute audit |
| `Color Contrast Review` | Visual contrast checking |

### Example MCP Interaction Session

Here is a complete example of how a user interacts with Claude Desktop + MCP server to audit a document:

```
User: I need to check if our annual report is accessible. The file is at C:/docs/annual-report.docx

Claude: I'll scan that document for accessibility issues.
[Calls scan_office_document with path "C:/docs/annual-report.docx"]

Results: Found 8 issues:
- CRITICAL: Document has no title set in metadata
- SERIOUS: 3 images missing alt text (pages 2, 5, 8)
- SERIOUS: Heading levels skip from H1 to H3 (page 4)
- MODERATE: No document language declared
- MODERATE: Table on page 6 has no header row marked
- MINOR: 2 empty paragraphs used for spacing

Overall score: 58/100 (F)

User: Can you fix the metadata issues automatically?

Claude: I'll generate a fix script for the metadata.
[Calls fix_document_metadata]

Here's a PowerShell script that will set the title and language...
```

And here is an example of auditing a live web page:

```
User: Run an accessibility scan on our staging site at http://staging.example.com/login

Claude: I'll run an axe-core scan against that URL.
[Calls run_axe_scan with URL "http://staging.example.com/login"]

Found 5 violations:
- CRITICAL: Form inputs without labels (2 instances)
- SERIOUS: Color contrast insufficient (3 instances)
- MODERATE: Page has no main landmark
...

Shall I also test keyboard navigation?

User: Yes

Claude: [Calls run_playwright_keyboard_scan]
Keyboard navigation results:
- Tab order follows logical reading order ✓
- Focus indicators visible ✓  
- Warning: Focus gets trapped in the date picker
...
```

---

## Working with Files

Many agents work with files — reading source code, scanning documents, and applying fixes. Here is how to direct agents to work with specific files.

### Pointing Agents to Files

**Single file:**
```
@accessibility-lead Review the accessibility of src/components/LoginForm.tsx
@document-accessibility-wizard Audit docs/report.docx
@pdf-accessibility Check report.pdf for PDF/UA compliance
```

**Directory (recursive):**
```
@accessibility-lead Audit all components in src/components/
@document-accessibility-wizard Scan all documents in docs/ recursively
@markdown-a11y-assistant Check all markdown files in the project
```

**Specific lines or sections:**
```
@aria-specialist Check the ARIA usage on lines 45-80 of src/components/Dropdown.tsx
@forms-specialist Review the form section starting at line 120 in RegisterPage.tsx
```

**Currently open file (VS Code):**
```
@accessibility-lead Review the current file
@contrast-master Check the contrast values in this file
```

**Git diff (changed files only):**
```
@pr-review Check the files changed in this PR for accessibility regressions
@document-accessibility-wizard Only scan documents that changed since the last commit
```

### File-Based Agent Categories

| Agent Category | File Types They Work With | How They Access Files |
|---------------|--------------------------|----------------------|
| **Web Accessibility agents** | `.html`, `.jsx`, `.tsx`, `.vue`, `.svelte`, `.astro`, `.css` | Read source code, suggest edits |
| **Document Accessibility agents** | `.docx`, `.xlsx`, `.pptx`, `.pdf`, `.epub` | Parse binary formats, extract structure |
| **Markdown agents** | `.md` | Read and edit markdown text |
| **GitHub Workflow agents** | Any (via GitHub API) | Access files through repository API |
| **Developer Tools agents** | `.py`, `.wxs`, various | Read, analyze, and edit source code |

### Applying Fixes

Some agents can directly edit files to apply fixes:

- **`web-issue-fixer`** — Edits HTML/JSX/CSS files to fix issues found in web audits
- **`markdown-fixer`** — Edits `.md` files to apply approved fixes
- **`pdf-remediator`** — Generates scripts (not direct edits) to fix PDF metadata
- **`fix_document_metadata`** (MCP tool) — Generates PowerShell/Bash scripts for document fixes

When an agent proposes fixes, it will either:
1. **Auto-fix**: Apply the change directly (you'll see the edit in your editor)
2. **Human-judgment**: Present the issue and ask you to decide (e.g., ambiguous alt text where human context is needed)

### MCP Server File Access

The MCP tools access files by **absolute path**. When asking Claude Desktop to scan files:

```
# Correct — absolute path
"Scan C:/Users/me/project/docs/report.docx for accessibility"

# Also correct — if Claude has context about your workspace
"Scan the report.docx file in the docs folder"

# For batch scanning — point to a directory
"Scan all documents in C:/Users/me/project/docs/"
```

---

## Common Workflows and Recipes

### Recipe 1: Full Web Accessibility Audit

**Goal:** Comprehensive WCAG 2.2 AA audit of a web application.

```
Step 1: @web-accessibility-wizard Run a full audit of http://localhost:3000
Step 2: Review the generated report (saved as WEB-ACCESSIBILITY-AUDIT.md)
Step 3: @web-issue-fixer Apply fixes from the audit report
Step 4: @web-accessibility-wizard Re-audit and compare against the previous report
```

Or use the one-click prompt: `@workspace /audit-web-page`

### Recipe 2: Document Library Audit

**Goal:** Scan all Office documents in a project for accessibility.

```
Step 1: @document-accessibility-wizard Scan all documents in docs/ recursively
Step 2: Review the report (DOCUMENT-ACCESSIBILITY-AUDIT.md)
Step 3: @pdf-remediator Generate fix scripts for the PDF issues
Step 4: @document-accessibility-wizard Re-scan to verify fixes
```

### Recipe 3: PR Accessibility Gate

**Goal:** Catch accessibility regressions before they merge.

```
Step 1: @pr-review Review PR #42 for accessibility regressions
Step 2: If issues found, the agent comments on specific lines
Step 3: Fix the flagged issues
Step 4: @pr-review Re-review to confirm fixes
```

For CI automation: `@ci-accessibility Set up axe-core scanning in our GitHub Actions pipeline`

### Recipe 4: Daily GitHub Workflow

**Goal:** Start your day with a complete picture and manage work through agents.

```
Step 1: @daily-briefing Give me my morning briefing
Step 2: @projects-manager Show me all items in the current sprint
Step 3: @issue-tracker Triage the new issues from overnight
Step 4: @actions-manager Check if any CI workflows failed
Step 5: @security-dashboard Show me new security alerts
Step 6: @notifications-manager Show my unread notifications filtered by mentions
```

### Recipe 5: Design System Token Audit

**Goal:** Validate that design tokens meet accessibility requirements before they reach components.

```
Step 1: @design-system-auditor Audit our Tailwind color tokens for WCAG AA contrast
Step 2: @design-system-auditor Check focus ring tokens for WCAG 2.4.13 visibility
Step 3: @design-system-auditor Validate spacing tokens against touch target minimums
Step 4: @design-system-auditor Review motion tokens for prefers-reduced-motion support
```

### Recipe 6: Mobile App Accessibility Review

**Goal:** Audit a React Native app for mobile accessibility.

```
Step 1: @mobile-accessibility Audit all screens in src/screens/
Step 2: Review touch target sizes (44x44pt minimum)
Step 3: Verify accessibilityLabel values on all interactive elements
Step 4: @testing-coach Create a VoiceOver/TalkBack testing plan
```

### Recipe 7: New Component Development

**Goal:** Build an accessible component from scratch.

```
Step 1: @accessibility-lead What accessibility requirements apply to a combobox?
Step 2: @aria-specialist What ARIA pattern should I use?
Step 3: Build the component following the guidance
Step 4: @keyboard-navigator Check the tab order and keyboard interaction
Step 5: @accessibility-lead Full review of the finished component
```

### Recipe 8: Markdown Documentation Audit

**Goal:** Ensure all project documentation is accessible.

```
Step 1: @markdown-a11y-assistant Audit all markdown files in docs/
Step 2: Review the report — fix critical issues first
Step 3: @markdown-fixer Apply auto-fixes for heading hierarchy and em-dashes
Step 4: Decide on human-judgment items (ambiguous link text)
Step 5: @markdown-a11y-assistant Re-audit and compare to show progress
```

### Recipe 9: Release Management

**Goal:** Create a release with generated notes and uploaded assets.

```
Step 1: @release-manager Generate a changelog from merged PRs since v2.0.0
Step 2: @release-manager Draft release notes for v2.1.0
Step 3: Review and edit the generated notes
Step 4: @release-manager Create the release with the finalized notes
Step 5: @release-manager Upload build artifacts to the release
```

### Recipe 10: Security Alert Triage

**Goal:** Review and address security alerts without using the web UI.

```
Step 1: @security-dashboard Show all critical and high severity alerts
Step 2: Review each alert — decide if it needs action or can be dismissed
Step 3: @security-dashboard Dismiss alert #12 as "not applicable" with explanation
Step 4: @actions-manager Re-run the security scan workflow to verify
Step 5: @security-dashboard Generate a security status report
```

### Recipe 11: Wiki Documentation

**Goal:** Manage wiki pages without the web UI.

```
Step 1: @wiki-manager List all wiki pages
Step 2: @wiki-manager Create a new page "API Reference" with initial content
Step 3: @wiki-manager Update the "Getting Started" page with new install steps
Step 4: @wiki-manager Search for pages mentioning outdated version numbers
Step 5: @wiki-manager Reorganize the sidebar navigation
```

### Recipe 12: Project Board Sprint Management

**Goal:** Manage a sprint using GitHub Projects boards.

```
Step 1: @projects-manager Create a new iteration "Sprint 7" starting Monday
Step 2: @projects-manager Move backlog items to the new sprint
Step 3: @projects-manager Set priority fields on each item
Step 4: @projects-manager Show me a summary of the current sprint status
Step 5: @projects-manager Archive completed items from the previous sprint
```

---

## Platform Comparison

### Feature Matrix

| Feature | Copilot (VS Code) | Copilot CLI | Claude Code | Gemini CLI | Codex CLI | Claude Desktop |
|---------|-------------------|-------------|-------------|------------|-----------|----------------|
| Agents available | 80 | 80 | 80 | 98 skills | 11 roles | Via MCP |
| Agent picker UI | Dropdown | `/agent` | `/agents` | N/A | `--role` | N/A |
| One-click prompts | 134 | 134 | Describe | Describe | N/A | 3 MCP prompts |
| Always-on instructions | 9 | 9 | Via hooks | N/A | N/A | N/A |
| Skills | 25 auto-loaded | 25 | Inlined | 18 | N/A | N/A |
| MCP tools | N/A | N/A | N/A | N/A | N/A | 24 tools |
| Edit gate enforcement | N/A | N/A | 3 hooks | N/A | N/A | N/A |
| Image analysis | With setting | N/A | With setting | N/A | N/A | Built-in |

### Which Platform Should You Use?

- **GitHub Copilot (VS Code)** — Best overall experience. Full agent picker, 134 one-click prompts, always-on instructions for automatic guidance, and inline code completions with accessibility checks.
- **Claude Code CLI** — Best enforcement. The three-hook system makes accessibility review mandatory for web projects — Claude cannot skip it. Good for teams that want zero-exception compliance.
- **Claude Desktop + MCP** — Best for document scanning. The 24 MCP tools let Claude directly scan files, check contrast, and run axe-core without manual commands. Good for non-developers who need to audit documents.
- **Gemini CLI** — Good for teams already using Gemini. 98 skills provide comprehensive coverage, though without the agent picker UI.
- **Codex CLI** — Lightweight option with 11 core roles. Good for quick checks but limited compared to other platforms.

---

## Troubleshooting

### VS Code: Agents Don't Appear in Picker

1. Make sure `.github/agents/` exists in your workspace root
2. Restart VS Code (agents are loaded on startup)
3. Check that each agent file has valid YAML frontmatter (starts with `---`)
4. Open the Output panel and select "GitHub Copilot" to check for errors

### VS Code: Monorepo — Agents Not Found

If you open a subfolder of a monorepo, agents in the parent folder won't be found by default.

**Fix:** Enable `chat.useCustomizationsInParentRepositories` in VS Code settings. This tells Copilot to look in parent directories up to the repository root.

### Claude Code: Edit Gate Blocking Edits

If Claude Code blocks your file edits with a "permission denied" message, it means the accessibility-lead hasn't been consulted yet.

**Fix:** Ask `@accessibility-lead` to review first, then try the edit again. The edit gate unlocks for the rest of the session after accessibility-lead completes.

### MCP Server: Connection Refused

1. Verify the server is running: `curl http://127.0.0.1:3456/health`
2. Check the port isn't in use: `netstat -an | grep 3456`
3. For stdio mode, verify the path in `claude_desktop_config.json` is correct
4. Make sure `npm install` was run in the `mcp-server/` directory

### MCP Server: Playwright Tools Fail

The Playwright tools (`run_axe_scan`, `run_playwright_*`) need Playwright and browsers installed:

```bash
cd mcp-server
npx playwright install chromium
```

### Scan Configuration Not Applied

If your scan config (`.a11y-office-config.json`, `.a11y-web-config.json`) isn't being used:

1. The config file must be in the workspace root
2. File name must match exactly (case-sensitive)
3. JSON must be valid — run it through a JSON validator
4. Use templates from `templates/` as a starting point

### Agent Returns Generic Response

If an agent gives a generic answer instead of specific analysis:

1. Point it at specific files: `@aria-specialist Review src/Header.tsx` not just `@aria-specialist Review the header`
2. Provide context: paste the relevant code or describe the component
3. Use the specialist directly instead of the orchestrator if you know what you need

---

## Glossary

| Term | Definition |
|------|-----------|
| **Agent** | An AI-powered specialist with domain knowledge. Defined as a markdown file with YAML frontmatter that tells the AI how to behave. |
| **ARIA** | Accessible Rich Internet Applications. A W3C specification that defines attributes to make web content more accessible to assistive technology. |
| **Audit** | A systematic review of content against accessibility standards (WCAG). Produces a scored report with findings. |
| **axe-core** | An open-source accessibility testing engine by Deque Systems. The industry standard for automated web accessibility scanning. |
| **Delta scan** | Only scanning files that changed since the last audit, rather than rescanning everything. |
| **Hook** | Claude Code enforcement mechanism that runs before/after tool use. Used for the three-hook accessibility gate. |
| **Instruction** | A markdown file that fires automatically on every Copilot completion for matching file patterns. No invocation needed. |
| **MCP** | Model Context Protocol. A standard for connecting AI models to external tools and data sources. |
| **Orchestrator** | An agent that coordinates other agents rather than doing the work itself. Examples: `accessibility-lead`, `github-hub`, `nexus`. |
| **PDF/UA** | PDF/Universal Accessibility. An ISO standard (14289) for accessible PDF documents. |
| **Playwright** | A browser automation framework by Microsoft. Used for behavioral accessibility testing against live web pages. |
| **Prompt** | A pre-built workflow file that combines multiple agents into a structured sequence. Launched with one click. |
| **Severity** | Issue impact level. Critical (blocks access), Serious (significant barrier), Moderate (inconvenient), Minor (best practice). |
| **Skill** | A reference knowledge module that agents draw from. Contains rules, scoring formulas, and domain-specific data. |
| **VPAT** | Voluntary Product Accessibility Template. A document that explains how a product conforms to accessibility standards. Version 2.5 supports Section 508, EN 301 549, and WCAG. |
| **WCAG** | Web Content Accessibility Guidelines. Published by the W3C. Version 2.2 is the current standard, with AA being the most commonly required conformance level. |
