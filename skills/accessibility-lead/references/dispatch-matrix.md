# Dispatch matrix: accessibility-lead

Generated from skill frontmatter by `scripts/build-dispatch-matrices.mjs`.
Do not edit by hand; change a skill's `metadata.domain` instead.

Every skill this router can dispatch. They are invisible to the model by
design, so this file is the only place they are named. Dispatch by the
prompt shape in SKILL.md, never by pasting a body.

## Specialists

The 28 reviewing skills in these domains, with the task each one answers.
Each returns findings JSON; none of them edits files.

| Skill | Use it for |
|---|---|
| `accessibility-regression-detector` | Compare audits across commits to find new, fixed and regressed issues. |
| `accessibility-statement` | Generate a W3C or EU model accessibility statement from audit results. |
| `alt-text-headings` | Alt text, SVGs, figures, charts, heading order, page titles and landmarks. |
| `aria-specialist` | ARIA roles, states and properties for custom widgets and dynamic content. |
| `ci-accessibility` | Set up and debug accessibility CI: baselines, SARIF and PR gating. |
| `cognitive-accessibility` | Plain language, WCAG 2.2 cognitive criteria, COGA guidance and auth UX. |
| `compliance-mapping` | Map findings to Section 508, EN 301 549, EAA, ADA, AODA; build a VPAT. |
| `contrast-master` | Color contrast, themes, dark mode, non-text contrast and color-only meaning. |
| `data-visualization-accessibility` | Charts, graphs and dashboards: SVG ARIA, table alternatives, safe palettes. |
| `design-system-auditor` | Check color, focus ring, spacing and motion tokens before they reach UI. |
| `email-accessibility` | HTML email accessibility under email client rendering constraints. |
| `forms-specialist` | Labels, validation, error handling, multi-step wizards and autocomplete. |
| `i18n-accessibility` | Right-to-left and language: dir, lang tags, bidi text, icon mirroring. |
| `keyboard-navigator` | Tab order, focus management, shortcuts, skip links and focus visibility. |
| `link-checker` | Find vague link text such as click here, read more or a bare URL. |
| `live-region-controller` | Announce dynamic updates: live regions, toasts, loading states and results. |
| `media-accessibility` | Captions, transcripts, audio description and accessible media players. |
| `mobile-accessibility` | React Native, Expo, iOS and Android: labels, roles and touch targets. |
| `modal-specialist` | Dialogs, drawers, popovers and overlays: focus trap, return and dismissal. |
| `performance-accessibility` | Lazy loading, skeletons, layout shift and loading states for AT users. |
| `screen-reader-lab` | Simulate screen reader narration of HTML or JSX, step by step. |
| `tables-data-specialist` | Data tables and grids: headers, scope, captions, sorting and complex tables. |
| `testing-coach` | How to test: screen readers, keyboard passes, automated checks and CI. |
| `text-quality-reviewer` | Catch weak alt text, aria-labels and button names, and template leftovers. |
| `wcag-aaa` | WCAG 2.2 Level AAA criteria that go beyond the AA target. |
| `wcag-guide` | Explain WCAG 2.2 criteria, conformance levels and what changed. |
| `wcag3-preview` | WCAG 3.0 preview: outcomes, APCA contrast and functional needs. |
| `web-component-specialist` | Custom elements and shadow DOM: ElementInternals, cross-shadow ARIA, focus. |

## Helpers

The 7 mechanical skills in these domains: discovery, scanning, export and
configuration. Dispatch these without asking the user first.

| Skill | Use it for |
|---|---|
| `cross-page-analyzer` | cross-page patterns, severity scoring, scorecards. |
| `lighthouse-bridge` | read Lighthouse CI accessibility audits into findings. |
| `playwright-scanner` | behavioral scans via Playwright for keyboard and state. |
| `playwright-verifier` | re-run targeted scans to confirm a fix works at runtime. |
| `scanner-bridge` | read GitHub Accessibility Scanner issues into findings. |
| `web-csv-reporter` | export web findings to CSV with Deque University links. |
| `web-issue-fixer` | apply approved web accessibility fixes to source. |

## Outside this router

Hand off rather than improvise when the task leaves these domains:

- `web-accessibility-wizard` - web, cross-cutting
- `document-accessibility-wizard` - documents
- `markdown-a11y-assistant` - markdown
- `developer-hub` - developer, desktop
- `github-hub` - github
