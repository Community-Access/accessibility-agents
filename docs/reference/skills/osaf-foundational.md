# osaf-foundational - Open Source Accessibility Framework, Foundational phase

> Starts a project on the Open Source Accessibility Framework: an `ACCESSIBILITY.md` with a statement of why accessibility matters, and an accessibility label applied to the relevant open issues. Prepares the public tracking issue for the user to open.

---

## What This Skill Is For

One of four phase skills for the [Open Source Accessibility Framework](https://open-source-accessibility.github.io/Open-Source-Accessibility-Framework/), an improvement framework from GitHub's open-source-accessibility organization (MIT, copyright GitHub, Inc.). It implements every action in the phase, or only the ones you name by number, title or ID, and reports each against the framework's Definition of Done.

Use it when:

- You want to adopt the framework and need to know where to start
- You need an `ACCESSIBILITY.md`
- You want an `accessibility` label created and applied to the right issues

---

## How to Launch It

Ask `github-hub` in plain language; it routes framework requests here. In Claude Code and VS Code you can also type the skill name.

```text
/github-hub adopt the Open Source Accessibility Framework in this repo
/github-hub framework phase 1
/github-hub create an ACCESSIBILITY.md
/github-hub use an accessibility label to track relevant work
/osaf-foundational all actions
```

---

## Actions

Each action in the phase, with its framework ID, typical effort, cadence, and the skills this one hands part of the work to.

| No. | ID | Effort | Cadence | Hands off to |
|---:|---|---|---|---|
| 1 | `create-an-accessibilitymd` | Quick | One-time setup | `markdown-a11y-assistant` audits the new file |
| 2 | `use-an-accessibility-label-to-track-relevant-work` | Quick | Initial setup + ongoing | `issue-tracker` finds and labels issues; `repo-manager` and `repo-admin` create and sync the label |

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
