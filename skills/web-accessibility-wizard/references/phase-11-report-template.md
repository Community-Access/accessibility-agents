# Web Accessibility Wizard reference: Phase 11: Final Report and Action Plan

Part of the `web-accessibility-wizard` skill. Read this only when the task reaches these sections.

## Phase 11: Final Report and Action Plan

Compile all findings into a single prioritized report and **write it to `ACCESSIBILITY-AUDIT.md` in the current working directory**. This file is the deliverable - a persistent, reviewable artifact that the team can track over time.

### Report Structure

Write this exact structure to `ACCESSIBILITY-AUDIT.md`:

```markdown
# Accessibility Audit Report

## Project Information

| Field | Value |
|-------|-------|
| Project | [name] |
| Date | [YYYY-MM-DD] |
| Auditor | A11y Agent Team (web-accessibility-wizard) |
| Target standard | WCAG [version] [level] |
| Framework | [detected framework] |
| Pages/components audited | [list] |

## Executive Summary

- **Total issues found:** X
- **Critical:** X | **Serious:** X | **Moderate:** X | **Minor:** X
- **Estimated effort:** [low/medium/high]

## How This Audit Was Conducted

This report combines two methods:

1. **Agent-driven code review** (Phases 1-8): Static analysis of source code by specialist accessibility agents covering structure, keyboard, forms, color, ARIA, dynamic content, tables, and links.
2. **axe-core runtime scan** (Phase 9): Automated scan of the rendered page in a browser, testing the actual DOM against WCAG 2.1 AA rules.

Issues found by both methods are marked as high-confidence findings.

## Critical Issues

[For each issue:]
### [issue-number]. [Brief description]

- **Severity:** Critical
- **Source:** [Agent review / axe-core scan / Both]
- **Phase:** [which audit phase found it]
- **WCAG criterion:** [e.g., 1.1.1 Non-text Content (Level A)]
- **Impact:** [What a real user with a disability would experience]
- **Location:** [file path and/or CSS selector]

**Current code:**
[code block showing the problem]

**Recommended fix:**
[code block showing the corrected code]

---

## Serious Issues

[Same format as Critical]

## Moderate Issues

[Same format]

## Minor Issues

[Same format]

## axe-core Scan Results

[If a scan was run, include a summary here. Reference the full scan report at ACCESSIBILITY-SCAN.md for complete details.]

| Metric | Value |
|--------|-------|
| URL scanned | [url] |
| Violations | [count] |
| Rules passed | [count] |
| Needs manual review | [count] |

## What Passed

Acknowledge what the project does well. List areas that met WCAG requirements with no issues found.

## CI Scanner Integration

[Include this section only if Step 0 detected a CI scanner. Omit entirely if no scanner was found.]

### GitHub Accessibility Scanner

| Metric | Value |
|--------|-------|
| Workflow file | [path] |
| Open scanner issues | [count] |
| Recently closed (30d) | [count] |
| Copilot fixes pending | [count] |
| Copilot fixes merged | [count] |

#### Scanner Issue Correlation

| Finding | Scanner Issue | Local Scan | Confidence | Copilot Status |
|---------|-------------|------------|------------|---------------|
| [description] | [#N](url) | Confirmed / Not found | High / Medium | [status] |

### Lighthouse CI

| Metric | Value |
|--------|-------|
| Lighthouse a11y score | [0-100] |
| Violations | [count] |
| Passing audits | [count] |
| Manual checks needed | [count] |

#### Lighthouse-Only Findings

[Issues found by Lighthouse but not by axe-core local scan]

## Recommended Testing Setup

[Customized to their stack - test framework integration, CI pipeline, screen reader testing plan]

## Next Steps

1. Fix critical issues first - these block access entirely
2. Fix serious issues - these significantly degrade the experience
3. Set up automated testing to prevent regressions (see Recommended Testing Setup)
4. Conduct manual screen reader testing (NVDA + Firefox, VoiceOver + Safari)
5. Address moderate and minor issues
6. Schedule a follow-up audit after fixes are applied
```

### Additional Report Sections

After the base report structure, include these sections:

#### Report Organization

Organize findings based on the preference selected in Phase 0 Step 6:

**By page (default):** Group all findings under each page URL, as shown in the base structure above.

**By issue type:** Group all instances of each rule together, listing affected pages under each rule:

```markdown
### Missing alt text (1.1.1)
- /home - 3 images
- /about - 1 image
- /products - 5 images
```

**By severity:** List all critical issues first (across all pages), then serious, then moderate, then minor.

#### Accessibility Scorecard

```markdown
## Accessibility Scorecard

| Page/Component | Score | Grade | Critical | Serious | Moderate | Minor |
|---------------|-------|-------|----------|---------|----------|-------|
| [page URL] | [0-100] | [A-F] | [count] | [count] | [count] | [count] |
| ... | | | | | | |
| **Overall Average** | **[avg]** | **[grade]** | **[total]** | **[total]** | **[total]** | **[total]** |
```

#### Cross-Page Patterns

```markdown
## Cross-Page Patterns

### Systemic Issues (found on every page)
[Issues from shared layout/navigation - fix once, fix everywhere]

### Template Issues (found on pages sharing a template)
[Issues inherited from shared components - high ROI to fix]

### Page-Specific Issues
[Issues unique to individual pages]
```

#### Remediation Tracking (when comparing against previous audit)

```markdown
## Remediation Progress

| Metric | Previous | Current | Change |
|--------|----------|---------|--------|
| Total Issues | [n] | [n] | [+/-n] |
| Critical | [n] | [n] | [+/-n] |
| Overall Score | [n]/100 | [n]/100 | [+/-n] |
| Pages Passing | [n] | [n] | [+/-n] |

### Fixed Issues
[List of issues resolved since last audit]

### New Issues
[List of issues not in previous audit]

### Persistent Issues
[List of issues remaining from previous audit]
```

#### Fixes Applied (when interactive fix mode was used)

```markdown
## Fixes Applied During Audit

| # | Issue | File | Fix Applied | Verified |
|---|-------|------|-------------|----------|
| 1 | [description] | [file:line] | [what was changed] | / |
| ... | | | | |

**Total:** X fixes applied, Y verified by re-scan
```

#### Confidence Summary

```markdown
## Confidence Summary

| Confidence | Count | Percentage |
|------------|-------|------------|
| High | [n] | [%] - confirmed by tooling or structural analysis |
| Medium | [n] | [%] - likely issue, needs verification |
| Low | [n] | [%] - possible issue, flagged for review |
```

#### Framework-Specific Notes

```markdown
## Framework-Specific Notes ([detected framework])

[Framework-specific patterns checked, common pitfalls found, and recommendations tailored to the stack]
```

#### Page Metadata Dashboard

Collect and summarize page-level metadata across all audited pages:

```markdown
## Page Metadata Dashboard

| Property | Present | Missing | Percentage |
|----------|---------|---------|------------|
| Page Title (`<title>`) | [n] | [n] | [%] |
| Language (`<html lang>`) | [n] | [n] | [%] |
| Meta Description | [n] | [n] | [%] |
| Viewport Meta | [n] | [n] | [%] |
| Canonical URL | [n] | [n] | [%] |
| Open Graph Tags | [n] | [n] | [%] |
| Skip Navigation Link | [n] | [n] | [%] |
| Main Landmark (`<main>`) | [n] | [n] | [%] |

### Page Titles
[List each page with its `<title>` value - flag missing, duplicate, or generic titles]

### Language Settings
[List lang attribute values found - flag pages with missing or mismatched lang]
```

Metadata flags that affect accessibility:

- **Missing `<html lang>`** -> Screen readers may mispronounce content
- **Missing `<title>`** -> Users can't identify the page in AT or browser tabs
- **Missing viewport meta** -> Mobile accessibility compromised
- **Missing skip navigation** -> Keyboard users must tab through entire header on every page
- **Missing `<main>` landmark** -> Screen reader users cannot jump to main content

#### Component and Template Analysis

Detect shared components and templates across audited pages:

```markdown
## Component and Template Analysis

### Shared Components Detected
| Component | Pages Using | Component-Level Issues | Impact |
|-----------|-------------|----------------------|--------|
| Navigation bar | all pages | Missing skip link, ambiguous links | Fix component to remediate all pages |
| Footer | all pages | "Click here" link text | Fix component to remediate all pages |
| Card component | /products, /blog | Missing alt text on thumbnails | Fix component to remediate 2 page types |
| Modal dialog | /login, /settings | No focus trap | Fix component to remediate 2 pages |

### Issue Classification
- **Component-level issues** - problems in shared components (fix once, fix everywhere) - HIGHEST ROI
- **Layout/template-level issues** - problems inherited from a shared page template
- **Page-specific issues** - unique to one page

### Component Remediation Priority
1. [Component with most page impact first]
2. [Next highest impact]
```

When detecting shared components:

- Look for repeated HTML patterns across pages (same class names, same structure)
- Check framework component files if doing code review (React components, Vue SFCs, Angular components)
- Group identical issues appearing on multiple pages as component-level
- Recommend fixing the component source rather than individual pages

#### Findings by Rule Cross-Reference

```markdown
## Findings by Rule

| WCAG Criterion | Rule | Severity | Pages Affected | Total Instances |
|---------------|------|----------|----------------|----------------|
| 1.1.1 Non-text Content | Missing alt text | Critical | 5 | 12 |
| 2.4.1 Bypass Blocks | No skip link | Serious | 8 | 8 |
| 1.4.3 Contrast | Text contrast failure | Serious | 3 | 7 |
| ... | | | | |
```

#### Configuration Recommendations

```markdown
## Configuration Recommendations

[Based on the audit findings, recommend scan configuration for future audits]

- **Suggested scan profile:** [strict / moderate / minimal] based on [rationale]
- **Rules to prioritize:** [list top rules that failed most frequently]
- **Recommended CI threshold:** [score threshold for blocking deployments]
- **Re-scan frequency:** [weekly / per-PR / monthly] based on [project velocity]

To set up automated scanning, create a `.a11y-web-config.json` in your project root (see Web Scan Configuration section).
```

#### Expanded What Passed

```markdown
## What Passed

### WCAG Criteria Met
| Criterion | Description | Level | Status |
|-----------|-------------|-------|--------|
| 1.3.1 | Info and Relationships | A |  Pass |
| 2.1.1 | Keyboard | A |  Pass |
| ... | | | |

### Areas of Strength
[Specific acknowledgment of what the project does well, with examples]
```

### Consolidation Rules

When writing the report:

1. **Deduplicate:** If the agent review and axe-core scan found the same issue, list it once and mark Source as "Both"
2. **Preserve axe-core specifics:** Include the exact `axe-core` rule ID and help URL for issues found by the scan
3. **Include code fixes:** Every issue must have a recommended fix with actual code, not just a description
4. **Reference the scan report:** Link to `ACCESSIBILITY-SCAN.md` for the full axe-core output
5. **Number all issues:** Use sequential numbering across all severity levels for easy reference
