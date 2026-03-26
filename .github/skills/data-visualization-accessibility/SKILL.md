---
name: data-visualization-accessibility
description: Accessible chart and data visualization patterns. Chart library accessibility APIs (D3, Chart.js, Highcharts, Recharts), SVG ARIA roles, data table fallbacks, keyboard interaction models, and color-safe palettes.
---

# Data Visualization Accessibility Skill

Reference data for making charts, graphs, dashboards, and interactive data visualizations accessible. Used by `data-visualization-accessibility` agent.

---

## Chart Accessibility by Type

### Bar/Column Charts

- Provide a text summary of the key takeaway (e.g., "Sales increased 40% in Q4")
- Include a data table alternative (visually hidden or toggleable)
- Each bar should be keyboard-focusable with a tooltip announcing the value
- Use patterns or textures in addition to color to distinguish series

### Line Charts

- Describe the trend in alt text (e.g., "Upward trend from January through June, then decline")
- Provide data table with all data points
- Keyboard navigation: Left/Right arrows move between data points, value announced on focus
- Use distinct line styles (solid, dashed, dotted) alongside colors

### Pie/Donut Charts

- Accompany with a data table showing percentages
- Each segment keyboard-focusable with percentage and label announced
- Use patterns/hatching — color-only distinction fails WCAG 1.4.1
- Consider: pie charts are generally poor for accessibility; a bar chart + table is often better

### Scatter Plots

- Provide summary statistics (mean, median, correlation) as text
- Data table with all points is essential
- Interactive exploration via keyboard may not be feasible for large datasets — prioritize the summary

### Treemaps / Heatmaps

- Provide hierarchical data table alternative
- Keyboard navigation through segments with value announcements
- Color scales must have sufficient contrast between adjacent levels

## SVG Accessibility Patterns

### Static Chart (Image-like)

```html
<figure>
  <svg role="img" aria-labelledby="chart-title chart-desc">
    <title id="chart-title">Monthly Revenue 2025</title>
    <desc id="chart-desc">Bar chart showing revenue from January through December.
      Revenue grew from $50K in January to $120K in December with a dip in July.</desc>
    <!-- chart elements -->
  </svg>
  <figcaption>Figure 1: Monthly Revenue 2025. <a href="#revenue-table">View data table</a></figcaption>
</figure>
```

### Interactive Chart

```html
<svg role="application" aria-roledescription="interactive chart" aria-label="Monthly Revenue">
  <g role="list" aria-label="Revenue data points">
    <rect role="listitem" tabindex="0" aria-label="January: $50,000" .../>
    <rect role="listitem" tabindex="0" aria-label="February: $55,000" .../>
  </g>
</svg>
<div aria-live="polite" class="sr-only" id="chart-announcements"></div>
```

### Decorative Charts

```html
<svg aria-hidden="true" focusable="false">
  <!-- decorative background chart -->
</svg>
```

## Chart Library Accessibility APIs

### Highcharts

```javascript
Highcharts.chart('container', {
  accessibility: {
    enabled: true,
    description: 'Chart showing quarterly revenue growth',
    point: {
      valueDescriptionFormat: '{point.name}: {point.y} dollars'
    },
    keyboardNavigation: {
      enabled: true,
      order: ['series', 'zoom', 'rangeSelector', 'legend', 'chartMenu']
    }
  },
  // Highcharts has built-in sonification for data
  sonification: {
    enabled: true
  }
});
```

**Highcharts built-in a11y features:**

- Automatic `<table>` fallback generation
- Keyboard navigation between data points
- Screen reader announcements for each point
- Sonification (data as sound)
- High contrast mode support

### Chart.js

```javascript
new Chart(ctx, {
  type: 'bar',
  data: { /* ... */ },
  options: {
    plugins: {
      // Chart.js has limited built-in accessibility
      // Use chartjs-plugin-a11y-legend for legend accessibility
      // Use chartjs-plugin-datalabels for visible data values
    }
  }
});
// Chart.js renders to <canvas> — provide a fallback table or aria-label on canvas
```

**Chart.js limitations:**

- Canvas-based — no DOM elements for screen readers to traverse
- Must provide `<canvas aria-label="..." role="img">` or a fallback `<table>`
- No built-in keyboard navigation — requires custom implementation

### D3.js

D3 renders to SVG — accessibility must be manually implemented:

```javascript
// Add ARIA to each data element
bars.attr('role', 'listitem')
    .attr('tabindex', '0')
    .attr('aria-label', d => `${d.name}: ${d.value} units`);

// Add keyboard navigation
bars.on('keydown', (event, d) => {
  if (event.key === 'ArrowRight') { /* focus next bar */ }
  if (event.key === 'ArrowLeft') { /* focus previous bar */ }
});
```

### Recharts (React)

```jsx
<BarChart data={data} accessibilityLayer>
  <Bar dataKey="value" />
</BarChart>
```

**Recharts:** `accessibilityLayer` prop adds basic ARIA attributes. Supplement with a data table.

## Data Table Fallback Template

```html
<details>
  <summary>View data table</summary>
  <table id="revenue-table">
    <caption>Monthly Revenue 2025</caption>
    <thead>
      <tr>
        <th scope="col">Month</th>
        <th scope="col">Revenue ($)</th>
        <th scope="col">Change (%)</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>January</td><td>50,000</td><td>—</td></tr>
      <tr><td>February</td><td>55,000</td><td>+10%</td></tr>
    </tbody>
  </table>
</details>
```

## Color-Safe Palettes

Palettes that remain distinguishable under common forms of color vision deficiency:

### Wong Palette (8 colors — CVD safe)

| Color | Hex | Use |
|-------|-----|-----|
| Black | #000000 | Text, borders |
| Orange | #E69F00 | Data series 1 |
| Sky Blue | #56B4E9 | Data series 2 |
| Bluish Green | #009E73 | Data series 3 |
| Yellow | #F0E442 | Data series 4 |
| Blue | #0072B2 | Data series 5 |
| Vermillion | #D55E00 | Data series 6 |
| Reddish Purple | #CC79A7 | Data series 7 |

### Rules for Color in Charts

- Never use red/green as the only distinction (deuteranopia affects ~8% of males)
- Always add a secondary visual channel: pattern, shape, label, or position
- Test with CVD simulation tools (Sim Daltonism, Chrome DevTools Emulate vision deficiencies)
- Ensure adjacent colors in a chart have sufficient contrast with each other (not just against white)

## Keyboard Interaction Model

### Single-Series Chart

| Key | Action |
|-----|--------|
| Tab | Enter/exit chart |
| Left/Right Arrow | Move between data points |
| Up/Down Arrow | Move between series (if multiple) |
| Enter/Space | Show detail or drill down |
| Escape | Exit drill-down or chart |
| Home/End | Jump to first/last data point |

### Dashboard Navigation

| Key | Action |
|-----|--------|
| Tab | Move between chart widgets |
| Enter | Enter interactive chart |
| Escape | Exit back to dashboard level |
| Arrow keys | Navigate within active chart |
