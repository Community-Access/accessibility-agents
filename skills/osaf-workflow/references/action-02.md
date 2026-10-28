# Workflow action 2: Create an accessible path for reporting accessibility bugs

Part of the `osaf-workflow` skill. Read this when action 2 is in scope.

- ID: `create-an-accessible-path-for-reporting-accessibility-bugs`
- Effort and cadence: Moderate; Initial setup + ongoing
- Canonical source: [Workflow phase, action 2](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/blob/b2ea31a2e38cbab3e774e4142575b78876b9b53f/framework/phases/workflow-phase.md#2-create-an-accessible-path-for-reporting-accessibility-bugs)

## Why it matters

A clear, accessible reporting path improves report quality and supports
consistent triage.

## Definition of Done

1. The project documents an accessible way to report accessibility bugs.
2. Submitted accessibility reports follow a documented triage and response
   process.

## Recommended steps, adapted from the framework

1. Create and document a reporting method, such as an issue template.
2. Request useful details, including expected and actual behavior, steps to
   reproduce, environment, assistive technology, and severity.
3. Apply the `accessibility` label, or a clearly understood equivalent, to
   submitted reports if applicable.
4. If the primary reporting method creates an accessibility barrier, provide an
   alternative reporting path, such as an accessible email address or community
   contact.

## How to do it in this repository

- **Look first** in `.github/ISSUE_TEMPLATE/` for an accessibility form or a bug
  form that could carry the fields. Extend before adding.
- **Write a YAML issue form**, not a Markdown template, at
  `.github/ISSUE_TEMPLATE/accessibility.yml`, and add or update `config.yml`
  for the template chooser. Both follow the conventions of `template-builder`
  and `repo-manager`: field IDs lowercase and hyphenated, preview before
  saving, never overwrite without confirming.
- **Use the project's label name** in `labels:` (Foundational action 2). The
  form then applies it to every report, which is the recurring part of this
  action.
- **Severity uses the triage categories** from Workflow action 3. If action 3
  is not done yet, use the four defaults below and note that action 3 must
  define them in `ACCESSIBILITY.md`.
- **Make most fields optional.** Partial reports are useful; require only the
  summary, expected and actual behavior, and steps. Never require disability
  disclosure; screenshots and recordings are optional.
- **An alternative path.** GitHub issue forms are usable with a keyboard and a
  screen reader, but some people cannot or will not use GitHub. If the project
  has an accessible email address, discussion category or community contact,
  link it from the form's markdown intro and from `ACCESSIBILITY.md`. If it has
  none, that is maintainer input; do not invent an address.
- **Item 2 depends on action 3.** The documented triage and response process
  is what action 3 writes; report item 2 as met only when it exists.

## Hand-offs

- `template-builder` - when the maintainer wants to customize the form
  interactively; its guided accessibility template is a fallback, but the form
  below is adapted from the framework's own example.
- `issue-tracker` - label existing open accessibility reports that predate the
  form.

## Example: accessibility issue form

Adapted from the Accessibility Toolkit's `.github/ISSUE_TEMPLATE/accessibility.yml`.
Replace `PROJECT` and the placeholders. The toolkit's code-of-conduct and
code-sample fields are left out; add a code-of-conduct checkbox if the project
has one.

```yaml
name: Accessibility issue
description: Report an accessibility barrier or bug in PROJECT.
title: "[a11y]: <short description of the issue>"
labels: ["accessibility"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to report an accessibility issue. Reports
        like yours help us make PROJECT usable by everyone.

        Please share as much as you're comfortable with - partial reports are
        still useful. If you're using assistive technology, feel free to
        describe what you experienced in your own words.
  - type: textarea
    id: summary
    attributes:
      label: Summary
      description: A brief description of the accessibility barrier you encountered.
    validations:
      required: true
  - type: textarea
    id: demo
    attributes:
      label: Demo, screenshot or video
      description: Optional. A link, screenshot or recording that shows the issue.
    validations:
      required: false
  - type: input
    id: page-url
    attributes:
      label: Page URL
      description: The URL of the page where you encountered the issue, if any.
    validations:
      required: false
  - type: textarea
    id: expected
    attributes:
      label: Expected behavior
      description: What did you expect to happen?
    validations:
      required: true
  - type: textarea
    id: actual
    attributes:
      label: Actual behavior
      description: What actually happened?
    validations:
      required: true
  - type: textarea
    id: steps
    attributes:
      label: Steps to reproduce
      description: How can we reproduce the issue?
      placeholder: |
        1. Go to ...
        2. Press Tab to move focus to ...
        3. Observe that ...
    validations:
      required: true
  - type: dropdown
    id: severity
    attributes:
      label: Severity (will be revised and adjusted during triage as needed)
      description: |
        How much does this issue affect your ability to use PROJECT?
        - Critical: Prevents you from completing a core task.
        - Serious: Significant difficulty, but a workaround exists.
        - Moderate: Annoyance or inconsistent experience.
        - Minor: Minor issue with minimal impact on usability.
      options:
        - Critical
        - Serious
        - Moderate
        - Minor
    validations:
      required: true
  - type: input
    id: os
    attributes:
      label: Operating system and version
    validations:
      required: false
  - type: input
    id: browser
    attributes:
      label: Browser and version
    validations:
      required: false
  - type: input
    id: assistive-tech
    attributes:
      label: Assistive technology and version
      description: If you used assistive technology when you found this, which one and which version.
    validations:
      required: false
  - type: input
    id: wcag
    attributes:
      label: Related WCAG criteria (optional)
      description: If you know which WCAG success criteria this relates to. We will work it out in triage if not.
    validations:
      required: false
  - type: textarea
    id: additional-context
    attributes:
      label: Additional context
      description: Anything else we should know, such as related issues or workarounds you've tried.
    validations:
      required: false
```

Severity being required follows the toolkit; the label says triage may revise
it. If the maintainer prefers reporters not to judge severity, set
`required: false`.

## Evidence to report

- The form path, its `labels:` line, and the `config.yml` entry.
- Where `ACCESSIBILITY.md` or `CONTRIBUTING.md` links to it.
- The alternative reporting path, or that one is needed from the maintainer.
