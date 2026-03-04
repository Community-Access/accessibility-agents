# Product Requirements Document: A11y Agent Team

**Version:** 2.5
**Author:** Community Access
**Last Updated:** 2026-03-04
**Status:** Active Development (main branch)

---

## Table of Contents

- [Executive Summary](#executive-summary)
- [Problem Statement](#problem-statement)
- [Product Vision](#product-vision)
- [Target Users](#target-users)
- [Platform Support](#platform-support)
- [System Architecture](#system-architecture)
  - [Agent Architecture](#agent-architecture)
  - [MCP Server Architecture](#mcp-server-architecture)
  - [CI/CD Architecture](#cicd-architecture)
- [Agent Specifications](#agent-specifications)
  - [Web Accessibility Agents (13)](#web-accessibility-agents-13)
  - [Document Accessibility Agents (7)](#document-accessibility-agents-7)
  - [Markdown Accessibility Agents (1)](#markdown-accessibility-agents-1)
  - [EPUB Accessibility Agents (2)](#epub-accessibility-agents-2)
  - [Specialized Domain Agents (5)](#specialized-domain-agents-5)
  - [AT and Development Specialists (5)](#at-and-development-specialists-5)
  - [GitHub Workflow Agents (11)](#github-workflow-agents-11)
  - [Hidden Helper Sub-Agents (11)](#hidden-helper-sub-agents-11)
  - [Infrastructure Agents (2)](#infrastructure-agents-2)
- [Prompts and Skills](#prompts-and-skills)
  - [Custom Prompts (54)](#custom-prompts-54)
  - [Reusable Skills (17)](#reusable-skills-17)
  - [Instruction Files (6)](#instruction-files-6)
  - [Agent Teams (AGENTS.md)](#agent-teams-agentsmd)
- [Source Citation Policy and Currency Automation](#source-citation-policy-and-currency-automation)
- [MCP Tool Specifications](#mcp-tool-specifications)
  - [Web Accessibility Tools (7)](#web-accessibility-tools-7)
  - [Document Accessibility Tools (4)](#document-accessibility-tools-4)
- [Rule Systems](#rule-systems)
  - [Office Document Rules](#office-document-rules)
  - [PDF Document Rules](#pdf-document-rules)
- [CI/CD Integration](#cicd-integration)
- [Configuration System](#configuration-system)
- [Output Formats](#output-formats)
- [Installation and Distribution](#installation-and-distribution)
- [Standards Compliance](#standards-compliance)
- [Non-Functional Requirements](#non-functional-requirements)
- [Dependencies](#dependencies)
- [File Inventory](#file-inventory)
- [Future Roadmap](#future-roadmap)
- [Risks and Mitigations](#risks-and-mitigations)

---

## Executive Summary

A11y Agent Team is an accessibility enforcement system for AI-powered coding and authoring tools. It deploys 57 specialized agents across five platforms - Claude Code (terminal), GitHub Copilot (VS Code), Gemini (Google AI Studio and IDX), Codex CLI (terminal), and Claude Desktop (app) - to ensure that web code, Office documents, PDF files, EPUB publications, and markdown documentation meet accessibility standards. The system intercepts the developer workflow at code-generation time, applying WCAG 2.2 AA standards for web content, format-specific rules for Office documents (DOCX/XLSX/PPTX), PDF/UA conformance with Matterhorn Protocol alignment for PDF files, cognitive accessibility guidelines, and assistive technology compatibility checks.

The project includes eleven MCP tools (zero external dependencies for document scanning), 60 custom prompts, 17 reusable skills, six workspace instruction files, agent team coordination (AGENTS.md), three CI scripts, a source citation policy with automated currency verification, automated installer/uninstaller scripts for all platforms, auto-update capability, an example project with 20+ intentional violations, and SARIF 2.1.0 output for GitHub Code Scanning integration.

Key capabilities added since v2.0:

- **Gemini platform support** - Full agent parity via `.gemini/extensions/a11y-agents/skills/` with 57 skill files
- **Codex CLI platform support** - Agent configuration via `.codex/AGENTS.md`
- **Source Citation Policy** - Mandatory 6-tier authority hierarchy with inline source citations, enforced via shared-instructions.md across all 57 agents
- **Automated Source Currency Checks** - Weekly GitHub Actions workflow that verifies authoritative sources haven't changed, with SHA-256 fingerprinting and auto-issue creation
- **EPUB accessibility agents** - epub-accessibility and epub-scan-config for digital publication accessibility
- **Markdown accessibility agents** - Full markdown audit pipeline (markdown-a11y-assistant, markdown-scanner, markdown-fixer, markdown-csv-reporter) with 9 audit domains
- **Cognitive accessibility agent** - WCAG 2.2 cognitive guidelines, clear language, consistent navigation
- **Design system auditor** - Component library accessibility patterns and design token analysis
- **Mobile accessibility agent** - iOS UIAccessibility and Android TalkBack patterns
- **Desktop accessibility agents** - Windows MSAA/UIA, macOS NSAccessibility, Linux ATK/AT-SPI patterns, plus dedicated desktop testing coach
- **AT and development specialists** - NVDA addon specialist, wxPython specialist, Python development specialist, accessibility tool builder, text quality reviewer
- **Infrastructure agents** - nexus (cross-agent knowledge hub) and developer-hub (contributor onboarding and ecosystem coordination)
- **CSV export reporters** - document-csv-reporter, web-csv-reporter, markdown-csv-reporter for structured finding exports
- **CI scanner bridges** - lighthouse-bridge and scanner-bridge for integrating external CI accessibility data
- **GitHub Workflow expansion** - 32 new workflow prompts for comprehensive repository management
- **Cross-cutting standards** - Shared instructions, multi-agent reliability standards, and citation policy applied uniformly across all agents

---

## Problem Statement

### Core Problem

AI coding tools (Claude Code, GitHub Copilot, Cursor, etc.) generate inaccessible code by default. They:

1. **Forget ARIA rules** - Misuse roles, states, and properties; violate the First Rule of ARIA
2. **Skip keyboard navigation** - Produce interactive elements unreachable by keyboard
3. **Ignore contrast ratios** - Use color combinations that fail WCAG AA thresholds
4. **Break focus management** - Modals without focus trapping, SPAs without focus restoration on route change
5. **Omit live regions** - Dynamic content changes invisible to screen readers
6. **Produce inaccessible documents** - Office files and PDFs without tagged structure, alt text, or proper metadata

### Why Existing Approaches Fail

The following table summarizes common accessibility enforcement approaches and why each falls short.

| Approach | Failure Mode |
|----------|-------------|
| **Skills / Instructions** | Auto-activation rate ~20%. Skills are deprioritized as context grows. Silently ignored. |
| **CLAUDE.md / System Prompts** | Single block of instructions. Accessibility competes with other concerns and gets dropped. |
| **MCP Tools** | Add external checks but don't change how the model reasons during code generation. |
| **Linters (eslint-plugin-jsx-a11y)** | Catch ~30% of issues. Only flag violations after code is written, not during generation. |
| **axe-core** | Tests rendered pages, not source code. Requires a running dev server. Runtime-only. |

### Solution Insight

Agents run in their own context window with a dedicated system prompt. The accessibility rules aren't suggestions - they are the agent's entire identity. An ARIA specialist cannot forget about ARIA. A contrast master cannot skip contrast checks. The rules are who they are.

---

## Product Vision

"Accessibility is how I work, not something I bolt on at the end."

A11y Agent Team makes accessibility enforcement automatic, comprehensive, and unavoidable in AI-assisted development workflows. It covers the full lifecycle - from code generation through document authoring to CI verification - across every major AI coding platform.

### Design Principles

1. **Zero tolerance for silent failures** - Accessibility issues are caught at generation time, not after deployment
2. **Single responsibility per agent** - Each agent owns one domain completely and cannot be distracted
3. **Native platform integration** - Works within each platform's architecture (agents for Claude Code, workspace instructions for Copilot, skills for Gemini, AGENTS.md for Codex CLI, MCP for Desktop)
4. **Zero external dependencies for core features** - Document scanning uses only Node.js built-ins
5. **Standards-first** - All rules trace back to specific WCAG criteria, PDF/UA checkpoints, or Matterhorn Protocol requirements
6. **Progressive enforcement** - Configurable rule sets with preset profiles (strict/moderate/minimal)
7. **Source authority** - Every agent claim must cite an authoritative source; no unsourced guidance

---

## Target Users

The following table describes the primary user types and how each uses the system.

| User Type | Primary Need | Primary Platform |
|-----------|-------------|-----------------|
| **Individual developers** | Ensure personal projects meet WCAG AA | Claude Code or Codex CLI (global install) |
| **Web development teams** | Enforce accessibility standards across the team | GitHub Copilot (project install) |
| **Content authors** | Validate Office documents and PDFs for accessibility | Claude Desktop or Copilot |
| **Accessibility specialists** | Audit existing projects, generate VPAT/ACR reports | All platforms |
| **QA engineers** | Integrate accessibility checks into CI pipelines | GitHub Actions CI scripts |
| **Procurement teams** | Verify vendor conformance documentation | Claude Desktop (VPAT generation) |
| **AT developers** | Build accessible NVDA addons and desktop applications | Claude Code (nvda-addon-specialist, wxpython-specialist) |
| **Documentation teams** | Ensure markdown and EPUB publications are accessible | Copilot or Gemini (markdown-a11y-assistant, epub-accessibility) |

---

## Platform Support

### Claude Code (Terminal)

- **Agent format:** Markdown files with YAML frontmatter (`tools`, `model`, `description`) in `.claude/agents/`
- **Activation mechanism:** Agents invoked directly via `/agent-name` or `@agent-name`
- **Install scope:** Project-level (`.claude/`) or global (`~/.claude/`)
- **Auto-updates:** LaunchAgent (macOS), cron (Linux), Task Scheduler (Windows) - daily at 9:00 AM
- **Agent count:** 57

### GitHub Copilot (VS Code)

- **Agent format:** Markdown files (no YAML frontmatter) in `.github/agents/`
- **Activation mechanism:** Workspace instructions (`.github/copilot-instructions.md`) loaded on every conversation
- **Additional files:** PR review instructions, commit message instructions, PR template, CI workflow, VS Code config, shared instructions, instruction files
- **Install scope:** Project-level only (per `.github/` convention)
- **Agent count:** 57

### Gemini (Google AI Studio / IDX)

- **Agent format:** SKILL.md files (no frontmatter) in `.gemini/extensions/a11y-agents/skills/{name}/SKILL.md`
- **Activation mechanism:** Extension manifest (`gemini-extension.json`) registers skills for auto-invocation
- **Configuration:** `GEMINI.md` root config with initialization instructions
- **Install scope:** Project-level (`.gemini/`)
- **Agent count:** 57 (as skills)

### Codex CLI (Terminal)

- **Agent format:** Single `AGENTS.md` configuration in `.codex/`
- **Activation mechanism:** Agent instructions loaded from `.codex/AGENTS.md` on session start
- **Install scope:** Project-level (`.codex/`)
- **Agent count:** All agents covered via unified AGENTS.md

### Claude Desktop (App)

- **Extension format:** `.mcpb` (MCP Bundle) - packaged Node.js server with manifest
- **Activation mechanism:** Tools auto-invoked by Claude; prompts available from prompt picker
- **Distribution:** GitHub Releases download; submitted to Anthropic Connectors Directory
- **MCP SDK:** `@modelcontextprotocol/sdk` ^1.20.0 with `zod` 3.25

---

## System Architecture

### Agent Architecture

The following diagram shows the agent activation flow, from user prompt through the orchestrator to specialist sub-agents and wizard components.

<details>
<summary>Agent architecture flowchart (text description follows)</summary>

The agent architecture is a hub-and-spoke model. A user prompt enters the Activation Layer, which routes to the appropriate entry point based on platform (direct invocation for Claude Code and Gemini, workspace instructions for Copilot, AGENTS.md for Codex CLI). The orchestrator agents (accessibility-lead, nexus, github-hub) evaluate the task and delegate to specialist agents.

Web accessibility flows through accessibility-lead to 13 web specialists: aria-specialist, modal-specialist, contrast-master, keyboard-navigator, live-region-controller, forms-specialist, alt-text-headings, tables-data-specialist, link-checker, testing-coach, wcag-guide, web-accessibility-wizard, and cognitive-accessibility. The web-accessibility-wizard delegates to hidden helpers: cross-page-analyzer, web-issue-fixer, web-csv-reporter.

Document accessibility flows through document-accessibility-wizard to 7 document specialists: word-accessibility, excel-accessibility, powerpoint-accessibility, pdf-accessibility, office-scan-config, pdf-scan-config, epub-accessibility, epub-scan-config. Hidden helpers include cross-document-analyzer, document-inventory, document-csv-reporter.

Markdown accessibility flows through markdown-a11y-assistant to hidden helpers: markdown-scanner, markdown-fixer, markdown-csv-reporter.

Specialized domains include: design-system-auditor, mobile-accessibility, desktop-a11y-specialist, desktop-a11y-testing-coach.

AT and Development specialists include: nvda-addon-specialist, wxpython-specialist, python-specialist, a11y-tool-builder, text-quality-reviewer.

GitHub workflow management flows through github-hub to 10 workflow agents: daily-briefing, pr-review, issue-tracker, analytics, insiders-a11y-tracker, repo-admin, team-manager, contributions-hub, template-builder, repo-manager.

Infrastructure agents nexus and developer-hub provide cross-cutting knowledge and contributor support.

CI integration bridges include lighthouse-bridge and scanner-bridge for correlating external CI data with agent findings.

</details>

### MCP Server Architecture

The MCP server (`desktop-extension/server/index.js`) is a single Node.js ESM module that:

1. Registers 11 tools and 6 prompts with the `@modelcontextprotocol/sdk` `McpServer`
2. Communicates via `StdioServerTransport` (stdin/stdout JSON-RPC)
3. Performs all document scanning with zero external dependencies:
   - **Office scanning:** Pure Node.js ZIP Central Directory parsing using `inflateRawSync` from `node:zlib`
   - **PDF scanning:** Direct buffer parsing using `latin1` encoding with regex-based structure detection
4. Shells out to `@axe-core/cli` only for the `run_axe_scan` tool (optional external dependency)

<details>
<summary>MCP server component diagram (text description follows)</summary>

The MCP server (desktop-extension/server/index.js) imports node:child_process, node:fs, node:os, node:path, node:crypto, node:util, node:zlib as built-in modules, plus @modelcontextprotocol/sdk and zod as external packages.

It contains three tool groups: Web Tools (7 tools: check_contrast, get_accessibility_guidelines, check_heading_structure, check_link_text, check_form_labels, generate_vpat, run_axe_scan), Document Tools (4 tools: extract_document_metadata, batch_scan_documents, scan_office_document with scanDocx/scanXlsx/scanPptx, scan_pdf_document with parsePdfBasics/scanPdf), and Output Builders (buildOfficeSarif, buildOfficeMarkdownReport, buildPdfSarif, buildPdfMarkdownReport).

It also registers 6 MCP Prompts: Full Audit, ARIA Review, Modal Review, Contrast Review, Keyboard Review, Live Region Review.

</details>

### CI/CD Architecture

The following diagram shows the pull request pipeline that triggers accessibility scanning and uploads SARIF results to GitHub Code Scanning.

<details>
<summary>CI/CD architecture flowchart (text description follows)</summary>

A pull_request event (opened, synchronize) triggers .github/workflows/a11y-check.yml. This runs three parallel steps: Step 1 runs a11y-lint.mjs to scan HTML, JSX, and TSX files; Step 2 runs office-a11y-scan.mjs to scan DOCX, XLSX, and PPTX files; Step 3 runs pdf-a11y-scan.mjs to scan PDF files. All three produce SARIF 2.1.0 output uploaded to GitHub Code Scanning, with error and warning annotations and exit code 1 if error-severity findings exist.

A separate weekly workflow (source-currency-check.yml) runs on Mondays at 6 AM UTC. It checks out the repo, runs check_source_currency.py against SOURCE_REGISTRY.json, and auto-opens GitHub issues when authoritative sources change.

</details>

---

## Agent Specifications

### Web Accessibility Agents (13)

The following table lists all web accessibility agents with their domains, rule coverage, and whether they write code.

| # | Agent | Domain | Rule Coverage | Writes Code? |
|---|-------|--------|---------------|-------------|
| 1 | **accessibility-lead** | Orchestration | All (via delegation) | No (delegates) |
| 2 | **aria-specialist** | ARIA roles, states, properties | WAI-ARIA 1.2 | Yes |
| 3 | **modal-specialist** | Dialogs, drawers, overlays | Focus trap, escape, inert | Yes |
| 4 | **contrast-master** | Color contrast, dark mode, focus indicators, prefers-* | WCAG 1.4.3, 1.4.6, 1.4.11 | Yes |
| 5 | **keyboard-navigator** | Tab order, focus management, skip links | WCAG 2.1.1, 2.1.2, 2.4.3, 2.4.7 | Yes |
| 6 | **live-region-controller** | Dynamic content announcements | aria-live, role=alert, timing | Yes |
| 7 | **forms-specialist** | Labels, validation, errors, autocomplete | WCAG 1.3.1, 1.3.5, 3.3.1, 3.3.2 | Yes |
| 8 | **alt-text-headings** | Alt text, SVGs, headings, landmarks, page titles | WCAG 1.1.1, 1.3.1, 2.4.1, 2.4.2, 2.4.6 | Yes |
| 9 | **tables-data-specialist** | Data tables, grids, sortable columns | WCAG 1.3.1 | Yes |
| 10 | **link-checker** | Ambiguous link text, new-tab warnings, file types | WCAG 2.4.4, 2.4.9 | Yes |
| 11 | **web-accessibility-wizard** | Multi-phase guided web audit (12 phases) with sub-agent delegation, severity scoring, framework intelligence, VPAT/ACR export, batch scripts, CI/CD guides, delta scanning, fix mode | All (via delegation) | No (delegates) |
| 12 | **testing-coach** | Screen reader testing, keyboard testing, CI testing | Teaching only | No (test code only) |
| 13 | **wcag-guide** | WCAG 2.0/2.1/2.2 criteria explanation | All WCAG criteria | No (reference only) |

### Document Accessibility Agents (7)

The following table lists all document accessibility agents with their rule counts and MCP tool mappings.

| # | Agent | Domain | Rule Count | MCP Tool |
|---|-------|--------|-----------|----------|
| 14 | **word-accessibility** | DOCX alt text, headings, tables, language, reading order | 16 rules | scan_office_document |
| 15 | **excel-accessibility** | XLSX sheet names, merged cells, headers, charts, defined names | 14 rules | scan_office_document |
| 16 | **powerpoint-accessibility** | PPTX slide titles, reading order, alt text, media, notes | 16 rules | scan_office_document |
| 17 | **office-scan-config** | Office scan configuration management | 3 presets | N/A (config only) |
| 18 | **pdf-accessibility** | PDF/UA conformance, Matterhorn Protocol, structure, metadata | 56 rules (3 layers) | scan_pdf_document |
| 19 | **pdf-scan-config** | PDF scan configuration management | 3 presets | N/A (config only) |
| 20 | **document-accessibility-wizard** | Multi-phase document audit with sub-agent delegation, severity scoring, template analysis, remediation tracking, VPAT/ACR export, delta scanning | All (via delegation) | N/A (delegates) |

### Markdown Accessibility Agents (1)

| # | Agent | Domain | Audit Domains | Writes Code? |
|---|-------|--------|--------------|-------------|
| 21 | **markdown-a11y-assistant** | Interactive markdown accessibility audit wizard, 9 audit domains (links, alt text, headings, tables, emoji, Mermaid/ASCII diagrams, em-dashes, anchor validation), severity scoring, remediation tracking | WCAG 2.4.4, 1.1.1, 1.3.1, 1.3.2 | Yes (fixes markdown) |

### EPUB Accessibility Agents (2)

| # | Agent | Domain | Standards | Writes Code? |
|---|-------|--------|----------|-------------|
| 22 | **epub-accessibility** | EPUB 3 accessibility conformance, navigation, reading order, media overlays, metadata | EPUB Accessibility 1.1, WCAG 2.2 AA | Yes |
| 23 | **epub-scan-config** | EPUB scan configuration management | 3 presets | No (config only) |

### Specialized Domain Agents (5)

| # | Agent | Domain | Standards | Writes Code? |
|---|-------|--------|----------|-------------|
| 24 | **cognitive-accessibility** | Clear language, consistent navigation, predictable UI, error prevention, reading level | WCAG 2.2 cognitive guidelines, COGA | Yes |
| 25 | **design-system-auditor** | Component library accessibility patterns, design token contrast, theming | WCAG 2.2 AA, WAI-ARIA APG | Yes |
| 26 | **mobile-accessibility** | Touch targets, gestures, screen reader APIs, orientation, viewport | iOS UIAccessibility, Android TalkBack | Yes |
| 27 | **desktop-a11y-specialist** | Native desktop app accessibility, platform APIs, widget patterns | MSAA/UIA, NSAccessibility, ATK/AT-SPI | Yes |
| 28 | **desktop-a11y-testing-coach** | Desktop accessibility testing workflows with NVDA, JAWS, VoiceOver, Orca | Testing guidance only | No (guidance only) |

### AT and Development Specialists (5)

| # | Agent | Domain | Key Knowledge | Writes Code? |
|---|-------|--------|--------------|-------------|
| 29 | **nvda-addon-specialist** | NVDA addon development, manifest structure, API patterns, addon-datastore submission | NVDA API, controlTypes, braille, speech | Yes |
| 30 | **wxpython-specialist** | wxPython accessible application development, screen reader integration | wxWidgets, MSAA/UIA, wx.Accessible | Yes |
| 31 | **python-specialist** | General Python development with accessibility focus | Python best practices, type safety | Yes |
| 32 | **a11y-tool-builder** | Building new accessibility tools, MCP servers, browser extensions | MCP SDK, axe-core, Node.js | Yes |
| 33 | **text-quality-reviewer** | Content readability, plain language, inclusive terminology, reading level analysis | WCAG 3.1.5, plain language guidelines | No (review only) |

### GitHub Workflow Agents (11)

Project and repository management agents for GitHub operations. All agents implement the `github-workflow-standards` skill, produce dual MD+HTML output, and apply scoring, confidence levels, and delta tracking.

| # | Agent | Role | Skills |
|---|-------|------|--------|
| 34 | **github-hub** | Orchestrator - routes to the right agent from plain English | workflow-standards, scanning |
| 35 | **daily-briefing** | Morning overview of issues, PRs, CI, security alerts | workflow-standards, scanning, analytics-scoring |
| 36 | **pr-review** | PR review with diff analysis, confidence per finding, delta tracking | workflow-standards, scanning, analytics-scoring |
| 37 | **issue-tracker** | Issue triage, priority scoring, action inference, project board | workflow-standards, scanning, analytics-scoring |
| 38 | **analytics** | Repo health scoring (0-100/A-F), velocity, bottleneck detection | workflow-standards, scanning, analytics-scoring |
| 39 | **insiders-a11y-tracker** | Track a11y changes in VS Code and custom repos with delta + WCAG mapping | workflow-standards, scanning, analytics-scoring |
| 40 | **repo-admin** | Collaborator management, branch protection, access audits | workflow-standards, scanning, analytics-scoring |
| 41 | **team-manager** | Onboarding, offboarding, org team membership | workflow-standards, scanning |
| 42 | **contributions-hub** | Discussions, community health, contributor insights | workflow-standards, scanning |
| 43 | **template-builder** | Guided wizard: issue/PR/discussion templates, no YAML required | workflow-standards, scanning |
| 44 | **repo-manager** | Repo scaffolding: issue templates, CI, labels, CONTRIBUTING, SECURITY | workflow-standards, scanning |

### Hidden Helper Sub-Agents (11)

These agents are not user-invokable. They are used internally by wizards and orchestrators to parallelize scanning and analysis.

| # | Agent | Parent | Purpose | Platforms |
|---|-------|--------|---------|----------|
| H1 | **cross-page-analyzer** | web-accessibility-wizard | Cross-page web pattern detection, severity scoring, remediation tracking | All |
| H2 | **web-issue-fixer** | web-accessibility-wizard | Automated and guided web accessibility fix application | All |
| H3 | **web-csv-reporter** | web-accessibility-wizard | CSV export of web accessibility findings with WCAG mapping | All |
| H4 | **cross-document-analyzer** | document-accessibility-wizard | Cross-document pattern detection, severity scoring, template analysis | All |
| H5 | **document-inventory** | document-accessibility-wizard | File discovery, inventory building, delta detection across folders | All |
| H6 | **document-csv-reporter** | document-accessibility-wizard | CSV export of document accessibility findings | All |
| H7 | **markdown-scanner** | markdown-a11y-assistant | Single-file markdown accessibility scanning across 9 domains | All |
| H8 | **markdown-fixer** | markdown-a11y-assistant | Auto-fixable and human-judgment markdown accessibility fixes | All |
| H9 | **markdown-csv-reporter** | markdown-a11y-assistant | CSV export of markdown accessibility findings | All |
| H10 | **lighthouse-bridge** | CI integration | Bridges Lighthouse CI accessibility audit data with agent ecosystem | Claude + Copilot |
| H11 | **scanner-bridge** | CI integration | Bridges GitHub Accessibility Scanner CI data with agent ecosystem | Claude + Copilot |

### Infrastructure Agents (2)

| # | Agent | Role | Key Functions |
|---|-------|------|--------------|
| 56 | **nexus** | Cross-agent knowledge hub | Routes complex queries across agent boundaries, maintains shared context, resolves conflicting guidance |
| 57 | **developer-hub** | Contributor onboarding and ecosystem coordination | New contributor guide, agent development workflows, cross-platform parity checks, release coordination |

---

## Prompts and Skills

### Custom Prompts (60)

One-click workflows available from the Copilot prompt picker:

#### Document Accessibility Prompts (11)

| Prompt | What It Does |
|--------|-------------|
| audit-single-document | Scan a single .docx, .xlsx, .pptx, or .pdf with severity scoring |
| audit-document-folder | Recursively scan an entire folder of documents |
| audit-changed-documents | Delta scan - only audit documents changed since last commit |
| generate-vpat | Generate a VPAT 2.5 / ACR compliance report from audit results |
| generate-remediation-scripts | Create PowerShell/Bash scripts to batch-fix common issues |
| compare-audits | Compare two audit reports to track remediation progress |
| setup-document-cicd | Set up CI/CD pipelines for automated document scanning |
| quick-document-check | Fast triage - errors only, pass/fail verdict |
| create-accessible-template | Guidance for creating accessible document templates |
| export-document-csv | Export document audit findings to structured CSV |
| build-a11y-template | Build an accessibility-focused project template |

#### Web Accessibility Prompts (6)

| Prompt | What It Does |
|--------|-------------|
| audit-web-page | Full single-page audit with axe-core scan and code review |
| quick-web-check | Fast axe-core triage - runtime scan only, pass/fail verdict |
| audit-web-multi-page | Multi-page comparison audit with cross-page pattern detection |
| compare-web-audits | Compare two web audit reports to track remediation progress |
| fix-web-issues | Interactive fix mode - auto-fixable and human-judgment items from audit report |
| export-web-csv | Export web audit findings to structured CSV |

#### Markdown Accessibility Prompts (5)

| Prompt | What It Does |
|--------|-------------|
| audit-markdown | Full markdown accessibility audit across 9 domains |
| quick-markdown-check | Fast markdown triage - errors only, pass/fail verdict |
| compare-markdown-audits | Compare two markdown audit reports for progress tracking |
| fix-markdown-issues | Interactive markdown fix mode with auto-fix and human-judgment items |
| export-markdown-csv | Export markdown audit findings to structured CSV |

#### GitHub Workflow Prompts (32)

| Prompt | What It Does |
|--------|-------------|
| a11y-update | Check for accessibility agent updates |
| add-collaborator | Add a collaborator to a repository |
| address-comments | Address PR review comments systematically |
| build-template | Build an issue/PR/discussion template via guided wizard |
| ci-status | Check CI pipeline status across repositories |
| create-issue | Create a new GitHub issue with proper labels and assignees |
| daily-briefing | Morning situation report across repositories |
| draft-release | Draft a new release with changelog generation |
| explain-code | Explain code with accessibility context |
| issue-reply | Draft a reply to a GitHub issue |
| manage-branches | Create, delete, or protect branches |
| manage-issue | Update labels, assignees, milestones on an issue |
| merge-pr | Merge a pull request with checks |
| my-issues | List issues assigned to you across repositories |
| my-prs | List your open pull requests across repositories |
| my-stats | Personal contribution statistics and velocity |
| notifications | Check and manage GitHub notifications |
| onboard-repo | Set up a new repository with standards (labels, templates, CI) |
| pr-author-checklist | Pre-submission checklist for PR authors |
| pr-comment | Add a comment to a pull request |
| pr-report | Generate a detailed PR analysis report |
| project-status | Project board status and progress overview |
| react | React to an issue or PR with emoji |
| refine-issue | Improve issue description, labels, and acceptance criteria |
| release-prep | Prepare a release (changelog, version bump, tag) |
| review-pr | Review a pull request with accessibility focus |
| security-dashboard | Security alerts and vulnerability overview |
| setup-github-scanner | Set up GitHub Accessibility Scanner CI integration |
| setup-lighthouse-scanner | Set up Lighthouse CI accessibility scanning |
| sprint-review | Sprint review with velocity and burndown analysis |
| team-dashboard | Team workload and contribution overview |
| triage | Triage incoming issues with priority scoring |

#### Developer Tools Prompts (6)

| Prompt | What It Does |
|--------|-------------|
| scaffold-nvda-addon | Scaffold a new NVDA screen reader addon project with structure, manifest, and boilerplate |
| audit-desktop-a11y | Desktop application accessibility audit covering platform APIs, keyboard, and high contrast |
| test-desktop-a11y | Create a desktop accessibility test plan with screen reader test cases and automated UIA scaffolding |
| review-text-quality | Scan web files for broken alt text, template variables in aria-labels, placeholder labels, and duplicate names |
| scaffold-wxpython-app | Scaffold an accessible wxPython desktop application with sizers, keyboard nav, and screen reader support |
| package-python-app | Package a Python application for distribution using PyInstaller, Nuitka, or cx_Freeze |

### Reusable Skills (17)

Domain-specific knowledge modules in `.github/skills/` that agents reference automatically:

| Skill | Domain |
|-------|--------|
| accessibility-rules | Cross-format document accessibility rule reference with WCAG 2.2 mapping |
| cognitive-accessibility | Cognitive accessibility patterns, clear language, COGA guidelines |
| design-system | Design system and component library accessibility patterns |
| document-scanning | File discovery commands, delta detection, scan configuration profiles |
| framework-accessibility | Framework-specific accessibility patterns and fix templates (React, Vue, Angular, Svelte, Tailwind) |
| github-a11y-scanner | GitHub Accessibility Scanner CI integration patterns and issue correlation |
| github-analytics-scoring | Repo health scoring (0-100/A-F), issue/PR priority scoring, confidence levels, delta tracking, velocity metrics |
| github-scanning | GitHub search patterns by intent, date range handling, parallel stream collection model, cross-repo intelligence, auto-recovery |
| github-workflow-standards | Core standards for all GitHub workflow agents: auth, dual MD+HTML output, HTML accessibility, safety rules, progress announcements, parallel execution |
| help-url-reference | Centralized help URL mapping: axe-core rule IDs to Deque University, document rules to Office/PDF help, WCAG to W3C Understanding |
| lighthouse-scanner | Lighthouse CI accessibility audit integration, score tracking, regression detection |
| markdown-accessibility | Markdown accessibility rule library: links, alt text, headings, tables, emoji, diagrams, em-dashes, severity scoring |
| mobile-accessibility | iOS and Android accessibility patterns, touch targets, gestures, screen reader APIs |
| python-development | Python development best practices, type safety, testing patterns |
| report-generation | Audit report formatting, severity scoring formulas, VPAT/ACR compliance export |
| web-scanning | Web content discovery, URL crawling, axe-core CLI commands, framework detection |
| web-severity-scoring | Web severity scoring formulas (0-100, A-F grades), confidence levels, remediation tracking |

### Instruction Files (6)

Workspace-level instruction files in `.github/instructions/` that apply to matching file patterns:

| Instruction File | Applies To | Domain |
|-----------------|-----------|--------|
| aria-patterns.instructions.md | `**/*.{html,jsx,tsx,vue,svelte,astro}` | ARIA pattern enforcement for web components |
| markdown-accessibility.instructions.md | `**/*.md` | Markdown accessibility guidelines |
| multi-agent-reliability.instructions.md | `**/*.{md,agent.md}` | Multi-agent workflow reliability standards |
| powershell-terminal-ops.instructions.md | `**/*.ps1` | PowerShell terminal operation patterns |
| semantic-html.instructions.md | `**/*.{html,jsx,tsx,vue,svelte,astro}` | Semantic HTML enforcement |
| web-accessibility-baseline.instructions.md | `**/*.{html,jsx,tsx,vue,svelte,astro}` | WCAG 2.2 AA baseline requirements |

### Agent Teams (AGENTS.md)

Team coordination is defined in `.github/agents/AGENTS.md`. Six defined teams:

| Team | Led By | Members |
|------|--------|--------|
| Document Accessibility Audit | document-accessibility-wizard | word-accessibility, excel-accessibility, powerpoint-accessibility, pdf-accessibility, document-inventory, cross-document-analyzer, document-csv-reporter |
| Web Accessibility Audit | accessibility-lead | All 13 web agents + cross-page-analyzer, web-issue-fixer, web-csv-reporter |
| Markdown Accessibility Audit | markdown-a11y-assistant | markdown-scanner, markdown-fixer, markdown-csv-reporter |
| Full Audit | accessibility-lead | All agents (combined web + document + markdown workflow) |
| GitHub Workflow Management | github-hub | daily-briefing, pr-review, issue-tracker, analytics, insiders-a11y-tracker, repo-admin, team-manager, contributions-hub, template-builder, repo-manager |
| Developer Tools | developer-hub | python-specialist, wxpython-specialist, nvda-addon-specialist, desktop-a11y-specialist, desktop-a11y-testing-coach, a11y-tool-builder, text-quality-reviewer |

### Cross-Cutting Standards

All 57 agents inherit behavioral rules from `.github/agents/shared-instructions.md`, which includes:

- **Source Citation Policy** - Mandatory inline source citations with authority hierarchy
- **Multi-Agent Reliability** - Workflow handoff patterns, error recovery, progress announcements
- **Staying Current** - Instructions to use context7 MCP and fetch_webpage for live documentation verification

---

## Source Citation Policy and Currency Automation

### Problem

AI agents generate guidance from training data that may be outdated, incomplete, or fabricated. Without mandatory source citations, users cannot verify agent claims against authoritative specifications.

### Solution

A three-part system ensures agent trustworthiness:

#### 1. Citation Policy (CITATION_POLICY.md)

All agents must follow a 6-tier authority hierarchy when citing sources:

| Tier | Authority Level | Example Sources |
|------|----------------|----------------|
| 1 | Normative Specifications | WCAG 2.2, WAI-ARIA 1.2, PDF/UA (ISO 14289), HTML Living Standard |
| 2 | Informative Guidance | WAI-ARIA APG, Understanding WCAG 2.2, WAI Tutorials |
| 3 | Platform Vendor Documentation | MDN Web Docs, Apple Developer, Android Developer |
| 4 | AT Vendor Documentation | NVDA User Guide, JAWS Documentation, VoiceOver Guide |
| 5 | Peer-Reviewed Sources | Deque University, WebAIM, TPGi |
| 6 | Government / Legal | Section 508, EN 301 549, ADA.gov |

**Five Core Rules:**

1. **No Source, No Claim** - Every factual statement must include an inline source link
2. **Inline Citation Format** - `[text](URL)` immediately after the claim
3. **Sources Section** - Every agent response includes an Authoritative Sources section at the end
4. **Recency Preference** - Prefer the most recent version of any specification
5. **Conflict Resolution** - Higher-tier sources override lower-tier sources

#### 2. Source Registry (SOURCE_REGISTRY.json)

Machine-readable registry of 20 authoritative sources with fields:

| Field | Purpose |
|-------|---------|
| `id` | Unique identifier (e.g., `wcag-2.2`) |
| `url` | Authoritative URL to monitor |
| `type` | Source type (spec, guide, docs) |
| `lastVerified` | ISO 8601 date of last verification |
| `sha256` | Content fingerprint for change detection |
| `version` | Current known version |
| `agents` | List of agents that depend on this source |
| `checkFrequency` | weekly, monthly, or quarterly |

#### 3. Currency Automation (source-currency-check.yml)

Weekly GitHub Actions workflow that:

1. Reads SOURCE_REGISTRY.json
2. HTTP GETs each source URL
3. Computes SHA-256 hash of response content
4. Compares with stored hash
5. Opens GitHub issues with `source-update` label if content changed
6. Opens GitHub issues with `source-broken` label if URL returns error

**Schedule:** Monday 6 AM UTC + manual workflow_dispatch

---

## MCP Tool Specifications

### Web Accessibility Tools (7)

#### check_contrast

| Property | Value |
|----------|-------|
| **Input** | `foreground` (hex), `background` (hex) |
| **Output** | Ratio, AA pass/fail for normal text (4.5:1), large text (3:1), UI components (3:1) |
| **Algorithm** | WCAG relative luminance formula |
| **Dependencies** | None |

#### get_accessibility_guidelines

| Property | Value |
|----------|-------|
| **Input** | `componentType` (enum: modal, tabs, accordion, combobox, carousel, form, live-region, navigation, general) |
| **Output** | Requirements, code examples, common mistakes per component type |
| **Dependencies** | None |

#### check_heading_structure

| Property | Value |
|----------|-------|
| **Input** | `html` (string) |
| **Output** | Heading outline, multiple H1 detection, skipped levels, empty headings |
| **WCAG Criteria** | 1.3.1, 2.4.6 |
| **Dependencies** | None |

#### check_link_text

| Property | Value |
|----------|-------|
| **Input** | `html` (string) |
| **Output** | 17 ambiguous patterns, URL-as-text, missing new-tab warnings, non-HTML resources, repeated text |
| **WCAG Criteria** | 2.4.4, 2.4.9 |
| **Dependencies** | None |

#### check_form_labels

| Property | Value |
|----------|-------|
| **Input** | `html` (string) |
| **Output** | Missing labels, broken aria-labelledby refs, missing autocomplete, fieldset/legend violations |
| **WCAG Criteria** | 1.3.1, 1.3.5, 3.3.2, 4.1.2 |
| **Dependencies** | None |

#### generate_vpat

| Property | Value |
|----------|-------|
| **Input** | `productName`, `productVersion`, `evaluationDate`, optional `findings[]`, optional `reportPath` |
| **Output** | VPAT 2.5 template with all WCAG 2.2 Level A (30) and AA (20) criteria |
| **Format** | Markdown |
| **Dependencies** | None |

#### run_axe_scan

| Property | Value |
|----------|-------|
| **Input** | `url` (required), optional `selector`(CSS), optional `reportPath` |
| **Output** | Violations grouped by severity with affected elements, WCAG criteria, and fix suggestions |
| **Format** | Markdown report when reportPath provided |
| **Dependencies** | `@axe-core/cli` (external, must be installed separately) |

### Document Accessibility Tools (4)

#### extract_document_metadata

| Property | Value |
|----------|-------|
| **Input** | `filePath` (string) |
| **Supported Formats** | DOCX, XLSX, PPTX, PDF |
| **Output** | Title, author, language, creation date, page/slide/sheet count, word count, tagged status (PDF) |
| **Dependencies** | None (pure Node.js) |

#### batch_scan_documents

| Property | Value |
|----------|-------|
| **Input** | `directoryPath` (string), optional `recursive` (boolean), optional `formats` (string[]), optional `outputFormat` (sarif\|markdown) |
| **Behavior** | Scans all matching documents in a directory, aggregates results |
| **Output** | Combined SARIF or markdown report with per-file results |
| **Dependencies** | None (pure Node.js) |

#### scan_office_document

| Property | Value |
|----------|-------|
| **Input** | `filePath` (string), optional `outputFormat`(sarif\|markdown, default: sarif) |
| **Supported Formats** | DOCX, XLSX, PPTX (detected by file extension) |
| **Parsing** | Pure Node.js ZIP Central Directory parsing, `inflateRawSync` for deflate entries |
| **XML Processing** | Custom regex-based XML helpers (`xmlText`, `xmlAttr`, `xmlHas`, `xmlCount`) |
| **Rule Engine** | Per-format scanners: `scanDocx()` (16 rules), `scanXlsx()` (14 rules), `scanPptx()` (16 rules) |
| **Config** | `.a11y-office-config.json` - per-format `enabled`, `disabledRules`, `severityFilter` |
| **Config Search** | Upward directory traversal from scanned file |
| **Output** | SARIF 2.1.0 or human-readable markdown |
| **Dependencies** | None (pure Node.js) |

#### scan_pdf_document

| Property | Value |
|----------|-------|
| **Input** | `filePath` (string), optional `outputFormat` (sarif\|markdown, default: sarif) |
| **Parsing** | Direct buffer reading with `latin1` encoding, regex-based PDF object detection |
| **Structure Detection** | StructTreeRoot, MarkInfo, /Title, /Lang, /Outlines, AcroForm, /Link, /Figure, /Table, /Font, /Encrypt |
| **Rule Engine** | `scanPdf()` with 3 layers: PDFUA.*(30), PDFBP.* (22), PDFQ.* (4) - total 56 rules |
| **Config** | `.a11y-pdf-config.json` - `enabled`, `disabledRules`, `severityFilter`, `maxFileSize` |
| **Config Search** | Upward directory traversal from scanned file |
| **Output** | SARIF 2.1.0 or human-readable markdown |
| **Dependencies** | None (pure Node.js) |

---

## Rule Systems

### Office Document Rules

#### DOCX Rules (16)

| Rule ID | Severity | Description |
|---------|----------|-------------|
| DOCX-E001 | error | Image without alt text |
| DOCX-E002 | error | Missing document title in properties |
| DOCX-E003 | error | No headings used for document structure |
| DOCX-E004 | error | Table without header row |
| DOCX-E005 | error | Missing document language |
| DOCX-E006 | error | Color-only formatting conveying meaning (Bold+Color but no other semantic indicator) |
| DOCX-E007 | error | Inline image without alt text |
| DOCX-W001 | warning | Alt text exceeds 125 characters (may need summarization) |
| DOCX-W002 | warning | Heading levels skipped (e.g., H1 to H3) |
| DOCX-W003 | warning | Table contains merged cells |
| DOCX-W004 | warning | Font size below 10pt |
| DOCX-W005 | warning | Empty paragraphs used for spacing |
| DOCX-W006 | warning | Floating/anchored image may break reading order |
| DOCX-T001 | tip | Consider adding a table of contents for long documents |
| DOCX-T002 | tip | Consider adding document summary/description in properties |
| DOCX-T003 | tip | Consider adding bookmarks for key sections |

#### XLSX Rules (14)

| Rule ID | Severity | Description |
|---------|----------|-------------|
| XLSX-E001 | error | Default sheet name (Sheet1, Sheet2, etc.) |
| XLSX-E002 | error | No defined names for data ranges |
| XLSX-E003 | error | Merged cells present (confuse screen reader navigation) |
| XLSX-E004 | error | No sheet tab color differentiation |
| XLSX-E005 | error | No header row in first-row data detection |
| XLSX-E006 | error | Chart without alt text or description |
| XLSX-W001 | warning | Blank cells found in data ranges |
| XLSX-W002 | warning | Very wide rows (beyond column Z) |
| XLSX-W003 | warning | Hidden sheets may contain important content |
| XLSX-W004 | warning | Data validation cells without input messages |
| XLSX-W005 | warning | No print titles set for multi-page spreadsheets |
| XLSX-T001 | tip | Consider adding a summary/instructions sheet |
| XLSX-T002 | tip | Consider using named ranges for key data areas |
| XLSX-T003 | tip | Consider adding cell comments for complex formulas |

#### PPTX Rules (16)

| Rule ID | Severity | Description |
|---------|----------|-------------|
| PPTX-E001 | error | Slide without title |
| PPTX-E002 | error | Image without alt text |
| PPTX-E003 | error | Missing reading order (no `<p:cNvPr>` with order attributes) |
| PPTX-E004 | error | Table without header row |
| PPTX-E005 | error | Audio/video without text description |
| PPTX-E006 | error | Missing presentation language |
| PPTX-W001 | warning | Multiple slides with identical titles |
| PPTX-W002 | warning | Font size below 18pt (readability on slides) |
| PPTX-W003 | warning | Excessive text on a single slide |
| PPTX-W004 | warning | Missing speaker notes |
| PPTX-W005 | warning | Slide transitions without user control |
| PPTX-W006 | warning | Grouped shapes without group alt text |
| PPTX-T001 | tip | Consider adding slide numbers |
| PPTX-T002 | tip | Consider adding a summary slide |
| PPTX-T003 | tip | Consider high-contrast color scheme for projectors |
| PPTX-T004 | tip | Consider handout version with full text of visual content |

### PDF Document Rules

#### PDFUA Layer - PDF/UA Conformance (30 rules)

| Rule ID | Severity | Matterhorn Checkpoint | Description |
|---------|----------|----------------------|-------------|
| PDFUA.TAGS.001 | error | 01-004 | Document has no tagged structure (no StructTreeRoot) |
| PDFUA.TAGS.002 | error | 01-005 | Document not marked as tagged (MarkInfo missing or false) |
| PDFUA.TAGS.003 | warning | 01-006 | Suspect flag is true (may contain untagged content) |
| PDFUA.TAGS.004 | error | 01-007 | Figure tag without /Alt text |
| PDFUA.TAGS.005 | error | 06-001 | Table tag without /TH header cells |
| PDFUA.TAGS.006 | warning | 01-008 | No /P (paragraph) tags found |
| PDFUA.TAGS.007 | warning | 09-001 | No /L (list) tags found |
| PDFUA.TAGS.008 | warning | 09-002 | No /LI (list item) tags found |
| PDFUA.TAGS.009 | error | 19-001 | No /H (heading) tags found |
| PDFUA.TAGS.010 | warning | 14-001 | No /Sect (section) tags found |
| PDFUA.TAGS.011 | warning | 01-009 | No /Span tags found |
| PDFUA.TAGS.012 | warning | 01-010 | No /Link tags found in document with links |
| PDFUA.TAGS.013 | error | 06-002 | Table without /TR (row) tags |
| PDFUA.TAGS.014 | error | 06-003 | Table without /TD (cell) tags |
| PDFUA.TAGS.015 | warning | 19-002 | Only one heading level used |
| PDFUA.META.001 | error | 28-002 | Missing document title in metadata |
| PDFUA.META.002 | error | 28-004 | Missing document language |
| PDFUA.META.003 | error | 28-005 | DisplayDocTitle not set to true |
| PDFUA.META.004 | warning | 28-006 | Missing document author |
| PDFUA.META.005 | warning | 28-007 | Missing document subject/description |
| PDFUA.META.006 | warning | 28-008 | Missing document keywords |
| PDFUA.META.007 | warning | 28-009 | Missing creation date |
| PDFUA.NAV.001 | warning | 21-001 | No bookmarks (Outlines) present |
| PDFUA.NAV.002 | error | 21-002 | Real-content with no associated tag |
| PDFUA.FORM.001 | error | 25-001 | Form field without /TU (tooltip/label) |
| PDFUA.FORM.002 | warning | 25-002 | Form field without /TM (mapping name) |
| PDFUA.FORM.003 | warning | 25-003 | No tab order set on form fields |
| PDFUA.FONT.001 | error | 26-001 | Non-embedded font detected |
| PDFUA.FONT.002 | warning | 26-002 | No /ToUnicode map for font (glyph-to-text mapping) |
| PDFUA.FONT.003 | warning | 26-003 | Type3 font detected (may cause rendering issues) |

#### PDFBP Layer - Best Practices (22 rules)

| Rule ID | Severity | Description |
|---------|----------|-------------|
| PDFBP.META.001 | warning | Document title matches filename (likely default) |
| PDFBP.META.002 | tip | Missing PDF/UA identifier in metadata |
| PDFBP.META.003 | tip | Missing XMP metadata stream |
| PDFBP.NAV.001 | tip | Consider adding named destinations for navigation |
| PDFBP.NAV.002 | warning | No page labels defined |
| PDFBP.NAV.003 | tip | Consider adding article threads for multi-column content |
| PDFBP.TAGS.001 | warning | High figure-to-text ratio (may be image-heavy) |
| PDFBP.TAGS.002 | tip | Consider adding /Caption to tables |
| PDFBP.TAGS.003 | tip | Consider using /Aside for sidebar content |
| PDFBP.TAGS.004 | warning | No /Note or /Reference tags for footnotes if applicable |
| PDFBP.TAGS.005 | tip | Consider /Annot tags for annotations |
| PDFBP.TEXT.001 | warning | No /ActualText attributes found |
| PDFBP.TEXT.002 | warning | No /E (expansion) attributes for abbreviations |
| PDFBP.TEXT.003 | tip | Consider /Lang override on foreign-language spans |
| PDFBP.FORM.001 | tip | Consider adding /V (default value) hints for form fields |
| PDFBP.FORM.002 | tip | Consider grouping related form fields |
| PDFBP.LINK.001 | warning | Link annotation without /Contents or /Alt |
| PDFBP.LINK.002 | tip | Consider adding link destination descriptions |
| PDFBP.IMG.001 | warning | Large image without /Alt (likely meaningful content) |
| PDFBP.IMG.002 | tip | Consider adding /ActualText for decorative images |
| PDFBP.A11Y.001 | tip | Consider embedding accessibility conformance identifier |
| PDFBP.A11Y.002 | tip | Consider adding a document summary in XMP |

#### PDFQ Layer - Quality / Pipeline (4 rules)

| Rule ID | Severity | Description |
|---------|----------|-------------|
| PDFQ.SIZE.001 | warning | File exceeds configured size limit (default 100MB) |
| PDFQ.SCAN.001 | warning | Suspect scanned-image PDF (no text content, all images) |
| PDFQ.ENC.001 | error | Encryption restricts content access (may block AT) |
| PDFQ.VER.001 | tip | PDF version older than 1.7 (limited tag support) |

---

## CI/CD Integration

### Scripts

The following table lists the CI scripts and the file formats each processes.

| Script | Format | Input | Config File |
|--------|--------|-------|-------------|
| `a11y-lint.mjs` | HTML, JSX, TSX | File/directory paths | None |
| `office-a11y-scan.mjs` | DOCX, XLSX, PPTX | File/directory paths | `.a11y-office-config.json` |
| `pdf-a11y-scan.mjs` | PDF | File/directory paths | `.a11y-pdf-config.json` |
| `check_source_currency.py` | N/A (source URLs) | SOURCE_REGISTRY.json | None |

### Common Behavior

The three accessibility scanning CI scripts:

- Accept file paths or directory paths as CLI arguments (default: current directory)
- Skip `node_modules`, `.git`, `vendor`, and `dist` directories
- Emit `::error::` and `::warning::` GitHub Actions annotations
- Output SARIF 2.1.0 files for upload to GitHub Code Scanning
- Exit code 0 on success, 1 on error-severity findings

### GitHub Actions Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `a11y-check.yml` | `pull_request` (opened, synchronize) | Runs all three a11y scan scripts |
| `source-currency-check.yml` | Weekly cron (Monday 6 AM UTC) + workflow_dispatch | Verifies authoritative source URLs haven't changed |

---

## Configuration System

### Office Configuration (`.a11y-office-config.json`)

```json
{
  "docx": {
    "enabled": true,
    "disabledRules": ["DOCX-W005"],
    "severityFilter": ["error", "warning"]
  },
  "xlsx": {
    "enabled": true,
    "disabledRules": [],
    "severityFilter": ["error", "warning", "tip"]
  },
  "pptx": {
    "enabled": true,
    "disabledRules": [],
    "severityFilter": ["error", "warning"]
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `[format].enabled` | boolean | Enable/disable scanning for this format |
| `[format].disabledRules` | string[] | Rule IDs to suppress |
| `[format].severityFilter` | string[] | Severity levels to include in output |

### PDF Configuration (`.a11y-pdf-config.json`)

```json
{
  "enabled": true,
  "disabledRules": [],
  "severityFilter": ["error", "warning"],
  "maxFileSize": 104857600
}
```

| Field | Type | Description |
|-------|------|-------------|
| `enabled` | boolean | Enable/disable PDF scanning |
| `disabledRules` | string[] | Rule IDs to suppress |
| `severityFilter` | string[] | Severity levels to include |
| `maxFileSize` | number | Maximum file size in bytes (default 100MB) |

### Preset Profiles

Both config agents support three preset profiles:

| Profile | Error | Warning | Tip | Description |
|---------|-------|---------|-----|-------------|
| **strict** | Yes | Yes | Yes | All rules, all severities |
| **moderate** | Yes | Yes | No | All rules, errors + warnings only |
| **minimal** | Yes | No | No | Errors only |

### Config Resolution

Both tools search upward from the scanned file's directory to find the nearest config file. This enables:

- Project-wide defaults at the repo root
- Directory-specific overrides (e.g., stricter rules for `legal/` documents)

---

## Output Formats

### SARIF 2.1.0

All document scanning tools and CI scripts output SARIF 2.1.0 (Static Analysis Results Interchange Format):

- Compatible with GitHub Code Scanning
- Includes `tool.driver.name`, `tool.driver.version`, `tool.driver.rules[]`
- Each rule has `id`, `shortDescription`, `defaultConfiguration.level`
- Results include `ruleId`, `level`, `message.text`, `locations[].physicalLocation`
- URI base IDs resolve relative to the workspace root

### Markdown Reports

Human-readable reports include:

- Scan metadata (file, date, tool version)
- Summary table (counts by severity)
- Findings grouped by severity (error to warning to tip)
- Rule explanations and remediation guidance
- Actionable fix descriptions per finding

### CSV Reports

Structured CSV exports from csv-reporter sub-agents include:

- One finding per row with severity, rule ID, WCAG criteria, location, description
- Help URL column linking to Deque University, Microsoft Office help, or W3C Understanding pages
- Compatible with spreadsheet tools and issue tracking imports

### VPAT 2.5

The `generate_vpat` tool outputs a full VPAT 2.5 / ACR template:

- All WCAG 2.2 Level A (30 criteria) and Level AA (20 criteria)
- Conformance levels: Supports, Partially Supports, Does Not Support, Not Applicable, Not Evaluated
- Terms and definitions section
- Summary statistics

---

## Installation and Distribution

### Installers

| File | Platform | Description |
|------|----------|-------------|
| `install.sh` | macOS/Linux | Interactive installer (--global / --project flags) |
| `install.ps1` | Windows | Interactive installer (PowerShell) |
| `uninstall.sh` | macOS/Linux | Clean removal including auto-update jobs |
| `uninstall.ps1` | Windows | Clean removal including Task Scheduler jobs |
| `update.sh` | macOS/Linux | Manual or auto-update (git pull + copy) |
| `update.ps1` | Windows | Manual or auto-update |

### Auto-Update Mechanisms

| Platform | Mechanism | Schedule |
|----------|-----------|----------|
| macOS | LaunchAgent plist | Daily 9:00 AM |
| Linux | Cron job | Daily 9:00 AM |
| Windows | Task Scheduler | Daily 9:00 AM |

### Claude Desktop Distribution

- **Current:** Manual download from GitHub Releases (`.mcpb` file, double-click to install)
- **Pending:** Submitted to Anthropic Connectors Directory for automatic updates

### MCP Extension Build

```bash
npm install -g @anthropic-ai/mcpb
cd desktop-extension
npm install
mcpb validate .
mcpb pack . ../a11y-agent-team.mcpb
```

---

## Standards Compliance

| Standard | Coverage | Notes |
|----------|----------|-------|
| **WCAG 2.2 Level A** | 30 criteria (all) | Via web agents and VPAT generation |
| **WCAG 2.2 Level AA** | 20 criteria (all) | Via web agents and VPAT generation |
| **WCAG 2.2 Level AAA** | Not targeted | Available via wcag-guide for reference only |
| **WAI-ARIA 1.2** | Full | Via aria-specialist agent |
| **PDF/UA (ISO 14289)** | 30 conformance rules | Via PDFUA rule layer |
| **Matterhorn Protocol** | Mapped checkpoints | PDFUA rules reference MP checkpoint numbers |
| **Section 508** | Covered via WCAG AA | VPAT 2.5 format supports Section 508 reporting |
| **EN 301 549** | Covered via WCAG AA | European accessibility standard |
| **EPUB Accessibility 1.1** | Core conformance | Via epub-accessibility agent |
| **COGA (Cognitive Accessibility)** | Guidelines coverage | Via cognitive-accessibility agent |

---

## Non-Functional Requirements

### Performance

- Office document scanning: < 2 seconds for documents under 10MB
- PDF document scanning: < 3 seconds for documents under 50MB
- All web MCP tools: < 500ms (no I/O except check_contrast calculation)
- `run_axe_scan`: Depends on page complexity and Chromium startup time
- Source currency checks: < 60 seconds for all 20 registry entries

### Reliability

- Zero external dependencies for document scanning (pure Node.js)
- Graceful handling of malformed ZIP files, corrupt PDFs, and unexpected XML structures
- Config file parsing failures fall back to default (scan everything) rather than crashing
- Source currency workflow tolerates individual URL failures without blocking other checks

### Compatibility

- Node.js 18+ (ESM modules, `inflateRawSync`, `randomUUID`)
- Claude Code CLI (any version with agents support)
- GitHub Copilot (any version with `.github/agents/` support)
- Gemini (any version with `.gemini/extensions/` support)
- Codex CLI (any version with `.codex/AGENTS.md` support)
- Claude Desktop 0.10.0+
- Windows (PowerShell 5.1+), macOS, Linux

### Security

- No network calls during document scanning (purely local file parsing)
- No credential storage
- Config files contain only rule configuration, no secrets
- SARIF output does not include document content, only structural findings
- Source currency workflow uses only GITHUB_TOKEN (auto-provided by Actions)

---

## Dependencies

### Runtime Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@modelcontextprotocol/sdk` | ^1.20.0 | MCP server framework |
| `zod` | 3.25 | Input validation and schema definition |

### Optional Runtime Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@axe-core/cli` | Any | Required only for `run_axe_scan` tool |

### Node.js Built-in Modules Used

| Module | Usage |
|--------|-------|
| `node:child_process` | Shell out to axe-core CLI |
| `node:fs/promises` | File I/O (read documents, write reports) |
| `node:os` | Temp directory for axe-core results |
| `node:path` | Path manipulation, extension detection |
| `node:crypto` | `randomUUID()` for SARIF run IDs |
| `node:util` | `promisify()` for child_process |
| `node:zlib` | `inflateRawSync()` for ZIP deflate entries |

### CI/CD Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| Python | 3.12+ | Source currency check script |
| `hashlib` | stdlib | SHA-256 fingerprinting |
| `urllib.request` | stdlib | HTTP fetching for source verification |

---

## File Inventory

### Agent Files (57 unique agents x 3-4 platforms)

#### Claude Code Agents (57 files in `.claude/agents/`)

| Agent | File |
|-------|------|
| a11y-tool-builder | `.claude/agents/a11y-tool-builder.md` |
| accessibility-lead | `.claude/agents/accessibility-lead.md` |
| alt-text-headings | `.claude/agents/alt-text-headings.md` |
| analytics | `.claude/agents/analytics.md` |
| aria-specialist | `.claude/agents/aria-specialist.md` |
| cognitive-accessibility | `.claude/agents/cognitive-accessibility.md` |
| contrast-master | `.claude/agents/contrast-master.md` |
| contributions-hub | `.claude/agents/contributions-hub.md` |
| cross-document-analyzer | `.claude/agents/cross-document-analyzer.md` |
| cross-page-analyzer | `.claude/agents/cross-page-analyzer.md` |
| daily-briefing | `.claude/agents/daily-briefing.md` |
| design-system-auditor | `.claude/agents/design-system-auditor.md` |
| desktop-a11y-specialist | `.claude/agents/desktop-a11y-specialist.md` |
| desktop-a11y-testing-coach | `.claude/agents/desktop-a11y-testing-coach.md` |
| developer-hub | `.claude/agents/developer-hub.md` |
| document-accessibility-wizard | `.claude/agents/document-accessibility-wizard.md` |
| document-csv-reporter | `.claude/agents/document-csv-reporter.md` |
| document-inventory | `.claude/agents/document-inventory.md` |
| epub-accessibility | `.claude/agents/epub-accessibility.md` |
| epub-scan-config | `.claude/agents/epub-scan-config.md` |
| excel-accessibility | `.claude/agents/excel-accessibility.md` |
| forms-specialist | `.claude/agents/forms-specialist.md` |
| github-hub | `.claude/agents/github-hub.md` |
| insiders-a11y-tracker | `.claude/agents/insiders-a11y-tracker.md` |
| issue-tracker | `.claude/agents/issue-tracker.md` |
| keyboard-navigator | `.claude/agents/keyboard-navigator.md` |
| lighthouse-bridge | `.claude/agents/lighthouse-bridge.md` |
| link-checker | `.claude/agents/link-checker.md` |
| live-region-controller | `.claude/agents/live-region-controller.md` |
| markdown-a11y-assistant | `.claude/agents/markdown-a11y-assistant.md` |
| markdown-csv-reporter | `.claude/agents/markdown-csv-reporter.md` |
| markdown-fixer | `.claude/agents/markdown-fixer.md` |
| markdown-scanner | `.claude/agents/markdown-scanner.md` |
| mobile-accessibility | `.claude/agents/mobile-accessibility.md` |
| modal-specialist | `.claude/agents/modal-specialist.md` |
| nexus | `.claude/agents/nexus.md` |
| nvda-addon-specialist | `.claude/agents/nvda-addon-specialist.md` |
| office-scan-config | `.claude/agents/office-scan-config.md` |
| pdf-accessibility | `.claude/agents/pdf-accessibility.md` |
| pdf-scan-config | `.claude/agents/pdf-scan-config.md` |
| powerpoint-accessibility | `.claude/agents/powerpoint-accessibility.md` |
| pr-review | `.claude/agents/pr-review.md` |
| python-specialist | `.claude/agents/python-specialist.md` |
| repo-admin | `.claude/agents/repo-admin.md` |
| repo-manager | `.claude/agents/repo-manager.md` |
| scanner-bridge | `.claude/agents/scanner-bridge.md` |
| tables-data-specialist | `.claude/agents/tables-data-specialist.md` |
| team-manager | `.claude/agents/team-manager.md` |
| template-builder | `.claude/agents/template-builder.md` |
| testing-coach | `.claude/agents/testing-coach.md` |
| text-quality-reviewer | `.claude/agents/text-quality-reviewer.md` |
| wcag-guide | `.claude/agents/wcag-guide.md` |
| web-accessibility-wizard | `.claude/agents/web-accessibility-wizard.md` |
| web-csv-reporter | `.claude/agents/web-csv-reporter.md` |
| web-issue-fixer | `.claude/agents/web-issue-fixer.md` |
| word-accessibility | `.claude/agents/word-accessibility.md` |
| wxpython-specialist | `.claude/agents/wxpython-specialist.md` |

#### GitHub Copilot Agents (57 files in `.github/agents/`)

Same 57 agents as `.github/agents/{name}.agent.md` format (no YAML frontmatter).

#### Gemini Skills (57 skill folders in `.gemini/extensions/a11y-agents/skills/`)

Same 57 agents as `.gemini/extensions/a11y-agents/skills/{name}/SKILL.md` format.

#### Codex CLI

Single configuration file: `.codex/AGENTS.md`

### Infrastructure Files

| File | Purpose |
|------|---------|
| `.github/copilot-instructions.md` | Workspace accessibility instructions |
| `.github/copilot-review-instructions.md` | PR review accessibility rules |
| `.github/copilot-commit-message-instructions.md` | Commit message accessibility guidance |
| `.github/PULL_REQUEST_TEMPLATE.md` | PR template with accessibility and citation checklists |
| `.github/agents/AGENTS.md` | Agent Teams coordination config with cross-cutting standards |
| `.github/agents/shared-instructions.md` | Shared behavioral rules (citation policy, currency, reliability) |
| `.github/agents/CITATION_POLICY.md` | Source citation authority hierarchy and rules |
| `.github/agents/SOURCE_REGISTRY.json` | Machine-readable source fingerprints (20 sources) |
| `.github/workflows/a11y-check.yml` | CI workflow for a11y checks |
| `.github/workflows/source-currency-check.yml` | Weekly source currency verification |
| `.github/scripts/a11y-lint.mjs` | HTML/JSX accessibility linter |
| `.github/scripts/office-a11y-scan.mjs` | Office document scanner for CI |
| `.github/scripts/pdf-a11y-scan.mjs` | PDF document scanner for CI |
| `.github/scripts/check_source_currency.py` | Source currency verification script |
| `.github/instructions/*.instructions.md` | 6 workspace instruction files |
| `.vscode/extensions.json` | Recommended VS Code extensions |
| `.vscode/settings.json` | VS Code accessibility settings |
| `.vscode/tasks.json` | A11y check tasks |
| `.vscode/mcp.json` | MCP server configuration for Copilot |
| `.gemini/GEMINI.md` | Gemini root configuration |
| `.gemini/gemini-extension.json` | Gemini extension manifest |
| `CLAUDE.md` | Claude Code root configuration |
| `GEMINI.md` | Gemini initialization instructions |
| `.codex/AGENTS.md` | Codex CLI agent configuration |
| `.a11y-agent-manifest` | Master inventory of all managed files |
| `desktop-extension/manifest.json` | Claude Desktop extension manifest |
| `desktop-extension/package.json` | Node.js package configuration |
| `desktop-extension/server/index.js` | MCP server (11 tools, 6 prompts) |

### Distribution Files

| File | Purpose |
|------|---------|
| `install.sh` | macOS/Linux installer |
| `install.ps1` | Windows installer |
| `uninstall.sh` | macOS/Linux uninstaller |
| `uninstall.ps1` | Windows uninstaller |
| `update.sh` | macOS/Linux updater |
| `update.ps1` | Windows updater |

### Prompts Files (60 prompt files in `.github/prompts/`)

All 60 prompts listed in the Custom Prompts section above, stored as `.github/prompts/{name}.prompt.md`.

### Skills Files (17 skill folders in `.github/skills/`)

All 17 skills listed in the Reusable Skills section above, stored as `.github/skills/{name}/SKILL.md`.

### Documentation Files

| Directory/File | Contents |
|---------------|----------|
| `docs/agents/` | 57 agent deep-dive pages + hub README |
| `docs/tools/` | MCP tools reference, axe-core guide, VPAT guide, Lighthouse integration, GitHub Scanner integration |
| `docs/scanning/` | Office scanning, PDF scanning, config, custom prompts |
| `docs/skills/` | Skill documentation |
| `docs/prompts/` | Prompt documentation |
| `docs/advanced/` | Cross-platform handoff, advanced scanning, plugin packaging, platform references |
| `docs/AGENT-ECOSYSTEM-PLAN.md` | Agent ecosystem expansion plan |
| `docs/RESEARCH-SOURCES.md` | Research source documentation |
| `docs/getting-started.md` | Installation guide for all platforms |
| `docs/configuration.md` | Character budget, scan configuration, troubleshooting |
| `docs/architecture.md` | Project structure, design philosophy |
| `docs/hooks-guide.md` | Hooks and lifecycle guide |

### Config Templates

| File | Purpose |
|------|--------|
| `templates/a11y-office-config-strict.json` | Office strict profile |
| `templates/a11y-office-config-moderate.json` | Office moderate profile |
| `templates/a11y-office-config-minimal.json` | Office minimal profile |
| `templates/a11y-pdf-config-strict.json` | PDF strict profile |
| `templates/a11y-pdf-config-moderate.json` | PDF moderate profile |
| `templates/a11y-pdf-config-minimal.json` | PDF minimal profile |
| `templates/a11y-web-config-moderate.json` | Web moderate profile |

### Example Project

| File | Purpose |
|------|---------|
| `example/index.html` | Web page with 20+ intentional accessibility violations |
| `example/styles.css` | CSS with contrast failures and missing prefers-* queries |
| `example/README.md` | Example project documentation |

---

## Future Roadmap

The following table lists planned features by priority.

| Priority | Feature | Description | Status |
|----------|---------|-------------|--------|
| High | Anthropic Connectors Directory listing | Automatic updates for Claude Desktop users | Pending |
| High | veraPDF integration | Full PDF/UA validation via veraPDF CLI for comprehensive PDF checking | Planned |
| High | Populate SOURCE_REGISTRY.json hashes | Run first currency check to establish SHA-256 baselines | Next |
| Medium | Document remediation tools | MCP tools that fix issues, not just detect them | Planned |
| Medium | EPUB MCP scanning tools | Native EPUB parsing and scanning (matching Office/PDF tool pattern) | Planned |
| Medium | Markdown MCP scanning tools | Native markdown parsing for CI integration | Planned |
| Medium | Create GitHub labels for currency workflow | `source-update`, `source-broken`, `agent-review-needed`, `urgent` | Next |
| Low | WCAG AAA agent | Dedicated AAA-level conformance checking | Planned |
| Low | Multi-language support | Non-English documentation and agent instructions | Planned |

Items completed since v2.0:

- Gemini platform support (57 skills)
- Codex CLI platform support (AGENTS.md)
- Source Citation Policy and Currency Automation
- EPUB accessibility agents
- Markdown accessibility pipeline (4 agents)
- Cognitive accessibility agent
- Design system auditor
- Mobile accessibility agent
- Desktop accessibility agents (specialist + testing coach)
- NVDA addon specialist
- wxPython specialist
- Python specialist
- Text quality reviewer
- Infrastructure agents (nexus, developer-hub)
- CSV export reporters (3)
- CI scanner bridges (lighthouse-bridge, scanner-bridge)
- 32 additional GitHub workflow prompts
- 8 additional reusable skills
- 6 workspace instruction files
- Shared instructions with citation policy

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| AI model ignores agent instructions | Accessibility issues slip through | Agent-based enforcement (Claude Code), workspace instructions (Copilot), multiple specialist layers, shared-instructions.md for behavioral rules |
| Agent guidance becomes stale | Outdated recommendations based on old specs | Source citation policy requires inline links; weekly currency automation detects spec changes; SOURCE_REGISTRY.json tracks 20 authoritative sources |
| Agent fabricates sources | False confidence in incorrect guidance | Citation policy tier system; currency checks verify URLs resolve; PR template enforces citation review |
| PDF parsing limitations | Missed issues in complex PDFs | Document limitations clearly; recommend veraPDF for production audits; three-layer rule system catches structural issues |
| Office XML format changes | Scanning breaks on new Office versions | XML parsing is namespace-aware; tag names are stable across versions |
| Agent context window limits | Character budget exceeded with many agents | Configurable `SLASH_COMMAND_TOOL_CHAR_BUDGET`; documented in troubleshooting |
| Config file conflicts (team vs individual) | Inconsistent scan results | Upward directory search enables per-directory overrides; preset profiles provide team defaults |
| External dependency (axe-core) | `run_axe_scan` fails if not installed | All other tools work without external dependencies; error message guides installation |
| Cross-platform parity drift | Agents diverge across Claude/Copilot/Gemini/Codex | .a11y-agent-manifest tracks all files; developer-hub agent assists with cross-platform checks |
| Source currency false positives | Noisy issues from minor page formatting changes | SHA-256 tracks full content changes; check frequency (weekly/monthly/quarterly) reduces noise for stable sources |

---

## Appendix: Quantitative Summary

| Metric | Count |
|--------|-------|
| Total unique agents | 57 |
| Web accessibility agents | 13 |
| Document accessibility agents | 7 |
| Markdown accessibility agents | 1 |
| EPUB accessibility agents | 2 |
| Specialized domain agents | 5 |
| AT and development specialists | 5 |
| GitHub workflow agents | 11 |
| Hidden helper sub-agents | 11 |
| Infrastructure agents | 2 |
| Agent file instances | ~230 (57 agents x 4 platforms + docs) |
| Custom prompts | 60 (11 document + 6 web + 5 markdown + 32 GitHub workflow + 6 developer tools) |
| Reusable skills | 17 |
| Instruction files | 6 |
| Agent teams | 6 (Document, Web, Markdown, Full, GitHub Workflow, Developer Tools) |
| MCP tools | 11 (7 web + 4 document) |
| MCP prompts | 6 |
| Office document rules | 46 (16 DOCX + 14 XLSX + 16 PPTX) |
| PDF document rules | 56 (30 PDFUA + 22 PDFBP + 4 PDFQ) |
| Source registry entries | 20 (authoritative URLs monitored) |
| CI scripts | 3 (a11y scanning) + 1 (source currency) |
| CI workflows | 2 (a11y-check + source-currency-check) |
| Config template profiles | 7 (3 office + 3 PDF + 1 web) |
| Supported AI platforms | 5 (Claude Code, GitHub Copilot, Gemini, Codex CLI, Claude Desktop) |
| External runtime dependencies | 2 (`@modelcontextprotocol/sdk`, `zod`) |
| Optional external dependencies | 1 (`@axe-core/cli`) |
| WCAG criteria covered (VPAT) | 50 (30 Level A + 20 Level AA) |
| Installer scripts | 6 (install, uninstall, update x 2 platforms) |
| Documentation pages | 70+ (in `docs/` directory) |
| Total project files | ~400 |
