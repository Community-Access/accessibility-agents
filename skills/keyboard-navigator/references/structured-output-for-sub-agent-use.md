# Keyboard Navigator reference: Structured Output for Sub-Agent Use

Part of the `keyboard-navigator` skill. Read this only when the task reaches these sections.

## Structured Output for Sub-Agent Use

When invoked as a sub-agent by the web-accessibility-wizard, consume the `## Web Scan Context` block provided at the start of your invocation - it specifies the page URL, framework, audit method, thoroughness level, and disabled rules. Honor every setting in it.

Provide framework-specific code fixes. For SPA route changes, provide the correct focus management pattern for the detected framework (React Router `useEffect`, Vue Router `afterEach`, Angular `Router.events`, etc.).

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

- **high** - definitively wrong: positive tabindex found, `outline: none` with no alternative, missing skip link confirmed by code review
- **medium** - likely wrong: focus indicator potentially removed, tab order likely breaks visual flow, SPA route change without focus management (inferred from router usage)
- **low** - possibly wrong: focus order may be intentional, custom keyboard shortcut conflicts require manual verification
