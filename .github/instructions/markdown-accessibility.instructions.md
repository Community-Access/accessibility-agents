---
description: Markdown accessibility guidelines - comprehensive rules for inclusive documentation. Covers links, alt text, headings, tables, emoji (remove or translate), Mermaid/ASCII diagrams (replace with accessible text alternatives), em-dashes, and anchor link validation.
applyTo: "**/*.md"
---

## Dependencies

No other instruction files are required. This file is self-contained for markdown accessibility.

**Skill file:** For the full pattern library, emoji translation maps, Mermaid templates, and severity scoring formula, load the `markdown-accessibility` skill.

# Markdown Accessibility Review Guidelines

## Repository Hard Rule: No Emoji

> **Impact:** Screen readers announce the full Unicode name of every emoji character ("face with tears of joy"), which makes sentences with multiple emoji completely unintelligible.

- Emoji characters are prohibited in repository markdown content.
- Always remove emoji from headings, bullets, prose, tables, callouts, and summaries.
- Do not translate emoji to parenthesized terms; remove emoji and keep plain-text meaning.
- This rule applies to release notes, changelog entries, docs, prompts, instructions, and generated markdown output.

When reviewing or generating markdown files, check for all of the following accessibility issues. Flag violations and suggest fixes with clear explanations of the accessibility impact. These rules extend GitHub's [5 tips for making your GitHub profile page accessible](https://github.blog/developer-skills/github/5-tips-for-making-your-github-profile-page-accessible/) with table, diagram, typographic, and anchor-link rules.

**For guided interactive audits**, use the `markdown-a11y-assistant` agent which orchestrates `markdown-scanner` and `markdown-fixer` sub-agents with parallel scanning and a full review gate.

> **Impact:** Screen reader users navigate links from a links list with no surrounding context. "Click here" in that list tells them nothing about the destination.

## 1. Descriptive Links (WCAG 2.4.4)

- Flag generic link text: "click here," "here," "this," "read more," "learn more," "link," "view," "see more," "more."
- Link text must make sense when read out of context - assistive technology presents links as an isolated list.
- Flag multiple links on the same page with identical text pointing to different destinations.
- Bare URLs in prose must be converted to descriptive links.
- Do not flag: badge image links, section anchor links using the section name, or links inside code blocks.

Bad: `Read my blog post [here](https://example.com)`
Good: `Read my blog post "[Crafting an accessible resume](https://example.com)"`

**3-question self-test for link text:**

1. Does this text make sense read aloud with no surrounding context?
2. If the page had 20 links, would this text distinguish this one from the others?
3. Does the text describe the destination or action, not the act of clicking?

If any answer is No, rewrite the link text.

> **Impact:** Screen readers announce "image" followed by the filename when alt text is missing. A filename like "img_1234.jpg" is meaningless to a blind user viewing a meaningful diagram or screenshot.

## 2. Image Alt Text (WCAG 1.1.1)

- Flag images with empty alt text (`![]()`) unless they are explicitly decorative.
- Flag alt text that is a filename (e.g., `img_1234.jpg`) or generic placeholder (`screenshot`, `image`, `photo`).
- Alt text should be succinct and descriptive. Include any text visible in the image.
- Use "screenshot of" where relevant; do not prefix with "image of" as screen readers announce that automatically.
- For complex images (charts, infographics): flag and suggest a `<details>` block with a data summary.
- Always present alt text improvements as recommendations for the author to review - never auto-apply.

| DO | DON'T |
|---|---|
| `![Bar chart showing Q1 sales up 23% year over year](chart.png)` | `![chart](chart.png)` |
| `![Company logo](logo.png)` | `![image001.jpg](logo.png)` |
| `![](decorative-divider.png)` (empty alt = decorative) | `![decorative divider](decorative-divider.png)` |
| `![Screenshot of the Settings Privacy page](screenshot.png)` | `![screenshot](screenshot.png)` |

> **Impact:** Screen reader users navigate by heading level. Skipped levels create gaps in the outline — users assume content is missing. Bold text used as a heading cannot be navigated at all.

## 3. Heading Hierarchy (WCAG 1.3.1 / 2.4.6)

- One H1 (`#`) per document, used as the page title.
- Never skip heading levels: `##` followed by `####` is a violation.
- Flag bold text (`**text**`) used as a visual substitute for a heading.
- Documents with no H1 should have the first major heading promoted.

> **Impact:** Tables without descriptions leave screen reader users wondering what the data represents before they navigate into the cells.

## 4. Table Accessibility (WCAG 1.3.1)

- Tables without a preceding description or caption are an accessibility gap. Add a one-sentence summary immediately before the table.
- Flag tables where the first column acts as row headers but is not visually distinguishable - suggest bolding first-column cells or restructuring as a definition list.
- Flag tables with more than 6 columns or significant merged-cell complexity - suggest splitting or using a list.
- Tables used for layout (not data) must be replaced with CSS-equivalent structure (lists, paragraphs).
- Do not use `|` pipe characters to create decorative separators outside of table syntax.

Example - add a table summary:

```markdown
The following table lists agents with their role and supported platform.

| Agent | Role | Platform |
|-------|------|----------|
```

## 5. Emoji (WCAG 1.3.3 / Cognitive)

> **Impact:** Screen readers read full emoji names aloud ("face with stuck-out tongue and squinting eyes"). Emoji as bullets break list semantics and interrupt the reading flow.

Screen readers read full emoji names aloud ("face with stuck-out tongue and squinting eyes"). Emoji as bullets break list semantics.

Required behavior (mode: `remove-all`):

- Flag any emoji occurrence and remove it.
- Preserve meaning in plain text where needed.
- Never keep emoji in final markdown output.

`remove-all` mode is active for this repository. The `markdown-accessibility` skill supports additional modes (`remove-decorative`, `translate`, `leave-unchanged`) — see the skill file for details — but they are disabled here by this instruction file.

## 6. Mermaid and ASCII Diagrams (WCAG 1.1.1 / 1.3.1)

> **Impact:** Mermaid diagrams and ASCII art are entirely invisible to screen reader users — they hear nothing or a jumble of punctuation characters. The `<details>` pattern preserves the visual diagram for sighted users while exposing the text description to AT.

Both Mermaid diagrams and ASCII art render without accessible text alternatives for screen reader users.

**Mermaid diagrams:**

- Flag every ` ```mermaid ` block that does not have a text description immediately before it.
- For replacement: add a text description, then wrap the original Mermaid source in `<details>` so sighted users retain the visual:

```markdown
The following diagram shows a linear flow: Start leads to Process, then to End.

<details>
<summary>Diagram source (Mermaid)</summary>

```mermaid
graph TD
    A[Start] --> B[Process] --> C[End]
```text

</details>
```

- Simple diagrams (`graph`, `flowchart`, `pie`, `gantt`): auto-generate a description from node labels and connections.
- Complex diagrams (`sequenceDiagram`, `classDiagram`, `erDiagram`): generate a draft description and ask the author to verify accuracy before applying.

**ASCII art diagrams:**

- Flag any ASCII art block (combinations of `+`, `-`, `|`, `>`, `<`, `^`, `v`, `*` forming a visual structure) without a preceding text description.
- For replacement: add a text description (author must provide or approve), then move the ASCII art into a `<details>` block to preserve it for sighted users.
- Never silently remove ASCII art - always preserve it in the collapsed `<details>` block.

## 7. Em-Dash and En-Dash Normalization (Cognitive / Readability)

> **Impact:** Em-dashes are read by screen readers inconsistently — NVDA reads them as "dash", JAWS skips them silently, VoiceOver reads "em dash". The result is that sentence flow breaks unpredictably.

- Em-dashes (`—`, `--` used as em-dash, or `---` in prose) are read inconsistently by screen readers.
- Recommended fix: replace with ` - ` (space-hyphen-space) in prose.
- Never modify: content inside code blocks or inline code, YAML front matter, HTML comments, or standalone `---` horizontal rules.

Before: `The process takes 2--4 hours—depending on configuration.`
After: `The process takes 2 - 4 hours - depending on configuration.`

## 8. Anchor Link Validation (WCAG 2.4.4)

> **Impact:** Broken anchor links silently drop users at the top of the page with no error message. Screen reader users expect `[text](#section)` links to navigate them within the document and cannot know why the link did nothing.

- Broken anchor links (`[text](#nonexistent-section)`) silently fail - users are dropped at top of page with no error.
- Validate all `[text](#anchor)` links against headings in the same file.
- GitHub anchor generation rules: lowercase everything, replace spaces with hyphens, remove all non-alphanumeric characters except hyphens.
  - `## My Heading` -> `#my-heading`
  - `## API: v2.0` -> `#api-v20`
  - `## What's New?` -> `#whats-new`
- Flag mismatches with a suggested correction. Do not auto-fix without confirming which end (link or heading) should change.
- Cross-file anchors (`[text](./other.md#section)`) require manual verification - flag with a note.
- Headings containing emoji produce unstable anchors - flag those too.

## Review Priority

When multiple issues exist, prioritize in this order:

1. Missing or empty alt text on images
2. Mermaid diagrams with no text alternative
3. Broken anchor links
4. Skipped heading levels or missing H1
5. Non-descriptive link text (ambiguous links)
6. Tables without descriptions
7. Emoji used as bullets or in headings
8. Em-dash / en-dash normalization
9. Plain language improvements

## Review Tone

- Explain the accessibility impact of each issue, specifying which users are affected (screen reader users, people with cognitive disabilities, keyboard-only users, non-native speakers).
- Do not remove personality or voice from the writing. Accessibility and engaging content are not mutually exclusive.
- Keep suggestions actionable and specific.
- Never use emoji in your own summaries or explanations.
- Follow proper heading hierarchy in all output (start at h2, increment logically).
