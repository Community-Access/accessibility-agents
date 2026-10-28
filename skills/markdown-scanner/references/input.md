# Markdown Scanner reference: Input

Part of the `markdown-scanner` skill. Read this only when the task reaches these sections.

## Input

You will receive a Markdown Scan Context block:

```text
## Markdown Scan Context
- **File:** [full path]
- **Scan Profile:** [strict | moderate | minimal]
- **Emoji Preference:** [remove-all | remove-decorative | translate | leave-unchanged]
- **Mermaid Preference:** [replace-with-text | flag-only | leave-unchanged]
- **ASCII Preference:** [replace-with-text | flag-only | leave-unchanged]
- **Dash Preference:** [normalize-to-hyphen | normalize-to-double-hyphen | leave-unchanged]
- **Anchor Validation:** [yes | no]
- **Fix Mode:** [auto-fix-safe | flag-all | fix-all]
- **User Notes:** [any specifics from Phase 0]
```

## Scan Process

### Step 1: Read the File

Read the full file content. Note total line count.

### Step 2: Run markdownlint

```bash
npx --yes markdownlint-cli2 "<filepath>" 2>&1 || true
```

Collect all linter output. Map each rule violation to its accessibility domain:

| Rule | Domain |
|------|--------|
| MD001 | Heading hierarchy |
| MD022 | Heading hierarchy |
| MD023 | Heading hierarchy |
| MD025 | Heading hierarchy |
| MD034 | Descriptive links |
| MD041 | Heading hierarchy |
| MD045 | Alt text |
| MD055 | Table accessibility |
| MD056 | Table accessibility |

### Step 3: Scan All 9 Domains

Work through each domain. For each issue found, record: line number, severity, domain, current content, suggested fix, and auto-fix classification.

---

## Domain 1: Descriptive Links (WCAG 2.4.4)

Scan for all `[text](url)` links and bare URLs.

**Ambiguous text patterns (exact match, case-insensitive):**
`here`, `click here`, `read more`, `learn more`, `more`, `more info`, `link`, `details`, `info`, `go`, `see more`, `continue`, `start`, `download`, `view`, `open`, `submit`, `this`, `that`

**Starts-with patterns:** `click here to`, `read more about`, `learn more about`, `here to`, `see more`

**Bare URL pattern:** Link text matches `https?://` or `www\.`

**Repeated identical text:** Multiple `[X](url1)` ... `[X](url2)` with same text but different URLs on same page.

**Auto-fix:** Yes - rewrite using surrounding sentence context.

**Never flag:**

- Badge links: `[![text](img)](url)` at top of README
- Section self-references using the section name as text
- Links inside code blocks or front matter

**Resource type indicators:** Flag links to `.pdf`, `.zip`, `.docx` not mentioning file type in text.

---
