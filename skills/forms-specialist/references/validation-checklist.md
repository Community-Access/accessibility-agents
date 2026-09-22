# Forms Specialist reference: Validation Checklist

Part of the `forms-specialist` skill. Read this only when the task reaches these sections.

## Validation Checklist

1. Does every input have a programmatically associated label?
2. Are required fields indicated with `required` attribute and visible indicator?
3. Do error messages identify the specific problem and how to fix it?
4. Are errors linked to fields via `aria-describedby`?
5. Does `aria-invalid="true"` appear on fields with errors?
6. Does focus move to error summary or first error on submit?
7. Are related inputs grouped with `<fieldset>` and `<legend>`?
8. Do inputs have appropriate `autocomplete` attributes?
9. Can the entire form be completed by keyboard alone?
10. Are password show/hide toggles accessible buttons?
11. Are file upload constraints described and status announced?
12. For multi-step forms: does focus move to each step heading?
13. Are custom controls (toggles, ratings) built with proper ARIA?
14. Are inline validation messages announced without disrupting input?
15. Is the submit button a `<button type="submit">` (not a link or div)?

## Common Mistakes You Must Catch

- `placeholder` used as the only label (disappears on input, poor contrast)
- Error messages not associated with `aria-describedby`
- Missing `aria-invalid` on error fields
- Radio/checkbox groups without `<fieldset>` and `<legend>`
- Custom styled inputs that lose native keyboard behavior
- Submit button is a `<div>` or `<a>` instead of `<button>`
- No focus management on validation errors (user doesn't know errors exist)
- Autocomplete attributes missing on identity/payment fields
- Required fields indicated only by asterisk color
- Validation on every keystroke creating screen reader noise
- `disabled` used when `aria-disabled` would be more appropriate
- Tab order broken by CSS positioning that differs from DOM order

## Structured Output for Sub-Agent Use

When invoked as a sub-agent by the web-accessibility-wizard, consume the `## Web Scan Context` block provided at the start of your invocation - it specifies the page URL, framework, audit method, thoroughness level, and disabled rules. Honor every setting in it.

Provide framework-specific code fixes. For React, use `htmlFor` (not `for`). For Angular, use `[attr.aria-describedby]`. For Vue, use standard HTML attributes. For controlled inputs, show the state management pattern.

Return each issue in this exact structure so the wizard can aggregate, deduplicate, and score results:

```text
### [N]. [Brief one-line description]

- **Severity:** [critical | serious | moderate | minor]
- **WCAG:** [criterion number] [criterion name] (Level [A/AA/AAA])
- **Confidence:** [high | medium | low]
- **Impact:** [What a real user with a disability would experience - one sentence]
- **Location:** [file path:line or component name]

**Current code:**
[code block showing the problem]

**Recommended fix:**
[code block showing the corrected code in the detected framework syntax]
```

**Confidence rules:**

- **high** - definitively wrong: input with no label association, error message with no `aria-describedby`, required field with no `required` attribute
- **medium** - likely wrong: label and input appear visually associated but lack programmatic link, placeholder-only label suspected
- **low** - possibly wrong: custom form control pattern may have accessible equivalent not visible in static analysis

### Output Summary

End your invocation with this summary block (used by the wizard for / progress announcements):

```text
## Forms Specialist Findings Summary
- **Issues found:** [count]
- **Critical:** [count] | **Serious:** [count] | **Moderate:** [count] | **Minor:** [count]
- **High confidence:** [count] | **Medium:** [count] | **Low:** [count]
```
