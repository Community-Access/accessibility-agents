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

JSON schemas for each are in `.github/schemas/`, so an editor validates them
as you type. The routers say so in their Phase 0: if a config file exists,
defaults are not used.

## Package budgets

`budgets.json` holds the context ceilings that CI enforces, per client, plus
the package limits: largest dispatchable body, Codex catalog cap, dispatch cost.
Measured by `skills/a11y-core/scripts/measure-context.mjs`; lower a ceiling when
you make something cheaper, never raise one without saying why in the file's
comment.

## Client settings

**Claude Code.** Install as a plugin and the hooks are wired. For a direct
install, merge `~/.claude/a11y-hooks.json` into `~/.claude/settings.json`
under `hooks`. Two settings make the package cheaper on a subscription:

```json
{ "promptCacheTtl": "1h", "subagentPromptCacheTtl": "1h" }
```

Skill content is stable between turns, so a longer cache lifetime turns most
of it into cache hits.

**Codex.** Reads `~/.agents/skills` and `~/.codex/hooks.json`. Nothing further.
The catalog cap is two percent of the context window; this package uses about
900 characters of the 8,000.

**Copilot.** Reads `~/.agents/skills`. Repository hooks live on the default
branch at `.github/hooks/`; copy `hooks/copilot.hooks.json` there in a
repository you want gated.

**Gemini CLI and Antigravity.** Read `~/.agents/skills`. Add `AGENTS.md` to
`context.fileName` in settings so the contract loads, and merge
`~/.gemini/a11y-hooks.json` under `hooks`.

## Environment variables

Two variables, both optional, and what reads each.

| Variable | Read by | Effect |
|---|---|---|
| `A11Y_GUARD_DIR` | `hooks/guard.mjs` | Where session markers are kept; defaults to the system temporary directory |
| `PORT` | `mcp-server/server.js` | HTTP port for the Streamable HTTP transport |

## Repository settings for contributors

`.claude/settings.json` points the enforcement hooks at this checkout, so the
gate runs on its own source. `.gitignore` excludes `.agents/`, which
`scripts/dev-link.mjs` creates locally, and `build/`, `artifacts/` and
`.a11y-history/`, which tools write.
