---
name: audit-documents
description: Interactive document accessibility wizard. Step-by-step audit for Office docs and PDFs. Supports single files, folders, recursive scanning, delta scanning. Produces comprehensive markdown report.
mode: agent
agent: document-accessibility-wizard
tools:
  - askQuestions
  - readFile
  - runInTerminal
  - getTerminalOutput
  - createFile
  - runSubagent
---

# Document Accessibility Wizard

Interactive guided document accessibility audit. Step-by-step wizard for auditing Word, Excel, PowerPoint, PDF, and ePub documents.

## What to Audit?

**Scope:** `${input:scope}` (single-file, multiple-files, folder, changed-files)

## Instructions

### Phase 0: Scan Configuration

Check for scan config files:

- `.a11y-office-config.json` (Word, Excel, PowerPoint)
- `.a11y-pdf-config.json` (PDF)
- `.a11y-epub-config.json` (ePub)

If missing, offer to create from templates (strict, moderate, minimal).

### Phase 1: File Discovery

**Single file:**

- Ask: `${input:filePath}`

**Multiple files:**

- Ask for comma-separated list or pattern

**Folder scan:**

- Delegate to `document-inventory` agent
- Get full recursive inventory

**Delta scan:**

- Use `git diff` to find changed documents
- Filter by `.docx`, `.xlsx`, `.pptx`, `.pdf`, `.epub`

### Phase 2: Group by File Type

- Word documents → delegate to `word-accessibility`
- Excel workbooks → delegate to `excel-accessibility`
- PowerPoint presentations → delegate to `powerpoint-accessibility`
- PDFs → delegate to `pdf-accessibility`
- ePubs → delegate to `epub-accessibility`

### Phase 3: Run Parallel Audits

For each file type group, invoke specialist agent in parallel.

Collect results as structured JSON.

### Phase 4: Cross-Document Analysis

If multiple files, delegate to `cross-document-analyzer`:

- Identify systemic vs isolated issues
- Compute overall severity score
- Generate comparison scorecard

### Phase 5: Generate Comprehensive Report

Create `DOCUMENT-ACCESSIBILITY-AUDIT.md`:

```markdown
# Document Accessibility Audit

**Generated:** ${date}  
**Scope:** ${scope}  
**Files Audited:** ${count}

## Executive Summary

**Overall Score:** ${score}/100 (${grade})

- Total Issues: ${total}
  - Critical: ${critical}
  - Serious: ${serious}
  - Moderate: ${moderate}
  - Minor: ${minor}

## Files Audited

### Word Documents (${docxCount})
- doc1.docx - ${score} (${grade}) - ${issueCount} issues
- doc2.docx - ${score} (${grade}) - ${issueCount} issues

### Excel Workbooks (${xlsxCount})
- workbook1.xlsx - ${score} (${grade}) - ${issueCount} issues

### PowerPoint Presentations (${pptxCount})
- slides1.pptx - ${score} (${grade}) - ${issueCount} issues

### PDF Documents (${pdfCount})
- report.pdf - ${score} (${grade}) - ${issueCount} issues

### ePub Documents (${epubCount})
- book.epub - ${score} (${grade}) - ${issueCount} issues

## Systemic Issues (if multi-file audit)

1. **DOCX-001 Missing Title** - ${affectedCount} files
2. **XLSX-002 Missing Table Headers** - ${affectedCount} files

## Detailed Findings

### doc1.docx

#### Critical Issues
- **DOCX-001:** Missing document title
  - WCAG: 2.4.2 Page Titled
  - Location: Document properties
  - Remediation: File → Info → Properties → Title

#### Serious Issues
- **DOCX-004:** 5 images missing alt text
  - WCAG: 1.1.1 Non-text Content
  - Location: Pages 2, 5, 7, 10, 12
  - Remediation: Right-click image → View Alt Text

## Remediation Priorities

1. **Fix templates** (if systemic issues detected)
2. **Batch remediations** (e.g., add titles to all files)
3. **Page-specific fixes** (individual image alt text)

## Next Steps

- [ ] Address critical issues
- [ ] Update document templates (if applicable)
- [ ] Re-scan after remediation
- [ ] Schedule regular accessibility audits
```

### Phase 6: Offer Post-Audit Actions

- **Generate VPAT/ACR** - Compliance export for procurement
- **Generate Remediation Scripts** - Batch PowerShell/Bash scripts
- **Compare with Previous Audit** - Track remediation progress
- **Export to CSV** - Structured data with help links

## Expected Output

- Comprehensive DOCUMENT-ACCESSIBILITY-AUDIT.md report
- Per-file audit details saved as JSON
- Overall severity score (0-100, A-F grade)
- Prioritized remediation plan
- Template fix recommendations (if applicable)
