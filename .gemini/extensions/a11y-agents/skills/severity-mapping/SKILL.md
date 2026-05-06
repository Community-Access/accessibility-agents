---
name: severity-mapping
description: Canonical severity level definitions and cross-domain mapping for web, document, and markdown accessibility audits. Includes score impact ranges, WCAG conformance alignment, and conversion rules for normalizing findings across audit types.
---
<!-- CANONICAL SOURCE: .github/skills/severity-mapping/SKILL.md -- Edit the canonical source; sync to Gemini via scripts/check-gemini-sync.ps1 -->

# Severity Mapping

Canonical severity definitions shared across web, document, and markdown audit domains.

## Canonical Severity Levels

| Level | Definition | WCAG Conformance | Score Impact |
|---|---|---|---|
| **Critical** | Blocks access entirely for one or more user groups. No workaround exists. | Fails Level A | -15 to -22 points |
| **Serious** | Severely impairs access; a workaround may exist but is unreasonable. | Fails Level A or AA | -5 to -10 points |
| **Moderate** | Causes friction or confusion; most users can still complete the task. | Fails Level AA (advisory) | -2 to -4 points |
| **Minor** | Polish issue; no meaningful barrier for most users. | Technique deviation | -1 point |

## Cross-Domain Equivalents

| Canonical Level | Web (axe-core / Playwright) | Document (Office/PDF) | Markdown |
|---|---|---|---|
| Critical | `critical` (axe-core) | Missing document title; untagged PDF; missing heading structure | Broken anchor link leading to dead navigation |
| Serious | `serious` (axe-core) | Missing alt text on informational image; table has no headers | Ambiguous link text (e.g., "click here"); missing alt text on image |
| Moderate | `moderate` (axe-core) | Merged table cells; color-only data encoding | Skipped heading level; missing table caption |
| Minor | `minor` (axe-core) | Decorative image with non-empty alt; redundant bookmark | Emoji in heading; em-dash used as list separator |

## Score Impact Rules

Score impacts listed above are **additive per finding**. When the same issue recurs across many elements:

- **First occurrence** — full deduction
- **Same issue type, same page/file** — no additional deduction (already counted once per issue rule)
- **Same issue type, different page/file** — full deduction applies again to the new page/file score

## Conversion Rules (Normalizing Cross-Domain Reports)

When generating a unified report that combines web, document, and markdown findings:

1. Map each finding to the canonical severity level using the table above.
2. Apply the score impact from the canonical level, not from the domain-specific tool's internal scoring.
3. For aggregated scores (portfolio or project level), compute each page/file score independently, then average.
4. Do not double-count a finding that appears in both an axe-core scan and a Playwright behavioral scan -- deduplicate by rule ID and element location.

## Confidence Modifier (Web Domain)

For web audits, confidence level modifies the base deduction:

| Confidence | Multiplier | Source Signals |
|---|---|---|
| Confirmed | 1.2x | axe-core + agent code review + Playwright behavioral test |
| High (two sources) | 1.0x | Any two of the three sources above |
| High (one source) | 1.0x (reduced base) | Single automated tool, high rule reliability |
| Medium | 0.7x | Single source, medium rule reliability |
| Low | 0.3x | Single source, low rule reliability or heuristic |

Document and markdown audits do not use confidence multipliers -- they use the base score impact only.
