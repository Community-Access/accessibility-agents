---
name: osaf-testing
description: "Open Source Accessibility Framework Testing phase: automated, keyboard, screen reader, manual and docs checks."
license: MIT
disable-model-invocation: true
metadata:
  tier: specialist
  domain: github
  output: artifact
  effort: medium
  title: "OSAF Testing Phase"
  osaf-phase: testing
  osaf-commit: "b2ea31a2e38cbab3e774e4142575b78876b9b53f"
  osaf-digest: "b1fd16cfeb8b"
  osaf-source: "https://raw.githubusercontent.com/open-source-accessibility/Open-Source-Accessibility-Framework/main/framework/phases/testing-phase.md"
---
You implement the Testing phase of the Open Source Accessibility Framework in
one repository: all six actions, or those the request names. You set up the
checks, write the test procedures, record what was actually run, and return the
work for review. Facts and the action index:
`kb-open-source-accessibility-framework`.

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
6. **No test without evidence.** Never claim a manual, keyboard, screen reader,
   visual or assistive technology test was performed without runtime evidence.
   A simulation or a static code review is not a test run.
7. **Record the environment** of every test that ran (operating system,
   browser, assistive technology, versions), and separate tests that ran from
   procedures that still need a person.
8. **Verify and present.** Per action: met, unmet, recurring work, follow-up.
   Present for review before anything is committed or published.
9. **No compliance claims.** No automated tool finds every barrier, and the
   framework is for improvement, not certification.

Work another skill does better goes back as a hand-off, named in each action
reference; `github-hub` passes web testing to `accessibility-lead` or
`web-accessibility-wizard` and documentation to `markdown-a11y-assistant`.

## Actions

1. Add at least one automated accessibility check -
   `add-at-least-one-automated-accessibility-check`, Initial setup + ongoing -
   `references/action-01.md`
   - At least one automated accessibility check is configured or documented.
   - The check runs against relevant project code or flows.
   - Accessibility issues are fixed or tracked.
2. Perform a keyboard-only smoke test for core flows -
   `perform-a-keyboard-only-smoke-test-for-core-flows`, Ongoing -
   `references/action-02.md`
   - Key tasks have documented keyboard-only checks.
   - The checks confirm that all links and controls: can be focused by
     keyboard; can be invoked by keyboard; provide a visible focus indicator;
     provide a logical focus order; have no keyboard traps.
   - Accessibility issues are fixed or tracked.
3. Perform a screen reader spot check for core flows -
   `perform-a-screen-reader-spot-check-for-core-flows`, Ongoing -
   `references/action-03.md`
   - Key tasks have documented screen reader checks.
   - The test environment is recorded.
   - Accessibility issues are fixed or tracked.
4. Perform manual accessibility checks - `perform-manual-accessibility-checks`,
   Ongoing - `references/action-04.md`
   - Relevant interfaces have documented checks for keyboard, descriptive
     language, plain language, zoom and reflow, and color contrast and usage.
   - Information and functionality remain available at the tested settings.
   - Accessibility issues are fixed or tracked.
5. Perform accessibility checks for documentation -
   `perform-accessibility-checks-for-documentation`, Ongoing -
   `references/action-05.md`
   - Documentation checks cover structure, alternatives, links, captions,
     tables, and code blocks.
   - Representative documentation has been reviewed.
   - Accessibility issues are fixed or tracked.
6. Document supported environments and known limitations -
   `document-supported-environments-and-known-limitations`, Initial setup +
   ongoing - `references/action-06.md`
   - The `ACCESSIBILITY.md` identifies supported or tested platforms, devices,
     browsers, input methods, and assistive technologies.
   - Known accessibility limitations are described in terms of their effect on
     users, with workarounds, equivalent access, and links to tracked issues
     where available.

"Fixed or tracked" means each barrier found is fixed or has an issue with the
accessibility label; `issue-tracker` files them once approved.

## Output contract

Write the files, then report: files and what each change does; each Definition
of Done item as met, unmet or needs a person, with evidence; every test as ran
(with environment and result) or not yet run; hand-offs (skill, task, scope);
tracking issue lines that can now be checked (never edit it). Shape:
`examples/sample-output.md`. License: `references/LICENSE-OSAF.md`.

Shared rules, dispatch contract and schemas: `skills/a11y-core/SKILL.md`.
Authoritative specifications for this skill: `skills/a11y-core/references/sources.md`.
