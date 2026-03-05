---
name: review-design-tokens
description: Design system accessibility auditor. Validates color tokens, CSS custom properties, Tailwind config, and design token files for WCAG AA/AAA contrast compliance.
mode: agent
agent: design-system-auditor
tools:
  - askQuestions
  - readFile
  - runInTerminal
---

# Design System Token Audit

Audit design tokens (color, focus, motion, spacing) for accessibility compliance before they propagate to UI.

## Token File

**Path:** `${input:tokenFile}`

Examples:
- `tailwind.config.js`
- `tokens.json` (Style Dictionary)
- `theme.ts` (MUI/Chakra)
- `design-tokens.css` (CSS custom properties)

## Instructions

### Step 1: Identify Token Format

Ask the user:

1. **Format** -- Tailwind, Style Dictionary, CSS custom properties, TypeScript theme object?
2. **Framework** -- MUI, Chakra UI, Radix, shadcn/ui, custom?
3. **Scope** -- Full audit or specific token category (colors, focus rings)?

### Step 2: Extract Color Token Pairs

Parse token file for:
- `colors.text` + `colors.background`
- Button variants (primary, secondary, ghost)
- Input states (default, hover, focus, disabled)
- Semantic colors (error, warning, success, info)

### Step 3: Check Contrast Ratios

For each token pair, compute WCAG contrast:

**Requirements:**
- Text on background: 4.5:1 (normal), 3:1 (large/bold)
- UI components: 3:1
- Focus indicators: 3:1 against adjacent colors

Use contrast formula (see `contrast-master` skill).

### Step 4: Check Focus Ring Tokens

**WCAG 2.4.13 Focus Appearance (AAA):**
- Focus indicator area ≥ 2 CSS pixels solid outline OR equivalent area
- Contrast ≥ 3:1 against background and adjacent colors
- Not obscured by other content

Example tokens:
```js
focusRing: {
  width: '2px',
  style: 'solid',
  color: 'blue.500',
  offset: '2px'
}
```

### Step 5: Check Motion Tokens

**prefers-reduced-motion support:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Ensure tokens respect user preference.

### Step 6: Check Touch Target Tokens

**Spacing tokens for 44x44pt minimum:**
```js
spacing: {
  touch: '44px',  // Minimum touch target
  buttonPadding: '12px 24px'  // Results in 44px+ height
}
```

### Step 7: Provide Remediation

For each failing token pair:
- Current contrast ratio
- WCAG requirement (4.5:1 or 3:1)
- Suggested alternatives (darker/lighter shades that pass)
- Token update example (format-specific)

## Expected Output

- Color token contrast audit
- Focus ring token validation
- Motion token assessment
- Touch target spacing check
- Token fix recommendations with format-specific examples
