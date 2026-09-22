# data-visualization-accessibility — Data Visualization Accessibility Specialist

> Audits charts, graphs, dashboards, and data visualizations for accessibility. Covers SVG ARIA patterns, data table alternatives, color-safe palettes, keyboard interaction models, and library-specific APIs (Highcharts, Chart.js, D3, Recharts). Uses the Chartability framework.

## Features

- Audits SVG charts for correct ARIA roles, labels, and descriptions
- Validates data table alternatives for every visualization
- Reviews color palettes for color vision deficiency safety
- Checks keyboard interaction on interactive charts (navigation, selection, drill-down)
- Provides library-specific guidance for Highcharts, Chart.js, D3, and Recharts
- Applies the Chartability testing framework for comprehensive evaluation

## When to Use It

- Building or reviewing any chart, graph, or dashboard component
- Adding keyboard navigation to interactive visualizations
- Choosing accessible color palettes for data series
- Ensuring screen readers can convey the key message of a chart
- Auditing a data dashboard with multiple visualization types

## How It Works

1. **Library detection** - Identifies the charting library and its accessibility API surface
2. **Text alternative audit** - Checks each chart for a text description or equivalent data table
3. **SVG ARIA audit** - Validates `role`, `aria-label`, `aria-labelledby`, and group structure on SVG elements
4. **Color audit** - Tests palette against color vision deficiency simulations (deuteranopia, protanopia, tritanopia)
5. **Keyboard audit** - Checks that interactive charts support arrow key navigation, Enter/Space activation, and Escape to exit
6. **Chartability evaluation** - Applies the Chartability heuristics across all critical categories

## Handoffs

Each direction, with its agent and when.

| Direction | Agent | When |
|-----------|-------|------|
| Receives from | accessibility-lead | When data visualizations are detected during a web audit |
| Hands off to | accessibility-lead | When general web accessibility issues are found beyond visualizations |
| Hands off to | contrast-master | When chart color contrast needs detailed verification |
| Hands off to | keyboard-navigator | When chart keyboard interaction patterns need deeper review |

## Sample Usage

```text
@data-visualization-accessibility Audit this D3 bar chart for screen reader accessibility

@data-visualization-accessibility Check our dashboard's color palette for color blindness safety

@data-visualization-accessibility Review keyboard navigation in our Highcharts scatter plot
```

## Related

- [accessibility-lead](./accessibility-lead.md) - Coordinates full web accessibility audits
- [contrast-master](./contrast-master.md) - Color contrast verification for chart elements and series
- [keyboard-navigator](./keyboard-navigator.md) - Keyboard interaction patterns for interactive charts
- [alt-text-headings](./alt-text-headings.md) - Text alternatives and descriptions for complex images
