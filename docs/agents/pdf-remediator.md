# pdf-remediator - PDF Accessibility Remediator

> Extends the PDF audit workflow with actual fix capability. Generates scripts for programmatic fixes via pdf-lib, qpdf, and ghostscript, and provides step-by-step Adobe Acrobat Pro instructions for manual fixes that require visual editing.

## When to Use It

- After running `pdf-accessibility` and receiving an audit report with findings
- When you need to batch-fix common PDF accessibility issues (title, language, tags)
- When you need guided Acrobat Pro instructions for complex fixes (table structure, forms)
- Before re-publishing PDFs that failed accessibility compliance checks

## Fix Categories

<details>
<summary>Expand - Auto-fixable issues (8 types)</summary>

| Issue | Tool | Fix |
|-------|------|-----|
| Missing document title | pdf-lib | Set XMP `dc:title` metadata |
| Missing document language | qpdf | Set `/Lang` in PDF catalog |
| Missing reading order | qpdf | Add `/Tabs /S` entry to page dictionaries |
| Incorrect tag types | qpdf | Remap `<P>` to `<H1>`-`<H6>` |
| Decorative images not artifact | qpdf | Mark as `<Artifact>` |
| Missing alt text on figures | pdf-lib | Add `/Alt` attribute to figure tags |
| Missing PDF/UA identifier | pdf-lib | Add `/PDFUA-1` metadata entry |
| Missing XMP metadata | pdf-lib | Generate XMP metadata block |

</details>

<details>
<summary>Expand - Manual-fix issues (6 types)</summary>

| Issue | Why Manual | Tool Required |
|-------|-----------|---------------|
| Table structure (rows, headers, scope) | Complex tag tree manipulation | Acrobat Pro Tags panel |
| Form field tooltips (`TU` attribute) | Per-field interactive editing | Acrobat Pro Forms editor |
| Complex multi-column reading order | Visual reading order tool | Acrobat Pro Order panel |
| Replacement text for abbreviations | Context-dependent text | Acrobat Pro Tags panel |
| Color contrast in embedded images | Image editing required | Image editor + re-embed |
| Bookmark structure | Must match heading hierarchy | Acrobat Pro Bookmarks panel |

</details>

## Process

1. **Read audit report** — looks for existing `DOCUMENT-ACCESSIBILITY-AUDIT.md`
2. **Classify fixes** — separates findings into auto-fixable vs. manual
3. **Generate scripts** — creates a shell script for programmatic fixes
4. **Guide manual fixes** — provides step-by-step Acrobat Pro instructions
5. **Verify** — recommends re-running the PDF accessibility audit

## Handoffs

| Target | When |
|--------|------|
| `pdf-accessibility` | Run a full audit before attempting remediation |
| `accessibility-lead` | Run veraPDF PDF/UA validation |

## Sample Usage

```text
@pdf-remediator Fix the accessibility issues in report.pdf — set the title, 
add language, and guide me through fixing the table structure.
```

## Required Tools

- `read`, `search`, `edit`, `runInTerminal`, `askQuestions`
- External: pdf-lib (npm), qpdf (CLI), Adobe Acrobat Pro (for manual fixes)

## API Scopes

No GitHub API access required. Operates on local files only.
