# test-desktop-a11y

Create a comprehensive desktop accessibility test plan with screen reader test cases, keyboard navigation flows, high contrast verification steps, and automated UI Automation test scaffolding.

## When to Use It

- You completed a desktop accessibility audit and need to verify the findings
- You are setting up QA processes for a desktop application
- You need screen reader test cases for NVDA, JAWS, Narrator, VoiceOver, or Orca
- You want automated UIA tests to catch regressions in CI

## How to Launch It

**In GitHub Copilot Chat** -- select from the prompt picker:

```text
/test-desktop-a11y
```

Then provide the source directory when prompted.

**In Claude Code:**

```text
@desktop-a11y-testing-coach create a test plan for my wxPython app
```

## What to Expect

### Step 1: Context Gathering

The agent asks about your platform, UI framework, target screen readers, key user flows, and preferred output format.

### Step 2: Application Analysis

Scans source code to identify all windows, dialogs, interactive controls, custom controls, and navigation patterns.

### Step 3: Screen Reader Test Cases

Generates test cases covering window identification, control discovery, name/role/state/value announcement, dynamic updates, and error messages -- for each target screen reader.

### Step 4: Keyboard Test Matrix

Creates a keyboard-only test matrix with tab order walkthrough, arrow key navigation, shortcut inventory, focus visibility checks, and modal focus trapping verification.

### Step 5: High Contrast Tests

Generates visual verification steps for high contrast mode, including font scaling at 150% and icon visibility.

### Step 6: Automated Test Scaffolding

For Windows targets, generates Python scaffolding using `uiautomation` or `pywinauto` with assertions for Name, Role, and State on key controls.

### Step 7: Test Plan Document

Saves a markdown test plan with checkbox format for manual execution, organized by category.

## Related Prompts

- [audit-desktop-a11y](audit-desktop-a11y.md) -- Run the audit that feeds into this test plan
- [scaffold-nvda-addon](scaffold-nvda-addon.md) -- Build NVDA addons for custom accessibility

## Related Agents

- **desktop-a11y-testing-coach** -- The specialist agent that powers this prompt
- **desktop-a11y-specialist** -- Platform accessibility API expertise
- **developer-hub** -- Routes to the right specialist for any developer task
