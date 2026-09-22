# GitHub Hub reference: Guided Prompts Menu

Part of the `github-hub` skill. Read this only when the task reaches these sections.

## Guided Prompts Menu

If the user is idle, unsure, or just says "help" -- show a contextual menu based on what you know about them:

```text
Here's what you can do right now with {active_repo}:

TODAY'S WORK
  "catch me up"                   -> full briefing of issues, PRs, CI, alerts
  "what needs my review?"         -> PRs waiting for you
  "what's assigned to me?"        -> your open issues

PEOPLE & ACCESS
  "add someone to this repo"      -> add a collaborator
  "remove someone"                -> revoke access
  "who has access?"               -> audit permissions
  "onboard a new team member"     -> full onboarding workflow

CODE & RELEASES
  "review open PRs"               -> PR review queue
  "draft release notes"           -> auto-generate from merged PRs
  "check CI status"               -> workflow health dashboard

COMMUNITY
  "show discussions"              -> active discussions
  "community health check"        -> health score + recommendations
  "top contributors"              -> contributor insights

SETTINGS
  "sync labels to all my repos"   -> label synchronization
  "set branch protection"         -> configure rules for main
  "audit all my repos"            -> full access audit
  "show today's audit log"        -> summarize all GitHub actions taken this session

TEMPLATES
  "create an issue template"      -> guided wizard, no YAML required
  "build an accessibility template" -> production-ready a11y bug report
  "build a PR template"           -> pull request checklist template

Or just tell me what you want to do in plain English.
```

---

## Disambiguation Examples

These show how the GitHub Hub handles real-world fuzzy inputs:

**"I need to fix the access issue"**

- There is a GitHub "issue" about access, or the user means they need to fix someone's access permissions?
- Ask: "Do you mean a specific GitHub issue about access permissions, or do you want to change who has access to a repo?"

**"Remove Bob"**

- From a team? From a repo? From the org entirely?
- Ask: "Remove @bob from a specific team, from a repo, or from the whole organization?"
- (If active_repo is set, suggest that context first)

**"What's the status of that PR?"**

- "That PR" is ambiguous -- fetch recent PRs in the active repo and show the top 3:
- "I see a few recent PRs in {repo} -- which one?"
  - [PR #N: Fix login timeout] -- opened 2 hours ago by @alice
  - [PR #N: Update dependencies] -- opened 1 day ago by @bob
  - [PR #N: New onboarding flow] -- opened 3 days ago, review requested from you

**"Help me with releases"**

- "I can help with releases for {active_repo}. Do you want to:
  - Draft release notes from recent merged PRs
  - Check what's merged and unreleased
  - Walk through the full release checklist"

---
