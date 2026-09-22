# audit-document-conversion

> **Historical.** This document describes the repository as it was before
> version 7.0, when agents lived in six per-client directories. It is kept
> for the record and is not maintained. The current layout is one `skills/`
> directory; start at [the documentation index](../README.md).
> Original path: `docs/prompts/documents/audit-document-conversion.md`.

Compare a source Office document against its exported PDF to detect accessibility losses during conversion. Catches issues like lost heading structure, missing alt text, broken reading order, and missing table headers that occur when saving or printing to PDF.

## When to Use It

- After exporting a Word, Excel, or PowerPoint document to PDF
- When you want to verify that Save As PDF or Print to PDF preserved accessibility
- Before publishing a PDF version alongside an Office source document
- When troubleshooting why a PDF fails accessibility checks despite the source document passing

## How to Launch It

**In GitHub Copilot Chat:**

```text
/audit-document-conversion
```

Provide both file paths when prompted:

```text
/audit-document-conversion
Source: C:\documents\report.docx
Output: C:\documents\report.pdf
```

## What It Does

1. Audits the source Office document for accessibility
2. Audits the output PDF for accessibility
3. Compares results to identify losses introduced during conversion
4. Reports conversion-specific issues with remediation guidance
5. Provides export setting recommendations for better conversion

## Common Conversion Losses Detected

- Heading structure flattened to visual-only formatting
- Alt text present in source but missing in PDF
- Table headers not tagged in PDF output
- Reading order differs from source document
- Bookmarks not generated from heading structure
- Document language not carried to PDF metadata
- Color contrast changes from print/export color profiles

## Related

- [audit-single-document](./audit-single-document.md) — Audit one document
- [pdf-remediator](./pdf-remediator.md) — Fix PDF issues after conversion
- [document-accessibility-wizard](../../../reference/skills/document-accessibility-wizard.md) — Full audit workflow
