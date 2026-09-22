# Web Accessibility Wizard reference: Phase 11: Follow-Up Actions

Part of the `web-accessibility-wizard` skill. Read this only when the task reaches these sections.

## Phase 11: Follow-Up Actions

After the report is written, offer next steps using AskUserQuestion:

Ask: **"The audit report has been written. What would you like to do next?"**
Options:

- **Fix issues on a specific page** - I'll walk you through fixes for a chosen page
- **Set up web scan configuration** - create a `.a11y-web-config.json` for automated scanning
- **Re-scan a subset of pages** - audit specific pages again after fixes
- **Export findings as CSV/JSON** - alternative format for issue tracking systems
- **Export in compliance format (VPAT/ACR)** - generate a Voluntary Product Accessibility Template or Accessibility Conformance Report
- **Generate batch remediation scripts** - create PowerShell/Bash scripts for automatable fixes
- **Compare with a previous audit** - diff this audit against a baseline report
- **Run the document-accessibility-wizard** - if the project has Word, Excel, PowerPoint, or PDF documents
- **Nothing - I'll review the report** - end the wizard

### Sub-Agent Handoff for Page Fixes

When the user wants to fix issues on a specific page, hand off to the **web-issue-fixer** sub-agent with full context:

```text
## Fix Handoff to web-issue-fixer
- **Page URL:** [URL]
- **Source File:** [file path if code review]
- **Framework:** [detected framework]
- **Issues to Fix:**
  1. [issue description - severity - WCAG criterion]
  2. [issue description - severity - WCAG criterion]
- **User Request:** [fix all / fix specific issues / auto-fix only]
- **Scan Profile Used:** [quick / standard / deep]
```

### VPAT/ACR Compliance Export

If the user selects **Export in compliance format (VPAT/ACR)**, ask which format using AskUserQuestion:

- **VPAT 2.5 (WCAG)** - Voluntary Product Accessibility Template, WCAG edition
- **VPAT 2.5 (508)** - Voluntary Product Accessibility Template, Section 508 edition
- **VPAT 2.5 (EN 301 549)** - Voluntary Product Accessibility Template, EU edition
- **VPAT 2.5 (INT)** - Voluntary Product Accessibility Template, International edition (all three)
- **Custom ACR** - Accessibility Conformance Report in a custom format

Generate the compliance report by mapping web audit findings to the appropriate standard's criteria:

```markdown
# VPAT 2.5 - WCAG Edition

## Product Information
| Field | Value |
|-------|-------|
| Product | [project name] |
| Version | [version or URL] |
| Report Date | [YYYY-MM-DD] |
| Evaluator | A11y Agent Team (web-accessibility-wizard) |
| Standard | WCAG [version] [level] |

## WCAG Conformance

| Criterion | Conformance Level | Remarks |
|-----------|-------------------|---------|
| 1.1.1 Non-text Content (A) | [Supports / Partially Supports / Does Not Support / Not Applicable] | [Based on findings] |
| 1.2.1 Audio-only and Video-only (A) | [level] | [remarks] |
| 1.3.1 Info and Relationships (A) | [level] | [remarks] |
| 1.3.2 Meaningful Sequence (A) | [level] | [remarks] |
| 1.4.1 Use of Color (A) | [level] | [remarks] |
| 1.4.3 Contrast (Minimum) (AA) | [level] | [remarks] |
| 2.1.1 Keyboard (A) | [level] | [remarks] |
| 2.4.1 Bypass Blocks (A) | [level] | [remarks] |
| 2.4.2 Page Titled (A) | [level] | [remarks] |
| 2.4.4 Link Purpose (In Context) (A) | [level] | [remarks] |
| 3.1.1 Language of Page (A) | [level] | [remarks] |
| 3.3.1 Error Identification (A) | [level] | [remarks] |
| 3.3.2 Labels or Instructions (A) | [level] | [remarks] |
| 4.1.1 Parsing (A) | [level] | [remarks] |
| 4.1.2 Name, Role, Value (A) | [level] | [remarks] |
| ... | | |
```

Conformance levels:

- **Supports** - No findings for this criterion across any audited page
- **Partially Supports** - Some pages pass, some fail for this criterion
- **Does Not Support** - All or most audited pages fail for this criterion
- **Not Applicable** - Criterion does not apply to the content types found
- **Not Evaluated** - Criterion was not tested in the audit scope

Write the VPAT to `ACCESSIBILITY-VPAT.md` (or the user's chosen path).

### Batch Remediation Scripts

If the user selects **Generate batch remediation scripts**, ask which format using AskUserQuestion:

- **Bash** - `.sh` script for macOS environments
- **PowerShell** - `.ps1` script for Windows environments
- **Both** - generate both versions

Generate scripts that automate fixable issues:

**Automatable fixes** (safe to script):

| Fix | How |
|-----|-----|
| Add `lang` attribute to `<html>` | Find and update HTML files |
| Add viewport meta tag | Insert `<meta name="viewport">` if missing |
| Add `alt=""` to decorative images | Find `<img>` without `alt` and add empty alt |
| Remove positive tabindex values | Replace `tabindex="[1-9]..."` with `tabindex="0"` or remove |
| Add focus styles for `outline: none` | Append `:focus-visible` rule with visible outline |
| Add `autocomplete` to identity fields | Match input names/types to autocomplete values |
| Add `scope` to `<th>` elements | Add `scope="col"` or `scope="row"` |

**Non-automatable fixes** (require human judgment):

- Writing meaningful alt text for content images
- Restructuring heading hierarchy
- Rewriting ambiguous link text
- Assigning ARIA roles to custom widgets
- Placing live regions for dynamic content

The generated script MUST include:

1. A dry-run mode (`--dry-run` / `-WhatIf`) that previews changes without modifying files
2. Backup creation before any modification (copy originals to `a11y-backup/`)
3. A summary log of all changes made (`a11y-remediation-log.md`)
4. Clear comments explaining each fix

### CSV/JSON Export

If the user selects **Export findings as CSV/JSON**, delegate to the **web-csv-reporter** sub-agent with the full audit context:

```text
## CSV Export Handoff to web-csv-reporter
- **Report Path:** [path to WEB-ACCESSIBILITY-AUDIT.md]
- **Pages Audited:** [list of page URLs]
- **Output Directory:** [current working directory or user-specified directory]
- **Export Format:** CSV (and optionally JSON)
```

The web-csv-reporter generates:

- `WEB-ACCESSIBILITY-FINDINGS.csv` - one row per finding with severity scoring, WCAG criteria, and Accessibility Insights help links
- `WEB-ACCESSIBILITY-SCORECARD.csv` - one row per page with score and grade
- `WEB-ACCESSIBILITY-REMEDIATION.csv` - prioritized remediation plan with ROI scoring and fix steps

### Comparison with Previous Audit

If the user selects **Compare with a previous audit**, ask for the path to the previous report using AskUserQuestion. Then run the comparison analysis from the Remediation Tracking section and present the diff report.

## Additional Agents to Consider

During the audit, suggest these additional specialist areas if relevant to the project:

| Agent Suggestion | When to Recommend |
|-----------------|-------------------|
| **Media/Video specialist** | Projects with video players, audio content, or multimedia |
| **Internationalization (i18n) specialist** | Multi-language projects needing `dir`, `lang`, and bidi text support |
| **Mobile touch specialist** | Projects targeting mobile with touch targets, gestures, and orientation |
| **Animation/Motion specialist** | Projects with complex animations, transitions, or parallax effects |
| **document-accessibility-wizard** | Projects with Word, Excel, PowerPoint, or PDF documents |
| **Error recovery specialist** | Complex apps with error boundaries, fallbacks, and recovery flows |
| **Cognitive accessibility specialist** | Projects needing plain language, reading level, and cognitive load analysis |

## Behavioral Rules

1. **Use AskUserQuestion at every phase transition.** Present structured choices. Never dump a wall of open-ended questions - give the user options to pick from.
2. **Never ask for information you already have.** If the user gave a URL in Phase 0, use it in Phase 9. If they said no tables, skip Phase 7.
3. **Adapt the audit.** Skip phases that do not apply to this project. Tell the user which phases you are skipping and why.
4. **Be encouraging.** Acknowledge what the project does well, not just what is broken.
5. **Prioritize ruthlessly.** Critical issues first. Do not overwhelm with minor issues upfront.
6. **Provide code fixes.** Do not just describe problems - show the corrected code in the correct framework syntax.
7. **Explain impact.** For each issue, explain what a real user with a disability would experience.
8. **Reference WCAG.** Cite the specific success criterion for each finding.
9. **Capture screenshots if requested.** If the user opted for screenshots in Phase 0, include them with each issue.
10. **Recommend the testing-coach** for follow-up on how to verify fixes.
11. **Recommend the wcag-guide** if the user needs to understand why a rule exists.
12. **Always compute severity scores.** Every audited page must have a 0-100 accessibility score and letter grade.
13. **Include confidence levels in all findings.** Every finding must have a high/medium/low confidence rating.
14. **Detect cross-page patterns.** When auditing multiple pages, identify systemic vs page-specific issues.
15. **Track remediation on re-audits.** When a previous report exists, classify every finding as fixed, new, persistent, or regressed.
16. **Use framework-specific patterns.** Tailor code examples and scanning patterns to the detected framework.
17. **Offer interactive fixes.** After reporting issues, offer to fix auto-fixable issues directly.
18. **Run specialists in parallel** when possible to reduce audit time.
19. **Verify fixes with re-scan.** After applying fixes in interactive mode, re-run axe-core to confirm resolution.
20. **Offer follow-up actions.** After the report, always present Phase 11 options. Never end the session without asking what the user wants to do next.
21. **Detect shared components.** When auditing multiple pages, identify component-level issues that can be fixed once to remediate many pages.
22. **Offer CI/CD guidance proactively.** After any audit, offer Phase 12 CI/CD integration if no `.a11y-web-config.json` exists.
23. **Respect web scan configuration.** If `.a11y-web-config.json` exists, honor its rules unless the user overrides.
24. **Handle edge cases gracefully.** SPAs, shadow DOM, iframes, and auth-gated content all need special handling - see Edge Cases section.
25. **Collect page metadata.** Always gather and report page-level metadata (titles, lang, viewport, landmarks) regardless of audit thoroughness.
26. **Announce specialist invocations.** Before starting each parallel specialist group, tell the user which agents are running and what they cover. After each group completes, briefly report the finding count before moving on. Never silently delegate to specialists without narrating progress.
