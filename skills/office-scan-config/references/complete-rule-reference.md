# Office Scan Config reference: Complete Rule Reference

Part of the `office-scan-config` skill. Read this only when the task reaches these sections.

## Complete Rule Reference

### Word (.docx) Rules

#### Errors

Each rule ID, with its name and description.

| Rule ID | Name | Description |
|---------|------|-------------|
| `DOCX-E001` | missing-alt-text | Images, shapes, SmartArt, charts without alt text |
| `DOCX-E002` | missing-table-header | Tables without designated header rows |
| `DOCX-E003` | skipped-heading-level | Heading levels that skip (H1 -> H3) |
| `DOCX-E004` | missing-document-title | Document title not set in properties |
| `DOCX-E005` | merged-split-cells | Tables with merged or split cells |
| `DOCX-E006` | ambiguous-link-text | Hyperlinks with non-descriptive text |
| `DOCX-E007` | no-heading-structure | Document has zero headings |
| `DOCX-E008` | document-access-restricted | IRM restrictions prevent assistive technology access |
| `DOCX-E009` | content-controls-without-titles | Content controls missing Title properties |

#### Warnings

Each rule ID, with its name and description.

| Rule ID | Name | Description |
|---------|------|-------------|
| `DOCX-W001` | nested-tables | Tables inside other tables |
| `DOCX-W002` | long-alt-text | Alt text exceeding 150 characters |
| `DOCX-W003` | manual-list | Manual bullet/number characters instead of list styles |
| `DOCX-W004` | blank-table-rows | Empty table rows/columns for spacing |
| `DOCX-W005` | heading-length | Heading text exceeding 100 characters |
| `DOCX-W006` | watermark-present | Document contains a watermark |

#### Tips

Each rule ID, with its name and description.

| Rule ID | Name | Description |
|---------|------|-------------|
| `DOCX-T001` | missing-document-language | Document language not set |
| `DOCX-T002` | layout-table-header | Layout table with header row markup |
| `DOCX-T003` | repeated-blank-chars | Repeated spaces/tabs/returns for formatting |

### Excel (.xlsx) Rules

#### Errors

Each rule ID, with its name and description.

| Rule ID | Name | Description |
|---------|------|-------------|
| `XLSX-E001` | missing-alt-text | Charts, images, shapes without alt text |
| `XLSX-E002` | missing-table-header | Data tables without header rows |
| `XLSX-E003` | default-sheet-name | Sheet tabs with default names (Sheet1) |
| `XLSX-E004` | merged-cells | Merged cells in data ranges |
| `XLSX-E005` | ambiguous-link-text | Hyperlinks with non-descriptive text |
| `XLSX-E006` | missing-workbook-title | Workbook title not set in properties |
| `XLSX-E007` | red-negative-numbers | Red-only indicator for negative numbers |
| `XLSX-E008` | workbook-access-restricted | IRM restrictions prevent assistive technology access |

#### Warnings

Each rule ID, with its name and description.

| Rule ID | Name | Description |
|---------|------|-------------|
| `XLSX-W001` | blank-cells-formatting | Blank cells used for spacing |
| `XLSX-W002` | color-only-data | Color as sole data indicator |
| `XLSX-W003` | complex-table-structure | Overly complex table structures |
| `XLSX-W004` | empty-sheet | Completely empty worksheets |
| `XLSX-W005` | long-alt-text | Alt text exceeding 150 characters |

#### Tips

Each rule ID, with its name and description.

| Rule ID | Name | Description |
|---------|------|-------------|
| `XLSX-T001` | sheet-tab-order | Illogical sheet tab order |
| `XLSX-T002` | missing-defined-names | Cell ranges without defined names |
| `XLSX-T003` | missing-workbook-language | Workbook language not set |

### PowerPoint (.pptx) Rules

#### Errors

Each rule ID, with its name and description.

| Rule ID | Name | Description |
|---------|------|-------------|
| `PPTX-E001` | missing-alt-text | Images, shapes, SmartArt without alt text |
| `PPTX-E002` | missing-slide-title | Slides without a title |
| `PPTX-E003` | duplicate-slide-title | Multiple slides with identical titles |
| `PPTX-E004` | missing-table-header | Tables without header rows |
| `PPTX-E005` | ambiguous-link-text | Hyperlinks with non-descriptive text |
| `PPTX-E006` | reading-order | Illogical content reading order |
| `PPTX-E007` | presentation-access-restricted | IRM restrictions prevent assistive technology access |

#### Warnings

Each rule ID, with its name and description.

| Rule ID | Name | Description |
|---------|------|-------------|
| `PPTX-W001` | missing-presentation-title | Presentation title not set |
| `PPTX-W002` | layout-table | Tables used for layout |
| `PPTX-W003` | merged-table-cells | Tables with merged cells |
| `PPTX-W004` | missing-captions | Audio/video without captions |
| `PPTX-W005` | color-only-meaning | Color as sole meaning indicator |
| `PPTX-W006` | long-alt-text | Alt text exceeding 150 characters |

#### Tips

Each rule ID, with its name and description.

| Rule ID | Name | Description |
|---------|------|-------------|
| `PPTX-T001` | missing-section-names | No meaningful section names |
| `PPTX-T002` | excessive-animations | Many animations/transitions |
| `PPTX-T003` | missing-slide-notes | Slides without speaker notes |
| `PPTX-T004` | missing-presentation-language | Language not set |

## Preset Profiles

### Strict Profile

All rules enabled, all severities checked. Use for public-facing or legally required documents.

```json
{
  "version": "1.0",
  "docx": {
    "enabled": true,
    "disabledRules": [],
    "severityFilter": ["error", "warning", "tip"]
  },
  "xlsx": {
    "enabled": true,
    "disabledRules": [],
    "severityFilter": ["error", "warning", "tip"]
  },
  "pptx": {
    "enabled": true,
    "disabledRules": [],
    "severityFilter": ["error", "warning", "tip"]
  }
}
```

### Moderate Profile

All errors and warnings, some tips disabled. A balanced default for most projects.

```json
{
  "version": "1.0",
  "docx": {
    "enabled": true,
    "disabledRules": ["DOCX-T002", "DOCX-T003"],
    "severityFilter": ["error", "warning", "tip"]
  },
  "xlsx": {
    "enabled": true,
    "disabledRules": ["XLSX-T001", "XLSX-T002"],
    "severityFilter": ["error", "warning", "tip"]
  },
  "pptx": {
    "enabled": true,
    "disabledRules": ["PPTX-T002", "PPTX-T003"],
    "severityFilter": ["error", "warning", "tip"]
  }
}
```

### Minimal Profile

Errors only. Use when introducing accessibility scanning to an existing document set - fix critical issues first.

```json
{
  "version": "1.0",
  "docx": {
    "enabled": true,
    "disabledRules": [],
    "severityFilter": ["error"]
  },
  "xlsx": {
    "enabled": true,
    "disabledRules": [],
    "severityFilter": ["error"]
  },
  "pptx": {
    "enabled": true,
    "disabledRules": [],
    "severityFilter": ["error"]
  }
}
```

### Single File Type Profile

Scan only Word documents:

```json
{
  "version": "1.0",
  "docx": {
    "enabled": true,
    "disabledRules": [],
    "severityFilter": ["error", "warning", "tip"]
  },
  "xlsx": { "enabled": false },
  "pptx": { "enabled": false }
}
```
