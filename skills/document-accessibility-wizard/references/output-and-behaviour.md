# Document Accessibility Wizard reference: Output Path

Part of the `document-accessibility-wizard` skill. Read this only when the task reaches these sections.

## Output Path

Write all output files (audit reports, CSV exports) to the current working directory. In a VS Code workspace this is the workspace root folder. From a CLI this is the shell's current directory. If the user specifies an alternative path in Phase 0, use that instead. Never write output to temporary directories, session storage, or agent-internal state.

### Platform-Aware Delegation

You are the orchestrator. Use the **Task** tool to delegate scanning to specialist sub-agents. Specialists are stored in `.claude/specialists/` -- load each with `Read(".claude/specialists/<name>.md")` and pass the file body (all content after the closing `---` frontmatter delimiter) as the `prompt` parameter. For parallel dispatch, launch multiple `Task` calls in the same turn without waiting between them.

**If the Task tool is available** (top-level invocation): Delegate to sub-agents listed below. Pass the Document Scan Context block to each. Collect and aggregate their findings.

**If the Task tool is unavailable** (running as a sub-agent of accessibility-lead or another coordinator): Apply the specialist document rules inline yourself. Use the rule prefixes (DOCX-*, XLSX-*, PPTX-*, PDFUA.*, PDFBP.*, PDFQ.*) from the accessibility-rules skill. Do not report that delegation failed; just do the work.

This dual-mode behavior ensures the wizard works correctly whether invoked directly by the user or spawned by another orchestrator.

### Your Sub-Agents

Each sub-agent, with its handles and rule prefix.

| Sub-Agent | Handles | Rule Prefix |
|-----------|---------|-------------|
| **word-accessibility** | `.docx` files - headings, alt text, tables, links, language, formatting | `DOCX-*` |
| **excel-accessibility** | `.xlsx` files - sheet names, table headers, merged cells, charts, color-only data | `XLSX-*` |
| **powerpoint-accessibility** | `.pptx` files - slide titles, reading order, alt text, captions, animations | `PPTX-*` |
| **pdf-accessibility** | `.pdf` files - PDF/UA, tagged structure, metadata, forms, bookmarks | `PDFUA.*`, `PDFBP.*`, `PDFQ.*` |
| **office-scan-config** | `.a11y-office-config.json` - rule enable/disable for Office formats | Config management |
| **pdf-scan-config** | `.a11y-pdf-config.json` - rule enable/disable for PDF scanning | Config management |
| **document-inventory** *(hidden helper)* | File discovery, inventory building, delta detection across folders | Discovery |
| **cross-document-analyzer** *(hidden helper)* | Cross-document pattern detection, severity scoring, template analysis | Analysis |

### Delegation Rules

1. **Never apply document rules directly.** Always frame findings using the sub-agent's rule IDs and guidance.
2. **Pass full context to each sub-agent.** Include: file path, scan profile (strict/moderate/minimal), and any user preferences from Phase 0.
3. **Collect structured results from each sub-agent.** Each sub-agent returns findings with: Rule ID, severity, location, description, impact, remediation steps.
4. **Aggregate and deduplicate.** If the same issue pattern appears across multiple files, group them.
5. **Hand off remediation questions.** If the user asks "how do I fix this Word heading?" -> delegate to `word-accessibility`. If they ask about PDF tagging -> delegate to `pdf-accessibility`.

### Context Passing Format

When invoking a sub-agent, provide this context block:

```text
## Document Scan Context
- **File:** [full path]
- **Scan Profile:** [strict | moderate | minimal]
- **Severity Filter:** [error, warning, tip]
- **Disabled Rules:** [list or "none"]
- **User Notes:** [any specifics from Phase 0]
- **Part of Batch:** [yes/no - if yes, indicate X of Y]
```

## Phase 0: Discovery and Scope

**You MUST use AskUserQuestion** to gather context before scanning. Never assume - always ask.

### Step 1: What to Scan

Ask: **"What would you like to scan for document accessibility?"**
Options:

- **A single file** - I have one specific document to audit
- **Multiple specific files** - I have a list of files to audit
- **A folder** - Scan all documents in a folder
- **A folder (recursive)** - Scan all documents in a folder and all its subfolders
- **Changed files only (delta scan)** - Scan only files modified since the last audit
- **Re-scan with comparison** - Scan files and compare results against a previous audit report

### Step 2: File/Folder Selection

Based on Step 1:

**If single file:**
Ask: **"What is the path to the document?"** - Let the user type or paste the file path.

**If multiple files:**
Ask: **"Please list the file paths (one per line or comma-separated)."** - Accept multiple paths.

**If folder or folder (recursive):**
Ask: **"What is the folder path?"** - Let the user provide the folder path.

Then ask: **"Which document types should I scan?"**
Options (multi-select):

- **All supported types** (.docx, .xlsx, .pptx, .pdf)
- **Word documents only** (.docx)
- **Excel workbooks only** (.xlsx)
- **PowerPoint presentations only** (.pptx)
- **PDF documents only** (.pdf)
- **Office documents only** (.docx, .xlsx, .pptx - no PDFs)
- **Let me pick specific types** - show checkboxes for each type

### Step 3: Scan Configuration

Ask: **"What scan profile should I use?"**
Options:

- **Strict** - All rules, all severities. Best for public-facing or legally required documents (Section 508, EN 301 549).
- **Moderate** - All rules, errors and warnings only. Good for most organizations.
- **Minimal** - Errors only. Best for triaging large document libraries to find the worst problems first.
- **Custom** - Let me configure specific rules (delegates to `office-scan-config` and/or `pdf-scan-config`).

### Step 4: Reporting Preferences

Ask using AskUserQuestion:

1. **"Where should I write the audit report?"** - Options: `DOCUMENT-ACCESSIBILITY-AUDIT.md` (default), Custom path
2. **"How should I organize findings?"** - Options:
   - **By file** - group all issues under each document (best for small batches)
   - **By issue type** - group all instances of each rule across documents (best for seeing patterns)
   - **By severity** - critical first, then serious, moderate, minor (best for prioritizing fixes)
3. **"Should I include remediation steps for every issue?"** - Options: Yes (detailed), Summary only, No (just findings)

### Step 5: Existing Configuration Check

Before scanning, check for existing configuration files:

```text
Look for:
- .a11y-office-config.json (Office document scan rules)
- .a11y-pdf-config.json (PDF scan rules)
```

If found, report current settings and ask: **"I found existing scan configuration. Should I use it, or override with the profile you selected?"**

If not found, proceed with the selected profile defaults.

### Step 6: Incremental/Delta Scan Configuration

If the user selected **Changed files only (delta scan)** or **Re-scan with comparison** in Step 1, configure the delta detection method.

Ask: **"How should I detect which files have changed?"**
Options:

- **Git diff** - use `git diff --name-only` to find files changed since the last commit/tag
- **Since last audit** - compare file modification timestamps against the previous audit report's date
- **Since a specific date** - let me specify a cutoff date
- **Against a baseline report** - compare against a specific previous audit report file

If the user selects **Git diff**, ask: **"What git reference should I compare against?"**
Options:

- **Last commit** - files changed in the most recent commit
- **Last tag** - files changed since the last git tag
- **Specific branch/commit** - let me specify a ref
- **Last N days** - files changed in the last N days

If the user selects **Against a baseline report**, ask: **"What is the path to the previous audit report?"**
Let the user provide the path to a previous `DOCUMENT-ACCESSIBILITY-AUDIT.md` file.

Store the delta configuration for use in Phase 1 (file filtering) and Phase 3 (comparison analysis).

## Phase 1: File Discovery and Inventory

Based on Discovery results, build a complete file inventory.

### Single File

Verify the file exists and identify its type. Report:

```text
 1 file to scan:
  1. report.docx (Word document)
```

### Multiple Files

Verify each file exists. Report missing files. Show inventory:

```text
 3 files to scan:
  1. report.docx (Word document)
  2. data.xlsx (Excel workbook)
  3. slides.pptx (PowerPoint presentation)

 1 file not found:
  - missing.pdf - skipping
```

### Folder Scan (Non-Recursive)

List matching files in the specified folder only (no subfolders):

```bash
# Find documents in the target folder (non-recursive)
find "<folder>" -maxdepth 1 -type f \( -name "*.docx" -o -name "*.xlsx" -o -name "*.pptx" -o -name "*.pdf" \) ! -name "~\$*" ! -name "*.tmp" ! -name "*.bak"
```

### Folder Scan (Recursive)

Traverse all subfolders:

```bash
# Recursive scan - all subfolders
find "<folder>" -type f \( -name "*.docx" -o -name "*.xlsx" -o -name "*.pptx" -o -name "*.pdf" \) ! -name "~\$*" ! -name "*.tmp" ! -name "*.bak" ! -path "*/.git/*" ! -path "*/node_modules/*" ! -path "*/__pycache__/*" ! -path "*/.vscode/*"
```

### Apply Type Filter

If the user selected specific document types in Step 2, filter the results to only include those extensions.

### Inventory Report

Present the full inventory to the user before scanning:

```text
 Document Inventory

Scanning: /docs (recursive)
File type filter: .docx, .xlsx, .pptx, .pdf

Found 12 documents:
  Word (.docx):        4 files
  Excel (.xlsx):       3 files
  PowerPoint (.pptx):  2 files
  PDF (.pdf):          3 files

Folders containing documents: 5
  /docs/
  /docs/reports/
  /docs/reports/quarterly/
  /docs/templates/
  /docs/presentations/

```

Ask: **"Proceed with scanning all 12 documents?"**
Options:

- **Yes, scan all** - proceed
- **Let me exclude some** - show the file list and let the user deselect
- **Too many - scan a sample** - scan a representative subset and extrapolate

### Large Batch Handling

If more than 50 documents are found:

1. Warn the user: "Found X documents. Scanning all may take time."
2. Offer: **"How would you like to proceed?"**
   - **Scan all [X] documents** - full comprehensive audit
   - **Sample 10-20 files** - proportional sample across types and folders for a quick assessment
   - **Scan by type** - let me pick which document types to scan first
   - **Scan by folder** - let me pick which folders to scan first
   - **Set a limit** - scan the first N files only
3. If scanning by type, present document types with counts (e.g., "Word (23 files)", "PDF (15 files)").
4. If scanning by folder, present folders with document counts.
5. After sampling, report: "Based on the sample, here are the most common issues. Run a full scan to find all instances."

### Mid-Scan Checkpoint (for batches > 10 files)

After scanning half the files in a large batch, ask:

**"Scanned [X] of [Y] files so far. [N] errors found. Continue?"**
Options:

- **Continue scanning** - scan the remaining files
- **Stop here and generate report** - report on what's been scanned so far
- **Skip remaining files of type [least problematic type]** - focus on the types with the most issues
