---
name: CI Integration
description: CI/CD accessibility pipeline patterns, axe-core CLI configuration, SARIF output, PR annotations, baseline management, and multi-platform CI templates. Reference data for CI accessibility setup.
---

# Skill: CI Integration

Patterns, templates, and reference data for integrating automated accessibility scanning into CI/CD pipelines.

## axe-core CLI Reference

```bash
npm install --save-dev @axe-core/cli
npx axe <url> --tags wcag2a,wcag2aa,wcag21a,wcag21aa,wcag22aa
```

### Output Formats
- `--reporter json` — JSON to stdout
- `--reporter sarif` — SARIF for code scanning
- `--reporter html` — Human-readable HTML
- `--save <file>` — Save to file

### Exit Codes
- 0: No violations
- 1: Violations found
- 2: Error

## Baseline Pattern

`axe-baseline.json` tracks known violations so CI only fails on regressions:

```
current = scan()
baseline = load("axe-baseline.json")
new = current - baseline
if new.count > 0: FAIL
else: PASS
```

## Gating Strategies

| Strategy | Rule | Best For |
|----------|------|----------|
| Strict | Fail on any violation | Greenfield |
| Standard | Fail on critical/serious | Most projects |
| Baseline | Fail on regression only | Brownfield |
| Advisory | Warn only, never fail | Education phase |

## Severity Mapping

| axe-core Impact | CI Gate Level |
|----------------|---------------|
| critical | Always blocks |
| serious | Blocks in standard/strict |
| moderate | Blocks in strict only |
| minor | Never blocks (warn) |
