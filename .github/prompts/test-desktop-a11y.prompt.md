---
description: Create a desktop accessibility test plan with screen reader test cases, keyboard navigation flows, high contrast verification steps, and automated UIA test scaffolding.
mode: agent
tools:
  - askQuestions
  - readFile
  - editFiles
  - createFile
  - listDirectory
---

# Desktop Accessibility Test Plan

Generate a comprehensive accessibility test plan for a desktop application, including manual screen reader tests, keyboard navigation flows, and automated UI Automation test scaffolding.

## Application Details

**Source directory:** `${input:sourceDir}`

## Instructions

### Step 1: Gather Context

Ask the user:

1. **Platform(s)** -- Windows, macOS, Linux, or cross-platform?
2. **UI framework** -- wxPython, Qt, GTK, WinForms, WPF, SwiftUI, Electron?
3. **Screen readers to test** -- NVDA, JAWS, Narrator, VoiceOver, Orca? (default: NVDA + Narrator on Windows)
4. **Key user flows** -- What are the 3-5 most important tasks a user performs?
5. **Test output format** -- Markdown checklist (default), CSV, or both?

### Step 2: Analyze the Application

Scan the source code to identify:

- All windows, dialogs, and panels
- Interactive controls (buttons, text fields, lists, trees, menus, toolbars)
- Custom controls that may need special testing attention
- Navigation patterns (tab groups, keyboard shortcuts, mnemonics)

### Step 3: Generate Screen Reader Test Cases

For each identified screen reader, create test cases covering:

1. **Window identification** -- Is the window title announced correctly?
2. **Control discovery** -- Can every control be found by navigating with Tab, arrow keys, or screen reader quick nav?
3. **Name announcement** -- Does each control announce a meaningful name?
4. **Role announcement** -- Is the correct role announced (button, checkbox, edit field, list item, etc.)?
5. **State announcement** -- Are states announced (checked, expanded, disabled, selected, etc.)?
6. **Value announcement** -- Are current values read (slider position, text content, selected item)?
7. **Dynamic updates** -- Are changes announced when content updates without user action?
8. **Error messages** -- Are validation errors announced automatically?

### Step 4: Generate Keyboard Test Cases

Create a keyboard-only test matrix:

1. **Tab order walkthrough** -- Document the expected tab sequence
2. **Arrow key navigation** -- List controls that should support arrow keys
3. **Shortcut inventory** -- List all keyboard shortcuts and verify no conflicts with screen reader keys
4. **Focus visibility** -- Verify every focused element has a visible indicator
5. **Modal focus trapping** -- Verify dialogs trap and return focus correctly
6. **Escape behavior** -- Verify Escape closes dialogs and menus

### Step 5: Generate High Contrast Test Cases

1. **Enable high contrast** -- Steps for each platform (Windows High Contrast, macOS Increase Contrast)
2. **Visual walkthrough** -- Check every screen for unreadable text, invisible icons, missing borders
3. **Font scaling** -- Increase system font size to 150% and verify layout

### Step 6: Generate Automated Test Scaffolding (Windows)

If targeting Windows, generate Python scaffolding for automated UIA tests:

- Use `uiautomation` or `pywinauto` library
- Create test functions that verify Name, Role, and State for key controls
- Include comments explaining each assertion

### Step 7: Write the Test Plan

Save the test plan as a markdown file with:

- Checklist format (checkboxes for manual execution)
- Grouped by testing category (screen reader, keyboard, visual, automated)
- Pass/fail columns for recording results
- Notes column for observations
