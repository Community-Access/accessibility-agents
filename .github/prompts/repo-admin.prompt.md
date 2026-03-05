---
name: repo-administration
description: Repository administration command center. Add/remove collaborators, configure branch protection, manage webhooks, adjust settings, audit access.
mode: agent
agent: repo-admin
tools:
  - askQuestions
  - runInTerminal
  - getTerminalOutput
  - createFile
---

# Repository Administration

Repository configuration, access management, branch protection, and settings audit.

## Repository

**Repository:** `${input:repo}`

## What to Administer?

**Action:** `${input:action}` (e.g., "add collaborator", "configure branch protection", "audit access", "manage webhooks")

## Instructions

### Add Collaborator

```bash
# Add user with permission level
gh api repos/${input:repo}/collaborators/${username} -X PUT -f permission=${permission}

# Permission levels: pull, push, admin, maintain, triage
```

### Remove Collaborator

```bash
gh api repos/${input:repo}/collaborators/${username} -X DELETE
```

### Audit Access

```bash
# List all collaborators
gh api repos/${input:repo}/collaborators --jq '.[] | {login, permissions}'

# List teams with access
gh api repos/${input:repo}/teams --jq '.[] | {name, permission}'
```

### Configure Branch Protection

```bash
# Protect main branch
gh api repos/${input:repo}/branches/main/protection -X PUT --input - <<EOF
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["ci/test", "ci/lint"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismissal_restrictions": {},
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF
```

### Manage Webhooks

```bash
# List webhooks
gh api repos/${input:repo}/hooks --jq '.[] | {id, config.url, events}'

# Add webhook
gh api repos/${input:repo}/hooks -X POST -f url='https://example.com/webhook' -f events[]='push' -f events[]='pull_request'

# Delete webhook
gh api repos/${input:repo}/hooks/${webhookId} -X DELETE
```

### Update Repository Settings

```bash
# Update description, homepage, topics
gh api repos/${input:repo} -X PATCH \
  -f description='New description' \
  -f homepage='https://example.com' \
  -f topics[]='accessibility' \
  -f topics[]='wcag'

# Enable/disable features
gh api repos/${input:repo} -X PATCH \
  -F has_issues=true \
  -F has_projects=true \
  -F has_wiki=false
```

### Synchronize Labels

```bash
# Copy labels from template repo
gh label list --repo ${templateRepo} --json name,description,color | \
  gh label create --repo ${input:repo} --bulk
```

### Synchronize Milestones

```bash
# Copy milestones
gh api repos/${templateRepo}/milestones --jq '.[] | {title, description, due_on}' | \
  gh api repos/${input:repo}/milestones -X POST --input -
```

## Expected Output

- Confirmation of action taken
- Access audit report (if requested)
- Updated configuration summary
- Next steps or recommendations
