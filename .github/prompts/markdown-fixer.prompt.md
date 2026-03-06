---
name: fix-markdown-issues
description: Markdown accessibility fix applier. Handles auto-fixable issues (links, headings, emoji, em-dashes, tables, diagrams) and presents human-judgment fixes for approval.
mode: agent
agent: markdown-fixer
tools:
  - askQuestions
  - readFile
  - replaceStringInFile
  - multiReplaceStringInFile
---

# Markdown Accessibility Fixer

Apply accessibility fixes to markdown files. Auto-fix safe changes, present human-judgment items for approval.

## Audit Report

**Input:** `${input:auditFile}` (MARKDOWN-ACCESSIBILITY-AUDIT.md or audit JSON)

## Instructions

### Step 1: Load Audit Report

Parse findings from audit report:
- Auto-fix: True/False
- Category: links, headings, emoji, em-dashes, tables, diagrams, alt-text, anchors
- Line number
- Current value
- Suggested fix
- Severity

### Step 2: Group Fixes by Category

**Auto-fixable (no human judgment):**
- Em-dash normalization (`—` → `---`)
- Emoji in headings (remove or translate)
- Table description missing (insert `<!-- Table: ${description} -->`)
- Broken anchor links (correct fragment identifier)

**Human judgment required:**
- Ambiguous link text ("click here" → user provides context)
- Missing alt text (image analyzer provides suggestion, user confirms)
- Mermaid diagram replacement (provide text alternative outline)
- ASCII diagram description (summarize ASCII art)

### Step 3: Apply Auto-Fixes

Use `multiReplaceStringInFile` to batch-apply:

```javascript
const autoFixes = [
  {
    file: 'README.md',
    oldString: '# Heading with emoji 🎉',
    newString: '# Heading without emoji (celebrate)'
  },
  {
    file: 'README.md',
    oldString: 'Visit our website—learn more',
    newString: 'Visit our website---learn more'
  },
  {
    file: 'CONTRIBUTING.md',
    oldString: '| Header1 | Header2 |\n|---------|---------|',
    newString: '<!-- Table: Contribution guidelines by role -->\n| Header1 | Header2 |\n|---------|---------|'
  }
];
```

### Step 4: Present Human-Judgment Fixes

For each human-judgment fix:

```markdown
## Fix #1: Ambiguous Link Text

**File:** README.md  
**Line:** 42  
**Severity:** Serious  
**WCAG:** 2.4.4 Link Purpose (In Context)

**Current:**
```markdown
For more info, [click here](https://example.com).
```

**Context:** Paragraph about API documentation

**Suggested Fix:**
```markdown
For more info, [view the API documentation](https://example.com).
```

**Accept this fix?** (yes/no/edit)
```

If user says "edit", ask for custom text.

### Step 5: Apply Human-Approved Fixes

Once approved, apply using `replaceStringInFile` one at a time.

### Step 6: Re-Scan After Fixes

Invoke `markdown-scanner` on fixed files to verify:
- Issues resolved
- No new issues introduced
- Severity score improved

### Step 7: Generate Fix Report

Create `MARKDOWN-FIX-REPORT.md`:

```markdown
# Markdown Accessibility Fix Report

**Generated:** ${date}  
**Files Fixed:** ${fileCount}

## Auto-Fixes Applied (${autoFixCount})

### Em-dashes Normalized (${emDashCount})
- README.md: 5 instances
- CONTRIBUTING.md: 2 instances

### Emoji Removed from Headings (${emojiCount})
- README.md: Line 12 (🎉 → celebrate)
- CHANGELOG.md: Line 45 (🚀 → released)

### Table Descriptions Added (${tableCount})
- README.md: 3 tables
- CONTRIBUTING.md: 1 table

## Human-Judgment Fixes (${humanCount})

### Ambiguous Links Fixed (${linkCount})
- README.md: "click here" → "view the API documentation"
- CONTRIBUTING.md: "read more" → "read the contribution guidelines"

### Missing Alt Text Added (${altCount})
- images/screenshot.png: Added "Dashboard showing user activity graph"

## Before/After Scores

- **Before:** ${beforeScore}/100 (${beforeGrade})
- **After:** ${afterScore}/100 (${afterGrade})
- **Improvement:** +${improvement} points

## Remaining Issues

- ${remainingCount} issues still need manual review
```

## Expected Output

- Auto-fixes applied silently
- Human-judgment fixes presented for approval
- Fix report with before/after scores
- Files re-scanned for verification
