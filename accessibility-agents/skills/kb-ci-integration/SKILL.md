---
name: kb-ci-integration
description: Reference data, not a reviewer. CI/CD accessibility pipeline patterns with axe-core CLI, SARIF output, PR annotations, baseline management, and multi-platform CI templates.
license: MIT
disable-model-invocation: true
user-invocable: false
metadata:
  tier: reference
  domain: cross-cutting
  output: none
  effort: low
  title: Ci Integration
---

## Skill: CI Integration

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

In axe-core 4.14 the only rule tagged `wcag22aa` is `target-size`, and it runs only when that tag is listed. Most WCAG 2.2 criteria (2.4.11, 2.5.7, 3.2.6, 3.3.7, 3.3.8) have no axe rule and need manual testing.

### Output and Exit Flags

Each flag, with its effect. The CLI has no `--reporter json|sarif|html` option; results are always axe JSON.

| Flag | Effect |
|------|--------|
| `--save <file>` (`-s`) | Save JSON results to a file |
| `--dir <path>` (`-d`) | Directory for the saved file |
| `--stdout` (`-j`) | Print JSON results to stdout and silence other output |
| `--exit` (`-q`) | Exit with code 1 when any page has violations |
| `--disable <rules>` (`-l`) | Skip rule IDs; combine with `--tags` |

`--rules` takes rule IDs, not tags, and is ignored when `--tags` is also given. The CLI treats arguments as URLs and prefixes `http://` when no scheme is given, so local files need `file://` URLs.

### Exit Codes

Each code, with its meaning.

| Code | Meaning |
|------|---------|
| 0 | Scan ran. Without `--exit`, this is also returned when violations were found |
| 1 | Violations found (only with `--exit`), or an error during the scan |
| 2 | Setup error: axe-core source not found, invalid options, browser timeout or ChromeDriver version mismatch |

The CLI drives Chrome through ChromeDriver. When the versions do not match, install a synced pair with `npx browser-driver-manager install chrome`.

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
    fail_check("N new accessibility violations introduced")
else:
    succeed_check("No new violations (M existing in baseline)")
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
      - uses: actions/checkout@v7
        with: { fetch-depth: 0 }
      - uses: actions/setup-node@v7
        with: { node-version: 24 }
      - run: npm ci
      - run: npx browser-driver-manager install chrome
      - run: npx axe $(git diff --name-only origin/${{ github.base_ref }}...HEAD --diff-filter=ACMR -- '*.html' | sed "s#^#file://${{ github.workspace }}/#" | tr '\n' ' ') --tags wcag2a,wcag2aa,wcag21a,wcag21aa,wcag22aa --save results.json
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

axe does not write SARIF. Convert its JSON with Microsoft's `axe-sarif-converter`, then upload. The job needs `permissions: security-events: write`.

```yaml
- run: npx axe-sarif-converter --input-files results.json --output-file results.sarif
- uses: github/codeql-action/upload-sarif@v4
  with:
    sarif_file: results.sarif
    category: accessibility
```

### Benefits

- Violations appear as inline annotations on the exact lines in the PR diff
- Results visible in the Security tab, under Code scanning
- Tracks violation trends over time
- Supports dismissal workflow for false positives

---

## Gating Strategies

Each strategy, with blocks on and best for.

| Strategy | Blocks On | Best For |
|----------|-----------|----------|
| **Strict** | Any violation (all severities) | New greenfield projects |
| **Standard** | Critical + Serious only | Active projects with good a11y baseline |
| **Baseline** | New violations only (regression) | Brownfield adoption, legacy codebases |
| **Warning** | Never blocks, comments only | Awareness phase, gradual adoption |

---

## Multi-Platform Templates

Both templates below need Chrome in the build image; the `node` images do not include it.

### Azure DevOps

```yaml
trigger:
  paths:
    include: ['**/*.html', '**/*.jsx', '**/*.tsx']

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs: { versionSpec: '24.x' }
  - script: npm ci && npx axe file://$(Build.SourcesDirectory)/index.html --tags wcag2a,wcag2aa,wcag21a,wcag21aa,wcag22aa --exit
    displayName: 'Accessibility Scan'
```

### GitLab CI

```yaml
accessibility:
  image: node:24
  script:
    - npm ci
    - npx axe file://$CI_PROJECT_DIR/index.html --tags wcag2a,wcag2aa,wcag21a,wcag21aa,wcag22aa --exit
  only:
    changes: ['**/*.html', '**/*.jsx', '**/*.tsx']
```

---

## Severity Mapping

Each axe-core impact, with its CI priority and action.

| axe-core Impact | CI Priority | Action |
|----------------|-------------|--------|
| critical | p1-blocker | Must block merge |
| serious | p2-high | Should block merge |
| moderate | p3-medium | Warn in PR comment |
| minor | p4-low | Info only |
