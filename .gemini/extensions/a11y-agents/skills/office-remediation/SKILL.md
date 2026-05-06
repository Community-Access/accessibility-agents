---
name: Office Remediation Patterns
description: Office document OOXML manipulation patterns for accessibility remediation. Covers python-docx, openpyxl, python-pptx API references, PowerShell COM automation snippets, and direct OOXML XML manipulation for fixing accessibility issues in Word, Excel, and PowerPoint files.
---
<!-- CANONICAL SOURCE: .github/skills/office-remediation/SKILL.md -- Edit the canonical source; sync to Gemini via scripts/check-gemini-sync.ps1 -->

# Office Remediation Patterns

API reference and code patterns for programmatically fixing accessibility issues in Microsoft Office documents.

## python-docx Patterns (Word .docx)

| Operation | Code |
|-----------|------|
| Set document title | `doc.core_properties.title = "Title"` |
| Set document language | Set `<w:lang w:val="en-US"/>` on `<w:rPr>` via lxml |
| Fix table headers | `row.cells[0]._tc` → set `<w:tblHeader/>` on first row `<w:trPr>` |
| Add alt text to images | Set `descr` attribute on `<wp:docPr>` via lxml |
| Fix heading levels | Reassign `paragraph.style` to correct `Heading N` |
| Set list structure | Apply `List Bullet` / `List Number` styles |

## openpyxl Patterns (Excel .xlsx)

| Operation | Code |
|-----------|------|
| Set workbook title | `wb.properties.title = "Title"` |
| Set print titles | `ws.print_title_rows = '1:1'` for header row repeat |
| Rename generic sheets | `ws.title = "Descriptive Name"` |
| Detect merged cells | `ws.merged_cells.ranges` — flag width > 1 |

## python-pptx Patterns (PowerPoint .pptx)

| Operation | Code |
|-----------|------|
| Set presentation title | `prs.core_properties.title = "Title"` |
| Add slide titles | Add `PP_PLACEHOLDER.TITLE` placeholder with text |
| Add alt text to shapes | `shape._element.set(qn('p:nvSpPr/p:cNvPr'), ...)` → set `descr` |
| Fix reading order | Reorder `<p:spTree>` children by visual position |
| Add table headers | Set first row cells as header via `<a:tblPr firstRow="1">` |

## PowerShell COM Automation

```powershell
# Word
$word = New-Object -ComObject Word.Application
$doc = $word.Documents.Open("C:\path\file.docx")
$doc.BuiltInDocumentProperties("Title").Value = "Title"
$doc.Save(); $doc.Close(); $word.Quit()

# Excel
$excel = New-Object -ComObject Excel.Application
$wb = $excel.Workbooks.Open("C:\path\file.xlsx")
$wb.BuiltInDocumentProperties("Title").Value = "Title"
$wb.Save(); $wb.Close(); $excel.Quit()

# PowerPoint
$ppt = New-Object -ComObject PowerPoint.Application
$prs = $ppt.Presentations.Open("C:\path\file.pptx")
$prs.BuiltInDocumentProperties("Title").Value = "Title"
$prs.Save(); $prs.Close(); $ppt.Quit()
```

## Key OOXML Paths

| Format | ZIP Path | XML Element |
|--------|----------|-------------|
| DOCX | `docProps/core.xml` | `<dc:title>` |
| DOCX | `word/document.xml` | `<w:lang>`, `<w:tblHeader/>` |
| XLSX | `docProps/core.xml` | `<dc:title>` |
| XLSX | `xl/workbook.xml` | `<sheet name="">` |
| PPTX | `docProps/core.xml` | `<dc:title>` |
| PPTX | `ppt/slides/slideN.xml` | `<p:spTree>` ordering |
