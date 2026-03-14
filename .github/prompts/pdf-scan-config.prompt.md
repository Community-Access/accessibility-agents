---
name: config-pdf-scan
description: PDF scan configuration manager. Create, edit, validate .a11y-pdf-config.json files. Manages three rule layers (PDFUA, PDFBP, PDFQ), severity filters, preset profiles.
mode: agent
agent: pdf-scan-config
tools:
  - askQuestions
  - readFile
  - createFile
  - replaceStringInFile
---

# PDF Scan Configuration Manager

Create and manage `.a11y-pdf-config.json` files for PDF accessibility scanning.

## Action

**Action:** `${input:action}` (create, edit, validate, explain)

## Instructions

### Create New Config

Ask:

- **Profile:** strict (all 3 layers), moderate (PDFUA + PDFBP), minimal (PDFUA only)
- **Severity filter:** All, Errors+Warnings, Errors only

Load template from `templates/pdf-config-${profile}.json`:

```json
{
  "version": "1.0",
  "enabled": true,
  "rules": {
    "pdfua": {
      "PDFUA.001": { "enabled": true, "severity": "critical", "description": "Tagged structure required" },
      "PDFUA.002": { "enabled": true, "severity": "serious", "description": "Alt text on images" },
      "PDFUA.003": { "enabled": true, "severity": "serious", "description": "Document language set" },
      "PDFUA.004": { "enabled": true, "severity": "critical", "description": "Document title" },
      "PDFUA.005": { "enabled": true, "severity": "serious", "description": "Form field labels" },
      "PDFUA.006": { "enabled": true, "severity": "serious", "description": "Reading order" }
    },
    "pdfbp": {
      "PDFBP.001": { "enabled": true, "severity": "moderate", "description": "Bookmarks for navigation" },
      "PDFBP.002": { "enabled": true, "severity": "serious", "description": "Color contrast" },
      "PDFBP.003": { "enabled": true, "severity": "moderate", "description": "Security settings" },
      "PDFBP.004": { "enabled": true, "severity": "minor", "description": "Font embedding" }
    },
    "pdfq": {
      "PDFQ.001": { "enabled": true, "severity": "minor", "description": "Text extraction quality" },
      "PDFQ.002": { "enabled": true, "severity": "moderate", "description": "Image resolution" },
      "PDFQ.003": { "enabled": true, "severity": "minor", "description": "Pipeline metadata" }
    }
  },
  "severityFilter": "all",
  "layers": {
    "pdfua": { "enabled": true, "description": "PDF/UA conformance (ISO 14289-1)" },
    "pdfbp": { "enabled": true, "description": "Best practices" },
    "pdfq": { "enabled": true, "description": "Quality pipeline checks" }
  },
  "ignorePatterns": [
    "**/*.tmp",
    "**/.git/**",
    "**/node_modules/**"
  ]
}
```

Copy to `.a11y-pdf-config.json` in workspace root.

### Edit Existing Config

```bash
# Disable best practices layer
jq '.layers.pdfbp.enabled = false' .a11y-pdf-config.json > tmp.json && mv tmp.json .a11y-pdf-config.json

# Disable specific rule
jq '.rules.pdfq."PDFQ.001".enabled = false' .a11y-pdf-config.json > tmp.json && mv tmp.json .a11y-pdf-config.json

# Change severity filter to errors only
jq '.severityFilter = "errors-only"' .a11y-pdf-config.json > tmp.json && mv tmp.json .a11y-pdf-config.json
```

### Validate Config

Check:

- ✅ Valid JSON syntax
- ✅ version field present
- ✅ All rule IDs valid (PDFUA.*, PDFBP.*, PDFQ.*)
- ✅ All severity values valid (critical, serious, moderate, minor)
- ✅ severityFilter valid (all, errors-warnings, errors-only)
- ✅ Layer configuration present and valid

### Explain Config

For each rule:

- **Rule ID:** PDFUA.001
- **Layer:** PDF/UA Conformance
- **Description:** Tagged structure required
- **WCAG Criterion:** 1.3.1 Info and Relationships
- **Severity:** Critical
- **Enabled:** true/false
- **Why it matters:** Screen readers cannot navigate untagged PDFs

## Expected Output

- Created/updated `.a11y-pdf-config.json`
- Validation results
- Explanation of rules and layers (if requested)
- Ready for use by pdf-accessibility agent
