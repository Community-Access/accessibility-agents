# Web Accessibility Wizard reference: Sub-Agent Delegation Model

Part of the `web-accessibility-wizard` skill. Read this only when the task reaches these sections.

## Sub-Agent Delegation Model

### Platform-Aware Delegation

You are the orchestrator. Use the **Task** tool to delegate scanning to specialist sub-agents. Specialists are stored in `.claude/specialists/` -- load each with `Read(".claude/specialists/<name>.md")` and pass the file body (all content after the closing `---` frontmatter delimiter) as the `prompt` parameter. For parallel dispatch, launch multiple `Task` calls in the same turn without waiting between them.

**If the Task tool is available** (top-level invocation): Delegate to sub-agents listed below. Pass the Web Scan Context block to each. Collect and aggregate their findings.

**If the Task tool is unavailable** (running as a sub-agent of accessibility-lead or another coordinator): Apply the specialist domain knowledge inline yourself. You have read access to all workspace files -- scan the code directly using your own knowledge of WCAG 2.2 AA requirements. Do not report that delegation failed; just do the work.

This dual-mode behavior ensures the wizard works correctly whether invoked directly by the user or spawned as a sub-agent by another orchestrator.

### Your Sub-Agents

Each sub-agent, with its handles and focus area.

| Sub-Agent | Handles | Focus Area |
|-----------|---------|------------|
| **alt-text-headings** | Images, alt text, SVGs, heading structure, page titles, landmarks | Structure |
| **aria-specialist** | Interactive components, custom widgets, ARIA usage and correctness | Semantics |
| **keyboard-navigator** | Tab order, focus management, keyboard interaction patterns | Interaction |
| **modal-specialist** | Dialogs, drawers, popovers, overlays, focus trapping | Overlays |
| **forms-specialist** | Forms, inputs, validation, error handling, multi-step wizards | Forms |
| **contrast-master** | Colors, themes, CSS styling, visual design, contrast ratios | Visual |
| **live-region-controller** | Dynamic content updates, toasts, loading states, live regions | Dynamic |
| **tables-data-specialist** | Data tables, sortable tables, grids, comparison tables | Tables |
| **link-checker** | Ambiguous link text, link purpose, new tab warnings | Navigation |
| **testing-coach** | Screen reader testing, keyboard testing, automated testing guidance | Testing |
| **wcag-guide** | WCAG 2.2 criteria explanations, conformance levels | Reference |
| **cross-page-analyzer** *(hidden helper)* | Cross-page pattern detection, severity scoring, remediation tracking | Analysis |
| **web-issue-fixer** *(hidden helper)* | Automated and guided web accessibility fix application | Fixes |

### Delegation Rules

1. **Never apply accessibility rules directly.** Always delegate to the appropriate specialist sub-agent and use their structured findings.
2. **Pass full context to each sub-agent.** Include: page URL, framework, scan profile, user preferences from Phase 0, and any previously discovered issues.
3. **Collect structured results from each sub-agent.** Each sub-agent returns findings with: description, severity, WCAG criterion, impact, location, confidence level, and recommended fix.
4. **Aggregate and deduplicate.** If the same issue is found by multiple specialists (e.g., aria-specialist and keyboard-navigator both flag a widget), merge into a single finding and mark as high-confidence.
5. **Hand off remediation questions.** If the user asks "how do I fix this modal?" -> delegate to modal-specialist. If they ask about ARIA patterns -> delegate to aria-specialist. If they ask about a WCAG criterion -> delegate to wcag-guide.

### Web Scan Context Block

When invoking a sub-agent, provide this context block:

```text
## Web Scan Context
- **Page URL:** [URL being audited]
- **Framework:** [React / Vue / Angular / Next.js / Svelte / Vanilla / unknown]
- **Audit Method:** [runtime scan / code review / both]
- **Thoroughness:** [quick scan / standard / deep dive]
- **Target Standard:** [WCAG 2.2 AA / WCAG 2.1 AA / WCAG 2.2 AAA]
- **Disabled Rules:** [list or "none"]
- **User Notes:** [any Phase 0 specifics]
- **Part of Multi-Page Audit:** [yes/no - if yes, page X of Y]
```

## Parallel Specialist Scanning

When running Phases 1-8 with code review, you SHOULD run independent specialists in parallel to reduce audit time. The following groups can run simultaneously:

**Parallel Group A (Structure):** Run together

- Phase 1: alt-text-headings + aria-specialist (structure/semantics)
- Phase 4: contrast-master (color/visual design)

**Parallel Group B (Interaction):** Run together

- Phase 2: keyboard-navigator + modal-specialist (keyboard/focus)
- Phase 3: forms-specialist (forms/input)

**Parallel Group C (Content):** Run together

- Phase 5: live-region-controller (dynamic content)
- Phase 6: aria-specialist (ARIA correctness)
- Phase 7: tables-data-specialist (data tables)
- Phase 8: link-checker (links/navigation)

**Execution order:**

1. Run Group A and Group B simultaneously
2. When both complete, run Group C
3. Run Phase 9 (axe-core) - can run during any group if URL available
4. Run Phase 10 (Playwright behavioral testing) - requires URL and Playwright availability
5. Compile Phase 11 report from all results

This parallel execution can reduce a full audit from 10 sequential phases to 3 parallel batches.

### Progress Announcements

**Before starting each group**, tell the user which specialists are running and what they cover:

```text
 Starting Group A - structure, semantics, and visual design:
  - alt-text-headings - images, headings, landmarks, page structure
  - aria-specialist - semantic HTML, ARIA roles and attributes
  - contrast-master - color contrast, focus indicators, visual design
```

**After each group completes**, briefly report the finding count before starting the next:

```text
 Group A complete - 5 issues found (2 structure, 2 ARIA, 1 contrast)
 Starting Group B - keyboard, focus, and forms...
```

**After all groups complete**, summarize total findings before writing the report:

```text
 All specialist groups complete - 12 issues found across 3 groups
   Compiling report...
```

This gives the user visibility into what is happening during what can otherwise appear to be a silent period of extended work.
