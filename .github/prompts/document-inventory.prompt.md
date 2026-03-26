---
name: scan-inventory
description: Document file discovery and inventory building. Scans folders for Office documents (.docx, .xlsx, .pptx) and PDFs. Builds typed inventories, detects delta changes.
mode: agent
agent: document-inventory
tools:
  - askQuestions
  - runInTerminal
  - getTerminalOutput
  - createFile
  - readFile
---

# Document Inventory Scanner

Discover and catalog Office documents and PDFs in a directory tree. Detect changed files via git diff for delta scanning.

## Directory to Scan

**Path:** `${input:directory}`

## Scan Mode

**Mode:** `${input:mode}` (full, delta)

## Instructions

### Step 1: Full Inventory Scan

**PowerShell (Windows):**

```powershell
$folder = '${input:directory}'
$files = Get-ChildItem -Path $folder -Recurse -File -Include *.docx,*.xlsx,*.pptx,*.pdf,*.epub | 
  Where-Object { 
    $_.Name -notlike '~$*' -and 
    $_.Name -notlike '*.tmp' -and 
    $_.Name -notlike '*.bak' -and 
    $_.FullName -notmatch '[\\/](\.git|node_modules|__pycache__|\.vscode)[\\/]' 
  }

# Build inventory
$inventory = $files | ForEach-Object {
  @{
    path = $_.FullName
    filename = $_.Name
    extension = $_.Extension
    size = $_.Length
    modified = $_.LastWriteTime
    created = $_.CreationTime
  }
}

# Save as JSON
$inventory | ConvertTo-Json -Depth 3 | Out-File document-inventory.json

# Summary
Write-Host "Total: $($files.Count) files"
Write-Host "  .docx: $(($files | Where-Object Extension -eq '.docx').Count)"
Write-Host "  .xlsx: $(($files | Where-Object Extension -eq '.xlsx').Count)"
Write-Host "  .pptx: $(($files | Where-Object Extension -eq '.pptx').Count)"
Write-Host "  .pdf: $(($files | Where-Object Extension -eq '.pdf').Count)"
Write-Host "  .epub: $(($files | Where-Object Extension -eq '.epub').Count)"
```

**Bash (macOS):**

```bash
find ${input:directory} -type f \( -name "*.docx" -o -name "*.xlsx" -o -name "*.pptx" -o -name "*.pdf" -o -name "*.epub" \) \
  ! -path "*/.git/*" \
  ! -path "*/node_modules/*" \
  ! -path "*/__pycache__/*" \
  ! -name "~$*" \
  ! -name "*.tmp" \
  ! -name "*.bak"
```

### Step 2: Delta Scan (Changed Files Only)

```bash
# Find documents changed since last commit
git diff --name-only HEAD~1 HEAD -- '*.docx' '*.xlsx' '*.pptx' '*.pdf' '*.epub'

# Or changed since specific date
git log --since="7 days ago" --name-only --pretty=format: -- '*.docx' '*.xlsx' '*.pptx' '*.pdf' '*.epub' | sort | uniq
```

### Step 3: Extract Document Metadata

**Word (.docx):**

```powershell
# Requires Open XML SDK or COM automation
$word = New-Object -ComObject Word.Application
$doc = $word.Documents.Open($path)
$props = $doc.BuiltInDocumentProperties
Write-Host "Title: $($props.Item('Title').Value)"
Write-Host "Author: $($props.Item('Author').Value)"
Write-Host "Subject: $($props.Item('Subject').Value)"
$doc.Close()
$word.Quit()
```

**PDF:**

```bash
# Requires pdfinfo (from poppler-utils)
pdfinfo file.pdf | grep -E "(Title|Author|Subject|Keywords)"
```

### Step 4: Build Typed Inventory

For each file:

- **path:** Absolute path
- **filename:** Base name
- **extension:** .docx, .xlsx, .pptx, .pdf, .epub
- **size:** Bytes
- **modified:** Last modified timestamp
- **created:** Creation timestamp
- **title:** Document title (from metadata, if available)
- **author:** Document author
- **language:** Document language

Save as structured JSON for consumption by analysis agents.

### Step 5: Generate Summary Report

```markdown
# Document Inventory: ${input:directory}

**Generated:** ${date}  
**Scope:** ${mode} scan

## Summary

- Total Files: ${total}
  - Word (.docx): ${docxCount}
  - Excel (.xlsx): ${xlsxCount}
  - PowerPoint (.pptx): ${pptxCount}
  - PDF (.pdf): ${pdfCount}
  - ePub (.epub): ${epubCount}

## Files

${fileList}
```

## Expected Output

- document-inventory.json with structured data
- Summary counts by file type
- Delta list (if delta mode)
- Ready for consumption by document-accessibility-wizard
