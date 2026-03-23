# notifications-manager - Notification Inbox Management

> GitHub notifications command center -- read, filter, triage, and manage notifications entirely from the editor. Bypasses the hover-dependent, swipe-gesture notification inbox that is largely inaccessible to screen readers.

---

## What This Agent Is For

GitHub's notification inbox relies on hover-to-reveal action buttons, swipe gestures on mobile, and tiny icon controls that are announced as unlabeled buttons by screen readers. Filtering by reason, repository, or type requires navigating a sidebar that is difficult to discover and operate without a mouse.

The notifications-manager turns your notification inbox into a structured, text-based interface. Every notification can be listed, filtered, read, marked as done, or unsubscribed from through plain-text commands. The agent also manages your watching and starring preferences so you control what generates notifications in the first place.

Use notifications-manager when:

- You want to read and triage your GitHub notifications without the web UI
- You need to filter notifications by repository, reason, or type (issue, PR, release)
- You want to mark notifications as read or done in bulk
- You need to unsubscribe from a noisy thread
- You want to manage which repositories you are watching or starring
- You want a morning summary of what happened overnight

---

## How to Launch It

### GitHub Copilot (VS Code)

```text
@notifications-manager show my unread notifications
@notifications-manager filter notifications for this repo
@notifications-manager mark all as read
@notifications-manager unsubscribe from thread 12345
@notifications-manager what repos am I watching?
```

### Claude Code (Terminal)

```bash
/notifications-manager show unread
/notifications-manager filter by repo
/notifications-manager mark all read
/notifications-manager list watched repos
```

### Via GitHub Hub

```text
@github-hub show my notifications
@github-hub mark notifications as read
```

---

## Capabilities

<details>
<summary>Expand full capability reference</summary>

| Category | What it does | API |
|----------|-------------|-----|
| **List notifications** | Show all or unread notifications with title, repo, reason, and timestamp | REST API notifications |
| **Filter notifications** | Filter by repository, reason (mention, review_requested, assign, subscribed), or participation | Query parameters |
| **Read notification** | Fetch the underlying issue, PR, or discussion for a notification | REST API thread subject |
| **Mark as read** | Mark individual notifications or all notifications as read | REST API mark-read endpoint |
| **Mark as done** | Remove notifications from the inbox entirely | REST API mark-done endpoint |
| **Unsubscribe** | Unsubscribe from a specific thread to stop future notifications | REST API subscription endpoint |
| **Watching** | List, watch, or unwatch repositories to control notification flow | REST API watching endpoint |
| **Starring** | List, star, or unstar repositories | REST API starring endpoint |
| **Notification summary** | Aggregate unread counts by repo, reason, and type for a quick overview | Combined queries |
| **Bulk operations** | Mark as read or done across multiple notifications matching a filter | Batched API calls |

</details>

---

## What to Expect - Step by Step

### Morning Notification Triage

1. **Inbox overview:**

   ```text
    Unread notifications: 24
    By reason: mention (5), review_requested (3), assign (2), subscribed (14)
    By repo: acme/backend (10), acme/frontend (8), acme/docs (6)
   ```

2. **Priority filtering.** The agent shows mentions and review requests first, since these usually require action. Subscribed notifications (watching) are shown last.

3. **Thread reading.** For each notification, the agent fetches the underlying issue or PR title, latest comment, and status. You see context without opening a browser.

4. **Action.** For each notification, you decide: read and act on it, mark as done, or unsubscribe from the thread.

5. **Bulk cleanup.** After triage, the agent can mark all remaining subscribed notifications as read in one command.

### Managing Watch Settings

1. The agent lists all repositories you are currently watching
2. You can filter by organization to find noisy repos
3. Unwatch repositories you no longer need notifications from
4. The agent confirms each change and shows updated watch status

### Unsubscribing from a Thread

1. You identify the noisy thread by notification title or number
2. The agent shows the thread details for confirmation
3. On approval, the agent unsubscribes you from future updates on that thread
4. The notification is marked as done

---

## Handoffs

<details>
<summary>Expand agent connections</summary>

| Handoff | When | Agent |
|---------|------|-------|
| Route from hub | "check my notifications" or "what happened overnight" | [github-hub](github-hub.md) |
| Issue follow-up | After reading a notification about an issue, triage it | [issue-tracker](issue-tracker.md) |
| PR review | After reading a review request notification, start the review | [pr-review](pr-review.md) |

</details>

---

## Related Agents

| Agent | Relationship |
|-------|-------------|
| [github-hub](github-hub.md) | Parent router -- delegates notification commands here |
| [issue-tracker](issue-tracker.md) | Follows up on issue notifications |
| [pr-review](pr-review.md) | Handles review-requested notifications |
| [daily-briefing](daily-briefing.md) | Provides a broader morning overview including notifications |
| [analytics](analytics.md) | Tracks notification volume as a contributor engagement metric |

---

## Troubleshooting

<details>
<summary>Show troubleshooting help</summary>

**"No notifications found."**
Your notification inbox may be empty, or your token may lack the `notifications` scope. Check with `gh auth status`.

**"I keep getting notifications from a repo I do not contribute to."**
You are probably watching it. Ask: "what repos am I watching?" then unwatch the noisy ones.

**"Mark all as read did not work for some notifications."**
Some notification types (security advisories, GitHub Actions failures) may re-appear if the underlying condition persists. Address the root cause or unsubscribe from the thread.

**"I want notifications only for mentions, not all activity."**
Change your watch setting for the repository from "All Activity" to "Participating and @mentions." Ask: "set watching to participating for acme/backend."

</details>
