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

## Done and committed (325e936): GitHub, developer and desktop skills

24 skills, 40 files. Edited by one agent, then checked hunk by hunk by an
independent reviewer against primary sources: 161 of 164 hunks correct; the
three errors it found (a wrong Node 20 end-of-life date, and two NVDA
statements about nvdaAPIVersions.json) are fixed in the same commit.

- Preferences: `.github/accessibility-agents/preferences.md`, falling back to
  the old `.github/agents/` path.
- GitHub MCP tool names now match github-mcp-server (several did not exist;
  pr-review tried to merge through a read-only tool).
- GitHub REST enum values, label, branch protection and community health
  file behaviour match the OpenAPI description and docs.github.com.
- actions/checkout@v7; Node 24 or 22 (Node 20 ended 30 April 2026).
- HTML report templates: redundant ARIA landmark roles, and aria-label on
  elements ARIA does not allow to be named, removed.
- NVDA (2026.3 current), wxPython, Accessibility Insights for Windows,
  pywinauto and Windows contrast themes corrected.
- Left as is, unverified: 8 items, including a "30-40%" statistic with no
  source and some VS Code chat tool names.

## Done and committed (dafb4b8): APCA

The `check_apca_contrast` tool said APCA was "drafted for WCAG 3". The WCAG
3.0 draft of 10 September 2026 does not name APCA; its contrast measure is
"to be determined". The tool is now described as experimental.

## Done and committed (1c6316e): standards and law skills

13 skills. Independent review: 64 of 67 hunks correct against primary
sources; its five small items fixed. Legal content is dated "as of October
2026" and says it is not legal advice.

- WCAG 2.2 criteria list: all 86 names and levels verified.
- ADA Title II now 26 April 2027 / 26 April 2028 (interim final rule of 20
  April 2026, under challenge in NFB v. DOJ); HHS Section 504 11 May 2027 /
  10 May 2028; no Title III web regulation; Section 508 still WCAG 2.0 AA.
- EN 301 549 V4.1.1 (WCAG 2.2) published September 2026 but not yet cited
  in the EU Official Journal, so V3.2.1 still gives presumption of
  conformity. Canada SOR/2025-255. ISO/IEC 40500:2025 is WCAG 2.2. VPAT
  2.5Rev (April 2025).
- WCAG 3.0 described as its 10 September 2026 draft has it: one conformance
  level, no Bronze/Silver/Gold, no APCA, contrast measure undecided.
- 2.4.12/2.4.13 labels, 3.2.6 is Level A, all 31 AAA criteria listed.
- Invented PDF rule IDs and help-page anchors replaced with real ones.

## Done and committed (fa81246): web skills part 1

15 skills (ARIA, contrast, focus, forms, keyboard, live regions, links,
cognitive, design systems, email, data visualisation, Lighthouse).
Independent review recomputed every contrast ratio: 112 of 119 hunks
correct; its findings fixed (including six markdownlint errors the project
gate does not catch, and grade bands that disagreed with the renderer).

- Large text is 18pt / 14pt bold, not px; every ratio recomputed.
- Focus criteria separated into AA and AAA correctly; 2.5.8 test fixed.
- WCAG 2.2: 3.2.6 added; the lead's checklist covers the new AA criteria.
- ARIA examples now match the APG (tabs, accordion, carousel, dialog,
  toggle buttons, combobox); invalid ARIA removed.
- About ten files switched from prose replies to the findings JSON.

## Done and committed (e366de9): web skills part 2

15 skills, with the web accessibility wizard (the main web entry point).
Independent review: 129 of 132 hunks correct; its findings fixed.

- The wizard runs the full WCAG 2.2 AA axe tag set and says which 2.2
  criteria need manual testing; its VPAT handoff uses VPAT 2.5Rev, with the
  4.1.1 row handled as the template says; its scoring matches the renderer.
- web-csv-reporter follows axe-core 4.14's rules and help URLs; its ROI
  weights now match the renderer (decision 5 is done for this file).
- Native `<dialog>` with `showModal()` first in modal-specialist.
- testing-coach uses WebAIM Survey #11 figures instead of invented shares.
- Mobile APIs that did not exist replaced with ones that do.
- CI samples: actions v7 (verified with git ls-remote), Node 24.

## Done and committed (3e3bc20): document and Markdown skills

18 skills. Independent review installed python-pptx, python-docx and
openpyxl and validated every preset: 125 of 129 hunks correct; fixed.

- PDF: PDF/UA-1 and PDF/UA-2 plus WCAG 2.2 AA; Matterhorn 1.1 is UA-1
  only; 19 wrong Matterhorn checkpoint numbers corrected; UA-2 needs
  `pdfuaid:rev` 2024 as well as `pdfuaid:part`.
- ePub: the exact EPUB Accessibility 1.1 conformance string and metadata
  rules.
- Office: Python calls that did not exist replaced; current menu names;
  all 16 Accessibility Checker rules mapped.

## Done and committed (996e929, 9dc3e49): scanner fixes found by the audit

- `run_playwright_viewport_scan` claimed to test zoom and WCAG 1.4.4. It
  loads four widths and reports horizontal scrolling: a 1.4.10 check only.
  The description now says so.
- Office and ePub scan configs had no effect. The config schemas, the
  templates and the skills all put settings in `docx`/`xlsx`/`pptx` and
  `epub` blocks; the scanners read only top-level keys. They now read the
  block for the file's format (the old flat shape still works).
- `disabledRules` now accepts the skills' rule IDs (DOCX-E004 and so on) as
  well as the scanner's own (doc-title and so on). A test checks that every
  mapped ID exists in the rule sets. 112 MCP tests pass.

## In progress

Six agents are auditing all 108 skills in parallel and a seventh the docs,
each against the fact files, editing only its own folders and logging every
change with its source. Five of them stopped when the session was
interrupted at 5:17; four were restarted at your OK (standards and law, web
part 1, web part 2, documents and Markdown). The fifth, batch B (23
knowledge-base skills: CI, testing, scanning, framework, mobile, media,
Markdown and GitHub knowledge), had partly edited 6 files and was not
restarted: see Decisions. When they finish, an
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

## Decisions for you, with my advice

1. Batch B (23 knowledge-base skills): restarted at 6:01 PM, on "get
   everything golden". Nothing needed from you.

2. The MCP server cannot start from a plugin install, because a plugin is a
   git checkout with no `node_modules`.
   Options: (a) publish `mcp-server` to npm and launch it with `npx -y
   <package>@<version>`; (b) commit a bundled single file
   (`mcp-server/dist/stdio.mjs`, built with esbuild, checked by CI to match
   the source); (c) leave it and document `npm install --prefix mcp-server`.
   Advice: (b). Plugins install from git, so a bundle works on first run and
   offline, cannot drift from the skills it ships with, adds no npm
   publishing step or account, and keeps the 1.1 MB of runtime code
   reviewable in one place. The optional scanners (Playwright, axe, pdf-lib)
   stay optional and are not bundled. Choose (a) if you also want the
   server usable outside the plugin by people who never clone the repo.
   Until you choose, the docs say plainly that the install step is needed.

3. Re-run the live edit-gate test in Claude Code (my cloud workspace, a few
   Haiku calls). Advice: yes. The fix is tested offline with Claude Code's
   real payload shape, but a live run is the only proof the gate now opens
   after accessibility-lead and still blocks before it.

4. Codespaces. `accessibility-agents.md` in the AHG kit promises "the full
   version, scanners included" in a codespace; today a codespace gets the
   repo but VS Code sees neither the skills (root `skills/` is not a
   discovered location) nor the MCP server (no `.vscode/mcp.json`).
   Advice: add `.devcontainer/devcontainer.json` that runs `npm ci` and
   `npm ci --prefix mcp-server`, plus `.vscode/mcp.json` (VS Code's
   `servers` format) and `chat.agentSkillsLocations` pointing at `skills/`.
   About 30 lines, and it makes the AHG kit's promise true. Otherwise drop
   the Codespaces route from the kit. I can do either; say which.

5. One scoring model. The renderer (`merge-findings.mjs`: weights 10/5/2/1,
   grades 90/80/70/60) is what every report actually uses. The audit made
   the docs point to it; `web-csv-reporter`'s ROI weights (10/7/3/1) still
   differ. Advice: the renderer is the single source; align the CSV ROI
   weights to it.

6. GitHub skills and the findings contract. Several GitHub skills say to
   collect WCAG findings JSON from specialists they never dispatch, and
   their output (alerts, metrics) is not WCAG findings. Advice: state in
   `a11y-core` that the findings contract applies to accessibility audits,
   and let the GitHub workflow skills report in their own structure.

7. Antigravity has its own hook events and file, so the edit gate does not
   run there. Advice: add an Antigravity manifest later; low priority until
   someone uses it.

8. The unverified items in each batch (listed in the batch sections below
   when they land) are left as they were, not guessed. Advice: none is a
   risk to users; the "30-40%" and "~30%" statistics have been replaced
   with "a minority" where found, which is what the evidence supports.

## Pushing

Pushed to [the branch on GitHub](https://github.com/Community-Access/accessibility-agents/tree/chore/standards-audit-and-codespaces)
(see git log; every commit is listed above). No pull request yet; one opens when the audit is done.

## Remaining work (running checklist, updated with every push)

Last updated: 27 October 2026, 6:10 PM Mountain (Arizona).

- [x] Security advisories, MCP server bugs, plugin packaging, edit gate, installer
- [x] Skill batch F: GitHub, developer, desktop (24 skills)
- [x] Skill batch A: standards and law (13 skills)
- [x] Skill batch C: web part 1 (15 skills)
- [x] Skill batch D: web part 2 (15 skills)
- [x] Skill batch E: documents and Markdown (18 skills)
- [ ] Skill batch B: knowledge base (23 skills): editing, then independent review
- [ ] Documentation audit (README, docs/, workflows): editing, then independent review
- [ ] Decision 2: bundle the MCP server so plugin installs can start it
- [ ] Decision 3: live edit-gate test in Claude Code
- [ ] Decision 4: Codespaces dev container, VS Code skills and MCP settings
- [ ] Decision 6: findings contract scoped to accessibility audits in a11y-core
- [ ] Decision 7: Antigravity hook manifest, if its format can be verified
- [ ] Final full verification: every gate, markdownlint, plugin validate, live client checks
- [ ] Pull request to main (not merged)

STATUS: IN PROGRESS
