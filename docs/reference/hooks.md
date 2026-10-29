# Hooks

The enforcement gate: one script, five behaviours, and a thin manifest per
client.
This page is the reference; the per-client event coverage and its sources are
in [Hooks, by client](../standards/hooks-by-client.md).

## Files

The gate is the script, its manifests, and its tests.

| File | What it is |
|---|---|
| `hooks/guard.mjs` | The script. Every behaviour lives here, once. |
| `hooks/hooks.json` | Plugin hooks read by Claude Code, rooted at `${CLAUDE_PLUGIN_ROOT}` (Codex no longer loads plugin hooks) |
| `com.github.copilot/hooks/hooks.json` | Plugin hooks read by the Copilot CLI and VS Code under Agent Plugins 1.0; camelCase events, so the guard reads `toolName` and `toolArgs`; tested against the payloads GitHub documents, not yet in a live Copilot session |
| `hooks/claude.hooks.json` | Claude Code event names, the same entries `.claude/settings.json` uses to gate this repository's own source; `npm run setup` no longer installs it |
| `hooks/codex.hooks.json` | Codex event names, written to `~/.codex/hooks.json` by `npm run setup`; the only route to the gate on Codex |
| `hooks/copilot.hooks.json` | Copilot format, version 1, for copying to `.github/hooks/` in a repository |
| `hooks/gemini.hooks.json` | Gemini CLI event names; marks on `AfterTool` for `activate_skill`. Shipped as `hooks/hooks.json` inside the Gemini extension archive |
| `hooks/antigravity.hooks.json` | Antigravity named hooks (`a11y-detect`, `a11y-gate`, `a11y-mark`), written to `~/.gemini/config/hooks.json` by `npm run setup`; tested against the payloads Antigravity documents, not yet in a live Antigravity session |
| `hooks/guard.test.mjs` | 56 tests; run with `node --test hooks/guard.test.mjs` |

## Behaviours

Each is selected with `--behaviour` and takes the client's hook payload on
standard input.

| Behaviour | What it does | Exit 2 means |
|---|---|---|
| `detect` | Injects a 60-word reminder of the contract, once per session | never |
| `gate` | Refuses an edit to a user-facing file until the lead has completed | edit refused |
| `mark` | Records that the lead finished; opens the gate | never |
| `persist` | Saves review state before compaction and restores it after | never |
| `finalize` | Refuses to end a turn that edited UI without a completed review | turn refused |

Exit code 0 lets the client proceed; 2 blocks. Where a client reads structured
output, the script also emits JSON with `permissionDecision`, `additionalContext`
and the equivalent fields other clients read. A client ignores the keys it does
not know.

## What counts as user-facing

Files matching these extensions are gated: `html`, `htm`, `jsx`, `tsx`, `vue`,
`svelte`, `astro`, `css`, `scss`, `sass`, `less`, `ejs`, `hbs`, `handlebars`,
`erb`, `leaf`, `jinja`, `jinja2`, `twig`, `blade.php`, `razor`, `cshtml`.

Exempt, because they are not a person's interface: anything under
`node_modules`, `vendor`, `dist`, `build`, `out`, `coverage`, `.git`, or a
`__tests__`, `__mocks__` or `__snapshots__` directory; `.test`, `.spec` and
`.stories` files; and minified assets.

## Edits made through a shell

A shell command can change a file as surely as an edit tool can, and Claude
Code's auto mode tells the model to prefer the shell for edits. So the gate
also runs on `Bash` (Claude Code, Codex), `run_shell_command` (Gemini CLI) and
`bash` or `powershell` (Copilot CLI),
and reads the command for the files it writes:

- a redirect: `> file`, `>> file`, a heredoc such as `cat > file <<EOF`
- `tee`, `truncate`, `mv`, and `cp`, `install` or `rsync` to a destination
- `sed -i`, `perl -i` and `ruby -i`
- `dd of=file`
- PowerShell `Set-Content`, `Add-Content`, `Out-File`, `Copy-Item` and `Move-Item`
- an inline script (`python3 -c`, `node -e`, or a heredoc fed to an
  interpreter) that opens a file for writing, such as `open(path, 'w')`,
  `write_text` or `writeFileSync`

A command that only reads a user-facing file (`cat`, `grep`, `sed -n`, a
linter, `cp` of the file to somewhere else) is not refused.

The limit: the gate reads the command, it does not run it. A path built in a
shell variable, a script run by name that writes the file, or `git checkout`
of a file is not seen. This is a guardrail against the ordinary way an edit
happens, not a sandbox: getting past it now has to be deliberate, and
`finalize` still refuses to end a turn whose UI edit was refused.

## Sessions and markers

Markers live under `A11Y_GUARD_DIR` if set, otherwise in the system temporary
directory, one file per session per marker. Every identifier a payload carries
is treated as an alias of the same session, because Codex reports child
sessions and parent threads under different identifiers; treating them as
separate sessions is what previously made a completed review invisible to the
edit gate.

One session cannot open another session's gate. That is tested.

## Which skills open the gate

`accessibility-lead` and `web-accessibility-wizard`, with or without the
`accessibility-agents:` plugin prefix, whether they run as a subagent (the
guard reads `agent_type`, `subagent_type` and similar fields) or inline through
Claude Code's Skill tool (`PostToolUse` with matcher `Skill`). The Skill-tool
route fires when the lead's instructions are loaded, which is launch rather
than completion, because an inline skill has no completion event; `finalize`
stays the backstop. Gemini CLI opens it on `AfterTool` for `activate_skill`.
Antigravity and Codex have no skill tool, so it opens when the lead's
`SKILL.md` is read: with `view_file` on Antigravity, and with a shell read
(`PostToolUse` for `Bash`) on Codex, where a prompt that names
`$accessibility-lead` or `$web-accessibility-wizard` also opens it. Listing,
grepping, diffing or writing the file does not. An unrelated
subagent or another skill completing does not open it. That is tested too.

The Copilot CLI documents that a skill's `SKILL.md` is injected into the
agent's context but not which tool does it, so the gate opens on every route
Copilot can take: a `skill` tool call naming the lead, a `view` or shell read
of its `SKILL.md`, a `subagentStop` naming it, or a prompt that asks for
`/accessibility-lead` or `/web-accessibility-wizard`. Which of these a live
session uses is on the live checks list.

## Failure behaviour

A crash in `gate` or `finalize` refuses the action. A crash elsewhere allows
it. Malformed input and an unknown behaviour are ignored rather than fatal, so
a misconfigured manifest cannot break every turn.

## Installing

A plugin install wires the manifest on Claude Code (`hooks/hooks.json`) and on
the Copilot CLI and VS Code (`com.github.copilot/hooks/hooks.json`).
`npm run setup` writes the manifest for Codex, Gemini CLI and Antigravity when
it finds them. Re-running it replaces a hooks file it wrote earlier (one that
holds exactly what it writes); a hooks file holding anything else is never
overwritten: the manifest is written beside it and you are told to merge. The
guard accepts tool arguments sent either as an object or as a JSON string. It writes nothing for Claude Code, which gets its hooks
from the plugin or `claude --plugin-dir <checkout>`. For
developing this repository, `.claude/settings.json` already points at
`hooks/guard.mjs`, so the gate runs on its own source.

## Testing a manifest by hand

```bash
echo '{"session_id":"t","tool_input":{"file_path":"src/App.tsx"}}' \
  | node hooks/guard.mjs --behaviour gate --client claude; echo "exit $?"
```

Expect exit 2 and a refusal naming `accessibility-lead`. Then:

```bash
echo '{"session_id":"t","subagent_type":"accessibility-lead"}' \
  | node hooks/guard.mjs --behaviour mark --client claude
```

and the same gate call exits 0.
