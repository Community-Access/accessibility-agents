---
name: a11y-pr-check
description: Analyze a pull request diff for accessibility regressions. Checks changed HTML, JSX, TSX, Vue, Svelte, and CSS files against WCAG 2.2 AA requirements.
mode: agent
tools:
  - askQuestions
  - runInTerminal
  - readFile
  - github/*
---

# Accessibility PR Check

Review a pull request's changed files for accessibility issues before merge.

## Instructions

1. Get the PR diff using `git diff` or the GitHub API for the target PR.

2. Filter to accessibility-relevant files:
   - `*.html`, `*.jsx`, `*.tsx`, `*.vue`, `*.svelte`, `*.astro`
   - `*.css`, `*.scss`, `*.less`
   - Config files that affect accessibility (Tailwind config, theme files)

3. For each changed file, check for these common regressions:
   - **Images** — missing or empty `alt` attributes on new `<img>` elements
   - **Interactive elements** — `<div>` or `<span>` with click handlers instead of `<button>` or `<a>`
   - **Tab order** — positive `tabindex` values (should be 0 or -1 only)
   - **Focus visibility** — `outline: none` or `outline: 0` without replacement focus styles
   - **Form labels** — inputs without associated `<label>` or `aria-label`/`aria-labelledby`
   - **Heading hierarchy** — skipped heading levels or multiple `<h1>` elements
   - **Color contrast** — hardcoded colors that may fail 4.5:1 ratio
   - **ARIA misuse** — redundant ARIA roles on semantic elements, invalid ARIA attributes
   - **Link text** — generic "click here", "read more", "learn more" without context

4. Classify each finding:
   - **Blocker** — WCAG 2.2 AA conformance failure (should block merge)
   - **Warning** — likely issue that needs human review
   - **Info** — best practice suggestion

5. Post a structured summary:
   - Total files checked, issues found by severity
   - Each finding with: file, line, rule, severity, WCAG criterion, fix suggestion
   - Overall verdict: **Pass** (no blockers) or **Fail** (blockers found)
