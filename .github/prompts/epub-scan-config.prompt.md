---
name: config-epub-scan
description: ePub scan configuration manager. Create, edit, validate .a11y-epub-config.json files. Manages EPUB Accessibility 1.1 rules, severity filters, profiles.
mode: agent
agent: epub-scan-config
tools:
  - askQuestions
  - readFile
  - createFile
  - replaceStringInFile
---

# ePub Scan Configuration Manager

Create and manage `.a11y-epub-config.json` files for ePub accessibility scanning.

## Action

**Action:** `${input:action}` (create, edit, validate, explain)

## Instructions

### Create New Config

Ask:

- **Profile:** strict (all rules), moderate (EPUB + WCAG), minimal (EPUB only)
- **Severity filter:** All, Errors+Warnings, Errors only

Load template from `templates/epub-config-${profile}.json`:

```json
{
  "version": "1.0",
  "enabled": true,
  "rules": {
    "EPUB-001": {
      "enabled": true,
      "severity": "serious",
      "description": "Accessibility metadata required",
      "standard": "EPUB Accessibility 1.1"
    },
    "EPUB-002": {
      "enabled": true,
      "severity": "serious",
      "description": "Reading order must be logical",
      "wcag": "1.3.2"
    },
    "EPUB-003": {
      "enabled": true,
      "severity": "critical",
      "description": "Navigation document required",
      "standard": "EPUB 3.x"
    },
    "EPUB-004": {
      "enabled": true,
      "severity": "serious",
      "description": "Content documents must have proper structure",
      "wcag": "1.3.1, 1.1.1"
    },
    "EPUB-005": {
      "enabled": true,
      "severity": "serious",
      "description": "Language must be set",
      "wcag": "3.1.1"
    },
    "EPUB-006": {
      "enabled": true,
      "severity": "moderate",
      "description": "Page list navigation (if applicable)",
      "standard": "EPUB Accessibility 1.1"
    }
  },
  "severityFilter": "all",
  "tools": {
    "epubcheck": true,
    "ace": true
  },
  "ignorePatterns": [
    "**/*.tmp",
    "**/.git/**"
  ]
}
```

Copy to `.a11y-epub-config.json` in workspace root.

### Edit Existing Config

```bash
# Disable specific rule
jq '.rules."EPUB-006".enabled = false' .a11y-epub-config.json > tmp.json && mv tmp.json .a11y-epub-config.json

# Change severity filter
jq '.severityFilter = "errors-warnings"' .a11y-epub-config.json > tmp.json && mv tmp.json .a11y-epub-config.json

# Disable Ace scanner (use epubcheck only)
jq '.tools.ace = false' .a11y-epub-config.json > tmp.json && mv tmp.json .a11y-epub-config.json
```

### Validate Config

Check:

- ✅ Valid JSON syntax
- ✅ version field present
- ✅ All rule IDs valid (EPUB-*)
- ✅ All severity values valid (critical, serious, moderate, minor)
- ✅ severityFilter valid (all, errors-warnings, errors-only)
- ✅ Tool configuration present

### Explain Config

For each rule:

- **Rule ID:** EPUB-003
- **Description:** Navigation document required
- **Standard:** EPUB 3.x specification
- **WCAG Criterion:** 2.4.5 Multiple Ways (implied)
- **Severity:** Critical
- **Enabled:** true/false
- **Why it matters:** Screen readers rely on nav.xhtml to navigate books

## Expected Output

- Created/updated `.a11y-epub-config.json`
- Validation results
- Explanation of rules (if requested)
- Tool configuration (epubcheck, Ace by DAISY)
- Ready for use by epub-accessibility agent
