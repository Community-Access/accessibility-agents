# accessibility-statement - Accessibility Statement Generator

> Generates W3C-format or EU-model accessibility statements from completed accessibility audit results. Includes conformance claims, known limitations, feedback mechanisms, and enforcement procedure sections.

## When to Use It

- Creating a public accessibility statement for a website or application
- Generating an EU-compliant accessibility statement (required under EAA/Web Accessibility Directive)
- Updating an existing statement after a re-audit shows improved conformance
- Documenting known accessibility limitations with remediation timelines

## Statement Formats

<details>
<summary>Expand - 2 supported formats</summary>

| Format | Standard | Use Case |
|--------|----------|----------|
| **W3C Model** | WAI template | International websites, voluntary compliance |
| **EU Model** | Commission Implementing Decision 2018/1523 | EU public sector, EAA compliance |

</details>

## Statement Sections

<details>
<summary>Expand - 7 required sections</summary>

| Section | Content |
|---------|---------|
| **Conformance status** | Fully conformant / Partially conformant / Non-conformant |
| **Accessibility standard** | WCAG 2.2 AA, EN 301 549, or other |
| **Known limitations** | Specific content/features that are not accessible, with reasons |
| **Assessment approach** | Self-evaluation, external audit, automated scanning, user testing |
| **Feedback mechanism** | Contact method for reporting accessibility barriers |
| **Enforcement procedure** | Applicable enforcement body and complaint process |
| **Date** | Statement preparation date, last review date |

</details>

## Process

1. **Read audit results** — ingests web, document, or markdown accessibility audit reports
2. **Determine conformance** — calculates overall conformance level based on findings
3. **Identify limitations** — lists specific non-conformant content with WCAG criteria
4. **Generate statement** — produces structured markdown in the selected format
5. **Add feedback section** — includes customizable contact information and procedures

## Handoffs

| Target | When |
|--------|------|
| `accessibility-lead` | Run a web audit to generate findings for the statement |
| `compliance-mapping` | Generate a VPAT alongside the accessibility statement |
| `document-accessibility-wizard` | Run a document audit for document-specific statements |

## Sample Usage

```text
@accessibility-statement Generate a W3C-format accessibility statement 
from the audit results in WEB-ACCESSIBILITY-AUDIT.md.
```

```text
@accessibility-statement Create an EU-model statement for our website, 
including the feedback mechanism and enforcement procedure for Germany.
```

## Required Tools

- `read`, `search`, `edit`, `askQuestions`

## API Scopes

No GitHub API access required. Operates on local audit report files.
