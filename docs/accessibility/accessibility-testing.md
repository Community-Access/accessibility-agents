# Accessibility Testing of the Core Flows

This page is the short, repeatable accessibility test for Accessibility
Agents itself: the core flows a new user must be able to complete, the
keyboard-only, screen reader, manual and documentation checks for each, and the
record of every run. It is part of the project's
[accessibility commitments](../../ACCESSIBILITY.md).

It tests this project, not the code the agents review. For testing your own
project, the agents have their own procedures: `testing-coach`,
`keyboard-navigator`, `screen-reader-lab` and `web-accessibility-wizard`.

## What the build already checks

Do not spend a manual pass on what CI already checks. `npm run verify` runs on
every pull request (`.github/workflows/verify.yml`) and fails the build on its
own. The accessibility-relevant gates:

- **Markdown accessibility linter** on every Markdown file in the repository:
  one H1, no skipped heading levels, alternative text, descriptive link text,
  table shape, code block languages.
- **markdownlint**, for structure the linter does not cover.
- **Report renderer self-test** (`npm run verify:report`): every generated
  audit report has its required sections in the same order.
- **Findings contract** (`npm run verify:findings`): every finding names a
  criterion, a severity, a location and a fix.
- **MCP tests** (`npm run verify:mcp`): the tools return text content as well
  as structured content.

`.github/workflows/playwright-high-impact-check.yml` runs axe-core through
Playwright against the deliberately broken page in `example/`, on pull requests
that change web files, to confirm the scanners still catch its known defects.

Automated checks find some barriers, never all. The checks below need a
person, or at least a run of the real flow.

## The interfaces

Accessibility Agents has no graphical interface of its own. People meet it
through these, and each check below says which it applies to:

- **Terminal text:** the installer (`npm run setup`) and the clients' plugin
  commands.
- **Editor commands:** VS Code's command palette and chat view, for the VS Code
  install route. These belong to VS Code.
- **MCP tool output:** the text each of the 39 tools returns, which a client
  shows or reads to the user.
- **Reports:** the Markdown audit reports the agents write, such as
  `WEB-ACCESSIBILITY-AUDIT.md`, read in an editor, a terminal pager or a
  browser; and any HTML version a skill writes.
- **Documentation pages:** the Markdown in this repository, read on GitHub,
  and its copy in the GitHub wiki. The project publishes no separate site from
  this repository: `.github/workflows/sync-docs-site.yml` writes a page list,
  `manifest.json`, and the pages are these Markdown files.

The requirements each interface must meet are under "Interfaces" in
[ACCESSIBILITY.md](../../ACCESSIBILITY.md#contributor-expectations).

## The core flows

These are the flows every new user meets. Each check list below covers them.
A flow can be run with any one supported client.

1. **Install as a Claude Code plugin:** `/plugin marketplace add
   Community-Access/accessibility-agents`, then `/plugin install
   accessibility-agents@community-access`, in a Claude Code session, or the
   same as `claude plugin marketplace add ...` and `claude plugin install ...`
   from the shell.
2. **Install in GitHub Copilot:** in the Copilot CLI, `copilot plugin
   marketplace add Community-Access/accessibility-agents`, then `copilot plugin
   install accessibility-agents@community-access`; in VS Code, run "Chat:
   Install Plugin From Source" from the command palette with the repository
   URL.
3. **Install in Codex or Gemini CLI:** `codex plugin marketplace add
   Community-Access/accessibility-agents`, then `codex plugin add
   accessibility-agents@community-access`; or, in Gemini CLI, `gemini
   extensions install` with the repository URL,
   `https://github.com/Community-Access/accessibility-agents`.
4. **Install from a checkout** (Antigravity, the Codex edit gate, or any
   client): `npm install`, `npm run setup -- --dry-run`, then `npm run setup`;
   and `node scripts/install.mjs --uninstall` to remove it.
5. **Start the MCP server through npm:** `npx -y
   @community-access/accessibility-agents-mcp`, registered in a client.
6. **Run an accessibility review on a file and read the report:** ask the
   client to review a file, for example "review example/index.html for
   accessibility" (`accessibility-lead`) or "audit README.md"
   (`markdown-a11y-assistant`), then read the report it writes.

## Keyboard-only checks

Run each flow with the mouse or trackpad untouched. In a terminal, every step
is typed; in VS Code, every step starts from the command palette
(`Ctrl+Shift+P`, or `Cmd+Shift+P` on macOS). For every command, prompt, menu,
link and control the flow uses:

- [ ] **Focusable:** it can be reached from the keyboard: typed at the prompt,
      or reached with Tab, Shift+Tab or the arrow keys in a menu, dialog or
      quick pick.
- [ ] **Operable:** it can be invoked from the keyboard: Enter, Space, the
      arrow keys or a typed number, and no step needs a pointer (no "click
      here", no drag and drop, no link that only works when clicked).
- [ ] **Visible focus:** the caret or highlight is visible at every step,
      including in the client's menus and in VS Code's quick input.
- [ ] **Logical order:** focus and output follow the order of the task:
      prompts appear where the caret is, and output reads in the order things
      happened.
- [ ] **No trap:** Escape or Ctrl+C leaves every prompt, menu and dialog, and
      returns to where you were. A long-running command can be interrupted.
- [ ] The flow can be completed end to end.

For flow 6 in a browser (a report rendered on GitHub), the same checks apply
to the page: every link in the report is reachable by Tab, has visible focus,
and comes in reading order.

## Screen reader checks

Run each flow with a screen reader: NVDA, JAWS or Narrator on Windows, or
VoiceOver on macOS, in a terminal or in VS Code. For Claude Code, try both
without and with its screen reader mode (`claude --ax-screen-reader`).

- [ ] Every line of output is read in order, and can be read again with the
      screen reader's review commands or the terminal's scrollback.
- [ ] Status is said in words: success, failure and "nothing to do" are
      words, not a symbol, a color or position alone.
- [ ] Nothing decorative is read aloud: no emoji, box drawing or symbols
      standing in for words.
- [ ] Prompts and menus say what they are asking and which keys answer them;
      the item the screen reader announces is the one Enter chooses.
- [ ] An error says what went wrong and what to do next, in a sentence, not
      only a stack trace.
- [ ] In a report: headings can be navigated by level, tables are announced
      as tables with their column headers, and every finding's severity,
      criterion, location and fix are read in words.
- [ ] The flow can be completed end to end.

## Manual checks

For each flow:

- [ ] **Keyboard:** the keyboard-only checks above pass.
- [ ] **Descriptive text:** command output, error messages, report headings
      and table headers say what they are for; an error names the specific
      problem and the next step.
- [ ] **Plain language:** no unexplained jargon; abbreviations are spelled out
      on first use in reports and documentation; counts match their nouns.
- [ ] **Zoom and reflow:** with the terminal or editor font at 200 percent,
      wrapped lines lose no information. A report rendered on GitHub at 200
      percent browser zoom, and at 400 percent (a 320 CSS pixel wide window),
      loses no information or function; wide data tables may scroll inside
      their own box, as WCAG 2.2 success criterion 1.4.10 allows.
- [ ] **Contrast and color:** in a light and a dark terminal theme, and in a
      high contrast theme, all output is readable, and color is never the only
      way something is shown (PASS and FAIL are words).

## Documentation checks

For every documentation change, and for a representative set before each
release (README.md, CONTRIBUTING.md, ACCESSIBILITY.md, the getting-started
guide, this page, the latest release notes, and the issue and pull request
templates):

- [ ] **Structure:** one H1, no skipped heading levels, real lists.
- [ ] **Alternatives:** every image has meaningful alternative text or is
      marked decorative; every diagram has a text description nearby.
- [ ] **Links:** link text says where it goes; no "click here", "read more"
      or bare URLs as link text.
- [ ] **Captions:** any video has captions, and any audio a transcript.
- [ ] **Tables:** a header row, and a sentence before the table saying what
      it holds.
- [ ] **Code blocks:** code and commands are text in fenced blocks with a
      language, never pictures, and long commands are explained in prose.

## Record template

Each run is recorded below: the date, who or what ran it, the version, the
environment, and the result of each check. A check nobody has run says "not
yet run". Failures are filed as issues with the `accessibility` label and
linked from the result. Copy this for each run:

```text
### <flow number and name> -- <keyboard | screen reader | manual>

Date:
Run by: <person, or "agent run" with the tool>
Accessibility Agents version:
Operating system and version:
Terminal or editor, and version:
Client and version:
Screen reader and version (and braille display, if any):

Result: pass, or each failure with what happened and its issue number.
```

## Runs so far

The state of each check, per flow. "Agent run" means an AI agent ran the
commands itself. In a terminal it can confirm that a flow needs no pointer and
what text it prints, not how the terminal shows focus; in a browser it pressed
real keys and measured focus, zoom, reflow and contrast. The accessibility
owner, Jeff Bishop, accepts the agent's keyboard and manual runs as results,
and says so in each record. Screen reader checks are a person's: the owner ran
them on his own test machine.

| Flow | Keyboard-only | Screen reader | Manual |
| --- | --- | --- | --- |
| 1. Claude Code plugin | Pass, 2026-10-29 (agent run, accepted) | Owner's spot check (below) | Pass, 2026-10-29 (agent run, accepted) |
| 2. GitHub Copilot | Pass for the Copilot CLI, 2026-10-29 (agent run, accepted); VS Code not run | Owner's spot check (below) | Pass for the Copilot CLI, 2026-10-29 (agent run, accepted) |
| 3. Codex or Gemini CLI | Pass for Codex, 2026-10-29 (agent run, accepted); Gemini CLI not run | Owner's spot check (below) | Pass for Codex, 2026-10-29 (agent run, accepted) |
| 4. From a checkout | Pass, 2026-10-29 (agent run, accepted) | Owner's spot check (below) | Pass, 2026-10-29 (agent run, accepted) |
| 5. MCP server through npm | Pass, 2026-10-28 (agent run, accepted) | Owner's spot check (below) | Pass for the tool output after one fix, 2026-10-29 (agent run, accepted) |
| 6. Review a file, read the report | Pass, 2026-10-29 (agent run, accepted) | Owner's spot check (below) | Pass after two fixes, 2026-10-29 (agent run, accepted) |

The owner's screen reader record says which readers and browsers were used,
not which flow each check was made in, so the screen reader column points to
it for every flow. More runs are always welcome, especially with a client or
screen reader not listed here: copy the record template into a new issue or a
pull request to this page.

### Screen reader spot check, recorded 2026-10-29

Run by Jeff Bishop, the accessibility owner, who uses a screen reader. He ran
the screen reader checks above for the core flows named in
[#260](https://github.com/Community-Access/accessibility-agents/issues/260):
installing in a client, running a review and reading the report.

Environment, the screen readers and browsers on his test machine:

- Windows 11 Pro.
- JAWS 2026 (2026.2608.25.400) and NVDA 2026.2.
- Chrome 156 and Edge 156.

Result: recorded as run by the owner. No new barrier was filed from it; the
known barriers in the clients themselves stay tracked in
[#262](https://github.com/Community-Access/accessibility-agents/issues/262).
Firefox was not part of this run, so the JAWS and Firefox question in
[#261](https://github.com/Community-Access/accessibility-agents/issues/261) is
still open.

### Agent run, 2026-10-29: keyboard-only and manual checks

Run by an AI agent (Claude Code) and accepted as a result by the accessibility
owner, Jeff Bishop, on 29 October 2026. The terminal flows ran as typed
commands; the HTML checks used real key presses in a real browser.

Environment: Accessibility Agents 7.1.0 plus `main` at commit `4264e27`;
Windows 11 Pro (build 26300); Git Bash; Node.js 22.22.1; Claude Code 2.1.296;
GitHub Copilot CLI 1.0.94; Codex CLI 0.146.0; Chromium in the Claude desktop
app's browser pane, with axe-core 4.14.0. Every install went into a throwaway
home or configuration directory (`USERPROFILE`, `CLAUDE_CONFIG_DIR`,
`COPILOT_HOME`, `CODEX_HOME`), and was removed afterwards; the user's own
configuration was not touched. Gemini CLI, Antigravity and VS Code's "Chat:
Install Plugin From Source" were not run.

Flow 4, from a checkout, keyboard-only and manual:

- Pass: `npm run setup -- --help` now prints usage and exits 0; `--dry-run`,
  a real install, a repeat install and `--uninstall` each ran from typed
  commands, asked no question and exited 0. A mistyped option, `--clients`
  with no value and an unknown client id are each refused with one line that
  names the problem and the valid values, exit code 2, before anything is
  written (the fixes for #255).
- Manual: all output is plain ASCII and reads in the order things happen; the
  longest line, 141 characters, is a file path, which wraps without losing
  anything at 200 percent terminal font size.

Flows 1, 2 and 3, installing in Claude Code, the Copilot CLI and Codex from
the shell, keyboard-only and manual:

- Pass: `marketplace add Community-Access/accessibility-agents`, the plugin
  install, the plugin list, the uninstall and the marketplace removal, for
  each of `claude plugin`, `copilot plugin` and `codex plugin`, from typed
  commands, no prompts, exit 0. Every success and failure is said in words.
- Observation, upstream: Claude Code still marks results with a check mark or
  a cross, and writes cursor-movement codes even when its output is
  redirected; the Copilot CLI lists plugins with a bullet character. The words
  carry the meaning. Tracked with the other client barriers in #262.
- Observation: on Windows, Claude Code could not clone the marketplace into a
  configuration directory with a very long path ("Filename too long"); from
  the default `~/.claude` it worked.

Flow 6, a review of a small page and its report, keyboard-only and manual:

- A sample sign-up page with nine known defects was reviewed through the MCP
  server's tools (`run_axe_scan`, `check_heading_structure`, `check_link_text`,
  `check_form_labels`, `check_contrast`), the findings were written in the
  findings schema, and `render-report.mjs` wrote the report. A nested client
  session with a model could not sign in from the agent's shell, so the model
  half of the review was done by the agent itself.
- Pass: the report has one H1, every required section in order, a sentence
  before each table, and severity, criterion, location and fix in words for
  all nine findings; counts agree with their nouns. It passes the Markdown
  accessibility linter at `--fail-on warning`.
- Fixed in this run: a fix that quoted markup, such as "Use a
  `<button type="submit">` inside a form", reached the report as raw HTML, so
  a Markdown viewer rendered a real button or dropped the words.
  `render-report.mjs` now escapes markup outside code spans, and its self-test
  checks it.
- Fixed in this run: when Playwright's browser was missing, `run_axe_scan`
  returned Playwright's box-drawn banner, which a screen reader reads symbol
  by symbol. The five Playwright tools now say in one sentence what to install.
- Keyboard, HTML: the shared HTML page standard the GitHub workflow skills
  write their HTML reports to (in `kb-github-shared-instructions`) was built
  into a sample briefing and driven with Tab, Shift+Tab, Enter, Space and the
  arrow keys. Pass: the skip link is first and moves focus into `main`; every
  link, checkbox and disclosure is reached in reading order, with a visible
  2 pixel outline at 5.19 to 1 against the page; Space checks a checkbox,
  Enter opens the disclosure; Tab leaves the page and Shift+Tab comes back, so
  nothing traps focus.
- Manual, HTML: axe-core found no violations in light or dark mode, with
  contrast fully computed; every text color pair in the stylesheet is at least
  4.5 to 1. At 200 percent zoom (640 CSS pixels) nothing is lost. At 320 CSS
  pixels a six-column table made the whole page scroll sideways; fixed in this
  run by a `table-scroll` wrapper, a focusable region that the arrow keys
  scroll, in the standard and its copy in `kb-github-workflow-standards`.
  Status is always a word, never color alone.

Documentation as rendered on GitHub, manual:

- ACCESSIBILITY.md, the README and the wiki home page: one H1 in the content,
  no skipped levels, no vague link text, and the one image has alternative
  text. At 320 CSS pixels the pages do not scroll sideways; a wide table
  scrolls in its own box, as WCAG 2.2 success criterion 1.4.10 allows.
- Fail, filed: every wiki page has two H1 headings, GitHub's page name and the
  content's own. Tracked in
  [#274](https://github.com/Community-Access/accessibility-agents/issues/274).

### Agent run, 2026-10-28

Run by an AI agent (Claude Code) while adopting the Open Source Accessibility
Framework. This is an automated run, not a person's test, and not a screen
reader test.

Environment: Accessibility Agents 7.1.0 (commit `37717dd` on `main`); Linux
6.18 in a container; bash, non-interactive, no display; Node.js 22.23.4;
Claude Code 2.1.312. The Copilot CLI, Codex, Gemini CLI, Antigravity and VS
Code were not available, so flows 2 and 3 were not run. Every install was made
into a scratch home directory and removed afterwards.

Flow 4, from a checkout, keyboard-only:

- Pass: `npm run setup -- --dry-run`, `npm run setup` (twice, to check a
  repeat install), `node scripts/install.mjs --clients codex` and
  `--uninstall` each ran from typed commands alone, asked no question, needed
  no pointer, and exited 0. Output reads in the order of the actions, 47 lines,
  all plain ASCII; the longest line, 118 characters, is a file path.
- Fail: `node scripts/install.mjs --help`, and any mistyped option, runs a
  real install instead of printing help; `--clients` with no value stops with
  a stack trace; an unknown client id is reported as "No supported client
  found". Tracked in
  [#255](https://github.com/Community-Access/accessibility-agents/issues/255).
- Not checked: visible focus (the agent cannot see the terminal).

Flow 1, Claude Code from the shell, keyboard-only:

- Pass: `claude plugin marketplace add <checkout>`, `claude plugin install
  accessibility-agents@community-access`, `claude plugin list`, and the
  matching `uninstall` and `marketplace remove`, each from typed commands,
  exit 0, no prompts. The marketplace was added from the local checkout, not
  from GitHub.
- Observation, upstream: Claude Code marks success with the square root sign
  and a Unicode ellipsis, also with `CLAUDE_AX_SCREEN_READER=1`; the words
  after it say the same. Tracked in
  [#262](https://github.com/Community-Access/accessibility-agents/issues/262).
- Not run: the interactive `/plugin` commands inside a session.

Flow 5, the MCP server through npm, keyboard-only:

- Pass: `npx -y @community-access/accessibility-agents-mcp@7.1.0` answered an
  MCP `initialize` request as `a11y-agent-team` 7.1.0, listed 39 tools, and
  `check_contrast` returned its result as text with PASS and FAIL in words.

Flow 6, a review through the MCP tools, keyboard-only and manual (partial):

- The agent called `check_heading_structure`, `check_link_text`,
  `check_form_labels`, `check_contrast`, `check_apca_contrast`,
  `check_color_blindness`, `check_reading_level`,
  `get_accessibility_guidelines` and `render_accessibility_report` on
  `example/index.html` and the bundled example findings. A full review by a
  client and its model was not run.
- Pass: each tool's result is text that names the problem and the fix in
  words; contrast results say PASS or FAIL in words, not color.
- Fail: three tools return non-ASCII characters (an ellipsis, a less than or
  equal sign, em dashes), tracked in
  [#256](https://github.com/Community-Access/accessibility-agents/issues/256);
  `check_heading_structure` lists the page's empty heading without reporting
  it, tracked in
  [#263](https://github.com/Community-Access/accessibility-agents/issues/263).
- Observation: `check_color_blindness` and `check_reading_level` return JSON
  rather than sentences. A client usually summarises it, but a person reading
  the raw result hears the punctuation. Not filed; for the owner to decide.

Generated reports, automated (part of the manual checks for flow 6):

- Two reports were rendered with `skills/a11y-core/scripts/render-report.mjs`
  from the bundled example findings: a web report with 15 findings and a
  document report with one. Both pass the Markdown accessibility linter at
  `--fail-on warning`.
- Each was converted to HTML with pandoc 3.1.3 and checked with axe-core
  4.11.0 in jsdom (WCAG 2.0, 2.1 and 2.2 A and AA rules and best practices;
  color contrast off, because jsdom does not render). Result: no violations
  once the content was inside a `main` landmark, which the pandoc page lacks
  and GitHub provides; one H1, seven and four tables with header cells, `lang`
  and a title present. Two rules were incomplete because jsdom cannot judge
  visibility.
- Fail, descriptive and plain language: "1 findings", "1 checks ran" and
  "Then the 1 remaining blocking findings", where nothing came before.
  Tracked in
  [#257](https://github.com/Community-Access/accessibility-agents/issues/257).
- Observation: a report can show "Grade A" and "Verdict: Fail" together (one
  serious finding scores 90). The two measure different things, but a reader
  may take them as contradicting each other. Not filed; for the owner to
  decide.
- Not checked: real browser zoom and reflow, and contrast as rendered.

### Documentation review, 2026-10-28

The Markdown accessibility linter passed on all 463 Markdown files in the
repository at `--fail-on error`, with no warnings, and markdownlint passed.
This covers structure, alternatives, links, tables and code block languages;
there is no video or audio in the documentation. The representative set above
was read for the same checks while writing this page, and nothing further was
found. It was not a screen reader test of the rendered pages.
