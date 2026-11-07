# Markdown Scanner reference: Domain 8: Anchor Link Validation (WCAG 2.4.4)

Part of the `markdown-scanner` skill. Read this only when the task reaches these sections.

## Domain 8: Anchor Link Validation (WCAG 2.4.4)

Only run if `anchor-validation: yes`.

1. Extract all `[text](#anchor)` links
2. Build valid anchor set from headings using GitHub rules:
   - Lowercase the heading text (strip the leading `#` chars and surrounding whitespace)
   - Remove punctuation (keep letters, digits, spaces, hyphens and underscores)
   - Replace each space with a hyphen
   - Append `-1`, `-2` and so on to repeated headings so each anchor is unique
3. Flag any anchor that does not match a valid heading anchor
4. Suggest nearest match (string similarity)

**Never auto-fix anchors.** Report with best-guess correction and let the user decide.

For `[text](other-file.md#anchor)` cross-file links: flag as "manual verification recommended."

Headings containing emoji produce unstable anchors - flag these separately.

---
