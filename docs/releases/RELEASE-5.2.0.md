# Accessibility Agents 5.2: Calibrated Scoring, Configurable Gates, Stronger Contracts

## Overview

Accessibility Agents 5.2 focuses on operational quality and reliability: configurable markdown accessibility gates, SARIF output for machine-readable CI, calibrated web severity scoring guidance, and contract validation between orchestrators and specialists.

This release intentionally excludes signing and key-management changes.

---

## Highlights

### Configurable Markdown Accessibility Scanning

`markdown-a11y-lint.mjs` now supports:

- repository config file: `.a11y-markdown-config.json`
- per-rule `enabled` and `severity` overrides
- custom ignored directories
- configurable per-rule output limits
- runtime gate mode controls (`none`, `error`, `warning`)

### SARIF Output for CI Pipelines

Markdown accessibility findings can now be exported as SARIF:

```bash
node .github/scripts/markdown-a11y-lint.mjs . \
  --format both \
  --output artifacts/markdown-a11y.sarif
```

This enables downstream code-scanning and artifact workflows without custom parsers.

### CI Gate Maturity Controls

`a11y-check.yml` now supports dispatch-time and variable-driven gate controls:

- workflow inputs: `enforcement_mode`, `output_format`
- repo variables: `A11Y_MARKDOWN_FAIL_ON`, `A11Y_MARKDOWN_FORMAT`

Teams can adopt advisory mode first and tighten enforcement later without editing workflow logic.

### Orchestrator-Specialist Contract Validation

New validator:

- `scripts/validate-orchestrator-dispatch.js`

New workflow:

- `.github/workflows/validate-orchestrator-contracts.yml`

The validator enforces required dispatch sections, verifies `Read(".claude/specialists/*.md")` references, checks `Task(...)` usage, and confirms referenced specialists exist.

### Web Severity Scoring v2 Guidance

`web-severity-scoring` now documents:

- profile-based scoring (`balanced`, `strict`, `advisory`)
- calibration coefficients by rule family
- confidence drift guardrails
- normalized trend scoring for cross-audit comparability
- recommended output metadata for reproducibility

### New Metadata and Markup Conventions

A new guide standardizes metadata and markdown structure:

- `docs/guides/metadata-markup-conventions.md`

It includes recommended frontmatter metadata patterns for agents and skills and instruction markup conventions for automation-friendly docs.

---

## Additional Docs and Templates

- Added template: `templates/markdown-config-moderate.json`
- Updated: `docs/getting-started.md` with markdown scanner and CI gate usage
- Updated: `AGENTS.md` with metadata conventions
- Updated: `README.md` docs index to include metadata and markup conventions guide

---

## Why This Matters

5.2 improves how teams operate these agents at scale:

- less CI fragility through explicit configuration
- better interop through SARIF
- reduced orchestration drift via contract validation
- more reliable trend analysis through calibrated scoring guidance
- clearer machine-readable metadata standards for future automation

---

## Full Changelog

See `CHANGELOG.md` for complete details.
