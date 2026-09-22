# Desktop Accessibility Specialist reference: Accessibility Audit Mode

Part of the `desktop-a11y-specialist` skill. Read this only when the task reaches these sections.

## Accessibility Audit Mode

When asked to **audit**, **scan**, or **review** a desktop app for accessibility, produce a structured report using these detection rules. These cover **platform-level API patterns** that apply to any desktop toolkit. For wxPython-specific rules (WX-A11Y-*), see wxpython-specialist.

### Detection Rules

Each rule ID, with severity and what it detects.

| Rule ID | Severity | What It Detects |
|---|---|---|
| DTK-A11Y-001 | Critical | **Missing Accessible Name** -- control has no Name (UIA), accName (MSAA), or accessibilityLabel (NSAccessibility) |
| DTK-A11Y-002 | Critical | **Missing or Wrong Role** -- ControlType/accRole/accessibilityRole doesn't match actual behavior |
| DTK-A11Y-003 | Serious | **Missing State Exposure** -- state changes (checked, expanded, disabled) not reflected in accessibility API |
| DTK-A11Y-004 | Serious | **Missing Value Exposure** -- value-bearing controls don't expose current value through ValuePattern/accValue/accessibilityValue |
| DTK-A11Y-005 | Critical | **Keyboard Unreachable Control** -- interactive element not keyboard-focusable |
| DTK-A11Y-006 | Serious | **Focus Lost on UI Change** -- focus falls to window root after deletion, dialog close, or panel collapse |
| DTK-A11Y-007 | Moderate | **Missing Focus Indicator** -- no visible focus ring in standard or high-contrast themes |
| DTK-A11Y-008 | Moderate | **Hardcoded Colors** -- colors hardcoded instead of reading from system theme |
| DTK-A11Y-009 | Serious | **Missing Dynamic Change Announcement** -- content updates happen silently with no screen reader announcement |
| DTK-A11Y-010 | Serious | **Modal Focus Escape** -- dialog doesn't trap focus; Tab reaches parent window |
| DTK-A11Y-011 | Minor | **Missing Keyboard Shortcut Documentation** -- custom shortcuts have no user-discoverable documentation |
| DTK-A11Y-012 | Moderate | **Platform API Mismatch** -- deprecated or wrong-platform API used |

### Report Format

Report must include: Application name, date, platform(s), screen reader(s) tested, severity summary table, and per-finding details (rule ID, severity, location with file:line, platform API, expected vs current behavior, fix).

### Screen Reader Verification Checklist

- NVDA (Windows): Navigate all controls with Tab and arrows -- verify name, role, value, state
- Narrator (Windows): Run scan mode through the main window
- VoiceOver (macOS): Use VO+arrow keys to traverse accessibility tree

---
