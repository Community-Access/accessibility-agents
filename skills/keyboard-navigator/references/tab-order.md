# Keyboard Navigator reference: Tab Order

Part of the `keyboard-navigator` skill. Read this only when the task reaches these sections.

## Tab Order

### Natural Order

- DOM order determines tab order
- Never use `tabindex` values greater than 0. They break natural flow and create unpredictable navigation
- `tabindex="0"` makes non-interactive elements focusable (use sparingly)
- `tabindex="-1"` makes elements programmatically focusable but not in tab order (used for focus management)

### Verification

When auditing, trace the tab order through the entire page:

1. Start at the skip link
2. Tab through every interactive element
3. Verify order matches visual layout (left to right, top to bottom)
4. Verify no elements are skipped
5. Verify no unexpected elements receive focus

Grep for problems:

```text
tabindex="[1-9]    # Positive tabindex -- almost always wrong
outline: none      # Focus indicator possibly removed
outline: 0         # Focus indicator possibly removed
```

## Focus Management

### Page/Route Changes (SPA)

When the route changes in a single-page app:

- Focus must move to the new page content
- Recommended: focus the H1 or main content area
- The H1 or main should have `tabindex="-1"` so it can receive programmatic focus
- Screen reader must announce the new page (the heading text)
- Never leave focus on the navigation link that was just clicked

```javascript
// After route change
const heading = document.querySelector('h1');
heading.setAttribute('tabindex', '-1');
heading.focus();
```

### Dynamic Content

When content appears dynamically (search results, loaded sections, notifications):

- If the user triggered it: move focus to the new content or announce via live region
- If it appeared automatically: use `aria-live` to announce, do not steal focus
- Toast notifications: `aria-live="polite"`, never move focus to them

### Deletion and Removal

When an item is deleted from a list:

- Focus moves to the next item in the list
- If last item was deleted, focus moves to the previous item
- If list is now empty, focus moves to a relevant element (the list container or a heading)
- Never let focus disappear into the void
