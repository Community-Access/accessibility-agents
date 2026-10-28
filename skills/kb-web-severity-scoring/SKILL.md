---
name: kb-web-severity-scoring
description: Reference data, not a reviewer. Compute web accessibility scores (0-100, A-F grades) with severity scoring, confidence levels, and remediation tracking across audits.
license: MIT
disable-model-invocation: true
user-invocable: false
metadata:
  tier: reference
  domain: cross-cutting
  output: none
  effort: low
  title: Web Severity Scoring
---

## Web Severity Scoring

This file describes the scoring that `skills/a11y-core/scripts/merge-findings.mjs`
computes for every rendered report. Where this file and the script differ, the
script decides. A score is not a conformance claim: only a finding-free review
against every criterion at the target level supports "conforms".

## Score formula

```text
penalty = sum over findings of severity_weight x confidence_factor
checks  = max(number of findings + number of passed checks, 10)
score   = max(0, round(100 - (penalty / checks) x 20))
```

Each severity, with its weight.

| Severity | Weight |
|---|---|
| critical | 10 |
| serious | 5 |
| moderate | 2 |
| minor | 1 |

Dividing by the number of checks keeps a large audit from scoring lower only
because it looked at more. The floor of 10 checks stops a tiny audit with one
finding from scoring near zero.

**Example:** one critical finding at high confidence and 9 passed checks gives
penalty 10, checks 10, score 100 - (10 / 10) x 20 = 80, grade B.

## Grades

Each score band, with its grade.

| Score | Grade |
|---|---|
| 90-100 | A |
| 80-89 | B |
| 70-79 | C |
| 60-69 | D |
| 0-59 | F |

## Confidence

Each level, with its factor and when to use it.

| Level | Factor | When to use |
|---|---|---|
| high | 1.0 | Structural and certain (missing alt, no label, no lang), or found by two sources (for example axe-core and code review) |
| medium | 0.7 | One source, likely an issue (heading edge cases, questionable ARIA, possible keyboard trap) |
| low | 0.4 | Needs human review (alt text quality, reading order, context-dependent link text) |

A finding confirmed by a third source, such as a Playwright run that tabs
into the trap, stays `high`; the schema has no higher level. Merging keeps the
highest confidence any source reported for the same rule at the same location.

## Scorecard Format

### Single Page

```markdown
## Accessibility Score

| Metric | Value |
|--------|-------|
| Page | [URL] |
| Score | [0-100] |
| Grade | [A-F] |
| Critical | [count] |
| Serious | [count] |
| Moderate | [count] |
| Minor | [count] |
```

### Multi-Page

```markdown
## Accessibility Scorecard

| Page | Score | Grade | Critical | Serious | Moderate | Minor |
|------|-------|-------|----------|---------|----------|-------|
| / | 82 | B | 0 | 2 | 3 | 1 |
| /login | 91 | A | 0 | 0 | 2 | 1 |
| /dashboard | 45 | F | 2 | 4 | 3 | 2 |
| **Average** | **72.7** | **C** | **2** | **6** | **8** | **4** |
```

## Cross-Page Pattern Classification

Each pattern type, with its definition and remediation ROI.

| Pattern Type | Definition | Remediation ROI |
|-------------|-----------|-----------------|
| Systemic | Same issue on every audited page | Highest - usually layout/nav, fix once |
| Template | Same issue on pages sharing a component | High - fix the shared component |
| Page-specific | Unique to one page | Normal - fix individually |

## Remediation Tracking

### Change Classification

Each status, with its definition.

| Status | Definition |
|--------|-----------|
| Fixed | Issue was in previous report but no longer present |
| New | Issue not in previous report, appears now |
| Persistent | Issue remains from previous report |
| Regressed | Issue remains, at a higher severity than in the previous report |

### Progress Metrics

- **Issue reduction:** `(fixed / previous_total) * 100`
- **Score change:** `current_score - previous_score`
- **Pages improved:** count of pages with higher scores than previous audit
- **Trend:** improving (score up 5+), stable (within 5), declining (score down 5+)

## Issue Severity Categories

### Critical

- No keyboard access to essential functionality
- Missing form labels on required fields
- Images conveying critical information have no alt text
- Color is the sole means of conveying information
- Keyboard traps with no escape

### Serious

- Missing skip navigation
- Poor heading hierarchy (skipped levels)
- Focus not visible on interactive elements
- Form errors not programmatically associated
- Missing ARIA on custom widgets

### Moderate

- Redundant ARIA on semantic elements
- Suboptimal heading structure (multiple H1s)
- Missing autocomplete on identity fields
- Links to new tabs without warning
- Missing table captions

### Minor

- Redundant title attributes
- Suboptimal button text
- Missing landmark roles where semantic elements exist
- Decorative images with non-empty alt text
