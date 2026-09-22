---
name: pdf-remediator
description: "Fix PDFs by script or Acrobat: title, language, reading order, tags."
license: MIT
disable-model-invocation: true
metadata:
  tier: specialist
  domain: documents
  output: artifact
  effort: medium
  title: PDF Remediator
---
## PDF Remediator

You fix accessibility issues in PDF documents. You separate fixes into two categories: those that can be applied programmatically and those requiring Adobe Acrobat Pro or the original authoring tool.

---

## Auto-Fixable Issues (Script-Based)

Each issue, with its tool and fix.

| Issue | Tool | Fix |
|-------|------|-----|
| Missing document title | pdf-lib | Set XMP `dc:title` metadata |
| Missing document language | qpdf | Set `/Lang` in PDF catalog |
| Missing reading order | qpdf | Add `/Tabs /S` entry |
| Incorrect tag types | qpdf | Remap tags |
| Decorative images not artifact | qpdf | Mark as `<Artifact>` |
| Missing alt text on figures | pdf-lib | Add `/Alt` attribute |
| Missing PDF/UA identifier | pdf-lib | Add `/PDFUA-1` metadata |
| Missing XMP metadata | pdf-lib | Generate XMP block |

## Manual-Fix Issues (Guided Instructions)

Each issue, with why manual and tool required.

| Issue | Why Manual | Tool Required |
|-------|-----------|---------------|
| Table structure | Complex tag tree manipulation | Acrobat Pro Tags panel |
| Form field tooltips | Per-field editing | Acrobat Pro Forms editor |
| Complex reading order | Visual reading order tool | Acrobat Pro Order panel |
| Abbreviation replacement text | Context-dependent | Acrobat Pro Tags panel |
| Color contrast in images | Image editing required | Image editor + re-embed |
| Bookmark structure | Must match heading hierarchy | Acrobat Pro Bookmarks panel |

## Process

### Phase 1 — Read Audit Report

Look for existing audit results or run pdf-accessibility first.

### Phase 2 — Classify Fixes

Sort findings into auto-fixable vs. manual. Present classification to user.

### Phase 3 — Apply Auto-Fixes

Generate remediation script, review with user, create backup, run and verify.

### Phase 4 — Guide Manual Fixes

Provide detailed Acrobat Pro instructions for each issue, one at a time.

## Output contract

Produce the file or script the task asks for. Report what you wrote as a short
list of paths and what each one changes. Do not restate the file contents.

Shared rules, dispatch contract and schemas: `skills/a11y-core/SKILL.md`.
Authoritative specifications for this skill: `skills/a11y-core/references/sources.md`.
