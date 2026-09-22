# Modal Specialist reference: Non-Negotiable Rules

Part of the `modal-specialist` skill. Read this only when the task reaches these sections.

## Non-Negotiable Rules

### Focus Landing

Per the W3C APG Dialog Pattern, focus placement depends on the dialog's content and purpose:

| Scenario | Focus Target | Reason |
|----------|-------------|--------|
| Simple confirmation (delete, discard) | The least destructive action (Cancel) | Prevents accidental destructive action via Enter |
| Complex content (settings, forms, long text) | A static element (`tabindex="-1"` on the dialog title or first paragraph) | Lets the user read before acting; avoids skipping content |
| Simple continuation (save, proceed) | The most frequently used action (Save/Continue) | Streamlines the common path |
| Default / general purpose | The first focusable element in the dialog | W3C APG default recommendation |

```javascript
// Complex dialog: focus the heading so screen reader reads it first
const heading = modal.querySelector('h2');
heading.setAttribute('tabindex', '-1');
modal.showModal();
heading.focus();

// Destructive confirmation: focus Cancel
modal.showModal();
modal.querySelector('#cancel-btn').focus();
```

**Do NOT always focus the Close button.** The Close button is often a last resort, not the primary action. Follow the scenario-based rules above.

### Visible Close Button

Per W3C APG, every dialog SHOULD have a visible close button. An icon-only close button needs `aria-label="Close"`. Place the close button in a consistent, discoverable location (typically top-right). Ensure it is reachable by keyboard without scrolling.

### Focus Trapping

- `<dialog>` with `showModal()` handles focus trapping natively
- Tab and Shift+Tab cycle only through elements inside the modal
- Nothing behind the modal should be reachable
- Verify no `tabindex` on the backdrop or outer container leaks focus out

### Focus Return

- When modal closes, focus MUST return to the element that triggered it
- Store a reference to the trigger button before opening
- Call `triggerButton.focus()` after `modal.close()`
- This applies to Escape key, Close button, and any action that dismisses

### Escape Key

- Escape MUST close the modal
- `<dialog>` handles this natively, but verify it works
- After Escape, focus returns to trigger (see above)
- For confirmation dialogs where Escape could cause data loss, intercept and confirm first

### `aria-modal` and Background Inertness

`aria-modal="true"` tells assistive technology that content outside the dialog is inert. This is the modern replacement for the legacy pattern of manually applying `aria-hidden="true"` to every sibling of the dialog.

```html
<!-- Modern: aria-modal handles background hiding -->
<dialog role="dialog" aria-modal="true" aria-labelledby="modal-title">
  ...
</dialog>

<!-- Legacy (avoid): manual aria-hidden on siblings -->
<div aria-hidden="true"><!-- page content --></div>
<div role="dialog">...</div>
```

Prefer `aria-modal="true"` on the `<dialog>` element. For even stronger protection, apply the HTML `inert` attribute to the page content behind the modal (see keyboard-navigator for details).

### Heading Structure

- Modal heading starts at H2 (H1 is the page title behind the modal)
- Never use H1 inside a modal
- Follow normal heading hierarchy within the modal (H2, H3, H4)

### Labeling

- `aria-labelledby` pointing to the heading ID
- Omit `aria-describedby` when the dialog body contains semantic structures (lists, tables, form fields) -- `aria-describedby` flattens all referenced content into a single string, which destroys structure
- Use `aria-describedby` only when the description is a short plain-text paragraph (as in alert dialogs)
- Trigger button has `aria-haspopup="dialog"`
- Only mark as modal when BOTH conditions are met: (1) code prevents interaction with outside content, and (2) visual styling obscures the page behind
