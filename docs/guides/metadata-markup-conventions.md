# Metadata and Markup Conventions (2026)

This guide defines recommended metadata and markdown structure conventions for skills and documentation in this repository.

Two rules come first, because the Agent Skills specification and this repository's validator enforce them:

- `metadata` is a map of string keys to string values. Lists must be written as one comma-separated string, not as YAML arrays.
- Every skill needs the `metadata` keys `tier`, `domain`, `output` and `effort`; `scripts/validate-skills.mjs` fails a skill without them. The other keys below are optional conventions that no tool reads yet.

## Why This Exists

These conventions improve:

- Tool-driven routing and filtering
- Release and audit reproducibility
- Contract validation across orchestrators and specialists
- Long-term consistency across Copilot, Claude Code, and Gemini surfaces

## Router Frontmatter Metadata

Use `metadata` for machine-readable properties that should remain stable across wording changes.

Example:

```yaml
---
name: accessibility-lead
description: Accessibility team lead and orchestrator
metadata:
  tier: router
  domain: web
  output: findings
  effort: medium
  owner: web-a11y
  maturity: stable
  release-phase: ga
  capability-tags: "wcag-2.2, aria, keyboard, forms"
  dispatch-contract: required
---
```

Recommended fields:

| Field | Type | Purpose |
|------|------|---------|
| `owner` | string | Team or maintainer group |
| `domain` | string | `web`, `document`, `github`, `developer`, `cross-cutting` |
| `maturity` | string | `stable`, `beta`, `experimental` |
| `release-phase` | string | `ga`, `preview`, `internal` |
| `capability-tags` | string (comma-separated) | Discovery and filtering tags |
| `dispatch-contract` | string | `required` for orchestrators that must follow specialist dispatch |

## Skill Frontmatter Metadata

Example:

```yaml
---
name: kb-web-severity-scoring
description: Compute web accessibility scores and grades
metadata:
  tier: reference
  domain: web
  output: guidance
  effort: low
  spec-version: "2026-05"
  model-compatibility: "copilot, claude, gemini"
  compliance-profiles: "wcag-2.2-aa, en-301-549"
---
```

Recommended fields:

| Field | Type | Purpose |
|------|------|---------|
| `spec-version` | string | Internal schema/contract version |
| `model-compatibility` | string (comma-separated) | Supported model hosts |
| `compliance-profiles` | string (comma-separated) | Regulatory or standards mapping |

## Instruction File Markup Conventions

Use predictable heading and checklist structure so scanners and maintainers can parse files consistently.

Required section headings for larger instruction files:

- `## Decision Matrix`
- `## Non-Negotiable Standards`
- `## Acceptance Criteria`

Markdown structure rules:

- One H1 per file
- Explicit language tags on all fenced code blocks
- Lists surrounded by blank lines
- Avoid ambiguous links in policy docs

## Release and Audit Metadata

When writing release notes, include an explicit metadata block to support reproducibility, for example:

```yaml
metadata:
  release: "7.0.3"
  generated-at: "2026-10-28T00:00:00Z"
```

Audit reports need no hand-written block: `render-report.mjs` writes a Metadata
section (date, scope, skills run, tooling versions, scan configuration, checks
counted) and embeds the merged findings. There is one scoring model, the one in
`skills/a11y-core/scripts/merge-findings.mjs`; it has no profiles or
calibration versions to record.

## Validation Integration

Conventions are designed to be compatible with existing validation tooling:

- `npm run verify:spec` checks that `metadata` is a string map, as the Agent Skills specification requires
- `npm run verify:skills` (`scripts/validate-skills.mjs`) checks `tier`, `domain`, `output` and `effort`, and the pointer-dispatch contract of every router
- `node scripts/build-dispatch-matrices.mjs --check` checks that every router's dispatch matrix matches the skills that exist
- All three run in CI through `.github/workflows/verify.yml`

## Adoption Strategy

1. Add metadata to orchestrators first (`dispatch-contract: required`).
2. Add metadata to high-traffic skills (scoring, scanning, compliance).
3. Expand metadata coverage incrementally during normal edits to avoid large refactor risk.
4. Keep metadata values stable and update only on semantic changes.
