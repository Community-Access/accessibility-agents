# Marketplace Submission Guide: Accessibility Agents

**Status:** Ready for publication (July 14, 2026)  
**Target Registries:** awesome-copilot, copilot-plugins  
**Estimated Timeline:** 2-5 business days for approval

---

## Quick Summary

Accessibility Agents is a VS Code plugin bundling **80 specialized agents**, **25 reusable skills**, **134 custom prompts**, and **9 workspace instructions** for WCAG 2.2 AA compliance auditing across web, document, and developer accessibility domains.

For current marketplace messaging, reference **VS Code 1.113** explicitly rather than 1.112. The most relevant platform features for this plugin are the Chat Customizations editor, MCP bridging across local/Copilot CLI/Claude agents, broader Agent Debug Log coverage, and integrated-browser improvements for testing.

**Key Stats:**

- ✅ 170+ files across 3 platforms (Copilot, Claude Code, Gemini)
- ✅ 100% source citation coverage (all agents cite W3C, vendor docs)
- ✅ Auto-update mechanism with manifest-based tracking
- ✅ Non-destructive installation (manifest prevents overwrites)
- ✅ MIT License (permissive open source)
- ✅ 5+ years development history
- ✅ Active community maintenance

---

## Step 1: Prepare Your Repository

### 1.1 Ensure plugin.yaml is present

✅ Already created: s:\code\agents\plugin.yaml

Verify it contains:

- Name: "accessibility-agents"
- Title: "Accessibility Agents for GitHub Copilot"
- Description: (compelling 1-2 sentence summary)
- Version: "4.0.0"
- Author: "Community-Access"
- License: "MIT"
- Contents section with agents, skills, prompts paths
- Activation section with recommended agents

**Validate YAML syntax:**

```powershell
# PowerShell
$yaml = Get-Content plugin.yaml -Raw
$yaml | Out-String -InputObject $yaml | Select-String "^name:|^title:|^version:" | Select-Object -First 3
```

### 1.2 Update version in key files

Verify v4.0.0 is set in:

- ✅ plugin.yaml - `version: "4.0.0"`
- ✅ prd.md - `**Version:** 4.0.0`
- ✅ README.md - Check header references
- ✅ CHANGELOG.md - Section for [4.0.0]

### 1.3 Documentation Quality Check

Ensure these docs exist for marketplace visibility:

- ✅ README.md - Main documentation with installation instructions
- ✅ docs/getting-started.md - Platform-specific setup
- ✅ docs/agents/README.md - Agent reference with use cases
- ✅ CONTRIBUTING.md - Contribution guidelines
- ✅ LICENSE - MIT license header
- ✅ prd.md - Product requirements

### 1.4 Clean git history

```powershell
# Verify you're on main branch and synced with origin
git branch --show-current              # Should show: main
git log --oneline -1 | Select-Object -First 1  # Latest commit
git status                             # Should show: working tree clean
```

**No uncommitted changes?** Proceed to Step 2.

---

## Step 2: Submission to awesome-copilot Registry

**awesome-copilot** is the community-curated GitHub registry for Copilot plugins.

### 2.1 Fork the awesome-copilot Repository

1. **Go to:** <https://github.com/copilot-plugins/awesome-copilot>
2. **Click:** Fork (top-right)
3. **Name:** Leave as `awesome-copilot` (auto-filled)
4. **Owner:** Select your GitHub account
5. **Create fork**

### 2.2 Clone Your Fork Locally

```powershell
git clone https://github.com/YOUR_GITHUB_USERNAME/awesome-copilot.git
cd awesome-copilot
```

### 2.3 Add Accessibility Agents to README

The awesome-copilot README lists plugins by category. Find the **Accessibility** or **AI Agents** section and add an entry:

```markdown
### Accessibility

- **[Accessibility Agents](https://github.com/Community-Access/accessibility-agents)** - 80 agents for WCAG 2.2 AA web/document/developer accessibility auditing. Includes 25 reusable skills, 134 prompts, workspace instructions, and auto-update mechanism. MIT licensed.
```

**If no Accessibility section exists, create it:**

```markdown
## Accessibility

- **[Accessibility Agents](https://github.com/Community-Access/accessibility-agents)** - WCAG 2.2 AA agents for web, document, and developer accessibility auditing. 80 agents, 25 skills, 134 prompts, auto-updates. MIT licensed.
```

### 2.4 Update the plugins.json Index (If Applicable)

Some registries maintain a structured `plugins.json` file. Check if awesome-copilot has one:

```powershell
ls plugins.json 2>$null
```

If it exists, add your plugin entry:

```json
{
  "name": "Accessibility Agents",
  "repo": "Community-Access/accessibility-agents",
  "description": "80 agents for WCAG 2.2 AA accessibility auditing",
  "author": "Community-Access",
  "license": "MIT",
  "categories": ["accessibility", "auditing", "ai-agents"],
  "url": "https://github.com/Community-Access/accessibility-agents",
  "installPath": "plugin.yaml"
}
```

### 2.5 Commit and Push Your Changes

```powershell
git add README.md          # Or plugins.json if updated
git commit -m "chore: add Accessibility Agents to registry"
git push origin main
```

### 2.6 Create a Pull Request

1. **Go to:** Your fork (<https://github.com/YOUR_USERNAME/awesome-copilot>)
2. **Click:** "Contribute" → "Open pull request"
3. **Base:** copilot-plugins/awesome-copilot → main
4. **Head:** YOUR_USERNAME/awesome-copilot → main
5. **Title:** `chore: add Accessibility Agents to registry`
6. **Description:**

```markdown
## Plugin Submission

**Plugin Name:** Accessibility Agents  
**Repository:** https://github.com/Community-Access/accessibility-agents  
**Version:** 4.0.0  
**License:** MIT  

### What This Plugin Provides

- **80 specialized agents** for WCAG 2.2 AA compliance auditing
- **25 reusable skills** (severity scoring, framework guidance, scanning patterns)
- **134 custom prompts** (web audits, document audits, GitHub workflows, developer tooling)
- **9 workspace instructions** (automatic accessibility enforcement)
- **Auto-update mechanism** with manifest-based installation tracking

### Installation

Available in VS Code Extensions marketplace or via script installation:

```bash
# macOS
curl -fsSL https://raw.githubusercontent.com/Community-Access/accessibility-agents/main/install.sh | bash

# Windows (PowerShell)
irm https://raw.githubusercontent.com/Community-Access/accessibility-agents/main/install.ps1 | iex
```text

### Key Features

✅ 100% source citation (all agents cite W3C, vendor documentation)  
✅ Multi-platform (Copilot, Claude Code, Gemini)  
✅ Non-destructive installation (safety-first manifest tracking)  
✅ Comprehensive documentation (getting started, agent reference, advanced guides)  
✅ Active maintenance and community-driven development  

### Standards Compliance

- WCAG 2.2 Level AA
- WAI-ARIA 1.2
- PDF/UA-1 (ISO 14289-1:2023)
- Section 508, EN 301 549

See [plugin.yaml](https://github.com/Community-Access/accessibility-agents/blob/main/plugin.yaml) for full manifest.

```yaml

7. **Add Labels:** `plugin-submission`, `accessibility`, `useful` (if available)
8. **Submit PR**

### 2.7 Address Reviewer Feedback

The awesome-copilot maintainers may request:
- **Plugin relevance clarity** - Emphasize WCAG compliance over general purpose
- **Installation documentation** - Direct to getting-started.md
- **License confirmation** - Reaffirm MIT
- **Maintenance status** - Project is actively maintained

**Typical approval timeline:** 3-5 business days

---

## Step 3: Submission to copilot-plugins Registry (Official)

**copilot-plugins** is GitHub's official Copilot plugin registry (maintained by github/copilot-plugins org).

### 3.1 Check Submission Requirements

Visit: https://github.com/github/copilot-plugins

Look for a `CONTRIBUTING.md` or submission guide. Requirements typically include:

- [ ] GitHub account in good standing
- [ ] Plugin repository is public
- [ ] plugin.yaml present and valid YAML
- [ ] README.md with installation instructions
- [ ] LICENSE file (MIT, Apache, GPL, etc.)
- [ ] No trademark/brand conflicts

### 3.2 Create a Submission Issue

1. **Go to:** https://github.com/github/copilot-plugins/issues
2. **New Issue**
3. **Title:** `[Plugin Submission] Accessibility Agents`
4. **Template:** Use the "Plugin Submission" template if available
5. **Fill Out:**

```markdown
# Plugin Submission: Accessibility Agents

## Plugin Metadata

- **Name:** Accessibility Agents
- **Repository:** https://github.com/Community-Access/accessibility-agents
- **Version:** 4.0.0
- **Author:** Community-Access
- **License:** MIT
- **Plugin YAML:** https://github.com/Community-Access/accessibility-agents/blob/main/plugin.yaml

## Description

Accessibility Agents is a collection of 80 specialized AI agents, 25 reusable skills, 134 custom prompts, and 9 workspace instructions for automating WCAG 2.2 AA compliance auditing across web, document, and developer accessibility domains.

All agents cite authoritative sources (W3C WCAG, ARIA, vendor documentation) and are actively maintained by the Community-Access organization.

## Installation

```bash
# macOS
curl -fsSL https://raw.githubusercontent.com/Community-Access/accessibility-agents/main/install.sh | bash

# Windows (PowerShell)
irm https://raw.githubusercontent.com/Community-Access/accessibility-agents/main/install.ps1 | iex
```text

Or install from VS Code Extensions marketplace (coming soon #370).

## Key Features

✅ **Complete WCAG 2.2 Enforcement** - All 80 agents cite authoritative W3C/ARIA documentation  
✅ **Multi-Platform** - Copilot (VS Code & CLI), Claude Code, Gemini with full parity  
✅ **Reusable Skills** - 25 portable domain-specific skills (WCAG rules, severity scoring, frameworks)  
✅ **Custom Prompts** - 134 task-oriented prompts for audits, remediation, workflows  
✅ **Auto-Updates** - Manifest-based tracking, non-destructive installation, safe updates  
✅ **Production-Ready** - 5+ years development, actively maintained, MIT licensed  

## Requirements Met

- [x] plugin.yaml present and valid YAML
- [x] README.md with comprehensive documentation
- [x] LICENSE file (MIT)
- [x] Public repository with full git history
- [x] Active maintenance and community support
- [x] No external dependencies (agents are self-contained)
- [x] 100% source citation coverage

## Use Cases

1. **Web Accessibility Auditing** - accessibility-lead, web-accessibility-wizard, contrast-master, keyboard-navigator
2. **Document Compliance** - document-accessibility-wizard, word/excel/powerpoint/pdf/epub-accessibility agents
3. **Developer Productivity** - python-specialist, wxpython-specialist, desktop-a11y-specialist, nvda-addon-specialist
4. **GitHub Workflows** - github-hub, daily-briefing, pr-review, issue-tracker, analytics
5. **Markdown Documentation** - markdown-a11y-assistant with automatic link/heading/table validation

## Contact

- **GitHub Issues:** <https://github.com/Community-Access/accessibility-agents/issues>
- **Discussions:** <https://github.com/Community-Access/accessibility-agents/discussions>
- **Email:** <contact@community-access.org>

Thank you for considering Accessibility Agents for the official Copilot plugin registry!

```markdown

### 3.3 Wait for Triage

The copilot-plugins team will review and may ask for:
- **Technical validation** - Ensure plugin.yaml is well-formed
- **Feature demo** - Show examples of agent output
- **Maintenance commitment** - Confirm ongoing support
- **Standards alignment** - Verify WCAG AA compliance claims

**Typical response timeline:** 5-10 business days

### 3.4 After Approval

Once approved, GitHub will:
- Add your plugin to the official registry
- Enable discovery in VS Code Extensions marketplace
- List in https://github.com/github/copilot-plugins

Users can then install directly:
1. Open Extensions (`Ctrl+Shift+X`)
2. Search "accessibility-agents"
3. Click "Install"

---

## Step 4: VS Code Extensions Marketplace

### 4.1 Verify Automatic Listing

Once approved in official registries, Accessibility Agents should appear in VS Code Extensions marketplace automatically. No separate submission required.

**Timeline:** 12-48 hours after copilot-plugins approval

### 4.2 Monitor Listing

Once live, check:

```powershell
# Search in VS Code
# Ctrl+Shift+X → type "accessibility"
# Look for "Accessibility Agents" by Community-Access
```

Verify listing includes:

- ✅ Correct name and version
- ✅ Description (compelling 1-2 lines)
- ✅ Repository link (github.com/Community-Access/...)
- ✅ Author: Community-Access
- ✅ License: MIT
- ✅ Installation count (starts at 0, grows organically)

---

## Step 5: Post-Submission Tasks

### 5.1 Update Website/Documentation

Add badges to README:

```markdown
[![VS Code Extension](https://img.shields.io/badge/VS%20Code%20Extension-blue?logo=visualstudiocode)](https://marketplace.visualstudio.com/items?itemName=Community-Access.accessibility-agents)
[![awesome-copilot](https://img.shields.io/badge/awesome--copilot-listed-brightgreen)](https://github.com/copilot-plugins/awesome-copilot)
[![GitHub Copilot Plugins](https://img.shields.io/badge/GitHub-Copilot%20Plugins-orange)](https://github.com/github/copilot-plugins)
```

### 5.2 Create Release Notes

Tag a GitHub release:

```powershell
git tag -a v4.0.0-marketplace -m "Release v4.0.0: Marketplace publication"
git push origin v4.0.0-marketplace
```

Then create release notes on GitHub:

```markdown
# v4.0.0: Marketplace Release

**Accessibility Agents v4.0.0 is now available in the VS Code Extensions marketplace!**

## What's New in v4.0.0

- ✅ **80 Agents** — 21 new agents including CI accessibility, screen reader lab, WCAG 3.0 preview, WCAG AAA, i18n/RTL, email, media, web components, compliance mapping, data visualization, performance, accessibility statement, regression detector, office remediator, and 6 GitHub workflow agents (projects, actions, security, releases, notifications, wiki)
- ✅ **25 Skills** — 7 new reusable skills (CI integration, testing strategy, legal compliance, email, media, data visualization, office remediation)
- ✅ **134 Prompts** — 27 new task-oriented prompts across all teams
- ✅ **9 Instructions** — 2 new always-on instructions (CSS accessibility, testing accessibility, document generation)
- ✅ **24 MCP Tools** — 4 new tools for document metadata, headings, and audit caching
- ✅ **Copilot CLI Support** — `--cli` installer flag for global agent access
- ✅ **VS Code 1.113 Features** — Chat Customizations editor, MCP bridging into Copilot CLI and Claude agents, broader agent-debug coverage, image analysis, and integrated browser testing
- ✅ **CI Hardening** — All GitHub Actions bumped to latest major versions

## Installation

### VS Code Extensions Marketplace
1. Press `Ctrl+Shift+X` (Windows) or `Cmd+Shift+X` (Mac)
2. Search "accessibility-agents"
3. Click "Install"

### Script Installation (Alternative)
**macOS**
```bash
curl -fsSL https://raw.githubusercontent.com/Community-Access/accessibility-agents/main/install.sh | bash
```text

**Windows (PowerShell)**

```powershell
irm https://raw.githubusercontent.com/Community-Access/accessibility-agents/main/install.ps1 | iex
```text

## Key Improvements in v4.0.0

- **21 new agents** across web, document, CI/CD, developer tools, and GitHub workflow teams
- **Copilot CLI compatibility** — All agent tool names normalized for CLI-compatible use
- **AgentRC modernization** — AGENTS.md, dependabot.yml, validate-agents.js, CI validation workflow
- **VS Code 1.113 readiness** — Chat Customizations editor guidance, MCP parity across agent types, and updated debugging guidance
- **Playwright + WCAG 2.2 enhancements** — Modern scanning patterns, violation fingerprinting, WCAG 2.2 tag support
- **Server-based MCP server** — HTTP/SSE transport replaces stdio-only desktop extension, 52-test suite
- **Comprehensive User Guide** — 2,700-line guide covering all 80 agents, 25 skills, 134 prompts
- **Full cross-platform parity** — All agents synced to Copilot, Claude Code, Plugin, and Gemini

## Acknowledgments

Special thanks to:

- W3C WCAG Working Group and WAI authors
- GitHub Copilot team for plugin support
- Community-Access contributors
- All users reporting issues and feedback

See LICENSE for MIT license details.

```markdown

### 5.3 Announce on Social/Community

Consider announcing in:
- **GitHub Discussions** - Post in Community-Access or Copilot plugin discussions
- **Twitter/X** - Tag @github, @copilot_ai, @webstandards
- **Accessibility Community** - Deque, WebAIM, Adrian Roselli communities
- **Dev.to / Medium** - Write a short blog post about the release

### 5.4 Monitor Installation Stats

Check periodically:
- **VS Code Marketplace** - Installation count, ratings, reviews
- **GitHub Stars** - Track repository growth
- **Issues/Discussions** - Monitor for user feedback and feature requests

---

## Troubleshooting

### Issue: plugin.yaml validation fails

**Error:** `plugin.yaml is not valid YAML`

**Solution:**
``` powershell
# Validate YAML syntax
$yaml = Get-Content plugin.yaml -Raw
[yaml]::ConvertFromYaml($yaml)  # Should return object with no errors
```text

Or use an online validator: <https://www.yamllint.com/>

### Issue: Registry review takes >10 days

**Solution:**

- Check registry GitHub for status updates
- Comment on your submission asking for status
- Consider submitting to awesome-copilot first (faster, community-driven)
- In parallel, submit to copilot-plugins official registry

### Issue: VS Code Extensions marketplace doesn't list plugin

**Timeline:** 12-48 hours typically, but can take 3-5 days

**Solution:**

- Clear VS Code cache: `~/.vscode/` (or `%APPDATA%\.vscode\` on Windows)
- Restart VS Code and search again
- If still missing after 48 hours, contact VS Code Extensions team

### Issue: Installation fails with "plugin.yaml not found"

**Cause:** plugin.yaml not in repository root

**Solution:**

```powershell
# Verify file location
ls -Path plugin.yaml
# Should output: plugin.yaml (3 KB) in root directory, not in subdirectory
```text

---

## Success Criteria

✅ **awesome-copilot PR merged** - Listed in community registry  
✅ **github/copilot-plugins issue resolved** - Listed in official registry  
✅ **VS Code marketplace listing live** - One-click install available  
✅ **Installation count >100** - Organic adoption begins  
✅ **User issues/discussions** - Active community engagement  

Once all criteria met, Accessibility Agents is **marketplace-ready** and **production-deployed**! 🎉

---

## Next Steps

**After Marketplace Publication:**

1. **Lifecycle Hooks (v3.1.0)** - Session startup, tool execution, agent selection automation
2. **Agentic Browser Tools Phase 3-4** - Advanced verification, failure mode handling
3. **Mobile Native Accessibility (v3.2.0)** - iOS/Android agents for React Native apps
4. **Multi-Language Support (v3.3.0)** - UI text, instructions in French, German, Spanish

---

**Questions?** Open an issue on GitHub or start a discussion in the Community-Access repository.

Good luck with your marketplace submission! 🚀
