---
name: kb-design-system
description: Reference data, not a reviewer. Validate design system tokens for WCAG AA/AAA contrast. Compute color token contrast, focus ring validation (WCAG 2.4.13), motion tokens, and spacing for touch targets across frameworks.
license: MIT
disable-model-invocation: true
user-invocable: false
metadata:
  tier: reference
  domain: cross-cutting
  output: none
  effort: low
  title: Design System
---

## Design System Accessibility Skill

This skill provides reference data for design token contrast validation, focus ring compliance, and spacing audits. Used by the `design-system-auditor` skill.

---

## WCAG Contrast Ratio - Computation Reference

### Step 1: Linearize sRGB Channel

For each channel `C` in `[0, 255]`:

```text
c = C / 255
c_lin = c / 12.92              if c <= 0.04045
c_lin = ((c + 0.055) / 1.055)^2.4   otherwise
```

### Step 2: Relative Luminance

```text
L = 0.2126 * R_lin + 0.7152 * G_lin + 0.0722 * B_lin
```

### Step 3: Contrast Ratio

```text
ratio = (L_lighter + 0.05) / (L_darker + 0.05)
```

### Quick JavaScript Implementation

```js
function relativeLuminance(hex) {
  const c = hex.replace('#', '').match(/.{2}/g)
    .map(h => parseInt(h, 16) / 255)
    .map(c => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

function contrastRatio(hex1, hex2) {
  const L1 = relativeLuminance(hex1);
  const L2 = relativeLuminance(hex2);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Example
contrastRatio('#6B7280', '#FFFFFF'); // 4.83:1 - PASSES AA, fails AAA
contrastRatio('#9CA3AF', '#FFFFFF'); // 2.54:1 - FAILS AA
```

### HSL to Hex Conversion (for CSS variable tokens)

Some design systems store colors as HSL triplets (e.g., shadcn/ui themes for Tailwind v3). Current shadcn/ui and Tailwind v4 themes use `oklch()`; convert those to sRGB before computing contrast.

```js
function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return '#' + [f(0), f(8), f(4)]
    .map(x => Math.round(x * 255).toString(16).padStart(2, '0'))
    .join('');
}

// shadcn/ui: --muted-foreground: 215.4 16.3% 46.9%
hslToHex(215.4, 16.3, 46.9); // -> #64748B (4.76:1 on white)
```

---

## WCAG Contrast Thresholds

Each WCAG contrast threshold, with use case, AA, AAA and notes.

| Use Case | AA | AAA | Notes |
|----------|-----|-----|-------|
| Normal text (< 18pt / < 14pt bold) | 4.5:1 | 7:1 | Most body text |
| Large text (>= 18pt / >= 14pt bold) | 3:1 | 4.5:1 | Headings, display text |
| UI components (borders, icons) | 3:1 | - | Input borders, icon buttons |
| Focus indicators | 3:1 against adjacent colors (1.4.11) | 3:1 focused vs unfocused, 2px perimeter area (2.4.13) | 2.4.13 Focus Appearance is AAA |
| Placeholder text | 4.5:1 | - | Counts as normal text |
| Disabled state | Exempt | Exempt | Documented exemption |
| Logo / brand | Exempt | Exempt | No requirement |
| Decorative content | Exempt | Exempt | Must be marked decorative |

---

## Framework Token Paths - Complete Reference

### Tailwind CSS

The hex values in this skill are the Tailwind v3 palette and the example below is the v3 JavaScript config. Tailwind v4 (current major) defines the palette in OKLCH inside CSS `@theme` blocks (for example `--color-gray-500: oklch(55.1% 0.027 264.364)`); convert before computing contrast.

```js
// tailwind.config.js / tailwind.config.ts
module.exports = {
  theme: {
    // Base colors (Tailwind default palette)
    colors: {
      // All color scales: slate, gray, zinc, neutral, stone, red, orange, amber,
      // yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet,
      // purple, fuchsia, pink, rose
      // Each scale: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950
    },
    extend: {
      colors: {
        // Custom semantic colors - CHECK ALL PAIRS
        brand: { primary: '#...', secondary: '#...' },
        background: '#...',
        foreground: '#...',
        muted: '#...',
        'muted-foreground': '#...',
        accent: '#...',
        'accent-foreground': '#...',
        destructive: '#...',
        'destructive-foreground': '#...',
        card: '#...',
        'card-foreground': '#...',
        popover: '#...',
        'popover-foreground': '#...',
        border: '#...',    // UI component - check 3:1 against background
        input: '#...',     // UI component - check 3:1 against background
        ring: '#...',      // Focus ring - check 3:1 against background
        primary: '#...',
        'primary-foreground': '#...',
        secondary: '#...',
        'secondary-foreground': '#...',
      },
      ringColor: { DEFAULT: '...' },  // Focus state
      ringWidth: { DEFAULT: '2px' },  // 2px helps meet WCAG 2.4.13 (AAA)
    }
  }
}
```

### shadcn/ui / Radix CSS Variables

```css
/* globals.css - shadcn/ui Tailwind v3 theme: HSL triplets without hsl() wrapper.
   Current shadcn/ui (Tailwind v4) themes use oklch() values instead. */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;     /* HIGH RISK - check on --background */
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;               /* HIGH RISK - red on white */
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;               /* UI component - check 3:1 */
  --input: 214.3 31.8% 91.4%;                /* UI component - check 3:1 */
  --ring: 222.2 84% 4.9%;                    /* Focus ring - check 3:1 */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... all dark mode variants */
}
```

### Material UI (MUI) v5 and later (default palette)

```js
// Token paths in createTheme()
palette: {
  primary: {
    main: '#1976d2',            // text-on-white: 4.60:1
    light: '#42a5f5',           // text-on-white: 2.65:1 (do not use as text color)
    dark: '#1565c0',            // text-on-white: 5.75:1
    contrastText: '#fff',       // check on main
  },
  secondary: {
    main: '#9c27b0',            // text-on-white: 6.30:1
    light: '#ba68c8',           // text-on-white: 3.56:1 (fails for normal text)
    dark: '#7b1fa2',
    contrastText: '#fff',
  },
  error: {
    main: '#d32f2f',            // text-on-white: 4.98:1
    light: '#ef5350',           // text-on-white: 3.49:1 (fails for normal text)
  },
  warning: {
    main: '#ed6c02',            // text-on-white: 3.11:1 COMMON FAILURE for normal text
    light: '#ff9800',           // text-on-white: 2.16:1
    dark: '#e65100',            // text-on-white: 3.79:1 (still fails for normal text)
    contrastText: 'rgba(0, 0, 0, 0.87)',  // check on warning.main
  },
  info: {
    main: '#0288d1',            // text-on-white: 3.86:1 (fails for normal text)
    light: '#03a9f4',           // text-on-white: 2.63:1
  },
  success: {
    main: '#2e7d32',            // text-on-white: 5.13:1
    light: '#4caf50',           // text-on-white: 2.78:1
  },
  text: {
    primary: 'rgba(0,0,0,0.87)',   // -> ~#212121: 16.1:1 on white
    secondary: 'rgba(0,0,0,0.6)', // -> ~#666: 5.74:1 on white
    disabled: 'rgba(0,0,0,0.38)', // -> ~#9E9E9E: 2.68:1 (exempt when disabled)
  },
  background: { paper: '#fff', default: '#fafafa' },
  action: {
    active: 'rgba(0,0,0,0.54)',   // -> ~#757575: 4.61:1, passes 3:1 for icons
    disabled: 'rgba(0,0,0,0.26)', // exempt when disabled
  }
}
```

### Chakra UI v2

Chakra UI v3 (current major) removed `extendTheme`; it uses `createSystem(defaultConfig, defineConfig({ theme: { tokens, semanticTokens } }))` with the same token ideas. The gray values below are a custom override (Tailwind v3 grays), not Chakra defaults.

```js
// Token paths in extendTheme() (Chakra v2)
const theme = extendTheme({
  colors: {
    // Direct palette values
    brand: { 50: '#f5f3ff', 500: '#7C3AED', 600: '#6D28D9', 700: '#5B21B6', 900: '#2E1065' },
    gray: { 50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB', 300: '#D1D5DB',
            400: '#9CA3AF',  // text-on-white: 2.54:1
            500: '#6B7280',  // text-on-white: 4.83:1 (passes AA)
            600: '#4B5563',  // text-on-white: 7.56:1
            700: '#374151', 800: '#1F2937', 900: '#111827' },
  },
  semanticTokens: {
    colors: {
      'chakra-body-text': { default: 'gray.800', _dark: 'whiteAlpha.900' },
      'chakra-body-bg': { default: 'white', _dark: 'gray.800' },
      'chakra-placeholder-color': { default: 'gray.400', _dark: 'whiteAlpha.400' },
      // gray.400 on white = 2.54:1 - placeholder fails AA
    }
  },
  components: {
    Button: {
      variants: {
        solid: (props) => ({
          bg: `${props.colorScheme}.500`,  // check colorScheme.500 on white
          color: 'white',                  // white on colorScheme.500 - check 3:1
        }),
        ghost: (props) => ({
          color: `${props.colorScheme}.600`,  // text-on-white variant
        }),
      }
    }
  }
});
```

### Style Dictionary (Design Tokens Community Group format)

The `$value`/`$type` shape is the DTCG Design Tokens Format Module 2025.10, a W3C Community Group report (not a W3C Recommendation). Comments below are annotations; strip them for valid JSON.

```json
{
  "color": {
    "text": {
      "primary": { "$value": "#111827", "$type": "color" },
      "secondary": { "$value": "#6B7280", "$type": "color" },   // 4.83:1 on white
      "muted": { "$value": "#9CA3AF", "$type": "color" },       // 2.54:1 on white, fails
      "inverse": { "$value": "#FFFFFF", "$type": "color" },
      "on-primary": { "$value": "#FFFFFF", "$type": "color" }
    },
    "background": {
      "default": { "$value": "#FFFFFF", "$type": "color" },
      "subtle": { "$value": "#F9FAFB", "$type": "color" },
      "primary": { "$value": "#1D4ED8", "$type": "color" }
    },
    "status": {
      "error": { "$value": "#DC2626", "$type": "color" },
      "warning": { "$value": "#D97706", "$type": "color" },     // 3.19:1 on white, fails for normal text
      "success": { "$value": "#16A34A", "$type": "color" },
      "info": { "$value": "#2563EB", "$type": "color" }
    },
    "border": {
      "default": { "$value": "#D1D5DB", "$type": "color" },     // 1.47:1 on white, fails 3:1 if the border identifies a control
      "focus": { "$value": "#2563EB", "$type": "color" }        // focus ring
    }
  }
}
```

---

## High-Risk Token Pairs - Known Failures

Each token pair, with its common value, ratio on white, status and notes.

| Token pair | Common value | Ratio on white | Status | Notes |
|-----------|-------------|----------------|--------|-------|
| MUI `warning.main` | `#ed6c02` | 3.11:1 | FAIL | Orange on white - fails for normal text |
| MUI `warning.light` | `#ff9800` | 2.16:1 | FAIL | Light orange - critical failure |
| MUI `info.main` | `#0288d1` | 3.86:1 | FAIL | Fails for normal text |
| Tailwind v3 `amber-400` | `#FBBF24` | 1.67:1 | FAIL | Never use amber-400 as text |
| Tailwind v3 `yellow-400` | `#FACC15` | 1.53:1 | FAIL | Yellow always fails on white |
| Tailwind v3 `gray-400` | `#9CA3AF` | 2.54:1 | FAIL | Common placeholder color |
| Tailwind v3 `gray-500` | `#6B7280` | 4.83:1 | Pass AA, fails AAA | Often assumed to fail; it passes AA |
| Chakra v2 `chakra-placeholder-color` | `gray.500` = `#718096` | 4.02:1 | FAIL | Chakra v2 default placeholder |
| MUI `text.disabled` | `rgba(0,0,0,0.38)` | ~2.68:1 | Exempt | Disabled = exempt per WCAG |
| MUI `action.active` | `rgba(0,0,0,0.54)` | ~4.61:1 | Pass | Icon color on white |
| shadcn v3 theme `--muted-foreground` | `hsl(215.4 16.3% 46.9%)` | ~4.76:1 | Pass AA, fails AAA | Tailwind v3 shadcn theme |
| shadcn v3 theme `--destructive` | `hsl(0 84.2% 60.2%)` | ~3.76:1 | FAIL | Red text on white; passes 3:1 for large text and UI |

### Compliant Replacements

Each failing token, with its replacement, new ratio and notes.

| Failing token | Replacement | New ratio | Notes |
|--------------|-------------|-----------|-------|
| `#9CA3AF` (gray-400) | `#6B7280` (gray-500) | 4.83:1 | Passes AA; use `#595959` (7.00:1) for AAA |
| `#6B7280` (gray-500), AAA target only | `#4B5563` (gray-600) | 7.56:1 | Meets AAA |
| `#ed6c02` (MUI warning) | `#b45309` (amber-700) | 5.02:1 | |
| `#ff9800` (MUI warning.light) | `#b45309` (amber-700) | 5.02:1 | |
| `#FBBF24` (amber-400) | `#92400e` (amber-800) | 7.09:1 | Keep amber-400 for backgrounds, not text |
| `#FACC15` (yellow-400) | `#713f12` (yellow-900) | 8.67:1 | Keep yellow-400 for backgrounds, not text |
| `hsl(0 84.2% 60.2%)` (shadcn destructive) | `#b91c1c` (red-700) | 6.47:1 | |

---

## Storybook addon-a11y Configuration

```bash
npm install --save-dev @storybook/addon-a11y
```

```js
// .storybook/main.js (ESM; Storybook 10 is ESM-only)
export default {
  addons: ['@storybook/addon-a11y'],
};

// .storybook/preview.js - global configuration
export const parameters = {
  a11y: {
    options: {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    },
    config: {
      rules: [
        { id: 'target-size', enabled: true },       // WCAG 2.5.8; off by default in axe
      ],
    },
    // 'todo' (the default) reports violations as warnings; 'error' fails the test
    test: 'error',
  },
};

// Per-story override
export const MyStory = {
  parameters: {
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: false }],  // Document WHY
      }
    }
  }
};
```

axe-core has no `focus-visible` rule; check focus indicators manually or with Playwright.

### Running Storybook a11y Checks in CI

```bash
# Storybook 9 and later recommend the Vitest addon (npx storybook add @storybook/addon-vitest),
# which runs the a11y checks with each story test. The test runner still works:
npm install --save-dev @storybook/test-runner

# package.json scripts
{
  "scripts": {
    "storybook:test": "test-storybook",
    "storybook:test:a11y": "test-storybook --ci"
  }
}

# Run in CI
npx storybook dev --port 6006 &
npx wait-on tcp:6006
npx test-storybook --ci
```

---

## WCAG 2.4.13 Focus Appearance Requirements (AAA, exceeds AA baseline)

**WCAG 2.4.13 Focus Appearance (Level AAA in WCAG 2.2)** - exceeds the 2.4.7 Focus Visible (AA) baseline, but recommended as best practice:

1. **Area:** The focus indicator is at least as large as the area of a 2 CSS pixel thick perimeter of the unfocused component
2. **Contrast change:** The focus indicator area has a contrast ratio of at least 3:1 between the same pixels in the focused and unfocused states
3. **Exceptions:** The indicator is determined by the user agent and cannot be adjusted by the author, or the author has not modified the indicator or its background

Obscuring by author content is a separate requirement: 2.4.11 Focus Not Obscured (Minimum, AA) and 2.4.12 (Enhanced, AAA).

### Minimum Compliant Focus Ring Implementation

```css
/* Focus ring that meets 1.4.11 at AA and helps meet 2.4.13 (AAA) */
:focus-visible {
  outline: 2px solid #0054B3;      /* >= 2px width */
  outline-offset: 2px;             /* Separates from component edge */
  /* #0054B3 on #FFF = 7.19:1 -> passes 3:1 for UI components */
}

/* Dark mode variant */
@media (prefers-color-scheme: dark) {
  :focus-visible {
    outline-color: #7CAFFF;        /* lighter blue on dark background */
    /* #7CAFFF on #1E1E1E = 7.49:1 */
  }
}

/* VIOLATION patterns to detect */
:focus { outline: none; }                           /* Hard fail */
:focus { outline: 0; }                              /* Hard fail */
:focus-visible { box-shadow: none; outline: none; } /* Hard fail */
button:focus { outline: none; }                     /* Hard fail */
*:focus { outline-color: transparent; }             /* Hard fail */
```

### Focus Ring Token Validation Checklist

Each check, with its requirement and tool.

| Check | Requirement | Tool |
|-------|------------|------|
| `outline-width` >= 2px | WCAG 2.4.13 (AAA) area requirement | CSS audit |
| Focus color contrast >= 3:1 | Against adjacent background (1.4.11) | Contrast calculator |
| Focus state differs from unfocused | Visible change required | Visual inspection |
| No `outline: none` without replacement | N/A | grep / CSS audit |
| Present in both light and dark modes | Consistent | Visual inspection |

---

## Design Token File Discovery Commands

```bash
# Find all token files in a project
find . -type f \( \
  -name "tokens.json" \
  -o -name "design-tokens.json" \
  -o -name "colors.json" \
  -o -name "variables.css" \
  -o -name "tokens.css" \
  -o -name "_variables.scss" \
  -o -name "theme.ts" \
  -o -name "theme.js" \
  -o -name "tailwind.config.*" \
\) \
-not -path "*/node_modules/*" \
-not -path "*/.next/*" \
-not -path "*/dist/*"

# PowerShell equivalent
Get-ChildItem -Recurse -File -Include tokens.json,design-tokens.json,colors.json,`
  variables.css,tokens.css,_variables.scss,theme.ts,theme.js,tailwind.config.js,tailwind.config.ts `
  | Where-Object { $_.FullName -notmatch 'node_modules|\.next|dist' }
```

---

## Severity Classification

Each finding, with its severity (the a11y-core values).

| Finding | Severity |
|---------|---------|
| Text token below 3:1 | critical |
| Text token 3:1-4.49:1 (normal text) | serious |
| Text token 4.5:1-6.99:1, AAA target | minor |
| UI component token below 3:1 | serious |
| Focus ring missing completely | critical |
| Focus ring below 2px (2.4.13, AAA) | minor |
| Focus ring contrast below 3:1 | serious |
| Touch target token below 24 x 24px (WCAG 2.5.8) | serious |
| Touch target token below 44 x 44px (WCAG 2.5.5) | minor |
| No `prefers-reduced-motion` reset | minor |
| Placeholder color below 4.5:1 | serious |
| Disabled token below 3:1 | none - note only (documented exemption) |
