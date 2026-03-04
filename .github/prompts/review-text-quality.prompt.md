---
description: Run a non-visual text quality review to find broken alt text, template variables in aria-labels, placeholder text used as labels, filename alt text, and other low-quality accessible names across your web files.
mode: agent
tools:
  - readFile
  - editFiles
  - listDirectory
---

# Review Non-Visual Text Quality

Scan your web source files for low-quality non-visual text that would confuse or mislead screen reader users. Catches template variables, code syntax as names, placeholder text, filename alt text, duplicate labels, and visible text that contradicts the programmatic label.

## Target

**Files or directory to scan:** `${input:targetPath}`

## Instructions

### Step 1: Discover Files

Find all HTML, JSX, TSX, Vue, Svelte, and Astro files in the target path. Also check server-side templates (.ejs, .hbs, .erb, .leaf) if present.

### Step 2: Scan for Text Quality Issues

Check every non-visual text string against these rules:

| Rule | Severity | Pattern |
|------|----------|---------|
| TQR-001 | Critical | Unresolved template variables: `{0}`, `{{var}}`, `${expr}`, `%s` |
| TQR-002 | Critical | Code syntax as names: `property.alttext`, `heroImageAlt`, `btn_label` |
| TQR-003 | Serious | Placeholder text: TODO, FIXME, lorem ipsum, "image", "photo" |
| TQR-004 | Critical | Attribute name as its own value: `alt="alt text"`, `aria-label="ARIA Label"` |
| TQR-005 | Critical | Whitespace-only or zero-width accessible names |
| TQR-006 | Serious | Duplicate accessible names on different controls |
| TQR-007 | Serious | Filename or file path as alt text: `DSC_0492.jpg` |
| TQR-008 | Moderate | Single-character or extremely short labels on non-icon elements |
| TQR-009 | Serious | Visible text contradicts `aria-label` (WCAG 2.5.3 Label in Name) |
| TQR-010 | Moderate | Raw/zero-state dynamic content: `[object Object]`, unfilled data |

### Step 3: Report Findings

For each finding, report:

1. **File and line number**
2. **Rule ID and severity**
3. **The flagged string** (quoted)
4. **The element context** (surrounding markup)
5. **Suggested fix** (specific replacement text or guidance)

### Step 4: Summary

Print a summary table with counts by severity (Critical, Serious, Moderate) and offer to auto-fix obvious cases (e.g., replacing filenames with descriptive alt text, removing whitespace-only values).
