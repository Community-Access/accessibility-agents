---
name: playwright-testing
description: Browser accessibility testing using Playwright and @axe-core/playwright. Keyboard scans, contrast verification, and accessibility tree snapshots.
---

# Playwright Accessibility Testing

Reusable knowledge module for browser-based accessibility testing using Playwright and @axe-core/playwright.

## MCP Tools Available

| Tool | Purpose | Requires @axe-core/playwright |
|------|---------|------------------------------|
| `run_playwright_keyboard_scan` | Tab-order traversal, keyboard trap detection | No |
| `run_playwright_state_scan` | Click triggers, scan revealed content with axe-core | Yes |
| `run_playwright_viewport_scan` | Multi-viewport axe-core + touch target measurement | Yes |
| `run_playwright_contrast_scan` | Computed-style contrast ratio after CSS cascade | No |
| `run_playwright_a11y_tree` | Browser accessibility tree snapshot | No |

## @axe-core/playwright Patterns

### Full Page Scan

```javascript
import AxeBuilder from '@axe-core/playwright';

const results = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
  .analyze();
```

### Scoped Element Scan

```javascript
const results = await new AxeBuilder({ page })
  .include('.modal-content')
  .withTags(['wcag2a', 'wcag2aa'])
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
await page.click('[aria-expanded="false"]');
await page.waitForSelector('.accordion-content', { state: 'visible' });
const results = await new AxeBuilder({ page })
  .include('.accordion-content')
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
await page.click('[data-modal-trigger]');
await page.waitForSelector('[role="dialog"]', { state: 'visible' });
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
  await page.click('[data-open-modal]');
  await page.waitForSelector('[role="dialog"]', { state: 'visible' });

  // Focus should be inside the dialog
  const inDialog = await page.evaluate(() =>
    document.activeElement?.closest('[role="dialog"]') !== null
  );
  expect(inDialog).toBe(true);

  // Tab through dialog — should not escape
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
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
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
      - uses: actions/upload-artifact@v4
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
    // Use Chromium only — @axe-core/playwright is Chromium-validated
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

| Playwright | @axe-core/playwright | Available Scans |
|------------|---------------------|-----------------|
| Yes | Yes | All 5 tools (keyboard, state, viewport, contrast, tree) |
| Yes | No | 3 tools (keyboard, contrast, tree) |
| No | — | None — fall back to code review + axe-core CLI |

### User-Facing Messages

When unavailable:

```yaml
Playwright not installed. Behavioral testing (keyboard traversal, dynamic states,
responsive viewport, rendered contrast) is unavailable.

Install: npm install -D playwright @axe-core/playwright && npx playwright install chromium
```

When partially available:

```yaml
@axe-core/playwright not installed. State scanning and viewport scanning are
unavailable. Keyboard, contrast, and accessibility tree scans will proceed.

Install: npm install -D @axe-core/playwright
```

## WCAG Coverage Map

| WCAG SC | Description | Playwright Tool |
|---------|-------------|-----------------|
| 1.3.1 | Info and Relationships | a11y tree, state scan |
| 1.4.3 | Contrast (Minimum) | contrast scan |
| 1.4.6 | Contrast (Enhanced) | contrast scan |
| 1.4.10 | Reflow | viewport scan |
| 2.1.1 | Keyboard | keyboard scan |
| 2.1.2 | No Keyboard Trap | keyboard scan |
| 2.4.3 | Focus Order | keyboard scan |
| 2.4.7 | Focus Visible | keyboard scan |
| 2.5.5 | Target Size (Enhanced) | viewport scan |
| 2.5.8 | Target Size (Minimum) | viewport scan |
| 4.1.2 | Name, Role, Value | a11y tree, state scan |
