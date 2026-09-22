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
