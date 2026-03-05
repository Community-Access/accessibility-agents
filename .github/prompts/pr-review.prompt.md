---
name: review-pull-request
description: Pull request code review command center. Pull PR diffs, before/after snapshots, developer comments, reactions, release context. Generates full review documents.
mode: agent
agent: pr-review
tools:
  - askQuestions
  - readFile
  - runInTerminal
  - getTerminalOutput
  - createFile
  - runSubagent
---

# Pull Request Review

Comprehensive code review for GitHub pull requests with context awareness and detailed analysis.

## Pull Request to Review

**Repository:** `${input:repo}`  
**PR Number:** `${input:prNumber}`

## Instructions

### Step 1: Fetch PR Details

```bash
gh pr view ${input:prNumber} --repo ${input:repo} --json number,title,author,body,state,createdAt,updatedAt,mergedAt,comments,reviews,reactions,labels,milestone,headRefName,baseRefName --jq '.'
```

### Step 2: Get PR Diff

```bash
gh pr diff ${input:prNumber} --repo ${input:repo}
```

### Step 3: Check File Changes

```bash
gh pr view ${input:prNumber} --repo ${input:repo} --json files --jq '.files[].path'
```

### Step 4: Gather CI/CD Status

```bash
gh pr checks ${input:prNumber} --repo ${input:repo}
```

### Step 5: Check Related Issues

Extract issue references from PR body and comments:
- `fixes #123`
- `closes #456`
- `related to #789`

Fetch issue context for each.

### Step 6: Check Release Context

```bash
# Find releases since base branch
gh release list --repo ${input:repo} --limit 10
```

### Step 7: Analyze Code Changes

For each changed file:
- Identify purpose (feature, bug fix, refactor)
- Check for breaking changes
- Review test coverage changes
- Identify documentation updates needed

### Step 8: Check Reactions & Community

- Thumbs up/down on PR
- Reviewer approvals/change requests
- Comment threads resolved/unresolved

### Step 9: Generate Review Document

Create `PR-REVIEW-${input:repo}-${input:prNumber}.md`:

```markdown
# Pull Request Review: #${input:prNumber} - ${title}

**Repository:** ${input:repo}  
**Author:** ${author}  
**Status:** ${state}  
**Created:** ${createdAt}  

## Summary

${description from body}

## Changes

${files changed summary}

## Code Analysis

${detailed code review}

## Testing

${CI/CD status, test coverage}

## Security/Accessibility

${security implications, accessibility impact}

## Recommendation

[Approve / Request Changes / Comment]

## Action Items

- [ ] ...
```

### Step 10: Generate HTML Report

Create dual output: markdown + HTML with navigation, syntax highlighting, and accessible structure.

## Expected Output

- Comprehensive PR review markdown file
- Accessible HTML report
- Recommendation (Approve/Changes/Comment)
- Action items checklist
