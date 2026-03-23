---
applyTo: "**/*.{css,scss,less}"
---

# CSS Accessibility Enforcement

These rules apply automatically to every CSS, SCSS, and Less file. They catch accessibility regressions that escape HTML/JSX-level enforcement.

---

## Focus Visibility

- Never write `outline: none` or `outline: 0` without an accompanying `:focus-visible` rule that provides a visible alternative (minimum `2px solid` outline or box-shadow equivalent).
- If removing the default outline, ALWAYS add a replacement indicator — users who navigate by keyboard rely on visible focus.
- The `:focus-visible` selector is preferred over `:focus` to avoid showing focus rings on mouse clicks.

## Motion and Animation

- Every `animation` or `transition` declaration MUST have a corresponding `@media (prefers-reduced-motion: reduce)` block that disables or reduces the motion.
- Parallax effects, auto-playing carousels, and infinite animations are particularly harmful — provide a static alternative.
- Exception: opacity transitions under 200ms are generally safe without a reduced-motion override.

## Touch Target Size

- Interactive elements should have `min-height: 44px` and `min-width: 44px` (WCAG 2.5.8 Target Size minimum).
- If sizing via padding, ensure the clickable area meets the 44x44px minimum, not just the visible content.

## Overflow and Clipping

- `overflow: hidden` near interactive content can clip focus indicators — verify that focus rings remain fully visible.
- `text-overflow: ellipsis` truncates content without exposing the full text to screen readers — ensure the full text is available via `title` attribute or `aria-label` on the parent.

## Color and Contrast

- Do not use `color` without considering the `background-color` context — ensure 4.5:1 contrast for normal text, 3:1 for large text and UI components.
- `opacity` values below `1` reduce effective contrast — verify the computed contrast after opacity is applied.
- Avoid `!important` on color/background declarations in utility classes — it prevents user stylesheet overrides for high contrast needs.

## Display and Visibility

- `display: none` removes elements from the accessibility tree entirely — never apply it to live regions (`aria-live`) or elements that screen readers need to announce.
- `visibility: hidden` also hides from assistive technology. Use `.sr-only` / `.visually-hidden` patterns when content must be hidden visually but remain accessible to screen readers.
- `content-visibility: auto` can defer accessibility tree construction — avoid on landmark regions and navigation.

## Cursor

- `cursor: pointer` on non-interactive elements (divs, spans) suggests interactivity that doesn't exist — this misleads sighted users and correlates with missing keyboard interaction.

## Scrolling

- `scroll-behavior: smooth` respects `prefers-reduced-motion` in most browsers, but always include an explicit `@media (prefers-reduced-motion: reduce) { scroll-behavior: auto; }` override.
- `scroll-snap` can trap keyboard users — ensure Tab and arrow keys can escape snap containers.

## Z-Index and Layering

- High `z-index` values on overlays must be paired with proper focus trapping and `aria-modal="true"` in the HTML — CSS alone cannot make a modal accessible.
