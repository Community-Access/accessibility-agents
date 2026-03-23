---
name: legal-compliance-mapping
description: Cross-jurisdictional accessibility law reference. Maps Section 508, ADA, EN 301 549, European Accessibility Act, AODA, and other frameworks to WCAG versions, additional requirements, applicable sectors, and enforcement mechanisms.
---

# Legal Compliance Mapping Skill

Maps accessibility legal frameworks across jurisdictions. Used by `compliance-mapping` agent and any agent generating compliance reports.

---

## Framework Comparison

| Framework | Jurisdiction | WCAG Version | Scope | Enforcement |
|-----------|-------------|--------------|-------|-------------|
| Section 508 (Revised) | US (Federal) | WCAG 2.0 AA | Federal agencies and their ICT | Administrative complaints, lawsuits |
| ADA Title II | US (State/Local) | WCAG 2.1 AA (DOJ 2024 rule) | State and local government websites | DOJ enforcement, lawsuits |
| ADA Title III | US (Private) | No explicit WCAG version; courts use 2.0/2.1 AA | Public accommodations | Private lawsuits, DOJ enforcement |
| EN 301 549 v3.2.1 | EU | WCAG 2.1 AA (Chapter 9-11) | Public sector + private sector ICT | EU member state enforcement |
| European Accessibility Act (EAA) | EU | WCAG 2.1 AA (via EN 301 549) | Private sector products and services (June 2025) | Market surveillance, fines |
| AODA | Ontario, Canada | WCAG 2.0 AA | Ontario organizations (50+ employees) | Administrative penalties |
| Accessible Canada Act | Canada (Federal) | WCAG 2.1 AA (guidance) | Federally regulated entities | CRTC/CTA enforcement, penalties |
| Israeli Standard 5568 | Israel | WCAG 2.0 AA | Public websites and apps | Civil lawsuits |
| JIS X 8341-3:2016 | Japan | WCAG 2.0 AA | Government websites (recommended) | No enforcement (voluntary) |
| Chinese GB/T 37668-2019 | China | Based on WCAG 2.0 | Government websites | Administrative guidance |

## Additional Non-WCAG Requirements

Some frameworks require more than WCAG conformance:

### EN 301 549 Additional Requirements

| Chapter | Requirement | Beyond WCAG |
|---------|-------------|-------------|
| Chapter 5 | Closed functionality (kiosks, ATMs) | Yes — no WCAG equivalent |
| Chapter 6 | Real-time text (RTT) communication | Yes — no WCAG equivalent |
| Chapter 7 | Video capabilities (captions, audio description) | Extends WCAG 1.2 |
| Chapter 8 | Hardware accessibility | Yes — physical product requirements |
| Chapter 10 | Non-web documents | Maps WCAG to document formats |
| Chapter 11 | Non-web software | Maps WCAG to native applications |
| Chapter 12 | Documentation and support services | Accessible help documentation |
| Chapter 13 | ICT providing relay or emergency services | Yes — no WCAG equivalent |

### European Accessibility Act Additions

- Products: computers, smartphones, tablets, self-service terminals, e-readers
- Services: e-commerce, banking, transport, telephony, audiovisual media
- Microenterprises (<10 employees, <€2M turnover) exempt from service requirements
- Deadline: June 28, 2025 for new products/services

## VPAT / ACR Mapping

The Voluntary Product Accessibility Template (VPAT) maps to three standards:

| VPAT Edition | Standards Covered |
|-------------|-------------------|
| VPAT 2.5 Section 508 | Revised Section 508 (WCAG 2.0 AA) |
| VPAT 2.5 EU | EN 301 549 (WCAG 2.1 AA + Chapters 5-13) |
| VPAT 2.5 INT | Section 508 + EN 301 549 + WCAG 2.x |

**Conformance levels in VPAT:**
- Supports — fully meets the criterion
- Partially Supports — some functionality meets, some does not
- Does Not Support — majority of functionality does not meet
- Not Applicable — criterion is not relevant to the product

## Accessibility Statement Requirements

### W3C Model (Voluntary)

- Conformance status (Fully conformant / Partially conformant / Non-conformant)
- WCAG version and level targeted
- Known limitations with workarounds
- Assessment approach (self, external, automated tools)
- Feedback mechanism with response commitment
- Date of statement and last review

### EU Model (Required for Public Sector)

All of the above, plus:
- Disproportionate burden declaration (if applicable, with justification)
- Link to national enforcement body
- Annual review requirement
- Date of last accessibility audit

## Compliance Timeline Quick Reference

| Event | Date | Impact |
|-------|------|--------|
| Section 508 Refresh | January 2018 | Adopted WCAG 2.0 AA for federal ICT |
| EU Web Accessibility Directive | September 2018 (new sites), September 2020 (existing) | Public sector websites and mobile apps |
| ADA Title II WCAG 2.1 Rule | April 2026 (large), April 2027 (small) | State/local government web content |
| European Accessibility Act | June 2025 | Private sector products and services |
| AODA Full Compliance | January 2021 | Ontario organizations 50+ employees |
