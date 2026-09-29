# Forms Specialist reference: Labels -- The Foundation

Part of the `forms-specialist` skill. Read this only when the task reaches these sections.

## Labels -- The Foundation

Every form control MUST have a programmatically associated label. Visual proximity is not enough -- screen readers need explicit association.

### Standard Pattern

```html
<label for="email">Email address</label>
<input id="email" type="email" autocomplete="email">
```

Requirements:

- `<label>` element with `for` attribute matching the input's `id`
- Never use `placeholder` as the only label -- it disappears on input and has poor contrast
- Never use `aria-label` when a visible label is possible -- sighted users benefit from visible labels too
- Label text must be descriptive. "Email address" not "Input 1"
- Clicking a `<label>` activates its associated control (ARIA labeling via `aria-label`/`aria-labelledby` does NOT provide this click behavior -- this is why `<label>` is always preferred)
- Implicit labels (wrapping input inside `<label>`) work but are less well-supported than explicit `for`/`id` association

### Placeholder Is Not a Label

A `placeholder` is not an accessible name and does not substitute for one.

- On its own it fails [WCAG 4.1.2](https://www.w3.org/TR/WCAG22/#name-role-value): the text disappears as soon as the user starts typing, and it usually fails [WCAG 1.4.3 Contrast (Minimum)](https://www.w3.org/TR/WCAG22/#contrast-minimum).
- Even when a real label exists, combining an accessible name with a `placeholder` makes the browser expose the placeholder as a second child node of the field. Chrome's accessibility tree reports `textbox "Email address"` with a child `/placeholder: you@example.com`, so JAWS and VoiceOver announce both -- the name twice. This is not textarea-specific: it applies to every `input` and `select`.
- When a field already has a name, drop the `placeholder`. If the example text genuinely helps sighted users, move it to visible help text and associate it with `aria-describedby` (see "Help Text and Descriptions" in `SKILL.md`).

```html
<!-- BAD: label and placeholder are both announced -->
<label for="email">Email address</label>
<input id="email" type="email" placeholder="you@example.com">

<!-- GOOD: one name, example moved to described help text -->
<label for="email">Email address</label>
<input id="email" type="email" aria-describedby="email-hint">
<p id="email-hint">For example, you@example.com</p>
```

### When `aria-label` Is Acceptable

Only when a visible label genuinely cannot exist:

```html
<!-- Search input with visible button -->
<input type="search" aria-label="Search products">
<button>Search</button>

<!-- Icon-only clear button inside an input -->
<button aria-label="Clear search">
  <svg aria-hidden="true">...</svg>
</button>
```

### When to Use `aria-labelledby`

When the label text comes from multiple elements or is already visible elsewhere:

```html
<h2 id="billing-heading">Billing Address</h2>
<input aria-labelledby="billing-heading street-label" id="street">
<span id="street-label">Street</span>
```

### Labels for Wrapped Inputs

This pattern works but the explicit `for`/`id` association is preferred:

```html
<!-- Works but less explicit -->
<label>
  Email address
  <input type="email">
</label>

<!-- Preferred -- explicit association -->
<label for="email">Email address</label>
<input id="email" type="email">
```
