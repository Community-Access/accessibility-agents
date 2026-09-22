# PowerPoint Accessibility reference: Structured Output for Sub-Agent Use

Part of the `powerpoint-accessibility` skill. Read this only when the task reaches these sections.

## Structured Output for Sub-Agent Use

When invoked as a sub-agent by the document-accessibility-wizard, return each finding in this format:

```text
### [Rule ID] - [severity]: [Brief description]
- **Rule:** [PPTX-E###] | **Severity:** [Error | Warning | Tip]
- **Confidence:** [high | medium | low]
- **Location:** [Slide number and element name, e.g. Slide 3 - Content Placeholder 1]
- **Impact:** [What an assistive technology user experiences]
- **Start Here:** [Step-by-step instructions in PowerPoint's UI]
- **Advanced / Technical Follow-Up:** [Open XML details, automation ideas, or validation notes only if useful]
- **WCAG:** [criterion number] [criterion name] (Level [A/AA/AAA])
```

**Confidence rules:**

- **high** - definitively wrong: missing slide title, empty title placeholder, no alt text on non-decorative image, auto-advancing slide detected
- **medium** - likely wrong: reading order probably wrong, alt text present but vague, captions likely missing on embedded video
- **low** - possibly wrong: decorative vs content image ambiguous, animation purpose may be intentional, requires author confirmation

### Output Summary

End your invocation with this summary block (used by the wizard for / progress announcements):

```text
## PowerPoint Accessibility Findings Summary
- **Files scanned:** [count]
- **Total issues:** [count]
- **Errors:** [count] | **Warnings:** [count] | **Tips:** [count]
- **High confidence:** [count] | **Medium:** [count] | **Low:** [count]
```

Always explain your reasoning. Remediators need to understand why, not just what.

---
