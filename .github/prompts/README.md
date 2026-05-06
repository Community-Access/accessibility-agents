# Prompts Directory

This directory contains 128 reusable prompt files (`.prompt.md`) for accessibility agents, GitHub workflow agents, and developer tools.

---

## Template Variables

Prompt files use VS Code prompt template syntax. The following variable types appear throughout this directory:

| Syntax | Description | Example |
|--------|-------------|---------|
| `${input:name}` | Prompts the user for a string value at runtime | `${input:files}` |
| `${input:name:default}` | String input with a default value | `${input:branch:main}` |
| `${workspaceFolder}` | Absolute path to the current workspace root | `/home/user/my-project` |
| `${file}` | Path to the currently active file | `/home/user/my-project/src/App.tsx` |
| `${fileBasename}` | Filename with extension | `App.tsx` |
| `${fileBasenameNoExtension}` | Filename without extension | `App` |
| `${selectedText}` | Currently selected text in the editor | *(whatever is highlighted)* |

**When a variable has no value:** Prompts that use `${input:...}` will open a VS Code input box asking for the value. If the user cancels, the prompt receives an empty string — be sure to handle that gracefully in agent instructions.

---

## Prompt Categories

### Accessibility Auditing

| File | Purpose |
|------|---------|
| `accessibility-lead.prompt.md` | Full web accessibility review with all specialists |
| `web-accessibility-wizard.prompt.md` | Interactive guided web audit |
| `a11y-pr-check.prompt.md` | Accessibility check on a specific PR diff |
| `accessibility-dashboard.prompt.md` | Cross-repo accessibility status dashboard |
| `accessibility-regression-detector.prompt.md` | Compare audits to detect regressions |

### Specialist Reviews

| File | Purpose |
|------|---------|
| `aria-specialist.prompt.md` | ARIA roles, states, properties |
| `alt-text-headings.prompt.md` | Images, icons, headings, landmarks |
| `contrast-master.prompt.md` | Color contrast and visual accessibility |
| `forms-specialist.prompt.md` | Form labeling, errors, validation |
| `keyboard-navigator.prompt.md` | Keyboard interaction and focus management |
| `modal-specialist.prompt.md` | Dialogs, drawers, overlays |
| `live-region-controller.prompt.md` | Dynamic content announcements |
| `tables-data-specialist.prompt.md` | Data tables, grids |
| `link-checker.prompt.md` | Ambiguous link text |

### Document Accessibility

| File | Purpose |
|------|---------|
| `word-accessibility.prompt.md` | Word (.docx) accessibility audit |
| `excel-accessibility.prompt.md` | Excel (.xlsx) accessibility audit |
| `powerpoint-accessibility.prompt.md` | PowerPoint (.pptx) accessibility audit |
| `pdf-accessibility.prompt.md` | PDF accessibility audit |

### Markdown Accessibility

| File | Purpose |
|------|---------|
| `markdown-a11y-assistant.prompt.md` | Full guided markdown accessibility audit |

### GitHub Workflow

| File | Purpose |
|------|---------|
| `daily-briefing.prompt.md` | Morning briefing of issues, PRs, reviews |
| `triage.prompt.md` | Issue triage workflow |
| `review-pr.prompt.md` | Pull request review |
| `analytics.prompt.md` | Team velocity and contribution metrics |
| `release-prep.prompt.md` | Release notes and preparation |
| `sprint-review.prompt.md` | Sprint review and retrospective |
| `team-dashboard.prompt.md` | Team health dashboard |

### Repository Management

| File | Purpose |
|------|---------|
| `repo-manager.prompt.md` | Scaffold issue templates, CI workflows, contributing guides |
| `repo-admin.prompt.md` | Manage collaborators, branch protection, labels |
| `add-collaborator.prompt.md` | Add a collaborator to a repository |
| `team-manager.prompt.md` | Manage org teams |
| `setup-web-cicd.prompt.md` | Set up web accessibility CI/CD |
| `setup-document-cicd.prompt.md` | Set up document accessibility CI/CD |
| `setup-github-scanner.prompt.md` | Configure GitHub Accessibility Scanner |
| `setup-lighthouse-scanner.prompt.md` | Configure Lighthouse CI |

### CI/CD and Security

| File | Purpose |
|------|---------|
| `security-dashboard.prompt.md` | Security alerts triage |

### WCAG Reference

| File | Purpose |
|------|---------|
| `wcag-guide.prompt.md` | Explain WCAG success criteria |
| `wcag-aaa.prompt.md` | WCAG AAA conformance audit |
| `wcag3-preview.prompt.md` | WCAG 3.0 educational overview |

---

## Creating New Prompts

When creating a new prompt file in this directory:

1. **Use the standard frontmatter:**

   ```yaml
   ---
   name: short-kebab-name
   description: One sentence describing what this prompt does and when to use it
   mode: agent
   agent: target-agent-name
   tools:
     - askQuestions
     - readFile
   ---
   ```

2. **Document all `${input:...}` variables** at the top of the prompt body, before the instructions:

   ```markdown
   ## Parameters
   - **`${input:files}`** — file path(s) to review (comma-separated)
   - **`${input:framework:react}`** — UI framework (default: react)
   ```

3. **Name the file `<agent-name>.prompt.md`** or `<action-verb>-<noun>.prompt.md` for action-oriented prompts.

4. **Test with missing variables.** Confirm the prompt degrades gracefully when `${input:...}` is cancelled.

---

## Related Files

- [`.github/agents/`](../agents/) — Agent definition files (`.agent.md`)
- [`.github/skills/`](../skills/) — Reusable skill modules (`SKILL.md`)
- [`.github/instructions/`](../instructions/) — Always-on instruction files (`.instructions.md`)
- [`docs/guides/`](../../docs/guides/) — Developer guides for building and extending agents
