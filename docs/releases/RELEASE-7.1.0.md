# Accessibility Agents 7.1: The Edit Gate on Every Client

Released 28 October 2026. Pull request
[#221](https://github.com/Community-Access/accessibility-agents/pull/221).

## Overview

7.1 is the release where installing the package does what the README says, on
every client. It comes from a full audit of the package against current
standards and each client's own documentation, checked against primary
sources, with every change reviewed by a second agent that had not seen it.

## Highlights

### The edit gate works everywhere

Edits to user-facing files are refused until `accessibility-lead` has reviewed
the change.

- **Claude Code:** the gate used to lock edits for the whole session, because
  the lead runs as an inline skill and fires no stop event. It now opens when
  the lead loads through the Skill tool. Tested live, both ways.
- **Codex:** Codex rejected the hooks file over a `$comment` key, so the gate
  never ran. Fixed; Codex now lists all six hooks.
- **Antigravity (new):** the gate opens when Antigravity reads the lead's
  `SKILL.md`. Tested against Antigravity's documented hook payloads; not yet in
  a live Antigravity session.
- **Copilot CLI and VS Code:** plugin hooks now ship where Agent Plugins 1.0
  looks for them.
- The stop hook can no longer loop, and its refusal gives the model a reason it
  can act on.

### Plugin installs work

- Installing as a plugin used to load no hooks and no MCP server on any client.
  Both now load.
- The MCP server ships bundled as `mcp-server/dist/stdio.mjs`, so it starts
  from a plugin install with no `npm install`. A gate checks the bundle matches
  the source.
- `plugin.json` and `mcp.json` validate against the Agent Plugins 1.0 schemas.

### The scanners

- `run_axe_scan` never ran (it needs a page from a browser context). Fixed, and
  its findings use the standard WCAG form, such as `4.1.2 A`.
- axe now runs the WCAG 2.2 rules, including 2.5.8 Target Size, which never ran
  before.
- Office and ePub scan configs now take effect.

### Current standards, checked against the sources

All 108 skills and about 160 documents were checked against primary sources as
of October 2026, including:

- the ADA Title II and HHS Section 504 web rule dates,
- EN 301 549 V3.2.1 and V4.1.1 and their legal status,
- ISO/IEC 40500:2025, the latest WCAG 3 draft, VPAT 2.5Rev and PDF/UA-2,
- ARIA 1.2 and the APG patterns, axe-core 4.14, Lighthouse 13 and framework
  APIs.

Every report now uses one scoring model, the renderer's, and the skills that
describe scoring say what the reports compute.

## Install

The table lists each client with its install commands.

| Client | Install |
|---|---|
| Claude Code | `/plugin marketplace add Community-Access/accessibility-agents`, then `/plugin install accessibility-agents@community-access` |
| Copilot CLI | `copilot plugin marketplace add Community-Access/accessibility-agents`, then `copilot plugin install accessibility-agents@community-access` |
| VS Code | Chat: Install Plugin From Source, with `https://github.com/Community-Access/accessibility-agents` (needs `chat.plugins.enabled`) |
| Codex | `codex plugin marketplace add Community-Access/accessibility-agents`, then `codex plugin add accessibility-agents@community-access` for skills and scanners. Codex no longer loads plugin hooks, so for the edit gate use `npm run setup` from a checkout instead |
| Any client, from a checkout | `npm run setup` (add `-- --dry-run` to see what it will do first) |

## Removed

- **The VS Code extension.** The `@a11y` extension discovered
  `.github/agents/*.agent.md` files that 7.x no longer ships. VS Code installs
  the package natively as an agent plugin instead.

## Upgrading from 7.0

- If you installed from a checkout, pull and re-run `npm run setup`.
- **Codex:** the `~/.codex/hooks.json` that 7.0 wrote has a `$comment` key, so
  Codex rejects the whole file. Setup will not overwrite a hooks file that
  differs from what it writes, so if that file holds only this package's
  hooks, delete it before re-running setup; if you added hooks of your own,
  rename its `$comment` key to `description` instead.
- Node 22 or later is required (Node 20 reached end of life on 30 April 2026).
- If you merged `~/.claude/a11y-hooks.json` into your Claude Code settings by
  hand, remove those entries and use the plugin or `claude --plugin-dir`.

## Thank you

Fixes from [@w9fyi](https://github.com/w9fyi),
[@AdamMagued](https://github.com/AdamMagued) and
[@chrisnestrud](https://github.com/chrisnestrud) are in this release.

## Full changelog

See the 7.1.0 entry in [CHANGELOG.md](../../CHANGELOG.md), and
[the 7.1 standards audit](../history/2026-10-standards-audit.md) for how the
work was checked and what is left to do.
