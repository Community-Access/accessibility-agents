---
name: audit-pdf
description: PDF document accessibility specialist. Scans and remediates PDFs for accessibility. Covers PDF/UA conformance, tagged structure, alt text, language, bookmarks, reading order.
mode: agent
agent: pdf-accessibility
tools:
  - askQuestions
  - readFile
  - runInTerminal
  - getTerminalOutput
---

# PDF Accessibility Audit

Audit PDF documents for PDF/UA-1 (ISO 14289-1:2023) conformance and WCAG 2.1 AA compliance.

## PDF to Audit

**File:** `${input:pdfFile}`

## Instructions

### Step 1: Check Tagged Structure

**Rule:** PDFUA.001  
**WCAG:** 1.3.1 Info and Relationships

PDF must be tagged with logical structure:
- Document (root)
- Part, Sect, Div (grouping)
- H1-H6 (headings)
- P (paragraphs)
- L, LI, Lbl, LBody (lists)
- Table, TR, TH, TD (tables)

Check in Acrobat: View → Navigation Panels → Tags

### Step 2: Check Alt Text

**Rule:** PDFUA.002  
**WCAG:** 1.1.1 Non-text Content

All images must have:
- Alt text attribute
- Or use artifacts tag (decorative)

### Step 3: Check Language

**Rule:** PDFUA.003  
**WCAG:** 3.1.1 Language of Page

Document language set:
- File → Properties → Advanced → Language

### Step 4: Check Document Title

**Rule:** PDFUA.004  
**WCAG:** 2.4.2 Page Titled

- Title in metadata
- Display document title (not filename)

### Step 5: Check Bookmarks

**Rule:** PDFBP.001 (Best Practice)  
**WCAG:** 2.4.5 Multiple Ways

Long documents (10+ pages) should have:
- Bookmark hierarchy matching headings

View → Navigation Panels → Bookmarks

### Step 6: Check Form Fields

**Rule:** PDFUA.005  
**WCAG:** 4.1.2 Name, Role, Value

All form fields must have:
- Tooltip (accessible name)
- Tab order set

### Step 7: Check Reading Order

**Rule:** PDFUA.006  
**WCAG:** 1.3.2 Meaningful Sequence

Tag order must match visual reading order:
- View → Tools → Accessibility → Reading Order

### Step 8: Check Color Contrast

**Rule:** PDFBP.002 (Best Practice)  
**WCAG:** 1.4.3 Contrast (Minimum)

Text on background: 4.5:1 (normal), 3:1 (large)

Use PAC (PDF Accessibility Checker) for automated checks.

### Step 9: Run PAC (PDF Accessibility Checker)

Download: https://pdfua.foundation/pac/

PAC checks all PDF/UA and Matterhorn Protocol tests.

### Step 10: Provide Remediation Report

For each issue:
- Rule ID (PDFUA.xxx, PDFBP.xxx, PDFQ.xxx)
- WCAG criterion
- Location (page number)
- Current state
- Remediation steps (usually requires Acrobat Pro)
- Priority (Critical/Serious/Moderate)

## Expected Output

- PAC validation results
- Manual check findings
- Detailed remediation steps
- Severity score (0-100, A-F grade)
- Remediated PDF (if requested, requires Acrobat Pro)
