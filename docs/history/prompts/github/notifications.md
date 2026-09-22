# notifications

> **Historical.** This document describes the repository as it was before
> version 7.0, when agents lived in six per-client directories. It is kept
> for the record and is not maintained. The current layout is one `skills/`
> directory; start at [the documentation index](../README.md).
> Original path: `docs/prompts/github/notifications.md`.

View and manage your GitHub notifications from chat - filter by reason, repo, or priority level, then mark as read, done, or unsubscribe in bulk.

## When to Use It

- Clearing your notifications inbox without leaving the editor
- Finding notifications that specifically @mention you
- Unsubscribing from noisy threads you no longer need to follow
- Prioritizing which notifications need a reply vs. just acknowledgment

## How to Launch It

**In GitHub Copilot Chat:**

```text
/notifications
```

With filters:

```text
/notifications unread
/notifications owner/repo
/notifications @mentions only
/notifications mark all read
```

## What to Expect

1. **Fetch notifications** - Retrieves your GitHub notifications with reason, repo, and timestamp
2. **Apply filters** - Filters by unread, repo, reason, or priority preferences from `preferences.md`
3. **Display in chat** - Grouped by reason with recommended actions
4. **Execute actions** - Mark as read, done, or unsubscribe on command

### Filter Views

Each filter, with what is shown.

| Filter | What is shown |
|--------|--------------|
| (none) | All unread + recently read |
| `unread` | Unread notifications only |
| `@mentions` | Where you were directly @mentioned |
| `assigned` | Issues/PRs assigned to you |
| `review-requested` | PRs waiting on your review |
| `subscribed` | Threads you are watching |
| `owner/repo` | Only notifications from that repo |

### Notification Reasons

Each reason, with what triggered it.

| Reason | What triggered it |
|--------|--------------------|
| mention | You were @mentioned |
| assign | You were assigned |
| review\_requested | Your PR review was requested |
| subscribed | You are watching this thread |
| comment | New comment on a thread you are in |
| push | New commits pushed to a branch you watch |

### Bulk Actions

Each action, with its command.

| Action | Command |
|--------|---------|
| Mark all read | `mark all read` |
| Mark as done | `mark done owner/repo` |
| Unsubscribe | `unsubscribe owner/repo#123` |
| Unsubscribe all from repo | `unsubscribe all owner/repo` |

### Priority from Preferences

If `.github/agents/preferences.md` defines muted repos or priority keywords, the agent applies those filters automatically to surface what matters most first.

## Example Variations

```text
/notifications                             # All unread
/notifications @mentions only             # Only direct mentions
/notifications owner/repo                 # One repo
/notifications mark all read              # Clear inbox
/notifications unsubscribe owner/repo#123 # Stop watching one thread
```

## Connected Agents

Each agent, with its role.

| Agent | Role |
|-------|------|
| daily-briefing agent | Executes this prompt |

## Related Prompts

- [daily-briefing](./daily-briefing.md) - full briefing that includes notification highlights
- [my-issues](./my-issues.md) - issues assigned to or @mentioning you
- [my-prs](./my-prs.md) - PR review requests
