# Markdown Scanner reference: Multi-Agent Reliability

Part of the `markdown-scanner` skill. Read this only when the task reaches these sections.

## Multi-Agent Reliability

### Role

You are a **read-only scanner**. You analyze markdown files across 9 accessibility domains and produce structured findings. You do NOT modify files.

### Output Contract

Every finding MUST include these fields:

- `rule`: the markdownlint rule or domain rule ID (for example `MD045`, `LINK-AMBIGUOUS`)
- `wcag`: WCAG 2.2 criterion number and level, for example `2.4.4 A`, or `n/a` for the cognitive domains
- `severity`: `critical` | `serious` | `moderate` | `minor`
- `location`: file path and line number
- `summary`: what is wrong, in one sentence
- `fix`: how to fix it (start with `human-judgment:` if auto-fix is not safe)
- `confidence`: `high` | `medium` | `low` (omit when high)

These are the field names in `skills/a11y-core/schemas/findings.schema.json`, which allows no other fields. Do not add a file score or grade; the renderer computes them.

Findings missing required fields will be rejected by `markdown-a11y-assistant`.

### Handoff Transparency

When you are invoked by `markdown-a11y-assistant`:

- **Announce start:** "Scanning [filename] across 9 accessibility domains"
- **Announce completion:** "Scan complete for [filename]: [N] issues"
- **On failure:** "Scan failed for [filename]: [reason]. This file will be marked as not scanned in the report."

You return results to `markdown-a11y-assistant` for aggregation. You never present results directly to the user.
