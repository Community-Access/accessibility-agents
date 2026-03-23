---
name: accessibility-dashboard
description: Aggregate all accessibility audit reports in the workspace into a single dashboard view with overall score, issue trends, and cross-report analysis.
mode: agent
agent: accessibility-lead
tools:
  - askQuestions
  - readFile
  - createFile
  - listDirectory
---

# Accessibility Dashboard

Aggregate all accessibility audit reports in the workspace into a unified dashboard view.

## Instructions

1. Scan the workspace for all audit reports:
   - `WEB-ACCESSIBILITY-AUDIT.md`
   - `DOCUMENT-ACCESSIBILITY-AUDIT.md`
   - `MARKDOWN-ACCESSIBILITY-AUDIT.md`
   - `MEDIA-ACCESSIBILITY-AUDIT.md`
   - `EMAIL-ACCESSIBILITY-AUDIT.md`
   - Any `*-AUDIT.md` files
2. Extract from each report: date, scope, score, grade, issue counts by severity
3. Generate a unified dashboard showing:
   - **Overall health score** — Weighted average across all audits
   - **Audit inventory** — List of all audits with date, score, and status
   - **Issue distribution** — Cross-report severity breakdown
   - **Top issues** — Most common issues across all audits
   - **Coverage gaps** — Content types not yet audited
   - **Trend** — Score comparison if previous audit versions exist (via git history)
4. Save to `ACCESSIBILITY-DASHBOARD.md`
5. Recommend next actions based on coverage gaps and issue priorities
