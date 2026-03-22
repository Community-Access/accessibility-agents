# Accessibility Agents — Complete User Guide

> **Your instructor in a pocket.** This guide walks you through every team, agent, skill, prompt, and workflow in the Accessibility Agents ecosystem. Whether you are brand new to accessibility or an experienced auditor, this guide will help you use the right tool at the right time.

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
5. [Every Agent Explained](#every-agent-explained)
6. [Skills (Knowledge Libraries)](#skills-knowledge-libraries)
7. [Prompts (One-Click Workflows)](#prompts-one-click-workflows)
8. [Always-On Instructions](#always-on-instructions)
9. [MCP Server (20 Tools)](#mcp-server-20-tools)
10. [Common Workflows & Recipes](#common-workflows--recipes)
11. [Platform Comparison](#platform-comparison)
12. [Troubleshooting](#troubleshooting)
13. [Glossary](#glossary)

---

## What Are Accessibility Agents?

Accessibility Agents is a collection of **65 AI-powered specialists** that help you build, audit, and fix accessibility issues in web apps, documents, mobile apps, and desktop software. They enforce **WCAG 2.2 AA** standards — the international benchmark for digital accessibility.

**Think of it like a team of accessibility consultants that live inside your code editor.** Each specialist knows one domain deeply:

- One agent knows everything about ARIA attributes
- Another specializes in keyboard navigation
- Another checks color contrast ratios
- Another audits Word and PDF documents
- And so on — 65 specialists in total

You don't need to know which agent to call. The system includes **orchestrator agents** (like Accessibility Lead and the Wizards) that coordinate the right specialists automatically.

### What Problems Does This Solve?

1. **AI code generators don't write accessible code by default.** These agents catch issues that Copilot, Claude, and other tools typically miss.
2. **Accessibility audits are tedious.** The wizard agents automate multi-step audit workflows that would take hours manually.
3. **WCAG is complex.** 78 success criteria across 4 principles. The agents know all of them so you don't have to memorize them.
4. **Document accessibility is overlooked.** Word, Excel, PowerPoint, and PDF files need accessibility too. Dedicated agents handle that.

---

## How the Ecosystem Fits Together

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR CODE EDITOR                         │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ GitHub   │  │ Claude   │  │ Gemini   │  │ Codex    │   │
│  │ Copilot  │  │ Code     │  │ CLI      │  │ CLI      │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │              │              │              │         │
│       ▼              ▼              ▼              ▼         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              65 Accessibility Agents                  │   │
│  │  ┌─────────────────────────────────────────────────┐ │   │
│  │  │ 7 Teams: Web • Document • Markdown • GitHub •   │ │   │
│  │  │          Developer • Mobile • Design System     │ │   │
│  │  └─────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
│       │                                                     │
│       ▼                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ 19 Skills│  │111 Prompts│  │ 6 Inst.  │                  │
│  │(knowledge│  │(one-click │  │(always-on│                  │
│  │ modules) │  │ workflows)│  │ guidance)│                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          MCP Server (20 scanning tools)               │   │
│  │  Contrast • Headings • Links • Forms • axe-core •    │   │
│  │  Office docs • PDFs • Playwright • veraPDF            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### The Four Layers

| Layer | What It Is | Count |
|-------|-----------|-------|
| **Agents** | AI specialists that read, analyze, and fix code | 65 agents in 7 teams |
| **Skills** | Reference knowledge that agents draw from (WCAG rules, scoring formulas, etc.) | 19 knowledge modules |
| **Prompts** | Pre-built workflows you can launch with one click | 111 prompt files |
| **Instructions** | Always-on rules that fire on every code completion | 6 instruction files |

Plus the **MCP Server** with 20 scanning tools that agents can call for automated analysis.

---

## Quick Start (Pick Your Platform)

Choose the platform you use. Each section walks you through installation including how to verify it is working.

<details>
<summary><strong>🟣 GitHub Copilot (VS Code)</strong> — Click to expand</summary>

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

- **65 agent files** in `.github/agents/*.agent.md`
- **19 skill folders** in `.github/skills/*/SKILL.md` — loaded automatically when relevant
- **111 prompt files** in `.github/prompts/*.prompt.md` — appear in the prompt picker
- **6 instruction files** in `.github/instructions/*.instructions.md` — fire on every completion for matching files
- **Workspace instructions** in `.github/copilot-instructions.md` — loaded into every chat conversation

Agents are invoked by selecting them from the agent picker or by mentioning `@agent-name` in chat.

</details>

<details>
<summary><strong>🟠 GitHub Copilot CLI</strong> — Click to expand</summary>

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

You should see all 65 agents and 19 skills.

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
<summary><strong>🔵 Claude Code (CLI)</strong> — Click to expand</summary>

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

This installs 65 agents to `~/.claude/agents/` and sets up three enforcement hooks.

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
<summary><strong>🟢 Gemini CLI</strong> — Click to expand</summary>

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

Gemini discovers skills from the extension directory structure. You should have 82 skills available:
- 63 agent skills (one per agent)
- 19 knowledge skills (matching the Copilot skill set)

### Step 4: Your First Audit

```
Use the accessibility-lead skill to review this component for accessibility
```

### How Gemini Skills Differ from Agents

Gemini doesn't have a native "agent" concept like Copilot or Claude Code. Instead, each agent is represented as a **skill** — a YAML-frontmatter markdown file that Gemini loads as reference knowledge. The LLM uses the skill's instructions to behave like the specialist agent.

</details>

<details>
<summary><strong>🟡 Codex CLI</strong> — Click to expand</summary>

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
<summary><strong>🔴 Claude Desktop (MCP Extension)</strong> — Click to expand</summary>

### Step 1: Prerequisites

- Claude Desktop app installed (latest version)
- A Claude subscription (Pro plan or higher)

### Step 2: Install the MCP Server

The MCP server provides 20 scanning tools that Claude Desktop can call. Configure it in your Claude Desktop settings:

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

Once connected, Claude Desktop can use these tools:

| Tool | What It Does |
|------|-------------|
| `check_contrast` | Calculate WCAG contrast ratios between hex colors |
| `get_accessibility_guidelines` | Get WCAG guidelines for a component type |
| `check_heading_structure` | Analyze HTML heading hierarchy |
| `check_link_text` | Find ambiguous link text |
| `check_form_labels` | Validate form label associations |
| `scan_office_document` | Scan .docx/.xlsx/.pptx for accessibility |
| `scan_pdf_document` | Scan PDFs for PDF/UA conformance |
| `extract_document_metadata` | Get document properties |
| `batch_scan_documents` | Scan multiple documents at once |
| `fix_document_metadata` | Generate scripts to fix document metadata |
| `fix_document_headings` | Analyze heading structure in .docx files |
| `check_audit_cache` | Check for changed files since last scan |
| `update_audit_cache` | Save scan results for incremental scanning |
| `run_axe_scan` | Run axe-core against a live URL |
| `run_playwright_a11y_tree` | Inspect accessibility tree via Playwright |
| `run_playwright_keyboard_scan` | Test keyboard navigation |
| `run_playwright_contrast_scan` | Automated contrast scanning |
| `run_playwright_viewport_scan` | Test responsive/viewport accessibility |
| `run_verapdf_scan` | PDF/UA validation via veraPDF |
| `convert_pdf_form_to_html` | Convert PDF forms to accessible HTML |

### Step 4: Your First Audit

Ask Claude:

```
Check the contrast ratio between #333333 and #ffffff
```

```
Scan the file report.docx for accessibility issues
```

### Built-in Prompts

Select from the prompt menu in Claude Desktop:

- **Full Accessibility Audit** — Comprehensive WCAG review
- **ARIA Review** — Focused ARIA audit
- **Color Contrast Review** — Visual contrast checking

</details>

---

## The Agent Teams

The 65 agents are organized into 7 teams. Each team has a lead agent that coordinates the specialists. You usually talk to the lead and let it delegate to the right specialists.

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
| `web-accessibility-wizard` | Guided multi-phase web audit | Full site audits |
| `web-issue-fixer` | Applies fixes from audit reports | After running an audit |
| `web-csv-reporter` | Exports audit findings to CSV | Reporting and tracking |
| `cross-page-analyzer` | Cross-page pattern detection | Multi-page audits |

**Typical workflow:**

```
You: @accessibility-lead review the login page
Lead: I'll coordinate a review. Delegating to specialists...
  → aria-specialist: checks ARIA on the form
  → keyboard-navigator: checks tab order
  → forms-specialist: checks labels and validation
  → contrast-master: checks color contrast
Lead: Here's the consolidated report with 7 findings...
```

### Document Accessibility Team

**Lead: `document-accessibility-wizard`**

This team audits Office documents (Word, Excel, PowerPoint) and PDFs for accessibility.

| Agent | What It Does | When to Use It |
|-------|-------------|----------------|
| `document-accessibility-wizard` | Guided document audit with scoring | Any document audit |
| `word-accessibility` | Microsoft Word (.docx) accessibility | Word documents |
| `excel-accessibility` | Microsoft Excel (.xlsx) accessibility | Spreadsheets |
| `powerpoint-accessibility` | Microsoft PowerPoint (.pptx) | Presentations |
| `pdf-accessibility` | PDF/UA conformance checking | PDF files |
| `epub-accessibility` | ePub accessibility | eBooks |
| `pdf-remediator` | Programmatic PDF fixes | After PDF audit |
| `document-inventory` | File discovery and delta detection | Finding documents to audit |
| `cross-document-analyzer` | Cross-document patterns and scoring | Multi-document audits |
| `document-csv-reporter` | Export findings to CSV | Reporting |
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
| `markdown-a11y-assistant` | Orchestrates markdown audits | Any .md file audit |
| `markdown-scanner` | Per-file scanning across 9 domains | Individual file scanning |
| `markdown-fixer` | Applies approved fixes | After scanning |
| `markdown-csv-reporter` | Export findings to CSV | Reporting |

### GitHub Workflow Team

**Lead: `github-hub` (guided) / `nexus` (auto-routing)**

This team manages GitHub operations — issues, PRs, CI, releases, analytics.

| Agent | What It Does | When to Use It |
|-------|-------------|----------------|
| `github-hub` | Guided GitHub menu (presents options) | When you want to choose |
| `nexus` | Auto-routing orchestrator (infers intent) | When you want it to just do it |
| `daily-briefing` | Morning overview of issues, PRs, CI | Start of your day |
| `pr-review` | Code review with accessibility focus | Pull request reviews |
| `issue-tracker` | Issue triage and priority scoring | Managing issues |
| `analytics` | Repository health metrics | Tracking progress |
| `repo-admin` | Branch protection, collaborators | Repository settings |
| `repo-manager` | Repository configuration | Repo-level operations |
| `team-manager` | Organization team membership | Managing team members |
| `contributions-hub` | Contributor tracking | Community management |
| `insiders-a11y-tracker` | VS Code Insiders accessibility tracking | VS Code monitoring |
| `template-builder` | Issue/PR template creation | Creating templates |
| `scanner-bridge` | GitHub Accessibility Scanner CI data | CI integration |
| `lighthouse-bridge` | Lighthouse CI accessibility data | Performance + a11y |

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

Covers touch targets, `accessibilityLabel`/`accessibilityRole`/`accessibilityState`, platform-specific screen reader testing (VoiceOver, TalkBack), and WCAG 2.2 mobile success criteria.

### Design System Team

**Specialist: `design-system-auditor`**

| Agent | What It Does | When to Use It |
|-------|-------------|----------------|
| `design-system-auditor` | Token contrast, focus rings, spacing | Design system work |

Validates color token pairs, focus ring tokens, spacing tokens, and motion tokens for Tailwind, MUI, Chakra, and shadcn/ui. Use this before tokens propagate to UI components.

### Additional Specialist Agents

These agents don't belong to a specific team but provide specialized knowledge:

| Agent | What It Does | When to Use It |
|-------|-------------|----------------|
| `testing-coach` | Screen reader testing, keyboard testing guidance | Learning to test |
| `wcag-guide` | WCAG 2.2 criteria explanations | Understanding WCAG |
| `ci-accessibility` | CI/CD accessibility pipeline setup | Setting up CI |
| `screen-reader-lab` | Interactive screen reader simulation | Education, debugging |
| `wcag3-preview` | WCAG 3.0 Working Draft preview | Future planning |
| `wcag-aaa` | AAA-level conformance checking | Going beyond AA |
| `i18n-accessibility` | Internationalization + RTL accessibility | Multilingual apps |

---

## Every Agent Explained

This section provides a brief description of all 65 agents, organized alphabetically. Use it as a quick-reference when you need to find the right agent.

<details>
<summary><strong>A–C (14 agents)</strong> — Click to expand</summary>

| # | Agent | Purpose |
|---|-------|---------|
| 1 | `a11y-tool-builder` | Helps you build your own accessibility scanning tools — rule engines, document parsers, report generators, CLI/GUI scanner architecture |
| 2 | `accessibility-lead` | The main coordinator. Delegates to web specialists, runs final review, produces consolidated reports |
| 3 | `alt-text-headings` | Reviews images for appropriate alt text, checks SVG accessibility, validates heading hierarchy (H1→H2→H3), verifies landmark regions |
| 4 | `analytics` | Repository health metrics, issue velocity, PR merge rates, contributor stats, bottleneck detection |
| 5 | `aria-specialist` | Deep knowledge of WAI-ARIA 1.2 (and 1.3 draft). Reviews roles, states, properties. Catches ARIA misuse like `role="button"` on a `<div>` |
| 6 | `ci-accessibility` | Sets up CI/CD accessibility pipelines. 5 phases: detection, configuration, baseline management, PR annotation, monitoring. Supports GitHub Actions, Azure DevOps, GitLab CI, CircleCI, Jenkins |
| 7 | `cognitive-accessibility` | WCAG 2.2 cognitive success criteria (3.3.7, 3.3.8, 3.3.9), COGA guidance, plain language analysis, authentication UX patterns, reading level assessment |
| 8 | `contrast-master` | Calculates WCAG contrast ratios. Text: 4.5:1 (normal) / 3:1 (large). UI components: 3:1. Checks themes, dark mode, CSS custom properties |
| 9 | `contributions-hub` | Tracks contributors, contribution patterns, recognition. Useful for community management |
| 10 | `cross-document-analyzer` | Finds patterns across multiple documents — common template issues, severity scoring, template analysis |
| 11 | `cross-page-analyzer` | Finds patterns across multiple web pages — repeated navigation issues, global ARIA problems, site-wide heading structure |
| 12 | `daily-briefing` | Morning overview: open issues, pending PRs, CI status, recent activity. Start your day here |

</details>

<details>
<summary><strong>D–I (16 agents)</strong> — Click to expand</summary>

| # | Agent | Purpose |
|---|-------|---------|
| 13 | `design-system-auditor` | Validates design tokens for accessibility — color token contrast pairs, focus ring visibility, spacing tokens, motion preferences for Tailwind/MUI/Chakra/shadcn |
| 14 | `desktop-a11y-specialist` | Desktop app accessibility via platform APIs — UI Automation (Windows), MSAA/IAccessible2, ATK/AT-SPI (Linux), NSAccessibility (macOS). Screen reader Name/Role/Value/State |
| 15 | `desktop-a11y-testing-coach` | Teaches desktop accessibility testing — NVDA, JAWS, Narrator, VoiceOver, Orca. Accessibility Insights for Windows, automated UIA testing, keyboard-only testing flows |
| 16 | `developer-hub` | Routes you to the right developer tools specialist — Python, wxPython, NVDA addons, desktop a11y, tool building |
| 17 | `document-accessibility-wizard` | Runs guided document audits with severity scoring, delta detection, VPAT/ACR export, CSV export. Supports .docx, .xlsx, .pptx, .pdf |
| 18 | `document-csv-reporter` | Exports document audit findings to CSV with Microsoft Office and Adobe PDF help links |
| 19 | `document-inventory` | Discovers documents for auditing — recursive file search, delta detection (changed since last commit), inventory building |
| 20 | `epub-accessibility` | ePub/eBook accessibility auditing |
| 21 | `epub-scan-config` | ePub scan configuration management |
| 22 | `excel-accessibility` | Microsoft Excel accessibility — sheet names, table headers, cell descriptions, chart alt text, named ranges |
| 23 | `forms-specialist` | Form accessibility — every input needs a label, error messages need `aria-describedby`, required fields need `aria-required`, fieldsets for groups |
| 24 | `github-hub` | Guided GitHub menu — presents options and lets you choose. Use `nexus` if you want auto-routing instead |
| 25 | `i18n-accessibility` | Internationalization accessibility — `lang` attributes, `dir="rtl"`, bidirectional text, BCP 47 tags, WCAG 3.1.1/3.1.2 |
| 26 | `insiders-a11y-tracker` | Tracks accessibility changes in VS Code Insiders builds |
| 27 | `issue-tracker` | Issue triage, priority scoring, label management, duplicate detection |

</details>

<details>
<summary><strong>K–N (8 agents)</strong> — Click to expand</summary>

| # | Agent | Purpose |
|---|-------|---------|
| 28 | `keyboard-navigator` | Tab order, focus management, keyboard traps, skip links, focus indicators, `tabindex` usage. Every interactive element must be keyboard-operable |
| 29 | `lighthouse-bridge` | Bridges Lighthouse CI accessibility audit data — score interpretation, weight-to-severity mapping, regression tracking |
| 30 | `link-checker` | Detects ambiguous link text — "click here", "read more", "learn more". Links must describe their destination |
| 31 | `live-region-controller` | Dynamic content announcements — `aria-live`, `role="alert"`, `role="status"`. For toasts, loading states, real-time updates |
| 32 | `markdown-a11y-assistant` | Orchestrates markdown audits across 9 domains — links, alt text, headings, tables, emoji, Mermaid diagrams, anchors, em-dashes |
| 33 | `markdown-csv-reporter` | Exports markdown audit findings to CSV with WCAG help links and markdownlint rule references |
| 34 | `markdown-fixer` | Applies approved markdown fixes and presents human-judgment items |
| 35 | `markdown-scanner` | Per-file markdown scanning across all 9 accessibility domains |
| 36 | `mobile-accessibility` | React Native props (`accessibilityLabel`, `accessibilityRole`, `accessibilityState`), iOS (VoiceOver), Android (TalkBack), touch targets (44×44pt minimum) |
| 37 | `modal-specialist` | Focus trapping, escape-to-close, focus return to trigger element, `role="dialog"`, `aria-modal="true"` |
| 38 | `nexus` | Auto-routing orchestrator — infers your intent and routes to the right agent silently. Use `github-hub` if you want to see options instead |
| 39 | `nvda-addon-specialist` | NVDA screen reader addon development — addon structure, manifest, API usage, event handling, braille support |

</details>

<details>
<summary><strong>O–S (10 agents)</strong> — Click to expand</summary>

| # | Agent | Purpose |
|---|-------|---------|
| 40 | `office-scan-config` | Manages Office document scan configuration — rule enable/disable, severity filters |
| 41 | `pdf-accessibility` | PDF/UA conformance — tagged PDF structure, reading order, alt text, form fields, language |
| 42 | `pdf-remediator` | Programmatic PDF fixes — 8 auto-fixable issues via pdf-lib/qpdf/ghostscript, 6 manual-fix issues requiring Acrobat Pro. Generates batch scripts |
| 43 | `pdf-scan-config` | PDF scan configuration management |
| 44 | `playwright-scanner` | Behavioral accessibility scanning via Playwright — keyboard traversal, dynamic state, viewport, contrast, a11y tree |
| 45 | `playwright-verifier` | Post-fix verification — re-runs targeted Playwright scans to confirm fixes work at runtime |
| 46 | `powerpoint-accessibility` | Microsoft PowerPoint accessibility — slide titles, reading order, alt text, slide masters, notes |
| 47 | `pr-review` | Pull request code review with accessibility focus — catches regressions before merge |
| 48 | `python-specialist` | Python debugging, packaging (PyInstaller/Nuitka/cx_Freeze), testing, type checking, async, optimization |
| 49 | `repo-admin` | Repository administration — branch protection rules, collaborator management |
| 50 | `repo-manager` | Repository-level configuration and management |
| 51 | `scanner-bridge` | Bridges GitHub Accessibility Scanner CI data into the agent ecosystem |
| 52 | `screen-reader-lab` | Interactive screen reader simulation — reading order traversal, tab/focus navigation, heading nav, form nav. Accessible name computation walkthrough |

</details>

<details>
<summary><strong>T–Z (13 agents)</strong> — Click to expand</summary>

| # | Agent | Purpose |
|---|-------|---------|
| 53 | `tables-data-specialist` | Data table accessibility — `<th>` with `scope`, `<caption>`, sortable tables, comparison tables, pricing tables, grid patterns |
| 54 | `team-manager` | Organization team membership management |
| 55 | `template-builder` | Issue and PR template creation with accessibility checklists |
| 56 | `testing-coach` | Teaches accessibility testing — screen reader testing (NVDA, JAWS, VoiceOver), keyboard testing flows, axe-core setup, Playwright a11y testing |
| 57 | `text-quality-reviewer` | Scans for broken alt text, template variables in ARIA labels, placeholder labels, duplicate accessible names |
| 58 | `wcag-aaa` | AAA-level conformance — 28 additional criteria beyond AA. Organized by WCAG principle (Perceivable: 8, Operable: 12, Understandable: 8) |
| 59 | `wcag-guide` | WCAG 2.2 explanations — what each criterion means, how to test it, common failures, examples |
| 60 | `wcag3-preview` | WCAG 3.0 Working Draft — APCA contrast, Bronze/Silver/Gold conformance levels, outcome-based testing. ⚠️ Draft, not final |
| 61 | `web-accessibility-wizard` | Full guided web accessibility audit — multi-phase workflow with scoring, cross-page analysis, remediation tracking |
| 62 | `web-csv-reporter` | Exports web audit findings to CSV with Deque University help links |
| 63 | `web-issue-fixer` | Applies fixes from web audit reports — auto-fixable and human-judgment items |
| 64 | `word-accessibility` | Microsoft Word accessibility — styles, headings, lists, tables, alt text, reading order, language |
| 65 | `wxpython-specialist` | wxPython GUI development — sizer layouts, event handling, AUI, custom controls, threading, desktop accessibility |

</details>

---

## Skills (Knowledge Libraries)

Skills are **reference knowledge modules** that agents draw from automatically when they need domain-specific information. You don't invoke skills directly — agents load them as needed.

<details>
<summary><strong>All 19 Skills</strong> — Click to expand</summary>

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

</details>

### Where Skills Live Per Platform

<details>
<summary><strong>Platform-specific skill locations</strong> — Click to expand</summary>

| Platform | Location | Format |
|----------|----------|--------|
| **GitHub Copilot** | `.github/skills/skill-name/SKILL.md` | YAML frontmatter + markdown |
| **Gemini CLI** | `.gemini/extensions/a11y-agents/skills/skill-name/SKILL.md` | YAML frontmatter + markdown |
| **Claude Code** | Knowledge is inlined into agent instructions | Part of agent files |
| **Codex** | Not applicable | Knowledge in role files |

</details>

---

## Prompts (One-Click Workflows)

Prompts are **pre-built workflows** that you can launch with a single click or command. They combine multiple agents and tools into a structured flow. There are **111 prompt files** organized by category.

### Web Accessibility Prompts

<details>
<summary><strong>Web audit and fix prompts</strong> — Click to expand</summary>

| Prompt | What It Does | Agents Involved |
|--------|-------------|-----------------|
| `audit-web-page` | Full single-page audit with axe-core scan and code review | accessibility-lead, all web specialists |
| `quick-web-check` | Fast axe-core triage — runtime scan only, pass/fail | axe-core tool |
| `audit-web-multi-page` | Multi-page comparison audit with cross-page pattern detection | web-accessibility-wizard, cross-page-analyzer |
| `compare-web-audits` | Compare two audit reports to track remediation progress | Severity scoring |
| `fix-web-issues` | Interactive fix mode — auto-fixable and human-judgment items | web-issue-fixer |
| `export-web-csv` | Export web audit findings to CSV with Deque University help links | web-csv-reporter |
| `setup-web-cicd` | Configure CI/CD accessibility scanning pipeline | ci-accessibility |
| `setup-github-scanner` | Set up GitHub Accessibility Scanner | scanner-bridge |
| `setup-lighthouse-scanner` | Set up Lighthouse CI accessibility scanning | lighthouse-bridge |
| `a11y-pr-check` | Analyze PR diffs for accessibility regressions | pr-review |

</details>

### Document Accessibility Prompts

<details>
<summary><strong>Document audit and fix prompts</strong> — Click to expand</summary>

| Prompt | What It Does |
|--------|-------------|
| `audit-single-document` | Scan a single .docx/.xlsx/.pptx/.pdf with severity scoring |
| `audit-document-folder` | Recursively scan an entire folder of documents |
| `audit-changed-documents` | Delta scan — only audit documents changed since last commit |
| `quick-document-check` | Fast triage — errors only, pass/fail verdict |
| `compare-audits` | Compare two audit reports to track remediation progress |
| `generate-vpat` | Generate a VPAT 2.5 / ACR compliance report |
| `generate-remediation-scripts` | Create PowerShell/Bash scripts to batch-fix common issues |
| `create-accessible-template` | Guidance for creating accessible document templates |
| `setup-document-cicd` | Set up CI/CD pipelines for automated document scanning |
| `export-document-csv` | Export findings to CSV with help links |

</details>

### Markdown Accessibility Prompts

<details>
<summary><strong>Markdown audit and fix prompts</strong> — Click to expand</summary>

| Prompt | What It Does |
|--------|-------------|
| `markdown-a11y-assistant` | Full markdown audit with scoring |
| `quick-markdown-check` | Fast triage — errors only, inline pass/fail |
| `fix-markdown-issues` | Interactive fix mode from saved report |
| `compare-markdown-audits` | Track remediation progress between audits |
| `export-markdown-csv` | Export findings to CSV |

</details>

### GitHub Workflow Prompts

<details>
<summary><strong>GitHub operations prompts</strong> — Click to expand</summary>

| Prompt | What It Does |
|--------|-------------|
| `daily-briefing` | Morning overview of issues, PRs, CI |
| `review-pr` | Review a pull request |
| `pr-report` | PR summary report |
| `pr-comment` | Comment on a PR |
| `pr-author-checklist` | PR author self-check |
| `merge-pr` | Merge a pull request |
| `create-issue` | Create a new issue |
| `manage-issue` | Update issue labels/assignees |
| `issue-reply` | Reply to an issue |
| `triage` | Issue triage workflow |
| `my-issues` | List your assigned issues |
| `my-prs` | List your open PRs |
| `my-stats` | Your contribution statistics |
| `ci-status` | CI/CD pipeline status |
| `project-status` | Overall project health |
| `sprint-review` | Sprint review summary |
| `team-dashboard` | Team activity dashboard |
| `security-dashboard` | Security overview |
| `notifications` | GitHub notifications |
| `draft-release` | Draft release notes |
| `release-prep` | Release preparation |
| `add-collaborator` | Add a collaborator |
| `manage-branches` | Branch management |
| `onboard-repo` | Repository onboarding |
| `build-template` | Build issue/PR templates |
| `build-a11y-template` | Build accessibility-focused templates |
| `explain-code` | Explain code |
| `address-comments` | Address PR review comments |
| `react` | Add reactions |
| `refine-issue` | Refine issue description |
| `a11y-update` | Accessibility update |

</details>

### Developer Tools Prompts

<details>
<summary><strong>Desktop development and tool-building prompts</strong> — Click to expand</summary>

| Prompt | What It Does |
|--------|-------------|
| `scaffold-wxpython-app` | Scaffold an accessible wxPython desktop app |
| `scaffold-nvda-addon` | Scaffold an NVDA screen reader addon |
| `package-python-app` | Package Python app with PyInstaller/Nuitka/cx_Freeze |
| `audit-desktop-a11y` | Desktop app accessibility audit |
| `test-desktop-a11y` | Desktop accessibility test plan |
| `review-text-quality` | Scan for broken alt text, placeholder labels |
| `component-library-audit` | Per-component accessibility scorecard |
| `training-scenario` | Interactive accessibility training |
| `audit-native-app` | React Native / mobile app audit |
| `generate-a11y-tests` | Generate accessibility test cases |

</details>

### Agent-Specific Prompts

<details>
<summary><strong>Direct agent invocation prompts (one per agent)</strong> — Click to expand</summary>

Every user-facing agent has a matching prompt file that invokes it directly. For example:

- `accessibility-lead.prompt.md` → Invokes `accessibility-lead`
- `aria-specialist.prompt.md` → Invokes `aria-specialist`
- `contrast-master.prompt.md` → Invokes `contrast-master`

These are useful when you know exactly which agent you want and want to skip the orchestrator.

</details>

---

## Always-On Instructions

Instructions are **rules that fire automatically on every code completion** for matching files. You don't invoke them — they work silently in the background. There are 6 instruction files.

| Instruction | Applies To | What It Enforces |
|-------------|-----------|------------------|
| `web-accessibility-baseline` | `*.html, *.jsx, *.tsx, *.vue, *.svelte, *.astro` | Interactive elements, images, forms, headings, color/contrast, live regions, ARIA rules, motion |
| `semantic-html` | `*.html, *.jsx, *.tsx, *.vue, *.svelte, *.astro` | Landmark structure, buttons vs links, lists, tables, forms, disclosure widgets, heading hierarchy |
| `aria-patterns` | `*.html, *.jsx, *.tsx, *.vue, *.svelte, *.astro` | Correct ARIA role/state/property usage, common widget patterns |
| `markdown-accessibility` | `*.md` | Ambiguous links, alt text, heading hierarchy, tables, emoji, Mermaid diagrams, em-dashes, anchors |
| `multi-agent-reliability` | `**` | Agent delegation reliability, error handling, graceful fallbacks |
| `powershell-terminal-ops` | `**` | PowerShell-specific terminal operation best practices |

These instructions are the **highest-leverage accessibility enforcement** — they provide correction guidance at the point of code generation without requiring any agent to be invoked.

---

## MCP Server (20 Tools)

The MCP (Model Context Protocol) server provides **20 scanning tools** that agents and Claude Desktop can call for automated accessibility analysis.

### Installation

```bash
cd accessibility-agents/mcp-server
npm install
```

### Running

<details>
<summary><strong>stdio mode (for Claude Desktop)</strong> — Click to expand</summary>

Add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "a11y-agents": {
      "command": "node",
      "args": ["/path/to/mcp-server/stdio.js"]
    }
  }
}
```

</details>

<details>
<summary><strong>HTTP mode (for remote/shared use)</strong> — Click to expand</summary>

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

</details>

### Tool Reference

<details>
<summary><strong>All 20 tools with descriptions</strong> — Click to expand</summary>

#### Core Scanning Tools (13)

| Tool | Input | What It Does |
|------|-------|-------------|
| `check_contrast` | Two hex colors | Returns contrast ratio, WCAG AA/AAA pass/fail for text and UI |
| `get_accessibility_guidelines` | Component type | Returns detailed WCAG guidelines for buttons, forms, modals, tables, etc. (9 components) |
| `check_heading_structure` | HTML string | Finds heading hierarchy issues — skipped levels, multiple H1s, empty headings |
| `check_link_text` | HTML string | Detects ambiguous link text — "click here", "read more", etc. |
| `check_form_labels` | HTML string | Validates every input has an associated label |
| `scan_office_document` | File path | Scans .docx/.xlsx/.pptx for accessibility issues |
| `scan_pdf_document` | File path | Scans PDF for PDF/UA conformance |
| `extract_document_metadata` | File path | Extracts title, author, language, and other properties |
| `batch_scan_documents` | Directory path | Scans all documents in a directory |
| `fix_document_metadata` | File path + fixes | Generates scripts to fix document metadata |
| `fix_document_headings` | File path | Parses .docx heading structure from OOXML |
| `check_audit_cache` | File paths | Checks which files changed since last scan |
| `update_audit_cache` | Scan results | Saves scan results for incremental scanning |

#### Playwright Tools (5)

| Tool | Input | What It Does |
|------|-------|-------------|
| `run_axe_scan` | URL | Runs axe-core against a live URL |
| `run_playwright_a11y_tree` | URL | Inspects the full accessibility tree |
| `run_playwright_keyboard_scan` | URL | Tests keyboard navigation flow |
| `run_playwright_contrast_scan` | URL | Automated visual contrast scanning |
| `run_playwright_viewport_scan` | URL + viewport | Tests reflow at different screen sizes |

#### PDF Tools (2)

| Tool | Input | What It Does |
|------|-------|-------------|
| `run_verapdf_scan` | File path | PDF/UA validation via veraPDF engine |
| `convert_pdf_form_to_html` | File path | Converts PDF forms to accessible HTML |

</details>

### Built-in MCP Prompts

| Prompt | What It Does |
|--------|-------------|
| `audit-page` | Structured WCAG audit instruction with tool sequence and scoring |
| `check-component` | Component-specific review using built-in guidelines |
| `explain-wcag` | WCAG criterion explanation with examples and testing guidance |

### MCP Resources

| URI | What It Returns |
|-----|----------------|
| `a11y://guidelines/{component}` | Accessibility guidelines (9 component types) |
| `a11y://tools` | List of all registered tools |
| `a11y://config/{profile}` | Scan configuration template (strict/moderate/minimal) |

---

## Common Workflows & Recipes

### Recipe 1: Audit a Web Page

<details>
<summary><strong>Step-by-step guided audit</strong> — Click to expand</summary>

**What you'll learn:** How to run a comprehensive accessibility audit on a web page.

**Step 1:** Open your project in your code editor.

**Step 2:** Start a conversation with the accessibility lead:

<details>
<summary>GitHub Copilot</summary>

Select `accessibility-lead` from the agent picker, then type:
```
Run a full accessibility audit of the login page at src/pages/Login.tsx
```

</details>

<details>
<summary>Claude Code</summary>

```
/accessibility-lead Run a full accessibility audit of the login page
```

</details>

<details>
<summary>Gemini CLI</summary>

```
Use the accessibility-lead skill to audit src/pages/Login.tsx
```

</details>

**Step 3:** The lead will coordinate specialists and produce a report with:
- Overall score (0-100, A-F grade)
- Findings organized by severity (Critical → Minor)
- Specific remediation guidance for each issue
- WCAG success criteria references

**Step 4:** To fix issues automatically:

```
@web-issue-fixer apply fixes from the audit report
```

**Step 5:** Re-run the audit to confirm fixes:

```
@accessibility-lead re-audit the login page and compare with the previous report
```

</details>

### Recipe 2: Audit Office Documents

<details>
<summary><strong>Step-by-step document audit</strong> — Click to expand</summary>

**What you'll learn:** How to scan Word, Excel, and PowerPoint files for accessibility issues.

**Step 1:** Start the document accessibility wizard:

```
@document-accessibility-wizard audit all files in the docs/ folder
```

**Step 2:** The wizard runs a 3-phase workflow:
1. **Discovery** — Finds all .docx, .xlsx, .pptx, .pdf files
2. **Scanning** — Checks each file for issues (headings, alt text, tables, reading order, etc.)
3. **Reporting** — Produces a scored report with severity breakdown

**Step 3:** Review findings. Common issues:
- Missing document title
- No heading structure (everything is body text)
- Images without alt text
- Tables without header rows
- Missing document language

**Step 4:** Generate remediation scripts:

```
@document-accessibility-wizard generate PowerShell scripts to batch-fix metadata issues
```

**Step 5:** For delta scanning (only changed files):

```
@document-accessibility-wizard audit only files changed since the last commit
```

</details>

### Recipe 3: Review a Pull Request

<details>
<summary><strong>Accessibility-focused PR review</strong> — Click to expand</summary>

**What you'll learn:** How to catch accessibility regressions before they merge.

**Step 1:** Open the PR in your editor.

**Step 2:** Ask for a review:

```
@pr-review review this PR for accessibility regressions
```

**Step 3:** The review checks:
- New UI components have proper ARIA
- Tab order isn't broken
- Images have alt text
- Forms have labels
- Color contrast meets requirements
- Focus management on new features

**Step 4:** Use the PR accessibility checklist prompt:

```
@pr-author-checklist
```

This generates a checklist for the PR author to verify before requesting review.

</details>

### Recipe 4: Set Up CI/CD Accessibility Checks

<details>
<summary><strong>Automate accessibility in your pipeline</strong> — Click to expand</summary>

**What you'll learn:** How to block PRs that introduce accessibility violations.

**Step 1:** Use the CI accessibility agent:

```
@ci-accessibility set up accessibility scanning for our GitHub Actions pipeline
```

**Step 2:** The agent will:
1. Detect your CI platform
2. Generate a workflow file with axe-core scanning
3. Configure baseline management (so existing issues don't block PRs)
4. Set up SARIF output for GitHub Security tab
5. Add PR annotations for new violations

**Step 3:** Alternatively, use the one-click prompt:

```
@setup-web-cicd
```

</details>

### Recipe 5: Learn Accessibility with the Screen Reader Lab

<details>
<summary><strong>Interactive accessibility education</strong> — Click to expand</summary>

**What you'll learn:** How screen readers perceive your web page.

**Step 1:** Start the screen reader lab:

```
@screen-reader-lab simulate reading order for src/components/Nav.tsx
```

**Step 2:** Choose a simulation mode:
1. **Reading order traversal** — How a screen reader reads the page top-to-bottom
2. **Tab/focus navigation** — What a keyboard user experiences
3. **Heading navigation** — How users jump between sections
4. **Form navigation** — How form controls are announced

**Step 3:** The lab walks through each element, showing:
- What the screen reader announces
- The accessible name computation (how the name was calculated)
- ARIA roles and states
- Focus order

This is invaluable for understanding *why* certain patterns matter.

</details>

### Recipe 6: Check Markdown Documentation

<details>
<summary><strong>Audit your .md files</strong> — Click to expand</summary>

**What you'll learn:** How to make your documentation accessible.

**Step 1:** Run the markdown assistant:

```
@markdown-a11y-assistant audit README.md
```

**Step 2:** The assistant checks 9 domains:
1. **Links** — Ambiguous text ("click here"), broken anchors
2. **Alt text** — Images without descriptions
3. **Headings** — Skipped levels, multiple H1s
4. **Tables** — Missing descriptions
5. **Emoji** — Emoji in headings (screen readers announce the full name)
6. **Mermaid diagrams** — No text alternative
7. **Anchors** — Broken internal links
8. **Em-dashes** — Inconsistent dash usage
9. **Language** — Unclear or overly complex text

**Step 3:** Fix issues:

```
@markdown-fixer apply fixes from the audit report
```

</details>

---

## Platform Comparison

| Feature | Copilot (VS Code) | Copilot CLI | Claude Code | Gemini CLI | Codex CLI | Claude Desktop |
|---------|-------------------|-------------|-------------|------------|-----------|----------------|
| **Agents** | 65 | 65 | 65 | 82 skills | 11 roles | — |
| **Skills** | 19 | 19 | Inlined | 19 | — | — |
| **Prompts** | 111 | 111 | — | — | — | 6 MCP prompts |
| **Instructions** | 6 | 6 | — | — | — | — |
| **MCP Tools** | Via config | — | — | — | — | 20 tools |
| **Auto-enforcement** | Instructions | Instructions | 3-hook gate | — | — | — |
| **Global install** | VS Code profile | `~/.copilot/` | `~/.claude/` | Per-project | Per-project | MCP config |
| **Invoke agents** | `@agent-name` | `/agent` | `/agent-name` | Prompt | `--role=` | Ask Claude |

### Which Platform Should I Use?

- **I use VS Code:** GitHub Copilot is the most feature-complete experience — 65 agents, 19 skills, 111 prompts, 6 always-on instructions, and VS Code tasks.
- **I use the terminal:** Claude Code or Copilot CLI, depending on your subscription. Claude Code has the unique 3-hook enforcement system.
- **I want automated enforcement:** Claude Code's hook system is the only one that *blocks* non-accessible code.
- **I use Gemini:** All 82 skills (63 agent + 19 knowledge) are available.
- **I just want document/PDF scanning:** Claude Desktop with MCP server — 20 tools for document and web scanning.

---

## Troubleshooting

<details>
<summary><strong>Agents not appearing</strong> — Click to expand</summary>

**GitHub Copilot (VS Code):**
1. Verify files exist in `.github/agents/*.agent.md`
2. Reload VS Code (Ctrl/Cmd+Shift+P → "Developer: Reload Window")
3. Check the agent picker dropdown — custom agents appear there first, not in `@` autocomplete
4. Ensure workspace trust is enabled

**Copilot CLI:**
1. Check files are in `.github/agents/` (project) or `~/.copilot/agents/` (global)
2. Run `/agent` to list agents
3. Try `/skills reload` to refresh

**Claude Code:**
1. Run `/agents` to list loaded agents
2. Check files are in `.claude/agents/` (project) or `~/.claude/agents/` (global)
3. Verify hooks are installed: check `~/.claude/settings.json`

</details>

<details>
<summary><strong>Hook enforcement not working (Claude Code)</strong> — Click to expand</summary>

1. Verify hooks are in `~/.claude/hooks/`:
   - `a11y-team-eval.sh`
   - `a11y-enforce-edit.sh`
   - `a11y-mark-reviewed.sh`
2. Check they are executable: `chmod +x ~/.claude/hooks/a11y-*.sh`
3. Verify `~/.claude/settings.json` has the hook registrations
4. Open a **web project** (with `package.json` containing React/Vue/etc.) — hooks only fire in web projects

</details>

<details>
<summary><strong>MCP server connection issues</strong> — Click to expand</summary>

1. Verify the server starts: `node mcp-server/stdio.js` (should wait for input)
2. Check `claude_desktop_config.json` has the correct path
3. For HTTP mode, verify the health endpoint: `curl http://127.0.0.1:3456/health`
4. Check the console for error messages

</details>

<details>
<summary><strong>Skills not loading</strong> — Click to expand</summary>

1. Verify skill structure: `skill-name/SKILL.md` (not just `SKILL.md`)
2. Check SKILL.md has YAML frontmatter with `name` and `description`
3. In Copilot CLI: `/skills reload` then `/skills info`

</details>

---

## Glossary

<details>
<summary><strong>Key terms explained</strong> — Click to expand</summary>

| Term | Meaning |
|------|---------|
| **WCAG** | Web Content Accessibility Guidelines — the international standard for web accessibility. Current version: 2.2 |
| **WCAG AA** | The middle conformance level (A, AA, AAA). AA is the legal standard in most jurisdictions |
| **ARIA** | Accessible Rich Internet Applications — a set of HTML attributes that add accessibility information to custom widgets |
| **axe-core** | An open-source accessibility testing engine by Deque Systems. It scans HTML for WCAG violations |
| **MCP** | Model Context Protocol — a standard for AI tools to communicate with servers that provide capabilities |
| **PDF/UA** | PDF Universal Accessibility — the ISO standard for accessible PDFs |
| **VPAT** | Voluntary Product Accessibility Template — a document that describes how a product meets accessibility standards |
| **ACR** | Accessibility Conformance Report — the completed VPAT |
| **Contrast ratio** | The luminance difference between foreground and background colors. WCAG requires 4.5:1 for normal text, 3:1 for large text |
| **Focus management** | Controlling which element has keyboard focus, especially during dynamic content changes |
| **Screen reader** | Software that reads screen content aloud — NVDA, JAWS, VoiceOver, Narrator, TalkBack, Orca |
| **Accessible name** | The text that a screen reader announces for an element. Computed from labels, ARIA attributes, or content |
| **Landmark** | An ARIA role that marks a page region — `main`, `nav`, `banner`, `contentinfo`, `complementary`, `search` |
| **Live region** | An area of the page that dynamically updates and is announced by screen readers — `aria-live="polite"` or `aria-live="assertive"` |
| **SARIF** | Static Analysis Results Interchange Format — standard format for reporting code analysis results |
| **Delta scan** | Scanning only files that changed since the last audit, using cached hashes |
| **Hook** | A script that runs automatically at a specific point in the AI workflow (before/after prompts, before/after tool use) |

</details>

---

## What's Next?

- **New to accessibility?** Start with `@wcag-guide` to learn the fundamentals, then use `@screen-reader-lab` for hands-on experience.
- **Auditing a web app?** Start with `@accessibility-lead` or use the `audit-web-page` prompt.
- **Auditing documents?** Use `@document-accessibility-wizard` with the `audit-document-folder` prompt.
- **Setting up CI?** Use `@ci-accessibility` or the `setup-web-cicd` prompt.
- **Building tools?** Use `@a11y-tool-builder` for guidance on scanner architecture.

For installation, see the [Getting Started Guide](getting-started.md).
For advanced topics (monorepos, worktree isolation, background scanning), see [Advanced Scanning Patterns](advanced/advanced-scanning-patterns.md).
For cross-platform handoff, see [Cross-Platform Handoff](advanced/cross-platform-handoff.md).

---

*This guide covers Accessibility Agents v4.0. Last updated: 2025-07-14.*
