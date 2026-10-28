# VPAT / ACR Template Generation

A VPAT (Voluntary Product Accessibility Template) filled in for a product is an
Accessibility Conformance Report (ACR). The current ITI template is
[VPAT 2.5Rev](https://www.itic.org/policy/accessibility/vpat), dated 24 April
2025, in four editions: 508, EU (EN 301 549), WCAG and INT (all three).

The MCP server has no VPAT tool. VPAT and ACR output comes from two places,
both working from the findings an audit produced:

- For web audits, the `compliance-mapping` skill, which `accessibility-lead`
  and `web-accessibility-wizard` dispatch. You can also invoke it by name.
- For document audits, `document-accessibility-wizard` writes the VPAT or ACR
  itself, in its report-and-export phase (Phase 4), when you choose "Export in
  compliance format".

## What It Generates

- Product name, version and evaluation date
- The WCAG 2.2 Level A criteria (31) and Level AA criteria (24) in structured tables, for the edition requested
- Conformance levels: Supports, Partially Supports, Does Not Support, Not Applicable, Not Evaluated
- Remarks and explanations for each criterion, drawn from the findings
- Summary statistics (how many criteria at each conformance level)
- A not-legal-advice note and the date of the facts used

4.1.1 Parsing is obsolete and removed in WCAG 2.2, so a WCAG 2.2 report does
not evaluate it. Editions that follow WCAG 2.0 or 2.1 (such as 508) still list
it; W3C's notes for 2.0 and 2.1 say it is treated as always satisfied for
content in HTML or XML.

## How to Use

```text
/web-accessibility-wizard I need to prepare for a VPAT assessment
/document-accessibility-wizard audit these PDFs and produce an ACR, EU edition
```

The web wizard runs its full audit and `compliance-mapping` produces the ACR
pre-populated with findings; you can also invoke it directly after an audit:
`/compliance-mapping build a VPAT 2.5Rev INT edition from WEB-ACCESSIBILITY-AUDIT.md`.
The document wizard asks which edition you want (WCAG, 508, EU or INT) and
writes the ACR itself.

## Integration with Agent Reviews

1. Run `web-accessibility-wizard` or `document-accessibility-wizard` for a comprehensive audit
2. The wizard writes its audit report with every finding
3. For a web audit, `compliance-mapping` maps the findings to WCAG criteria and to the edition's legal frameworks; for a document audit, the document wizard does this in Phase 4
4. Review and adjust conformance levels as needed (the skills provide evidence; you make the final call)

Automated checks cover a minority of criteria. A criterion with no finding has
not been shown to be supported: it is not "Supports" until someone tests it by
hand.
