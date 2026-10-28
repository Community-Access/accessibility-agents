# Standards audit: what changed, and what is still in progress

Branch: `chore/standards-audit-and-codespaces`, from `decf6ba` (main).
Written by Claude, 27 October 2026. This file lives on the branch so you can
read it anywhere; delete it before merging.

Status: IN PROGRESS. Work runs in the cloud session; each batch is committed
and pushed to origin/chore/standards-audit-and-codespaces, and this note is
updated in the same push. Nothing is written to D:\code\agents any more.

## How the facts were checked

Two research passes read primary sources only (w3.org, federalregister.gov,
ada.gov, etsi.org, iso.org, pdfa.org, docs for VS Code, GitHub, Claude Code,
Codex, Gemini CLI, Antigravity, MCP, Agent Plugins, Agent Skills). Every fact
used carries the URL it was read on. The two fact files travel with the final
commit summary.

## Done and committed (commit 5ddd426)

### Security: the dependency gate failed; it passes now

- mcp-server: `@modelcontextprotocol/sdk` 1.30 to 1.32.2, `zod` 3 to 4.6.7,
  closing 1 critical (proxy-addr) and 3 high advisories (SDK, body-parser,
  zod). Zod 4 needed one change: `z.record()` now names its key schema.
- Root tooling: `@axe-core/cli` 4.14.0, `markdownlint-cli2` 0.24.0, and
  `basic-ftp` pinned to 6.2.3 under `overrides`, with the reason in
  package.json (it is past the range get-uri asks for; get-uri only uses it
  for ftp:// proxy config files).
- `npm run verify`: 15 of 15 gates pass.

### MCP server bugs that predate the audit

- The three prompts (`audit-page`, `check-component`, `explain-wcag`) were
  registered with the deprecated `server.prompt()` in a form it read as their
  argument list, so they advertised the wrong arguments. Zod 4 turned that
  into a crash at startup. They now use `registerPrompt()`.
- `a11y://guidelines/{component}` and `a11y://config/{profile}` were
  registered as fixed resources with a literal `{component}` in the address,
  so every real read returned "not found". They are now resource templates,
  listed and completable. The unit tests called the handlers directly, which
  is why this was never caught; a new conformance test reads them through a
  real MCP client, and another checks every prompt's arguments.
- The axe scan's default tags, and the `minimal` scan profile, lacked
  `wcag22aa`. axe-core's only WCAG 2.2 rule, `target-size`, is off by default
  and runs only when that tag is asked for, so 2.5.8 Target Size never ran.
  Both now use wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa.
- MCP tests: 109 of 109 pass (two new).

## Done and committed (commit 3058dcf): the Claude Code plugin works

Tested live with Claude Code 2.1.312 (`claude --plugin-dir .`): before, the
plugin registered 0 hooks and no MCP server; after, 6 hooks and the server
with all 39 tools.

- `.claude-plugin/plugin.json` now names `hooks/claude.hooks.json` and
  declares the MCP server under `mcpServers`, rooted at `${CLAUDE_PLUGIN_ROOT}`.
- Hook commands quote the plugin-root placeholder, so a path with a space
  (C:\Users\First Last\...) no longer splits the command (claude and codex
  manifests).
- `claude.hooks.json` lost its `$comment` key, which Claude Code reports as an
  error.
- `marketplace.json` said 7.0.1; it now says 7.0.3 like every other manifest.
- (Superseded in part by 0fc0195: the manifest `hooks` key was replaced by
  the shared `hooks/hooks.json`.)

## Done and committed (commit 0fc0195): the edit gate, and Agent Plugins 1.0

The edit gate deadlocked on Claude Code. Seen live (Claude Code 2.1.312,
Haiku, a one-line HTML change): the model ran `accessibility-lead` three
times and two review subagents, and the gate refused all five edits. The
button never changed. Two causes: the lead is a skill and runs inline, which
fires no stop event; and the guard never read `agent_type`, the field Claude
Code names a subagent in.

- `hooks/guard.mjs` reads `agent_type`. The Claude-format manifests also
  mark on `PostToolUse` for the `Skill` tool, which fires when the lead's
  instructions load. That is launch, not completion, so the finalize check
  stays the backstop; the reason is written in guard.mjs.
- Four new gate tests (26 in all). Not yet re-run live: say if you want the
  live test repeated.
- `hooks/hooks.json`: one file for the Claude Code and Codex plugins (the
  guard ignores `--client`). Claude Code registers 6 hooks once; a second
  file at that path made it register 12.
- `com.github.copilot/hooks/hooks.json`: Copilot and VS Code plugin hooks
  under Agent Plugins 1.0, rooted at `${PLUGIN_ROOT}`.
- `plugin.json` and `mcp.json` validate against the published Agent Plugins
  1.0 schemas: dropped the forbidden `skills`/`mcp` keys; added `$schema` and
  `type: "stdio"`; dropped the non-standard `description`.
- Codex matcher: dropped `shell` (not a Codex tool name).
- `copilot.hooks.json` no longer claims Copilot has no stop event.
- `npm run verify`: all gates pass. `claude plugin validate .`: passes; the
  remaining warnings are the missing icon and CLAUDE.md not being loaded
  from a plugin.

## Done and committed (0338a46): installer

- `npm install` and `npm ci` no longer run the installer (it was npm's
  `install` lifecycle script, so it ran for real in CI and on every
  contributor checkout). It is now `npm run setup`.
- `--uninstall` used to delete the whole `~/.agents/skills` folder, taking
  every other package's skills and your own with it. It now removes only
  this package's 108 folders. Tested in a scratch home: a user skill survives.
- Antigravity gets its own copy in `~/.gemini/config/skills` (it does not
  read `~/.agents/skills`); the note says plainly the edit gate has no
  Antigravity manifest yet.
- The printed install commands are now the correct ones (see below).

## Done and committed (d20a0f4, 69b7e85): validator and server wording

- `verify:spec` runs a third-party npm port of the Agent Skills validator,
  not "the specification authors' own". I installed the official Python
  validator from agentskills/agentskills and ran it on all 108 skills: it
  agrees with the port; nothing wrong beyond the two documented extension
  fields (`disable-model-invocation`, `user-invocable`). The scripts now say
  so.
- The MCP server claimed an "SSE fallback". It offers stdio and Streamable
  HTTP only; comments and the package description now say that.

## Correct install commands (verified against each vendor's docs)

- Claude Code: `/plugin marketplace add Community-Access/accessibility-agents`,
  then `/plugin install accessibility-agents@community-access`.
- Copilot CLI: `copilot plugin marketplace add Community-Access/accessibility-agents`,
  then `copilot plugin install accessibility-agents@community-access`.
- VS Code: Chat: Install Plugin From Source, with the repository URL
  (needs `chat.plugins.enabled`).
- Direct: `npm install`, `npm install --prefix mcp-server`,
  `npm run setup -- --dry-run`, then `npm run setup`.

## In progress

Six agents are auditing all 108 skills in parallel and a seventh the docs,
each against the fact files, editing only its own folders and logging every
change with its source. Four of them stopped when the session was
interrupted at 5:17 and were restarted at your OK. When they finish, an
independent reviewer checks every change against the sources before it is
committed.

### Already found, being fixed

Standards and law (as of October 2026):

- ADA Title II dates moved by a DOJ interim final rule (91 FR 20902, 20 April
  2026): 26 April 2027 for populations of 50,000 or more, 26 April 2028 for
  smaller ones and special districts. WCAG 2.1 AA unchanged. Under challenge
  in NFB v. DOJ, no ruling yet.
- HHS Section 504 web dates moved to 11 May 2027 and 10 May 2028.
- EN 301 549 V4.1.1 (September 2026) is published and uses WCAG 2.2, but is
  not yet cited in the EU Official Journal, so V3.2.1 still gives presumption
  of conformity.
- ISO/IEC 40500:2025 is WCAG 2.2. WCAG 3.0's latest draft (10 September 2026)
  has no Bronze/Silver/Gold and does not include APCA; its contrast measure is
  "to be determined".
- 4.1.1 Parsing cited as live in four places; 2.4.12 labelled "Focus
  Appearance" (that is 2.4.13); WCAG 2.1 AA presented as the target in
  several skills; 14 axe commands that omit the 2.2 rules.

Packaging: the most serious finding. Installing as a plugin does not do what
the README says, on any client:

- No hooks load. Claude Code and Codex read `hooks/hooks.json` (or a `hooks`
  key in the manifest); Copilot and VS Code read
  `com.github.copilot/hooks/hooks.json`. The repo has only
  `hooks/<client>.hooks.json`.
- The MCP server does not load. Claude Code needs `.mcp.json` or
  `mcpServers` in its manifest; Agent Plugins 1.0 needs `$schema` and `type`
  in `mcp.json`. And the server needs its `node_modules`, which a plugin
  install does not create; the installer does not register it either.
- `copilot plugin install accessibility-agents` is not valid syntax; it is
  `copilot plugin marketplace add Community-Access/accessibility-agents`, then
  `copilot plugin install accessibility-agents@<marketplace>`.
- The root `plugin.json` uses two keys the closed Agent Plugins schema does
  not allow (`skills`, `mcp`); `marketplace.json` says 7.0.1, the rest 7.0.3.
- Antigravity does not read `~/.agents/skills` and does not use Gemini's hook
  names. Claude Code does not document `~/.agents/skills` either.
- `npm install` runs `scripts/install.mjs` for real (it is the `install`
  lifecycle script), before anyone can pass `--dry-run`.
- The `skills-ref` dev dependency is a third-party npm port, not the
  specification authors' validator (that one is Python, in agentskills).
- To check: Claude Code fires `SubagentStop` for subagents. `accessibility-lead`
  runs as an inline skill, so the gate that waits for it may never open on
  Claude Code. Claude Code is installed in this workspace, so this will be
  tested live, not guessed.

Other:

- VS Code loads any `.md` in `.github/agents/` as a custom agent, so the
  `.github/agents/preferences.md` the GitHub skills read would appear as an
  agent. Moving to `.github/accessibility-agents/preferences.md`, with the
  old path read as a fallback.
- About 60 live documents link to files that no longer exist (moved to
  docs/history or removed in 7.0). AGENTS.md itself points at two of them.
- `.github/workflows/a11y-check.yml` passes `--rules wcag2a,wcag2aa` (that
  flag takes rule IDs, not tags) and ends `|| true`, so it can never fail.
- About 100 live files break the house style (emoji, arrows, box drawing).

## Decisions for you (nothing blocked on these yet)

1. The MCP server needs `node_modules` to start, so a plugin install cannot
   run it as the repo stands. Options: publish `mcp-server` to npm and launch
   it with `npx`, or commit a bundled single-file build. Until you choose,
   the docs will say plainly that the scanners need `npm install` in
   `mcp-server/`.

## Pushing

Pushed to https://github.com/Community-Access/accessibility-agents/tree/chore/standards-audit-and-codespaces
(5ddd426, 3058dcf, 0fc0195, 0338a46, d20a0f4, 69b7e85). No pull request yet; one opens when the audit is done.
