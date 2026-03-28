# Enhancements

**Status:** In Progress  
**Created:** 2026-03-11  
**Last Updated:** 2026-06-22

---

## Completed Enhancements

The following enhancement plans have been fully implemented and are documented in the CHANGELOG.

### Playwright Integration (v3.2.0)

All priorities P1–P7 implemented except P4.4 (component audit caching — deferred). See original plan in git history.

- **P1: Core MCP Tools** — 5 Playwright tools (keyboard, state, viewport, contrast, a11y tree)
- **P2: Agent Layer** — playwright-scanner and playwright-verifier agents, playwright-testing skill
- **P3: Wizard Integration** — Phase 0 env detection, Phase 10 behavioral testing, fix verification
- **P4: Test Generation** — Test file generation, generate-a11y-tests prompt, CI workflow template
- **P5: Cross-Analysis** — Accessibility tree diffing, keyboard flow comparison
- **P6: veraPDF** — run_verapdf_scan MCP tool with availability detection
- **P7: PDF Forms** — convert_pdf_form_to_html MCP tool with accessible HTML generation

### MCP Server Architecture (Unreleased)

- Migrated from stdio-only desktop-extension to HTTP-based MCP server
- Streamable HTTP + SSE transport, stateful/stateless modes
- 16 tools, 3 prompts, 3 resources
- Test suite with 52 tests (Node built-in test runner)
- npm publish-ready package

---

## Planned for 5.0

Full planning details: [5.0 Release Plan](docs/5.0-RELEASE-PLAN.md)

### Remediation Engine

**Status:** Planning  
**Target:** 5.0

Automated fix tools for web, Office, and PDF content exposed as MCP tools with dry-run safety model and fix verification loop. Resolves [#11](https://github.com/Community-Access/accessibility-agents/issues/11).

- `fix_office_document` -- python-docx / openpyxl / python-pptx scripts
- `fix_pdf_document` -- pdf-lib / qpdf scripts
- `fix_web_issue` -- source-level HTML/JSX/Vue/Svelte auto-fixes
- Fix verification loop: apply, re-scan, confirm, rollback on regression

### VS Code Marketplace Extension

**Status:** Planning (scaffolded at vscode-extension/)  
**Target:** 5.0

`@a11y` chat participant published to VS Code Marketplace. Agent discovery, slash commands, diagnostics integration, contrast checker status bar, audit dashboard WebView.

### Distribution Channels

**Status:** Planning  
**Target:** 5.0

- npm package publish (`@a11y-agent-team/mcp-server`)
- `npx` zero-install quickstart
- Anthropic Connectors Directory listing ([#9](https://github.com/Community-Access/accessibility-agents/issues/9))
- GitHub Marketplace reusable action

### Enterprise Compliance

**Status:** Planning  
**Target:** 5.0

Audit persistence in `.a11y-history/`, trend dashboard, VPAT generation from stored scan data, multi-repo organizational scanning, Section 508 / EN 301 549 / EAA compliance export.

---

## Remaining / Deferred

### P4.4: Component Audit Caching

**Status:** Deferred (scheduled for 5.0 Milestone 1)  
**From:** Playwright Integration Plan

Cache scanned file hashes to skip unchanged files on re-audit. Design system token changes invalidate all consumers.

- Store `{hash, findings[]}` in `.a11y-cache.json`
- Invalidation: token file changes propagate to all consumers
- Requires integration with web-accessibility-wizard Phase 0

---

## Have an Idea?

Open an [issue](https://github.com/Community-Access/accessibility-agents/issues/new) or start a [discussion](https://github.com/Community-Access/accessibility-agents/discussions).
