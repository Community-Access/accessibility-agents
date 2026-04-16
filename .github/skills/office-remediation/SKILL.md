---
name: office-remediation
description: Remediate Office documents (Word/Excel/PowerPoint) for accessibility. Generates Python scripts via python-docx, openpyxl, python-pptx API references.
---

# Office Remediation Patterns Skill

API reference and code patterns for programmatically fixing accessibility issues in Microsoft Office documents.

---

## python-docx Patterns (Word .docx)

### Set Document Title

```python
from docx import Document
doc = Document("input.docx")
doc.core_properties.title = "Descriptive Title"
doc.save("output.docx")
```

### Set Document Language

```python
from docx import Document
from docx.oxml.ns import qn
from lxml import etree

doc = Document("input.docx")
styles_element = doc.styles.element
rPrDefault = styles_element.find(qn("w:docDefaults/w:rPrDefault/w:rPr"))
if rPrDefault is not None:
    lang = rPrDefault.find(qn("w:lang"))
    if lang is None:
        lang = etree.SubElement(rPrDefault, qn("w:lang"))
    lang.set(qn("w:val"), "en-US")
doc.save("output.docx")
```

### Set Table Header Row

```python
from docx import Document
from docx.oxml.ns import qn
from lxml import etree

doc = Document("input.docx")
for table in doc.tables:
    first_row = table.rows[0]._tr
    trPr = first_row.get_or_add_trPr()
    existing = trPr.find(qn("w:tblHeader"))
    if existing is None:
        header_elem = etree.SubElement(trPr, qn("w:tblHeader"))
        header_elem.set(qn("w:val"), "true")
doc.save("output.docx")
```

### Add Alt Text to Images

```python
from docx import Document
from docx.oxml.ns import qn

doc = Document("input.docx")
for rel in doc.part.rels.values():
    if "image" in rel.reltype:
        # Images are referenced via <wp:docPr> in the document XML
        # Alt text is the 'descr' attribute on the docPr element
        pass

# Direct XML approach for inline images:
body = doc.element.body
for docPr in body.iter(qn("wp:docPr")):
    if not docPr.get("descr"):
        docPr.set("descr", "TODO: Add alt text")
doc.save("output.docx")
```

### Fix Heading Levels

```python
from docx import Document

HEADING_MAP = {
    "Heading 3": "Heading 2",  # Example: fix skipped level
}

doc = Document("input.docx")
for para in doc.paragraphs:
    if para.style.name in HEADING_MAP:
        para.style = doc.styles[HEADING_MAP[para.style.name]]
doc.save("output.docx")
```

---

## openpyxl Patterns (Excel .xlsx)

### Set Workbook Title and Author

```python
from openpyxl import load_workbook

wb = load_workbook("input.xlsx")
wb.properties.title = "Descriptive Title"
wb.properties.creator = "Author Name"
wb.save("output.xlsx")
```

### Set Print Title Rows (Header Repeat)

```python
from openpyxl import load_workbook

wb = load_workbook("input.xlsx")
for ws in wb.worksheets:
    if ws.max_row > 1:
        ws.print_title_rows = "1:1"  # Repeat row 1 on every printed page
wb.save("output.xlsx")
```

### Detect Generic Sheet Names

```python
GENERIC = {"Sheet", "Sheet1", "Sheet2", "Sheet3", "Tabelle1", "Feuil1"}

from openpyxl import load_workbook
wb = load_workbook("input.xlsx")
for ws in wb.worksheets:
    if ws.title in GENERIC:
        print(f"Generic sheet name: '{ws.title}' — rename to describe content")
```

### Detect Merged Cells

```python
from openpyxl import load_workbook

wb = load_workbook("input.xlsx")
for ws in wb.worksheets:
    if ws.merged_cells.ranges:
        for merged in ws.merged_cells.ranges:
            print(f"Sheet '{ws.title}': merged range {merged}")
```

---

## python-pptx Patterns (PowerPoint .pptx)

### Set Presentation Title

```python
from pptx import Presentation

prs = Presentation("input.pptx")
prs.core_properties.title = "Descriptive Title"
prs.save("output.pptx")
```

### Check for Missing Slide Titles

```python
from pptx import Presentation

prs = Presentation("input.pptx")
for i, slide in enumerate(prs.slides, 1):
    title_shape = slide.shapes.title
    if title_shape is None:
        print(f"Slide {i}: No title placeholder")
    elif not title_shape.text.strip():
        print(f"Slide {i}: Empty title")
```

### Set Alt Text on Images

```python
from pptx import Presentation
from pptx.enum.shapes import MSO_SHAPE_TYPE

prs = Presentation("input.pptx")
for i, slide in enumerate(prs.slides, 1):
    for shape in slide.shapes:
        if shape.shape_type == MSO_SHAPE_TYPE.PICTURE:
            if not getattr(shape, "_element").get("descr", ""):
                # Access via XML for older python-pptx versions
                shape._element.set("descr", "TODO: Add alt text")
prs.save("output.pptx")
```

### Check Reading Order

```python
from pptx import Presentation
from lxml import etree

prs = Presentation("input.pptx")
for i, slide in enumerate(prs.slides, 1):
    shapes = [(s.left, s.top, s.name) for s in slide.shapes]
    # Visual order (top-to-bottom, left-to-right) vs. XML order
    visual = sorted(shapes, key=lambda s: (s[1], s[0]))
    xml_order = [s.name for s in slide.shapes]
    visual_order = [s[2] for s in visual]
    if xml_order != visual_order:
        print(f"Slide {i}: Reading order may differ from visual layout")
```

---

## PowerShell COM Automation (Windows + Office)

### Word — Set Title

```powershell
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Open("C:\path\document.docx")
$doc.BuiltinDocumentProperties("Title").Value = "Accessible Title"
$doc.Save()
$doc.Close()
$word.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
```

### Excel — Set Title and Sheet Names

```powershell
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$wb = $excel.Workbooks.Open("C:\path\spreadsheet.xlsx")
$wb.BuiltinDocumentProperties("Title").Value = "Accessible Title"
# Rename sheets (example)
# $wb.Sheets.Item(1).Name = "Revenue Data"
$wb.Save()
$wb.Close()
$excel.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
```

### PowerPoint — Set Title

```powershell
$ppt = New-Object -ComObject PowerPoint.Application
$prs = $ppt.Presentations.Open("C:\path\presentation.pptx")
$prs.BuiltinDocumentProperties("Title").Value = "Accessible Title"
$prs.Save()
$prs.Close()
$ppt.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($ppt) | Out-Null
```

---

## OOXML Direct Manipulation (ZIP + XML)

For environments without Python or Office, documents can be manipulated directly as ZIP archives:

### Extract and Edit core.xml (Title/Language)

```bash
# Extract
mkdir -p extracted
unzip -o document.docx -d extracted

# Edit title in docProps/core.xml
sed -i 's|<dc:title/>|<dc:title>Accessible Title</dc:title>|' extracted/docProps/core.xml

# Repackage
cd extracted && zip -r ../document-fixed.docx . && cd ..
```

### Key OOXML Paths

| Property | File | XML Element |
|----------|------|-------------|
| Title | `docProps/core.xml` | `<dc:title>` |
| Author | `docProps/core.xml` | `<dc:creator>` |
| Language | `word/settings.xml` | `<w:themeFontLang>` |
| Heading styles | `word/document.xml` | `<w:pStyle w:val="Heading1">` |
| Alt text | `word/document.xml` | `<wp:docPr descr="...">` |
| Table headers | `word/document.xml` | `<w:tblHeader/>` |

---

## Safety Rules

1. **Always back up** the original file before any modification
2. **Never overwrite** — use `-fixed` suffix or separate output path
3. **Validate after fix** — recommend Microsoft Accessibility Checker or re-audit
4. **COM cleanup** — always `ReleaseComObject` and `Quit()` after COM automation
5. **Encoding** — OOXML uses UTF-8; preserve BOM if present in core.xml
