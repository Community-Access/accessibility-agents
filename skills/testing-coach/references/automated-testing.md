# Testing Coach reference: Automated Testing

Part of the `testing-coach` skill. Read this only when the task reaches these sections.

## Automated Testing

### What Automation Catches (~30% of issues)

- Missing alt text
- Missing form labels
- Insufficient color contrast
- Missing document language
- Duplicate IDs
- Invalid ARIA attributes
- Missing landmark regions

### What Automation Cannot Catch (~70% of issues)

- Whether alt text is actually accurate
- Whether tab order makes logical sense
- Whether focus management works correctly
- Whether live regions announce at the right time
- Whether the user experience is confusing
- Whether custom widgets follow keyboard patterns
- Whether content makes sense when linearized

### axe-core (The Gold Standard)

**In Playwright:**

```javascript
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test('homepage has no accessibility violations', async ({ page }) => {
  await page.goto('/');
  
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();
  
  expect(results.violations).toEqual([]);
});

// Test specific components
test('login form is accessible', async ({ page }) => {
  await page.goto('/login');
  
  const results = await new AxeBuilder({ page })
    .include('#login-form')
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();
  
  expect(results.violations).toEqual([]);
});

// Test after interaction (modal open, dropdown expanded)
test('modal is accessible when open', async ({ page }) => {
  await page.goto('/');
  await page.click('#open-modal');
  await page.waitForSelector('[role="dialog"]');
  
  const results = await new AxeBuilder({ page })
    .include('[role="dialog"]')
    .analyze();
  
  expect(results.violations).toEqual([]);
});
```

**In Cypress:**

```javascript
import 'cypress-axe';

describe('Accessibility', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.injectAxe();
  });

  it('has no violations on load', () => {
    cy.checkA11y(null, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag22aa']
      }
    });
  });

  it('has no violations after opening modal', () => {
    cy.get('#open-modal').click();
    cy.get('[role="dialog"]').should('be.visible');
    cy.checkA11y('[role="dialog"]');
  });
});
```

**In Jest (using jest-axe for React components):**

```javascript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('LoginForm has no accessibility violations', async () => {
  const { container } = render(<LoginForm />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

**In Storybook:**

```javascript
// .storybook/main.js
module.exports = {
  addons: ['@storybook/addon-a11y'],
};

// The a11y addon runs axe-core against every story automatically
// Check the "Accessibility" panel in the Storybook UI
```

### Pa11y (CLI and CI)

```bash
# Single page
npx pa11y https://example.com

# With WCAG 2.2 AA standard
npx pa11y --standard WCAG2AA https://example.com

# Multiple pages
npx pa11y-ci --config .pa11yci.json
```

`.pa11yci.json`:

```json
{
  "defaults": {
    "standard": "WCAG2AA",
    "timeout": 10000,
    "wait": 1000
  },
  "urls": [
    "http://localhost:3000/",
    "http://localhost:3000/login",
    "http://localhost:3000/dashboard",
    {
      "url": "http://localhost:3000/modal-page",
      "actions": [
        "click element #open-modal",
        "wait for element [role='dialog'] to be visible"
      ]
    }
  ]
}
```

### Lighthouse (Chrome DevTools)

Built into Chrome, not as thorough as axe but easy to access:

1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Check "Accessibility" category
4. Click "Analyze page load"
5. Review the accessibility score and specific findings

Note: Lighthouse accessibility tests are a subset of axe-core. A 100 score does NOT mean the page is accessible - it means it passed the automated checks.

### CI/CD Pipeline

```yaml
# GitHub Actions example
name: Accessibility
on: [pull_request]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      
      # Start the server
      - run: npm start &
      - run: npx wait-on http://localhost:3000
      
      # Run axe-core via Playwright
      - run: npx playwright test --project=a11y
      
      # Or run Pa11y
      - run: npx pa11y-ci
```

---

## Browser DevTools Accessibility Features

### Chrome

1. **Accessibility Tree:** Elements panel > Accessibility tab - shows what the browser exposes to assistive technology
2. **Contrast Checker:** Elements panel > Styles > hover over a color - shows contrast ratio and AA/AAA pass/fail
3. **CSS Overview:** More tools > CSS Overview > Capture overview - shows all low-contrast text on the page
4. **Rendering:** More tools > Rendering > Emulate vision deficiencies - simulate color blindness, blurred vision
5. **Forced element state:** Elements panel > right-click element > Force state > :focus - check focus styles without tabbing

### Firefox

1. **Accessibility Inspector:** DevTools > Accessibility tab - the best built-in accessibility tool in any browser
2. **Check for issues:** Accessibility tab > dropdown > "All Issues" - runs automated checks
3. **Simulate:** Accessibility tab > Simulate > various vision deficiencies
4. **Tab order overlay:** Accessibility tab > "Show Tabbing Order" - shows numbered tab order on the page

### Edge

Same as Chrome (Chromium-based), plus:

1. **Accessibility tree in Elements panel**
2. **ARIA validation warnings** in Issues panel

### VS Code Integrated Browser (VS Code 1.113+)

VS Code 1.113 builds on the integrated browser introduced in 1.112. It remains excellent for accessibility testing because you never leave VS Code, and it now handles local HTTPS with self-signed certificates more smoothly.

**Setup:**

1. Create or modify `launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "editor-browser",
      "request": "launch",
      "name": "A11y Test: Integrated Browser",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```

2. Start your dev server (`npm run dev` or equivalent)
3. Press F5 to launch the integrated browser

**Accessibility Testing Features:**

- **Independent zoom:** The integrated browser has its own zoom level (separate from VS Code's). Use Ctrl+= / Ctrl+- to test WCAG 1.4.4 (Resize Text) and 1.4.10 (Reflow) directly.
- **DevTools access:** Right-click > Inspect to open DevTools inside VS Code with the Accessibility Tree, contrast checker, and CSS Overview.
- **Screenshot capture:** Agents can capture screenshots of the integrated browser, enabling visual accessibility analysis with image-capable models.
- **Breakpoint debugging:** Set breakpoints on focus handlers, keyboard event listeners, and ARIA updates to debug accessibility issues in real-time.

**Testing Workflow:**

1. Launch the integrated browser with your app
2. Open DevTools > Accessibility tab
3. Use "Show Tabbing Order" to visualize tab sequence
4. Test keyboard navigation without switching windows
5. Run axe-core via Playwright tests or the browser console
6. Debug any focus management issues with breakpoints

**Zoom Testing (WCAG 1.4.4 / 1.4.10):**

The `workbench.browser.pageZoom` setting controls the default zoom level. To test reflow:

1. Set browser zoom to 400% (or use Ctrl+= repeatedly)
2. Verify content reflows to single column
3. No horizontal scrolling required
4. No content or functionality lost

**Limitations:**

- DevTools accessibility features depend on Chromium - same as Chrome/Edge
- Not a replacement for real screen reader testing
- Cannot emulate mobile screen readers (TalkBack/VoiceOver iOS)

---

## Writing Accessibility Test Plans

### Template for a Feature

```markdown
## Accessibility Test Plan: [Feature Name]

### Prerequisites
- Screen reader: NVDA (latest) on Windows, VoiceOver on macOS
- Browsers: Chrome, Firefox, Safari
- Keyboard only (no mouse)

### Automated Checks
- [ ] axe-core reports zero violations
- [ ] Lighthouse accessibility score 100
- [ ] Pa11y CI passes

### Keyboard Testing
- [ ] All interactive elements reachable via Tab
- [ ] Tab order follows visual layout
- [ ] Enter/Space activates all buttons
- [ ] Escape closes all overlays
- [ ] Focus returns to trigger after overlay closes
- [ ] No keyboard traps
- [ ] Focus visible on all interactive elements

### Screen Reader Testing (NVDA)
- [ ] Page title announced on load
- [ ] Headings list (NVDA+F7) shows logical hierarchy
- [ ] All form fields announce their labels
- [ ] All buttons announce their purpose
- [ ] All links announce their destination
- [ ] Error messages announce when they appear
- [ ] Dynamic content changes are announced
- [ ] Images announce meaningful alt text (or are hidden if decorative)

### Screen Reader Testing (VoiceOver)
- [ ] Rotor shows headings, landmarks, form controls, links
- [ ] All interactions work with VO+Space
- [ ] Tables navigable with VO+Arrow keys
- [ ] Same checks as NVDA above

### Visual Testing
- [ ] All text meets 4.5:1 contrast ratio (3:1 for large text)
- [ ] Focus indicators meet 3:1 contrast
- [ ] No information conveyed by color alone
- [ ] Works at 200% zoom
- [ ] Works at 320px viewport width (reflow)
- [ ] prefers-reduced-motion respected (if animations present)

### User Journey
- [ ] Complete the task using only keyboard
- [ ] Complete the task using only NVDA
- [ ] Complete the task using only VoiceOver
- [ ] Note any confusion, delays, or extra steps required
```

### Common Testing Mistakes

1. **Only testing with automation** - catches ~30% of issues. You must manually test.
2. **Testing in only one browser** - screen reader + browser combinations behave differently
3. **Testing only the happy path** - test error states, empty states, loading states
4. **Not testing after interaction** - modals, AJAX loads, client-side routing change the DOM
5. **Assuming "it works in Chrome" means it works** - test Firefox + NVDA and Safari + VoiceOver at minimum
6. **Not testing zoom** - content at 200% zoom must remain usable
7. **Not testing with real content** - placeholder text of equal length behaves differently than real, variable-length content
8. **Running axe once and declaring victory** - axe should run in CI on every PR

---
