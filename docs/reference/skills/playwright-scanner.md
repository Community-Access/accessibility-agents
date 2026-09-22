# playwright-scanner Agent

**Type:** Hidden helper sub-agent (not user-invokable)  
**Platforms:** Copilot (`skills/playwright-scanner/SKILL.md`), Claude Code (`skills/playwright-scanner/SKILL.md`)  
**Invoked by:** `web-accessibility-wizard` during Phase 10 (Behavioral Testing)

## Purpose

Behavioral accessibility testing using Playwright. Runs live browser-based tests that detect accessibility defects which cannot be found by static code review or axe-core CLI scans — keyboard traps, focus management failures, dynamic state violations, responsive reflow issues, and computed contrast failures after CSS cascade.

## MCP Tools Used

Each tool, with what it tests.

| Tool | What It Tests |
|------|--------------|
| `run_playwright_keyboard_scan` | Tab-order sequence, keyboard traps |
| `run_playwright_state_scan` | axe-core violations in dynamic states (menus, modals, accordions) |
| `run_playwright_viewport_scan` | Reflow failures, touch target sizes at multiple viewports |
| `run_playwright_contrast_scan` | Computed foreground/background contrast ratios |
| `run_playwright_a11y_tree` | Browser accessibility tree snapshot |

## Scan Modes

- **full** — Run all 5 scan types (default)
- **keyboard-only** — Tab traversal and trap detection
- **states-only** — Dynamic state scanning
- **viewport-only** — Responsive viewport scanning
- **contrast-only** — Computed contrast verification
- **tree-only** — Accessibility tree snapshot

## Output Contract

Returns structured text with sections for each scan type, including finding counts, per-element details, and overall behavioral confidence (High/Medium/Low based on how many scans completed successfully).

## Dependencies

- **Required:** `playwright` (npm package)
- **Optional enhancement:** `@axe-core/playwright` (enables state scan and viewport scan)
- **Graceful degradation:** Runs available scans, reports which are unavailable

## Skills

- `playwright-testing` — Scan patterns, test templates, CI integration
- `web-severity-scoring` — Finding severity classification

## Related Agents

- `web-accessibility-wizard` — Orchestrator that dispatches this agent
- `playwright-verifier` — Fix verification counterpart
- `cross-page-analyzer` — Consumes accessibility tree diffs across pages
