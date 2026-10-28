---
name: kb-open-source-accessibility-framework
description: "Reference data, not a reviewer. Open Source Accessibility Framework: phases, action IDs and cadence, tracking issue, framing."
license: MIT
disable-model-invocation: true
user-invocable: false
metadata:
  tier: reference
  domain: github
  output: none
  effort: low
  title: "Open Source Accessibility Framework"
  osaf-commit: "b2ea31a2e38cbab3e774e4142575b78876b9b53f"
  osaf-source: "https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework"
---
Reference data for the Open Source Accessibility Framework (OSAF). Open this
when a task names the framework, one of its phases or actions, the tracking
issue, or the project board, and you need the facts rather than a guess: which
action an ID belongs to, its cadence, which phase skill implements it, or how
registration works. The four phase skills carry the Definitions of Done; this
file is the index above them.

## What the framework is

The Open Source Accessibility Framework helps open source projects make
accessibility part of how the project works, one practical step at a time. It
is released under the MIT license (copyright GitHub, Inc.), hosted by the
open-source-accessibility organization and sponsored by GitHub and Microsoft, at
[open-source-accessibility.github.io](https://open-source-accessibility.github.io/Open-Source-Accessibility-Framework/),
with source in
[open-source-accessibility/Open-Source-Accessibility-Framework](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework).

It is an improvement framework, not a certification, score or ranking. A
project that participates is making its accessibility work public and
trackable, not claiming to be accessible. Every skill in this package that
touches the framework holds to that.

- Say: the framework supports steady, visible improvement; projects start
  small and adapt the actions; progress and remaining barriers are visible;
  automated checks supplement manual testing and community feedback.
- Never say: a project is certified, compliant or fully accessible because it
  participates; completing the framework guarantees conformance with any
  standard; automated testing finds every barrier; AI output replaces
  accessibility expertise or feedback from people with disabilities.

## Phases and outcomes

The four phases, the outcome each one aims at, and the skill in this package
that implements it. The framework lists them in this order; when a user says
"phase 1" or "phase 3" they mean this order, but the framework itself does not
number phases.

| Phase | Outcome | Actions | Tasks | Skill |
|---|---|---:|---:|---|
| Foundational | Make the project's accessibility commitment visible and establish clear reporting and tracking paths | 2 | 4 | `osaf-foundational` |
| Workflow | Integrate accessibility into documentation, design, triage, pull requests, ownership, and dependency decisions | 10 | 27 | `osaf-workflow` |
| Testing | Add repeatable automated and manual accessibility checks for core experiences and documentation | 6 | 17 | `osaf-testing` |
| Community | Respond to accessibility feedback, share progress, invite participation, and support accessible collaboration | 6 | 19 | `osaf-community` |

Foundational comes first. The other three can follow in whatever order suits
the project. A "task" in the framework's counts is one item of an action's
Definition of Done.

## Effort and cadence

The framework's own definitions, used in the action index below.

- Effort: **Quick** is under an hour, **Moderate** one to three hours,
  **Extended** more than three hours. Effort varies by project size and maturity.
- Cadence: **One-time setup** is done once and revisited when needs change;
  **Initial setup + ongoing** establishes something that must then be maintained
  or used; **Ongoing** is repeated as part of normal project work.

## Action index

Every action in the framework with its exact ID, task count, typical initial
effort and cadence. The ID is the framework's slug of the action title; the
heading anchor in the phase document is the number, a hyphen, and the ID.

| Phase | No. | ID | Tasks | Effort | Cadence |
|---|---:|---|---:|---|---|
| Foundational | 1 | `create-an-accessibilitymd` | 2 | Quick | One-time setup |
| Foundational | 2 | `use-an-accessibility-label-to-track-relevant-work` | 2 | Quick | Initial setup + ongoing |
| Workflow | 1 | `surface-accessibility-expectations-for-contributors` | 3 | Moderate | Initial setup + ongoing |
| Workflow | 2 | `create-an-accessible-path-for-reporting-accessibility-bugs` | 2 | Moderate | Initial setup + ongoing |
| Workflow | 3 | `establish-a-simple-accessibility-triage-approach` | 3 | Moderate | Initial setup + ongoing |
| Workflow | 4 | `add-an-accessibility-section-to-the-pull-request-template` | 3 | Quick | Initial setup + ongoing |
| Workflow | 5 | `tag-beginner-friendly-accessibility-issues` | 2 | Quick | Ongoing |
| Workflow | 6 | `tag-accessibility-issues-where-you-need-expert-help` | 2 | Quick | Ongoing |
| Workflow | 7 | `assign-accessibility-ownership` | 2 | Quick | Initial setup + ongoing |
| Workflow | 8 | `make-docs-accessible-by-default` | 3 | Extended | Ongoing |
| Workflow | 9 | `design-accessible-interfaces` | 3 | Extended | Ongoing |
| Workflow | 10 | `evaluate-key-dependencies-and-upstream-blockers` | 4 | Extended | Ongoing |
| Testing | 1 | `add-at-least-one-automated-accessibility-check` | 3 | Moderate | Initial setup + ongoing |
| Testing | 2 | `perform-a-keyboard-only-smoke-test-for-core-flows` | 3 | Moderate | Ongoing |
| Testing | 3 | `perform-a-screen-reader-spot-check-for-core-flows` | 3 | Moderate | Ongoing |
| Testing | 4 | `perform-manual-accessibility-checks` | 3 | Extended | Ongoing |
| Testing | 5 | `perform-accessibility-checks-for-documentation` | 3 | Moderate | Ongoing |
| Testing | 6 | `document-supported-environments-and-known-limitations` | 2 | Moderate | Initial setup + ongoing |
| Community | 1 | `invite-community-help-on-accessibility-work` | 4 | Extended | Ongoing |
| Community | 2 | `respond-constructively-to-accessibility-reports` | 3 | Moderate | Ongoing |
| Community | 3 | `provide-accessible-and-respectful-ways-to-contribute-and-collaborate` | 4 | Extended | Initial setup + ongoing |
| Community | 4 | `recognize-accessibility-contributions-publicly` | 2 | Quick | Ongoing |
| Community | 5 | `publish-accessibility-progress-updates` | 3 | Moderate | Ongoing |
| Community | 6 | `share-accessibility-resources` | 3 | Moderate | Ongoing |

## Where ACCESSIBILITY.md is built

Several actions add a section to the same file, so phases that run in sequence
must extend it rather than rewrite it. Each section, with the action that asks
for it. Section names follow the framework's examples and the Accessibility
Toolkit's mature `ACCESSIBILITY.md`.

| Section | Action |
|---|---|
| Opening statement: why accessibility matters to the project | Foundational 1 |
| Priorities | Workflow 1 |
| Contributor expectations (testing, documentation and content, CI/CD) | Workflow 1, extended by Workflow 9 and used by Testing 2, 3 and 5 |
| Reporting accessibility issues, with Severity | Workflow 2 and 3 |
| How we respond | Workflow 3, extended by Community 2 |
| Resolution expectations (optional, toolkit only) | Workflow 3 |
| Ownership and maintenance | Workflow 7 |
| Dependencies and upstream blockers (no fixed name in the framework) | Workflow 10 |
| Supported environments | Testing 6 |
| Known limitations | Testing 6 |
| Feedback (toolkit only) | none; optional |

## Labels

The framework names these labels; "or a clearly understood equivalent" applies
to each. Projects that already use an equivalent keep it.

- `accessibility` - every accessibility issue and pull request (Foundational 2,
  applied by the issue form in Workflow 2)
- `accessibility` with `good first issue` - beginner-friendly work (Workflow 5,
  Community 1 and 3)
- `accessibility` with `help wanted` - work that needs expert help (Workflow 6,
  Community 1 and 3)
- `registered` - applied automatically to tracking issues in the framework's own
  repository. Never add or change labels on a tracking issue.

## Tracking issue and project board

Adopting the framework starts with a public tracking issue in the framework's
repository, opened from the form
[Track your project's progress](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/issues/new?template=project-registration.yml)
(`.github/ISSUE_TEMPLATE/project-registration.yml`).

1. The form's title is `[Open Source Accessibility Framework] <project name>`.
   Its fields, by ID: `project-name` (required), `project-repository`
   (required), `project-url` (optional), `maintainer-poc` (optional, GitHub
   handles, the at sign optional). The form applies the `registered` label,
   and a comment in its source warns that adding labels can break the
   automation that follows.
2. On open, a workflow prepends a participation message, appends a
   "Framework Progress" section with one checkbox per action for all 24
   actions, and a "Recap" table counting actions completed and left per phase.
   It then comments with a shields.io badge the project can add to its README,
   and links to the four phases.
3. A second workflow assigns the issue to the person who opened it and syncs it
   to the
   [framework project board](https://github.com/orgs/open-source-accessibility/projects/1)
   (organization project 1), setting the project name, repository, URL, point
   of contact and a completion percentage per phase.
4. The project checks an action's box when its Definition of Done is met. On
   every edit the recap table is recalculated automatically. The recap is
   marked "do not edit"; change only the checkboxes. Each checkbox line ends
   with a marker such as `<!-- framework-action:workflow-3 -->`, which the
   automation needs; keep it intact.

Opening the tracking issue publishes the project's participation. An agent
prepares it and gives the user the form link; the user, or the agent on an
explicit yes, submits it. The progress checklist states that progress is
self-reported and is not certification.

The framework also offers a short participation message for the project's own
README or `ACCESSIBILITY.md`, which links to the tracking issue and says the
participation "is not a certification or a claim that the project is fully
accessible". It is in `skills/osaf-foundational/references/action-01.md`.

## Severity

The framework's triage example and the Accessibility Toolkit use the same four
names as this package's findings schema, so a finding and an issue label can
share one vocabulary. The definitions differ slightly. Each level, with the
framework's example wording and this package's (`kb-severity-mapping`).

| Level | Framework example | This package |
|---|---|---|
| Critical | Prevents completing a core task | Blocks access entirely; no workaround |
| Serious | Significant difficulty, but a workaround exists | Severely impairs access; a workaround may exist but is unreasonable |
| Moderate | Annoyance or inconsistent experience | Friction or confusion; most users can still complete the task |
| Minor | Minimal impact on usability | Polish; no meaningful barrier for most users |

When writing a project's triage section, use the project's own definitions if it
has them, otherwise the framework's. When filing an issue from a finding, carry
the finding's severity across unchanged; the maintainer confirms severity in
triage.

## Notes on the source at the pinned commit

Facts a maintainer may want to report upstream. None of them changes a
Definition of Done.

- The framework's generated Community phase skill is stale: its bundle digest
  is `5bea61d03bf6`, but the canonical phase document hashes to `5c543d1d91eb`
  and `node scripts/generate-phase-skills.mjs --check` fails. The difference is
  wording in two recommended steps. This package follows the canonical document.
- The toolkit's `CONTRIBUTING.md` links to `ACCESSIBILITY.md#contributor-requirements`;
  the section is named "Contributor expectations", so the anchor does not resolve.
- The toolkit's `resources/community/community.md` numbers the Community actions
  in an older order. Match its resources to actions by title, not number.
- `framework/maintainers/framework-maintenance.md` links four files that are
  not in the repository at this commit: `action.yml`, the workflows
  `verify-foundational.yml` and `foundation-phase-check-comment.yml`, and
  `scripts/verify_foundational.py`. Do not tell a user they exist.
- The toolkit's community resources page links `../../phases/community-phase.md#...`,
  which does not resolve inside the toolkit repository.

## Links

- [Framework website](https://open-source-accessibility.github.io/Open-Source-Accessibility-Framework/)
- [Foundational phase](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/blob/main/framework/phases/foundational-phase.md),
  [Workflow phase](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/blob/main/framework/phases/workflow-phase.md),
  [Testing phase](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/blob/main/framework/phases/testing-phase.md),
  [Community phase](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/blob/main/framework/phases/community-phase.md)
- [Framework project board](https://github.com/orgs/open-source-accessibility/projects/1)
- [Accessibility Toolkit](https://github.com/open-source-accessibility/accessibility-toolkit),
  the reference examples: `ACCESSIBILITY.md`, `CONTRIBUTING.md`,
  `.github/ISSUE_TEMPLATE/accessibility.yml`, `.github/PULL_REQUEST_TEMPLATE.md`
- [Community Accessibility Resources](https://github.com/open-source-accessibility/accessibility-toolkit/blob/main/resources/community/community.md)
- [Accessibility best practices for your project](https://opensource.guide/accessibility-best-practices-for-your-project/),
  the Open Source Guide the phases cite
- Community discussions:
  [shoutout](https://github.com/orgs/open-source-accessibility/discussions/new?category=shoutout) and
  [show-and-tell](https://github.com/orgs/open-source-accessibility/discussions/new?category=show-and-tell)

## Source and license

Pinned to framework commit `b2ea31a2e38cbab3e774e4142575b78876b9b53f` (19
October 2026) and Accessibility Toolkit commit
`139322792d83ade29271c9bd3b0f351f649d39aa` (14 October 2026). Phase bundle
digests, computed the way the framework's generator computes them (the first
12 hex characters of the SHA-256 of the canonical phase document):
Foundational `d6f531edfd4e`, Workflow `b5c553feeaf6`, Testing `b1fd16cfeb8b`,
Community `5c543d1d91eb`.

Text here is adapted from both projects under the MIT license; the notices are
in `references/LICENSE-OSAF.md`.
