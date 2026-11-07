# Workflow action 8: Make docs accessible by default

Part of the `osaf-workflow` skill. Read this when action 8 is in scope.

- ID: `make-docs-accessible-by-default`
- Effort and cadence: Extended; Ongoing
- Canonical source: [Workflow phase, action 8](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/blob/b2ea31a2e38cbab3e774e4142575b78876b9b53f/framework/phases/workflow-phase.md#8-make-docs-accessible-by-default)

## Why it matters

This action makes project information usable for everyone.

## Definition of Done

1. Documentation uses meaningful structure and semantics (e.g. headings, lists).
2. Images, diagrams, and videos have appropriate alternatives or supporting text.
3. Tables and code blocks are presented accessibly.

## Recommended steps, adapted from the framework

1. Review the
   [accessibility best practices for documentation](https://opensource.guide/accessibility-best-practices-for-your-project/#make-docs-accessible-by-default).
2. Check document structure and semantics, images, diagrams, videos, tables,
   and code blocks.
3. Fix identified barriers.

This action fixes the documentation. Testing action 5 makes checking it a
repeatable practice; the two share their tooling.

## How this package helps

Each kind of documentation, the skill that audits it, and what it covers.

| Documentation | Skill | What it checks |
|---|---|---|
| Markdown (README, guides, `docs/`, release notes) | `markdown-a11y-assistant` (router) | Link text, image alt text, heading hierarchy, tables, emoji, Mermaid and ASCII diagrams, dashes, anchor links, plain language and list structure; applies the fixes the user approves and writes a scored report |
| HTML docs sites and generated pages | `accessibility-lead` (router), which dispatches `alt-text-headings`, `link-checker`, `tables-data-specialist` | Alt text, headings, landmarks, page titles, link purpose, table headers and captions |
| Video and audio in docs | `media-accessibility`, through `accessibility-lead` | Captions, transcripts, audio description; the MCP tool `validate_caption_file` checks WebVTT and SRT files |
| Word, Excel, PowerPoint, PDF, ePub | `document-accessibility-wizard` (router) | Titles, headings, alt text, table headers, tags and reading order |

Gaps to check by hand, because no scanner in this package covers them:

- **Code blocks:** each fenced block has a language identifier where one
  applies, code is text rather than a screenshot of code, and long command
  lines are explained in prose nearby.
- **Video in markdown:** the markdown scanner does not look for captions;
  check every embedded or linked video for captions and a transcript.
- **Issue and pull request templates:** the YAML forms are not markdown; read
  their labels and descriptions for plain language.

## How to do it in this repository

1. List the documentation in scope: root markdown files, `docs/`, the docs
   site source, templates, and any Office or PDF files.
2. Hand off the audits above; they report, and fix only what is approved.
3. Check the gaps above yourself and record what you looked at.
4. Report each Definition of Done item against the evidence, and leave the
   ongoing part to the contributor expectations (action 1) and the pull request
   checklist (action 4).

## Hand-offs

- `markdown-a11y-assistant` - audit and fix the markdown documentation.
- `accessibility-lead` - audit a generated docs site or HTML pages.
- `document-accessibility-wizard` - audit Office, PDF or ePub files in the
  repository.

## Evidence to report

- The audit reports' paths and their counts by severity.
- The files checked by hand for code blocks and video, and what was found.
