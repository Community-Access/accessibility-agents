# Antigravity CLI (`agy`) Accessibility Integration Guide

This guide describes how to install, configure, and use the **Accessibility Agents** plugin with the Google Antigravity CLI (`agy`), Antigravity 2.0, and the Antigravity IDE.

## Overview

The Antigravity CLI agent integration adds **80 specialized accessibility agents** and **26 reusable skills** to your `agy` environment. It ensures WCAG 2.2 AA standards are automatically enforced whenever you build, review, or refactor user interfaces, documents, or workflows.

## Installation

### Method 1: Installer Script (Recommended)

PowerShell (Windows):

```powershell
.\install.ps1 -Antigravity
```

Bash (Linux / macOS):

```bash
./install.sh --antigravity
```

The installer detects your `agy` environment and copies the plugin bundle to `~/.gemini/antigravity-cli/plugins/accessibility-agents/` or your workspace `.antigravity/` directory.

### Method 2: Global Plugin Setup

To install globally for all projects:

```bash
mkdir -p ~/.gemini/antigravity-cli/plugins/accessibility-agents
cp -r antigravity-plugin/* ~/.gemini/antigravity-cli/plugins/accessibility-agents/
```

### Method 3: Workspace Setup

To enable accessibility agents specifically for a single repository, copy `.antigravity/` to your project root:

```bash
cp -r .antigravity /path/to/your/project/
```

## How It Works in `agy`

1. **Agent Discovery (`/agents`)**: In `agy`, run `/agents` to open the Agent Manager Panel. All 80 accessibility agents will be available for selection.
2. **Context Enforcer (`ANTIGRAVITY.md`)**: When launching `agy` in a workspace containing `ANTIGRAVITY.md`, the CLI loads baseline WCAG 2.2 AA rules into the conversation context.
3. **Structured Interaction (`askQuestions`)**: Orchestrators use `askQuestions` to offer structured choices for scope, remediation options, and audit depth.

## Supported Agent Teams

- **Web Accessibility Team**: `accessibility-lead`, `web-accessibility-wizard`, `aria-specialist`, `contrast-master`, `keyboard-navigator`, `forms-specialist`, `modal-specialist`, `live-region-controller`, `alt-text-headings`, `tables-data-specialist`, `link-checker`, `text-quality-reviewer`, `i18n-accessibility`.
- **Document Accessibility Team**: `document-accessibility-wizard`, `word-accessibility`, `excel-accessibility`, `powerpoint-accessibility`, `pdf-accessibility`, `epub-accessibility`, `office-remediator`, `pdf-remediator`.
- **GitHub Workflow Team**: `nexus`, `github-hub`, `daily-briefing`, `pr-review`, `issue-tracker`, `analytics`, `actions-manager`, `security-dashboard`, `release-manager`, `notifications-manager`, `wiki-manager`.
- **Developer Tools Team**: `developer-hub`, `python-specialist`, `wxpython-specialist`, `nvda-addon-specialist`, `desktop-a11y-specialist`, `a11y-tool-builder`.

## Usage Examples

### Auditing Web UI Components

Launch `agy` and prompt:

```text
/agent accessibility-lead "Review this React component for WCAG 2.2 AA compliance"
```

### Running a Guided Audit

```text
/agent web-accessibility-wizard "Run a step-by-step accessibility audit of our site"
```

### Document Scanning

```text
/agent document-accessibility-wizard "Audit report.docx and presentation.pptx for accessibility errors"
```

## Repository Policy Compliance

All generated agents, rules, and documentation follow the strict repository rule: **No emoji characters**. Plain text labels (`[OK]`, `[FAIL]`, `[WARN]`) are used throughout.
