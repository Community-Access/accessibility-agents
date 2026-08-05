---
name: web-severity-scoring
description: Compute web accessibility scores (0-100, A-F grades) with severity scoring, confidence levels, and remediation tracking across audits.
---

# Web Severity Scoring

## Severity Scoring Formula

```text
Page Score = 100 - (sum of weighted findings)

Weights:
  Critical (confirmed, all three sources):   -18 points
  Critical (high confidence, both sources):  -15 points
  Critical (high confidence, single source): -10 points
  Critical (medium confidence):               -7 points
  Critical (low confidence):                  -3 points
  Serious (high confidence):                  -7 points
  Serious (medium confidence):                -5 points
  Serious (low confidence):                   -2 points
  Moderate (high confidence):                 -3 points
  Moderate (medium confidence):               -2 points
  Moderate (low confidence):                  -1 point
  Minor:                                      -1 point

Floor: 0 (minimum score)
```

### Scoring Profiles

Use a profile to tune strictness by context while keeping comparable grade bands:

| Profile | Intended Use | Multiplier |
|---------|--------------|------------|
| balanced (default) | Standard product delivery | 1.0 |
| strict | Regulated/public-sector releases | 1.15 |
| advisory | Early design and prototyping | 0.8 |

Apply the profile multiplier to each final deduction after confidence handling.

### Formula

```pseudocode
page_score = 100
for each finding:
    base = lookup(severity, confidence_level, source_count)  // from table above
    multiplier = 1.2 if confidence_level == "confirmed" else 1.0
    deduction = base × multiplier
    page_score = max(0, page_score - deduction)
```

The values in the lookup table above are **base deductions** (pre-multiplier).
"Confirmed" findings (validated by all three sources: axe-core + agent review + Playwright) apply an additional 1.2× multiplier.

**Example:** One Critical finding at confirmed confidence = 18 (base) × 1.2 = **21.6 points** deducted → page score 78.

### Calibration Layer (v2)

To reduce false-positive inflation and stabilize trends, apply a calibration coefficient by rule family:

```text
calibrated_deduction = deduction × calibration_coefficient(rule_family)
```

Recommended initial coefficients:

| Rule Family | Coefficient | Rationale |
|-------------|-------------|-----------|
| Keyboard/focus | 1.1 | High functional impact at runtime |
| Forms/labels/errors | 1.05 | High completion risk for core tasks |
| Semantics/structure | 1.0 | Baseline scoring |
| Link text/context | 0.9 | Higher context variance |
| Content quality (alt/link clarity) | 0.85 | Needs human review more often |

Update coefficients quarterly from confirmed outcomes. Avoid changing coefficients more than +/-0.1 per cycle.

## Score Grades

| Score | Grade | Meaning |
|-------|-------|---------|
| 90-100 | A | Excellent - minor or no issues, meets WCAG AA |
| 75-89 | B | Good - some issues, mostly meets WCAG AA |
| 50-74 | C | Needs Work - multiple issues, partial WCAG AA compliance |
| 25-49 | D | Poor - significant accessibility barriers |
| 0-24 | F | Failing - critical barriers, likely unusable with AT |

## Confidence Levels

| Level | Weight | When to Use |
|-------|--------|-------------|
| Confirmed | 120% | Validated by all three sources: axe-core + agent review + Playwright behavioral testing |
| High | 100% | Confirmed by axe-core + agent, or definitively structural (missing alt, no labels, no lang) |
| Medium | 70% | Found by one source, likely issue (heading edge cases, questionable ARIA, possible keyboard traps) |
| Low | 30% | Possible issue, needs human review (alt text quality, reading order, context-dependent link text) |

### Source Correlation

Issues found by both axe-core AND agent review are automatically upgraded to **high confidence** regardless of individual confidence ratings.

Issues found by all three sources (axe-core + agent review + Playwright behavioral testing) are upgraded to **confirmed confidence** with a 1.2x weight multiplier. This applies when:

- axe-core reports a violation
- Agent code review identifies the same issue
- Playwright behavioral scan confirms the issue at runtime (e.g., keyboard trap confirmed by actual Tab traversal, contrast failure confirmed by rendered CSS computation)

When Playwright is not available, the maximum achievable confidence remains **High (100%)**. The confirmed tier is additive — it never downgrades findings.

### Confidence Drift Guard

Track predicted confidence versus post-triage outcome and compute drift:

```text
drift = abs(predicted_confidence_score - observed_confirmation_rate)
```

Operational guideline:

- drift <= 0.10: stable
- drift 0.11-0.20: tune coefficients and source mapping
- drift > 0.20: freeze profile changes and run rule-level review

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
| /dashboard | 45 | D | 2 | 4 | 3 | 2 |
| **Average** | **72.7** | **C** | **2** | **6** | **8** | **4** |
```

## Cross-Page Pattern Classification

| Pattern Type | Definition | Remediation ROI |
|-------------|-----------|-----------------|
| Systemic | Same issue on every audited page | Highest - usually layout/nav, fix once |
| Template | Same issue on pages sharing a component | High - fix the shared component |
| Page-specific | Unique to one page | Normal - fix individually |

## Remediation Tracking

### Change Classification

| Status | Definition |
|--------|-----------|
| Fixed | Issue was in previous report but no longer present |
| New | Issue not in previous report, appears now |
| Persistent | Issue remains from previous report |
| Regressed | Issue was previously fixed but has returned |

### Progress Metrics

- **Issue reduction:** `(fixed / previous_total) * 100`
- **Score change:** `current_score - previous_score`
- **Pages improved:** count of pages with higher scores than previous audit
- **Trend:** improving (score up 5+), stable (within 5), declining (score down 5+)

### Normalized Trend Metric (Cross-Audit)

When audit scope changes between runs, use normalized change:

```text
normalized_score = raw_score - (scope_variance_penalty)
scope_variance_penalty = min(10, abs(previous_pages - current_pages) * 0.8)
```

Use normalized score for trend charts and use raw score for release gates.

## Output Metadata (Recommended)

Include these fields in generated score artifacts for reproducibility:

```yaml
scoring:
  model: web-severity-scoring-v2
  profile: balanced
  calibrationVersion: 2026-q2
  confidenceSources:
    - axe-core
    - agent-review
    - playwright
  failThresholds:
    critical: 1
    score: 75
```

This metadata allows deterministic re-runs and audit-to-audit comparisons.

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
