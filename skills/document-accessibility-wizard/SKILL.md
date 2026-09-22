---
name: document-accessibility-wizard
description: Guided accessibility audit of Word, Excel, PowerPoint, PDF and ePub files, one at a time or by the folder, with a scored report.
license: MIT
metadata:
  tier: router
  domain: documents
  output: report
  effort: high
  title: Document Accessibility Wizard
---
You audit documents rather than web pages: Word, Excel, PowerPoint, PDF and
ePub, a single file or a whole tree. You dispatch a format specialist per file,
merge what comes back, and produce a scored report. Web content goes to
`web-accessibility-wizard`; markdown goes to `markdown-a11y-assistant`.

## Ask before you scan

Get the scope and the mode first. What path, how deep, every file or only those
changed since the last run, and which conformance target. A recursive scan of a
large tree is expensive; confirm it rather than assume it.

Read any `.a11y-office-config.json`, `.a11y-pdf-config.json` or
`.a11y-epub-config.json` in the workspace root and honour it. Do not apply
defaults when a config file exists.

## Phases

Read the reference for a phase when you reach it, not before.

| Phase | What happens | Read |
|---|---|---|
| 0 | Scope, recursion, delta mode, config discovery | this file, plus the scan-config helpers |
| 1 to 3 | Inventory, then one format specialist per file, dispatched in parallel | `references/phases-1-3-scanning.md` |
| 4 | Cross-document patterns, scoring, report and exports | `references/phase-4-report-and-export.md` |

Remediation wording, so fixes read the same across formats:
`references/remediation-writing-standard.md`.

## Dispatching skills

One file is one dispatch. Files are independent, so dispatch them together
rather than walking the tree in sequence. Pick from
`references/dispatch-matrix.md` and use exactly this prompt shape. Never read a
skill's instructions into your own context, and never paste its body.

```text
Activate the skill "<skill-name>". If skill activation is unavailable,
read skills/<skill-name>/SKILL.md and follow it.
Task: <one paragraph, what to check and why>
Scope: <file path>
Rules: report, do not edit. Honour the scan config if one exists.
Return ONLY JSON matching skills/a11y-core/schemas/findings.schema.json.
```

Format to skill: `.docx` is `word-accessibility`, `.xlsx` is
`excel-accessibility`, `.pptx` is `powerpoint-accessibility`, `.pdf` is
`pdf-accessibility`, `.epub` is `epub-accessibility`. Remediation, when the user
asks for it, is `office-remediator` or `pdf-remediator`.

## Output

Write each specialist's JSON to `.a11y-history/<timestamp>/<file>.json`, then
render:

```bash
node skills/a11y-core/scripts/render-report.mjs .a11y-history/<timestamp>/*.json \
  --template document --out DOCUMENT-ACCESSIBILITY-AUDIT.md
```

The renderer scores, grades, groups by document, computes the delta against a
previous report and embeds the merged findings. Do not type the report by hand.

## Gates

Stop and show the user what you have after discovery, before any remediation,
and before writing the report. Remediation rewrites the user's documents; it
never happens without an explicit yes.

## Reference files

Read one only when the task reaches it. Do not read them all up front.

- `references/phases-1-3-scanning.md` - inventory, per-file scanning, delta mode
- `references/phase-4-report-and-export.md` - scoring, report, CSV and VPAT export
- `references/remediation-writing-standard.md` - how fixes are worded
- `references/output-and-behaviour.md` - output paths and behavioural rules
- `references/behavioural-rules.md` - what this skill will and will not do
- `references/multi-agent-reliability.md` - parallel dispatch and partial results
- `references/dispatch-matrix.md` - the full roster of skills you can dispatch

## Output contract

Collect findings as JSON from each specialist you dispatch, write them to
`.a11y-history/<timestamp>/`, then render the report with
`node skills/a11y-core/scripts/render-report.mjs`. Do not type the report by hand.

Shared rules, dispatch contract and schemas: `skills/a11y-core/SKILL.md`.
Authoritative specifications for this skill: `skills/a11y-core/references/sources.md`.
