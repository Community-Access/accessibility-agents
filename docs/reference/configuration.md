# Configuration

Everything a user or contributor can set, where it lives, and what reads it.

## Scan configuration

Drop one of these in a workspace root and every skill that scans that kind of
content honours it instead of its defaults. Profiles for strict, moderate and
minimal live in `templates/`; copy one and edit.

| File | Read by | Controls |
|---|---|---|
| `.a11y-web-config.json` | web skills and the axe scanner | rules on or off, severity floor, paths to ignore |
| `.a11y-office-config.json` | Word, Excel, PowerPoint skills | DOCX, XLSX and PPTX rules, severity floor |
| `.a11y-pdf-config.json` | PDF skill and veraPDF | PDF/UA and best-practice rules, Matterhorn checks |
| `.a11y-epub-config.json` | ePub skill | EPUB Accessibility 1.1 rules |
| `.a11y-markdown-config.json` | markdown skills and linter | rule severities, ignored directories, emoji mode |

JSON schemas for the Office, PDF, ePub and markdown files are in
`.github/schemas/`. The templates point their `$schema` at the published copy,
`https://raw.githubusercontent.com/Community-Access/accessibility-agents/main/.github/schemas/<kind>-config.schema.json`,
so an editor validates a copied config as you type; the web config has no
schema yet. The routers say so in their Phase 0: if a config file exists,
defaults are not used.

## Package budgets

`budgets.json` holds the context ceilings that CI enforces, per client, plus
the package limits: largest dispatchable body, Codex catalog cap, dispatch cost.
Measured by `skills/a11y-core/scripts/measure-context.mjs`; lower a ceiling when
you make something cheaper, never raise one without saying why in the file's
comment.

## Workspace preferences

The GitHub workflow skills (daily briefing, issue tracker, PR review,
analytics, team and repository administration, and the others under
`github-hub`) read optional preferences from
`.github/accessibility-agents/preferences.md` in your workspace: which
repositories to include or exclude, team members, saved searches and per-repo
tracking. Copy [preferences.example.md](preferences.example.md) there and keep
the sections you need. Without the file, each skill falls back to its stated
default, usually the repository of the current workspace.

Older versions read `.github/agents/preferences.md`. Move the file: VS Code
treats every `.md` file in `.github/agents/` as a custom agent, so a
preferences file there shows up in the agent picker.

## Client settings

**Claude Code.** Install as a plugin: it loads the skills, the hooks (from
`hooks/hooks.json`) and the MCP server, which ships as a bundle
(`mcp-server/dist/stdio.mjs`) and starts with no `npm install`.
Claude Code does not read `~/.agents/skills`, so `npm run setup` writes no
Claude Code hook file: gate hooks on their own would refuse every UI edit in a
session where `accessibility-lead` cannot load. To use a checkout without
installing the plugin, start Claude Code with `--plugin-dir <checkout>`, which
loads the skills, the hooks and the MCP server together. Two settings (Claude Code v2.1.242 or later) set a one-hour
prompt cache lifetime:

```json
{ "promptCacheTtl": "1h", "subagentPromptCacheTtl": "1h" }
```

Skill content is stable between turns, so a longer cache lifetime turns most
of it into cache hits.

**Codex.** Reads `~/.agents/skills` and `~/.codex/hooks.json`. Nothing further.
Codex caps its skill catalog at 2 percent of the model's context window, or
8,000 characters when the window is unknown, and the cap is configurable with
`skills.max_context_tokens`. This package's catalog is about 870 characters.

**Copilot CLI and VS Code.** Read `~/.agents/skills`. A plugin install wires
the hooks through `com.github.copilot/hooks/hooks.json`. Without the plugin,
copy `hooks/copilot.hooks.json` to `.github/hooks/` in a repository you want
gated: the CLI reads `.github/hooks/*.json` in the repository, and the Copilot
cloud agent reads them from the default branch.

**Gemini CLI.** Reads `~/.agents/skills`. Add `AGENTS.md` to
`context.fileName` in settings so the contract loads, and merge
`~/.gemini/a11y-hooks.json` into `~/.gemini/settings.json` under `hooks`.

**Antigravity.** Reads global skills from `~/.gemini/config/skills`, where
`npm run setup` copies them, and workspace skills from `.agents/skills`. It
does not use Gemini CLI's hook events or `~/.gemini/settings.json`: its hooks
(SessionStart, PreToolUse, PostToolUse, PreInvocation, PostInvocation, Stop)
live in `.agents/hooks.json` or `~/.gemini/config/hooks.json`, and this package
ships no Antigravity manifest, because no documented Antigravity hook signal tells the guard that `accessibility-lead` ran, so the gate would never open.

## Environment variables

Five variables, all optional, and what reads each.

| Variable | Read by | Effect |
|---|---|---|
| `A11Y_GUARD_DIR` | `hooks/guard.mjs` | Where session markers are kept; defaults to the system temporary directory |
| `PORT` | `mcp-server/server.js` | HTTP port for the Streamable HTTP transport; default 3100 |
| `A11Y_MCP_HOST` | `mcp-server/server.js` | Bind address; default 127.0.0.1 |
| `A11Y_MCP_STATELESS` | `mcp-server/server.js` | Set to `1` for stateless mode (no sessions, POST only); default is stateful |
| `GLOW_API_BASE_URL` | `mcp-server/tools/glow-tools.js` | Base URL the GLOW tools call; default `https://letitglow.app/mcp` |

## Repository settings for contributors

`.claude/settings.json` points the enforcement hooks at this checkout, so the
gate runs on its own source. `.gitignore` excludes `.agents/`, which
`scripts/dev-link.mjs` creates locally, and `build/`, `artifacts/` and
`.a11y-history/`, which tools write.
