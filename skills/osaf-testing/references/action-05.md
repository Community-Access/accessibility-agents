# Testing action 5: Perform accessibility checks for documentation

Part of the `osaf-testing` skill. Read this when action 5 is in scope.

- ID: `perform-accessibility-checks-for-documentation`
- Effort and cadence: Moderate; Ongoing
- Canonical source: [Testing phase, action 5](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/blob/b2ea31a2e38cbab3e774e4142575b78876b9b53f/framework/phases/testing-phase.md#5-perform-accessibility-checks-for-documentation)

## Why it matters

This action improves the first experience many users have.

## Definition of Done

1. Documentation checks cover structure, alternatives, links, captions,
   tables, and code blocks.
2. Representative documentation has been reviewed.
3. Accessibility issues are fixed or tracked.

## Recommended steps, adapted from the framework

1. Review and identify key project documentation, such as Markdown (`.md`)
   files, the README, contributing and accessibility guides, installation and
   configuration instructions, API or developer documentation, user guides,
   release notes, and issue or pull request templates.
2. Perform documentation checks using the
   [testing examples](https://github.com/open-source-accessibility/accessibility-toolkit/blob/main/ACCESSIBILITY.md#contributor-expectations).
3. Fix accessibility issues or track them.

## How this package covers the six areas

Unlike actions 2 to 4, most of this action can be run by an agent, because
documentation is text in the repository. Each area in item 1 and what covers it.

| Area | Covered by |
|---|---|
| Structure | `markdown-a11y-assistant`: heading hierarchy, a single H1, bold text used as a heading, list structure |
| Alternatives | `markdown-a11y-assistant`: image alt text, and text alternatives for Mermaid and ASCII diagrams |
| Links | `markdown-a11y-assistant`: ambiguous link text, URLs used as link text, broken in-page anchors |
| Captions | Not scanned in markdown. Check each embedded or linked video by hand; `validate_caption_file` (MCP) checks a WebVTT or SRT file; `media-accessibility` reviews a media player |
| Tables | `markdown-a11y-assistant`: empty header cells, layout tables, a description before the table |
| Code blocks | Partly: the markdown scanner flags plain fences used for ASCII diagrams, and markdownlint MD040 flags fences without a language. Check the rest by hand: a language identifier on each fence where one applies, code as text rather than an image, long commands explained nearby |

Office, PDF and ePub documentation goes to `document-accessibility-wizard`.
Issue and pull request templates are YAML or markdown; read their labels and
descriptions for plain language.

## How to do it in this repository

1. **Choose the representative set** (item 2): the README, `CONTRIBUTING.md`,
   `ACCESSIBILITY.md`, installation or getting-started docs, one user guide
   page, one API page, the latest release notes, and the issue and pull
   request templates. Name them in the record.
2. **Hand off the audit** of those files to `markdown-a11y-assistant`. It
   reports, then applies only the fixes the user approves.
3. **Check captions and code blocks by hand** and write down what was checked.
4. **Document the checks** so they repeat: a "Documentation checks" list in
   the testing document or in the contributor expectations, covering the six
   areas.
5. **Make it repeatable** where possible: the markdown check from action 1
   (`markdownlint-cli2` with MD001, MD045 and MD059) runs on every pull
   request; the full audit runs before a release.

## Hand-offs

- `markdown-a11y-assistant` (router) - audit, fix on approval, and write the
  scored report for the representative set.
- `document-accessibility-wizard` (router) - Office, PDF and ePub docs.
- `issue-tracker` - track what is not fixed.

## Evidence to report

- The representative set, file by file.
- The audit report path and its counts by severity.
- What was checked by hand for captions and code blocks.
- The issues filed, or the fixes made.
