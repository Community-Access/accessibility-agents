# Office Scan Config reference: Complete Rule Reference

Part of the `office-scan-config` skill. Read this only when the task reaches these sections.

## Complete Rule Reference

These rule IDs belong to this project. Microsoft's own Accessibility Checker reports its rules in four categories, Error, Warning, Tip and Intelligent Services, listed in [Rules for the Accessibility Checker](https://support.microsoft.com/en-us/accessibility/office-accessibility/rules-for-the-accessibility-checker). The project's severities do not always match Microsoft's category for the same check. This table maps each Microsoft rule to the project rules that cover it.

| Microsoft rule | Microsoft category | Project rules |
|---|---|---|
| All non-text content has alternative text (alt text) | Error | `DOCX-E001`, `XLSX-E001`, `PPTX-E001` |
| Tables specify column header information | Error | `DOCX-E002`, `XLSX-E002`, `PPTX-E004` |
| All sections have meaningful names | Error | `PPTX-T001` |
| All slides have titles | Error | `PPTX-E002` |
| Cells in an Excel worksheet don't use red-only formatting for negative numbers | Error | `XLSX-E007` |
| Document access is not restricted | Error | `DOCX-E008`, `XLSX-E008`, `PPTX-E007` |
| All content control fields have titles | Error | `DOCX-E009` |
| Table has a simple structure | Warning | `DOCX-E005`, `DOCX-W001`, `XLSX-E004`, `XLSX-W003`, `PPTX-W003` |
| Sheet tabs have meaningful names | Warning | `XLSX-E003`, `XLSX-W004` |
| Sufficient contrast between text and background | Warning | None; check contrast manually |
| Closed captions are included for inserted audio and video | Warning | `PPTX-W004` |
| The reading order of the objects on a slide presentation is logical | Warning | `PPTX-E006` |
| The section names in a deck are unique | Tip | `PPTX-T001` |
| Slide titles in a deck are unique | Tip | `PPTX-E003` |
| Documents use heading styles | Tip | `DOCX-E007` |
| Suggested alternative text | Intelligent Services | None; review generated alt text under `DOCX-E001`, `XLSX-E001`, `PPTX-E001` |

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
  "xlsx": { "enabled": false, "disabledRules": [], "severityFilter": ["error"] },
  "pptx": { "enabled": false, "disabledRules": [], "severityFilter": ["error"] }
}
```
