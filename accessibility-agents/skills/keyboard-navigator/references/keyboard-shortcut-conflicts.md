# Keyboard Navigator reference: Keyboard Shortcut Conflicts

Part of the `keyboard-navigator` skill. Read this only when the task reaches these sections.

## Keyboard Shortcut Conflicts

Custom keyboard shortcuts must not conflict with operating system, assistive technology, or browser shortcuts. Per W3C APG:

### Reserved Keys -- Do Not Override

- **Operating system:** modifier keys + Tab, Enter, Space, Escape; Meta + single key (Win/Cmd shortcuts); Alt + function keys
- **Assistive technology:** CapsLock/Insert/ScrollLock + any key (screen reader commands); Control + Option + any key on macOS (VoiceOver); all single keys in screen reader virtual mode (H, K, T, etc.)
- **Browser:** Ctrl+L (address bar), Ctrl+T (new tab), Ctrl+W (close tab), F5 (refresh), F6 (focus address bar), F11 (fullscreen)

### Safe Patterns

- Single-key shortcuts (like Gmail "j/k") must be able to be turned off, remapped to include a modifier key, or active only when the relevant component has focus, per WCAG 2.1.4 (Character Key Shortcuts)
- Prefer Ctrl+Shift or application-specific modifier combos for custom shortcuts
- Always document keyboard shortcuts and provide a discoverable help panel
