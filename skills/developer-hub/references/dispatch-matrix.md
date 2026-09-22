# Dispatch matrix: developer-hub

Generated from skill frontmatter by `scripts/build-dispatch-matrices.mjs`.
Do not edit by hand; change a skill's `metadata.domain` instead.

Every skill this router can dispatch. They are invisible to the model by
design, so this file is the only place they are named. Dispatch by the
prompt shape in SKILL.md, never by pasting a body.

## Specialists

The 6 reviewing skills in these domains, with the task each one answers.
Each returns findings JSON; none of them edits files.

| Skill | Use it for |
|---|---|
| `a11y-tool-builder` | Build accessibility scanners, rule engines, parsers and report generators. |
| `desktop-a11y-specialist` | Desktop a11y APIs: UI Automation, MSAA/IAccessible2, NSAccessibility. |
| `desktop-a11y-testing-coach` | Test desktop apps with NVDA, JAWS, Narrator, VoiceOver and UIA tooling. |
| `nvda-addon-specialist` | NVDA add-ons: plugin types, manifest, events, scripts and packaging. |
| `python-specialist` | Python debugging, packaging, testing, typing, async and performance. |
| `wxpython-specialist` | wxPython GUI: sizers, events, AUI, custom controls and threading. |

## Outside this router

Hand off rather than improvise when the task leaves these domains:

- `accessibility-lead` - web, cross-cutting
- `web-accessibility-wizard` - web, cross-cutting
- `document-accessibility-wizard` - documents
- `markdown-a11y-assistant` - markdown
- `github-hub` - github
