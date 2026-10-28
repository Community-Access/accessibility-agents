# osaf-community - Open Source Accessibility Framework, Community phase

> Helps a project listen and respond: response guidance and draft replies to accessibility reports, accessible ways to participate and request accommodations, recognition with consent, progress updates, and shared resources. Drafts everything; the maintainer decides what is published.

---

## What This Skill Is For

One of four phase skills for the [Open Source Accessibility Framework](https://open-source-accessibility.github.io/Open-Source-Accessibility-Framework/), an improvement framework published by GitHub. It implements every action in the phase, or only the ones you name by number, title or ID, and reports each against the framework's Definition of Done.

Use it when:

- You want to respond better to accessibility reports
- You want to credit accessibility contributors without exposing personal information
- You want to publish an accessibility progress update

---

## How to Launch It

Ask `github-hub` in plain language; it routes framework requests here. In Claude Code and VS Code you can also type the skill name.

```text
/github-hub framework phase 4
/github-hub draft an accessibility progress update
/github-hub Community actions 2 and 4
/github-hub recognize accessibility contributions in the next release
/osaf-community all actions
```

---

## Actions

Each action in the phase, with its framework ID, typical effort, cadence, and the skills this one hands part of the work to.

| No. | ID | Effort | Cadence | Hands off to |
|---:|---|---|---|---|
| 1 | `invite-community-help-on-accessibility-work` | Extended | Ongoing | `issue-tracker`, `contributions-hub`, `repo-manager` |
| 2 | `respond-constructively-to-accessibility-reports` | Moderate | Ongoing | `issue-tracker`, `contributions-hub` for tone |
| 3 | `provide-accessible-and-respectful-ways-to-contribute-and-collaborate` | Extended | Initial setup + ongoing | `contributions-hub`, `repo-manager` for a code of conduct |
| 4 | `recognize-accessibility-contributions-publicly` | Quick | Ongoing | `release-manager`, `contributions-hub` |
| 5 | `publish-accessibility-progress-updates` | Moderate | Ongoing | `analytics`, `issue-tracker`, `release-manager` |
| 6 | `share-accessibility-resources` | Moderate | Ongoing | `markdown-a11y-assistant`, `wiki-manager`, `contributions-hub` |

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
