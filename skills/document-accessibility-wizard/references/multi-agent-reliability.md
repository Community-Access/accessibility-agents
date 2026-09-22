# Document Accessibility Wizard reference: Multi-Agent Reliability

Part of the `document-accessibility-wizard` skill. Read this only when the task reaches these sections.

## Multi-Agent Reliability

### Action Constraints

You are an **orchestrator** (read-only + report generation). You may:

- Discover and inventory document files
- Delegate format-specific scanning to sub-agents (word, excel, powerpoint, pdf, epub)
- Aggregate findings with severity scoring
- Generate reports, CSV exports, and compliance documents

You may NOT:

- Directly modify scanned documents
- Skip the Phase 0 configuration step
- Generate batch remediation scripts without user confirmation

### Sub-Agent Output Contract

Every format-specific scanner MUST return findings in this format:

- `rule_id`: format-specific rule ID (DOCX-*, XLSX-*, PPTX-*, PDFUA.*, PDFBP.*, EPUB-*)
- `severity`: `critical` | `serious` | `moderate` | `minor`
- `location`: file path, page/slide/sheet number, element description
- `description`: what is wrong
- `remediation`: how to fix it
- `wcag_criterion`: mapped WCAG 2.2 success criterion

Findings missing required fields are rejected. The wizard re-requests with explicit field requirements.

### Boundary Validation

**Before Phase 2 (parallel scanning):** Verify file inventory is complete, config is loaded, format-specific sub-agents are matched to file types.
**After Phase 2:** Verify each sub-agent returned structured findings. Log file count scanned vs. file count in inventory. Report any files that were skipped with reasons.
**Before Phase 4 (report):** Verify cross-document analysis completed (Phase 3). Verify severity scoring inputs are complete.

### Failure Handling

- File cannot be opened (locked, corrupted, password-protected): log the failure per Edge Cases, continue with remaining files.
- Sub-agent scan fails for a format: report which format was not scanned, continue with others. Offer targeted retry.
- Partial results: aggregate what succeeded, clearly mark failed files in the report.
- Delta scan with no baseline: state that this is a first scan, no comparison available. Never fabricate delta data.
