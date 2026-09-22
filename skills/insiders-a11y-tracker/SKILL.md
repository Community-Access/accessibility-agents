---
name: insiders-a11y-tracker
description: Track accessibility changes in VS Code and other repos you follow.
license: MIT
disable-model-invocation: true
metadata:
  tier: specialist
  domain: github
  output: report
  effort: medium
  title: Insiders Accessibility Tracker
---
## Configuration

Load accessibility tracking configuration from `.github/agents/preferences.md` under the `accessibility_tracking` section. If no configuration is found, use the defaults below.

### Defaults

- **Primary tracked repo:** `microsoft/vscode`
- **Labels:** `accessibility`, `insiders-released`
- **Channels:** Insiders and Stable
- **WCAG cross-referencing:** enabled
- **ARIA pattern mapping:** enabled
- **Briefing limit:** 10 items

Users can override these defaults in `preferences.md` to track accessibility in any repository. Each tracked repo can specify its own label names and channel configuration. See `preferences.example.md` for the full configuration reference.

---

## Response Guidelines

- **Lead with the title/description**, then issue number and details - never lead with a number.
- Always include clickable GitHub URLs.
- Group by category, not chronologically.
- Use bullet lists for quick updates, not tables (tables are for reports).
- When no results are found, clearly state this, check the milestone name, and suggest alternative timeframes.
- Format dates consistently: "February 11, 2026".
- Explain user impact in plain language - don't just repeat the issue title.

## Context Awareness

- Current date awareness: Use to determine the correct milestone format (e.g., "February 2026").
- If the user says "this month" -> use current month's milestone.
- If the user says "last month" -> use previous month's milestone.
- If the user says "today" -> add `closed:YYYY-MM-DD` for today's date.
- If the user says "this week" -> add `closed:>YYYY-MM-DD` for 7 days ago.

## Multi-Repo Support

When the user says "track owner/repo" or asks about accessibility in a specific repo:

1. Add that repo to the session's tracked repos list.
2. Search that repo using its own label conventions (discover labels by listing repo labels first if needed).
3. Include results from all tracked repos in reports, clearly separated by repo.
4. Suggest the user add the repo to `preferences.md` for persistent tracking.

When generating reports, always include a section for each tracked repo. The default `microsoft/vscode` tracking should always run unless the user explicitly excludes it.

---

## Progress Announcements

Narrate every collection step. Never mention tool names:

```text
 Scanning accessibility issues in microsoft/vscode (Insiders milestone)...
 Scanning accessibility issues in microsoft/vscode (Stable milestone)...
 Checking custom tracked repos...
 Accessibility report ready - {N} issues tracked, {M} updates since last report.
```

---

## Confidence Levels

Apply to every categorized finding:

| Level | When to Use |
|-------|-------------|
| **High** | Issue confirmed in target milestone, title and labels match accessibility category |
| **Medium** | Issue likely accessibility-related; category inferred from description |
| **Low** | Possible edge case; include but flag for human review |

---

## Delta Tracking

Compare every report against the previous one:

| Status | Definition |
|--------|------------|
|  Fixed | Was tracked; issue closed |
|  New | Not in previous report |
|  Persistent | Still open, unchanged |
|  Regressed | Was fixed; reopened or re-filed |

Escalation: if a finding is **Persistent for 3+ consecutive reports**, add:
> **Escalation:** This accessibility issue has been open for {N} consecutive reports. It may warrant a community nudge or workaround documentation.

---

## Behavioral Rules

1. **Check workspace context first.** Look for scan config files (`.a11y-*-config.json`) and previous audit reports in the workspace root.
2. **Narrate collection** with / announcements for each repo scan stream - run streams in parallel.
3. **Delta-check every report.** Compare against the previous report before presenting results.
4. **Confidence on every issue.** Every categorized finding includes a High/Medium/Low confidence tag.
5. **Escalate persistent issues.** Issues Persistent for 3+ reports get a visible escalation callout.
6. **Multi-repo parallel scanning.** Run all tracked repos simultaneously - announce each as it completes.
7. **WCAG mapping required.** Every finding maps to at least one WCAG 2.2 success criterion.
8. **User impact in plain language.** Never just repeat the issue title; explain what the accessibility barrier is.
9. **Group by category, not repo.** In cross-repo reports, group by accessibility type (focus, contrast, screen reader, etc.).
10. **Never post to GitHub without confirmation.** Commenting on VS Code issues requires explicit approval.
11. **Preserve date-stamped reports.** Never overwrite a previous report - always create a new dated file and offer delta comparison.
12. **Dual output always.** Every report saved as both `.md` and `.html`.
13. **Include CI scanner data.** When a tracked repo has the GitHub Accessibility Scanner or Lighthouse CI configured, include scanner-originated findings in reports alongside human-filed issues. Tag them with `[CI Scanner]` or `[Lighthouse]` to distinguish their source.
14. **Track Copilot fix lifecycle.** For scanner issues assigned to Copilot, report fix PR status (pending, open, merged, rejected) in every report cycle.

---

## Reference files

Read one only when the task reaches it. Do not read them all up front.

- `references/accessibility-tracker.md` - Accessibility Tracker
- `references/tracked-repositories.md` - Tracked Repositories, Search Patterns, Capabilities
- `references/vs-code-1-113-features-for-accessibility.md` - VS Code 1.113 Features for Accessibility

## Output contract

Collect findings as JSON from each specialist you dispatch, write them to
`.a11y-history/<timestamp>/`, then render the report with
`node skills/a11y-core/scripts/render-report.mjs`. Do not type the report by hand.

Shared rules, dispatch contract and schemas: `skills/a11y-core/SKILL.md`.
Authoritative specifications for this skill: `skills/a11y-core/references/sources.md`.
