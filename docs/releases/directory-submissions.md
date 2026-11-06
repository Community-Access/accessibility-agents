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

Status: IN REVIEW, HELD (developer portal), as of 2026-11-06.

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

## Gemini CLI extensions gallery (Google)

Status: TO VERIFY.

- 2026-11-06: Repo has the `gemini-cli-extension` topic, and release v7.1.0
  attaches `accessibility-agents.tar.gz` plus per-platform archives built by
  `scripts/build-gemini-extension.mjs`. The gallery is crawled rather than
  submitted to; check whether it lists us and, if not, what it requires.

## Follow-up checklist

- [ ] Claude: resubmit from the plugin branch; note confirmation.
- [ ] Claude: re-check marketplace.json two weeks after resubmitting.
- [ ] Gemini: confirm gallery listing or record the missing requirement.
- [ ] Awesome Copilot: update the pinned ref on the next release.
