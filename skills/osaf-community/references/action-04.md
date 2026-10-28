# Community action 4: Recognize accessibility contributions publicly

Part of the `osaf-community` skill. Read this when action 4 is in scope.

- ID: `recognize-accessibility-contributions-publicly`
- Effort and cadence: Quick; Ongoing
- Canonical source: [Community phase, action 4](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/blob/b2ea31a2e38cbab3e774e4142575b78876b9b53f/framework/phases/community-phase.md#4-recognize-accessibility-contributions-publicly)

## Why it matters

Public recognition shows that accessibility work, including contributions
beyond source code, is valued.

## Definition of Done

1. Recognition respects contributor preferences and protects personal
   information.
2. Accessibility contributions are publicly recognized with the contributor's
   consent.

## Recommended steps, adapted from the framework

1. Ask contributors how they want to be recognized and obtain their consent.
   - Ask contributors how they would like to receive credit.
   - Never disclose a contributor's disability, diagnosis, assistive technology
     use, or other personal information without permission.
   - Do not tokenize contributors or present anyone as representing an entire
     disability community.
2. Recognize accessibility contributions in release notes, community updates,
   contributor lists, discussions, project websites, or other appropriate
   channels.
   - Include contributions beyond code, such as documentation, testing,
     research, design feedback, mentoring, translation, event support, and
     remediation guidance.
   - Consider sharing contributions in the
     [Open Source Accessibility community shoutout](https://github.com/orgs/open-source-accessibility/discussions/new?category=shoutout).
   - Present accessibility work as valuable project work, not charity or an
     exceptional favor.

## How to do it in this repository

- **Consent comes first and is per person.** You cannot obtain consent; the
  maintainer asks. Draft the question for them to send, and record each
  contributor's answer before anything names them. Never infer consent from a
  public commit or comment.
- **Find the contributions** from merged pull requests and closed issues with
  the accessibility label since the last release, plus non-code work the
  maintainer names (testing, reports, reviews). Public GitHub data only.
- **Write the credit in the contributor's chosen form**: handle, name, or
  anonymous. Describe the work, never the person's disability or assistive
  technology, even if they mentioned it in an issue.
- **Pick the channel** the project already uses: release notes, a contributors
  list, a discussion post.
- **Make it a practice.** Suggest a line in the release checklist: "credit
  accessibility contributions, with consent". Ongoing; report it as recurring.

## Hand-offs

- `release-manager` - add the approved credits to a draft release's notes; it
  can generate notes from merged pull requests grouped by label.
- `contributions-hub` - list contributors by activity, and draft a discussion
  post for approval.

## Evidence to report

- Each contribution proposed for credit, and whether consent is recorded.
- Where the approved credit appears, with a link.
- The release checklist line, if added.
