# ARIA Specialist reference: Flex and Grid Text Runs

Part of the `aria-specialist` skill. Read this only when the task reaches these sections.

## Flex and Grid Text Runs

Two inline spans read as one phrase and the accessibility tree agrees. Make their parent a `display: flex` or `display: grid` container and the same markup reaches assistive technology differently, in two ways:

- WebKit exposes each flex or grid child as its own accessibility object, so iOS VoiceOver makes the user swipe between them. A message header of timestamp plus author becomes two or three extra stops before the message body.
- Flex and grid containers discard whitespace-only text nodes between children, so those same children can collapse into one spoken word -- "Selfme", "Unassigned2 items".

Neither is visible on screen and neither shows up in Chrome: Chromium collapses adjacent flex children into a single text node, so it hides the split and the glue. Confirm in Safari or iOS VoiceOver, or in the Accessibility Inspector, which lists exactly the elements VoiceOver stops on.

This is [WCAG 1.3.1 Info and Relationships](https://www.w3.org/TR/WCAG22/#info-and-relationships) and [WCAG 1.3.2 Meaningful Sequence](https://www.w3.org/TR/WCAG22/#meaningful-sequence): the visual phrase is one unit of meaning, and the accessibility tree must preserve that.

### Fixes

- Wrap the pieces that belong to one phrase in a single inline element, and let that element be the single flex child. Author and timestamp become one `span` with two children, not two flex items.
- Where the elements must stay siblings, put a real character between them in a visually hidden span so the text run keeps its boundary. A comma reads naturally, and the separator must not be `aria-hidden`.
- Do not rely on CSS `gap` for the boundary. `gap` is visual spacing and does not survive into the accessibility tree.

```html
<!-- BAD: two flex items, no text node between them -->
<div class="msg-header">
  <span class="author">Ada</span><span class="time">6:37 PM</span>
</div>

<!-- GOOD: one flex child holding one phrase -->
<div class="msg-header">
  <span class="msg-meta"><span class="author">Ada</span>, <span class="time">6:37 PM</span></span>
</div>
```

### Check

- Does a flex or grid row split one phrase into separate accessibility objects, so a screen reader user swipes through what reads as one line?
- Do adjacent words in a flex or grid row run together in speech because the container dropped the whitespace between them?
- Is any boundary carried only by CSS `gap` rather than by a real separator character?
