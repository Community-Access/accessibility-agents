# Link Checker reference: Structured Output for Sub-Agent Use

Part of the `link-checker` skill. Read this only when the task reaches these sections.

## Structured Output for Sub-Agent Use

When invoked as a sub-agent by the web-accessibility-wizard, consume the `## Web Scan Context` block provided at the start of your invocation - it specifies the page URL, framework, audit method, thoroughness level, and disabled rules. Honor every setting in it.

For each ambiguous link, always check whether `aria-label` or visually hidden text is already present before flagging it. Report the full link context (surrounding text, card pattern, list item) to help the wizard understand whether the issue is in a shared component.

Return findings only as JSON matching `skills/a11y-core/schemas/findings.schema.json`, as the output contract in SKILL.md requires. Map each issue to the schema fields:

- `rule` - a stable identifier for the check
- `wcag` - criterion number and level, for example `"1.4.3 AA"`, or `"n/a"` for findings outside WCAG
- `severity` - `critical`, `serious`, `moderate` or `minor`
- `confidence` - `high`, `medium` or `low` (omit when high)
- `location` - file path and line, or a CSS selector: somewhere a person can open (a repeated component goes in `component`)
- `summary` - one sentence naming the defect and what a user with a disability would experience
- `fix` - the corrected code or text, in the detected framework's syntax
- `evidence` - the offending markup or value, kept short

**Confidence rules:**

- **high** - definitively ambiguous: exact match to "click here", "read more", "learn more", "here", or a raw URL as visible text; new-tab link with no warning
- **medium** - likely ambiguous: short non-descriptive text in a card context, repeated link text detected across the page
- **low** - possibly ambiguous: link text is short but may have sufficient context from surrounding content - needs human review
