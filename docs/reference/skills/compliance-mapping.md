# compliance-mapping - Legal Compliance Mapping

> Maps accessibility audit results to legal frameworks including Section 508, EN 301 549, EAA/European Accessibility Act, ADA, and AODA. Generates VPAT 2.5Rev reports in WCAG, 508, EU and INT editions with conformance claims, known limitations, and remediation timelines.

## When to Use It

- Generating VPAT 2.5Rev / ACR reports from completed accessibility audits
- Mapping WCAG 2.2 findings to Section 508 functional performance criteria
- Preparing documentation for procurement accessibility requirements
- Understanding which legal framework applies to your product or region
- Converting between different compliance reporting formats

## Legal Frameworks

<details>
<summary>Expand - 5 supported frameworks</summary>

| Framework | Region | Standard | Key Document |
|-----------|--------|----------|-------------|
| **Section 508** | United States | WCAG 2.0 AA (Revised 508) | VPAT 2.5Rev |
| **EN 301 549** | European Union | V3.2.1 (WCAG 2.1 AA plus non-web clauses) is the version cited for presumption of conformity; V4.1.1 (September 2026, WCAG 2.2) is published but not yet cited in the Official Journal | EU Declaration |
| **EAA** | European Union | Directive (EU) 2019/882, applying since 28 June 2025; no harmonised standard is cited under it yet, and EN 301 549 is the reference in practice | Accessibility Statement |
| **ADA** | United States | Title II (state and local government): WCAG 2.1 AA, compliance dates 26 April 2027 (population 50,000 or more) and 26 April 2028 (smaller entities and special districts), under legal challenge; Title III (businesses): no DOJ web regulation | Voluntary compliance report |
| **AODA** | Ontario, Canada | WCAG 2.0 AA | AODA compliance report |

</details>

## VPAT Editions

<details>
<summary>Expand - 4 VPAT 2.5Rev editions</summary>

| Edition | Scope | When to Use |
|---------|-------|-------------|
| **WCAG** | WCAG 2.2 (with 2.0 and 2.1) only | No specific regulation named |
| **508** | Revised Section 508 (WCAG 2.0 A and AA plus 508 chapters) | US federal procurement |
| **EU** | EN 301 549 (the template still points at V3.2.1) | European Union procurement |
| **INT** | All three combined | International markets, several regulations at once |

</details>

## Process

1. **Ingest audit results** - reads completed web or document accessibility audit reports
2. **Map to framework** - correlates WCAG success criteria to the selected legal framework's requirements
3. **Determine conformance levels** - Supports/Partially Supports/Does Not Support/Not Applicable
4. **Generate report** - produces the VPAT or compliance document in the appropriate format
5. **Add context** - includes known limitations, remediation timelines, and testing methodology

## Handoffs

Each target, with its when.

| Target | When |
|--------|------|
| `accessibility-lead` | Run a web audit to generate findings for mapping |
| `document-accessibility-wizard` | Run a document audit to generate findings for mapping |
| `accessibility-statement` | Generate a public accessibility statement from the compliance report |

## Sample Usage

```text
/compliance-mapping Generate a VPAT 2.5Rev INT edition from the web audit 
report in WEB-ACCESSIBILITY-AUDIT.md.
```

```text
/compliance-mapping Map our document audit findings to EN 301 549 for 
EU procurement compliance.
```

## Required Tools

- `read`, `search`, `edit`, `askQuestions`

## API Scopes

No GitHub API access required. Operates on local audit report files.
