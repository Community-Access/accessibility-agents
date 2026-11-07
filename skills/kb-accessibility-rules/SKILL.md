---
name: kb-accessibility-rules
description: Reference data, not a reviewer. Cross-format accessibility rule reference with WCAG 2.2 mapping for Word, Excel, PowerPoint, and PDF documents.
license: MIT
disable-model-invocation: true
user-invocable: false
metadata:
  tier: reference
  domain: cross-cutting
  output: none
  effort: low
  title: Accessibility Rules
---

## Document Accessibility Rules Reference

## Rule ID Prefixes

Each prefix, with its format, sub-agent and count.

| Prefix | Format | Sub-Agent | Count |
|--------|--------|-----------|-------|
| DOCX-E* | Word errors | word-accessibility | 9 rules |
| DOCX-W* | Word warnings | word-accessibility | 6 rules |
| DOCX-T* | Word tips | word-accessibility | 3 rules |
| XLSX-E* | Excel errors | excel-accessibility | 8 rules |
| XLSX-W* | Excel warnings | excel-accessibility | 5 rules |
| XLSX-T* | Excel tips | excel-accessibility | 3 rules |
| PPTX-E* | PowerPoint errors | powerpoint-accessibility | 7 rules |
| PPTX-W* | PowerPoint warnings | powerpoint-accessibility | 6 rules |
| PPTX-T* | PowerPoint tips | powerpoint-accessibility | 4 rules |
| PDFUA.* | PDF/UA conformance | pdf-accessibility | 30 rules |
| PDFBP.* | PDF best practices | pdf-accessibility | 22 rules |
| PDFQ.* | PDF quality/pipeline | pdf-accessibility | 4 rules |
| EPUB-E* | ePub errors | epub-accessibility | 7 rules |
| EPUB-W* | ePub warnings | epub-accessibility | 6 rules |
| EPUB-T* | ePub tips | epub-accessibility | 3 rules |

## WCAG 2.2 Criterion Mapping

Complete tracking of all WCAG 2.2 Level A and AA success criteria. Criteria with document-specific rules list the rule IDs. Criteria requiring human judgment show "Manual review". Criteria that apply only to web/app contexts show a dash. See the **wcag-guide** agent for full explanations of each criterion.

> **Note:** 4.1.1 Parsing is obsolete and removed in WCAG 2.2, so it is not mapped or tested here. For WCAG 2.0 and 2.1 (Section 508, EN 301 549 V3.2.1), W3C errata say it is always satisfied for HTML and XML content.

PDF rule IDs below are the ones defined in `skills/pdf-accessibility/references/rule-layers.md`; `PDFUA.26.*` means the form-field rules there.

### Level A (Must Fix)

Each WCAG, with its criterion and related rules.

| WCAG | Criterion | Related Rules |
|------|-----------|---------------|
| 1.1.1 | Non-text Content | DOCX-E001, XLSX-E001, PPTX-E001, PDFUA.13.001, PDFBP.IMG.ALT_PRESENT, EPUB-E005 |
| 1.2.1 | Audio-only and Video-only (Prerecorded) | Manual review (embedded media) |
| 1.2.2 | Captions (Prerecorded) | Manual review (embedded video) |
| 1.2.3 | Audio Description or Media Alternative (Prerecorded) | Manual review (embedded video) |
| 1.3.1 | Info and Relationships | DOCX-E002, DOCX-E003, DOCX-E005, XLSX-E002, XLSX-E004, PPTX-E004, PDFUA.01.001, PDFUA.19.001, PDFUA.20.001, PDFUA.21.001 |
| 1.3.2 | Meaningful Sequence | PPTX-E006, PDFBP.STRUCT.READING_ORDER, EPUB-E006 |
| 1.3.3 | Sensory Characteristics | Manual review (all formats) |
| 1.4.1 | Use of Color | XLSX-E007, Manual review (other formats) |
| 1.4.2 | Audio Control | Manual review (embedded audio) |
| 2.1.1 | Keyboard | PDFUA.26.* (interactive PDFs) |
| 2.1.2 | No Keyboard Trap | Manual review (interactive PDFs) |
| 2.1.4 | Character Key Shortcuts | --- (web/app-specific) |
| 2.2.1 | Timing Adjustable | --- (web/app-specific) |
| 2.2.2 | Pause, Stop, Hide | Manual review (animated content in documents) |
| 2.3.1 | Three Flashes or Below Threshold | Manual review (animated content) |
| 2.4.1 | Bypass Blocks | PDFBP.NAV.BOOKMARKS_FOR_LONG_DOCS, EPUB-W002 |
| 2.4.2 | Page Titled | DOCX-E004, XLSX-E006, PPTX-E002, PDFBP.META.TITLE_PRESENT, EPUB-E001 |
| 2.4.3 | Focus Order | PDFUA.25.001, PDFUA.26.003 (interactive PDFs) |
| 2.4.4 | Link Purpose (In Context) | DOCX-E006, XLSX-E005, PPTX-E005, PDFUA.28.002, PDFBP.LINK.DESCRIPTIVE_TEXT, EPUB-W005 |
| 2.5.1 | Pointer Gestures | --- (web/app-specific) |
| 2.5.2 | Pointer Cancellation | --- (web/app-specific) |
| 2.5.3 | Label in Name | Manual review (interactive PDFs) |
| 2.5.4 | Motion Actuation | --- (web/app-specific) |
| 3.1.1 | Language of Page | DOCX-T001, XLSX-T003, PPTX-T004, PDFUA.06.001, PDFUA.06.002, EPUB-E003 |
| 3.2.1 | On Focus | --- (web/app-specific) |
| 3.2.2 | On Input | --- (web/app-specific) |
| 3.2.6 | Consistent Help | --- (web/app-specific) |
| 3.3.1 | Error Identification | Manual review (interactive PDFs) |
| 3.3.2 | Labels or Instructions | PDFUA.26.001 (interactive PDFs) |
| 3.3.7 | Redundant Entry | --- (web/app-specific) |
| 4.1.2 | Name, Role, Value | DOCX-E009, PDFUA.01.004, PDFUA.26.001, PDFUA.26.002, PDFUA.28.001 |

### Level AA (Should Fix)

Each WCAG, with its criterion and related rules.

| WCAG | Criterion | Related Rules |
|------|-----------|---------------|
| 1.2.4 | Captions (Live) | --- (web/app-specific) |
| 1.2.5 | Audio Description (Prerecorded) | Manual review (embedded video) |
| 1.3.4 | Orientation | --- (web/mobile-specific) |
| 1.3.5 | Identify Input Purpose | Manual review (interactive PDFs) |
| 1.4.3 | Contrast (Minimum) | Manual review (all formats) |
| 1.4.4 | Resize Text | Manual review (PDF reflow) |
| 1.4.5 | Images of Text | PDFBP.TEXT.EXTRACTABLE, PDFQ.REPO.NO_SCANNED_ONLY |
| 1.4.10 | Reflow | Manual review (PDF reflow) |
| 1.4.11 | Non-text Contrast | Manual review (all formats) |
| 1.4.12 | Text Spacing | Manual review (PDF text spacing) |
| 1.4.13 | Content on Hover or Focus | --- (web/app-specific) |
| 2.4.5 | Multiple Ways | EPUB-E004, Manual review (multi-page documents) |
| 2.4.6 | Headings and Labels | DOCX-E003, DOCX-E007, PDFUA.07.001, EPUB-W003 |
| 2.4.7 | Focus Visible | Manual review (interactive PDFs) |
| 2.4.11 | Focus Not Obscured (Minimum) | --- (web/app-specific) |
| 2.5.7 | Dragging Movements | --- (web/app-specific) |
| 2.5.8 | Target Size (Minimum) | Manual review (interactive PDFs) |
| 3.1.2 | Language of Parts | Manual review (Office formats), PDFUA.06.003 |
| 3.2.3 | Consistent Navigation | --- (web/app-specific) |
| 3.2.4 | Consistent Identification | --- (web/app-specific) |
| 3.3.3 | Error Suggestion | Manual review (interactive PDFs) |
| 3.3.4 | Error Prevention (Legal, Financial, Data) | Manual review (interactive PDFs) |
| 3.3.8 | Accessible Authentication (Minimum) | --- (web/app-specific) |
| 4.1.3 | Status Messages | --- (web/app-specific) |

## Severity Definitions

Each severity, with its meaning and impact on AT users.

| Severity | Meaning | Impact on AT Users |
|----------|---------|-------------------|
| Error | Blocks access | Content is inaccessible or unusable with assistive technology |
| Warning | Degrades experience | Content is accessible but the experience is poor or confusing |
| Tip | Best practice | Content works but could be improved for better AT experience |

## Confidence Levels

Each level, with its weight and meaning.

| Level | Weight | Meaning |
|-------|--------|---------|
| High | 1.0 | Sub-agent is certain this is a real issue |
| Medium | 0.7 | Likely an issue but requires human judgment |
| Low | 0.3 | Possible issue - flagged for review |

## Compliance Standards

Each standard, with its scope and key rules.

| Standard | Scope | Key Rules |
|----------|-------|-----------|
| WCAG 2.2 Level A | International | All error-level rules |
| WCAG 2.2 Level AA | International | All error + warning rules |
| Section 508 | US Federal | Mapped to WCAG 2.0 Level AA (as of October 2026) |
| EN 301 549 | European Union | V3.2.1, the version cited in the OJEU: WCAG 2.1 Level AA. V4.1.1 (September 2026, not yet cited): WCAG 2.2 Level AA (as of October 2026) |
| PDF/UA-1 (ISO 14289-1:2014) | PDF-specific | All PDFUA.* rules |
