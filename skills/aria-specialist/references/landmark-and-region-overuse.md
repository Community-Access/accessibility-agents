# ARIA Specialist reference: Landmark and Region Overuse

Part of the `aria-specialist` skill. Read this only when the task reaches these sections.

## Landmark and Region Overuse

Landmarks help screen reader users navigate between major sections of a page. Too many landmarks create noise and reduce their usefulness. Per the W3C ARIA Authoring Practices Guide: a `region` landmark is for content "sufficiently important for users to be able to navigate to the section." Most `<section>` elements on a typical long page should NOT be region landmarks -- heading navigation (H key) already provides section discovery.

### When `<section>` Creates a Region Landmark

`<section>` with an `aria-label` or `aria-labelledby` creates a `region` landmark. Without a label, it is just a generic grouping element with no landmark role. Only label sections that represent genuinely important navigable destinations beyond what heading navigation provides.

### `aria-labelledby` vs `aria-label` on Sections with Headings

The APG states: "If an area begins with a heading element (e.g. h1-h6) it can be used as the label for the area using the `aria-labelledby` attribute. If an area requires a label and does not have a heading element, provide a label using the `aria-label` attribute."

This means:

1. **When a section has a heading, prefer `aria-labelledby` pointing to the heading over `aria-label`.** This links the landmark name to the visible heading text, creating one consistent identity rather than two separate announcements.

2. **Never use `aria-label` with text that is different from the section's heading.** Screen reader users navigating by landmarks hear the `aria-label` text; navigating by headings they hear the heading text. If these differ, the section appears to be two different things.

3. **If `aria-label` would duplicate the heading text exactly, the `aria-label` is redundant -- use `aria-labelledby` instead.** Duplicating the same string in two places creates a maintenance burden and risks drift.

```html
<!-- BAD: aria-label says "Upcoming workshop" but heading says "GIT Going with GitHub" -->
<!-- Screen reader landmark nav: "Upcoming workshop region" -->
<!-- Screen reader heading nav: "GIT Going with GitHub, heading level 2" -->
<!-- User thinks these are two different sections -->
<section aria-label="Upcoming workshop">
  <h2>GIT Going with GitHub</h2>
</section>

<!-- GOOD: aria-labelledby links to the heading, one consistent name -->
<section aria-labelledby="workshop-heading">
  <h2 id="workshop-heading">GIT Going with GitHub</h2>
</section>

<!-- ALSO GOOD: no landmark at all if heading navigation is sufficient -->
<section>
  <h2>GIT Going with GitHub</h2>
</section>
```

### What to Flag

- `<section aria-label="X">` where the section also has a heading -- should use `aria-labelledby` pointing to the heading instead
- `<section aria-label="X">` where "X" says something different from the section's heading -- creates confusion between landmark and heading navigation
- `<section aria-label="...">` wrapping decorative content, stats bars, banners, or content that does not warrant landmark navigation
- `role="region"` on code snippets, install command blocks, demo panels, or other non-navigable content already inside `<main>` -- these are not navigable destinations and heading navigation (H key) already provides access
- Promotional or ephemeral content (event banners, announcements, CTAs) wrapped in a region landmark -- these are not page structure; they are transient content that should not pollute the landmark list
- Pages exceeding the canonical landmark count. A typical single-page informational site needs only 5-6 landmarks: banner, navigation(s), main, contentinfo. Add region landmarks only for genuinely important navigable sections (e.g., a search results panel or a user dashboard sidebar)
- `<div>` given `role="region"` for non-navigable content
- Fixes that change `<div>` to `<section>` just to satisfy "aria-label requires a role" when the real fix is to remove the `aria-label`
- Nested `<section aria-label>` inside a parent section that already has a heading covering the same content -- the inner section rarely needs its own landmark

### `role="region"` Antipatterns

The following are common misuses. Content inside `<main>` is already in a landmark -- adding `role="region"` to subdivisions creates unnecessary clutter:

```html
<!-- BAD: install commands are not navigable destinations -->
<div class="install-block" role="region" aria-label="macOS install command">
  <pre><code>curl -sSL ... | bash</code></pre>
</div>

<!-- BAD: code demo panels are not navigable destinations -->
<div class="demo-panel" role="region" aria-label="Inaccessible code example">
  <h3>Before</h3>
  <pre><code>...</code></pre>
</div>

<!-- GOOD: remove role and aria-label, let heading navigation handle discovery -->
<div class="install-block">
  <pre><code>curl -sSL ... | bash</code></pre>
</div>

<div class="demo-panel">
  <h3>Before</h3>
  <pre><code>...</code></pre>
</div>
```

### The Fix for Unnecessary Regions

If a `<section>` has `aria-label` but the content is not a major navigable section:

```html
<!-- BEFORE: unnecessary region landmark -->
<section class="stats-bar" aria-label="Project statistics">
  ...
</section>

<!-- AFTER: no landmark clutter -->
<div class="stats-bar">
  ...
</div>
```

Remove `aria-label` and change to `<div>`, or keep `<section>` without `aria-label` if the grouping still makes semantic sense.

## Accessible Names and Descriptions

Per the W3C APG "Providing Accessible Names and Descriptions" guide, these are the cardinal rules for naming interactive elements.

### Five Cardinal Rules

1. **Heed warnings:** Never use a naming technique the ARIA specification warns against for that role
2. **Prefer visible text:** Use techniques that source the name from visible text (native HTML labels, `aria-labelledby`) over invisible text (`aria-label`) whenever possible
3. **Prefer native techniques:** Use native HTML labeling (`<label>`, `<caption>`, `<legend>`, `<figcaption>`) before ARIA naming
4. **Avoid browser fallback:** Do not rely on `title` or `placeholder` as the accessible name -- browsers use these as fallbacks but they are unreliable and often invisible
5. **Compose brief useful names:** Names should be concise (1-3 words ideally), describe function not form, start with the distinguishing word, and never include the role name

### Name Calculation Precedence

Browsers compute the accessible name in this order (first match wins):

1. `aria-labelledby` (references other visible elements -- highest priority)
2. `aria-label` (hidden string attribute)
3. Native HTML mechanisms (`<label>`, `<caption>`, `<legend>`, `alt`, `<title>` inside SVG)
4. Child text content (for roles that allow naming from contents: button, link, tab, menuitem)
5. `title` attribute (fallback -- avoid relying on this)
6. `placeholder` (last resort fallback -- never rely on this)

### WARNING: `aria-label` Hides Descendant Content

When `aria-label` is applied to an element whose role supports "naming from contents" (like `heading`, `button`, `link`), the `aria-label` **replaces** all descendant text content for screen readers. The descendants become invisible to AT.

```html
<!-- BAD: screen reader says "Widget usage" only, descendant content is hidden -->
<h2 aria-label="Widget usage">
  <span>37</span>
  <span>widgets deployed this month</span>
</h2>

<!-- GOOD: screen reader reads the actual content -->
<h2>37 widgets deployed this month</h2>
```

Do not use `aria-label` on headings, paragraphs, or other content containers -- use it only on interactive elements that need a name different from their visible text.

### Composing Effective Names

- **Function, not form:** "Submit" not "Green button at bottom". "Close" not "X icon"
- **Distinguishing word first:** "Delete account" not "Account deletion action"
- **Brief:** 1-3 words when possible. "Save" or "Save draft" -- not "Click this button to save your draft document to the server"
- **No role name:** "Close" not "Close button" (screen reader already announces "button")
- **Unique:** Multiple elements with the same name but different functions confuse screen reader users. "Edit profile" and "Edit preferences" not two "Edit" buttons
- **Capital letter:** Start with a capital letter for screen reader pronunciation consistency

### Description Techniques

Descriptions provide supplementary information beyond the name:

- `aria-describedby` -- references visible elements providing additional context
- `aria-description` -- inline description string (newer, less supported)
- `title` attribute -- tooltip text, used as description if name comes from another source

```html
<button aria-label="Delete" aria-describedby="delete-warning">
  <svg aria-hidden="true">...</svg>
</button>
<p id="delete-warning" class="visually-hidden">This action cannot be undone</p>
```
