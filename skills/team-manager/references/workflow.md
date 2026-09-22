# Team Manager reference: Workflow

Part of the `team-manager` skill. Read this only when the task reaches these sections.

## Workflow

### Step 1: Identify User & Org Context

1. Call #tool:mcp_github_github_get_me to get the authenticated username.
2. Detect the current organization from the workspace repo's owner (e.g., `accesswatch` in `accesswatch/my-repo`).
3. **Load preferences** from `.github/agents/preferences.md` if available:
   - Read `teams.onboarding_teams` -- default teams to add new members to.
   - Read `teams.onboarding_repos` -- default repos to add new members to.
   - Read `teams.offboarding_checklist` -- any extra steps for departures.
   - Read `teams.role_policy` -- preferred default role (`member` or `maintainer`).
4. Fetch the list of teams in the org with #tool:mcp_github_github_get_teams.

### Step 2: Operation Modes

#### Mode A: Add Member to Team

**Flow:**

1. Identify the GitHub username and target team(s).
2. If team is ambiguous, list matching teams for selection.
3. Determine role: **Member** (default) or **Maintainer** (can manage team settings).
4. Check if user is already in the team.
5. **Preview:**

   ```text
   About to add @{username} to {org}/{team-name} as {role}.
   This grants them access to all repos this team can reach:
     - {repo-name} ({permission})
     - {repo-name} ({permission})
   Proceed? [Yes / Change role / Cancel]
   ```

6. Add on confirmation. Confirm: _"@{username} added to {team} as {role}."_

**Add to Multiple Teams:**

- Show a checklist of teams with current membership status.
- Single confirmation for all additions.
- Execute and report.

#### Mode B: Remove Member from Team

**Flow:**

1. Identify the GitHub username and target team(s).
2. Show the user's current teams and roles.
3. **Preview with warning:**

   ```text
    About to remove @{username} from {org}/{team-name}.
   This will revoke their inherited access to:
     - {repo-name} (unless they have direct collaborator access)
   Note: Direct repo collaborator access is NOT affected by this -- use @repo-admin to remove that separately.
   Proceed? [Yes / Cancel]
   ```

4. Remove on confirmation. Confirm with timestamp.

#### Mode C: Onboarding Workflow

When the user says "onboard @alice" or "set up @newdev":

**Onboarding Checklist:**

```text
Onboarding @{username} to {org}

Step 1: Org Membership
  [ ] Verify @{username} has a GitHub account
  [ ] Send org invitation (if not already a member)
  [ ] Wait for invitation acceptance

Step 2: Team Assignment
  [ ] Add to: {default_teams from preferences, e.g., "engineering", "all-contributors"}
  [ ] Role: Member (escalate to Maintainer only if team leadership)

Step 3: Repository Access
  [ ] Teams above grant access to: {list repos with permissions}
  [ ] Additional direct repo access (if needed beyond teams): {ask user}

Step 4: Verify
  [ ] Confirm @{username} can see the expected repos
  [ ] Point them to: CONTRIBUTING.md, SETUP.md, team docs

Step 5: Communication
  [ ] Post welcome comment / mention in onboarding issue (optional)
```

1. Walk through each step interactively.
2. For steps that require action, perform them after confirmation.
3. For steps that require information (which extra repos?), use #tool:ask_questions.
4. Save the completed checklist as a record.

#### Mode D: Offboarding Workflow

When the user says "offboard @alice" or "remove @alice from everything":

**Offboarding Checklist:**

```text
Offboarding @{username} from {org}

Step 1: Discover All Access
  Searching...
  Teams: {list all teams @username belongs to}
  Direct repo collaborator access: {list repos with direct grants}
  Open PRs authored: {count} -- needs attention
  Open issues assigned: {count} -- needs reassignment
  Pending reviews requested: {count} -- needs reassignment

Step 2: Remove Team Membership
  [ ] Remove from: team-a, team-b, team-c
  (This revokes inherited access to: {list repos})

Step 3: Remove Direct Collaborator Access
  [ ] Remove from: repo-a, repo-b (direct grants)

Step 4: Handle Open Work
  [ ] Reassign {N} open issues
  [ ] Reassign {N} pending reviews
  [ ] Note {N} open PRs (they'll stay open until closed/merged)

Step 5: Org Membership
  [ ] Remove from organization (optional -- removes all remaining access)
   This is irreversible without sending a new invitation.
```

1. Discover all access before doing anything.
2. Show the complete picture before removing anything.
3. **Single confirmation** to proceed with team and repo access removal.
4. **Separate confirmation** for org removal (more destructive).
5. Export the offboarding record.

**Safety:** Never auto-close or auto-reassign issues/PRs -- only report them and let the user act.

#### Mode E: List Team Members

**Flow:**

1. Fetch the team's members.
2. Display in a table: username, role, GitHub profile link, last GitHub activity (approximate).
3. Flag: teams with no maintainer, teams with only one member ("bus factor 1"), teams with members who haven't been active in 90+ days.
4. Offer: "Add member, remove member, or change a role?"

#### Mode F: List All Teams

**Flow:**

1. Fetch all teams in the org.
2. Show: team name, member count, repos count, maintainer(s), permission level.
3. Flag: empty teams (0 members), teams without a description, teams whose repos include very sensitive repos.
4. Offer drill-down into any team.

#### Mode G: Team Permission Report

**Flow:**

1. For a given team (or all teams), show every repo the team can access and the permission level.
2. Cross-reference: are any repos missing from this team that should be there?
3. Cross-reference: does this team have access to repos it shouldn't?
4. Save the report as a workspace document.

**Report Format:**

```markdown
# Team Permission Report -- {org} -- {date}

## Teams Overview

| Team | Members | Repos | Maintainer | Notes |
|------|---------|-------|------------|-------|
| engineering | 8 | 12 | @alice | |
| frontend | 4 | 5 | @bob | |
| infra | 2 | 8 | None |  No maintainer |

## Per-Team Access

### engineering (8 members)

| Repository | Permission | Notes |
|------------|------------|-------|
| main-app | Write | |
| infra-config | Read | Consider: should eng have write? |
| billing-service | Write | |
```

---
