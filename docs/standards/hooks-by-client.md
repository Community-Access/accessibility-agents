# Hooks, by client

There is no hook standard. Each client exposes lifecycle events under its own
names, with its own payload shape and its own manifest format. This package
handles that with one script and a thin manifest per client, and this page
records exactly what each client provides and what the package wires, so the
gate's coverage is a documented fact rather than an assumption.

## The five behaviours and where each client fires them

The table maps every behaviour in `hooks/guard.mjs` to the event that triggers
it in this package's manifests. A dash means the package wires no event for
that behaviour on that client; the note under the table says whether the
client has one.

| Behaviour | Claude Code | Codex | Copilot | Gemini CLI | Antigravity |
|---|---|---|---|---|---|
| detect: inject the contract once | `UserPromptSubmit` | `UserPromptSubmit` | `userPromptSubmitted` | `BeforeAgent` | `PreInvocation` |
| gate: refuse a UI edit before review | `PreToolUse` on Edit, Write, NotebookEdit, MultiEdit | `PreToolUse` on apply_patch, Edit, Write | `preToolUse` | `BeforeTool` on write_file, replace, edit | `PreToolUse` on write_to_file, replace_file_content, multi_replace_file_content |
| mark: lead completed, open the gate | `PostToolUse` on Skill, and `SubagentStop` | `SubagentStop` | `postToolUse` | `AfterTool` on activate_skill | `PostToolUse` on view_file, when the file read is the lead's SKILL.md |
| persist: save and restore across compaction | `PreCompact`, `SessionStart` | `PreCompact`, `SessionStart` | - | `PreCompress`, `SessionStart` | - |
| finalize: refuse to end an unreviewed turn | `Stop` | `Stop` | - | - | - |

Copilot does have `agentStop`, `subagentStop`, `preCompact` and `sessionStart`
events; the package does not wire them yet. On Gemini CLI the package wires no
finalize step.

Gemini CLI loads a skill with the `activate_skill` tool (`{ name }`), so the
gate opens on `AfterTool` for that tool, and the guard reads the skill's name
from `tool_input.name`. Earlier versions marked on `AfterAgent`, whose payload
names no skill, so the gate never opened on Gemini.

On Claude Code the lead is a skill that runs inline, which fires no
`SubagentStop`, so the gate also opens on `PostToolUse` for the Skill tool.
On every route (Skill tool, `SubagentStop`, Copilot `postToolUse`, Gemini
`AfterTool` on `activate_skill`) the guard opens the gate for exactly two skills,
`accessibility-lead` and `web-accessibility-wizard`, with or without a plugin
prefix such as `accessibility-agents:`. It reads the name from `agent_type`
(and similar fields) when a review runs as a subagent.

Antigravity has its own events (SessionStart, PreToolUse, PostToolUse,
PreInvocation, PostInvocation, Stop), read from `.agents/hooks.json` or
`~/.gemini/config/hooks.json`, with timeouts in seconds; it does not read
Gemini CLI's hook names or `~/.gemini/settings.json`. It has no skill tool and
no subagent stop event: it loads a skill by reading its `SKILL.md` with
`view_file` (which carries an `IsSkillFile` argument). So the gate opens when
`view_file` reads `accessibility-lead/SKILL.md` or
`web-accessibility-wizard/SKILL.md`, which, as on Claude Code, is launch rather
than completion. The guard reads the tool from `toolCall.name` and
`toolCall.args` (`TargetFile`, `AbsolutePath`) and the session from
`conversationId`, and replies with stdout JSON (`{"decision":"deny","reason"}`,
`{"decision":"allow"}`, `{"injectSteps":[...]}` or `{}`) and exit 0. No
finalize step is wired, because the output format of Antigravity's Stop hook is
not documented. The manifest is tested against the payloads Antigravity documents, not yet in a live Antigravity session.

## What that means for enforcement

**Claude Code and Codex** get the full gate: an edit is refused before review,
a turn cannot end with an unreviewed edit, and a wizard survives compaction.
On Codex that holds only for the `npm run setup` route, which writes
`~/.codex/hooks.json` (Codex then lists all six hooks: userPromptSubmit,
preToolUse, subagentStop, preCompact, sessionStart, stop). The Codex plugin
route gives no gate, because Codex 0.165.0 lists `plugin_hooks` as removed.

**Gemini CLI** gets the edit gate and compaction survival, but no finalize
step.

**Copilot** gets the edit gate only. A UI edit is still refused before review,
but a turn that somehow edited UI without one is not caught at its end, and
review state is not persisted across compaction. Copilot has the events to do
both; wiring them is open work. The edit gate is the floor every gated client
meets, and it is stated here rather than papered over.

**Antigravity** gets the edit gate, opened when the lead's skill file is read, but no finalize step and no compaction persistence. This is tested against the payloads Antigravity documents, not yet in a live Antigravity session.

## Manifest formats

Each client wants its manifest in a different shape. The script is the same;
only the wrapper differs.

| Client | Manifest | Root variable | Decision output |
|---|---|---|---|
| Claude Code, plugin | `hooks/hooks.json`, `hooks` object keyed by event, `matcher` regex | `${CLAUDE_PLUGIN_ROOT}` | JSON `hookSpecificOutput.permissionDecision`, or exit 2 |
| Codex | `hooks/codex.hooks.json`, written to `~/.codex/hooks.json` by `npm run setup`, same shape, `statusMessage` per hook, top-level `description` (Codex rejects unknown keys such as `$comment`, silently). The Codex plugin loads no hooks | replaced with the checkout path by `npm run setup` | JSON `permissionDecision: "deny"`, or exit 2 |
| Copilot CLI and VS Code, plugin | `com.github.copilot/hooks/hooks.json`, `version: 1`, `bash` and `powershell` commands, `timeoutSec` | `${PLUGIN_ROOT}` | non-zero exit denies `preToolUse` |
| Copilot, repository | `hooks/copilot.hooks.json` copied to `.github/hooks/`, same shape | none; paths are repository-relative | as above |
| Gemini CLI | `hooks/gemini.hooks.json`, named hooks with `description`, timeouts in milliseconds; the Gemini extension archive carries it as its `hooks/hooks.json` | `${extensionPath}` (quoted in each command), set by Gemini inside an extension and replaced with the checkout path by `npm run setup` | JSON `decision`, or exit code |
| Antigravity | `hooks/antigravity.hooks.json`, named hooks `a11y-detect`, `a11y-gate`, `a11y-mark`, timeouts in seconds; `npm run setup` writes it to `~/.gemini/config/hooks.json`, or beside an existing file as `hooks.a11y.json` to merge | `${PLUGIN_ROOT}`, replaced with the checkout path by `npm run setup` | stdout JSON `decision`, always exit 0 |

The script emits every client's output field at once. A client reads the key
it knows and ignores the rest, and the exit code carries the decision for a
client that reads nothing.

## Sessions

Codex reports a subagent's completion under a child session or parent thread
identifier that differs from the one the edit hook sees. The script treats
every identifier a payload carries as an alias of one session, which is what
makes a completed review visible to the gate. One session still cannot open
another's gate; the test suite checks both.

## Costs

The reminder is injected once per session, capped at sixty words, about 87
tokens. It used to be about 570 tokens on every prompt; over a forty-turn
session that alone was 22,000 tokens. The refusal is capped at forty words and
names the next action.

## What is checked

Live, in Claude Code (October 2026): the gate opens after `accessibility-lead`
runs through the Skill tool, and still blocks an edit made without it.

`hooks/guard.test.mjs`, 36 tests: the reminder fires once; the gate refuses
every user-facing extension and ignores build output, tests and dependencies;
every path key a client might use is recognised; only the lead opens the gate,
whether it runs as a subagent (`agent_type`) or through the Skill tool;
session aliases work and session isolation holds; finalize refuses an
unreviewed UI edit with a stop-event reason the model can act on, and stands
down when `stop_hook_active` says the client is already continuing because of
a stop hook, so it cannot loop; persist and detect report the event that fired
them; persist round-trips state; malformed input and unknown behaviours are
ignored rather than fatal.

## Sources

- Claude Code hooks: <https://code.claude.com/docs/en/hooks>
- Codex hooks: <https://learn.chatgpt.com/docs/hooks>
- Copilot hooks reference: <https://docs.github.com/en/copilot/reference/hooks-reference>
- Copilot cloud agent hooks: <https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/use-hooks>
- Antigravity hooks: <https://antigravity.google/docs/hooks>
- Gemini CLI hooks: <https://geminicli.com/docs/hooks/>
