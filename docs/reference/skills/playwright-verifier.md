# playwright-verifier Agent

**Type:** Hidden helper sub-agent (not user-invokable)  
**Platforms:** Copilot (`skills/playwright-verifier/SKILL.md`), Claude Code (`skills/playwright-verifier/SKILL.md`)  
**Invoked by:** `web-issue-fixer` after applying each fix

## Purpose

Closed-loop fix verification using Playwright. After a fix is applied, navigates to the fixed element, runs a targeted axe-core assertion or behavioral check, and reports PASS/FAIL/REGRESSION. Replaces screenshot-based verification with deterministic, assertable browser tests.

## Verification Flow

1. Receive fix context: rule ID, CSS selector, dev server URL, fix type
2. Run the appropriate verification tool based on fix type
3. Compare pre-fix and post-fix state
4. Return verdict: **PASS**, **FAIL**, or **REGRESSION**

## Fix Type → Verification Tool Mapping

Each fix type, with tool used and what is checked.

| Fix Type | Tool Used | What Is Checked |
|----------|-----------|----------------|
| `contrast` | `run_playwright_contrast_scan` | Computed colors, contrast ratio meets threshold |
| `keyboard` | `run_playwright_keyboard_scan` | Element in tab order, no traps introduced |
| `aria` | `run_playwright_a11y_tree` | Role, name, state in accessibility tree |
| `structure` | `run_playwright_a11y_tree` | Heading hierarchy, landmark structure |
| `state` | `run_playwright_state_scan` | Dynamic content accessible after interaction |
| `viewport` | `run_playwright_viewport_scan` | Reflow and touch targets at all widths |

## Test Code Generation

After a verified PASS, generates a Playwright test file that encodes the assertion for regression prevention. Test files are saved to `tests/a11y/` for inclusion in the project's test suite.

## Dependencies

Same as `playwright-scanner` — requires `playwright`, optionally enhanced by `@axe-core/playwright`.

## Related Agents

- `web-issue-fixer` — Orchestrator that dispatches this agent
- `playwright-scanner` — Scanning counterpart
