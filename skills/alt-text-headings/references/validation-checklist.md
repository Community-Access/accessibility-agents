# Alt Text and Headings reference: Validation Checklist

Part of the `alt-text-headings` skill. Read this only when the task reaches these sections.

## Validation Checklist

### Images

1. Does every `<img>` have an `alt` attribute?
2. Do meaningful images have descriptive alt text (verified by visual analysis)?
3. Do decorative images have `alt=""`?
4. Do functional images (in links/buttons) describe the action?
5. Do complex images have extended descriptions?
6. Are SVGs properly labeled or hidden?
7. Are icon fonts hidden with `aria-hidden="true"`?
8. Do icon-only buttons/links have `aria-label`?
9. Does the alt text match what the image actually shows?
10. Has the user been asked about ambiguous images?

### Headings

11. Is there exactly one H1 per page?
12. Are heading levels sequential (no skipped levels)?
13. Do headings describe their section content?
14. Are heading levels chosen for structure, not appearance?
15. Do modal headings start at H2?
16. Does the heading outline make sense as a table of contents?

### Document Structure

17. Is `<html lang="...">` set correctly?
18. Is `<title>` descriptive and unique?
19. Are landmarks used correctly (header, nav, main, footer)?
20. Is there a skip link to main content?
21. Are language changes within content marked with `lang`?
22. For SPAs: does the title update on route changes?

### Media

23. Do videos have captions?
24. Do videos have audio descriptions for visual-only content?
25. Is a transcript available for audio content?
26. Is autoplay disabled or muted with visible controls?

## Common Mistakes You Must Catch

- `alt="image"`, `alt="photo"`, `alt="icon"` -- these describe the format, not the content
- `alt="IMG_20250115_143022.jpg"` -- filename as alt text
- Missing `alt` attribute entirely (screen reader reads the filename)
- `alt` text that repeats adjacent text content
- Alt text that does not match what the image actually shows (verify visually)
- Decorative images with descriptive alt (creates noise)
- SVGs without `aria-hidden` or proper `title`/`desc`
- H1 used as a site logo/brand on every page instead of the page-specific title
- Heading levels chosen for font size rather than structure
- `<div class="heading">` instead of actual heading elements
- Empty headings (`<h2></h2>` or headings with only whitespace)
- Headings inside interactive elements (`<button><h2>Click me</h2></button>`)
- Missing page `<title>` or generic title like "Page" on every page
- Missing `lang` attribute on `<html>`
- Charts and graphs with `alt="chart"` instead of describing the data

## Structured Output for Sub-Agent Use

When invoked as a sub-agent by the web-accessibility-wizard, consume the `## Web Scan Context` block provided at the start of your invocation - it specifies the page URL, framework, audit method, thoroughness level, and disabled rules. Honor every setting in it.

You have a unique capability: you can visually analyze image files and compare them against their alt text. When the wizard calls you, look at images, evaluate whether the alt text accurately represents what the image shows, and write specific alt text suggestions based on what you see.

Return each issue in this exact structure so the wizard can aggregate, deduplicate, and score results:

```text
### [N]. [Brief one-line description]

- **Severity:** [critical | serious | moderate | minor]
- **WCAG:** [criterion number] [criterion name] (Level [A/AA/AAA])
- **Confidence:** [high | medium | low]
- **Impact:** [What a real user with a disability would experience - one sentence]
- **Location:** [file path:line or element description]

**Current code:**
[code block showing the problem]

**Recommended fix:**
[code block showing the corrected code, with specific alt text written based on image analysis]
```

**Confidence rules:**

- **high** - definitively wrong: `<img>` missing `alt` attribute entirely, heading level skipped, page missing `<html lang>`, `<h1>` absent or duplicated
- **medium** - likely wrong: alt text present but appears generic (e.g., "image", filename) - flagged based on pattern, image not yet analyzed
- **low** - possibly wrong: alt text quality depends on context that requires user confirmation; heading restructuring may affect visual design

### Output Summary

End your invocation with this summary block (used by the wizard for / progress announcements):

```text
## Alt Text & Headings Findings Summary
- **Issues found:** [count]
- **Critical:** [count] | **Serious:** [count] | **Moderate:** [count] | **Minor:** [count]
- **High confidence:** [count] | **Medium:** [count] | **Low:** [count]
```
