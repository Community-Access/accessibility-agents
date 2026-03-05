---
name: integrate-github-scanner
description: GitHub Accessibility Scanner bridge. Detects scanner presence, parses scanner-created issues, correlates findings with local scans, tracks Copilot fix status.
mode: agent
agent: scanner-bridge
tools:
  - askQuestions
  - readFile
  - runInTerminal
  - getTerminalOutput
  - createFile
---

# GitHub Accessibility Scanner Bridge

Integrate GitHub Accessibility Scanner CI data with agent ecosystem. Parse scanner-created issues, deduplicate against local audits, track Copilot fix status.

## Repository

**Repository:** `${input:repo}`

## Instructions

### Step 1: Detect Scanner Presence

Check for:
- `.github/workflows/accessibility-scanner.yml`
- GitHub Actions run with `github/accessibility-scanner` action
- Issues labeled `accessibility` from `github-actions[bot]`

### Step 2: List Scanner-Created Issues

```bash
# Find issues created by GitHub Accessibility Scanner
gh issue list --repo ${input:repo} \
  --label accessibility \
  --author "github-actions[bot]" \
  --state all \
  --json number,title,body,state,createdAt,labels
```

### Step 3: Parse Issue Body

Scanner issues follow this format:

```markdown
## Accessibility Issue: ${ruleId}

**Rule:** ${ruleId}
**Impact:** ${critical|serious|moderate|minor}
**WCAG:** ${wcagCriteria}
**Element:** ${selector}
**Page:** ${url}

### Description
${description}

### Remediation
${steps}

### Help
[Learn more](${helpUrl})
```

Extract:
- Rule ID
- Impact/severity
- WCAG criteria
- Affected element
- Page URL

### Step 4: Map Scanner Severity

GitHub Scanner uses axe-core severity model:
- `critical` → Critical
- `serious` → Serious
- `moderate` → Moderate
- `minor` → Minor

Direct mapping to agent severity model.

### Step 5: Correlate with Local Scans

If web-accessibility-wizard already ran:
- Match by: rule ID + page URL + element selector
- **Duplicate:** Issue found by both scanner and local → mark as "confirmed"
- **Scanner-only:** Issue found by scanner but not local → flag for investigation (may be fixed locally)
- **Local-only:** Issue found locally but not by scanner → scanner may not have scanned this page yet

### Step 6: Track Copilot Fix Status

Scanner issues may have:
- Label `copilot-assigned` - Assigned to Copilot for auto-fix
- Comment from Copilot with fix PR number

Extract fix status:
- **Open** - Not yet addressed
- **Assigned to Copilot** - Auto-fix in progress
- **PR submitted** - Fix awaiting review
- **Merged** - Fixed and deployed
- **Closed (other)** - Closed without fix (wontfix, duplicate, etc.)

### Step 7: Deduplicate Findings

Priority:
1. Local scan (most recent, most detailed)
2. Scanner issue (CI-detected, tracked in GitHub)

Merged format:
```json
{
  "ruleId": "button-name",
  "impact": "critical",
  "status": "confirmed",
  "sources": ["local-scan", "github-scanner"],
  "scannerIssue": "#123",
  "copilotFixStatus": "PR submitted (#456)"
}
```

### Step 8: Generate Bridge Report

Create `SCANNER-BRIDGE.md`:

```markdown
# GitHub Accessibility Scanner Bridge

**Generated:** ${date}  
**Repository:** ${input:repo}

## Scanner Status

- **Workflow:** ${workflowStatus}
- **Last Run:** ${lastRunDate}
- **Issues Created:** ${issueCount}

## Scanner Issues

### Open Issues (${openCount})
- #123 - `button-name`: 5 buttons without names
  - Status: Assigned to Copilot
  - PR: #456 (awaiting review)

### Closed Issues (${closedCount})
- #100 - `image-alt`: Fixed in PR #450 ✅

## Correlation with Local Scan

- **Confirmed:** ${confirmedCount} issues (found by both)
- **Scanner-only:** ${scannerOnlyCount} issues
- **Local-only:** ${localOnlyCount} issues

## Copilot Fix Tracking

- **Auto-fix PRs:** ${copilotPRCount}
- **Merged:** ${mergedCount}
- **Pending:** ${pendingCount}

## Recommendations

- Review scanner-only issues (may be new regressions)
- Approve Copilot PRs after review
- Close duplicate issues
```

## Expected Output

- Parsed scanner issues
- Deduplicated findings
- Copilot fix status tracking
- Ready for inclusion in WEB-ACCESSIBILITY-AUDIT.md
