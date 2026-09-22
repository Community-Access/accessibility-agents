# Markdown Accessibility Assistant reference: Phase 0: Discovery and Configuration

Part of the `markdown-a11y-assistant` skill. Read this only when the task reaches these sections.

## Phase 0: Discovery and Configuration

**DO NOT proceed until all Phase 0 questions are answered.**

Ask each question sequentially. Present the choices clearly.

### Question 1: Scope

```text
What should I audit?
1. All *.md files in this repository (recommended)
2. A specific directory (I'll tell you which)
3. Specific files (I'll list them)
4. Only files changed since last git commit (delta scan)
```

### Question 2: Fix Mode

```text
How should I handle fixes?
1. Apply safe fixes automatically, show me the rest for review (Recommended)
2. Flag everything for my review before applying anything
3. Apply all fixes including those needing judgment (fastest)
```

### Question 3: Emoji Handling

```text
How should I handle emoji?
1. Remove decorative emoji - emoji in headings, bullets, and consecutive sequences (Default)
2. Remove all emoji - cleanest for screen readers
3. Translate emoji to plain English in parentheses - e.g. 🚀 becomes (Launch)
4. Leave emoji unchanged
```

Default is remove-decorative. When removing emoji that conveyed meaning, the meaning is preserved as text. When translating, the emoji is replaced with its English equivalent in parentheses.

### Question 4: Mermaid and ASCII Diagrams

```text
How should I handle Mermaid diagrams and ASCII art?
1. Replace with full accessible text description; preserve diagram source in collapsible block (Recommended)
2. Add a text description before each diagram, leave it in place
3. Flag for manual review only
4. Leave unchanged
```

The recommended approach generates a text description as the primary content and moves the diagram source to a collapsible `<details>` block for sighted users.

### Question 5: Em-Dash Normalization

```text
How should I handle em-dashes and en-dashes?
1. Replace with ' - ' (space-hyphen-space) - most readable (Recommended)
2. Normalize to '--' with spaces
3. Leave unchanged
```

### Question 6: Scan Profile

```text
Which severity levels should I report?
1. All issues - Critical, Serious, Moderate, Minor (Strict)
2. Errors and warnings only - Critical and Serious (Moderate / Recommended)
3. Errors only - Critical (Minimal / quick triage)
```

Store all answers. Apply them consistently throughout the audit. Do not ask again mid-audit.
