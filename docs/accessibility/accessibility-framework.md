# Open Source Accessibility Framework in Accessibility Agents

Accessibility Agents is adopting GitHub's
[Open Source Accessibility Framework](https://open-source-accessibility.github.io/Open-Source-Accessibility-Framework/)
(source:
[open-source-accessibility/Open-Source-Accessibility-Framework](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework),
MIT). This page records each of its 24 actions for this project: whether its
definition of done is met by what is in this repository and its issue tracker,
the evidence, and for recurring actions the practice that keeps it going.

The framework is for steady, visible improvement. It is not a certification,
and completing an action is not a claim that Accessibility Agents is
accessible or conforms to any standard. Progress is self-reported. The
project-facing summary is in
[ACCESSIBILITY.md](../../ACCESSIBILITY.md#open-source-accessibility-framework),
and the public tracking issue is
[issue 52 in the framework's repository](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/issues/52).

This page is about how the project runs its own accessibility. How the
package's skills help other projects adopt the framework is in
[docs/standards/osaf.md](../standards/osaf.md).

Definitions of done follow the framework at commit
`b2ea31a2e38cbab3e774e4142575b78876b9b53f` (19 October 2026), as bundled in
this package's `osaf-foundational`, `osaf-workflow`, `osaf-testing` and
`osaf-community` skills. An action is marked done only when every item of its
definition of done is met. "Recurring" means the mechanism is in place and must
be repeated; it does not mean it has already been repeated.

## Summary

Status as of 29 October 2026, by phase.

| Phase | Done | Not done |
|---|---:|---:|
| Foundational | 2 | 0 |
| Workflow | 10 | 0 |
| Testing | 6 | 0 |
| Community | 6 | 0 |
| Total | 24 | 0 |

## Foundational phase

The two actions that make the commitment visible and give accessibility work a
label.

| No. | Action and ID | Status | Evidence |
|---:|---|---|---|
| 1 | Create an ACCESSIBILITY.md (`create-an-accessibilitymd`) | Done; recurring | [ACCESSIBILITY.md](../../ACCESSIBILITY.md) at the root; its opening says why accessibility matters to this project. Reviewed at each release and in the monthly review |
| 2 | Use an accessibility label to track relevant work (`use-an-accessibility-label-to-track-relevant-work`) | Done; recurring | The `accessibility` label exists, the issue form applies it, and it is on every open accessibility issue: #255 to #263. Earlier accessibility work was not labelled; see "Lessons learned" in [the progress update](accessibility-progress.md) |

## Workflow phase

The ten actions that put accessibility into how the project is written,
reviewed and maintained.

| No. | Action and ID | Status | Evidence |
|---:|---|---|---|
| 1 | Surface accessibility expectations for contributors (`surface-accessibility-expectations-for-contributors`) | Done; recurring | "Priorities" and "Contributor expectations" in ACCESSIBILITY.md; "Accessibility expectations" in [CONTRIBUTING.md](../../CONTRIBUTING.md#accessibility-expectations) links to them |
| 2 | Create an accessible path for reporting accessibility bugs (`create-an-accessible-path-for-reporting-accessibility-bugs`) | Done; recurring | [The accessibility issue form](../../.github/ISSUE_TEMPLATE/accessibility.yml), an email route in the form, `config.yml`, ACCESSIBILITY.md and CONTRIBUTING.md; triage and response in ACCESSIBILITY.md |
| 3 | Establish a simple accessibility triage approach (`establish-a-simple-accessibility-triage-approach`) | Done; recurring | "Reporting accessibility issues", "Severity", "How we respond" and "Resolution targets" in ACCESSIBILITY.md |
| 4 | Add an accessibility section to the pull request template (`add-an-accessibility-section-to-the-pull-request-template`) | Done; recurring | [The pull request template](../../.github/PULL_REQUEST_TEMPLATE.md): checks, documentation, findings, interfaces (now including terminal and MCP output), dependencies and release, each to tick or mark N/A |
| 5 | Tag beginner-friendly accessibility issues (`tag-beginner-friendly-accessibility-issues`) | Done; recurring | Six issues labelled `accessibility` and `good first issue`, each with what happens, what is expected, acceptance criteria and why it suits a newcomer: [#255](https://github.com/Community-Access/accessibility-agents/issues/255) (installer options), [#256](https://github.com/Community-Access/accessibility-agents/issues/256) (ASCII in MCP output), [#257](https://github.com/Community-Access/accessibility-agents/issues/257) (report wording), [#258](https://github.com/Community-Access/accessibility-agents/issues/258) (a person's keyboard pass, no code), [#259](https://github.com/Community-Access/accessibility-agents/issues/259) (testing-coach checks), [#263](https://github.com/Community-Access/accessibility-agents/issues/263) (empty headings in `check_heading_structure`) |
| 6 | Tag accessibility issues where you need expert help (`tag-accessibility-issues-where-you-need-expert-help`) | Done; recurring | Two issues labelled `accessibility` and `help wanted`, each naming the expertise: [#260](https://github.com/Community-Access/accessibility-agents/issues/260) (screen reader spot check of the core flows, by a daily screen reader user) and [#261](https://github.com/Community-Access/accessibility-agents/issues/261) (JAWS with Firefox and `aria-atomic`) |
| 7 | Assign accessibility ownership (`assign-accessibility-ownership`) | Done; recurring | "Ownership and maintenance" in ACCESSIBILITY.md: Jeff Bishop (@accesswatch), with the owner's responsibilities |
| 8 | Make docs accessible by default (`make-docs-accessible-by-default`) | Done; recurring | The Markdown accessibility linter and markdownlint run on every pull request through `npm run verify`; the documentation rules are in the contributor expectations |
| 9 | Design accessible interfaces (`design-accessible-interfaces`) | Done; recurring | "Interfaces" under "Contributor expectations" in ACCESSIBILITY.md: requirements for terminal output, MCP tool output, reports, generated HTML and documentation pages. Reviewed through the pull request checklist and the owner's review, and for agent edits by the `accessibility-lead` gate. Keyboard access, focus and labels: the agent run in [the testing record](accessibility-testing.md#runs-so-far) found no step that needs a pointer; what it found is tracked in #255, #256, #257 and #263, and visible focus and the screen reader spot check were completed in #258 and #260 (Testing, actions 2 and 3) |
| 10 | Evaluate key dependencies and upstream blockers (`evaluate-key-dependencies-and-upstream-blockers`) | Done; recurring | "Dependencies and upstream blockers" in ACCESSIBILITY.md lists the clients, Node.js, the MCP SDK, Playwright and Chromium, axe-core, veraPDF, pdf-lib, GLOW and the documentation hosts, with their effect, known barriers and workarounds. New dependencies are reviewed (contributor expectations, pull request checklist, owner responsibilities). The known upstream barrier, [anthropics/claude-code#61497](https://github.com/anthropics/claude-code/issues/61497), is linked and tracked in [#262](https://github.com/Community-Access/accessibility-agents/issues/262) with its workaround |

## Testing phase

The six actions that make checking repeatable.

| No. | Action and ID | Status | Evidence |
|---:|---|---|---|
| 1 | Add at least one automated accessibility check (`add-at-least-one-automated-accessibility-check`) | Done; recurring | `npm run verify` on every pull request (`.github/workflows/verify.yml`): the Markdown accessibility linter, markdownlint, the report self-test and the findings contract; axe-core through Playwright in `.github/workflows/playwright-high-impact-check.yml` |
| 2 | Perform a keyboard-only smoke test for core flows (`perform-a-keyboard-only-smoke-test-for-core-flows`) | Done; recurring | The six core flows have keyboard-only checks covering focus, operation, visible focus, order and traps, in [the testing document](accessibility-testing.md#keyboard-only-checks). Agent runs on 2026-10-28 (Linux) and 2026-10-29 (Windows 11) covered the installer, the Claude Code, Copilot CLI and Codex plugin commands, the MCP server and a first review; the HTML the agents write was driven with real key presses in a browser: focusable, operable, visible focus at 5.19 to 1, reading order, no trap. The accessibility owner accepted these runs as results ([#258](https://github.com/Community-Access/accessibility-agents/issues/258)). Findings are fixed: #255, #256, #263, and the table reflow fix in the same pull request. VS Code's install flow and Gemini CLI are still to be run |
| 3 | Perform a screen reader spot check for core flows (`perform-a-screen-reader-spot-check-for-core-flows`) | Done; recurring | The checks are documented per flow. The accessibility owner, Jeff Bishop, ran them on his test machine: Windows 11 Pro, JAWS 2026 (2026.2608.25.400) and NVDA 2026.2, Chrome 156 and Edge 156, recorded in [the testing document](accessibility-testing.md#runs-so-far) and [#260](https://github.com/Community-Access/accessibility-agents/issues/260). Client barriers stay tracked in #262; JAWS with Firefox is an open question in #261 |
| 4 | Perform manual accessibility checks (`perform-manual-accessibility-checks`) | Done; recurring | The checks for keyboard, descriptive and plain language, zoom and reflow, and contrast and color are documented. An agent run on 2026-10-29, accepted by the accessibility owner, checked terminal output, a generated report, the HTML report standard, and the documentation as rendered on GitHub and its wiki: 200 percent zoom, reflow at 320 CSS pixels, contrast in light and dark mode, color never the only cue, descriptive headings and labels, plain language and alternative text. Fixed in the same pull request: markup in a report's fix text rendered as HTML, a box-drawn Playwright error, and a wide table that made an HTML report scroll sideways. #257 was fixed earlier; two H1 headings on wiki pages are tracked in [#274](https://github.com/Community-Access/accessibility-agents/issues/274) |
| 5 | Perform accessibility checks for documentation (`perform-accessibility-checks-for-documentation`) | Done; recurring | "Documentation checks" in the testing document covers structure, alternatives, links, captions, tables and code blocks; all 463 Markdown files pass the linter on every pull request; the representative set was reviewed on 2026-10-28 |
| 6 | Document supported environments and known limitations (`document-supported-environments-and-known-limitations`) | Done; recurring | "Supported environments" in ACCESSIBILITY.md lists clients, operating systems, output and assistive technology, separating supported from tested and saying plainly that no screen reader test is recorded. "Known limitations" describes each barrier by its effect, with a workaround and an issue link |

## Community phase

The six actions that involve the people who use and build the project.

| No. | Action and ID | Status | Evidence |
|---:|---|---|---|
| 1 | Invite community help on accessibility work (`invite-community-help-on-accessibility-work`) | Done; recurring | "Accessibility work you can pick up" in [CONTRIBUTING.md](../../CONTRIBUTING.md#accessibility-work-you-can-pick-up), with the label searches and non-code ways to help; #255 to #263 have scope, context and acceptance criteria; questions go to the issue, Discussions or email, answered by the accessibility owner; the monthly "Accessibility feedback and progress" issue (`.github/workflows/accessibility-review.yml`) is the standing feedback practice |
| 2 | Respond constructively to accessibility reports (`respond-constructively-to-accessibility-reports`) | Done; recurring | Item 1: "How we respond" in ACCESSIBILITY.md says how to respond. Items 2 and 3: since 29 October 2026 `.github/workflows/accessibility-reports.yml` acknowledges every report, reminds the owner after 5 business days without a reply, reopens a report closed without a documented outcome (a merged fix or an `Outcome:` line), and invites the reporter to confirm a fix. Past reports are not reopened; the one still open without a reply, #207, was answered and closed with an outcome on 28 October 2026. See [the response record](#response-record) below |
| 3 | Provide accessible and respectful ways to contribute and collaborate (`provide-accessible-and-respectful-ways-to-contribute-and-collaborate`) | Done; recurring | "Taking part" in ACCESSIBILITY.md and "Ways to take part" in CONTRIBUTING.md: asynchronous text channels, how any meeting would be run, and non-code contributions; [the collaboration tools review](#collaboration-tools-review) below; [the Code of Conduct](../../CODE_OF_CONDUCT.md), which names dismissing accessibility concerns, mocking assistive technology users and publishing private information, and now names the address to report to; a private accommodation route by email |
| 4 | Recognize accessibility contributions publicly (`recognize-accessibility-contributions-publicly`) | Done; recurring | The practice is in ACCESSIBILITY.md and [below](#recognition-practice). Past accessibility contributions, made before the credit rule took effect, are credited by public handle under "Past accessibility contributions" in [ACCESSIBILITY.md](../../ACCESSIBILITY.md#past-accessibility-contributions), as the accessibility owner decided; from 29 October 2026 `.github/workflows/accessibility-credits.yml` asks each new contributor how to be credited |
| 5 | Publish accessibility progress updates (`publish-accessibility-progress-updates`) | Done; recurring | The first update is [the progress page](accessibility-progress.md), linked from ACCESSIBILITY.md and the README. It lists completed work, remaining work, known barriers and links. The practice, monthly prompted by the review issue and linked from each release's notes, is in ACCESSIBILITY.md and [below](#progress-update-practice) |
| 6 | Share accessibility resources (`share-accessibility-resources`) | Done; recurring | [The resources page](accessibility-resources.md): the testing procedure and record, the Markdown linter, the issue form, the pull request checklist, the monthly review workflow and the framework skills, each with the problem it solves, prerequisites, limitations and where it does not apply; maintained by the accessibility owner |

### Response record

How past reports were answered, checked on 28 October 2026 against the
practice in "How we respond". None carried the `accessibility` label, so the
reports below were chosen by reading the issues, not by the label.

- Before June 2026, reports about the agents' accessibility guidance were
  answered within about two days with an acknowledgement, the fix and a link:
  for example #44 and #49 (March 2026). Some were closed without a comment
  (#58 and #84).
- From June to September 2026, reports waited weeks to months. #153, an
  install failure on Windows 11 opened on 14 June, was bumped by its reporter
  in July and answered on 28 October, with an apology, the cause, the fix and
  the current install steps. #198, a wrong contrast threshold opened on 9
  September, was answered and closed on 28 October with the fix and how to
  upgrade. Both answers meet the "acknowledgement, status and next step"
  standard; neither met the five business day target.
- #207, four screen reader verbosity gaps reported on 29 September, had no
  reply on the issue, although the reporter's four pull requests were answered
  and their content landed in 7.1.0. On 28 October 2026 it was answered with
  where each finding stands, closed with an `Outcome:` line, and the reporter
  was invited to confirm the fixes.
- No fix has yet been validated with the affected user before closing.

The owner, Jeff Bishop, decided that past reports are not reopened: the
gaps above are history, and the rule now prevents them. From 29 October 2026,
`.github/workflows/accessibility-reports.yml` acknowledges every new report,
reminds the owner after 5 business days without a reply, reopens a report
closed without a documented outcome (a merged fix or an `Outcome:` line), and
invites the reporter to confirm a fix. The monthly review issue still asks
whether every open report has been acknowledged.

### Collaboration tools review

The tools people use to take part, what was checked and the alternative
offered. Reviewed on 28 October 2026 by an AI agent working for the
maintainer, from each tool's documentation and this project's own
configuration; none has yet been reviewed by a person using assistive
technology, and comments on the monthly review issue are welcome.

| Tool | What was checked | Alternative |
|---|---|---|
| GitHub issues and pull requests | GitHub documents its own accessibility at [accessibility.github.com](https://accessibility.github.com/documentation). The accessibility issue form has plain labels, no required disclosure, and accepts partial reports | Email |
| GitHub Discussions | Enabled, with Announcements, General and Q&A categories; the same GitHub interface as issues | Email |
| The Community Access support hub | A GitHub repository with issues and discussions, the same interface | Email |
| Email ([jeff@jeffbishop.com](mailto:jeff@jeffbishop.com)) | Plain text, any client, private | None needed |
| Meetings and calls | None are held or required | Not applicable |
| The clients (Claude Code, Copilot, Codex, Gemini CLI, Antigravity) | Needed to use the package, not to contribute. Known barriers are in "Dependencies and upstream blockers" in ACCESSIBILITY.md | Contributions to the Markdown skills need only a text editor and Git |

### Recognition practice

- Before crediting anyone by name or handle, the maintainer asks how they want
  to be credited (name, handle, or not at all) and records the answer on the
  issue or pull request.
- Credit describes the work, never the person's disability or assistive
  technology, even if they mentioned it.
- Accessibility contributions, including testing, reports, reviews and
  documentation, are credited in `CHANGELOG.md` and the release notes for the
  release that ships them, in the form the contributor chose, and may be shared
  in the
  [Open Source Accessibility community shoutouts](https://github.com/orgs/open-source-accessibility/discussions/new?category=shoutout).
- Contributions made before 29 October 2026, when the credit rule took
  effect, have no credit question on record. The accessibility owner decided
  that the rule does not reach back to them: they are credited by public
  GitHub handle and the work only, under "Past accessibility contributions" in
  ACCESSIBILITY.md, and anyone listed can ask to be named differently or left
  out.
- `.github/workflows/accessibility-credits.yml` asks the question on each
  accessibility contribution from outside the maintainers and records the
  answer as a `credit: yes`, `credit: anonymous` or `credit: no` label.
- Release step: before publishing a release, run
  `node .github/scripts/a11y-credits.mjs --since <previous tag>` and paste the
  block it prints into the release notes and `CHANGELOG.md`. It lists items
  labelled `credit: yes` or `credit: anonymous` closed since that tag, as code
  and other contributions, and warns about `credit: asked` items with no
  answer after 14 days: leave those contributors out, or ask them again.

### Progress update practice

- One update a month in [the progress page](accessibility-progress.md), newest
  first, prompted by the "Accessibility feedback and progress" issue that
  `.github/workflows/accessibility-review.yml` opens on the first of each month.
  Each release's notes link to the latest update.
- Each update covers what was completed, what is open with its workaround,
  known limitations, lessons learned, and links to issues and pull requests.
  Counts are counts, not scores.
- The framework tracking issue is updated at the same time, checking only the
  actions whose definition of done is met. The skills never edit it; the
  maintainer does.
