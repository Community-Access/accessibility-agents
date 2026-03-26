---
name: audit-document-conversion
description: Audit a document conversion (e.g. Word to PDF) by comparing the source and output to verify that accessibility features survived the export. Checks tagged structure, alt text, heading hierarchy, bookmarks, table headers, reading order, and form fields.
mode: agent
tools:
  - askQuestions
---

# Document Conversion Accessibility Audit

Compare a source Office document against its exported output (typically PDF) to verify that accessibility features were preserved during conversion.

## Source document (original)

**Path:** `${input:sourcePath}`

## Converted output

**Path:** `${input:outputPath}`

## Instructions

Use the **document-accessibility-wizard** to:

1. **Audit the source** — run the appropriate format specialist (word-accessibility, excel-accessibility, or powerpoint-accessibility) on the source document to establish a baseline of accessibility features present
2. **Audit the output** — run pdf-accessibility (or the appropriate specialist) on the converted file
3. **Compare results** — identify accessibility features that:
   - **Survived** — present in both source and output (e.g., alt text, headings)
   - **Lost** — present in source but missing in output (e.g., tag structure, table headers, reading order)
   - **Degraded** — present in both but lower quality in output (e.g., heading levels changed, alt text truncated)
   - **New issues** — problems introduced by the conversion process (e.g., missing bookmarks, lost form field labels)
4. **Report** — generate a conversion audit report with:
   - Feature preservation summary table (Survived / Lost / Degraded counts)
   - Detailed findings for each lost or degraded feature
   - Recommended fixes (fix in source and re-export vs. fix in output directly)
   - Export settings recommendations (e.g., "Save as PDF" options that preserve accessibility)
5. **Export guidance** — include format-specific export tips:
   - **Word → PDF:** Use `File → Save As → PDF` with "Document structure tags for accessibility" checked
   - **PowerPoint → PDF:** Use `File → Save As → PDF` with "Document structure tags" option
   - **Excel → PDF:** Note that Excel-to-PDF conversion often loses table structure — recommend HTML alternative

## Common Conversion Losses

Watch for these frequently lost features:

- Tagged PDF structure (headings, lists, tables)
- Alt text on images and charts
- Table header row repeat
- Reading order (especially in complex layouts)
- Bookmarks / navigation
- Form field tooltips and labels
- Document language setting
- Hyperlink destinations
