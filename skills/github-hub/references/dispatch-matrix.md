# Dispatch matrix: github-hub

Generated from skill frontmatter by `scripts/build-dispatch-matrices.mjs`.
Do not edit by hand; change a skill's `metadata.domain` instead.

Every skill this router can dispatch. They are invisible to the model by
design, so this file is the only place they are named. Dispatch by the
prompt shape in SKILL.md, never by pasting a body.

## Specialists

The 16 reviewing skills in these domains, with the task each one answers.
Each returns findings JSON; none of them edits files.

| Skill | Use it for |
|---|---|
| `actions-manager` | GitHub Actions: workflow runs, logs, re-runs and CI failure triage. |
| `analytics` | GitHub metrics: velocity, review turnaround, churn and bottlenecks. |
| `contributions-hub` | GitHub community: discussions, moderation, contributor health, CLAs. |
| `daily-briefing` | Daily GitHub briefing: issues, PRs, reviews, releases and discussions. |
| `insiders-a11y-tracker` | Track accessibility changes in VS Code and other repos you follow. |
| `issue-tracker` | GitHub issues: find, triage, review and respond, with written reports. |
| `notifications-manager` | GitHub notifications: read, filter, triage and manage from the editor. |
| `pr-review` | Review pull requests: diffs, comments, context and written review docs. |
| `projects-manager` | GitHub Projects v2: boards, views, fields, iterations, item workflows. |
| `release-manager` | GitHub releases: create, edit and manage releases and their assets. |
| `repo-admin` | Repo admin: collaborators, branch protection, webhooks and labels. |
| `repo-manager` | Scaffold a repo: templates, contributing guides, CI, labels, licenses. |
| `security-dashboard` | Triage Dependabot, code scanning and secret scanning alerts. |
| `team-manager` | GitHub org teams: create, staff, onboard, offboard and audit access. |
| `template-builder` | Build GitHub issue, PR and discussion templates from a guided wizard. |
| `wiki-manager` | GitHub wikis: create, edit, organize and search pages from the editor. |

## Outside this router

Hand off rather than improvise when the task leaves these domains:

- `accessibility-lead` - web, cross-cutting
- `web-accessibility-wizard` - web, cross-cutting
- `document-accessibility-wizard` - documents
- `markdown-a11y-assistant` - markdown
- `developer-hub` - developer, desktop
