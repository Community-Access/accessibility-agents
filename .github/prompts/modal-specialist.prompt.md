---
name: review-modal
description: Modal and dialog specialist. Reviews modals, dialogs, drawers, popovers, sheets, and overlays for focus trapping, focus return, escape behavior, and screen reader announcements.
mode: agent
agent: modal-specialist
tools:
  - askQuestions
  - readFile
  - editFiles
---

# Modal/Dialog Accessibility Review

Review modals, dialogs, drawers, and overlays for proper focus management and ARIA implementation.

## Component to Review

**Files:** `${input:files}`

## Instructions

### Step 1: Identify Modal Type

Ask the user:

1. **Modal type** -- Dialog, alert dialog, drawer, popover, sheet, lightbox?
2. **Framework** -- React, Vue, Radix UI, Headless UI, custom?
3. **Dismissal** -- Close button, Escape key, click outside?
4. **Content** -- Form, confirmation, informational, media?

### Step 2: Check ARIA Implementation

**For standard modals:**

```jsx
<div
  role="dialog"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
  aria-modal="true"
>
  <h2 id="dialog-title">Confirm deletion</h2>
  <p id="dialog-description">This cannot be undone.</p>
  ...
</div>
```

**For alerts:**

- Use `role="alertdialog"` for urgent/destructive actions
- Screen reader interrupts to announce

### Step 3: Check Focus Management

**On open:**

1. Save reference to trigger element
2. Move focus into modal (first focusable element or close button)
3. Trap focus within modal boundaries

**On close:**

1. Return focus to trigger element
2. Remove or hide modal from DOM

### Step 4: Check Focus Trap

1. **Tab cycles** -- Last element tabs to first
2. **Shift+Tab cycles** -- First element goes to last
3. **No escape** -- Can't tab out of modal
4. **Escape key** -- Closes modal and returns focus

### Step 5: Check Inert Content

Use `aria-modal="true"` or:

- Set `aria-hidden="true"` on background content
- Set `inert` attribute on background content (modern browsers)
- Ensures screen reader can't navigate outside modal

### Step 6: Check Keyboard Support

Required keyboard interactions:

- **Escape** -- Close modal
- **Tab** -- Cycle forward through focusable elements
- **Shift+Tab** -- Cycle backward
- **Enter** -- Activate focused button
- **Click outside** -- Optional, if implemented must be keyboard-accessible

### Step 7: Provide Remediation

For each issue:

- ARIA APG Dialog pattern reference
- WCAG criterion (2.4.3 Focus Order, 1.3.1 Info and Relationships)
- Code example showing correct implementation
- Framework-specific patterns (React useEffect, Vue onMounted)
- Screen reader testing notes

## Expected Output

- ARIA pattern compliance check
- Focus management assessment
- Focus trap verification
- Keyboard support evaluation
- Code fixes with framework-specific examples
