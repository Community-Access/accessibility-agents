# Release Communications Checklist

> **Historical.** This document describes the repository as it was before
> version 7.0, when agents lived in six per-client directories. It is kept
> for the record and is not maintained. The current layout is one `skills/`
> directory; start at [the documentation index](../README.md).
> Original path: `docs/guides/release-communications-checklist.md`.

Use this checklist for every release to keep engineering, documentation, and announcements in sync.

## Pre-Release

- [ ] Confirm target branch and clean working tree.
- [ ] Confirm version alignment across `plugin.yaml`, `gemini-extension.json`, `mcp-server/package.json`, and `manifest.json`.
- [ ] Confirm `CHANGELOG.md` has a section for the target version.
- [ ] Create or update `RELEASE-{version}.md`.

## Release Notes Quality Gate

Ensure `RELEASE-{version}.md` includes these required sections:

- [ ] `## Overview`
- [ ] `## Highlights`
- [ ] `## Full Changelog`

Recommended additions:

- [ ] Upgrade notes or migration guidance
- [ ] CI and reliability impact summary
- [ ] Links to key workflow or config changes

## Publish Steps

- [ ] Push release commit(s) to the release branch.
- [ ] Create GitHub release tag `v{version}`.
- [ ] Publish release using `RELEASE-{version}.md` as notes.
- [ ] Verify release page renders required sections correctly.

## Post-Release Announcements

- [ ] Post a short release summary in GitHub Discussions (or project announcement channel).
- [ ] Share a concise internal update (Slack/Teams/email) with:
  - version
  - top 3 to 5 changes
  - links to release notes and changelog
- [ ] Update any marketplace-facing or onboarding docs with new version references.

## Verification

- [ ] Confirm `release-consistency-guard.yml` passes on the release commit.
- [ ] Confirm `ci-integrity-guards.yml` passes on the release commit.
- [ ] Confirm docs lint and CI checks pass on main.
- [ ] Confirm no stale version pins remain in public examples.
- [ ] Review latest `branch-hygiene-report.yml` summary for stale long-lived release branches.

## Template Snippet

Use this announcement template:

```md
Accessibility Agents v{version} is now live.

Highlights:
- {change 1}
- {change 2}
- {change 3}

Release notes: {release-url}
Changelog: {changelog-url}
```
