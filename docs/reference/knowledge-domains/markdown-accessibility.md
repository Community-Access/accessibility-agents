# markdown-accessibility Skill

> Domain-specific knowledge module for Markdown accessibility auditing. Covers the 9 accessibility domains, severity scoring formula (0-100 with A-F grades), emoji handling modes (remove-all, remove-decorative, translate, leave-unchanged), emoji translation map, Mermaid and ASCII diagram replacement templates, ambiguous link pattern library, anchor validation rules, and em-dash normalization. Used by all three markdown accessibility agents.

## Agents That Use This Skill

Each agent, with its why.

| Agent | Why |
|-------|-----|
| [markdown-a11y-assistant](../skills/markdown-a11y-assistant.md) | Phase flow, scoring aggregation, review gate logic |
| [markdown-scanner](../skills/markdown-scanner.md) | Per-domain issue detection and classification |
| [markdown-fixer](../skills/markdown-fixer.md) | Fix rules, diagram replacement templates, emoji translation |

## The 9 Accessibility Domains

Each row, with its #, domain, WCAG and severities.

| # | Domain | WCAG | Severities |
|---|--------|------|------------|
| 1 | Ambiguous link text | 2.4.4 | Serious (known patterns), Moderate (context-dependent) |
| 2 | Missing / poor alt text | 1.1.1 | Critical (missing), Serious (filename as alt), Moderate (quality) |
| 3 | Heading structure | 1.3.1 | Critical (multiple H1), Serious (level skip), Moderate (duplicate text) |
| 4 | Table descriptions | 1.3.1 | Serious (no description), Moderate (vague description) |
| 5 | Emoji | 1.3.3 | Serious (in heading), Moderate (consecutive / bullets) |
| 6 | Mermaid and ASCII diagrams | 1.1.1 | Critical (no description at all), Serious (description present but vague) |
| 7 | Em-dash and en-dash | Cognitive | Minor (` — ` with spaces), Moderate (`—` without spaces) |
| 8 | Anchor links | 2.4.4 | Serious (target heading not found), Minor (case mismatch only) |
| 9 | Plain language | Cognitive | Minor (warning only - informational) |

## Severity Scoring Formula

The score and grade in a rendered markdown report come from
`skills/a11y-core/scripts/merge-findings.mjs`, which `render-report.mjs` runs;
where this page and the script differ, the script decides.

```text
penalty = sum over findings of severity_weight x confidence_factor
          (weights: critical 10, serious 5, moderate 2, minor 1;
           confidence: high 1.0, medium 0.7, low 0.4)
checks  = max(number of findings + number of passed checks, 10)
score   = max(0, round(100 - (penalty / checks) x 20))
```

### Grade Table

Each score band, with its grade.

| Score | Grade |
|-------|-------|
| 90-100 | A |
| 80-89 | B |
| 70-79 | C |
| 60-69 | D |
| 0-59 | F |

## Emoji Handling Modes

Each mode, with behavior and when to use.

| Mode | Behavior | When to Use |
|------|----------|------------|
| `remove-all` | Remove every emoji character from the file | Maximum compatibility, plain text output |
| `remove-decorative` | Remove emoji that carry no meaning; keep only those that are sole content | **Default** |
| `translate` | Replace each emoji with its English equivalent in parentheses | When the emoji conveys meaning the reader should understand |
| `leave-unchanged` | No emoji changes | Audit-only pass; user will address manually |

### Emoji Translation Map (selected entries)

Each emoji, with its translation, emoji and translation. The emoji in this table are deliberate examples of input the fixer recognises; they are data, not a style to copy, and this project's own prose uses none.

| Emoji | Translation | Emoji | Translation |
|-------|------------|-------|------------|
| 🚀 | (Launch) | ✅ | (Done) |
| ❌ | (Error) | ⚠️ | (Warning) |
| 📝 | (Note) | 💡 | (Tip) |
| 🔧 | (Configuration) | 📋 | (Prerequisites) |
| 🎉 | (Celebration) | 🔒 | (Security) |
| 📦 | (Package) | 🌐 | (Web) |
| 🗂️ | (Files) | 🧪 | (Testing) |
| 🐛 | (Bug) | ✨ | (New) |
| 📄 | (Document) | 📊 | (Chart) |
| ⬆️ | (Upgrade) | ⬇️ | (Download) |
| ℹ️ | (Info) | 🔗 | (Link) |
| 🏷️ | (Label) | 🧩 | (Component) |
| 🎯 | (Target) | 🔍 | (Search) |
| 💬 | (Comment) | 🔑 | (Key) |

### Emoji Detection

Emoji appear in Unicode ranges:

- `U+1F600` to `U+1F64F` Emoticons
- `U+1F300` to `U+1F5FF` Misc Symbols and Pictographs
- `U+1F680` to `U+1F6FF` Transport and Map
- `U+1F700` to `U+1F77F` Alchemical Symbols
- `U+2600` to `U+26FF` Misc Symbols
- `U+2700` to `U+27BF` Dingbats
- `U+FE00` to `U+FE0F` Variation Selectors

## Ambiguous Link Patterns

### High-confidence ambiguous (always flag as Serious)

```text
click here | here | this | read more | learn more | see more | more
more details | more info | details | continue | go | visit | view
link | click | tap | open | see | check out | find out
```

### Bare URL patterns (flag as Serious)

```regex
\[https?://[^\]]+\]
\]\(https?://[^\)]+\)  # where display text equals URL
```

### Context-dependent (flag as Moderate)

```text
documentation | guide | article | page | post | info | instructions
download | file | resource | example | demo | source
```

## Mermaid Replacement Template

When replacing a Mermaid block, the description comes first as primary content:

```markdown
[Text description: describe the entities (nodes/boxes) and their relationships (edges/arrows). For flowcharts: start point, decisions, branches, and end states. For sequence diagrams: actors, messages, and order. For entity diagrams: entities, attributes, and relationships.]

<details>
<summary>Diagram source (Mermaid)</summary>

```mermaid
[original diagram code preserved verbatim]
```

</details>
```

**Simple diagrams (3 or fewer nodes):** Generate description automatically.  
**Complex diagrams:** Generate draft description and mark `<!-- REVIEW: verify diagram description accuracy -->`.

## ASCII Diagram Replacement Template

```markdown
[Text description: describe what the ASCII art depicts - layout, flow, hierarchy, or data relationships in plain language.]

<details>
<summary>ASCII diagram</summary>

```

[original ASCII art preserved verbatim]

```html

</details>
```

**ASCII detection pattern:** Blocks of 3+ consecutive lines using `+`, `-`, `|`, `=`, `/`, `\`, `>`, `<`, `^`, `v` characters forming shapes or flow indicators.

## Anchor Validation Rules

1. Extract all `[text](#anchor)` links from the file
2. Extract all heading text and compute their GitHub-flavored Markdown anchors:
   - Lowercase all characters
   - Replace spaces with hyphens
   - Remove characters that are not alphanumeric, hyphens, or underscores
   - Strip emoji characters before computing (emoji-containing headings produce unreliable anchors)
3. Flag each link whose `#anchor` does not match any computed heading anchor
4. Severity: **Serious** if the anchor does not exist at all; **Minor** if only a case mismatch

## Em-Dash Normalization Rules

Each pattern, with its severity and fix.

| Pattern | Severity | Fix |
|---------|----------|-----|
| `word—word` (no spaces) | Moderate | Replace with ` - ` |
| `word –word` (asymmetric) | Moderate | Replace with ` - ` |
| ` — ` (with spaces) | Minor | Replace with ` - ` |
| `--` double hyphen | Minor | Replace with ` - ` |

Screen readers announce `—` as "dash" or skip it entirely when no surrounding spaces exist, causing adjacent words to be read as one concatenated word.
