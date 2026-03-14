---
name: github-analytics
description: GitHub analytics command center. Team velocity, review turnaround, issue resolution metrics, contribution activity, bottleneck detection, code churn analysis.
mode: agent
agent: analytics
tools:
  - askQuestions
  - readFile
  - runInTerminal
  - getTerminalOutput
  - createFile
---

# GitHub Analytics & Insights

Comprehensive repository metrics, team velocity, and workflow analytics with dual markdown + HTML reports.

## Analytics Scope

**Repository:** `${input:repo}`  
**Time Range:** `${input:timeRange}` (e.g., "7d", "30d", "since:2024-01-01")

## Instructions

### Step 1: Gather Issue Metrics

```bash
# Created/Closed issues
gh issue list --repo ${input:repo} --state all --search "created:>=${startDate}" --json number,createdAt,closedAt,author,labels

# Average time to close
# Issues by label
# Issues by author
```

### Step 2: Gather PR Metrics

```bash
# Created/Merged PRs
gh pr list --repo ${input:repo} --state all --search "created:>=${startDate}" --json number,createdAt,mergedAt,author,additions,deletions,reviews

# Average time to merge
# Code churn (additions + deletions)
# Review turnaround time
```

### Step 3: Contributor Activity

```bash
# Unique contributors
# Top contributors by commits/PRs/reviews
# First-time contributors
```

### Step 4: Review Metrics

```bash
# Average reviews per PR
# Reviewer distribution
# Approval/change request ratio
# Review response time
```

### Step 5: Bottleneck Detection

Identify:

- PRs waiting for review (> 3 days)
- PRs stuck in draft
- Issues waiting for maintainer response
- Stale branches

### Step 6: Code Churn Analysis

```bash
# Files changed most frequently
# Largest PRs by line changes
# Hotspot files (changed in multiple PRs)
```

### Step 7: Generate Analytics Report

Create `ANALYTICS-${input:repo}.md`:

```markdown
# GitHub Analytics: ${input:repo}

**Time Range:** ${timeRange}  
**Generated:** ${date}

## Executive Summary

- **Issues:** ${created} created, ${closed} closed (${closeRate}% close rate)
- **PRs:** ${prCreated} opened, ${prMerged} merged (${mergeRate}% merge rate)
- **Contributors:** ${uniqueContributors} (${newContributors} new)
- **Review Turnaround:** ${avgReviewTime}

## Issue Resolution

- Average time to close: ${avgCloseTime}
- Resolution rate: ${resolvedPercent}%
- Stale issues (30+ days): ${staleCount}

## Pull Request Velocity

- Average time to merge: ${avgMergeTime}
- Average reviews per PR: ${avgReviews}
- Largest PR: #${largestPR} (${additions} additions, ${deletions} deletions)

## Top Contributors

1. @user1 - ${commits} commits, ${prs} PRs, ${reviews} reviews
2. @user2 - ...

## Bottlenecks

- 🚨 ${waitingReviewCount} PRs waiting for review (> 3d)
- ⚠️ ${staleIssueCount} stale issues (> 30d)

## Code Churn Hotspots

1. `src/file.ts` - ${changeCount} changes across ${prCount} PRs
2. `config.json` - ...

## Recommendations

- Assign reviewers to PRs #123, #124
- Triage stale issues #45-50
- Consider splitting large PRs (> 500 lines)
```

### Step 8: Generate HTML Dashboard

Create interactive dashboard with:

- Charts (issue/PR trends, contributor activity)
- Filterable tables
- Accessible navigation
- Responsive design

## Expected Output

- Analytics markdown report
- Interactive HTML dashboard
- Identified bottlenecks
- Actionable recommendations
