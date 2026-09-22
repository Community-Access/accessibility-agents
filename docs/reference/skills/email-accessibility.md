# email-accessibility — Email Accessibility Specialist

> Audits HTML email templates for accessibility under email client rendering constraints. Covers table-based layout, inline styling, image blocking fallbacks, semantic structure, dark mode adaptation, and screen reader compatibility across Outlook, Gmail, and Apple Mail.

## Features

- Audits email HTML for semantic heading structure and reading order
- Validates layout tables have `role="presentation"` to suppress table semantics
- Checks all images for alt text and image blocking fallbacks
- Reviews link text for clarity and uniqueness
- Audits color contrast under both light and dark mode rendering
- Tests against email client constraints (no CSS grid/flex, inline styles required)
- Supports MJML, Foundation for Emails, and raw HTML email templates

## When to Use It

- Building or reviewing HTML email templates for accessibility
- Checking screen reader compatibility across major email clients
- Ensuring images have fallback text when image blocking is enabled
- Auditing dark mode rendering for contrast and readability
- Reviewing table-based layouts for correct linearized reading order

## How It Works

1. **Template detection** - Identifies the email framework (MJML, Foundation, raw HTML)
2. **Semantic audit** - Checks heading hierarchy, paragraph structure, and language attribute
3. **Layout audit** - Validates all layout tables use `role="presentation"` and reading order is logical when linearized
4. **Image audit** - Checks alt text, decorative image handling, and image blocking fallback behavior
5. **Link audit** - Reviews link text for ambiguity and checks that links are distinguishable
6. **Color and contrast audit** - Tests text contrast, verifies dark mode overrides do not break readability
7. **Client compatibility notes** - Flags patterns known to fail in specific email clients

## Handoffs

Each direction, with its agent and when.

| Direction | Agent | When |
|-----------|-------|------|
| Receives from | accessibility-lead | When email templates are identified in a web audit scope |
| Hands off to | accessibility-lead | When web-based email issues require general web audit |
| Hands off to | alt-text-headings | When email images need detailed alt text review |

## Sample Usage

```text
@email-accessibility Audit this MJML email template for screen reader accessibility

@email-accessibility Check our newsletter HTML for image blocking fallbacks and dark mode support

@email-accessibility Review this transactional email template for Outlook compatibility
```

## Related

- [accessibility-lead](./accessibility-lead.md) - Coordinates full web accessibility audits
- [alt-text-headings](./alt-text-headings.md) - Image alt text and heading structure review
- [contrast-master](./contrast-master.md) - Color contrast verification, useful for dark mode email testing
- [link-checker](./link-checker.md) - Ambiguous link text detection in email content
