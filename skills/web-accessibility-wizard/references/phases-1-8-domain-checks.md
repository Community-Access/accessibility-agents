# Web Accessibility Wizard reference: Phase 2: Keyboard Navigation and Focus

## Phase 1: Structure and Semantics

**Specialist agents:** alt-text-headings, aria-specialist

Ask the user:

1. Can you share your main page template or layout component?
2. Do you have a consistent heading structure across pages?

Then review:

- [ ] HTML document structure (`<html lang>`, `<title>`, viewport meta)
- [ ] Landmark elements (`<header>`, `<nav>`, `<main>`, `<footer>`, `<aside>`)
- [ ] Heading hierarchy (single H1, no skipped levels)
- [ ] Skip navigation link
- [ ] Image alt text across the project
- [ ] SVG accessibility
- [ ] Icon handling (`aria-hidden="true"` on decorative icons)
- [ ] Semantic HTML usage (no `<div>` buttons, proper list markup)

Report findings with severity levels before proceeding.

Part of the `web-accessibility-wizard` skill. Read this only when the task reaches these sections.

## Phase 2: Keyboard Navigation and Focus

**Specialist agents:** keyboard-navigator, modal-specialist

Ask the user:

1. Do you have any modals, drawers, or overlay components?
2. Do you use client-side routing (SPA)?
3. Are there any drag-and-drop interfaces?
4. Do you have custom dropdown menus or comboboxes?

Then review:

- [ ] Tab order matches visual layout
- [ ] No positive tabindex values
- [ ] All interactive elements keyboard-reachable
- [ ] Focus indicators visible on all interactive elements
- [ ] Skip link functionality
- [ ] Modal focus trapping and focus return
- [ ] SPA route change focus management
- [ ] Focus management on content deletion
- [ ] Keyboard traps (should only exist in modals)
- [ ] Custom widget keyboard patterns (tabs, menus, accordions)
- [ ] Escape key behavior on overlays

Report findings before proceeding.

## Phase 3: Forms and Input

**Specialist agents:** forms-specialist

Ask the user:

1. What forms does your application have? (login, registration, search, checkout, settings, etc.)
2. Do you have multi-step forms or wizards?
3. How do you handle form validation and error display?
4. Do you use any custom form controls (date pickers, rich text editors, file uploads)?

Then review:

- [ ] Every input has a programmatic label (`<label>`, `aria-label`, or `aria-labelledby`)
- [ ] Required fields use the `required` attribute
- [ ] Error messages associated via `aria-describedby`
- [ ] `aria-invalid="true"` on fields with errors
- [ ] Focus moves to first error on invalid submission
- [ ] Radio/checkbox groups use `<fieldset>` and `<legend>`
- [ ] `autocomplete` attributes on identity/payment fields
- [ ] Placeholder text is not the only label
- [ ] Search forms have proper roles and announcements
- [ ] File upload controls have accessible status feedback

Report findings before proceeding.

## Phase 4: Color and Visual Design

**Specialist agents:** contrast-master

Ask the user:

1. Do you have a design system or defined color palette?
2. Do you support dark mode?
3. Do you use CSS frameworks like Tailwind? (common contrast failures with gray scales)
4. Do you use color alone to indicate states (error=red, success=green)?

Then review:

- [ ] Text contrast meets 4.5:1 (normal) or 3:1 (large text)
- [ ] UI component contrast meets 3:1
- [ ] Focus indicator contrast meets 3:1
- [ ] No information conveyed by color alone
- [ ] Disabled state contrast
- [ ] Dark mode contrast (if applicable)
- [ ] `prefers-reduced-motion` support for animations
- [ ] Content readable at 200% zoom
- [ ] Content reflows at 320px viewport width

Report findings before proceeding.

## Phase 5: Dynamic Content and Live Regions

**Specialist agents:** live-region-controller

Ask the user:

1. Does your app have toast notifications or alerts?
2. Do you have search with dynamic results?
3. Do you have filters that update content without page reload?
4. Do you have real-time features (chat, feeds, dashboards)?
5. Do you show loading spinners for async operations?

Then review:

- [ ] Live regions exist for dynamic content updates
- [ ] `aria-live="polite"` used for routine updates
- [ ] `aria-live="assertive"` reserved for critical alerts only
- [ ] Live regions exist in DOM before content changes
- [ ] Rapid updates debounced (not announcing every keystroke)
- [ ] Loading states announced for operations over 2 seconds
- [ ] Search/filter result counts announced
- [ ] Toast notifications readable before disappearing (minimum 5 seconds)

Report findings before proceeding.

## Phase 6: ARIA Correctness

**Specialist agents:** aria-specialist

Ask the user:

1. Do you have custom interactive widgets? (tabs, accordions, carousels, comboboxes, tree views)
2. Are there any components where you've used ARIA roles or attributes?

Then review:

- [ ] No redundant ARIA on semantic elements
- [ ] ARIA roles used correctly (right role for right pattern)
- [ ] Required ARIA attributes present for each role
- [ ] ARIA states update dynamically with interactions
- [ ] All ID references (`aria-controls`, `aria-labelledby`, `aria-describedby`) point to valid elements
- [ ] Widget patterns follow WAI-ARIA Authoring Practices
- [ ] `role="presentation"` or `role="none"` used only on genuinely presentational elements

Report findings before proceeding.

## Phase 7: Data Tables

**Specialist agents:** tables-data-specialist

Ask the user:

1. Does your application display any tabular data?
2. Do you have sortable or filterable tables?
3. Do you have tables with interactive elements (checkboxes, edit buttons)?
4. How do your tables handle responsive/mobile views?

Then review (only if tables exist):

- [ ] Tables use `<table>`, not `<div>` grids
- [ ] Every table has `<caption>` or `aria-label`
- [ ] Column headers use `<th scope="col">`, row headers use `<th scope="row">`
- [ ] Complex tables use `headers` attribute
- [ ] Sortable columns use `aria-sort`
- [ ] Interactive tables use `role="grid"` appropriately
- [ ] Responsive tables are accessible on mobile
- [ ] Pagination has `aria-current="page"`
- [ ] Empty states have descriptive messages

Report findings before proceeding.

## Phase 8: Links and Navigation

**Specialist agents:** link-checker

Ask the user:

1. Do you have card components with "Read more" or "Learn more" links?
2. Do any links open in new tabs?
3. Do you link to PDFs or other non-HTML resources?

Then review:

- [ ] No ambiguous link text ("click here", "read more", "learn more")
- [ ] Repeated identical link text differentiated with `aria-label`
- [ ] Links opening in new tabs warn the user
- [ ] Links to non-HTML resources indicate file type and size
- [ ] Adjacent duplicate links combined into single links
- [ ] Correct element usage (links for navigation, buttons for actions)
- [ ] No URLs used as visible link text

Report findings before proceeding.
