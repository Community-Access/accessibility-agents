# Dispatch matrix: markdown-a11y-assistant

Generated from skill frontmatter by `scripts/build-dispatch-matrices.mjs`.
Do not edit by hand; change a skill's `metadata.domain` instead.

Every skill this router can dispatch. They are invisible to the model by
design, so this file is the only place they are named. Dispatch by the
prompt shape in SKILL.md, never by pasting a body.

## Specialists

The 0 reviewing skills in these domains, with the task each one answers.
Each returns findings JSON; none of them edits files.

| Skill | Use it for |
|---|---|

## Helpers

The 3 mechanical skills in these domains: discovery, scanning, export and
configuration. Dispatch these without asking the user first.

| Skill | Use it for |
|---|---|
| `markdown-csv-reporter` | export markdown findings to CSV with rule links. |
| `markdown-fixer` | apply approved markdown fixes, surface judgment calls. |
| `markdown-scanner` | scan one markdown file across all nine domains. |

## Outside this router

Hand off rather than improvise when the task leaves these domains:

- `accessibility-lead` - web, cross-cutting
- `web-accessibility-wizard` - web, cross-cutting
- `document-accessibility-wizard` - documents
- `developer-hub` - developer, desktop
- `github-hub` - github
