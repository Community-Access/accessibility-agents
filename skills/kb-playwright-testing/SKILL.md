---

name: kb-playwright-testing
description: "Reference data, not a reviewer. Browser accessibility testing using Playwright and @axe-core/playwright. Keyboard scans, contrast verification, and accessibility tree snapshots."
license: MIT
disable-model-invocation: true
user-invocable: false
metadata:
  tier: reference
  domain: cross-cutting
  output: none
  effort: low
  title: Playwright Testing
---

## Playwright Accessibility Testing

Reusable knowledge module for browser-based accessibility testing using Playwright and @axe-core/playwright.

## MCP Tools Available

Each tool the MCP server registers (`mcp-server/tools/playwright-tools.js`), with its purpose and whether it needs @axe-core/playwright. All of them need Playwright with Chromium. There is no state-scan tool: to scan content revealed by an interaction, script the interaction and run `AxeBuilder` yourself (see Scan After Interaction).

| Tool | Purpose | Requires @axe-core/playwright |
|------|---------|------------------------------|
| `run_axe_scan` | axe-core scan of a URL; default tags `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa` | Yes |
| `run_playwright_keyboard_scan` | Tab-order traversal, focus visibility, keyboard trap detection | No |
| `run_playwright_viewport_scan` | Horizontal scrolling at 320, 768, 1024 and 1280 CSS px (1.4.10 Reflow only; no zoom, text resize or target-size check) | No |
| `run_playwright_contrast_scan` | Computed-style text contrast against the AA thresholds (4.5:1, or 3:1 for large text) | No |
| `run_playwright_a11y_tree` | Browser accessibility tree snapshot (`ariaSnapshot`) | No |

## @axe-core/playwright Patterns

### Full Page Scan

```javascript
import AxeBuilder from '@axe-core/playwright';

const results = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
  .analyze();
```

In axe-core 4.14 the only `wcag22aa` rule is `target-size`, which runs only when that tag is listed. Most WCAG 2.2 criteria (2.4.11, 2.5.7, 3.2.6, 3.3.7, 3.3.8) have no axe rule and need manual or scripted checks. `AxeBuilder` needs a page opened from a browser context; the Playwright Test `page` fixture is one, `browser.newPage()` is not.

### Scoped Element Scan

```javascript
const results = await new AxeBuilder({ page })
  .include('.modal-content')
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
  .analyze();
```

### Single Rule Verification

```javascript
const results = await new AxeBuilder({ page })
  .include('#hero-image')
  .withRules(['image-alt'])
  .analyze();
expect(results.violations).toEqual([]);
```

### Scan After Interaction

```javascript
await page.locator('[aria-expanded="false"]').first().click();
await page.locator('.accordion-content').first().waitFor({ state: 'visible' });
const results = await new AxeBuilder({ page })
  .include('.accordion-content')
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
  .analyze();
```

## Keyboard Traversal Patterns

### Record Tab Sequence

```javascript
const tabStops = [];
for (let i = 0; i < maxTabs; i++) {
  await page.keyboard.press('Tab');
  const info = await page.evaluate(() => {
    const el = document.activeElement;
    return {
      tagName: el?.tagName,
      role: el?.getAttribute('role'),
      name: el?.getAttribute('aria-label') || el?.textContent?.trim().slice(0, 50),
      id: el?.id,
      tabIndex: el?.tabIndex
    };
  });
  tabStops.push(info);
}
```

### Detect Keyboard Traps

A keyboard trap is detected when the same element receives focus after consecutive Tab presses:

```javascript
let trapCount = 0;
let lastSelector = '';
for (const stop of tabStops) {
  const currentSelector = `${stop.tagName}#${stop.id}`;
  if (currentSelector === lastSelector) {
    trapCount++;
    if (trapCount >= 3) { /* TRAP DETECTED */ }
  } else {
    trapCount = 0;
  }
  lastSelector = currentSelector;
}
```

### Focus Management After Modal Open

```javascript
await page.locator('[data-modal-trigger]').click();
await page.getByRole('dialog').waitFor({ state: 'visible' });
const focusedRole = await page.evaluate(() =>
  document.activeElement?.closest('[role="dialog"]') ? 'inside-dialog' : 'outside-dialog'
);
// focusedRole should be 'inside-dialog'
```

## Focus Management Test Templates

### Modal Focus Trap Test

```javascript
test('modal traps focus correctly', async ({ page }) => {
  await page.goto(url);
  await page.locator('[data-open-modal]').click();
  await expect(page.getByRole('dialog')).toBeVisible();

  // Focus should be inside the dialog
  const inDialog = await page.evaluate(() =>
    document.activeElement?.closest('[role="dialog"]') !== null
  );
  expect(inDialog).toBe(true);

  // Tab through dialog - should not escape
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('Tab');
    const stillInDialog = await page.evaluate(() =>
      document.activeElement?.closest('[role="dialog"]') !== null
    );
    expect(stillInDialog).toBe(true);
  }

  // Escape should close and return focus to trigger
  await page.keyboard.press('Escape');
  const focusedId = await page.evaluate(() => document.activeElement?.id);
  expect(focusedId).toBe('modal-trigger-id');
});
```

### Skip Link Test

```javascript
test('skip link moves focus to main content', async ({ page }) => {
  await page.goto(url);
  await page.keyboard.press('Tab'); // Focus skip link
  await page.keyboard.press('Enter'); // Activate it
  const focusedId = await page.evaluate(() => document.activeElement?.id);
  expect(focusedId).toBe('main-content');
});
```

## CI Integration

### GitHub Actions with Playwright

```yaml
name: Accessibility Tests
on: [push, pull_request]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 24
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - name: Start dev server
        run: npm run dev &
        env:
          CI: true
      - name: Wait for server
        run: npx wait-on http://localhost:3000 --timeout 30000
      - name: Run accessibility tests
        run: npx playwright test tests/a11y/
      - uses: actions/upload-artifact@v7
        if: failure()
        with:
          name: a11y-test-results
          path: test-results/
```

### Playwright Config for Accessibility Tests

```javascript
// playwright.config.js (a11y section)
export default {
  testDir: './tests/a11y',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    // Chromium matches the browser the MCP tools use, so results are comparable
    browserName: 'chromium',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
};
```

## Graceful Degradation

### Detection Pattern

```javascript
let _playwrightAvailable = null;
async function isPlaywrightAvailable() {
  if (_playwrightAvailable !== null) return _playwrightAvailable;
  try {
    await import('playwright');
    _playwrightAvailable = true;
  } catch {
    _playwrightAvailable = false;
  }
  return _playwrightAvailable;
}
```

### Degradation Matrix

Each playwright, with its @axe-core or playwright and available scans.

| Playwright | @axe-core/playwright | Available Scans |
|------------|---------------------|-----------------|
| Yes | Yes | All 5 tools (axe, keyboard, viewport, contrast, tree) |
| Yes | No | 4 tools (keyboard, viewport, contrast, tree); no `run_axe_scan` |
| No | n/a | None - fall back to code review + axe-core CLI |

### User-Facing Messages

When unavailable:

```yaml
Playwright not installed. Behavioral testing (keyboard traversal, dynamic states,
responsive viewport, rendered contrast) is unavailable.

Install: npm install -D playwright @axe-core/playwright && npx playwright install chromium
```

When partially available:

```yaml
@axe-core/playwright not installed. The axe-core scan is unavailable.
Keyboard, viewport, contrast, and accessibility tree scans will proceed.

Install: npm install -D @axe-core/playwright
```

## WCAG Coverage Map

Each WCAG SC, with its description and playwright tool.

| WCAG SC | Description | Playwright Tool |
|---------|-------------|-----------------|
| 1.3.1 | Info and Relationships | a11y tree, axe scan |
| 1.4.3 | Contrast (Minimum) | contrast scan, axe scan |
| 1.4.10 | Reflow | viewport scan (horizontal scroll only) |
| 2.1.1 | Keyboard | keyboard scan |
| 2.1.2 | No Keyboard Trap | keyboard scan |
| 2.4.3 | Focus Order | keyboard scan |
| 2.4.7 | Focus Visible | keyboard scan |
| 2.5.8 | Target Size (Minimum) | axe scan (`target-size`, needs the `wcag22aa` tag) |
| 4.1.2 | Name, Role, Value | a11y tree, axe scan |

Not covered by any tool: 1.4.6 Contrast (Enhanced), 2.5.5 Target Size (Enhanced), 1.4.4 Resize Text, and most WCAG 2.2 additions (2.4.11, 2.5.7, 3.2.6, 3.3.7, 3.3.8).
