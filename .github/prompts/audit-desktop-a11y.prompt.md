---
name: audit-desktop-a11y
description: Desktop application accessibility audit covering platform APIs, keyboard, and high contrast
mode: agent
agent: desktop-a11y-specialist
tools:
  - askQuestions
  - readFile
  - runInTerminal
  - getTerminalOutput
  - search
---

# Desktop Accessibility Audit

Perform a comprehensive accessibility audit of a desktop application's source code, covering platform API usage, keyboard navigation, screen reader compatibility, and high contrast support.

## Input

**Application Path:** `${input:appPath}`

## Instructions

1. **Scan the source code** at the provided path to identify the UI framework in use (wxPython, Qt, WinForms, WPF, GTK, Cocoa, Electron, etc.).

2. **Audit platform accessibility API usage:**
   - **Windows:** Check for UI Automation (UIA) properties, MSAA/IAccessible2 implementation, and AutomationPeer definitions
   - **macOS:** Check for NSAccessibility protocol conformance and accessibility attributes
   - Flag custom controls that lack accessibility API integration

3. **Check keyboard navigation:**
   - Verify all interactive controls are reachable via Tab/Shift+Tab
   - Check for logical tab order (no positive tabindex equivalents)
   - Verify arrow key navigation within composite widgets (lists, trees, grids)
   - Check for keyboard shortcuts and accelerator keys on menus
   - Flag any mouse-only interactions without keyboard equivalents

4. **Verify screen reader Name/Role/Value/State:**
   - Every control must expose an accessible name
   - Controls must have the correct accessible role
   - Stateful controls must expose current value and state (checked, expanded, selected, disabled)
   - Dynamic content changes must fire appropriate accessibility events

5. **Check high contrast support:**
   - Verify the application responds to system high contrast mode
   - Check that no information is conveyed by color alone
   - Verify custom-drawn controls adapt to high contrast themes
   - Check icon and image visibility in high contrast

6. **Generate an audit report** in markdown with:
   - Summary of findings by severity (Critical, Serious, Moderate, Minor)
   - Each finding with: location in code, description, WCAG criterion, remediation guidance
   - Prioritized remediation list
