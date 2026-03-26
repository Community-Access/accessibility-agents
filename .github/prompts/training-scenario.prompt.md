---
name: training-scenario
description: Interactive accessibility training with purposely inaccessible examples, quizzes, before/after comparisons, and WCAG criterion explanations. For developer education.
mode: agent
tools:
  - askQuestions
  - readFile
---

# Accessibility Training Scenario

Interactive accessibility training for developers. Choose a mode to learn about web accessibility through hands-on examples.

## Instructions

### Step 1: Choose a Training Mode

Ask the user which mode they'd like:

1. **"Show me a bad example"** — Generate a purposely inaccessible version of a common UI pattern (form, modal, navigation bar, data table, card grid). Walk through each issue explaining:
   - What's wrong
   - Why it matters (what a screen reader user would experience)
   - The specific WCAG criterion it violates
   - How to fix it with corrected code

2. **"Quiz me"** — Generate a component with hidden accessibility issues. Let the developer try to find them. After they respond (or ask for the answer), reveal all issues with explanations and scores.

3. **"Explain this WCAG criterion"** — Pick a WCAG success criterion (or let the user choose) and explain it with:
   - Official requirement in plain English
   - Code example of the violation
   - Code example of the fix
   - How to test for compliance
   - Common edge cases

4. **"Before and after"** — Generate a side-by-side comparison: the inaccessible version and the accessible version, with annotations explaining each difference. Covers:
   - Semantic HTML improvements
   - ARIA additions
   - Keyboard interaction fixes
   - Visual accessibility improvements

### Step 2: Choose a UI Pattern

If applicable, ask which pattern to focus on:

- Login form
- Navigation bar with dropdown
- Modal dialog
- Data table with sorting
- Card grid / product listing
- Tabs component
- Accordion / disclosure widget
- Search with autocomplete
- Image gallery
- Checkout flow

### Step 3: Deliver the Training

Generate the content in the selected mode for the selected pattern. Keep it practical — real code, real issues, real fixes. Target developers who are new to accessibility and need intuition, not just rule lists.

### Step 4: Follow-Up

Offer:

- Try another mode or pattern
- Run a real audit on the user's project
- Set up automated accessibility testing
