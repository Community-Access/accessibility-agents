# Foundational action 2: Use an accessibility label to track relevant work

Part of the `osaf-foundational` skill. Read this when action 2 is in scope.

- ID: `use-an-accessibility-label-to-track-relevant-work`
- Effort and cadence: Quick; Initial setup + ongoing
- Canonical source: [Foundational phase, action 2](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/blob/b2ea31a2e38cbab3e774e4142575b78876b9b53f/framework/phases/foundational-phase.md#2-use-an-accessibility-label-to-track-relevant-work)

## Why it matters

This action makes accessibility work visible, searchable, and trackable.

## Definition of Done

1. An `accessibility` label, or an equivalent label with a clear name, exists.
2. The label is applied to the project's relevant open tracking issues.

## Recommended steps, adapted from the framework

1. Create a label named `accessibility` (or another clearly understood
   equivalent) if there isn't one already.
2. Add the label to the project's relevant accessibility issues and pull
   requests.
3. Use the label consistently for future accessibility work.

## How to do it in this repository

Labels live on GitHub, not in files, so every write here waits for an explicit
yes.

1. **Find an existing label.** `gh label list --limit 200`, then look for
   `accessibility`, `a11y`, `area: accessibility` or similar. An equivalent with
   a clear name satisfies item 1; keep it rather than adding a second label, and
   use its name everywhere later phases say `accessibility`.
2. **Create it if missing.** The package's standard scheme (`repo-manager`)
   uses `gh label create accessibility --color 1d76db --description "Accessibility improvements"`.
3. **Find candidates.** Search open issues and pull requests, for example
   `gh issue list --state open --limit 200 --search "accessibility OR a11y OR \"screen reader\" OR keyboard OR contrast OR WCAG OR aria OR focus"`
   and the same with `gh pr list`. Read each hit; a keyword match is not
   enough. Present the list with one line on why each is an accessibility
   issue.
4. **Apply only what is approved:** `gh issue edit <n> --add-label accessibility`,
   `gh pr edit <n> --add-label accessibility`.
5. **Keep it going.** The issue form in Workflow action 2 applies the label to
   new reports automatically. Say so as the recurring part of this action.

## Hand-offs

- `issue-tracker` - search the open issues, and add the label to the ones the
  maintainer approves; it previews before it writes.
- `repo-manager` - the standard label scheme, which already includes
  `accessibility`, when the repository has no labels set up.
- `repo-admin` - sync the label across several repositories in one pass.

## Evidence to report

- The label name and the `gh label list` line that shows it.
- The issue and pull request numbers labeled, and any candidates left
  unlabeled with the reason.
