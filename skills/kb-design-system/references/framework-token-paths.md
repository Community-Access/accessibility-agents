# Design System reference: Framework Token Paths

Part of the `kb-design-system` skill. Read this only when you need the token
paths and default values for a specific framework.

## Tailwind CSS

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

## shadcn/ui / Radix CSS Variables

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

## Material UI (MUI) v5 and later (default palette)

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

## Chakra UI v2

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

## Style Dictionary (Design Tokens Community Group format)

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
