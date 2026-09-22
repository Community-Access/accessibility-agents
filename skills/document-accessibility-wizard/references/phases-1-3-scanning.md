# Document Accessibility Wizard reference: Phase 2: Document Scanning

Part of the `document-accessibility-wizard` skill. Read this only when the task reaches these sections.

## Phase 2: Document Scanning

Process each document by delegating to the appropriate sub-agent based on file extension.

### Scan Order

1. Group files by type for efficient sub-agent delegation
2. Within each type, process in alphabetical order by path
3. Track progress: "Scanning file 3 of 12: reports/Q3-summary.docx"

### Parallel Sub-Agent Execution

When scanning batches with multiple document types, spawn sub-agents in parallel for maximum efficiency:

1. **Group files by type** - Word, Excel, PowerPoint, PDF
2. **Spawn one sub-agent per document type** - each runs in its own isolated context
3. **Sub-agents scan independently** - using the appropriate specialist agent (word-accessibility, excel-accessibility, powerpoint-accessibility, pdf-accessibility)
4. **Collect all results** - each sub-agent returns only its structured findings summary
5. **Synthesize in Phase 3** - the wizard combines all results for cross-document analysis

This parallel approach means scanning 12 documents across 4 types takes roughly the same time as scanning the largest single-type group, rather than scanning all 12 sequentially.

For single-type batches or single files, sub-agents run sequentially as normal.

### Per-File Delegation

**For `.docx` files -> delegate to `word-accessibility`:**

```text
## Document Scan Context
- **File:** /docs/reports/annual-report.docx
- **Scan Profile:** strict
- **Severity Filter:** error, warning, tip
- **Disabled Rules:** none
- **Part of Batch:** yes - file 1 of 4 Word documents
```

Apply the word-accessibility agent's complete rule set:

- DOCX-E001 through DOCX-E007 (errors)
- DOCX-W001 through DOCX-W006 (warnings)
- DOCX-T001 through DOCX-T003 (tips)

**For `.xlsx` files -> delegate to `excel-accessibility`:**
Apply the excel-accessibility agent's complete rule set:

- XLSX-E001 through XLSX-E006 (errors)
- XLSX-W001 through XLSX-W005 (warnings)
- XLSX-T001 through XLSX-T003 (tips)

**For `.pptx` files -> delegate to `powerpoint-accessibility`:**
Apply the powerpoint-accessibility agent's complete rule set:

- PPTX-E001 through PPTX-E006 (errors)
- PPTX-W001 through PPTX-W006 (warnings)
- PPTX-T001 through PPTX-T004 (tips)

**For `.pdf` files -> delegate to `pdf-accessibility`:**
Apply the pdf-accessibility agent's complete rule set across all three layers:

- PDFUA.* (PDF/UA conformance - 30 rules)
- PDFBP.* (best practices - 22 rules)
- PDFQ.* (quality/pipeline - 4 rules)

### Scan Result Collection

For each file, collect from the sub-agent:

```yaml
file: "/docs/reports/annual-report.docx"
type: "docx"
sub_agent: "word-accessibility"
scan_time: "2025-01-15T10:30:00Z"
findings:
  errors: 3
  warnings: 2
  tips: 1
  details:
    - rule_id: "DOCX-E001"
      severity: "error"
      name: "missing-alt-text"
      location: "Page 4, Figure 2"
      description: "Image has no alternative text"
      impact: "Blind users cannot understand this image"
      remediation: "Right-click -> Edit Alt Text -> describe the chart content"
      wcag: "1.1.1 Non-text Content (Level A)"
      confidence: "high"  # high | medium | low
```

### Sub-Agent Confidence Levels

Each sub-agent MUST report a confidence level for every finding:

| Level | Meaning | When to Use |
|-------|---------|-------------|
| **high** | Sub-agent is certain this is a real issue | Structural issues: missing alt text, no headings, no table headers, untagged PDF |
| **medium** | Likely an issue but requires human judgment | Alt text quality, heading hierarchy edge cases, reading order ambiguity |
| **low** | Possible issue - flagged for review | Decorative image detection, complex table interpretation, ambiguous link text context |

Confidence levels affect the report:

- **High-confidence findings** are reported as definitive issues with full remediation.
- **Medium-confidence findings** are reported with a "Needs Review" flag.
- **Low-confidence findings** are reported in a separate "For Review" section to avoid false-positive noise.

When aggregating across documents, weight findings by confidence:

- High = 1.0, Medium = 0.7, Low = 0.3
- Use these weights in severity scoring (Phase 3).

### Progress Reporting

After each file, report brief status:

```text
 annual-report.docx - 3 errors, 2 warnings, 1 tip
 Q3-data.xlsx - 0 errors, 1 warning, 0 tips
 presentation.pptx - 5 errors, 3 warnings, 2 tips
 policy.pdf - 1 error, 0 warnings, 0 tips
```

## Phase 3: Cross-Document Analysis

After all files are scanned, analyze patterns across the entire document set.

### Pattern Detection

Identify recurring issues:

- **Same rule failing across multiple files** - e.g., "DOCX-E001 (missing alt text) found in 8 of 12 documents"
- **Same issue type across file formats** - e.g., "Missing alt text found in Word, Excel, and PowerPoint files"
- **Folder-level patterns** - e.g., "All files in /docs/legacy/ are untagged PDFs"
- **Systemic issues** - e.g., "No documents have the document title property set"

### Cross-Document Summary

```text
 Cross-Document Analysis

Most Common Issues (across all documents):
  1. Missing alt text - 8/12 documents (67%)
  2. Missing document title - 6/12 documents (50%)
  3. No heading structure - 4/12 documents (33%)
  4. Ambiguous link text - 3/12 documents (25%)

By Document Type:
  Word:       Avg 2.5 errors/file | Worst: annual-report.docx (5 errors)
  Excel:      Avg 1.0 errors/file | Worst: budget.xlsx (2 errors)
  PowerPoint: Avg 3.5 errors/file | Worst: all-hands.pptx (7 errors)
  PDF:        Avg 4.0 errors/file | Worst: policy-v2.pdf (8 errors)

Folders Needing Most Attention:
  /docs/legacy/ - 15 errors across 3 files (no files pass)
  /docs/reports/ - 8 errors across 4 files
  /docs/templates/ - 2 errors across 2 files (best folder)

```

### Severity Scoring

Assign each document a weighted **accessibility risk score** (0-100) based on its findings.

**Scoring Formula:**

```text
Document Score = 100 - (sum of weighted findings)

Weights:
  Error (high confidence):   -10 points each
  Error (medium confidence):  -7 points each
  Error (low confidence):     -3 points each
  Warning (high confidence):  -3 points each
  Warning (medium confidence):-2 points each
  Warning (low confidence):   -1 point each
  Tips:                        0 points (informational only)

Floor: 0 (scores cannot go below 0)
```

**Score Grades:**

| Score | Grade | Meaning |
|-------|-------|---------|
| 90-100 | A | Excellent - minor or no issues |
| 75-89 | B | Good - some warnings, few errors |
| 50-74 | C | Needs Work - multiple errors |
| 25-49 | D | Poor - significant accessibility barriers |
| 0-24 | F | Failing - critical barriers, likely unusable with AT |

Present a scorecard in the cross-document summary:

```text
 Accessibility Scorecard

  annual-report.docx     72/100 (C) - Needs Work
  Q3-data.xlsx           91/100 (A) - Excellent
  presentation.pptx      45/100 (D) - Poor
  policy.pdf             38/100 (D) - Poor

  Overall Average:       61.5/100 (C) - Needs Work
  Best:  Q3-data.xlsx (91)
  Worst: policy.pdf (38)

```

### Template Analysis

Detect whether documents are based on templates and audit template-level issues:

1. **Template Detection:** Check document metadata for template references (e.g., Word's `Template` property, PowerPoint's slide master names).
2. **Template Grouping:** Group documents that share the same template.
3. **Template-Level Issues:** If multiple documents from the same template share the same issue, flag it as a **template-level issue** rather than a per-file issue.
4. **Template Recommendations:** If a template is causing widespread issues, recommend fixing the template to prevent future documents from inheriting the problem.

```text
 Template Analysis

Detected Templates:
  1. "Corporate Report Template" - used by 4 files
     Template-level issues:
       - Logo placeholder has decorative alt text (should be empty)
       - Footer lacks document title reference
     Fix the template to remediate 4 files at once.

  2. "Quarterly Presentation" - used by 2 files
     Template-level issues:
       - Slide master missing title placeholder on layout 3
     Fix the template to remediate 2 files at once.

  3. No template detected - 6 files

```

### Remediation Tracking

When this is a **re-scan** (the user selected "Re-scan with comparison" or "Changed files only" in Phase 0), compare current findings against the baseline audit:

1. **Parse the Previous Report:** Read the baseline `DOCUMENT-ACCESSIBILITY-AUDIT.md` and extract findings by file and rule ID.
2. **Classify Changes:**
   - **Fixed** - issue was in the previous report but is no longer present
   - **New** - issue was not in the previous report but appears now
   - **Persistent** - issue was in the previous report and is still present
   - **Regressed** - issue was previously fixed and has returned
3. **Track Progress Over Time:** If multiple previous reports are available, show trend data.

```text
 Remediation Progress

Comparing against: DOCUMENT-ACCESSIBILITY-AUDIT-2025-01.md

   Fixed:      8 issues resolved since last audit
   New:        3 new issues found (in new/modified files)
   Persistent: 12 issues remain from last audit
   Regressed:  1 issue returned after previous fix

  Progress: 8 of 20 previous issues fixed (40% reduction)
  Score Change: 54/100 -> 67/100 (+13 points)

```

### Metadata Dashboard

Collect and summarize document metadata across all scanned files:

```text
 Document Metadata Dashboard

Authors:        5 unique authors across 12 documents
  Most active:  Jane Smith (4 docs), John Doe (3 docs)

Language Settings:
  en-US:        8 documents
  Not set:      3 documents  (accessibility issue)
  fr-FR:        1 document

Document Titles:
  Set:          7 documents
  Missing:      5 documents  (accessibility issue)

Creation Dates:
  Oldest:       2019-03-15 (policy.pdf)
  Newest:       2025-01-10 (Q4-report.docx)
  Avg age:      2.3 years

File Sizes:
  Total:        45.2 MB across 12 documents
  Largest:      12.1 MB (all-hands.pptx)
  Smallest:     0.2 MB (budget.xlsx)

Document Properties Health:
  Title set:    7/12 (58%)
  Author set:   10/12 (83%)
  Language set:  9/12 (75%)
  Subject set:   3/12 (25%)
  Keywords set:  2/12 (17%)

```

Metadata flags that affect accessibility:

- **Missing language** -> Screen readers may mispronounce content
- **Missing title** -> Users can't identify the document in AT
- **Very old documents** -> Likely created before accessibility awareness; flag for priority review
