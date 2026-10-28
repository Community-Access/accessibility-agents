# Testing action 2: Perform a keyboard-only smoke test for core flows

Part of the `osaf-testing` skill. Read this when action 2 is in scope.

- ID: `perform-a-keyboard-only-smoke-test-for-core-flows`
- Effort and cadence: Moderate; Ongoing
- Canonical source: [Testing phase, action 2](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/blob/b2ea31a2e38cbab3e774e4142575b78876b9b53f/framework/phases/testing-phase.md#2-perform-a-keyboard-only-smoke-test-for-core-flows)

## Why it matters

This action covers a high-impact baseline.

## Definition of Done

1. Key tasks have documented keyboard-only checks.
2. The checks confirm that all links and controls:
   - Can be focused by keyboard
   - Can be invoked by keyboard
   - Provide a visible focus indicator
   - Provide a logical focus order
   - Have no keyboard traps
3. Accessibility issues are fixed or tracked.

## Recommended steps, adapted from the framework

1. Identify key tasks and user journeys.
2. Document a short set of keyboard-only checks for those tasks, using the
   [keyboard-only examples](https://github.com/open-source-accessibility/accessibility-toolkit/blob/main/ACCESSIBILITY.md#contributor-expectations).
3. Run the checks without using a mouse or other pointing device.
4. Fix accessibility issues or track them.

## How to do it in this repository

1. **Name the key tasks** with the maintainer: three to five journeys a new
   user must complete (install and first run, sign in, search, submit a form,
   change a setting). Do not guess the product's core flows from the code
   alone; propose and confirm.
2. **Write the checks** into a file the project keeps, for example
   `docs/accessibility-testing.md`, or a "Keyboard checks" list under
   "Contributor expectations". One short list per task, using the template
   below.
3. **Run what can be run.** When the project can be served and there is a
   URL, the MCP tool `run_playwright_keyboard_scan` tabs through a page in a
   real browser and reports the order Tab reached elements in, whether each
   has an outline style, and a short focus cycle that suggests a trap;
   `playwright-scanner` runs it as part of a `web-accessibility-wizard` audit.
   That is partial runtime evidence: an outline style is not proof of a visible
   indicator, and a trap is flagged only when focus cycles among fewer than
   three elements. It does not compare what Tab reached against every control,
   invoke controls, judge whether the order is logical, or complete a
   multi-step task. Those need a person, or a Playwright test written
   for the flow.
4. **Review the code** for the usual causes with `keyboard-navigator`: positive
   `tabindex`, click handlers on non-focusable elements, focus not moved on
   route change or dialog open, missing skip link, outline removed. Code review
   finds likely failures; it is not the smoke test.
5. **Record each run**: date, who or what ran it, browser and operating system,
   and per check pass or fail. Mark checks no one has run as "not yet run".

## Hand-offs

- `web-accessibility-wizard` (router) - a behavioral run against a URL, which
  dispatches `playwright-scanner` for the keyboard scan.
- `keyboard-navigator`, through `accessibility-lead` - review the code behind
  each flow; returns findings.
- `testing-coach`, through `accessibility-lead` - write the keyboard procedure
  for a person to follow.
- `issue-tracker` - file the failures not fixed.

## Template: keyboard-only checks for one task

From the toolkit's contributor expectations, arranged as a test record.

```markdown
### Keyboard: <task name>

Environment: <operating system and version>, <browser and version>. Run by
<person or tool> on <date>.

Start at <URL or screen>. Do not use a mouse or other pointing device.

- [ ] Every link and control in the task can be reached with Tab and Shift+Tab.
- [ ] Every control works from the keyboard (Enter, Space, arrow keys where
      expected).
- [ ] A visible focus indicator is always present and has sufficient contrast.
- [ ] Focus order is logical: no jumps, follows the reading order.
- [ ] No keyboard trap: focus can move into and out of dialogs, menus,
      popovers and editors.
- [ ] The task can be completed end to end.

Result: <pass, or the failures with issue numbers>.
```

## Evidence to report

- Where the checks are documented, per task.
- For each check: ran (environment, date, result) or not yet run.
- The issues filed for failures.
