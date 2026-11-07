# Workflow action 4: Add an accessibility section to the pull request template

Part of the `osaf-workflow` skill. Read this when action 4 is in scope.

- ID: `add-an-accessibility-section-to-the-pull-request-template`
- Effort and cadence: Quick; Initial setup + ongoing
- Canonical source: [Workflow phase, action 4](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/blob/b2ea31a2e38cbab3e774e4142575b78876b9b53f/framework/phases/workflow-phase.md#4-add-an-accessibility-section-to-the-pull-request-template)

## Why it matters

This action makes accessibility a consistent part of the review process.

## Definition of Done

1. The pull request template includes an accessibility section.
2. The checklist covers the project's relevant accessibility requirements.
3. Contributors are prompted to complete each applicable item.

## Recommended steps, adapted from the framework

1. Include an accessibility checklist in your pull request template, creating a
   template if one does not already exist.
2. Add checklist items for content changes and user interface changes.
3. Prompt contributors to complete each applicable item.
4. Customize the checklist for the project's needs.

## How to do it in this repository

- **Find the template.** GitHub reads `.github/PULL_REQUEST_TEMPLATE.md`,
  `PULL_REQUEST_TEMPLATE.md` at the root, `docs/PULL_REQUEST_TEMPLATE.md`, or
  several templates under a `PULL_REQUEST_TEMPLATE/` directory. Add the section
  to each template that covers user-facing changes, and keep the rest as it is.
- **No template yet:** hand off to `repo-manager` or `template-builder` for the
  base template, then add the section below. Neither skill's default PR
  template has an accessibility section, so this action always adds one.
- **Customize from the project's own requirements.** Derive the items from the
  "Contributor expectations" in `ACCESSIBILITY.md` (action 1) so the template
  and the document say the same thing. Drop the UI group for projects with no
  UI; keep the content group, since every project has docs.
- **Prompting** (item 3) is the intro sentence asking contributors to check
  each applicable item and mark the rest N/A. Do not add the toolkit's "we will
  close your PR without comment" line unless the maintainer asks for it; it
  discourages first-time contributors.
- **Ongoing.** Reviewers use the checklist. If the project uses this package,
  `accessibility-lead` reviews UI diffs and `markdown-a11y-assistant` reviews
  docs changes, which gives reviewers evidence for the boxes.

## Hand-offs

- `template-builder` or `repo-manager` - create the base pull request template
  when there is none.

## Example: accessibility checklist

Adapted from the Accessibility Toolkit's `.github/PULL_REQUEST_TEMPLATE.md`,
punctuation converted to ASCII. Replace `PROJECT` and `OWNER/REPO`.

```markdown
## Accessibility checklist

Accessibility is a priority for PROJECT. Please review our
[accessibility statement](https://github.com/OWNER/REPO/blob/main/ACCESSIBILITY.md) and check each item that applies
to your change. Mark an item N/A when it does not apply (for example, a
content-only change with no UI).

### Content changes (any change to docs, README or other content)

- [ ] Headings follow a logical hierarchy and don't skip levels.
- [ ] Link text is unique and descriptive (no "click here" or "read more").
- [ ] Images have meaningful alternative text, or are marked decorative when
      appropriate.
- [ ] Complex images and diagrams have a nearby text alternative.
- [ ] Semantic lists are used instead of manually typed numbering.
- [ ] Plain language is used; abbreviations are expanded on first use.
- [ ] Meaning isn't conveyed by color, position, or styling alone.
- [ ] Any embedded video has captions and a transcript.

### UI and code changes (only if you touched markup, styles, or interactive behavior)

- [ ] Keyboard navigation works end to end: everything interactive is reachable
      and operable without a mouse.
- [ ] Focus states are visible and follow reading order.
- [ ] Forms have associated labels.
- [ ] Error messages are programmatically associated with their fields.
- [ ] Color isn't the only indicator of state, error, or meaning.
- [ ] Reduced motion is respected if animations were added (`prefers-reduced-motion`).
- [ ] Screen reader behavior was checked at least once (VoiceOver, NVDA, JAWS,
      or TalkBack).
- [ ] Native HTML elements are preferred over custom controls; ARIA is used
      only when needed.
- [ ] Touch targets are at least 24 by 24 CSS pixels, or have adequate spacing.
- [ ] Tested with an automated tool, and any new violations are resolved or
      explained below.

### Accessibility notes

<!-- Optional: accessibility considerations, known limitations, or items left for follow-up issues. -->
```

The link is absolute because a pull request description is not a file, so a
relative link in it does not resolve. The touch target item follows WCAG 2.2 success criterion 2.5.8,
which allows a smaller target when spacing keeps a 24 CSS pixel circle clear of
other targets.

## Evidence to report

- The template path and the line of the section heading.
- Which checklist items came from the project's contributor expectations, and
  which groups were dropped and why.
