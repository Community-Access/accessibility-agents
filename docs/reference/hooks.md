# Hooks

The enforcement gate: one script, five behaviours, four client manifests.
This page is the reference; the per-client event coverage and its sources are
in [Hooks, by client](../standards/hooks-by-client.md).

## Files

The gate is six files: the script, four manifests, and its tests.

| File | What it is |
|---|---|
| `hooks/guard.mjs` | The script. Every behaviour lives here, once. |
| `hooks/claude.hooks.json` | Claude Code event names mapped onto it |
| `hooks/codex.hooks.json` | Codex event names |
| `hooks/copilot.hooks.json` | Copilot coding-agent format, version 1 |
| `hooks/gemini.hooks.json` | Gemini CLI and Antigravity event names |
| `hooks/guard.test.mjs` | 22 tests; run with `node --test hooks/guard.test.mjs` |

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

## Sessions and markers

Markers live under `A11Y_GUARD_DIR` if set, otherwise in the system temporary
directory, one file per session per marker. Every identifier a payload carries
is treated as an alias of the same session, because Codex reports child
sessions and parent threads under different identifiers; treating them as
separate sessions is what previously made a completed review invisible to the
edit gate.

One session cannot open another session's gate. That is tested.

## Which skills open the gate

`accessibility-lead` and `web-accessibility-wizard`, with or without a plugin
prefix. An unrelated subagent completing does not open it. That is tested too.

## Failure behaviour

A crash in `gate` or `finalize` refuses the action. A crash elsewhere allows
it. Malformed input and an unknown behaviour are ignored rather than fatal, so
a misconfigured manifest cannot break every turn.

## Installing

A plugin install wires the manifest automatically. `node scripts/install.mjs`
writes the manifest for each client it finds, never overwriting a hooks file
that already exists; it writes beside it and tells you to merge. For
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
