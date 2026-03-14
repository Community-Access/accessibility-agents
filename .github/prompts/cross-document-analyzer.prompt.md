---
name: cross-document-analysis
description: Cross-document accessibility pattern detection. Aggregates multiple document audit results, identifies systemic issues, computes severity scores, generates scorecards.
mode: agent
agent: cross-document-analyzer
tools:
  - askQuestions
  - readFile
  - createFile
---

# Cross-Document Accessibility Analyzer

Analyze accessibility patterns across multiple document audit results. Identify systemic issues versus document-specific problems.

## Audit Results to Analyze

**Input Files:** `${input:auditFiles}` (comma-separated list of audit JSON files)

## Instructions

### Step 1: Load All Audit Results

Read each audit JSON file from:

- word-audit-{filename}.json
- excel-audit-{filename}.json
- powerpoint-audit-{filename}.json
- pdf-audit-{filename}.json
- epub-audit-{filename}.json

### Step 2: Aggregate Findings

Group findings by:

- **Ruleid:** DOCX-001, XLSX-002, PDFUA.003, etc.
- **WCAG Criterion:** 1.1.1, 1.3.1, 2.4.2, etc.
- **Severity:** Critical, Serious, Moderate, Minor

### Step 3: Identify Systemic Issues

**Systemic** = appears in 50%+ of documents:

- Missing document titles → systemic
- No alt text on images → systemic
- Heading structure issues → systemic

**Document-specific** = appears in < 50%:

- Individual spelling errors
- One-off formatting issues

### Step 4: Compute Cross-Document Severity Score

Formula:

```text
Base Score = 100
For each unique rule violation:
  systemic issue → deduct (severity * occurrence_rate * 10)
  isolated issue → deduct (severity * 5)

Severity weights:
  Critical = 4
  Serious = 3
  Moderate = 2
  Minor = 1

Final Score = max(0, Base Score - total_deductions)
Grade = A (90-100), B (80-89), C (70-79), D (60-69), F (0-59)
```

### Step 5: Generate Comparison Scorecard

```markdown
# Cross-Document Accessibility Analysis

**Documents Analyzed:** ${count}  
**Generated:** ${date}

## Overall Score: ${score}/100 (${grade})

## Systemic Issues (50%+ of documents)

### Critical
- **DOCX-001 Missing Title** - ${affectedCount} of ${totalCount} documents (${percent}%)
  - Affects: doc1.docx, doc2.docx, ...
  - Remediation: Add title in File → Info → Properties

### Serious
- **DOCX-004 Missing Alt Text** - ${affectedCount} of ${totalCount} documents
  - Total images without alt: ${imageCount}

## Document-Specific Issues

- doc1.docx: ${issueCount} unique issues
- doc2.xlsx: ${issueCount} unique issues

## Recommendations

1. **Template Fix:** Address systemic issues in document templates first
2. **Training:** Provide guidance on common problems
3. **Automation:** Create remediation scripts for bulk fixes

## Scorecard by Document

| Document | Score | Grade | Critical | Serious | Moderate | Minor |
|----------|-------|-------|----------|---------|----------|-------|
| doc1.docx | 85 | B | 1 | 3 | 5 | 2 |
| doc2.xlsx | 92 | A | 0 | 1 | 2 | 1 |
```

### Step 6: Generate Remediation Priority List

Order by:

1. Systemic issues (highest occurrence rate)
2. Severity (Critical > Serious > Moderate > Minor)
3. Effort (estimated time to fix)

## Expected Output

- Cross-document analysis report
- Systemic vs isolated issue breakdown
- Overall severity score and grade
- Per-document scorecard table
- Prioritized remediation list
