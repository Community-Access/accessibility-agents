# ARIA Specialist reference: ARIA You Must Use Correctly

Part of the `aria-specialist` skill. Read this only when the task reaches these sections.

## ARIA You Must Use Correctly

### Modals

```html
<!-- Opened with dialog.showModal() -->
<dialog aria-labelledby="modal-title">
  <h2 id="modal-title">Title</h2>
  <button>Close</button>
</dialog>
```

Requirements:

- Open a native `<dialog>` with `showModal()`. That makes it modal and gives it the dialog role, so do not add `role="dialog"` (ARIA in HTML marks it not recommended) or `aria-modal`. A custom `div` dialog needs `role="dialog"` and `aria-modal="true"`
- `aria-labelledby` pointing to the heading (or `aria-label` when there is no visible title)
- Focus moves into the dialog when it opens: usually the first focusable element; a static element at the top when the content is long; the least destructive button when the action cannot be undone (APG Dialog (Modal) pattern)
- A visible button that closes the dialog is in its Tab sequence
- Tab and Shift+Tab stay inside the dialog; Escape closes it and returns focus to the trigger
- Heading starts at H2 (H1 is the page title)
- `aria-haspopup="dialog"` on the trigger is valid ARIA 1.2 but optional; the APG dialog pattern does not use it

### Tabs

```html
<div role="tablist" aria-label="Section tabs">
  <button role="tab" id="tab-1" aria-selected="true" aria-controls="panel-1">Tab 1</button>
  <button role="tab" id="tab-2" aria-selected="false" aria-controls="panel-2" tabindex="-1">Tab 2</button>
</div>
<div role="tabpanel" id="panel-1" aria-labelledby="tab-1">Content</div>
<div role="tabpanel" id="panel-2" aria-labelledby="tab-2" hidden>Content</div>
```

Requirements:

- Container has `role="tablist"`, labelled with `aria-labelledby` when a visible label exists, otherwise `aria-label`
- Each tab is a `<button>` with `role="tab"` and `aria-selected`
- Unselected tabs have `tabindex="-1"`
- Panels have `role="tabpanel"` and `aria-labelledby`
- Left and Right Arrow move between tabs in a horizontal tab list (Up and Down in a vertical one, with `aria-orientation="vertical"`), wrapping at the ends; Home and End are optional
- Tab moves from the active tab into the tab panel
- Screen reader must announce "Tab 1, selected" not just "Tab 1"

### Accordions

```html
<h2>
  <button id="accordion-btn-1" aria-expanded="false" aria-controls="panel-1">Question</button>
</h2>
<div id="panel-1" role="region" aria-labelledby="accordion-btn-1" hidden>Answer</div>
```

Requirements:

- Toggle button inside a heading element
- `aria-expanded` reflects open/closed state
- `aria-controls` links to panel ID
- Panel may have `role="region"` and `aria-labelledby`; the APG says to avoid this when it causes landmark proliferation, for example with more than about six panels that can be open at once
- Enter or Space on the header button expands or collapses its panel; Tab moves through the headers and any focusable panel content. Escape is not part of the APG accordion pattern

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
<div role="group" aria-roledescription="slide" aria-label="1 of 3">
  <img src="photo.jpg" alt="Descriptive text about what is shown">
</div>
```

Requirements:

- Each slide is `role="group"` with `aria-roledescription="slide"`
- `aria-label` gives the position ("1 of 3"); it does not repeat the word "slide", because `aria-roledescription` already supplies it
- No auto-rotation, or a rotation control (stop and start) that is the first element in the Tab sequence inside the carousel; rotation also stops while keyboard focus is inside the carousel or the pointer hovers over it
- Previous and Next buttons
- Slide picker controls labelled by slide ("Go to slide 1"); the button for the displayed slide has `aria-disabled="true"`, or, if the pickers are tabs, follow the Tabs pattern and use `aria-selected`
- All images have descriptive alt text
