---
name: review-links
description: Ambiguous link text checker. Detects vague link text like "click here", "read more", "here", "link". Enforces WCAG 2.4.4 Link Purpose.
mode: agent
agent: link-checker
tools:
  - askQuestions
  - readFile
  - editFiles
  - grepSearch
---

# Link Text Review

Review hyperlinks for ambiguous or non-descriptive link text that violates WCAG 2.4.4 (Link Purpose in Context).

## Files to Review

**Path:** `${input:files}`

## Instructions

### Step 1: Gather Context

Ask the user:

1. **Content type** -- Documentation, blog, marketing page, web app?
2. **Link count** -- Few links or link-heavy content?
3. **Known issues** -- Screen reader users report confusion?

### Step 2: Find All Links

Search for link elements:

- HTML: `<a href="...">`
- React/JSX: `<Link to="...">`, `<a href="...">`
- Markdown: `[text](url)`

### Step 3: Check for Ambiguous Text

Flag these patterns:

**Always ambiguous:**

- "click here"
- "read more"
- "learn more"
- "here"
- "link"
- "more info"
- "more"
- "details"
- "this page"
- "this link"

**Context-dependent (review manually):**

- "download" (needs file type/name)
- "view" (needs what's being viewed)
- "see" (needs destination)
- URLs as link text (long URLs not descriptive)

### Step 4: Check Link Context

WCAG 2.4.4 allows context from:

- Same sentence
- Same paragraph
- Same list item
- Same table cell
- Programmatically associated (aria-labelledby, aria-describedby)

**Example pass:**
"For more information about WCAG, [click here]."
→ Context: "about WCAG" in same sentence

**Example fail:**
"Want to know more? [Click here]."
→ No meaningful context given

### Step 5: Provide Remediation

For each ambiguous link:

- Current text
- Context (if any)
- Suggested rewrite
- WCAG 2.4.4 reference

**Rewrite strategies:**

- Make link text self-descriptive: "Read WCAG 2.2 Guidelines"
- Include destination: "Download PDF (2.5 MB)"
- Add hidden text: `<span class="sr-only">about WCAG</span>`
- Use aria-label: `aria-label="Read more about WCAG compliance"`

## Expected Output

- List of all links found
- Ambiguous link text flagged
- Context-based pass/fail assessment
- Rewrite suggestions
- Code examples with framework-specific patterns
