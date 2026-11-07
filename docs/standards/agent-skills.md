# Agent Skills

The open format every skill in this package is written in.

| | |
|---|---|
| Specification | <https://agentskills.io/specification> |
| Steward | Originally developed by Anthropic and released as an open standard, open to contributions; adopters listed at <https://agentskills.io/> |
| Adopted by | Claude Code, Claude, ChatGPT and Codex, GitHub Copilot, VS Code, Gemini CLI, Cursor, OpenCode, OpenHands, Goose, JetBrains, Amp, Kiro and others |
| Reference validator | `skills-ref`, the Python package in <https://github.com/agentskills/agentskills/tree/main/skills-ref> (`skills-ref validate ./my-skill`) |
| Governs here | all 113 directories under `skills/` |
| Checked by | `npm run verify:spec`, which runs `skills-ref validate` from the npm package `skills-ref` 0.1.5, a third-party port of the reference validator, on every skill |

## What the specification requires

A skill is a directory whose name is a lowercase slug of at most 64 characters,
containing `SKILL.md` with YAML frontmatter. Six frontmatter fields are
defined:

| Field | Required | Limit | This package |
|---|---|---|---|
| `name` | yes | 64 characters, lowercase, must match the directory, no leading, trailing or doubled hyphen | always present, checked |
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
| Claude Code | a plugin's `skills/`, `.claude/skills` (and nested or parent directories), `~/.claude/skills`, `--add-dir` directories |
| Codex | `.agents/skills` in the working directory, its parents and the repository root, `~/.agents/skills`, `/etc/codex/skills` |
| Copilot CLI and VS Code | `.github/skills`, `.claude/skills`, `.agents/skills`, `~/.copilot/skills`, `~/.agents/skills`; VS Code also reads `~/.claude/skills`, extra locations from `chat.agentSkillsLocations`, and a plugin's `skills/` |
| Gemini CLI | `.agents/skills`, `.gemini/skills`, `~/.agents/skills`, `~/.gemini/skills` (the `.agents` paths take precedence) |
| Antigravity | `.agents/skills` (legacy `.agent/skills`) in the workspace; `~/.gemini/config/skills` globally (`~/.gemini/antigravity-cli/skills` for the CLI) |

No single personal path is read by every client. `~/.agents/skills` covers
Codex, the Copilot CLI, VS Code and Gemini CLI, which is why `npm run setup`
copies there; it also copies to `~/.gemini/config/skills` for Antigravity.
Claude Code documents neither, so it gets the package as a plugin.
`scripts/dev-link.mjs` links a checkout's `.agents/skills` to `skills/`, which
every client except Claude Code reads as a workspace location.

A root `skills/` folder, as this repository has, is not a workspace skills
location for any of these clients. It is read only when the repository is
installed as a plugin.

## The one deviation

The specification defines six frontmatter fields and says nothing about
others; its reference validator rejects any field outside the six. This
package sets two it does not define:

| Field | Effect | Read by |
|---|---|---|
| `disable-model-invocation: true` | the skill's description leaves the model's context; the user can still invoke it | Claude Code, VS Code, Copilot CLI |
| `user-invocable: false` | the skill leaves the user's `/` menu. On Claude Code, with both fields set, neither the user nor the model can invoke it through the Skill tool, so a router reaches it by reading its file. On VS Code the model can still load it | Claude Code, VS Code |

They are the mechanism by which 107 of 113 skills cost nothing until named.
The specification does not say what a client must do with a field it does not
define. The clients measured live (Claude Code, Codex, Copilot) load these
skills, and the live gate confirms that exactly six skills reach the model on
each.

The Python reference validator was run on all 108 skills on 27 October 2026,
before the five Open Source Accessibility Framework skills were added, and
reported no problem other than these two fields.

`scripts/verify-spec.mjs` runs the reference validator and reports a skill
whose only unexpected fields are these two as conformant with a documented
extension. Any other unexpected field fails. Run with `--strict` to see the
package judged without the exemption; it fails 107 skills, which is the
honest number. The script runs the npm port, not the Python reference, so a
difference between the two would not show up here.

Codex does not read either field. It reads `agents/openai.yaml`, described
under [Codex](#codex) below.

### Why 46 skills set both fields

The reference skills (`a11y-core`, the `kb-` skills), the scan configuration
skills, the bridges and fixers set both `user-invocable: false` and
`disable-model-invocation: true`. VS Code's skills page lists that pair as a
disabled skill: it is in neither the `/` menu nor the set the agent loads on
its own ([VS Code agent skills](https://code.visualstudio.com/docs/copilot/customization/agent-skills)).
That is the intent here. Nobody is meant to start these skills; a router or
specialist names one and reads its `SKILL.md` by path, as `a11y-core`
describes, and `agents/openai.yaml` says the same to Codex ("dispatched by a
router, never picked implicitly"). The cost of the design is that a hidden
skill nothing names can never run, and nothing would say so. So
`scripts/check-skill-conformance.mjs` fails when a skill with both fields is
not named, directly or through a chain, by a skill that can be started. When
the check was added on 29 October 2026 it found ten `kb-` skills that nothing
named; each is now cited by the specialist whose work it supports, and all 46
are reached.

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

Codex caps its skill catalog at 2 percent of the model's context window, or
8,000 characters when the window is unknown, and the cap is configurable with
`skills.max_context_tokens`; it shortens descriptions under pressure. This
package's catalog is about 870 characters.

## What is checked, and by what

Every claim above is checked by a tool, listed here so nothing rests on assertion.

| Claim | Tool |
|---|---|
| Every skill passes `skills-ref validate` (the npm port), with the documented extension | `scripts/verify-spec.mjs` |
| Name matches directory, no byte-order mark, lowercase slug | `scripts/check-skill-conformance.mjs` |
| Every skill hidden from both model and user is named by a skill that can be started | `scripts/check-skill-conformance.mjs` |
| The OpenAI directory package meets every published limit | `scripts/package-openai-plugin.mjs` |
| Body under 6 KiB for router, specialist and helper tiers | `scripts/validate-skills.mjs` |
| Every cited `references/` file exists, every reference file is cited | `scripts/validate-skills.mjs` |
| Frontmatter values that a real YAML parser would reject | `scripts/validate-skills.mjs` |
| Exactly six skills reach the model on Claude Code, Codex and Copilot | `scripts/verify-live.mjs` |

## Sources

- Agent Skills specification: <https://agentskills.io/specification>
- Claude Code skills: <https://code.claude.com/docs/en/skills>
- Codex skills: <https://learn.chatgpt.com/docs/build-skills>
- Copilot agent skills: <https://docs.github.com/en/copilot/concepts/agents/about-agent-skills>
- VS Code agent skills: <https://code.visualstudio.com/docs/agent-customization/agent-skills>
- Antigravity skills: <https://antigravity.google/docs/skills>
- Reference validator: <https://github.com/agentskills/agentskills/tree/main/skills-ref>
- Gemini CLI skills: <https://geminicli.com/docs/cli/skills/>
