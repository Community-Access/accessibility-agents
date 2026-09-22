# Alt Text and Headings reference: Alternative Text -- The Rules

Part of the `alt-text-headings` skill. Read this only when the task reaches these sections.

## Alternative Text -- The Rules

### Rule 1: Every `<img>` Gets an `alt` Attribute

No exceptions. The question is what goes in it.

```html
<!-- Meaningful image: describe the content -->
<img src="team-photo.jpg" alt="The engineering team at the 2025 company retreat, standing in front of the main office">

<!-- Decorative image: empty alt -->
<img src="decorative-swirl.png" alt="">

<!-- Linked image: describe the destination -->
<a href="/profile">
  <img src="avatar.jpg" alt="Your profile">
</a>
```

### Rule 2: Describe Content, Not Appearance

```html
<!-- BAD: Describes what it looks like -->
<img src="graph.png" alt="A blue bar chart with 5 bars">

<!-- GOOD: Describes what it communicates -->
<img src="graph.png" alt="Quarterly revenue: Q1 $2M, Q2 $2.5M, Q3 $3.1M, Q4 $3.8M, Q5 $4.2M">

<!-- BAD: Redundant with context -->
<h2>Our CEO</h2>
<img src="ceo.jpg" alt="Photo of our CEO">

<!-- GOOD: Adds information -->
<h2>Our CEO</h2>
<img src="ceo.jpg" alt="Sarah Chen speaking at the 2025 developer conference">
```

### Rule 3: Functional Images Describe the Action

When an image is inside a link or button, the alt text describes where it goes or what it does, not what the image looks like.

```html
<!-- Logo that links to home -->
<a href="/">
  <img src="logo.svg" alt="Acme Corp home page">
</a>

<!-- Social media icon link -->
<a href="https://twitter.com/acme">
  <img src="twitter-icon.png" alt="Acme Corp on Twitter">
</a>

<!-- Image button -->
<button>
  <img src="print-icon.png" alt="Print this page">
</button>
```

### Rule 4: Decorative Images Are Hidden

Images that add no information -- visual flourishes, spacers, backgrounds, dividers:

```html
<img src="divider.png" alt="" aria-hidden="true">
<img src="background-pattern.png" alt="" role="presentation">
```

Both `alt=""` and `role="presentation"` work. Use `alt=""` as the primary method. Add `aria-hidden="true"` as reinforcement for SVGs and complex decorative elements.

### Rule 5: Complex Images Need Long Descriptions

For charts, diagrams, infographics, and data visualizations that cannot be adequately described in a short alt text:

```html
<!-- Method 1: Adjacent visible description -->
<figure>
  <img src="org-chart.png" alt="Company organizational chart. Full description below.">
  <figcaption>
    <details>
      <summary>Full description of organizational chart</summary>
      <p>The CEO reports to the board. Three VPs report to the CEO: VP Engineering (5 teams, 47 people), VP Product (3 teams, 18 people), VP Marketing (4 teams, 22 people)...</p>
    </details>
  </figcaption>
</figure>

<!-- Method 2: aria-describedby for longer descriptions -->
<img src="flowchart.png" alt="User registration flow" aria-describedby="flow-desc">
<div id="flow-desc" class="visually-hidden">
  Step 1: User enters email. Step 2: System checks if email exists. If yes, show login prompt. If no, proceed to step 3...
</div>
```

## SVG Accessibility

### Inline SVGs

```html
<!-- Meaningful inline SVG -->
<svg role="img" aria-labelledby="svg-title svg-desc">
  <title id="svg-title">Monthly Sales</title>
  <desc id="svg-desc">Bar chart showing sales increasing from $10K in January to $45K in June</desc>
  <!-- SVG content -->
</svg>

<!-- Decorative inline SVG -->
<svg aria-hidden="true" focusable="false">
  <!-- SVG content -->
</svg>
```

Requirements for meaningful SVGs:

- `role="img"` on the `<svg>` element
- `<title>` element as the first child (acts as the accessible name)
- `<desc>` element for longer descriptions
- `aria-labelledby` referencing both title and desc IDs
- Do NOT add `focusable="false"` on meaningful SVGs

Requirements for decorative SVGs:

- `aria-hidden="true"` on the `<svg>` element
- `focusable="false"` to prevent IE/Edge focus issues
- No `<title>` or `<desc>` elements

### SVGs in Buttons and Links

```html
<!-- Icon with visible text: hide the SVG -->
<button>
  <svg aria-hidden="true" focusable="false">...</svg>
  Save document
</button>

<!-- Icon-only button: label the button, hide the SVG -->
<button aria-label="Close dialog">
  <svg aria-hidden="true" focusable="false">...</svg>
</button>

<!-- Icon-only link -->
<a href="/settings" aria-label="Settings">
  <svg aria-hidden="true" focusable="false">...</svg>
</a>
```

Never give the SVG an accessible name AND label the parent button/link -- that creates double announcements.
