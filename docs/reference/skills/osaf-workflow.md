# osaf-workflow - Open Source Accessibility Framework, Workflow phase

> Builds accessibility into how a project works: contributor expectations, an accessible issue form, severity and response commitments, a pull request checklist, labeled starter and expert issues, an owner, accessible docs and interfaces, and a record of dependencies that affect accessibility.

---

## What This Skill Is For

One of four phase skills for the [Open Source Accessibility Framework](https://open-source-accessibility.github.io/Open-Source-Accessibility-Framework/), an improvement framework published by GitHub. It implements every action in the phase, or only the ones you name by number, title or ID, and reports each against the framework's Definition of Done.

Use it when:

- You want an accessibility issue template or an accessibility section in the pull request template
- You need severity categories and response commitments in `ACCESSIBILITY.md`
- You want beginner-friendly or help-wanted accessibility issues labeled with context

---

## How to Launch It

Ask `github-hub` in plain language; it routes framework requests here. In Claude Code and VS Code you can also type the skill name.

```text
/github-hub framework phase 2
/github-hub add an accessibility issue template
/github-hub Workflow actions 2 and 3
/github-hub add accessibility checks to our pull request template
/osaf-workflow all actions
```

---

## Actions

Each action in the phase, with its framework ID, typical effort, cadence, and the skills this one hands part of the work to.

| No. | ID | Effort | Cadence | Hands off to |
|---:|---|---|---|---|
| 1 | `surface-accessibility-expectations-for-contributors` | Moderate | Initial setup + ongoing | `repo-manager` when there is no `CONTRIBUTING.md` |
| 2 | `create-an-accessible-path-for-reporting-accessibility-bugs` | Moderate | Initial setup + ongoing | `template-builder` for customizing the form |
| 3 | `establish-a-simple-accessibility-triage-approach` | Moderate | Initial setup + ongoing | `issue-tracker` triages existing reports; severity names match `kb-severity-mapping` |
| 4 | `add-an-accessibility-section-to-the-pull-request-template` | Quick | Initial setup + ongoing | `template-builder` or `repo-manager` for a base template |
| 5 | `tag-beginner-friendly-accessibility-issues` | Quick | Ongoing | `issue-tracker`, `contributions-hub`, `repo-manager` |
| 6 | `tag-accessibility-issues-where-you-need-expert-help` | Quick | Ongoing | `issue-tracker`, `contributions-hub` |
| 7 | `assign-accessibility-ownership` | Quick | Initial setup + ongoing | none; the maintainer names the owner |
| 8 | `make-docs-accessible-by-default` | Extended | Ongoing | `markdown-a11y-assistant`, `accessibility-lead`, `document-accessibility-wizard` |
| 9 | `design-accessible-interfaces` | Extended | Ongoing | `accessibility-lead` and its specialists, `developer-hub` for desktop |
| 10 | `evaluate-key-dependencies-and-upstream-blockers` | Extended | Ongoing | `issue-tracker` searches upstream issues |

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
