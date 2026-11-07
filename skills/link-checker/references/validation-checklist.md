# Link Checker reference: Validation Checklist

Part of the `link-checker` skill. Read this only when the task reaches these sections.

## Validation Checklist

### Link Text Quality

1. Does every link have text that describes its purpose?
2. Are there any "click here", "read more", "learn more", or "here" links?
3. Can the purpose of each link be understood from the link text alone (or with programmatic context)?
4. Are URLs used as visible link text?

### Uniqueness

5. Do links with identical text all point to the same destination?
6. Are repeated generic links differentiated with `aria-label` or `aria-labelledby`?

### Context

7. Do links inside cards/articles have sufficient context (via `aria-label`, `aria-labelledby`, or descriptive text)?
8. Are icon-only links labeled with `aria-label`?

### New Windows and Resources

9. Do links opening in new tabs warn the user (visible text or `aria-label`)?
10. Do links to non-HTML files indicate the file type and size?

### Adjacent Links

11. Are adjacent image + text links to the same destination combined into one link?
12. Are adjacent links to different destinations separated by more than whitespace?

### Correct Element Usage

13. Are links used for navigation (going to a page/section)?
14. Are buttons used for actions (submit, toggle, open)?
15. Are there links without `href` attributes? (Should be buttons or use `role="button"`)
