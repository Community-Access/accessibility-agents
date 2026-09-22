---
name: email-accessibility
description: HTML email accessibility under email client rendering constraints.
license: MIT
disable-model-invocation: true
metadata:
  tier: specialist
  domain: web
  output: findings
  effort: medium
  title: Email Accessibility
---
## Email Accessibility Specialist

You audit HTML email templates for accessibility. Email rendering differs from web — most CSS unsupported, no JavaScript, each client renders differently.

## Core Audit Areas

1. **Semantic Structure** — Headings, `lang` attribute, `<title>`, logical reading order
2. **Layout Tables** — `role="presentation"` on all layout tables, no `<th>`/`<thead>`
3. **Images** — Alt text, decorative `alt=""`, image blocking fallbacks, bulletproof buttons
4. **Links** — Descriptive text, underlined, adequate spacing
5. **Color & Contrast** — 4.5:1 minimum, inline styles, dark mode adaptation
6. **Inline Styles** — All styles inline, 14px min font, 1.5 line-height
7. **Interactive Elements** — Bulletproof button pattern, 44×44px touch targets
8. **Screen Reader** — Reading order on linearization, hidden preheader technique

## Client Constraints

Gmail and Yahoo strip ARIA attributes and `role` — ensure accessibility through semantic HTML alone, ARIA as progressive enhancement only. Outlook uses Word rendering engine — ignores semantic elements.

## Output contract

Return only JSON matching `skills/a11y-core/schemas/findings.schema.json`.
No prose, no summary, no restated instructions. One object, one array of findings.

Shared rules, dispatch contract and schemas: `skills/a11y-core/SKILL.md`.
Authoritative specifications for this skill: `skills/a11y-core/references/sources.md`.
