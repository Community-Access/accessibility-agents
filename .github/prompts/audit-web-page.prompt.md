---
name: audit-web-page
description: Full single-page web accessibility audit with axe-core runtime scan, code review, severity scoring, and remediation steps. Produces a saved WEB-ACCESSIBILITY-AUDIT.md report.
mode: agent
agent: web-accessibility-wizard
tools:
  - askQuestions
  - runInTerminal
  - getTerminalOutput
  - readFile
  - editFiles
  - createFile
  - listDirectory
---

# Full Web Page Accessibility Audit

Run a comprehensive WCAG 2.2 AA accessibility audit on a single web page, combining a live axe-core runtime scan with code review and remediation guidance. Produces a saved scored report.

## Page to audit

**URL:** `${input:pageUrl}`

## Settings

- **Audit method:** axe-core runtime scan + code review
- **Thoroughness:** Full audit
- **Target standard:** WCAG 2.2 AA
- **Report path:** `WEB-ACCESSIBILITY-AUDIT.md`
- **Organization:** By severity (critical first)
- **Remediation steps:** Yes (detailed)
- **Include:** Severity scoring, WCAG criterion mapping, confidence levels

## Instructions

Use the **web-accessibility-wizard** agent for the full audit workflow:

### Phase 0: Discovery

1. Check workspace for existing `.a11y-web-config.json` and apply its settings.
2. Check for existing `WEB-ACCESSIBILITY-AUDIT.md` to offer delta/comparison mode.
3. Detect the frontend framework (React, Vue, Angular, Svelte, etc.) from `package.json`.

### Phase 1: Runtime Scan

Run axe-core against the live URL:

```bash
npx @axe-core/cli ${input:pageUrl} --tags wcag2a,wcag2aa,wcag21a,wcag21aa,wcag22aa --reporter json > /tmp/axe-results.json
```

Parse violations, incomplete items, and passes from the JSON output.

### Phase 2: Code Review

If source files are available in the workspace:

1. Delegate to **accessibility-lead** to coordinate specialist code review:
   - **aria-specialist** - ARIA roles, states, widget patterns
   - **keyboard-navigator** - Tab order, focus management, skip links
   - **forms-specialist** - Labels, error states, autocomplete (for pages with forms)
   - **contrast-master** - Color tokens and CSS contrast values
   - **alt-text-headings** - Images, heading hierarchy, landmarks
   - **link-checker** - Ambiguous link text detection

### Phase 3: Scoring and Report

1. Compute the severity score (0-100) using the web severity scoring formula.
2. Assign a letter grade (A-F).
3. Generate `WEB-ACCESSIBILITY-AUDIT.md` with the standard report structure:

```markdown
# Web Accessibility Audit

**Page:** [URL]
**Date:** [ISO date]
**WCAG Level:** 2.2 AA
**Score:** [0-100] ([A-F])
**Verdict:** [PASS / NEEDS WORK / FAIL]

## Executive Summary
[overall assessment]

## Severity Breakdown
| Severity | Count |
|----------|-------|
| Critical | [n] |
| Serious  | [n] |
| Moderate | [n] |
| Minor    | [n] |

## Findings
[Each finding with: rule ID, WCAG criterion, severity, element, description, remediation]

## Remediation Priorities
[Ordered list by impact/effort]

## Next Steps
[Recommended follow-up actions and re-scan timeline]
```

4. If a previous report exists, add a **Delta Tracking** section (Fixed / New / Persistent / Regressed).

### Phase 4: Follow-Up

Ask the user:

- "Want to fix the critical and serious issues now?" → hand off to `fix-web-issues`
- "Want to compare against a previous audit?" → hand off to `compare-web-audits`
- "Want to export findings to CSV?" → hand off to `export-web-csv`

## Handoff Transparency

Announce progress at each phase:

- **Phase 0:** "Checking workspace config and previous reports..."
- **Phase 1:** "Running axe-core scan on [URL]..."
- **Phase 2:** "Running code review with [N] specialists..."
- **Phase 3:** "Computing score and generating report..."
- **Completion:** "Audit complete: [score]/100 ([grade]) - [N] issues found. Report saved to WEB-ACCESSIBILITY-AUDIT.md"
- **On failure:** "Audit step failed: [reason]. [partial results if available]"
