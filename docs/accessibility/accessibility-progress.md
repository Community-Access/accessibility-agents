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

- **We took the Open Source Accessibility Framework to 20 of its 24
  actions,** up from 11, as recorded action by action in
  [the framework record](accessibility-framework.md). The twentieth is
  responding constructively to reports: from 29 October 2026 the
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

Nine issues are open with the `accessibility` label:

- [#260](https://github.com/Community-Access/accessibility-agents/issues/260):
  no screen reader test of the core flows has been recorded. Help wanted from
  someone who uses a screen reader every day.
- [#261](https://github.com/Community-Access/accessibility-agents/issues/261):
  does an explicit `aria-atomic="true"` silence a live region in JAWS with
  Firefox? Help wanted from a JAWS user.
- [#258](https://github.com/Community-Access/accessibility-agents/issues/258):
  a person's keyboard-only pass of the flows. A good first issue; no code.
- [#255](https://github.com/Community-Access/accessibility-agents/issues/255):
  `npm run setup -- --help` installs instead of printing help. Workaround:
  always run `npm run setup -- --dry-run` first.
- [#256](https://github.com/Community-Access/accessibility-agents/issues/256):
  a few MCP tool messages contain non-ASCII symbols.
- [#257](https://github.com/Community-Access/accessibility-agents/issues/257):
  reports say "1 findings".
- [#263](https://github.com/Community-Access/accessibility-agents/issues/263):
  `check_heading_structure` does not report an empty heading.
- [#259](https://github.com/Community-Access/accessibility-agents/issues/259):
  the testing-coach procedure does not yet listen for two verbosity problems.
- [#262](https://github.com/Community-Access/accessibility-agents/issues/262):
  barriers in the clients themselves, tracked upstream.

Report [#207](https://github.com/Community-Access/accessibility-agents/issues/207),
which had waited a month without a reply on the issue, was answered and closed
with an outcome on 28 October 2026; its remaining work continues in #259 and
#261. Past reports are not reopened.

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
