---
name: review-alt-headings
description: Review alternative text and heading structure for web applications. Covers images, icons, SVGs, videos, charts, and heading hierarchy. Can analyze images visually.
mode: agent
agent: alt-text-headings
tools:
  - askQuestions
  - readFile
  - editFiles
  - visionAnalyzer
---

# Alt Text & Heading Structure Review

Review images, alt text, heading hierarchy, and document structure for accessibility compliance.

## Files to Review

**Path:** `${input:files}`

## Instructions

### Step 1: Gather Context

Ask the user:

1. **Content type** -- Page with images, icon library, chart/graph, video content?
2. **Image purpose** -- Informative, decorative, functional (buttons/links), complex (charts)?
3. **Framework** -- React, Vue, plain HTML, or image component library?

### Step 2: Review Alt Text

For each image/icon/SVG:

1. **Check for alt attribute** -- Present on `<img>` elements?
2. **Decorative vs informative** -- Should it have `alt=""` or descriptive text?
3. **Alt text quality** -- Meaningful, concise, not redundant with surrounding text?
4. **Complex images** -- Charts/graphs need longer descriptions (aria-describedby)?
5. **Icons** -- Functional icons have labels, decorative icons have `aria-hidden="true"`?

**Use vision analysis tool** to compare alt text against actual image content.

### Step 3: Review Heading Structure

1. **H1 present and unique** -- Exactly one `<h1>` per page?
2. **No skipped levels** -- Don't jump from H2 to H4
3. **Logical hierarchy** -- Headings reflect document structure?
4. **Heading text descriptive** -- "Introduction" not just "Section 1"?

### Step 4: Review Landmarks

1. **Semantic structure** -- `<header>`, `<nav>`, `<main>`, `<footer>`, `<aside>`?
2. **ARIA landmarks** -- `role="banner"`, `role="navigation"`, etc. if needed?
3. **Landmark labels** -- Multiple navs have unique `aria-label`?

### Step 5: Provide Remediation

For each issue:
- WCAG criterion violated (1.1.1, 2.4.1, 2.4.6)
- Code example showing fix
- Alt text suggestions (for images)
- Document structure improvements

## Expected Output

- Alt text evaluation for all images
- Heading hierarchy assessment
- Landmark structure review
- Code fixes with framework-specific examples
