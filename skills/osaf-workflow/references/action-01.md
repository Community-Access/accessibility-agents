# Workflow action 1: Surface accessibility expectations for contributors

Part of the `osaf-workflow` skill. Read this when action 1 is in scope.

- ID: `surface-accessibility-expectations-for-contributors`
- Effort and cadence: Moderate; Initial setup + ongoing
- Canonical source: [Workflow phase, action 1](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/blob/b2ea31a2e38cbab3e774e4142575b78876b9b53f/framework/phases/workflow-phase.md#1-surface-accessibility-expectations-for-contributors)

## Why it matters

This action communicates the project's accessibility priorities and sets clear
expectations for contributors.

## Definition of Done

1. The project's `ACCESSIBILITY.md` includes a "Priorities" section describing
   its accessibility goals and areas of focus.
2. The project's `ACCESSIBILITY.md` includes a "Contributor expectations"
   section describing the accessibility requirements for contributions.
3. The project's `CONTRIBUTING.md` directs contributors to these expectations
   and any relevant accessibility checks and resources.

## Recommended steps, adapted from the framework

1. Add a "Priorities" section to `ACCESSIBILITY.md` that identifies the
   project's accessibility goals, applicable standards, and areas of focus.
2. Add a "Contributor expectations" section that defines the accessibility
   testing, documentation, and continuous integration requirements for
   contributions.
3. In `CONTRIBUTING.md`, add a reference to the contributor expectations in
   `ACCESSIBILITY.md`.

## How to do it in this repository

- **Requires an `ACCESSIBILITY.md`.** If there is none, Foundational action 1
  comes first; say so and offer `osaf-foundational`.
- **Priorities follow the project.** A component library prioritizes keyboard
  and screen reader semantics; a CLI prioritizes output that reads well in a
  terminal and a screen reader; a documentation site prioritizes headings, link
  text and alternatives. Only list areas the project works on.
- **A WCAG target is aspirational unless evaluated.** The toolkit's guidance:
  if you name a WCAG level, say it is a goal, not a verified conformance claim,
  and only claim conformance after an evaluation that states scope, date,
  method and evaluator.
- **Name only tools the project uses.** If the project has an automated check
  (Testing action 1), name it; otherwise describe the check generically and
  leave tools out.
- **CONTRIBUTING.md.** Add a short pointer near the pull request steps. If
  there is no `CONTRIBUTING.md`, hand off to `repo-manager`, which generates
  one, then add the pointer. Link to the section anchor that exists: the
  toolkit's own `CONTRIBUTING.md` links to `#contributor-requirements`, which
  does not match its "Contributor expectations" heading. Use
  `ACCESSIBILITY.md#contributor-expectations`.
- **Ongoing.** Workflow action 9 and Testing actions 2, 3 and 5 extend or rely
  on this section; keep one list rather than several.

## Hand-offs

- `repo-manager` - generate `CONTRIBUTING.md` when the repository has none.
- `markdown-a11y-assistant` (router) - audit the changed `ACCESSIBILITY.md` and
  `CONTRIBUTING.md`.

## Example: Priorities and Contributor expectations

From `framework/supporting/workflow-phase/contributor-accessibility.md`, with
the toolkit's additional checks merged in and punctuation converted to ASCII.
Adapt it; do not paste it unchanged, and keep only tools the project uses.

```markdown
## Priorities

- **Accessibility target:** We work toward [WCAG 2.2 Level AA](https://www.w3.org/TR/WCAG22/).
  This target guides our work but is not a claim of verified conformance.
- **Keyboard support** - every interactive element must be reachable and
  operable with a keyboard alone, with a visible focus indicator and a logical
  tab order.
- **Screen reader support** - content uses semantic HTML and a logical heading
  hierarchy so it can be navigated with VoiceOver, NVDA, JAWS, and similar tools.
- **Readable content** - we use plain language when possible, descriptive link
  text, sufficient color contrast, semantic lists, and meaningful alternative text.
- **Translations** - each language is declared in code so assistive technology
  can pronounce it correctly.

## Contributor expectations

If you are contributing content or code, please follow these guardrails so we
don't regress accessibility:

- **Testing**
  - For UI changes, test with an automated accessibility tool (such as
    [axe DevTools](https://www.deque.com/axe/devtools/) or the
    [GitHub Accessibility Scanner](https://github.com/github/accessibility-scanner)).
  - Do at least one keyboard-only pass on any change to interactive UI.
    - Tab order is logical (no jumps, no traps, reaches all interactive controls).
    - A visible focus indicator is always present and has sufficient contrast.
    - All actions work by keyboard (Tab and Shift+Tab, Enter, Space, arrow keys
      where expected).
    - No keyboard trap (you can move into and out of modals, menus, popovers,
      editors).
  - Spot-check screen reader behavior for new components or significant content
    changes.
    - You can navigate by headings and landmarks.
    - Controls have clear accessible names that match their purpose.
    - Custom controls expose role, name, value and state (expanded, selected,
      pressed).
    - Lists and list items are announced appropriately.
    - Dynamic updates are announced (errors, async status, validation, toasts).
    - Reading order is logical.
- **Documentation and content**
  - Use a logical heading hierarchy (do not skip levels).
  - Use real list elements, not text formatted to look like a list.
  - Use unique, descriptive link text (avoid "click here" and "read more").
  - Provide meaningful alternative text for images; see the
    [W3C alt decision tree](https://www.w3.org/WAI/tutorials/images/decision-tree/).
  - For complex images or diagrams, include a text alternative nearby.
  - For tables, provide column and row headers.
  - For videos, provide captions and a transcript.
  - Don't use color as the only way to convey meaning.
  - Content reflows without loss of information or functionality (test at 200%
    and at narrow widths).
- **CI/CD**
  - Pull requests may be blocked if they introduce accessibility violations
    detected by our linting or scanning workflows.
  - Resolve flagged issues, or document in the pull request why a violation
    cannot be addressed.
```

The `CONTRIBUTING.md` pointer, after the toolkit's:

```markdown
1. Follow the project's [accessibility contributor expectations](ACCESSIBILITY.md#contributor-expectations).
```

## Evidence to report

- The two section headings in `ACCESSIBILITY.md`, with line numbers.
- The `CONTRIBUTING.md` line that links to them, and that the anchor resolves.
- Any tool named in the expectations that the project does not yet run.
