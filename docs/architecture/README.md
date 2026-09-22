# Architecture

How the package fits together, and the reasons behind each choice. Every
mechanism here is checked by a gate in `npm run verify`; the reasons are what
this page adds.

## The problem this shape solves

Models forget accessibility while generating code. The fix is to put a
reviewer between the model and the file, every time, on every client. Doing
that used to cost more than it saved: six per-client copies of eighty agents,
each copy loading eighty descriptions into every turn, each router pasting a
specialist's whole body into a prompt to dispatch it. The review was
thorough and unaffordable.

The 7.0 shape keeps the review and removes the cost.

## One tree, four tiers

Every agent is an Agent Skill under `skills/`. There are no per-client copies:
Claude Code reads the directory as a plugin, and Codex, Copilot, Gemini and
Antigravity read it from `~/.agents/skills` or a repository's `.agents/skills`.

The skills sit in four tiers, and the tier decides who may start one and what
it costs. This table is the whole cost model.

| Tier | Count | Model can invoke | User can invoke | Cost before dispatch |
|---|---:|---|---|---|
| Router | 6 | yes | yes | one line each, always |
| Specialist | 57 | no | yes, by name | nothing |
| Helper | 16 | no | no | nothing |
| Reference | 29 | no | no | nothing |

Only routers are model-invocable. The mechanism differs per client, and each
is verified in a live session by `npm run verify:live`:

- Claude Code and VS Code read `disable-model-invocation: true` in frontmatter.
- Codex reads `policy.allow_implicit_invocation: false` in `agents/openai.yaml`.
- Copilot CLI reads the same frontmatter field as Claude Code.

A specialist that no router names is unreachable. Each router's
`references/dispatch-matrix.md` is therefore generated from skill frontmatter
by `scripts/build-dispatch-matrices.mjs`, and the validator fails when a
specialist appears in no matrix.

## Pointer dispatch

A router never reads a specialist's body. It sends the client's generic
subagent a prompt under 300 tokens that names the skill:

```text
Activate the skill "aria-specialist". If skill activation is unavailable,
read skills/aria-specialist/SKILL.md and follow it.
Task: <one paragraph>
Scope: <files>
Rules: semantic HTML before ARIA; report, do not edit.
Return ONLY JSON matching skills/a11y-core/schemas/findings.schema.json.
```

The specialist loads its own instructions inside its own context. What comes
back is JSON. Before this, a router paid for the specialist's body twice, once
to read it and once to send it: 26,929 tokens for the largest. It now pays
about 100.

## Progressive disclosure

A skill's `SKILL.md` is under 6 KiB: role, the checklist, when to read more.
The long tail lives in `references/`, opened only when a task reaches it. The
web wizard's phases, the ARIA patterns, the framework-specific notes are all
there, and none of them cost anything until needed.

Reference-tier skills, prefixed `kb-`, are lookup data: rule tables, URL
registries, scoring formulas. They are exempt from the body budget because a
split lookup table is slower to use, and nothing loads one unless a skill cites
it.

## Findings, not prose

Every scanning skill returns JSON against one schema,
`skills/a11y-core/schemas/findings.schema.json`. That single decision gives
the package most of its new capabilities:

- Reports are rendered by `render-report.mjs` with all seven required sections,
  rather than typed by the model from a template it may not follow.
- Two skills finding the same defect in the same place merge to one finding.
- A defect repeated across forty pages under one component reports as one job.
- Each report embeds its merged findings, so the next run's delta is free.
- A criterion that does not exist in WCAG 2.2 fails a test before it reaches a
  compliance document.

The MCP server's 39 tools return the same shape, so a finding means the same
thing whether a skill or a scanner produced it.

## The enforcement gate

One script, `hooks/guard.mjs`, and four manifests that map each client's
event names onto its five behaviours: detect once per session, gate edits to
user-facing files, mark when the lead completes, persist across compaction,
finalize before a turn ends. It fails closed: a crash in the gate refuses the
edit rather than allowing it.

The gate opens on the lead's completion, not its launch. The previous design
opened on launch, so a cancelled review unlocked every edit for the rest of the
session.

## Measured, budgeted, verified

`skills/a11y-core/scripts/measure-context.mjs` reports what the package costs
per client; `budgets.json` holds the ceilings; CI fails on regression.
`scripts/verify.mjs` runs fifteen gates, each of which names the standard it
checks and what a failure would cost a person. The evidence is in
[the conformance dossier](../standards/conformance.md).

## Decisions and trade-offs

**No native subagent definitions.** The old agent formats could restrict tools
per agent; the Agent Skills standard cannot. The dispatch prompt carries
"report, do not edit" and the gate still blocks writes until the lead
completes. This was the price of one tree instead of six.

**Two frontmatter fields outside the specification.** `disable-model-invocation`
and `user-invocable` are Claude Code and VS Code extensions. They are what keep
102 skills out of the catalog. The specification's validator is run and the
deviation is recorded explicitly rather than hidden; see
[Agent Skills](../standards/agent-skills.md).

**Codex has its own mechanism.** A skill without `agents/openai.yaml` is listed
by Codex whatever its frontmatter says. Every non-router carries the file, and
the live gate checks that the count is exactly six.

**Copilot has no stop or compaction event.** The edit gate is the enforcement
floor there. The per-client table is in [Hooks, by client](../standards/hooks-by-client.md).

**The reports are generated.** A model can write a more fluent report than a
script. It cannot be relied on to write one with every section an auditor
needs, and it costs 15,000 tokens to try.
