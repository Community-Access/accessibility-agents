# nexus — Auto-Routing GitHub Orchestrator

> Auto-routing GitHub orchestrator — describe what you need and Nexus silently routes to the right specialist agent. Unlike GitHub Hub (which presents a menu), Nexus infers your intent from plain English and hands off immediately. Best for experienced users who know what they want.

---

## What This Agent Is For

Nexus serves the same purpose as GitHub Hub — routing you to the right GitHub specialist — but with a different interaction style. Where GitHub Hub presents menus and guides you step-by-step, Nexus infers your intent from natural language and hands off immediately without asking clarifying questions unless strictly necessary.

Use Nexus when:

- You know what you want and want to get there fast
- You prefer direct action over guided menus
- You want to issue commands in plain English without picking from lists
- You want the fastest possible path to the right specialist

Use **GitHub Hub** instead when:

- You are not sure what you need
- You want to explore options
- You are new to the GitHub Workflow team

---

## How to Launch It

### GitHub Copilot (VS Code)

```text
@nexus what should I work on?
@nexus review the PR from this morning
@nexus show security alerts for my-repo
@nexus help me manage team access
```

### Claude Code

```text
/nexus show me my open PRs
```

---

## How It Works

1. Nexus receives your plain English request
2. It silently analyzes intent — no confirmation menu
3. It routes immediately to the matching specialist with full context
4. The specialist takes over and completes your task

---

## Available Specialists

Nexus can route to any GitHub Workflow team agent:

| Specialist | Routed When |
|-----------|-------------|
| [daily-briefing](./daily-briefing.md) | "what should I work on?", "morning update" |
| [issue-tracker](./issue-tracker.md) | Issues, triage, labels, assignment |
| [pr-review](./pr-review.md) | PR review, diffs, merge decisions |
| [analytics](./analytics.md) | Repo health, velocity, metrics |
| [insiders-a11y-tracker](./insiders-a11y-tracker.md) | VS Code Insiders accessibility tracking |
| [repo-admin](./repo-admin.md) | Collaborators, branch protection |
| [team-manager](./team-manager.md) | Org teams, membership |
| [contributions-hub](./contributions-hub.md) | Community health, contributor activity |
| [template-builder](./template-builder.md) | Issue/PR templates |
| [repo-manager](./repo-manager.md) | Repo setup, labels, CI |
| [projects-manager](./projects-manager.md) | GitHub Projects v2 boards |
| [actions-manager](./actions-manager.md) | Actions workflow runs, logs |
| [security-dashboard](./security-dashboard.md) | Dependabot, code scanning alerts |
| [release-manager](./release-manager.md) | Releases, tags, assets |
| [notifications-manager](./notifications-manager.md) | Notification inbox |
| [wiki-manager](./wiki-manager.md) | Wiki pages |

## Nexus vs GitHub Hub

Each feature, with its nexus and GitHub hub.

| Feature | Nexus | GitHub Hub |
|---------|-------|------------|
| Interaction style | Silent auto-routing | Guided menu |
| Clarifying questions | Minimal | Frequent |
| Best for | Experienced users | New users |
| Speed | Fastest | Thorough |

## Related

- [github-hub](./github-hub.md) — The guided, menu-driven GitHub orchestrator
- [daily-briefing](./daily-briefing.md) — Morning overview of issues, PRs, CI status
