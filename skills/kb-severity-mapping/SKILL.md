---

name: kb-severity-mapping
description: Reference data, not a reviewer. Canonical severity level definitions and cross-domain mapping for web, document, and markdown audits. Score impact ranges, WCAG conformance alignment, and cross-format normalization.
license: MIT
disable-model-invocation: true
user-invocable: false
metadata:
  tier: reference
  domain: cross-cutting
  output: none
  effort: low
  title: Severity Mapping
---

## Severity Mapping

Canonical severity definitions shared across web, document, and markdown audit domains.

> **What reports actually use.** The score and grade in every rendered report
> come from `skills/a11y-core/scripts/merge-findings.mjs`: severity weights
> critical 10, serious 5, moderate 2, minor 1; confidence factors high 1.0,
> medium 0.7, low 0.4; the penalty is scaled by the number of checks run; grades
> are A 90+, B 80+, C 70+, D 60+, F below 60. Where this file differs, the
> script decides. A score is not a conformance claim: only a finding-free
> review against every criterion at the target level supports "conforms".

Severity is what a person experiences; WCAG level is what conformance requires. The two are independent, so the conformance column below is typical, not a rule.

## Canonical Severity Levels

Each level, with its definition, WCAG conformance and score weight.

| Level | Definition | Typical WCAG Conformance | Score Weight |
|---|---|---|---|
| **Critical** | Blocks access entirely for one or more user groups. No workaround exists. | Fails Level A | 10 |
| **Serious** | Severely impairs access; a workaround may exist but is unreasonable. | Fails Level A or AA | 5 |
| **Moderate** | Causes friction or confusion; most users can still complete the task. | Fails Level A or AA | 2 |
| **Minor** | Polish issue; no meaningful barrier for most users. | Technique deviation | 1 |

## Cross-Domain Equivalents

Each canonical level, with its web (axe-core or playwright), document (office or PDF) and markdown.

| Canonical Level | Web (axe-core / Playwright) | Document (Office/PDF) | Markdown |
|---|---|---|---|
| Critical | `critical` (axe-core) | Missing document title; untagged PDF; missing heading structure | Broken anchor link leading to dead navigation |
| Serious | `serious` (axe-core) | Missing alt text on informational image; table has no headers | Ambiguous link text (e.g., "click here"); missing alt text on image |
| Moderate | `moderate` (axe-core) | Merged table cells; color-only data encoding | Skipped heading level; missing table caption |
| Minor | `minor` (axe-core) | Decorative image with non-empty alt; redundant bookmark | Emoji in heading; em-dash used as list separator |

## Score Weight Rules

The weights are the renderer's (`skills/a11y-core/scripts/merge-findings.mjs`;
formula in `kb-web-severity-scoring`). Each finding counts once. Findings merge
when the same rule fires at the same location, or when findings at the same
location describe the same defect under different rules; the same rule on
another element or page is a separate finding.

## Conversion Rules (Normalizing Cross-Domain Reports)

When generating a unified report that combines web, document, and markdown findings:

1. Map each finding to the canonical severity level using the table above.
2. Apply the weight of the canonical level, not the domain-specific tool's internal scoring.
3. A rendered report scores all merged findings together. A per-page or per-file score, where a report shows one, is the same formula over that page's findings.
4. Do not double-count a finding that appears in both an axe-core scan and a Playwright behavioral scan -- deduplicate by rule ID and element location.

## Confidence Modifier

Confidence scales a finding's weight in every domain. Each level, with its factor and signals:

| Confidence | Factor | Source signals |
|---|---|---|
| high | 1.0 | Two sources agree (for example axe-core and code review), or the check is structural and certain. A third confirming source keeps it high. |
| medium | 0.7 | Single source, likely issue |
| low | 0.4 | Single source, heuristic; needs human review |

A finding with no confidence counts as high.
