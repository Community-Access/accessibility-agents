# Markdown Accessibility Assistant reference: Phase 3: Review Gate

Part of the `markdown-a11y-assistant` skill. Read this only when the task reaches these sections.

## Phase 3: Review Gate

Before applying any fixes, present an aggregated summary:

```text
## Scan Complete

Files scanned: N | Passed: N | Have issues: N

Issue Summary
| Domain | Critical | Serious | Moderate | Minor | Auto-fixable |
|--------|----------|---------|----------|-------|--------------|
...

Systemic Patterns (3+ files):
- [pattern] affects N files

Top Files by Issue Count:
1. [file] - N issues
2. [file] - N issues
```

Ask the user how to proceed:

1. Apply all auto-fixes and show me items needing review (Recommended)
2. Walk me through issues file-by-file
3. Show systemic issues first, then file-specific
4. Fix only Critical and Serious issues

## Phase 4: Apply Fixes

Dispatch `markdown-fixer` via Task tool with the approved issue list and preferences.

For items requiring human judgment, present each one:

```text
[Domain] Issue - [filename] Line [N]

Current: [quoted content]
Problem: [accessibility impact - who is affected and how]
Suggested fix: [proposed content]

Apply this fix?
1. Yes, apply it
2. Yes, let me edit the suggestion first
3. No, skip this one
```

For Mermaid/ASCII diagrams: generate a description draft and present for approval before applying.

## Phase 5: Summary Report

Generate `MARKDOWN-ACCESSIBILITY-AUDIT.md`:

```markdown
# Markdown Accessibility Audit

**Audit Date:** [date]
**Scope:** [files/directory]
**Emoji Preference:** [mode]
**Mermaid Preference:** [mode]

## Executive Summary

| Metric | Count |
|--------|-------|
| Files scanned | N |
| Files passed | N |
| Total issues found | N |
| Auto-fixed | N |
| Fixed after review | N |
| Flagged / not fixed | N |

**Overall Score:** [0-100] ([A-F grade])

## Score Calculation

| Score | Grade | Meaning |
|-------|-------|---------|
| 90-100 | A | Excellent |
| 75-89 | B | Good |
| 50-74 | C | Needs Work |
| 25-49 | D | Poor |
| 0-24 | F | Failing |

## Issue Breakdown

| Domain | WCAG | Found | Fixed | Flagged |
|--------|------|-------|-------|---------|
| Descriptive links | 2.4.4 | N | N | N |
| Alt text | 1.1.1 | N | N | N |
| Heading hierarchy | 1.3.1 | N | N | N |
| Table accessibility | 1.3.1 | N | N | N |
| Emoji | 1.3.3 | N | N | N |
| Mermaid / ASCII diagrams | 1.1.1 | N | N | N |
| Em-dash normalization | Cognitive | N | N | N |
| Anchor links | 2.4.4 | N | N | N |
| Plain language / lists | Cognitive | N | N | N |

## Per-File Scorecards

| File | Score | Grade | Issues | Fixed | Flagged |
|------|-------|-------|--------|-------|---------|
| [filename] | [0-100] | [A-F] | N | N | N |

## Systemic Patterns

[Issues found in 3+ files - highest ROI to fix]

## Remaining Items

[Unfixed flagged items with file:line for future action]

## Re-scan Command

`/markdown-a11y-assistant` to run a new audit and track progress
```

## Phase 6: Follow-Up Actions

After the report is written, offer next steps:

Ask: **"The audit report has been written. What would you like to do next?"**
Options:

- **Fix issues** - delegate to the `markdown-fixer` for interactive fixes
- **Export findings as CSV** - structured CSV for issue tracking systems
- **Compare with a previous audit** - diff against a baseline report
- **Re-scan after fixes** - audit specific files again
- **Run a web accessibility audit** - delegate to `web-accessibility-wizard`
- **Nothing - I'll review the report** - end the wizard

### CSV Export

If the user selects **Export findings as CSV**, delegate to the **markdown-csv-reporter** sub-agent with the full audit context:

```text
## CSV Export Handoff to markdown-csv-reporter
- **Report Path:** [path to MARKDOWN-ACCESSIBILITY-AUDIT.md]
- **Files Audited:** [list of markdown file paths]
- **Output Directory:** [current working directory or user-specified directory]
- **Export Format:** CSV
```

The markdown-csv-reporter generates:

- `MARKDOWN-ACCESSIBILITY-FINDINGS.csv` - one row per finding with severity scoring, WCAG criteria, and help links
- `MARKDOWN-ACCESSIBILITY-SCORECARD.csv` - one row per file with score and grade
- `MARKDOWN-ACCESSIBILITY-REMEDIATION.csv` - prioritized remediation plan sorted by ROI
