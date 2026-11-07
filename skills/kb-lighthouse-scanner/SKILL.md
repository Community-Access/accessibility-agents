---
name: kb-lighthouse-scanner
description: Reference data, not a reviewer. Integrate Lighthouse CI accessibility audits. Detects configuration, parses results, maps findings to severity model, and tracks score regressions.
license: MIT
disable-model-invocation: true
user-invocable: false
metadata:
  tier: reference
  domain: cross-cutting
  output: none
  effort: low
  title: Lighthouse Scanner
---

## Lighthouse CI Accessibility Integration

## What Is Lighthouse CI?

[Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) is a suite of tools for running Google Lighthouse audits in CI pipelines. The most common GitHub Actions integration uses [`treosh/lighthouse-ci-action`](https://github.com/treosh/lighthouse-ci-action).

Lighthouse provides:

- Performance, accessibility, best practices, and SEO scoring (0-100)
- Individual audit results with pass/fail status and detailed findings
- Score budgets and assertions to fail builds on regressions
- HTML and JSON report artifacts
- Score comparison across runs for trend tracking

**Accessibility focus:** The Lighthouse accessibility category runs a subset of axe-core rules and reports a weighted score from 0-100 along with individual audit violations.

## Detecting Lighthouse CI Presence

### Workflow File Detection

Search for workflow files referencing Lighthouse CI:

```bash
# Search for the treosh Lighthouse CI action
grep -rl "treosh/lighthouse-ci-action" .github/workflows/

# Search for official Lighthouse CI CLI usage
grep -rl "lhci autorun\|lighthouse-ci" .github/workflows/
```

**Patterns to match in YAML:**

```yaml
- uses: treosh/lighthouse-ci-action@v12
```

### Configuration File Detection

Lighthouse CI uses configuration files in the repository root:

```bash
# Check for Lighthouse CI config files
ls lighthouserc.js lighthouserc.json .lighthouserc.js .lighthouserc.json .lighthouserc.yml 2>/dev/null
```

| Config File | Format |
|------------|--------|
| `lighthouserc.js` | JavaScript module |
| `lighthouserc.json` | JSON |
| `.lighthouserc.js` | JavaScript module (dotfile) |
| `.lighthouserc.json` | JSON (dotfile) |
| `.lighthouserc.yml` | YAML (dotfile) |

### Configuration Structure

Key fields in Lighthouse CI config:

```json
{
  "ci": {
    "collect": {
      "url": ["https://example.com", "https://example.com/about"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:accessibility": ["error", {"minScore": 0.9}]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

| Section | Purpose | Agent Use |
|---------|---------|-----------|
| `ci.collect.url` | URLs to audit | Scope of CI scanning |
| `ci.collect.numberOfRuns` | How many times to run each URL | Reliability indicator |
| `ci.assert.assertions` | Score budgets and thresholds | Regression detection |
| `ci.upload.target` | Where to store reports | Report retrieval |

## Parsing Lighthouse Accessibility Results

### Accessibility Score

Lighthouse computes a weighted accessibility score from 0-100 based on individual audit results. Its report rates scores in three bands. These are not this package's report grade; that comes from `skills/a11y-core/scripts/merge-findings.mjs` (A 90, B 80, C 70, D 60).

| Score Range | Lighthouse rating | Interpretation |
|-------------|-------|---------------|
| 90-100 | pass | Good accessibility |
| 50-89 | average | Issues to address |
| 0-49 | fail | Significant accessibility failures |

### Individual Audit Results

Each Lighthouse accessibility audit corresponds to an axe-core rule. Weights are from the Lighthouse 13 default config (derived from axe impact: critical 10, serious 7, moderate 3, minor 1); WCAG mappings are the axe-core 4.14 tags. Selected audits:

| Audit ID | axe-core Rule | WCAG Criterion | Weight |
|----------|--------------|----------------|--------|
| `image-alt` | `image-alt` | 1.1.1 | 10 |
| `color-contrast` | `color-contrast` | 1.4.3 | 7 |
| `label` | `label` | 4.1.2 | 10 |
| `button-name` | `button-name` | 4.1.2 | 10 |
| `link-name` | `link-name` | 2.4.4 | 7 |
| `html-has-lang` | `html-has-lang` | 3.1.1 | 7 |
| `document-title` | `document-title` | 2.4.2 | 7 |
| `heading-order` | `heading-order` | none (best-practice) | 3 |
| `meta-viewport` | `meta-viewport` | 1.4.4 | 10 |
| `bypass` | `bypass` | 2.4.1 | 7 |
| `tabindex` | `tabindex` | none (best-practice) | 7 |
| `aria-allowed-attr` | `aria-allowed-attr` | 4.1.2 | 10 |
| `aria-hidden-body` | `aria-hidden-body` | 4.1.2 | 10 |
| `aria-required-attr` | `aria-required-attr` | 4.1.2 | 10 |
| `aria-roles` | `aria-roles` | 4.1.2 | 10 |
| `aria-valid-attr-value` | `aria-valid-attr-value` | 4.1.2 | 10 |
| `aria-valid-attr` | `aria-valid-attr` | 4.1.2 | 10 |
| `target-size` | `target-size` | 2.5.8 | 7 |

### Severity Mapping

Lighthouse uses weights rather than impact levels. Map to the agent severity model based on weight and audit pass/fail:

| Lighthouse Weight | Audit Status | Agent Severity |
|------------------|-------------|---------------|
| 10 | Fail | critical |
| 7 | Fail | serious |
| 3 | Fail | moderate |
| 1 | Fail | minor |
| 0 | n/a | Manual-check audits; not scored, not reported as findings |
| Any | Pass | N/A (not reported) |

## Correlation with Local Scans

### Lighthouse-to-axe-core Mapping

Since Lighthouse uses axe-core under the hood, correlation is straightforward:

1. **Match by audit/rule ID:** Lighthouse audit IDs correspond directly to axe-core rule IDs
2. **Match by URL:** Compare scanned URLs from Lighthouse config with local scan targets
3. **Boost confidence:** Findings confirmed by both Lighthouse CI and local axe-core scan receive `high` confidence

### Source Comparison

Each scenario, with its interpretation and action.

| Scenario | Interpretation | Action |
|----------|---------------|--------|
| Found by Lighthouse AND local scan | High confidence | Report as high confidence, full severity weight |
| Found by Lighthouse only | Environment-specific | Report as medium confidence, note "CI-only finding" |
| Found by local scan only | Not covered by Lighthouse subset | Report as medium confidence, note "local-only finding" |
| Lighthouse score regressed | New accessibility issues introduced | Flag as regression, prioritize in report |

## Score Regression Detection

Track Lighthouse accessibility scores across runs to detect regressions:

### Comparing Scores

```json
{
  "url": "https://example.com",
  "previousScore": 95,
  "currentScore": 87,
  "delta": -8,
  "status": "regressed",
  "newFailures": ["color-contrast", "image-alt"],
  "newPasses": []
}
```

### Regression Thresholds

Each delta, with its severity and action.

| Delta | Severity | Action |
|-------|----------|--------|
| Score drops 10+ points | Critical | Immediate attention, likely multiple new violations |
| Score drops 5-9 points | Serious | New violations introduced, review before merge |
| Score drops 1-4 points | Moderate | Minor regression, track for follow-up |
| Score unchanged or improved | N/A | No regression detected |

## Structured Output Format

When `lighthouse-bridge` normalizes Lighthouse data, each finding follows `skills/a11y-core/schemas/findings.schema.json`. The Lighthouse weight and score delta go in `evidence`; run-level score deltas go in `notes`:

```json
{
  "rule": "color-contrast",
  "wcag": "1.4.3 AA",
  "severity": "serious",
  "confidence": "high",
  "location": "https://example.com/login button.submit-btn",
  "summary": "Element has insufficient color contrast ratio",
  "fix": "Change the text color or background to reach at least 4.5:1",
  "evidence": "lighthouse-ci audit color-contrast (weight 7); accessibility score 87, previously 95"
}
```

## GitHub Actions Integration

### treosh/lighthouse-ci-action

The most common Lighthouse CI GitHub Action:

```yaml
- name: Run Lighthouse CI
  uses: treosh/lighthouse-ci-action@v12
  with:
    urls: |
      https://example.com
      https://example.com/about
    uploadArtifacts: true
    configPath: ./lighthouserc.json
```

### Action Inputs

Each input, with its required and description.

| Input | Required | Description |
|-------|----------|-------------|
| `urls` | Yes (or in config) | Newline-separated URLs to audit |
| `configPath` | No | Path to Lighthouse CI config file |
| `uploadArtifacts` | No | Upload HTML reports as workflow artifacts |
| `temporaryPublicStorage` | No | Upload to temporary public storage for sharing |
| `runs` | No | Number of runs per URL (default: 1) |
| `budgetPath` | No | Path to a Lighthouse budget JSON file |

### Extracting Results from Artifacts

Lighthouse CI uploads results as workflow artifacts. To retrieve scores:

1. Download the artifact from the workflow run
2. Parse the JSON report files
3. Extract `categories.accessibility.score` for the overall score
4. Extract individual `audits.{audit-id}` results for violations
