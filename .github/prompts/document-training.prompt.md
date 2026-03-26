---
name: document-training
description: Generate role-specific accessibility training materials for document authors working with Word, Excel, PowerPoint, and PDF. Covers common mistakes, best practices, and hands-on exercises tailored to the selected Office application.
mode: agent
tools:
  - askQuestions
---

# Document Accessibility Training Generator

Generate accessibility training materials for document authors. Training is customized by **role** and **application**.

## Training configuration

**Role:** `${input:role}`
_(Options: author, editor, designer, manager, all)_

**Application:** `${input:application}`
_(Options: word, excel, powerpoint, pdf, all)_

## Instructions

Generate comprehensive training materials that include:

### 1. Common Mistakes (Top 10)

For the selected application, list the 10 most common accessibility mistakes document authors make, with:

- What the mistake looks like
- Why it's a problem for users with disabilities
- How to fix it (step-by-step in the Office UI)
- WCAG criterion it violates

### 2. Best Practices Checklist

A printable checklist the author can follow before publishing any document:

- Pre-publishing accessibility checklist specific to the format
- How to run Microsoft's built-in Accessibility Checker
- What each Accessibility Checker finding means

### 3. Hands-On Exercises

3-5 practical exercises where the author:

- Receives a description of an inaccessible document
- Must identify the accessibility issues
- Applies fixes using the Office UI
- Verifies fixes with the Accessibility Checker

### 4. Quick Reference Card

A one-page summary of essential accessibility actions:

**Word:** Title, headings, alt text, table headers, hyperlinks, reading order, language
**Excel:** Sheet names, header rows, alt text, merged cells, color-only data, print titles
**PowerPoint:** Slide titles, alt text, reading order, table headers, transitions, captions
**PDF:** Tagged structure, bookmarks, alt text, language, form labels, reading order

### 5. Role-Specific Guidance

| Role | Focus |
|------|-------|
| **Author** | Creating accessible content from scratch |
| **Editor** | Reviewing and fixing accessibility in existing documents |
| **Designer** | Template design that enforces accessibility by default |
| **Manager** | Establishing accessibility policies and review processes |

### Output Format

- Use clear heading hierarchy (H1 → H2 → H3)
- Include screenshots descriptions where helpful (described in alt text style)
- Format checklists as markdown task lists `- [ ]`
- Keep language at a non-technical reading level suitable for document authors
