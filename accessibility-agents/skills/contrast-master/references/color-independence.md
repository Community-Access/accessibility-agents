# Contrast Master reference: Color Independence

Part of the `contrast-master` skill. Read this only when the task reaches these sections.

## Color Independence

Never convey information through color alone. Every color-coded element needs a secondary indicator.

### Status Indicators

```html
<!-- BAD: Color only -->
<span class="text-red-500">Error</span>
<span class="text-green-500">Success</span>

<!-- GOOD: Color plus text/icon -->
<span class="text-red-500">
  <svg aria-hidden="true"><!-- X icon --></svg>
  Error: Invalid email address
</span>
<span class="text-green-500">
  <svg aria-hidden="true"><!-- Check icon --></svg>
  Success: Changes saved
</span>
```

### Form Errors

- Red border alone is not sufficient
- Include error text associated with `aria-describedby`
- Include an icon or prefix ("Error:")
- Focus moves to first error field

### Charts and Data Visualization

- Use patterns, shapes, or labels in addition to color
- Direct labels on data points are better than color-coded legends
- If using color-coded legend, add pattern fills or distinct markers

### Links

- Links within body text must be visually distinct beyond color
- Underline is the most reliable indicator
- If not underlined, must have 3:1 contrast against surrounding text AND a non-color visual change on hover/focus
