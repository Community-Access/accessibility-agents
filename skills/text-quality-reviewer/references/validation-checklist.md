# Text Quality Reviewer reference: Validation Checklist

Part of the `text-quality-reviewer` skill. Read this only when the task reaches these sections.

## Validation Checklist

### Template Variables

1. Do any alt, aria-label, or aria-describedby values contain `{`, `{{`, `${`, `<%`, or `%s`?
2. Are template bindings actually resolving, or showing literal syntax?

### Code Syntax

3. Do any accessible names contain dot notation (property.name), camelCase, or snake_case identifiers?
4. Are there any accessible names that look like variable names rather than descriptions?

### Placeholder and Test Text

5. Are there any TODO, FIXME, TBD, or test strings in accessible names?
6. Are there any "lorem ipsum", "asdf", or other filler text strings?
7. Are there generic single-word descriptions like "image", "photo", "icon", or "banner"?

### Self-Referential Names

8. Does any element have an accessible name that is just the attribute name ("alt text", "aria label") or element role ("button", "link")?

### Content Quality

9. Are there any whitespace-only or zero-width accessible names?
10. Are there any single-character accessible names on non-icon elements?
11. Are there duplicate accessible names on different interactive controls?
12. Are there any filename patterns (DSC_0492.jpg, hero-banner.png) used as alt text?

### Dynamic Content

13. Are there any unresolved dynamic values showing raw data or zero states?
14. Does `aria-label` conflict with or fail to contain the visible text?

## Structured Output for Sub-Agent Use

When invoked as a sub-agent by the web-accessibility-wizard, consume the `## Web Scan Context` block provided at the start of your invocation. Honor every setting in it.

For each finding, check whether the text content might be intentionally coded (e.g., in a code editor component, code documentation, or developer tools page). These contexts are exceptions.

Return each issue in this exact structure so the wizard can aggregate, deduplicate, and score results:

```text
### [N]. [Brief one-line description]

- **Severity:** [critical | serious | moderate | minor]
- **WCAG:** [criterion number] [criterion name] (Level [A/AA/AAA])
- **Rule:** [TQR-001 through TQR-010]
- **Confidence:** [high | medium | low]
- **Impact:** [What a real user with a disability would experience - one sentence]
- **Location:** [file path:line or component name]

**Current code:**
[code block showing the problem]

**Recommended fix:**
[code block showing corrected text]
```

**Confidence rules:**

- **high** -- definitively defective: unresolved template variable, code syntax as alt text, attribute name as its own value, filename as alt text, whitespace-only name
- **medium** -- likely defective: single-word generic description, very short label, duplicate names across controls
- **low** -- possibly defective: text is short or unusual but may be intentional in context, zero-state numbers that might be valid data

### Output Summary

End your invocation with this summary block:

```text
## Text Quality Reviewer Findings Summary
- **Issues found:** [count]
- **Critical:** [count] | **Serious:** [count] | **Moderate:** [count] | **Minor:** [count]
- **High confidence:** [count] | **Medium:** [count] | **Low:** [count]
```
