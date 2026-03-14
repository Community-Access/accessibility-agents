---
description: Generate a Playwright accessibility test suite from an existing audit report. Creates regression tests for every finding so fixes stay fixed.
mode: agent
tools:
  - askQuestions
  - readFile
  - createFile
  - editFiles
---

# Generate Accessibility Tests

Read an existing accessibility audit report and generate a Playwright + @axe-core/playwright test suite that covers each finding. Tests can run in CI to prevent accessibility regressions.

## Instructions

1. Use askQuestions to ask the user:
   - "Where is your audit report?" — Options: WEB-ACCESSIBILITY-AUDIT.md (default), custom path
   - "What is the base URL for tests?" — e.g., <http://localhost:3000>
   - "Where should test files be saved?" — Options: tests/a11y/ (default), custom path
   - "Which test runner?" — Options: Playwright Test (default), Vitest + Playwright

2. Read the audit report to extract all findings. For each finding, collect:
   - axe-core rule ID (e.g., `image-alt`, `color-contrast`, `button-name`)
   - CSS selector of the affected element
   - WCAG criterion
   - Severity
   - Fix type (contrast, keyboard, aria, structure, state, viewport)

3. Generate test files organized by category:

   **axe-rule-tests.spec.ts** — One test per axe-core rule violation:

   ```typescript
   import { test, expect } from '@playwright/test';
   import AxeBuilder from '@axe-core/playwright';

   test('image-alt: .hero-image should have alt text', async ({ page }) => {
     await page.goto('/');
     const results = await new AxeBuilder({ page })
       .include('.hero-image')
       .withRules(['image-alt'])
       .analyze();
     expect(results.violations).toEqual([]);
   });
   ```

   **keyboard-tests.spec.ts** — Keyboard reachability for interactive elements:

   ```typescript
   test('keyboard: #main-nav is reachable via Tab', async ({ page }) => {
     await page.goto('/');
     let found = false;
     for (let i = 0; i < 100; i++) {
       await page.keyboard.press('Tab');
       const focused = await page.evaluate(() =>
         document.activeElement?.matches('#main-nav') ?? false
       );
       if (focused) { found = true; break; }
     }
     expect(found).toBe(true);
   });
   ```

   **contrast-tests.spec.ts** — Computed contrast for flagged elements:

   ```typescript
   test('contrast: .muted-text meets 4.5:1', async ({ page }) => {
     await page.goto('/');
     const result = await page.evaluate(() => {
       const el = document.querySelector('.muted-text');
       if (!el) return null;
       const s = window.getComputedStyle(el);
       return { fg: s.color, bg: s.backgroundColor };
     });
     expect(result).not.toBeNull();
   });
   ```

   **full-page-scan.spec.ts** — Whole-page axe-core sweep per audited URL:

   ```typescript
   test('full page: / has no WCAG AA violations', async ({ page }) => {
     await page.goto('/');
     const results = await new AxeBuilder({ page })
       .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
       .analyze();
     expect(results.violations).toEqual([]);
   });
   ```

4. Generate a `playwright.config.ts` if one does not already exist:

   ```typescript
   import { defineConfig } from '@playwright/test';
   export default defineConfig({
     testDir: './tests/a11y',
     use: { baseURL: 'http://localhost:3000' },
   });
   ```

5. Generate a CI workflow template at `docs/templates/a11y-tests-ci.yml`.

6. Summarize what was generated:
   - Number of test files and total test count
   - How to install dependencies: `npm install -D playwright @axe-core/playwright && npx playwright install chromium`
   - How to run: `npx playwright test tests/a11y/`

## Handoff Transparency

Announce progress as you generate:

- "Reading audit report... found {N} findings across {M} pages."
- "Generating {filename}... {N} tests for {category}."
- "All test files written. Run `npx playwright test tests/a11y/` to execute."
