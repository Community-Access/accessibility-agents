---
name: kb-github-a11y-scanner
description: Reference data, not a reviewer. Integrate GitHub Accessibility Scanner. Detects configuration, parses scanner issues, correlates with local scans, and tracks Copilot-assigned fixes.
license: MIT
disable-model-invocation: true
user-invocable: false
metadata:
  tier: reference
  domain: cross-cutting
  output: none
  effort: low
  title: Github A11y Scanner
---

## GitHub Accessibility Scanner Integration

## What Is the GitHub Accessibility Scanner?

The [GitHub Accessibility Scanner](https://github.com/github/accessibility-scanner) (`github/accessibility-scanner@v3`) is an official GitHub Action that:

- Scans live URLs for accessibility barriers in a headless Playwright browser (axe-core by default; `accesslint` and plugins are optional)
- Creates trackable GitHub Issues for each finding, with affected element, WCAG criterion, and remediation guidance
- Optionally assigns issues to GitHub Copilot for AI-powered fix suggestions and PR creation
- Caches results across runs for delta detection (new, fixed, persistent findings)
- Supports authenticated scanning (login flows, SSO, passkeys via Playwright auth context)
- Optionally captures screenshots and attaches them to filed issues

**Current version:** v3 (public preview)

## Detecting Scanner Presence

To determine whether a repository has the GitHub Accessibility Scanner configured:

### Workflow File Detection

Search for workflow files referencing the scanner action:

```bash
# Search in .github/workflows/ for the scanner action reference
grep -rl "github/accessibility-scanner" .github/workflows/
```

**Pattern to match in YAML:**

```yaml
- uses: github/accessibility-scanner@v3
```

### Workflow Inputs

When a scanner workflow is found, extract its configuration:

| Input | Required | Description |
|-------|----------|-------------|
| `urls` | Yes, unless `url_configs` is set | Newline-delimited list of URLs to scan |
| `url_configs` | No | JSON array of per-URL configs (`url`, optional `excludeSelectors` and `waitForSelectors`); takes precedence over `urls` |
| `repository` | Yes | Repository (owner/name) where issues and PRs are created |
| `token` | Yes | Fine-grained PAT: `actions`, `contents`, `issues` and `pull-requests` write, `metadata` read. `GITHUB_TOKEN` does not work |
| `cache_key` | Yes | Key for caching results across runs; characters `A-Za-z0-9._/-` |
| `login_url` | No | Login page URL for authenticated scanning |
| `username` | No | Username for authentication |
| `password` | No | Password for authentication (via repository secret) |
| `auth_context` | No | JSON with username, password, cookies and/or localStorage; overrides `login_url`, `username`, `password` |
| `skip_copilot_assignment` | No | Set `true` to skip assigning issues to Copilot |
| `include_screenshots` | No | Set `true` to capture screenshots (stored on `gh-cache` branch) |
| `group_by` | No | `finding` (default), `rule` or `rule+url`; decides how many issues are filed |
| `scans` | No | Scanners to run: `axe` (default), `accesslint`, or plugin names |
| `dry_run` | No | Log what would be filed without touching issues or the cache |

## Parsing Scanner-Created Issues

The scanner creates GitHub Issues with a structured format. Agents should parse these fields:

### Issue Identification

Scanner-created issues can be identified by:

1. **Author:** The GitHub Actions bot that runs the workflow
2. **Labels:** The scanner applies labels to categorize findings (typically accessibility-related labels)
3. **Body structure:** Issues contain structured sections with violation details

### Issue Body Structure

Scanner issues typically contain:

| Section | Content | Agent Use |
|---------|---------|-----------|
| Violation title | The axe-core rule that was violated | Map to `kb-help-url-reference` for remediation docs |
| WCAG criterion | The specific WCAG success criterion | Used for severity scoring and compliance mapping |
| Affected element | CSS selector or HTML snippet of the failing element | Used by `scanner-bridge` to map to source code |
| Impact level | Critical, Serious, Moderate, or Minor | Direct mapping to agent severity model |
| Remediation guidance | How to fix the issue | Enriched by agent specialists with framework-specific fixes |
| URL | The page URL where the issue was found | Used for cross-referencing with local axe-core scans |
| Screenshot link | Link to screenshot on `gh-cache` branch (if enabled) | Included in audit reports |

### Severity Mapping

The scanner uses axe-core impact levels that map directly to the agent severity model. Weights are the ones in `skills/a11y-core/scripts/merge-findings.mjs`, multiplied by confidence (high 1, medium 0.7, low 0.4):

| Scanner Impact | Agent Severity | Score Weight |
|---------------|---------------|-------------|
| Critical | critical | 10 |
| Serious | serious | 5 |
| Moderate | moderate | 2 |
| Minor | minor | 1 |

### axe-core Rule Correlation

The scanner uses axe-core under the hood. Scanner issue titles and violation IDs correspond to axe-core rules already cataloged in `kb-help-url-reference`. Common scanner-reported rules:

| axe-core Rule ID | WCAG Criterion | Common Description |
|-------------------|----------------|-------------------|
| `image-alt` | 1.1.1 | Images must have alternate text |
| `label` | 4.1.2 | Form elements must have labels |
| `color-contrast` | 1.4.3 | Elements must have sufficient color contrast |
| `link-name` | 2.4.4 | Links must have discernible text |
| `html-has-lang` | 3.1.1 | `<html>` element must have a lang attribute |
| `button-name` | 4.1.2 | Buttons must have discernible text |
| `document-title` | 2.4.2 | Documents must have `<title>` element |
| `bypass` | 2.4.1 | Page must have means to bypass repeated blocks |
| `heading-order` | none (best-practice; relates to 1.3.1) | Heading levels should increase by one |
| `aria-allowed-attr` | 4.1.2 | ARIA attributes must be allowed for element role |

## Caching and Delta Detection

The scanner uses a `cache_key` to persist results across workflow runs. This enables delta tracking:

| Status | Meaning |
|--------|---------|
| **New** | Issue found in current scan but not in cached results |
| **Fixed** | Issue in cached results but not found in current scan (issue auto-closed) |
| **Persistent** | Issue found in both current scan and cached results |

### Cache Key Conventions

When setting up scanner integration, align the cache key with agent conventions:

- Use a descriptive name: `cached_results-{domain}-{branch}.json`
- Include branch context for branch-specific scanning
- The cache is stored as a GitHub Actions artifact

## Correlation with Local Scans

### Dual-Source Confidence Boosting

When both the GitHub Accessibility Scanner (CI) and a local axe-core scan (agent) find the same issue:

1. **Match by rule ID:** Both sources use axe-core rule IDs (e.g., `color-contrast`, `image-alt`)
2. **Match by URL:** Compare the scanned URL from the scanner issue with the local scan target
3. **Match by element:** Compare CSS selectors or HTML paths for the affected element
4. **Boost confidence:** Findings confirmed by both sources automatically receive `high` confidence

### Source Comparison Analysis

Each scenario, with its interpretation and action.

| Scenario | Interpretation | Action |
|----------|---------------|--------|
| Found by scanner AND local scan | High confidence -- confirmed by both | Report as high confidence, full severity weight |
| Found by scanner only | Environment-specific or intermittent | Report as medium confidence, note "CI-only finding" |
| Found by local scan only | New since last CI scan, or local-only condition | Report as medium confidence, note "local-only finding" |
| In scanner cache as "fixed" | Recently remediated | Track in delta section as resolved |

## Copilot Fix Tracking

When the scanner assigns issues to GitHub Copilot:

### Fix Lifecycle

Each stage, with GitHub state and how to detect.

| Stage | GitHub State | How to Detect |
|-------|-------------|---------------|
| Issue created | Open issue, assigned to Copilot | `assignee` includes Copilot bot |
| Fix proposed | Open PR linked to issue | PR references issue number, author is Copilot |
| Fix reviewed | PR has review comments | PR review state is `CHANGES_REQUESTED` or `APPROVED` |
| Fix merged | PR merged, issue closed | Issue state is `closed`, linked PR is merged |
| Fix rejected | PR closed without merge | PR state is `closed`, not merged |

### Querying Copilot Fix Status

```text
# Find scanner issues assigned to Copilot
repo:{REPO} is:issue is:open assignee:copilot label:accessibility

# Find Copilot PRs from scanner issues
repo:{REPO} is:pr author:copilot-swe-agent label:accessibility

# Find merged scanner fixes
repo:{REPO} is:pr is:merged author:copilot-swe-agent label:accessibility
```

## Structured Output Format

When `scanner-bridge` normalizes scanner issue data, each finding follows `skills/a11y-core/schemas/findings.schema.json`. The scanner issue, Copilot state and screenshot go in `evidence`:

```json
{
  "rule": "color-contrast",
  "wcag": "1.4.3 AA",
  "severity": "serious",
  "confidence": "high",
  "location": "https://example.com/login button.submit-btn",
  "summary": "Element has insufficient color contrast ratio of 3.2:1 (expected 4.5:1)",
  "fix": "Change the text color or background to achieve at least 4.5:1 contrast ratio",
  "evidence": "github-a11y-scanner issue https://github.com/owner/repo/issues/42 (open, assigned to Copilot, no fix PR); screenshot on gh-cache branch: screenshots/login-contrast.png"
}
```

## Search Patterns for Scanner Issues

### By Repository

```text
repo:{OWNER}/{REPO} is:issue label:accessibility created:>{YYYY-MM-DD}
```

### By Scan Run

Issues from a specific scan run share the same creation timestamp and batch pattern. Filter by:

- Creation date matching the workflow run date
- Common label set applied by the scanner

### Cross-Repository Scanner Discovery

```text
user:{USERNAME} is:issue label:accessibility sort:created-desc
org:{ORGNAME} is:issue label:accessibility sort:created-desc
```
