# Workflow action 5: Tag beginner-friendly accessibility issues

Part of the `osaf-workflow` skill. Read this when action 5 is in scope.

- ID: `tag-beginner-friendly-accessibility-issues`
- Effort and cadence: Quick; Ongoing
- Canonical source: [Workflow phase, action 5](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/blob/b2ea31a2e38cbab3e774e4142575b78876b9b53f/framework/phases/workflow-phase.md#5-tag-beginner-friendly-accessibility-issues)

## Why it matters

This action makes contribution easier to start.

## Definition of Done

1. Beginner-friendly accessibility issues are clearly labeled using both
   `good first issue` and `accessibility`, or another clearly understood
   equivalent, labels.
2. Each selected issue has a clear scope and contribution context.

## Recommended steps, adapted from the framework

1. Identify small, well-scoped accessibility issues suitable for new
   contributors.
2. Apply both the `good first issue` and `accessibility`, or another clearly
   understood equivalent, labels.
3. Add enough context and acceptance criteria for contributors to begin.

## How to do it in this repository

Every label and every edit to an issue body is a public change; prepare them
for review and apply only what the maintainer approves.

1. **Check both labels exist** with `gh label list`. GitHub creates
   `good first issue` in new repositories by default, but it may have been
   renamed or deleted. Use the project's accessibility label from Foundational
   action 2.
2. **Find candidates** among open issues labeled for accessibility:
   `gh issue list --label accessibility --state open`. A good first issue is
   small, self-contained, has a known fix, and needs no specialist knowledge:
   missing alt text, a vague link, a skipped heading level, a missing form
   label, a color-only status with an obvious text fix.
3. **Add context** to each issue: the file or page, what is wrong in terms of
   the user's experience, the expected result, acceptance criteria, and how to
   check the fix (for example "Tab to the button; it shows a visible focus
   ring"). Draft the text as a comment or a body edit for approval.
4. **Apply the labels** once approved: `gh issue edit <n> --add-label "good first issue" --add-label accessibility`.
5. **Ongoing.** Keep a few open at any time and retire ones that grew in scope.

## Hand-offs

- `issue-tracker` - search the candidates, then add labels and context to the
  approved ones; it previews every write.
- `contributions-hub` - label hygiene: whether there are enough
  `good first issue` items and whether any are too complex for newcomers.
- `repo-manager` - create new starter issues when there are none yet; it writes
  a "Good for newcomers because..." line in each.

## Evidence to report

- The issue numbers labeled, each with its acceptance criteria.
- Candidates rejected as too large, with the reason.
