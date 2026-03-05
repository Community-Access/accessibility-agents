---
name: review-tables
description: Data table accessibility specialist. Reviews proper table markup, headers, scope, caption, sortable columns, responsive patterns, and ARIA grid roles.
mode: agent
agent: tables-data-specialist
tools:
  - askQuestions
  - readFile
  - editFiles
---

# Data Table Accessibility Review

Review data tables for proper semantic markup, header associations, and screen reader compatibility.

## Table to Review

**Files:** `${input:files}`

## Instructions

### Step 1: Identify Table Type

Ask the user:

1. **Table purpose** -- Data table, layout table (avoid!), pricing table, comparison table?
2. **Complexity** -- Simple (1 header row), complex (multiple headers), sortable, filterable?
3. **Framework** -- React, vanilla HTML, TanStack Table, AG Grid, custom?
4. **Responsive** -- Collapses on mobile, horizontal scroll, card view?

### Step 2: Check Semantic Markup

**Simple table:**
```html
<table>
  <caption>Monthly revenue by region</caption>
  <thead>
    <tr>
      <th scope="col">Region</th>
      <th scope="col">Q1</th>
      <th scope="col">Q2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">North</th>
      <td>$50k</td>
      <td>$60k</td>
    </tr>
  </tbody>
</table>
```

**Key elements:**
- `<caption>` -- Descriptive title
- `<thead>`, `<tbody>`, `<tfoot>` -- Structural grouping
- `<th scope="col">` -- Column headers
- `<th scope="row">` -- Row headers
- `<td>` -- Data cells

### Step 3: Check Complex Tables

**For tables with multi-level headers:**
```html
<th id="region" scope="col">Region</th>
<td headers="region q1">$50k</td>
```

Use `id` + `headers` attribute to link data cells to multiple headers.

### Step 4: Check Sortable Tables

**Interactive headers:**
```html
<th scope="col" aria-sort="ascending">
  <button>Region <span aria-hidden="true">▲</span></button>
</th>
```

**Requirements:**
- `aria-sort="ascending|descending|none"`
- Keyboard accessible (button or link)
- Visual indicator (icon, not just color)
- Announce sort state to screen readers

### Step 5: Check ARIA Grid Pattern

For complex data grids with keyboard navigation:
```html
<div role="grid" aria-label="Monthly revenue">
  <div role="rowgroup">
    <div role="row">
      <div role="columnheader">Region</div>
      <div role="columnheader">Q1</div>
    </div>
  </div>
  <div role="rowgroup">
    <div role="row">
      <div role="rowheader">North</div>
      <div role="gridcell">$50k</div>
    </div>
  </div>
</div>
```

**Use only if:**
- Keyboard navigation required (arrow keys)
- Cell editing functionality
- Otherwise, prefer semantic `<table>`

### Step 6: Check Responsive Patterns

**Avoid:**
- `display: none` hiding columns (inaccessible)
- Horizontal scroll without indication

**Prefer:**
- Stack rows as cards on mobile
- Show/hide columns with accessible controls
- aria-label describing responsive behavior

### Step 7: Provide Remediation

For each issue:
- WCAG criterion (1.3.1 Info and Relationships)
- Table markup fix
- Code example (HTML or framework-specific)
- Screen reader testing notes

## Expected Output

- Table semantic markup assessment
- Header association verification
- Sortable table evaluation
- Responsive pattern review
- Code fixes with framework-specific examples
