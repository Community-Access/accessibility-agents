# Document Accessibility Wizard reference: Phase 4: Report Generation

Part of the `document-accessibility-wizard` skill. Read this only when the task reaches these sections.

## Phase 4: Report Generation

Write the full audit report to the path specified in Phase 0 (default: `DOCUMENT-ACCESSIBILITY-AUDIT.md`).

### Report Structure

```markdown
# Document Accessibility Audit Report

## Start Here

- Begin with the highest-impact fixes using the native app for each format:
  - Word: Accessibility Checker, Styles, Alt Text, Table Design, File > Info > Properties
  - Excel: sheet names, Insert > Table, Alt Text, unmerge cells, File > Info > Properties
  - PowerPoint: slide titles, Selection Pane reading order, Alt Text, captions, sections
  - Adobe Acrobat Pro: Accessibility tools, document title, language, tags, reading order, bookmarks
- Keep this section short, direct, and suitable for someone who just wants to start fixing issues.
- Do not lead with XML, PDF object model, CLI tooling, or batch scripts.

## Audit Information

| Field | Value |
|-------|-------|
| Date | [YYYY-MM-DD] |
| Auditor | A11y Agent Team (document-accessibility-wizard) |
| Scan Profile | [strict / moderate / minimal / custom] |
| Scope | [single file / N files / folder / folder recursive] |
| Target Path | [file or folder path] |
| Type Filter | [all / specific types] |
| Documents Scanned | [count] |
| Documents Passed | [count with 0 errors] |
| Documents Failed | [count with 1+ errors] |

## Executive Summary

- **Total documents scanned:** X
- **Total issues found:** X
- **Errors:** X | **Warnings:** X | **Tips:** X
- **Documents with zero errors:** X of Y (Z%)
- **Most common issue:** [rule name] - found in X of Y documents
- **Estimated remediation effort:** [low / medium / high]

## Native App Action Plan

### Fix first in Word
- [Plain-language steps for Word findings, grouped by impact]

### Fix first in Excel
- [Plain-language steps for Excel findings, grouped by impact]

### Fix first in PowerPoint
- [Plain-language steps for PowerPoint findings, grouped by impact]

### Fix first in Adobe Acrobat Pro
- [Plain-language steps for PDF findings, grouped by impact]

### Advanced and Technical Follow-Up
- [Only after the native-tool guidance: source rebuilds, Open XML details, PDF/UA specifics, scripting, or CI]

## Cross-Document Patterns

[Recurring issues, systemic failures, folder-level patterns]

## Findings by File

###  [filename.docx]
**Path:** [full path]
**Sub-agent:** word-accessibility
**Result:** X errors, Y warnings, Z tips

#### Errors

##### 1. [Rule ID] - [Rule Name]
- **Severity:** Error
- **Location:** [page/section/element]
- **WCAG:** [criterion]
- **Impact:** [what AT users experience]
- **Start Here:** [short native-app fix path]
- **Advanced / Technical Follow-Up:** [optional deeper implementation details]

[...repeat for each finding...]

---

###  [filename.xlsx]
[...same structure...]

###  [filename.pptx]
[...same structure...]

###  [filename.pdf]
[...same structure...]

## Findings by Rule (Cross-Reference)

| Rule ID | Rule Name | Severity | Files Affected | Count |
|---------|-----------|----------|----------------|-------|
| DOCX-E001 | missing-alt-text | Error | 4 | 12 instances |
| PPTX-E002 | missing-slide-title | Error | 2 | 8 instances |
| ... | | | | |

## What Passed

[Documents and categories with no issues - acknowledge what is done well]

## Remediation Priority

### Immediate (Errors - block AT access)
1. [Ordered list of highest-impact fixes with file references]

### Soon (Warnings - degrade experience)
1. [Ordered list]

### When Possible (Tips - best practices)
1. [Ordered list]

## Recommended Next Steps

1. Fix errors in the [worst folder/file] first
2. Address the most common systemic issue: [issue] across [N] files
3. Set up scan configuration (`.a11y-office-config.json`, `.a11y-pdf-config.json`) for CI
4. Re-scan after fixes to verify remediation
5. For PDF remediation, consider rebuilding from tagged source documents
6. Schedule periodic audits for new documents added to the repository

## Configuration Recommendations

[Based on findings, suggest appropriate scan profiles and rule configurations]

## Accessibility Scorecard

| Document | Score | Grade | Errors | Warnings | Tips |
|----------|-------|-------|--------|----------|------|
| [filename] | [0-100] | [A-F] | [count] | [count] | [count] |
| ... | | | | | |
| **Overall Average** | **[avg]** | **[grade]** | **[total]** | **[total]** | **[total]** |

## Metadata Dashboard

| Property | Set | Missing | Percentage |
|----------|-----|---------|------------|
| Document Title | [n] | [n] | [%] |
| Author | [n] | [n] | [%] |
| Language | [n] | [n] | [%] |
| Subject | [n] | [n] | [%] |
| Keywords | [n] | [n] | [%] |

### Authors
[List of unique authors with document counts]

### Document Age Distribution
[Oldest, newest, average age, documents needing review due to age]

## Template Analysis

[If templates were detected, list template-level issues and recommendations]

| Template | Documents Using | Template-Level Issues | Impact |
|----------|----------------|----------------------|--------|
| [name] | [count] | [issues] | Fix template to remediate [N] files |

## Comparison Report

[If this is a re-scan, include the comparison against the previous audit]

### Summary of Changes
| Metric | Previous | Current | Change |
|--------|----------|---------|--------|
| Total Errors | [n] | [n] | [+/-n] |
| Total Warnings | [n] | [n] | [+/-n] |
| Overall Score | [n]/100 | [n]/100 | [+/-n] |
| Documents Passing | [n] | [n] | [+/-n] |

### Fixed Issues
[List of issues that were present in the previous audit but are now resolved]

### New Issues
[List of issues that are new since the previous audit]

### Persistent Issues
[List of issues that remain from the previous audit]

## Confidence Summary

| Confidence | Count | Percentage |
|------------|-------|------------|
| High | [n] | [%] - definitive issues |
| Medium | [n] | [%] - needs human review |
| Low | [n] | [%] - flagged for review |
```

### Organization Modes

If the user selected a different organization mode in Phase 0:

**By issue type:** Group all instances of each rule together, listing affected files under each rule.

**By severity:** List all errors first (across all files), then all warnings, then all tips.

**By file (default):** Group all findings under each document, as shown above.

In every organization mode, keep the native-tool remediation first and move technical notes after it.

## Phase 5: Follow-Up Actions

After the report is written, offer next steps:

Ask: **"The audit report has been written. What would you like to do next?"**
Options:

- **Fix issues in a specific file** - delegates to the appropriate sub-agent with the file's findings
- **Set up scan configuration** - delegates to `office-scan-config` or `pdf-scan-config`
- **Re-scan a subset** - scan specific files again after fixes
- **Export findings as CSV/JSON** - alternative report format for tracking systems
- **Export in compliance format (VPAT/ACR)** - generate a Voluntary Product Accessibility Template or Accessibility Conformance Report
- **Generate batch remediation scripts** - create PowerShell/Bash scripts for automatable fixes
- **Compare with a previous audit** - diff this audit against a baseline report
- **Run a deeper dive on the worst file** - focus on the file with the most issues
- **Nothing - I'll review the report** - end the wizard

### Sub-Agent Handoff for Remediation

When the user wants to fix a specific file, hand off with full context:

```text
## Remediation Handoff to [word-accessibility]
- **File:** /docs/reports/annual-report.docx
- **Issues to Fix:**
  1. DOCX-E001 - 3 images missing alt text (pages 4, 7, 12)
  2. DOCX-E003 - Heading skip: H1 -> H3 on page 2
  3. DOCX-W003 - Manual bullet list on page 5
- **User Request:** Fix all errors in this file
- **Scan Profile Used:** strict
```

### Batch Remediation Scripts

If the user selects **Generate batch remediation scripts**, ask which format:

- **PowerShell** - `.ps1` script for Windows environments
- **Bash** - `.sh` script for macOS environments
- **Both** - generate both versions

Generate scripts that automate fixable issues:

**Automatable fixes** (safe to script):

- Setting document title from filename
- Setting document language property
- Removing `~$` lock files
- Renaming generic sheet names (Sheet1, Sheet2) with user-provided names
- Adding bookmark structure to PDFs from heading tags

**Non-automatable fixes** (require human judgment):

- Writing meaningful alt text
- Fixing heading hierarchy
- Correcting reading order
- Rewriting ambiguous link text

The script MUST include:

1. A dry-run mode (`-WhatIf` / `--dry-run`) that previews changes without modifying files
2. Backup creation before any modification
3. A summary log of all changes made
4. Clear comments explaining each fix

### Compliance Format Export

If the user selects **Export in compliance format (VPAT/ACR)**, ask which format:

- **VPAT 2.5 (WCAG)** - Voluntary Product Accessibility Template, WCAG edition
- **VPAT 2.5 (508)** - Voluntary Product Accessibility Template, Section 508 edition
- **VPAT 2.5 (EN 301 549)** - Voluntary Product Accessibility Template, EU edition
- **VPAT 2.5 (INT)** - Voluntary Product Accessibility Template, International edition (all three)
- **Custom ACR** - Accessibility Conformance Report in a custom format

Generate the compliance report by mapping findings to the appropriate standard's criteria:

| WCAG Criterion | Conformance Level | Remarks |
|---------------|-------------------|----------|
| 1.1.1 Non-text Content | Does Not Support / Partially Supports / Supports | [Based on findings] |
| 1.3.1 Info and Relationships | ... | ... |

Conformance levels:

- **Supports** - No findings for this criterion across any document
- **Partially Supports** - Some documents pass, some fail
- **Does Not Support** - All or most documents fail
- **Not Applicable** - Criterion does not apply to the document types scanned

### CSV/JSON Export

If the user selects **Export findings as CSV/JSON**, delegate to the **document-csv-reporter** sub-agent with the full audit context:

```text
## CSV Export Handoff to document-csv-reporter
- **Report Path:** [path to DOCUMENT-ACCESSIBILITY-AUDIT.md]
- **Files Audited:** [list of file paths with types]
- **Output Directory:** [current working directory or user-specified directory]
- **Export Format:** CSV (and optionally JSON)
```

The document-csv-reporter generates:

- `DOCUMENT-ACCESSIBILITY-FINDINGS.csv` - one row per finding with severity scoring, WCAG criteria, and Microsoft/Adobe help links
- `DOCUMENT-ACCESSIBILITY-SCORECARD.csv` - one row per document with score and grade
- `DOCUMENT-ACCESSIBILITY-REMEDIATION.csv` - prioritized remediation plan with ROI scoring and fix steps

### Comparison with Previous Audit

If the user selects **Compare with a previous audit**, ask for the path to the previous report. Then run the comparison analysis from Phase 3's Remediation Tracking section and present the diff report.
