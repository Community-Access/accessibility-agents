# Accessibility

Accessibility Agents exists so that the software people build with AI coding
agents works for disabled people. The same promise applies to this project:
everyone, including people who use a screen reader, magnification, voice
control, a switch or the keyboard alone, should be able to install it, read
what it reports, read its documentation and contribute to it.

This document describes our accessibility priorities, what we ask of
contributors, how to report a barrier, how we respond, who owns this work,
what we test on, and what we know is not yet good enough. It follows the
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
- **Anything with a user interface** (generated HTML, a page in `example/`
  apart from its intentional defects, a dashboard): do a keyboard-only pass
  (everything reachable and operable, visible focus, logical order, no traps)
  and a screen reader spot check (headings and landmarks, labels, states,
  announcements), and say what you tested in the pull request.
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
- When a fix lands, we may ask you, or another person affected, to confirm it
  works before we close the issue. We thank you in the release notes unless
  you ask us not to.

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
on GitHub, or email to the address above. There are no required meetings or
calls. If a tool or process we use is a barrier for you, or you need an
accommodation to contribute, email us privately; you do not need to explain
why. Everyone who takes part follows the [Code of Conduct](CODE_OF_CONDUCT.md).

## Ownership and maintenance

Accessibility is owned by **Jeff Bishop**, project maintainer
([jeff@jeffbishop.com](mailto:jeff@jeffbishop.com)).

The accessibility owner:

- triages accessibility reports and assigns severity;
- keeps accessibility work visible with the `accessibility` label, and marks
  suitable issues `good first issue` or `help wanted` with context and
  acceptance criteria;
- reviews pull requests against the contributor expectations above;
- reviews the accessibility of new dependencies before they are adopted;
- keeps this document, the known limitations and the framework progress
  current, reviewing them at each release.

If ownership changes, this section is updated in the same pull request that
changes [CODEOWNERS](.github/CODEOWNERS).

## Supported environments

What we support and what we have evaluated:

- **Clients:** Claude Code, GitHub Copilot CLI, VS Code agent plugins, Codex,
  Gemini CLI and Antigravity, as described in [getting started](docs/getting-started/README.md).
- **Operating systems:** Windows, macOS and Linux, with Node.js 26, 24 or 22.
- **Output:** plain text in the terminal, and Markdown reports, which read
  with any screen reader in an editor, a terminal pager or a browser rendering
  the Markdown.
- **Assistive technology:** the project is designed for use with NVDA and JAWS
  on Windows and VoiceOver on macOS, in a terminal or in VS Code.

What is checked automatically in continuous integration:

- on every pull request, the Markdown accessibility linter on every Markdown
  file in the repository, markdownlint, and the report renderer's self-test,
  which checks every report has its required sections;
- on pull requests that change web files, axe-core through the high-impact
  Playwright check, against the deliberately broken page in `example/`, to
  confirm the scanner still catches its known defects.

## Known limitations

These are the barriers we know about. Please report any we have missed.

- **Screen reader testing is manual and not yet recorded per release.** We
  have not documented, for each release, which screen reader and client
  combinations were tested end to end. Until we do, treat combinations other
  than those listed above as untested.
- **Generated HTML is not checked automatically.** Some skills can write HTML
  versions of reports. Those files are written by the model and are not
  linted; check them, or use the Markdown version, which is the canonical
  report.
- **Client interfaces are not ours.** The chat panes, menus and permission
  prompts belong to each client. A barrier there is best reported to that
  client's maintainers; tell us too, and we will document a workaround here.
- **Antigravity's edit gate** is tested against Antigravity's documented hook
  format, not yet in a live session.

## Open Source Accessibility Framework

We follow the [Open Source Accessibility Framework](https://open-source-accessibility.github.io/Open-Source-Accessibility-Framework/)
in four phases. Progress as of 7.1.0 (October 2026):

- **Foundational:** this document; the `accessibility` label.
- **Workflow:** priorities and contributor expectations above, referenced
  from [CONTRIBUTING.md](CONTRIBUTING.md); the accessibility issue form and an
  email alternative; severity, response and resolution targets; an
  accessibility section in the pull request template; an owner; accessible
  documentation enforced by the Markdown linter. Labelling beginner-friendly
  and expert-help accessibility issues is ongoing, as issues arrive.
- **Testing:** automated checks on every pull request (above). Documented
  keyboard and screen reader checks for the core tasks (installing, running an
  audit, reading a report) are the next step.
- **Community:** asynchronous, text-only ways to take part and a private
  route for accommodations (above); a Code of Conduct; contributors credited
  in the [changelog](CHANGELOG.md) and the release notes. Publishing accessibility progress with each release
  and inviting reviewers who use assistive technology are next.

The agents in this package can do the same for your project: ask your client
to adopt the Open Source Accessibility Framework, or one of its phases.

## Feedback

To suggest an improvement to this document or to how we work, open an issue
or a pull request, or write to the address above. Thank you for helping make
Accessibility Agents usable by everyone.
