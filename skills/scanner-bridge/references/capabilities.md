# Scanner Bridge reference: Capabilities

Part of the `scanner-bridge` skill. Read this only when the task reaches these sections.

## Capabilities

### 1. Detect Scanner Configuration

Search the repository for workflow files that reference `github/accessibility-scanner`:

1. Look for `.github/workflows/*.yml` files containing `github/accessibility-scanner@v`
2. If found, extract the scanner configuration:
   - `urls` -- the list of URLs being scanned
   - `repository` -- the target repo for issues and PRs
   - `cache_key` -- the cache key for delta detection
   - `skip_copilot_assignment` -- whether Copilot is enabled
   - `include_screenshots` -- whether screenshots are captured
3. Return a structured detection result:

```json
{
  "scannerDetected": true,
  "workflowFile": ".github/workflows/a11y-scan.yml",
  "urls": ["https://example.com", "https://example.com/login"],
  "targetRepo": "owner/repo",
  "cacheKey": "cached_results-example.json",
  "copilotEnabled": true,
  "screenshotsEnabled": false
}
```

If no scanner workflow is found, return `{"scannerDetected": false}`.

### 2. Fetch Scanner Issues

Query the target repository for issues created by the scanner:

1. Search for open scanner issues:

   ```text
   repo:{REPO} is:issue is:open label:accessibility
   ```

2. Search for recently closed scanner issues (remediated):

   ```text
   repo:{REPO} is:issue is:closed label:accessibility closed:>{30_DAYS_AGO}
   ```

3. For each issue, extract:
   - Issue number and URL
   - Title (typically the axe-core rule description)
   - Body content (violation details, affected element, WCAG criterion)
   - Labels (severity, category)
   - Assignees (check for Copilot assignment)
   - Linked PRs (Copilot fix proposals)
   - State (open, closed)
   - Creation date

### 3. Normalize Findings

Convert scanner issue data into the standard agent finding format:

```json
{
  "source": "github-a11y-scanner",
  "ruleId": "{axe-core-rule-id}",
  "wcagCriterion": "{criterion}",
  "wcagLevel": "{A|AA|AAA}",
  "severity": "{critical|serious|moderate|minor}",
  "confidence": "high",
  "url": "{scanned-url}",
  "element": "{css-selector-or-html-snippet}",
  "description": "{violation-description}",
  "remediation": "{fix-guidance}",
  "githubIssue": {
    "number": 0,
    "url": "{issue-url}",
    "state": "{open|closed}",
    "copilotAssigned": false,
    "fixPR": null
  }
}
```

Parse the issue body to extract axe-core rule IDs, WCAG criteria, affected elements, and impact levels. Map impact levels to the agent severity model:

| Scanner Impact | Agent Severity |
|---------------|---------------|
| Critical | critical |
| Serious | serious |
| Moderate | moderate |
| Minor | minor |

### 4. Deduplicate Against Local Scans

When both scanner data and a local axe-core scan exist, merge findings:

1. **Match by rule ID + URL:** If both sources report the same axe-core rule on the same URL, it is a single finding.
2. **Boost confidence:** Matched findings receive `high` confidence. Unmatched findings receive `medium` confidence.
3. **Tag source:** Each finding is tagged with its source:
   - `"both"` -- found by scanner AND local scan
   - `"scanner-only"` -- found by scanner but not local scan
   - `"local-only"` -- found by local scan but not scanner
4. **Preserve GitHub context:** For scanner-sourced findings, retain the issue number and URL so the audit report can link directly to the tracked issue.

### 5. Track Copilot Fix Status

For scanner issues assigned to Copilot:

1. Check if a linked PR exists (search for PRs referencing the issue number)
2. Check PR state: open, merged, or closed without merge
3. Return fix status:

| Status | Meaning |
|--------|---------|
| `pending` | Issue assigned to Copilot, no PR yet |
| `pr-open` | Copilot has proposed a fix (PR open) |
| `pr-approved` | Copilot PR has been approved |
| `fixed` | Copilot PR merged, issue closed |
| `rejected` | Copilot PR closed without merge |
| `unassigned` | Issue not assigned to Copilot |

### 6. Generate Scanner Summary

Produce a summary for inclusion in the audit report:

```markdown
## GitHub Accessibility Scanner Integration

| Metric | Value |
|--------|-------|
| Scanner configured | Yes |
| Workflow file | `.github/workflows/a11y-scan.yml` |
| URLs scanned (CI) | 4 |
| Open scanner issues | 12 |
| Recently closed (30d) | 5 |
| Copilot fixes pending | 3 |
| Copilot fixes merged | 2 |

### Scanner Issue Correlation

| Finding | Scanner Issue | Local Scan | Confidence | Copilot Status |
|---------|-------------|------------|------------|---------------|
| Missing alt text on /home | [#42](url) | Confirmed | High | PR open |
| Low contrast on /login | [#43](url) | Not found locally | Medium | Pending |
| No skip link | Not tracked | Found locally | Medium | -- |

### Delta Since Last CI Scan

- **New issues:** 3 (found in latest scan, not in cache)
- **Fixed issues:** 2 (in cache but not in latest scan)
- **Persistent issues:** 7 (found in both scans)
```

---
