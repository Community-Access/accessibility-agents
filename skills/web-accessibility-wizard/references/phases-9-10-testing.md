# Web Accessibility Wizard reference: Phase 9: Testing Recommendations

Part of the `web-accessibility-wizard` skill. Read this only when the task reaches these sections.

## Phase 9: Testing Recommendations

**Specialist agents:** testing-coach

### MANDATORY: Runtime axe-core Scan

**If a URL was provided in Phase 0 (dev server or production), you MUST run an axe-core scan. DO NOT skip this. DO NOT replace it with code review. You MUST execute Bash commands to run axe-core against the live URL.**

A code review alone is NOT sufficient. axe-core tests the actual rendered DOM in a real browser and catches issues that static code analysis misses.

**Steps - you MUST follow all of them:**

1. Use the URL from Phase 0 - do NOT ask for it again
2. Run this Bash command NOW:

   ```bash
   npx @axe-core/cli <URL> --tags wcag2a,wcag2aa,wcag21a,wcag21aa --save ACCESSIBILITY-SCAN.json
   ```

   If `@axe-core/cli` is not available, try: `npx axe-cli <URL> --save ACCESSIBILITY-SCAN.json`
3. Convert the JSON results to a markdown report and write it to `ACCESSIBILITY-SCAN.md`
4. Cross-reference scan results with findings from previous phases
5. Mark issues found by both the agent review and the scan as high-confidence findings
6. Note any new issues the scan found that the agent review missed

**If you complete Phase 9 without having run an axe-core Bash command and a URL was available, you have failed this phase. Go back and run it.**

### CI Scanner Correlation

If Step 0 detected any CI scanners, merge their findings with the local scan results:

1. **GitHub Accessibility Scanner:** Use scanner-bridge results fetched in Step 0. For each finding:
   - If the same axe-core rule ID was found on the same URL by both the local scan and the scanner, mark as **high confidence** (both sources agree).
   - If the scanner found an issue not in the local scan, include it as **scanner-only** with medium confidence.
   - If the local scan found an issue not in the scanner, include it as **local-only** with medium confidence.
   - For scanner issues with Copilot fix PRs, note the PR status (pending, open, merged, rejected).

2. **Lighthouse CI:** Use lighthouse-bridge results fetched in Step 0. For each finding:
   - Cross-reference Lighthouse accessibility audit violations with local axe-core results by rule ID.
   - Include the Lighthouse accessibility score as a benchmark metric in the report.
   - Note any Lighthouse-only findings not caught by axe-core (Lighthouse uses a subset of axe-core rules plus its own checks).

3. **Triple-source findings:** Issues found by all three sources (agent review, local axe-core, CI scanner) are marked as **highest confidence** and should be prioritized as top remediation targets.

If no URL was provided at all, skip the scan and note in the report: "No runtime scan was performed because no URL was provided."

**MANDATORY: Screenshots for axe violations.** If the user opted for screenshots and a URL is available, you MUST run Bash commands to capture a screenshot of each page that has axe violations. DO NOT skip this.

### Testing Setup

Use AskUserQuestion:

1. **"What testing framework do you use?"** - Options: Playwright, Cypress, Jest/Vitest, None yet
2. **"Do you have CI/CD set up?"** - Options: GitHub Actions, GitLab CI, Other, None
3. **"Have you tested with a screen reader before?"** - Options: Yes, No

Based on all findings, provide:

1. **Automated testing setup** - axe-core integration with their test framework
2. **Manual testing checklist** - customized to their specific components
3. **Screen reader testing guide** - which screen readers to test, key commands for their components
4. **CI pipeline recommendation** - how to catch regressions

## Severity Scoring

Assign each audited page/component a weighted **accessibility risk score** (0-100) based on its findings.

### Scoring Formula

```text
Page Score = 100 - (sum of weighted findings)

Weights:
  Critical issue (axe-core + agent confirmed):  -15 points each
  Critical issue (single source):               -10 points each
  Serious issue:                                  -7 points each
  Moderate issue:                                 -3 points each
  Minor issue:                                    -1 point each

Floor: 0 (scores cannot go below 0)
```

### Score Grades

Each score, with its grade and meaning.

| Score | Grade | Meaning |
|-------|-------|---------|
| 90-100 | A | Excellent - minor or no issues, meets WCAG AA |
| 75-89 | B | Good - some issues, mostly meets WCAG AA |
| 50-74 | C | Needs Work - multiple issues, partial WCAG AA compliance |
| 25-49 | D | Poor - significant accessibility barriers |
| 0-24 | F | Failing - critical barriers, likely unusable with AT |

### Confidence Levels

Every finding must include a confidence rating:

| Level | Meaning | When to Use |
|-------|---------|-------------|
| **high** | Confirmed by both axe-core and agent review, or definitively structural | Missing alt text, no form labels, missing lang attribute, contrast failures measured by tooling |
| **medium** | Found by one source, likely an issue but needs verification | Heading hierarchy edge cases, questionable ARIA usage, possible keyboard traps |
| **low** | Possible issue, flagged for human review | Alt text quality, reading order assumptions, context-dependent link text |

When computing severity scores, weight by confidence:

- High confidence: full weight
- Medium confidence: 70% weight
- Low confidence: 30% weight

## Remediation Tracking

When a previous `ACCESSIBILITY-AUDIT.md` exists in the project, automatically offer comparison mode.

### Comparison Analysis

1. **Parse the Previous Report:** Read the baseline `ACCESSIBILITY-AUDIT.md` and extract findings by page/component and issue description.
2. **Classify Changes:**
   - **Fixed** - issue was in the previous report but is no longer present
   - **New** - issue was not in the previous report but appears now
   - **Persistent** - issue was in the previous report and is still present
   - **Regressed** - issue was previously fixed (not in last report) but has returned
3. **Progress Metrics:**
   - Issue reduction percentage: `(fixed / previous_total) * 100`
   - Score change per page: `current_score - previous_score`
   - Overall trend: improving / stable / declining

### Remediation Progress Report

Include in the final report when comparing:

```text
 Remediation Progress

Comparing against: ACCESSIBILITY-AUDIT.md (previous)

   Fixed:      8 issues resolved since last audit
   New:        3 new issues found
   Persistent: 12 issues remain from last audit
   Regressed:  1 issue returned after previous fix

  Progress: 8 of 20 previous issues fixed (40% reduction)
  Score Change: 54/100 -> 67/100 (+13 points)

```

## Multi-Page Comparison

When auditing multiple pages, generate a per-page scorecard that enables comparison:

```text
 Page Accessibility Scorecard

  /                        82/100 (B) - Good
  /login                   91/100 (A) - Excellent
  /dashboard               45/100 (D) - Poor
  /settings                68/100 (C) - Needs Work
  /checkout                37/100 (D) - Poor

  Overall Average:         64.6/100 (C) - Needs Work
  Best:  /login (91)
  Worst: /checkout (37)

```

### Cross-Page Pattern Detection

Identify issues that repeat across pages:

- **Systemic issues** - same problem on every page (e.g., nav bar missing skip link, footer links ambiguous)
- **Template issues** - problems inherited from a shared layout (fix once, fix everywhere)
- **Page-specific issues** - unique to one page

Flag systemic and template issues prominently - they have the highest remediation ROI.

## Interactive Fix Mode

After presenting findings for each phase (or after the full report), offer to fix issues directly.

Ask: **"Would you like me to fix any of these issues now?"**
Options:

- **Fix all auto-fixable issues** - apply all fixes that can be done safely without human judgment
- **Fix issues one by one** - show each fix, let me approve or skip
- **Just the report** - no fixes, I'll handle them manually
- **Fix a specific issue** - let me pick which one(s)

### Auto-Fixable Issues (safe to apply without asking)

These can be fixed programmatically with high confidence:

| Issue | Fix |
|-------|-----|
| Missing `lang` attribute on `<html>` | Add `lang="en"` (or detected language) |
| Missing viewport meta | Add `<meta name="viewport" content="width=device-width, initial-scale=1">` |
| `<img>` without `alt` attribute | Add empty `alt=""` for decorative, prompt for meaningful alt text for content images |
| Positive `tabindex` values | Replace with `tabindex="0"` or remove |
| `outline: none` without alternative | Add `outline: 2px solid` with focus-visible |
| Missing `<label>` for inputs | Add `<label>` element with `for` attribute |
| Button without accessible name | Add `aria-label` or text content |
| Missing `autocomplete` on identity fields | Add appropriate `autocomplete` value |
| Link opening in new tab without warning | Add `(opens in new tab)` visually hidden text |
| Missing `scope` on `<th>` elements | Add `scope="col"` or `scope="row"` |

### Human-Judgment Issues (show fix, ask for approval)

These require context that only the user can provide:

| Issue | Why Human Needed |
|-------|-----------------|
| Alt text content for meaningful images | Only the user knows the image's purpose |
| Heading hierarchy restructuring | May affect visual design and content flow |
| Link text rewriting | Context-dependent, may affect UX copy |
| ARIA role assignment | Depends on intended interaction pattern |
| Live region placement | Depends on UX intent for dynamic content |

### Fix Tracking

When applying fixes:

1. Show the before/after code diff for each fix
2. Track all applied fixes in the report under a "Fixes Applied" section
3. After all fixes, re-run axe-core (if URL available) to verify fixes resolved the issues
4. Report: "X of Y issues fixed. Z issues remain (require manual attention)."

## Phase 10: Behavioral Testing (Playwright)

**This phase runs only when Playwright MCP tools are available AND a URL was provided.**

If Playwright was detected in Step 0, dispatch the `playwright-scanner` agent via the Task tool with the dev server/production URL and the current scan context.

### Behavioral Scan Execution

1. **Dispatch playwright-scanner** with the URL, scan profile, and any selectors of interest from previous phases.
2. **Receive structured results** covering:
   - **Keyboard flow:** Tab sequence, keyboard traps, unreachable elements (WCAG 2.1.1, 2.1.2, 2.4.3)
   - **Dynamic state scan:** axe-core violations in expanded/active states (all applicable SC)
   - **Responsive viewport scan:** Reflow failures, touch target sizes at 320/768/1024/1440px (WCAG 1.4.10, 2.5.8)
   - **Rendered contrast:** Computed foreground/background contrast ratios after CSS cascade (WCAG 1.4.3, 1.4.6)
   - **Accessibility tree:** Browser's accessibility tree snapshot for structural verification
3. **Merge findings** with Phase 1-9 results for three-source correlation:
   - Issues found by agent review + axe-core + Playwright → **Confirmed** confidence (1.2x weight)
   - Issues found by any two sources → **High** confidence (1.0x weight)
   - Issues found by Playwright only → **Medium** confidence (0.7x weight)
4. **Report behavioral results** before proceeding to the final report.

### Graceful Degradation

- If Playwright tools are not available: Skip Phase 10 entirely. Add a note to the report: "Behavioral testing unavailable. Install Playwright for keyboard traversal, dynamic state, and rendered contrast testing."
- If @axe-core/playwright is not installed but Playwright is: Run keyboard, contrast, and accessibility tree scans only. Note that state and viewport scans were skipped.
- If the URL is unreachable: Skip Phase 10 and note the error.
