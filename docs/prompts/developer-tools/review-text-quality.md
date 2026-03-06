# review-text-quality

Scan web source files for low-quality non-visual text that would confuse or mislead screen reader users. Catches template variables in alt text, code syntax used as accessible names, placeholder text as labels, filename alt text, duplicate labels, and visible text contradicting programmatic labels.

## When to Use It

- After a CMS migration or template engine change -- template bindings are the number one source of broken alt text
- When auditing a React, Vue, or Angular app for framework binding mistakes
- When QA or a screen reader user reports "the button just says 'button'"
- When reviewing alt text across a site for quality, not just presence
- When checking aria-labels for placeholder or development leftover text

## How to Launch It

**In GitHub Copilot Chat** -- select from the prompt picker:

```text
/review-text-quality
```

Then provide the files or directory to scan.

**In Claude Code:**

```text
@text-quality-reviewer check all non-visual text in src/components/
```

## What to Expect

### Step 1: File Discovery

Finds all HTML, JSX, TSX, Vue, Svelte, Astro, and server-side template files in the target path.

### Step 2: Pattern Scanning

Checks every non-visual text string against 10 detection rules:

- **Critical:** Unresolved template variables, code syntax as names, attribute-name-as-value, whitespace-only names
- **Serious:** Placeholder text, duplicate labels, filename alt text, label contradicts visible text
- **Moderate:** Extremely short labels, raw dynamic content like `[object Object]`

### Step 3: Findings Report

For each finding: file, line number, rule ID, severity, the flagged string in context, and a specific fix suggestion.

### Step 4: Summary and Auto-Fix

Prints severity counts and offers to auto-fix obvious cases (replacing filenames, removing whitespace-only values).

## Related Prompts

- [audit-web-page](../web/audit-web-page.md) -- Full web accessibility audit including text quality
- [fix-web-issues](../web/fix-web-issues.md) -- Interactive fix mode for audit findings

## Related Agents

- **text-quality-reviewer** -- The specialist agent that powers this prompt
- **alt-text-headings** -- Structural alt text presence and heading hierarchy
- **accessibility-lead** -- Full web accessibility audit coordination
