# Directory submissions: status and follow-up

Running record for getting Accessibility Agents listed in each AI tool's
plugin or extension directory. Newest notes at the top of each section.

## Awesome Copilot (GitHub)

Status: LISTED.

- 2026-11-06: Confirmed in `plugins/external.json` on github/awesome-copilot
  main: name `accessibility-agents`, version 7.1.0, source
  `Community-Access/accessibility-agents`, path `accessibility-agents`,
  ref `copilot-plugin-v7.1.0-aaf1cfb`, sha `44594ff1`. The tag exists on
  origin, points at that sha, and the path exists at that commit.
- 2026-10-29: PR github/awesome-copilot#5983 merged (opened by the bot from
  request issue github/awesome-copilot#5882).
- Follow-up: the entry is pinned to a tag and sha. A new release does not
  update it; a version bump needs a new request or PR against
  `plugins/external.json`.

## Claude plugin directory (Anthropic)

Status: NEEDS CHANGES (refused by directory policy), as of 2026-11-06.
Plan: list the directory edition now; full plugin once Verified.

- 2026-11-06: Hosted MCP server deployed at <https://letitglow.app/a11y/mcp>
  (health: `/a11y/health`). Server: the letitglow.app / lp.csedesigns.com
  host. Container `a11y-mcp` from `~/app/a11y-mcp` (compose file there;
  source clone in `~/app/a11y-mcp/src`), on the `web_default` network,
  read-only, no capabilities, 512 MB. Mode `A11Y_MCP_TOOLSET=hosted`: eight
  tools, none reading files or fetching addresses. Caddy route added to
  `~/app/web/caddy/Caddyfile` inside `letitglow.app {}` as
  `handle_path /a11y/*`; backup `Caddyfile.bak-<date>-a11y-mcp` beside it.
  GLOW routes checked after reload (GLOW `/mcp/health` 200).
  To update: `cd ~/app/a11y-mcp && git -C src pull && docker compose up -d --build`.
- 2026-11-06: Directory edition: `scripts/build-claude-directory.mjs`,
  published to the `claude-directory` branch by `plugin-branch.yml`. Skills
  only (413 files), manifest points at the hosted server, a note in
  `skills/a11y-core/SKILL.md` tells Claude what the edition lacks and how to
  install the full one. `claude plugin validate` passes.
- Portal steps after the branch exists: change "Tracked branch or tag" from
  `plugin` to `claude-directory`, set "This plugin collects or transmits
  user data" to yes (it calls a remote MCP server), then "Check for new
  commits". Anthropic's docs also ask for the hosted server to be submitted
  as its own MCP connector.

- 2026-11-06, after PR 281: `plugin` at `1a2d177` (440 files, 2.1 MB) was
  scanned. The security scan PASSED ("1 fixed": the unreadable bundle).
  Directory policy then REFUSED the version with three blocking rules that
  apply because Community Access is not a Verified organization:
  - "Hooks of type command accepted only from Verified organizations".
    Every hook type is covered, so the edit gate cannot ship.
  - "Local MCP servers accepted only from Verified organizations". MCP
    servers at a public URL may stay.
  - "Files outside the allowed types accepted only from Verified
    organizations". Allowed: Markdown, text, JSON, YAML, PNG/JPEG/GIF/WebP/ICO
    images. Refused: any script or program (all `.js`/`.mjs`, including
    skill scripts and `hooks/guard.mjs`), any file starting with `#!`, and
    package-manager configuration files.
  - Still a policy hold: "Uses a credential from the user's machine".
  - Warning: `hooks/guard.mjs` has a line that writes a package manager's
    configuration ("File registry redirect").
  - The earlier versions were held rather than refused because they were
    never fully checked; these rules were always there.
- Two routes: ask Anthropic (`directory@anthropic.com`) how Community Access
  becomes a Verified organization, so the full plugin can be listed; and/or
  list a directory edition with only Markdown/JSON skills plus the MCP server
  at a public HTTPS URL (the letitglow.app hosting), keeping the full plugin
  with hooks in our own marketplace.
- Push webhook: the portal's "Set up push updates" dialog generates a
  secret that must be added to a GitHub webhook on the repository. The
  secret step is done by Jeff, not by an agent.

- 2026-11-06: Found in the developer portal
  (<https://claude.ai/directory/manage>), submitted 2026-10-28, contact
  `jeff@jeffbishop.com`. Latest version v7.1.0 at `90021f6` (the `plugin`
  branch head), scanned 2026-10-29: 424 files, 3.4 MB, 113 skills, 7 hooks,
  1 connector. Stage: In review, "Held for: Content policy review". No email
  is sent for this; status only shows in the portal. No resubmission needed.
  Holds and blockers:
  - Security scan: "Ships code the scan can't read" for
    `mcp-server/dist/stdio.mjs` (bundled, about 1.5 MB). Fix: ship the MCP
    server as readable source under the size limit instead of one packed
    bundle, push to `plugin`, then "Check for new commits".
  - Policy hold: "Uses a credential from the user's machine"
    (`.claude-plugin/plugin.json`). Either pass a `${user_config.KEY}` the
    user chooses to share, remove the credential read, or leave it for the
    reviewer to confirm.
  - Directory policy blocking: "Plugin not fully checked". Portal says a new
    check may clear it: "Check for new commits".
  - Informational only: local stdio MCP server (not on claude.ai), hooks,
    uninspected PreToolUse hook output, `privacyPolicyUrl` read by the
    directory only.
- The earlier Claude Console form is retired; the portal is the only route.
- 2026-11-06: Requested "Check for new commits" in the portal (clears the
  "Plugin not fully checked" blocker if the re-check completes).
- 2026-11-06: Bundle breakdown (esbuild metafile): zod 850 KiB, ajv
  207 KiB, MCP SDK 164 KiB, our own code about 200 KiB (largest file
  `server-core.js`, 86 KiB). Directory limits: every non-image file under
  256 KiB, 512 files maximum. Our own sources fit; zod cannot be shipped as
  one readable file under the limit. Options: drop the SDK, zod and ajv for
  a small hand-written stdio JSON-RPC layer (clears the size hold), or leave
  the bundle and let the reviewer clear it.
- 2026-11-06: Branch `fix/directory-readable-mcp`: the stdio server now runs
  from readable source with no dependencies (`mcp-server/lib/mcp-lite.js`,
  `mcp-server/lib/schema.js`); `dist/stdio.mjs` is a one-line launcher.
  Built plugin tree: 440 files, none 256 KiB or over, `claude plugin
  validate` passes, starts with no node_modules and lists 39 tools. All 121
  MCP server tests pass. After it merges and `plugin-branch.yml` updates the
  `plugin` branch, run "Check for new commits" in the portal and record the
  new scan result here.
- Hosting for ChatGPT (remote MCP) is a separate follow-up: under the
  letitglow.app domain, on the server behind lp.csedesigns.com, via
  `mcp-server/server.js`. Local-file tools cannot work remotely.
- Unavoidable reviewer checks for any Node MCP server: "Scripts the validator
  couldn't follow" (it only follows shell scripts). A first listing is
  always human-reviewed anyway; holds are not rejections.
- Credential hold: no `$GITHUB_TOKEN`-style read found in skills or the
  manifest. Likely sources inside the bundle: SDK auth code, and
  `GLOW_API_BASE_URL` in `tools/glow-tools.js` letting an environment
  variable redirect uploads. Removing that override and unbundling should
  make the source of the flag visible on the next scan.

- 2026-11-06: No entry in anthropics/claude-plugins-official
  `.claude-plugin/marketplace.json`. No PRs from our accounts to that repo;
  outside PRs there are routinely closed, so the route is the submission
  form, not a PR.
- 2026-10-29: Plugin-only tree built (`scripts/build-claude-plugin.mjs`),
  `plugin` branch kept current by `plugin-branch.yml` (last runs green),
  tagged `plugin-v7.1.0`. CHANGELOG says the original submission was from the
  repository root and carried dev tooling (root package.json triggers
  `npm ci` on install, over a thousand files). That is the likely reason it
  was not accepted.
- 2026-11-06: No reply was ever received for the first submission.
  Resubmitting through the form linked from the claude-plugins-official
  README: <https://clau.de/plugin-directory-submission>
- Next: record date submitted, confirmation ID, and the contact address here.

### Resubmission answers

- Plugin name: accessibility-agents
- Version: 7.1.0
- Source repository: <https://github.com/Community-Access/accessibility-agents>
- Branch / ref to install from: `plugin` (tag `plugin-v7.1.0`), not the
  repository root. Plugin-only tree, 423 files, no root package.json.
- Description: WCAG 2.2 AA enforcement. Six router skills dispatch the
  specialist team; hooks block UI edits until the accessibility lead has
  reviewed. Bundled MCP server with axe, Office, PDF and ePub scanners.
- Author: Community Access (Jeff Bishop and Taylor Arndt),
  <https://community-access.org>
- License: MIT
- Homepage: <https://github.com/Community-Access/accessibility-agents>
- Privacy policy:
  <https://github.com/Community-Access/accessibility-agents/blob/main/PRIVACY.md>
- MCP server: local stdio, `node ${CLAUDE_PLUGIN_ROOT}/mcp-server/dist/stdio.mjs`
  (bundled; no install step).
- Category: accessibility / developer tools.
- Contact email: the submitter's own address, entered by the submitter.

- 2026-11-07: The skills-only directory edition (commit 6166b7e on the
  `plugin` branch) passed validation, directory policy and the security
  scan, and is in review, waiting for a reviewer. Nothing is needed from us.
  Its manifest points at the hosted server below instead of a local one.

## Hosted MCP server and GLOW (letitglow.app)

Status: LIVE.

- Address: <https://letitglow.app/a11y/mcp> (Streamable HTTP, stateless, no
  authentication). Source on the server: `~/app/a11y-mcp/src`, on `main`;
  update with `git -C src pull && docker compose up -d --build` in
  `~/app/a11y-mcp`. The container is read-only, with a 64 MB tmpfs at
  `/home/node/.a11y-uploads` for uploads.
- 2026-11-07: Ten hosted tools. Eight work on their arguments (contrast,
  APCA, color blindness, reading level, guidelines, three HTML checks);
  `scan_uploaded_document` scans a Word, Excel, PowerPoint, PDF, ePub,
  Markdown or HTML file sent as base64 and deletes it before answering;
  `get_specialist` returns any of the 113 specialists' instructions. Checked
  live: every format scans and names its specialist, a 5 MB file works, no
  temporary path appears in a result.
- GLOW page: <https://letitglow.app/accessibility-agents>. Checks without AI,
  connector steps for ChatGPT, Claude, Claude Code and VS Code, and Ask with
  the visitor's own key (OpenAI, Gemini, Claude, OpenRouter with sign-in).
  Keys stay in the tab's sessionStorage. Show my models lists each key's
  models. A document is scanned in the original and reviewed as its
  specialist; an image gets alt text and a long description from the
  alt-text-headings specialist. Tested live with OpenRouter; the OpenAI,
  Gemini and Anthropic test keys were out of credit on 2026-11-07, which the
  page now reports plainly.

## Gemini CLI extensions gallery (Google)

Status: TO VERIFY.

- 2026-11-06: Repo has the `gemini-cli-extension` topic, and release v7.1.0
  attaches `accessibility-agents.tar.gz` plus per-platform archives built by
  `scripts/build-gemini-extension.mjs`. The gallery is crawled rather than
  submitted to; check whether it lists us and, if not, what it requires.

## Follow-up checklist

- [x] Claude: resubmit from the plugin branch; note confirmation.
- [ ] Claude: when the edition is listed, record the date; when the org is
  verified, switch `plugin-branch.yml` back to the full plugin.
- [ ] Claude: re-check marketplace.json two weeks after resubmitting.
- [ ] Gemini: confirm gallery listing or record the missing requirement.
- [ ] Awesome Copilot: update the pinned ref on the next release.
