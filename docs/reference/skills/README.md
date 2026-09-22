# Skills catalog

Every skill in the package, by tier and domain. Generated from frontmatter by
`scripts/build-docs.mjs`; do not edit by hand. A skill with a page of its own
links to it.

The tier decides who can start a skill and what it costs before it is
dispatched. Only routers are visible to the model.

| Tier | Count | Model invokes | User invokes | Cost until dispatched |
|---|---:|---|---|---|
| Router | 6 | yes | yes | one description line, every turn |
| Specialist | 57 | no | by name | nothing |
| Helper | 16 | no | no | nothing |
| Reference | 29 | no | no | nothing |

108 skills in total.

## Routers

The six entry points. Describe the task and one of these picks it up.

| Skill | Use it for |
|---|---|
| [`accessibility-lead`](accessibility-lead.md) | Web UI accessibility lead. Use before writing or changing HTML, JSX, TSX, Vue, Svelte, CSS or templates. Picks specialists and merges their findings. |
| [`developer-hub`](developer-hub.md) | Start here for Python, wxPython, desktop app, NVDA add-on and accessibility tooling work. Routes to the right specialist. |
| [`document-accessibility-wizard`](document-accessibility-wizard.md) | Guided accessibility audit of Word, Excel, PowerPoint, PDF and ePub files, one at a time or by the folder, with a scored report. |
| [`github-hub`](github-hub.md) | Start here for GitHub work: issues, pull requests, releases, projects, actions, security alerts, teams and wikis. |
| [`markdown-a11y-assistant`](markdown-a11y-assistant.md) | Guided WCAG audit of markdown docs: link text, alt text, heading order, tables, emoji, diagrams and anchors. |
| [`web-accessibility-wizard`](web-accessibility-wizard.md) | Guided WCAG 2.2 audit of a web app or site, phase by phase, with severity scores, a written report and optional fixes. |

## Web

21 specialists, each reviewing one domain and returning findings.

| Skill | Use it for |
|---|---|
| [`alt-text-headings`](alt-text-headings.md) | Alt text, SVGs, figures, charts, heading order, page titles and landmarks. |
| [`aria-specialist`](aria-specialist.md) | ARIA roles, states and properties for custom widgets and dynamic content. |
| [`cognitive-accessibility`](cognitive-accessibility.md) | Plain language, WCAG 2.2 cognitive criteria, COGA guidance and auth UX. |
| [`contrast-master`](contrast-master.md) | Color contrast, themes, dark mode, non-text contrast and color-only meaning. |
| [`data-visualization-accessibility`](data-visualization-accessibility.md) | Charts, graphs and dashboards: SVG ARIA, table alternatives, safe palettes. |
| [`design-system-auditor`](design-system-auditor.md) | Check color, focus ring, spacing and motion tokens before they reach UI. |
| [`email-accessibility`](email-accessibility.md) | HTML email accessibility under email client rendering constraints. |
| [`forms-specialist`](forms-specialist.md) | Labels, validation, error handling, multi-step wizards and autocomplete. |
| [`i18n-accessibility`](i18n-accessibility.md) | Right-to-left and language: dir, lang tags, bidi text, icon mirroring. |
| [`keyboard-navigator`](keyboard-navigator.md) | Tab order, focus management, shortcuts, skip links and focus visibility. |
| [`link-checker`](link-checker.md) | Find vague link text such as click here, read more or a bare URL. |
| [`live-region-controller`](live-region-controller.md) | Announce dynamic updates: live regions, toasts, loading states and results. |
| [`media-accessibility`](media-accessibility.md) | Captions, transcripts, audio description and accessible media players. |
| [`mobile-accessibility`](mobile-accessibility.md) | React Native, Expo, iOS and Android: labels, roles and touch targets. |
| [`modal-specialist`](modal-specialist.md) | Dialogs, drawers, popovers and overlays: focus trap, return and dismissal. |
| [`performance-accessibility`](performance-accessibility.md) | Lazy loading, skeletons, layout shift and loading states for AT users. |
| [`screen-reader-lab`](screen-reader-lab.md) | Simulate screen reader narration of HTML or JSX, step by step. |
| [`tables-data-specialist`](tables-data-specialist.md) | Data tables and grids: headers, scope, captions, sorting and complex tables. |
| [`testing-coach`](testing-coach.md) | How to test: screen readers, keyboard passes, automated checks and CI. |
| [`text-quality-reviewer`](text-quality-reviewer.md) | Catch weak alt text, aria-labels and button names, and template leftovers. |
| [`web-component-specialist`](web-component-specialist.md) | Custom elements and shadow DOM: ElementInternals, cross-shadow ARIA, focus. |

7 helpers, dispatched by a router for mechanical work.

| Skill | Use it for |
|---|---|
| [`cross-page-analyzer`](cross-page-analyzer.md) | cross-page patterns, severity scoring, scorecards. |
| [`lighthouse-bridge`](lighthouse-bridge.md) | read Lighthouse CI accessibility audits into findings. |
| [`playwright-scanner`](playwright-scanner.md) | behavioral scans via Playwright for keyboard and state. |
| [`playwright-verifier`](playwright-verifier.md) | re-run targeted scans to confirm a fix works at runtime. |
| [`scanner-bridge`](scanner-bridge.md) | read GitHub Accessibility Scanner issues into findings. |
| [`web-csv-reporter`](web-csv-reporter.md) | export web findings to CSV with Deque University links. |
| [`web-issue-fixer`](web-issue-fixer.md) | apply approved web accessibility fixes to source. |

## Documents

7 specialists, each reviewing one domain and returning findings.

| Skill | Use it for |
|---|---|
| [`epub-accessibility`](epub-accessibility.md) | Scan and fix .epub files: EPUB Accessibility 1.1, reading order, nav. |
| [`excel-accessibility`](excel-accessibility.md) | Scan and fix .xlsx files: sheet names, table headers, alt text, merges. |
| [`office-remediator`](office-remediator.md) | Fix .docx, .xlsx and .pptx programmatically via python-docx and friends. |
| [`pdf-accessibility`](pdf-accessibility.md) | Scan and fix PDFs: PDF/UA, Matterhorn checks, tags and reading order. |
| [`pdf-remediator`](pdf-remediator.md) | Fix PDFs by script or Acrobat: title, language, reading order, tags. |
| [`powerpoint-accessibility`](powerpoint-accessibility.md) | Scan and fix .pptx files: slide titles, alt text and reading order. |
| [`word-accessibility`](word-accessibility.md) | Scan and fix .docx files: title, headings, alt text, table headers. |

6 helpers, dispatched by a router for mechanical work.

| Skill | Use it for |
|---|---|
| [`cross-document-analyzer`](cross-document-analyzer.md) | cross-document patterns, severity scoring, templates. |
| [`document-csv-reporter`](document-csv-reporter.md) | export document findings to CSV with help links. |
| [`document-inventory`](document-inventory.md) | discover documents, build an inventory, detect changes. |
| [`epub-scan-config`](epub-scan-config.md) | manage .a11y-epub-config.json scan settings. |
| [`office-scan-config`](office-scan-config.md) | manage .a11y-office-config.json scan settings. |
| [`pdf-scan-config`](pdf-scan-config.md) | manage .a11y-pdf-config.json scan settings. |

## Markdown

3 helpers, dispatched by a router for mechanical work.

| Skill | Use it for |
|---|---|
| [`markdown-csv-reporter`](markdown-csv-reporter.md) | export markdown findings to CSV with rule links. |
| [`markdown-fixer`](markdown-fixer.md) | apply approved markdown fixes, surface judgment calls. |
| [`markdown-scanner`](markdown-scanner.md) | scan one markdown file across all nine domains. |

## Github

16 specialists, each reviewing one domain and returning findings.

| Skill | Use it for |
|---|---|
| [`actions-manager`](actions-manager.md) | GitHub Actions: workflow runs, logs, re-runs and CI failure triage. |
| [`analytics`](analytics.md) | GitHub metrics: velocity, review turnaround, churn and bottlenecks. |
| [`contributions-hub`](contributions-hub.md) | GitHub community: discussions, moderation, contributor health, CLAs. |
| [`daily-briefing`](daily-briefing.md) | Daily GitHub briefing: issues, PRs, reviews, releases and discussions. |
| [`insiders-a11y-tracker`](insiders-a11y-tracker.md) | Track accessibility changes in VS Code and other repos you follow. |
| [`issue-tracker`](issue-tracker.md) | GitHub issues: find, triage, review and respond, with written reports. |
| [`notifications-manager`](notifications-manager.md) | GitHub notifications: read, filter, triage and manage from the editor. |
| [`pr-review`](pr-review.md) | Review pull requests: diffs, comments, context and written review docs. |
| [`projects-manager`](projects-manager.md) | GitHub Projects v2: boards, views, fields, iterations, item workflows. |
| [`release-manager`](release-manager.md) | GitHub releases: create, edit and manage releases and their assets. |
| [`repo-admin`](repo-admin.md) | Repo admin: collaborators, branch protection, webhooks and labels. |
| [`repo-manager`](repo-manager.md) | Scaffold a repo: templates, contributing guides, CI, labels, licenses. |
| [`security-dashboard`](security-dashboard.md) | Triage Dependabot, code scanning and secret scanning alerts. |
| [`team-manager`](team-manager.md) | GitHub org teams: create, staff, onboard, offboard and audit access. |
| [`template-builder`](template-builder.md) | Build GitHub issue, PR and discussion templates from a guided wizard. |
| [`wiki-manager`](wiki-manager.md) | GitHub wikis: create, edit, organize and search pages from the editor. |

## Developer

3 specialists, each reviewing one domain and returning findings.

| Skill | Use it for |
|---|---|
| [`a11y-tool-builder`](a11y-tool-builder.md) | Build accessibility scanners, rule engines, parsers and report generators. |
| [`python-specialist`](python-specialist.md) | Python debugging, packaging, testing, typing, async and performance. |
| [`wxpython-specialist`](wxpython-specialist.md) | wxPython GUI: sizers, events, AUI, custom controls and threading. |

## Desktop

3 specialists, each reviewing one domain and returning findings.

| Skill | Use it for |
|---|---|
| [`desktop-a11y-specialist`](desktop-a11y-specialist.md) | Desktop a11y APIs: UI Automation, MSAA/IAccessible2, NSAccessibility. |
| [`desktop-a11y-testing-coach`](desktop-a11y-testing-coach.md) | Test desktop apps with NVDA, JAWS, Narrator, VoiceOver and UIA tooling. |
| [`nvda-addon-specialist`](nvda-addon-specialist.md) | NVDA add-ons: plugin types, manifest, events, scripts and packaging. |

## Cross cutting

7 specialists, each reviewing one domain and returning findings.

| Skill | Use it for |
|---|---|
| [`accessibility-regression-detector`](accessibility-regression-detector.md) | Compare audits across commits to find new, fixed and regressed issues. |
| [`accessibility-statement`](accessibility-statement.md) | Generate a W3C or EU model accessibility statement from audit results. |
| [`ci-accessibility`](ci-accessibility.md) | Set up and debug accessibility CI: baselines, SARIF and PR gating. |
| [`compliance-mapping`](compliance-mapping.md) | Map findings to Section 508, EN 301 549, EAA, ADA, AODA; build a VPAT. |
| [`wcag-aaa`](wcag-aaa.md) | WCAG 2.2 Level AAA criteria that go beyond the AA target. |
| [`wcag-guide`](wcag-guide.md) | Explain WCAG 2.2 criteria, conformance levels and what changed. |
| [`wcag3-preview`](wcag3-preview.md) | WCAG 3.0 preview: outcomes, APCA contrast and functional needs. |

## Reference skills

Lookup data cited by the skills above: rule tables, URL registries, formulas. Never dispatched.

| Skill | Holds |
|---|---|
| `a11y-core` | Shared contract for the Accessibility Agents skills - dispatch, findings schema, report rules. Read by skills, never dispatched on its own. |
| `kb-accessibility-rules` | Cross-format accessibility rule reference with WCAG 2.2 mapping for Word, Excel, PowerPoint, and PDF documents. |
| `kb-ci-integration` | CI/CD accessibility pipeline patterns with axe-core CLI, SARIF output, PR annotations, baseline management, and multi-platform CI templates. |
| `kb-cognitive-accessibility` | Review UI for cognitive load, plain language clarity, and WCAG 2.2 cognitive SC (3.3.7, 3.3.8, 3.3.9). Includes COGA guidance, reading level, auth patterns, and timeout warnings. |
| `kb-data-visualization-accessibility` | Audit charts and graphs for accessibility: SVG ARIA, data table alternatives, keyboard interaction, color-safe palettes, and library APIs. |
| `kb-design-system` | Validate design system tokens for WCAG AA/AAA contrast. Compute color token contrast, focus ring validation (WCAG 2.4.13), motion tokens, and spacing for touch targets across frameworks. |
| `kb-document-scanning` | Discover and inventory documents for accessibility audits. Scans folders for .docx, .xlsx, .pptx, and PDFs. Detects git changes and extracts title, author, and language metadata. |
| `kb-email-accessibility` | HTML email accessibility: table layouts, inline styles, dark mode, image fallbacks, and email client rendering constraints. |
| `kb-framework-accessibility` | Framework-specific accessibility patterns and fix templates for React, Vue, Angular, Svelte, Next.js, and Tailwind CSS. |
| `kb-github-a11y-scanner` | Integrate GitHub Accessibility Scanner. Detects configuration, parses scanner issues, correlates with local scans, and tracks Copilot-assigned fixes. |
| `kb-github-analytics-scoring` | Score repository health (0-100, A-F grades), priorities, and delta tracking. Includes velocity metrics, confidence levels, and bottleneck detection. |
| `kb-github-scanning` | Search GitHub for issues, PRs, discussions, releases, and alerts. Includes query construction, date range handling, repo scoping, and cross-repo intelligence. |
| `kb-github-shared-instructions` | Persona, authentication, output and reporting rules every GitHub skill follows. |
| `kb-github-workflow-standards` | Core standards for GitHub workflow agents: authentication, repository discovery, dual MD+HTML output, accessibility compliance, safety rules, and parallel execution patterns. |
| `kb-help-url-reference` | Map accessibility findings to help resources: axe-core to Accessibility Insights, document rules to Microsoft Office/Adobe, WCAG criteria to W3C Understanding documents. |
| `kb-legal-compliance-mapping` | Map accessibility audit results to legal frameworks: Section 508, ADA, EN 301 549, EAA, AODA. Generate VPAT 2.5 conformance tables. |
| `kb-lighthouse-scanner` | Integrate Lighthouse CI accessibility audits. Detects configuration, parses results, maps findings to severity model, and tracks score regressions. |
| `kb-markdown-accessibility` | Audit and fix markdown for accessibility. Covers ambiguous links, anchors, emoji (remove/translate), Mermaid/ASCII templates, heading hierarchy, table descriptions, and severity scoring. |
| `kb-media-accessibility` | Video/audio accessibility: WebVTT/SRT/TTML captions, audio descriptions, accessible media player ARIA, and WCAG 1.2.x compliance. |
| `kb-mobile-accessibility` | Audit React Native, Expo, iOS, Android for accessibility. Review accessibilityLabel, accessibilityRole, accessibilityHint, touch targets (44x44pt min), screen reader support, and platform semantics. |
| `kb-office-remediation` | Remediate Office documents (Word/Excel/PowerPoint) for accessibility. Generates Python scripts via python-docx, openpyxl, python-pptx API references. |
| `kb-path-instructions` | Per-file-type accessibility rules: semantic HTML, ARIA patterns, CSS, markdown, testing and terminology. |
| `kb-playwright-testing` | Browser accessibility testing using Playwright and @axe-core/playwright. Keyboard scans, contrast verification, and accessibility tree snapshots. |
| `kb-python-development` | Python and wxPython development: packaging (PyInstaller/Nuitka), testing, desktop accessibility APIs, cross-platform paths, and framework patterns. |
| `kb-report-generation` | Format accessibility audit reports with severity scoring (0-100, A-F grades), scorecard computation, and compliance exports including VPAT/ACR and remediation priorities. |
| `kb-severity-mapping` | Canonical severity level definitions and cross-domain mapping for web, document, and markdown audits. Score impact ranges, WCAG conformance alignment, and cross-format normalization. |
| `kb-testing-strategy` | Accessibility testing decision trees, browser/AT compatibility matrices, manual vs. automated test coverage, regression testing patterns, and acceptance criteria templates for user stories. |
| `kb-web-scanning` | Web content discovery, URL crawling, and page inventory for accessibility audits. Use when scanning web pages, crawling sites for audit scope, or building page inventories for multi-page audits. |
| `kb-web-severity-scoring` | Compute web accessibility scores (0-100, A-F grades) with severity scoring, confidence levels, and remediation tracking across audits. |
