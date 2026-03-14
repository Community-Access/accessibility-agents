# Playwright Integration

Playwright provides the third assessment layer in the accessibility agent ecosystem — behavioral testing of rendered, interactive web pages.

## Architecture

```text
Layer 1: Static Analysis     → 13 specialist agents review source code
Layer 2: Runtime Rule Scan   → run_axe_scan (axe-core CLI against live URL)
Layer 3: Behavioral Testing  → Playwright MCP tools (browser interaction)
```

## MCP Tools

### run_playwright_keyboard_scan

Presses Tab repeatedly, recording which element receives focus after each press. Detects keyboard traps (same element receives focus on consecutive tabs) and unreachable interactive elements.

**Parameters:**

- `url` (required) — Page URL to scan
- `maxTabs` (optional, default 100) — Maximum Tab presses
- `selector` (optional) — CSS selector to scope the scan

**WCAG:** 2.1.1, 2.1.2, 2.4.3

### run_playwright_state_scan

Clicks interactive triggers (buttons, disclosure widgets, menu toggles), waits for DOM changes, runs axe-core against revealed content. Catches violations that only exist in expanded/active states.

**Parameters:**

- `url` (required) — Page URL
- `triggers` (optional) — CSS selectors to click; auto-discovers if omitted
- `axeTags` (optional) — axe-core tags to check

**Requires:** `@axe-core/playwright`

### run_playwright_viewport_scan

Runs axe-core at multiple viewport widths. Measures rendered touch target sizes. Detects horizontal scroll overflow.

**Parameters:**

- `url` (required) — Page URL
- `viewports` (optional, default [320, 768, 1024, 1440]) — Viewport widths in pixels
- `measureTargets` (optional, default true) — Whether to measure touch target sizes

**Requires:** `@axe-core/playwright`  
**WCAG:** 1.4.10, 2.5.5, 2.5.8

### run_playwright_contrast_scan

Extracts computed foreground and background colors for text elements after full CSS cascade resolution. Computes actual contrast ratios using WCAG relative luminance formula.

**Parameters:**

- `url` (required) — Page URL
- `selector` (optional) — CSS selector to scope the scan

**WCAG:** 1.4.3, 1.4.6

### run_playwright_a11y_tree

Captures the full accessibility tree as seen by the browser's accessibility API via `page.accessibility.snapshot()`.

**Parameters:**

- `url` (required) — Page URL
- `selector` (optional) — Root element selector

**WCAG:** Structural foundation for all SC

## Installation

```bash
npm install -D playwright @axe-core/playwright
npx playwright install chromium
```

Both packages are optional peer dependencies. All existing workflows continue to function without them.

## Graceful Degradation

| Playwright | @axe-core/playwright | Available |
|---|---|---|
| Installed | Installed | All 5 tools |
| Installed | Not installed | keyboard, contrast, tree (3 tools) |
| Not installed | — | None — existing static + axe-core workflow unchanged |

## Agent Integration

- **playwright-scanner** — Orchestrates all 5 tools for comprehensive behavioral testing
- **playwright-verifier** — Runs targeted checks after fixes for PASS/FAIL/REGRESSION verdicts
- **web-accessibility-wizard** — Dispatches playwright-scanner in Phase 10
- **web-issue-fixer** — Dispatches playwright-verifier after each fix

## Security

- URLs validated to http/https protocols only (no file://, javascript:, data:)
- CSS selectors validated against shell metacharacters
- All `page.evaluate()` calls use parameterized form (no string interpolation)
- All loops are capped (500 tabs, 20 triggers, 200 text elements, 15 targets)
- Browser instances cleaned up in try/finally blocks
