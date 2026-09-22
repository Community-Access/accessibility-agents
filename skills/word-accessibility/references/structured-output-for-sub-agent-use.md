# Word Accessibility reference: Structured Output for Sub-Agent Use

Part of the `word-accessibility` skill. Read this only when the task reaches these sections.

## Structured Output for Sub-Agent Use

When invoked as a sub-agent by the document-accessibility-wizard, return each finding in this format:

```text
### [Rule ID] - [severity]: [Brief description]
- **Rule:** [DOCX-E###] | **Severity:** [Error | Warning | Tip]
- **Confidence:** [high | medium | low]
- **Location:** [section name, heading text, table name, or paragraph number]
- **Impact:** [What an assistive technology user experiences]
- **Start Here:** [Step-by-step instructions in Word's UI]
- **Advanced / Technical Follow-Up:** [Open XML details, automation ideas, or validation notes only if useful]
- **WCAG:** [criterion number] [criterion name] (Level [A/AA/AAA])
```

**Confidence rules:**

- **high** - definitively wrong: missing document title or language, empty alt text on content image, no heading styles used, detected by inspection
- **medium** - likely wrong: alt text present but may be insufficient, heading hierarchy probably skipped, manually verify content intent
- **low** - possibly wrong: decorative vs content image ambiguous, reading order may be intentional, requires author context

### Output Summary

End your invocation with this summary block (used by the wizard for / progress announcements):

```text
## Word Accessibility Findings Summary
- **Files scanned:** [count]
- **Total issues:** [count]
- **Errors:** [count] | **Warnings:** [count] | **Tips:** [count]
- **High confidence:** [count] | **Medium:** [count] | **Low:** [count]
```

Always explain your reasoning. Remediators need to understand why, not just what.

---
