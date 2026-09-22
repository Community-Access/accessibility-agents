# Markdown CSV Reporter reference: CSV Output Files

Part of the `markdown-csv-reporter` skill. Read this only when the task reaches these sections.

## CSV Output Files

Generate the following CSV files in the current working directory (or user-specified directory):

### 1. MARKDOWN-ACCESSIBILITY-FINDINGS.csv

Primary findings export with one row per issue instance.

**Columns (in order):**

| Column | Description | Example |
|--------|------------|---------|
| `finding_id` | Unique identifier (auto-increment) | `MD-001` |
| `file_path` | Markdown file path | `docs/getting-started.md` |
| `line_number` | Line number in the file | `42` |
| `severity` | Critical, Serious, Moderate, Minor | `Serious` |
| `confidence` | High, Medium, Low | `High` |
| `score_impact` | Points deducted from file score | `-7` |
| `wcag_criteria` | WCAG 2.2 success criterion | `2.4.4` |
| `wcag_level` | A, AA, Cognitive | `A` |
| `domain` | Scan domain category | `Descriptive Links` |
| `rule_id` | Markdownlint rule or custom rule | `MD034` |
| `issue_summary` | One-line description | `Bare URL without descriptive link text` |
| `content` | The problematic content or snippet | `https://example.com` |
| `pattern_type` | Systemic, File-specific | `Systemic` |
| `remediation_status` | New, Persistent, Fixed, Regressed | `New` |
| `auto_fixable` | Yes, No, Partial | `Yes` |
| `fix_suggestion` | Actionable fix description | `Wrap URL in descriptive link text` |
| `wcag_url` | WCAG understanding document link | `https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context` |

### 2. MARKDOWN-ACCESSIBILITY-SCORECARD.csv

Summary scorecard with one row per audited markdown file.

**Columns:**

| Column | Description | Example |
|--------|------------|---------|
| `file_path` | Markdown file path | `docs/getting-started.md` |
| `score` | Severity score (0-100) | `72` |
| `grade` | Letter grade (A-F) | `C` |
| `critical_count` | Number of critical issues | `1` |
| `serious_count` | Number of serious issues | `3` |
| `moderate_count` | Number of moderate issues | `5` |
| `minor_count` | Number of minor issues | `2` |
| `total_issues` | Sum of all issues | `11` |
| `systemic_issues` | Issues matching cross-file patterns | `4` |
| `file_specific_issues` | Issues unique to this file | `7` |
| `auto_fixable` | Count of auto-fixable issues | `6` |
| `manual_review` | Count requiring human judgment | `5` |
| `audit_date` | ISO 8601 timestamp | `2025-01-15T10:30:00Z` |

### 3. MARKDOWN-ACCESSIBILITY-REMEDIATION.csv

Prioritized remediation plan with one row per unique issue type, sorted by ROI score (descending).

**Columns:**

| Column | Description | Example |
|--------|------------|---------|
| `priority` | Priority rank (1 = highest ROI) | `1` |
| `domain` | Scan domain category | `Descriptive Links` |
| `rule_id` | Markdownlint rule or custom rule | `MD034` |
| `issue_summary` | Description of the issue type | `Bare URLs in prose text` |
| `affected_files` | Number of files with this issue | `12` |
| `total_instances` | Total count across all files | `34` |
| `pattern_type` | Systemic, File-specific | `Systemic` |
| `wcag_criteria` | WCAG criterion | `2.4.4` |
| `severity` | Critical, Serious, Moderate, Minor | `Minor` |
| `estimated_effort` | Low, Medium, High | `Low` |
| `auto_fixable` | Yes, No, Partial | `Yes` |
| `fix_guidance` | How to fix this issue type | `Replace bare URLs with [descriptive text](url)` |
| `wcag_url` | WCAG understanding document link | `https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context` |
| `roi_score` | Computed ROI for prioritization | `34` |

## Domain-to-Rule Mapping

Map markdown audit findings to rule IDs. Use markdownlint rule IDs where they exist, otherwise use the domain-based identifier.

| Domain | Issue | Rule ID | WCAG | Severity |
|--------|-------|---------|------|----------|
| Alt Text | Image missing alt text | `MD045` | 1.1.1 (A) | Critical |
| Diagrams | Mermaid diagram without text alternative | `DIAG-MERMAID` | 1.1.1 (A) | Critical |
| Diagrams | ASCII diagram without text description | `DIAG-ASCII` | 1.1.1 (A) | Critical |
| Links | Broken anchor link | `LINK-ANCHOR` | 2.4.4 (A) | Serious |
| Links | Ambiguous link text | `LINK-AMBIGUOUS` | 2.4.4 (A) | Serious |
| Headings | Skipped heading level | `MD001` | 1.3.1 (A) | Serious |
| Headings | Multiple H1s | `MD025` | 1.3.1 (A) | Serious |
| Emoji | Emoji in heading | `EMO-HEADING` | Cognitive | Moderate |
| Emoji | Consecutive emoji (2+) | `EMO-CONSECUTIVE` | 1.3.3 (A) | Moderate |
| Emoji | Emoji used as bullet | `EMO-BULLET` | 1.3.1 (A) | Moderate |
| Formatting | Em-dash in prose | `DASH-EM` | Cognitive | Moderate |
| Tables | Table without preceding description | `TBL-DESC` | 1.3.1 (A) | Moderate |
| Links | Bare URL in prose | `MD034` | 2.4.4 (A) | Minor |
| Headings | Bold text used as heading | `HDG-BOLD` | 2.4.6 (AA) | Minor |
| Emoji | Emoji used for meaning (single inline) | `EMO-MEANING` | 1.3.3 (A) | Minor |
