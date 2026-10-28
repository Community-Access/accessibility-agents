# Workflow action 3: Establish a simple accessibility triage approach

Part of the `osaf-workflow` skill. Read this when action 3 is in scope.

- ID: `establish-a-simple-accessibility-triage-approach`
- Effort and cadence: Moderate; Initial setup + ongoing
- Canonical source: [Workflow phase, action 3](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/blob/b2ea31a2e38cbab3e774e4142575b78876b9b53f/framework/phases/workflow-phase.md#3-establish-a-simple-accessibility-triage-approach)

## Why it matters

This action gives people a clear way to report accessibility barriers and helps
maintainers assess, prioritize, and respond to them consistently.

## Definition of Done

1. The `ACCESSIBILITY.md` explains how to report an accessibility barrier and
   what information is helpful to include.
2. Severity categories describe how strongly a barrier affects a person's
   ability to complete a task.
3. Response expectations explain how reports are acknowledged, tracked,
   updated, and resolved.

## Recommended steps, adapted from the framework

1. In `ACCESSIBILITY.md`, define your process for reporting accessibility
   issues.
2. Define severity categories, such as critical, serious, moderate, and minor,
   based on how strongly a barrier affects a person's ability to complete a
   task. Keep these categories consistent with the project's issue template,
   labels, and resolution targets.
3. Document what reporters can expect, including acknowledgement, status
   updates, workarounds, anticipated timelines, and opportunities to verify a
   fix.
4. Apply the documented severity and response approach when triaging
   accessibility reports.

## How to do it in this repository

- **One severity vocabulary everywhere.** The framework's four names are the
  ones this package's findings schema uses (`critical`, `serious`, `moderate`,
  `minor`), and the ones this package's GitHub Action takes for `fail-on`. Use
  them in `ACCESSIBILITY.md`, the issue form's dropdown (action 2), and any
  severity labels, so a finding, a CI result and an issue mean the same thing.
  The definitions differ slightly from the package's; see
  `kb-open-source-accessibility-framework`, "Severity", and `kb-severity-mapping`.
  Write the project's definitions in terms of the person's task, as the
  Definition of Done asks, not in terms of WCAG levels.
- **Severity labels are optional.** If the maintainer wants them (for example
  `severity: critical`), they are a public change: prepare `gh label create`
  commands and run them only on a yes.
- **Timelines are the maintainer's commitment.** The toolkit's resolution
  targets (critical 30 days, serious 60, moderate and minor 90) are an example.
  Never write a target the maintainer has not agreed; leave a placeholder and
  list it as maintainer input. "Use commitments your project can consistently
  uphold" is the framework's own guidance.
- **Step 4 is ongoing practice.** You can apply the approach to existing open
  reports only through `issue-tracker`, with approval for each change; report it
  as recurring work.

## Hand-offs

- `issue-tracker` - triage the existing open accessibility reports against the
  new severity definitions, and draft acknowledgement comments for review.
- `template-builder` - align the issue form's severity dropdown if the form
  already exists and differs.

## Example: reporting, severity and response

From `framework/supporting/workflow-phase/triage-accessibility.md`, with the
toolkit's additional commitments merged in and punctuation converted to ASCII.
Replace the form link and the bracketed placeholders.

```markdown
## Reporting accessibility issues

If you run into an accessibility barrier, please let us know - we treat
accessibility reports as expertise, not complaints.

1. **Open an issue** using the [accessibility issue template](https://github.com/OWNER/REPO/issues/new?template=accessibility.yml).
2. Include, when possible:
   - What you were trying to do and what went wrong.
   - The page URL.
   - Steps to reproduce.
   - Your operating system, browser, and assistive technology (with versions).
   - A screen recording or screenshot, if you're comfortable sharing one.
   - Severity, using the [defined taxonomy](#severity).

### Severity

- **Critical:** Prevents you from completing a core task (for example, you
  cannot read an article at all).
- **Serious:** Significant difficulty, but a workaround exists.
- **Moderate:** Annoyance or inconsistent experience.
- **Minor:** Minor issue with minimal impact on usability.

Maintainers assign or confirm severity during triage; reporters do not need to.

### How we respond

- We will acknowledge accessibility reports promptly, respectfully, and
  constructively, treating them as valuable expertise.
- We will not require reporters to disclose a diagnosis or other personal
  information.
- We will communicate the issue's severity, owner, status, and target
  resolution date.
- Where possible, we will suggest a workaround while a fix is in progress.
- We will provide updates when the status or expected timeline changes (for
  example, "We're working on this - tracking in #123").
- We may ask the reporter to confirm that a fix resolves the barrier before
  closing the issue.

### Resolution expectations

After triage, we assign each issue a severity, owner, and target resolution
date.

- **Critical:** Resolve within [N] days.
- **Serious:** Resolve within [N] days.
- **Moderate:** Resolve within [N] days.
- **Minor:** Resolve within [N] days.

If we cannot meet a target, we will explain the delay, share any available
workaround, and provide a revised target date.
```

Replace `OWNER/REPO` with the repository. An absolute URL keeps working when
`ACCESSIBILITY.md` is also published on a documentation site.

## Evidence to report

- The headings and line numbers of the reporting, severity and response
  sections.
- Whether the severity names match the issue form and any labels.
- Every placeholder left for the maintainer, such as timelines.
