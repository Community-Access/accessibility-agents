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

Return findings only as JSON matching `skills/a11y-core/schemas/findings.schema.json`, as the output contract in SKILL.md requires. Map each issue to the schema fields:

- `rule` - a stable identifier for the check
- `wcag` - criterion number and level, for example `"1.4.3 AA"`, or `"n/a"` for findings outside WCAG
- `severity` - `critical`, `serious`, `moderate` or `minor`
- `confidence` - `high`, `medium` or `low` (omit when high)
- `location` - file path and line, or a CSS selector: somewhere a person can open (a repeated component goes in `component`)
- `summary` - one sentence naming the defect and what a user with a disability would experience
- `fix` - the corrected code or text, in the detected framework's syntax
- `evidence` - the offending markup or value, kept short

**Confidence rules:**

- **high** - definitively wrong: input with no label association, error message with no `aria-describedby`, required field with no `required` attribute
- **medium** - likely wrong: label and input appear visually associated but lack programmatic link, placeholder-only label suspected
- **low** - possibly wrong: custom form control pattern may have accessible equivalent not visible in static analysis
