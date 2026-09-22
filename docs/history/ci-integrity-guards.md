# CI Integrity Guards

> **Historical.** This document describes the repository as it was before
> version 7.0, when agents lived in six per-client directories. It is kept
> for the record and is not maintained. The current layout is one `skills/`
> directory; start at [the documentation index](../README.md).
> Original path: `docs/guides/ci-integrity-guards.md`.

This guide explains the CI guard rails that protect release quality and prevent silent drift in workflows, schemas, and documentation examples.

## Workflow

- `.github/workflows/ci-integrity-guards.yml`

## What It Validates

### 1. Workflow Invariants

Script: `scripts/validate-workflow-invariants.mjs`

Checks that critical workflows still include required controls, including:

- markdown SARIF upload behavior in `a11y-check.yml`
- release-note checks in `release-consistency-guard.yml`
- test execution in `validate-orchestrator-contracts.yml`

### 2. Config and Schema Integrity

Script: `scripts/validate-config-integrity.mjs`

Checks for:

- required schema files under `.github/schemas/`
- required JSON schema mappings in `.vscode/settings.json`
- template/config alignment across markdown, office, PDF, and EPUB profiles

### 3. Documentation Version Pin Freshness

Script: `scripts/validate-doc-version-pins.mjs`

Checks for:

- action example tags in `action/README.md` matching current release version
- `RELEASE-{version}.md` existence and required sections
- matching version section in `CHANGELOG.md`

### 4. Aggregated Release Readiness

Script: `scripts/release-readiness-check.mjs`

Runs a single command that aggregates release-critical checks:

- version consistency
- workflow invariants
- config/schema integrity
- documentation version pin freshness

## Why This Matters

These checks catch high-cost mistakes early:

- release docs and changelog drift
- broken schema references and editor validation regressions
- accidental removal of critical workflow safety checks

## Local Validation

From repository root:

```bash
node scripts/validate-workflow-invariants.mjs
node scripts/validate-config-integrity.mjs
node scripts/validate-doc-version-pins.mjs
node scripts/release-readiness-check.mjs
```

## Recommended Usage

- Keep this workflow required for merge on `main`
- Run locally before release PRs
- Extend invariant checks whenever new critical workflows are introduced
