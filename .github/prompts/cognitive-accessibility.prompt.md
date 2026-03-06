---
name: review-cognitive
description: Cognitive accessibility specialist. Reviews web content for reading level, plain language clarity, WCAG 2.2 cognitive SC (3.3.7, 3.3.8, 3.3.9), timeout warnings, memory demands, and COGA guidance alignment.
mode: agent
agent: cognitive-accessibility
tools:
  - askQuestions
  - readFile
  - editFiles
---

# Cognitive Accessibility Review

Review web content and UI for cognitive accessibility compliance. Covers reading level, plain language, WCAG 2.2 new criteria, timeout warnings, and COGA (Cognitive and Learning Disabilities Accessibility) guidance.

## Content to Review

**Files:** `${input:files}`

## Instructions

### Step 1: Gather Context

Ask the user:

1. **Content type** -- Forms, authentication flow, error messages, help text, instructions?
2. **Audience** -- General public, technical users, specific age range?
3. **Known issues** -- Users report confusion, complex language, timeouts?

### Step 2: Check WCAG 2.2 Cognitive Criteria

**3.3.7 Redundant Entry (A)**
- Don't make users re-enter information in same session
- Auto-fill from previous steps
- Exceptions: security, confirmation, essential re-entry

**3.3.8 Accessible Authentication (Minimum) (AA)**
- Don't require cognitive function tests (memorization, puzzle solving, calculation)
- Allow password paste, password managers, email/SMS links
- Exception: Object recognition (pick the house) if alternative exists

**3.3.9 Accessible Authentication (Enhanced) (AAA)**
- Authentication without any cognitive function test

**2.4.11 Focus Not Obscured (Minimum) (AA)**
- Focus indicator not completely hidden by content

**2.4.12 Focus Not Obscured (Enhanced) (AAA)**
- Focus indicator not hidden at all

**2.4.13 Focus Appearance (AAA)**
- Focus indicator meets size and contrast requirements

### Step 3: Plain Language Analysis

Check content for:

1. **Readability** -- Short sentences, common words, active voice
2. **Jargon** -- Technical terms explained or avoided
3. **Clarity** -- Instructions clear and specific
4. **Structure** -- Headings, lists, whitespace for scannability

### Step 4: Memory and Cognitive Load

1. **Input format shown** -- Date format (MM/DD/YYYY) visible before user types
2. **Help text available** -- Contextual help for complex inputs
3. **Error messages clear** -- What went wrong, how to fix it
4. **Confirmation before destructive actions** -- Delete, submit, irreversible changes
5. **Progress indicators** -- Multi-step processes show "Step 2 of 5"

### Step 5: Session Timeouts

1. **Warning given** -- At least 20 seconds before timeout
2. **Extension available** -- User can extend session with simple action
3. **No data loss** -- Timeout doesn't destroy entered data

### Step 6: Provide Remediation

For each issue:
- WCAG 2.2 criterion reference
- COGA Design Pattern reference (if applicable)
- Rewrite suggestions for plain language
- UI mockups for clearer interaction patterns

## Expected Output

- Cognitive accessibility assessment
- Plain language rewrite suggestions
- WCAG 2.2 compliance evaluation
- COGA-aligned improvements
