# Community action 5: Publish accessibility progress updates

Part of the `osaf-community` skill. Read this when action 5 is in scope.

- ID: `publish-accessibility-progress-updates`
- Effort and cadence: Moderate; Ongoing
- Canonical source: [Community phase, action 5](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/blob/b2ea31a2e38cbab3e774e4142575b78876b9b53f/framework/phases/community-phase.md#5-publish-accessibility-progress-updates)

## Why it matters

Public progress updates build trust and accountability by showing that
accessibility reports lead to action, highlighting work that still needs
attention, and reducing duplicated effort.

## Definition of Done

1. Accessibility progress is published through at least one public project
   channel.
2. Updates include completed work, remaining work, known barriers or
   limitations, and relevant links.
3. The project maintains a repeatable update practice.

## Recommended steps, adapted from the framework

1. Identify appropriate public channels, such as issues, release notes, project
   discussions, roadmap updates, newsletters, or community meetings.
2. Share completed accessibility improvements, open work, available
   workarounds, and lessons learned since the previous update.
3. Link updates to relevant accessibility issues, pull requests, discussions, or
   documentation.
4. Publish updates on a predictable cadence or at meaningful project
   milestones.

## How to do it in this repository

1. **Gather since the last update** (or the last release): accessibility issues
   opened and closed, merged pull requests with the accessibility label, audit
   results and their trend if `.a11y-history/` exists, and the "Known
   limitations" in `ACCESSIBILITY.md`.
2. **Draft the update** with the template below. Report counts as counts, not
   as a score or grade; a score from an audit is not an accessibility rating
   for the project.
3. **Choose the channel and cadence** with the maintainer: every release is the
   simplest repeatable practice. Record the choice in `ACCESSIBILITY.md` so it
   survives a change of maintainer.
4. **The framework tracking issue is a channel too.** Checking actions there
   is public progress; the reference skill describes how. Do not edit the
   tracking issue yourself.

## Hand-offs

- `analytics` - issue resolution metrics for the accessibility label: time to
  close, opened and closed counts, label distribution, for the period.
- `issue-tracker` - the list of open and closed accessibility issues with
  links.
- `release-manager` - add the update to a draft release's notes.
- `contributions-hub` - post it as a discussion, once approved.

The MCP tool `get_audit_trend` reports the score history for one audit target,
which can show direction over time.

## Template: accessibility progress update

```markdown
## Accessibility progress, <period or release>

### Completed

- <improvement, in terms of what users can now do> (#<pr>)

### In progress and open

- <barrier still open, its severity, and the workaround> (#<issue>)

### Known limitations

See [Known limitations](<link to ACCESSIBILITY.md section>).

### Lessons learned

- <one or two sentences, optional>

### How to help

Issues labeled [accessibility](<label search link>); report a barrier with the
[accessibility issue form](<form link>).
```

## Evidence to report

- The draft, and where and when it would be published.
- The counts and links it rests on.
- The cadence recorded in `ACCESSIBILITY.md`.
