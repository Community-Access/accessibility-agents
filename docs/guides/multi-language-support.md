# Multi-Language Support

Guide for translating A11y Agent Team instructions and documentation into languages beyond English.

## Architecture

Agent files use a locale-suffix convention. The English original is the canonical version; translations are suffixed copies:

```text
.github/agents/
  accessibility-lead.agent.md          ← English (canonical)
  accessibility-lead.agent.es.md       ← Spanish
  accessibility-lead.agent.ja.md       ← Japanese
  accessibility-lead.agent.de.md       ← German
```

Copilot and Claude Code load the unsuffixed (English) version by default. Users install translations by renaming the translated file to replace the canonical version.

## Translation Scope

### Tier 1 — Translate First

These files contain user-facing text that agents display directly:

| File Type | Count | Priority |
|-----------|-------|----------|
| Prompt files (`.github/prompts/*.prompt.md`) | ~20 | High — users read these directly |
| Wizard agent instructions (accessibility-lead, web-accessibility-wizard, document-accessibility-wizard) | 3 | High — primary user-facing agents |
| Training scenario prompt | 1 | High — educational content must be localized |

### Tier 2 — Translate Next

These files guide agent behavior but are less directly visible:

| File Type | Count | Priority |
|-----------|-------|----------|
| Specialist agent instructions | ~20 | Medium — affects output quality |
| Getting started guide | 1 | Medium — onboarding documentation |
| Configuration guide | 1 | Medium — setup documentation |

### Tier 3 — Translate Last

Reference data that is largely language-independent:

| File Type | Count | Priority |
|-----------|-------|----------|
| Skill reference tables | ~18 | Low — WCAG criteria codes are universal |
| MCP server tool descriptions | ~20 | Low — programmatic interface |
| CI/CD templates | ~5 | Low — code is language-independent |

## Translation Workflow

1. **Copy** the English file with a locale suffix: `cp foo.agent.md foo.agent.es.md`
2. **Translate** the markdown prose. Preserve:
   - YAML frontmatter keys (translate only `description` values)
   - Tool names (always English — platform requirement)
   - WCAG criterion codes (e.g., `1.4.3`, `SC 2.4.7`)
   - Code blocks and examples
   - Markdown structure (headings, tables, lists)
3. **Review** with a native speaker or translation service
4. **Install** by replacing the canonical file or using platform-specific discovery

## Locale Codes

Use BCP 47 language subtags:

| Code | Language |
|------|----------|
| `es` | Spanish |
| `ja` | Japanese |
| `de` | German |
| `fr` | French |
| `pt` | Portuguese |
| `ko` | Korean |
| `zh` | Chinese (Simplified) |
| `ar` | Arabic |

## Preserving Consistency

- **WCAG references** — Never translate criterion numbers. Write `SC 1.4.3 Contrast (Minimum)` in all languages.
- **Tool names** — Must stay in English. Both Copilot and Claude Code match tools by exact name.
- **Severity labels** — Use English severity labels (`Critical`, `Serious`, `Moderate`, `Minor`) alongside translations for interoperability with report parsing.
- **Code examples** — Keep code in English. Variable names and comments may be translated if the audience expects it.

## Contributing Translations

1. Open an issue with the label `translation` and the target language
2. Fork the repository and create a branch: `i18n/es`, `i18n/ja`, etc.
3. Translate files following the workflow above
4. Submit a pull request — the PR review will check for preserved structure and untranslated technical terms
