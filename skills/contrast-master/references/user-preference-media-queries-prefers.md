# Contrast Master reference: User Preference Media Queries (`prefers-*`)

Part of the `contrast-master` skill. Read this only when the task reaches these sections.

## User Preference Media Queries (`prefers-*`)

Modern CSS provides media queries that detect user preferences at the OS level. Respecting these preferences is required for WCAG conformance and makes interfaces genuinely adaptive.

### `prefers-reduced-motion` (WCAG 2.3.3)

Already covered above. Additional guidance:

- Do NOT remove animations entirely if they convey meaning (e.g., a loading spinner). Instead, simplify them (crossfade instead of slide, instant instead of eased).
- Scroll-triggered animations, parallax effects, and auto-advancing carousels must all be disabled.
- JavaScript: check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` before starting JS-driven animations.
- Frameworks: React `framer-motion` supports `reducedMotion="user"`. CSS-based animation libraries should be wrapped in the media query.

```js
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (!prefersReducedMotion) {
  element.animate([/* keyframes */], { duration: 300 });
}
```

### `prefers-contrast` (WCAG 1.4.11)

Users who need higher contrast set this in their OS (macOS "Increase contrast", Windows "Contrast themes"). Respect it.

Values: `more` | `less` | `custom` | `no-preference`

```css
/* Increase border and text contrast for users who request it */
@media (prefers-contrast: more) {
  :root {
    --border-color: #000000;
    --text-secondary: #1a1a1a; /* Upgrade from gray to near-black */
    --bg-subtle: #f5f5f5;      /* Lighten subtle backgrounds */
  }

  /* Make borders more prominent */
  button, input, select, textarea {
    border: 2px solid #000000;
  }

  /* Remove semi-transparent overlays */
  .overlay {
    background-color: #000000;
    opacity: 1;
  }
}

/* Some users prefer lower contrast (e.g., light sensitivity) */
@media (prefers-contrast: less) {
  :root {
    --text-primary: #333333;
    --bg-primary: #f0f0f0;
  }
}
```

Key rules:

- `prefers-contrast: more` - eliminate subtle grays, increase border weight, remove transparency
- `prefers-contrast: less` - soften harsh black-on-white, but never drop below 4.5:1 for text
- Semi-transparent backgrounds (`rgba()`, `opacity < 1`) should become opaque under `more`
- Gradient text and low-contrast placeholder text should be fixed under `more`

### `prefers-color-scheme` (WCAG 1.4.3, 1.4.11)

Dark mode is a preference, not just a design trend. Users with light sensitivity, migraines, or low vision may depend on it.

```css
/* Light mode defaults */
:root {
  --bg: #ffffff;
  --text: #1a1a1a;
  --link: #0066cc;
}

/* Dark mode overrides */
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #121212;
    --text: #e0e0e0;
    --link: #6db3f2;
  }
}
```

Key rules:

- Re-check EVERY contrast ratio in dark mode. Inverting colors does not preserve ratios.
- Dark mode backgrounds should not be pure black (`#000000`). Use `#121212` to `#1e1e1e` to reduce halation for users with astigmatism.
- Avoid pure white text on dark backgrounds for body text - use `#e0e0e0` to `#f0f0f0`.
- Shadows are invisible on dark backgrounds - use borders or lighter backgrounds for elevation.
- Status colors (red, green, amber) often need different shades in dark mode to maintain contrast.
- Test with both OS-level dark mode AND any in-app theme toggle.

### `forced-colors` (Windows High Contrast / Contrast Themes)

Windows High Contrast Mode (now called "Contrast Themes") overrides all colors with a system-defined palette. This is NOT the same as `prefers-contrast: more`. The browser applies `forced-colors: active` and replaces your colors entirely.

```css
@media (forced-colors: active) {
  /* The browser replaces your colors, but you may need to fix layout */

  /* Borders that were invisible (matching background) become visible */
  /* Custom focus indicators may be overridden - verify they still work */

  /* Use system colors for intentional styling */
  .custom-button {
    border: 2px solid ButtonText;
    background: ButtonFace;
    color: ButtonText;
  }

  /* SVG icons may become invisible - use currentColor */
  svg {
    fill: currentColor;
  }

  /* Decorative backgrounds/gradients are removed - use borders instead */
  .card {
    border: 1px solid CanvasText;
  }

  /* Ensure custom checkboxes/radios remain visible */
  input[type="checkbox"]::before {
    forced-color-adjust: none; /* Only if you handle all states manually */
  }
}
```

System color keywords to use when `forced-colors: active`:

- `Canvas` - page background
- `CanvasText` - page text
- `LinkText` - link color
- `VisitedText` - visited link
- `ActiveText` - active link
- `ButtonFace` - button background
- `ButtonText` - button text
- `Field` - input background
- `FieldText` - input text
- `Highlight` - selected item background
- `HighlightText` - selected item text
- `GrayText` - disabled text
- `Mark` / `MarkText` - highlighted (find-on-page) text

Key rules:

- Never use `forced-color-adjust: none` globally. Only apply it to specific elements where you manually manage every color state.
- Custom UI controls built from `<div>` and `<span>` often become invisible. Use semantic HTML (`<button>`, `<input>`).
- Background images used for icons will disappear - use inline SVGs with `fill: currentColor`.
- CSS gradients vanish. If a gradient conveys information, provide a text or border alternative.
- Test in Windows with at least two contrast themes (e.g., "High Contrast Black" and "High Contrast White").

### `prefers-reduced-transparency` (WCAG 1.4.11)

Some users find transparent or translucent backgrounds difficult to read against. This query is newer and progressively enhanceable.

```css
@media (prefers-reduced-transparency: reduce) {
  .modal-backdrop {
    background-color: #000000; /* Replace rgba(0,0,0,0.5) */
  }

  .frosted-glass {
    backdrop-filter: none;
    background-color: var(--bg);
  }

  .tooltip {
    background-color: #333333;
    /* Remove any opacity or backdrop-filter */
  }
}
```

### Combined Preference Patterns

Users may set multiple preferences. Handle combinations:

```css
/* High contrast + dark mode */
@media (prefers-color-scheme: dark) and (prefers-contrast: more) {
  :root {
    --bg: #000000;
    --text: #ffffff;
    --border: #ffffff;
  }
}

/* Reduced motion + dark mode */
@media (prefers-color-scheme: dark) and (prefers-reduced-motion: reduce) {
  /* Dark mode without transitions */
}
```

### JavaScript Detection

All `prefers-*` queries can be read and watched in JavaScript:

```js
// Check current preference
const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
const highContrast = window.matchMedia('(prefers-contrast: more)').matches;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const forcedColors = window.matchMedia('(forced-colors: active)').matches;

// Watch for changes (user can toggle mid-session)
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  document.documentElement.classList.toggle('dark', e.matches);
});
```

## WCAG 2.2 Visual Requirements

### Focus Appearance (2.4.13 -- Level AAA, recommended)

This criterion defines what a *sufficient* focus indicator looks like. While AAA, it is the authoritative specification for focus indicator quality and should guide all implementations.

**Requirements per W3C Understanding doc:**

- The focus indicator has a minimum area of a **2px thick perimeter** of the focused component
- The indicator has **3:1 contrast** between its focused and unfocused states (the change-of-contrast test)
- The indicator is not entirely obscured by author-created content

**Relationship to Non-Text Contrast (1.4.11):** Focus Appearance measures the *change between* focused and unfocused states. Non-Text Contrast measures the indicator contrast *against adjacent colors within* a single state. Both must be satisfied.

**C40 Two-Color Focus Technique:**

```css
/* Two concentric outlines ensure visibility on any background */
:focus-visible {
  outline: 2px solid #000000;      /* Dark inner ring */
  outline-offset: 2px;
  box-shadow: 0 0 0 4px #ffffff;   /* Light outer ring */
}
```

**Rules for inset focus indicators:** An inset (inner) outline must be thicker than 2px because it reduces the component's visible area instead of adding to it. Use 3px+ for inset indicators.

### Target Size (2.5.8 -- Level AA)

Interactive targets must be at least **24x24 CSS pixels**, or have sufficient spacing from adjacent targets so that a 24px diameter circle centered on each target does not overlap another target.

```css
/* Ensure small targets like icon buttons meet minimum size */
.icon-button {
  min-width: 24px;
  min-height: 24px;
}

/* Better: use 44x44px for comfortable touch targets (per WCAG 2.5.5 Level AAA) */
.touch-target {
  min-width: 44px;
  min-height: 44px;
}
```

**Exceptions (per W3C Understanding doc):**

- **Spacing exception:** Targets smaller than 24px pass if there is sufficient spacing around them (the 24px circle test passes)
- **Inline:** Targets within a sentence or paragraph of text (underlined links in body copy)
- **User agent default:** Unmodified browser-default controls
- **Essential:** A specific presentation is legally or functionally essential

**What to flag:**

- Icon-only buttons under 24x24px without spacing compensation
- Dense button groups or toolbars where targets overlap the 24px circle
- Mobile nav items or filter chips under 24x24px

### Text Spacing (1.4.12 -- Level AA)

Content must not be clipped or lost when users override text spacing to these minimums:

- Line height: 1.5x font size
- Letter spacing: 0.12x font size
- Word spacing: 0.16x font size
- Paragraph spacing: 2x font size

```css
/* Test text spacing overrides -- content must remain readable */
p {
  line-height: 1.5 !important;
  letter-spacing: 0.12em !important;
  word-spacing: 0.16em !important;
  margin-bottom: 2em !important;
}
```

**What to flag:**

- Fixed-height containers with `overflow: hidden` that would clip expanded text
- CSS that overrides `line-height` with absolute values (`line-height: 16px` instead of `line-height: 1.5`)
- Layouts that break when paragraph margins increase

### Content Reflow (1.4.10 -- Level AA)

Content must reflow to a single column at 320 CSS pixels width (equivalent to 400% zoom on a 1280px viewport) without requiring horizontal scrolling.

**What to flag:**

- `min-width` or fixed `width` values that prevent reflow below 320px
- Horizontal scroll appearing at 400% zoom
- Two-dimensional scrolling for content (tables and complex data visualizations are exempt)
- `overflow: hidden` on the viewport or main containers
