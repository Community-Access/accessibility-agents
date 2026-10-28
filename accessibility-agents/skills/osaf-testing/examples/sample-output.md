# Sample output: Testing phase

An illustration of what `osaf-testing` returns for "implement Testing actions
1 and 2". The repository, URLs and numbers are invented.

## Files

- `.github/workflows/accessibility.yml` - new job running this package's
  GitHub Action on pull requests, `scan-type: web`, `fail-on: serious`, SARIF
  uploaded to code scanning.
- `docs/accessibility-testing.md` - new. Keyboard checks for three key tasks.
- `ACCESSIBILITY.md` - one line under "Contributor expectations", CI/CD.

## Actions

Testing 1, `add-at-least-one-automated-accessibility-check`:

- Configured or documented - met, `.github/workflows/accessibility.yml`.
- Runs against relevant code - not yet: the workflow has not run on a pull
  request. Item met once the first run is on record.
- Fixed or tracked - pending the first run. A separate `run_axe_scan` of
  `http://localhost:3000` found 2 serious and 5 moderate violations; filing
  them needs approval.

Testing 2, `perform-a-keyboard-only-smoke-test-for-core-flows`:

- Documented checks for key tasks - met, `docs/accessibility-testing.md`,
  "Keyboard: sign in", "Keyboard: search", "Keyboard: export".
- The five properties confirmed:
  - "sign in" - automated evidence only. `run_playwright_keyboard_scan` on
    `http://localhost:3000/login`, Chromium 141 on Ubuntu 24.04: Tab reached
    the form's 9 elements, each with an outline style, no short focus cycle. Invoking controls and judging the order
    still need a person.
  - "search" and "export" - not yet run.
- Fixed or tracked - nothing found yet.

## Hand-offs

- `keyboard-navigator` - review `src/components/ExportDialog.tsx`, which
  opens a dialog without moving focus into it.
- `issue-tracker` - file the 7 findings from the axe-core scan, once approved.

## Tracking issue

Nothing to check yet. Testing 1 can be checked after the first run and the
findings are tracked; Testing 2 after a person runs all three tasks.
