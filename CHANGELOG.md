# Changelog

All notable changes to the Accessibility Agents project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/Community-Access/accessibility-agents/compare/v3.0.0...HEAD
[3.0.0]: https://github.com/Community-Access/accessibility-agents/compare/v2.5...v3.0.0
[2.6.0]: https://github.com/Community-Access/accessibility-agents/releases/tag/v2.6.0
