# performance-accessibility — Performance Accessibility Specialist

> Audits the intersection of web performance optimization and accessibility. Covers lazy loading announcements, skeleton screen semantics, Cumulative Layout Shift impact on assistive technology, code splitting with accessible loading states, and progressive enhancement patterns.

## Features

- Audits lazy-loaded images and content for screen reader announcements
- Reviews skeleton screen accessibility (proper ARIA hiding, loading state announcements)
- Assesses CLS impact on assistive technology users (focus displacement, content reflow)
- Validates code-split routes for accessible loading indicators
- Checks infinite scroll implementations for keyboard alternatives
- Reviews progressive enhancement to confirm core content works without JavaScript

## When to Use It

- Adding lazy loading, infinite scroll, or virtual scrolling to a page
- Implementing skeleton screens or loading placeholders
- Diagnosing CLS-related issues that affect screen reader or keyboard users
- Setting up code splitting with route-level loading states
- Reviewing progressive enhancement strategy for accessibility

## How It Works

1. **Framework detection** - Identifies the frontend framework and its lazy loading patterns
2. **Lazy loading audit** - Checks that lazy-loaded content preserves alt text, announces arrival, and avoids CLS
3. **Skeleton screen audit** - Validates that placeholders use `aria-hidden="true"` and actual content regions use `aria-busy`
4. **CLS audit** - Identifies layout shifts that could displace focused elements or disrupt screen reader position
5. **Loading state audit** - Reviews route transitions, code-split boundaries, and Suspense/fallback patterns for accessible announcements
6. **Progressive enhancement check** - Confirms core content and navigation work without JavaScript

## Handoffs

Each direction, with its agent and when.

| Direction | Agent | When |
|-----------|-------|------|
| Receives from | accessibility-lead | When performance-related accessibility issues are detected |
| Hands off to | accessibility-lead | When general web accessibility concerns are found beyond performance patterns |
| Hands off to | live-region-controller | When loading state announcements need live region review |
| Hands off to | keyboard-navigator | When CLS or lazy loading disrupts focus management |

## Sample Usage

```text
@performance-accessibility Audit lazy loading and skeleton screens in our product listing page

@performance-accessibility Check if our infinite scroll implementation has a keyboard alternative

@performance-accessibility Review the CLS impact of our hero image loading on screen reader users
```

## Related

- [accessibility-lead](./accessibility-lead.md) - Coordinates full web accessibility audits
- [live-region-controller](./live-region-controller.md) - Reviews live region announcements for dynamic content
- [keyboard-navigator](./keyboard-navigator.md) - Focus management during content loading and layout shifts
- [aria-specialist](./aria-specialist.md) - ARIA patterns for loading states and busy indicators
