# cross-page-analyzer

> **Internal sub-agent.** This agent is not user-invokable. It is orchestrated automatically by [web-accessibility-wizard](./web-accessibility-wizard.md) (and the accessibility-lead team) when auditing multiple web pages. You do not need to invoke it directly.

## What It Does

`cross-page-analyzer` receives aggregated scan findings from multiple web page audits and:

1. **Classifies issues** - determines whether each finding is systemic (affects all pages), template-level (affects pages sharing a component), or page-specific (isolated to one page)
2. **Scores each page** - computes a weighted 0-100 accessibility risk score with an A-F grade
3. **Generates a cross-page comparison scorecard** - a table showing all pages side-by-side with scores and issue counts
4. **Tracks remediation progress** - when a baseline is provided, classifies each finding as Fixed, New, Persistent, or Regressed

## When It Runs

The `web-accessibility-wizard` calls this agent during multi-page audits:

- `audit-web-multi-page` prompt - after scanning 2+ pages
- `compare-web-audits` prompt - when comparing two audit reports across time
- Full site audits triggered by the accessibility-lead in a comprehensive review

## Scoring Formula

Scores and grades come from `skills/a11y-core/scripts/merge-findings.mjs`,
which `render-report.mjs` runs for every report; the analyzer does not compute
them by hand.

```text
penalty = sum over findings of severity_weight x confidence_factor
          (weights: critical 10, serious 5, moderate 2, minor 1;
           confidence: high 1.0, medium 0.7, low 0.4)
checks  = max(number of findings + number of passed checks, 10)
score   = max(0, round(100 - (penalty / checks) x 20))
```

A finding found by two sources (for example axe-core and code review) is `high` confidence; there is no higher level or multiplier.

### Grade Table

Each score band, with its grade.

| Score | Grade |
|-------|-------|
| 90-100 | A |
| 80-89 | B |
| 70-79 | C |
| 60-69 | D |
| 0-59 | F |

## Issue Classification

The agent examines which issues appear across multiple pages and assigns each a type:

| Type | Definition | Fix Strategy |
|------|-----------|-------------|
| Systemic | The same issue appears on every audited page | Fix the shared layout template, navigation component, or global CSS - highest ROI |
| Template-level | The issue appears on pages that share a specific component | Fix that shared component |
| Page-specific | The issue is unique to one page | Fix individually |

**Why this matters:** A systemic issue fixed in `<Header />` or `<Footer />` disappears from every page at once. Fixing the highest-impact systemic issues first produces the greatest accessibility improvement per hour of engineering work.

## Comparison Scorecard

For a 5-page audit, the agent produces a scorecard table like:

| Page | Score | Grade | Critical | Serious | Moderate | Minor |
|------|-------|-------|---------|---------|---------|-------|
| Home | 72 | C | 2 | 3 | 1 | 4 |
| Product detail | 88 | B | 0 | 2 | 1 | 2 |
| Checkout step 1 | 61 | C | 3 | 2 | 0 | 3 |
| Checkout step 2 | 58 | C | 3 | 3 | 1 | 2 |
| Account settings | 91 | A | 0 | 1 | 0 | 1 |

This scorecard appears in the audit report and in commit comments when the wizard posts results to a pull request.

## Remediation Tracking

When baseline report data is provided, every finding is classified:

| Classification | Meaning |
|---------------|---------|
| Fixed | Present in baseline, absent in current scan |
| New | Absent in baseline, present in current scan |
| Persistent | Present in both scans |
| Regressed | A previously Fixed issue has returned |

The `compare-web-audits` prompt surfaces this classification to users as a progress overview: "12 Fixed, 3 New, 8 Persistent, 1 Regressed."

## Playwright-Enhanced Analysis

When Playwright behavioral testing data is available from `playwright-scanner`, the cross-page analyzer gains two additional capabilities:

### Accessibility Tree Diffing

Compares browser accessibility tree snapshots across pages to detect:

- **Landmark consistency** - Same landmarks present on every page (banner, navigation, main, contentinfo)
- **Heading level consistency** - Same content types use consistent heading levels across pages
- **ARIA label consistency** - Same landmarks labeled consistently (not "Main navigation" on one page, "Nav" on another)
- **Role drift** - Same components maintaining consistent roles across pages

Produces a **structural consistency score** (0-100) where 100 means all pages share identical structure.

### Keyboard Flow Comparison

Compares tab-order sequences across pages to detect:

- **Navigation order consistency** - Shared nav elements in same relative tab order
- **Trap aggregation** - Keyboard traps classified as systemic vs page-specific
- **Tab count variance** - Pages with dramatically different tab stop counts flagged
- **Focus management patterns** - How focus handles route changes across pages

## Connections

Each component, with its role.

| Component | Role |
|-----------|------|
| [web-accessibility-wizard](./web-accessibility-wizard.md) | Orchestrating wizard; calls this agent after page scans and incorporates output into the audit report |
| [audit-web-multi-page prompt](../../history/prompts/web/audit-web-multi-page.md) | User-facing prompt that triggers this agent for multi-page comparison |
| [compare-web-audits prompt](../../history/prompts/web/compare-web-audits.md) | User-facing prompt that triggers remediation tracking analysis |
| [web-severity-scoring skill](../../../skills/kb-web-severity-scoring/SKILL.md) | Scoring formulas and grade table this agent implements |
