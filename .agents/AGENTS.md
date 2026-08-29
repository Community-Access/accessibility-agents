# Accessibility-First Development

This machine has Accessibility Agents installed for Freebuff. Web UI work is
reviewed against WCAG 2.2 Level AA before it is called done.

## Mandatory Accessibility Check

Before writing or modifying any web UI code - HTML, JSX, TSX, Vue, Svelte,
Astro, CSS, Tailwind classes, server-side templates, forms, modals, or any
user-facing web content - load the matching router skill and work through the
specialist references it names.

**Automatic trigger detection:** treat a prompt as a web UI task when it creates,
edits, or reviews a file matching `*.html`, `*.jsx`, `*.tsx`, `*.vue`,
`*.svelte`, `*.astro`, `*.css`, `*.leaf`, `*.ejs`, `*.erb`, or `*.hbs`, or when
it describes building pages, components, forms, dialogs, or visual elements. Do
not wait to be asked for an accessibility review.

## How the team is wired into Freebuff

- **Router skills** live in `~/.agents/skills/` (`web-accessibility`,
  `document-accessibility`, `markdown-accessibility`, `github-workflows`,
  `developer-tools`). Start from the router that matches the task.
- **Specialist references** live in `~/.a11y-agents/references/specialists/`.
  `index.json` there maps every specialist to its domain, file patterns, and
  trigger terms.
- **Extensions** in `.a11y-agents/extensions/` and `~/.a11y-agents/extensions/`
  add organisation-specific rules. When an extension matches the domain, file
  patterns, or compliance profile of a task, treat it as a first-class rule
  source and label those findings with the extension name.

Freebuff defines custom agents as TypeScript generators in `.agents/`, so the
Accessibility Agents specialists are not installed as spawnable subagents here.
Run the review in one session instead, reading references in sequence. That is a
deliberate fallback, not a reason to skip specialists.

## Workflow

1. Read `~/.a11y-agents/references/specialists/accessibility-lead.md` and use
   its decision matrix to pick the specialists the task needs.
2. Read each selected specialist reference before analysing that domain. Do not
   review from memory; the references carry the checklists and the WCAG mapping.
3. Work through each specialist's checklist against the actual code.
4. Synthesise as the lead would: deduplicate findings, resolve conflicts, assign
   severity, map to WCAG 2.2 or the applicable extension rule, and make a
   ship/no-ship call.
5. Say which specialists you covered and which you did not, so the gap in the
   review is visible.

## Default specialist selection

- **Broad audit:** `aria-specialist`, `keyboard-navigator`, `contrast-master`,
  `forms-specialist`, `modal-specialist`, `live-region-controller`,
  `alt-text-headings`, `tables-data-specialist`, `link-checker`
- **New UI:** `aria-specialist`, `keyboard-navigator`, `alt-text-headings`, plus
  the domain specialists the component needs
- **Changed UI:** `keyboard-navigator` plus the specialists matching the diff
- **New modal, dialog, drawer, popover, or sheet:** `modal-specialist`,
  `keyboard-navigator`, `aria-specialist`, `alt-text-headings`
- **PR review:** `pr-review` plus the web specialists matching the diff
- **Documents (.docx, .xlsx, .pptx, PDF, EPUB):** `document-accessibility-wizard`
  and the format specialist for the file type
- **Markdown documentation:** `markdown-a11y-assistant`

## Standard

WCAG 2.2 Level AA is the baseline. Report each finding with severity, the file
and line when available, who it affects, the success criterion or extension rule
it maps to, and the fix.
