# ARIA Specialist reference: ARIA You Must Use Correctly

Part of the `aria-specialist` skill. Read this only when the task reaches these sections.

## ARIA You Must Use Correctly

### Modals

```html
<dialog role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <button aria-label="Close">Close</button>
  <h2 id="modal-title">Title</h2>
</dialog>
```

Requirements:

- `role="dialog"` and `aria-modal="true"` on `<dialog>`
- `aria-labelledby` pointing to the heading
- Focus lands on Close button immediately (no Tab needed)
- Close button is first element inside modal
- Escape closes and returns focus to trigger
- Heading starts at H2 (H1 is the page title)
- Trigger button gets `aria-haspopup="dialog"`

### Tabs

```html
<div role="tablist" aria-label="Section tabs">
  <button role="tab" aria-selected="true" aria-controls="panel-1">Tab 1</button>
  <button role="tab" aria-selected="false" aria-controls="panel-2" tabindex="-1">Tab 2</button>
</div>
<div role="tabpanel" id="panel-1" aria-labelledby="tab-1">Content</div>
```

Requirements:

- Container has `role="tablist"` with `aria-label`
- Each tab is a `<button>` with `role="tab"` and `aria-selected`
- Unselected tabs have `tabindex="-1"`
- Panels have `role="tabpanel"` and `aria-labelledby`
- Arrow keys move between tabs
- Screen reader must announce "Tab 1, selected" not just "Tab 1"

### Accordions

```html
<h2>
  <button aria-expanded="false" aria-controls="panel-1">Question</button>
</h2>
<div id="panel-1" role="region" aria-labelledby="accordion-btn-1" hidden>Answer</div>
```

Requirements:

- Toggle button inside a heading element
- `aria-expanded` reflects open/closed state
- `aria-controls` links to panel ID
- Panel has `role="region"` and `aria-labelledby`
- Escape closes the open panel

### Live Regions

```html
<div aria-live="polite" id="status">25 results</div>
```

Rules:

- Use `aria-live="polite"` for non-urgent updates (search results, filter changes, form success)
- Use `aria-live="assertive"` only for critical alerts (errors, session expiring)
- Never use assertive for routine updates -- it interrupts whatever the screen reader is currently reading
- The live region element must exist in the DOM before content changes
- Update the text content, do not replace the element
- Keep announcements short and meaningful

### Combobox / Autocomplete

```html
<input role="combobox" aria-expanded="false" aria-controls="results" aria-autocomplete="list" autocomplete="off">
<div aria-live="polite" class="visually-hidden" id="status"></div>
<ul id="results" role="listbox" hidden>
  <li role="option" id="result-0">Item</li>
</ul>
```

Requirements:

- Input has `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-autocomplete="list"`
- Results list has `role="listbox"`, items have `role="option"`
- Arrow keys navigate options
- `aria-activedescendant` tracks the current option
- Live region announces result count ("3 results available")
- Escape closes the list

### Carousels

```html
<div role="group" aria-roledescription="slide" aria-label="Slide 1 of 3">
  <img src="photo.jpg" alt="Descriptive text about what is shown">
</div>
```

Requirements:

- Each slide is `role="group"` with `aria-roledescription="slide"`
- `aria-label` includes position ("Slide 1 of 3")
- No auto-rotation (or provide a stop button accessible before the carousel)
- Previous/Next buttons placed before the slides
- Dot navigation as a list of buttons with labels ("Go to slide 1")
- Current dot has `aria-current="true"`
- All images have descriptive alt text
