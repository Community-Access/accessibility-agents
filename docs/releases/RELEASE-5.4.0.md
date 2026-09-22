# Accessibility Agents 5.4: Playwright Runtime Checks and CI Guard Rails

## Overview

Version 5.4 shifts the reliability model from static analysis toward live runtime verification and tightens the CI safety net across the entire release lifecycle. Three independent guard rails now validate your workflows, config schemas, and documentation version pins on every push, and a new Playwright-powered runner catches high-severity accessibility failures at runtime before they reach users.

## Highlights

### Playwright High-Impact Checks

A new `playwright-high-impact-check.mjs` runner in `mcp-server/scripts/` scans live pages at four viewport widths (320, 768, 1024, and 1440 px), applying full wcag2a/wcag2aa/wcag21aa/wcag22aa rule sets. Beyond axe-core, it adds:

- **Keyboard trap heuristic**: detects interactive elements that receive focus but cannot be exited with the keyboard.
- **Overflow scan**: flags content clipping that hides text or controls at small viewports.
- **Touch target sweep**: identifies tap targets smaller than 44x44 px across mobile viewports.
- **Artifact output**: emits `playwright-a11y-results.json` and `playwright-a11y-report.md` as workflow artifacts per run.

Triggered via `.github/workflows/playwright-high-impact-check.yml` on pushes to `main` and any `feature/` branch, with manual dispatch for on-demand scans.

### CI Integrity Guard Rails

Three validator scripts now run in CI on every push and PR via `.github/workflows/ci-integrity-guards.yml`:

| Script | What it checks |
|--------|----------------|
| `validate-workflow-invariants.mjs` | Job ordering and required step presence in all workflow files |
| `validate-config-integrity.mjs` | Scan config templates validate against their JSON schemas |
| `validate-doc-version-pins.mjs` | Documentation examples reference the current release version, not a stale one |

All three are also bundled into `scripts/release-readiness-check.mjs` for a single-command pre-release sweep.

### Office/PDF/EPUB JSON Schemas

Canonical JSON schemas are now checked into `.github/schemas/` for all three scan config families. VS Code `settings.json` maps each schema to the corresponding config file type, providing red-squiggle validation and autocomplete in-editor without any extension install.

### Branch Hygiene Reporting

`.github/workflows/branch-hygiene-report.yml` runs weekly and on manual dispatch to surface stale long-lived release branches, giving maintainers an at-a-glance view of what can be pruned.

### New Documentation

- `docs/guides/playwright-high-impact-checks.md` - setup, configuration, and interpreting results.
- `docs/guides/ci-integrity-guards.md` - guard rail architecture, local commands, and failure remediation.
- `docs/guides/release-communications-checklist.md` - updated with CI integrity and branch hygiene verification steps.
- `docs/tools/playwright-integration.md` - full Playwright + axe-core integration reference.

## Full Changelog

- CI integrity guard workflow (`ci-integrity-guards.yml`) with three independent validators.
- `scripts/validate-workflow-invariants.mjs` asserts CI job ordering and required steps.
- `scripts/validate-config-integrity.mjs` validates templates against local JSON schemas.
- `scripts/validate-doc-version-pins.mjs` detects stale version pins in documentation.
- `scripts/release-readiness-check.mjs` aggregates all three for pre-release checks.
- `mcp-server/scripts/playwright-high-impact-check.mjs` with multi-viewport, keyboard trap, overflow, and touch target scanning.
- `.github/workflows/playwright-high-impact-check.yml` CI trigger for Playwright checks.
- `.github/workflows/branch-hygiene-report.yml` weekly stale-branch reporting.
- `.github/schemas/office-config.schema.json`, `pdf-config.schema.json`, `epub-config.schema.json`.
- Office/PDF/EPUB template profiles updated with `$schema` references.
- `.vscode/settings.json` schema mappings for all three config file families.
- PR template release checklist expanded with version alignment and action tag freshness checks.
- `docs/guides/playwright-high-impact-checks.md`, `ci-integrity-guards.md`, `release-communications-checklist.md`.
- `docs/tools/playwright-integration.md`.
- Documentation refresh: `README.md`, `docs/getting-started.md`, `docs/USER_GUIDE.md`, `prd.md`.
