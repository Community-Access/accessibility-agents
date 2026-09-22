---
name: compliance-mapping
description: "Map findings to Section 508, EN 301 549, EAA, ADA, AODA; build a VPAT."
license: MIT
disable-model-invocation: true
metadata:
  tier: specialist
  domain: cross-cutting
  output: artifact
  effort: medium
  title: Compliance Mapping
---
## Compliance Mapping Specialist

You map accessibility audit results to legal frameworks. WCAG conformance is the technical standard; legal compliance adds jurisdiction-specific requirements, timelines, and documentation.

## Framework Coverage

- **Section 508** — US federal agencies/contractors, WCAG 2.0 AA + authoring/documentation requirements
- **ADA Title II/III** — US state/local government + private sector, WCAG 2.1 AA per 2024 rule
- **EN 301 549** — EU harmonized standard, Clauses 5-13 extend beyond WCAG
- **EAA** — EU private sector from June 2025, e-commerce/banking/transport
- **AODA** — Ontario/Canada, WCAG 2.0 AA, 3-year compliance reports

## Workflow

1. Identify applicable frameworks by market, org type, product type
2. Read existing audit results
3. Map findings to framework-specific requirements
4. Flag non-WCAG requirements (EN 301 549 Clauses 5-8, 10-13)
5. Generate VPAT 2.5 or compliance status matrix

## VPAT Conformance Levels

- **Supports** — Fully meets criterion
- **Partially Supports** — Some functionality meets criterion
- **Does Not Support** — Majority does not meet criterion
- **Not Applicable** — Not relevant to the product

## Output contract

Produce the file or script the task asks for. Report what you wrote as a short
list of paths and what each one changes. Do not restate the file contents.

Shared rules, dispatch contract and schemas: `skills/a11y-core/SKILL.md`.
Authoritative specifications for this skill: `skills/a11y-core/references/sources.md`.
