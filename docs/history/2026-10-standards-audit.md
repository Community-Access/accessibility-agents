# The 7.1 standards audit (October 2026)

Pull request [#221](https://github.com/Community-Access/accessibility-agents/pull/221)
audited the whole package against current standards and each client's own
documentation, as of 28 October 2026, and fixed what it found. The
[changelog entry for 7.1.0](../../CHANGELOG.md) lists every change; this page
records how the work was done, what was decided and what is left.

## How the facts were checked

- Two research passes read primary sources only: w3.org, federalregister.gov,
  ada.gov, etsi.org, iso.org, pdfa.org, and the documentation of VS Code,
  GitHub, Claude Code, Codex, Gemini CLI, Antigravity, MCP, Agent Plugins and
  Agent Skills. Each fact was recorded with the URL it was read on.
- The 108 skills were audited in six batches and the documentation in one,
  each against those facts. Every batch was then checked by a separate
  reviewer that had not seen the work, and its findings were fixed before the
  batch was committed.
- Code was run, not read: the MCP server through a real MCP client, the
  installer in scratch home folders, the edit gate live in Claude Code, the
  Codex plugin route with Codex CLI 0.165.0, the Office snippets against
  generated files, and the CI workflows locally before pushing.

## What was broken

- Installing as a plugin loaded no hooks and no MCP server on any client, and
  the server could not start without `node_modules`. It now ships bundled.
- The edit gate deadlocked on Claude Code, and never ran on Codex because
  Codex rejected the hooks file.
- `run_axe_scan` never ran; the prompts and resource templates were
  registered wrongly; axe never checked 2.5.8 Target Size; Office and ePub
  scan configs had no effect.
- The installer ran on every `npm install`, and its uninstall deleted other
  packages' skills and Codex's own hooks file.
- The skills carried outdated law and standards (ADA Title II and HHS 504
  dates, EN 301 549, WCAG 3, 4.1.1), a scoring model nothing computed, axe
  commands without the WCAG 2.2 rules, and code samples that did not run.
- The high-impact CI check scanned a page that is broken on purpose, so it
  could never pass; it had crashed before scanning, which hid that.

## Decisions

- **MCP server:** bundled with esbuild into `mcp-server/dist/stdio.mjs`; a
  gate rebuilds it and fails on any difference.
- **Scoring:** the renderer (`merge-findings.mjs`) is the only model.
- **GitHub workflow skills** write their own documents; the findings schema
  and renderer are for accessibility audits.
- **Antigravity:** gated, opening when Antigravity reads the lead's
  `SKILL.md` with `view_file`.
- **Codex:** the plugin route gives skills and the MCP server; Codex 0.165
  lists plugin hooks as removed, so the gate comes from `npm run setup`.
- **VS Code extension:** removed. It discovered `.github/agents/*.agent.md`
  files that 7.x does not ship; VS Code installs the package as an agent
  plugin instead.
- **Contributions:** six open pull requests were ported in part (see the
  changelog's Contributors section); the rest were superseded by 7.x or did
  not match their sources.

## Known limits

- The Antigravity gate is tested against the documented hook payloads, not in
  a live Antigravity session.
- Copilot CLI cannot be measured by the live client check without a signed-in
  CLI.
- On every client an edit made through a shell command is not gated, only
  edits made through the client's file tools.
- A few small claims had no primary source that could be reached; the audit
  logs list them, and they were left as written rather than guessed.

## Where to go next

### VS Code

VS Code installs the package as an agent plugin; there is no extension to
publish.

1. **Today:** users run Chat: Install Plugin From Source with
   `https://github.com/Community-Access/accessibility-agents` (with
   `chat.plugins.enabled` on).
2. **Listing:** VS Code's built-in marketplaces include awesome-copilot.
   Submit the plugin through its external-plugin issue form at
   [github/awesome-copilot](https://github.com/github/awesome-copilot): name,
   description, repository `Community-Access/accessibility-agents`, path `/`,
   a release tag (`v7.1.0`) and its full commit SHA, version, licence MIT,
   author. Its automation checks the Agent Plugins 1.0 manifest, runs the
   Agent Skills lint and a Copilot CLI install test, then a maintainer
   approves it.
3. **Existing Marketplace users:** the retired `@a11y` extension stays
   installed for anyone who has it. A final version that tells them to move
   to the plugin needs the Marketplace publisher's login. Its source is in
   git history before 7.1.0 (`vscode-extension/` at commit `decf6ba`).

### Other follow-ups

- Run the Antigravity gate in a live Antigravity session once one is available.
- Measure Copilot CLI in the live client check from a signed-in machine.
- Contributor follow-ups: a Qt section for `desktop-a11y-specialist` based on
  Qt's own accessibility code (#218); a test page and sourced browser
  behaviour for flex and grid text runs (#209); a Codex mark route for leads
  run inline (#169, issue #168).
