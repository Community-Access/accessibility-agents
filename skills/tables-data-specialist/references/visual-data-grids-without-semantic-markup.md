# Tables and Data Specialist reference: Visual Data Grids Without Semantic Markup

Part of the `tables-data-specialist` skill. Read this only when the task reaches these sections.

## Visual Data Grids Without Semantic Markup

CSS grid and flexbox layouts often display structured data (stats, metrics, KPIs, dashboards, pricing cards) that *looks* tabular or structured visually but uses only `<div>`/`<span>` elements. Screen readers linearize these into undifferentiated text.

### The Problem

```html
<!-- PROBLEMATIC: looks structured visually, but screen readers read
     "47 Specialized Agents 3 Platforms 52 Prompts" as one long line -->
<div class="stats-grid">
  <div>
    <span class="stat-number">47</span>
    <span class="stat-label">Specialized Agents</span>
  </div>
  <div>
    <span class="stat-number">3</span>
    <span class="stat-label">Platforms</span>
  </div>
</div>
```

### The Fix: Use `<dl>` for Key-Value Pairs

When data presents label-value pairs (stat dashboards, profile fields, spec lists, pricing highlights):

```html
<dl class="stats-grid">
  <div class="stat-item">
    <dt class="stat-label">Specialized Agents</dt>
    <dd class="stat-number">47</dd>
  </div>
  <div class="stat-item">
    <dt class="stat-label">Platforms</dt>
    <dd class="stat-number">3</dd>
  </div>
</dl>
```

Use CSS `order: -1` on `<dd>` if the value should display above the label visually while keeping the label first in DOM order for screen readers.

### When to Use `<table>` Instead

If the data has multiple dimensions (rows AND columns), use a proper `<table>`. `<dl>` is for flat key-value lists.

### What to Flag

- Any CSS grid or flexbox container with 3+ child elements where each child has a "label" and "value" pattern using only `<div>`/`<span>`
- Stats bars, KPI dashboards, pricing highlights, feature counts, metric summaries using only generic elements
- Any visual grid of structured data without `<dl>`, `<table>`, or ARIA table/grid roles

## Validation Checklist

### Structure

1. Is `<table>` used for tabular data (not layout)?
2. Does the table have a `<caption>` or `aria-label`?
3. Are header cells `<th>` (not styled `<td>`)?
4. Do column headers have `scope="col"` and row headers `scope="row"`?
5. Are `<thead>`, `<tbody>`, and `<tfoot>` used correctly?
6. For complex tables: are `headers` attributes correct?
7. For merged cells: do `colspan`/`rowspan` have correct header associations?

### Sorting

8. Do sortable columns have `aria-sort` attributes?
9. Is `aria-sort` updated when sort changes?
10. Are sort buttons inside `<th>` elements?
11. Is the sort change announced (live region or `aria-sort` update)?

### Interactive

12. Do interactive tables use `role="grid"` appropriately?
13. Do interactive elements in cells have descriptive `aria-label` with context?
14. Does the select-all checkbox handle the indeterminate state?
15. Are row selections indicated with `aria-selected`?
16. Are selection count changes announced?

### Responsive

17. Is the table scrollable on mobile with `role="region"` and `tabindex="0"`?
18. Or does the stacked pattern retain header context per cell?
19. Are hidden columns properly hidden (not just `aria-hidden`)?

### Pagination

20. Does pagination have `aria-current="page"` on the current page?
21. Are page changes announced via live region?
22. Is focus managed after page changes?
23. Is the "showing X of Y" text linked via `aria-describedby`?

### General

24. Are empty states communicated with descriptive messages?
25. Are layout tables avoided (or marked with `role="presentation"`)?
26. Do CSS grid/flexbox layouts displaying structured data use `<dl>`, `<table>`, or ARIA roles (not bare `<div>`/`<span>`)?

## Common Mistakes You Must Catch

- CSS grid/flexbox layouts displaying key-value data (stats, metrics, KPIs) with only `<div>`/`<span>` -- use `<dl>`/`<dt>`/`<dd>` for label-value pairs
- Using `<div>` grids styled to look like tables - screen readers cannot navigate them as tables
- `<td>` elements styled bold to look like headers - use `<th>` with `scope`
- Missing `<caption>` - screen readers announce "table" with no description
- `scope` attribute on `<td>` elements (only valid on `<th>`)
- `aria-sort` on all columns simultaneously instead of just the active sort column
- Sort buttons outside the `<th>` (breaks header/button association)
- `role="grid"` on non-interactive data tables (adds unnecessary complexity for screen readers)
- Responsive tables that hide columns with `display: none` but don't hide from screen readers
- Inline edit controls without `aria-label` context ("Edit" button in 50 rows - edit what?)
- Pagination without `aria-current="page"` - screen reader hears identical "1", "2", "3" buttons
- Empty tables with no message - user doesn't know if data is loading or missing

## Structured Output for Sub-Agent Use

When invoked as a sub-agent by the web-accessibility-wizard, consume the `## Web Scan Context` block provided at the start of your invocation - it specifies the page URL, framework, audit method, thoroughness level, and disabled rules. Honor every setting in it.

If the audit context indicates no tables are present, return an empty findings summary immediately and explain no table audit was needed. Do not spend time searching for tables that don't exist.

Return each issue in this exact structure so the wizard can aggregate, deduplicate, and score results:

```text
### [N]. [Brief one-line description]

- **Severity:** [critical | serious | moderate | minor]
- **WCAG:** [criterion number] [criterion name] (Level [A/AA/AAA])
- **Confidence:** [high | medium | low]
- **Impact:** [What a real user with a disability would experience - one sentence]
- **Location:** [file path:line or table component name]

**Current code:**
[code block showing the problem]

**Recommended fix:**
[code block showing the corrected code in the detected framework syntax]
```

**Confidence rules:**

- **high** - definitively wrong: `<table>` without `<caption>` or `aria-label`, `<th>` without `scope`, sortable column without `aria-sort`
- **medium** - likely wrong: table structure appears correct but may have header/data association issues that need browser testing to confirm
- **low** - possibly wrong: complex `headers`/`id` attribute relationships that need screen reader testing to verify

### Output Summary

End your invocation with this summary block (used by the wizard for / progress announcements):

```text
## Tables Specialist Findings Summary
- **Issues found:** [count]
- **Critical:** [count] | **Serious:** [count] | **Moderate:** [count] | **Minor:** [count]
- **High confidence:** [count] | **Medium:** [count] | **Low:** [count]
```
