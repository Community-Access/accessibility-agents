# osaf-testing - Open Source Accessibility Framework, Testing phase

> Sets up repeatable accessibility testing: at least one automated check in CI, keyboard, screen reader and manual test records for core tasks, documentation checks, and the supported environments and known limitations in `ACCESSIBILITY.md`. Records what actually ran, and never reports a test no one performed.

---

## What This Skill Is For

One of four phase skills for the [Open Source Accessibility Framework](https://open-source-accessibility.github.io/Open-Source-Accessibility-Framework/), an improvement framework published by GitHub. It implements every action in the phase, or only the ones you name by number, title or ID, and reports each against the framework's Definition of Done.

Use it when:

- You want an automated accessibility check in CI and need to pick one
- You need keyboard or screen reader test procedures for your core flows
- You want to document supported environments and known limitations honestly

---

## How to Launch It

Ask `github-hub` in plain language; it routes framework requests here. In Claude Code and VS Code you can also type the skill name.

```text
/github-hub framework phase 3
/github-hub add at least one automated accessibility check
/github-hub document a keyboard-only smoke test
/github-hub Testing actions 1 and 5
/osaf-testing all actions
```

---

## Actions

Each action in the phase, with its framework ID, typical effort, cadence, and the skills this one hands part of the work to.

| No. | ID | Effort | Cadence | Hands off to |
|---:|---|---|---|---|
| 1 | `add-at-least-one-automated-accessibility-check` | Moderate | Initial setup + ongoing | this package's GitHub Action, `ci-accessibility`, `kb-ci-integration`, `kb-github-a11y-scanner` |
| 2 | `perform-a-keyboard-only-smoke-test-for-core-flows` | Moderate | Ongoing | `keyboard-navigator`, `testing-coach`, the Playwright keyboard scan |
| 3 | `perform-a-screen-reader-spot-check-for-core-flows` | Moderate | Ongoing | `testing-coach`, `screen-reader-lab` (simulation only) |
| 4 | `perform-manual-accessibility-checks` | Extended | Ongoing | `contrast-master`, `cognitive-accessibility`, `alt-text-headings`, `forms-specialist`, the viewport and contrast scans |
| 5 | `perform-accessibility-checks-for-documentation` | Moderate | Ongoing | `markdown-a11y-assistant`, `document-accessibility-wizard` |
| 6 | `document-supported-environments-and-known-limitations` | Moderate | Initial setup + ongoing | `issue-tracker` lists the open barriers |

## What You Get Back

- The files it wrote or changed, and what each change does
- Each Definition of Done item as met, unmet or needing a person, with evidence
- The hand-offs for `github-hub` to dispatch
- The lines of your framework tracking issue that can now be checked; it never edits the tracking issue itself

## Rules it keeps

- Asks which actions to implement when the request does not say.
- Inspects the repository before editing, and extends `ACCESSIBILITY.md` rather than replacing it.
- Never claims the project is accessible, compliant or certified. The framework is for improvement, not certification.
- Makes no change on GitHub (labels, comments, issues) without an explicit yes.
- Presents every change for review before anything is committed.
- Works offline from the Definitions of Done it carries; checks the framework's current text only when asked, by comparing a bundle digest.

## Related

- [Open Source Accessibility Framework standard page](../../standards/osaf.md) - source commit, digests, deviations
- [github-hub](github-hub.md) - the router that dispatches it
- `kb-open-source-accessibility-framework` - the action index, tracking issue and framing
