# scaffold-wxpython-app

Scaffold an accessible wxPython desktop application with proper sizer layouts, keyboard navigation, screen reader compatibility, and high contrast support built in from the start.

## When to Use It

- You are starting a new wxPython desktop application
- You want accessibility baked in from the beginning, not bolted on later
- You need a well-structured project template with sizer layouts, menus, and keyboard shortcuts
- You are building a tool, utility, or productivity app for desktop users

## How to Launch It

**In GitHub Copilot Chat** -- select from the prompt picker:

```text
/scaffold-wxpython-app
```

**In Claude Code:**

```text
@wxpython-specialist scaffold a new accessible app called "Document Manager"
```

## What to Expect

### Step 1: Requirements Gathering

The agent asks for:

- Application name
- Application type (single window, notebook/MDI, dialog-based, tray app)
- Initial panels and features
- Python version and additional libraries

### Step 2: Project Structure

Creates a clean project layout with separate modules for the app, main frame, panels, dialogs, utilities, and resources.

### Step 3: Accessible Boilerplate

Generates code with built-in accessibility:

- **Sizer-based layout** -- Never absolute positioning
- **Menu mnemonics** -- `&` accelerator keys on every menu item
- **Keyboard shortcuts** -- Standard accelerator table (Ctrl+O, Ctrl+S, Ctrl+Q)
- **Screen reader labels** -- `SetName()`, `SetLabel()`, and `SetHelpText()` on all controls
- **Logical tab order** -- Controls added in reading order
- **System colors** -- `wx.SystemSettings.GetColour()` instead of hardcoded colors
- **Font scaling** -- Relative sizes respecting system DPI

### Step 4: Accessibility Helper Module

Creates utility functions for setting accessible names, announcing messages, and common accessibility patterns.

### Step 5: README

Generates documentation with installation, running, keyboard shortcuts, and an accessibility statement.

## Related Prompts

- [audit-desktop-a11y](audit-desktop-a11y.md) -- Audit the finished app for accessibility
- [package-python-app](package-python-app.md) -- Package it for distribution
- [test-desktop-a11y](test-desktop-a11y.md) -- Create accessibility test cases

## Related Agents

- **wxpython-specialist** -- The specialist agent that powers this prompt
- **developer-hub** -- Routes to the right specialist for any developer task
- **python-specialist** -- Python language expertise for non-GUI code
