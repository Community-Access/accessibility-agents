# Accessibility-First Development

This machine has Accessibility Agents installed for OpenCode. Web UI work is
reviewed by the accessibility specialist team before it is called done.

## Mandatory Accessibility Check

Before writing or modifying any web UI code - HTML, JSX, TSX, Vue, Svelte,
Astro, CSS, Tailwind classes, server-side templates, forms, modals, or any
user-facing web content - dispatch `@accessibility-lead` and let it select the
specialists for the task.

**Automatic trigger detection:** treat a prompt as a web UI task when it creates,
edits, or reviews a file matching `*.html`, `*.jsx`, `*.tsx`, `*.vue`,
`*.svelte`, `*.astro`, `*.css`, `*.leaf`, `*.ejs`, `*.erb`, or `*.hbs`, or when
it describes building pages, components, forms, dialogs, or visual elements. Do
not wait to be asked for an accessibility review.

## How the team is wired into OpenCode

- **Router skills** live in `skills/` (`web-accessibility`,
  `document-accessibility`, `markdown-accessibility`, `github-workflows`,
  `developer-tools`). Each one names the lead to start with and the specialists
  that usually matter for its domain.
- **Subagents** live in `agent/`. `accessibility-lead` and the other hub agents
  can be selected directly; the 70-plus specialists are `mode: subagent` and are
  meant to be dispatched by a lead rather than picked by hand.
- **Specialist references** live in `~/.a11y-agents/references/specialists/`.
  Each subagent reads its own reference before it starts analysing, and
  `index.json` there is the map the lead uses to choose specialists.
- **Extensions** in `.a11y-agents/extensions/` and `~/.a11y-agents/extensions/`
  add organisation-specific rules. When an extension matches the domain, file
  patterns, or compliance profile of a task, treat it as a first-class rule
  source and label those findings with the extension name.

## Workflow

1. Start `@accessibility-lead` for any user-facing web accessibility task.
2. The lead classifies the request, reads the specialist index, and dispatches
   the matching specialists in parallel.
3. Wait for every dispatched specialist to finish. A review is not complete
   because the lead started; it is complete when the specialists have reported.
4. The lead synthesises: deduplicate findings, resolve conflicts, assign
   severity, map to WCAG 2.2 or the applicable extension rule, and make a
   ship/no-ship call.
5. If subagent dispatch is unavailable in the current session, say so, then read
   the relevant specialist references sequentially and run the same review
   yourself rather than silently downgrading to a single-pass check.

## Default dispatch

- **Broad audit:** `accessibility-lead`, `aria-specialist`, `keyboard-navigator`,
  `contrast-master`, `forms-specialist`, `modal-specialist`,
  `live-region-controller`, `alt-text-headings`, `tables-data-specialist`,
  `link-checker`
- **New UI:** `accessibility-lead`, `aria-specialist`, `keyboard-navigator`,
  `alt-text-headings`, plus the domain specialists the component needs
- **Changed UI:** `accessibility-lead`, `keyboard-navigator`, plus specialists
  matching the diff
- **New modal, dialog, drawer, popover, or sheet:** `accessibility-lead`,
  `modal-specialist`, `keyboard-navigator`, `aria-specialist`,
  `alt-text-headings`
- **PR review:** `pr-review` plus the web specialists matching the diff
- **Documents (.docx, .xlsx, .pptx, PDF, EPUB):**
  `document-accessibility-wizard`
- **Markdown documentation:** `markdown-a11y-assistant`

## Standard

WCAG 2.2 Level AA is the baseline. Report each finding with severity, the file
and line when available, who it affects, the success criterion or extension rule
it maps to, and the fix.
