---
name: ci-integration
description: CI/CD accessibility pipeline patterns with axe-core CLI, SARIF output, PR annotations, baseline management, and multi-platform CI templates.
---

# Skill: CI Integration

**Domain:** CI/CD accessibility pipeline configuration  
**Agents that use this skill:** `ci-accessibility`, `web-accessibility-wizard`, `accessibility-lead`

---

## Purpose

Patterns, templates, and reference data for integrating automated accessibility scanning into CI/CD pipelines. Covers axe-core CLI, Lighthouse CI, SARIF output, baseline management, and multi-platform configuration.

---

## axe-core CLI Reference

### Installation

```bash
npm install --save-dev @axe-core/cli
```

### WCAG 2.2 AA Tag Set

```bash
npx axe <url> --tags wcag2a,wcag2aa,wcag21a,wcag21aa,wcag22aa
```

### Output Formats

| Flag | Output |
|------|--------|
| `--reporter json` | JSON results to stdout |
| `--reporter sarif` | SARIF format for code scanning |
| `--reporter html` | Human-readable HTML report |
| `--save <file>` | Save results to file |

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | No violations found |
| 1 | Violations found |
| 2 | Error running scan |

---

## Baseline Pattern

### Purpose

Without a baseline, every legacy violation fails CI, making adoption impossible on brownfield apps. With a baseline, CI gates only prevent regressions.

### Baseline File Schema (`axe-baseline.json`)

```json
{
  "version": "1.0",
  "timestamp": "2026-03-22T00:00:00Z",
  "tool": "@axe-core/cli",
  "tags": "wcag2a,wcag2aa,wcag21a,wcag21aa,wcag22aa",
  "violations": {
    "color-contrast": { "count": 12, "pages": ["index.html", "about.html"] },
    "image-alt": { "count": 3, "pages": ["gallery.html"] },
    "label": { "count": 5, "pages": ["contact.html", "signup.html"] }
  },
  "total": 20
}
```

### Comparison Logic

```text
current_violations = run_axe_scan()
baseline = load("axe-baseline.json")

new_violations = current_violations - baseline
if new_violations.count > 0:
    FAIL PR — "N new accessibility violations introduced"
else:
    PASS — "No new violations (M existing in baseline)"
```

---

## GitHub Actions Template

```yaml
name: Accessibility Check
on:
  pull_request:
    paths: ['**/*.html', '**/*.jsx', '**/*.tsx', '**/*.vue', '**/*.svelte']

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npx axe $(git diff --name-only HEAD~1 --diff-filter=ACMR -- '*.html' | tr '\n' ' ') --tags wcag2a,wcag2aa,wcag21a,wcag21aa,wcag22aa --reporter json --save results.json
      - name: Check results
        run: |
          violations=$(jq '[.[].violations[]] | length' results.json)
          echo "Found $violations violations"
          if [ "$violations" -gt 0 ]; then exit 1; fi
```

---

## SARIF Integration

SARIF (Static Analysis Results Interchange Format) enables inline annotations in GitHub PR diffs.

### Upload Step

```yaml
- uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: results.sarif
    category: accessibility
```

### Benefits

- Violations appear as inline annotations on the exact lines in the PR diff
- Results visible in the Security → Code Scanning tab
- Tracks violation trends over time
- Supports dismissal workflow for false positives

---

## Gating Strategies

| Strategy | Blocks On | Best For |
|----------|-----------|----------|
| **Strict** | Any violation (all severities) | New greenfield projects |
| **Standard** | Critical + Serious only | Active projects with good a11y baseline |
| **Baseline** | New violations only (regression) | Brownfield adoption, legacy codebases |
| **Warning** | Never blocks, comments only | Awareness phase, gradual adoption |

---

## Multi-Platform Templates

### Azure DevOps

```yaml
trigger:
  paths:
    include: ['**/*.html', '**/*.jsx', '**/*.tsx']

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs: { versionSpec: '22.x' }
  - script: npm ci && npx axe $(Build.SourcesDirectory)/index.html --tags wcag2a,wcag2aa
    displayName: 'Accessibility Scan'
```

### GitLab CI

```yaml
accessibility:
  image: node:22
  script:
    - npm ci
    - npx axe $CI_PROJECT_DIR/index.html --tags wcag2a,wcag2aa
  only:
    changes: ['**/*.html', '**/*.jsx', '**/*.tsx']
```

---

## Severity Mapping

| axe-core Impact | CI Priority | Action |
|----------------|-------------|--------|
| critical | p1-blocker | Must block merge |
| serious | p2-high | Should block merge |
| moderate | p3-medium | Warn in PR comment |
| minor | p4-low | Info only |
