# Playwright Integration — Enhancement Plan

**Status:** Planning  
**Created:** 2026-03-11  
**Last Updated:** 2026-03-11

---

## Problem Statement

The current accessibility agent ecosystem operates on two assessment layers:

1. **Static code review** — 13 specialist agents analyze source files for patterns and anti-patterns.
2. **Runtime rule scanning** — The `run_axe_scan` MCP tool shells out to `@axe-core/cli` against a live URL and returns WCAG violations.

These layers miss an entire class of accessibility defects that can only be detected by **interacting with the rendered page**:

| Gap | Example | WCAG SC |
|-----|---------|---------|
| Keyboard traps | Focus enters a date picker and cannot leave | 2.1.2 |
| Broken tab order | Visual layout suggests left-to-right, actual tab order jumps randomly | 2.4.3 |
| Focus not managed after state change | Modal opens but focus stays behind the overlay | 2.4.3, 2.4.7 |
| Violations in dynamic states | Accordion content has no headings, but only visible when expanded | Multiple |
| Responsive reflow failures | Content requires horizontal scrolling at 320px | 1.4.10 |
| Computed contrast after CSS cascade | `color: inherit` chains produce insufficient contrast after resolution | 1.4.3 |
| Touch targets too small at mobile viewports | CSS math + flex layout produces 18px rendered targets | 2.5.8 |

Additionally, the current fix verification workflow (`web-issue-fixer`) relies on screenshots rather than asserting that the underlying axe-core violation is actually resolved. Fixes are not converted into persistent regression tests.

## Proposed Solution

Add **Playwright** as a third assessment layer. Playwright drives a real browser, enabling behavioral testing that neither static analysis nor axe-core CLI can perform. The integration uses `@axe-core/playwright` (an officially maintained package by Deque) for in-context scanning.

All new components follow the existing MCP tool architecture established by `run_axe_scan` in `desktop-extension/server/index.js`. Playwright is an **optional** dependency — the full existing workflow continues to function without it.

---

## Architecture

```text
                        ┌──────────────────────────┐
                        │  web-accessibility-wizard │
                        └──────────┬───────────────┘
                                   │
             ┌─────────────────────┼─────────────────────┐
             │                     │                      │
       Layer 1               Layer 2                Layer 3 (NEW)
    ┌────────────┐      ┌──────────────┐      ┌──────────────────┐
    │  Static    │      │  Runtime     │      │  Behavioral      │
    │  Analysis  │      │  Rule Scan   │      │  Testing         │
    ├────────────┤      ├──────────────┤      ├──────────────────┤
    │ 13 agents  │      │ run_axe_scan │      │ playwright-      │
    │ (code      │      │ MCP tool     │      │ scanner (agent)  │
    │  review)   │      │ (@axe-core/  │      │                  │
    │            │      │  cli)        │      │ Uses MCP tools:  │
    │            │      │              │      │ - keyboard scan   │
    │            │      │              │      │ - state scan      │
    │            │      │              │      │ - viewport scan   │
    │            │      │              │      │ - contrast calc   │
    │            │      │              │      │ - a11y tree snap  │
    └─────┬──────┘      └──────┬───────┘      └────────┬─────────┘
          │                    │                       │
          └────────────────────┼───────────────────────┘
                               │
                    ┌──────────▼───────────┐
                    │ Three-source         │
                    │ correlation          │
                    │ (cross-page-analyzer │
                    │  enhanced)           │
                    └──────────┬───────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
         ┌──────▼─────┐ ┌─────▼──────┐ ┌─────▼──────┐
         │ Report +   │ │ Fix Mode   │ │ Test Gen   │
         │ Scorecard  │ │ (web-issue │ │ (Playwright │
         │            │ │ -fixer +   │ │ test files  │
         │            │ │ playwright-│ │ for CI)     │
         │            │ │ verifier)  │ │             │
         └────────────┘ └────────────┘ └─────────────┘
```

## Dependencies

| Package | Purpose | Install |
|---------|---------|---------|
| `playwright` | Browser automation | `npm install -D playwright && npx playwright install chromium` |
| `@axe-core/playwright` | axe-core integration for Playwright | `npm install -D @axe-core/playwright` |

Both are optional. Agents detect availability at runtime and degrade gracefully.

---

## Priority 1 — Core Behavioral Testing Tools

These components use proven Playwright APIs with deterministic, structured output. They follow the same MCP tool pattern as the existing `run_axe_scan` tool. No new architectural patterns required.

### P1.1: MCP Tool — `run_playwright_keyboard_scan`

**What it does:** Launches Playwright, loads a URL, presses Tab repeatedly, records which element receives focus after each press. Returns the complete tab-order sequence with element metadata.

**API surface:**

- Input: `url` (required), `maxTabs` (optional, default 100), `selector` (optional, scope to container)
- Output: Ordered array of `{index, tagName, role, name, id, classList, tabIndex, isTrap}` where `isTrap` is true if the same element received focus twice consecutively (potential keyboard trap)

**Why high confidence:**

- `page.keyboard.press('Tab')` — stable Playwright API since v1.0
- `page.evaluate(() => document.activeElement)` — standard DOM API
- Boolean trap detection: same `activeElement` after N consecutive tabs
- No interpretation needed — returns raw data for agents to analyze

**WCAG coverage:** 2.1.1 (Keyboard), 2.1.2 (No Keyboard Trap), 2.4.3 (Focus Order)

### P1.2: MCP Tool — `run_playwright_state_scan`

**What it does:** Clicks interactive triggers (buttons, disclosure widgets, menu toggles), waits for DOM change, runs `@axe-core/playwright` against the newly revealed content. Catches violations that only exist in expanded/active states.

**API surface:**

- Input: `url` (required), `triggers[]` (optional — CSS selectors to click; if omitted, auto-discovers clickable elements with `aria-expanded`, `aria-haspopup`, or disclosure patterns), `axeTags` (optional, defaults to WCAG 2.2 AA)
- Output: Array of `{trigger, stateDescription, axeViolations[]}` per triggered state

**Why high confidence:**

- `page.click(selector)` — stable Playwright API
- `page.waitForSelector()` / `page.waitForTimeout()` — standard state-change detection
- `new AxeBuilder({page}).include(selector).withTags(tags).analyze()` — official `@axe-core/playwright` API, documented and maintained by Deque

**WCAG coverage:** All applicable SC, evaluated in each dynamic state (expanded accordions, open menus, visible tooltips, populated dropdowns)

### P1.3: MCP Tool — `run_playwright_viewport_scan`

**What it does:** Runs axe-core at multiple viewport widths. Measures rendered touch target sizes. Detects horizontal scroll overflow.

**API surface:**

- Input: `url` (required), `viewports[]` (optional, defaults to `[320, 768, 1024, 1440]`), `measureTargets` (optional boolean, default true)
- Output: Per viewport: `{width, axeViolations[], horizontalScrollDetected, touchTargets[{selector, width, height, meetsMinimum}]}`

**Why high confidence:**

- `page.setViewportSize()` — stable Playwright API
- `element.getBoundingClientRect()` — standard DOM API, returns exact rendered pixel dimensions
- `document.documentElement.scrollWidth > window.innerWidth` — one boolean check
- axe-core scan per viewport uses same proven `AxeBuilder` pattern

**WCAG coverage:** 1.4.10 (Reflow), 2.5.5 (Target Size Enhanced), 2.5.8 (Target Size Minimum)

### P1.4: MCP Tool — `run_playwright_contrast_scan`

**What it does:** Extracts computed foreground and background colors for every text element on the page after full CSS cascade resolution. Computes actual contrast ratios.

**API surface:**

- Input: `url` (required), `selector` (optional, scope to container)
- Output: Array of `{selector, text, foreground, background, contrastRatio, fontSize, fontWeight, required (4.5 or 3.0), pass}`

**Why high confidence:**

- `window.getComputedStyle(el).color` and `.backgroundColor` — standard DOM APIs
- WCAG relative luminance and contrast ratio formulas are well-defined math (already implemented in the workspace's Check Contrast task)
- Resolves the CSS cascade, inheritance, transparency, and overlay stacking that static analysis cannot compute

**WCAG coverage:** 1.4.3 (Contrast Minimum), 1.4.6 (Contrast Enhanced)

### P1.5: MCP Tool — `run_playwright_a11y_tree`

**What it does:** Captures the full accessibility tree as seen by the browser's accessibility API.

**API surface:**

- Input: `url` (required), `selector` (optional, root element)
- Output: Serialized accessibility tree JSON from `page.accessibility.snapshot({interestingOnly: false})`

**Why high confidence:**

- `page.accessibility.snapshot()` — built-in Playwright API, returns structured JSON
- No parsing or interpretation — returns raw tree data
- Useful input for `cross-page-analyzer` tree-level pattern detection

**WCAG coverage:** Structural foundation for all SC (landmarks, headings, roles, names, states)

---

## Priority 2 — Agent Layer (Orchestration)

These agents consume the MCP tools from P1 and fit into the existing web-accessibility-wizard workflow. They follow the same agent patterns as `scanner-bridge` and `lighthouse-bridge`.

### P2.1: Agent — `playwright-scanner` (hidden helper)

**Role:** Read-only behavioral testing agent. Invoked by `web-accessibility-wizard` during a new Phase 10.

**Action set:** Calls P1 MCP tools, aggregates results, returns structured findings. Never edits files.

**Capabilities:**

- Keyboard flow mapping (via P1.1)
- Dynamic state scanning (via P1.2)
- Responsive viewport scanning (via P1.3)
- Rendered contrast verification (via P1.4)
- Accessibility tree extraction (via P1.5)
- Focus management tests: click modal trigger → check `activeElement` → close modal → check `activeElement` returns (combination of P1.1 keyboard scanning and P1.2 state triggering)

**Output contract:**

```json
{
  keyboard_flow: [{element, role, name, tab_index, trap_detected}],
  focus_tests:   [{trigger, expected_target, actual_target, pass}],
  state_scans:   [{trigger, state_name, axe_violations[]}],
  viewport_results: [{width, axe_violations[], horizontal_scroll, target_sizes[]}],
  contrast_issues: [{selector, text, ratio, required, pass}],
  a11y_tree:     {snapshot JSON}
}
```

**Files:** `.github/agents/playwright-scanner.agent.md`, `.claude/agents/playwright-scanner.md`

### P2.2: Agent — `playwright-verifier` (hidden helper)

**Role:** Read-only fix verification agent. Invoked by `web-issue-fixer` after applying each fix.

**Action set:** Navigates to the fixed element, runs a targeted axe-core assertion, reports PASS/FAIL/REGRESSION. Never edits files.

**Workflow per fix:**

1. Receive: fix number, axe-core rule ID, element selector, dev server URL
2. Navigate Playwright to the page
3. Run `new AxeBuilder({page}).include(selector).withRules([ruleId]).analyze()`
4. If original violation absent and no new violations → `PASS`
5. If original violation still present → `FAIL` with current DOM state
6. If original violation absent but new violations introduced → `REGRESSION` with details

**Output contract:**

```json
{
  fix_number, rule_id, selector,
  verification: "PASS" | "FAIL" | "REGRESSION",
  remaining_violations: [],
  new_violations: []
}
```

**Files:** `.github/agents/playwright-verifier.agent.md`, `.claude/agents/playwright-verifier.md`

### P2.3: Skill — `playwright-testing`

**Purpose:** Reusable knowledge module providing Playwright + axe-core integration patterns, test generation templates, CI configuration, and graceful degradation guidance.

**Contents:**

- `@axe-core/playwright` usage patterns (scan page, scan element, scan after interaction)
- Keyboard traversal test templates
- Focus management test templates
- State-based scanning patterns
- CI integration (GitHub Actions with `playwright-github-action`)
- Graceful degradation: detect Playwright availability, fall back to existing tools

**File:** `.github/skills/playwright-testing/SKILL.md`

---

## Priority 3 — Wizard & Workflow Integration

These changes modify existing agents to incorporate the new Playwright layer.

### P3.1: Web Accessibility Wizard — Phase 0 Enhancement

Add environment detection to the existing Phase 0 discovery:

- Probe common dev server ports (3000, 5173, 8080, 4200, 8000) to detect running servers
- Check if Playwright is installed (`npx playwright --version`)
- If both available, offer "Interactive scan" alongside existing "Code review" and "axe-core" options
- Store detection results in the scan context block passed to sub-agents

**File changes:** `.github/agents/web-accessibility-wizard.agent.md`, `.claude/agents/web-accessibility-wizard.md`

### P3.2: Web Accessibility Wizard — New Phase 10 (Behavioral Testing)

Insert after existing Phase 9 (axe-core runtime scan):

1. Dispatch `playwright-scanner` with the dev server URL and scan profile
2. Receive structured results (keyboard flow, state scans, viewport results, contrast, a11y tree)
3. Merge findings with Phase 1-9 results for three-source correlation
4. Phase 10 is skipped entirely if Playwright is unavailable or no dev server is running

**File changes:** Same wizard agent files as P3.1

### P3.3: Web Issue Fixer — Verification Loop

Replace screenshot-based verification with `playwright-verifier` dispatch:

- After applying each fix, invoke `playwright-verifier` with the rule ID and element selector
- Report verification status (PASS/FAIL/REGRESSION) alongside the fix result
- If REGRESSION detected, trigger existing Revert-First Policy
- Graceful degradation: if Playwright unavailable, fall back to current screenshot + "manual verification recommended" behavior

**File changes:** `.github/agents/web-issue-fixer.agent.md`, `.claude/agents/web-issue-fixer.md`

### P3.4: Severity Scoring — Three-Source Confidence Tier

Update the web-severity-scoring skill to add a "Confirmed" confidence level:

| Source Combination | Confidence | Weight |
|-------------------|------------|--------|
| Agent + axe-core + Playwright | Confirmed | 1.2x |
| Any two sources | High | 1.0x (current) |
| Single source, definitive | Medium | 0.7x (current) |
| Single source, contextual | Low | 0.3x (current) |

**File changes:** `.github/skills/web-severity-scoring/SKILL.md`

---

## Priority 4 — Test Generation & CI

### P4.1: Test File Generation

After a verified fix, `playwright-verifier` outputs a Playwright test file that encodes the assertion. The agent generates test code using `@axe-core/playwright` patterns from the `playwright-testing` skill.

Example generated test:

```javascript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('fix: image-alt on hero image', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .include('.hero-image')
    .withRules(['image-alt'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

Test files are saved to `tests/a11y/` and offered to the user for inclusion in their test suite.

**File changes:** `playwright-verifier` agent files, `playwright-testing` skill

### P4.2: Prompt — `generate-a11y-tests`

User-facing prompt that reads an existing audit report and generates a Playwright test suite covering each finding.

**File:** `.github/prompts/generate-a11y-tests.prompt.md`

### P4.3: CI Workflow Template

GitHub Actions workflow that runs the generated Playwright accessibility test suite on every pull request.

**File:** Template in `docs/` or `templates/` — not auto-installed into user repos

### P4.4: Component Audit Caching

On first audit, hash each scanned file → store `{hash, findings[]}` in `.a11y-cache.json`. On subsequent audits, skip files whose hash has not changed. Invalidation: design system token file changes invalidate all consumers.

**File changes:** `web-accessibility-wizard` agent files, new cache management logic in Phase 0

---

## Priority 5 — Cross-Analysis Enhancements

### P5.1: Cross-Page Analyzer — Tree Diffing

Use accessibility tree snapshots from `playwright-scanner` to compare structural consistency across pages:

- Navigation landmark present on some pages but missing on others
- Heading levels that shift between pages (H1 on homepage, H2 on subpages for same content)
- Inconsistent ARIA landmark labeling

**File changes:** `.github/agents/cross-page-analyzer.agent.md`, `.claude/agents/cross-page-analyzer.md`

### P5.2: Cross-Page Analyzer — Keyboard Flow Comparison

Compare tab-order sequences across pages to detect inconsistent navigation patterns (nav items in different order on different pages).

**File changes:** Same cross-page-analyzer agent files

---

## Priority 6 — veraPDF Integration (PDF/UA Deep Validation)

The existing `scan_pdf_document` MCP tool uses a custom regex-based parser that reads the PDF binary as latin1 and matches structural markers. This catches ~70% of real-world issues but fundamentally **cannot validate object relationships** — it detects presence/absence of tagged structures, not whether those structures are semantically correct.

**veraPDF** is the reference implementation for PDF/UA (ISO 14289) validation. It is:

- **Cross-platform** — Java-based, runs on Windows, macOS, and Linux
- **Open source** — Apache 2.0 / MPL-2.0 dual licensed
- **Authoritative** — Used by PDF Association, Library of Congress, and EU accessibility bodies
- **CLI-accessible** — `verapdf --flavour ua1 --format json file.pdf`

### P6.1: MCP Tool — `run_verapdf_scan`

**What it does:** Shells out to `verapdf` CLI, parses JSON output, maps findings to the existing rule layer structure, and returns structured results compatible with the document-accessibility-wizard workflow.

**API surface:**

- Input: `filePath` (required), `flavour` (optional, default `ua1`, also supports `ua2`), `reportPath` (optional markdown output), `sarifPath` (optional SARIF 2.1.0 output)
- Output: veraPDF findings mapped to PDFUA rule IDs, with veraPDF-specific detail (clause references, test numbers, object context)

**Why high confidence:**

- `child_process.execFile('verapdf', [...args])` — standard Node.js subprocess API
- veraPDF `--format json` output is well-documented and stable (JSON schema versioned)
- No interpretation needed — veraPDF already maps to Matterhorn Protocol checkpoints
- Results merge naturally with existing `scan_pdf_document` findings via rule ID correlation

**Coverage gap filled:**

| Capability | Regex Parser | veraPDF |
|---|---|---|
| Detect missing structure tree | Yes | Yes |
| Validate structure tree parent-child semantics | No | Yes |
| Parse content streams for marked content | No | Yes |
| Follow cross-reference tables to validate object linkage | No | Yes |
| Verify role maps resolve to standard types | No | Yes |
| Validate Headers attribute points to valid TH cells | No | Yes |
| Check font embedding completeness | Heuristic | Full |
| Full Matterhorn Protocol (136 failure conditions) | ~30 rules | All 136 |

### P6.2: Two-Tier Scan Workflow

Update `document-accessibility-wizard` and `pdf-accessibility` agents:

1. **Tier 1 (always):** Run `scan_pdf_document` (zero-dependency regex parser, <100ms)
2. **Tier 2 (if available):** Run `run_verapdf_scan` (full PDF/UA validation, 2-10s)
3. **Merge findings:** Correlate by rule ID, boost confidence when both agree
4. **Report:** Show which tier detected each finding

### P6.3: Availability Detection

Same pattern as Playwright:

- Probe `verapdf --version` once, cache result
- `isVeraPdfAvailable()` — lazy, cached, non-blocking
- Graceful degradation: regex-only scan if veraPDF not installed
- Report: "For full PDF/UA conformance, install veraPDF: <https://verapdf.org/software/>"

### P6.4: Confidence Scoring Integration

Update severity scoring for document audits:

| Source Combination | Confidence | Weight |
|---|---|---|
| Regex parser + veraPDF agree | Confirmed | 1.2x |
| veraPDF only (structural finding regex can't detect) | High | 1.0x |
| Regex parser only | Medium | 0.7x |
| Human review flag | Low | 0.3x |

**File:** `desktop-extension/server/verapdf-tools.js`, `desktop-extension/server/index.js`, `desktop-extension/manifest.json`, `desktop-extension/package.json`

---

## Priority 7 — PDF Form-to-Accessible-HTML Converter

PDF forms (AcroForm) are inherently inaccessible to many users — screen readers struggle with nested form field annotations, tab order is often undefined, and field labels may not be programmatically associated. Converting PDF forms to accessible HTML5 forms removes these barriers.

### P7.1: MCP Tool — `convert_pdf_form_to_html`

**What it does:** Reads a PDF file, extracts all AcroForm fields using `pdf-lib`, and generates a fully accessible HTML5 form with proper semantic markup.

**API surface:**

- Input: `filePath` (required), `title` (optional, defaults to filename)
- Output: Complete HTML document with extracted fields, plus a field inventory summary

**Field type mapping:**

| PDF Field Type | HTML Element | Accessibility Features |
|---------------|-------------|----------------------|
| `/FT /Tx` (text) | `<input type="text">` | `<label>` with `for/id`, `maxlength`, `aria-required` |
| `/FT /Tx` (multiline) | `<textarea>` | `<label>` with `for/id`, `aria-required` |
| `/FT /Btn` (checkbox) | `<input type="checkbox">` | `<label>` adjacent, `checked` state preserved |
| `/FT /Btn` (radio) | `<input type="radio">` in `<fieldset>` | `<fieldset>` + `<legend>`, each option labeled |
| `/FT /Ch` (dropdown) | `<select>` | `<label>` with `for/id`, options preserved |
| `/FT /Ch` (list) | `<select multiple>` | `<label>`, `multiple` attribute |
| Button | `<button>` | Visible label text |
| Signature | Descriptive text | Explains signature requirement |

**Accessibility guarantees:**

- Every input has an associated `<label>` with `for/id` binding
- Radio button groups wrapped in `<fieldset>` with `<legend>`
- Required fields marked with `aria-required="true"` and visual indicator
- 2px focus outlines for keyboard users
- High contrast borders (4.6:1 against white background)
- Responsive layout with proper font sizing
- Read-only fields marked with `readonly` attribute and visual notice

**Reliability:**

- **High** for standard AcroForm PDFs (text, checkbox, radio, dropdown) — 80-90% of real-world forms
- **Medium** for calculated fields — values extracted but formulas not converted
- **Low** for XFA forms — pdf-lib cannot parse XFA
- **Not possible** for flattened forms — fields are baked into the page content

**Dependencies:** `pdf-lib` (MIT, pure JavaScript, no native dependencies)

**File:** `desktop-extension/server/pdf-form-tools.js`, `desktop-extension/server/index.js`, `desktop-extension/manifest.json`, `desktop-extension/package.json`

---

## What Is Explicitly Out of Scope (v1)

These items were evaluated and deferred due to low confidence, high maintenance cost, or insufficient reliability:

| Item | Reason for Deferral |
|------|-------------------|
| Screen reader output simulation | No tool can reliably predict what NVDA/JAWS/VoiceOver will actually announce. The accessible name computation API (`computedName`) is included via a11y tree snapshots, but simulating full SR output is unreliable. |
| Video recording of keyboard traversal | Large files, complex embedding, inaccessible to screen reader users. Text-based tab-order sequences are the primary evidence format. |
| Interactive HTML report with persistent state | Adds application-level complexity for marginal benefit. Static HTML reports with expandable sections are sufficient. |
| Deploy preview scanning (Vercel/Netlify hooks) | Platform-specific integrations with high maintenance cost. Users can run the generated test suite against any URL. |
| PR inline annotations | High false-positive risk on individual lines. PR-level summary comments are achievable but deferred to post-v1. |
| Multi-browser axe-core scanning | `@axe-core/playwright` officially supports Chromium. Running in Firefox/WebKit may produce different results. Structural checks (keyboard, tree) can use multiple browsers, but rule scanning stays Chromium-only. |
| Forced colors / high contrast emulation | `emulateMediaFeatures` works in Chromium only and is an approximation of actual Windows High Contrast Mode. Real testing requires native OS settings. |
| Design system runtime verification via generated pages | Requires knowing component APIs. If Storybook exists, users can run Playwright against existing stories. Auto-generating test pages is fragile. |
| CLS impact on assistive technology | No standardized relationship between CLS metrics and screen reader behavior. |

---

## Graceful Degradation

| Playwright Installed? | Dev Server Running? | Behavior |
|----------------------|--------------------|---------|
| Yes | Yes | Full behavioral testing (Phase 10) + closed-loop fix verification |
| Yes | No | Phase 10 skipped. Note in report: "Start dev server for behavioral testing." |
| No | Yes | axe-core CLI only (current behavior). Note: "Install Playwright for keyboard, focus, and state testing." |
| No | No | Code review only (current behavior). No degradation from today's experience. |

No existing workflow changes. No existing agent behavior changes. Playwright adds a layer; it does not replace or modify any current functionality.

---

## Files to Create or Modify

### New Files

| File | Type | Priority |
|------|------|----------|
| `desktop-extension/server/playwright-tools.js` | MCP tool implementations (P1.1–P1.5) | P1 |
| `.github/skills/playwright-testing/SKILL.md` | Skill document | P2 |
| `.github/agents/playwright-scanner.agent.md` | Copilot agent definition | P2 |
| `.github/agents/playwright-verifier.agent.md` | Copilot agent definition | P2 |
| `.claude/agents/playwright-scanner.md` | Claude Code agent definition | P2 |
| `.claude/agents/playwright-verifier.md` | Claude Code agent definition | P2 |
| `docs/agents/playwright-scanner.md` | Documentation | P2 |
| `docs/agents/playwright-verifier.md` | Documentation | P2 |
| `docs/tools/playwright-integration.md` | Tool documentation | P2 |
| `.github/prompts/generate-a11y-tests.prompt.md` | User-facing prompt | P4 |
| `desktop-extension/server/verapdf-tools.js` | veraPDF MCP tool implementation | P6 |
| `docs/tools/verapdf-integration.md` | Tool documentation | P6 |

### Modified Files

| File | Change | Priority |
|------|--------|----------|
| `desktop-extension/server/index.js` | Import and register Playwright tools | P1 |
| `desktop-extension/manifest.json` | Register new tool names | P1 |
| `desktop-extension/package.json` | Add `playwright` and `@axe-core/playwright` as optional peer dependencies | P1 |
| `.github/agents/web-accessibility-wizard.agent.md` | Phase 0 env detection, Phase 10 behavioral testing | P3 |
| `.claude/agents/web-accessibility-wizard.md` | Same changes, Claude Code format | P3 |
| `.github/agents/web-issue-fixer.agent.md` | Verification loop with `playwright-verifier` | P3 |
| `.claude/agents/web-issue-fixer.md` | Same changes, Claude Code format | P3 |
| `.github/skills/web-severity-scoring/SKILL.md` | Add Confirmed confidence tier | P3 |
| `.github/agents/cross-page-analyzer.agent.md` | Tree diffing, keyboard flow comparison | P5 |
| `.claude/agents/cross-page-analyzer.md` | Same changes, Claude Code format | P5 |
| `.github/agents/AGENTS.md` | Update team definitions | P3 |
| `.claude/AGENTS.md` | Update team definitions | P3 |
| `.github/copilot-instructions.md` | Add playwright-scanner, playwright-verifier to hidden helpers table | P3 |
| `CLAUDE.md` | Add playwright-scanner, playwright-verifier to hidden helpers | P3 |
| `docs/guides/browser-tool-usage.md` | Add Playwright verification patterns | P3 |
| `docs/tools/axe-core-integration.md` | Add Playwright as complementary tool | P3 |
| `prd.md` | Add Playwright tools to MCP server section | P3 |

---

## Implementation Tracking

### Priority 1 — Core MCP Tools

- [x] P1.1 — `run_playwright_keyboard_scan` MCP tool
- [x] P1.2 — `run_playwright_state_scan` MCP tool
- [x] P1.3 — `run_playwright_viewport_scan` MCP tool
- [x] P1.4 — `run_playwright_contrast_scan` MCP tool
- [x] P1.5 — `run_playwright_a11y_tree` MCP tool
- [x] P1.6 — Register tools in `index.js` and `manifest.json`
- [x] P1.7 — Add optional peer dependencies to `package.json`
- [x] P1.8 — Playwright availability detection utility (shared by all tools)

### Priority 2 — Agent Layer

- [x] P2.1 — `playwright-scanner` agent (Copilot format)
- [x] P2.2 — `playwright-scanner` agent (Claude Code format)
- [x] P2.3 — `playwright-verifier` agent (Copilot format)
- [x] P2.4 — `playwright-verifier` agent (Claude Code format)
- [x] P2.5 — `playwright-testing` skill document
- [x] P2.6 — Agent documentation (`docs/agents/`)
- [x] P2.7 — Tool documentation (`docs/tools/playwright-integration.md`)

### Priority 3 — Wizard & Workflow Integration

- [x] P3.1 — Web accessibility wizard: Phase 0 environment detection
- [x] P3.2 — Web accessibility wizard: Phase 10 behavioral testing
- [x] P3.3 — Web issue fixer: playwright-verifier integration
- [x] P3.4 — Web severity scoring: three-source confidence tier
- [x] P3.5 — Update AGENTS.md team definitions (both platforms)
- [x] P3.6 — Update copilot-instructions.md and CLAUDE.md
- [x] P3.7 — Update prd.md with new MCP tools
- [x] P3.8 — Update browser-tool-usage.md guide
- [x] P3.9 — Update axe-core-integration.md guide

### Priority 4 — Test Generation & CI

- [x] P4.1 — Test file generation in `playwright-verifier`
- [x] P4.2 — `generate-a11y-tests` prompt
- [x] P4.3 — GitHub Actions CI workflow template
- [ ] P4.4 — Component audit caching (`.a11y-cache.json`)

### Priority 5 — Cross-Analysis

- [x] P5.1 — Cross-page analyzer: accessibility tree diffing
- [x] P5.2 — Cross-page analyzer: keyboard flow comparison

### Priority 6 — veraPDF Integration

- [x] P6.1 — `run_verapdf_scan` MCP tool in `verapdf-tools.js`
- [x] P6.2 — Register tool in `index.js` and `manifest.json`
- [x] P6.3 — veraPDF availability detection (`isVeraPdfAvailable()`)
- [x] P6.4 — Update `document-accessibility-wizard` for two-tier scanning
- [x] P6.5 — Update `pdf-accessibility` agent for veraPDF integration
- [x] P6.6 — Confidence scoring integration for document audits
- [x] P6.7 — Tool documentation (`docs/tools/verapdf-integration.md`)

### Priority 7 — PDF Form-to-Accessible-HTML Converter

- [x] P7.1 — `convert_pdf_form_to_html` MCP tool in `pdf-form-tools.js`
- [x] P7.2 — Register tool in `index.js` and `manifest.json`
- [x] P7.3 — Add `pdf-lib` as optional peer dependency
- [x] P7.4 — Field type mapping: text, textarea, checkbox, radio, dropdown, multi-select, button, signature
- [x] P7.5 — Accessible HTML generation with labels, fieldsets, ARIA, keyboard styles
- [x] P7.6 — Tool documentation (`docs/tools/pdf-form-converter.md`)
