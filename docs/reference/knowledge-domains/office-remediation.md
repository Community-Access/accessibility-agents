# office-remediation Skill

> Office document OOXML manipulation patterns for accessibility remediation. Covers python-docx, openpyxl, python-pptx API references, PowerShell COM automation snippets, and direct OOXML XML manipulation for fixing accessibility issues in Word, Excel, and PowerPoint files.

## Agents That Use This Skill

Each agent, with its why.

| Agent | Why |
|-------|-----|
| [office-remediator](../skills/office-remediator.md) | Primary consumer - programmatic Office document remediation |
| [document-accessibility-wizard](../skills/document-accessibility-wizard.md) | References patterns when suggesting remediation |
| [word-accessibility](../skills/word-accessibility.md) | Word-specific remediation patterns |
| [excel-accessibility](../skills/excel-accessibility.md) | Excel-specific remediation patterns |
| [powerpoint-accessibility](../skills/powerpoint-accessibility.md) | PowerPoint-specific remediation patterns |

## python-docx Patterns (Word .docx)

Each operation, with its API reference.

| Operation | API Reference |
|-----------|---------------|
| Set document title | `doc.core_properties.title = "Title"` |
| Set document language | Set `<w:lang w:val="en-US"/>` on `<w:rPr>` via lxml |
| Fix table headers | Set `<w:tblHeader/>` on first row's `<w:trPr>` |
| Add alt text to images | Set `descr` attribute on `<wp:docPr>` element |
| Fix heading levels | Reassign `paragraph.style` to correct `Heading N` |
| Set list structure | Apply `List Bullet` / `List Number` paragraph styles |

## openpyxl Patterns (Excel .xlsx)

Each operation, with its API reference.

| Operation | API Reference |
|-----------|---------------|
| Set workbook title | `wb.properties.title = "Title"` |
| Set print titles | `ws.print_title_rows = '1:1'` for repeating header rows |
| Rename generic sheets | `ws.title = "Descriptive Sheet Name"` |
| Detect merged cells | Iterate `ws.merged_cells.ranges` and flag spans > 1 |

## python-pptx Patterns (PowerPoint .pptx)

Each operation, with its API reference.

| Operation | API Reference |
|-----------|---------------|
| Set presentation title | `prs.core_properties.title = "Title"` |
| Add missing slide titles | Add `PP_PLACEHOLDER.TITLE` placeholder with text |
| Add alt text to shapes | Set `descr` on shape's `<p:cNvPr>` element via lxml |
| Fix reading order | Reorder `<p:spTree>` children by visual position |
| Add table headers | Set `firstRow="1"` on `<a:tblPr>` element |

## PowerShell COM Automation

The skill includes PowerShell COM patterns for automating Office fixes without Python:

- **Word** — `New-Object -ComObject Word.Application` for document property updates, style application, and table header marking
- **Excel** — `New-Object -ComObject Excel.Application` for workbook metadata, sheet naming, and cell formatting
- **PowerPoint** — `New-Object -ComObject PowerPoint.Application` for presentation metadata, slide title insertion, and alt text

## Key OOXML Paths

Each format, with its ZIP path and XML element.

| Format | ZIP Path | XML Element |
|--------|----------|-------------|
| DOCX | `docProps/core.xml` | `<dc:title>` |
| DOCX | `word/document.xml` | `<w:lang>`, `<w:tblHeader/>` |
| XLSX | `docProps/core.xml` | `<dc:title>` |
| XLSX | `xl/workbook.xml` | `<sheet name="">` |
| PPTX | `docProps/core.xml` | `<dc:title>` |
| PPTX | `ppt/slides/slideN.xml` | `<p:spTree>` ordering |

## Source

- **Copilot skill**: `skills/kb-office-remediation/SKILL.md`
- **Skill**: `skills/kb-office-remediation/SKILL.md`, read by every client
