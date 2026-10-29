# Accessibility Progress Updates

What has changed in Accessibility Agents' own accessibility, what is still
open, and what we know is not yet good enough. The newest update is first. Our
commitments are in [ACCESSIBILITY.md](../../ACCESSIBILITY.md).

A new update is written each month, prompted by the "Accessibility feedback
and progress" issue that `.github/workflows/accessibility-review.yml` opens on
the first of the month, and each release's notes link to the latest one.
Counts are counts of work, not a score: no number here says how accessible the
project is.

## October 2026

### Completed

- **We completed all 24 actions of the Open Source Accessibility
  Framework,** up from 11 at the start of the month, as recorded action by
  action in [the framework record](accessibility-framework.md). Completing
  the checklist is not the end of the work: the recurring actions go on every
  month. The last four, on 29 October 2026:
  - a keyboard-only smoke test and manual checks of the core flows, run by an
    agent with real key presses and accepted by the accessibility owner as
    results, which found and fixed three barriers (in
    [the testing record](accessibility-testing.md#runs-so-far));
  - a screen reader spot check by the accessibility owner with JAWS and NVDA
    in Chrome and Edge on Windows 11;
  - credit, by public handle, for the accessibility contributions made before
    the credit rule took effect, under "Past accessibility contributions" in
    ACCESSIBILITY.md.
- **Responding to reports is enforced:** from 29 October 2026 the
  accessibility-reports workflow acknowledges every report, reminds the owner
  after 5 business days without a reply, reopens a report closed without a
  documented outcome, and invites the reporter to confirm a fix.
- **Interface requirements** for everything people meet: terminal output, MCP
  tool output, reports, generated HTML and documentation pages, under
  "Contributor expectations" in ACCESSIBILITY.md, and in the pull request
  checklist.
- **A dependency record** in ACCESSIBILITY.md: the clients, the scanners and
  the runtime this project relies on, what each affects, and the workaround
  for each known barrier.
- **Documented tests for the six core flows,** from installing in each client
  to reading a report, in [the testing document](accessibility-testing.md),
  with an agent's first run recorded and labelled as such.
- **Nine labelled issues** that anyone can pick up, each with acceptance
  criteria: six good first issues and two where we need expert help, plus one
  tracking upstream barriers.
- **Fixes to the agents' accessibility guidance in 7.1.0,** from reports and
  pull requests: contrast thresholds in points rather than pixels (#198),
  placeholder guidance for labelled fields, flex and grid text runs, and
  streaming transcripts kept out of live regions (#207), and PDF/UA checkpoint
  corrections (#201, #202). The detail is in the
  [changelog](../../CHANGELOG.md).
- **A monthly feedback and progress issue,** open to anyone, and a named
  address for reporting Code of Conduct concerns.

### In progress and open

Closed this month: #255, #256, #257 and #263 (fixed on `main`, in the next
release), #259 (the testing coach's two new checks), and #258 and #260 (the
keyboard and screen reader runs). Three issues are open with the
`accessibility` label:

- [#261](https://github.com/Community-Access/accessibility-agents/issues/261):
  does an explicit `aria-atomic="true"` silence a live region in JAWS with
  Firefox? Help wanted from a JAWS user with Firefox.
- [#262](https://github.com/Community-Access/accessibility-agents/issues/262):
  barriers in the clients themselves, tracked upstream.
- [#274](https://github.com/Community-Access/accessibility-agents/issues/274):
  wiki pages have two level-one headings.

Report [#207](https://github.com/Community-Access/accessibility-agents/issues/207),
which had waited a month without a reply on the issue, was answered and closed
with an outcome on 28 October 2026; its remaining work continued in #259,
now closed, and #261. Past reports are not reopened.

### Known limitations

See [Known limitations](../../ACCESSIBILITY.md#known-limitations) in
ACCESSIBILITY.md.

### Lessons learned

- Until this month no issue in the repository carried the `accessibility`
  label, although much of the work was accessibility work. From now on,
  barriers in the project and fixes to its accessibility guidance carry the
  label, so the tracker shows them.
- Reports from June to September waited weeks or months for a first reply,
  against a published target of five business days. The monthly review now
  asks, every month, whether every open report has been acknowledged.
- An agent can run every command in the core flows and read what they print,
  but cannot see focus or hear a screen reader. Recording which checks a
  person still has to make kept those apart.

### How to help

Pick up an issue labelled
[accessibility](https://github.com/Community-Access/accessibility-agents/issues?q=is%3Aissue+is%3Aopen+label%3Aaccessibility),
comment on the month's feedback issue, or report a barrier with the
[accessibility issue form](https://github.com/Community-Access/accessibility-agents/issues/new?template=accessibility.yml)
or by email to [jeff@jeffbishop.com](mailto:jeff@jeffbishop.com).
