---
name: test-a11y
description: Accessibility testing coach. Teaches screen reader testing (NVDA/VoiceOver/JAWS), keyboard testing workflows, automated testing setup (axe-core, Playwright, Pa11y), and test plan creation.
mode: agent
agent: testing-coach
tools:
  - askQuestions
---

# Accessibility Testing Guidance

Learn how to test accessibility using screen readers, keyboard-only navigation, automated tools, and browser DevTools.

## Testing Goal

**What do you want to test?** `${input:testGoal}`

Examples:
- "Test this modal with NVDA"
- "Set up axe-core automated testing"
- "Create a keyboard testing checklist"
- "Test forms with VoiceOver"

## Instructions

### Step 1: Identify Testing Scope

Ask the user:

1. **Testing method** -- Manual (screen reader/keyboard) or automated (axe-core)?
2. **Component** -- Specific component or full page?
3. **Screen reader** -- NVDA (Windows), JAWS (Windows), VoiceOver (Mac), Narrator (Windows)?
4. **Browser** -- Chrome, Firefox, Safari, Edge?

### Step 2: Provide Testing Guidance

### For Screen Reader Testing:

**NVDA (Windows) basics:**
- Start: Insert
- Stop: Insert+Q
- Read next: Down Arrow
- Read previous: Up Arrow
- Tab to next interactive: Tab
- Click: Enter or Space
- Forms mode: Auto-enters when focus lands on input
- Element list: Insert+F7

**VoiceOver (Mac) basics:**
- Start: Cmd+F5
- VO key: Control+Option
- Read next: VO+Right Arrow
- Read previous: VO+Left Arrow
- Rotor: VO+U (navigate by headings, links, form controls)
- Click: VO+Space

**JAWS (Windows) basics:**
- Forms mode: Auto-enters on input, or press Enter
- Virtual cursor: Arrow keys
- Tab to interactive: Tab
- Say all: Insert+Down Arrow
- Element list: Insert+F3

### For Keyboard Testing:

**Checklist:**
1. Can you reach all interactive elements with Tab?
2. Is tab order logical (matches visual order)?
3. Are focus indicators visible?
4. Can you activate buttons/links with Enter or Space?
5. Can you close modals with Escape?
6. Do custom widgets support arrow keys/Home/End?
7. Are there any keyboard traps?

### For Automated Testing:

**axe-core setup:**
```bash
npm install --save-dev @axe-core/cli
npx @axe-core/cli https://example.com --tags wcag2a,wcag2aa
```

**Playwright + axe:**
```javascript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('page should have no a11y violations', async ({ page }) => {
  await page.goto('https://example.com');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

**Pa11y:**
```bash
npm install --save-dev pa11y
pa11y https://example.com --standard WCAG2AA
```

### Step 3: Provide Test Plan Template

For complex components:

**Test Plan Structure:**
1. **Component description**
2. **Scope** -- What's being tested
3. **Manual tests** -- Screen reader, keyboard
4. **Automated tests** -- axe-core rules to run
5. **Expected behavior** -- Pass criteria
6. **Known issues** -- Documented bugs

## Expected Output

- Screen reader testing instructions
- Keyboard testing checklist
- Automated testing setup guidance
- Test plan template
- NO code review or fixes (refer to specialist agents for that)
