# ARIA Specialist reference: Flex and Grid Text Runs

Part of the `aria-specialist` skill. Read this only when the task reaches these
sections.

## Flex and Grid Text Runs

Two inline spans read as one phrase, and the accessibility tree agrees. Make
their parent a `display: flex` or `display: grid` container and the same markup
can reach assistive technology differently, in two ways. Both follow from the
CSS layout rules, not from a browser bug:

- **The phrase splits.** Every child of a flex or grid container becomes a flex
  or grid item and is blockified, so it is laid out as its own block. iOS
  VoiceOver in Safari and WebKit views tends to stop on each one, so a message
  header of author and timestamp costs a swipe per piece before the message
  body.
- **The words glue together.** A run of only white space between flex or grid
  children is not rendered, so there is no space in the text the browser
  exposes. Adjacent children can then be spoken as one word: "Ada6:37 PM",
  "Unassigned2 items".

Neither shows on screen, because CSS `gap` draws the visual space. Engines
differ in how they build names from blockified children, so a desktop
Chrome check can miss both. Confirm in Safari with VoiceOver, on iOS, or in the
Xcode Accessibility Inspector, which lists the elements VoiceOver stops on.

Report the glued word as
[WCAG 1.3.1 Info and Relationships](https://www.w3.org/TR/WCAG22/#info-and-relationships):
the word boundary is information the presentation shows and the text does not
carry. Report a phrase split into many stops as
[WCAG 1.3.2 Meaningful Sequence](https://www.w3.org/TR/WCAG22/#meaningful-sequence)
only when the split changes the meaning or the reading order; otherwise it is a
`minor` usability finding with `wcag` set to `n/a`.

### Fixes

- Wrap the pieces of one phrase in a single inline element, and make that
  element the one flex or grid child. Author and timestamp become one `span`
  with two children, not two flex items.
- Where the elements must stay separate items, put a real separator character
  between them inside one of the items, or in a visually hidden span. A comma
  reads naturally. Do not put the separator in an `aria-hidden` element.
- Do not rely on `gap`, `margin` or `padding` for the boundary. They are visual
  spacing and add no text.

```html
<!-- Two flex items with no text between them: two stops, and "Ada6:37 PM" -->
<div class="msg-header">
  <span class="author">Ada</span>
  <span class="time">6:37 PM</span>
</div>

<!-- One flex child holding one phrase, with a real separator -->
<div class="msg-header">
  <span class="msg-meta"><span class="author">Ada</span>, <span class="time">6:37 PM</span></span>
</div>
```

The line break and indentation between the two spans in the first example are
the white space the flex container drops.

### Check

- Does a flex or grid row split one phrase into separate stops for a screen
  reader user?
- Do adjacent words in a flex or grid row run together in speech, because the
  only space between them was white space between items?
- Is a boundary carried only by `gap` or margins rather than by a character?

### Sources

- [CSS Flexbox Level 1, Flex Items](https://www.w3.org/TR/css-flexbox-1/#flex-items):
  children are blockified, and a run of only white space between them is not
  rendered.
- [CSS Grid Layout Level 2, Grid Items](https://www.w3.org/TR/css-grid-2/#grid-items):
  the same rules for grid containers.

Contributed by [@chrisnestrud](https://github.com/chrisnestrud)
([#209](https://github.com/Community-Access/accessibility-agents/pull/209)).
