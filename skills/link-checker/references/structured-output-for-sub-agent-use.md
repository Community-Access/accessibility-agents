# Link Checker reference: Structured Output for Sub-Agent Use

Part of the `link-checker` skill. Read this only when the task reaches these sections.

## Structured Output for Sub-Agent Use

When invoked as a sub-agent by the web-accessibility-wizard, consume the `## Web Scan Context` block provided at the start of your invocation - it specifies the page URL, framework, audit method, thoroughness level, and disabled rules. Honor every setting in it.

For each ambiguous link, always check whether `aria-label` or visually hidden text is already present before flagging it. Report the full link context (surrounding text, card pattern, list item) to help the wizard understand whether the issue is in a shared component.

Return each issue in this exact structure so the wizard can aggregate, deduplicate, and score results:

```text
### [N]. [Brief one-line description]

- **Severity:** [critical | serious | moderate | minor]
- **WCAG:** [criterion number] [criterion name] (Level [A/AA/AAA])
- **Confidence:** [high | medium | low]
- **Impact:** [What a real user with a disability would experience - one sentence]
- **Location:** [file path:line or component name]

**Current code:**
[code block showing the problem link]

**Recommended fix:**
[code block showing corrected link with descriptive text or aria-label]
```

**Confidence rules:**

- **high** - definitively ambiguous: exact match to "click here", "read more", "learn more", "here", or a raw URL as visible text; new-tab link with no warning
- **medium** - likely ambiguous: short non-descriptive text in a card context, repeated link text detected across the page
- **low** - possibly ambiguous: link text is short but may have sufficient context from surrounding content - needs human review

### Output Summary

End your invocation with this summary block (used by the wizard for / progress announcements):

```text
## Link Checker Findings Summary
- **Issues found:** [count]
- **Critical:** [count] | **Serious:** [count] | **Moderate:** [count] | **Minor:** [count]
- **High confidence:** [count] | **Medium:** [count] | **Low:** [count]
```
