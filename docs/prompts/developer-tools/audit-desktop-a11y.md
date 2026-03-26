# audit-desktop-a11y

Run a comprehensive accessibility audit of a desktop application covering platform APIs (UI Automation, MSAA, NSAccessibility), screen reader compatibility, keyboard navigation, focus management, and high contrast support.

## When to Use It

- You are building a desktop application and want to verify its accessibility
- You received accessibility bug reports from screen reader users
- You need to audit a wxPython, Qt, GTK, WinForms, WPF, or Electron application
- You are preparing for an accessibility compliance review of a desktop product

## How to Launch It

**In GitHub Copilot Chat** -- select from the prompt picker:

```text
/audit-desktop-a11y
```

Then provide the source directory when prompted.

**In Claude Code:**

```text
@desktop-a11y-specialist audit the accessibility of src/
```

## What to Expect

### Step 1: Context Gathering

The agent asks about your platform, UI framework, target screen readers, and any known issues.

### Step 2: Accessibility API Review

Scans source code for:

- Name/Role/Value/State exposure on all interactive controls
- Custom control accessibility interface implementation
- Dynamic state change announcements
- Container relationship exposure (parent/child in trees, lists, grids)

### Step 3: Keyboard Navigation Audit

Checks tab order, arrow key navigation, keyboard shortcuts, focus visibility, and modal focus trapping.

### Step 4: High Contrast and Visual Review

Verifies system theme respect, hardcoded colors, icon visibility, and font scaling behavior.

### Step 5: Structured Report

Produces a prioritized report with findings by category, remediation steps, and a screen reader test plan.

## Related Prompts

- [test-desktop-a11y](test-desktop-a11y.md) -- Create a test plan for the findings
- [scaffold-nvda-addon](scaffold-nvda-addon.md) -- Build NVDA addons
- [scaffold-wxpython-app](scaffold-wxpython-app.md) -- Start a new accessible wxPython app

## Related Agents

- **desktop-a11y-specialist** -- The specialist agent that powers this prompt
- **desktop-a11y-testing-coach** -- Testing guidance for desktop apps
- **developer-hub** -- Routes to the right specialist for any developer task
