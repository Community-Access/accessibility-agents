---
name: a11y-core
description: Shared contract for the Accessibility Agents skills - dispatch, findings schema, report rules. Read by skills, never dispatched on its own.
license: MIT
disable-model-invocation: true
user-invocable: false
metadata:
  tier: reference
  domain: cross-cutting
  output: none
  effort: low
  title: Accessibility Agents Core
---
Shared rules for every skill in the Accessibility Agents package. Skills point
here instead of repeating this text. Read the section you need.

## Tiers

Every skill sits in one of four tiers. The tier decides who can start it and
what it is allowed to cost.

| Tier | What it is | Who invokes it |
|---|---|---|
| router | The six entry points: accessibility-lead, web-accessibility-wizard, document-accessibility-wizard, markdown-a11y-assistant, developer-hub, github-hub | The model or the user |
| specialist | One accessibility domain, one checklist, one findings payload | A router, by pointer |
| helper | Mechanical work: inventory, scanning one file, CSV export, scan config | A router, by pointer |
| reference | Rule tables, URL registries, scoring formulas. `kb-` prefix | Cited by a skill that needs the data |

Only routers are model-invocable. Specialists and helpers stay out of every
client's skill catalog so they cost nothing until a router names one.

## Dispatch contract

A router dispatches a specialist with the client's own subagent primitive. Keep
the prompt at this shape and this size. Never read a specialist's instructions
into the router's own context, and never paste a specialist body into a prompt.

```text
Activate the skill "aria-specialist". If skill activation is unavailable,
read skills/aria-specialist/SKILL.md and follow it.
Task: <one paragraph, what to check and why>
Scope: <file list or glob>
Rules: semantic HTML before ARIA; report, do not edit.
Return ONLY JSON matching skills/a11y-core/schemas/findings.schema.json.
```

Per client: Claude Code uses the Agent tool, Codex spawns a worker subagent,
Copilot uses a subagent or handoff, Gemini and Antigravity use the generalist
agent. The prompt is the same in all four.

The specialist reads its own instructions inside its own context. The router
receives JSON. Nothing else crosses the boundary.

## Output contract

Skills declare `metadata.output`, and it decides what they return.

- **findings** - only JSON matching `schemas/findings.schema.json`. No prose,
  no preamble, no restated instructions.
- **report** - collect findings JSON from each dispatched skill, write them to
  `.a11y-history/<timestamp>/`, then render with
  `node skills/a11y-core/scripts/render-report.mjs`. Never type a report by hand.
- **artifact** - produce the file or script asked for; report the paths written
  and what each changes.
- **guidance** - answer the question, cite the criterion or API by name, stop.

Severity is one of `critical`, `serious`, `moderate`, `minor`. Confidence is
`high`, `medium` or `low`. A finding without a location and a fix is not a
finding.

## Non-negotiable standards

These hold for every web skill in the package and do not need restating in a
dispatch prompt.

- Semantic HTML before ARIA. A `button` element beats `div role="button"`.
- One H1 per page. Never skip heading levels.
- Every interactive element reachable and operable by keyboard.
- Text contrast 4.5:1. UI component and graphical object contrast 3:1.
- No information carried by color alone.
- Focus managed on route change, dynamic content and deletion.
- Dialogs trap focus and return it on close.
- Dynamic content updates are announced.

## Report requirements

Any audit report this package produces carries all of these, or it is a triage
result and must say so in its opening line.

1. Metadata: date, tool versions, scope, scan configuration used
2. Executive summary: score out of 100, A-F grade, counts by severity, verdict
3. Findings: rule ID, WCAG criterion, severity, location, description, fix
4. Severity breakdown by critical, serious, moderate, minor
5. Remediation priorities, ordered by impact against effort
6. Next steps and a re-scan timeline
7. Delta against the previous report when one exists: fixed, new, persistent, regressed

The renderer emits all seven from findings JSON and embeds the merged JSON in a
fenced block at the end of the report, which is what makes the next delta cheap.

## Files here

- `schemas/findings.schema.json` - the one findings shape
- `references/sources.md` - every specification the skills cite, grouped by skill
- `scripts/measure-context.mjs` - context cost accounting and budget check

## Scan configuration

If the workspace root holds `.a11y-office-config.json`, `.a11y-pdf-config.json`,
`.a11y-epub-config.json` or `.a11y-web-config.json`, read it and honour it. Do
not fall back to defaults when a config file exists. Profiles for strict,
moderate and minimal live in `templates/`.
