# PDF Accessibility reference: Structured Output for Sub-Agent Use

Part of the `pdf-accessibility` skill. Read this only when the task reaches these sections.

## Structured Output for Sub-Agent Use

A router always gets the findings JSON described in `SKILL.md`. Use this prose format only when a person asks to read findings as text:

```text
### [Rule ID] - [severity]: [Brief description]
- **Rule:** [PDFUA.###] or [PDFBP.###] or [PDFQ.###] | **Severity:** [Error | Warning | Tip]
- **Confidence:** [high | medium | low]
- **Location:** [page number and element, e.g. Page 3 - Figure 1, or Document Properties]
- **Impact:** [What an assistive technology user experiences]
- **Start Here:** [How to address first in Adobe Acrobat Pro or the source application's native UI]
- **Advanced / Technical Follow-Up:** [PDF/UA, tag tree, source rebuild, veraPDF, or automation notes only if useful]
- **WCAG:** [criterion number] [criterion name] (Level [A/AA/AAA])
```

**Confidence rules:**

- **high** - definitively wrong: PDF untagged, document language missing, content images have no alt text, form fields have no labels
- **medium** - likely wrong: reading order probably incorrect, alt text present but likely auto-generated, tag structure probably non-compliant
- **low** - possibly wrong: reading order may be intentional, alt text quality subjective, artifact vs content classification requires review

### Output Summary

End that prose rendering with this summary block:

```text
## PDF Accessibility Findings Summary
- **Files scanned:** [count]
- **Total issues:** [count]
- **Errors:** [count] | **Warnings:** [count] | **Tips:** [count]
- **High confidence:** [count] | **Medium:** [count] | **Low:** [count]
```

Always explain your reasoning. Remediators need to understand why, not just what.

---

## Multi-Agent Reliability

### Role

You are a **read-only scanner**. You analyze PDF documents and produce structured findings. You do NOT modify documents.

### Output Contract

Every finding MUST include these fields:

- `rule`: PDFUA, PDFBP or PDFQ-prefixed rule ID
- `wcag`: WCAG 2.2 criterion number and level, for example `1.3.1 A`, or `n/a`
- `severity`: `critical` | `serious` | `moderate` | `minor`
- `location`: file path, page number, element description
- `summary`: what is wrong, in one sentence
- `fix`: how to fix it
- `confidence`: `high` | `medium` | `low` (omit when high)

These are the field names in `skills/a11y-core/schemas/findings.schema.json`.

Findings missing required fields will be rejected by the orchestrator.

### Handoff Transparency

When you are invoked by `document-accessibility-wizard`:

- **Announce start:** "Scanning [filename] for PDF accessibility issues ([N] rules active)"
- **Announce completion:** "PDF scan complete: [N] issues found ([critical]/[serious]/[moderate]/[minor])"
- **On failure:** "PDF scan failed for [filename]: [reason]. Returning partial results for [N] files that succeeded."

When handing off to another agent:

- State what you found and what the next agent will do with it
- Example: "Found [N] issues in [filename]. Handing off to cross-document-analyzer for pattern detection across all scanned documents."
