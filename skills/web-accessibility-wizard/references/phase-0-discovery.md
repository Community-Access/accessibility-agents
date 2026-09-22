# Web Accessibility Wizard reference: Phase 0: Project Discovery

Part of the `web-accessibility-wizard` skill. Read this only when the task reaches these sections.

## Phase 0: Project Discovery

Start with the most important question first. Use AskUserQuestion:

### Step 0: CI Scanner Auto-Detection

Before asking the user anything, silently check the workspace for CI-based accessibility scanners:

1. **GitHub Accessibility Scanner:** Search for `.github/workflows/*.yml` files containing `github/accessibility-scanner@v`. If found, note the workflow file, scanned URLs, and whether Copilot assignment is enabled.
2. **Lighthouse CI:** Search for `.github/workflows/*.yml` files containing `treosh/lighthouse-ci-action` or `lhci`, and check for `lighthouserc.js`, `lighthouserc.json`, or `.lighthouserc.yml` config files. If found, note the workflow file and configured URLs.

If either scanner is detected, dispatch the appropriate bridge agent (`scanner-bridge` for GitHub Scanner, `lighthouse-bridge` for Lighthouse) via the Task tool to fetch existing findings. Store these findings for correlation in Phase 9.

3. **Playwright Availability:** Check if the Playwright MCP tools are available by attempting to call `run_playwright_keyboard_scan` with a test URL. If the tool exists, behavioral testing (Phase 10) can run against the dev server URL. Note the availability status.
4. **Dev Server Probing:** If no URL is provided later in Step 2, attempt to probe common dev server ports (3000, 5173, 8080, 4200, 8000) by checking if they respond. Store any detected URL for potential use in Phase 9 and Phase 10.

Announce detection results before proceeding:

- If found: `GitHub Accessibility Scanner detected in .github/workflows/a11y-scan.yml -- 12 open issues fetched for correlation.`
- If found: `Lighthouse CI detected in .github/workflows/lighthouse.yml -- latest accessibility score: 87/100.`
- If neither found: proceed silently to Step 1.

### Step 1: App State

Ask: **"What state is your application in?"**
Options:

- **Development** - Running locally, not yet deployed
- **Production** - Live and accessible via a public URL
- **Re-scan with comparison** - I have a previous audit report and want to compare results
- **Changed pages only (delta scan)** - Only audit pages that have changed since the last audit

### Step 2a: If Development

Ask these follow-up questions using AskUserQuestion:

1. **"What type of project is this?"** - Options: Web app, Marketing site, Dashboard, E-commerce, SaaS, Documentation site
2. **"What framework/tech stack?"** - Options: React, Vue, Angular, Next.js, Svelte, Vanilla HTML/CSS/JS
3. **"Is your dev server running? If so, what is the URL and port?"** - Let the user type their localhost URL (for example `http://localhost:3000`). If they do not have a dev server running, skip runtime scanning in Phase 9.
4. **"What is your target WCAG conformance level?"** - Options: WCAG 2.2 AA (Recommended), WCAG 2.1 AA, WCAG 2.2 AAA

### Step 2b: If Production

1. **"What is the URL of your application?"** - Let the user provide the production URL. This will be used for runtime scanning in Phase 9.
2. **"What type of project is this?"** - Options: Web app, Marketing site, Dashboard, E-commerce, SaaS, Documentation site
3. **"What framework/tech stack?"** - Options: React, Vue, Angular, Next.js, Svelte, Vanilla HTML/CSS/JS
4. **"What is your target WCAG conformance level?"** - Options: WCAG 2.2 AA (Recommended), WCAG 2.1 AA, WCAG 2.2 AAA

### Step 3: Audit Scope

Ask using AskUserQuestion:

1. **"How deep should this audit go?"** - Options:
   - **Current page only** - Audit just the single URL you provided
   - **Key pages** - Audit the main pages (home, login, dashboard, etc.) - I will ask you to list them
   - **Full site crawl** - Discover and audit every page reachable from the starting URL
2. **"How thorough should each page review be?"** - Options:
   - **Quick scan** - Check the most impactful issues (structure, labels, contrast, keyboard)
   - **Standard review (Recommended)** - Run all audit phases
   - **Deep dive** - Run all phases plus extra checks (animation, cognitive load, touch targets)

If the user chose **Key pages**, follow up with:

- **"Which pages should I audit? List the URLs or route names."** - Let the user type their page list

### Step 4: Audit Method

Ask using AskUserQuestion:

1. **"What type of audit do you want?"** - Options:
   - **Runtime scan only (Recommended if URL available)** - Run axe-core against the live site. No source code review.
   - **Code review only** - Review the source code statically. No runtime scan.
   - **Both** - Run axe-core AND review the source code.

**CRITICAL: DO NOT default to code review.** If the user has a URL and chose "Runtime scan only", you MUST run axe-core and MUST NOT read or review source code files. Only review source code if the user explicitly chose "Code review only" or "Both".

### Step 5: Audit Preferences

Ask using AskUserQuestion:

1. **"Do you want screenshots captured for each issue found?"** - Options: Yes, No
2. **"Do you have any known accessibility issues already?"** - Options: Yes (let me describe them), No, Not sure

Based on their answers, customize the audit order and depth. Store the app URL (dev or production), page list, and audit method for use throughout the audit.

### Step 6: Reporting Preferences

Ask using AskUserQuestion:

1. **"Where should I write the audit report?"** - Options: `ACCESSIBILITY-AUDIT.md` (default), Custom path
2. **"How should I organize findings?"** - Options:
   - **By page** - group all issues under each page (best for small sites)
   - **By issue type** - group all instances of each rule across pages (best for seeing patterns)
   - **By severity** - critical first, then serious, moderate, minor (best for prioritizing fixes)
3. **"Should I include remediation steps for every issue?"** - Options: Yes (detailed), Summary only, No (just findings)

### Step 7: Delta Scan Configuration

If the user selected **Re-scan with comparison** or **Changed pages only (delta scan)** in Step 1, configure the delta detection method.

Ask: **"How should I detect which pages have changed?"**
Options:

- **Git diff** - use `git diff --name-only` to find source files changed since the last commit/tag, then map to affected pages/routes
- **Since last audit** - compare page content against snapshots from the previous audit report's date
- **Since a specific date** - let me specify a cutoff date
- **Against a baseline report** - compare against a specific previous audit report file

If the user selects **Git diff**, ask: **"What git reference should I compare against?"**
Options:

- **Last commit** - files changed in the most recent commit
- **Last tag** - files changed since the last git tag
- **Specific branch/commit** - let me specify a ref
- **Last N days** - files changed in the last N days

If the user selects **Against a baseline report**, ask: **"What is the path to the previous audit report?"**
Let the user provide the path to a previous `ACCESSIBILITY-AUDIT.md` file.

**Source-to-Page Mapping:** When using git diff, map changed source files to their corresponding routes/pages:

- React/Next.js: `src/pages/*.tsx` or `app/**/page.tsx` -> route paths
- Vue: `src/views/*.vue` or `pages/*.vue` -> route paths
- Angular: `src/app/**/*.component.ts` -> route paths
- Static HTML: `*.html` -> direct URL paths
- Shared components: flag all pages that consume the changed component

Store the delta configuration for use in page filtering and comparison analysis.

## Framework-Specific Intelligence

After Phase 0, activate framework-specific scanning patterns based on the detected stack. This tailors the audit to catch issues that are common in that specific framework.

### React / Next.js

- Check for `aria-*` props passed correctly (React uses camelCase: `aria-label` not `ariaLabel`)
- Verify `useEffect` cleanup for focus management on component unmount
- Check `React.Fragment` usage doesn't break landmark structure
- Verify `next/image` has `alt` prop (not just decorative)
- Check `next/link` passes accessibility props to the anchor
- Look for `dangerouslySetInnerHTML` without ARIA consideration
- Check React portals maintain focus trap context
- Verify `key` prop on lists doesn't cause focus loss on re-render

### Vue

- Check `v-html` usage for ARIA and semantic concerns
- Verify `<transition>` components don't break focus management
- Check Vue Router `<router-link>` announces navigation
- Look for `v-if` vs `v-show` impact on live regions (v-if removes from DOM)
- Verify `$refs` used for programmatic focus management
- Check `<teleport>` destinations maintain accessibility context

### Angular

- Verify `[attr.aria-*]` binding syntax (not `[aria-*]`)
- Check `*ngFor` `trackBy` prevents focus loss on list re-render
- Verify `RouterModule` navigation announcements via `LiveAnnouncer`
- Check `@angular/cdk` usage for a11y utilities (FocusTrap, LiveAnnouncer, FocusMonitor)
- Look for template-driven forms missing `aria-describedby` for validation
- Verify `ChangeDetectionStrategy.OnPush` doesn't break live region updates

### Svelte

- Check reactive declarations (`$:`) don't cause unexpected focus changes
- Verify `{#if}` blocks handle focus when content appears/disappears
- Check `<svelte:component>` dynamic components maintain accessibility
- Verify `use:action` directives for accessibility (e.g., `use:trapFocus`)
- Check transition directives (`in:`, `out:`, `transition:`) respect `prefers-reduced-motion`

### Vanilla HTML/CSS/JS

- Check for missing polyfills on `<dialog>` element
- Verify `<details>/<summary>` usage and browser support
- Check raw `addEventListener` has keyboard equivalents for click handlers
- Verify CSS-only interactive patterns have JS fallbacks for AT

### Tailwind CSS (applies to any framework using Tailwind)

- Check `sr-only` class usage for visually hidden text
- Verify `focus:` variants are present on all interactive elements
- Check `outline-none` is always paired with a visible `ring-*` alternative
- Look for `text-gray-*` on `bg-white` - common contrast failures
- Check `dark:` variants maintain contrast ratios
- Verify `motion-reduce:` variants exist for animated elements

Store the detected framework patterns and apply them during Phases 1-8. When reporting issues, include framework-specific code fixes using the correct syntax for the detected stack.
