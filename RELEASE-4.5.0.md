# Accessibility Agents 4.5.0

**Released:** March 27, 2026 | 232 files changed | 96 agents updated across 3 platforms

---

## What's New

4.5.0 is our biggest quality-of-life release yet. The installer now guides you through MCP server setup automatically. Document audit reports speak in plain language instead of XML schemas. The entire agent suite is aligned to VS Code 1.113. And the installation, update, and uninstall tooling has been comprehensively rebuilt for reliability.

---

## Guided MCP Server Installation

**Before 4.5.0:** You installed the agents, then had to manually navigate to the MCP server directory, figure out which npm packages you needed, configure VS Code settings.json by hand, and hope it all worked.

**Now:** The installer walks you through everything.

### Interactive Capability Planner

When the installer detects Node.js, it presents a guided setup menu:

1. **Baseline scanning** - Core accessibility scanning tools
2. **Browser testing** - Adds Playwright and axe-core for live page testing
3. **PDF-heavy workflow** - Adds pdf-lib for form conversion
4. **Everything** - All of the above plus deep PDF validation prerequisites
5. **Custom** - Pick exactly what you need

### Automatic Dependency Management

- **Node.js detection and installation** - If Node.js 18+ is not found, the installer offers to install it via `winget` (Windows) or `brew` (macOS)
- **npm dependencies** - Core MCP server packages installed automatically (`npm install --omit=dev`)
- **Playwright and Chromium** - When browser testing is selected, Playwright is installed and Chromium is downloaded (`npx playwright install chromium`)
- **pdf-lib** - Installed when PDF form capabilities are selected
- **Java and veraPDF** - For deep PDF/UA validation, the installer offers to set up Java 21 JRE and veraPDF through platform package managers

### VS Code Settings Auto-Configuration

The installer automatically merges the MCP server entry into your VS Code `settings.json` - for both Stable and Insiders editions if you have them. No manual JSON editing required.

### Health Check and Readiness Dashboard

At the end of installation, you see a readiness report:

```text
MCP Capability Readiness
  [x] Node.js 18+
  [x] npm
  [x] MCP core dependencies
  [x] Baseline PDF scan
  [!] Deep PDF validation (Java found, veraPDF missing)
  [x] Local health smoke test - READY
  [x] Playwright
  [x] Chromium
  [x] pdf-lib
```

The installer actually starts the MCP server on a test port and hits `/health` to confirm everything works before declaring success.

---

## Completely Rebuilt Installation Tooling

The install, update, and uninstall scripts for both PowerShell and Bash have been rewritten from the ground up with a shared library architecture.

### New Command-Line Flags

Every script now supports these flags (both `install.ps1`/`install.sh`, `update.ps1`/`update.sh`, and `uninstall.ps1`/`uninstall.sh`):

The following table lists flags available across all installer operations.

| Flag | What it does |
|------|-------------|
| `--dry-run` | Simulates the operation, writes a JSON plan file, changes nothing |
| `--check` | Validates your environment and exits - useful for CI pre-flight |
| `--yes` | Auto-approves all prompts for non-interactive and CI use |
| `--vscode-stable` | Target only VS Code Stable |
| `--vscode-insiders` | Target only VS Code Insiders |
| `--vscode-both` | Target both editions |
| `--summary=path` | Override where the JSON summary file is written |

The installer adds additional selection flags:

The following table lists installer-specific selection flags.

| Flag | What it does |
|------|-------------|
| `--copilot` | Pre-select Copilot agent installation |
| `--cli` | Pre-select Copilot CLI installation |
| `--codex` | Pre-select Codex installation |
| `--gemini` | Pre-select Gemini CLI installation |
| `--no-auto-update` | Skip auto-update scheduling |
| `--mcp-profile-stable` / `--mcp-profile-insiders` / `--mcp-profile-both` | Control which VS Code editions get MCP settings |

### Machine-Readable Output

Every operation now writes a structured JSON summary file (`.a11y-agent-team-install-summary.json`, `-update-summary.json`, or `-uninstall-summary.json`) containing the full record of what was installed, where, which VS Code profiles were targeted, and what the MCP configuration state is. CI pipelines can parse these for automated validation.

### Shared Installer Libraries

Two new shared modules (`scripts/Installer.Common.ps1` and `scripts/installer-common.sh`) provide consistent cross-platform behavior for VS Code profile detection, JSON summary writing, directory operations, and backup metadata. This eliminated duplicated logic and the class of bugs where PowerShell and Bash installers behaved differently.

### Clean Uninstallation

The uninstaller now removes the MCP server entry from VS Code `settings.json` automatically - including cleanup of empty `mcp.servers` objects. Previously you had to edit settings.json by hand after uninstalling.

---

## Document Audit Reports Now Speak Plain Language

This is a fundamental change in how document accessibility findings are presented.

### Native-Tool-First Remediation

Every finding across all document agents - Word, Excel, PowerPoint, PDF, and the CSV export - now follows a new three-part structure:

**Start Here** - tells the user exactly what to do in the native application (Word ribbon path, Excel menu, PowerPoint selection pane, Acrobat Pro tool panel). This is the first thing readers see.

**Why It Matters** - explains the accessibility impact in plain language.

**Advanced / Technical Follow-Up** - XML structures, scripting approaches, and programmatic fixes for power users who need them.

### What Changed

- **document-accessibility-wizard** - New Remediation Writing Standard, new Start Here and Native App Action Plan sections in the report template
- **word-accessibility** - All findings restructured with Start Here leading to Word ribbon paths
- **excel-accessibility** - All findings restructured with Start Here leading to Excel menu paths
- **powerpoint-accessibility** - All findings restructured with Start Here leading to Selection Pane and slide layout paths
- **pdf-accessibility** - All findings restructured with Start Here leading to Acrobat Pro tool paths, with specific note about Acrobat triage before source rebuilds
- **document-csv-reporter** - CSV `fix_suggestion` column now leads with native-app action in the first sentence

### Why This Matters

Most people who receive a document accessibility audit report are content authors, not developers. They know how to use Word and PowerPoint. They should not have to parse XML schemas to fix a missing alt text description. Now they do not have to.

---

## 96 Agent Definitions Updated Across 3 Platforms

Every agent change was synchronized across GitHub Copilot (`.github/agents/`), Claude Code (`.claude/agents/`), and the Claude Code plugin (`claude-code-plugin/agents/`).

### Coordinator Safety

All coordinator agents (accessibility-lead, web-accessibility-wizard, document-accessibility-wizard, and others) now declare an explicit `agents:` list in their YAML frontmatter specifying exactly which specialist agents they are allowed to invoke. The validator enforces this at commit time.

This prevents the "wrong agent called" problem and makes the orchestration architecture visible and auditable in code review.

### Platform Focus: Windows and macOS

4.5.0 removes Linux desktop accessibility references across the agent suite. This affects:

- **Desktop accessibility specialist** - ATK/AT-SPI API section removed
- **Desktop a11y testing coach** - Orca screen reader section removed
- **Testing coach** - Orca references removed
- **Screen reader lab** - Orca simulation mode removed
- **Python specialist** - Linux column removed from cross-platform reference tables
- **wxPython specialist** - Linux-specific guidance removed
- **All installer scripts** - Linux cron scheduling removed; shell auto-update now macOS-only
- **All documentation** - "macOS/Linux" changed to "macOS" throughout

The agents, installers, and documentation now explicitly target **Windows and macOS**. Linux users can still install and use the agents for web and document accessibility, but desktop accessibility testing coverage (screen reader APIs, platform automation) is Windows and macOS only.

### Markdown Rendering Quality

Approximately 40 agent files received systematic formatting fixes:

- Blank lines added before bulleted lists for correct markdown spec rendering
- Code fences changed from bare triple-backtick to language-tagged blocks (`text`, `yaml`, `json`) so output is not randomly syntax-highlighted
- Trailing newlines normalized

These changes improve rendering quality in GitHub, VS Code preview, and documentation site builds.

---

## MCP Server Documentation Overhaul

### New: PDF Quick Start Guide

New standalone guide ([PDF-QUICKSTART.md](mcp-server/PDF-QUICKSTART.md)) for users who only need PDF scanning. Six steps from zero to working PDF accessibility scan, without touching the full agent suite.

### Expanded MCP README

The MCP server README was substantially rewritten:

- **"What Works Out of the Box" matrix** - shows which agents need which MCP capabilities
- **Prerequisite matrix** - 9-row table showing what is required vs. optional
- **Local vs. shared server comparison** - helps teams decide deployment topology
- **Actionable veraPDF setup** - platform-specific install commands for Windows (`winget`/`choco`), macOS (`brew`), and manual download
- **Verification examples** - how to confirm each prerequisite is working

---

## VS Code 1.113 Alignment

### MCP Across Agent Types

MCP servers registered in VS Code now bridge automatically to Copilot CLI and Claude agent sessions. You configure MCP once and it works everywhere - no separate setup per agent type.

### Chat Customizations Editor

`Chat: Open Chat Customizations` provides a single UI for managing all loaded instructions, prompt files, custom agents, skills, MCP servers, and plugins.

### Agent Debugging

Agent Debug Logs now cover Copilot CLI and Claude agent sessions in addition to local VS Code sessions. Use `/troubleshoot` in chat to analyze debug logs directly.

### Integrated Browser

The `editor-browser` debug type supports self-signed certificates for local HTTPS development and improved browser-tab management for accessibility testing workflows.

### Nested Subagent Controls

`chat.subagents.allowInvocationsFromSubagents` is documented with clear guidance: disabled by default in this project, enable only for deliberately recursive coordinator-worker workflows.

---

## New Documentation

The following table lists new documentation pages added in this release.

| Guide | What it covers |
|-------|---------------|
| [Troubleshooting Guide](docs/troubleshooting.md) | MCP server connection issues, trust prompts, workspace vs. profile configuration, agent picker problems, frontmatter validation, platform-specific debugging |
| [Subagent Architecture Guide](docs/subagent-architecture.md) | Coordinator-worker patterns, allowlist validation, internal helper agents, nested subagent policy, platform integration |
| [Beacon User Guide](docs/beacon/USER_GUIDE.md) | Full telemetry and beacon system documentation |
| [PDF Quick Start](mcp-server/PDF-QUICKSTART.md) | Minimal-path PDF scanning setup |

### Updated Documentation

- **[User Guide](docs/USER_GUIDE.md)** - Platform-prefixed section headings for screen reader navigation, prerequisite matrix, MCP port corrected (3100), veraPDF strategy section
- **[Getting Started](docs/getting-started.md)** - New installer flags documented, JSON summary schema, CI validation workflows, Safe Validation section
- **[Configuration](docs/configuration.md)** - Four new VS Code 1.113 sections (Chat Customizations, MCP bridging, nested subagents, integrated browser)

---

## Release Engineering

### Automated Version Consistency

New `scripts/check-release-consistency.js` validates that version numbers match across CHANGELOG.md, plugin.yaml, mcp-server/package.json, and gemini-extension.json. A GitHub Actions workflow runs this on every push to main.

### 4 New CI Workflows

The following table lists new CI workflows added in this release.

| Workflow | Purpose |
|----------|---------|
| `installer-dry-run.yml` | Validates PowerShell and Bash installer dry-runs |
| `installer-integration.yml` | Runs real install/update/uninstall cycles on Windows CI |
| `check-release-consistency.yml` | Catches version drift before merge |
| `mcp-prerequisite-consistency.yml` | Validates MCP prerequisite documentation accuracy |

### CI Reliability Fixes

- Removed UTF-8 BOM bytes from bash scripts that caused shell parser failures
- Re-normalized line endings with updated `.gitattributes`
- Replaced `robocopy` with `Copy-Item` in Windows CI to eliminate exit code 9 failures
- Fixed bash control-flow parsing errors in installer scripts
- Removed malformed embedded YAML step fragments from workflow definitions

---

## Release Stats

The following table summarizes the scope of the 4.5.0 release.

| Metric | Value |
|--------|-------|
| Files changed | 232 |
| Agent definitions updated | 96 (across 3 platforms) |
| Prompts updated | 20 |
| Skills updated | 9 |
| New shared installer modules | 2 |
| New documentation pages | 4 |
| New CI workflows | 4 |
| New CLI flags across install/update/uninstall | 16 |
| Specialized agents (total) | 80 |
| Reusable skills (total) | 25 |
| MCP tools (total) | 24 |

---

## How to Update

### Windows (PowerShell)

```powershell
irm https://raw.githubusercontent.com/Community-Access/accessibility-agents/main/install.ps1 | iex
```

### macOS (Bash)

```bash
curl -fsSL https://raw.githubusercontent.com/Community-Access/accessibility-agents/main/install.sh | bash
```

### Claude Code

```bash
claude code update
```

### Gemini CLI

```bash
gemini update accessibility-agents
```

### MCP Server Only

```bash
cd mcp-server && npm install
```

You can also run with `--dry-run` first to see what would change before committing:

```powershell
.\install.ps1 -DryRun
```

---

## Recommended Reading

**New users:** Start with [Getting Started](docs/getting-started.md), then follow the guided installer.

**Existing users:** Update to 4.5.0, then review [Troubleshooting](docs/troubleshooting.md) if you use MCP tools.

**Document authors:** The new native-tool-first remediation format means your audit reports now start with Word/Excel/PowerPoint/Acrobat instructions you can act on immediately.

**Agent developers:** Read [Subagent Architecture](docs/subagent-architecture.md) for the coordinator allowlist pattern, and check [Validator Rules](scripts/validate-agents.js) for enforcement details.

---

## Bug Fixes

### install.ps1: One-Liner Pipeline Fix

Fixed a critical issue where the `irm | iex` one-liner installation command failed with `Install-MCP is not recognized` errors. When npm or npx produced stdout during dependency installation, the output leaked into the PowerShell pipeline, breaking function resolution for downstream commands.

**What changed:**
- All four npm/npx calls in `install.ps1` now suppress stdout with `2>&1 | Out-Null`
- Each call checks `$LASTEXITCODE` and throws on failure for proper try/catch integration
- The `irm | iex` pipeline now works reliably without stdout interference

**Who is affected:** Anyone installing via the one-liner `irm https://raw.githubusercontent.com/.../install.ps1 | iex`. Direct `.\install.ps1` execution was not affected.

See [Issue #93](https://github.com/Community-Access/accessibility-agents/issues/93) for details.

---

## Validation

- All 80 agents pass validation including the new coordinator allowlist rule
- Version consistency verified across all platform manifests
- Installer dry-run and integration tests pass on Windows CI
- Pre-commit hook enforces validation at commit time
- MCP health smoke test confirms server readiness

---

## Contributing

Found an issue? [Submit a PR](https://github.com/Community-Access/accessibility-agents/blob/main/CONTRIBUTING.md)

We especially welcome:
- Troubleshooting tips for your platform
- Subagent design pattern examples
- CI/CD integration guides for GitLab CI, CircleCI, and Jenkins
- Translations of the native-tool-first remediation guidance for non-English Office installations

---

## Full Changelog

See [CHANGELOG.md](CHANGELOG.md) for the complete technical changelog covering every change in 4.5.0 and earlier releases.

---

## Thanks

Special thanks to:
- [Taylor Arndt](https://github.com/taylorarndt) - Project lead
- [Jeff Bishop](https://github.com/jeffbis) - 1.113 alignment and release engineering
- The accessibility community for pushing LLM tooling forward

---

## Questions?

- [Report bugs or request features](https://github.com/Community-Access/accessibility-agents/issues)
- [Ask questions and share ideas](https://github.com/Community-Access/accessibility-agents/discussions)
- [How to contribute](CONTRIBUTING.md)
