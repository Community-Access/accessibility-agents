---
name: email-accessibility
description: HTML email accessibility reference. Email client rendering constraints, table-based layout patterns, accessible inline styles, MJML/Foundation/Maizzle framework patterns, dark mode adaptation, and image blocking fallbacks.
---

# Email Accessibility Skill

Reference data for HTML email accessibility under email client rendering constraints. Used by `email-accessibility` agent.

---

## Email Client Rendering Constraints

Email HTML operates under severe constraints compared to web browsers:

| Feature | Gmail | Outlook (Win) | Apple Mail | Yahoo | Outlook.com |
|---------|-------|--------------|------------|-------|-------------|
| Semantic HTML (`<nav>`, `<main>`) | Stripped | Stripped | Supported | Stripped | Stripped |
| `role` attributes | Stripped | Stripped | Supported | Stripped | Stripped |
| `aria-*` attributes | Stripped | Stripped | Supported | Stripped | Stripped |
| `<style>` blocks | Supported | Supported | Supported | Supported | Supported |
| External CSS | Stripped | Stripped | Stripped | Stripped | Stripped |
| JavaScript | Stripped | Stripped | Stripped | Stripped | Stripped |
| CSS Grid | Supported | Not supported | Supported | Supported | Supported |
| CSS Flexbox | Supported | Not supported | Supported | Supported | Supported |
| `<button>` element | Rendered | Rendered | Rendered | Rendered | Rendered |
| `tabindex` | Stripped | Stripped | Supported | Stripped | Stripped |

### Key Constraint: Outlook Desktop uses the Word rendering engine, not a browser engine

## Accessible Email Patterns

### Table-Based Layout (Required for Outlook)

```html
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
  <tr>
    <td align="center" style="padding: 20px;">
      <!-- Content here -->
    </td>
  </tr>
</table>
```

**Rules:**

- ALL layout tables MUST have `role="presentation"` to prevent screen readers from announcing table semantics
- Data tables (actual tabular data) should NOT have `role="presentation"` — they need proper `<th>`, `scope`, and `<caption>`
- Use `cellspacing="0" cellpadding="0" border="0"` on layout tables

### Images

```html
<img src="hero.jpg" alt="Product launch announcement: 50% off all subscriptions through March" width="600" height="300" style="display: block; max-width: 100%;">
```

**Rules:**

- Every `<img>` must have `alt` attribute
- Decorative images: `alt=""` (empty, not omitted)
- Set explicit `width` and `height` — prevents layout shifts when images are blocked
- Many email clients block images by default — alt text is the only fallback
- Style images with `display: block` to prevent gaps in Outlook
- Use `style="font-size: 14px; font-family: Arial, sans-serif; color: #333333;"` on the `<img>` tag — some clients display alt text using these styles

### Links

```html
<a href="https://example.com/subscribe" style="color: #005a9c; text-decoration: underline;">
  Subscribe to our accessibility newsletter
</a>
```

**Rules:**

- Link text must be descriptive (no "click here" or "read more")
- Always use `text-decoration: underline` — color alone can't distinguish links (WCAG 1.4.1)
- Include `style` attributes directly on `<a>` tags — some clients strip `<style>` blocks
- For CTA buttons, use the bulletproof button pattern (see below)

### Bulletproof Buttons (Work in All Clients)

```html
<table role="presentation" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td style="border-radius: 4px; background: #005a9c;">
      <a href="https://example.com/action" style="background: #005a9c; border: 15px solid #005a9c; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.1; text-align: center; text-decoration: none; display: block; border-radius: 4px; font-weight: bold;">
        <span style="color: #ffffff;">Get Started</span>
      </a>
    </td>
  </tr>
</table>
```

### Headings

- Use heading elements (`<h1>` through `<h6>`) for visual and semantic structure
- Maintain heading hierarchy (don't skip levels)
- Note: heading elements work in most email clients even where other semantic HTML is stripped

### Language

```html
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
```

- Always set `lang` attribute on `<html>` element
- Include `xmlns` for XHTML compatibility (some email clients require it)

## Dark Mode Adaptation

```html
<!-- Meta tag for dark mode support -->
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">

<style>
  @media (prefers-color-scheme: dark) {
    .email-body { background-color: #1a1a1a !important; }
    .text-content { color: #e0e0e0 !important; }
  }
</style>
```

**Rules:**

- Test contrast ratios in both light and dark modes
- Some clients invert colors automatically — use `data-ogsb="ignore"` for Outlook.com to prevent unwanted inversions
- Transparent PNGs work well in both modes; JPGs with white backgrounds look broken in dark mode

## Reading Order

- Email reading order follows the HTML source order (no CSS Grid reordering possible in email)
- Single-column layouts are most accessible — multi-column requires careful `dir="ltr"` and table cell ordering
- For RTL languages, use `dir="rtl"` on the `<html>` element and reverse table cell order

## Framework Patterns

### MJML

```html
<mj-image src="photo.jpg" alt="Description of the image" />
<mj-button href="https://example.com" background-color="#005a9c" color="#ffffff">
  Accessible Button Text
</mj-button>
```

### Foundation for Emails

```html
<img src="photo.jpg" alt="Description" class="float-center">
<button class="button large" href="https://example.com">
  <a href="https://example.com">Accessible Button Text</a>
</button>
```

## Email Accessibility Checklist

| Check | WCAG SC | Priority |
|-------|---------|----------|
| All layout tables have `role="presentation"` | 1.3.1 | Critical |
| All images have meaningful or empty `alt` | 1.1.1 | Critical |
| Link text is descriptive | 2.4.4 | Serious |
| Color contrast meets 4.5:1 | 1.4.3 | Serious |
| Language is set on `<html>` | 3.1.1 | Serious |
| Heading hierarchy is logical | 1.3.1 | Moderate |
| Links are underlined (not color-only) | 1.4.1 | Moderate |
| Dark mode contrast is verified | 1.4.3 | Moderate |
| Preheader text is meaningful | Best practice | Minor |
| Alt text styled for image-blocked view | Best practice | Minor |
