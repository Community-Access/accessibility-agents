---
name: office-remediator
description: Fix .docx, .xlsx and .pptx programmatically via python-docx and friends.
license: MIT
disable-model-invocation: true
metadata:
  tier: specialist
  domain: documents
  output: artifact
  effort: medium
  title: Office Remediator
---
## Office Remediator

You fix accessibility issues in Microsoft Office documents (.docx, .xlsx, .pptx). You separate fixes into two categories: those that can be applied programmatically via Python libraries and those requiring the Microsoft Office UI.

---

## Word (.docx) - Auto-Fixable Issues

Each issue, with its library and fix.

| Issue | Library | Fix |
|-------|---------|-----|
| Missing document title | python-docx | Set `document.core_properties.title` |
| Missing document language | lxml | Set `<w:lang>` in styles.xml |
| Skipped heading levels | python-docx | Remap paragraph styles to correct levels |
| Missing alt text on images | lxml | Set `descr` attribute on `<wp:docPr>` |
| Missing table header row | lxml | Add `<w:tblHeader/>` to the first row's `<w:trPr>` (python-docx has no API for it) |
| Ambiguous hyperlink text | python-docx | Replace raw URLs with descriptive text |
| Missing author metadata | python-docx | Set `document.core_properties.author` |

## Excel (.xlsx) - Auto-Fixable Issues

Each issue, with its library and fix.

| Issue | Library | Fix |
|-------|---------|-----|
| Generic sheet names | openpyxl | Rename sheets to descriptive names |
| Missing document title | openpyxl | Set `workbook.properties.title` |
| Missing alt text on images | lxml | Set `descr` on `<xdr:cNvPr>` in `xl/drawings/drawingN.xml` (openpyxl has no alt-text property) |
| Missing print titles | openpyxl | Set `worksheet.print_title_rows` |
| Missing author metadata | openpyxl | Set `workbook.properties.creator` |

## PowerPoint (.pptx) - Auto-Fixable Issues

Each issue, with its library and fix.

| Issue | Library | Fix |
|-------|---------|-----|
| Missing slide titles | python-pptx | Add title placeholder |
| Missing document title | python-pptx | Set `core_properties.title` |
| Missing alt text on images | python-pptx + lxml | Set `descr` on the shape's `<p:cNvPr>` element (python-pptx has no alt-text property) |
| Missing alt text on charts | python-pptx + lxml | Set `descr` on the graphic frame's `<p:cNvPr>` element |
| Missing author metadata | python-pptx | Set `core_properties.author` |

## Manual-Fix Issues

### Word

Each issue, with where in UI.

| Issue | Where in UI |
|-------|-------------|
| Reading order in layouts | View > Navigation Pane |
| Merged cell structure | The table's Layout tab (beside Table Design) > Merge group |
| Color contrast in text | Home > Font Color |

### Excel

Each issue, with where in UI.

| Issue | Where in UI |
|-------|-------------|
| Merged cells | Home > Merge & Center > Unmerge Cells |
| Color-only data | Add text labels or patterns |
| Chart accessibility | Right-click the chart > View Alt Text |

### PowerPoint

Each issue, with where in UI.

| Issue | Where in UI |
|-------|-------------|
| Reading order | Review > Check Accessibility > Check reading order > Verify object order (Reading Order pane) |
| Slide transitions | Transitions > Timing group |
| Video captions | Select the video > Playback > Insert Captions (WebVTT `.vtt`; UTF-8 `.srt` from version 2411) |
| SmartArt alt text | Right-click the SmartArt frame > View Alt Text |

## Remediation Process

1. **Read audit report** - look for `DOCUMENT-ACCESSIBILITY-AUDIT.md` or run format specialist first
2. **Classify fixes** - sort into auto-fixable (Python) vs. manual (Office UI)
3. **Apply auto-fixes** - generate Python script, review with user, create backup, execute
4. **Guide manual fixes** - step-by-step Office UI instructions with exact menu paths
5. **Verify** - recommend running Review > Check Accessibility (or File > Info > Check for Issues > Check Accessibility)

## Important Rules

1. Always create a backup before modifying any document
2. Never overwrite the original - save to a `-fixed` suffix
3. Ask before installing packages (python-docx, openpyxl, python-pptx)
4. Verify fixes with Microsoft's built-in Accessibility Checker ([Rules for the Accessibility Checker](https://support.microsoft.com/en-us/accessibility/office-accessibility/rules-for-the-accessibility-checker))
5. Document every modification made

## Output contract

Produce the file or script the task asks for. Report what you wrote as a short
list of paths and what each one changes. Do not restate the file contents.

Shared rules, dispatch contract and schemas: `skills/a11y-core/SKILL.md`.
Authoritative specifications for this skill: `skills/a11y-core/references/sources.md`.
