# Workflow action 10: Evaluate key dependencies and upstream blockers

Part of the `osaf-workflow` skill. Read this when action 10 is in scope.

- ID: `evaluate-key-dependencies-and-upstream-blockers`
- Effort and cadence: Extended; Ongoing
- Canonical source: [Workflow phase, action 10](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/blob/b2ea31a2e38cbab3e774e4142575b78876b9b53f/framework/phases/workflow-phase.md#10-evaluate-key-dependencies-and-upstream-blockers)

## Why it matters

This action helps projects manage accessibility risks they do not fully
control.

## Definition of Done

1. Accessibility-relevant dependencies are documented.
2. The accessibility of new dependencies is reviewed before they are adopted.
3. Known upstream blockers are linked and tracked.
4. Workarounds or mitigation plans are recorded where applicable.

## Recommended steps, adapted from the framework

1. Identify major third-party components, frameworks, or tools that affect
   accessibility.
2. Review the accessibility of a dependency, including known barriers and
   upstream issues, before adopting it.
3. Review and document accessibility-relevant upstream issues for existing
   dependencies.
4. Document workarounds, risks, and project actions where the issue is outside
   the project's direct control.
5. Revisit the list as dependencies change.

## How to do it in this repository

1. **Identify** from the manifests (`package.json`, `pyproject.toml`,
   `requirements.txt`, `Cargo.toml`, `go.mod`, `Gemfile`, and the like) the
   dependencies that shape what users meet: UI frameworks and component
   libraries, rich text and code editors, chart, map and video libraries, date
   pickers, documentation generators and site themes, GUI toolkits, terminal UI
   libraries. Build tools, linters and test runners rarely belong on the list.
2. **Look upstream.** For each one hosted on GitHub, search its issues for
   accessibility work, for example
   `gh search issues --repo OWNER/NAME --state open "accessibility OR a11y OR \"screen reader\" OR keyboard"`,
   and note its own accessibility documentation if it has any. Read what you
   cite; a keyword hit is not a blocker.
3. **Record** the list where contributors will find it: a "Dependencies"
   section in `ACCESSIBILITY.md`, or a page in `docs/` linked from it. For each
   entry: what it affects, known barriers with links to upstream issues, and
   the project's workaround or mitigation. Barriers users meet also belong in
   "Known limitations" (Testing action 6).
4. **Track blockers** in the project's own tracker: an issue per blocker with
   the accessibility label, linking the upstream issue. Prepare these for
   approval.
5. **Item 2 is a practice.** Add one line to the contributor expectations
   (action 1) or the pull request checklist (action 4): a new user-facing
   dependency needs a short accessibility review before it is adopted.

## Hand-offs

- `issue-tracker` - search upstream repositories' issues across repos, and
  create the tracking issues once approved.
- `accessibility-lead` (router) - test a component library's widgets in the
  project's own UI when the upstream record is thin.

`kb-framework-accessibility` holds known accessibility patterns for React, Vue,
Angular, Svelte, Next.js and Tailwind CSS, which helps judge those frameworks'
usual pitfalls; it does not track upstream issues.

## Evidence to report

- The dependency list and where it is documented.
- Each upstream issue linked, and the local issue that tracks it.
- The line that makes reviewing new dependencies part of the workflow.
