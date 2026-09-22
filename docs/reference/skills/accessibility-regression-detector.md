# accessibility-regression-detector — Accessibility Regression Detector

> Detects accessibility regressions by comparing audit results across commits, branches, or time periods. Tracks score trends, classifies issues as new/fixed/persistent/regressed, and integrates with CI pipelines for automated regression detection.

## Features

- Compares two audit reports and classifies every issue as New, Fixed, Persistent, or Regressed
- Calculates score delta and trend direction between audits
- Analyzes git history to identify which commits introduced regressions
- Manages baselines for CI pipeline integration
- Tracks remediation progress across multiple audit cycles
- Supports web, document, and markdown audit report formats

## When to Use It

- After a code change to check whether accessibility scores dropped
- Comparing a feature branch against main before merging
- Tracking remediation progress after a previous audit identified issues
- Setting up CI-based regression detection with baseline management
- Reviewing long-term accessibility score trends across releases

## How It Works

1. **Report comparison** - Compares two audit reports (baseline vs current) side by side
2. **Issue classification** - Every finding is categorized:
   - **New** - Issue exists in current but not in baseline
   - **Fixed** - Issue existed in baseline but is resolved in current
   - **Persistent** - Issue exists in both baseline and current
   - **Regressed** - Issue was fixed in a previous cycle but has returned
3. **Score delta** - Calculates overall score change and per-category deltas
4. **Git analysis** - Optionally traces regressions to specific commits using changed file analysis
5. **Trend report** - Generates a trend summary with score history and regression count

## Handoffs

Each direction, with its agent and when.

| Direction | Agent | When |
|-----------|-------|------|
| Receives from | accessibility-lead | When audit results need comparison against a previous baseline |
| Receives from | ci-accessibility | When CI pipeline detects a score drop |
| Hands off to | web-accessibility-wizard | When a fresh audit is needed to establish a new baseline |
| Hands off to | ci-accessibility | When automated regression detection needs CI pipeline setup |

## Sample Usage

```text
@accessibility-regression-detector Compare the current audit against last month's baseline

@accessibility-regression-detector Check for accessibility regressions in the feature/checkout branch

@accessibility-regression-detector Track our remediation progress since the Q1 audit
```

## Related

- [web-accessibility-wizard](./web-accessibility-wizard.md) - Runs full web audits that produce the reports this agent compares
- [ci-accessibility](./ci-accessibility.md) - Sets up CI pipelines for automated regression detection
- [accessibility-lead](./accessibility-lead.md) - Coordinates full accessibility audits and triages regression findings
