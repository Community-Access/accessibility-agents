---
name: manage-teams
description: GitHub organization team command center. Create/manage teams, add/remove members, onboarding/offboarding workflows, synchronize access, team composition reports.
mode: agent
agent: team-manager
tools:
  - askQuestions
  - runInTerminal
  - getTerminalOutput
  - createFile
---

# Team Manager

GitHub organization team management - create teams, manage members, handle onboarding/offboarding, synchronize access.

## Organization

**Organization:** `${input:org}`

## What to Manage?

**Action:** `${input:action}` (e.g., "create team", "add member", "onboard developer", "offboard", "sync access", "team report")

## Instructions

### Create Team

```bash
gh api orgs/${input:org}/teams -X POST \
  -f name='${teamName}' \
  -f description='${description}' \
  -f privacy='${privacy}' # "secret" or "closed"
```

### Add Team Member

```bash
gh api orgs/${input:org}/teams/${teamSlug}/memberships/${username} -X PUT \
  -f role='${role}' # "member" or "maintainer"
```

### Remove Team Member

```bash
gh api orgs/${input:org}/teams/${teamSlug}/memberships/${username} -X DELETE
```

### Grant Team Access to Repo

```bash
gh api orgs/${input:org}/teams/${teamSlug}/repos/${owner}/${repo} -X PUT \
  -f permission='${permission}' # pull, push, admin, maintain, triage
```

### Onboard Developer Workflow

```bash
# Step 1: Add to organization
gh api orgs/${input:org}/memberships/${username} -X PUT --input - <<EOF
{
  "role": "member"
}
EOF

# Step 2: Add to teams
gh api orgs/${input:org}/teams/frontend/memberships/${username} -X PUT -f role='member'
gh api orgs/${input:org}/teams/contributors/memberships/${username} -X PUT -f role='member'

# Step 3: Grant repo access via team
# (inherited from team membership)

# Step 4: Send welcome message
echo "Welcome ${username}! You've been added to teams: frontend, contributors"
```

### Offboard Developer Workflow

```bash
# Step 1: List user's teams
gh api users/${username}/teams --jq '.[] | select(.organization.login == "${input:org}") | .slug'

# Step 2: Remove from all teams
for team in $(gh api users/${username}/teams --jq -r '.[] | select(.organization.login == "${input:org}") | .slug'); do
  gh api orgs/${input:org}/teams/$team/memberships/${username} -X DELETE
done

# Step 3: Remove organization membership
gh api orgs/${input:org}/memberships/${username} -X DELETE

# Step 4: Audit any remaining access
echo "Removed ${username} from all teams and organization"
```

### Synchronize Team Access Across Repos

```bash
# Apply team access to multiple repos
for repo in repo1 repo2 repo3; do
  gh api orgs/${input:org}/teams/${teamSlug}/repos/${input:org}/$repo -X PUT -f permission='push'
done
```

### Team Composition Report

```bash
# List all teams
gh api orgs/${input:org}/teams --jq '.[] | {name, slug, members_count}'

# For each team, list members
for team in $(gh api orgs/${input:org}/teams --jq -r '.[].slug'); do
  echo "Team: $team"
  gh api orgs/${input:org}/teams/$team/members --jq '.[].login'
done
```

### Audit Team Access

```bash
# For each repo, list teams with access
gh api orgs/${input:org}/repos/${repo}/teams --jq '.[] | {name, permission}'
```

## Expected Output

- Confirmation of action taken
- Team composition report (if requested)
- Access audit summary
- Onboarding/offboarding checklist completed
