---
applyTo: "**/*.{css,scss,less}"
---

## Dependencies

- `web-accessibility-baseline.instructions.md` — defines the WCAG contrast ratios and focus requirements that this file enforces at the CSS level

# CSS Accessibility Enforcement

These rules apply automatically to every CSS, SCSS, and Less file. They catch accessibility regressions that escape HTML/JSX-level enforcement.

---

> **Impact:** Keyboard users rely entirely on focus indicators to know where they are on the page. Removing focus indicators without a replacement makes keyboard navigation impossible.

## Focus Visibility

- Never write `outline: none` or `outline: 0` without an accompanying `:focus-visible` rule that provides a visible alternative (minimum `2px solid` outline or box-shadow equivalent).
- If removing the default outline, ALWAYS add a replacement indicator — users who navigate by keyboard rely on visible focus.
- The `:focus-visible` selector is preferred over `:focus` to avoid showing focus rings on mouse clicks.

> **Impact:** Animations can trigger vestibular disorders and disable users with photosensitive epilepsy. The `prefers-reduced-motion` media query is the only browser-level mitigation.

## Motion and Animation

- Every `animation` or `transition` declaration should have a corresponding `@media (prefers-reduced-motion: reduce)` block that disables or reduces the motion. Exception: opacity transitions under 200ms are generally safe without an override.
- Parallax effects, auto-playing carousels, and infinite animations are particularly harmful — provide a static alternative.

> **Impact:** Small touch targets cause frequent misfires on mobile, disproportionately affecting users with motor impairments.

## Touch Target Size

- Interactive elements should have `min-height: 44px` and `min-width: 44px` (WCAG 2.5.8 Target Size minimum).
- If sizing via padding, ensure the clickable area meets the 44x44px minimum, not just the visible content.

> **Impact:** Clipped focus indicators make keyboard navigation invisible — users cannot see where they are despite focus actually moving.

## Overflow and Clipping

- `overflow: hidden` near interactive content can clip focus indicators — verify that focus rings remain fully visible.
- `text-overflow: ellipsis` truncates content without exposing the full text to screen readers — ensure the full text is available via `title` attribute or `aria-label` on the parent.

> **Impact:** Low contrast is the single most commonly reported accessibility failure. It affects users with low vision, color blindness, and users in outdoor or bright-light environments.

## Color and Contrast

- Do not use `color` without considering the `background-color` context:
  - **Normal text** (< 18pt / < 14pt bold): minimum **4.5:1** contrast
  - **Large text** (≥ 18pt regular or ≥ 14pt bold, approximately ≥ 24px regular or ≥ 18.67px bold): minimum **3:1** contrast
  - **UI components** (input borders, focus rings, icon buttons, chart lines): minimum **3:1** against adjacent background
- `opacity` values below `1` reduce effective contrast — verify the computed contrast after opacity is applied.
- Avoid `!important` on color/background declarations in utility classes — it prevents user stylesheet overrides for high contrast needs.

> **Impact:** `display:none` silently hides content from AT with no warning. Live regions set to hidden stop all announcements.

## Display and Visibility

- `display: none` removes elements from the accessibility tree entirely — never apply it to live regions (`aria-live`) or elements that screen readers need to announce.
- `visibility: hidden` also hides from assistive technology. Use `.sr-only` / `.visually-hidden` patterns when content must be hidden visually but remain accessible to screen readers.
- `content-visibility: auto` can defer accessibility tree construction — avoid on landmark regions and navigation.

> **Impact:** `cursor: pointer` on non-interactive elements signals affordance that doesn't exist and correlates with missing keyboard interaction.

## Cursor

- `cursor: pointer` on non-interactive elements (divs, spans) suggests interactivity that doesn't exist — this misleads sighted users and correlates with missing keyboard interaction.

> **Impact:** Smooth scrolling can trigger vestibular disorders. Scroll-snap traps prevent keyboard users from navigating past snap points.

## Scrolling

- `scroll-behavior: smooth` respects `prefers-reduced-motion` in most browsers, but always include an explicit `@media (prefers-reduced-motion: reduce) { scroll-behavior: auto; }` override.
- `scroll-snap` can trap keyboard users — ensure Tab and arrow keys can escape snap containers.

> **Impact:** CSS-only modals/overlays that lack focus trapping allow keyboard users to reach content behind the overlay, which is a focus trap in reverse.

## Z-Index and Layering

- High `z-index` values on overlays must be paired with proper focus trapping and `aria-modal="true"` in the HTML — CSS alone cannot make a modal accessible.
