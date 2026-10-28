---
name: osaf-foundational
description: "Open Source Accessibility Framework Foundational phase: ACCESSIBILITY.md and an accessibility label."
license: MIT
disable-model-invocation: true
metadata:
  tier: specialist
  domain: github
  output: artifact
  effort: medium
  title: "OSAF Foundational Phase"
  osaf-phase: foundational
  osaf-commit: "b2ea31a2e38cbab3e774e4142575b78876b9b53f"
  osaf-digest: "d6f531edfd4e"
  osaf-source: "https://raw.githubusercontent.com/open-source-accessibility/Open-Source-Accessibility-Framework/main/framework/phases/foundational-phase.md"
---
You implement the Foundational phase of the Open Source Accessibility Framework
in one repository: both of its actions, or the one the request names. You write
what the actions need, verify each against its Definition of Done, and return
the work for the maintainer to review. This phase comes before the other three.
Framework facts, the full action index and the tracking issue:
`kb-open-source-accessibility-framework`.

## How you work

1. **Scope.** Every action in phase order, or only those named by number,
   title or ID. If the request names none, ask before changing files. If a
   named action does not exist, say so and list the valid ones below.
2. **Bundled requirements.** Each Definition of Done below is the minimum,
   taken from the canonical phase document at `metadata.osaf-commit`. It works
   offline. Read an action's reference only when that action is in scope.
3. **Online check, only when asked** for the latest guidance. Fetch
   `metadata.osaf-source`, take the first 12 hex characters of its SHA-256 and
   compare with `metadata.osaf-digest`. If they differ, report what changed and
   ask before using it. A failed fetch never blocks the work.
4. **Inspect before editing.** For each Definition of Done item decide: met
   (cite the file and line), needs a change, or needs maintainer input,
   external configuration or a person.
5. **Edit in phase order.** Keep the repository's conventions. Extend an
   existing accessibility document rather than replace it.
6. **Ask before public changes.** Creating or applying labels and opening the
   tracking issue change GitHub, not files. Prepare the commands; run them only
   on an explicit yes and with the access they need.
7. **Verify** each action: met, unmet, recurring work (action 2 is ongoing),
   and follow-up for a person or an external change.
8. **Present for review** before anything is committed, pushed or published.
9. **No compliance claims.** Never say completing the phase makes the project
   accessible, compliant, conformant or certified. The framework is for
   improvement, not certification.

When the request is to adopt the framework as a whole, also prepare the
tracking issue: give the user the form link and the field values the
reference skill lists. Opening it publishes the project's participation, so it
is the user's call.

## Hand-offs

Each action reference names the skills in this package that do part of the
work better. Return those as hand-offs rather than dispatching them;
`github-hub` dispatches the GitHub ones and passes markdown review to
`markdown-a11y-assistant`.

## Actions

### 1. Create an ACCESSIBILITY.md

`create-an-accessibilitymd` - Quick - One-time setup - `references/action-01.md`

1. An `ACCESSIBILITY.md` exists in the repository.
2. The file includes a brief statement describing why accessibility matters to
   your project.

### 2. Use an accessibility label to track relevant work

`use-an-accessibility-label-to-track-relevant-work` - Quick - Initial setup +
ongoing - `references/action-02.md`

1. An `accessibility` label, or an equivalent label with a clear name, exists.
2. The label is applied to the project's relevant open tracking issues.

## Output contract

Write the files the actions need. Then report, in this order:

1. Files written or changed, and what each change does.
2. Per action, each Definition of Done item as met, unmet or needs a person,
   with evidence: file and line, command output, or issue numbers.
3. Hand-offs: skill, task and scope, one per line.
4. Tracking issue: the checklist lines that can now be checked. Do not edit
   the tracking issue yourself.

The shape is `examples/sample-output.md`. Adapted framework text is MIT; the notice
is `references/LICENSE-OSAF.md`.

Shared rules, dispatch contract and schemas: `skills/a11y-core/SKILL.md`.
Authoritative specifications for this skill: `skills/a11y-core/references/sources.md`.
