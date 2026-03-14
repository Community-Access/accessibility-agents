---
name: scan-markdown
description: Single markdown file accessibility scanner. Scans across all 9 domains (links, alt, headings, tables, emoji, diagrams, anchors, em-dashes, quality). Returns structured findings.
mode: agent
agent: markdown-scanner
tools:
  - askQuestions
  - readFile
---

# Markdown Accessibility Scanner

Scan a single markdown file for accessibility issues across all 9 domains.

## File to Scan

**File:** `${input:mdFile}`

## Instructions

### Step 1: Read Markdown File

Parse file content, track line numbers.

### Step 2: Scan Domain 1 - Links

**Ambiguous link text patterns:**

- "click here", "here", "link"
- "read more", "learn more", "more info"
- "this", "this page", "this site"

**Check:**

- Link text descriptive?
- Context provides clarity?

**WCAG:** 2.4.4 Link Purpose (In Context)

### Step 3: Scan Domain 2 - Alt Text

Find all image references:

```markdown
![alt text](image.png)
```

**Check:**

- Alt text present?
- Alt text descriptive (not filename)?
- Decorative images use empty alt `![](...)`?

**WCAG:** 1.1.1 Non-text Content

### Step 4: Scan Domain 3 - Headings

**Check:**

- Heading hierarchy (H1 → H2 → H3, no skipping)
- Only one H1 per document?
- Headings descriptive?

**WCAG:** 1.3.1 Info and Relationships, 2.4.6 Headings and Labels

### Step 5: Scan Domain 4 - Tables

Find all tables:

```markdown
| Header | Header |
|--------|--------|
| Data   | Data   |
```

**Check:**

- Table description present? `<!-- Table: Description -->`
- Complex tables have caption?

**WCAG:** 1.3.1 Info and Relationships

### Step 6: Scan Domain 5 - Emoji

**Check:**

- Emoji in headings? (screen reader reads Unicode name)
- Emoji as content substitute? (no text equivalent)

**Options:**

- Remove emoji
- Translate to English `🎉` → `(celebrate)`

**WCAG:** 1.1.1 Non-text Content (text alternative)

### Step 7: Scan Domain 6 - Diagrams

Find Mermaid diagrams:

````markdown
```mermaid
graph TD
  A --> B
```
````

Find ASCII diagrams (boxes, arrows)

**Check:**

- Text alternative present?
- Diagram described in prose?

**WCAG:** 1.1.1 Non-text Content

**Suggested fix:** Provide full text description before/after diagram

### Step 8: Scan Domain 7 - Anchor Links

Find anchor references:

```markdown
[Jump to section](#section-name)
```

**Check:**

- Target heading exists?
- Anchor ID matches heading text (lowercase, dashes)?

**WCAG:** 2.4.1 Bypass Blocks (for navigation)

### Step 9: Scan Domain 8 - Em-Dashes

Find em-dashes: `—` (U+2014)

**Issue:** Some markdown parsers convert `—` incorrectly

**Fix:** Use triple-dash `---`

**WCAG:** 1.3.1 Info and Relationships (content stability)

### Step 10: Scan Domain 9 - Quality

**Check:**

- Code blocks have language identifiers?
- Lists use consistent markers?
- No trailing whitespace?

### Step 11: Return Structured Findings

```json
{
  "file": "${input:mdFile}",
  "findings": [
    {
      "domain": "links",
      "ruleId": "MD-LINK-001",
      "severity": "serious",
      "line": 42,
      "description": "Ambiguous link text: 'click here'",
      "currentValue": "[click here](https://example.com)",
      "suggestedFix": "[view the API documentation](https://example.com)",
      "autoFix": false,
      "wcag": "2.4.4"
    },
    {
      "domain": "emoji",
      "ruleId": "MD-EMOJI-001",
      "severity": "moderate",
      "line": 12,
      "description": "Emoji in heading",
      "currentValue": "# Heading with emoji 🎉",
      "suggestedFix": "# Heading without emoji (celebrate)",
      "autoFix": true,
      "wcag": "1.1.1"
    }
  ],
  "summary": {
    "critical": 0,
    "serious": 3,
    "moderate": 5,
    "minor": 2
  }
}
```

## Expected Output

- Structured JSON findings
- Per-domain scan results
- Auto-fix classification
- Ready for markdown-fixer consumption
