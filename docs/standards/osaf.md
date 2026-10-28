# Open Source Accessibility Framework

The improvement framework this package helps projects adopt, phase by phase,
in their own repositories.

| | |
|---|---|
| Framework | [Open Source Accessibility Framework](https://open-source-accessibility.github.io/Open-Source-Accessibility-Framework/) |
| Source | [open-source-accessibility/Open-Source-Accessibility-Framework](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework), MIT, copyright GitHub, Inc. |
| Version relied on | commit `b2ea31a2e38cbab3e774e4142575b78876b9b53f`, 19 October 2026. The framework has no release tags |
| Reference examples | [Accessibility Toolkit](https://github.com/open-source-accessibility/accessibility-toolkit), MIT, commit `139322792d83ade29271c9bd3b0f351f649d39aa`, 14 October 2026 |
| Governs here | `osaf-foundational`, `osaf-workflow`, `osaf-testing`, `osaf-community` and `kb-open-source-accessibility-framework`, dispatched by `github-hub` |
| Checked by | `npm run verify:skills` (structure, budgets, every reference cited); the requirements themselves are checked by the bundle digest below, not by a gate |

## What it is

The framework turns accessibility goals into public, trackable progress for an
open source project. It has four phases: Foundational, Workflow, Testing and
Community, with 24 actions between them. Each action has a reason, a
Definition of Done and recommended steps. A project registers by opening a
public tracking issue in the framework's repository, then checks off actions
as their Definitions of Done are met; automation keeps a recap and a project
board current.

It is an improvement framework, not a certification, score or ranking. That
framing is a rule in every skill here: none of them will say a project is
accessible, compliant or certified because it adopted the framework.

## How this package helps a project adopt it

A user asks any client, in plain language: "adopt the Open Source
Accessibility Framework in this repo", "do Workflow action 3", "add an
accessibility issue template", "set up framework phase 3". `github-hub` routes
it to the phase skill. Phase numbers follow the order the framework lists
them in.

| Phase | Skill | What it writes or prepares |
|---|---|---|
| Foundational | `osaf-foundational` | `ACCESSIBILITY.md`, the accessibility label, the tracking issue form values |
| Workflow | `osaf-workflow` | Priorities and contributor expectations, the issue form, severity and response sections, the pull request checklist, labeled starter and expert issues, ownership, dependency records |
| Testing | `osaf-testing` | An automated check in CI, keyboard, screen reader and manual test records, documentation checks, supported environments and known limitations |
| Community | `osaf-community` | Response guidance and draft replies, participation and accommodation routes, consent-based recognition, progress updates, shared resources |

Each phase skill carries its actions' IDs, cadences and Definitions of Done
in `SKILL.md`, unchanged in substance (ASCII punctuation, one nested list
flattened), so it works offline, and loads one reference file per
action only when that action is in scope. The rules come from the framework's
own generated skills: ask for scope when none is given, inspect the repository
before editing, never claim a test that has no runtime evidence, never invent
names or results, ask before any change to GitHub, and present everything for
review before it is committed.

Where this package already has a skill for part of an action, the phase skill
names it as a hand-off and `github-hub` dispatches it. The main ones:

- Testing 1 (automated check): this package's GitHub Action in `action/`
  (static analysis of markup and CSS, Office and PDF scanning, SARIF);
  `ci-accessibility` and `kb-ci-integration` for axe-core and Playwright jobs
  with baselines; `kb-github-a11y-scanner` for the GitHub Accessibility
  Scanner.
- Testing 2 to 4 (keyboard, screen reader, manual): `keyboard-navigator`,
  `testing-coach`, `screen-reader-lab` (a simulation, reported as one),
  `contrast-master`, `cognitive-accessibility`, and the Playwright keyboard,
  viewport and contrast scans through `web-accessibility-wizard`.
- Testing 5 and Workflow 8 (documentation): `markdown-a11y-assistant`, with
  captions checked by hand, and code blocks partly scanned (plain fences used
  for diagrams, fences without a language) and otherwise checked by hand.
- Workflow 2 and 3 (reporting, triage): the severity names `critical`,
  `serious`, `moderate`, `minor`, which are this package's findings schema and
  the `fail-on` values of its GitHub Action; `kb-severity-mapping`.
- Workflow 4 to 6 (pull request template, labels): `template-builder`,
  `repo-manager`, `issue-tracker`, `contributions-hub`.
- Community: `issue-tracker`, `contributions-hub`, `analytics`,
  `release-manager`.

## How currency is checked

Each phase skill records the framework commit and a bundle digest in its
metadata. The digest is computed the way the framework's own generator,
`scripts/generate-phase-skills.mjs`, computes it: the first 12 hex characters
of the SHA-256 of the canonical phase document. When a user asks for the
latest guidance, the skill fetches the phase document from the framework's
`main` branch, compares digests, and reports a difference rather than
switching silently.

| Phase | Digest at the pinned commit |
|---|---|
| Foundational | `d6f531edfd4e` |
| Workflow | `b5c553feeaf6` |
| Testing | `b1fd16cfeb8b` |
| Community | `5c543d1d91eb` |

To update: take the four documents from `framework/phases/` at the new commit,
diff them against the Definitions of Done in each `SKILL.md` and the action
references, update the text, the commit and the digests together, and rerun
`npm run verify`.

## Deviations

Each place this package departs from the framework's own material, and why.

| Deviation | Why |
|---|---|
| The skills are written for this package, not copied from the framework's generated skills | Those skills carry no knowledge of the tools that do each action; these route to them. The Definitions of Done are the framework's, unchanged in substance |
| Punctuation converted to ASCII, relative links made absolute | This package's house style; the source uses curly quotes and em dashes |
| The Community phase follows the canonical document, not the framework's generated Community skill | At the pinned commit the generated skill is stale: digest `5bea61d03bf6` against `5c543d1d91eb`, and the framework's own `--check` fails. The difference is wording in two recommended steps |
| Severity definitions are not merged | The framework's and this package's use the same four names with slightly different wording; both are documented in `kb-open-source-accessibility-framework` and the project's own definitions win |
| The phase skills do not open the tracking issue or edit it | Opening it publishes the project's participation and editing it drives automation; the skills prepare and the user acts |

Upstream issues found while building this, which a maintainer may want to
report, are listed in `kb-open-source-accessibility-framework` under "Notes on
the source at the pinned commit".

## License and attribution

The adapted framework and toolkit text is MIT. Each of the five skills carries
both projects' license notices in `references/LICENSE-OSAF.md`, so a skill
copied on its own keeps its attribution.

## Sources

- [Framework README](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/blob/main/README.md)
- [Canonical phase documents](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/tree/main/framework/phases)
- [The framework's AI usage guidance and phase skills](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/blob/main/framework/ai/guide.md)
- [Tracking issue form](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/blob/main/.github/ISSUE_TEMPLATE/project-registration.yml)
- [Framework project board](https://github.com/orgs/open-source-accessibility/projects/1)
- [Accessibility Toolkit](https://github.com/open-source-accessibility/accessibility-toolkit)
