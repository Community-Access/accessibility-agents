# Workflow action 6: Tag accessibility issues where you need expert help

Part of the `osaf-workflow` skill. Read this when action 6 is in scope.

- ID: `tag-accessibility-issues-where-you-need-expert-help`
- Effort and cadence: Quick; Ongoing
- Canonical source: [Workflow phase, action 6](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/blob/b2ea31a2e38cbab3e774e4142575b78876b9b53f/framework/phases/workflow-phase.md#6-tag-accessibility-issues-where-you-need-expert-help)

## Why it matters

This action makes contribution easier to start.

## Definition of Done

1. Accessibility issues where expert help is needed are clearly labeled with
   `help wanted` and `accessibility`, or another clearly understood equivalent,
   labels.
2. Each selected issue has a clear scope and contribution context.

## Recommended steps, adapted from the framework

1. Identify accessibility issues that require specialized knowledge or
   experience.
2. Apply both the `help wanted` and `accessibility`, or another clearly
   understood equivalent, labels.
3. Add enough context, acceptance criteria, and required expertise for
   contributors to begin.

## How to do it in this repository

The same mechanics as action 5 (`references/action-05.md` in this skill), with
a different selection and one more field.

- **Selection.** Issues that need specialized knowledge or lived experience: a
  custom widget's ARIA pattern, focus management across a single-page app's
  routes, screen reader behavior that differs between NVDA, JAWS and
  VoiceOver, a canvas or chart that needs a text alternative, an editor
  component, a platform accessibility API in a desktop app, or a design system
  color scale that fails contrast.
- **State the expertise needed** in each issue, in plain words: "someone who
  uses a screen reader daily", "experience with the ARIA combobox pattern",
  "familiarity with the macOS accessibility API". Never ask a person to
  disclose a disability to take the work.
- **Apply the labels** once approved: `gh issue edit <n> --add-label "help wanted" --add-label accessibility`.

## Hand-offs

- `issue-tracker` - find the candidates and apply the approved labels and
  context.
- `contributions-hub` - label hygiene for `help wanted`.
- The specialist that owns the topic can write the technical context for an
  issue: `aria-specialist`, `keyboard-navigator`, `modal-specialist`,
  `contrast-master`, `data-visualization-accessibility` through
  `accessibility-lead`; `desktop-a11y-specialist` through `developer-hub`.

## Evidence to report

- The issue numbers labeled, each with the expertise it asks for.
