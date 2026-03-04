---
description: Scaffold an accessible wxPython desktop application with proper sizer layouts, keyboard navigation, screen reader compatibility, and high contrast support built in from the start.
mode: agent
tools:
  - askQuestions
  - readFile
  - editFiles
  - createFile
  - listDirectory
  - runInTerminal
  - getTerminalOutput
---

# Scaffold Accessible wxPython Application

Create a new wxPython desktop application project with accessibility built in from the start -- proper sizer layouts, keyboard navigation, screen reader labels, and high contrast support.

## Instructions

### Step 1: Gather Requirements

Ask the user:

1. **Application name** -- Display name for the window title and About dialog
2. **Application type** -- Choose a starting template:
   - **Single window** (default) -- Main frame with menu bar, toolbar, status bar, and content area
   - **MDI/notebook** -- Multiple document interface with tabbed panels
   - **Dialog-based** -- Single dialog with form controls
   - **Tray application** -- System tray icon with popup menu
3. **Initial panels/features** -- What should the first version include? (e.g., file list, text editor, settings dialog)
4. **Python version** -- 3.10+ recommended
5. **Additional libraries** -- Any extras needed? (e.g., ObjectListView, wx.lib.agw)

### Step 2: Create Project Structure

```
app_name/
  __init__.py
  __main__.py            # Entry point
  app.py                 # wx.App subclass
  main_frame.py          # Main window
  panels/                # Content panels
    __init__.py
  dialogs/               # Modal dialogs
    __init__.py
    about.py
  utils/
    __init__.py
    accessibility.py     # Accessibility helper utilities
  resources/             # Icons, images
  requirements.txt
  README.md
```

### Step 3: Generate Accessible Boilerplate

Create the main frame with:

- **Sizer-based layout** -- Never use absolute positioning. Use `wx.BoxSizer`, `wx.GridBagSizer`, and `wx.StaticBoxSizer`
- **Menu bar with mnemonics** -- Every menu item has an `&` accelerator key
- **Keyboard shortcuts** -- Standard shortcuts (Ctrl+O, Ctrl+S, Ctrl+Q) via accelerator table
- **Screen reader labels** -- `SetName()` and `SetLabel()` on all controls; `SetHelpText()` for additional context
- **Tab order** -- Controls added in logical reading order; no manual `MoveAfterInTabOrder()` unless needed
- **Status bar** -- For non-intrusive status messages
- **System colors** -- Use `wx.SystemSettings.GetColour()` instead of hardcoded colors
- **Font scaling** -- Use `wx.Font` relative sizes, respect system DPI

### Step 4: Accessibility Helper Module

Generate `utils/accessibility.py` with:

- Helper to set accessible name and description on any control
- Helper to announce messages via `wx.AccessibilityEvent` (or fallback)
- Constants for standard role descriptions

### Step 5: Generate README

Create `README.md` with:

- Project description and features
- Installation instructions (`pip install -r requirements.txt`)
- Running instructions (`python -m app_name`)
- Keyboard shortcuts reference
- Accessibility statement
- Development setup
