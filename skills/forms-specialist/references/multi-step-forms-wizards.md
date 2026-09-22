# Forms Specialist reference: Multi-Step Forms / Wizards

Part of the `forms-specialist` skill. Read this only when the task reaches these sections.

## Multi-Step Forms / Wizards

```html
<nav aria-label="Form progress">
  <ol>
    <li aria-current="step">
      <span>Step 1: Personal Info</span>
    </li>
    <li>
      <span>Step 2: Address</span>
    </li>
    <li>
      <span>Step 3: Payment</span>
    </li>
  </ol>
</nav>

<form>
  <h2>Step 1: Personal Information</h2>
  <!-- Step fields -->
  <button type="button">Next</button>
</form>
```

Requirements:

- Progress indicator with `aria-current="step"` on the current step
- Each step has a heading indicating step number and name
- Focus moves to the step heading when navigating between steps
- Back button available (do not rely on browser back)
- Data persists when navigating between steps
- Validation per step, not just on final submit
- Announce step changes via heading focus or live region

## Search Forms

```html
<search>
  <form aria-label="Site search">
    <label for="search" class="visually-hidden">Search</label>
    <input id="search" type="search" aria-describedby="search-help" autocomplete="off">
    <button type="submit">Search</button>
    <p id="search-help" class="visually-hidden">Search by product name, category, or keyword</p>
  </form>
</search>
<div aria-live="polite" id="search-results-count" class="visually-hidden"></div>
```

Requirements:

- Use the `<search>` element (HTML5 semantic element, maps to `role="search"` automatically). Falls back gracefully in older browsers. If `<search>` is unavailable, use `<form role="search">`
- Label the search input (visually hidden is acceptable for search)
- Live region announces result count
- Debounce announcements for live search (500ms minimum)
- Clear button if input has content
