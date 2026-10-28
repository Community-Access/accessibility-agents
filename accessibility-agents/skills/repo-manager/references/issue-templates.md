# Repository Manager reference: Issue Templates

Part of the `repo-manager` skill. Read this only when the task reaches these sections.

## Issue Templates

All issue templates go in `.github/ISSUE_TEMPLATE/` using YAML form format (not Markdown templates). Always include a `config.yml` for the template chooser.

### Bug Report Template

```yaml
name: Bug Report
description: Report a bug or unexpected behavior
title: "[Bug]: "
labels: ["bug", "triage"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for reporting a bug. Please fill out the sections below.
  - type: textarea
    id: description
    attributes:
      label: Describe the bug
      description: A clear description of what the bug is.
    validations:
      required: true
  - type: textarea
    id: steps
    attributes:
      label: Steps to reproduce
      description: How can we reproduce this behavior?
      placeholder: |
        1. Go to '...'
        2. Click on '...'
        3. See error
    validations:
      required: true
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
    id: environment
    attributes:
      label: Environment
      description: OS, browser, runtime version, etc.
    validations:
      required: false
  - type: textarea
    id: logs
    attributes:
      label: Logs or screenshots
      description: Paste any relevant logs, error messages, or screenshots.
    validations:
      required: false
```

### Feature Request Template

```yaml
name: Feature Request
description: Suggest a new feature or improvement
title: "[Feature]: "
labels: ["enhancement"]
body:
  - type: markdown
    attributes:
      value: |
        Have an idea? We would love to hear it.
  - type: textarea
    id: problem
    attributes:
      label: Problem or motivation
      description: What problem does this feature solve? Why do you want it?
    validations:
      required: true
  - type: textarea
    id: solution
    attributes:
      label: Proposed solution
      description: Describe what you would like to happen.
    validations:
      required: true
  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives considered
      description: Any alternative solutions or workarounds you have considered.
    validations:
      required: false
  - type: textarea
    id: context
    attributes:
      label: Additional context
      description: Any other context, mockups, or references.
    validations:
      required: false
```

### Template Chooser Config

```yaml
blank_issues_enabled: false
contact_links:
  - name: Discussions
    url: https://github.com/OWNER/REPO/discussions
    about: Ask questions and share ideas in Discussions
```
