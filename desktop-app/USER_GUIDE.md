# Beacon User Guide

> **Beacon** is a native desktop accessibility scanning application powered by the
> GitHub Copilot agent ecosystem.  It brings WCAG 2.2 AA scanning, AI-assisted
> remediation, and a full screen-reader-compatible UI to your desktop without
> requiring a browser extension or cloud upload.

---

## Table of Contents

1. [Installation](#1-installation)
2. [First Run and Welcome Wizard](#2-first-run-and-welcome-wizard)
3. [Authenticating with GitHub Copilot](#3-authenticating-with-github-copilot)
4. [The Main Window](#4-the-main-window)
5. [Running Your First Scan](#5-running-your-first-scan)
6. [Understanding Scan Results](#6-understanding-scan-results)
7. [Score Dashboard](#7-score-dashboard)
8. [AI Chat Panel](#8-ai-chat-panel)
9. [Agent Browser](#9-agent-browser)
10. [Job Queue](#10-job-queue)
11. [WCAG 2.2 Reference](#11-wcag-22-reference)
12. [Settings](#12-settings)
13. [Agent, Skill, and Prompt Settings](#13-agent-skill-and-prompt-settings)
14. [Managing Dependencies](#14-managing-dependencies)
15. [Screen Reader Support](#15-screen-reader-support)
16. [Keyboard Shortcuts](#16-keyboard-shortcuts)
17. [Scan History](#17-scan-history)
18. [System Tray](#18-system-tray)
19. [Troubleshooting](#19-troubleshooting)

---

## 1. Installation

### Requirements

| Component | Minimum version |
|-----------|----------------|
| Python    | 3.10            |
| wxPython  | 4.2.1           |
| Platform  | Windows 10/11, macOS 12+, Ubuntu 22.04+ |

### Windows Installer (recommended)

Download the latest `Beacon-x.x.x-Setup.exe` from
[GitHub Releases](https://github.com/Community-Access/accessibility-agents/releases).

1. Run the installer and follow the prompts.
2. Beacon is added to the Start Menu; optionally create a Desktop shortcut.
3. Launch **Beacon** from the Start Menu or double-click the Desktop icon.

No separate Python installation is required when using the installer.

### Install from source

```bash
cd desktop-app
pip install -e .
```

This installs all required dependencies including:

- `wxPython` - native UI framework
- `accessible-output2` - screen reader speech output (NVDA, JAWS, SAPI, Orca)
- `httpx` - HTTP client for GitHub API calls
- `keyring` - secure token storage

### Launch Beacon

```bash
# From the command line
python -m beacon

# Or if installed as a script
beacon
```

---

## 2. First Run and Welcome Wizard

On the very first launch, the **Welcome Wizard** guides you through six steps:

| Page | What happens |
|------|-------------|
| Welcome | Introduces Beacon and its feature set |
| Authentication | Signs you in to GitHub Copilot via Device Flow |
| Speech Test | Tests your screen reader connection (NVDA, JAWS, SAPI) |
| Agent Tour | Highlights the 49 built-in accessibility agents |
| First Scan | Lets you choose a file, folder, or URL to scan right away |
| Ready | Confirms everything is configured and launches the main window |

You can skip the wizard and configure everything later in **Settings**.

Once you complete the wizard, it will not appear again.  To re-run it, delete the
`first_run_complete` file in your Beacon config directory:

- **Windows**: `%APPDATA%\Beacon\`
- **macOS**: `~/Library/Application Support/Beacon/`
- **Linux**: `~/.config/Beacon/`

---

## 3. Authenticating with GitHub Copilot

Beacon uses GitHub's OAuth Device Flow so your credentials never pass through
a third-party server.

### Steps

1. Open **AI > Authenticate** (or press `Ctrl+Shift+A`).
2. A dialog shows a short alphanumeric **device code** and a URL:
   `https://github.com/login/device`
3. Open that URL in your browser, sign in to GitHub, and enter the code.
4. Beacon polls silently for up to 15 minutes while you complete the browser flow.
5. When authentication succeeds, the status bar shows *Authenticated with GitHub Copilot*.

Your access token is stored in the operating system's secure credential store
(Windows Credential Manager, macOS Keychain, or the system Secret Service on Linux).

Authentication is only required for the Copilot SDK backend.  The CLI backends
(Claude, Gemini, gh copilot) use their own credentials configured outside Beacon.

### Sign Out

**AI > Sign Out** removes the stored token.  You can sign in again at any time.

---

## 4. The Main Window

The main window uses a dockable panel layout (AUI).  All panels can be floated,
re-docked, or resized.  The layout is saved automatically when you exit.

### Layout overview

```text
┌──────────────────────────────────────────────────────┐
│  Menu bar │ Toolbar                                   │
├───────────┬──────────────────────────┬───────────────┤
│  Agent    │  Tabbed centre area:     │  Job Queue    │
│  Browser  │  · Scan Results          │               │
│           │  · Score Dashboard       │               │
│           │  · AI Chat               │               │
│           │  · WCAG Reference        │               │
└───────────┴──────────────────────────┴───────────────┘
│  Status bar                                           │
└──────────────────────────────────────────────────────┘
```

### Reset layout

**View > Reset Layout** restores the default panel arrangement.

---

## 5. Running Your First Scan

Beacon supports four scan types:

| Type | How to launch |
|------|--------------|
| File or folder | **File > Scan File or Folder** (`Ctrl+O`) |
| Web URL | **File > Scan Web URL** (`Ctrl+U`) |
| Markdown file | **File > Scan Markdown** (`Ctrl+M`) |
| Re-scan last target | **Scan > Re-scan Last Target** (`F5`) |

### Scan a file or folder

1. Press `Ctrl+O`.
2. Select a `.docx`, `.xlsx`, `.pptx`, or `.pdf` file, or a folder containing these.
3. Beacon queues the job and begins scanning.
4. The **Scan Results** tab shows findings as they arrive.

### Scan a web URL

1. Press `Ctrl+U`.
2. Enter the full URL (including `https://`).
3. Beacon runs `axe-core` against the page and presents findings by WCAG criterion.

### Scan a markdown file

1. Press `Ctrl+M`.
2. Select a `.md` file.
3. Beacon checks for ambiguous links, missing alt text, heading hierarchy,
   table descriptions, emoji, ASCII diagrams, and broken anchors.

### Stop a scan

- Click the **Stop** button in the toolbar, or press `Escape` while focus is in the toolbar.
- Running jobs can also be cancelled individually in the **Job Queue** panel.

---

## 6. Understanding Scan Results

The **Scan Results** panel has three areas:

### Target list (left)

Lists every scanned file or URL.  Each row shows:

- **Target** - file name or URL
- **Score** - 0-100 (A - F)
- **Issues** - total finding count

Click a row to load its findings into the findings list.

### Findings list (right)

Each finding shows:

| Column | Description |
|--------|-------------|
| Severity | Critical / Serious / Moderate / Minor |
| Rule | WCAG success criterion or tool rule ID |
| Location | File path + line, or CSS selector |
| Summary | One-sentence description |

Severity is conveyed by both **text label** and **background colour** - never by
colour alone.  Screen readers announce the severity when you focus a row.

#### Context menu

Right-click (or press the **Applications key**) on any finding to:

- **Copy Issue Details** - copies Rule, Severity, Location, Description, and Remediation to the clipboard
- **Explain This Issue** - sends the issue to the AI Chat panel for a plain-language explanation
- **Suggest Fix** - asks the AI to propose a code fix

### Detail pane (bottom)

Shows the full description, WCAG criterion, and remediation guidance for the
selected finding.

### Export results

**File > Export Results** (`Ctrl+E`) exports all current scan results to:

- **CSV** - for import into spreadsheets or CI pipelines
- **HTML** - a self-contained accessibility report

---

## 7. Score Dashboard

The **Score Dashboard** tab gives you a visual overview of your accessibility health.

### Score badge

A large circular badge displays your overall score (0-100) and grade (A - F):

| Grade | Score range | Meaning |
|-------|-------------|---------|
| A     | 90 - 100    | Excellent - only minor issues |
| B     | 75 - 89     | Good - a few moderate issues |
| C     | 60 - 74     | Acceptable - moderate issues present |
| D     | 40 - 59     | Poor - serious issues |
| F     | 0 - 39      | Failing - critical issues |

### 30-day trend sparkline

A line chart showing your score history over the past 30 days.  A green upward
slope is good; a red downward slope means new issues have been introduced.

### Domain bar chart

Horizontal bars break down your score by WCAG principle:

- **Perceivable** - images, captions, colour contrast
- **Operable** - keyboard navigation, focus, timing
- **Understandable** - language, labels, error messages
- **Robust** - valid HTML, ARIA usage

---

## 8. AI Chat Panel

The **AI Chat** panel lets you have a conversation with Beacon's AI assistant
using any available backend.

### AI Backends

Beacon supports four AI backends detected automatically in priority order:

| Priority | Backend | Requirement |
|----------|---------|------------|
| 1 | GitHub Copilot SDK | `pip install copilot` + GitHub auth |
| 2 | Claude Code CLI | `npm install -g @anthropic-ai/claude-code` |
| 3 | Google Gemini CLI | Install from Google |
| 4 | GitHub Copilot CLI | `gh` CLI + copilot extension |

The active backend is shown in the status bar.  Switch backends via **AI > Backend**.

If no backend is detected, the chat input is disabled and an informative banner
explains how to install one.

### Starting a conversation

1. Type your question or paste a code snippet into the input field.
2. Press **Enter** or click **Send**.

The response is displayed in the conversation area.  Screen readers hear the
full response text spoken aloud via accessible-output2 (truncated at 500
characters for very long replies).

### Suggested prompts

The chat panel shows context-aware suggested prompts based on your recent scans.
Click any suggestion to pre-fill the input field.

### Starting from a finding

Right-click a finding in the Scan Results panel and choose **Explain This Issue**
or **Suggest Fix** to automatically open the chat panel with the finding's details
pre-loaded.

### Clearing the conversation

Click the **Clear** button or press `Ctrl+K` while the chat panel is focused.

---

## 9. Agent Browser

The **Agent Browser** panel (left dock) lets you explore all 49 accessibility
agents built into Beacon.

### Browsing agents

Agents are grouped by team:

- Document Accessibility Audit team
- Web Accessibility Audit team
- GitHub Workflow team
- Design System team
- Mobile Accessibility team

Click an agent to see its description, capabilities, and example prompts.
Double-click an agent to open it in the AI Chat panel.

### Search

Type in the **Search** box at the top to filter agents by name or keyword.

---

## 10. Job Queue

The **Job Queue** panel (right dock) shows all pending, running, and completed
scan jobs.

### Columns

| Column | Description |
|--------|-------------|
| Job | Short ID |
| Name | Target name |
| Status | Queued / Running / Complete / Error / Cancelled |
| Progress | Percentage complete |
| Duration | Elapsed time |

### Actions

- **Cancel** - cancel a queued or running job
- **Cancel All** - cancel all pending and running jobs
- **Clear Completed** - remove finished and cancelled jobs from the list
- **Pause / Resume** - temporarily suspend job processing

The queue refreshes every 500 ms.  Screen readers hear an announcement when a
job completes or errors.

---

## 11. WCAG 2.2 Reference

The **WCAG Reference** tab is a built-in searchable catalog of all 78 WCAG 2.2
success criteria.

### Browsing

All criteria are grouped by principle (Perceivable, Operable, Understandable,
Robust) and listed with their number, title, and conformance level (A, AA, AAA).

### Search and filter

- **Search box** - filter by SC number, title, or keyword
- **Level filter** - show only A, AA, or AAA criteria
- **New in 2.2** - filter to show only the 9 criteria new in WCAG 2.2

### Detail pane

Click any criterion to see:

- Full description
- Understanding document link (opens in your browser)
- Conformance level
- Whether it is new in WCAG 2.2

### New in WCAG 2.2

The following success criteria are new in WCAG 2.2 (marked with a star):

| SC | Title | Level |
|----|-------|-------|
| 2.4.11 | Focus Not Obscured (Minimum) | AA |
| 2.4.12 | Focus Not Obscured (Enhanced) | AAA |
| 2.4.13 | Focus Appearance | AAA |
| 2.5.7 | Dragging Movements | AA |
| 2.5.8 | Target Size (Minimum) | AA |
| 3.2.6 | Consistent Help | A |
| 3.3.7 | Redundant Entry | A |
| 3.3.8 | Accessible Authentication (Minimum) | AA |
| 3.3.9 | Accessible Authentication (Enhanced) | AAA |

---

## 12. Settings

Open settings with **Edit > Settings** (`Ctrl+,`).

The settings dialog has seven tabs:

### General

| Setting | Description |
|---------|-------------|
| Theme | Light, Dark, or System |
| Font size | Base UI font size (10-18 pt) |
| Language | UI language |
| Start minimized | Launch to system tray |
| Check for updates | Enable automatic update checks |
| Show welcome screen | Re-enable the first-run wizard |

### Scanning

| Setting | Description |
|---------|-------------|
| Scan profile | Strict / Moderate / Minimal |
| Max concurrent scans | Thread pool size (1-8) |
| Scan timeout | Seconds before a scan is abandoned |
| Exclude patterns | Glob patterns for files to skip |
| Auto-save results | Save every scan to history |
| Report format | Default export format |

### AI

| Setting | Description |
|---------|-------------|
| Default model | Model used when no agent-specific override is set |
| Max tokens | Default maximum response length |
| Temperature | Default creativity level (0.0-1.0) |
| Streaming | Enable/disable streamed responses |

### Appearance

| Setting | Description |
|---------|-------------|
| Show tray icon | Enable the system tray icon |
| High contrast | Force high-contrast mode |
| Reduce motion | Disable animations |
| Density | Comfortable / Compact |

### Keyboard

View and customise all keyboard shortcuts.  Click a shortcut row and press the
new key combination to reassign it.

### Advanced

| Setting | Description |
|---------|-------------|
| Log level | DEBUG / INFO / WARNING / ERROR |
| Config directory | Where Beacon stores settings and history |
| Clear scan history | Removes all saved scan results |
| Reset all settings | Restores factory defaults |

### Agents and Skills

See the next section.

---

## 13. Agent, Skill, and Prompt Settings

The **Agents and Skills** tab in Settings gives you fine-grained control over
every agent, skill, and prompt in the ecosystem.

### Agents tab

The left side shows a tree of all user-invokable agents grouped by team.
Disabled agents are shown greyed out.

Selecting an agent exposes these controls on the right:

| Control | Description |
|---------|-------------|
| Enabled | Include/exclude this agent from the Agent Browser and Chat |
| Model override | Use a specific model for this agent instead of the default |
| Auto-invoke | Let Beacon automatically select this agent for relevant findings |
| Temperature | Per-agent creativity setting (0.0-1.0) |
| Max tokens | Per-agent response length limit |
| System prompt prefix | Extra instructions prepended to this agent's system prompt |
| Notes | Your personal notes about this agent |

### Skills tab

The left side lists all 16 knowledge skills.  Disabled skills are not loaded
when agents run.

Each skill has a set of typed parameters you can configure:

| Skill | Key parameters |
|-------|---------------|
| web-scanning | max_pages, follow_links, include_iframes, timeout_seconds |
| web-severity-scoring | critical_weight, serious_weight, moderate_weight, minor_weight |
| document-scanning | include_pdf, include_docx, include_xlsx, include_pptx, deep_scan |
| accessibility-rules | enable_wcag_a, enable_wcag_aa, enable_wcag_aaa, enable_best_practices |
| report-generation | include_executive_summary, include_delta, max_findings_per_section |
| framework-accessibility | target_frameworks, strict_mode |
| cognitive-accessibility | reading_level, plain_language_check, coga_guidance |
| design-system | contrast_aa, contrast_aaa, check_focus_rings, check_motion_tokens |
| mobile-accessibility | platform, min_touch_target_pt, check_roles |
| markdown-accessibility | emoji_mode, check_anchors, check_mermaid, check_ascii_art |
| github-workflow-standards | output_format, max_issues_per_report |
| github-scanning | default_state, max_results, include_archived |
| github-analytics-scoring | health_weights, velocity_window_days |
| help-url-reference | (informational only) |
| github-a11y-scanner | auto_correlate, severity_mapping |
| lighthouse-scanner | categories, performance_budget |

### Prompts tab

The left side lists all 54 built-in prompts.  A search box and category filter
help you find specific prompts.

For each prompt you can:

| Control | Description |
|---------|-------------|
| Enabled | Show/hide this prompt in the UI |
| Pinned | Add to the top of prompt lists |
| Display label | Override the prompt's human-readable name |
| Default inputs | Pre-fill `${input:varName}` variables with your own defaults |
| Notes | Your notes about when to use this prompt |

---

## 14. Managing Dependencies

Beacon uses several external command-line tools for scanning and AI chat.  The
**Manage Dependencies** dialog shows which tools are installed and helps you
install missing ones.

Open it from **Tools > Manage Dependencies**.

### Detected tools

| Tool | Purpose |
|------|--------|
| Node.js | Required for axe-core web scans |
| axe-core CLI | Runs WCAG scans on web pages |
| Python | Required for Beacon itself |
| Claude Code CLI | AI chat backend (optional) |
| Gemini CLI | AI chat backend (optional) |
| GitHub CLI (`gh`) | AI chat backend via copilot extension (optional) |
| Pandoc | Document format conversion (optional) |

Each row shows the tool name, detected version (or "Not found"), and an
**Install** button if the tool is missing.  Clicking **Install** opens the
tool's official download page or runs the appropriate package manager command.

### Refreshing

Click **Refresh** to re-detect all tools (useful after installing something
in a separate terminal).

---

## 15. Screen Reader Support

Beacon includes first-class screen reader support via **accessible-output2 (AO2)**.
AO2 speaks directly into whichever screen reader is active on your machine:

| Platform | Supported screen readers |
|----------|-------------------------|
| Windows  | NVDA, JAWS, SAPI (built-in), SAPI 5 |
| macOS    | VoiceOver (via SAPI bridge) |
| Linux    | Orca, Speech Dispatcher |

### Verbosity levels

You can adjust how much Beacon speaks in **Settings > General > Speech verbosity**:

| Level | What is announced |
|-------|-----------------|
| Minimal | Scan complete, errors only |
| Normal (default) | Status changes, job updates, finding counts |
| Verbose | All UI interactions, finding details on selection |

### Live regions

Beacon uses two live region modes following the ARIA pattern:

- **Polite** - status updates, scan progress, job completion.  Queued after current speech.
- **Assertive** - errors, authentication failures, destructive action confirmations.  Interrupts speech.

### Focus management

- When a scan completes, focus is moved to the findings list.
- When a dialog opens, focus moves to its first control.
- When a dialog closes, focus returns to the element that opened it.
- Skip navigation links are provided for every major panel.

### High contrast

Enable **Settings > Appearance > High contrast** to use system high-contrast colours
throughout the UI.  All severity indicators and score grades use both colour and
text label so they remain legible in high-contrast mode.

---

## 16. Keyboard Shortcuts

### Global shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+O` | Scan file or folder |
| `Ctrl+U` | Scan web URL |
| `Ctrl+M` | Scan markdown file |
| `Ctrl+E` | Export scan results |
| `F5` | Re-scan last target |
| `Ctrl+,` | Open settings |
| `Ctrl+Q` | Quit Beacon |
| `Ctrl+Shift+A` | Sign in / sign out |

### Navigation shortcuts

| Shortcut | Action |
|----------|--------|
| `F6` | Cycle between main panels |
| `Ctrl+1` | Switch to Scan Results tab |
| `Ctrl+2` | Switch to Score Dashboard tab |
| `Ctrl+3` | Switch to AI Chat tab |
| `Ctrl+4` | Switch to WCAG Reference tab |
| `Ctrl+F` | Find in current panel |

### Scan Results shortcuts

| Shortcut | Action |
|----------|--------|
| `Arrow keys` | Navigate findings list |
| `Enter` | Open finding detail |
| `Applications key` | Open context menu for selected finding |
| `Ctrl+C` | Copy selected finding |

### AI Chat shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Send message |
| `Shift+Enter` | New line in message |
| `Ctrl+K` | Clear conversation |
| `Escape` | Cancel streaming response |

### Queue shortcuts

| Shortcut | Action |
|----------|--------|
| `Delete` | Cancel selected job |
| `Ctrl+Shift+X` | Cancel all jobs |
| `Ctrl+Shift+C` | Clear completed jobs |

---

## 17. Scan History

Beacon stores all scan results in a local SQLite database:

- **Windows**: `%APPDATA%\Beacon\history.db`
- **macOS**: `~/Library/Application Support/Beacon/history.db`
- **Linux**: `~/.config/Beacon/history.db`

### Viewing history

The Score Dashboard's sparkline chart is driven by scan history.  Hover any point
to see the date, target, and score.

### Clearing history

**Edit > Settings > Advanced > Clear Scan History** removes all records.

### Privacy

Scan history is stored locally only.  No scan data is sent to GitHub or any
third-party service.  Only your questions to the AI Chat panel are sent to the
GitHub Copilot API (using your personal access token).

---

## 18. System Tray

When Beacon is minimised, it continues running in the system tray.

### Tray icon

The tray icon shows the Beacon logo (dark blue circle with a white "B").
A red badge in the corner shows the number of active jobs.

### Tray menu

Right-click the tray icon to:

- **Open Beacon** - restore the main window
- **Scan File** - open a file scan dialog without restoring the window
- **Scan URL** - open a URL scan dialog without restoring the window
- **Quit** - exit Beacon

### Start minimized

Enable **Settings > General > Start minimized** to launch Beacon directly to
the tray without showing the main window.

---

## 19. Troubleshooting

### Beacon doesn't start

1. Ensure Python 3.10+ is installed: `python --version`
2. Reinstall dependencies: `pip install -e desktop-app/`
3. Check the log file: `%APPDATA%\Beacon\beacon.log` (Windows)

### Screen reader not speaking

1. Open **Settings > General** and check the **Speech verbosity** setting.
2. Click **Test Speech** to send a test announcement.
3. If AO2 reports no screen reader, make sure NVDA or JAWS is running *before*
   launching Beacon.
4. On Linux, install Speech Dispatcher: `sudo apt install speechd`

### Authentication fails

1. Check your internet connection.
2. Ensure your GitHub account has an active Copilot subscription.
3. Try **AI > Sign Out** then **AI > Authenticate** again.
4. If the device code expires (15 minutes), restart the sign-in flow.
5. For CLI backends (Claude, Gemini, gh copilot), ensure each tool is logged in
   separately via its own CLI.

### AI chat says "No backend available"

1. Open **Tools > Manage Dependencies** to check which tools are installed.
2. At least one backend must be available: Copilot SDK (with auth), `claude`,
   `gemini`, or `gh` with the copilot extension.
3. Install a CLI backend if you do not have a GitHub Copilot subscription.

### Scan returns no results

1. For web scans, confirm the URL is reachable from your machine.
2. For document scans, confirm the file is not password-protected.
3. Check that the scan profile is not set to **Minimal** (which only reports
   Critical findings).

### Slow scans

1. Reduce **Settings > Scanning > Max concurrent scans** to 1.
2. Increase **Settings > Scanning > Scan timeout** for large files.
3. Use the **Minimal** scan profile for quick triage.

### Missing findings

1. Ensure the scan profile is set to **Strict** or **Moderate**.
2. For web scans, check **Settings > Scanning > Include iframes**.
3. If an agent is disabled, its findings will not appear.  Check
   **Settings > Agents and Skills**.

### Resetting to defaults

**Settings > Advanced > Reset All Settings** restores factory defaults and clears
all agent, skill, and prompt customisations.

---

*Beacon User Guide - generated for Beacon 1.0.0*
