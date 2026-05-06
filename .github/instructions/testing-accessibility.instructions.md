---
applyTo: "**/*.{test,spec}.{js,ts,jsx,tsx}"
---

## Dependencies

- `web-accessibility-baseline.instructions.md` — the WCAG rules these tests verify
- `aria-patterns.instructions.md` — the keyboard interaction patterns to test for composite widgets

# Accessibility Testing Enforcement

These rules apply automatically to test and spec files for UI components. They encourage accessibility assertions alongside functional tests.

---

> **Impact:** Test suites without accessibility assertions silently allow regressions. Role-based queries (`getByRole`) fail the test when ARIA semantics break — `getByTestId` would pass the same test even after the element becomes inaccessible.

## Query Priority

- Prefer `getByRole` for finding elements — role-based queries assert that correct ARIA semantics are present, validating accessibility at the query level.
- Reserve `getByTestId` for elements with no semantic role (layout wrappers, purely visual containers). Creating test IDs specifically to avoid accessible queries is an anti-pattern — fix the accessibility instead.
- Use `getByLabelText` for form inputs — this verifies the label-input association works.
- Use `getByText` for visible content — this confirms the text is exposed to all users.

## Keyboard Interaction Tests

- When testing interactive components (buttons, menus, dialogs, tabs), include keyboard interaction tests. If the component does not yet support keyboard interaction, add a failing test as a regression guard — this documents the gap and prevents the issue from being silently merged:
  - Tab key moves focus to and between interactive elements.
  - Enter/Space activates buttons and links.
  - Escape closes dialogs and popovers.
  - Arrow keys navigate within composite widgets (tabs, menus, listboxes).

## Accessibility Assertions

- Use `toHaveAccessibleName()` / `toHaveAccessibleDescription()` from `@testing-library/jest-dom` to verify ARIA labeling.
  - `toHaveAccessibleName()` — checks the computed accessible name (from label, aria-label, aria-labelledby, or content)
  - `toHaveAccessibleDescription()` — checks the computed description (from aria-describedby or title)
  - Both work with Vitest when configured with `@testing-library/jest-dom/vitest`.
- Use `toBeVisible()` instead of checking CSS classes — it confirms the element is perceivable.
- Use `toHaveFocus()` to verify focus management after user interactions (dialog open, delete action, route change).

## Component Test Checklist

When testing a UI component, consider adding:

- Role verification: does the element expose the correct role?
- Name verification: does it have an accessible name?
- State verification: are `aria-expanded`, `aria-checked`, `aria-selected` toggled correctly?
- Focus management: does focus move to the expected element after state changes?

---

> **Impact:** Manual role/name/state assertions catch one issue at a time. axe-core integration tests catch whole classes of violations (missing labels, contrast failures, redundant ARIA) in a single assertion.

## Automated axe-core Integration

Add axe-core assertions for full component audits:

```typescript
// @testing-library/react + jest-axe
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

it('has no axe violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

For Vitest projects, use `vitest-axe` (same API, Vitest-compatible):

```typescript
import { axe, toHaveNoViolations } from 'vitest-axe';
expect.extend(toHaveNoViolations);
```

**When to add axe tests:**

- New components before merging
- After any ARIA attribute changes
- After structural (HTML/JSX) refactors

**Scoping axe to a sub-tree:** Pass a specific element to avoid false positives from incomplete test page structure:

```typescript
const results = await axe(screen.getByRole('dialog'));
```

---

> **Impact:** Focus management tests are the only automated mechanism to catch regressions where dialogs, toasts, or route changes fail to move focus — invisible to unit tests that don't simulate user navigation flow.

## Focus Management Tests

```typescript
// Dialog focus trap
it('traps focus inside the dialog', async () => {
  render(<ConfirmDialog open />);
  const dialog = screen.getByRole('dialog');
  // First Tab press should stay inside dialog
  await userEvent.tab();
  expect(dialog).toContainElement(document.activeElement);
});

// Focus return after close
it('returns focus to trigger after dialog closes', async () => {
  render(<App />);
  const trigger = screen.getByRole('button', { name: 'Open dialog' });
  await userEvent.click(trigger);
  await userEvent.keyboard('{Escape}');
  expect(trigger).toHaveFocus();
});
```
