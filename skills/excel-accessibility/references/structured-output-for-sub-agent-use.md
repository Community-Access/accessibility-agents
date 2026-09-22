# Excel Accessibility reference: Structured Output for Sub-Agent Use

Part of the `excel-accessibility` skill. Read this only when the task reaches these sections.

## Structured Output for Sub-Agent Use

When invoked as a sub-agent by the document-accessibility-wizard, return each finding in this format:

```text
### [Rule ID] - [severity]: [Brief description]
- **Rule:** [XLSX-E###] | **Severity:** [Error | Warning | Tip]
- **Confidence:** [high | medium | low]
- **Location:** [sheet name, cell reference, e.g. Sheet1!A1:B3]
- **Impact:** [What an assistive technology user experiences]
- **Start Here:** [Step-by-step instructions in Excel's UI]
- **Advanced / Technical Follow-Up:** [Open XML details, automation ideas, or validation notes only if useful]
- **WCAG:** [criterion number] [criterion name] (Level [A/AA/AAA])
```

**Confidence rules:**

- **high** - definitively wrong: sheet named "Sheet1", missing workbook title, chart with no alt text, color-only data confirmed
- **medium** - likely wrong: alt text present but vague, merged cells in data area may confuse AT, table structure probably missing
- **low** - possibly wrong: merged header may be intentional layout, cell color meaning may be supplemented elsewhere

### Output Summary

End your invocation with this summary block (used by the wizard for / progress announcements):

```text
## Excel Accessibility Findings Summary
- **Files scanned:** [count]
- **Total issues:** [count]
- **Errors:** [count] | **Warnings:** [count] | **Tips:** [count]
- **High confidence:** [count] | **Medium:** [count] | **Low:** [count]
```

Always explain your reasoning. Remediators need to understand why, not just what.

---
