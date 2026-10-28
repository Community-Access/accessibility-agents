---
name: osaf-community
description: "Open Source Accessibility Framework Community phase: reports, participation, recognition, progress, resources."
license: MIT
disable-model-invocation: true
metadata:
  tier: specialist
  domain: github
  output: artifact
  effort: medium
  title: "OSAF Community Phase"
  osaf-phase: community
  osaf-commit: "b2ea31a2e38cbab3e774e4142575b78876b9b53f"
  osaf-digest: "5c543d1d91eb"
  osaf-source: "https://raw.githubusercontent.com/open-source-accessibility/Open-Source-Accessibility-Framework/main/framework/phases/community-phase.md"
---
You implement the Community phase of the Open Source Accessibility Framework in
one repository: all six actions, or those the request names. Most of this phase
is practice and relationships, so you write the documents and drafts, and the
maintainer decides what is published. Facts and the action index:
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
4. **Inspect before editing.** Per item: met (cite file, line or URL), needs a
   change, or needs maintainer input, external configuration or a person.
5. **Edit in phase order**, keep repository conventions, extend
   `ACCESSIBILITY.md` rather than replace it.
6. **Protect contributor privacy and choice.** Never infer consent, disclose
   disability-related or accommodation information, speak for a disability
   community, or publish recognition or community messages without
   authorization.
7. **Draft, do not post.** Comments, discussions, release notes and updates are
   drafts until the maintainer approves each one.
8. **Verify and present.** Per action: met, unmet, recurring work, follow-up.
   Present for review before anything is committed or published.
9. **No compliance claims.** The framework is for improvement, not
   certification.

Work another skill does better goes back as a hand-off, named in each action
reference; `github-hub` dispatches it. Principles for every action, from the
Accessibility Toolkit: `references/principles.md`.

## Actions

1. Invite community help on accessibility work -
   `invite-community-help-on-accessibility-work`, Ongoing -
   `references/action-01.md`
   - Community-contribution opportunities are publicly available.
   - Issues include scope, context, and acceptance criteria.
   - Contributors can access guidance and maintainer support.
   - The project maintains an ongoing feedback or advisory practice.
2. Respond constructively to accessibility reports -
   `respond-constructively-to-accessibility-reports`, Ongoing -
   `references/action-02.md`
   - Best practices on how to respond are documented in your `ACCESSIBILITY.md`.
   - Accessibility reports receive a respectful acknowledgement, status, and
     next step response.
   - Resolution outcomes are documented and, when possible, accessibility fixes
     get validated with affected users.
3. Provide accessible and respectful ways to contribute and collaborate -
   `provide-accessible-and-respectful-ways-to-contribute-and-collaborate`,
   Initial setup + ongoing - `references/action-03.md`
   - Contributor guidance documents accessible synchronous and asynchronous
     ways to participate.
   - Collaboration tools and workflows have been reviewed for significant
     accessibility and usability barriers, with alternatives documented as
     needed.
   - A code of conduct or equivalent policy is adopted and enforced.
   - Contributors can request accommodations without unnecessary public
     disclosure.
4. Recognize accessibility contributions publicly -
   `recognize-accessibility-contributions-publicly`, Ongoing -
   `references/action-04.md`
   - Recognition respects contributor preferences and protects personal
     information.
   - Accessibility contributions are publicly recognized with the contributor's
     consent.
5. Publish accessibility progress updates -
   `publish-accessibility-progress-updates`, Ongoing - `references/action-05.md`
   - Accessibility progress is published through at least one public project
     channel.
   - Updates include completed work, remaining work, known barriers or
     limitations, and relevant links.
   - The project maintains a repeatable update practice.
6. Share accessibility resources - `share-accessibility-resources`, Ongoing -
   `references/action-06.md`
   - Useful accessibility resources are made publicly available.
   - Resources include enough context for another project to use them.
   - Ownership for maintaining the resources is identified.

## Output contract

Write the files, then report: files and what each change does; drafts awaiting
approval, each with where it would be posted; each Definition of Done item as
met, unmet or needs a person, with evidence; hand-offs (skill, task, scope);
tracking issue lines that can now be checked (never edit it). Shape:
`examples/sample-output.md`. License: `references/LICENSE-OSAF.md`.

Shared rules, dispatch contract and schemas: `skills/a11y-core/SKILL.md`.
Authoritative specifications for this skill: `skills/a11y-core/references/sources.md`.
