---
name: cross-page-analysis
description: Cross-page web accessibility pattern detection. Analyzes aggregated findings from multiple page audits, identifies systemic vs page-specific issues, generates scorecards.
mode: agent
agent: cross-page-analyzer
tools:
  - askQuestions
  - readFile
  - createFile
---

# Cross-Page Accessibility Analyzer

Analyze accessibility patterns across multiple web page audit results. Identify systemic framework issues versus page-specific problems.

## Audit Results to Analyze

**Input Files:** `${input:auditFiles}` (comma-separated list of page audit JSON files)

## Instructions

### Step 1: Load All Page Audit Results

Read each page audit JSON file from:
- web-audit-{url-slug}.json

### Step 2: Aggregate Findings

Group findings by:
- **Rule ID:** button-name, html-has-lang, image-alt, color-contrast, etc.
- **WCAG Criterion:** 1.1.1, 1.3.1, 1.4.3, 2.4.4, 4.1.2, etc.
- **Impact:** Critical, Serious, Moderate, Minor
- **Component Type:** Form, Navigation, Modal, Table, etc.

### Step 3: Identify Systemic Issues

**Systemic** = appears on 50%+ of pages:
- Missing form labels → systemic (likely component library issue)
- Insufficient color contrast → systemic (likely design tokens)
- Missing landmark roles → systemic (likely base template)

**Page-specific** = appears on < 50%:
- Individual missing alt text
- Single ambiguous link
- One-off ARIA issues

### Step 4: Compute Cross-Page Severity Score

Formula:
```
Base Score = 100
For each unique rule violation:
  systemic issue → deduct (impact * occurrence_rate * 10)
  isolated issue → deduct (impact * 5)

Impact weights:
  Critical = 4
  Serious = 3
  Moderate = 2
  Minor = 1

Final Score = max(0, Base Score - total_deductions)
Grade = A (90-100), B (80-89), C (70-79), D (60-69), F (0-59)
```

### Step 5: Generate Comparison Scorecard

```markdown
# Cross-Page Accessibility Analysis

**Pages Analyzed:** ${count}  
**Framework:** ${framework} ${version}  
**Generated:** ${date}

## Overall Score: ${score}/100 (${grade})

## Systemic Issues (50%+ of pages)

### Critical
- **button-name: Buttons must have discernible text** - ${affectedCount} of ${totalCount} pages (${percent}%)
  - Affects: /home, /products, /checkout
  - Likely cause: Icon-only buttons in shared Header component
  - Fix location: src/components/Header.tsx
  - Remediation: Add aria-label or wrap icon in <span class="sr-only">

### Serious
- **color-contrast: Insufficient contrast** - ${affectedCount} of ${totalCount} pages
  - Common pattern: Muted text (#6c757d on #ffffff only 4.1:1, needs 4.5:1)
  - Fix location: tailwind.config.js or design tokens
  - Remediation: Darken muted color to #5a6268 (4.51:1)

## Page-Specific Issues

- /home: ${issueCount} unique issues (mostly missing alt text)
- /about: ${issueCount} unique issues (heading structure)

## Recommendations

1. **Fix Framework Issues First:** Address systemic issues in shared components
2. **Design Token Audit:** Run design-system-auditor to catch contrast issues at source
3. **Component Library Fixes:** Update base components before fixing individual pages

## Scorecard by Page

| Page | Score | Grade | Critical | Serious | Moderate | Minor |
|------|-------|-------|----------|---------|----------|-------|
| /home | 78 | C | 2 | 4 | 6 | 3 |
| /products | 85 | B | 1 | 2 | 3 | 2 |
| /checkout | 68 | D | 3 | 5 | 4 | 1 |
```

### Step 6: Generate Remediation Priority List

Order by:
1. **Systemic issues** (highest occurrence rate first)
2. **Impact** (Critical > Serious > Moderate > Minor)
3. **Blast radius** (shared components > individual pages)

## Expected Output

- Cross-page analysis report
- Systemic vs page-specific issue breakdown
- Overall severity score and grade
- Per-page scorecard table
- Prioritized remediation plan with file paths
