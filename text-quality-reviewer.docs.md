# text-quality-reviewer - Non-Visual Text Quality Review

> Scans your code for low-quality non-visual text that would confuse or mislead screen reader users. Catches template variables in alt text (`{0}`, `{{var}}`), code syntax used as accessible names (`property.alttext`), placeholder text as labels ("TODO", "FIXME"), attribute names used as their own values (`aria-label="ARIA Label"`), filename alt text (`DSC_0492.jpg`), whitespace-only names, duplicate control labels, and visible text that contradicts the programmatic label.

## When to Use It

- After a CMS migration or template engine change -- template bindings are the #1 source of broken alt text
- When auditing a React, Vue, or Angular app for framework binding mistakes
- When QA or a screen reader user reports "the button just says 'button'"
- When reviewing alt text across a site for quality, not just presence
- When checking aria-labels for placeholder or development leftover text
- When verifying that visible button names match their programmatic labels (WCAG 2.5.3)

## What It Catches

| Rule | Severity | What It Catches |
|------|----------|----------------|
| TQR-001 | Critical | Unresolved template variables: `{0}`, `{{var}}`, `${expr}`, `%s` |
| TQR-002 | Critical | Code syntax as names: `property.alttext`, `heroImageAlt`, `btn_label` |
| TQR-003 | Serious | Placeholder text: TODO, FIXME, lorem ipsum, "image", "photo" |
| TQR-004 | Critical | Attribute name as its own value: `alt="alt text"`, `aria-label="ARIA Label"` |
| TQR-005 | Critical | Whitespace-only or zero-width accessible names |
| TQR-006 | Serious | Duplicate accessible names on different controls |
| TQR-007 | Serious | Filename or file path as alt text: `DSC_0492.jpg` |
| TQR-008 | Moderate | Single-character or extremely short labels on non-icon elements |
| TQR-009 | Serious | Visible text contradicts `aria-label` (WCAG 2.5.3 Label in Name) |
| TQR-010 | Moderate | Raw/zero-state dynamic content: `[object Object]`, unfilled data |

## What It Will Not Catch

Missing alt attributes (that is alt-text-headings), invalid ARIA syntax (that is aria-specialist), ambiguous link text like "click here" (that is link-checker), or missing form label associations (that is forms-specialist). It focuses purely on whether the text content is meaningful and human-readable.

## Example Prompts

### GitHub Copilot

```text
/review-text-quality
```

### Claude Code

```text
/text-quality-reviewer check all alt text and aria-labels for template variables
/text-quality-reviewer audit non-visual text quality across the marketing pages
```

## Related Agents

- **alt-text-headings** -- structural alt text presence and heading hierarchy
- **aria-specialist** -- ARIA attribute validity and widget patterns
- **link-checker** -- ambiguous link text detection
- **forms-specialist** -- form label associations
- **accessibility-lead** -- full web accessibility audit coordination
