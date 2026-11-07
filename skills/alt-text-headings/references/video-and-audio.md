# Alt Text and Headings reference: Video and Audio

Part of the `alt-text-headings` skill. Read this only when the task reaches these sections.

## Video and Audio

### Video

```html
<video controls aria-label="Product demo walkthrough">
  <source src="demo.mp4" type="video/mp4">
  <track kind="captions" src="captions.vtt" srclang="en" label="English captions" default>
  <track kind="descriptions" src="descriptions.vtt" srclang="en" label="Audio descriptions">
  Your browser does not support video.
</video>
```

Requirements:

- Captions for all spoken content (WCAG 1.2.2)
- Audio descriptions for important visual content not described in the audio track (WCAG 1.2.5)
- `controls` attribute so users can pause, stop, adjust volume
- No autoplay (or muted autoplay with visible play/pause control)
- Transcript recommended as an alternative
- `aria-label` or visible heading to identify the video

### Audio

```html
<audio controls aria-label="Episode 42: Accessibility in 2025">
  <source src="podcast.mp3" type="audio/mpeg">
</audio>
<a href="transcript-ep42.html">Read transcript for Episode 42</a>
```

Requirements:

- Transcript for all audio content (WCAG 1.2.1)
- `controls` attribute
- No autoplay

## Figures and Figcaptions

Use `<figure>` and `<figcaption>` for images with captions:

```html
<figure>
  <img src="dashboard.png" alt="Analytics dashboard showing 45% increase in mobile traffic over 6 months">
  <figcaption>Figure 3: Mobile traffic growth from January to June 2025</figcaption>
</figure>
```

**Critical rules per W3C Images Tutorial:**

- The `<img>` inside a `<figure>` still MUST have `alt` text -- `<figcaption>` does NOT replace `alt`
- `<figcaption>` provides a visible caption for ALL users; `alt` provides the text alternative for screen readers
- They should complement each other but not be identical (avoids double-reading)
- `<figcaption>` must be the first or last child of `<figure>`
- A `<figure>` can contain content other than images (code blocks, quotes, tables)

## Heading Structure -- The Rules

### Rule 1: Exactly One H1 Per Page

```html
<!-- GOOD -->
<h1>Shopping Cart</h1>
<h2>Your Items</h2>
<h3>Widget Pro</h3>
<h2>Order Summary</h2>

<!-- BAD: Multiple H1s -->
<h1>My Store</h1>
<h1>Shopping Cart</h1>
```

The H1 is the page title. It describes the purpose of the entire page. There is exactly one.

### Rule 2: Never Skip Levels

```html
<!-- GOOD -->
<h1>Products</h1>
  <h2>Electronics</h2>
    <h3>Laptops</h3>
    <h3>Phones</h3>
  <h2>Clothing</h2>
    <h3>Shirts</h3>

<!-- BAD: Skipped H2 -->
<h1>Products</h1>
  <h3>Electronics</h3>  <!-- WRONG: Jumped from H1 to H3 -->
```

Screen reader users navigate by headings. Skipped levels make them think they missed content.

### Rule 3: Headings Can Return to Higher Levels

```html
<!-- This is perfectly valid -->
<h1>Blog</h1>
  <h2>Latest Post</h2>
    <h3>Introduction</h3>
    <h3>Main Points</h3>
  <h2>Previous Post</h2>   <!-- Returning to H2 is fine -->
    <h3>Summary</h3>
```

Going from H3 back to H2 is correct -- it starts a new section at the H2 level.

### Rule 4: Never Choose Heading Level for Visual Appearance

```html
<!-- BAD: Using H4 because it "looks right" -->
<h4>Welcome to our site</h4>  <!-- Should be H1 if it's the page heading -->

<!-- GOOD: Use CSS for visual appearance -->
<h1 class="text-lg font-normal">Welcome to our site</h1>
```

Heading level communicates document structure, not visual design. Use CSS to control how headings look.

### Rule 5: Headings Must Be Descriptive

```html
<!-- BAD -->
<h2>Section 1</h2>
<h2>More Info</h2>
<h2>Details</h2>

<!-- GOOD -->
<h2>Pricing Plans</h2>
<h2>Customer Testimonials</h2>
<h2>Frequently Asked Questions</h2>
```

Screen reader users can pull up a list of all headings on the page. "Section 1" in a list is useless.

### Rule 6: Modal Headings Start at H2

```html
<!-- Page (behind modal) -->
<h1>Dashboard</h1>

<!-- Modal -->
<dialog>
  <h2>Settings</h2>           <!-- H2, not H1 -->
    <h3>Notifications</h3>
    <h3>Privacy</h3>
</dialog>
```

The page H1 remains the H1. Modal content is subordinate.
