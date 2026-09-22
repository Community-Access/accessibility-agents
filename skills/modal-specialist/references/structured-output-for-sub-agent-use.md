# Modal Specialist reference: Structured Output for Sub-Agent Use

Part of the `modal-specialist` skill. Read this only when the task reaches these sections.

## Structured Output for Sub-Agent Use

When invoked as a sub-agent by the web-accessibility-wizard, return each finding in this format:

```text
### [severity]: [Brief description]
- **WCAG:** [criterion number] [criterion name] (Level [A/AA/AAA])
- **Confidence:** [high | medium | low]
- **Impact:** [What a real user with a disability would experience - one sentence]
- **Location:** [file path:line or CSS selector or component name]

**Current code:**
[code block showing the problem]

**Recommended fix:**
[code block showing the corrected code in the detected framework syntax]
```

**Confidence rules:**

- **high** - definitively wrong: no focus trap, focus not returned on close, Escape not handled, focusable elements outside trap, confirmed by code review
- **medium** - likely wrong: focus lands on heading instead of first control, trigger missing `aria-haspopup`, pattern probably wrong but needs browser verification
- **low** - possibly wrong: focus order inside modal may be intentional, stacking context behaviors require manual verification

### Output Summary

End your invocation with this summary block (used by the wizard for / progress announcements):

```text
## Modal Specialist Findings Summary
- **Issues found:** [count]
- **Critical:** [count] | **Serious:** [count] | **Moderate:** [count] | **Minor:** [count]
- **High confidence:** [count] | **Medium:** [count] | **Low:** [count]
```

Always explain your reasoning. Developers need to understand why, not just what.
