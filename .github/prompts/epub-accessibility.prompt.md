---
name: audit-epub
description: ePub document accessibility specialist. Scans and remediates .epub files. Covers EPUB Accessibility 1.1 (WCAG 2.x), reading order, navigation, accessibility metadata.
mode: agent
agent: epub-accessibility
tools:
  - askQuestions
  - readFile
  - runInTerminal
  - getTerminalOutput
  - listDirectory
---

# ePub Accessibility Audit

Audit ePub documents for EPUB Accessibility 1.1 conformance (WCAG 2.x compliance) and best practices.

## ePub to Audit

**File:** `${input:epubFile}`

## Instructions

### Step 1: Extract ePub

```bash
# ePub is a ZIP archive
unzip ${input:epubFile} -d epub-contents/
```

### Step 2: Check Accessibility Metadata

**Rule:** EPUB-001  
**Standard:** EPUB Accessibility 1.1

Check `content.opf` for schema.org accessibility metadata:

```xml
<metadata>
  <meta property="schema:accessibilityFeature">structuralNavigation</meta>
  <meta property="schema:accessibilityFeature">tableOfContents</meta>
  <meta property="schema:accessibilityHazard">none</meta>
  <meta property="schema:accessModeSufficient">textual</meta>
  <meta property="schema:accessibilitySummary">This publication conforms to WCAG 2.1 AA.</meta>
</metadata>
```

### Step 3: Check Reading Order

**Rule:** EPUB-002  
**WCAG:** 1.3.2 Meaningful Sequence

Check `content.opf` spine order matches logical reading order:

```xml
<spine>
  <itemref idref="cover" />
  <itemref idref="toc" />
  <itemref idref="chapter1" />
  <itemref idref="chapter2" />
</spine>
```

### Step 4: Check Navigation Document

**Rule:** EPUB-003  
**Standard:** EPUB 3.x navigation document

Must have `nav.xhtml` with:

- `<nav epub:type="toc">` (table of contents)
- `<nav epub:type="landmarks">` (major sections)

```html
<nav epub:type="toc">
  <h1>Table of Contents</h1>
  <ol>
    <li><a href="chapter1.xhtml">Chapter 1</a></li>
  </ol>
</nav>
```

### Step 5: Check Content Documents

**Rule:** EPUB-004  
**WCAG:** 1.3.1 Info and Relationships, 1.1.1 Non-text Content

For each XHTML file:

- Proper heading structure (H1-H6)
- Alt text on images
- Table headers (`<th scope="col">`)
- Language set (`<html lang="en">`)

### Step 6: Check Language

**Rule:** EPUB-005  
**WCAG:** 3.1.1 Language of Page

Each content document must have:

```html
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
```

### Step 7: Run epubcheck

```bash
java -jar epubcheck.jar ${input:epubFile}
```

Download: <https://github.com/w3c/epubcheck>

### Step 8: Run Ace by DAISY

```bash
npx @daisy/ace ${input:epubFile}
```

Ace checks EPUB Accessibility 1.1 conformance.

### Step 9: Provide Remediation Report

For each issue:

- Rule ID (EPUB-xxx)
- WCAG/EPUB Accessibility criterion
- Location (file, element)
- Current state
- Remediation steps
- Priority (Critical/Serious/Moderate)

## Expected Output

- epubcheck validation results
- Ace accessibility audit results
- Manual check findings
- Severity score (0-100, A-F grade)
- Remediated ePub (if requested)
