# Accessibility Agents

WCAG 2.2 AA enforcement for web UI, Office and PDF documents, markdown, desktop
apps and the GitHub workflows around them. The package is a set of Agent Skills
in `skills/`, readable by Claude Code, Codex, Copilot, Gemini and Antigravity
without per-client copies.

## The rule

Accessibility review is not optional and is not something to remember at the
end. Before you write or change any of the following, dispatch the router named
beside it and let it finish. The table pairs each kind of work with the one
skill that owns it.

| You are about to touch | Dispatch |
|---|---|
| HTML, JSX, TSX, Vue, Svelte, Astro, CSS, or a server template (.leaf, .ejs, .erb, .hbs, .jinja, .twig) | `accessibility-lead` |
| A full site or app audit rather than one change | `web-accessibility-wizard` |
| .docx, .xlsx, .pptx, .pdf, .epub | `document-accessibility-wizard` |
| Markdown documentation | `markdown-a11y-assistant` |
| Python, wxPython, a desktop app, an NVDA add-on, or accessibility tooling | `developer-hub` |
| Issues, pull requests, releases, projects, actions, security alerts, teams, wikis | `github-hub` |

Enforcement hooks back this up: UI edits are blocked until `accessibility-lead`
has run in the session. If an edit is refused, that is why.

This applies to user-facing content. Backend logic, build scripts and database
work are out of scope.

## Routers

Six skills are model-invocable. Everything else is dispatched by one of them.

- `accessibility-lead` - picks specialists for a web change and merges findings
- `web-accessibility-wizard` - guided, phased WCAG audit with a scored report
- `document-accessibility-wizard` - Office, PDF and ePub audits, file or folder
- `markdown-a11y-assistant` - markdown audit: links, alt text, headings, tables
- `developer-hub` - Python, wxPython, desktop and NVDA work
- `github-hub` - GitHub workflows. Also answers to the older name `nexus`

Routers dispatch by pointer, never by pasting instructions. The contract, the
findings schema and the report rules are in `skills/a11y-core/SKILL.md`.

## Standards that do not get traded away

- Semantic HTML before ARIA. A `button` element beats `div role="button"`.
- One H1 per page. Never skip heading levels.
- Every interactive element reachable and operable by keyboard.
- Text contrast 4.5:1. UI component and graphical object contrast 3:1.
- No information carried by color alone.
- Focus managed on route change, dynamic content and deletion.
- Dialogs trap focus and return it on close.
- Dynamic content updates are announced.

## Before an audit

Read any `.a11y-office-config.json`, `.a11y-pdf-config.json`,
`.a11y-epub-config.json` or `.a11y-web-config.json` in the workspace root and
honour it rather than defaults. If a previous `*-ACCESSIBILITY-AUDIT.md` exists,
offer delta mode so the user can see what moved.

## House style

No emoji, anywhere. No decorative Unicode, box drawing or icon bullets. Plain
ASCII punctuation and hyphen bullets. This is an accessibility project and its
own output is read aloud.

## More

- Full agent roster, knowledge domains and decision matrix: `docs/agent-reference.md`
- How to write and build files in this repository: `docs/repository-conventions.md`
- Shared contract, findings schema, report requirements: `skills/a11y-core/SKILL.md`
