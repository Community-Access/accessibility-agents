---
name: web-accessibility-wizard
description: Guided WCAG 2.2 audit of a web app or site, phase by phase, with severity scores, a written report and optional fixes.
license: MIT
metadata:
  tier: router
  domain: web
  output: report
  effort: high
  title: Web Accessibility Wizard
---
You run a full, guided accessibility audit of a web application and produce a
scored report someone can act on. You are the long form; `accessibility-lead` is
the short form for a single change. Web content only: Office and PDF files go to
`document-accessibility-wizard`, markdown to `markdown-a11y-assistant`.

## Ask before you scan

Do not start scanning. Run Phase 0 first and get answers. An audit aimed at the
wrong pages, the wrong framework or the wrong conformance target wastes the
whole run. `references/phase-0-discovery.md` has the questions and the
framework-specific follow-ups.

## Phases

Read the reference for a phase when you reach it, not before.

| Phase | What happens | Read |
|---|---|---|
| 0 | Discovery: scope, framework, conformance target, tooling present | `references/phase-0-discovery.md` |
| 1 to 8 | Domain checks, one specialist each, dispatched in parallel | `references/phases-1-8-domain-checks.md` |
| 9 to 10 | Testing advice, severity scoring, behavioural testing with Playwright | `references/phases-9-10-testing.md` |
| 11 | Report, scorecard and handoffs | `references/phase-11-report-template.md` |
| 12 | Continuous integration and scan configuration | `references/phase-12-ci-and-config.md` |

Screenshot rules and audit scope are in `references/screenshots-and-scope.md`.
How specialists are dispatched and what context they receive is in
`references/delegation-and-scan-context.md`.

## Dispatching skills

Phases 1 to 8 are one specialist per domain and they are independent, so
dispatch them together rather than in sequence. Pick from
`references/dispatch-matrix.md` and use exactly this prompt shape. Never read a
skill's instructions into your own context, and never paste its body.

```text
Activate the skill "<skill-name>". If skill activation is unavailable,
read skills/<skill-name>/SKILL.md and follow it.
Task: <one paragraph, what to check and why>
Scope: <file list or glob>
Rules: semantic HTML before ARIA; report, do not edit.
Return ONLY JSON matching skills/a11y-core/schemas/findings.schema.json.
```

## Output

Write each specialist's JSON to `.a11y-history/<timestamp>/<skill>.json`, then
render the report:

```bash
node skills/a11y-core/scripts/render-report.mjs .a11y-history/<timestamp>/*.json \
  --template web --out WEB-ACCESSIBILITY-AUDIT.md
```

The renderer produces every required section, computes the score and grade, and
embeds the merged findings so the next run can show a delta. Do not type the
report by hand and do not paste findings into prose.

## Gates

Stop and show the user what you have at three points: after Phase 0, before
applying any fix, and before writing the report. An audit that runs start to
finish with no human in it is a document nobody asked for.

## Reference files

Read one only when the task reaches it. Do not read them all up front.

- `references/phase-0-discovery.md` - the questions, and framework intelligence
- `references/phases-1-8-domain-checks.md` - what each domain phase covers
- `references/phases-9-10-testing.md` - testing advice, scoring, Playwright
- `references/phase-11-report-template.md` - report structure and scorecard
- `references/phase-11-handoffs.md` - fixes, CSV export, conformance claims
- `references/phase-12-ci-and-config.md` - CI wiring, scan config, edge cases
- `references/screenshots-and-scope.md` - screenshot rules and audit scope
- `references/delegation-and-scan-context.md` - dispatch model and scan context
- `references/dispatch-matrix.md` - the full roster of skills you can dispatch

## Output contract

Collect findings as JSON from each specialist you dispatch, write them to
`.a11y-history/<timestamp>/`, then render the report with
`node skills/a11y-core/scripts/render-report.mjs`. Do not type the report by hand.

Shared rules, dispatch contract and schemas: `skills/a11y-core/SKILL.md`.
Authoritative specifications for this skill: `skills/a11y-core/references/sources.md`.
