# Accessibility Agents

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub release](https://img.shields.io/github/v/release/community-access/accessibility-agents?include_prereleases)](https://github.com/Community-Access/accessibility-agents/releases)
[![GitHub stars](https://img.shields.io/github/stars/community-access/accessibility-agents)](https://github.com/Community-Access/accessibility-agents/stargazers)
[![GitHub contributors](https://img.shields.io/github/contributors/community-access/accessibility-agents)](https://github.com/Community-Access/accessibility-agents/graphs/contributors)
[![WCAG 2.2 AA](https://img.shields.io/badge/WCAG-2.2_AA-green.svg)](https://www.w3.org/TR/WCAG22/)

> **AI and automated tools are not perfect.** They miss things, make mistakes, and cannot replace testing with real screen readers and assistive technology. Always verify with VoiceOver, NVDA, JAWS, and keyboard-only navigation. This tooling is a helpful starting point, not a substitute for real accessibility testing.

**A community-driven open-source project automating accessibility, efficiency, and productivity through AI-based agents, skills, custom instructions, and prompts.**

A sincere thanks goes out to [Taylor Arndt](https://github.com/taylorarndt) and [Jeff Bishop](https://github.com/jeffreybishop) for leading the charge in building this community project. It started because LLMs consistently forget accessibility - skills get ignored, instructions drift out of context, ARIA gets misused, focus management gets skipped, color contrast fails silently. They got tired of fighting it and built an agent team that will not let it slide. Now we want to make more magic together.

> **We want more contributors!** If you care about making software accessible to blind and low vision users, please consider [submitting a PR](CONTRIBUTING.md). Every improvement to these agents helps developers ship more inclusive software for the people who need it most.

---

## The Problem

AI coding tools generate inaccessible code by default. They forget ARIA rules, skip keyboard navigation, ignore contrast ratios, and produce modals that trap screen reader users. Even with skills and CLAUDE.md instructions, accessibility context gets deprioritized or dropped entirely.

## The Solution

**Accessibility Agents** provides fifty-seven specialized agents across five teams and five platforms:

- **Web Accessibility team** - seventeen agents that enforce WCAG AA standards for web code
- **Document Accessibility team** - agents for Office (DOCX, XLSX, PPTX), PDF, EPUB, and Markdown accessibility scanning
- **GitHub Workflow team** - eleven agents that manage repositories, triage issues, review PRs, and keep your team informed
- **Developer Tools team** - seven agents for Python, wxPython, desktop accessibility, NVDA addon development, and accessibility tool building
- **Cross-cutting** - orchestrators and coordinators that route work across teams

All agents run on:

- **Claude Code** - Agents you invoke directly for accessibility evaluation
- **GitHub Copilot** (VS Code and CLI) - Agents + workspace instructions that ensure accessibility guidance in every conversation
- **Gemini CLI** - Skills-based extension with always-on WCAG AA context via GEMINI.md
- **Claude Desktop** - An MCP extension (.mcpb) with tools and prompts for accessibility review
- **Codex CLI** - Condensed WCAG AA rules loaded via `.codex/AGENTS.md` -- accessibility enforced automatically on every UI task

## System Requirements

> ⚠️ **CRITICAL:** To remain current with Accessibility Agents and ensure proper functionality, you **must** keep all tools updated to their latest versions. New platform capabilities, API changes, accessibility features, and bug fixes directly impact agent behavior.

### Required Tools (Latest Versions)

**For GitHub Copilot (VS Code):**
- **VS Code:** Latest stable release ([Download](https://code.visualstudio.com/))
- **GitHub Copilot Extension:** Latest version from VS Code Marketplace
- **GitHub Copilot Chat Extension:** Latest version from VS Code Marketplace
- **Node.js:** v18.0.0 or higher (for CLI tools like axe-core)

**For Claude Code:**
- **Claude Code CLI:** Latest version ([Installation](https://docs.anthropic.com/en/docs/claude-code))
- **Claude Subscription:** Pro, Max, or Team plan

**For Gemini CLI:**
- **Gemini CLI:** Latest version ([Installation](https://github.com/google/generative-ai-cli))
- **Google AI Studio API Key:** Active key ([Get Started](https://ai.google.dev/))

**For Claude Desktop:**
- **Claude Desktop App:** Latest version ([Download](https://claude.ai/download))
- **Claude Subscription:** Pro plan or higher

**Operating Systems:**
- **macOS:** 10.15 (Catalina) or later
- **Linux:** Ubuntu 20.04+, Fedora 35+, or equivalent with bash 4.0+
- **Windows:** Windows 10/11 with PowerShell 5.1+ (pre-installed)

### Why Version Currency Matters

1. **Platform API Changes** - VS Code Copilot, Claude Code, and other platforms add new capabilities (tool use, context windows, model selection) that agents rely on
2. **Accessibility Features** - New platform features directly improve agent effectiveness (browser tools, screenshot analysis, DOM inspection)
3. **Bug Fixes** - Critical fixes for tool invocation, context handling, and agent orchestration
4. **Security Updates** - Important security patches for API access, authentication, and data handling
5. **WCAG Evolution** - As standards evolve (WCAG 2.2, 3.0), agents update to reflect current best practices

### Keeping Tools Updated

**Automatic Updates (Recommended):**

```bash
# Set up daily auto-updates during installation (recommended)
curl -fsSL https://raw.githubusercontent.com/Community-Access/accessibility-agents/main/install.sh | bash
# Choose "Yes" when prompted for auto-updates

# Or manually enable auto-updates later
bash update.sh --auto
```

**Manual Updates:**

```bash
# Update Accessibility Agents
cd accessibility-agents
git pull origin main
bash update.sh

# Update VS Code
# Help → Check for Updates (or auto-updates if enabled in settings)

# Update GitHub Copilot Extensions
# Extensions → @installed → Click update icon next to GitHub Copilot extensions

# Update Claude Code CLI
claude code update

# Update Node.js tools
npm update -g @axe-core/cli
npm update -g pa11y
```

**Version Checks:**

```bash
# Check current versions
code --version                    # VS Code
claude code --version            # Claude Code CLI
node --version                   # Node.js
npm list -g --depth=0            # Global npm packages
```

### Compatibility Note

Accessibility Agents are tested against the **latest stable releases** of all supported platforms. While older versions may work, we cannot guarantee compatibility or support issues arising from outdated tooling. If you encounter unexpected behavior, update all tools before reporting issues.

### Authoritative Sources and Currency

This project bases platform-specific guidance on official vendor documentation and release notes, not secondary summaries.

Primary references:
- VS Code release notes: `https://code.visualstudio.com/updates`
- VS Code Copilot customization docs: `https://code.visualstudio.com/docs/copilot/customization/custom-instructions`
- VS Code custom agents docs: `https://code.visualstudio.com/docs/copilot/customization/custom-agents`
- VS Code prompt files docs: `https://code.visualstudio.com/docs/copilot/customization/prompt-files`
- GitHub Copilot product docs: `https://docs.github.com/copilot`

Attribution policy:
- Platform claims in this repo should cite at least one official source link.
- New behavior tied to a specific release should include the release note URL.
- When settings keys are documented, link to the official settings/docs page where possible.

## Optional Customization

### Custom Thinking Phrases (VS Code 1.110+)

**VS Code users:** Personalize the loading text that appears while agents think with accessibility-themed phrases.

**Add to VS Code Settings (settings.json):**

```jsonc
{
  "chat.agent.thinking.phrases": {
    "mode": "append",  // Adds to default phrases
    "phrases": [
      "Checking contrast ratios...",
      "Testing with screen readers...",
      "Verifying keyboard navigation...",
      "Reviewing ARIA patterns...",
      "Scanning for accessibility barriers...",
      "Consulting WCAG 2.2..."
    ]
  }
}
```

**Options:**
- `"mode": "append"` - Adds your phrases to VS Code's default list (recommended)
- `"mode": "replace"` - Only shows your custom phrases

**Why This Matters:**
- Reinforces accessibility focus during agent work
- Reminds team members that accessibility is actively considered
- Optional fun enhancement to make wait time more engaging

**How to Add:**
1. Open VS Code Settings (Ctrl/Cmd + ,)
2. Click "Open Settings (JSON)" icon in top-right
3. Add the `chat.agent.thinking.phrases` setting
4. Reload window (Command Palette → "Developer: Reload Window")

**Community Contributions:**
Have a great accessibility-themed thinking phrase? Submit a PR to add it to our recommended list in [CONTRIBUTING.md](CONTRIBUTING.md)!

## Quick Start

### One-liner install

**macOS / Linux:**

```bash
curl -fsSL https://raw.githubusercontent.com/Community-Access/accessibility-agents/main/install.sh | bash
```

**Windows (PowerShell):**

```powershell
irm https://raw.githubusercontent.com/Community-Access/accessibility-agents/main/install.ps1 | iex
```

See the full [Getting Started Guide](docs/getting-started.md) for all installation options, manual setup, global vs project install, auto-updates, and platform-specific details.

### One-liner uninstall

**macOS / Linux:**

```bash
curl -fsSL https://raw.githubusercontent.com/Community-Access/accessibility-agents/main/uninstall.sh | bash
```

## Troubleshooting

### Agents Not Loading or Triggering

**Verify agents are loaded:**  
VS Code 1.110+: Open **Agent Debug Panel** (Command Palette → "Developer: Open Agent Debug Panel"). Check that all 57 agents appear in the loaded agents list.

If agents are missing:
- Verify `.github/agents/*.agent.md` files exist in your workspace
- Check `.github/copilot-instructions.md` or `CLAUDE.md` is present
- Reload VS Code window (Command Palette → "Developer: Reload Window")
- Update GitHub Copilot extensions to latest versions

**Three-hook enforcement not working:**  
Check the Agent Debug Panel for:
- **UserPromptSubmit hook events** - Should fire on every prompt in web projects
- **PreToolUse hook events** - Look for `permissionDecision: "deny"` on blocked UI file edits
- **PostToolUse hook events** - Should create session marker after accessibility-lead completes

If hooks are not firing:
- Verify hooks are enabled in settings (`github.copilot.chat.hooks.enabled: true`)
- Check workspace is trusted (hooks disabled in untrusted workspaces)
- Update VS Code and Copilot extensions to 1.110 or later

See the complete [Agent Debug Panel Guide](docs/guides/agent-debug-panel.md) and [Hooks Guide](docs/hooks-guide.md) for detailed troubleshooting.

### False Edit Gate Blocks

If the edit gate blocks a non-UI file (e.g., `src/utils/api.ts`), this is a false positive. The hook uses file extensions and path patterns to detect UI files - occasionally non-UI files match these patterns.

**Workaround:** Create the session marker manually to unlock editing:
```bash
touch /tmp/a11y-reviewed-$(cat /tmp/claude-session-id)
```

**Report:** [Open an issue](https://github.com/Community-Access/accessibility-agents/issues) with the falsely blocked file path so we can refine the detection patterns.

### Skills Not Loading

Verify skill files have valid YAML frontmatter:
```bash
grep -l "^---" .github/skills/**/SKILL.md
```

Each skill needs:
- Valid YAML frontmatter with `name` and `description` fields
- No syntax errors in frontmatter
- File named exactly `SKILL.md` (case-sensitive)

Check the Agent Debug Panel for skill loading errors.
```

**Windows (PowerShell):**

```powershell
irm https://raw.githubusercontent.com/Community-Access/accessibility-agents/main/uninstall.ps1 | iex
```

The uninstaller removes all agents, config sections, assets, extensions, and auto-update tasks across every platform (Claude Code, Copilot, Codex, Gemini). If no manifest file is found, it downloads the repo to build a fallback file list so nothing is missed.

For step-by-step manual removal instructions, see [UNINSTALL.md](UNINSTALL.md).

### Safe installation — your files are never overwritten

The installer is designed to be additive and non-destructive:

- **Agent files** (`~/.claude/agents/`, `.github/agents/`) - existing files are skipped, not replaced. A message tells you which agents were skipped so you know what you already have.
- **Config files** (`copilot-instructions.md`, `copilot-review-instructions.md`, `copilot-commit-message-instructions.md`) - our content is wrapped in `<!-- a11y-agent-team: start/end -->` markers and merged into your existing file. Your content above and below the markers is always preserved. If the file does not exist, it is created.
- **Asset directories** (`skills/`, `instructions/`, `prompts/`) - copied file-by-file; files that already exist are skipped.
- **Manifest file** (`.a11y-agent-manifest`) - tracks every file we installed. The update script uses this list to ensure it only touches files we own, never user-created agents. When contributors add new agents to the repo, those files are automatically installed on next update and added to the manifest.

**Updates are equally safe** - the update script never deletes agent files. If a file is not in the manifest (meaning you created it yourself), it will not be modified or removed.

To reinstall a specific agent from scratch, delete it first and rerun the installer (or update script).

## Install from VS Code Marketplace (Recommended)

**GitHub Copilot users (VS Code):** Install Accessibility Agents directly from the Extensions marketplace.

1. **Open Extensions** - Press `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (Mac)
2. **Search** - Type "accessibility-agents"
3. **Click Install** - One-click install of all 57 agents, 17 skills, 104 prompts, and workspace instructions
4. **Configure** - Create scan config files for your project (instructions included in README)

**What you get:**
- ✅ 57 fully-integrated agents in GitHub Copilot (VS Code and CLI)
- ✅ 17 reusable accessibility skills (WCAG rules, severity scoring, scanning patterns)
- ✅ 104 custom prompts for web audits, document audits, GitHub workflows, and developer tooling
- ✅ 5 workspace instructions (automatic WCAG AA enforcement on every chat)
- ✅ 100% source citation coverage (all agents cite authoritative standards)
- ✅ Auto-update mechanism (new agents and features arrive automatically)

For other platforms (Claude Code, Gemini, Claude Desktop, Codex), see [Getting Started](docs/getting-started.md).

## The Team

The following agents make up the accessibility enforcement team, each owning one domain.

| Agent | Role |
|-------|------|
| **accessibility-lead** | Orchestrator. Decides which specialists to invoke and runs the final review. |
| **aria-specialist** | ARIA roles, states, properties, widget patterns. Enforces the first rule of ARIA. |
| **modal-specialist** | Dialogs, drawers, popovers, alerts. Focus trapping, focus return, escape behavior. |
| **contrast-master** | Color contrast ratios, dark mode, focus indicators, color independence. |
| **keyboard-navigator** | Tab order, focus management, skip links, arrow key patterns, SPA route changes. |
| **live-region-controller** | Dynamic content announcements, toasts, loading states, search results. |
| **forms-specialist** | Labels, errors, validation, fieldsets, autocomplete, multi-step wizards. |
| **alt-text-headings** | Alt text, SVGs, icons, heading hierarchy, landmarks, page titles. |
| **tables-data-specialist** | Table markup, scope, caption, headers, sortable columns, ARIA grids. |
| **link-checker** | Ambiguous link text, "click here" detection, missing new-tab warnings. |
| **web-accessibility-wizard** | Interactive guided web audit across all eleven accessibility domains. |
| **testing-coach** | Screen reader testing, keyboard testing, automated testing guidance. |
| **wcag-guide** | WCAG 2.2 criteria in plain language, conformance levels, what changed. |
| **word-accessibility** | Microsoft Word (DOCX) document accessibility scanning. |
| **excel-accessibility** | Microsoft Excel (XLSX) spreadsheet accessibility scanning. |
| **powerpoint-accessibility** | Microsoft PowerPoint (PPTX) presentation accessibility scanning. |
| **office-scan-config** | Office scan rule configuration and preset profiles. |
| **pdf-accessibility** | PDF conformance per PDF/UA and the Matterhorn Protocol. |
| **pdf-scan-config** | PDF scan rule configuration and preset profiles. |
| **document-accessibility-wizard** | Guided document audit with cross-document analysis, VPAT export, and CSV export with help links. |
| **markdown-a11y-assistant** | Markdown documentation audit — links, alt text, headings, tables, emoji, diagrams, em-dashes, anchors. |
| **text-quality-reviewer** | Catches invisible text quality issues: template variables in alt text, code syntax as accessible names, empty labels, duplicate control labels. |

### Developer Tools Agents

The following agents support Python, wxPython, desktop accessibility, NVDA addon development, and accessibility tool building.

| Agent | Role |
|-------|------|
| **developer-hub** | Orchestrator. Routes development tasks to the right specialist from plain English. |
| **python-specialist** | Python debugging, packaging (PyInstaller/Nuitka/cx_Freeze), testing, type checking, async, optimization. |
| **wxpython-specialist** | wxPython GUI — sizer layouts, event handling, AUI, custom controls, threading, desktop accessibility. |
| **desktop-a11y-specialist** | Platform accessibility APIs (UI Automation, MSAA, ATK, NSAccessibility), screen reader Name/Role/Value/State, focus management. |
| **desktop-a11y-testing-coach** | Screen reader testing with NVDA, JAWS, Narrator, VoiceOver, Orca. Automated UIA testing, keyboard-only testing flows. |
| **a11y-tool-builder** | Build accessibility scanning tools, rule engines, document parsers, report generators, and audit automation. |
| **nvda-addon-specialist** | NVDA screen reader addon development — globalPlugins, appModules, synthDrivers, braille tables, Add-on Store submission, grounded in official NVDA source. |

### GitHub Workflow Agents

The following agents handle GitHub repository management, triage, and workflow automation.

| Agent | Role |
|-------|------|
| **github-hub** | Orchestrator. Routes GitHub management tasks to the right specialist from plain English. |
| **daily-briefing** | Morning overview - open issues, PR queue, CI status, security alerts in one report. |
| **pr-review** | PR diff analysis with confidence per finding, delta tracking, and inline comments. |
| **issue-tracker** | Issue triage - priority scoring, duplicate detection, action inference, project board sync. |
| **analytics** | Repository health scoring (0-100/A-F), velocity metrics, bottleneck detection. |
| **insiders-a11y-tracker** | Track accessibility changes in VS Code Insiders and custom repos with WCAG mapping. |
| **repo-admin** | Collaborator management, branch protection rules, access audits. |
| **team-manager** | Onboarding, offboarding, org team membership, permission management. |
| **contributions-hub** | Discussions, community health metrics, first-time contributor insights. |
| **template-builder** | Guided wizard for issue/PR/discussion templates - no YAML knowledge required. |
| **repo-manager** | Repository scaffolding - labels, CI, CONTRIBUTING, SECURITY, issue templates. |

See the [Agent Reference Guide](docs/agents/README.md) for deep dives on every agent, example prompts, behavioral constraints, and instructor-led walkthroughs.

## Documentation

### Accessibility Docs

The following guides cover web and document accessibility features.

| Guide | What It Covers |
|-------|---------------|
| [Getting Started](docs/getting-started.md) | Installation for Claude Code, Copilot (VS Code and CLI), Gemini CLI, Claude Desktop, and Codex CLI |
| [Agent Reference](docs/agents/README.md) | All 57 agents with invocation syntax, examples, and deep dives |
| [MCP Tools](docs/tools/mcp-tools.md) | Static analysis tools: heading structure, link text, form labels |
| [axe-core Integration](docs/tools/axe-core-integration.md) | Runtime scanning, agent workflow, CI/CD setup |
| [VPAT Generation](docs/tools/vpat-generation.md) | VPAT 2.5 / ACR compliance report generation |
| [Office Scanning](docs/scanning/office-scanning.md) | DOCX, XLSX, PPTX scanning with 46 built-in rules |
| [PDF Scanning](docs/scanning/pdf-scanning.md) | PDF/UA scanning with 56 built-in rules |
| [Scan Configuration](docs/scanning/scan-configuration.md) | Config files, preset profiles, CI/CD templates |
| [Custom Prompts](docs/scanning/custom-prompts.md) | Nine pre-built prompts for one-click document workflows |
| [Markdown Accessibility](docs/prompts/README.md#markdown-accessibility-prompts) | Four prompts for markdown auditing, quick checks, fix mode, and audit comparison |
| [Configuration](docs/configuration.md) | Character budget, troubleshooting |
| [Architecture](docs/architecture.md) | Project structure, why agents over skills/MCP, design philosophy |

### GitHub Workflow Docs

The following guide covers all GitHub workflow agents and their invocation syntax.

| Guide | What It Covers |
|-------|---------------|
| [GitHub Workflow Agents](docs/agents/README.md#github-workflow-agents) | All 10 workflow agents with invocation syntax, examples, and instructor-led walkthroughs |

### Advanced Guides

The following guides cover advanced configuration, cross-platform handoff, and distribution.

| Guide | What It Covers |
|-------|---------------|
| [Cross-Platform Handoff](docs/advanced/cross-platform-handoff.md) | Seamless handoff between Claude Code and Copilot |
| [Advanced Scanning Patterns](docs/advanced/advanced-scanning-patterns.md) | Background scanning, worktree isolation, large libraries |
| [Debug Panel Workflows](docs/guides/debug-panel-workflows.md) | Troubleshoot agent loading, handoffs, tool calls, and browser verification |
| [Browser Tool Usage](docs/guides/browser-tool-usage.md) | Agentic browser verification: agents autonomously verify fixes in integrated browser |
| [Plugin Packaging](docs/advanced/plugin-packaging.md) | Packaging and distributing agents for different environments |
| [Platform References](docs/advanced/platform-references.md) | External documentation sources with feature-to-source mapping |
| [Research Sources](docs/RESEARCH-SOURCES.md) | Authoritative sources (W3C APG, WebAIM, WCAG 2.2, Deque) that informed every agent rule |

## What This Covers

- WCAG 2.1 Level AA compliance
- WCAG 2.2 Level A and AA criteria (VPAT/ACR generation)
- Screen reader compatibility (VoiceOver, NVDA, JAWS)
- Keyboard-only navigation
- Focus management for SPAs, modals, and dynamic content
- Color contrast verification with automated calculation
- User preference media queries (`prefers-reduced-motion`, `prefers-contrast`, `prefers-color-scheme`, `forced-colors`, `prefers-reduced-transparency`)
- Live region implementation for dynamic updates
- Semantic HTML enforcement
- Static analysis of headings, link text, and form labels
- VPAT 2.5 / Accessibility Conformance Report generation
- Office document accessibility scanning (DOCX, XLSX, PPTX) with 46 built-in rules
- PDF document accessibility scanning per PDF/UA and the Matterhorn Protocol with 56 built-in rules
- Markdown documentation accessibility scanning across 9 domains (links, alt text, headings, tables, emoji, diagrams, em-dashes, anchors, plain language)
- SARIF 2.1.0 output for CI/CD integration
- CSV export with help documentation links for web and document audit findings
- Common framework pitfalls (React conditional rendering, Tailwind contrast failures)
- NVDA screen reader addon development (globalPlugins, appModules, synthDrivers, braille tables, Add-on Store submission)
- Desktop application accessibility (UI Automation, MSAA/IAccessible2, ATK/AT-SPI, NSAccessibility)

## Source Citation Policy

Every agent follows a formal source citation policy. AI giving accessibility advice must be held to a higher standard -- wrong guidance creates real barriers for real people.

- **No source, no claim.** If an agent cannot cite an authoritative source, it explicitly flags the recommendation as experience-based.
- **Inline citations.** Every factual claim includes a link to the source.
- **Six-tier authority hierarchy.** Normative specs (WCAG, ARIA) > Informative guidance > Platform vendor docs > AT vendor docs > Peer-reviewed experts > Government/legal.
- **Machine-readable source registry.** `SOURCE_REGISTRY.json` maps every agent domain to its designated primary authorities.
- **Automated freshness checks.** A weekly GitHub Actions workflow verifies source URLs are still live and opens issues when documentation drifts.

See [CITATION_POLICY.md](.github/agents/CITATION_POLICY.md) for the full policy.

## Roadmap

See [ROADMAP.md](ROADMAP.md) for what is planned, in progress, and shipped. Track individual items on the [roadmap issues board](https://github.com/Community-Access/accessibility-agents/issues?q=label%3Aroadmap).

## What This Does Not Cover

- Mobile native accessibility (iOS/Android). A separate agent team for that is [planned](https://github.com/Community-Access/accessibility-agents/issues/8).
- WCAG AAA compliance (agents target AA as the standard). An AAA agent is [planned](https://github.com/Community-Access/accessibility-agents/issues/12).

## Example Project

The `example/` directory contains a deliberately broken web page with 20+ intentional accessibility violations. Use it to practice with the agents and see how they catch real issues. See the [example README](example/README.md) for details.

## Contributing

### Extending the Platform

Want to add custom skills, domain-specific rules, or vertical market guidance? The platform is designed to be extended.

**Key guides:**
- [Browser Tool Usage](docs/guides/browser-tool-usage.md) - Autonomous verification with integrated browser
- [Debug Panel Workflows](docs/guides/debug-panel-workflows.md) - Troubleshoot agent behavior and tool execution traces
- [Creating Custom Skills](docs/guides/create-custom-skills.md) - Build reusable accessibility knowledge domains
- [Authoritative Sources](docs/guides/authoritative-sources.md) - Cite accessibility standards correctly
- [Context Management](docs/guides/context-management.md) - Managing long conversation contexts in audits

**Quick examples:**
- Adding a fintech accessibility skill
- Creating a healthcare-specific compliance rule set
- Building Svelte 5+ framework guidance
- Defining custom WCAG AAA rules for your team

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full contribution workflow.

### Reporting Issues & Gaps

This project exists because the community shows up. Every feature in v3.0 -- the NVDA Addon Specialist, the Text Quality Reviewer, the source citation policy, the wxPython screen reader documentation, the agentic browser tools, the lifecycle hooks strategy -- started as a community conversation. Not a roadmap item. A real person saying "this is what I need."

Whether you are a developer, accessibility specialist, screen reader user, or just someone who cares about inclusive software - there is a place for you here.

- **Found an agent gap?** [Open an issue](https://github.com/Community-Access/accessibility-agents/issues/new?template=agent_gap.yml) describing what the agent missed or got wrong.
- **Know a pattern we should catch?** Open a PR. Agent files are plain Markdown - no special tooling required.
- **Building for the blind and low vision community?** Your lived experience and domain knowledge are exactly what makes these agents better. We would love your involvement.

See the [Contributing Guide](CONTRIBUTING.md) for full details, guidelines, and how to get started.

If you find this project useful, please [star the repo](https://github.com/Community-Access/accessibility-agents) and watch for releases so you know when updates drop.

## Contributors

A sincere thanks to [Taylor Arndt](https://github.com/taylorarndt) and [Jeff Bishop](https://github.com/jeffreybishop) for leading the charge, and to every community member who has contributed to making AI coding tools more accessible.

<a href="https://github.com/Community-Access/accessibility-agents/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=community-access/accessibility-agents" alt="Contributors to Accessibility Agents" />
</a>

## Resources

- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)
- [WCAG 2.2 Understanding Documents](https://www.w3.org/WAI/WCAG22/Understanding/)
- [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WAI-ARIA 1.2 Specification](https://www.w3.org/TR/wai-aria-1.2/)
- [Deque axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [NVDA User Guide](https://www.nvaccess.org/files/nvda/documentation/userGuide.html)
- [VoiceOver User Guide](https://support.apple.com/guide/voiceover/welcome/mac)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WebAIM Screen Reader User Survey](https://webaim.org/projects/screenreadersurvey10/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [Inclusive Components](https://inclusive-components.design/)
- [Research Sources and Attribution](docs/RESEARCH-SOURCES.md) - All authoritative sources consulted to build and strengthen agent rules

## Related Projects

**[Swift Agent Team](https://github.com/taylorarndt/swift-agent-team)** - 9 specialized Swift agents for Claude Code. Swift 6.2 concurrency, Apple Foundation Models, on-device AI, SwiftUI, accessibility, security, testing, and App Store compliance.

## License

MIT

## About This Project

**Accessibility Agents** was founded by [Taylor Arndt](https://github.com/taylorarndt) (COO at [Techopolis](https://github.com/techopolis-group)) and [Jeff Bishop](https://github.com/jeffreybishop) because accessibility is how they work, not something bolted on at the end. When AI coding tools consistently failed at accessibility, they built the team they wished existed - and opened it to the world.

This is a community project. The more perspectives, lived experiences, and domain knowledge that go into it, the better it serves the blind and low vision community. If you have ideas, open a discussion. If you have fixes, open a PR. Every contribution matters.


