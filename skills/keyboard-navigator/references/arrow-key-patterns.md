# Keyboard Navigator reference: Arrow Key Patterns

Part of the `keyboard-navigator` skill. Read this only when the task reaches these sections.

## Arrow Key Patterns

Certain components require arrow key navigation per WAI-ARIA Authoring Practices Guide:

| Component | Arrow Behavior |
|-----------|---------------|
| Tabs | Left/Right moves between tabs |
| Menu | Up/Down moves between items |
| Combobox | Up/Down moves through options |
| Radio group | Up/Down or Left/Right moves selection |
| Tree view | Up/Down moves, Left collapses, Right expands |
| Grid/Table | All four arrows navigate cells |
| Toolbar | Left/Right moves between tools |
| Listbox | Up/Down moves between options |

For all of these:

- Arrow keys move focus between related items
- Tab moves focus OUT of the component to the next component
- Home/End jump to first/last item in the group

### Roving Tabindex

The standard technique for arrow-key navigation within composite widgets. One item has `tabindex="0"` (in tab order), all others have `tabindex="-1"` (not in tab order). Arrow keys swap the `tabindex` values and call `focus()`.

```html
<!-- Roving tabindex on a tab list -->
<div role="tablist">
  <button role="tab" tabindex="0" aria-selected="true">Tab 1</button>
  <button role="tab" tabindex="-1" aria-selected="false">Tab 2</button>
  <button role="tab" tabindex="-1" aria-selected="false">Tab 3</button>
</div>
```

```javascript
function moveFocus(current, next) {
  current.setAttribute('tabindex', '-1');
  next.setAttribute('tabindex', '0');
  next.focus(); // Browser scrolls into view automatically
}
```

Key rules per W3C APG:

- Tab enters the composite widget on the item with `tabindex="0"`
- Arrow keys move `tabindex="0"` to the new item and call `focus()`
- Tab exits the widget entirely -- never cycles within it
- The last focused item retains `tabindex="0"` so returning via Shift+Tab lands on the same item

### `aria-activedescendant` Alternative

An alternative to roving tabindex where DOM focus stays on the container and a visual indicator tracks the "active" descendant. Useful when the container must retain focus (e.g., combobox input, grid with editable cells).

```html
<input role="combobox" aria-activedescendant="option-2" aria-controls="listbox-1">
<ul id="listbox-1" role="listbox">
  <li role="option" id="option-1">Apple</li>
  <li role="option" id="option-2" class="visually-focused">Banana</li>
  <li role="option" id="option-3">Cherry</li>
</ul>
```

Requirements per W3C APG:

- The container element (the one with DOM focus) has `aria-activedescendant` set to the `id` of the visually focused item
- The referenced element must be a DOM descendant of the container OR owned via `aria-owns`
- The container must have `aria-controls` pointing to the popup
- CSS must visually indicate the active descendant (since it does not have true DOM focus, `:focus` does not apply -- use a class)
- Clear `aria-activedescendant` (set to `""`) when no item is highlighted

### When to Use Which

Each pattern, with use when.

| Pattern | Use When |
|---------|----------|
| Roving tabindex | Tab list, menu, toolbar, radio group, tree -- any widget where each item can receive true DOM focus |
| `aria-activedescendant` | Combobox (focus must stay on input), grid with editable cells, any composite where the container must retain focus for typing |

## Disabled Element Focus Conventions

Per W3C APG, the focusability of disabled elements depends on context:

### Remove from Tab Sequence (standalone controls)

Disabled standalone controls (buttons, links, inputs not inside a composite widget) should not be in the tab order. Use `disabled` attribute or `tabindex="-1"` with `aria-disabled="true"`.

### Keep Focusable When Disabled (items inside composites)

Disabled items inside composite widgets should remain focusable so arrow-key navigation is not broken. The user arrows to the item, hears it is disabled, and continues navigating. Applies to:

- Listbox options
- Menu items
- Tabs
- Tree items
- Toolbar buttons (for discoverability -- users need to know the button exists even when unavailable)

```html
<!-- Disabled menu item: focusable via arrow keys, announced as disabled -->
<li role="menuitem" aria-disabled="true">Paste</li>
```
