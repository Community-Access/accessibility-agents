# web-severity-scoring Skill

> Severity scoring, scorecard computation, confidence levels, and remediation tracking for web accessibility audits. Covers the page scoring formula (0-100 with A-F grades), confidence-weighted penalty calculations, source correlation rules, scorecard formats (single-page and multi-page), cross-page pattern classification, and change tracking (Fixed / New / Persistent / Regressed).

## Agents That Use This Skill

Each agent, with its why.

| Agent | Why |
|-------|-----|
| [web-accessibility-wizard](../skills/web-accessibility-wizard.md) | Page scoring and audit report output |
| [cross-page-analyzer](../skills/cross-page-analyzer.md) | Cross-page scorecard and pattern scoring |
| [accessibility-lead](../skills/accessibility-lead.md) | Final score in orchestrated audits |

## Severity Scoring Formula

The score in every rendered report is computed by
`skills/a11y-core/scripts/merge-findings.mjs`; where this page and the script
differ, the script decides. A score is not a conformance claim.

```text
penalty = sum over findings of severity_weight x confidence_factor
checks  = max(number of findings + number of passed checks, 10)
score   = max(0, round(100 - (penalty / checks) x 20))
```

Each severity, with its weight.

| Severity | Weight |
|----------|--------|
| critical | 10 |
| serious | 5 |
| moderate | 2 |
| minor | 1 |

Example: one critical finding at high confidence and 9 passed checks gives
penalty 10, checks 10, score 100 - (10 / 10) x 20 = 80, grade B.

## Score Grades

Each score band, with its grade.

| Score | Grade |
|-------|-------|
| 90-100 | A |
| 80-89 | B |
| 70-79 | C |
| 60-69 | D |
| 0-59 | F |

## Confidence Levels

Each level, with its factor and when to use it.

| Level | Factor | When to Use |
|-------|--------|-------------|
| **high** | 1.0 | Structural and certain (missing alt, no label, no `lang`), or found by two sources (for example axe-core and code review) |
| **medium** | 0.7 | One source, likely an issue (heading edge cases, questionable ARIA, possible keyboard trap) |
| **low** | 0.4 | Needs human review (alt quality, reading order, context-dependent link text) |

A finding confirmed by a third source, such as a Playwright run, stays
`high`; the findings schema has no higher level. Merging keeps the highest
confidence any source reported for the same rule at the same location.

## Scorecard Formats

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

## Issue Severity Categories

### Critical

- No keyboard access to essential functionality
- Missing form labels on required fields
- Images conveying critical information without alt text
- Color as the sole means of conveying information
- Keyboard traps with no escape

### Serious

- Missing skip navigation
- Poor heading hierarchy (skipped levels)
- Focus not visible on interactive elements
- Form errors not programmatically associated
- Missing ARIA on custom widgets

### Moderate

- Redundant ARIA on semantic elements
- Multiple H1s on one page
- Missing `autocomplete` on identity fields
- Links to new tabs without warning
- Missing table captions

### Minor

- Redundant `title` attributes
- Suboptimal button text
- Missing landmark roles where semantic elements exist
- Decorative images with non-empty `alt`

## Cross-Page Pattern Classification

Each pattern, with its definition and remediation ROI.

| Pattern | Definition | Remediation ROI |
|---------|-----------|-----------------|
| **Systemic** | Same issue on every audited page | Highest - fix nav/layout once |
| **Template** | Same issue on pages sharing a component | High - fix the shared component |
| **Page-specific** | Unique to one page | Normal - fix individually |

## Remediation Tracking

Each status, with its definition.

| Status | Definition |
|--------|-----------|
| Fixed | In previous report, no longer present |
| New | Not in previous report, appears now |
| Persistent | Remains from previous report |
| Regressed | Remains, at a higher severity than in the previous report |

### Progress Metrics

- **Issue reduction:** `(fixed / previous_total) x 100`
- **Score change:** `current_score - previous_score`
- **Pages improved:** count of pages with higher scores than previous audit
- **Trend:** Improving (+5), Stable (within 5), Declining (-5)

## Skill Location

`skills/kb-web-severity-scoring/SKILL.md`
