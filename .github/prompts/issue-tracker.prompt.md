---
name: track-issues
description: GitHub issue command center. Find, triage, review, and respond to issues. Full markdown + HTML reports with reactions, release context, discussion awareness.
mode: agent
agent: issue-tracker
tools:
  - askQuestions
  - readFile
  - runInTerminal
  - getTerminalOutput
  - createFile
  - runSubagent
---

# Issue Tracker

Comprehensive GitHub issue management - find, triage, analyze, and respond to issues across repositories.

## What Issues to Track?

**Repository:** `${input:repo}`  
**Filter:** `${input:filter}` (e.g., "is:open label:bug", "author:@me is:open", "is:closed since:7d")

## Instructions

### Step 1: Search Issues

```bash
gh issue list --repo ${input:repo} --search "${input:filter}" --json number,title,author,state,createdAt,updatedAt,closedAt,labels,milestone,assignees,comments,reactions --limit 100
```

### Step 2: Get Issue Details

For each issue:
```bash
gh issue view {number} --repo ${input:repo} --json number,title,author,body,state,createdAt,updatedAt,closedAt,comments,reactions,labels,milestone,assignees
```

### Step 3: Check Related PRs

```bash
# Find PRs that reference this issue
gh pr list --repo ${input:repo} --search "fixes #${number} OR closes #${number}" --json number,title,state
```

### Step 4: Check Release Context

For closed issues, identify which release included the fix:
```bash
gh release list --repo ${input:repo}
```

Check release notes for issue references.

### Step 5: Analyze Issue Patterns

Group by:
- Labels (bug, feature, documentation)
- Milestone
- Age (stale, recent)
- Activity (comments, reactions)

### Step 6: Triage Recommendations

For each open issue:
- **Priority:** Critical/High/Medium/Low based on labels, age, reactions, assignee
- **Status:** Needs info / Ready to work / In progress / Blocked
- **Estimated effort:** Small/Medium/Large from label or body
- **Related issues:** Duplicates, dependencies

### Step 7: Generate Issue Report

Create `ISSUE-TRACKER-${input:repo}.md`:

```markdown
# Issue Tracker Report: ${input:repo}

**Generated:** ${date}  
**Filter:** ${input:filter}  
**Total Issues:** ${count}

## Summary

- Open: ${openCount}
- Closed: ${closedCount}
- Critical: ${criticalCount}
- Needs triage: ${needsTriageCount}

## Open Issues by Priority

### Critical
- #123 - Title (author, 3d ago, 5 comments) ⚡

### High
- #124 - Title (author, 1w ago, 2 comments)

## Recently Closed Issues

- #100 - Fixed in v1.2.0
- #101 - Closed as duplicate of #95

## Stale Issues (30+ days old)

- #50 - Needs maintainer response

## Action Items

- [ ] Respond to #123
- [ ] Close stale issues #45, #46
- [ ] Add milestone to #130-135
```

### Step 8: Generate HTML Report

Create dual output with accessible navigation, filterable table view, and responsive design.

## Expected Output

- Issue tracker markdown report
- Accessible HTML report
- Triage recommendations
- Action items checklist
