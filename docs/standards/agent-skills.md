# Agent Skills

The open format every skill in this package is written in.

| | |
|---|---|
| Specification | <https://agentskills.io/specification> |
| Steward | Anthropic, with adopters listed at <https://agentskills.io/> |
| Adopted by | Claude Code, Claude, ChatGPT and Codex, GitHub Copilot, VS Code, Gemini CLI, Cursor, OpenCode, OpenHands, Goose, JetBrains, Amp, Kiro and others |
| Reference validator | `skills-ref`, published by the specification authors |
| Governs here | all 108 directories under `skills/` |
| Checked by | `npm run verify:spec`, which runs `skills-ref validate` on every skill |

## What the specification requires

A skill is a directory whose name is a lowercase slug of at most 64 characters,
containing `SKILL.md` with YAML frontmatter. Six frontmatter fields are
defined:

| Field | Required | Limit | This package |
|---|---|---|---|
| `name` | yes | 64 characters, must match the directory | always present, checked |
| `description` | yes | 1,024 characters | present; routers under 160, others under 120 |
| `license` | no | | `MIT` on every skill |
| `compatibility` | no | 500 characters, only when environment-specific | not used |
| `metadata` | no | string map | tier, domain, output, effort, title |
| `allowed-tools` | no | experimental | not used |

The body should stay under roughly 5,000 tokens and 500 lines, with detail in
`references/`, executable helpers in `scripts/`, and supporting files in
`assets/`. References are one level deep. This package holds bodies to 6 KiB
for every tier but reference, and generates a `references/` index in each
skill that has one.

## Progressive disclosure, as the specification describes it

A client loads only a skill's name and description at start, about a hundred
tokens, and the body when the skill is activated. That is the mechanism this
package's cost model rests on: a router's description costs a line every turn;
a specialist's body costs nothing until a router dispatches it.

## Discovery locations

Where each client looks for skills, from the client documentation.

| Client | Reads |
|---|---|
| Claude Code | a plugin's `skills/`, `.claude/skills`, `.agents/skills` |
| Codex | `.agents/skills` in the repository and its parents, `~/.agents/skills` |
| Copilot CLI and VS Code | `.github/skills`, `.claude/skills`, `.agents/skills`, `~/.agents/skills` |
| Gemini CLI, Antigravity | `.agents/skills`, `.gemini/skills`, `~/.agents/skills` |

`~/.agents/skills` is the one path every client reads, which is why
`scripts/install.mjs` copies there and `scripts/dev-link.mjs` links a checkout's
`.agents/skills` to `skills/`.

## The one deviation

The specification's validator rejects any field it does not define. This
package sets two it does not:

| Field | Effect | Read by |
|---|---|---|
| `disable-model-invocation: true` | the skill's description leaves the model's context; the user can still invoke it | Claude Code, VS Code, Copilot CLI |
| `user-invocable: false` | the skill leaves the user's menu too; only a router can reach it | Claude Code, VS Code |

They are the mechanism by which 102 of 108 skills cost nothing until named. A
client that does not know the fields ignores them, which is what the
specification requires of unknown keys, and a live session on each client
confirms that exactly six skills reach the model.

`scripts/verify-spec.mjs` runs the reference validator and reports a skill
whose only unexpected fields are these two as conformant with a documented
extension. Any other unexpected field fails. Run with `--strict` to see the
package judged without the exemption; it fails 101 skills, which is the
honest number.

Codex does not read either field. It reads `agents/openai.yaml`, described
under [Codex](#codex) below.

## Codex

Codex discovers skills the same way but decides catalog membership from an
optional `agents/openai.yaml` beside `SKILL.md`:

```yaml
interface:
  display_name: "ARIA Specialist"
  short_description: "ARIA roles, states and properties for custom widgets."
policy:
  allow_implicit_invocation: false
```

A skill without the file is listed. A live probe with `codex debug prompt-input`
found the 29 reference skills that lacked one sitting in the model prompt; every
non-router now carries the file, and the live gate checks that Codex lists
exactly the six routers.

Codex caps its skill catalog at two percent of the context window, about 8,000
characters, and shortens descriptions under pressure. This package uses about
900.

## What is checked, and by what

Every claim above is checked by a tool, listed here so nothing rests on assertion.

| Claim | Tool |
|---|---|
| Every skill passes the reference validator, with the documented extension | `scripts/verify-spec.mjs` |
| Name matches directory, no byte-order mark, lowercase slug | `scripts/check-skill-conformance.mjs` |
| Body under 6 KiB for router, specialist and helper tiers | `scripts/validate-skills.mjs` |
| Every cited `references/` file exists, every reference file is cited | `scripts/validate-skills.mjs` |
| Frontmatter values that a real YAML parser would reject | `scripts/validate-skills.mjs` |
| Exactly six skills reach the model on Claude Code, Codex and Copilot | `scripts/verify-live.mjs` |

## Sources

- Agent Skills specification: <https://agentskills.io/specification>
- Claude Code skills: <https://code.claude.com/docs/en/skills>
- Codex skills: <https://learn.chatgpt.com/docs/build-skills>
- Copilot agent skills: <https://docs.github.com/en/copilot/concepts/agents/about-agent-skills>
- VS Code agent skills: <https://code.visualstudio.com/docs/copilot/customization/agent-skills>
- Gemini CLI skills: <https://geminicli.com/docs/cli/skills/>
