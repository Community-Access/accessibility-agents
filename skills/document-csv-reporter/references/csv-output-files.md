# Document CSV Reporter reference: CSV Output Files

Part of the `document-csv-reporter` skill. Read this only when the task reaches these sections.

## CSV Output Files

Generate the following CSV files in the current working directory (or user-specified directory):

### 1. DOCUMENT-ACCESSIBILITY-FINDINGS.csv

Primary findings export with one row per issue instance.

**Columns (in order):**

| Column | Description | Example |
|--------|------------|---------|
| `finding_id` | Unique identifier | `DOC-001` |
| `file_name` | Document filename | `report.docx` |
| `file_path` | Relative path to file | `docs/reports/report.docx` |
| `doc_type` | DOCX, XLSX, PPTX, PDF | `DOCX` |
| `severity` | Error, Warning, Tip | `Error` |
| `confidence` | High, Medium, Low | `High` |
| `score_impact` | Points deducted | `-10` |
| `rule_id` | Rule identifier | `DOCX-E001` |
| `rule_description` | One-line rule description | `Document title not set in properties` |
| `location` | Location within document | `Document Properties` |
| `wcag_criteria` | WCAG 2.2 success criterion | `2.4.2` |
| `wcag_level` | A, AA | `A` |
| `pattern_type` | Template, Recurring, Unique | `Template` |
| `remediation_status` | New, Persistent, Fixed, Regressed | `New` |
| `fix_summary` | Brief remediation instruction, native-tool-first | `Word: File > Info > Properties > Title` |
| `help_url` | Microsoft Office or Adobe help link | See URL patterns below |
| `wcag_url` | WCAG understanding document link | `https://www.w3.org/WAI/WCAG22/Understanding/page-titled` |

### 2. DOCUMENT-ACCESSIBILITY-SCORECARD.csv

Summary scorecard with one row per audited document.

**Columns:**

| Column | Description | Example |
|--------|------------|---------|
| `file_name` | Document filename | `report.docx` |
| `file_path` | Relative path | `docs/reports/report.docx` |
| `doc_type` | DOCX, XLSX, PPTX, PDF | `DOCX` |
| `score` | Severity score (0-100) | `65` |
| `grade` | A through F | `D` |
| `error_count` | Number of errors | `4` |
| `warning_count` | Number of warnings | `6` |
| `tip_count` | Number of tips | `3` |
| `total_issues` | Total issue count | `13` |
| `template_issues` | Issues from document template | `2` |
| `recurring_issues` | Pattern issues across documents | `5` |
| `unique_issues` | Issues unique to this document | `6` |
| `audit_date` | ISO 8601 timestamp | `2026-02-24T14:30:00Z` |
| `file_size_kb` | File size in KB | `245` |
| `page_count` | Page or slide count (if available) | `12` |

### 3. DOCUMENT-ACCESSIBILITY-REMEDIATION.csv

Prioritized remediation plan with one row per unique issue type.

**Columns:**

| Column | Description | Example |
|--------|------------|---------|
| `priority` | Immediate, Soon, When Possible | `Immediate` |
| `rule_id` | Rule identifier | `DOCX-E001` |
| `rule_description` | Issue description | `Document title not set` |
| `doc_type` | Affected document types | `DOCX` |
| `affected_files` | Count of files affected | `8` |
| `total_instances` | Total occurrences across files | `8` |
| `pattern_type` | Template, Recurring, Unique | `Template` |
| `severity` | Error, Warning, Tip | `Error` |
| `wcag_criteria` | WCAG success criterion | `2.4.2` |
| `estimated_effort` | Low, Medium, High | `Low` |
| `fix_steps` | Step-by-step instructions, native-tool-first and action-oriented | See guidance below |
| `help_url` | Primary help documentation link | See URL patterns below |
| `wcag_url` | WCAG understanding document | URL |
| `roi_score` | Fix impact score | `56` |
