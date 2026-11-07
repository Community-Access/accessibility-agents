# Sample output: Foundational phase

An illustration of what `osaf-foundational` returns. The repository, issue
numbers and lines are invented.

## Files

- `ACCESSIBILITY.md` - new. Opening statement drafted for maintainer review.

## Actions

Foundational 1, `create-an-accessibilitymd`:

- An `ACCESSIBILITY.md` exists - met, `ACCESSIBILITY.md` (new file, not yet on
  the default branch).
- A statement of why accessibility matters - met as a draft, lines 3 to 5.
  Needs the maintainer to confirm the wording.

Foundational 2, `use-an-accessibility-label-to-track-relevant-work`:

- A label exists - met. `gh label list` shows `a11y`, an equivalent; no new
  label created.
- Applied to relevant open issues - needs approval. Candidates: #12 (focus lost
  after closing the settings dialog), #31 (low contrast in dark theme), #40
  (missing alt text in the README). #18 matched "keyboard" but is a shortcut
  feature request, so it is left out.
- Recurring: apply `a11y` to new accessibility work; Workflow action 2 can do
  this through the issue form.

## Hand-offs

- `markdown-a11y-assistant` - audit `ACCESSIBILITY.md`.
- `issue-tracker` - add `a11y` to #12, #31 and #40 once approved.

## Tracking issue

Check these once the follow-up is done:

- Foundational 1, after the file is merged to the default branch.
- Foundational 2, after the label is applied.
