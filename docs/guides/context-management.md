# Context Management for Long Accessibility Audits

When running comprehensive accessibility audits, conversations can accumulate context quickly. VS Code's `/compact` command helps manage this.

## When to Use `/compact`

- **Web audits:** After Phase 6, if still analyzing issues
- **Document audits:** After processing 3+ documents
- **Markdown audits:** After reviewing 20+ files
- **General rule:** When conversation has 7+ turns and analysis is ongoing

## What to Include in Compact Summary

Keep your summary focused on three elements:

### 1. Issues Found (by Severity)

Brief count organized by severity level:

```
CRITICAL: 2 issues
- Missing ARIA on custom widgets (2 instances)

HIGH: 8 issues
- Low contrast text (5 instances)
- Missing alt text (3 instances)

MEDIUM: 12 issues
- Focus order issues (7 instances)
- Heading hierarchy (5 instances)

LOW: 2 issues
- Inconsistent button sizing
- Minor label improvements
```

### 2. Key Patterns (Recurring Issues)

Identify issues that repeat across pages or documents:

```
PATTERNS DETECTED:
- Interactive components lack ARIA labels (recurring)
- Images in CMS missing alt text template (systemic)
- Focus management broken in navigation menu (template issue)
```

### 3. Next Steps (Remediation Priorities)

Top 3 things to tackle, and any blockers:

```
NEXT PRIORITIES:
1. Fix ARIA labels on custom widgets (blocks full widget testing)
2. Batch alt text updates for CMS images (can parallelize)
3. Review focus order in navigation (affects all pages)

BLOCKERS:
- Need CMS admin access for template changes
- Custom widget library documentation incomplete
```

## How to Resume After Compaction

1. After `/compact` completes, the conversation resets with your summary at the top
2. Continue from "Next Steps" - agent will remember context
3. If needed, reference specific findings: "Remember the 2 Critical ARIA issues from the summary?"
4. Agent can continue analyzing, fixing, generating reports, or comparing audits

## Examples by Audit Type

### Web Audit Compaction

**When:** After phase 6 (Remediation Prioritization), with 8+ conversation turns

**Include:**
- Breakdown of issues by page
- Which pages have Critical/High issues
- Framework-specific patterns (React hooks issues, Vue template patterns, etc.)
- Top 3 pages to fix first

**Example:**
```
WEB AUDIT SUMMARY (8 turns)

ISSUES: 34 total
- 2 Critical (widgets without ARIA)
- 8 High (contrast failures)
- 12 Medium (focus order)
- 12 Low (minor improvements)

PAGES AFFECTED:
- /dashboard: 12 issues (most critical)
- /checkout: 8 issues (e-commerce priority)
- /login: 6 issues
- / (home): 5 issues
- Navigation menu: 3 issues (affects all pages)

KEY PATTERNS:
- React custom components missing ARIA (fix once, fix everywhere)
- Focus management in modals broken (form-related)
- Images lacking alt text (template missing)

NEXT STEPS:
1. Fix widget ARIA (blocks accessibility)
2. Color contrast in checkout (revenue impact)
3. Navigation keyboard access (affects all users)
```

### Document Audit Compaction

**When:** After processing 3+ documents, with 6+ turns

**Include:**
- Document count and format breakdown
- Which documents have Critical/High issues
- Most common issue (fix once = fix everywhere)
- Compliance status by document type

**Example:**
```
DOCUMENT AUDIT SUMMARY (6 turns)

DOCUMENTS SCANNED: 12
- Word: 5 documents (3 with errors)
- Excel: 4 documents (2 with errors)
- PowerPoint: 2 documents (both have errors)
- PDF: 1 document (has errors)

ISSUES: 47 total
- 3 Critical (missing table headers)
- 9 High (low contrast in tables)
- 18 Medium (missing alt text for images)
- 17 Low (heading hierarchy)

MOST COMMON ISSUE:
- Missing alt text for images (found in 8 of 12 documents)
- Fix once in template = fix all future documents

COMPLIANCE BY TYPE:
- Word: 2 compliant, 3 need work
- Excel: 2 compliant, 2 need work
- PowerPoint: 0 compliant, 2 need work
- PDF: 0 compliant, 1 needs work

NEXT STEPS:
1. Fix table headers (Critical - affects readability)
2. Add alt text template to Word/Excel templates
3. Bold PowerPoint compliance (0% current)
```

### Markdown Compaction

**When:** After scanning 25+ files, with 6+ turns

**Include:**
- File count and scan coverage
- Most common accessibility issue
- Link/anchor validation status
- Auto-fixable vs human-judgment items

**Example:**
```
MARKDOWN AUDIT SUMMARY (6 turns, 35 files)

FILES SCANNED: 35
- Site documentation: 18 files (4 have issues)
- API docs: 10 files (3 have issues)
- Guides: 7 files (2 have issues)

ISSUES: 23 total
- 1 Critical (broken anchor links)
- 5 High (ambiguous link text like "click here")
- 8 Medium (missing table descriptions)
- 9 Low (emoji in headings, em-dash inconsistency)

MOST COMMON:
- Ambiguous links "read more" / "learn more" (5 instances)
- Missing table descriptions (8 tables)
- Emoji in headings (broken outline navigation)

AUTO-FIXABLE: 9 issues
- Emoji removal: 4
- Em-dash normalization: 5

HUMAN-JUDGMENT: 14 issues
- Link text improvement: 5
- Table descriptions: 8
- Anchor validation: 1

NEXT STEPS:
1. Fix broken anchor links (blocks navigation)
2. Auto-fix emoji and dashes (9 quick wins)
3. Improve ambiguous link text (user experience)
```

## When NOT to Compact

- Audit is in Phase 1-2 (still discovering issues) - premature
- Conversation is under 5 turns - not needed yet
- About to generate detailed report - better to keep full context for thoroughness
- Pre-compaction: ask agent if now is a good time

## Best Practices

### Timing

- **Good time:** After each major phase completes (Phase 2, Phase 4, Phase 6)
- **Bad time:** In the middle of Phase 1 (discovery is ongoing)
- **Indicator:** When agent mentions "context is accumulating" or similar warning

### Format

- **Be specific:** "2 Critical ARIA issues" not "some accessibility problems"
- **Include counts:** Helps agent prioritize accurately
- **Flag patterns:** Agent can plan bulk fixes better
- **Call out blockers:** Prevents wasted effort on things that are blocked

### Follow-up

After compaction, agent has the summary. You can:

```
"Remember the 2 Critical issues from the summary? Let's fix those first."
"Can you generate a batch script for the 8 auto-fixable issues?"
"What's the best order to fix the 34 issues we found?"
"Compare this audit to the previous one we did."
```

---

**See also:**
- [Web Accessibility Wizard](../agents/web-accessibility-wizard.md) - guidance per-phase
- [Document Accessibility Wizard](../agents/document-accessibility-wizard.md) - document-specific
- [Markdown Accessibility](../agents/markdown-a11y-assistant.md) - markdown audits
