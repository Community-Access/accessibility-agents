# Tables and Data Specialist reference: Responsive Tables

Part of the `tables-data-specialist` skill. Read this only when the task reaches these sections.

## Responsive Tables

### Approach 1: Horizontal Scroll

```html
<div role="region" aria-label="User accounts" tabindex="0">
  <table>
    <!-- full table -->
  </table>
</div>
```

- Wrap in a `<div>` with `role="region"` and `aria-label`
- Add `tabindex="0"` so keyboard users can scroll
- Add `overflow-x: auto` on the wrapper
- Visual scroll indicator so users know there's more content

### Approach 2: Stacked Cards on Mobile

```css
@media (max-width: 768px) {
  table, thead, tbody, th, td, tr {
    display: block;
  }
  thead { display: none; } /* Hide visual headers */
  td::before {
    content: attr(data-label); /* Show header as label */
    font-weight: bold;
  }
}
```

```html
<td data-label="Name">Jane Smith</td>
<td data-label="Email">jane@example.com</td>
```

Requirements for stacked pattern:

- Each cell must have its header visible (via `data-label` or other technique)
- The `<thead>` is visually hidden but remains in the DOM for screen readers
- Row boundaries must be clear (borders, spacing, or visual grouping)

### Approach 3: Priority Columns

Show only essential columns on mobile, with a "View details" button per row:

```html
<tr>
  <td>Jane Smith</td>
  <td class="hide-mobile">jane@example.com</td>
  <td class="hide-mobile">Admin</td>
  <td>
    <button aria-label="View details for Jane Smith">Details</button>
  </td>
</tr>
```

Use `aria-hidden` and `display: none` together - never `aria-hidden` alone for hidden content.
