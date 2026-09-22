# Insiders Accessibility Tracker reference: Tracked Repositories

Part of the `insiders-a11y-tracker` skill. Read this only when the task reaches these sections.

## Tracked Repositories

Read `accessibility_tracking.repos` from preferences. If not configured, use the default:

| Repo | Label Filters | Purpose |
|------|--------------|---------|
| `microsoft/vscode` (default) | `accessibility` + `insiders-released` | Insiders builds |
| `microsoft/vscode` (default) | `accessibility` + milestone closed | Stable releases |
| User-configured repos | Per-repo label config | Custom a11y tracking |

Users may add additional repos (e.g., their own projects with accessibility labels). Each tracked repo can specify:

- Its own accessibility label name (e.g., `a11y`, `accessibility`, `wcag`)
- Its own insiders/release label (or none)
- Whether to use milestone-based or date-based filtering
- Which channels to track (insiders, stable, or both)

---

## Search Patterns

For each tracked repo, construct search queries using that repo's configured labels.

### Configurable Query Templates

**Insiders channel** (when `channels.insiders: true`):

```text
repo:{TRACKED_REPO} is:closed label:{a11y_label} label:{insiders_label} milestone:"{Month} {Year}"
```

**Stable channel** (when `channels.stable: true`):

```text
repo:{TRACKED_REPO} is:closed label:{a11y_label} milestone:"{Month} {Year}" -label:{insiders_label}
```

**All accessibility** (both channels):

```text
repo:{TRACKED_REPO} is:closed label:{a11y_label} milestone:"{Month} {Year}"
```

### Default Queries (when no preferences configured)

```text
repo:microsoft/vscode is:closed label:accessibility label:insiders-released milestone:"{Month} {Year}"
repo:microsoft/vscode is:closed label:accessibility milestone:"{Month} {Year}" -label:insiders-released
repo:microsoft/vscode is:closed label:accessibility milestone:"{Month} {Year}"
```

### Date-Specific

Add `closed:YYYY-MM-DD` for specific dates, `closed:>YYYY-MM-DD` for ranges.

### Cross-Repository Discovery

In addition to the configured tracked repos, also search for accessibility work across ALL repos the user has access to:

- `user:USERNAME is:closed label:accessibility` -- discover a11y work in the user's own repos
- `org:ORGNAME is:closed label:accessibility` -- discover a11y work across the user's organizations

This ensures no accessibility improvements go unnoticed, even in repos not explicitly configured.

Always adjust the milestone to match the current month/year or the timeframe the user is asking about.

### CI Scanner Issue Discovery

In addition to label-based searches, check each tracked repo for issues created by CI accessibility scanners:

**GitHub Accessibility Scanner issues:**

```text
repo:{TRACKED_REPO} is:issue label:accessibility author:app/github-actions
```

**Lighthouse CI accessibility regressions:**
Search for issues or PR comments referencing Lighthouse accessibility score drops:

```text
repo:{TRACKED_REPO} is:issue "lighthouse" "accessibility" "score"
```

When scanner issues are found:

- Note whether they are assigned to Copilot for automated fixes.
- Track the Copilot fix PR lifecycle (pending, open, approved, merged, rejected).
- Include scanner-originated issues in the category breakdown alongside human-filed issues.
- Tag scanner issues with `[CI Scanner]` in reports to distinguish them from manual findings.

---

## Capabilities

### 1. Quick Updates (Chat)

When the user asks "what's new" or "latest a11y changes":

1. Search with #tool:mcp_github_github_search_issues using the Insiders pattern for the current milestone.
2. Also search Stable if the user asks for "all" or "both channels."
3. Present results as a categorized list:

```markdown
** {count} Accessibility Updates - {Month} {Year}**

###  Insiders ({count})

**Screen Reader**
- **{Title}** ([#{number}]({url})) - {one-line impact summary}

**Keyboard Navigation**
- **{Title}** ([#{number}]({url})) - {one-line impact summary}

**Visual / Contrast**
- **{Title}** ([#{number}]({url})) - {one-line impact summary}

**Other**
- **{Title}** ([#{number}]({url})) - {one-line impact summary}

###  Stable ({count})
{same format}
```

**Categories** - classify each issue into one of:

- **Screen Reader** - ARIA, announcements, narration, TalkBack, VoiceOver, NVDA, JAWS
- **Keyboard Navigation** - focus management, tab order, keyboard shortcuts, key bindings
- **Visual / Contrast** - high contrast, forced colors, color tokens, zoom/reflow, font size
- **Audio / Motion** - sound cues, reduced motion, animations
- **Cognitive** - simplification, clearer labels, better error messages
- **Other** - anything that doesn't fit above

### 2. Deep Dive into a Specific Change

When the user asks about a specific issue:

1. Use #tool:mcp_github_github_issue_read to get full details.
2. Present: title, description, linked PRs, the actual code changes (if discoverable from PR references), user impact, and which build it's available in.
3. Explain the impact in plain language: _"Before this change, screen reader users couldn't navigate the minimap. Now, the minimap is fully keyboard-accessible and announces its content."_

### 3. Feature Tracking

When the user asks "has X been fixed" or "is there a11y support for Y":

1. Search with keywords + accessibility label.
2. Report status: **Fixed (Insiders)**, **Fixed (Stable)**, **In Progress**, **Not Found**.
3. If not found, suggest filing an issue.

### 4. Monthly / Weekly Reports

When asked for a report:

1. Gather all accessibility issues for the requested period.
2. Categorize them.
3. Generate a workspace document.

### 5. Workspace Report Document

Generate reports at: `.github/reviews/accessibility/a11y-report-{YYYY-MM}.md`

````markdown
#  VS Code Accessibility Report - {Month} {Year}

> Generated on {date} by VS Code Accessibility Tracker
> Repositories: microsoft/vscode
> Milestone: {milestone}

##  Summary

| Channel | Count | Categories |
|---------|-------|-----------|
|  Insiders | {count} | {top categories} |
|  Stable | {count} | {top categories} |
| **Total** | **{count}** | |

##  Insiders Releases

### Screen Reader ({count})

- **{Title}** ([#{number}]({url}))
  - **Impact:** {What changed for the user}
  - **Closed:** {date} | **Milestone:** {milestone}

### Keyboard Navigation ({count})

- **{Title}** ([#{number}]({url}))
  - **Impact:** {What changed for the user}
  - **Closed:** {date} | **Milestone:** {milestone}

### Visual / Contrast ({count})

{same format}

### Audio / Motion ({count})

{same format}

### Cognitive ({count})

{same format}

### Other ({count})

{same format}

##  Stable Releases

{same categorized format}

##  Trends

- **Most active area this month:** {category with most fixes}
- **Compared to last month:** {more/fewer} accessibility fixes ({count} vs {count})
- **Notable:** {any particularly impactful changes}

##  Useful Links

- [VS Code Accessibility Docs](https://code.visualstudio.com/docs/editor/accessibility)
- [File an Accessibility Issue](https://github.com/microsoft/vscode/issues/new?labels=accessibility)
- [All Open Accessibility Issues](https://github.com/microsoft/vscode/labels/accessibility)

##  Notes

<!-- Add your notes, team shares, or follow-up actions here -->

````

---
