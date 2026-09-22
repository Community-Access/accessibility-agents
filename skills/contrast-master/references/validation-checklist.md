# Contrast Master reference: Validation Checklist

Part of the `contrast-master` skill. Read this only when the task reaches these sections.

## Validation Checklist

1. Every text element has 4.5:1 contrast (or 3:1 for large text)?
2. UI components have 3:1 contrast against adjacent colors?
3. No information conveyed by color alone?
4. Focus indicators visible with 3:1 contrast against adjacent colors (1.4.11)?
5. Focus indicators meet 2.4.13 Focus Appearance: 2px perimeter minimum, 3:1 change-of-contrast between focused and unfocused states?
6. Links distinguishable from surrounding text without color?
7. `prefers-reduced-motion` handled?
8. Dark mode colors re-checked (not just inverted)?
9. Placeholder text meets contrast requirements?
10. Disabled states are still distinguishable (even if interaction is blocked)?
11. Error states use text and/or icons, not just red?
12. `prefers-contrast: more` -- subtle colors upgraded, transparency removed?
13. `prefers-color-scheme: dark` -- all ratios verified in dark mode?
14. `forced-colors: active` -- custom controls still visible? SVGs use `currentColor`?
15. `prefers-reduced-transparency` -- frosty/translucent backgrounds have solid fallback?
16. Combined preferences tested (e.g., dark + high contrast)?
17. Interactive targets meet 24x24 CSS pixel minimum (or have sufficient spacing)?
18. Content not clipped or lost with text spacing overrides (1.4.12)?
19. Content reflows at 320px width without horizontal scrolling (1.4.10)?

## Structured Output for Sub-Agent Use

When invoked as a sub-agent by the web-accessibility-wizard, consume the `## Web Scan Context` block provided at the start of your invocation - it specifies the page URL, framework, audit method, thoroughness level, and disabled rules. Honor every setting in it.

For dark mode support, check `dark:` Tailwind variants or CSS `prefers-color-scheme`. Provide replacement colors that pass the required contrast ratio while staying as close as possible to the design's original palette intent.

Return each issue in this exact structure so the wizard can aggregate, deduplicate, and score results:

```text
### [N]. [Brief one-line description]

- **Severity:** [critical | serious | moderate | minor]
- **WCAG:** [criterion number] [criterion name] (Level [A/AA/AAA])
- **Confidence:** [high | medium | low]
- **Impact:** [What a real user with a disability would experience - one sentence]
- **Location:** [file path:line or CSS rule selector]

**Current:** foreground `[#hex]` on background `[#hex]` - ratio [X.X]:1 (requires [Y.Y]:1 for [text size])

**Recommended fix:**
[code block showing replacement color value that passes, with the new ratio]
```

**Confidence rules:**

- **high** - measured failure: exact hex values extracted, ratio calculated below threshold
- **medium** - probable failure: color defined by variable or dynamic theming, estimated below threshold
- **low** - possible failure: color appears low-contrast visually but cannot be precisely measured (e.g., gradient background)

### Output Summary

End your invocation with this summary block (used by the wizard for / progress announcements):

```text
## Contrast Master Findings Summary
- **Issues found:** [count]
- **Critical:** [count] | **Serious:** [count] | **Moderate:** [count] | **Minor:** [count]
- **High confidence:** [count] | **Medium:** [count] | **Low:** [count]
```
