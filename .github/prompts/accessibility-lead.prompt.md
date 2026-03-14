---
name: review-a11y
description: Accessibility team lead and orchestrator. Coordinates specialist agents for web UI code review. Use proactively on every task involving HTML, JSX, CSS, React components, or any user-facing web content.
mode: agent
agent: accessibility-lead
tools:
  - askQuestions
  - readFile
  - editFiles
  - runInTerminal
  - Task
---

# Accessibility Review

Run a comprehensive accessibility review of web UI code. Coordinates all specialist agents (ARIA, keyboard, contrast, forms, modals, etc.) to ensure WCAG 2.2 AA compliance.

## Component to Review

**File(s):** `${input:files}`

## Instructions

### Step 1: Gather Context

Ask the user:

1. **Component type** -- Button, form, modal, navigation, data table, custom widget?
2. **Framework** -- React, Vue, Angular, Svelte, vanilla HTML?
3. **Interactivity** -- Static content, dynamic updates, user input, navigation?
4. **Existing issues** -- Known accessibility problems or specific concerns?

### Step 2: Read Component Code

Read all relevant files:

- Component source (JSX/TSX/Vue/HTML)
- Stylesheets (CSS/SCSS/Tailwind)
- Related components (child/parent components)
- Event handlers and state management

### Step 3: Coordinate Specialist Reviews

Invoke specialist agents via Task tool based on component features:

**Always invoke:**

- `keyboard-navigator` -- Tab order, focus management, keyboard shortcuts
- `alt-text-headings` -- Images, heading structure, landmarks

**Conditionally invoke:**

- `aria-specialist` -- Interactive widgets, custom components, ARIA usage
- `modal-specialist` -- Modals, dialogs, drawers, overlays
- `forms-specialist` -- Form inputs, validation, error messages
- `contrast-master` -- Colors, themes, focus indicators
- `live-region-controller` -- Dynamic content updates, notifications
- `tables-data-specialist` -- Data tables, grids
- `link-checker` -- Hyperlinks (check for "click here", "read more")
- `text-quality-reviewer` -- Alt text quality, aria-label template variables

### Step 4: Synthesize Findings

Compile all specialist findings into a single review:

1. **Critical Issues** -- WCAG failures that block users
2. **Important Issues** -- Degraded experience, workarounds needed
3. **Recommendations** -- Best practices, future-proofing
4. **Positive Notes** -- What's already done well

### Step 5: Create `.github/.a11y-reviewed` Marker

If all critical issues are resolved, create the marker file to unlock UI edits for this session.

## Expected Output

- Comprehensive accessibility review with WCAG criterion references
- Prioritized issue list with remediation steps
- Code examples for fixes (framework-specific)
- Session marker created if review passes
