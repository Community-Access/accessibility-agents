# office-remediator - Office Document Accessibility Remediator

> Fixes accessibility issues in Microsoft Office documents (.docx, .xlsx, .pptx). Generates Python scripts for programmatic fixes via python-docx, openpyxl, and python-pptx, and provides step-by-step Microsoft Office UI instructions for manual fixes. The Office counterpart to `pdf-remediator`.

## When to Use It

- After running word-accessibility, excel-accessibility, or powerpoint-accessibility and receiving findings
- When you need to batch-fix common Office accessibility issues (title, alt text, headings, table headers)
- When you need guided Office UI instructions for complex fixes (reading order, merged cells, color contrast)
- Before publishing or distributing Office documents that failed accessibility checks

## Fix Categories

<details>
<summary>Expand - Word auto-fixable issues (7 types via python-docx)</summary>

| Issue | Fix |
|-------|-----|
| Missing document title | Set `core_properties.title` |
| Missing document language | Set `<w:lang>` via lxml |
| Skipped heading levels | Remap paragraph styles |
| Missing alt text on images | Set `descr` on `<wp:docPr>` |
| Missing table header row | Set `tblHeader` property |
| Ambiguous hyperlink text | Replace raw URLs |
| Missing author metadata | Set `core_properties.author` |

</details>

<details>
<summary>Expand - Excel auto-fixable issues (5 types via openpyxl)</summary>

| Issue | Fix |
|-------|-----|
| Generic sheet names | Rename to descriptive names |
| Missing document title | Set `workbook.properties.title` |
| Missing alt text on images | Set `image.description` |
| Missing print titles | Set `print_title_rows` |
| Missing author metadata | Set `workbook.properties.creator` |

</details>

<details>
<summary>Expand - PowerPoint auto-fixable issues (5 types via python-pptx)</summary>

| Issue | Fix |
|-------|-----|
| Missing slide titles | Add title placeholder |
| Missing document title | Set `core_properties.title` |
| Missing alt text | Set `shape.alt_text` |
| Missing alt text on charts | Set `chart_frame.alt_text` |
| Missing author metadata | Set `core_properties.author` |

</details>

<details>
<summary>Expand - Manual-fix issues (Office UI required)</summary>

| Format | Issue | Where in UI |
|--------|-------|-------------|
| Word | Reading order in layouts | View → Navigation Pane |
| Word | Merged cell structure | Table Tools → Layout |
| Word | Color contrast | Home → Font Color |
| Excel | Merged cells | Home → Merge & Center |
| Excel | Color-only data | Add text labels/patterns |
| Excel | Chart alt text | Chart → Format → Alt Text |
| PowerPoint | Reading order | Arrange → Selection Pane |
| PowerPoint | Video captions | Insert → Video → captions |
| PowerPoint | SmartArt alt text | Format → Alt Text |

</details>

## Process

1. **Read audit report** — looks for existing `DOCUMENT-ACCESSIBILITY-AUDIT.md`
2. **Classify fixes** — separates into auto-fixable (Python) vs. manual (Office UI)
3. **Generate script** — creates a Python remediation script for the specific format
4. **Guide manual fixes** — provides step-by-step Office UI instructions
5. **Verify** — recommends `File → Info → Check for Issues → Check Accessibility`

## Fix Approaches

| Approach | When to Use |
|----------|-------------|
| **Python script** | Default — works without Office installed |
| **PowerShell COM** | Windows with Office installed — more reliable for complex fixes |
| **OOXML direct** | No Python or Office — edit ZIP/XML directly |

## Handoffs

| Target | When |
|--------|------|
| `word-accessibility` | Run a Word audit before remediation |
| `excel-accessibility` | Run an Excel audit before remediation |
| `powerpoint-accessibility` | Run a PowerPoint audit before remediation |
| `document-accessibility-wizard` | Run the full document audit workflow |

## Sample Usage

```text
@office-remediator Fix the accessibility issues in quarterly-report.docx — 
set the title, add table headers, and fix the heading levels.
```

```text
@office-remediator My spreadsheet has generic sheet names and missing alt text 
on charts. Generate a fix script for data-summary.xlsx.
```

## Required Tools

- `read`, `search`, `edit`, `runInTerminal`, `askQuestions`
- External: python-docx, openpyxl, python-pptx (pip install)

## API Scopes

No GitHub API access required. Operates on local files only.
