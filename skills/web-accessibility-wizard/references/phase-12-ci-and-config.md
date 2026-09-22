# Web Accessibility Wizard reference: Phase 12: CI/CD Integration Guide

Part of the `web-accessibility-wizard` skill. Read this only when the task reaches these sections.

## Phase 12: CI/CD Integration Guide

When the user requests CI/CD integration or when no `.a11y-web-config.json` exists, offer to generate a CI/CD integration guide.

Ask using AskUserQuestion: **"Would you like a CI/CD integration guide for automated web accessibility scanning?"**
Options:

- **Yes - GitHub Actions** - generate a GitHub Actions workflow
- **Yes - Azure DevOps** - generate an Azure Pipelines YAML
- **Yes - Generic CI** - generate a generic script-based approach
- **No thanks** - skip CI/CD setup

### GitHub Actions Integration

Generate a `.github/workflows/web-accessibility.yml` workflow:

```yaml
name: Web Accessibility Audit

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 6 * * 1'  # Weekly on Monday at 6 AM

jobs:
  accessibility-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Start dev server
        run: npm start &
        env:
          CI: true

      - name: Wait for server
        run: npx wait-on http://localhost:3000 --timeout 30000

      - name: Run axe-core scan
        run: |
          npx @axe-core/cli http://localhost:3000 \
            --tags wcag2a,wcag2aa,wcag21a,wcag21aa \
            --save axe-results.json

      - name: Check threshold
        run: |
          VIOLATIONS=$(cat axe-results.json | node -e "
            const data = require('./axe-results.json');
            const violations = Array.isArray(data) ? data.reduce((sum, r) => sum + (r.violations?.length || 0), 0) : (data.violations?.length || 0);
            console.log(violations);
            process.exit(violations > 0 ? 1 : 0);
          ")

      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: accessibility-results
          path: |
            axe-results.json
            ACCESSIBILITY-AUDIT.md
```

### Azure DevOps Integration

Generate an `azure-pipelines-a11y.yml`:

```yaml
trigger:
  branches:
    include:
      - main

schedules:
  - cron: '0 6 * * 1'
    displayName: Weekly Accessibility Audit
    branches:
      include:
        - main

pool:
  vmImage: 'ubuntu-latest'

steps:
  - checkout: self

  - task: NodeTool@0
    inputs:
      versionSpec: '20.x'
    displayName: Setup Node.js

  - script: npm ci
    displayName: Install dependencies

  - script: npm start &
    displayName: Start dev server

  - script: npx wait-on http://localhost:3000 --timeout 30000
    displayName: Wait for server

  - script: |
      npx @axe-core/cli http://localhost:3000 \
        --tags wcag2a,wcag2aa,wcag21a,wcag21aa \
        --save axe-results.json
    displayName: Run axe-core scan

  - publish: axe-results.json
    artifact: accessibility-results
    displayName: Publish Results
```

### Generic CI Integration

Provide a shell script `scripts/audit-web.sh`:

```bash
#!/bin/bash
set -euo pipefail

# Web Accessibility Audit CI Script
# Usage: ./scripts/audit-web.sh [url] [threshold]

URL="${1:-http://localhost:3000}"
THRESHOLD="${2:-0}"

echo "Web Accessibility Audit"
echo "URL: $URL"
echo "Threshold: $THRESHOLD violations allowed"

npx @axe-core/cli "$URL" \
  --tags wcag2a,wcag2aa,wcag21a,wcag21aa \
  --save axe-results.json

VIOLATIONS=$(node -e "const d=require('./axe-results.json');console.log(Array.isArray(d)?d.reduce((s,r)=>s+(r.violations?.length||0),0):(d.violations?.length||0))")

echo "Violations found: $VIOLATIONS"

if [ "$VIOLATIONS" -gt "$THRESHOLD" ]; then
  echo "FAIL: $VIOLATIONS violations exceed threshold of $THRESHOLD"
  exit 1
else
  echo "PASS: $VIOLATIONS violations within threshold of $THRESHOLD"
fi
```

## Edge Cases

### Single-Page Applications (SPAs)

SPAs using hash routing (`#/route`) or the History API require special handling:

- Navigate to each route programmatically before scanning
- Check that route changes announce new content to screen readers
- Verify focus management on virtual page transitions
- Test back/forward button behavior with AT

### Iframes and Embedded Content

- Scan iframe content separately if same-origin
- Report cross-origin iframes as "not scannable - third-party content"
- Verify iframe has `title` attribute
- Check for `sandbox` attribute accessibility implications

### Shadow DOM and Web Components

- axe-core can scan open shadow DOM but not closed shadow DOM
- Report closed shadow DOM components as "not scannable - closed shadow root"
- Verify custom elements have proper ARIA roles and keyboard handling
- Check that `slot` content maintains reading order

### Lazy-Loaded Content

- Scroll or trigger lazy loading before scanning
- Verify lazy images have alt text in their final rendered state
- Check `loading="lazy"` doesn't break AT announcements
- Ensure skeleton/placeholder states are accessible

### Third-Party Widgets

- Chat widgets, analytics overlays, cookie banners, social embeds
- Report third-party widget issues separately: "These issues are in third-party code and may require vendor contact"
- Check that third-party widgets don't create keyboard traps
- Verify cookie consent banners are accessible (keyboard, screen reader, contrast)

### PDF Links and Downloads

- Flag links to PDF files: recommend document-accessibility-wizard for PDF auditing
- Verify download links indicate file type and size
- Check that PDF links don't open unexpectedly in browser

### Password-Protected and Staging Environments

- If the URL requires authentication, ask for credentials or a bypass URL
- Support basic auth, cookie-based auth, and token-based auth for scanning
- Never store or log credentials

### Content Behind Authentication

- Ask the user to identify authenticated-only pages
- Request session cookies or auth tokens for scanning gated content
- Note in the report which pages required authentication

### Sites Requiring Cookies/Sessions

- Support passing cookies to axe-core via `--cookie` flag or Playwright context
- Warn if session expiration may affect scan results
- Recommend scanning behind a test account with long-lived sessions

## Web Scan Configuration

Support a `.a11y-web-config.json` configuration file in the project root for consistent scan settings across runs.

### Config Schema

```json
{
  "scan": {
    "startUrl": "http://localhost:3000",
    "urls": ["/", "/login", "/dashboard"],
    "excludePatterns": ["/api/*", "/admin/*"],
    "maxPages": 50,
    "pageTimeout": 30000,
    "viewport": { "width": 1280, "height": 720 },
    "waitForSelector": "main",
    "authentication": {
      "type": "cookie",
      "loginUrl": "/login",
      "fields": { "username": "#email", "password": "#password" }
    }
  },
  "rules": {
    "enabled": "all",
    "disabled": [],
    "tags": ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]
  },
  "severity": {
    "filter": ["critical", "serious", "moderate", "minor"],
    "failOn": ["critical", "serious"]
  },
  "report": {
    "outputPath": "ACCESSIBILITY-AUDIT.md",
    "organization": "by-page",
    "includeRemediation": true,
    "includeScreenshots": false,
    "includePassed": true
  },
  "thresholds": {
    "minScore": 70,
    "maxCritical": 0,
    "maxSerious": 5
  },
  "framework": {
    "name": "auto",
    "routeDiscovery": true
  },
  "ci": {
    "failOnThreshold": true,
    "sarifOutput": false,
    "commentOnPR": true
  },
  "baseline": {
    "reportPath": null,
    "compareOnScan": false
  }
}
```

### Config Field Reference

Each field, with its type, default and description.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `scan.startUrl` | string | null | Starting URL for crawl-based scanning |
| `scan.urls` | string[] | [] | Explicit list of URLs/routes to scan |
| `scan.excludePatterns` | string[] | [] | URL patterns to exclude from crawling |
| `scan.maxPages` | number | 50 | Maximum pages to crawl |
| `scan.pageTimeout` | number | 30000 | Timeout per page in milliseconds |
| `scan.viewport` | object | {1280, 720} | Browser viewport dimensions |
| `rules.enabled` | string/array | "all" | Rules to enable ("all" or array of rule IDs) |
| `rules.disabled` | string[] | [] | Rules to explicitly disable |
| `rules.tags` | string[] | ["wcag2a","wcag2aa"] | axe-core rule tags to include |
| `severity.filter` | string[] | all | Severity levels to include in report |
| `severity.failOn` | string[] | ["critical","serious"] | Severity levels that cause CI failure |
| `report.outputPath` | string | "ACCESSIBILITY-AUDIT.md" | Report file path |
| `report.organization` | string | "by-page" | Report organization: by-page, by-issue, by-severity |
| `thresholds.minScore` | number | 0 | Minimum acceptable score (0-100) |
| `thresholds.maxCritical` | number | null | Max critical issues before failure |
| `ci.failOnThreshold` | boolean | true | Whether CI should fail on threshold violations |
| `ci.sarifOutput` | boolean | false | Generate SARIF output for code scanning integration |
| `baseline.reportPath` | string | null | Path to previous report for comparison |

### Config Resolution Order

1. Check project root for `.a11y-web-config.json`
2. Check parent directories (up to 3 levels)
3. Fall back to defaults

When this file is present, the wizard automatically detects it and applies its configuration.

---

## Multi-Agent Reliability

### Action Constraints

You are an **orchestrator** (read-only until fix mode). You may:

- Run axe-core scans and code reviews
- Delegate domain scans to sub-agents in parallel groups (A, B, C)
- Aggregate findings into a scored report
- Enter interactive fix mode ONLY after presenting findings and obtaining user confirmation

You may NOT:

- Apply fixes without user confirmation at the Phase 3 review gate
- Skip mandatory phases (Phase 0 config, Phase 9 axe-core, Phase 10 report)
- Modify files outside the declared scan scope

### Sub-Agent Output Contract

Every sub-agent in Groups A/B/C MUST return findings in this format:

- `rule_id`: axe-core rule ID or WCAG criterion
- `severity`: `critical` | `serious` | `moderate` | `minor`
- `element`: CSS selector or file:line reference
- `description`: what is wrong
- `remediation`: how to fix it
- `confidence`: `high` | `medium` | `low`

Findings missing required fields are rejected. The wizard re-requests from the sub-agent with explicit field requirements.

### Boundary Validation

**Before Phase 2 (parallel scanning):** Verify all sub-agent inputs are ready: URLs resolved, config loaded, scan scope confirmed.
**After each parallel group:** Verify each sub-agent returned structured findings. Log which sub-agents completed and which failed. Proceed with partial results only after noting gaps.
**Before Phase 10 (report):** Verify axe-core scan completed (Phase 9 is mandatory). Verify severity scoring inputs are complete.

### Failure Handling

- Sub-agent scan fails: log the failure, report which domain was not scanned, continue with remaining domains. Offer targeted retry.
- axe-core unavailable: report that runtime scan could not run, produce code-review-only report with reduced confidence. Never silently skip Phase 9.
- Partial parallel group results: aggregate what succeeded, clearly mark failed domains in the report.
- Config file missing: state that defaults are being used. Never silently assume config.
