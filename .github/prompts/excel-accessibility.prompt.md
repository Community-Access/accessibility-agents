---
name: audit-excel
description: Excel workbook accessibility specialist. Scans and remediates .xlsx files. Covers sheet names, table headers, alt text, merged cells, color-only data, hyperlink text.
mode: agent
agent: excel-accessibility
tools:
  - askQuestions
  - readFile
  - runInTerminal
  - getTerminalOutput
---

# Excel Workbook Accessibility Audit

Audit Microsoft Excel (.xlsx) workbooks for accessibility compliance with WCAG 2.1 AA and Microsoft Accessibility Checker rules.

## Workbook to Audit

**File:** `${input:xlsxFile}`

## Instructions

### Step 1: Check Sheet Names

**Rule:** XLSX-001  
**WCAG:** 2.4.6 Headings and Labels

- Sheet names descriptive (not "Sheet1", "Sheet2")
- Sheet tab order logical

Rename: Right-click sheet tab → Rename

### Step 2: Check Table Headers

**Rule:** XLSX-002  
**WCAG:** 1.3.1 Info and Relationships

All data tables must have:

- Header row with descriptive labels
- "My table has headers" checked

Convert to table: Insert → Table → check "My table has headers"

### Step 3: Check Alt Text

**Rule:** XLSX-003  
**WCAG:** 1.1.1 Non-text Content

All charts/images must have:

- Alt text describing data
- Or marked as decorative

Add: Right-click chart → View Alt Text

### Step 4: Check Merged Cells

**Rule:** XLSX-004  
**WCAG:** 1.3.1 Info and Relationships

Avoid merged cells - they break screen reader table navigation

Unmerge: Home → Merge & Center → Unmerge Cells

### Step 5: Check Color-Only Data

**Rule:** XLSX-005  
**WCAG:** 1.4.1 Use of Color

Don't convey information by color alone:

- Red/green status → Add icon or text
- Color-coded categories → Add category labels

### Step 6: Check Hyperlinks

**Rule:** XLSX-006  
**WCAG:** 2.4.4 Link Purpose Clear

- Link text descriptive (not URL)
- ScreenTip added

Edit: Right-click link → Edit Hyperlink → ScreenTip

### Step 7: Check Workbook Properties

**Rule:** XLSX-007  
**WCAG:** 2.4.2 Page Titled

Workbook must have title:

- File → Info → Properties → Title

### Step 8: Provide Remediation Report

For each issue:

- Rule ID (XLSX-xxx)
- WCAG criterion
- Location (sheet name, cell range)
- Current state
- Start Here: native Excel steps first
- Advanced / Technical Follow-Up: optional workbook/XML or automation detail after the Excel steps
- Priority (Critical/Serious/Moderate)

## Expected Output

- Accessibility findings with rule IDs
- Per-sheet remediation checklist
- Severity score (0-100, A-F grade)
- Fixed workbook (if requested)
