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

## Done and committed (17c5a8e): the MCP server ships as a bundle

- `mcp-server/dist/stdio.mjs` is the stdio server and everything it imports,
  built with esbuild (`npm run build --prefix mcp-server`). A plugin install
  has no `node_modules`; it now starts the server anyway. Playwright, axe and
  pdf-lib stay optional and are not bundled.
- `mcp.json` and `.claude-plugin/plugin.json` launch the bundle.
- New gate (16 in all): `scripts/check-mcp-bundle.mjs` rebuilds the bundle
  and fails if the committed one differs.
- Tested with no `node_modules` at all: 39 tools load; Claude Code with
  `--plugin-dir` connects.

## Live edit-gate test in Claude Code: passed

Re-run after 0fc0195: an edit to an HTML file was refused before
`accessibility-lead` ran, and allowed after it ran through the Skill tool.

## Done and committed (60d7c54): run_axe_scan, and Codespaces

- `run_axe_scan` never worked: `@axe-core/playwright` refuses a page from
  `browser.newPage()`. Found by running it in a fresh dev-container checkout.
  Fixed there and in the high-impact Playwright check script.
- Its `wcag` field held raw axe tags; it now uses the findings-contract form
  (`4.1.2 A`). Three new tests, 115 in all.
- `.devcontainer/devcontainer.json`: Node 24, installs both packages and
  Chromium for Playwright, runs `npm run setup` (skills to
  `~/.agents/skills`, which VS Code reads). `.vscode/mcp.json` registers the
  bundled server. Tested in a scratch checkout.

## In progress

- Documentation audit (138 files: README, docs/, workflows, templates):
  edits done, 16 of 16 gates pass; an independent reviewer is checking every
  change against the code and the sources before it is committed.
- Batch B (23 knowledge-base skills): still editing.
- Smaller fixes, written, under independent review:
  - `npm run setup -- --uninstall` deleted Codex's own `~/.codex/hooks.json`
    (which may hold your hooks) and left the `*.a11y.json` merge files. It now
    removes that file only if it holds exactly what the installer wrote.
  - `action/action.yml`: Node 24, `setup-node@v7`, `upload-sarif@v4`.
  - `engines` in both package.json files: Node 22 or later (20 is end of
    life); an unused `playwright-core` dependency dropped.
  - `.codex-plugin/plugin.json`: dropped the undocumented `mcpServers` key.
  - `check_source_currency.py` looked for the source registry at a path that
    no longer exists.
  - Root `manifest.json` (docs site) regenerated: it listed 7.0-removed files;
    three empty "Prompts" sections removed from its workflow.
  - Config templates: `$schema` pointed at `./.github/schemas`, which does not
    exist once a template is copied into your project; now the GitHub URL.
  - The dependency gate said "no high or critical advisories in any tree"
    while the deprecated VS Code extension tree had four high; it now says
    which tree is not gated, and `npm audit fix` cut that tree to two (in a
    publishing tool, `@vscode/vsce`, with no fixed release yet).
  - Decision 6 below.

## Decisions: what was done

1. Batch B: restarted; still running.
2. MCP server: bundled (17c5a8e), as advised.
3. Live gate test: re-run, passed.
4. Codespaces: dev container and `.vscode/mcp.json` added (60d7c54).
5. One scoring model: the renderer is the single source; the CSV reporters
   and the cross-page skill now point to it.
6. GitHub skills and the findings contract: `a11y-core` now says the findings
   schema and renderer are for accessibility audits. Six GitHub workflow
   skills (pr-review, issue-tracker, daily-briefing, analytics,
   security-dashboard, insiders-a11y-tracker) now declare `artifact` and
   write their own documents; `github-hub` renders a report only for an
   accessibility audit.
7. Antigravity: not done, on purpose. Its hook format is documented
   (`.agents/hooks.json`, `PreToolUse`, a `decision: "deny"` reply), so the
   gate could block edits there. But nothing documented tells a hook that
   `accessibility-lead` has run (no skill tool, no agent name, no subagent
   stop event), so the gate would never open: the same deadlock fixed for
   Claude Code. Shipping it would break Antigravity. When Antigravity
   documents a skill-load signal, it is a small manifest plus a guard.mjs
   input mapping.
8. Unverified items are left as they were, not guessed.
9. Codex has no plugin install route from this repository (it needs a
   `.agents/plugins/marketplace.json`, and Codex installs plugins only from
   the ChatGPT desktop app). The docs say to use `npm run setup` on Codex.
   Adding a Codex marketplace file is a small follow-up if you want it.

## Pushing

Pushed to [the branch on GitHub](https://github.com/Community-Access/accessibility-agents/tree/chore/standards-audit-and-codespaces)
(see git log; every commit is listed above). No pull request yet; one opens when the audit is done.

## Remaining work (running checklist, updated with every push)

Last updated: 28 October 2026, 6:00 AM Mountain (Arizona).

- [x] Security advisories, MCP server bugs, plugin packaging, edit gate, installer
- [x] Skill batch F: GitHub, developer, desktop (24 skills)
- [x] Skill batch A: standards and law (13 skills)
- [x] Skill batch C: web part 1 (15 skills)
- [x] Skill batch D: web part 2 (15 skills)
- [x] Skill batch E: documents and Markdown (18 skills)
- [ ] Skill batch B: knowledge base (23 skills): editing, then independent review
- [ ] Documentation audit (README, docs/, workflows): edits done, under independent review
- [x] Decision 2: bundle the MCP server so plugin installs can start it
- [x] Decision 3: live edit-gate test in Claude Code
- [x] Decision 4: Codespaces dev container, VS Code skills and MCP settings
- [ ] Decision 6: findings contract scoped to accessibility audits in a11y-core: written, under review
- [x] Decision 7: Antigravity hook manifest: verified, and deliberately not shipped (see Decisions)
- [ ] Smaller fixes: uninstall, action.yml, engines, Codex manifest, currency script, docs manifest, templates, dependency gate: written, under review
- [ ] Final full verification: every gate, markdownlint, plugin validate, live client checks
- [ ] Pull request to main (not merged)

STATUS: IN PROGRESS
