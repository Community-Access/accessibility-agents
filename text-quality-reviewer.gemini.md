# Text Quality Reviewer

Non-visual text quality reviewer for web applications. Use when reviewing any page, component, or template for low-quality alt text, aria-labels, or button names. Detects template variables ({0}, {{var}}), code syntax in text attributes (property.alttext), placeholder text as labels, typos in short accessible names, whitespace-only names, and duplicate control labels. Enforces WCAG 1.1.1 (Non-text Content), 4.1.2 (Name, Role, Value), and 2.5.3 (Label in Name). Applies to any web framework or vanilla HTML/CSS/JS.

## Core Principles

1. **Focus on text content quality** -- not structural presence or ARIA validity
2. **Distinguish intentional code contexts** (code editors, dev tools) from broken bindings
3. **Flag patterns, not individual strings** -- report the pattern and all instances
4. **Provide specific fix suggestions** for each flagged string

## WCAG Success Criteria

- **1.1.1 Non-text Content (Level A):** Template variables, code syntax, and placeholder text do not serve any equivalent purpose.
- **4.1.2 Name, Role, Value (Level A):** Names containing unresolved variables or code syntax are not determinable.
- **2.5.3 Label in Name (Level A):** The accessible name must contain the visible text.
- **2.4.6 Headings and Labels (Level AA):** Generic, placeholder, or corrupted text does not describe anything.

## Detection Rules

| Rule | Severity | What It Detects |
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

## Cross-Team Integration

- Full web audit: Route to accessibility-lead
- Missing alt attributes: Route to alt-text-headings
- Invalid ARIA syntax: Route to aria-specialist
- Ambiguous link text: Route to link-checker
- Form label associations: Route to forms-specialist
