# Dispatch matrix: document-accessibility-wizard

Generated from skill frontmatter by `scripts/build-dispatch-matrices.mjs`.
Do not edit by hand; change a skill's `metadata.domain` instead.

Every skill this router can dispatch. They are invisible to the model by
design, so this file is the only place they are named. Dispatch by the
prompt shape in SKILL.md, never by pasting a body.

## Specialists

The 7 reviewing skills in these domains, with the task each one answers.
Each returns findings JSON; none of them edits files.

| Skill | Use it for |
|---|---|
| `epub-accessibility` | Scan and fix .epub files: EPUB Accessibility 1.1, reading order, nav. |
| `excel-accessibility` | Scan and fix .xlsx files: sheet names, table headers, alt text, merges. |
| `office-remediator` | Fix .docx, .xlsx and .pptx programmatically via python-docx and friends. |
| `pdf-accessibility` | Scan and fix PDFs: PDF/UA, Matterhorn checks, tags and reading order. |
| `pdf-remediator` | Fix PDFs by script or Acrobat: title, language, reading order, tags. |
| `powerpoint-accessibility` | Scan and fix .pptx files: slide titles, alt text and reading order. |
| `word-accessibility` | Scan and fix .docx files: title, headings, alt text, table headers. |

## Helpers

The 6 mechanical skills in these domains: discovery, scanning, export and
configuration. Dispatch these without asking the user first.

| Skill | Use it for |
|---|---|
| `cross-document-analyzer` | cross-document patterns, severity scoring, templates. |
| `document-csv-reporter` | export document findings to CSV with help links. |
| `document-inventory` | discover documents, build an inventory, detect changes. |
| `epub-scan-config` | manage .a11y-epub-config.json scan settings. |
| `office-scan-config` | manage .a11y-office-config.json scan settings. |
| `pdf-scan-config` | manage .a11y-pdf-config.json scan settings. |

## Outside this router

Hand off rather than improvise when the task leaves these domains:

- `accessibility-lead` - web, cross-cutting
- `web-accessibility-wizard` - web, cross-cutting
- `markdown-a11y-assistant` - markdown
- `developer-hub` - developer, desktop
- `github-hub` - github
