# Context Management for Long Accessibility Audits

## Authoritative References

This guide reflects VS Code/Copilot chat session behavior documented in official sources.

References:

- VS Code updates and release notes: `https://code.visualstudio.com/updates`
- Copilot customization and chat docs: `https://code.visualstudio.com/docs/copilot/customization/overview`

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

```yaml
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

```text
PATTERNS DETECTED:
- Interactive components lack ARIA labels (recurring)
- Images in CMS missing alt text template (systemic)
- Focus management broken in navigation menu (template issue)
```

### 3. Next Steps (Remediation Priorities)

Top 3 things to tackle, and any blockers:

```yaml
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

## Forking Sessions (VS Code 1.110+)

**When to fork:** Explore alternative approaches without losing your current work.

### Use the `/fork` Command

Type `/fork` in the chat to create an independent branch of the conversation that inherits all context but diverges from that point forward.

**Accessibility Audit Use Cases:**

- **Try different remediation strategies:** Fork after Phase 6 to explore different fix approaches
- **Side questions during audit:** Fork to investigate a specific pattern without derailing the main audit
- **A/B testing fixes:** Fork to test two different ARIA patterns, compare results
- **Parallel work:** Fork to have one session fixing Critical issues while another addresses High issues

### Per-Checkpoint Forking

Hover over any message in the chat history → click "Fork Conversation" to branch from that specific point.

**Example:** Audit completed in main session. Fork from the "Findings Summary" message to explore Modal fixes in one fork and Form fixes in another.

### Forking Best Practices

- **Name your forks** - Rename sessions to track which is which ("Web Audit - Modal Fixes", "Web Audit - Form Fixes")
- **Consolidate later** - After exploring, return to main session with insights from forks
- **Use for risk reduction** - Try a complex ARIA pattern in a fork before applying to production code
- **Document branches** - Note what you tried in each fork for future reference

## Inline Chat Session Continuity (VS Code 1.110+)

**What Changed:** Inline chat now always queues into the existing session instead of making isolated changes.

**What This Means for Accessibility:**

- Inline fixes maintain full audit context from the main chat session
- Agent remembers findings from comprehensive accessibility review
- Follow-up fixes reference previous WCAG violations and remediation priorities
- No need to re-explain context when making iterative fixes

**Example Workflow:**

1. Run full accessibility audit in main chat → agent identifies 15 accessibility issues
2. Agent prioritizes fixes: Critical → High → Medium → Low
3. Use inline chat (Ctrl/Cmd + I) in a component file → agent remembers this is a "High" priority fix from the audit
4. Agent applies fix with full context: "Fixing alt text issue #7 from audit (High severity - WCAG 1.1.1)"
5. Continue using inline chat for all fixes → each one references the audit report

**Best Practice:**

- Complete accessibility audit first (web-accessibility-wizard, document-accessibility-wizard, or markdown-a11y-assistant)
- Use inline chat for all subsequent fixes within the same session
- Agent will correlate inline edits with audit findings automatically

**Terminal Tool Calls are Collapsible (VS Code 1.110+)**

When agents run terminal commands (document scanning, axe-core scans, GitHub CLI calls), the output now appears in collapsible sections to reduce visual noise.

**What to Expect:**

- Commands appear collapsed by default
- Click to expand and see full output if needed
- Useful for commands with long output (file lists, scan results, API responses)

**When to Expand:**

- Troubleshooting failed commands
- Verifying which files were scanned
- Checking exact CLI output for unexpected behavior
- Copying output for external tools or reports

**Agents That Use Terminal Commands:**

- `document-accessibility-wizard` - PowerShell/Bash file discovery
- `web-accessibility-wizard` - `npx @axe-core/cli` scans
- `github-hub`, `daily-briefing`, `pr-review`, `issue-tracker` - `gh` CLI commands
- `repo-manager` - Repository setup commands
- `developer-hub` - Python packaging, wxPython builds, desktop testing

## Examples by Audit Type

### Web Audit Compaction

**When:** After phase 6 (Remediation Prioritization), with 8+ conversation turns

**Include:**

- Breakdown of issues by page
- Which pages have Critical/High issues
- Framework-specific patterns (React hooks issues, Vue template patterns, etc.)
- Top 3 pages to fix first

**Example:**

```yaml
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

```yaml
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

```yaml
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

```python
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
