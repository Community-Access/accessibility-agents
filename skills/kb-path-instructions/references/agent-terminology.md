# Agent Terminology

Applies to files matching `**/*.{md,agent.md}`.

Part of the `kb-path-instructions` skill.

This file defines shared terms used across all agent files, skill files, and instruction files in this workspace. All agents MUST use these exact terms consistently. When writing new files, prefer the **Preferred Term** column.

---

## Severity Levels

Each preferred term, with do NOT use and definition.

| Preferred Term | Do NOT Use | Definition |
|---------------|------------|------------|
| `critical` | blocker, P0, highest, urgent | Blocks access entirely - a screen reader or keyboard user cannot complete a task |
| `serious` | major, severe, high, P1 | Degrades the experience significantly - the feature works but is confusing or significantly harder |
| `moderate` | medium, average, P2 | Partially impedes experience - works but misses best practice |
| `minor` | low, informational, P3, enhancement | Small improvement opportunity - works correctly but could be better |

**Usage:** All findings, reports, CSV exports, and structured handoffs between agents must use `critical`, `serious`, `moderate`, `minor`. The terms "major" and "blocker" are deprecated.

---

## Agent Role Labels

Each preferred term, with do NOT use and definition.

| Preferred Term | Do NOT Use | Definition |
|---------------|------------|------------|
| router | coordinator, hub, manager, orchestrator | One of the six model-invocable entry skills; delegates to specialists and merges results (the tiers are defined in `skills/a11y-core/SKILL.md`) |
| specialist | worker, sub-agent | A skill that performs focused domain work (ARIA, contrast, forms, etc.) |
| helper | internal helper, utility agent | A skill for mechanical work (inventory, scanning one file, CSV export), dispatched by a router, not by users directly |
| handoff | delegation, routing | Passing a task and context from one agent to another |

---

## Confidence Levels (Web Severity Scoring)

Each preferred term, with its definition.

| Preferred Term | Definition |
|---------------|------------|
| `confirmed` | Validated by all three sources: axe-core + agent review + Playwright behavioral testing. A report label only; findings JSON allows `high`, `medium`, `low`, so record it as `high` |
| `high` | Found by axe-core + agent review, or definitively structural (missing alt, no labels) |
| `medium` | Found by one source; likely issue but needs review |
| `low` | Possible issue; needs human review |

---

## Emoji Handling Modes (Markdown Accessibility)

Each mode, with its behavior.

| Mode | Behavior |
|------|----------|
| `remove-all` | Remove all emoji from all contexts |
| `remove-decorative` | Remove in headings/bullets; flag inline for review |
| `translate` | Replace with `(English)` equivalent from the translation map |
| `leave-unchanged` | Do not modify emoji |

**This repository's active mode:** `remove-all` (set by the `AGENTS.md` house style: no emoji)

---

## Document Types

Each preferred term, with file extension and do NOT use.

| Preferred Term | File Extension | Do NOT Use |
|---------------|----------------|------------|
| Word document | `.docx` | Word file, Office doc |
| Excel workbook | `.xlsx` | spreadsheet, Excel file |
| PowerPoint presentation | `.pptx` | slides, presentation file |
| PDF document | `.pdf` | PDF file |
| ePub document | `.epub` | eBook |

---

## Scanning Phases

When describing multi-phase audit workflows, use these phase names consistently:

| Phase | Name | Description |
|-------|------|-------------|
| Phase 0 | Configuration | Load scan config, set preferences, detect scope |
| Phase 1 | Discovery | Inventory files, pages, or components to scan |
| Phase 2 | Scanning | Run automated checks (axe-core, agent analysis, Playwright) |
| Phase 3 | Analysis | Classify findings, compute scores, detect patterns |
| Phase 4 | Reporting | Generate structured output (markdown, CSV, HTML) |
| Phase 5 | Remediation | Apply fixes and verify |

---

## WCAG Conformance Levels

Each term, with its definition.

| Term | Definition |
|------|-----------|
| WCAG AA | Level AA conformance - the minimum target for all work in this repo |
| WCAG AAA | Level AAA - audited separately, never required as baseline |
| WCAG 2.2 | Current version (W3C Recommendation 5 October 2023, updated 12 December 2024; it does not supersede WCAG 2.1) |

---

## Source References

This glossary is derived from:

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [axe-core severity taxonomy](https://github.com/dequelabs/axe-core)
- [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/)
- Internal multi-agent-reliability standards (see `multi-agent-reliability.md` in this folder)
