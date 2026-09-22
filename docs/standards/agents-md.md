# AGENTS.md

The always-on instruction file, in the format every agentic client reads.

| | |
|---|---|
| Specification | <https://agents.md/> |
| Steward | Agentic AI Foundation, under the Linux Foundation |
| Adopted by | Codex, Copilot, Gemini CLI, Antigravity, Cursor, Claude Code via import, and tens of thousands of projects |
| Governs here | the one file every client loads before the user has spoken |
| Checked by | `scripts/validate-skills.mjs`, which asserts its size and that `CLAUDE.md` imports it |

## What the specification says

Plain Markdown, no required fields, placed at the repository root or closer to
the files it governs. The nearest file wins; a chat prompt overrides all. There
is no size guidance in the specification itself, but the clients have some:

| Client | Discovery | Limit |
|---|---|---|
| Codex | `~/.codex/AGENTS.md`, then every directory from the git root down to the working directory, concatenated | 32 KiB combined; discovery stops when reached |
| Copilot | nearest `AGENTS.md`, plus `CLAUDE.md` and `GEMINI.md` at the root | asks for "no longer than two pages" |
| Gemini CLI, Antigravity | `context.fileName` in settings, or an extension's `contextFileName` | none stated |
| Claude Code | `CLAUDE.md`, which imports `AGENTS.md` with `@AGENTS.md` | none stated |

## How this package uses it

There is one `AGENTS.md`, about 800 tokens. It holds:

1. What the package enforces, in a paragraph
2. The rule: which router to dispatch before touching which kind of file
3. The six routers, one line each
4. The eight standards that are not traded away
5. What to read before an audit: scan configuration and any previous report
6. House style: no emoji, no decorative Unicode, plain ASCII

Everything else that used to live in instruction files went elsewhere: the
agent roster to the generated [skills catalog](../reference/skills/README.md),
the report requirements and the dispatch contract to `skills/a11y-core/SKILL.md`,
client-specific notes to this documentation.

`CLAUDE.md` is one line, `@AGENTS.md`. `GEMINI.md` and
`.github/copilot-instructions.md` no longer exist; the clients that read them
read `AGENTS.md`.

## Why it is small

Every token in this file is paid on every turn, on every client, by every user.
Before 7.0 the equivalent files cost 5,400 tokens on Claude Code and 6,700 on
Copilot, and most of that was tables the model could not act on. The contract
is now the part that changes behaviour; the reference material is a link away.

## Sources

- AGENTS.md: <https://agents.md/>
- Codex discovery and the 32 KiB limit: <https://learn.chatgpt.com/docs/agent-configuration/agents-md>
- Copilot repository instructions: <https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions>
- Gemini context files: <https://geminicli.com/docs/cli/gemini-md/>
- Claude Code memory and imports: <https://code.claude.com/docs/en/memory>
