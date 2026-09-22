# Accessibility Lead reference: Decision Matrix

Part of the `accessibility-lead` skill. Read this only when the task reaches these sections.

## Decision Matrix

When a task comes in, evaluate what is involved:

**Building a new component or page:**

- Always invoke: aria-specialist, keyboard-navigator, alt-text-headings
- If it has forms/inputs: forms-specialist
- If it has colors/styling: contrast-master
- If it has overlays: modal-specialist
- If it has dynamic updates: live-region-controller
- If it has data tables: tables-data-specialist

**Modifying existing UI code:**

- Review the changed files to determine which specialists are relevant
- At minimum: keyboard-navigator (tab order can break with any change)
- If ARIA attributes are present: aria-specialist
- If colors changed: contrast-master

**Reviewing/auditing code:**

- Invoke all specialists
- Compile findings into a single prioritized report

**Quick fix or small change:**

- Determine the single most relevant specialist
- Run their checklist against the change

**Reviewing Office documents or PDFs:**

- .docx -> word-accessibility
- .xlsx -> excel-accessibility
- .pptx -> powerpoint-accessibility
- .pdf -> pdf-accessibility
- Configuration questions -> office-scan-config or pdf-scan-config
- Use scan_office_document or scan_pdf_document MCP tools for automated scanning

## Intent-First Workflow

Before flagging or fixing any accessibility pattern, you MUST understand what the code is supposed to do. Working accessibility with real assistive technology always takes priority over theoretical spec compliance.

### When You Encounter Non-Standard ARIA or Unusual Patterns

1. **Check if it works first.** Test or ask the user whether the current implementation functions correctly with screen readers and keyboard navigation.
2. **Look for documentation.** Check user guides, README files, code comments, and attributes like `aria-keyshortcuts` that indicate intentional design.
3. **Ask clarifying questions before changing anything:**
   - "What is this component supposed to do?"
   - "What keyboard behavior is expected?"
   - "Is there documentation for this pattern?"
   - "Would changing this alter the user experience?"
4. **If the code works with assistive technology and the only issue is spec purity, flag it as Minor (not Critical or Major)** and explain the tradeoff. Do not change working code for zero user benefit.
5. **Never silently change working UX in the name of spec compliance.**

### Multi-File Impact Check

Before changing any structural attribute (ARIA roles, IDs, classes, data attributes):

1. Search ALL workspace files for references to that attribute value
2. List every file and line that will be affected
3. Present the full scope of changes to the user
4. Update all references atomically - never change HTML without updating corresponding JavaScript/CSS

### Revert-First Policy

If a user reports that a change broke working functionality:

1. **Offer to revert immediately** - restore the working state first
2. **Ask about intended behavior** - understand what it was supposed to do
3. **Only re-implement after understanding intent** - choose the right pattern for the intended UX
4. **Never "fix forward"** on a breaking change - get back to working state, then discuss

## Core Standards

These are non-negotiable. Every specialist enforces them within their domain, but you verify nothing was missed.

### Semantic HTML First

- Native HTML elements before ARIA. Always.
- `<button>` not `<div role="button">`
- `<dialog>` not `<div role="dialog">`
- `<nav>`, `<main>`, `<header>`, `<footer>` for landmarks

### Heading Structure

- One H1 per page. Strictly enforced.
- Never skip levels. H1 then H2 then H3, not H1 then H3.
- Can return to higher levels. H2 then H3 then H2 is fine.
- Never choose heading level for visual appearance. Use CSS to style.

### Buttons vs Links

- `<button>` for actions (submit, toggle, open modal)
- `<a href>` for navigation (go to page, go to section)
- Never nest one inside the other

### Links

- Descriptive text. "Learn more about our pricing" not "Click here"
- Visually distinct with underline or other non-color indicator
- No redundant `role="link"` on `<a>` elements

### Icons

- Always `aria-hidden="true"` on icons when visible text is present
- Icon-only buttons must have `aria-label`
- Never leave icons visible to screen readers alongside text

### Images

- Descriptive `alt` for meaningful images
- Empty `alt=""` and `aria-hidden="true"` for decorative images
- Never put essential text only in an image

### Page Setup

- `<html lang="...">` always set with correct language code
- Descriptive `<title>` in format "Page Title - App Name"
- Proper viewport meta for zoom support
- Skip link to main content

## Final Review Checklist

Before any UI code is complete, verify all of the following.

### Structure

- [ ] Single H1, logical heading hierarchy
- [ ] Correct landmark elements (header, nav, main, footer)
- [ ] Skip link present and functional
- [ ] Page title set and descriptive
- [ ] Lang attribute on html element

### Interaction

- [ ] Every interactive element reachable by keyboard
- [ ] Tab order matches visual layout
- [ ] No positive tabindex values
- [ ] Focus managed on route changes, dynamic content, deletions
- [ ] Modals trap focus and return focus on close
- [ ] Escape closes overlays

### ARIA

- [ ] No redundant ARIA on semantic elements
- [ ] ARIA states update dynamically with interactions
- [ ] All ID references in aria-controls, aria-labelledby, aria-describedby are valid
- [ ] Live regions present for dynamic content updates

### Visual

- [ ] Text contrast passes WCAG AA (4.5:1 normal, 3:1 large)
- [ ] UI component contrast 3:1
- [ ] Focus indicators visible with 3:1 contrast
- [ ] No information by color alone
- [ ] prefers-reduced-motion supported

### Forms

- [ ] Every input has a label
- [ ] Errors associated with aria-describedby
- [ ] Focus moves to first error on submit
- [ ] Required fields marked with required attribute
- [ ] Error messages use text/icons, not just color

### Content

- [ ] Images have appropriate alt text
- [ ] Icons hidden from screen readers
- [ ] Links have descriptive text (no "click here" or "read more" without context)
- [ ] Repeated identical link text differentiated with aria-label
- [ ] Links opening in new tabs warn the user
- [ ] No "Click here" or "Read more" without context
