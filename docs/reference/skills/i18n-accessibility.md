# i18n-accessibility — Internationalization Accessibility Specialist

> Audits internationalization and RTL accessibility: dir attributes, BCP 47 lang tags, bidirectional text handling, mixed-direction forms, icon mirroring, and inline language switches. Ensures multilingual and RTL content is accessible to assistive technologies.

## Features

- Validates `lang` attribute on `<html>` and inline language switches (WCAG 3.1.1, 3.1.2)
- Checks `dir` attribute correctness for RTL and mixed-direction content
- Detects bidirectional text issues (Unicode Bidi Algorithm violations)
- Audits mixed-direction form layouts for logical reading and tab order
- Verifies icon and image mirroring in RTL contexts
- Validates BCP 47 language tags against the IANA subtag registry

## When to Use It

- Adding or auditing multilingual support in a web application
- Reviewing RTL layout for Arabic, Hebrew, Persian, or Urdu content
- Checking that inline language switches are properly marked for screen readers
- Auditing forms that mix LTR and RTL input fields
- Verifying icons and directional UI elements flip correctly in RTL mode

## How It Works

1. **Scope identification** - Asks which languages and directions the application supports
2. **Document language audit** - Checks `<html lang>` is present and valid
3. **Inline language audit** - Finds content in a different language and verifies `lang` attributes on wrapper elements
4. **Direction audit** - Validates `dir` attributes, checks for bidirectional text issues, and verifies logical CSS properties (`margin-inline-start` vs `margin-left`)
5. **Form audit** - Reviews mixed-direction forms for correct tab order and label association
6. **Visual audit** - Checks icon mirroring, directional arrows, and progress indicators in RTL

## Handoffs

Each direction, with its agent and when.

| Direction | Agent | When |
|-----------|-------|------|
| Receives from | accessibility-lead | When multilingual or RTL issues are detected during a full audit |
| Hands off to | accessibility-lead | When i18n review is complete and a full web audit is needed |
| Hands off to | alt-text-headings | When images or headings need lang attribute review in multilingual pages |

## Sample Usage

```text
@i18n-accessibility Audit lang attributes and dir handling across this multilingual site

@i18n-accessibility Check RTL support for the Arabic version of our checkout form

@i18n-accessibility Review bidi content handling in the user profile page
```

## Related

- [accessibility-lead](./accessibility-lead.md) - Coordinates full web accessibility audits
- [alt-text-headings](./alt-text-headings.md) - Reviews images and headings, including lang attributes on multilingual content
- [forms-specialist](./forms-specialist.md) - Audits form accessibility, complementary for mixed-direction form layouts
- [keyboard-navigator](./keyboard-navigator.md) - Reviews tab order, important for RTL logical navigation
