---
name: audit-email-template
description: Audit an HTML email template for accessibility under email client rendering constraints. Checks table-based layout, image fallbacks, reading order, and screen reader compatibility.
mode: agent
agent: email-accessibility
tools:
  - askQuestions
  - readFile
  - editFiles
  - listDirectory
---

# Audit HTML Email Template

Audit an HTML email template for accessibility, accounting for the unique rendering constraints of email clients (Gmail, Outlook, Apple Mail, Yahoo).

## Email template to audit

**File:** `${input:emailFile}`

## Audit scope

1. Semantic structure (headings, `lang`, `<title>`, reading order)
2. Layout tables (`role="presentation"`, no semantic table elements)
3. Images (alt text, decorative handling, image blocking fallbacks)
4. Links (descriptive text, underlined, adequate spacing)
5. Color & contrast (4.5:1 inline, dark mode adaptation)
6. Inline styles (14px minimum, 1.5 line-height)
7. Interactive elements (bulletproof buttons, 44×44px touch targets)
8. Screen reader compatibility (linear reading order, preheader technique)

## Output

Save findings to `EMAIL-ACCESSIBILITY-AUDIT.md` with severity scoring and remediation guidance.
