---
name: review-forms
description: Form accessibility specialist. Reviews forms, inputs, validation, error handling, multi-step wizards, and assistive technology compatibility.
mode: agent
agent: forms-specialist
tools:
  - askQuestions
  - readFile
  - editFiles
---

# Form Accessibility Review

Review form inputs, labels, validation, error handling, and keyboard accessibility for WCAG compliance.

## Form to Review

**Files:** `${input:files}`

## Instructions

### Step 1: Gather Context

Ask the user:

1. **Form type** -- Login, registration, checkout, search, contact, survey?
2. **Complexity** -- Single step, multi-step wizard, conditional fields?
3. **Framework** -- React Hook Form, Formik, vanilla HTML, other?
4. **Validation** -- Client-side, server-side, real-time validation?

### Step 2: Review Labels and Instructions

1. **Every input has label** -- `<label for="id">` or aria-label/aria-labelledby?
2. **Labels descriptive** -- "Email address" not just "Email"?
3. **Required fields marked** -- Visual indicator + aria-required="true"?
4. **Help text associated** -- aria-describedby links to hint text?
5. **Format shown** -- "MM/DD/YYYY" visible for date inputs?

### Step 3: Review Error Handling

1. **Errors announced** -- role="alert" or aria-live="assertive"?
2. **Error messages specific** -- "Email is required" not "Error"?
3. **Error location clear** -- Error visually near input, ID linked via aria-describedby?
4. **No color-only** -- Red border + icon/text, not just red?
5. **Focus management** -- Focus moves to first error after submit?

### Step 4: Review Keyboard Accessibility

1. **Tab order logical** -- Follows visual order?
2. **Enter submits** -- Works from any input?
3. **Escape cancels** -- Closes modals, clears errors?
4. **Custom widgets accessible** -- Date pickers, file uploads?

### Step 5: Review Autocomplete

WCAG 1.3.5: Use autocomplete tokens for common inputs

- `autocomplete="email"` for email
- `autocomplete="given-name"` for first name
- `autocomplete="tel"` for phone

### Step 6: Provide Remediation

For each issue:
- WCAG criterion (1.3.1, 3.3.1, 3.3.2, 3.3.3, 4.1.2)
- Code example with correct implementation
- Framework-specific patterns
- Screen reader testing notes

## Expected Output

- Label and instruction assessment
- Error handling evaluation
- Keyboard accessibility verification
- Autocomplete token recommendations
- Code fixes with examples
