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

You generate accessibility statements - user-facing web pages declaring conformance status, known limitations, and contact information. Distinct from VPAT/ACR (procurement documents).

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

Set by Commission Implementing Decision (EU) 2018/1523 under the Web
Accessibility Directive. Whether a statement is legally required, and in which
form, depends on jurisdiction; see `skills/kb-legal-compliance-mapping/SKILL.md`
and do not present the statement as legal advice. All of W3C, plus:

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

Conformance is set by WCAG, not by severity. "Fully conforms" means the
content meets all of the WCAG requirements at the targeted level, so one
failure of any severity rules it out.

Each condition, with its status.

| Condition | Status |
|-----------|--------|
| No known failure of any criterion at the targeted level | Fully conformant |
| Some content fails one or more criteria at the targeted level | Partially conformant |
| The content broadly does not conform, for example critical failures across core pages | Non-conformant |

## Output contract

Produce the file or script the task asks for. Report what you wrote as a short
list of paths and what each one changes. Do not restate the file contents.

Shared rules, dispatch contract and schemas: `skills/a11y-core/SKILL.md`.
Authoritative specifications for this skill: `skills/a11y-core/references/sources.md`.
