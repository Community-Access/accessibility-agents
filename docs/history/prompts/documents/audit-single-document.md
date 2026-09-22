# audit-single-document

> **Historical.** This document describes the repository as it was before
> version 7.0, when agents lived in six per-client directories. It is kept
> for the record and is not maintained. The current layout is one `skills/`
> directory; start at [the documentation index](../README.md).
> Original path: `docs/prompts/documents/audit-single-document.md`.

Run a full accessibility audit on a single Office document or PDF. Uses the strict scan profile (all rules, all severities) and produces a detailed scored report.

## When to Use It

- You want a complete audit of one document before publishing or distributing it
- You need to document the accessibility state of a specific file
- You are checking a document someone else created
- You want to establish a baseline before remediation work

## How to Launch It

**In GitHub Copilot Chat:**

```text
/audit-single-document
```

Then provide the file path when prompted. Or specify directly:

```text
/audit-single-document C:\reports\annual-report-2026.docx
/audit-single-document /Users/name/docs/training-module.pptx
```

## What to Expect

### Step 1: File Type Identification

The agent reads the file extension:

- `.docx` -> delegates to [word-accessibility](../../../reference/skills/word-accessibility.md)
- `.xlsx` -> delegates to [excel-accessibility](../../../reference/skills/excel-accessibility.md)
- `.pptx` -> delegates to [powerpoint-accessibility](../../../reference/skills/powerpoint-accessibility.md)
- `.pdf` -> delegates to [pdf-accessibility](../../../reference/skills/pdf-accessibility.md)

### Step 2: Strict Profile Scan

The strict profile runs all rules at all severity levels and reports every finding - including tips and informational notices. Unlike the moderate or minimal profiles, nothing is filtered out.

### Step 3: Scoring

The document receives a 0-100 severity score and A-F grade based on the weighted findings. See [cross-document-analyzer](../../../reference/skills/cross-document-analyzer.md) for the scoring formula.

### Step 4: Report Generation

The full audit is written to `DOCUMENT-ACCESSIBILITY-AUDIT.md` with:

- **Metadata dashboard** - document title, language, author, template, modification date
- **Score and grade** - 0-100 with letter grade and trend arrow
- **Findings organized by severity** - Errors first, then Warnings, then Tips
- **Each finding:** Rule ID, description, location, WCAG criterion, confidence level, fix steps
- **Remediation priority list** - ordered by impact

### Step 5: Follow-Up Offers

After the report is written, the agent offers:

- Run a VPAT from these results (-> `generate-vpat`)
- Generate batch remediation scripts (-> `generate-remediation-scripts`)
- Re-scan after fixing

## Example Variations

```text
/audit-single-document path/to/policy-document.docx
/audit-single-document path/to/quarterly-data.xlsx
/audit-single-document path/to/board-presentation.pptx
/audit-single-document path/to/published-report.pdf
```

## Output Files

Each file, with its contents.

| File | Contents |
|------|----------|
| `DOCUMENT-ACCESSIBILITY-AUDIT.md` | Full report with findings, score, metadata, and fix guidance |

## Connected Agents

Each agent, with its role.

| Agent | Role |
|-------|------|
| [document-accessibility-wizard](../../../reference/skills/document-accessibility-wizard.md) | Orchestrates this prompt |
| [word-accessibility](../../../reference/skills/word-accessibility.md) | Handles `.docx` files |
| [excel-accessibility](../../../reference/skills/excel-accessibility.md) | Handles `.xlsx` files |
| [powerpoint-accessibility](../../../reference/skills/powerpoint-accessibility.md) | Handles `.pptx` files |
| [pdf-accessibility](../../../reference/skills/pdf-accessibility.md) | Handles `.pdf` files |

## Related Prompts

- [quick-document-check](./quick-document-check.md) - faster triage, no report file
- [audit-document-folder](./audit-document-folder.md) - audit all documents in a folder
- [generate-vpat](./generate-vpat.md) - export findings as a VPAT conformance report
