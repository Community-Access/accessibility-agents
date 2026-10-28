# Accessibility

Accessibility Agents exists so that the software people build with AI coding
agents works for disabled people. The same promise applies to this project:
everyone, including people who use a screen reader, magnification, voice
control, a switch or the keyboard alone, should be able to install it, read
what it reports, read its documentation and contribute to it.

This document describes our accessibility priorities, what we ask of
contributors, how to report a barrier, how we respond, how to take part, who
owns this work, the dependencies we rely on, what we test on, and what we know
is not yet good enough. The records behind it are in
[docs/accessibility](docs/accessibility/): the
[testing procedure and record](docs/accessibility/accessibility-testing.md),
[progress updates](docs/accessibility/accessibility-progress.md),
[reusable resources](docs/accessibility/accessibility-resources.md) and
[the framework record](docs/accessibility/accessibility-framework.md). It follows the
[Open Source Accessibility Framework](https://open-source-accessibility.github.io/Open-Source-Accessibility-Framework/),
an improvement framework from GitHub, not a certification. Our progress
through its four phases is tracked in [the framework section](#open-source-accessibility-framework)
below.

## Priorities

- **Target:** we work toward [WCAG 2.2](https://www.w3.org/TR/WCAG22/) Level
  AA for everything a person reads or operates: the documentation, the reports
  the agents write, and the text the installer and the MCP server print. This
  is a goal that guides our work, not a claim of verified conformance.
- **Text first.** This project is used from terminals, editors and chat
  panes. Its output is plain text and Markdown, so it reads well with a screen
  reader and survives copy and paste. The house style in
  [AGENTS.md](AGENTS.md) forbids emoji, decorative Unicode, box drawing and
  icon bullets, because a screen reader announces each of them by name.
- **Reports a person can navigate.** Every audit report has the same headings
  in the same order, real tables with header rows, and findings that name the
  WCAG criterion, the location and the fix in words, not color or position.
- **Documentation that works with assistive technology.** One H1 per page, no
  skipped heading levels, descriptive link text, a sentence before every table
  saying what its rows are, alternative text for every image, and code in
  fenced blocks with a language.
- **Keyboard and screen reader use of everything we ship that has an
  interface,** including any HTML the agents generate.

## Contributor expectations

These apply to every pull request. [CONTRIBUTING.md](CONTRIBUTING.md) says how
to run the checks.

- **Run the gates.** `npm run verify` runs every check, including the Markdown
  accessibility linter and markdownlint. A pull request that adds a Markdown
  accessibility error does not merge.
- **Follow the house style** in [AGENTS.md](AGENTS.md): plain ASCII
  punctuation, hyphen bullets, no emoji or decorative characters.
- **Documentation and skill text:**
  - Use a logical heading hierarchy, one H1 per file, and real lists.
  - Write unique, descriptive link text; never "click here" or "read more".
  - Give every image meaningful alternative text, or mark it decorative; add a
    text alternative near any diagram.
  - Put a one-sentence description before each table, and give it a header row.
  - Do not convey meaning by color, position or styling alone.
  - Use plain language and spell out an abbreviation the first time.
- **Skills and reports:** findings follow the schema in
  [skills/a11y-core](skills/a11y-core/SKILL.md): a WCAG criterion, a severity,
  a location and a fix for every finding, and nothing that depends on visual
  formatting to be understood.
- **Interfaces.** This project has no graphical interface of its own; people
  meet it through the interfaces below. A change to any of them meets these
  requirements, and the pull request says what was tested. The checks are in
  [the testing document](docs/accessibility/accessibility-testing.md).
  - **Terminal output** (the installer, `npm run` scripts, hook messages):
    plain ASCII text, read in the order things happen; status in words
    (`write`, `skip`, `PASS`, `FAIL`), never a symbol or color alone; no
    spinners or redrawn lines; no prompt that needs a pointer, and none that
    cannot be left with Ctrl+C; `--help` explains the options, and an unknown
    option is refused with one line that names it, not acted on; an error is a
    sentence that says what to do next, not only a stack trace.
  - **MCP tool output:** every tool returns text a person can read as well as
    structured content; the text names the problem, the location and the fix
    in words, in plain ASCII, with severity as a word.
  - **Reports** (`*-ACCESSIBILITY-AUDIT.md`): one H1, the required sections in
    the same order, real tables with a header row and a sentence before each,
    every finding's criterion, severity, location and fix in words, counts
    that match their nouns, and nothing carried by color, emoji or position.
  - **Generated HTML** (an HTML report, a page in `example/` apart from its
    intentional defects, a dashboard): a `lang`, a title, landmarks including
    `main`, one H1, labelled controls, a visible focus indicator with at least
    3:1 contrast, a logical focus order and no keyboard trap; text contrast
    4.5:1 and interface components 3:1; reflow at 400 percent zoom; reduced
    motion respected. Do a keyboard-only pass and a screen reader spot check.
  - **Documentation pages:** the documentation rules above, read as rendered on
    GitHub, where the pages are published.
- **Dependencies:** a new dependency that shapes what users meet (a client
  integration, a scanner, a document library, anything that writes output a
  person reads) needs a short accessibility review before it is adopted: what
  it affects, its known accessibility issues upstream, and our workaround. Add
  it to [Dependencies and upstream blockers](#dependencies-and-upstream-blockers).
- **Accessibility claims** must be sourced. Facts about standards, law and
  tools cite a primary source, as [the citation policy](docs/standards/citation-policy.md)
  requires.

## Reporting accessibility issues

If something in this project is hard or impossible for you to use, please
tell us. Accessibility reports are expertise, not complaints.

- **On GitHub:** open an issue with the
  [accessibility issue form](https://github.com/Community-Access/accessibility-agents/issues/new?template=accessibility.yml).
  Partial reports are welcome.
- **By email, if GitHub is a barrier for you, or you would rather not post
  publicly:** write to [jeff@jeffbishop.com](mailto:jeff@jeffbishop.com). We
  will file the issue for you if you want one, and keep your details private
  if you ask.

Helpful details, all optional:

- What you were trying to do, and what happened instead.
- Where: the command, file, report, documentation page or URL.
- Your operating system, the client you use (Claude Code, Copilot CLI, VS Code,
  Codex, Gemini CLI, Antigravity) and your assistive technology, with versions.
- How much it gets in your way (see [Severity](#severity)).

You never need to tell us about a disability or diagnosis.

### Severity

We use the same four levels as the findings this project produces. Reporters
do not need to choose one; we assign or confirm it during triage.

- **Critical:** you cannot complete a core task, such as installing the
  package, running an audit or reading its report.
- **Serious:** you can complete the task only with real difficulty or a
  workaround.
- **Moderate:** the task works but is confusing, slow or inconsistent.
- **Minor:** a small problem with little effect on getting things done.

### How we respond

- We acknowledge every accessibility report within **5 business days**,
  respectfully, and say what happens next.
- We do not ask you to justify your experience or disclose personal
  information. If we need more detail, we ask specific questions.
- Where we can, we offer a workaround while a fix is in progress.
- We post an update on the issue whenever its status or expected timing
  changes, and link the pull request that fixes it.
- When a fix lands, we ask you, or another person affected, whether you would
  like to confirm it works before we close the issue. We write down the
  outcome before closing: what changed and in which release, or why it cannot
  change and what to do instead.
- We thank you, and credit you in the release notes only in the way you
  choose, or not at all (see [Recognition](#recognition)).

When we answer a report, we:

- thank the reporter and restate the barrier in their terms, so they can tell
  we understood;
- give the severity, the status and the next step, and a workaround if there
  is one;
- ask only about the environment and the steps, never whether the barrier is
  real, and never for a diagnosis;
- keep the conversation on the issue, or in email if the reporter prefers, and
  say plainly when something is outside our control and who does control it.

Two workflows hold us to this for reports opened from 29 October 2026 on.
Their logic and its tests are in `.github/scripts/a11y-community.mjs`.

- **When you report a barrier,** a bot replies once: it thanks you, says a
  maintainer will reply with a status and a next step within 5 business days,
  points you to the known limitations, and invites, but never requires,
  details of your setup. The issue is labelled `a11y: awaiting response` until
  a maintainer comments.
- **If no maintainer has replied after 5 business days** (Monday to Friday),
  the issue is labelled `a11y: response overdue` and the accessibility owner
  is reminded on the issue.
- **A report cannot close without an outcome.** Maintainers close it from the
  pull request or commit that fixes it, or write a comment with a line that
  starts `Outcome:`, after the reporter's last comment, saying what changed or
  why it cannot. A report closed without either is reopened automatically,
  with a note saying how to add one. When a report closes as fixed, you are
  invited to confirm that the fix works for you, and the issue is labelled
  `a11y: validation requested`.

### Resolution targets

After triage, each accessibility issue gets a severity and an owner, and these
targets, counted from when the issue is opened:

- **Critical:** fixed, or a documented workaround published, within 30 days,
  and in the next release where possible.
- **Serious:** within 60 days.
- **Moderate and minor:** within 90 days.

If we cannot meet a target, we say why on the issue, share any workaround, and
give a new date.

## Taking part

Everything in this project can be done asynchronously and in text: issues,
pull requests and [Discussions](https://github.com/Community-Access/accessibility-agents/discussions)
on GitHub, the [Community Access support hub](https://github.com/Community-Access/support),
or email to the address above. There are no meetings or calls, and none is
required to contribute. If one is ever held, the agenda is posted in advance,
notes are posted afterwards in Discussions, and nobody needs a camera or to
speak to take part.

If a tool or process we use is a barrier for you, or you need an
accommodation to contribute, email us privately; you do not need to explain
why. The tools we use, and what was checked, are in
[the collaboration tools review](docs/accessibility/accessibility-framework.md#collaboration-tools-review).
Everyone who takes part follows the [Code of Conduct](CODE_OF_CONDUCT.md),
which names dismissing accessibility concerns, mocking assistive technology
users and publishing private information as unacceptable, and says where to
report it. The maintainer enforces it.

### How to help

Accessibility work anyone can pick up is labelled, each issue with its scope
and acceptance criteria:

- [Good first issues](https://github.com/Community-Access/accessibility-agents/issues?q=is%3Aissue+is%3Aopen+label%3Aaccessibility+label%3A%22good+first+issue%22),
  small and self-contained, some with no code at all.
- [Help wanted](https://github.com/Community-Access/accessibility-agents/issues?q=is%3Aissue+is%3Aopen+label%3Aaccessibility+label%3A%22help+wanted%22),
  where we need specialist knowledge or lived experience, such as daily use of
  a screen reader.

Work that is not code is just as welcome: running the
[core-flow checks](docs/accessibility/accessibility-testing.md) with your own
client and assistive technology, reproducing a report, reviewing
documentation, or telling us what gets in your way on the month's
"Accessibility feedback and progress" issue, which is open to everyone and
which the accessibility owner answers. Questions go on the issue you are
working on, in Discussions, or to the email address above.

### Recognition

We credit accessibility contributions, including testing, reports, reviews and
documentation, in the changelog and release notes of the release that ships
them, and only with your agreement: before naming you, we ask how you want to
be credited (your name, your handle, or not at all) and record the answer on
the issue or pull request. Credit describes the work, never a person's
disability or assistive technology.

A workflow asks for you. When an accessibility pull request from outside the
maintainers is merged, or your report closes as fixed, a bot asks you once how
you would like to be credited, and you reply with one line: `credit: @handle`,
`credit: name <Name>`, `credit: anonymous` or `credit: no`. Only your own reply
counts, you can change it later, and nothing about you beyond the credit you
choose is published. The answer is recorded as a `credit:` label, and each
release's credits are listed from those labels.

### Progress updates

We publish an accessibility progress update each month, in
[docs/accessibility/accessibility-progress.md](docs/accessibility/accessibility-progress.md):
what was completed, what is open, known limitations and lessons learned, with
links. The monthly "Accessibility feedback and progress" issue, opened by
`.github/workflows/accessibility-review.yml`, prompts it, and each release's
notes link to the latest update.

## Ownership and maintenance

Accessibility is owned by **Jeff Bishop**, project maintainer
([@accesswatch](https://github.com/accesswatch) on GitHub,
[jeff@jeffbishop.com](mailto:jeff@jeffbishop.com)).

The accessibility owner:

- triages accessibility reports and assigns severity;
- keeps accessibility work visible with the `accessibility` label, and marks
  suitable issues `good first issue` or `help wanted` with context and
  acceptance criteria;
- reviews pull requests against the contributor expectations above;
- reviews the accessibility of new dependencies before they are adopted;
- works through the monthly accessibility review issue: answers feedback,
  checks open reports against the targets above, writes the progress update
  and records any test runs;
- maintains the resources in
  [docs/accessibility/accessibility-resources.md](docs/accessibility/accessibility-resources.md);
- keeps this document, the known limitations and the framework progress
  current, reviewing them at each release.

If ownership changes, this section is updated in the same pull request that
changes [CODEOWNERS](.github/CODEOWNERS).

## Dependencies and upstream blockers

The third-party software that most affects what people meet when they use
Accessibility Agents, what each affects, and what we know about it. "No known
barrier" means none is recorded yet, not that none exists. Barriers in the
clients are tracked together in
[#262](https://github.com/Community-Access/accessibility-agents/issues/262).

| Dependency | Affects | Known barriers and mitigation |
|---|---|---|
| [Claude Code](https://code.claude.com/docs/en/accessibility) | Installing the plugin, the chat, permission prompts, reading results | Its terminal interface was hard to use with a screen reader until its screen reader mode (`claude --ax-screen-reader`, v2.1.181 and later; [anthropics/claude-code#11002](https://github.com/anthropics/claude-code/issues/11002), completed). The `/mcp` dialog announced one server while Enter chose another with NVDA ([anthropics/claude-code#61497](https://github.com/anthropics/claude-code/issues/61497), closed as not planned); use screen reader mode, or `claude mcp list` and `claude plugin list` from the shell. `claude plugin` commands mark success with a square root sign; the words after it carry the meaning |
| GitHub Copilot CLI | Installing the plugin, the chat | No screen reader mode is documented in its [command reference](https://docs.github.com/en/copilot/reference/cli-command-reference); it offers `high-contrast` and `colorblind` themes. Not yet tested with a screen reader |
| GitHub Copilot in VS Code | Installing from source, the chat view | VS Code's screen reader mode and accessible view; GitHub documents both for [Copilot in VS Code](https://accessibility.github.com/documentation/guide/github-copilot-vsc). Not yet tested for our flows |
| Codex and Antigravity | Installing, the chat | Not yet reviewed |
| Gemini CLI | Installing the extension, the chat | Documents a screen reader setting, `ui.accessibility.screenReader`, which renders plain text ([settings](https://geminicli.com/docs/cli/settings/)). Not yet tested for our flows |
| Node.js 22 or later | The installer, the MCP server, every script | No known barrier. Output is whatever the scripts print |
| [Model Context Protocol](https://modelcontextprotocol.io/) SDK | How tool results reach the client | No known barrier. Each tool returns text as well as structured content, so a client that shows only text still gets the full result |
| Playwright with Chromium, and [axe-core](https://github.com/dequelabs/axe-core) | The browser scans (`run_axe_scan` and the `run_playwright_*` tools) | Automated rules find some barriers, never all. The scans use Chromium only, so behavior that differs in WebKit, such as the split flex and grid text runs in #207, is not seen; the skills say to confirm those in Safari with VoiceOver |
| [veraPDF](https://verapdf.org/) and Java | PDF/UA validation (`run_verapdf_scan`) | No known barrier. Optional; the baseline PDF scan works without it, and the tool says how to install it when missing |
| pdf-lib | Converting PDF forms to HTML | The generated HTML is checked against the interface requirements above only by the person who runs it |
| GLOW, at its API | The `glow_*` tools | An external service with its own [accessibility statement](https://github.com/Community-Access/glow/blob/main/ACCESSIBILITY.md); its output inherits its known limitations |
| GitHub and its wiki | Where the documentation is read | GitHub documents its own accessibility at [accessibility.github.com](https://accessibility.github.com/documentation). The wiki copy of `docs/` is generated; its relative links can differ from the repository's |

No upstream blocker currently stops us fixing a barrier in this project. The
client barriers above are linked and tracked in #262, with the workaround we
offer in the meantime; the monthly review checks them for movement, and this
list is reviewed when a dependency is added or upgraded.

## Supported environments

What we support and what we have evaluated:

- **Clients:** Claude Code, GitHub Copilot CLI, VS Code agent plugins, Codex,
  Gemini CLI and Antigravity, as described in [getting started](docs/getting-started/README.md).
- **Operating systems:** Windows, macOS and Linux, with Node.js 26, 24 or 22.
- **Output:** plain text in the terminal, and Markdown reports, which read
  with any screen reader in an editor, a terminal pager or a browser rendering
  the Markdown.
- **Assistive technology:** the project is designed for use with NVDA and JAWS
  on Windows and VoiceOver on macOS, in a terminal or in VS Code. **No screen
  reader test has been recorded yet** for any combination; see
  [Known limitations](#known-limitations).
- **Input methods:** keyboard alone. Every core flow is typed commands or a
  command palette, and none needs a pointer. That was confirmed by an agent
  run of the installer, the Claude Code plugin commands and the MCP server on
  Linux on 2026-10-28, recorded in
  [the testing document](docs/accessibility/accessibility-testing.md#runs-so-far);
  no person has yet recorded a keyboard-only run, and voice control and switch
  access have not been tested.

What is checked automatically in continuous integration:

- on every pull request, the Markdown accessibility linter on every Markdown
  file in the repository, markdownlint, and the report renderer's self-test,
  which checks every report has its required sections;
- on pull requests that change web files, axe-core through the high-impact
  Playwright check, against the deliberately broken page in `example/`, to
  confirm the scanner still catches its known defects.

## Known limitations

These are the barriers we know about. Please report any we have missed.

- **No screen reader test has been recorded.** The checks for each core flow
  are written down, but nobody has yet run them with a screen reader, so we
  cannot say how installing in each client and reading a report work when
  heard. Help is wanted in
  [#260](https://github.com/Community-Access/accessibility-agents/issues/260).
  If something does not work for you, the issue form and email reach a person.
- **`--help` installs.** `npm run setup -- --help`, or a mistyped option, runs
  a real install instead of printing help. Run `npm run setup -- --dry-run`
  first to see what it will do; `node scripts/install.mjs --uninstall` removes
  it. Tracked in
  [#255](https://github.com/Community-Access/accessibility-agents/issues/255).
- **A few MCP tool messages contain symbols** (an ellipsis, a less than or
  equal sign, an em dash) that some screen readers skip or name. The words
  around them carry the meaning. Tracked in
  [#256](https://github.com/Community-Access/accessibility-agents/issues/256).
- **Reports say "1 findings".** The count is right; the wording is not.
  Tracked in
  [#257](https://github.com/Community-Access/accessibility-agents/issues/257).
- **Generated HTML is not checked in CI.** Some skills can write HTML versions
  of reports. Those files are written by the model. An HTML rendering of the
  Markdown report passed axe-core in an agent run (see the testing document),
  but no check runs on every change; check an HTML report yourself, or use the
  Markdown version, which is the canonical report.
- **Client interfaces are not ours.** The chat panes, menus and permission
  prompts belong to each client. Known barriers and workarounds are under
  [Dependencies and upstream blockers](#dependencies-and-upstream-blockers)
  and tracked in
  [#262](https://github.com/Community-Access/accessibility-agents/issues/262).
  A new barrier is best reported to that client's maintainers; tell us too,
  and we will document a workaround here.
- **Antigravity's edit gate** is tested against Antigravity's documented hook
  format, not yet in a live session.

## Open Source Accessibility Framework

We follow the [Open Source Accessibility Framework](https://open-source-accessibility.github.io/Open-Source-Accessibility-Framework/)
in four phases, and track our progress in public in
[our framework tracking issue](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/issues/52),
where each completed action is checked off against the framework's
definition of done. The full record, action by action with evidence, is in
[docs/accessibility/accessibility-framework.md](docs/accessibility/accessibility-framework.md).
Progress as of October 2026, 19 of 24 actions:

- **Foundational:** this document; the `accessibility` label.
- **Workflow:** all ten actions: priorities and contributor expectations,
  referenced from [CONTRIBUTING.md](CONTRIBUTING.md); the accessibility issue
  form and an email alternative; severity, response and resolution targets; an
  accessibility section in the pull request template; labelled
  beginner-friendly and expert-help issues; an owner; accessible documentation
  enforced by the Markdown linter; interface requirements; and the dependency
  record above.
- **Testing:** automated checks on every pull request; documentation checks;
  supported environments and known limitations. The keyboard, screen reader
  and manual checks for the core flows are documented, and an agent has run
  the parts it can, but they are done only when people have run them (#258,
  #260).
- **Community:** an open invitation to help with labelled issues and a
  monthly feedback issue; accessible, asynchronous ways to take part, a
  private accommodation route and a Code of Conduct; monthly progress updates;
  shared resources. Responding to reports is documented, but our record does
  not yet meet it (#207 has no reply, and earlier reports waited weeks);
  public recognition waits on contributors' consent.

The agents in this package can do the same for your project: ask your client
to adopt the Open Source Accessibility Framework, or one of its phases.

## Feedback

To suggest an improvement to this document or to how we work, open an issue
or a pull request, or write to the address above. Thank you for helping make
Accessibility Agents usable by everyone.
