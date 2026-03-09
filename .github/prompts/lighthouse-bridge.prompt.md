---
name: integrate-lighthouse
description: Lighthouse CI accessibility bridge. Detects Lighthouse config, parses audit results, maps findings to standard severity model, tracks score regressions.
mode: agent
agent: lighthouse-bridge
tools:
  - askQuestions
  - readFile
  - runInTerminal
  - getTerminalOutput
  - createFile
---

# Lighthouse CI Accessibility Bridge

Integrate Lighthouse CI accessibility audits with agent ecosystem. Parse reports, normalize findings, track score regressions.

## Repository

**Repository:** `${input:repo}`

## Instructions

### Step 1: Detect Lighthouse CI Configuration

Check for:
- `.lighthouserc.json` or `.lighthouserc.js`
- `lighthouse-ci` in package.json scripts
- `.github/workflows/lighthouse.yml` (GitHub Actions)

### Step 2: Run Lighthouse Accessibility Audit

```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run audit
lhci autorun --collect.url=${url} --upload.target=temporary-public-storage

# Or run locally
npx lighthouse ${url} --only-categories=accessibility --output json --output-path report.json
```

### Step 3: Parse Lighthouse Report

Extract from `report.json`:
- **accessibility score** (0-100)
- **audits.*.score** (0, 0.5, 1 for each rule)
- **audits.*.title** (rule description)
- **audits.*.displayValue** (affected element count)
- **audits.*.details** (specific violations)

### Step 4: Map to Standard Severity Model

Lighthouse uses 0-100 score. Map to agent severity model:

```javascript
// Map Lighthouse rule weight to severity
const severityMap = {
  10: 'critical',   // Failed audits worth 10 points
  7: 'serious',     // Failed audits worth 7 points
  3: 'moderate',    // Failed audits worth 3 points
  0: 'minor'        // Non-scored informational audits
};
```

Common mappings:
- `button-name` (weight 10) → Critical
- `color-contrast` (weight 7) → Serious
- `image-alt` (weight 10) → Critical
- `html-has-lang` (weight 7) → Serious
- `meta-viewport` (weight 0) → Minor (best practice)

### Step 5: Normalize Findings

Convert to agent standard format:

```json
{
  "ruleId": "button-name",
  "impact": "critical",
  "wcagCriteria": ["4.1.2"],
  "description": "Buttons must have discernible text",
  "affectedElements": 5,
  "helpUrl": "https://accessibilityinsights.io/info-examples/web/button-name/"
}
```

### Step 6: Deduplicate Against Local Scans

If web-accessibility-wizard already ran axe-core:
- Match by rule ID (`button-name` = `button-name`)
- Keep axe-core results (more detailed)
- Use Lighthouse as fallback for rules axe-core missed

### Step 7: Track Score Regressions

Compare current Lighthouse score with previous run:
- Score decreased → Flag regression
- New violations → List new failing audits
- Fixed violations → Celebrate improvements

```markdown
## Lighthouse Accessibility Score Trend

- Current: ${currentScore}/100
- Previous: ${previousScore}/100
- Change: ${delta} (${deltaPercent}%)

### Regressions
- `color-contrast`: 5 new violations
- `image-alt`: 2 new violations

### Improvements
- `button-name`: Fixed 3 violations ✅
```

### Step 8: Generate Bridge Report

Create `LIGHTHOUSE-BRIDGE.md`:

```markdown
# Lighthouse CI Accessibility Bridge

**Generated:** ${date}  
**URL:** ${url}  
**Score:** ${score}/100

## Lighthouse Results

- **Passed:** ${passedCount} audits
- **Failed:** ${failedCount} audits

## Mapped Findings

### Critical (${criticalCount})
- `button-name`: 5 buttons without accessible names
- `image-alt`: 3 images missing alt text

### Serious (${seriousCount})
- `color-contrast`: 12 elements insufficient contrast

## Score Regression Analysis

${regressionReport}

## Recommendations

- Address critical issues first
- Run local axe-core scan for detailed element inspection
- Fix Lighthouse issues then re-run CI
```

## Expected Output

- Parsed Lighthouse report
- Normalized findings in agent format
- Score regression analysis
- Deduplication against local scans
- Ready for inclusion in WEB-ACCESSIBILITY-AUDIT.md
