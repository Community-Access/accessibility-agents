---
name: review-contrast
description: Color contrast and visual accessibility specialist. Reviews colors, themes, CSS styles, dark mode, focus indicators, and ensures WCAG AA compliance for all color and visual decisions.
mode: agent
agent: contrast-master
tools:
  - askQuestions
  - readFile
  - editFiles
  - runInTerminal
---

# Color Contrast Review

Review color contrast ratios, focus indicators, and visual accessibility for WCAG AA compliance.

## Files to Review

**Path:** `${input:files}`

## Instructions

### Step 1: Gather Context

Ask the user:

1. **Content** -- Full page, component library, design system tokens?
2. **Themes** -- Light mode only, dark mode, high contrast mode?
3. **Framework** -- Tailwind, CSS-in-JS, SCSS, plain CSS?
4. **Known issues** -- Specific color combinations flagged in testing?

### Step 2: Extract Color Pairs

Parse CSS/stylesheets for:

- Text on backgrounds (color + background-color)
- Links (may have different color from body text)
- Buttons (text + background + border)
- Focus indicators (outline-color or box-shadow)
- Disabled states
- Placeholder text

### Step 3: Check Contrast Ratios

For each color pair, compute contrast ratio:

**WCAG AA requirements:**

- Normal text (14pt or 18.5pt bold): 4.5:1
- Large text (18pt or 14pt bold): 3:1
- UI components and graphics: 3:1
- Focus indicators: 3:1 against adjacent colors

**Use built-in task:**

```bash
node -e "const fg='#FOREGROUND',bg='#BACKGROUND';function s(c){c=c/255;return c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4)}function l(h){h=h.replace('#','');if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);return 0.2126*s(r)+0.7152*s(g)+0.0722*s(b)}const l1=l(fg),l2=l(bg),ratio=(Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);console.log(ratio.toFixed(2))"
```

### Step 4: Check Focus Indicators

1. **Visible** -- Focus outline/ring present on all interactive elements?
2. **Contrast** -- 3:1 against background?
3. **Persistent** -- Not removed in CSS (`:focus { outline: none }`)?
4. **Thickness** -- At least 2px or equivalent area?

### Step 5: Check Color-Only Information

WCAG 1.4.1: Don't convey information by color alone

- Error states: Red border + icon/text
- Required fields: Asterisk + color
- Chart data: Pattern + color
- Links: Underline + color (or 3:1 contrast with surrounding text)

### Step 6: Provide Remediation

For each failing color pair:

- Current ratio and WCAG requirement
- Suggested alternatives (darker/lighter shades that pass)
- CSS variable or Tailwind class to update
- Visual comparison (before/after hex codes)

## Expected Output

- All color pair contrast ratios
- Pass/fail assessment for each WCAG level
- Focus indicator evaluation
- Alternative color suggestions for failures
- CSS/framework-specific fixes
