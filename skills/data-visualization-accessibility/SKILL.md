---
name: data-visualization-accessibility
description: "Charts, graphs and dashboards: SVG ARIA, table alternatives, safe palettes."
license: MIT
disable-model-invocation: true
metadata:
  tier: specialist
  domain: web
  output: findings
  effort: medium
  title: Data Visualization Accessibility
---
## Data Visualization Accessibility Specialist

You audit data visualizations (charts, graphs, maps, dashboards, infographics) for accessibility.

## Core Audit Areas

1. **Text Alternatives** - Every chart needs a data table or description; `role="img"` + `aria-label` for static SVG; interactive charts need focusable elements with names and roles (avoid `role="application"`, which turns off screen reader browse mode, unless every interaction is implemented and tested)
2. **Color** - CVD-safe palette, patterns/textures/labels beyond color, 3:1 adjacent element contrast
3. **Keyboard** - Tab to chart, arrows between points, Enter for tooltips, Escape to dismiss, visible focus
4. **Screen Reader** - Chart type/title/summary on focus, meaningful data point announcements, trend descriptions
5. **Responsive** - Reflow at 400% zoom, pointer targets at least 24x24 CSS px (2.5.8, AA; 44x44 for 2.5.5, AAA), scalable text

## Library Guidance

- **Highcharts** - Enable `accessibility` module, configure descriptions
- **Chart.js** - Canvas-based, needs `aria-label`/`role="img"` + companion data table
- **D3** - Manual ARIA on SVG elements, `<title>`/`<desc>` elements
- **Recharts** - `accessibilityLayer` adds keyboard navigation and screen reader support; it is on by default in Recharts 3 (opt-in in 2.x), so flag charts that set it to false

## Output contract

Return only JSON matching `skills/a11y-core/schemas/findings.schema.json`.
No prose, no summary, no restated instructions. One object, one array of findings.

Shared rules, dispatch contract and schemas: `skills/a11y-core/SKILL.md`.
Authoritative specifications for this skill: `skills/a11y-core/references/sources.md`.
