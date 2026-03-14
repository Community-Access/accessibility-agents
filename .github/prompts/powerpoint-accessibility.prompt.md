---
name: audit-powerpoint
description: PowerPoint presentation accessibility specialist. Scans and remediates .pptx files. Covers slide titles, alt text, reading order, table headers, media accessibility.
mode: agent
agent: powerpoint-accessibility
tools:
  - askQuestions
  - readFile
  - runInTerminal
  - getTerminalOutput
---

# PowerPoint Presentation Accessibility Audit

Audit Microsoft PowerPoint (.pptx) presentations for accessibility compliance with WCAG 2.1 AA and Microsoft Accessibility Checker rules.

## Presentation to Audit

**File:** `${input:pptxFile}`

## Instructions

### Step 1: Check Slide Titles

**Rule:** PPTX-001  
**WCAG:** 2.4.2 Page Titled, 2.4.6 Headings and Labels

Every slide must have:

- Unique, descriptive title
- Title placeholder used (not text box)

Check: Home → Layout → select layout with Title placeholder

### Step 2: Check Alt Text

**Rule:** PPTX-002  
**WCAG:** 1.1.1 Non-text Content

All images/charts/SmartArt/shapes must have:

- Alt text describing content
- Or marked as decorative

Add: Right-click → View Alt Text

### Step 3: Check Reading Order

**Rule:** PPTX-003  
**WCAG:** 1.3.2 Meaningful Sequence

Screen reader reading order must match visual order:

- Home → Arrange → Selection Pane
- Drag to reorder objects (bottom = read first)

### Step 4: Check Tables

**Rule:** PPTX-004  
**WCAG:** 1.3.1 Info and Relationships

- Header row designated
- No merged cells in data tables

Check: Table Tools → Design → Header Row

### Step 5: Check Hyperlinks

**Rule:** PPTX-005  
**WCAG:** 2.4.4 Link Purpose Clear

- Link text descriptive (not URL)
- ScreenTip added

Edit: Right-click → Edit Hyperlink → ScreenTip

### Step 6: Check Duplicate Titles

**Rule:** PPTX-006  
**WCAG:** 2.4.6 Headings and Labels

Each slide title should be unique:

- "Introduction", "Overview" → "Introduction to Topic", "Project Overview"

Or use slide numbers to differentiate.

### Step 7: Check Sections

**Rule:** PPTX-007  
**WCAG:** 2.4.1 Bypass Blocks

Use sections to organize long presentations:

- View → Slide Sorter → right-click → Add Section

### Step 8: Check Media Accessibility

**Rule:** PPTX-008  
**WCAG:** 1.2.1, 1.2.2, 1.2.3

- Audio: Transcript or captions
- Video: Captions and audio description
- Autoplay off (or user-initiated)

### Step 9: Provide Remediation Report

For each issue:

- Rule ID (PPTX-xxx)
- WCAG criterion
- Location (slide number, object name)
- Current state
- Remediation steps
- Priority (Critical/Serious/Moderate)

## Expected Output

- Accessibility findings with rule IDs
- Per-slide remediation checklist
- Severity score (0-100, A-F grade)
- Fixed presentation (if requested)
