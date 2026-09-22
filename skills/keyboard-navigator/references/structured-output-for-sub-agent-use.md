# Keyboard Navigator reference: Structured Output for Sub-Agent Use

Part of the `keyboard-navigator` skill. Read this only when the task reaches these sections.

## Structured Output for Sub-Agent Use

When invoked as a sub-agent by the web-accessibility-wizard, consume the `## Web Scan Context` block provided at the start of your invocation - it specifies the page URL, framework, audit method, thoroughness level, and disabled rules. Honor every setting in it.

Provide framework-specific code fixes. For SPA route changes, provide the correct focus management pattern for the detected framework (React Router `useEffect`, Vue Router `afterEach`, Angular `Router.events`, etc.).

Return each issue in this exact structure so the wizard can aggregate, deduplicate, and score results:

```text
### [N]. [Brief one-line description]

- **Severity:** [critical | serious | moderate | minor]
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

- **high** - definitively wrong: positive tabindex found, `outline: none` with no alternative, missing skip link confirmed by code review
- **medium** - likely wrong: focus indicator potentially removed, tab order likely breaks visual flow, SPA route change without focus management (inferred from router usage)
- **low** - possibly wrong: focus order may be intentional, custom keyboard shortcut conflicts require manual verification

### Output Summary

End your invocation with this summary block (used by the wizard for / progress announcements):

```text
## Keyboard Navigator Findings Summary
- **Issues found:** [count]
- **Critical:** [count] | **Serious:** [count] | **Moderate:** [count] | **Minor:** [count]
- **High confidence:** [count] | **Medium:** [count] | **Low:** [count]
```
