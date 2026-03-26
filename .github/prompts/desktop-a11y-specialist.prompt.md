---
name: audit-desktop-a11y
description: Run a desktop application accessibility audit covering platform APIs (UI Automation, MSAA, NSAccessibility), screen reader compatibility, keyboard navigation, focus management, and high contrast support.
mode: agent
agent: desktop-a11y-specialist
tools:
  - askQuestions
  - readFile
  - editFiles
  - runInTerminal
  - getTerminalOutput
  - listDirectory
---

# Desktop Application Accessibility Audit

Run a comprehensive accessibility audit of a desktop application, focusing on platform accessibility APIs, screen reader compatibility, keyboard navigation, and visual accessibility.

## Application Details

**Source directory:** `${input:sourceDir}`

## Instructions

### Step 1: Gather Context

Ask the user:

1. **Platform(s)** -- Windows, macOS, or cross-platform?
2. **UI framework** -- wxPython, Qt, GTK, WinForms, WPF, SwiftUI, UIKit, Electron, or other?
3. **Target screen readers** -- NVDA, JAWS, Narrator, VoiceOver?
4. **Known issues** -- Any specific accessibility problems already reported?

### Step 2: Code Review -- Accessibility API Usage

Scan the source code for:

- **Name/Role/Value/State** -- Are all interactive controls exposing proper accessible names, roles, values, and states through the platform API?
- **Custom controls** -- Do custom-drawn controls implement the accessibility interface (IAccessible, UIAutomation, NSAccessibility protocol)?
- **Dynamic updates** -- Are state changes announced to assistive technology (PropertyChanged events, NSAccessibilityNotifications)?
- **Container relationships** -- Do tree views, lists, and grids expose parent/child relationships correctly?

### Step 3: Keyboard Navigation Audit

Check for:

- **Tab order** -- Can every interactive control be reached via Tab/Shift+Tab?
- **Arrow key navigation** -- Do lists, trees, and grids support arrow key navigation?
- **Keyboard shortcuts** -- Are accelerators and mnemonics defined? Do they conflict with screen reader keys?
- **Focus visibility** -- Is the focused element always visually apparent?
- **Focus trapping** -- Do modal dialogs trap focus correctly?

### Step 4: High Contrast and Visual Review

Check for:

- **System theme respect** -- Does the app honor OS high contrast settings?
- **Hardcoded colors** -- Are any colors hardcoded instead of using system theme colors?
- **Icon visibility** -- Do toolbar icons remain visible in high contrast mode?
- **Font scaling** -- Does the UI respond to system font size settings?

### Step 5: Generate Report

Produce a structured report with:

1. **Executive summary** -- Overall accessibility readiness
2. **Platform API findings** -- Missing or incorrect Name/Role/Value/State per control
3. **Keyboard findings** -- Unreachable controls, missing shortcuts, focus issues
4. **Visual findings** -- High contrast failures, font scaling issues
5. **Remediation priorities** -- Ordered by impact and effort
6. **Screen reader test plan** -- Specific test cases for the target screen readers
