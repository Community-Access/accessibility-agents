# Sample output: Workflow phase

An illustration of what `osaf-workflow` returns for "implement Workflow actions
2 and 3". The repository, lines and issue numbers are invented.

## Files

- `.github/ISSUE_TEMPLATE/accessibility.yml` - new accessibility issue form,
  applies the `accessibility` label.
- `.github/ISSUE_TEMPLATE/config.yml` - adds the form to the chooser.
- `ACCESSIBILITY.md` - adds "Reporting accessibility issues", "Severity", "How
  we respond" and "Resolution expectations".

## Actions

Workflow 2, `create-an-accessible-path-for-reporting-accessibility-bugs`:

- An accessible way to report is documented - met, `ACCESSIBILITY.md` lines 14
  to 24 link the form.
- Reports follow a documented triage and response process - met, by action 3.
- Alternative path - needs the maintainer: the project has no contact address
  or discussion category to offer people who cannot use GitHub issues.

Workflow 3, `establish-a-simple-accessibility-triage-approach`:

- How to report and what to include - met, lines 14 to 24.
- Severity categories - met, lines 26 to 33; the same four names as the form's
  dropdown.
- Response expectations - met, lines 35 to 45. The resolution targets are
  placeholders until the maintainer sets them.
- Recurring: apply the severity and response approach to each new report.

## Hand-offs

- `issue-tracker` - triage the five open reports labeled `accessibility`
  against the new severity definitions; draft acknowledgements for review.
- `markdown-a11y-assistant` - audit the changed `ACCESSIBILITY.md`.

## Tracking issue

Check Workflow 3 now. Check Workflow 2 once the alternative path is decided.
