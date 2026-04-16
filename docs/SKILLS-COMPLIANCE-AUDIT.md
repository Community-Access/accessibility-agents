# Skills Compliance Audit - agentskills.io Specification

**Last Updated**: April 16, 2026  
**Status**: Phase 1 (Audit & Documentation)  
**Target**: All 25 skills pass agentskills.io spec validation

---

## Audit Checklist (Per Skill)

For each skill, verify:
- [ ] Frontmatter has `name:` matching folder name
- [ ] Frontmatter has `description:` <200 chars
- [ ] Markdown body is comprehensive (>100 words)
- [ ] No broken links in documentation
- [ ] WCAG criteria accurately mapped (if applicable)

---

## Skills Compliance Status

### Group 1: Document Accessibility (5 skills)

| # | Skill | Folder | Name Match | Description <200c | Body OK | Links OK | WCAG OK | Passed | Notes |
|---|-------|--------|-----------|---------------------|---------|----------|---------|--------|-------|
| 1 | accessibility-rules | `.github/skills/accessibility-rules/` | ? | ? | ? | ? | ? | [ ] | Maps 400+ rules |
| 2 | document-scanning | `.github/skills/document-scanning/` | ? | ? | ? | ? | N/A | [ ] | File discovery |
| 3 | office-remediation | `.github/skills/office-remediation/` | ? | ? | ? | ? | N/A | [ ] | python-docx, openpyxl |
| 4 | report-generation | `.github/skills/report-generation/` | ? | ? | ? | ? | N/A | [ ] | Severity scoring |
| 5 | legal-compliance-mapping | `.github/skills/legal-compliance-mapping/` | ? | ? | ? | ? | N/A | [ ] | Section 508, EN 301 549 |

### Group 2: Web Accessibility (9 skills)

| # | Skill | Folder | Name Match | Description <200c | Body OK | Links OK | WCAG OK | Passed | Notes |
|---|-------|--------|-----------|---------------------|---------|----------|---------|--------|-------|
| 6 | accessibility-rules | `.github/skills/accessibility-rules/` | ? | ? | ? | ? | ? | [ ] | WCAG 2.2 |
| 7 | framework-accessibility | `.github/skills/framework-accessibility/` | ? | ? | ? | ? | ? | [ ] | React, Vue, Angular |
| 8 | design-system | `.github/skills/design-system/` | ? | ? | ? | ? | ? | [ ] | Contrast tokens |
| 9 | web-scanning | `.github/skills/web-scanning/` | ? | ? | ? | ? | N/A | [ ] | axe-core CLI |
| 10 | web-severity-scoring | `.github/skills/web-severity-scoring/` | ? | ? | ? | ? | N/A | [ ] | 0-100 scoring |
| 11 | ci-integration | `.github/skills/ci-integration/` | ? | ? | ? | ? | N/A | [ ] | GitHub Actions |
| 12 | markdown-accessibility | `.github/skills/markdown-accessibility/` | ? | ? | ? | ? | ? | [ ] | 9 domains |
| 13 | mobile-accessibility | `.github/skills/mobile-accessibility/` | ? | ? | ? | ? | ? | [ ] | React Native |
| 14 | data-visualization-accessibility | `.github/skills/data-visualization-accessibility/` | ? | ? | ? | ? | ? | [ ] | Charts, graphs |

### Group 3: Cognitive & User Experience (5 skills)

| # | Skill | Folder | Name Match | Description <200c | Body OK | Links OK | WCAG OK | Passed | Notes |
|---|-------|--------|-----------|---------------------|---------|----------|---------|--------|-------|
| 15 | cognitive-accessibility | `.github/skills/cognitive-accessibility/` | ? | ? | ? | ? | ? | [ ] | SC 3.3.7, 3.3.8, 3.3.9 |
| 16 | testing-strategy | `.github/skills/testing-strategy/` | ? | ? | ? | ? | ? | [ ] | AT compatibility |
| 17 | media-accessibility | `.github/skills/media-accessibility/` | ? | ? | ? | ? | ? | [ ] | Captions, transcripts |
| 18 | email-accessibility | `.github/skills/email-accessibility/` | ? | ? | ? | ? | ? | [ ] | Email clients |
| 19 | playwright-testing | `.github/skills/playwright-testing/` | ? | ? | ? | ? | N/A | [ ] | Behavioral testing |

### Group 4: Platform & Tool Integration (6 skills)

| # | Skill | Folder | Name Match | Description <200c | Body OK | Links OK | WCAG OK | Passed | Notes |
|---|-------|--------|-----------|---------------------|---------|----------|---------|--------|-------|
| 20 | github-workflow-standards | `.github/skills/github-workflow-standards/` | ? | ? | ? | ? | N/A | [ ] | Auth, discovery |
| 21 | github-scanning | `.github/skills/github-scanning/` | ? | ? | ? | ? | N/A | [ ] | Search patterns |
| 22 | github-analytics-scoring | `.github/skills/github-analytics-scoring/` | ? | ? | ? | ? | N/A | [ ] | Scoring formulas |
| 23 | help-url-reference | `.github/skills/help-url-reference/` | ? | ? | ? | ? | N/A | [ ] | External URLs |
| 24 | lighthouse-scanner | `.github/skills/lighthouse-scanner/` | ? | ? | ? | ? | N/A | [ ] | Lighthouse CI |
| 25 | python-development | `.github/skills/python-development/` | ? | ? | ? | ? | N/A | [ ] | Packaging, testing |

---

## Summary Counts

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Skills Audited** | 25 | 0 | [ ] Not started |
| **Name Matches** | 25 | ? | [ ] In progress |
| **Description Valid** | 25 | ? | [ ] In progress |
| **Body OK** | 25 | ? | [ ] In progress |
| **Links Valid** | 25 | ? | [ ] In progress |
| **WCAG OK** | 19 | ? | [ ] In progress |
| **Total Passed** | 25 | 0 | [ ] **0% Complete** |

---

## Validation Script Output

### Running Audit
```bash
node scripts/validate-agents.js --strict --quiet
```

**Date Last Ran**: [Not yet run]  
**Exit Code**: [Pending]  
**Errors**: [Pending]  
**Warnings**: [Pending]

### Sample Output Snippet
```
[pending]
```

---

## Phase 1 Remediation Plan

### High Priority (Blocking)
- [ ] Verify all skill names match folder names
- [ ] Validate description field exists and <200 chars
- [ ] Fix any name/folder mismatches

### Medium Priority (Recommended)
- [ ] Add license field to all skills
- [ ] Add repository URLs to all skills
- [ ] Verify WCAG criterion mappings are accurate

### Low Priority (Nice-to-Have)
- [ ] Add `gh:` provenance metadata template
- [ ] Document skill versioning strategy
- [ ] Create skill release notes template

---

## Notes & Findings

### Issues Discovered
[None yet - audit pending]

### Platform Compatibility Notes
[None yet - audit pending]

### External Resource Status
[None yet - will track broken links]

---

## Related Issues

- [GitHub Skills Spec Announcement](https://github.blog/changelog/2026-04-16-manage-agent-skills-with-github-cli/)
- [Agent Skills Specification](https://agentskills.io/specification)
- [Phase 1 Audit Task](https://github.com/Community-Access/accessibility-agents/issues/TBD)

---

## Audit Progress

| Phase | Status | Completion | Owner | ETA |
|-------|--------|------------|-------|-----|
| 1: Audit & Docs | 🟡 In Progress | 10% | Accessibility Lead | Week 1-2 |
| 2: Validation Script | 🔴 Not Started | 0% | Script Lead | Week 2-3 |
| 3: Supply Chain Security | 🔴 Not Started | 0% | Repo Admin | Week 3-4 |
| 4: CLI Workflow | 🔴 Not Started | 0% | DevOps | Week 4-5 |
| 5: Documentation | 🔴 Not Started | 0% | Tech Writer | Week 5-6 |
| 6: Testing & Release | 🔴 Not Started | 0% | Release Manager | Week 6-7 |
