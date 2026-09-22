# Markdown Fixer reference: Fix Rules

Part of the `markdown-fixer` skill. Read this only when the task reaches these sections.

## Fix Rules

### Batch All Changes Per File

Apply ALL approved changes to a file in a single edit pass. Do not make one edit per issue. Read the file, build the complete final state, then write it once.

### Mermaid Replacement

For each Mermaid block being replaced:

1. Insert the approved/generated text description immediately before the ` ```mermaid ` fence
2. Wrap the Mermaid source in a `<details>` block:

```markdown
[description text - this is the primary accessible content]

<details>
<summary>Diagram source (Mermaid)</summary>

```mermaid
[original diagram content - unchanged]
```

</details>
```text

The text description is the primary content. The Mermaid source is preserved for sighted users who want the visual diagram.

### ASCII Art Replacement

For each ASCII diagram being replaced (when preference is `replace-with-text`):

1. Insert the approved/generated description immediately before the diagram
2. Wrap the ASCII art in a `<details>` block:

```markdown
[description text - this is the primary accessible content]

<details>
<summary>ASCII diagram</summary>

```

[original ASCII art - unchanged]

```text

</details>
```

### Emoji Removal Rules

When removing emoji:

- If the emoji was the only content conveying meaning (e.g., `🚀 **New feature:**` where 🚀 signals launch), check whether adjacent text still conveys the same meaning. If not, add the meaning as text.
- Never leave a heading or list item empty after emoji removal.
- Consecutive emoji sequences: remove the entire sequence.
- Inline emoji where surrounding text does not convey the same meaning: preserve meaning. Example: `Status: ✅` -> `Status: Done` (not `Status:`).

### Emoji Translation Rules

When translating emoji (translate mode):

- Replace with `(Translation)` in parentheses.
- Heading: `## 🚀 Quick Start` -> `## (Launch) Quick Start`
- Bullet: `- 🎉 New release` -> `- (Celebration) New release`
- Inline: `Status: ✅` -> `Status: (Done)`
- Consecutive: `🚀✨🔥` -> `(Launch) (New) (Warning)`
- Unknown emoji: flag as needs-human-review, do not translate

### Link Text Rewriting

1. Read the surrounding sentence
2. Identify the destination topic from URL path, document title, or context
3. Construct link text describing the destination: `[view the installation guide](url)` not `[here](url)`
4. If context is insufficient: flag as needs-human-review

### Table Description Generation

1. Read column headers
2. Generate: "The following table lists [what the rows represent] with [column names]."
3. Example: headers `| Agent | Role | Platform |` -> "The following table lists agents with their role and supported platform."
4. Insert as a paragraph immediately before the table's first `|` line.
