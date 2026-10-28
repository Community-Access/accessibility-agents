# Testing action 1: Add at least one automated accessibility check

Part of the `osaf-testing` skill. Read this when action 1 is in scope.

- ID: `add-at-least-one-automated-accessibility-check`
- Effort and cadence: Moderate; Initial setup + ongoing
- Canonical source: [Testing phase, action 1](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/blob/b2ea31a2e38cbab3e774e4142575b78876b9b53f/framework/phases/testing-phase.md#1-add-at-least-one-automated-accessibility-check)

## Why it matters

This action helps catch common regressions.

## Definition of Done

1. At least one automated accessibility check is configured or documented.
2. The check runs against relevant project code or flows.
3. Accessibility issues are fixed or tracked.

## Recommended steps, adapted from the framework

1. Review the guidance on
   [testing continuously](https://opensource.guide/accessibility-best-practices-for-your-project/#test-accessibility-continuously).
2. Select an appropriate tool such as
   [Accessibility Insights](https://accessibilityinsights.io/downloads/). Other
   options include [eslint-plugin-jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y),
   [WAVE](https://wave.webaim.org/), the
   [axe DevTools Chrome extension](https://chromewebstore.google.com/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd),
   and the [GitHub Accessibility Scanner](https://github.com/github/accessibility-scanner).
3. Configure the test or document the decision in your project documentation.
4. Run the check against relevant project code or user flows.
5. Ensure accessibility issues from CI/CD checks are tracked.
6. Fix accessibility issues or track them, using the
   [accessibility issue template example](https://github.com/open-source-accessibility/accessibility-toolkit/blob/main/.github/ISSUE_TEMPLATE/accessibility.yml)
   for guidance.

## Choose the check from what the repository contains

Inspect first: existing workflows in `.github/workflows/`, accessibility
packages in the manifests (`@axe-core/cli`, `@axe-core/playwright`, `pa11y`,
`eslint-plugin-jsx-a11y`, `@lhci/cli`), and a `.a11y-web-config.json`. Extend
what is there before adding a second tool. Then pick by what the project ships.

| The project has | Check | Owner in this package |
|---|---|---|
| HTML, JSX, TSX, Vue, Svelte or CSS source | This package's GitHub Action, `Community-Access/accessibility-agents/action` | see below |
| A deployed site or preview URL | The GitHub Accessibility Scanner, `github/accessibility-scanner@v3` | `kb-github-a11y-scanner` |
| A build that can be served in CI, or a single-page app | axe-core CLI, or Playwright with `@axe-core/playwright`, with a baseline | `ci-accessibility`, `kb-ci-integration` |
| React JSX | `eslint-plugin-jsx-a11y` in the existing lint step | `ci-accessibility` |
| Office or PDF files that ship | This package's GitHub Action with `scan-type: office`, `pdf` or `all` | see below |
| Only markdown documentation | `markdownlint-cli2` with heading-increment (MD001), no-alt-text (MD045) and descriptive-link-text (MD059) enabled | `markdown-a11y-assistant` for the full audit |

**This package's GitHub Action** (`action/` in the Accessibility Agents
repository; inputs and examples in its `README.md`). For web it is static
analysis of source files, not a rendered page: nine rules covering image alt,
positive tabindex, empty headings, outline removal, div buttons, click without
key events, ambiguous link text, input labels and identity autocomplete. Office
and PDF scanning runs through the package's MCP server. It writes SARIF, which
GitHub code scanning shows on the pull request when `upload-sarif` is on (the
job needs `security-events: write`); `fail-on` takes `critical`, `serious`,
`moderate`, `minor` or `none`; on a pull request it scans only changed files
unless `paths` is set. Pin it to a release tag. It does not scan markdown.

**The GitHub Accessibility Scanner** scans live URLs in a headless browser and
files one GitHub issue per finding, which satisfies "tracked" directly. It is
in public preview. It needs a fine-grained personal access token as a secret
(`GITHUB_TOKEN` does not work) and a `cache_key`; by default it assigns the
issues it files to Copilot, which `skip_copilot_assignment: true` turns off.
Ask the maintainer about both before adding it.

**axe-core in CI** finds more than static analysis because it sees the rendered
DOM, but only on pages it can load. `ci-accessibility` sets up the job, the
baseline file (so CI fails on new violations, not existing ones) and SARIF
conversion. Its own caveat applies: axe-core's WCAG 2.2 tag covers only
`target-size`; the other 2.2 criteria need manual checks.

Whatever is chosen, document it: one line in the "Contributor expectations"
section (`CI/CD`) naming the check and what it blocks. If the maintainer
decides not to automate yet, documenting that decision meets item 1, but item 2
still needs the check to run.

## Tracking what it finds (item 3)

- SARIF results appear as code scanning alerts; `security-dashboard` triages
  them.
- Scanner issues are already issues; `issue-tracker` recognizes them and their
  Copilot fix status, and `scanner-bridge` reads them into findings.
- For any other check, file each barrier not fixed in the same change as an
  issue with the accessibility label, following the project's issue form.
- Existing violations from a first run go in a baseline plus tracking issues,
  not a red build nobody can merge past.

## Hand-offs

- `ci-accessibility`, through `accessibility-lead` - generate or debug the CI
  job, baseline and gating strategy.
- `actions-manager` - read the run logs when the new workflow fails for a
  reason other than accessibility.
- `issue-tracker` - file the findings not fixed, once approved.
- `security-dashboard` - triage the code scanning alerts from SARIF.

## Evidence to report

- The workflow file and the job name, or the document that records the
  decision.
- A run: its URL or local command output, with counts by severity. If it has
  not run yet, say so; item 2 is then unmet.
- The issues or alerts that track what it found.
