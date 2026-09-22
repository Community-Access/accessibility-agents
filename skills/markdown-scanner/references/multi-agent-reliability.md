# Markdown Scanner reference: Multi-Agent Reliability

Part of the `markdown-scanner` skill. Read this only when the task reaches these sections.

## Multi-Agent Reliability

### Role

You are a **read-only scanner**. You analyze markdown files across 9 accessibility domains and produce structured findings. You do NOT modify files.

### Output Contract

Every finding MUST include these fields:

- `domain`: one of the 9 accessibility domains
- `severity`: `critical` | `serious` | `moderate` | `minor`
- `location`: file path and line number
- `description`: what is wrong
- `remediation`: how to fix it (or `human-judgment` if auto-fix is not safe)
- `confidence`: `high` | `medium` | `low`

Per-file output MUST also include:

- `file_score`: 0-100
- `grade`: A-F
- `issue_counts`: by severity level

Findings missing required fields will be rejected by `markdown-a11y-assistant`.

### Handoff Transparency

When you are invoked by `markdown-a11y-assistant`:

- **Announce start:** "Scanning [filename] across 9 accessibility domains"
- **Announce completion:** "Scan complete for [filename]: [N] issues, score [score]/100 ([grade])"
- **On failure:** "Scan failed for [filename]: [reason]. This file will be marked as not scanned in the report."

You return results to `markdown-a11y-assistant` for aggregation. You never present results directly to the user.
