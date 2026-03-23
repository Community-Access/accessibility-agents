---
applyTo: "**/*.{test,spec}.{js,ts,jsx,tsx}"
---

# Accessibility Testing Enforcement

These rules apply automatically to test and spec files for UI components. They encourage accessibility assertions alongside functional tests.

---

## Query Priority

- Prefer `getByRole` over `getByTestId` for finding elements — role-based queries assert that correct ARIA semantics are present.
- Use `getByLabelText` for form inputs — this verifies the label-input association works.
- Use `getByText` for visible content — this confirms the text is exposed to all users.
- Reserve `getByTestId` for cases where no accessible query is possible (e.g., layout containers with no semantic role).

## Keyboard Interaction Tests

- When testing interactive components (buttons, menus, dialogs, tabs), include keyboard interaction tests:
  - Tab key moves focus to and between interactive elements.
  - Enter/Space activates buttons and links.
  - Escape closes dialogs and popovers.
  - Arrow keys navigate within composite widgets (tabs, menus, listboxes).

## Accessibility Assertions

- Use `toHaveAccessibleName()` / `toHaveAccessibleDescription()` from `jest-dom` to verify ARIA labeling.
- Use `toBeVisible()` instead of checking CSS classes — it confirms the element is perceivable.
- Use `toHaveFocus()` to verify focus management after user interactions (dialog open, delete action, route change).

## Component Test Checklist

When testing a UI component, consider adding:
- Role verification: does the element expose the correct role?
- Name verification: does it have an accessible name?
- State verification: are `aria-expanded`, `aria-checked`, `aria-selected` toggled correctly?
- Focus management: does focus move to the expected element after state changes?
