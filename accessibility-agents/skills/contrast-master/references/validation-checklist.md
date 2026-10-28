# Contrast Master reference: Validation Checklist

Part of the `contrast-master` skill. Read this only when the task reaches these sections.

## Validation Checklist

1. Every text element has 4.5:1 contrast (or 3:1 for large text)?
2. UI components have 3:1 contrast against adjacent colors?
3. No information conveyed by color alone?
4. Focus indicators visible (2.4.7) with 3:1 contrast against adjacent colors (1.4.11)?
5. Focused elements never entirely hidden by sticky headers, footers or banners (2.4.11 Focus Not Obscured (Minimum), AA)?
6. For AAA targets: focus indicators meet 2.4.13 Focus Appearance (2 CSS px perimeter area, 3:1 change of contrast between focused and unfocused states)?
7. Links distinguishable from surrounding text without color?
8. `prefers-reduced-motion` handled?
9. Dark mode colors re-checked (not just inverted)?
10. Placeholder text meets contrast requirements?
11. Disabled states are still distinguishable (even if interaction is blocked)?
12. Error states use text and/or icons, not just red?
13. `prefers-contrast: more` -- subtle colors upgraded, transparency removed?
14. `prefers-color-scheme: dark` -- all ratios verified in dark mode?
15. `forced-colors: active` -- custom controls still visible? SVGs use `currentColor`?
16. `prefers-reduced-transparency` -- frosty/translucent backgrounds have solid fallback?
17. Combined preferences tested (e.g., dark + high contrast)?
18. Pointer targets meet the 24x24 CSS pixel minimum or a spacing exception (2.5.8 Target Size (Minimum), AA)?
19. Content not clipped or lost with text spacing overrides (1.4.12)?
20. Content reflows at 320 CSS px width without horizontal scrolling (1.4.10)?

## Structured Output for Sub-Agent Use

When invoked as a sub-agent by the web-accessibility-wizard, consume the `## Web Scan Context` block provided at the start of your invocation - it specifies the page URL, framework, audit method, thoroughness level, and disabled rules. Honor every setting in it.

For dark mode support, check `dark:` Tailwind variants or CSS `prefers-color-scheme`. Provide replacement colors that pass the required contrast ratio while staying as close as possible to the design's original palette intent.

Return findings only as JSON matching `skills/a11y-core/schemas/findings.schema.json`, as the output contract in SKILL.md requires. Map each issue to the schema fields:

- `rule` - a stable identifier for the check
- `wcag` - criterion number and level, for example `"1.4.3 AA"`, or `"n/a"` for findings outside WCAG
- `severity` - `critical`, `serious`, `moderate` or `minor`
- `confidence` - `high`, `medium` or `low` (omit when high)
- `location` - file path and line, or a CSS selector: somewhere a person can open (a repeated component goes in `component`)
- `summary` - one sentence naming the defect and what a user with a disability would experience
- `fix` - the corrected code or text, in the detected framework's syntax
- `evidence` - the offending markup or value, kept short; for contrast, the foreground and background values, the measured ratio and the required ratio

**Confidence rules:**

- **high** - measured failure: exact hex values extracted, ratio calculated below threshold
- **medium** - probable failure: color defined by variable or dynamic theming, estimated below threshold
- **low** - possible failure: color appears low-contrast visually but cannot be precisely measured (e.g., gradient background)
