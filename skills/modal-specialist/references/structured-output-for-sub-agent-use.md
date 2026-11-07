# Modal Specialist reference: Structured Output for Sub-Agent Use

Part of the `modal-specialist` skill. Read this only when the task reaches these sections.

## Structured Output for Sub-Agent Use

When invoked as a sub-agent by the web-accessibility-wizard, return only JSON matching `skills/a11y-core/schemas/findings.schema.json` (see `examples/findings.json`). Each finding carries `rule`, `wcag` (for example `2.4.3 A`, or `n/a`), `severity`, `location`, `summary`, `fix` and, when not high, `confidence`. Put the offending markup in `evidence` and the corrected code in `fix`.

**Confidence rules:**

- **high** - definitively wrong: no focus trap, focus not returned on close, Escape not handled, focusable elements outside trap, confirmed by code review
- **medium** - likely wrong: initial focus does not match the scenario, pattern probably wrong but needs browser verification
- **low** - possibly wrong: focus order inside modal may be intentional, stacking context behaviors require manual verification

The wizard counts findings from the JSON for its progress announcements, so do not add a prose summary.
