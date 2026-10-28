# report-generation Skill

> Audit report formatting, severity scoring, scorecard computation, and compliance export for document accessibility audits. Covers the required sections for `DOCUMENT-ACCESSIBILITY-AUDIT.md`, the severity scoring formula (0-100 with A-F grades), confidence-weighted penalty calculations, VPAT/ACR conformance levels and edition support, remediation tracking, and cross-run progress metrics.

## Agents That Use This Skill

Each agent, with its why.

| Agent | Why |
|-------|-----|
| [document-accessibility-wizard](../skills/document-accessibility-wizard.md) | Generates all document audit reports |
| [cross-document-analyzer](../skills/cross-document-analyzer.md) | Produces cross-document pattern sections and scorecards |

## Required Report Sections

Every `DOCUMENT-ACCESSIBILITY-AUDIT.md` must include these sections in order:

| # | Section | Contents |
|---|---------|----------|
| 1 | **Audit Information** | Date, auditor, profile, scope, file counts |
| 2 | **Executive Summary** | Totals, pass rate, most common issue, effort estimate |
| 3 | **Cross-Document Patterns** | Recurring issues, systemic failures across files |
| 4 | **Findings by File** | Per-document issues: rule ID, severity, location, WCAG SC, impact, remediation |
| 5 | **Findings by Rule (Cross-Reference)** | Rule-level aggregation across all files |
| 6 | **What Passed** | Acknowledge clean documents and clean categories |
| 7 | **Remediation Priority** | Ordered by impact: Immediate / Soon / When Possible |
| 8 | **Accessibility Scorecard** | Per-document scores and grades |
| 9 | **Metadata Dashboard** | Document property health (title, language, author) |
| 10 | **Confidence Summary** | Breakdown of findings by High / Medium / Low confidence |

### Optional Sections

Include when applicable:

- **Template Analysis** - when batch scanning detects shared templates
- **Comparison Report** - when re-scanning against a baseline
- **CI/CD Recommendations** - when no scan config files exist

## Severity Scoring Formula

The score and grade in a rendered report come from
`skills/a11y-core/scripts/merge-findings.mjs`, which `render-report.mjs` runs;
where this page and the script differ, the script decides.

```text
penalty = sum over findings of severity_weight x confidence_factor
          (weights: critical 10, serious 5, moderate 2, minor 1;
           confidence: high 1.0, medium 0.7, low 0.4)
checks  = max(number of findings + number of passed checks, 10)
score   = max(0, round(100 - (penalty / checks) x 20))
```

A document checker's levels (error, warning, tip) are mapped onto these
canonical severities first, through `kb-severity-mapping`; errors and warnings
are not scored directly. The full formula is in `kb-web-severity-scoring`.

## Score Grades

Each score band, with its grade.

| Score | Grade |
|-------|-------|
| 90-100 | A |
| 80-89 | B |
| 70-79 | C |
| 60-69 | D |
| 0-59 | F |

## Scorecard Format

```markdown
## Accessibility Scorecard

| Document | Score | Grade | Errors | Warnings | Tips |
|----------|-------|-------|--------|----------|------|
| report.docx | 84 | B | 1 | 3 | 2 |
| data.xlsx | 62 | D | 3 | 4 | 1 |
| slides.pptx | 91 | A | 0 | 2 | 3 |
| **Average** | **79** | **C** | **4** | **9** | **6** |
```

## VPAT/ACR Compliance Export

### Conformance Levels

Each level, with when to use.

| Level | When to Use |
|-------|------------|
| Supports | No findings for this WCAG criterion across any document |
| Partially Supports | Some documents pass, some fail |
| Does Not Support | All or most documents fail |
| Not Applicable | Criterion does not apply to scanned document types |

### Supported VPAT Editions

Each edition, with its standard.

| Edition | Standard |
|---------|---------|
| VPAT 2.5Rev (WCAG) | WCAG 2.2 criteria |
| VPAT 2.5Rev (508) | Revised Section 508 |
| VPAT 2.5Rev (EU) | EN 301 549 (the template still points at V3.2.1) |
| VPAT 2.5Rev (INT) | All three combined |

## Remediation Tracking

When re-scanning against a baseline:

| Status | Definition |
|--------|-----------|
|  Fixed | In previous report, resolved now |
|  New | Not in previous report, appears now |
|  Persistent | Remains from previous report |
|  Regressed | Previously fixed, has returned |

### Progress Metrics

- **Issue reduction:** `(fixed / previous_total) x 100`
- **Score change:** `current_score - previous_score`
- **Documents improved:** count with higher scores than previous scan

## Organization Modes

Each mode, with best for.

| Mode | Best For |
|------|----------|
| By file | Small batches (< 10 files) |
| By issue type | Spotting systemic patterns |
| By severity | Prioritizing the fix order |

## Skill Location

`skills/kb-report-generation/SKILL.md`
