# Testing action 4: Perform manual accessibility checks

Part of the `osaf-testing` skill. Read this when action 4 is in scope.

- ID: `perform-manual-accessibility-checks`
- Effort and cadence: Extended; Ongoing
- Canonical source: [Testing phase, action 4](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/blob/b2ea31a2e38cbab3e774e4142575b78876b9b53f/framework/phases/testing-phase.md#4-perform-manual-accessibility-checks)

## Why it matters

This action addresses common visual access barriers.

## Definition of Done

1. Relevant interfaces have documented checks for keyboard, descriptive
   language, plain language, zoom and reflow, and color contrast and usage.
2. Information and functionality remain available at the tested settings.
3. Accessibility issues are fixed or tracked.

## Recommended steps, adapted from the framework

1. Identify key tasks and user journeys.
2. Check for quality of alternative text.
3. Ensure that text such as page title, headings, input labels, and error
   messages are descriptive.
4. Ensure that plain language is used instead of jargon and acronyms are
   spelled out on first reference.
5. Ensure that content zooms (200%) and reflows (400%) without loss of
   information or functionality.
6. Check for sufficient color contrast and that color is not used as the only
   way of conveying meaning or information.
7. Fix accessibility issues or track them.

## What this package can check, and what still needs a person

Each area of the Definition of Done, what this package's skills and tools
contribute, and what a person must still do.

| Area | This package | Still a person |
|---|---|---|
| Keyboard | Action 2 of this skill; `keyboard-navigator`; `run_playwright_keyboard_scan` | Completing each task by keyboard |
| Alternative text quality | `alt-text-headings` (alt text, SVG, figures, charts), `text-quality-reviewer` (weak alt text and names) | Whether the alt text fits the image's purpose in context |
| Descriptive titles, headings, labels and errors | `alt-text-headings` (headings, page titles, landmarks), `forms-specialist` (labels, error messages), `text-quality-reviewer` | Whether the wording makes sense to a user |
| Plain language | `cognitive-accessibility`; the MCP tool `check_reading_level` estimates a passage's reading level | Judging jargon and acronyms in context |
| Zoom 200% and reflow 400% | `run_playwright_viewport_scan` loads pages at 320, 768, 1024 and 1280 CSS pixels and reports horizontal scrolling. 320 pixels is the width the WCAG 1.4.10 Reflow criterion uses, equivalent to 400% zoom on a 1280 pixel window | Browser zoom to 200%, and text resize; the tool tests neither |
| Contrast and color use | `contrast-master` (text, UI component and focus contrast, color-only meaning); `run_playwright_contrast_scan` (computed colors on a rendered page); `check_contrast` and `check_color_blindness` for pairs | Images of text, gradients and states the scan did not reach |

Code reviews and scans return findings with a severity; they show likely
failures. Item 2 ("remain available at the tested settings") is met only by a
check of the rendered interface at those settings.

## How to do it in this repository

1. Use the key tasks from action 2.
2. Write the checks into the same testing document, with the template below.
3. Run the reviews and scans above that the project can support (a URL is
   needed for the Playwright tools), and attach their results to the record as
   automated evidence.
4. Leave each check that needs a person as "not yet run" until someone runs it.
5. File what is not fixed.

## Hand-offs

- `web-accessibility-wizard` (router) - a full audit with the Playwright
  scans, when the project can be served.
- `accessibility-lead` (router) - a code review of the flows by the
  specialists above.
- `issue-tracker` - file the failures not fixed.

## Template: manual checks for one task

```markdown
### Manual checks: <task name>

Environment: <operating system>, <browser and version>, <display size>.
Run by <person or tool> on <date>.

- [ ] Keyboard: the task can be completed by keyboard alone (see the keyboard
      record).
- [ ] Alternative text describes each informative image's purpose; decorative
      images are hidden from assistive technology.
- [ ] Page title, headings, input labels and error messages are descriptive.
- [ ] Plain language is used; acronyms are spelled out on first reference.
- [ ] At 200% browser zoom, no information or function is lost.
- [ ] At 400% (a 320 CSS pixel wide window), content reflows without
      horizontal scrolling or loss of information or function.
- [ ] Text and controls have sufficient contrast, and color is never the only
      way meaning is conveyed.

Result: <pass, or the barriers found with issue numbers>.
```

## Evidence to report

- Where the checks are documented, per interface.
- Each check: ran by a person (date, environment, result), automated evidence
  only (tool and result), or not yet run.
- The issues filed.
