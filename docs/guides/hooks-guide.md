# Lifecycle Hooks Guide

## Overview

Accessibility Agents v3.0 includes cross-platform lifecycle hooks that automate accessibility enforcement during agent sessions. Hooks run at key moments (session start, tool execution, session end) to ensure WCAG AA compliance is never skipped.

## What Hooks Do

1. **Session Start** - Detect project type and inject context
2. **Web Project Detection** - Recognize web UI work and suggest accessibility review
3. **Edit Gate Enforcement** - Block UI file edits until accessibility-lead reviews
4. **Review Marker** - Unlock edits after accessibility review completes
5. **Session End** - Clean up markers for next session

## Supported Platforms

| Platform | Hook Support | Configuration Location |
|----------|--------------|------------------------|
| **GitHub Copilot (VS Code 1.110+)** | ✅ (Preview) | `.github/hooks/hooks-consolidated.json` |
| **Claude Code** | ✅ Full Support | `.claude/hooks/hooks-consolidated.json` |
| **Gemini CLI** | ❌ Not Yet | TBD |
| **Codex CLI** | ❌ Not Yet | TBD |

## Installation

Hooks are installed automatically when you run `install.sh` or `install.ps1` with the `--project` flag:

### macOS / Linux

```bash
bash install.sh --project
```

### Windows (PowerShell)

```powershell
.\install.ps1 -Project
```

This creates:
- `.github/hooks/scripts/` - Python hook scripts (5 files)
- `.github/hooks/hooks-consolidated.json` - VS Code configuration
- `.claude/hooks/hooks-consolidated.json` - Claude Code configuration

## How Hooks Work

### 1. Session Start Hook

**When:** Agent session begins  
**Action:** Detect platform, check Python version, inject welcome context

**Output:**
```
✅ Accessibility Agents v3.0 loaded
📍 Platform: Darwin, Python 3.11.5
💡 Use @accessibility-lead for web UI reviews
```

### 2. Web Project Detection Hook

**When:** User submits a prompt  
**Triggers:** Prompt contains UI keywords (component, html, react, vue, etc.)  
**Action:** Inject reminder to consult accessibility-lead

**Output:**
```
🔍 Web UI project detected. Before modifying any HTML, JSX, CSS, or component files,
consult @accessibility-lead to ensure WCAG AA compliance.
```

### 3. Edit Gate Enforcement Hook

**When:** Agent attempts to edit a file  
**Triggers:** File extension is `.jsx`, `.tsx`, `.vue`, `.html`, `.css`, etc.  
**Action:** Block edit if `.github/.a11y-reviewed` marker doesn't exist

**Output (blocked):**
```
🔒 Accessibility review required before editing src/App.jsx.
Invoke @accessibility-lead to review this component first.
After review completes, UI file edits will be unlocked for this session.
```

**Output (allowed):**
```
Tool execution allowed.
```

### 4. Review Marker Hook

**When:** Tool execution completes  
**Triggers:** Agent name contains "accessibility-lead"  
**Action:** Create `.github/.a11y-reviewed` marker file

**Output:**
```
✅ Accessibility review completed. UI file edits now unlocked for this session.
```

### 5. Session End Hook

**When:** Agent session ends  
**Action:** Remove `.github/.a11y-reviewed` marker  
**Reason:** Force fresh review for next session

**Output:**
```
🔒 Accessibility session ended. Review marker cleared.
```

## Configuration

### VS Code Format (`.github/hooks/hooks-consolidated.json`)

```json
{
  "hooks": {
    "SessionStart": [
      {
        "type": "command",
        "command": "python .github/hooks/scripts/session-start.py",
        "timeout": 10
      }
    ],
    "PreToolUse": [
      {
        "type": "command",
        "command": "python .github/hooks/scripts/enforce-edit-gate.py",
        "timeout": 5
      }
    ]
  }
}
```

### Claude Code Format (`.claude/hooks/hooks-consolidated.json`)

```json
{
  "hooks": {
    "SessionStart": [
      {
        "type": "command",
        "command": "python .github/hooks/scripts/session-start.py",
        "timeout": 10
      }
    ],
    "PreToolUse": [
      {
        "type": "command",
        "command": "python .github/hooks/scripts/enforce-edit-gate.py",
        "timeout": 5,
        "matchers": [
          {
            "toolName": "replace_string_in_file"
          }
        ]
      }
    ]
  }
}
```

**Key Differences:**
- VS Code: `Stop` event for session end
- Claude Code: `SessionEnd` event for session end
- Claude Code: Supports `matchers` to filter hooks by tool name or prompt content

## Disabling Hooks

### Temporarily (Single Session)

Set environment variable before starting agent:

```bash
# macOS / Linux
export SKIP_A11Y_HOOKS=1
code .

# Windows PowerShell
$env:SKIP_A11Y_HOOKS = "1"
code .
```

### Permanently (All Sessions)

Delete or rename the hooks configuration:

```bash
# VS Code
mv .github/hooks/hooks-consolidated.json .github/hooks/hooks-consolidated.json.disabled

# Claude Code
mv .claude/hooks/hooks-consolidated.json .claude/hooks/hooks-consolidated.json.disabled
```

## Customizing Hooks

### Add Custom UI File Extensions

Edit `.github/hooks/scripts/enforce-edit-gate.py`:

```python
def is_ui_file(file_path):
    """Check if file is a UI file that requires accessibility review."""
    ui_extensions = {
        ".jsx", ".tsx", ".vue", ".svelte", ".astro",
        ".html", ".htm", ".css", ".scss", ".sass", ".less",
        ".leaf", ".ejs", ".erb", ".hbs", ".mustache", ".pug",
        ".jinja2", ".twig"  # Add your custom extensions
    }
    
    path = Path(file_path)
    return path.suffix.lower() in ui_extensions
```

### Add Custom Web Project Indicators

Edit `.github/hooks/scripts/detect-web-project.py`:

```python
def detect_web_project():
    """Check if current workspace is a web project."""
    workspace = Path.cwd())
    
    indicators = [
        workspace / "package.json",
        workspace / "composer.json",  # PHP Laravel/Symfony
        workspace / "Gemfile",  # Ruby on Rails
        # Add your framework indicators
    ]
    
    return any(indicator.exists() for indicator in indicators)
```

## Troubleshooting

See [hooks-troubleshooting.md](./hooks-troubleshooting.md) for common issues:

- Python not found
- Permission denied
- Hook not firing
- Marker not clearing
- Cross-platform path issues

## Security Considerations

1. **Python Version:** Hooks require Python 3.8+ (scripts use f-strings, pathlib, json)
2. **File Permissions:** Hook scripts must be executable on macOS/Linux (`chmod +x`)
3. **Timeouts:** All hooks have 5-10 second timeouts to prevent blocking sessions
4. **Exit Codes:** Hooks always exit 0 (even on deny) to avoid breaking agent sessions
5. **Marker File:** `.github/.a11y-reviewed` is ephemeral (never committed to git)

## See Also

- [HOOKS-CROSS-PLATFORM-STRATEGY.md](./HOOKS-CROSS-PLATFORM-STRATEGY.md) - Full 56-page implementation strategy
- [hooks-troubleshooting.md](./hooks-troubleshooting.md) - Common issues and solutions
- [VS Code Hooks Documentation](https://code.visualstudio.com/api/extension-guides/chat#agent-hooks) - Official VS Code 1.110 hooks
- [Claude Code Hooks Reference](https://claude.ai/docs/hooks) - Claude Code hook system
