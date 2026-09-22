# Modal Specialist reference: Filter Modal Pattern

Part of the `modal-specialist` skill. Read this only when the task reaches these sections.

## Filter Modal Pattern

A common pattern for filter interfaces:

```html
<button id="filters-btn">Filters</button>
<button id="clear-all-btn" hidden>Clear All Filters</button>
<div id="applied-filters" aria-live="polite"></div>

<dialog id="filters-modal" role="dialog" aria-modal="true" aria-labelledby="filters-title">
  <button aria-label="Close filters">Close</button>
  <h2 id="filters-title">Filters</h2>
  <div aria-live="polite" id="result-count">25 results</div>
  
  <form>
    <fieldset>
      <legend><h3>Category</h3></legend>
      <!-- Checkboxes -->
    </fieldset>
    <button type="submit">Apply Filters</button>
    <button type="button">Clear All</button>
  </form>
</dialog>
```

Requirements specific to filters:

- Live region updates result count as checkboxes change
- Headings for each filter group (inside fieldset legends)
- Apply button confirms selection
- Clear All available inside modal AND on the page after closing
- Applied filters displayed on the page after closing
- Focus returns to Filters button on close
