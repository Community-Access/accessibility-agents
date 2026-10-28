---

name: kb-testing-strategy
description: Reference data, not a reviewer. Accessibility testing decision trees, browser/AT compatibility matrices, manual vs. automated test coverage, regression testing patterns, and acceptance criteria templates for user stories.
license: MIT
disable-model-invocation: true
user-invocable: false
metadata:
  tier: reference
  domain: cross-cutting
  output: none
  effort: low
  title: Testing Strategy
---

## Testing Strategy Skill

Decision frameworks for accessibility testing - when to use automated tools vs. manual testing, which screen reader + browser combinations to test, and how to write accessibility acceptance criteria.

---

## Automated vs. Manual Testing Coverage

Each row, with what automated tools catch and what requires manual testing. Published coverage estimates vary with the study and with whether issues or success criteria are counted, so treat a clean automated scan as a floor, not a pass. Most WCAG 2.2 additions (2.4.11, 2.5.7, 3.2.6, 3.3.7, 3.3.8) have no axe rule.

| What Automated Tools Catch | What Requires Manual Testing |
|--------------------------------------|---------------------------------------|
| Missing alt text on images | Alt text quality and accuracy |
| Missing form labels | Label clarity and helpfulness |
| Color contrast ratios (computed) | Color contrast in context (gradients, images) |
| Missing lang attribute | Correct language identification |
| Duplicate IDs referenced by ARIA or labels (`duplicate-id-aria`) | Logical reading order |
| Missing ARIA roles on custom widgets | Correct ARIA role for the interaction pattern |
| Heading hierarchy violations | Heading text meaningfulness |
| Empty links and buttons | Link/button text descriptiveness |
| Missing table headers | Table caption and header association quality |
| Syntax errors in ARIA | Screen reader announcement correctness |

## Browser + Screen Reader Compatibility Matrix

### Primary Test Combinations (Required)

Each screen reader, with its browser, OS and priority.

| Screen Reader | Browser | OS | Priority |
|--------------|---------|-----|----------|
| NVDA | Firefox | Windows | Must test |
| NVDA | Chrome | Windows | Must test |
| JAWS | Chrome | Windows | Must test |
| VoiceOver | Safari | macOS | Must test |
| VoiceOver | Safari | iOS | Must test |
| TalkBack | Chrome | Android | Should test |

### Secondary (Nice to Have)

Each screen reader, with its browser and OS.

| Screen Reader | Browser | OS |
|--------------|---------|-----|
| Narrator | Edge | Windows |
| JAWS | Edge | Windows |

## Testing Decision Tree

```text
Is it a new component or page?
- Yes: full test coverage (automated + manual)
  - Run axe-core / Lighthouse scan
  - Keyboard-only navigation test
  - Screen reader announcement test (NVDA + VoiceOver minimum)
  - Visual check at 200% zoom
- No: what changed?
  - Colors/styling: contrast check + visual review
  - Interactive behavior: keyboard + screen reader test
  - Content/text: screen reader announcement check
  - Layout/order: reading order + focus order test
  - Dependencies updated: regression scan (axe-core)
```

## Regression Testing Patterns

### CI Pipeline Accessibility Gates

1. **axe-core scan**: Run on every PR. Fail on new critical/serious violations.
2. **Baseline management**: Store known issues in `.a11y-baseline.json`. Only fail on **new** issues.
3. **Lighthouse score threshold**: Set minimum accessibility score (e.g., 90). Fail on regression.
4. **Visual regression**: Capture screenshots at 200% zoom. Compare for focus indicator and layout changes.

### Preventing Regressions

- Add accessibility assertions to existing component tests (see `skills/kb-path-instructions/references/testing-accessibility.md`)
- Include keyboard navigation in E2E test suites
- Track accessibility score trends over time (not just pass/fail)

## Acceptance Criteria Template

### For User Stories

```text
Given [context],
When [action by keyboard/mouse/screen reader],
Then [accessible outcome]:

- [ ] Component has an accessible name (via label, aria-label, or aria-labelledby)
- [ ] Component has the correct ARIA role
- [ ] Component is reachable and operable by keyboard (Tab, Enter, Space, Escape, Arrows as appropriate)
- [ ] Focus is visible when the component receives focus
- [ ] State changes are announced to screen readers (aria-expanded, aria-selected, aria-checked, etc.)
- [ ] Error messages are associated with their inputs (aria-describedby or aria-errormessage)
- [ ] Text resizes to 200% without loss of content (1.4.4), and content reflows without horizontal scrolling at 320 CSS px wide, about 400% zoom (1.4.10)
- [ ] Color is not the only means of conveying information
```

## Common Testing Tools

Each tool, with type and best for.

| Tool | Type | Best For |
|------|------|----------|
| axe-core / @axe-core/cli | Automated | CI/CD integration, broad violation scan |
| Lighthouse | Automated | Performance + accessibility combined score |
| WAVE | Semi-automated | Visual overlay of accessibility features/issues |
| Accessibility Insights | Semi-automated | FastPass (automated) + Assessment (guided manual) |
| pa11y | Automated | CI/CD, HTML CodeSniffer rules |
| jest-axe | Unit test | Component-level axe scans in jest |
| cypress-axe | E2E test | Page-level axe scans in Cypress |
| playwright + @axe-core/playwright | E2E test | Page-level axe scans in Playwright |

## Screen Reader Testing Quick Reference

### NVDA (Windows)

Each key, with its action.

| Key | Action |
|-----|--------|
| Insert + Space | Toggle focus/browse mode |
| Tab | Move to next focusable element |
| H | Next heading |
| D | Next landmark |
| F | Next form field |
| T | Next table |
| Insert + F7 | Elements list (links, headings, landmarks) |

### VoiceOver (macOS)

Each key, with its action.

| Key | Action |
|-----|--------|
| VO (Ctrl+Option) + Right | Move to next element |
| VO + Space | Activate current element |
| VO + U | Open rotor (navigate by type) |
| VO + Cmd + H | Next heading |
