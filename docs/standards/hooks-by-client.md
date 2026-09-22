# Hooks, by client

There is no hook standard. Each client exposes lifecycle events under its own
names, with its own payload shape and its own manifest format. This package
handles that with one script and four thin manifests, and this page records
exactly what each client provides, so the gate's coverage is a documented
fact rather than an assumption.

## The five behaviours and where each client fires them

The table maps every behaviour in `hooks/guard.mjs` to the event that triggers
it on each client. A dash means the client has no event that fits.

| Behaviour | Claude Code | Codex | Copilot | Gemini and Antigravity |
|---|---|---|---|---|
| detect: inject the contract once | `UserPromptSubmit` | `UserPromptSubmit` | `userPromptSubmitted` | `BeforeAgent` |
| gate: refuse a UI edit before review | `PreToolUse` on Edit, Write | `PreToolUse` on apply_patch, Edit, Write | `preToolUse` | `BeforeTool` on write_file, replace |
| mark: lead completed, open the gate | `SubagentStop` | `SubagentStop` | `postToolUse` | `AfterAgent` |
| persist: save and restore across compaction | `PreCompact`, `SessionStart` | `PreCompact`, `SessionStart` | - | `PreCompress`, `SessionStart` |
| finalize: refuse to end an unreviewed turn | `Stop` | `Stop` | - | `AfterAgent` |

## What that means for enforcement

**Claude Code and Codex** get the full gate: an edit is refused before review,
a turn cannot end with an unreviewed edit, and a wizard survives compaction.

**Gemini and Antigravity** get the full gate under different names.

**Copilot** has no stop or compaction event. The edit gate is the enforcement
point there: a UI edit is still refused before review, but a turn that somehow
edited UI without one cannot be caught at its end. That is the floor every
client meets, and it is stated here rather than papered over.

## Manifest formats

Each client wants its manifest in a different shape. The script is the same;
only the wrapper differs.

| Client | Manifest | Root variable | Decision output |
|---|---|---|---|
| Claude Code | `hooks/claude.hooks.json`, `hooks` object keyed by event, `matcher` regex | `${CLAUDE_PLUGIN_ROOT}` | JSON `hookSpecificOutput.permissionDecision`, or exit 2 |
| Codex | `hooks/codex.hooks.json`, same shape, `statusMessage` per hook | `${PLUGIN_ROOT}` | exit code |
| Copilot | `hooks/copilot.hooks.json`, `version: 1`, `bash` and `powershell` commands, `timeoutSec` | none; paths are repository-relative | exit code |
| Gemini | `hooks/gemini.hooks.json`, named hooks with `description`, timeouts in milliseconds | `${extensionPath}` | JSON `decision`, or exit code |

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

`hooks/guard.test.mjs`, 22 tests: the reminder fires once; the gate refuses
every user-facing extension and ignores build output, tests and dependencies;
every path key a client might use is recognised; only the lead opens the gate;
session aliases work and session isolation holds; finalize refuses an
unreviewed UI edit; persist round-trips state; malformed input and unknown
behaviours are ignored rather than fatal.

## Sources

- Claude Code hooks: <https://code.claude.com/docs/en/hooks>
- Codex hooks: <https://learn.chatgpt.com/docs/hooks>
- Copilot coding agent hooks: <https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/use-hooks>
- Gemini CLI hooks: <https://geminicli.com/docs/hooks/>
