# Accessibility Agents 7.0: One Package on the Open Agent Standards

Covers 7.0.0 and its three patch releases, 7.0.1, 7.0.2 and 7.0.3, all from
September 2026. None of them was tagged as a GitHub release; 7.1.0 is the
first tagged release of the 7.x line. For what to install today, see
[RELEASE-7.1.0.md](RELEASE-7.1.0.md).

## Overview

Accessibility Agents 7.0 replaces six hand-maintained, per-client trees with
one package of Agent Skills in `skills/`. Claude Code, Codex, Copilot, Gemini
CLI and Antigravity all read that one copy, so a fix lands everywhere at once.

The package is 108 skills in four tiers. Six routers are the only skills the
model sees until it needs more; they dispatch 57 specialists, 16 helpers and
29 reference skills by name, not by pasting instructions. Always-on context
cost fell by 84 to 93 percent depending on the client, and dispatching a
specialist fell from 26,929 tokens to 100.

## Highlights

### One package, read natively by every client

- 108 skills conforming to the Agent Skills specification.
- `AGENTS.md` is the only always-on instruction file; `CLAUDE.md` is one line
  that imports it.
- 843 per-client copies removed, including `.claude/agents`, `codex-plugin`,
  `.gemini`, `.github/agents` and `.github/prompts`.

### Findings mean the same thing whichever skill produced them

- One findings schema (`skills/a11y-core/schemas/findings.schema.json`) for
  every scanning skill.
- One report renderer (`render-report.mjs`) that writes all seven required
  sections, a score and grade, and a delta against the previous run.
- A WCAG 2.2 criterion list that every finding is checked against, so an audit
  cannot cite a criterion that does not exist, claim the wrong level, or cite
  the obsolete 4.1.1 Parsing as a requirement.

### One enforcement gate

- `hooks/guard.mjs` replaced four scripts in three languages, with a manifest
  per client.
- The edit gate opens when the lead completes, not when it starts, so a
  cancelled review no longer unlocks every edit.
- The reminder is injected once per session, capped at sixty words.

### An MCP server you can auto-approve

- Annotations and output schemas on all 39 tools; the 29 read-only scanners
  can be auto-approved, so a bulk scan stops asking once per document.
- A `render_accessibility_report` tool, so clients without a shell produce the
  same reports.

### Verification you can run

- `npm run verify` runs every gate, each naming the standard it checks and what
  a failure would cost a person. Context budgets are enforced in CI.
- A new installer, `scripts/install.mjs`, 8 KB replacing 215 KB of shell and
  PowerShell. It detects installed clients and will not overwrite a hooks file
  or a skill you edited.

## Patch releases

- **7.0.1** closed 24 high-severity dependency advisories and added the
  dependency gate that should have caught them.
- **7.0.2** came from the first end-to-end audit: findings from different
  specialists about the same defect now merge, so one problem is reported once
  instead of eight times.
- **7.0.3** fixed every MCP tool failing on invocation with an output
  validation error ([#205](https://github.com/Community-Access/accessibility-agents/issues/205)),
  and added an end-to-end `tools/call` gate.

## Upgrading from 6.x

The 6.x installers, per-client agent trees and `.a11y-agent-manifest` are gone.
Remove a 6.x install with the steps in [UNINSTALL.md](../../UNINSTALL.md)
("Pre-7.0 installs"), then install 7.x as described in
[RELEASE-7.1.0.md](RELEASE-7.1.0.md).

## Known issues fixed later

7.0 shipped with problems that the October 2026 audit found and 7.1.0 fixed:
plugin installs loaded no hooks or MCP server, the edit gate deadlocked on
Claude Code, the Codex hooks file was rejected by Codex, and `run_axe_scan`
never ran. Upgrade to 7.1.0.

## Full changelog

See the 7.0.0 to 7.0.3 entries in [CHANGELOG.md](../../CHANGELOG.md) and the
full account in [the 7.0 modernization](../history/2026-09-modernization.md).
