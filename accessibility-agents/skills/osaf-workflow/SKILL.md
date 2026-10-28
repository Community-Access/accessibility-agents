---
name: osaf-workflow
description: "Open Source Accessibility Framework Workflow phase: expectations, reporting, triage, PR template, labels, docs."
license: MIT
disable-model-invocation: true
metadata:
  tier: specialist
  domain: github
  output: artifact
  effort: medium
  title: "OSAF Workflow Phase"
  osaf-phase: workflow
  osaf-commit: "b2ea31a2e38cbab3e774e4142575b78876b9b53f"
  osaf-digest: "b5c553feeaf6"
  osaf-source: "https://raw.githubusercontent.com/open-source-accessibility/Open-Source-Accessibility-Framework/main/framework/phases/workflow-phase.md"
---
You implement the Workflow phase of the Open Source Accessibility Framework in
one repository: all ten actions, or those the request names. Facts and the
action index: `kb-open-source-accessibility-framework`.

## How you work

1. **Scope.** Every action in phase order, or only those named by number, title
   or ID. If none is named, ask before changing files. Report an unknown action
   and list the valid ones.
2. **Bundled requirements.** The Definitions of Done below are the minimum, from
   the phase document at `metadata.osaf-commit`, and work offline. Read an
   action's reference only when it is in scope.
3. **Online check, only when asked.** Fetch `metadata.osaf-source`; if the first
   12 hex characters of its SHA-256 differ from `metadata.osaf-digest`, report
   the change and ask before using it. A failed fetch never blocks the work.
4. **Inspect before editing.** Per item: met (cite file and line), needs a
   change, or needs maintainer input, external configuration or a person.
5. **Edit in phase order**, keep repository conventions, extend
   `ACCESSIBILITY.md` rather than replace it.
6. **No external changes without a yes**: labels, assignments, comments,
   settings.
7. **Never invent** maintainer names, contacts, timelines or test results; leave
   a marked placeholder and list it as maintainer input.
8. **Verify and present.** Per action: met, unmet, recurring work, follow-up.
   Present for review before anything is committed or published.
9. **No compliance claims.** The framework is for improvement, not
   certification.

Work another skill does better goes back as a hand-off, named in each action
reference; `github-hub` dispatches it.

## Actions

1. Surface accessibility expectations for contributors -
   `surface-accessibility-expectations-for-contributors`, Initial setup + ongoing
   - The project's `ACCESSIBILITY.md` includes a "Priorities" section describing its accessibility goals and areas of focus.
   - The project's `ACCESSIBILITY.md` includes a "Contributor expectations" section describing the accessibility requirements for contributions.
   - The project's `CONTRIBUTING.md` directs contributors to these expectations and any relevant accessibility checks and resources.
2. Create an accessible path for reporting accessibility bugs -
   `create-an-accessible-path-for-reporting-accessibility-bugs`, Initial setup + ongoing
   - The project documents an accessible way to report accessibility bugs.
   - Submitted accessibility reports follow a documented triage and response process.
3. Establish a simple accessibility triage approach -
   `establish-a-simple-accessibility-triage-approach`, Initial setup + ongoing
   - The `ACCESSIBILITY.md` explains how to report an accessibility barrier and what information is helpful to include.
   - Severity categories describe how strongly a barrier affects a person's ability to complete a task.
   - Response expectations explain how reports are acknowledged, tracked, updated, and resolved.
4. Add an accessibility section to the pull request template -
   `add-an-accessibility-section-to-the-pull-request-template`, Initial setup + ongoing
   - The pull request template includes an accessibility section.
   - The checklist covers the project's relevant accessibility requirements.
   - Contributors are prompted to complete each applicable item.
5. Tag beginner-friendly accessibility issues -
   `tag-beginner-friendly-accessibility-issues`, Ongoing
   - Beginner-friendly accessibility issues are clearly labeled using both `good first issue` and `accessibility`, or another clearly understood equivalent, labels.
   - Each selected issue has a clear scope and contribution context.
6. Tag accessibility issues where you need expert help -
   `tag-accessibility-issues-where-you-need-expert-help`, Ongoing
   - Accessibility issues where expert help is needed are clearly labeled with `help wanted` and `accessibility`, or another clearly understood equivalent, labels.
   - Each selected issue has a clear scope and contribution context.
7. Assign accessibility ownership - `assign-accessibility-ownership`, Initial setup + ongoing
   - The `ACCESSIBILITY.md` identifies an accessibility owner.
   - Responsibilities are documented.
8. Make docs accessible by default - `make-docs-accessible-by-default`, Ongoing
   - Documentation uses meaningful structure and semantics (e.g. headings, lists).
   - Images, diagrams, and videos have appropriate alternatives or supporting text.
   - Tables and code blocks are presented accessibly.
9. Design accessible interfaces - `design-accessible-interfaces`, Ongoing
   - Project-relevant interface requirements are documented.
   - New and updated interfaces are reviewed against those requirements.
   - Keyboard access, focus states, and labels are addressed or tracked.
10. Evaluate key dependencies and upstream blockers -
    `evaluate-key-dependencies-and-upstream-blockers`, Ongoing
    - Accessibility-relevant dependencies are documented.
    - The accessibility of new dependencies is reviewed before they are adopted.
    - Known upstream blockers are linked and tracked.
    - Workarounds or mitigation plans are recorded where applicable.

References: `references/action-01.md`, `references/action-02.md`,
`references/action-03.md`, `references/action-04.md`, `references/action-05.md`,
`references/action-06.md`, `references/action-07.md`, `references/action-08.md`,
`references/action-09.md`, `references/action-10.md`.

## Output contract

Write the files, then report: files and what each change does; each Definition
of Done item as met, unmet or needs a person, with evidence; hand-offs (skill,
task, scope); tracking issue lines that can now be checked (never edit it).
Shape: `examples/sample-output.md`. License: `references/LICENSE-OSAF.md`.

Shared rules, dispatch contract and schemas: `skills/a11y-core/SKILL.md`.
Authoritative specifications for this skill: `skills/a11y-core/references/sources.md`.
