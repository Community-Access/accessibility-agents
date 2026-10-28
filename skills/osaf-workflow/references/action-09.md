# Workflow action 9: Design accessible interfaces

Part of the `osaf-workflow` skill. Read this when action 9 is in scope.

- ID: `design-accessible-interfaces`
- Effort and cadence: Extended; Ongoing
- Canonical source: [Workflow phase, action 9](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/blob/b2ea31a2e38cbab3e774e4142575b78876b9b53f/framework/phases/workflow-phase.md#9-design-accessible-interfaces)

## Why it matters

This action helps prevent common accessibility issues from being introduced in
the first place, reducing rework and improving usability for everyone.

## Definition of Done

1. Project-relevant interface requirements are documented.
2. New and updated interfaces are reviewed against those requirements.
3. Keyboard access, focus states, and labels are addressed or tracked.

## Recommended steps, adapted from the framework

1. Review the
   [accessible interface design practices](https://opensource.guide/accessibility-best-practices-for-your-project/#design-accessible-interfaces).
2. Ensure the
   [contributor expectations](https://github.com/open-source-accessibility/accessibility-toolkit/blob/main/ACCESSIBILITY.md#contributor-expectations)
   include checks for keyboard and screen reader support, such as visible focus
   states, clear labels, and other project-relevant requirements.
3. Apply the checks when creating or updating interfaces.

## How to do it in this repository

- **Which interfaces.** Web UI, a desktop app, a CLI's output, a component
  library, an editor plugin. Requirements differ; write the ones that apply.
  For a project with no interface beyond its documentation, say so in the
  report and let the maintainer decide how the action applies; do not mark it
  met on your own.
- **Item 1** is the interface part of the "Contributor expectations" section
  from action 1 (`references/action-01.md` in this skill). Extend it with the
  project's own requirements, for example: every control has a visible label
  that matches its accessible name; focus is visible with at least 3:1 contrast;
  dialogs trap focus and return it on close; status messages are announced.
- **Item 2** is the review process: the pull request checklist (action 4) plus
  a reviewer who checks UI changes. Where this package's enforcement hooks are
  installed, agent edits to UI files are refused until `accessibility-lead` has
  reviewed them in the session. That covers changes made with an agent, not
  every contributor's changes, so the checklist and a human reviewer remain the
  review process.
- **Item 3** asks for keyboard access, focus states and labels to be
  "addressed or tracked". Run the reviews below on the current interface; every
  finding not fixed becomes a labeled issue.

## Hand-offs

- `accessibility-lead` (router) - review the current web UI and dispatch
  `keyboard-navigator` (tab order, traps, focus visibility, skip links),
  `forms-specialist` (labels, errors), `aria-specialist` (custom widgets) and
  `contrast-master` (focus indicator and text contrast).
- `design-system-auditor`, through `accessibility-lead` - when the project has
  design tokens or a theme: color, focus ring, spacing and motion tokens
  before they reach the UI.
- `developer-hub` (router) - desktop interfaces: wxPython, platform
  accessibility APIs, NVDA add-ons.
- `issue-tracker` - file the findings that are not fixed, with the
  accessibility label, once the maintainer approves.

## Evidence to report

- Where the interface requirements are documented.
- How reviews are applied (pull request checklist, reviewer, or the
  `accessibility-lead` gate).
- The findings and their issue numbers, or the fixes made.
