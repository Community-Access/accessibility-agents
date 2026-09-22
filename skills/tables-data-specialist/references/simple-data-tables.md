# Tables and Data Specialist reference: Simple Data Tables

Part of the `tables-data-specialist` skill. Read this only when the task reaches these sections.

## Simple Data Tables

### The Basics

Every data table needs these elements:

```html
<table>
  <caption>Quarterly sales by region, 2025</caption>
  <thead>
    <tr>
      <th scope="col">Region</th>
      <th scope="col">Q1</th>
      <th scope="col">Q2</th>
      <th scope="col">Q3</th>
      <th scope="col">Q4</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">North America</th>
      <td>$2.1M</td>
      <td>$2.4M</td>
      <td>$2.8M</td>
      <td>$3.1M</td>
    </tr>
    <tr>
      <th scope="row">Europe</th>
      <td>$1.8M</td>
      <td>$1.9M</td>
      <td>$2.2M</td>
      <td>$2.5M</td>
    </tr>
  </tbody>
</table>
```

Requirements:

- `<caption>` describes what the table contains -- this is the table's accessible name. It MUST be the first child element after `<table>`
- `<th>` for all header cells, never `<td>` styled to look like a header
- `scope="col"` on column headers, `scope="row"` on row headers -- always explicit, even when there is only one header row
- `<thead>` wraps the header row(s), `<tbody>` wraps data rows
- `<tfoot>` for summary/total rows if they exist

### Structural Clarifications (per WebAIM)

**`<thead>`, `<tbody>`, `<tfoot>`** provide no accessibility semantics -- screen readers do not use them. They exist for CSS styling, print rendering, and fixed-header scrolling. Still use them for code organization, but do not rely on them for accessibility.

**The `summary` attribute** is deprecated in HTML5. Use `<caption>` for the table's accessible name. If a longer description is needed, use `aria-describedby` pointing to a paragraph outside the table.

**`headers`/`id` associations** are a last resort. Prefer `scope` on every `<th>`. Only use `headers`/`id` when a table has irregular header spans that `scope` cannot express. Over-complex `headers`/`id` markup is fragile and error-prone.

**Proportional sizing:** Use percentage or relative widths (`width: 30%`, `min-width: 8em`) rather than fixed pixel widths. This prevents horizontal scrolling at increased text sizes (WCAG 1.4.10 Reflow).

**Flatten when possible:** If a table requires deeply nested `colspan`/`rowspan` spanning three or more levels, consider whether the data can be restructured into simpler tables. Complex spanning creates substantial screen reader navigation difficulty.

### Why `scope` Matters

Without `scope`, screen readers have to guess which headers apply to which cells. In simple tables they often guess correctly, but in complex tables they will guess wrong. Always be explicit.

```html
<!-- BAD: Screen reader has to guess -->
<th>Region</th>

<!-- GOOD: Explicit relationship -->
<th scope="col">Region</th>
```

## Complex Tables

### Multi-Level Headers

When a table has headers that span multiple columns or rows:

```html
<table>
  <caption>Employee schedule, week of January 20</caption>
  <thead>
    <tr>
      <td></td>
      <th scope="col" colspan="2">Morning</th>
      <th scope="col" colspan="2">Afternoon</th>
    </tr>
    <tr>
      <td></td>
      <th scope="col">Task</th>
      <th scope="col">Location</th>
      <th scope="col">Task</th>
      <th scope="col">Location</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Monday</th>
      <td>Code review</td>
      <td>Remote</td>
      <td>Sprint planning</td>
      <td>Room 4A</td>
    </tr>
  </tbody>
</table>
```

### The `headers` Attribute

For truly complex tables where `scope` is insufficient (cells relate to headers in non-obvious ways), use the `headers` attribute:

```html
<table>
  <caption>Test results by browser and operating system</caption>
  <thead>
    <tr>
      <td></td>
      <th id="chrome" scope="col">Chrome</th>
      <th id="firefox" scope="col">Firefox</th>
      <th id="safari" scope="col">Safari</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th id="windows" scope="row">Windows</th>
      <td headers="chrome windows">Pass</td>
      <td headers="firefox windows">Pass</td>
      <td headers="safari windows">N/A</td>
    </tr>
    <tr>
      <th id="macos" scope="row">macOS</th>
      <td headers="chrome macos">Pass</td>
      <td headers="firefox macos">Pass</td>
      <td headers="safari macos">Fail</td>
    </tr>
  </tbody>
</table>
```

## Sortable Tables

```html
<table>
  <caption>User accounts</caption>
  <thead>
    <tr>
      <th scope="col" aria-sort="ascending">
        <button>
          Name
          <span aria-hidden="true">^</span>
        </button>
      </th>
      <th scope="col" aria-sort="none">
        <button>
          Email
          <span aria-hidden="true"></span>
        </button>
      </th>
      <th scope="col" aria-sort="none">
        <button>
          Joined
          <span aria-hidden="true"></span>
        </button>
      </th>
    </tr>
  </thead>
  <tbody>
    <!-- sorted data rows -->
  </tbody>
</table>
```

Requirements:

- Sort buttons inside `<th>` elements
- `aria-sort` on the `<th>`: `"ascending"`, `"descending"`, or `"none"`
- Only one column can have `aria-sort="ascending"` or `"descending"` at a time
- Update `aria-sort` when the user clicks to sort
- Visual sort indicator (arrow/chevron) with `aria-hidden="true"` - the `aria-sort` attribute is the accessible indicator
- Announce the sort change via a live region or by the `aria-sort` update

```javascript
function sortColumn(th, direction) {
  // Reset all columns
  document.querySelectorAll('th[aria-sort]').forEach(h => {
    h.setAttribute('aria-sort', 'none');
  });
  // Set the active column
  th.setAttribute('aria-sort', direction);
  // Sort the data...
}
```

## Interactive Data Grids

When a table has interactive content (editable cells, inline actions, checkboxes), use the ARIA grid pattern:

```html
<table role="grid" aria-label="User management">
  <thead>
    <tr>
      <th scope="col">
        <input type="checkbox" aria-label="Select all users">
      </th>
      <th scope="col">Name</th>
      <th scope="col">Role</th>
      <th scope="col">Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <input type="checkbox" aria-label="Select Jane Smith">
      </td>
      <td>Jane Smith</td>
      <td>
        <select aria-label="Role for Jane Smith">
          <option>Admin</option>
          <option selected>Editor</option>
          <option>Viewer</option>
        </select>
      </td>
      <td>
        <button aria-label="Edit Jane Smith">Edit</button>
        <button aria-label="Delete Jane Smith">Delete</button>
      </td>
    </tr>
  </tbody>
</table>
```

Requirements for `role="grid"`:

- Arrow keys navigate between cells
- Tab moves to the next interactive element within the grid, then exits the grid
- Enter/Space activates the focused cell's interactive element
- Every interactive element inside cells needs a descriptive `aria-label` that includes context (not just "Edit" - "Edit Jane Smith")
- `role="grid"` goes on the `<table>`, not individual cells
- Only use `role="grid"` when cells are interactive - plain data tables should NOT have `role="grid"`
