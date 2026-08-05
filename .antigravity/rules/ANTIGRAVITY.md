# Antigravity CLI Accessibility Guidelines

This workspace enforces WCAG 2.2 AA accessibility standards for Google Antigravity CLI (`agy`), Antigravity 2.0, and Antigravity IDE environments.

## Repository Policy: Strict No Emoji

Repository-wide rule: do not add emoji characters in generated, edited, or reviewed content.

- Replace emoji with plain text labels (e.g., `[OK]`, `[FAIL]`, `[WARN]`).
- Applies to code comments, docstrings, issue/PR templates, agent prompts, and release notes.

## Mandatory Accessibility Check

Before writing or modifying any web UI code - including HTML, JSX, TSX, CSS, React components, Vue/Svelte components, web pages, forms, modals, or user-facing web content - you MUST:

1. Identify required accessibility skills for the current task
2. Apply specialist knowledge before generating code
3. Verify output against accessibility checklists
4. Use `askQuestions` to present structured choices when options or clarifications are needed

**Automatic trigger detection:** If a user prompt involves creating, editing, or reviewing files matching `*.html`, `*.jsx`, `*.tsx`, `*.vue`, `*.svelte`, `*.astro`, or `*.css` - treat it as a web UI task and apply the Decision Matrix below. Do not wait for explicit user request.

## Antigravity Agent Ecosystem (80 Agents)

The Antigravity CLI plugin bundle (`antigravity-plugin/` or `.antigravity/`) equips `agy` with 80 specialized accessibility agents across 4 teams:

### 1. Web Accessibility Team
- **accessibility-lead** - Master coordinator and review gatekeeper
- **aria-specialist** - ARIA roles, states, properties, and widget patterns
- **modal-specialist** - Dialog focus trapping, escape handling, and focus restoration
- **contrast-master** - Color contrast ratios (4.5:1 text, 3:1 UI), dark mode, focus rings
- **keyboard-navigator** - Tab order, focus management, skip links, arrow key navigation
- **live-region-controller** - Dynamic content announcements, toasts, AJAX state updates
- **forms-specialist** - Labels, validation, error messaging, fieldsets, autocomplete
- **alt-text-headings** - Image alt text, SVG accessibility, heading hierarchy, landmarks
- **tables-data-specialist** - Data table markup, scope, headers, ARIA grids
- **link-checker** - Ambiguous link text detection, new-tab warnings
- **text-quality-reviewer** - Non-visual text quality review
- **i18n-accessibility** - Multilingual accessibility, RTL support, localization
- **web-accessibility-wizard** - Guided web accessibility audit with step-by-step walkthrough

### 2. Document Accessibility Team
- **document-accessibility-wizard** - Office and PDF audit coordinator
- **word-accessibility** - Microsoft Word (.docx) accessibility
- **excel-accessibility** - Microsoft Excel (.xlsx) accessibility
- **powerpoint-accessibility** - Microsoft PowerPoint (.pptx) accessibility
- **pdf-accessibility** - PDF/UA conformance and Matterhorn Protocol
- **epub-accessibility** - ePub document accessibility
- **office-remediator** - Programmatic Office document remediation
- **pdf-remediator** - PDF document remediation

### 3. GitHub Workflow Team
- **nexus** / **github-hub** - GitHub workflow orchestrator
- **daily-briefing** - Morning issue, PR, and CI briefing
- **pr-review** - Pull request code review with accessibility focus
- **issue-tracker** - Issue triage and priority scoring
- **analytics** - Repository health metrics and scoring
- **actions-manager** - GitHub Actions workflow runs and debugging
- **security-dashboard** - Dependabot, code scanning, and secret scanning triage
- **release-manager** - Releases, tags, and release notes
- **notifications-manager** - Notification inbox filtering and management
- **wiki-manager** - Wiki page editing and organization

### 4. Developer Tools Team
- **developer-hub** - Developer tools coordinator
- **python-specialist** - Python debugging and packaging
- **wxpython-specialist** - wxPython accessibility
- **nvda-addon-specialist** - NVDA screen reader addon development
- **desktop-a11y-specialist** - Desktop accessibility APIs (Windows UIA)
- **a11y-tool-builder** - Building custom accessibility scanning tools

## Decision Matrix

- **New component or page:** Apply `aria-specialist` + `keyboard-navigator` + `alt-text-headings`. Add `forms-specialist` for inputs, `contrast-master` for CSS, `modal-specialist` for overlays, `live-region-controller` for dynamic updates.
- **Modifying existing UI:** At minimum apply `keyboard-navigator` (tab order breaks easily).
- **Code review/audit:** Apply all specialist checklists or invoke `web-accessibility-wizard`.
- **Document audit:** Use `document-accessibility-wizard` for Office and PDF files.
- **Mobile app (React Native / Expo / iOS / Android):** Apply `cognitive-accessibility` and `mobile-accessibility`.
- **Design system / tokens:** Use `design-system-auditor` to validate color tokens and focus rings.

## Context Discovery

When starting an audit or remediation in `agy`:

1. Check for `.a11y-web-config.json`, `.a11y-office-config.json`, or `.a11y-pdf-config.json`.
2. Look for existing reports: `ACCESSIBILITY-AUDIT.md`, `WEB-ACCESSIBILITY-AUDIT.md`, `DOCUMENT-ACCESSIBILITY-AUDIT.md`.
3. Check `templates/` directory for pre-built scan configuration profiles.

## Non-Negotiable Standards

- Semantic HTML before ARIA (`<button>` over `<div role="button">`).
- Exactly one `<h1>` per page; logical heading hierarchy (`<h1>` -> `<h2>` -> `<h3>`).
- Keyboard reachable and operable for every interactive element.
- Text contrast minimum 4.5:1, component contrast 3:1.
- No information conveyed solely by color.
- Focus trapping and restoration for all modal dialogs.
- Live regions (`aria-live="polite"`) for dynamic content updates.
