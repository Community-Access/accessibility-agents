# Lifecycle Hooks Troubleshooting

## Common Issues

### Issue 1: "Python not found" or "python: command not found"

**Symptoms:**
- Hook fails with "python: command not found"
- VS Code shows hook error in console
- Claude Code logs show exec failure

**Cause:** Python not installed or not in PATH

**Solution (macOS / Linux):**
```bash
# Check if Python is installed
which python3

# If not found, install Python 3.8+
# macOS (Homebrew)
brew install python@3.11

# Ubuntu/Debian
sudo apt install python3

# Update hook command to use python3
sed -i 's/python /python3 /g' .github/hooks/hooks-consolidated.json
```

**Solution (Windows PowerShell):**
```powershell
# Check if Python is installed
Get-Command python

# If not found, install from python.org or Microsoft Store
winget install Python.Python.3.11

# Update hook command if needed
(Get-Content .github\hooks\hooks-consolidated.json) -replace 'python ', 'py ' | Set-Content .github\hooks\hooks-consolidated.json
```

---

### Issue 2: Hook Script "Permission Denied"

**Symptoms:**
- macOS/Linux: "Permission denied: '.github/hooks/scripts/session-start.py'"
- Hook fails to execute

**Cause:** Hook scripts not marked as executable

**Solution (macOS / Linux):**
```bash
chmod +x .github/hooks/scripts/*.py
```

**Note:** Windows does not require execute permissions for Python scripts.

---

### Issue 3: Hook Not Firing

**Symptoms:**
- Expected hook output not appearing
- Edit gate not blocking UI files
- Session start context not injected

**Debugging Steps:**

**Step 1: Verify Hook Configuration Exists**
```bash
# VS Code
cat .github/hooks/hooks-consolidated.json

# Claude Code
cat .claude/hooks/hooks-consolidated.json
```

**Step 2: Check Platform Support**
- VS Code: Hooks require VS Code 1.110+ (February 2026 or later)
- Claude Code: Hooks supported in all recent versions
- Gemini CLI: Hooks supported via `.gemini/extensions/a11y-agents/hooks/hooks.json`

**Step 3: Enable Hook Debugging**

VS Code (settings.json):
```json
{
  "copilot.hooks.debug": true
}
```

Claude Code (~/.claude/settings.json):
```json
{
  "debugHooks": true
}
```

Gemini CLI (interactive mode):
```
/hooks panel
```

**Step 4: Test Hook Script Manually**
```bash
# VS Code / Claude Code SessionStart
echo '{"hookEventName": "SessionStart"}' | python .github/hooks/scripts/session-start.py

# VS Code / Claude Code PreToolUse (edit gate)
echo '{"hookEventName": "PreToolUse", "tool_name": "replace_string_in_file", "tool_input": {"filePath": "src/App.jsx"}}' | python .github/hooks/scripts/enforce-edit-gate.py

# Gemini CLI SessionStart
echo '{"hook_event_name": "SessionStart", "session_id": "test", "cwd": "."}' | python .gemini/extensions/a11y-agents/hooks/session-start.py

# Gemini CLI BeforeTool (edit gate)
echo '{"tool_name": "write_file", "tool_input": {"file_path": "src/App.jsx", "content": ""}}' | python .gemini/extensions/a11y-agents/hooks/enforce-edit-gate.py

# Gemini CLI BeforeAgent (web project detection)
echo '{"prompt": "Build a React component with a modal"}' | python .gemini/extensions/a11y-agents/hooks/detect-web-project.py
```

Expected output: Valid JSON (Gemini hooks output `decision`, `systemMessage`, or `hookSpecificOutput`)

---

### Issue 4: Review Marker Not Clearing

**Symptoms:**
- `.github/.a11y-reviewed` persists across sessions
- Edit gate never re-engages after first review

**Cause:** Session end hook not firing or failing

**Solution:**

**Step 1: Manually Remove Marker**
```bash
rm .github/.a11y-reviewed
```

**Step 2: Verify Session End Hook**
```bash
# Test Stop event (VS Code)
echo '{"hookEventName": "Stop"}' | python .github/hooks/scripts/session-end.py

# Test SessionEnd event (Claude Code)
echo '{"hookEventName": "SessionEnd"}' | python .github/hooks/scripts/session-end.py
```

**Step 3: Check .gitignore**
Ensure marker is not committed:
```bash
# Add to .gitignore if missing
echo ".github/.a11y-reviewed" >> .gitignore
```

---

### Issue 5: Cross-Platform Path Issues

**Symptoms:**
- Windows: Hook fails with "No such file or directory"
- macOS/Linux: Hook can't find scripts

**Cause:** Forward slash vs backslash path separators

**Solution:**

Python scripts use `pathlib.Path()` which handles cross-platform paths automatically. Verify hook configuration uses forward slashes only:

```json
{
  "command": "python .github/hooks/scripts/session-start.py"
}
```

**Not:**
```json
{
  "command": "python .github\\hooks\\scripts\\session-start.py"
}
```

---

### Issue 6: Hook Timeout

**Symptoms:**
- Hook aborted after 5-10 seconds
- "Hook execution timeout" in logs

**Cause:** Hook script taking too long (network calls, heavy computation)

**Solution:**

Increase timeout in hook configuration:
```json
{
  "type": "command",
  "command": "python .github/hooks/scripts/session-start.py",
  "timeout": 20
}
```

Optimize hook script:
- Remove network calls
- Cache expensive operations
- Use set() for O(1) lookups instead of list iteration

---

### Issue 7: JSON Parse Error

**Symptoms:**
- "Invalid JSON input" in stderr
- Hook fails immediately

**Cause:** Hook script receiving malformed JSON or no input

**Debugging:**
```bash
# Test hook with valid input
echo '{"hookEventName": "SessionStart"}' | python .github/hooks/scripts/session-start.py

# If this works, issue is with platform passing invalid input
# Check platform logs for what JSON was sent
```

---

### Issue 8: Hook Blocks Non-UI Files

**Symptoms:**
- Edit gate blocks Python, markdown, or non-UI files
- False positive matches

**Cause:** File extension check too broad or missing extension

**Solution:**

Edit `.github/hooks/scripts/enforce-edit-gate.py` to refine `is_ui_file()`:

```python
def is_ui_file(file_path):
    """Check if file is a UI file that requires accessibility review."""
    ui_extensions = {
        ".jsx", ".tsx", ".vue", ".svelte", ".astro",
        ".html", ".htm", ".css", ".scss", ".sass", ".less",
        ".leaf", ".ejs", ".erb", ".hbs", ".mustache", ".pug"
    }
    
    # Exclude test files
    if "test" in file_path.lower() or "spec" in file_path.lower():
        return False
    
    # Exclude node_modules, vendor folders
    if "node_modules" in file_path or "vendor" in file_path:
        return False
    
    path = Path(file_path)
    return path.suffix.lower() in ui_extensions
```

---

### Issue 9: Env Variable SKIP_A11Y_HOOKS Not Working

**Symptoms:**
- Set `SKIP_A11Y_HOOKS=1` but hooks still run

**Cause:** Environment variable not read by platform

**Current Status:** Hook scripts don't check for `SKIP_A11Y_HOOKS` yet (feature planned for v3.1)

**Workaround:**
```bash
# Disable hooks by renaming configuration
mv .github/hooks/hooks-consolidated.json .github/hooks/hooks-consolidated.json.disabled
```

**Re-enable:**
```bash
mv .github/hooks/hooks-consolidated.json.disabled .github/hooks/hooks-consolidated.json
```

---

### Issue 10: VS Code vs Claude Code Naming Confusion

**Symptoms:**
- Hook fires on one platform but not the other
- "Stop" vs "SessionEnd" confusion

**Cause:** Platform-specific event names

**Solution:** Hooks configuration includes **both** `Stop` (VS Code) and `SessionEnd` (Claude Code):

```json
{
  "hooks": {
    "Stop": [
      {
        "type": "command",
        "command": "python .github/hooks/scripts/session-end.py",
        "timeout": 5
      }
    ],
    "SessionEnd": [
      {
        "type": "command",
        "command": "python .github/hooks/scripts/session-end.py",
        "timeout": 5
      }
    ]
  }
}
```

Both events call the same script. Platform ignores unknown events.

---

## Getting Help

If these solutions don't resolve your issue:

1. **Check Hook Logs:**
   - VS Code: View → Output → GitHub Copilot Chat
   - Claude Code: ~/.claude/logs/hooks.log
   - Gemini CLI: `/hooks panel` inside an active session

2. **Test Hook Scripts Manually:**
   ```bash
   # VS Code / Claude Code
   echo '{"hookEventName": "PreToolUse", "tool_name": "replace_string_in_file", "tool_input": {"filePath": "src/App.jsx"}}' | python .github/hooks/scripts/enforce-edit-gate.py

   # Gemini CLI
   echo '{"tool_name": "write_file", "tool_input": {"file_path": "src/App.jsx", "content": ""}}' | python .gemini/extensions/a11y-agents/hooks/enforce-edit-gate.py
   ```

3. **Open GitHub Issue:**
   https://github.com/Community-Access/accessibility-agents/issues/new?labels=hooks,bug

4. **Discord Community:**
   Join #accessibility-agents channel for real-time help

## See Also

- [hooks-guide.md](./hooks-guide.md) - Full hooks documentation
- [HOOKS-CROSS-PLATFORM-STRATEGY.md](../HOOKS-CROSS-PLATFORM-STRATEGY.md) - Implementation strategy
- [VS Code Hooks API](https://code.visualstudio.com/api/extension-guides/chat#agent-hooks)
- [Claude Code Hooks Reference](https://claude.ai/docs/hooks)
- [Gemini CLI Hooks Reference](https://github.com/google-gemini/gemini-cli/blob/main/docs/hooks/reference.md)
