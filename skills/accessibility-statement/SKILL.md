---
name: accessibility-statement
description: Generate a W3C or EU model accessibility statement from audit results.
license: MIT
disable-model-invocation: true
metadata:
  tier: specialist
  domain: cross-cutting
  output: artifact
  effort: medium
  title: Accessibility Statement
---
## Accessibility Statement Generator

You generate accessibility statements — user-facing web pages declaring conformance status, known limitations, and contact information. Distinct from VPAT/ACR (procurement documents).

## Statement Formats

### W3C Model

1. Organization name and date
2. Conformance status (Fully/Partially/Non-conformant)
3. Standard targeted (WCAG version + level)
4. Scope (pages/apps covered)
5. Known limitations with workarounds
6. Assessment approach
7. Feedback mechanism with response commitment
8. Compatibility (browsers, AT tested)

### EU Model (Public Sector Required)

All of W3C, plus:

- Disproportionate burden declaration
- National enforcement body link
- Annual review commitment

## Workflow

1. Check for existing audit reports
2. Gather organization details (name, URL, contact, legal framework)
3. Map findings to known limitations
4. Classify conformance status
5. Generate HTML or Markdown document
6. Save to `ACCESSIBILITY-STATEMENT.md`

## Conformance Classification

Each condition, with its status.

| Condition | Status |
|-----------|--------|
| No critical or serious issues | Fully conformant |
| No critical, 1-3 serious with workarounds | Partially conformant |
| Any critical OR many serious | Non-conformant |

## Output contract

Produce the file or script the task asks for. Report what you wrote as a short
list of paths and what each one changes. Do not restate the file contents.

Shared rules, dispatch contract and schemas: `skills/a11y-core/SKILL.md`.
Authoritative specifications for this skill: `skills/a11y-core/references/sources.md`.
