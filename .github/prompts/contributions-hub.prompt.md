---
name: manage-contributions
description: Community and contributions command center. Manage GitHub Discussions, moderate interactions, track contributor health, generate community reports, manage contributor agreements.
mode: agent
agent: contributions-hub
tools:
  - askQuestions
  - runInTerminal
  - getTerminalOutput
  - createFile
  - readFile
---

# Contributions Hub

Manage GitHub Discussions, community interactions, contributor health tracking, and community reports.

## Repository

**Repository:** `${input:repo}`

## What to Manage?

**Action:** `${input:action}` (e.g., "show discussions", "create discussion", "community report", "track contributors", "moderate")

## Instructions

### List Discussions

```bash
gh api graphql -f query='
query {
  repository(owner: "${owner}", name: "${name}") {
    discussions(first: 20) {
      nodes {
        number
        title
        author { login }
        createdAt
        category { name }
        comments { totalCount }
        upvoteCount
      }
    }
  }
}'
```

### Create Discussion

```bash
gh api graphql -f query='
mutation {
  createDiscussion(input: {
    repositoryId: "${repoId}",
    categoryId: "${categoryId}",
    title: "${title}",
    body: "${body}"
  }) {
    discussion {
      url
    }
  }
}'
```

### Get Discussion Categories

```bash
gh api graphql -f query='
query {
  repository(owner: "${owner}", name: "${name}") {
    discussionCategories(first: 10) {
      nodes {
        id
        name
        description
      }
    }
  }
}'
```

### Contributor Activity Report

```bash
# First-time contributors (last 30 days)
gh api repos/${input:repo}/contributors --jq '.[] | select(.contributions == 1)'

# Top contributors
gh api repos/${input:repo}/contributors --jq 'sort_by(-.contributions) | .[:10] | .[] | {login, contributions}'

# Contributor growth
# (track unique contributors over time)
```

### Community Health Metrics

```bash
# Community profile
gh api repos/${input:repo}/community/profile --jq '{
  health_percentage,
  description,
  documentation,
  files: {
    code_of_conduct,
    contributing,
    license,
    readme
  }
}'
```

### Moderate Discussion Comments

```bash
# Mark comment as spam
gh api graphql -f query='
mutation {
  markDiscussionCommentAsAnswer(input: {
    id: "${commentId}"
  }) {
    discussionComment {
      id
    }
  }
}'
```

### Track Contributor Agreements

Check if contributors have signed CLA:
```bash
# List PRs from external contributors
gh pr list --repo ${input:repo} --author ${username} --json author,mergeable
```

### Generate Community Report

Create `COMMUNITY-REPORT-${input:repo}.md`:

```markdown
# Community Report: ${input:repo}

**Generated:** ${date}

## Activity Summary

- **Discussions:** ${discussionCount} (${newThisMonth} this month)
- **Contributors:** ${totalContributors} (${newContributorsThisMonth} new)
- **Community Health:** ${healthPercent}%

## Top Discussions

1. #${number} - ${title} (${upvotes} upvotes, ${comments} comments)
2. ...

## New Contributors

- @user1 - First contribution: PR #123
- @user2 - First contribution: Issue #456

## Community Files

- Code of Conduct: ✅
- Contributing Guide: ✅
- License: ✅
- README: ✅

## Recommendations

- Welcome new contributors
- Respond to unanswered discussions
- Update documentation
```

## Expected Output

- Discussion list or specific discussion details
- Community activity report
- Contributor health metrics
- Moderation actions confirmed
