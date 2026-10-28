# Playwright High-Impact Checks

This guide explains how to run high-impact accessibility checks using Playwright for rendered UI behavior that static linting cannot fully catch.

## What This Adds

The repository now includes:

- Workflow: `.github/workflows/playwright-high-impact-check.yml`
- Runner script: `mcp-server/scripts/playwright-high-impact-check.mjs`
- Artifacts:
  - `artifacts/playwright-high-impact.json`
  - `artifacts/playwright-high-impact-summary.md`

## Why It Matters

High-impact checks focus on production risk signals:

- serious and critical axe violations
- keyboard trap detection during Tab traversal
- horizontal scroll overflow at narrow viewports
- undersized touch targets

These are common causes of severe accessibility regressions that affect keyboard and screen reader users.

## Workflow Usage

### Pull Requests

On pull requests that change web UI files (`html`, `jsx`, `tsx`, `vue`, `svelte`, `astro`, `css`, `scss`), the workflow runs automatically.

By default, it serves the local example page and runs high-impact checks against:

- `http://127.0.0.1:4173/example/index.html`

That page is broken on purpose, so on a pull request the job is a self-test:
it passes when the checker reports the page as failing, with at least one
critical axe violation and the keyboard trap, and fails if the checker stops
catching them.

### Manual Run

Use `workflow_dispatch` for a live URL. With a URL, the job is a real gate and fails on the conditions below:

- `url` (optional): target URL
- `min_impact` (optional): `critical|serious|moderate|minor` (default `serious`)

## Local Run

From repository root:

```bash
npm ci --prefix mcp-server
npm install --prefix mcp-server --no-save playwright @axe-core/playwright
npx --prefix mcp-server playwright install chromium
node mcp-server/scripts/playwright-high-impact-check.mjs \
  --url http://127.0.0.1:4173/example/index.html \
  --min-impact serious \
  --out-dir artifacts
```

## Pass/Fail Logic

The script fails (exit 1) when any of the following are true:

- axe violations at or above `min_impact`
- potential keyboard trap detected
- horizontal scroll overflow detected

Touch-target findings are always reported in artifacts and included in the summary.

## CI Artifact Review

Always review `playwright-high-impact-summary.md` from workflow artifacts for:

- top failing rules
- viewport-specific overflow findings
- touch target counts
- failure reasons

## Recommended Team Policy

- Keep `min_impact=serious` for default gating
- Use `min_impact=critical` during gradual rollout if legacy debt is high
- For release branches, run manual checks against deployed preview URLs
