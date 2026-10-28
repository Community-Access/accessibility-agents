---
name: kb-legal-compliance-mapping
description: "Reference data, not a reviewer. Map accessibility audit results to legal frameworks: Section 508, ADA, EN 301 549, EAA, AODA. Generate VPAT 2.5 conformance tables."
license: MIT
disable-model-invocation: true
user-invocable: false
metadata:
  tier: reference
  domain: cross-cutting
  output: none
  effort: low
  title: Legal Compliance Mapping
---

## Legal Compliance Mapping Skill

Maps accessibility legal frameworks across jurisdictions. Used by `compliance-mapping` agent and any agent generating compliance reports.

This is reference data, not legal advice. Facts are dated as of October 2026
(checked 27 October 2026). Laws, compliance dates and harmonised standards
change, and several items below are unsettled or under litigation. Every
report that uses this table must say it is not legal advice, give the date of
the facts it relied on, and tell the reader to confirm with counsel and the
primary source before relying on a date.

---

## Framework Comparison

Each framework, with its jurisdiction, WCAG version, scope and enforcement, as of October 2026.

| Framework | Jurisdiction | WCAG Version | Scope | Enforcement |
|-----------|-------------|--------------|-------|-------------|
| Section 508 (Revised 508 Standards, 36 CFR part 1194) | US (Federal) | WCAG 2.0 A and AA (E205.4, 702.10.1). No proposed rule to move to 2.1 or 2.2 has been published | Federal agencies and the ICT they develop, procure, maintain or use | Administrative complaints, lawsuits |
| ADA Title II (28 CFR part 35 subpart H, 2024 rule) | US (State/Local) | WCAG 2.1 AA | State and local government web content and mobile apps | DOJ enforcement, lawsuits |
| HHS Section 504 (45 CFR part 84 subpart I, 2024 rule) | US (recipients of HHS funding) | WCAG 2.1 AA | Web content and mobile apps of recipients of HHS financial assistance | HHS Office for Civil Rights, lawsuits |
| ADA Title III | US (Private) | No DOJ web regulation and no WCAG version in law. DOJ's 2022 web guidance says WCAG and Section 508 "provide helpful guidance" and businesses have flexibility; courts and settlements commonly reference WCAG 2.x AA | Public accommodations | Private lawsuits, DOJ enforcement |
| EN 301 549 | EU | V3.2.1 (2021-03): WCAG 2.1 AA (Clauses 9-11). V4.1.1 (2026-09): WCAG 2.2 A and AA, published but not yet cited in the OJEU | Public sector ICT (WAD); referenced for EAA products and services | EU member state enforcement |
| European Accessibility Act (EAA, Directive (EU) 2019/882) | EU | No WCAG version in the Directive. No harmonised standard cited under the EAA was found; EN 301 549 is the usual technical reference | Private sector products and services (applies from 28 June 2025) | Market surveillance, penalties set by each member state |
| AODA (IASR, O. Reg. 191/11, s.14) | Ontario, Canada | WCAG 2.0 AA, excluding 1.2.4 and 1.2.5 | Designated public sector organizations and organizations with 50+ employees | Administrative penalties |
| Accessible Canada Act and Accessible Canada Regulations (amended by SOR/2025-255) | Canada (Federal) | CAN/ASC-EN 301 549:2024 (identical to EN 301 549 V3.2.1, so WCAG 2.1 AA), incorporated "as amended from time to time" | Federally regulated entities: web pages (including employee-facing), mobile apps, downloadable documents | Accessibility Commissioner, CRTC or CTA depending on sector; penalties |
| Israeli Standard 5568 | Israel | WCAG 2.0 AA | Public websites and apps | Civil lawsuits |
| JIS X 8341-3:2016 | Japan | WCAG 2.0 AA. A revision aligned with ISO/IEC 40500:2025 (WCAG 2.2) was being drafted in 2026; check JISC for whether it has been issued | Government websites (recommended) | No enforcement (voluntary) |
| Chinese GB/T 37668-2019 | China | Based on WCAG 2.0 | Government websites | Administrative guidance |

ISO/IEC 40500:2025 is WCAG 2.2 (the October 2023 text). ISO/IEC 40500:2012 is
WCAG 2.0 and is no longer the latest edition. Some laws still cite the 2012
edition by name.

## Additional Non-WCAG Requirements

Some frameworks require more than WCAG conformance:

### EN 301 549 Additional Requirements

Each clause, with its requirement and beyond WCAG.

| Clause | Requirement | Beyond WCAG |
|---------|-------------|-------------|
| Clause 5 | Generic requirements, including closed functionality (kiosks, ATMs) | Yes - no WCAG equivalent |
| Clause 6 | ICT with two-way voice communication, including real-time text (RTT) | Yes - no WCAG equivalent |
| Clause 7 | Video capabilities (captions, audio description) | Extends WCAG 1.2 |
| Clause 8 | Hardware accessibility | Yes - physical product requirements |
| Clause 10 | Non-web documents | Maps WCAG to document formats |
| Clause 11 | Non-web software | Maps WCAG to native applications |
| Clause 12 | Documentation and support services | Accessible help documentation |
| Clause 13 | ICT providing relay or emergency service access | Yes - no WCAG equivalent |

### European Accessibility Act Additions

- Products: general purpose computer hardware and operating systems, self-service terminals, consumer terminals for electronic communications and audiovisual media, e-readers
- Services: electronic communications, access to audiovisual media, passenger transport elements, consumer banking, e-books, e-commerce
- Microenterprises providing services (fewer than 10 persons and annual turnover or balance sheet total not over EUR 2 million) are exempt from the service requirements
- Applies from 28 June 2025. Products already in use to provide services may continue to be used until 28 June 2030 (Art. 32(1)). Member states may also let self-service terminals lawfully in use before 28 June 2025 continue until the end of their economically useful life, up to 20 years (Art. 32(2): a member-state option, not a general rule)
- Presumption of conformity comes from harmonised standards cited in the OJEU (Art. 15). EN 301 549 V4.1.1 had not been cited as of October 2026

## VPAT / ACR Mapping

The current template is ITI VPAT 2.5Rev (24 April 2025). It comes in four editions:

| VPAT Edition | Standards Covered |
|-------------|-------------------|
| VPAT 2.5 Section 508 | Revised Section 508 (WCAG 2.0 AA) |
| VPAT 2.5 EU | EN 301 549 (the template still points at V3.2.1, so WCAG 2.1 AA, plus Clauses 5-13) |
| VPAT 2.5 WCAG | WCAG 2.0 (ISO/IEC 40500), WCAG 2.1 and WCAG 2.2 |
| VPAT 2.5 INT | Section 508 + EN 301 549 + WCAG |

**Conformance levels in VPAT:**

- Supports - fully meets the criterion
- Partially Supports - some functionality meets, some does not
- Does Not Support - majority of functionality does not meet
- Not Applicable - criterion is not relevant to the product

**4.1.1 Parsing rows.** 4.1.1 is obsolete and removed in WCAG 2.2, so it is
never evaluated or reported against a WCAG 2.2 target. Section 508 and EN 301
549 V3.2.1 still incorporate WCAG 2.0 or 2.1, whose W3C errata say 4.1.1 is
always satisfied for content in HTML or XML. Where an edition's table still
has a 4.1.1 row, report HTML and XML content as Supports and cite that W3C
note in the remarks. Never turn an axe `duplicate-id` result into a 4.1.1
failure; those rules are deprecated.

## Accessibility Statement Requirements

### W3C Model (Voluntary)

- Conformance status (Fully conformant / Partially conformant / Non-conformant)
- WCAG version and level targeted
- Known limitations with workarounds
- Assessment approach (self, external, automated tools)
- Feedback mechanism with response commitment
- Date of statement and last review

### EU Model (Required for Public Sector)

The model statement is set by Commission Implementing Decision (EU) 2018/1523. All of the above, plus:

- Disproportionate burden declaration (if applicable, with justification)
- Link to national enforcement body
- Annual review requirement
- Date of last accessibility audit

## Compliance Timeline Quick Reference

Each event, with its date and impact, as of October 2026. Dates marked as
extended or challenged can move again; check the primary source.

| Event | Date | Impact |
|-------|------|--------|
| Section 508 Refresh | January 2018 | Adopted WCAG 2.0 AA for federal ICT |
| EU Web Accessibility Directive | 23 September 2019 (sites published from 23 September 2018), 23 September 2020 (older sites), 23 June 2021 (mobile apps) | Public sector websites and mobile apps |
| AODA Full Compliance | January 2021 | Ontario organizations 50+ employees |
| European Accessibility Act | 28 June 2025 | Private sector products and services |
| ADA Title II WCAG 2.1 Rule | 26 April 2027 (population 50,000 or more), 26 April 2028 (under 50,000 and special district governments) | State/local government web content and mobile apps. Extended from April 2026 and April 2027 by a DOJ interim final rule (91 FR 20902, 20 April 2026). That rule is challenged in *National Federation of the Blind v. DOJ*, No. 1:26-cv-02007 (D. Md., filed 21 May 2026), with no ruling as of October 2026 |
| HHS Section 504 web rule | 11 May 2027 (15 or more employees), 10 May 2028 (fewer than 15) | Recipients of HHS funding. Extended by HHS interim final rule (FR Doc. 2026-09266, effective 7 May 2026); also challenged in the same NFB case |
| EN 301 549 V4.1.1 | Published September 2026 | Aligns with WCAG 2.2. Not cited in the OJEU as of October 2026, so V3.2.1 still gives presumption of conformity under the WAD |
| Accessible Canada Regulations (SOR/2025-255) | 5 December 2027 (federal public sector web), 5 December 2028 (private sector and mobile apps and documents) | Makes CAN/ASC-EN 301 549 binding. The TBS Standard on Web Accessibility (WCAG 2.0) was rescinded |

## Sources

- ADA Title II rule and dates: <https://www.ada.gov/resources/2024-03-08-web-rule/> and <https://www.federalregister.gov/documents/2026/04/20/2026-07663/extension-of-compliance-dates-for-nondiscrimination-on-the-basis-of-disability-accessibility-of-web>
- HHS Section 504 extension: <https://www.federalregister.gov/documents/2026/05/11/2026-09266/extension-of-compliance-dates-for-nondiscrimination-on-the-basis-of-disability-accessibility-of-web>
- ADA Title III web guidance: <https://www.ada.gov/resources/web-guidance/>
- Section 508: <https://www.access-board.gov/ict/>
- EAA: <https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A32019L0882>
- EN 301 549 V4.1.1 status: <https://accessible-eu-centre.ec.europa.eu/content-corner/news/european-accessibility-standard-en-301-549-has-been-updated-2026-09-07_en>
- Web Accessibility Directive: <https://digital-strategy.ec.europa.eu/en/policies/web-accessibility>
- Canada SOR/2025-255: <https://gazette.gc.ca/rp-pr/p2/2025/2025-12-17/html/sor-dors255-eng.html>
- ISO/IEC 40500:2025: <https://www.iso.org/standard/91029.html>
- ITI VPAT: <https://www.itic.org/policy/accessibility/vpat>
