# Accessibility Agents 5.3: CI Reliability and Release Safety

## Overview

Accessibility Agents 5.3 focuses on reliability hardening in CI and release operations for markdown accessibility workflows.

This release improves regression gating, schema validation visibility, release consistency enforcement, and documentation coverage for the new controls.

---

## Highlights

### Regression-Only Markdown Gating

`markdown-a11y-lint.mjs` now supports regression mode in CI and CLI:

- `--regression`
- `--baseline-ref <git-ref>`

When enabled, only markdown files changed since the baseline ref are scanned for gate decisions. If git diff is unavailable, the scanner safely falls back to full scan behavior.

### Markdown Config Schema Validation

`.a11y-markdown-config.json` is now validated at load time.

Validation warnings are emitted for unknown keys and invalid field types, while keeping scans non-blocking.

### Published Markdown Config JSON Schema

A dedicated schema is now included:

- `.github/schemas/markdown-config.schema.json`

This documents valid config structure and supports editor validation/intellisense.

### CI and Code Scanning Improvements

`a11y-check.yml` now includes markdown SARIF upload to GitHub Code Scanning and supports reliable execution for clean/no-output scenarios.

The markdown lint job also supports:

- dispatch-time mode controls
- repository variable controls
- regression mode controls

### Release Consistency Guard

New workflow:

- `.github/workflows/release-consistency-guard.yml`

It enforces:

- version alignment across release manifests
- required `CHANGELOG.md` entry for the current version

Missing CHANGELOG coverage now fails the workflow.

### Test Coverage Expansion

Added and integrated:

- `scripts/test-markdown-scanner.mjs` (expanded coverage)
- `scripts/test-orchestrator-validator.mjs`

CI now runs these suites in `validate-orchestrator-contracts.yml` to catch regressions earlier.

### Documentation and Editor Experience

Updated docs for 5.3 controls and behavior:

- `docs/USER_GUIDE.md`
- `docs/getting-started.md`
- `prd.md`
- `ENHANCEMENTS.md`

VS Code config now includes JSON schema mappings for markdown, office, and PDF scan config files.

---

## Upgrade Notes

No migration is required for existing users.

Recommended follow-up:

1. Set repository variables for markdown gating defaults:
   - `A11Y_MARKDOWN_FAIL_ON`
   - `A11Y_MARKDOWN_FORMAT`
   - `A11Y_REGRESSION_MODE`
2. Add or refresh `.a11y-markdown-config.json` from `templates/markdown-config-moderate.json`
3. Verify `release-consistency-guard.yml` passes before tagging releases

---

## Full Changelog

See `CHANGELOG.md` for full details of 5.3.0 changes.
