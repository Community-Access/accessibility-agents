# Excel Accessibility reference: Complete Rule Set

Part of the `excel-accessibility` skill. Read this only when the task reaches these sections.

## Complete Rule Set

### Errors - Blocking accessibility issues

Each rule ID, with name and what it checks.

| Rule ID | Name | What It Checks |
|---------|------|----------------|
| XLSX-E001 | missing-alt-text | Charts, images, shapes, PivotCharts without alternative text. In Open XML, check `<xdr:cNvPr>` in drawing XML for missing or empty `descr` attribute. |
| XLSX-E002 | missing-table-header | Data ranges formatted as tables without header rows. Check `<table>` elements in `xl/tables/` for `headerRowCount="0"` or missing headers. Also flag data ranges that look like tables but aren't formatted as Excel Table objects. |
| XLSX-E003 | default-sheet-name | Sheet tabs using default names ("Sheet1", "Sheet2", "Sheet3"). Check `<sheet name="...">` in `xl/workbook.xml`. |
| XLSX-E004 | merged-cells | Merged cells in data ranges. Check for `<mergeCells>` and `<mergeCell ref="...">` in worksheet XML. |
| XLSX-E005 | ambiguous-link-text | Hyperlinks with non-descriptive display text. Check `<hyperlink display="...">` in worksheet XML and hyperlink relationships. |
| XLSX-E006 | missing-workbook-title | Workbook title not set in properties. Check `<dc:title>` in `docProps/core.xml`. |
| XLSX-E007 | red-negative-numbers | Cells use red font color as the only indicator for negative numbers. Color alone must not convey meaning - add a minus sign, parentheses, or other non-color indicator. |
| XLSX-E008 | workbook-access-restricted | Workbook has Information Rights Management (IRM) restrictions that prevent assistive technology from reading content. Screen readers cannot access IRM-protected workbooks. |

### Warnings - Moderate accessibility issues

Each rule ID, with name and what it checks.

| Rule ID | Name | What It Checks |
|---------|------|----------------|
| XLSX-W001 | blank-cells-formatting | Blank cells, rows, or columns used for visual spacing or formatting instead of cell borders, alignment, or spacing. |
| XLSX-W002 | color-only-data | Conditional formatting or cell fill colors used as the sole indicator of meaning (e.g., red = overdue, green = complete) without text or icon alternatives. Check `<conditionalFormatting>` rules. |
| XLSX-W003 | complex-table-structure | Tables with nested or overly complex structures that will be difficult for screen readers to navigate. |
| XLSX-W004 | empty-sheet | Completely empty worksheets that add clutter and confusion. Check if worksheet XML contains any cell data. |
| XLSX-W005 | long-alt-text | Alt text exceeding 150 characters on charts or images. |

### Tips - Best practices

Each rule ID, with name and what it checks.

| Rule ID | Name | What It Checks |
|---------|------|----------------|
| XLSX-T001 | sheet-tab-order | Sheet tab order doesn't follow a logical sequence. Users should be able to navigate tabs in a meaningful order. |
| XLSX-T002 | missing-defined-names | Important cell ranges without defined names. Named ranges make formulas and navigation more accessible. Check `<definedNames>` in `xl/workbook.xml`. |
| XLSX-T003 | missing-workbook-language | Workbook language not set in `docProps/core.xml`. Screen readers use document language to select the correct speech synthesizer. |

## Rule Details and Remediation

### XLSX-E001: Missing Alt Text

**Impact:** Blind users cannot understand charts, images, or shapes. A chart without alt text is invisible data.

**Open XML location:** In drawing XML (`xl/drawings/drawingN.xml`):

```xml
<xdr:cNvPr id="2" name="Chart 1" descr="Line chart showing monthly sales trending upward from January to December"/>
```

Missing or empty `descr` is a violation.

**Remediation:**

1. Right-click the chart/image -> Edit Alt Text
2. Describe what the chart shows - include the data trend, not just "chart"
3. For complex charts, summarize the key insight: "Sales increased 23% year-over-year"
4. For decorative images, mark as decorative (the scanner detects the Office decorative flag and skips these)

### XLSX-E002: Missing Table Header

**Impact:** Screen readers announce cell positions (A1, B2) without context. Headers give meaning: "Revenue: $2.1M" instead of "B3: 2100000".

**Open XML location:** In `xl/tables/tableN.xml`:

```xml
<table ... headerRowCount="1" totalsRowCount="0">
  <tableColumns count="4">
    <tableColumn id="1" name="Region"/>
    <tableColumn id="2" name="Q1"/>
    <tableColumn id="3" name="Q2"/>
    <tableColumn id="4" name="Q3"/>
  </tableColumns>
</table>
```

Also check: data ranges that have header-like content in row 1 but are NOT formatted as an Excel Table object.

**Remediation:**

1. Select the data range
2. Insert tab -> Table (or Ctrl+T)
3. Ensure "My table has headers" is checked
4. Verify header names are descriptive

### XLSX-E003: Default Sheet Name

**Impact:** Screen reader users navigate between sheets by name. "Sheet1" provides no context about the content.

**Open XML location:** In `xl/workbook.xml`:

```xml
<sheets>
  <sheet name="Sheet1" sheetId="1" r:id="rId1"/>
  <sheet name="Revenue Summary" sheetId="2" r:id="rId2"/>
</sheets>
```

Sheet names matching the pattern `Sheet\d+` (or localized equivalents) are flagged.

**Remediation:**

1. Right-click the sheet tab -> Rename
2. Use a short, descriptive name: "Q3 Revenue", "Employee List", "Pivot Data"

### XLSX-E004: Merged Cells

**Impact:** Screen readers lose track of position in merged cell regions. A cell merged across B2:D2 is announced as B2 but the user cannot navigate to C2 or D2. They don't know the cell spans multiple columns.

**Open XML location:** In worksheet XML:

```xml
<mergeCells count="2">
  <mergeCell ref="B2:D2"/>
  <mergeCell ref="A5:A10"/>
</mergeCells>
```

**Remediation:**

1. Select the merged region -> Home tab -> Merge & Center -> Unmerge Cells
2. Use "Center Across Selection" format instead for visual centering without merging
3. Or restructure the data to avoid needing merged cells

### XLSX-E005: Ambiguous Link Text

**Impact:** Screen reader users navigate by links list. "Click here" x 15 is useless.

**Open XML location:** In worksheet XML:

```xml
<hyperlink ref="A5" r:id="rId1" display="Click here"/>
```

**Remediation:**

1. Right-click -> Edit Hyperlink -> Text to Display
2. Write descriptive text: "View full Q3 financial report"

### XLSX-E006: Missing Workbook Title

**Impact:** Screen readers announce the title when opening the file. Without one, users hear the filename.

**Remediation:**

1. File -> Info -> Properties -> Title
2. Enter a descriptive title: "2025 Annual Budget - Finance Department"
