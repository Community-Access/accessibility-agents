# Changelog

All notable changes to the Accessibility Agents project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.10.0] - 2026-03-24

### Added

#### Enhanced Agent Validator (`scripts/validate-agents.js`)

- **Official tool alias table validation** — Tool names are now validated against the official GitHub Copilot custom-agents configuration reference. Covers all canonical tools (`execute`, `read`, `edit`, `search`, `agent`, `web`, `todo`) and their documented aliases (`shell`/`bash`/`powershell` → `execute`, `grep`/`glob` → `search`, `task` → `agent`, etc.)
- **VS Code qualified tool validation** — Validates `toolSet/toolName` patterns (`edit/createFile`, `search/codebase`, `execute/runInTerminal`, `web/fetch`, etc.) against the complete VS Code built-in tool list
- **MCP namespace pattern validation** — Validates `<server>/*` and `<server>/<tool>` patterns, flags unknown MCP server namespaces with info-level messages
- **Frontmatter property validation** — All YAML frontmatter keys are validated against the official schema (`name`, `description`, `tools`, `model`, `target`, `user-invocable`, `disable-model-invocation`, `handoffs`, `agents`, `hooks`, `mcp-servers`, `metadata`, `argument-hint`). Unknown properties are flagged.
- **Deprecated property detection** — `infer:` flagged with migration guidance to `user-invocable` + `disable-model-invocation`
- **`target` value validation** — Validates against `vscode` and `github-copilot`
- **Boolean property validation** — Ensures `user-invocable`, `disable-model-invocation`, and `infer` are `true` or `false`
- **Conflicting property detection** — Warns when `infer` coexists with its replacement properties
- **Prompt body size check** — Warns when prompt body exceeds 30,000 chars (GitHub.com coding agent limit); skipped for `target: vscode` agents
- **Duplicate tool detection** — Flags duplicate entries in tools lists
- **Claude Code tool validation** — Validates Claude agents' tools including `MCP(...)` wrapper syntax and `GitHub` built-in tool
- **Claude Code plugin agents** — Now scans `claude-code-plugin/agents/` in addition to `.claude/agents/`
- **`--strict` flag** — Treats warnings as errors (exit code 1 on any warning). Used by pre-commit hook and CI.
- **`--quiet` flag** — Suppresses warnings and info, shows only errors
- **`--files` flag** — Validates specific files only (for pre-commit hooks), avoids scanning all 265+ files on every commit

#### Pre-commit Hook

- **`scripts/pre-commit`** — Git pre-commit hook that validates only staged agent/skill files before allowing commit. Runs in `--strict` mode to block commits with validation warnings. Bypass with `git commit --no-verify`.
- **`scripts/install-hooks.js`** — Cross-platform hook installer. Backs up any existing pre-commit hook before installing. Run `node scripts/install-hooks.js` after cloning.

#### CI/CD

- **Strict CI validation** — `validate-agents.yml` workflow now runs with `--strict` flag
- **Extended trigger paths** — CI workflow now triggers on `claude-code-plugin/agents/**` changes

#### Installer improvements

- **MCP server dependency installation** — `install.ps1` and `install.sh` now auto-install MCP server npm dependencies when Node.js is available
- **`update.ps1` / `update.sh`** — Updated with MCP dependency handling

#### Documentation

- **MCP Server setup guide** — Added setup instructions, tool reference table, and troubleshooting to `docs/getting-started.md`

### Fixed

- **`user-invokable` → `user-invocable`** — Fixed typo in 16 agent files (property name and description text) that caused the property to be silently ignored by Copilot
- **Removed deprecated `infer: true`** — Removed from 16 agent files. The default behavior (`user-invocable: true`, `disable-model-invocation: false`) is equivalent to `infer: true`, so no behavioral change.
- **Duplicate `search` tool in `repo-manager`** — Removed duplicate entry from tools list
- **Oversized prompt bodies** — Added `target: vscode` to 5 agents (`document-accessibility-wizard`, `daily-briefing`, `issue-tracker`, `pr-review`, `web-accessibility-wizard`) whose prompt bodies exceed GitHub.com's 30,000 character limit. These agents are designed for VS Code and use large inlined skill content.
- **Broken links** — Repaired broken URLs and hardened verification (from v4.0.0 follow-up)

## [4.0.0] - 2026-03-22

### Added

#### New Agents

- **CI accessibility agent** (`ci-accessibility.agent.md`) — Conversational agent for CI/CD accessibility pipeline setup with 5-phase workflow: detection, configuration, baseline management, PR annotation, and monitoring. Supports GitHub Actions, Azure DevOps, GitLab CI, CircleCI, and Jenkins. Includes SARIF integration and threshold configuration.
- **Screen reader lab agent** (`screen-reader-lab.agent.md`) — Interactive screen reader simulation for education and debugging. 4 simulation modes: reading order traversal, tab/focus navigation, heading navigation, and form navigation. Includes accessible name computation algorithm walkthrough.
- **WCAG 3.0 preview agent** (`wcag3-preview.agent.md`) — Educational agent for WCAG 3.0 Working Draft changes. Covers APCA contrast algorithm, new conformance model (Bronze/Silver/Gold vs A/AA/AAA), outcome-based testing, and delta analysis mode for existing audit reports. Includes critical disclaimer about draft status.
- **WCAG AAA agent** (`wcag-aaa.agent.md`) — Dedicated agent for AAA-level conformance checking beyond the standard AA target. Complete AAA criteria reference tables organized by WCAG principle (Perceivable: 8, Operable: 12, Understandable: 8 criteria). Prerequisite AA compliance check before AAA analysis.
- **i18n/RTL accessibility agent** (`i18n-accessibility.agent.md`) — Internationalization accessibility auditing. 5 audit areas: document language, text direction, bidirectional text, RTL layout patterns, and form direction. BCP 47 tag reference table. Covers WCAG 3.1.1/3.1.2.
- **PDF remediator agent** (`pdf-remediator.agent.md`) — Extends PDF audit with programmatic fixes. Auto-fixable table (8 issues via pdf-lib/qpdf/ghostscript) and manual-fix table (6 issues requiring Acrobat Pro). Generates shell scripts for batch remediation and step-by-step Acrobat instructions.
- **Email accessibility agent** (`email-accessibility.agent.md`) — HTML email accessibility under email client rendering constraints. Covers table-based layout, inline styles, image fallbacks, bulletproof buttons, dark mode, MJML/Foundation patterns, and screen reader compatibility across Outlook/Gmail/Apple Mail.
- **Media accessibility agent** (`media-accessibility.agent.md`) — Video and audio accessibility auditing. Covers captions (WebVTT/SRT/TTML), audio descriptions, transcripts, media player ARIA patterns, and WCAG 1.2.x compliance.
- **Web component specialist agent** (`web-component-specialist.agent.md`) — Shadow DOM and custom element accessibility. Covers ElementInternals, cross-shadow ARIA delegation, form-associated custom elements, focus delegation, and slot-based content projection.
- **Compliance mapping agent** (`compliance-mapping.agent.md`) — Maps audit results to legal frameworks including Section 508, EN 301 549, EAA, ADA, and AODA. Generates VPAT 2.5 reports in INT, EU, and WCAG editions.
- **Data visualization accessibility agent** (`data-visualization-accessibility.agent.md`) — Chart, graph, and dashboard accessibility. Covers SVG ARIA, data table alternatives, color-safe palettes, keyboard interaction patterns, and charting library APIs (Highcharts, Chart.js, D3, Recharts).
- **Performance accessibility agent** (`performance-accessibility.agent.md`) — Intersection of web performance and accessibility. Covers lazy loading impact, skeleton screens, CLS effects on assistive technology, code splitting, and progressive enhancement patterns.
- **Accessibility statement generator** (`accessibility-statement.agent.md`) — Generates W3C or EU model accessibility statements from audit results. Includes conformance claims, known limitations, feedback mechanism, and enforcement procedure sections.
- **Accessibility regression detector** (`accessibility-regression-detector.agent.md`) — Detects regressions by comparing audit results across commits or branches. Tracks score trends, classifies issues as new/fixed/persistent/regressed, and integrates with CI pipelines.
- **Office remediator agent** (`office-remediator.agent.md`) — Programmatic Office document (Word/Excel/PowerPoint) remediation via python-docx, openpyxl, and python-pptx. Auto-fixable and manual-fix tables for each format, Python script generation, PowerShell COM automation alternative, and 4-phase remediation process.
- **Projects manager agent** (`projects-manager.agent.md`) — GitHub Projects v2 management with full board, view, custom field, and iteration support. Screen reader-accessible output with structured tables and ARIA-friendly formatting.
- **Actions manager agent** (`actions-manager.agent.md`) — GitHub Actions workflow run management including logs, re-runs, artifact downloads, and CI debugging. Structured output optimized for assistive technology consumption.
- **Security dashboard agent** (`security-dashboard.agent.md`) — Dependabot, code scanning, and secret scanning alert triage. Priority-scored vulnerability tables with screen reader-friendly severity indicators.
- **Release manager agent** (`release-manager.agent.md`) — Release lifecycle management including tags, assets, and release note generation. Accessible changelog formatting with proper heading hierarchy.
- **Notifications manager agent** (`notifications-manager.agent.md`) — GitHub notification inbox management with filtering, bulk operations, and subscription control. Structured notification summaries designed for screen reader navigation.
- **Wiki manager agent** (`wiki-manager.agent.md`) — Wiki page creation, editing, search, and organization. Enforces accessible markdown patterns in wiki content with heading structure validation.

#### New MCP Tools

- **`fix_document_metadata`** — Fix title, language, or author in Office document metadata by generating PowerShell/Bash scripts for OOXML manipulation
- **`fix_document_headings`** — Analyze and report heading structure issues in .docx files by parsing document.xml heading styles
- **`check_audit_cache`** — Check `.a11y-cache.json` for changed, new, and unchanged files using size+mtime hash comparison
- **`update_audit_cache`** — Write scan results (hash, findings count, timestamp) to `.a11y-cache.json` for incremental scanning

#### New Skills

- **CI integration skill** (`ci-integration/SKILL.md`) — axe-core CLI reference, WCAG 2.2 tag set, baseline file schema, comparison logic, CI/CD templates for GitHub Actions/Azure DevOps/GitLab CI, SARIF integration, gating strategies, severity mapping
- **Testing strategy skill** (`testing-strategy/SKILL.md`) — Automated vs manual testing coverage matrix, browser+AT compatibility reference, regression detection patterns, acceptance criteria templates for accessibility testing
- **Legal compliance mapping skill** (`legal-compliance-mapping/SKILL.md`) — Section 508, ADA, EN 301 549, EAA, AODA framework mapping tables, VPAT 2.5 edition differences (INT/EU/WCAG), non-WCAG legal requirements reference
- **Email accessibility skill** (`email-accessibility/SKILL.md`) — Email client rendering constraints reference, table-based layout patterns, bulletproof button techniques, dark mode handling, MJML/Foundation template accessibility
- **Media accessibility skill** (`media-accessibility/SKILL.md`) — WebVTT/SRT/TTML caption format reference, caption quality metrics, audio description requirements, media player ARIA patterns, WCAG 1.2.x criterion mapping
- **Data visualization accessibility skill** (`data-visualization-accessibility/SKILL.md`) — Chart accessibility patterns, SVG ARIA reference, charting library accessibility APIs (Highcharts/Chart.js/D3/Recharts), color-safe palette generation, keyboard interaction models
- **Office remediation skill** (`office-remediation/SKILL.md`) — Office document OOXML manipulation patterns for accessibility remediation. Covers python-docx, openpyxl, python-pptx API references, PowerShell COM automation snippets, and direct OOXML XML manipulation.

#### New Instructions

- **CSS accessibility instruction** (`css-accessibility.instructions.md`) — Always-on instruction that fires on `*.css` and `*.scss` files. Enforces focus visibility, motion safety (`prefers-reduced-motion`), high contrast support, touch target sizing, and prevents `outline: none` without alternatives.
- **Testing accessibility instruction** (`testing-accessibility.instructions.md`) — Always-on instruction that fires on test files (`*.test.*`, `*.spec.*`). Guides test authors to include accessibility assertions (axe-core checks, keyboard navigation, ARIA state verification, screen reader announcement testing).
- **Document generation instruction** (`document-generation.instructions.md`) — Always-on instruction that fires on `*.py`, `*.js`, `*.ts`, `*.mjs`, `*.cjs` files. Catches imports of document generation libraries (python-docx, openpyxl, python-pptx, docx, pdfkit, etc.) and enforces accessibility metadata, heading structure, alt text, table headers, and language settings at the code level.

#### New Prompts

- **Component library audit prompt** (`component-library-audit.prompt.md`) — Per-component accessibility scorecard across an entire component directory. 5-phase workflow: discovery, per-component audit, scorecard generation, cross-component analysis, and report.
- **Training scenario prompt** (`training-scenario.prompt.md`) — Interactive accessibility training with 4 modes: bad examples, quizzes, WCAG criterion explanations, and before/after comparisons. Covers 10 common UI patterns.
- **Audit native app prompt** (`audit-native-app.prompt.md`) — Accessibility audit for React Native, Expo, iOS, and Android applications with platform-specific checks.
- **Web CI/CD setup prompt** (`setup-web-cicd.prompt.md`) — One-click workflow for configuring automated web accessibility scanning pipelines with axe-core, SARIF output, baseline management, and PR annotations
- **PR accessibility check prompt** (`a11y-pr-check.prompt.md`) — Analyzes pull request diffs for accessibility regressions against WCAG 2.2 AA requirements
- **Team onboarding prompt** (`onboard-team.prompt.md`) — Generates role-specific accessibility onboarding documents for developers, designers, QA engineers, product managers, and content authors
- **Email template audit prompt** (`audit-email-template.prompt.md`) — Audits HTML email templates for accessibility under email client rendering constraints including table layout, inline styles, and screen reader compatibility
- **Media content audit prompt** (`audit-media-content.prompt.md`) — Audits video and audio media for captions, audio descriptions, transcripts, and media player control accessibility
- **Accessibility dashboard prompt** (`accessibility-dashboard.prompt.md`) — Aggregates all audit reports (web, document, markdown) into a unified dashboard view with overall score, trends, and cross-format issue patterns
- **Accessibility statement generator prompt** (`generate-accessibility-statement.prompt.md`) — Generates W3C or EU model accessibility statements from audit results with conformance claims, known limitations, and feedback mechanisms
- **PDF remediator prompt** (`pdf-remediator.prompt.md`) — Guided PDF remediation with programmatic and manual fix options
- **Document conversion audit prompt** (`audit-document-conversion.prompt.md`) — Compares source Office document against exported PDF for accessibility preservation, detecting conversion losses
- **Document training prompt** (`document-training.prompt.md`) — Generates role-specific accessibility training materials for document authors, editors, designers, and managers
- **CI accessibility prompt** (`ci-accessibility.prompt.md`) — One-click workflow for CI/CD accessibility pipeline setup and configuration
- **Screen reader lab prompt** (`screen-reader-lab.prompt.md`) — Launch interactive screen reader simulation on a file
- **WCAG 3.0 preview prompt** (`wcag3-preview.prompt.md`) — Quick access to WCAG 3.0 draft education and comparison
- **WCAG AAA prompt** (`wcag-aaa.prompt.md`) — One-click AAA conformance audit beyond standard AA target
- **Scaffold NVDA addon prompt** (`scaffold-nvda-addon.prompt.md`) — Scaffold a new NVDA screen reader addon project
- **Audit desktop accessibility prompt** (`audit-desktop-a11y.prompt.md`) — Desktop application accessibility audit covering platform APIs, keyboard, and high contrast
- **Test desktop accessibility prompt** (`test-desktop-a11y.prompt.md`) — Create a desktop accessibility test plan with screen reader test cases
- **Scaffold wxPython app prompt** (`scaffold-wxpython-app.prompt.md`) — Scaffold an accessible wxPython desktop application
- **Package Python app prompt** (`package-python-app.prompt.md`) — Package a Python application for distribution
- **i18n accessibility prompt** (`i18n-accessibility.prompt.md`) — Audit internationalization and RTL accessibility
- **Web component specialist prompt** (`web-component-specialist.prompt.md`) — Audit Shadow DOM and custom element accessibility
- **Performance accessibility prompt** (`performance-accessibility.prompt.md`) — Audit performance-accessibility intersection
- **Data visualization accessibility prompt** (`data-visualization-accessibility.prompt.md`) — Audit chart and dashboard accessibility
- **Accessibility regression detector prompt** (`accessibility-regression-detector.prompt.md`) — Compare audit results across commits or branches
- **Wiki manager prompt** (`wiki-manager.prompt.md`) — Manage GitHub Wiki pages with accessibility enforcement

#### Infrastructure

- **Multi-language support guide** (`docs/guides/multi-language-support.md`) — Architecture for translating agent instructions. Locale-suffix convention, 3-tier translation priority, BCP 47 codes, translation workflow, and contributing guide.
- **Enterprise packaging** — Configurable enterprise configuration schema (`templates/enterprise-config.schema.json`) and example configuration (`templates/enterprise-config-example.json`). Supports custom WCAG targets, design token paths, issue tracker routing (GitHub/Jira/Azure DevOps/Linear), scanning profiles, report formats, and CI gating thresholds.
- **Anthropic directory manifest** (`mcp-server/anthropic-directory.json`) — Directory manifest for Claude Desktop auto-distribution. Lists all 24 tools, 3 prompts, 3 resources with stdio and HTTP transport configurations.
- **Nexus / GitHub Hub differentiation** — Nexus is now the auto-routing orchestrator (infers intent silently); GitHub Hub is the guided/menu-driven variant (presents options and lets users choose)
- **MCP Server Test Suite** — 52 tests covering all tools, prompts, and resources
  - Uses Node built-in test runner (`node --test`)
  - Tests: path validation (6), contrast (5), headings (5), links (5), forms (5), guidelines (9), createServer (2), Office scanning (2), PDF scanning (2), batch scanning (2), metadata (1), prompts (4), resources (4)
  - `npm test` script in package.json, `prepublishOnly` runs tests before publish
- **MCP Prompts** — 3 pre-built prompt templates for accessibility workflows
  - `audit-page` — Structured WCAG audit instruction with tool sequence and scoring
  - `check-component` — Component-specific review using built-in guidelines
  - `explain-wcag` — WCAG criterion explanation with examples and testing guidance
- **MCP Resources** — 3 read-only data endpoints
  - `a11y://guidelines/{component}` — Component accessibility guidelines (9 components)
  - `a11y://tools` — Auto-generated list of all registered tools
  - `a11y://config/{profile}` — Scan configuration templates (strict/moderate/minimal)
- **npm Publishability** — MCP server package is now publish-ready
  - Removed `"private": true`, added `bin`, `files`, `keywords`, `repository`, `license`
  - Shebang lines on entry points for `npx @a11y-agent-team/mcp-server` usage
  - `prepublishOnly` runs test suite before publish
  - `npm pack --dry-run` produces 23.8 KB package with 9 files
- **VS Code Extension publish readiness**
  - Fixed `engines.vscode` to match `@types/vscode` version (^1.110.0)
  - VSIX builds cleanly via `npx @vscode/vsce package` (24.33 KB)
  - TypeScript compiles with zero errors
- **Accessibility PR Gate workflow** (`.github/workflows/a11y-pr-gate.yml`)
  - Required status check that blocks PRs with accessibility violations
  - Checks: missing alt text, positive tabindex, div role=button, outline removal, missing form labels
  - Runs axe-core on changed HTML files
  - Posts summary comment on PR with pass/fail verdict and issue counts
  - Only triggers on UI file changes (HTML, JSX, TSX, Vue, Svelte, Astro, CSS)

- **Server-based MCP Server** - New `mcp-server/` directory with HTTP-based MCP server
  - Replaces the old stdio-only `desktop-extension/` with a proper server architecture
  - Supports Streamable HTTP transport (with SSE fallback) for remote clients
  - Retains stdio mode (`stdio.js`) for backward-compatible Claude Desktop `mcp.json` use
  - Stateful (sessions + SSE) and stateless (per-request, CI/CD-friendly) modes
  - 16 accessibility tools: contrast, guidelines, headings, links, forms, Office scanning, PDF scanning, metadata extraction, batch scanning, axe-core, a11y tree, keyboard navigation, contrast scanning, viewport reflow, veraPDF, PDF form conversion
  - Binds to 127.0.0.1 by default for security; configurable via environment variables
  - Health check endpoint at `/health`
- **Gemini python-development skill** - Added missing knowledge skill for Python/wxPython development reference data

#### Cross-Platform Sync

- **6 new agents synced to Claude Code** — ci-accessibility, screen-reader-lab, wcag3-preview, wcag-aaa, i18n-accessibility, pdf-remediator added to `.claude/agents/`
- **6 new agents synced to Claude Code Plugin** — Same 6 agents copied to `claude-code-plugin/agents/`
- **7 new Gemini skills** — ci-accessibility, screen-reader-lab, wcag3-preview, wcag-aaa, i18n-accessibility, pdf-remediator (agent skills) + ci-integration (knowledge skill) added to `.gemini/extensions/a11y-agents/skills/`
- **8 gap-analysis agents synced across all platforms** — email-accessibility, media-accessibility, web-component-specialist, compliance-mapping, data-visualization-accessibility, performance-accessibility, accessibility-statement, accessibility-regression-detector added to Copilot (`.github/agents/`), Claude Code (`.claude/agents/`), Plugin (`claude-code-plugin/agents/`), and Gemini (`.gemini/extensions/a11y-agents/skills/`) — 32 new files
- **6 GitHub workflow agents synced across all platforms** — projects-manager, actions-manager, security-dashboard, release-manager, notifications-manager, wiki-manager added to Copilot (`.github/agents/`), Claude Code (`.claude/agents/`), Plugin (`claude-code-plugin/agents/`), and Gemini (`.gemini/extensions/a11y-agents/skills/`) — 24 new files
- **5 new knowledge skills synced to Gemini** — testing-strategy, legal-compliance-mapping, email-accessibility, media-accessibility, data-visualization-accessibility added as Gemini extension skills
- **Office remediator synced across all platforms** — office-remediator added to Copilot (`.github/agents/`), Claude Code (`.claude/agents/`), Plugin (`claude-code-plugin/agents/`), and Gemini (`.gemini/extensions/a11y-agents/skills/`) — 4 new files
- **Office remediation knowledge skill synced to Gemini** — office-remediation added as Gemini extension skill

#### Documentation

- **Comprehensive User Guide** (`docs/USER_GUIDE.md`) — Instructor-style ecosystem guide covering all 80 agents, 25 skills, 134 prompts, 9 instructions, and 24 MCP tools. Collapsible per-platform sections for GitHub Copilot, Claude Code, Gemini, Codex, and Claude Desktop. Includes team overviews, exhaustive agent reference with sample prompts, skill catalog, prompt directory, MCP server interaction guide, file-based workflows, common workflow recipes, platform comparison, troubleshooting, and glossary.
- **6 GitHub workflow agent documentation pages** — projects-manager, actions-manager, security-dashboard, release-manager, notifications-manager, wiki-manager added to `docs/agents/` with feature descriptions, usage examples, and API scope requirements
- **4 new agent documentation pages** — office-remediator, pdf-remediator, compliance-mapping, accessibility-statement added to `docs/agents/`
- **1 new skill documentation page** — office-remediation added to `docs/skills/`
- **3 new prompt documentation pages** — pdf-remediator, audit-document-conversion, document-training added to `docs/prompts/documents/`
- **Platform parity check script** (`scripts/check-platform-parity.js`) — Automated script that verifies all agents exist on all 4 platforms (Copilot, Claude Code, Plugin, Gemini) and reports missing entries
- **12 new agent documentation pages** — ci-accessibility, screen-reader-lab, wcag3-preview, wcag-aaa, nexus, i18n-accessibility, web-component-specialist, performance-accessibility, data-visualization-accessibility, email-accessibility, media-accessibility, accessibility-regression-detector added to `docs/agents/`

#### Metadata Sync

- **Comprehensive count updates across 20+ project files** — Updated agent count (80), skill count (25), prompt count (134), instruction count (9), MCP tool count (24), and Gemini skill count (98) across: AGENTS.md, CLAUDE.md, GEMINI.md, copilot-instructions.md, plugin.yaml, manifest.json, prd.md, MARKETPLACE_SUBMISSION.md, install.sh, docs/getting-started.md, docs/architecture.md, docs/guides/agent-debug-panel.md, docs/advanced/plugin-packaging.md, docs/skills/github-workflow-standards.md, mcp-server/package.json, mcp-server/server.js, mcp-server/anthropic-directory.json, .claude-plugin/marketplace.json, .claude-plugin/plugin.json, claude-code-plugin/README.md, docs/USER_GUIDE.md, vscode-extension/README.md

### Fixed

- **`fix_document_headings` MCP tool** — Was reading raw .docx bytes as UTF-8 string, which fails because .docx files are ZIP archives. Fixed to use `parseZipCd()` + `getZipXml()` to properly extract `word/document.xml` from the OOXML ZIP archive before regex matching.
- **MCP server test suite** — Added 4 missing tools (`fix_document_metadata`, `fix_document_headings`, `check_audit_cache`, `update_audit_cache`) to the `registers all expected tools` test. All 52 tests pass.
- **Markdownlint compliance** — Full markdownlint pass across all markdown files in the repository, fixing heading levels, list formatting, and trailing whitespace.
- **MCP server dependency installation** — MCP server dependencies are now installed automatically during setup, preventing missing-module errors on first run.
- **Installer manifest initialization** — Fixed `install.sh` to initialize the manifest helper function before the Codex install path, preventing undefined-function errors.
- **wxPython `SetName()` misuse** — Replaced incorrect `SetName()` calls on wxPython controls with `StaticText` labels for proper NVDA and VoiceOver screen reader announcement.
- **USER_GUIDE completeness** — Fixed coverage gaps in `docs/USER_GUIDE.md` — added missing `office-remediator` agent entry, `css-accessibility` and `document-generation` instructions, `office-remediation` skill, and 17 prompts not listed in any prompt table.
- **Stale counts and team members** — Fixed outdated agent/tool counts and added missing team member entries across multiple documentation files. Expanded `.gitignore` for common editor and OS artifacts.

### Removed

- **Desktop Extension** - Previous `desktop-extension/` folder and `.vscode/mcp.json` replaced by `mcp-server/`

### Added

#### GitHub Copilot CLI Support

- **`--cli` installer flag** for both `install.sh` and `install.ps1`
  - Copies agents to `~/.copilot/agents/` for global CLI access
  - Copies skills to `~/.copilot/skills/` for global CLI access
  - Project install (`--project --cli`) uses `.github/agents/` which CLI reads directly
- **Copilot CLI Setup documentation** in `docs/getting-started.md`
  - Discovery path reference (repository, user, organization)
  - Installation options (global vs project)
  - Tool compatibility notes
- **CLI Troubleshooting Guide** at `docs/guides/copilot-cli-troubleshooting.md`
  - Agents not appearing in `/agent` picker
  - Skills not loading
  - Tool name compatibility
  - Platform-specific issues
- **Tool Alias Reference** in `docs/configuration.md`
  - Cross-platform tool name mappings (CLI vs Claude Code vs VS Code)
  - Which properties CLI ignores (`argument-hint`, `handoffs`, `model` arrays)
- **Cross-Platform Tool Mapping Guide** at `docs/cross-platform-tool-mapping.md`
  - Canonical tool names per platform (Claude Code, Copilot CLI, VS Code, Codex, Gemini)
  - Migration checklist for normalizing agent files
  - Validation commands for checking tool name consistency
- Fixed missing YAML frontmatter in `playwright-testing` skill SKILL.md

#### Repository Modernization (AgentRC Compliance)

- **`AGENTS.md`** - AI agent guidance file for repository
  - Documents all 59 agents, team structure, conventions
  - Required by AgentRC readiness framework
- **`.github/dependabot.yml`** - Automated dependency updates
  - GitHub Actions workflows (monthly)
  - npm packages in desktop-extension, vscode-extension (weekly)
  - pip packages in scripts directory (weekly)
- **`scripts/validate-agents.js`** - Agent/skill validation script
  - Validates YAML frontmatter in all agent files
  - Checks tool name CLI compatibility
  - Verifies skill SKILL.md format
  - Exit code 1 on errors, 0 on warnings-only
- **`.github/workflows/validate-agents.yml`** - CI validation workflow
  - Runs on PRs and pushes affecting agent/skill files
  - Ensures tool name compatibility across platforms

#### Agent Enhancements

- **testing-coach** - Added modern Playwright patterns
  - Violation fingerprinting for handling known issues (from Playwright docs)
  - Complete WCAG 2.2 tag set for axe-core (`wcag22aa`)
  - WCAG 2.2-specific rules coverage (Target Size 2.5.8, Focus Not Obscured 2.4.11)
- **playwright-scanner** - Added advanced scanning patterns
  - Component-level scanning with `AxeBuilder.include()`
  - WCAG 2.2 new criteria detection (Focus Not Obscured)
- **aria-specialist** - Added WAI-ARIA 1.3 draft reference for upcoming features

### Changed

- **Normalized all 59 Copilot agent tool declarations** to use CLI-compatible names:
  - `readFile` → `read`
  - `editFiles` → `edit`
  - `textSearch` / `fileSearch` → `search`
  - `runSubagent` → `agent`
  - Affected: All agents in `.github/agents/` including GitHub workflow agents (analytics, contributions-hub, daily-briefing, github-hub, insiders-a11y-tracker, issue-tracker, lighthouse-bridge, nexus, pr-review, repo-admin, repo-manager, scanner-bridge, team-manager, template-builder)

#### VS Code 1.112 Platform Feature Support

- **Monorepo customization discovery** documentation in `docs/advanced/advanced-scanning-patterns.md`
  - `chat.useCustomizationsInParentRepositories` setting guidance
  - Example monorepo structures and recommended setup
- **Agent debugging enhancements** in `docs/guides/agent-debug-panel.md`
  - `/troubleshoot` skill documentation
  - Export/import sessions as JSONL
  - Agent Flow Chart visualization
  - Summary view and attach debug events
- **Integrated browser testing** in testing-coach agents
  - `editor-browser` debug type for zoom/reflow testing
  - launch.json configuration examples
  - WCAG 1.4.4/1.4.10 testing workflows
- **Native image analysis** in alt-text-headings agents
  - `chat.imageSupport.enabled` workflow
  - Analyze actual images to suggest accurate alt text
- **Permission level guidance** in `docs/configuration.md`
  - Autopilot, Bypass Approvals, Default modes
  - Recommendations for read-only vs. fix-applying workflows

### Changed

- Updated `insiders-a11y-tracker` agents (Copilot + Claude Code) with VS Code 1.112 features section
- Added VS Code 1.112 features overview to CLAUDE.md, .github/copilot-instructions.md, and GEMINI.md

#### CI & Dependencies

- **actions/checkout** — Bumped from v4 to v6
- **actions/github-script** — Bumped from v7 to v8
- **peter-evans/create-pull-request** — Bumped from v7 to v8
- **actions/setup-node** — Bumped from v4 to v6
- **actions/setup-python** — Bumped from v4 to v6
- **@types/node** — Bumped from 25.3.3 to 25.5.0 (vscode-extension)
- **@types/vscode** — Bumped from 1.109.0 to 1.110.0 (vscode-extension)
- Removed leftover lint process artifacts from repository

## [3.2.0] - 2026-03-13

### Added

#### Playwright Integration (MCP Tools)

- **5 new Playwright-based accessibility scanning tools** for Claude Desktop MCP extension
  - `keyboard_scan` - Automated keyboard navigation testing
  - `state_scan` - ARIA state and property validation
  - `viewport_scan` - Responsive layout accessibility checks
  - `contrast_scan` - Automated color contrast analysis
  - `a11y_tree` - Accessibility tree inspection
- `playwright-tools.js` external module with graceful degradation when Playwright is not installed
- URL validation (http/https only) and CSS selector sanitization for security

#### Playwright Agent Ecosystem

- **playwright-scanner** agent (Copilot + Claude Code) - Orchestrates Playwright-based scanning
- **playwright-verifier** agent (Copilot + Claude Code) - Verifies fixes against live pages
- **playwright-testing** skill - Patterns and examples for Playwright accessibility testing
- Integration docs and cross-platform handoff updates

#### veraPDF PDF/UA Validator

- `verapdf-tools.js` MCP tool with Matterhorn Protocol severity mapping
- Uses `execFile` (not `exec`) for command injection prevention
- Path validation with symlink resolution and 500MB file size limit

#### PDF Form-to-HTML Converter

- `pdf-form-tools.js` using pdf-lib (pure JS, MIT licensed)
- XSS prevention via `escapeHtml` on all dynamic values
- Accessible HTML5 output with labels, fieldsets, ARIA attributes, and focus styles

#### Test Generation

- `generate-a11y-tests` prompt for CI pipeline scaffolding
- GitHub Actions template for Playwright accessibility tests (`docs/templates/a11y-tests-ci.md`)

#### askQuestions Integration (all 59 agents)

- Fixed 31 Claude Code agents: `ask_questions` renamed to `askQuestions` (camelCase)
- Added `askQuestions` to 10 agent tool lists
- Added domain-specific `askQuestions` body instructions to 39 agents
- `shared-instructions.md`: comprehensive `askQuestions` section for 12 GitHub agents
- Hub agents (developer-hub, github-hub, nexus): `askQuestions` principles and examples

#### Wizard and Fixer Integration

- web-accessibility-wizard Playwright phase integration
- web-issue-fixer and cross-page-analyzer Playwright support
- Severity scoring updates for Playwright findings

### Changed

- Agent count: 57 to 59 (added playwright-scanner and playwright-verifier)
- Prompt count: 104 to 106
- Skill count: 17 to 18 (added playwright-testing)
- All version numbers bumped to 3.2.0

### Fixed (v3.0.0 to v3.2.0)

- Plugin distribution drift fixed with symlinks for docs, templates, and example directories (PR #57)
- Added `.gitattributes` for Windows symlink compatibility
- Added Windows clone instructions (`git clone -c core.symlinks=true`) to CONTRIBUTING.md
- NVDA addon specialist: version alignment to 2025.1.0, table introductions, source citations (PR #62)
- Codex CLI: experimental multi-agent TOML roles support (PR #59)
- Gemini CLI hooks: five lifecycle hook scripts added
- Broken URLs and Deque help links migrated to Accessibility Insights

## [3.0.0] - 2026-03-05

### Added

#### Phase 1A: Context Compaction Guidance (2.5h) - Completed March 7, 2026

- **Context Management Guide** - New guide for managing long accessibility audits
  - Added `docs/guides/context-management.md` with `/compact` command best practices
  - Guidance for web audits, document audits, and markdown audits
  - Example summaries by audit type with severity breakdown templates
  - When-to-compact rules: 7+ turns, large file counts, accumulated findings

- **Agent Context Nudges** - Three orchestrator agents now guide users to `/compact` when needed
  - `web-accessibility-wizard` - After Phase 6, suggest compaction if 6+ turns
  - `document-accessibility-wizard` - After Phase 4, suggest compaction if 3+ documents processed
  - `markdown-a11y-assistant` - After Phase 2, suggest compaction if 20+ files reviewed

#### Phase 1B: Source Citation Policy & Currency Automation (15h) - Completed March 14, 2026

- **Authoritative Sources Citations** - All 114 agents now cite official W3C, vendor, and platform documentation
  - 57 GitHub Copilot agents (`.github/agents/*.agent.md`) cite WCAG 2.2, ARIA 1.2, axe-core, platform APIs, and vendor docs
  - 57 Claude Code agents (`claude-code-plugin/agents/*.md`) cite the same authoritative sources
  - Sources organized by domain: web (WCAG/ARIA), documents (PDF/UA, Office, EPUB), markdown (CommonMark), GitHub (REST/GraphQL API), developer tools (Python, wxPython, platform accessibility APIs)
  
- **Citation Policy Framework** - Infrastructure for source validation and authority hierarchy
  - 6-tier authority hierarchy: Normative specs (Tier 1) → Community consensus (Tier 6)
  - Tier 1 (Normative): W3C specifications (WCAG 2.2, ARIA 1.2, HTML Living Standard)
  - Tier 2 (Informative): Understanding WCAG, ARIA APG
  - Tier 3 (Vendor): Microsoft Learn, Apple Developer, wxPython Docs
  - Tier 4 (AT): NVDA, JAWS, VoiceOver documentation
  - Tier 5 (Community): Deque University, WebAIM, Adrian Roselli
  - Tier 6 (Compliance): Section 508, EN 301 549

- **Automated Source Currency Verification** - GitHub Actions workflow for weekly source monitoring
  - `.github/workflows/verify-sources.yml` - Runs daily at 9 AM UTC
  - `.github/scripts/verify_sources.py` - Python script verifies 20+ authoritative source URLs
  - SHA-256 fingerprinting tracks source content changes
  - Auto-creates GitHub issues when sources change or break
  - `SOURCE_REGISTRY.json` maintains authoritative source metadata

#### Phase 1C: Agent Plugins & Plugin Packaging (3h) - Completed March 21, 2026

- **Marketplace Plugin Packaging** - Created `plugin.yaml` manifest for VS Code Marketplace (awesome-copilot registry)
  - Bundled 57 agents, 17 skills, 104 prompts, 5 workspace instructions for one-click discovery
  - All agent files include YAML frontmatter with tools, model preferences, handoffs
  - Marketplace installation guide added to README
  - Ready for immediate submission to awesome-copilot and copilot-plugins registries
  
- **Custom Skills Development Guide** - New guide for extending the agent ecosystem
  - Added `docs/guides/create-custom-skills.md` with step-by-step instructions
  - README "Extending the Platform" section with community examples
  - Agent nudges in accessibility-lead, web-accessibility-wizard, document-accessibility-wizard, developer-hub
  - Domain-specific skill examples: fintech compliance, healthcare standards, framework patterns

#### Phase 3: Agentic Browser Tools (13h) - Completed March 5, 2026

- **Browser Tool Integration** - Agents can now autonomously verify accessibility fixes in integrated browser
  - `docs/AGENTIC-BROWSER-TOOLS.md` - 14-section design guide (4500+ words)
  - `docs/BROWSER-TOOLS-TESTING.md` - 18-section testing guide with 10 playable test scenarios
  - 6 browser tool capabilities: `screenshot()`, `click()`, `type()`, `navigate()`, `evaluate()`, `inspect()`
  - 5 usage patterns: Fix Verification, Visual Verification, Interaction Testing, Failure Handling, Graceful Degradation
  - 4 failure modes with solutions: browser unavailable, page timeout, element not found, analysis fails

- **Agent Updates for Browser Verification**
  - `web-accessibility-wizard` Phase 12: Browser-Assisted Verification workflow fully documented
  - `web-issue-fixer` Post-fix screenshot capture and analysis capability
  - Cross-framework testing protocols: React, Vue, vanilla HTML
  - Performance metrics framework: capture, analysis, and reporting times

#### Phase 4: Lifecycle Hooks (7h) - Completed March 5, 2026

- **Cross-Platform Hook Implementation** - Lifecycle hooks enforce accessibility during agent sessions
  - `.github/hooks/scripts/` - 5 Python hook scripts (session-start, detect-web-project, enforce-edit-gate, mark-reviewed, session-end)
  - `.github/hooks/hooks-consolidated.json` - VS Code hook configuration (6 events)
  - `.claude/hooks/hooks-consolidated.json` - Claude Code hook configuration with matchers
  - Hook scripts work identically on Windows, macOS, Linux (Python 3.8+)

- **Hook Capabilities**
  - Session Start: Platform detection, context injection, welcome message
  - Web Project Detection: Recognize UI  work, inject accessibility reminder
  - Edit Gate Enforcement: Block UI file edits until accessibility-lead reviews (`.jsx`, `.tsx`, `.vue`, `.html`, `.css`)
  - Review Marker: Create `.github/.a11y-reviewed` marker to unlock edits after review
  - Session End: Clean up markers for next session (both `Stop` and `SessionEnd` events)

- **Hook Documentation**
  - `docs/hooks-guide.md` - Complete hooks guide with configuration, customization, security
  - `docs/guides/hooks-troubleshooting.md` - 10 common issues with solutions
  - `docs/HOOKS-CROSS-PLATFORM-STRATEGY.md` - 56-page implementation strategy (Phase 4 planning document)

- **Cross-Platform Compatibility**
  - VS Code 1.110+: 8 hook events supported (Preview feature)
  - Claude Code: 18 hook events supported (full matchers, type: prompt/agent/command)
  - Python-based scripts avoid shell/bash/PowerShell compatibility issues
  - Dual event names: `Stop` (VS Code) + `SessionEnd` (Claude Code) call same script

#### Phase 5: VS Code 1.110 High Priority Features (4h) - Completed March 5, 2026

- **Agent Debug Panel Integration** - Real-time visibility into agent behavior and three-hook enforcement
  - `docs/guides/agent-debug-panel.md` - 400+ line comprehensive troubleshooting guide
  - Debug panel references added to `docs/hooks-guide.md` for hook troubleshooting
  - Verification steps added to `docs/getting-started.md` for installation confirmation
  - Troubleshooting section added to README.md with debug panel workflows
  - Guidance for verifying 57 agents loaded, checking hook execution order, tracking tool calls

- **Session Forking Guidance** - Explore alternative approaches without losing audit work
  - `docs/guides/context-management.md` - New "Forking Sessions" section with `/fork` command usage
  - Fork suggestions added to `web-accessibility-wizard` (after Phase 6 for alternative remediation strategies)
  - Fork suggestions added to `document-accessibility-wizard` (for template vs batch fix approaches)
  - Fork suggestions added to `developer-hub` (for exploring debugging hypotheses in parallel)

- **getDiagnostics Tool Integration** - Leverage existing linting errors for smarter accessibility review
  - `accessibility-lead.agent.md` - Added `getDiagnostics` to tools list, new "Tools" section with usage guidance
  - `aria-specialist.agent.md` - Check for jsx-a11y ARIA rule violations before comprehensive review
  - `forms-specialist.agent.md` - Check for label and autocomplete linting errors before form audit
  - `keyboard-navigator.agent.md` - Check for tabindex and keyboard event linting errors before keyboard review
  - All specialist agents prioritize fixing existing diagnostics before running comprehensive reviews

- **VS Code 1.110 Feature Analysis** - Comprehensive evaluation of new capabilities
  - `docs/VS-CODE-1.110-RECOMMENDATIONS.md` - 7 features already implemented, 10+ new features identified
  - Implementation roadmap for v3.1 (quick wins) and v3.2 (research & design)
  - Feature prioritization: High (Debug Panel, Fork, getDiagnostics), Medium (usages/rename tools, notifications), Low (custom thinking phrases)

#### Phase 6: VS Code 1.110 Remaining Features (3h) - Completed March 5, 2026

- **Built-in Accessibility Skill Comparison** - Document how Accessibility Agents complement VS Code's built-in skill
  - `docs/guides/vscode-builtin-skill-comparison.md` - New comprehensive comparison guide
  - Explains layered approach: VS Code for real-time guidance, Accessibility Agents for comprehensive audits
  - Domain specialization table: 9 web specialists, 6 document specialists, 2 mobile specialists, 2 desktop specialists
  - WCAG 2.2 conformance comparison: Built-in covers 2.1 AA principles, Agents cover complete 2.2 AA SC-by-SC
  - Tool integration comparison: axe-core CLI, Lighthouse CI, GitHub A11y Scanner, Office Checker, PDF/UA validators
  - Clear "When to Use Each" guidance with example workflows

- **OS Notifications for Long-Running Audits** - Help users stay informed during lengthy operations
  - `docs/getting-started.md` - New "OS Notifications for Long-Running Audits" section with recommended settings
  - Settings documented: `chat.notifyWindowOnResponseReceived`, `chat.notifyWindowOnConfirmation`, `accessibility.signals.chatUserActionRequired`
  - Use cases: Document audits (100+ files), web wizard audits (10+ minutes), GitHub briefings, cross-page analysis
  - Accessibility benefit: Screen reader audio signals prevent missed questions during context switches
  - Step-by-step configuration instructions for VS Code users

- **AI Co-Author Attribution** - Transparency for AI contributions to accessibility code
  - `docs/getting-started.md` - New "AI Co-Author Attribution" section with recommended git settings
  - Setting documented: `git.addAICoAuthor` with options `chatAndAgent`, `all`, `never`
  - Benefits explained: Transparency, compliance with emerging standards, clear audit trail for accessibility fixes
  - Example commit with `Co-authored-by: GitHub Copilot <copilot@github.com>` trailer
  - Step-by-step configuration instructions for VS Code users

- **Inline Chat Session Continuity** - Agent context flows seamlessly into inline edits
  - `docs/guides/context-management.md` - New "Inline Chat Session Continuity" section
  - Explains VS Code 1.110+ change: Inline chat now queues into existing session instead of isolated changes
  - Accessibility benefit: Inline fixes maintain full audit context, reference previous findings automatically
  - Example workflow: Full audit → inline fixes reference WCAG violations by number and severity
  - Best practice: Complete audit first, use inline chat for all subsequent fixes in same session

- **Collapsible Terminal Tool Calls** - Reduce visual noise from command output
  - `docs/guides/context-management.md` - New "Terminal Tool Calls are Collapsible" section
  - Explains VS Code 1.110+ feature: Terminal commands appear collapsed by default
  - When to expand: Troubleshooting failed commands, verifying file lists, checking CLI output, copying for reports
  - Agents that use terminal commands: document-accessibility-wizard, web-accessibility-wizard, github-hub, developer-hub
  - Reduces chat clutter for commands with long output (file discovery, scan results, API responses)

- **Custom Thinking Phrases** - Optional fun enhancement for accessibility-themed loading text
  - `README.md` - New "Optional Customization" section with "Custom Thinking Phrases" subsection
  - Setting documented: `chat.agent.thinking.phrases` with `append` or `replace` mode
  - Accessibility-themed phrases: "Checking contrast ratios...", "Testing with screen readers...", "Verifying keyboard navigation..."
  - Why it matters: Reinforces accessibility focus, reminds team members, makes wait time engaging
  - Step-by-step configuration instructions and community contribution invitation

- **Removed VS Code 1.110 Recommendations File** - All recommendations implemented and documented
  - `docs/VS-CODE-1.110-RECOMMENDATIONS.md` - Deleted after all features implemented
  - High priority features (4 items): Completed in Phase 5
  - Medium priority features (6 items): Completed in Phase 6
  - Low priority features (3 items): Documented as skip or deferred to v3.2
  - All implementation work now tracked in CHANGELOG.md and prd.md

### Changed

- **Version Numbers** - Project version 2.6.0 → 3.0.0 across all manifests and installers
  - `vscode-extension/package.json` and `package-lock.json` → 3.0.0
  - `desktop-extension/package.json`, `package-lock.json`, `manifest.json` → 3.0.0
  - Installer comments updated from "v2.5 → v2.6" to "v2.x → v3.0"
  - README community contribution example updated to v3.0

- **Agent Credibility** - All agents now ground recommendations in published standards instead of "AI-generated" advice
  - Every agent includes `## Authoritative Sources` section with inline citations
  - Source tiers clearly documented in CITATION_POLICY.md
  - Weekly currency check ensures sources remain accessible and unchanged

- **Documentation Architecture** - Professional packaging for enterprise distribution
  - `prd.md` now single source of truth for v3.0 implementation status
  - Removed `PLAN.md` (strategic planning document - content migrated to prd.md)
  - Added `MIGRATION-AUDIT.md` documenting content migration
  - Added `v3.0 Release Management` section in prd.md with testing checklists, success metrics, version history

- **System Requirements Documentation** - Critical version currency warnings across all documentation entry points
  - `README.md` - New "System Requirements" section (88+ lines) with tool version table, 5 reasons why currency matters, update workflows
  - `docs/getting-started.md` - Version currency WARNING boxes in all 5 platform prerequisites (Claude Code, GitHub Copilot, Claude Desktop, Codex CLI, Gemini CLI)
  - `CONTRIBUTING.md` - New "Testing Requirements" section requiring contributors test with latest tool versions before PRs
  - Version check commands documented for all platforms and tools
  - "Why Version Currency Matters" explanations: platform API changes, accessibility features, bug fixes, security, WCAG evolution

### Fixed

- **Trust Gap** - Users can now verify agent recommendations by following inline citations to official documentation
- **Context Budget Exhaustion** - Orchestrator agents now guide users to compact long audits before hitting limits
- **Accessibility Bypassing** - Lifecycle hooks enforce review before UI file edits
- **Manual Fix Verification** - Browser tools automate verification of accessibility fixes

### Performance

- **Hook Timeouts** - All hooks complete in <5 seconds (session-start: 10s)
- **Browser Tool Degradation** - Gracefully falls back to code review when browser unavailable
- **Source Currency Check** - Automated weekly (configurable to monthly/quarterly for stable sources)

---

## [2.6.0] - 2026-03-03

### Added

- Initial public release with 113 accessibility agents across 5 teams
- Web Accessibility team (17 agents)
- Document Accessibility team (7 agents)
- GitHub Workflow team (11 agents)
- Developer Tools team (7 agents)
- Cross-platform support: Claude Code, GitHub Copilot, Gemini CLI, Claude Desktop (MCP), Codex CLI

---

[Unreleased]: https://github.com/Community-Access/accessibility-agents/compare/v4.0.0...HEAD
[4.0.0]: https://github.com/Community-Access/accessibility-agents/compare/v3.2.0...v4.0.0
[3.2.0]: https://github.com/Community-Access/accessibility-agents/compare/v3.0.0...v3.2.0
[3.0.0]: https://github.com/Community-Access/accessibility-agents/compare/v2.5...v3.0.0
[2.6.0]: https://github.com/Community-Access/accessibility-agents/releases/tag/v2.6.0
