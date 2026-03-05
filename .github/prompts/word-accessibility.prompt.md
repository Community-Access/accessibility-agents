---
name: audit-word
description: Word document accessibility specialist. Scans and remediates .docx files for accessibility. Covers document title, heading structure, alt text, table headers, language settings.
mode: agent
agent: word-accessibility
tools:
  - askQuestions
  - readFile
  - runInTerminal
  - getTerminalOutput
---

# Word Document Accessibility Audit

Audit Microsoft Word (.docx) documents for accessibility compliance with WCAG 2.1 AA and Microsoft Accessibility Checker rules.

## Document to Audit

**File:** `${input:docFile}`

## Instructions

### Step 1: Run Office Accessibility Checker

**PowerShell (Windows):**
```powershell
$word = New-Object -ComObject Word.Application
$doc = $word.Documents.Open((Resolve-Path "${input:docFile}"))
$issues = $doc.CheckAccessibility()
$issues.Results | Format-Table -AutoSize
$doc.Close()
$word.Quit()
```

**Or use Open XML SDK (cross-platform):**
```bash
# Requires custom C# tool
dotnet run --project CheckAccessibility.csproj document.docx
```

### Step 2: Check Document Title

**Rule:** DOCX-001  
**WCAG:** 2.4.2 Page Titled

Document must have title in properties:
- File → Info → Properties → Title (Word UI)
- Or `<dc:title>` in docProps/core.xml

### Step 3: Check Heading Structure

**Rules:** DOCX-002, DOCX-003  
**WCAG:** 1.3.1 Info and Relationships

- At least one Heading 1
- No skipped heading levels (H1 → H3)
- Headings use styles, not just bold formatting

### Step 4: Check Alt Text

**Rule:** DOCX-004  
**WCAG:** 1.1.1 Non-text Content

All images/shapes must have:
- Alt text (meaningful description)
- Or marked as decorative

Check: Right-click image → View Alt Text

### Step 5: Check Tables

**Rules:** DOCX-005, DOCX-006  
**WCAG:** 1.3.1 Info and Relationships

- First row marked as header
- No merged cells
- Table not used for layout

Check: Table Tools → Design → Header Row checkbox

### Step 6: Check Hyperlinks

**Rule:** DOCX-007  
**WCAG:** 2.4.4 Link Purpose Clear

- Link text descriptive (not "click here")
- ScreenTip added for additional context

### Step 7: Check Language

**Rule:** DOCX-008  
**WCAG:** 3.1.1 Language of Page

Document language set:
- Review → Language → Set Proofing Language

### Step 8: Provide Remediation Report

For each issue:
- Rule ID (DOCX-xxx)
- WCAG criterion
- Location in document (page, paragraph)
- Current state
- Remediation steps
- Priority (Critical/Serious/Moderate)

## Expected Output

- Accessibility Checker results summary
- Detailed findings with rule IDs
- Remediation steps for each issue
- Severity score (0-100, A-F grade)
- Fixed document (if requested)
