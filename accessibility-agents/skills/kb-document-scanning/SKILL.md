---
name: kb-document-scanning
description: Reference data, not a reviewer. Discover and inventory documents for accessibility audits. Scans folders for .docx, .xlsx, .pptx, PDF and ePub files. Detects git changes and extracts title, author, and language metadata.
license: MIT
disable-model-invocation: true
user-invocable: false
metadata:
  tier: reference
  domain: cross-cutting
  output: none
  effort: low
  title: Document Scanning
---

## Document Scanning

## Supported File Types

Each extension, with its type and sub-agent.

| Extension | Type | Sub-Agent |
|-----------|------|-----------|
| .docx | Word document | word-accessibility |
| .xlsx | Excel workbook | excel-accessibility |
| .pptx | PowerPoint presentation | powerpoint-accessibility |
| .pdf | PDF document | pdf-accessibility |
| .epub | ePub publication | epub-accessibility |

## File Discovery Commands

### PowerShell (Windows)

```powershell
# Non-recursive scan (-Include needs the trailing \* when -Recurse is not used)
Get-ChildItem -Path "<folder>\*" -File -Include *.docx,*.xlsx,*.pptx,*.pdf,*.epub

# Recursive scan
Get-ChildItem -Path "<folder>" -File -Include *.docx,*.xlsx,*.pptx,*.pdf,*.epub -Recurse |
  Where-Object Name -notmatch '^~\$' |
  Where-Object FullName -notmatch '[\\/](\.git|node_modules|__pycache__|\.vscode)[\\/]'
```

### Bash (macOS)

```bash
# Non-recursive scan
find "<folder>" -maxdepth 1 -type f \( -name "*.docx" -o -name "*.xlsx" -o -name "*.pptx" -o -name "*.pdf" -o -name "*.epub" \) ! -name '~[$]*'

# Recursive scan
find "<folder>" -type f \( -name "*.docx" -o -name "*.xlsx" -o -name "*.pptx" -o -name "*.pdf" -o -name "*.epub" \) \
  ! -name '~[$]*' ! -name "*.tmp" ! -name "*.bak" \
  ! -path "*/.git/*" ! -path "*/node_modules/*" ! -path "*/__pycache__/*" ! -path "*/.vscode/*"
```

## Delta Detection

### Git-based

```bash
# Files changed since last commit
git diff --name-only HEAD~1 HEAD -- '*.docx' '*.xlsx' '*.pptx' '*.pdf' '*.epub'

# Files changed since a specific tag
git diff --name-only <tag> HEAD -- '*.docx' '*.xlsx' '*.pptx' '*.pdf' '*.epub'

# Files changed in the last N days
git log --since="N days ago" --name-only --diff-filter=ACMR --pretty="" -- '*.docx' '*.xlsx' '*.pptx' '*.pdf' '*.epub' | sort -u
```

### Timestamp-based (PowerShell)

```powershell
# Files modified since a specific date
Get-ChildItem -Path "<folder>" -File -Include *.docx,*.xlsx,*.pptx,*.pdf,*.epub -Recurse |
  Where-Object LastWriteTime -gt ([datetime]"2025-01-01")
```

## Files to Skip

Always exclude these patterns during scanning:

- `~$` files - Office lock/temp files (names starting with `~$`) (created when a document is open)
- `*.tmp` - Temporary files
- `*.bak` - Backup files
- Files inside `.git/`, `node_modules/`, `.vscode/`, `__pycache__/` directories

## Scan Configuration Files

Each file, with its purpose.

| File | Purpose |
|------|---------|
| `.a11y-office-config.json` | Rule enable/disable for Word, Excel, PowerPoint |
| `.a11y-pdf-config.json` | Rule enable/disable for PDF scanning |
| `.a11y-epub-config.json` | Rule enable/disable for ePub scanning |

### Scan Profiles

Each profile, with rules, severities and use case.

| Profile | Rules | Severities | Use Case |
|---------|-------|------------|----------|
| Strict | All | Error, Warning, Tip | Public-facing, legally required documents |
| Moderate | All | Error, Warning | Most organizations |
| Minimal | All | Error only | Triaging large document libraries |

## Context Passing Format

When delegating to a sub-agent, always provide this context block:

```text
## Document Scan Context
- **File:** [full path]
- **Scan Profile:** [strict | moderate | minimal]
- **Severity Filter:** [error, warning, tip]
- **Disabled Rules:** [list or "none"]
- **User Notes:** [any specifics]
- **Part of Batch:** [yes/no - if yes, indicate X of Y]
```
