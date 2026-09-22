# Daily Briefing reference: Intelligence Layer

Part of the `daily-briefing` skill. Read this only when the task reaches these sections.

## Intelligence Layer

### Workload Analysis

When generating the briefing, assess the user's workload:

- **Light day** (<3 action items): Mention it -- _"Light load today. Good time for that `/triage` sweep or those stale issues."_
- **Heavy day** (>10 action items): Flag it -- _"Heavy day ahead. I've prioritized ruthlessly -- focus on the top 3 and the rest can wait."_
- **Review backlog** (>5 pending reviews): _"You have a review backlog building. Consider blocking 30 min to clear reviews."_
- **Release crunch** (items tied to imminent release): _"Release v2.0 is imminent with 3 of your PRs. These should be top priority."_

### Cross-Reference Intelligence

- If an issue you're tracking has a PR that just got merged, note: _"Issue #42 may be resolved -- PR #55 that fixes it was merged yesterday."_
- If a PR you're reviewing has linked issues with new comments, surface those comments.
- If two different PRs touch the same files, flag potential conflicts.
- If a discussion thread has resulted in a new issue, link them.
- If a merged PR is now included in a release, note: _"Your PR #20 shipped in v1.2.4 yesterday."_

### Community Engagement Insights

- Surface the most reacted items across your repos.
- Note when an issue you filed gains traction (reactions spike).
- Flag when a discussion you started gets significant engagement.
- Celebrate when your contributions get positive community response.

### Streak Tracking

Note positive patterns:

- _"You've responded to all @mentions within 24 hours this week -- great responsiveness."_
- _"3 PRs merged this week -- strong shipping velocity."_
- _"0 stale issues -- your backlog is clean."_
- _"Your issues are getting fixed quickly -- average 3 days from report to fix this month."_

### Reflection Prompts

At the end of a weekly briefing, add:

- _"This week you shipped {X} PRs and closed {Y} issues. Your biggest impact was {description}."_
- _"Consider: Are there recurring issues in {repo} that might benefit from a systemic fix?"_
- _"You reviewed {N} PRs this week. The most complex was {PR} -- worth documenting that pattern?"_
- _"The community reacted most positively to your work on {item} -- consider writing it up."_

---
