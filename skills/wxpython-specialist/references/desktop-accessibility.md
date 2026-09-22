# wxPython Specialist reference: Desktop Accessibility

Part of the `wxpython-specialist` skill. Read this only when the task reaches these sections.

## Desktop Accessibility

**How screen readers get labels from wxPython controls:**

- **Inputs and other controls:** NVDA/VoiceOver read the **preceding `wx.StaticText`** as the label. Add a `wx.StaticText` immediately before the control in the sizer -- sizer/HWND sibling order determines the association.
- **Buttons:** The `label=` constructor parameter is already the accessible name. No extra work needed.
- **Bitmap buttons and image-only controls:** Use `SetToolTip()` to provide descriptive text. For a programmatic accessible name, subclass `wx.Accessible`.

> **Common Mistake to Avoid:** `wx.Window.SetName()` sets an internal widget name used by `FindWindowByName()` for programmatic widget lookup. **It has no effect on screen readers.** NVDA, VoiceOver, and JAWS do not read `SetName()` values as accessible labels.

```python
# CORRECT -- StaticText immediately before the control in the sizer
label = wx.StaticText(panel, label="Username:")
ctrl = wx.TextCtrl(panel)
sizer.Add(label, 0, wx.ALL, 5)
sizer.Add(ctrl, 0, wx.EXPAND | wx.ALL, 5)

# CORRECT -- button label= is already the accessible name
btn = wx.Button(panel, label="Save document")

# WRONG -- SetName() does NOT make controls accessible to screen readers
ctrl.SetName("Username")  # Only affects FindWindowByName() -- screen readers ignore it
```

- Tab order follows sizer order -- use `MoveAfterInTabOrder()` to override
- `wx.AcceleratorTable` for keyboard shortcuts
- `CreateStdDialogButtonSizer()` auto-handles platform button order
- Color alone must never convey state -- add text or icons
- All actions must be reachable by keyboard

### Screen Reader Key Event Pitfalls

Screen readers like NVDA and JAWS install a low-level keyboard hook (`WH_KEYBOARD_LL`) that intercepts every keystroke system-wide **before** any window message reaches the application. When the screen reader consumes a key (e.g., Enter on a focused `wx.ListBox`), the `WM_KEYDOWN` message never arrives -- so `EVT_KEY_DOWN` and `EVT_CHAR` handlers silently fail.

**Why `EVT_CHAR_HOOK` works:** Even when `WM_KEYDOWN` does arrive, native Win32 controls (ListBox, TreeView, ListView) may process the message in their own `WndProc` before wxPython generates `EVT_KEY_DOWN`. `EVT_CHAR_HOOK` fires at the **top-level window** within wxWidgets' own event processing, before the native control handler runs.

**Event priority order:**

1. `EVT_CHAR_HOOK` -- fires first, before native control processing
2. `EVT_KEY_DOWN` -- may never fire if the control consumes the message
3. `EVT_CHAR` -- may never fire
4. `EVT_KEY_UP` -- fires on key release

**Correct pattern:**

```python
class MyFrame(wx.Frame):
    def __init__(self, parent):
        super().__init__(parent, title="Example")
        self.list_box = wx.ListBox(self, choices=["Item 1", "Item 2"])

        # WRONG -- silently fails when NVDA/JAWS is active
        # self.list_box.Bind(wx.EVT_KEY_DOWN, self.on_key)

        # CORRECT -- fires before the native control handler
        self.Bind(wx.EVT_CHAR_HOOK, self.on_char_hook)

    def on_char_hook(self, event):
        key = event.GetKeyCode()
        focused = wx.Window.FindFocus()
        if focused == self.list_box and key == wx.WXK_RETURN:
            self.activate_selected_item()
            return  # consume the key
        if key == wx.WXK_ESCAPE:
            self.Close()
            return
        event.Skip()  # let other keys propagate
```

**Prefer semantic events when available:**

| Widget | Semantic Event | Use Instead Of |
|---|---|---|
| `wx.ListCtrl` | `EVT_LIST_ITEM_ACTIVATED` | `EVT_KEY_DOWN` for Enter |
| `wx.TreeCtrl` | `EVT_TREE_ITEM_ACTIVATED` | `EVT_KEY_DOWN` for Enter |
| `wx.Button` | `EVT_BUTTON` | `EVT_KEY_DOWN` for Enter/Space |
| `wx.CheckBox` | `EVT_CHECKBOX` | `EVT_KEY_DOWN` for Space |

Semantic events fire regardless of activation method (keyboard, mouse, or assistive technology), making them inherently screen-reader-safe.

> **Note:** `wx.ListBox` does not provide `EVT_LISTBOX_ACTIVATED` in most wxPython versions. Use `EVT_CHAR_HOOK` for ListBox, or migrate to `wx.ListCtrl` which provides `EVT_LIST_ITEM_ACTIVATED`.

### Accessibility Audit Mode

When asked to **audit** or **scan** a wxPython project for accessibility, return structured findings using the rules and format below -- not conversational advice.

**Detection Rules:**

| ID | Severity | What to Flag |
|---|---|---|
| WX-A11Y-001 | Critical | Control without a preceding `wx.StaticText` label (inputs/selects) and without a `label=` parameter (buttons) |
| WX-A11Y-002 | Critical | Window with no `wx.AcceleratorTable` |
| WX-A11Y-003 | Critical | Mouse event binding without equivalent keyboard event |
| WX-A11Y-004 | Serious | Dialog without `CreateStdDialogButtonSizer()` or Escape handling |
| WX-A11Y-005 | Serious | `ShowModal()` without `SetFocus()` on a meaningful control |
| WX-A11Y-006 | Serious | Bitmap/BitmapButton without `SetToolTip()` or `wx.Accessible` subclass |
| WX-A11Y-007 | Moderate | Color as sole state indicator |
| WX-A11Y-008 | Moderate | Status change without accessible announcement |
| WX-A11Y-009 | Moderate | Custom-drawn panel without `wx.Accessible` subclass |
| WX-A11Y-010 | Minor | Tab order not explicitly set and sizer order mismatches visual order |
| WX-A11Y-011 | Serious | Virtual list/tree without meaningful `GetItemText` override |
| WX-A11Y-012 | Moderate | Menu item without accelerator key |
| WX-A11Y-013 | Critical | `EVT_KEY_DOWN` or `EVT_CHAR` bound on ListBox/ListCtrl/TreeCtrl/DataViewCtrl for Enter/Space/Escape -- silently fails with NVDA/JAWS. Use `EVT_CHAR_HOOK` or semantic events |
| WX-A11Y-014 | Serious | `wx.ListCtrl` with `EVT_KEY_DOWN` for Enter instead of `EVT_LIST_ITEM_ACTIVATED` |

**Report Format:** Table with columns: #, Rule, Severity, File, Line, Description, Suggested Fix. Each finding must include a concrete code fix, not generic advice.

**Regression Checklist:** After fixes -- tab through all controls (name+role announced), activate all buttons/menus via keyboard, open/close dialogs (focus correct, Escape works), trigger state changes (announced), navigate lists/trees (items read), check custom controls with NVDA Object Navigator.
