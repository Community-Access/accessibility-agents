---
name: config-office-scan
description: Office document scan configuration manager. Create, edit, validate .a11y-office-config.json files. Manages rule profiles, severity filters, per-project scan customization.
mode: agent
agent: office-scan-config
tools:
  - askQuestions
  - readFile
  - createFile
  - replaceStringInFile
---

# Office Scan Configuration Manager

Create and manage `.a11y-office-config.json` files for Word, Excel, and PowerPoint accessibility scanning.

## Action

**Action:** `${input:action}` (create, edit, validate, explain)

## Instructions

### Create New Config

Ask:
- **Profile:** strict (all rules, all severities), moderate (all rules, errors+warnings), minimal (errors only)
- **Document types:** docx, xlsx, pptx (all or specific)
- **Severity filter:** All, Errors+Warnings, Errors only

Load template from `templates/office-config-${profile}.json`:

```json
{
  "version": "1.0",
  "enabled": true,
  "rules": {
    "docx": {
      "DOCX-001": { "enabled": true, "severity": "critical" },
      "DOCX-002": { "enabled": true, "severity": "serious" },
      "DOCX-003": { "enabled": true, "severity": "serious" },
      "DOCX-004": { "enabled": true, "severity": "serious" },
      "DOCX-005": { "enabled": true, "severity": "moderate" },
      "DOCX-006": { "enabled": true, "severity": "moderate" },
      "DOCX-007": { "enabled": true, "severity": "moderate" },
      "DOCX-008": { "enabled": true, "severity": "serious" }
    },
    "xlsx": {
      "XLSX-001": { "enabled": true, "severity": "moderate" },
      "XLSX-002": { "enabled": true, "severity": "serious" },
      "XLSX-003": { "enabled": true, "severity": "serious" },
      "XLSX-004": { "enabled": true, "severity": "moderate" },
      "XLSX-005": { "enabled": true, "severity": "serious" },
      "XLSX-006": { "enabled": true, "severity": "moderate" },
      "XLSX-007": { "enabled": true, "severity": "critical" }
    },
    "pptx": {
      "PPTX-001": { "enabled": true, "severity": "serious" },
      "PPTX-002": { "enabled": true, "severity": "serious" },
      "PPTX-003": { "enabled": true, "severity": "serious" },
      "PPTX-004": { "enabled": true, "severity": "moderate" },
      "PPTX-005": { "enabled": true, "severity": "moderate" },
      "PPTX-006": { "enabled": true, "severity": "minor" },
      "PPTX-007": { "enabled": true, "severity": "minor" },
      "PPTX-008": { "enabled": true, "severity": "serious" }
    }
  },
  "severityFilter": "all",
  "ignorePatterns": [
    "**/~$*",
    "**/*.tmp",
    "**/*.bak",
    "**/.git/**",
    "**/node_modules/**"
  ]
}
```

Copy to `.a11y-office-config.json` in workspace root.

### Edit Existing Config

```bash
# Disable specific rule
jq '.rules.docx."DOCX-006".enabled = false' .a11y-office-config.json > tmp.json && mv tmp.json .a11y-office-config.json

# Change severity filter
jq '.severityFilter = "errors-only"' .a11y-office-config.json > tmp.json && mv tmp.json .a11y-office-config.json

# Add ignore pattern
jq '.ignorePatterns += ["**/archive/**"]' .a11y-office-config.json > tmp.json && mv tmp.json .a11y-office-config.json
```

### Validate Config

Check:
- ✅ Valid JSON syntax
- ✅ version field present
- ✅ All rule IDs valid (DOCX-*, XLSX-*, PPTX-*)
- ✅ All severity values valid (critical, serious, moderate, minor)
- ✅ severityFilter valid (all, errors-warnings, errors-only)

### Explain Config

For each rule:
- **Rule ID:** DOCX-001
- **Description:** Missing document title
- **WCAG Criterion:** 2.4.2 Page Titled
- **Severity:** Critical
- **Enabled:** true/false
- **Why it matters:** Screen readers announce document title, helps users navigate multiple documents

## Expected Output

- Created/updated `.a11y-office-config.json`
- Validation results
- Explanation of rules (if requested)
- Ready for use by document-accessibility-wizard
