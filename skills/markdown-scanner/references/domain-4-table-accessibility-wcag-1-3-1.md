# Markdown Scanner reference: Domain 4: Table Accessibility (WCAG 1.3.1)

Part of the `markdown-scanner` skill. Read this only when the task reaches these sections.

## Domain 4: Table Accessibility (WCAG 1.3.1)

Find all markdown tables (lines with `|`-separated cells).

For each table, check:

1. **Missing preceding description:** No non-blank, non-heading line immediately before the table - auto-fix by generating a one-sentence summary from column headers.
2. **Empty first header cell:** `| | col2 | col3 |` - auto-fix by adding inferred header text.
3. **Layout table:** 2-column key-value display with no data relationship - flag for review.
4. **Wide table (5+ columns) without description:** Flag as Moderate even if description exists.

---

## Domain 5: Emoji (WCAG 1.3.3 / Cognitive)

Detect all emoji using Unicode ranges (U+1F600-U+1F64F, U+1F300-U+1F5FF, U+1F680-U+1F6FF, U+2600-U+26FF, U+2700-U+27BF, and extended ranges).

For each emoji, note: location (heading | bullet-first-char | consecutive-sequence | inline-body), count of consecutive emoji.

**Classification by emoji preference setting:**

- `remove-all`: Every emoji is auto-fixable.
- `remove-decorative` (default): Auto-fix emoji in headings, emoji-as-bullets, consecutive sequences (2+). Flag single inline emoji for review.
- `translate`: Auto-fix where translation is known; flag unknowns for review.
- `leave-unchanged`: Do not flag any emoji.

**Translate mode - known translations:**
🚀 Launch | ✅ Done | ⚠️ Warning | ❌ Error | 📝 Note | 💡 Tip | 🔧 Configuration | 📚 Documentation | 🎯 Goal | ✨ New | 🔍 Search | 🛠️ Tools | 👋 Hello | 🎉 Celebration | ⭐ Featured | 💬 Discussion | 🏠 Home | 📊 Data | 🔒 Security | 🌐 Web | 📦 Package | 🔗 Link | 📋 Checklist | 🏆 Achievement | ⚡ Quick | 👍 Approved | 👎 Rejected | 🐛 Bug | 🤝 Collaboration | 🎓 Learning | 🔑 Key | 📌 Pinned | ℹ️ Info | 🔄 Refresh | ➕ Add | ➖ Remove | 💻 Code | 🔔 Notification | 📣 Announcement | 🧪 Test | 🎨 Design | 🌟 Highlight | 📈 Increase | 📉 Decrease | 🏗️ Build

If translation is unknown, flag for human review.

When removing emoji that convey meaning, the meaning MUST be preserved in adjacent text.

---

## Domain 6: Mermaid and ASCII Diagrams (WCAG 1.1.1 / 1.3.1)

**Mermaid:** Detect ` ```mermaid ` fenced code blocks (may have leading whitespace).

For each Mermaid block:

1. Identify diagram type: `graph`, `sequenceDiagram`, `classDiagram`, `erDiagram`, `gantt`, `pie`, `stateDiagram`, `flowchart`, `mindmap`, `timeline`
2. Check if a text description paragraph exists immediately before the block
3. If no description: flag as Critical

When `mermaid-preference: replace-with-text`: for simple diagrams (`graph`, `flowchart`, `pie`, `gantt`), auto-generate a description draft. For complex types (`sequenceDiagram`, `classDiagram`, `erDiagram`), generate a draft and flag as needs-human-review.

**Description generation templates:**

| Type | Template |
|------|---------|
| `graph TD/LR/RL/BT` / `flowchart` | "The following [direction] diagram shows: [list nodes and connections]" |
| `sequenceDiagram` | "The following sequence diagram shows interactions between [participants]: [list messages in order]" |
| `classDiagram` | "The following class diagram shows [N] classes: [list class names, key properties, relationships]" |
| `erDiagram` | "The following entity-relationship diagram shows [entities] with these relationships: [list relationships]" |
| `gantt` | "The following Gantt chart shows project tasks: [list section names and tasks with dates]" |
| `pie` | "The following pie chart shows [title]: [list each label and value]" |
| `stateDiagram` | "The following state diagram shows [N] states: [list state names and transitions]" |
| `mindmap` | "The following mind map shows [root topic] with branches: [list branch names]" |
| `timeline` | "The following timeline shows events: [list events in chronological order]" |

**ASCII diagrams:** Detect ASCII art patterns (lines containing combinations of `+`, `-`, `|`, `>`, `<`, `^`, `v`, `*`) in non-code-block prose or in plain code blocks without a language identifier.

For each ASCII diagram:

1. If no preceding text description: flag as Critical
2. When `ascii-preference: replace-with-text`: suggest moving the ASCII art to a `<details>` block with the description as primary content

---
