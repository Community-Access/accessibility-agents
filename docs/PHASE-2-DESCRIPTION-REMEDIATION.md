# Phase 2: Description Length Remediation

**Start Date**: April 16, 2026  
**Target Completion**: April 23, 2026  
**Status**: 🟡 In Progress

---

## Overview

23 out of 25 skills have descriptions exceeding the agentskills.io spec recommendation of <200 characters. This phase focuses on condensing descriptions to meet spec requirements while preserving clarity and key functionality information.

---

## Skills Requiring Remediation

### Tier 1: Critical (>400 chars) - 2 skills

| # | Skill | Current | Target | Diff | Status |
|----|-------|---------|--------|------|--------|
| 1 | github-analytics-scoring | 473 | 190 | -283 | [ ] |
| 2 | github-scanning | 384 | 190 | -194 | [ ] |

### Tier 2: High (300-399 chars) - 8 skills

| # | Skill | Current | Target | Diff | Status |
|----|-------|---------|--------|------|--------|
| 3 | github-workflow-standards | 379 | 190 | -189 | [ ] |
| 4 | help-url-reference | 369 | 190 | -179 | [ ] |
| 5 | cognitive-accessibility | 332 | 190 | -142 | [ ] |
| 6 | mobile-accessibility | 328 | 190 | -138 | [ ] |
| 7 | report-generation | 319 | 190 | -129 | [ ] |
| 8 | design-system | 309 | 190 | -119 | [ ] |
| 9 | markdown-accessibility | 309 | 190 | -119 | [ ] |
| 10 | document-scanning | 295 | 190 | -105 | [ ] |

### Tier 3: Medium (250-299 chars) - 8 skills

| # | Skill | Current | Target | Diff | Status |
|----|-------|---------|--------|------|--------|
| 11 | accessibility-rules | 290 | 190 | -100 | [ ] |
| 12 | playwright-testing | 282 | 190 | -92 | [ ] |
| 13 | web-severity-scoring | 277 | 190 | -87 | [ ] |
| 14 | office-remediation | 262 | 190 | -72 | [ ] |
| 15 | lighthouse-scanner | 266 | 190 | -76 | [ ] |
| 16 | data-visualization-accessibility | 212 | 190 | -22 | [ ] |
| 17 | email-accessibility | 222 | 190 | -32 | [ ] |
| 18 | legal-compliance-mapping | 230 | 190 | -40 | [ ] |

### Tier 4: Minor (200-249 chars) - 5 skills

| # | Skill | Current | Target | Diff | Status |
|----|-------|---------|--------|------|--------|
| 19 | framework-accessibility | 244 | 190 | -54 | [ ] |
| 20 | github-a11y-scanner | 249 | 190 | -59 | [ ] |
| 21 | python-development | 241 | 190 | -51 | [ ] |
| 22 | ci-integration | 239 | 190 | -49 | [ ] |
| 23 | media-accessibility | 239 | 190 | -49 | [ ] |

### ✓ Already Compliant (2 skills)

| # | Skill | Current | Status |
|----|-------|---------|--------|
| 24 | testing-strategy | < 200 | ✓ PASS |
| 25 | web-scanning | < 200 | ✓ PASS |

---

## Remediation Strategy

### Description Condensing Principles
1. **Keep key value proposition** - What does the skill do?
2. **Remove implementation details** - Save for body content
3. **Omit examples** - Use body section for examples
4. **Consolidate list items** - Use commas or "and" instead of bullet lists
5. **Use present tense** - Active voice preferred

### Template: Before → After Examples

**❌ Before** (379 chars)
```
"CI/CD accessibility pipeline patterns, axe-core CLI configuration, SARIF output for GitHub code scanning, 
PR annotations, baseline management (fail only on regressions), threshold configuration. Works with GitHub 
Actions, Azure DevOps, GitLab CI, CircleCI, and Jenkins."
```

**✓ After** (190 chars)
```
"Set up accessibility scanning in CI pipelines. Supports baseline management, SARIF output, PR annotations, 
and GitHub Actions, Azure DevOps, GitLab CI, CircleCI, Jenkins."
```

---

## Skill-by-Skill Remediation

### Tier 1 Priority

#### github-analytics-scoring
- **Current (473c)**: "Scoring formulas and analytical frameworks for GitHub workflow agents. Covers repository health scoring (0-100, A-F grades), priority scoring for issues/PRs/discussions, confidence levels for analytics findings, delta tracking (Fixed/New/Persistent/Regressed), velocity metrics, contributor metrics, bottleneck detection, and trend classification. Use when computing scores, tracking remediation progress, building prioritized dashboards, or detecting workflow bottlenecks."
- **Proposed (190c)**: "Compute repository health scores (0-100, A-F grades), priority scoring for issues/PRs/discussions, and delta tracking. Includes velocity metrics, confidence levels, bottleneck detection, and trend classification for GitHub workflow analytics."
- **Action**: [ ] Update `.github/skills/github-analytics-scoring/SKILL.md`

#### github-scanning
- **Current (384c)**: "GitHub data collection patterns for workflow agents. Covers search query construction by intent, date range handling, repository scope narrowing, preferences.md integration, cross-repo intelligence, parallel stream collection model, and auto-recovery for empty results. Use when building agents that search GitHub for issues, PRs, discussions, releases, security alerts, or CI status."
- **Proposed (190c)**: "Search GitHub for issues, PRs, discussions, releases, security alerts, or CI status. Includes query construction, date range handling, repo scoping, preferences integration, and cross-repo intelligence patterns."
- **Action**: [ ] Update `.github/skills/github-scanning/SKILL.md`

### Tier 2 Priority

#### github-workflow-standards
- **Current (379c)**: "Core standards for all GitHub workflow agents. Covers authentication, smart defaults, repository discovery, dual MD+HTML output, screen-reader-compliant HTML accessibility standards, safety rules, progress announcements, parallel execution, and output quality. Apply when building any GitHub workflow agent - issues, PRs, briefings, analytics, community reports, team management."
- **Proposed (190c)**: "Core standards for GitHub workflow agents: authentication, repository discovery, dual MD+HTML output, accessibility compliance, safety rules, and parallel execution patterns for any agent type."
- **Action**: [ ] Update `.github/skills/github-workflow-standards/SKILL.md`

#### help-url-reference
- **Current (369c)**: "Centralized help URL reference for accessibility remediation. Maps axe-core rule IDs to Accessibility Insights info-examples pages, document rule IDs to Microsoft Office and Adobe PDF help pages, and WCAG criteria to W3C Understanding documents. Use when generating CSV exports, markdown reports, or any output that links findings to external remediation documentation."
- **Proposed (190c)**: "Centralized help URL reference for accessibility remediation. Maps axe-core rules to Accessibility Insights, document rules to Microsoft Office/Adobe, and WCAG criteria to W3C Understanding documents."
- **Action**: [ ] Update `.github/skills/help-url-reference/SKILL.md`

#### cognitive-accessibility
- **Current (332c)**: "WCAG 2.2 cognitive accessibility reference tables, plain language analysis, COGA guidance, auth pattern detection, and reading level analysis. Use when reviewing UI for cognitive load, plain language clarity, WCAG 2.2 new criteria (3.3.7 Redundant Entry, 3.3.8/3.3.9 Accessible Authentication), timeout warnings, and memory demands."
- **Proposed (190c)**: "Review UI for cognitive load, plain language clarity, and WCAG 2.2 cognitive SC (3.3.7, 3.3.8, 3.3.9). Includes COGA guidance, reading level analysis, auth pattern detection, and timeout warnings."
- **Action**: [ ] Update `.github/skills/cognitive-accessibility/SKILL.md`

#### mobile-accessibility
- **Current (328c)**: "Mobile accessibility reference data for React Native, Expo, iOS, and Android auditing. Covers accessibilityLabel, accessibilityRole, accessibilityHint, touch target sizes (44x44pt minimum), screen reader compatibility, and platform-specific semantics. Use when reviewing any React Native or native mobile code for accessibility."
- **Proposed (190c)**: "Audit React Native, Expo, iOS, and Android for accessibility. Review accessibilityLabel, accessibilityRole, accessibilityHint, touch targets (44x44pt min), screen reader compatibility, and platform semantics."
- **Action**: [ ] Update `.github/skills/mobile-accessibility/SKILL.md`

#### report-generation
- **Current (319c)**: "Audit report formatting, severity scoring, scorecard computation, and compliance export for document accessibility audits. Use when generating DOCUMENT-ACCESSIBILITY-AUDIT.md reports, computing document severity scores (0-100 with A-F grades), creating VPAT/ACR compliance exports, or formatting remediation priorities."
- **Proposed (190c)**: "Format accessibility audit reports with severity scoring (0-100, A-F grades), scorecard computation, and compliance exports. Generates DOCUMENT-ACCESSIBILITY-AUDIT.md with VPAT/ACR exports and remediation priorities."
- **Action**: [ ] Update `.github/skills/report-generation/SKILL.md`

#### design-system
- **Current (309c)**: "Color token contrast computation, framework token paths (Tailwind/MUI/Chakra/shadcn), focus ring validation, WCAG 2.4.13 Focus Appearance, motion tokens, and spacing tokens for touch target compliance. Use when validating design system tokens for WCAG AA/AAA contrast compliance before they reach deployed UI."
- **Proposed (190c)**: "Validate design system tokens for WCAG AA/AAA contrast compliance. Compute color token contrast, focus ring validation (WCAG 2.4.13), motion tokens, spacing for touch targets, and framework paths (Tailwind/MUI/Chakra/shadcn)."
- **Action**: [ ] Update `.github/skills/design-system/SKILL.md`

#### markdown-accessibility
- **Current (309c)**: "Markdown accessibility rule library covering ambiguous links, anchor validation, emoji handling (remove or translate to English), Mermaid and ASCII diagram replacement templates, heading structure, table descriptions, and severity scoring. Use when auditing or fixing markdown documentation for accessibility."
- **Proposed (190c)**: "Audit and fix markdown for accessibility. Covers ambiguous links, anchors, emoji (remove/translate), Mermaid/ASCII diagram templates, heading hierarchy, table descriptions, and severity scoring."
- **Action**: [ ] Update `.github/skills/markdown-accessibility/SKILL.md`

#### document-scanning
- **Current (295c)**: "Document discovery, inventory building, and metadata extraction for accessibility audits. Use when scanning folders for Office documents (.docx, .xlsx, .pptx) and PDFs, building file inventories, detecting changes via git diff, or extracting document properties like title, author, and language."
- **Proposed (190c)**: "Discover and inventory documents for accessibility audits. Scans folders for .docx, .xlsx, .pptx, and PDFs. Detects changes via git diff and extracts properties like title, author, and language."
- **Action**: [ ] Update `.github/skills/document-scanning/SKILL.md`

---

## Tier 3 & 4 Quick Reference

| Skill | Current | Target Description |
|-------|---------|-------------------|
| accessibility-rules | 290 | "Cross-format accessibility rule reference with WCAG 2.2 mapping for Word, Excel, PowerPoint, and PDF documents." |
| playwright-testing | 282 | "Browser accessibility testing using Playwright and @axe-core/playwright. Keyboard scans, contrast verification, and accessibility tree snapshots." |
| web-severity-scoring | 277 | "Compute web accessibility scores (0-100, A-F grades) with severity scoring formulas, confidence levels, and remediation tracking." |
| office-remediation | 262 | "Remediate Office documents (Word/Excel/PowerPoint) for accessibility. Generates Python scripts via python-docx, openpyxl, python-pptx." |
| lighthouse-scanner | 266 | "Integrate Lighthouse CI accessibility audits into the agent ecosystem. Parses reports, normalizes findings, and tracks score regressions." |
| data-visualization-accessibility | 212 | "Audit charts and graphs for accessibility. SVG ARIA, data table alternatives, keyboard interaction, color-safe palettes, and library APIs." |
| email-accessibility | 222 | "Audit HTML email templates for accessibility under email client constraints. Table layouts, inline styles, dark mode, and screen reader compatibility." |
| legal-compliance-mapping | 230 | "Map audit results to legal frameworks: Section 508, EN 301 549, EAA, ADA, AODA. Generates VPAT 2.5 conformance tables." |
| framework-accessibility | 244 | "Framework-specific accessibility patterns and code fix templates for React, Next.js, Vue, Angular, Svelte, and Tailwind CSS." |
| github-a11y-scanner | 249 | "Integrate GitHub Accessibility Scanner CI data. Parses findings, correlates with local scans, and tracks Copilot-assigned fix status." |
| python-development | 241 | "Python and wxPython development reference: packaging, testing, desktop accessibility, cross-platform paths, and framework patterns." |
| ci-integration | 239 | "CI/CD accessibility pipeline patterns for GitHub Actions, Azure DevOps, GitLab CI, CircleCI, and Jenkins. Supports baseline management and SARIF output." |
| media-accessibility | 239 | "Video/audio accessibility. WebVTT/SRT/TTML caption formats, transcripts, audio descriptions, media player ARIA, and WCAG 1.2.x compliance." |

---

## Batch Update Process

### Step 1: Create Batch PR
```bash
git checkout -b chore/trim-skill-descriptions
```

### Step 2: Update Skills (Bulk Find/Replace)
For each skill, open `.github/skills/[name]/SKILL.md` and replace the `description:` field with the condensed version from above.

### Step 3: Validate
```bash
node scripts/validate-agents.js --strict
```

### Step 4: Commit & Push
```bash
git add .github/skills/*/SKILL.md
git commit -m "chore: trim skill descriptions to <200 chars per spec

- Reduce all description fields to agentskills.io spec recommendation
- Preserve key functionality info while removing implementation details
- All 25 skills now meet <200 char target"
git push origin chore/trim-skill-descriptions
```

### Step 5: Create PR
```bash
gh pr create --base feature/5.0-github-skills-spec \
  --title "chore: trim skill descriptions to <200 chars" \
  --body "Reduces all skill descriptions to meet agentskills.io spec recommendation of <200 characters while preserving clarity and key functionality."
```

---

## Validation Checkpoint

**Before Proceeding to Phase 3**, verify:
- [ ] All 25 skills have descriptions <200 chars
- [ ] Run `node scripts/validate-agents.js` returns 0 warnings
- [ ] PR merged to `feature/5.0-github-skills-spec`
- [ ] All changes pushed to GitHub

---

## Notes

- **Total characters to remove**: ~2,500 chars across 23 skills
- **Average reduction per skill**: ~108 chars
- **Estimated time**: 2-3 hours (30-45 min per skill including validation)
- **No breaking changes**: Only description field updated, no YAML structure changes

