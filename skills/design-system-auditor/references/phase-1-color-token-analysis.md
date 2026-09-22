# Design System Auditor reference: Phase 1: Color Token Analysis

Part of the `design-system-auditor` skill. Read this only when the task reaches these sections.

## Phase 1: Color Token Analysis

### 1.1 WCAG Contrast Ratio Formula

**Relative luminance** of an sRGB color `(R, G, B)` in `[0,255]`:

$$L = 0.2126 \cdot R_{lin} + 0.7152 \cdot G_{lin} + 0.0722 \cdot B_{lin}$$

where $C_{lin} = (C/255) / 12.92$ if $C/255 \le 0.04045$, else $((C/255 + 0.055) / 1.055)^{2.4}$

**Contrast ratio:**

$$\text{ratio} = \frac{L_{lighter} + 0.05}{L_{darker} + 0.05}$$

**WCAG thresholds:**

| Use case | AA minimum | AAA minimum |
|----------|-----------|------------|
| Normal text (< 18pt / < 14pt bold) | 4.5:1 | 7:1 |
| Large text (>= 18pt / >= 14pt bold) | 3:1 | 4.5:1 |
| UI components (borders, icons, focus indicators) | 3:1 | - |
| Focus indicators (WCAG 2.4.13, 2.2) | 3:1 against adjacent colors | - |
| Placeholder text | 4.5:1 | - |
| Disabled state | Exempt (with caveats) | - |

### 1.2 Token Pair Identification

For each color token, identify **all applicable pairs** by convention:

```text
background -> foreground  (e.g., --color-bg -> --color-text)
surface -> on-surface
primary -> on-primary
secondary -> on-secondary
error -> on-error
warning -> on-warning / foreground
success -> on-success / foreground
muted -> muted-foreground
card -> card-foreground
destructive -> destructive-foreground
input (border) -> background    [3:1 UI component]
ring (focus) -> adjacent color  [3:1 focus indicator, WCAG 2.4.13]
```

### 1.3 Tailwind Config Analysis

```js
// tailwind.config.js - extract color scale
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          // ...
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Check ALL color scales
      }
    }
  }
}
```

**Analysis steps:**

1. Extract all color values from the config
2. Map to semantic pairs (identify `primary-{n}` as text on `primary-{lighter}`)
3. For each pair, compute contrast ratio
4. Report all pairs below 4.5:1 (AA normal text) as errors
5. Report pairs between 4.5:1 and 7:1 as warnings if AAA is the target

**CSS variable mapping pattern:**

```css
/* shadcn/ui / Radix pattern */
:root {
  --background: 0 0% 100%;        /* hsl components */
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --ring: 222.2 84% 4.9%;         /* focus ring */
}
```

### 1.4 Style Dictionary Token Analysis

```json
{
  "color": {
    "brand": {
      "primary": { "value": "#0057B8" },
      "primary-light": { "value": "#E6EEFF" },
      "on-primary": { "value": "#FFFFFF" }
    },
    "text": {
      "default": { "value": "#1A1A2E" },
      "muted": { "value": "#6B7280" },
      "inverse": { "value": "#FFFFFF" }
    }
  }
}
```

Parse `.value` fields from all color tokens and evaluate every text-on-background pairing.

### 1.5 MUI Theme Analysis

```js
// MUI v5+ theme - key token paths
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2', light: '#42a5f5', dark: '#1565c0', contrastText: '#fff' },
    secondary: { main: '#9c27b0', contrastText: '#fff' },
    error: { main: '#d32f2f', contrastText: '#fff' },
    warning: { main: '#ed6c02', contrastText: '#fff' },
    info: { main: '#0288d1', contrastText: '#fff' },
    success: { main: '#2e7d32', contrastText: '#fff' },
    text: { primary: 'rgba(0,0,0,0.87)', secondary: 'rgba(0,0,0,0.6)', disabled: 'rgba(0,0,0,0.38)' },
    background: { paper: '#fff', default: '#fff' },
    action: { active: 'rgba(0,0,0,0.54)', hover: 'rgba(0,0,0,0.04)' },
  }
});
// All combinations of palette.text.* on palette.background.* must pass
// palette.warning.main (#ed6c02) on white = 2.94:1 -> FAILS AA
```

### 1.6 Chakra UI Theme Analysis

```js
// Chakra v2/v3 token paths
const theme = extendTheme({
  colors: {
    brand: { 50: '#...',  500: '#...', 900: '#...' },
    gray: { 50: '#F9FAFB', 100: '#F3F4F6', ... 700: '#374151', 800: '#1F2937', 900: '#111827' },
  },
  semanticTokens: {
    colors: {
      'chakra-body-text': { default: 'gray.800', _dark: 'whiteAlpha.900' },
      'chakra-body-bg': { default: 'white', _dark: 'gray.800' },
    }
  }
});
// Evaluate semanticTokens pairs for both light and dark modes
```

---

## Phase 2: Focus Ring Token Validation (WCAG 2.4.13)

**WCAG 2.4.13 Focus Appearance (AAA, exceeds AA baseline):** Focus indicator must have:

1. Minimum area: perimeter x 2px (or enclosing component area)
2. Contrast change >= 3:1 between focused and unfocused states
3. Not entirely obscured by author-created content

### 2.1 CSS Custom Property Focus Tokens

```css
/* Token audit targets */
:root {
  --ring: 215 20.2% 65.1%;        /* focus ring color */
  --ring-width: 2px;               /* must be >= 2px */
  --ring-offset: 2px;              /* offset creates visible separation */
  --ring-opacity: 1;               /* must not be < 1 */
}

/* Check that focus styles are NOT removed */
*:focus-visible {
  outline: var(--ring-width, 2px) solid hsl(var(--ring));
  outline-offset: var(--ring-offset, 2px);
}

/* VIOLATION: outline removal without replacement */
*:focus { outline: none; }                        /* ERROR */
button:focus { outline: 0; }                      /* ERROR */
.btn:focus { outline: none; box-shadow: none; }   /* ERROR if no replacement */
```

### 2.2 Focus Ring Contrast Check

The focus ring color (`--ring`) must contrast >= 3:1 against:

- The component's background color
- Colors adjacent to the focus ring area

```text
Example: --ring: hsl(215, 100%, 50%) = #0080FF on white (#FFF)
Contrast = 3.89:1 -> PASSES 3:1 minimum
```

### 2.3 Tailwind Focus Token Patterns

```js
// tailwind.config.js - check ring tokens
module.exports = {
  theme: {
    extend: {
      ringColor: { DEFAULT: '#2563eb', primary: '#1d4ed8' },
      ringWidth: { DEFAULT: '2px' },        // must be >= 2px
      ringOffsetColor: { DEFAULT: '#fff' },  // check contrast of offset area
    }
  },
  plugins: [/* check for focus-visible plugin */]
}
```

---
