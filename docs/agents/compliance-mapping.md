# compliance-mapping - Legal Compliance Mapping

> Maps accessibility audit results to legal frameworks including Section 508, EN 301 549, EAA/European Accessibility Act, ADA, and AODA. Generates VPAT 2.5 reports in INT, EU, and WCAG editions with conformance claims, known limitations, and remediation timelines.

## When to Use It

- Generating VPAT 2.5 / ACR reports from completed accessibility audits
- Mapping WCAG 2.2 findings to Section 508 functional performance criteria
- Preparing documentation for procurement accessibility requirements
- Understanding which legal framework applies to your product or region
- Converting between different compliance reporting formats

## Legal Frameworks

<details>
<summary>Expand - 5 supported frameworks</summary>

| Framework | Region | Standard | Key Document |
|-----------|--------|----------|-------------|
| **Section 508** | United States | WCAG 2.0 AA (Revised 508) | VPAT 2.5 |
| **EN 301 549** | European Union | WCAG 2.1 AA + additional | EU Declaration |
| **EAA** | European Union | EN 301 549 v3.2.1 | Accessibility Statement |
| **ADA** | United States | No fixed standard (case law) | Voluntary compliance report |
| **AODA** | Ontario, Canada | WCAG 2.0 AA | AODA compliance report |

</details>

## VPAT Editions

<details>
<summary>Expand - 3 VPAT 2.5 editions</summary>

| Edition | Scope | When to Use |
|---------|-------|-------------|
| **INT** | WCAG 2.x only | International markets, no specific regulation |
| **EU** | WCAG 2.x + EN 301 549 | European Union procurement |
| **508** | WCAG 2.x + Section 508 | US federal procurement |

</details>

## Process

1. **Ingest audit results** — reads completed web or document accessibility audit reports
2. **Map to framework** — correlates WCAG success criteria to the selected legal framework's requirements
3. **Determine conformance levels** — Supports/Partially Supports/Does Not Support/Not Applicable
4. **Generate report** — produces the VPAT or compliance document in the appropriate format
5. **Add context** — includes known limitations, remediation timelines, and testing methodology

## Handoffs

| Target | When |
|--------|------|
| `accessibility-lead` | Run a web audit to generate findings for mapping |
| `document-accessibility-wizard` | Run a document audit to generate findings for mapping |
| `accessibility-statement` | Generate a public accessibility statement from the compliance report |

## Sample Usage

```text
@compliance-mapping Generate a VPAT 2.5 INT edition from the web audit 
report in WEB-ACCESSIBILITY-AUDIT.md.
```

```text
@compliance-mapping Map our document audit findings to EN 301 549 for 
EU procurement compliance.
```

## Required Tools

- `read`, `search`, `edit`, `askQuestions`

## API Scopes

No GitHub API access required. Operates on local audit report files.
