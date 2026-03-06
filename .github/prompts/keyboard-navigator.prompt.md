---
name: review-keyboard
description: Keyboard navigation and focus management specialist. Reviews tab order, focus traps, keyboard shortcuts, skip links, and ensures full keyboard operability.
mode: agent
agent: keyboard-navigator
tools:
  - askQuestions
  - readFile
  - editFiles
---

# Keyboard Navigation Review

Review keyboard accessibility, tab order, focus management, and keyboard shortcuts for users who cannot use a mouse.

## Component to Review

**Files:** `${input:files}`

## Instructions

### Step 1: Gather Context

Ask the user:

1. **Page/component type** -- Navigation, SPA route change, modal, complex widget?
2. **Interactivity** -- Static, forms, dynamic content updates?
3. **Known issues** -- Focus disappears, tab order skips elements, keyboard trap?

### Step 2: Review Tab Order

1. **Follows visual order** -- Tab sequence matches reading order?
2. **All interactive elements reachable** -- Buttons, links, inputs?
3. **Skip links present** -- "Skip to main content" for repeated navigation?
4. **No positive tabindex** -- Never use `tabindex="1"` or higher?
5. **Hidden content excluded** -- `display: none` or `visibility: hidden` not in tab order?

### Step 3: Review Focus Management

**On page load:**
- Focus on first heading or main content?
- Skip link focused first (if present)?

**After route changes (SPA):**
- Focus moved to new page heading or content?
- Announced to screen readers?

**After deletions:**
- Focus moves to next logical element?
- Not left orphaned?

**After modals open:**
- Focus moves to modal?
- Focus returns to trigger on close?

### Step 4: Review Focus Indicators

1. **Visible** -- Outline/ring visible on all focused elements?
2. **Not removed** -- No `:focus { outline: none }` without visible alternative?
3. **Sufficient contrast** -- 3:1 against background (WCAG 2.4.11)?
4. **Consistent** -- Same pattern across site?

### Step 5: Review Keyboard Shortcuts

1. **Standard keys work** -- Enter, Space, Escape, Arrow keys?
2. **No conflicts** -- Custom shortcuts don't block browser functions?
3. **Documented** -- Help text or aria-label explains shortcuts?
4. **Visible** -- Keyboard-only users can discover shortcuts?

### Step 6: Check Focus Traps

**Intentional traps (modals):**
- Tab cycles within modal?
- Escape closes modal and returns focus?

**Unintentional traps:**
- Focus can move past all elements and loops back?
- No dead ends where Tab stops working?

### Step 7: Provide Remediation

For each issue:
- WCAG criterion (2.1.1, 2.1.2, 2.4.3, 2.4.7)
- Keyboard pattern (Tab, Enter, Esc, Arrows)
- Code example showing fix
- Testing instructions (keyboard-only navigation)

## Expected Output

- Tab order assessment
- Focus management evaluation
- Focus indicator review
- Keyboard trap check
- Code fixes with framework-specific examples
