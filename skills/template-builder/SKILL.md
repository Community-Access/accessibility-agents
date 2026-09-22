---
name: template-builder
description: Build GitHub issue, PR and discussion templates from a guided wizard.
license: MIT
disable-model-invocation: true
metadata:
  tier: specialist
  domain: github
  output: artifact
  effort: medium
  title: Template Builder
---
## Template Builder Agent

[Shared instructions](../kb-github-shared-instructions/SKILL.md)

**Skills:** [`github-workflow-standards`](../kb-github-workflow-standards/SKILL.md), [`github-scanning`](../kb-github-scanning/SKILL.md)

A magical interactive agent that guides you through building GitHub issue templates step-by-step using VS Code's Ask Questions feature. Instead of writing YAML, answer simple questions and the agent generates the template for you.

## How to Use

### In VS Code

1. Open Copilot Chat (`Ctrl+Shift+I` Windows, `Cmd+Shift+I` macOS)
2. Type: `@template-builder` or `/build-template`
3. The agent will ask you a series of questions to understand your template
4. Answer each question in the Ask Questions prompts
5. The agent generates your complete YAML template
6. Copy the output to `.github/ISSUE_TEMPLATE/your-template-name.yml`

### In GitHub Web

1. Open Copilot Chat (Copilot button in top right)
2. Mention: `@template-builder`
3. Type your template goals (e.g., "I want to build an accessibility bug report template")
4. The agent provides step-by-step YAML scaffolding you can copy and refine

## Example Workflow

**You:** `@template-builder create accessibility bug template`

**Agent asks (via Ask Questions):**

1. Template name? -> You answer: "Accessibility Bug Report"
2. What's this template for? -> "Report screen reader and keyboard issues"
3. First field? -> "Screen Reader (dropdown)"
4. Dropdown options? -> "NVDA, JAWS, VoiceOver, Other"
5. Is it required? -> "Yes"
6. Next field? -> "Browser (dropdown)"
... (continues for each field)

**Agent outputs:** Complete YAML template ready to paste

---

## Pre-Built Workflow: Guided Accessibility Template

The agent includes a guided workflow for the most common case: building an accessibility bug report template.

### Invoke with

- `@template-builder` + "create accessibility template"
- `/build-a11y-template`

### Workflow

The agent skips to Phase 2 but pre-populates it with accessibility-specific fields:

1. Component affected? (dropdown with agent names)
2. Screen reader (with NVDA, JAWS, VoiceOver, TalkBack, etc. pre-options)
3. Browser version
4. Operating system
5. Expected behavior vs actual behavior
6. Steps to reproduce
7. WCAG success criterion (dropdown with criteria)
8. Before submitting checklist (checkboxes for verification)

Output: Production-ready accessibility bug template you can immediately use.

---

## Advanced: Customize the Template Builder

The Template Builder agent itself can be extended. Students in the workshop can:

1. **Add new field types** -> Extend the agent to support custom validations
2. **Create workflow templates** -> Pre-built templates for specific issue types (Security, Documentation, etc.)
3. **Add conditional fields** -> Show/hide fields based on previous answers
4. **Export to markdown** -> Generate Markdown templates in addition to YAML
5. **Template sharing** -> Generate a code block to share with other projects

---

## Integration with Nexus

The Template Builder works alongside the five core agents:

| Agent | Creates | Template Builder Uses |
|-------|---------|----------------------|
| @daily-briefing | Issue summaries | Templates to collect consistent data |
| @issue-tracker | Issue recommendations | Templates to standardize issue quality |
| @pr-review | PR checklists | Templates to structure PR descriptions |
| @analytics | Performance insights | Templates to capture metrics consistently |
| @template-builder | Issue templates themselves | (This agent) |

**Together:** The five agents automate workflow; the Template Builder automates the infrastructure that makes workflows possible.

---

## Day 2 Amplifier: From Manual to Magical

Each day 1, with its day 2 in browser, day 2 in VS code and nexus.

| Day 1 | Day 2 in Browser | Day 2 in VS Code | Nexus |
|-------|------------------|------------------|------------|
| Learn to identify accessibility issues in code review | Learn to design templates that prevent those issues | Use Template Builder to generate templates interactively | Agent automates the entire cycle |
| (Chapter 14) | (Chapter 15) | (Chapter 16) | (Capstone) |

---

## Behavioral Rules

1. **Check workspace context first.** Look for scan config files (`.a11y-*-config.json`) and previous audit reports in the workspace root.
2. **Wizard mode is the default.** Always start with guided questions via Ask Questions rather than generating a template cold.
3. **Never overwrite existing templates without confirming.** Check for existing files in `.github/ISSUE_TEMPLATE/` first.
4. **YAML form format always.** Never generate Markdown-style issue templates (the legacy format).
5. **Always include `config.yml`.** Every template set needs a chooser config alongside the templates.
6. **Preview before saving.** Show the generated YAML to the user before writing to disk.
7. **Validate field IDs.** YAML `id` fields must be lowercase, hyphenated, no spaces - enforce this silently.
8. **Accessibility defaults.** All templates include a clear title format, description, and at minimum one structured text area.
9. **Offer all three formats.** After building an issue template, offer to also build a PR template and discussion template.
10. **Link to related agents.** After creation, offer to immediately use the template via `@issue-tracker` or run a community health check via `@contributions-hub`.

## Reference files

Read one only when the task reaches it. Do not read them all up front.

- `references/template-builder-guide-step-by-step.md` - Template Builder Guide: Step-by-Step
- `references/hands-on-exercise-build-your-own-template-builde.md` - Hands-On Exercise: Build Your Own Template Builder, Technical Details: VS Code Ask Questions...

## Output contract

Produce the file or script the task asks for. Report what you wrote as a short
list of paths and what each one changes. Do not restate the file contents.

Shared rules, dispatch contract and schemas: `skills/a11y-core/SKILL.md`.
Authoritative specifications for this skill: `skills/a11y-core/references/sources.md`.
