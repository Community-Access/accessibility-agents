# screen-reader-lab — Interactive Screen Reader Simulation

> Simulates screen reader behavior on HTML/JSX content for education and debugging, producing step-by-step narration of what assistive technology would announce.

## Features

- Takes HTML or JSX input and produces a narrated walkthrough of screen reader announcements
- Four navigation modes matching real screen reader behavior:
  - **Reading order** — Sequential traversal of all content as a screen reader's virtual cursor would encounter it
  - **Tab/focus navigation** — Simulates pressing Tab to move through interactive elements only
  - **Heading navigation** — Simulates pressing H to jump between headings, showing the heading level hierarchy
  - **Form navigation** — Simulates pressing F to jump between form controls, showing labels, roles, and states
- Identifies missing accessible names, roles, and states
- Highlights ARIA issues that would cause confusing announcements
- Explains differences between screen reader behavior across NVDA, JAWS, VoiceOver, and Narrator

## When to Use It

- Learning how screen readers interpret specific HTML patterns
- Debugging why a component sounds wrong or is skipped by assistive technology
- Reviewing heading hierarchy and landmark structure without launching a screen reader
- Understanding how ARIA attributes affect the accessibility tree announcements
- Training developers who do not have access to a screen reader
- Verifying reading order matches the visual layout

## How It Works

1. **Input** — Receives an HTML snippet, JSX component, or file path
2. **Parse** — Builds an accessibility tree from the markup
3. **Simulate** — Walks the tree in the selected navigation mode
4. **Narrate** — Outputs step-by-step announcements with role, name, state, and value
5. **Flag** — Highlights problems such as missing labels, incorrect roles, or focus traps

> **Important:** This simulation is an educational approximation. It does not replace testing with real screen readers on real devices. Always validate with actual assistive technology before shipping.

## Handoffs

Each direction, with its agent and when.

| Direction | Agent | When |
|-----------|-------|------|
| Receives from | accessibility-lead | When a component needs screen reader behavior analysis |
| Receives from | aria-specialist | When ARIA usage needs to be validated through simulated announcements |
| Hands off to | testing-coach | When simulation reveals issues that need real screen reader testing guidance |
| Hands off to | aria-specialist | When simulation uncovers ARIA pattern problems needing correction |

## Sample Usage

```text
@screen-reader-lab Simulate reading order for the navigation component in src/components/Nav.tsx

@screen-reader-lab Show tab navigation through the login form in example/index.html

@screen-reader-lab Walk through heading navigation on this page and check for skipped levels

@screen-reader-lab Simulate form navigation on the checkout component and check for missing labels
```

## Related

- [testing-coach](./testing-coach.md) — Guides real screen reader testing after simulation identifies potential issues
- [aria-specialist](./aria-specialist.md) — Fixes ARIA patterns that cause incorrect announcements
- [alt-text-headings](./alt-text-headings.md) — Reviews heading hierarchy and image alt text surfaced during simulation
