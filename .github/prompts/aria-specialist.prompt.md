---
name: review-aria
description: ARIA implementation specialist for interactive web components. Reviews modals, tabs, accordions, comboboxes, live regions, carousels, custom widgets, and ARIA usage correctness.
mode: agent
agent: aria-specialist
tools:
  - askQuestions
  - readFile
  - editFiles
---

# ARIA Implementation Review

Review ARIA (Accessible Rich Internet Applications) usage in interactive components for correct implementation and screen reader compatibility.

## Component to Review

**Files:** `${input:files}`

## Instructions

### Step 1: Identify Component Pattern

Ask the user:

1. **Widget type** -- Modal, tabs, accordion, combobox, carousel, menu, tooltip, other?
2. **Framework** -- React, Vue, Angular, Svelte, vanilla JS?
3. **Library** -- Using Radix, Headless UI, MUI, custom implementation?
4. **Known issues** -- Screen reader problems, focus issues?

### Step 2: Check ARIA Pattern Compliance

Reference ARIA APG (Authoring Practices Guide) patterns:

**For modals/dialogs:**
- `role="dialog"` or `role="alertdialog"`
- `aria-modal="true"`
- `aria-labelledby` (dialog title)
- Focus trap, return focus on close

**For tabs:**
- `role="tablist"`, `role="tab"`, `role="tabpanel"`
- `aria-selected`, `aria-controls`
- Keyboard navigation (Arrow keys, Home/End)

**For accordions:**
- `<button>` triggers with `aria-expanded`
- `aria-controls` pointing to panel ID
- Panel has unique ID

**For comboboxes:**
- `role="combobox"` on input
- `aria-expanded`, `aria-controls`
- `role="listbox"` + `role="option"` for dropdown
- `aria-activedescendant` for focus management

### Step 3: Check ARIA Rules

1. **No role redundancy** -- Don't add `role="button"` to `<button>`
2. **Required aria-* present** -- role="combobox" needs aria-expanded, aria-controls
3. **Valid parent-child** -- role="listbox" must contain role="option"
4. **No abstract roles** -- Don't use role="widget" or role="command"
5. **ARIA overrides semantics** -- Prefer semantic HTML before ARIA

### Step 4: Check Keyboard Support

Each interactive element pattern has required keyboard support:
- Modals: Esc to close, Tab/Shift+Tab within trap
- Tabs: Arrow keys, Home/End
- Combobox: Down arrow opens, Esc closes, Enter selects
- Menu: Arrow navigation, Esc closes

### Step 5: Provide Remediation

For each issue:
- WCAG criterion (4.1.2 Name, Role, Value)
- ARIA APG pattern reference
- Code example with correct implementation
- Screen reader testing instructions

## Expected Output

- ARIA pattern compliance assessment
- Keyboard support verification
- Screen reader compatibility notes
- Code fixes with framework-specific examples
