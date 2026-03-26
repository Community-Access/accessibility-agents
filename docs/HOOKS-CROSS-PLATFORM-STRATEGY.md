# Cross-Platform Hooks Implementation Strategy

> **Document Version:** 1.1
> **Date:** March 5, 2026 (updated March 13, 2026)
> **Status:** Gemini CLI hooks implemented
> **Author:** Accessibility Agents Team
> **Purpose:** Design reliable cross-platform lifecycle hooks that work across GitHub Copilot (VS Code), Claude Code, Gemini, Windows, and macOS without repeating past compatibility failures.

---

## Executive Summary

This document presents a comprehensive strategy for implementing lifecycle hooks across multiple agent platforms (GitHub Copilot, Claude Code, Gemini) and operating systems (Windows and macOS). Based on authoritative documentation from VS Code 1.110 (February 2026) and Claude Code platform references, this plan addresses specific compatibility challenges that caused previous implementation failures.

**Key Findings:**

- VS Code 1.110 (Feb 2026) has **8 hook events** with **official hooks support** (Preview)
- Claude Code has **18 hook events** with mature hook system
- **Critical difference:** VS Code uses `Stop` event; Claude Code uses `SessionEnd` (no direct equivalent in VS Code)
- **Blocking capability difference:** Claude Code `permissionDecision: "deny"` can block; VS Code `PreToolUse` can block but implementation differs
- **Configuration format:** VS Code uses `.github/hooks/*.json` (separate files); Claude Code uses `~/.claude/settings.json` (centralized)
- **Gemini hook support:** Confirmed supported via `hooks/hooks.json` in the extension directory; uses distinct event names (`BeforeAgent`, `BeforeTool`, `AfterTool`) and `decision: "deny"` blocking

---

## Platform Comparison Matrix

### Hook Events

The following table compares lifecycle hook event names across VS Code 1.110, Claude Code, and Gemini CLI. Gemini CLI uses different names for several cross-platform events.

| Event Name (VS Code) | Event Name (Claude Code) | VS Code 1.110 | Claude Code | Gemini CLI | Notes |
|---------------------|--------------------------|---------------|-------------|------------|-------|
| `SessionStart` | `SessionStart` | ✅ | ✅ | ✅ `SessionStart` | Identical naming |
| `UserPromptSubmit` | `UserPromptSubmit` | ✅ | ✅ | ✅ `BeforeAgent` | **Different name** in Gemini |
| `PreToolUse` | `PreToolUse` | ✅ | ✅ | ✅ `BeforeTool` | **Different name** in Gemini |
| `PostToolUse` | `PostToolUse` | ✅ | ✅ | ✅ `AfterTool` | **Different name** in Gemini |
| `PreCompact` | `PreCompact` | ✅ | ✅ | ✅ `PreCompress` | **Different name** in Gemini |
| `SubagentStart` | `SubagentStart` | ✅ | ✅ | ❓ | Not confirmed in Gemini |
| `SubagentStop` | `SubagentStop` | ✅ | ✅ | ❓ | Not confirmed in Gemini |
| `Stop` | `SessionEnd` | ✅ | ✅ | ✅ `SessionEnd` | VS Code uses `Stop`; Gemini and Claude use `SessionEnd` |
| N/A | `CompactComplete` | ❌ | ✅ | ❓ | Claude-only |
| N/A | `TeammateIdle` | ❌ | ✅ | ❌ | Claude-only (Experimental Teams) |
| N/A | `TaskCompleted` | ❌ | ✅ | ❌ | Claude-only (Experimental Teams) |
| N/A | 8 more events | ❌ | ✅ | ❌ | Claude has 18 total events |
| N/A | N/A | ❌ | ❌ | ✅ `BeforeModel` | Gemini-only |
| N/A | N/A | ❌ | ❌ | ✅ `AfterModel` | Gemini-only |
| N/A | N/A | ❌ | ❌ | ✅ `AfterAgent` | Gemini-only |
| N/A | N/A | ❌ | ❌ | ✅ `BeforeToolSelection` | Gemini-only |
| N/A | N/A | ❌ | ❌ | ✅ `Notification` | Gemini-only |

**Cross-platform compatible events (5 confirmed):** SessionStart, BeforeAgent/UserPromptSubmit, BeforeTool/PreToolUse, AfterTool/PostToolUse, SessionEnd/Stop

**Gemini event name mapping for this extension:**

- `BeforeAgent` (Gemini) → replaces `UserPromptSubmit` (Claude/VS Code)
- `BeforeTool` (Gemini) → replaces `PreToolUse` (Claude/VS Code)
- `AfterTool` (Gemini) → replaces `PostToolUse` (Claude/VS Code)

**Platform-specific events:**

- VS Code only: `Stop`
- Claude Code only: `SessionEnd`, `CompactComplete`, `TeammateIdle`, `TaskCompleted` + 8 others
- Gemini only: `BeforeModel`, `AfterModel`, `AfterAgent`, `BeforeToolSelection`, `Notification`

### Configuration Locations

| Platform | Primary Location | Secondary Locations | Notes |
|----------|-----------------|---------------------|-------|
| **VS Code 1.110** | `.github/hooks/*.json` | `.claude/settings.json`, `.claude/settings.local.json`, `~/.claude/settings.json` | Reads Claude Code configs for compatibility |
| **Claude Code** | `~/.claude/settings.json` | Project: `.claude/settings.json`, Plugin: `.claude-plugin/plugin.json` | Centralized config with hook arrays |
| **Gemini CLI** | `.gemini/extensions/a11y-agents/hooks/hooks.json` | `.gemini/settings.json` (project-level) | Extension hooks use `${extensionPath}`; nested definition structure with `matcher` + `hooks` array |

### Hook Handler Types

| Type | VS Code 1.110 | Claude Code | Gemini CLI | Description |
|------|---------------|-------------|------------|-------------|
| `command` | ✅ Required | ✅ Supported | ✅ Required | Execute shell command |
| `prompt` | ❌ | ✅ Supported | ❌ | Inject prompt text |
| `agent` | ❌ | ✅ Supported | ❌ | Delegate to subagent |

**Compatibility:** VS Code and Gemini CLI only support `type: "command"`. Claude Code's `prompt` and `agent` handler types have no cross-platform equivalent.

---

## Critical Compatibility Issues

### Issue 1: Event Name Mismatch - Stop vs SessionEnd

**Problem:**

- VS Code uses `Stop` hook event
- Claude Code uses `SessionEnd` hook event
- No direct mapping between these events

**Impact:**

- Hooks written for `SessionEnd` will not fire in VS Code
- Hooks written for `Stop` will not fire in Claude Code

**Solution:**
Define hooks for **both** events with identical logic:

```json
{
  "hooks": {
    "Stop": [
      {
        "type": "command",
        "command": "./hooks/session-end.sh"
      }
    ],
    "SessionEnd": [
      {
        "type": "command",
        "command": "./hooks/session-end.sh"
      }
    ]
  }
}
```

### Issue 2: Configuration File Format Differences

**VS Code 1.110 Format (`.github/hooks/PreToolUse.json`):**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "type": "command",
        "command": "./scripts/validate-tool.sh",
        "windows": "powershell -File scripts\\validate-tool.ps1",
        "timeout": 15
      }
    ]
  }
}
```

**Claude Code Format (`~/.claude/settings.json`):**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "type": "command",
        "command": "./scripts/validate-tool.sh",
        "matcher": "Edit|Write",
        "env": {
          "CLAUDE_PLUGIN_ROOT": "${CLAUDE_PLUGIN_ROOT}"
        }
      }
    ]
  }
}
```

**Key Differences:**

1. **File structure:** VS Code allows separate `.json` files per hook event; Claude Code uses centralized `settings.json`
2. **Matcher field:** Claude Code supports `"matcher": "Edit|Write"` to filter by tool name; **VS Code ignores matchers** (documented in FAQ)
3. **Environment variables:** Claude Code `${CLAUDE_PLUGIN_ROOT}`; VS Code has no equivalent
4. **OS commands:** VS Code uses OS-specific command properties; Claude Code uses `powershell` and `bash` properties

**Solution:**

- Use **consolidated format** that VS Code can read
- Place hooks in `.github/hooks/` for project-level (committed)
- Place hooks in `~/.claude/settings.json` for user-level (personal)
- Avoid Claude Code-specific features (matchers, prompt/agent handlers, environment variables)

### Issue 3: Tool Input Property Naming

**Problem (documented in VS Code 1.110 FAQ):**

- Claude Code uses `snake_case` property names: `tool_input.file_path`
- VS Code uses `camelCase` property names: `tool_input.filePath`
- Claude Code tool names: `Write`, `Edit`
- VS Code tool names: `create_file`, `replace_string_in_file`

**Impact:**
Hook scripts that parse tool input will break when used on the other platform.

**Example - Claude Code Hook:**

```bash
#!/bin/bash
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path')  # snake_case
```

**Example - VS Code Hook:**

```bash
#!/bin/bash
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.filePath')  # camelCase
```

**Solution:**
Hook scripts must handle **both** naming conventions:

```bash
#!/bin/bash
INPUT=$(cat)
# Try VS Code camelCase first, fallback to Claude Code snake_case
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.filePath // .tool_input.file_path')
```

### Issue 4: Shell Script Portability (Windows vs macOS)

**Problem:**

- Bash scripts (`.sh`) do not run natively on Windows (requires Git Bash, WSL, or Cygwin)
- PowerShell scripts (`.ps1`) do not run natively on macOS
- Current Claude Code hooks use bash exclusively (lines 430-680 of install.sh)
- Current implementation has **zero Windows native support**

**Impact:**
Users on Windows cannot use Claude Code hooks without installing Git Bash or WSL.

**Solution - OS-Specific Commands:**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "type": "command",
        "command": "./hooks/validate-tool.sh",
        "windows": "powershell -NoProfile -ExecutionPolicy Bypass -File hooks\\validate-tool.ps1"
      }
    ]
  }
}
```

**Solution - Python for Maximum Portability:**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "type": "command",
        "command": "python hooks/validate-tool.py"
      }
    ]
  }
}
```

Python scripts keep the implementation portable across the supported Windows and macOS environments.

### Issue 5: Blocking Capability Differences

**VS Code 1.110 PreToolUse:**

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Destructive command blocked"
  }
}
```

**Claude Code PreToolUse:**

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Destructive command blocked"
  }
}
```

**Good news:** The output format is **identical** between VS Code and Claude Code for `permissionDecision`.

**Verified compatible:** Both platforms support `"deny"`, `"allow"`, `"ask"` values.

---

## Proposed Cross-Platform Architecture

### Layer 1: Hook Configuration (JSON)

**File:** `.github/hooks/hooks-consolidated.json`  
**Purpose:** Single source of truth for all hook definitions  
**Format:** VS Code 1.110 compatible (also readable by Claude Code)

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
    "UserPromptSubmit": [
      {
        "type": "command",
        "command": "python .github/hooks/scripts/detect-web-project.py",
        "timeout": 5
      }
    ],
    "PreToolUse": [
      {
        "type": "command",
        "command": "python .github/hooks/scripts/enforce-edit-gate.py",
        "timeout": 5
      }
    ],
    "PostToolUse": [
      {
        "type": "command",
        "command": "python .github/hooks/scripts/mark-reviewed.py",
        "timeout": 5
      }
    ],
    "Stop": [
      {
        "type": "command",
        "command": "python .github/hooks/scripts/session-end.py",
        "timeout": 10
      }
    ],
    "SessionEnd": [
      {
        "type": "command",
        "command": "python .github/hooks/scripts/session-end.py",
        "timeout": 10
      }
    ]
  }
}
```

**Key Design Decisions:**

1. ✅ Use Python scripts for maximum portability
2. ✅ Use single `command` property (no OS-specific overrides needed with Python)
3. ✅ Define both `Stop` and `SessionEnd` hooks pointing to same script
4. ✅ Place hooks in `.github/hooks/` (committed to repo, team-shared)
5. ✅ Avoid Claude Code-specific features (matchers, prompt handlers, environment variables)
6. ✅ Keep hook scripts in `.github/hooks/scripts/` subdirectory

### Layer 2: Hook Implementation (Python Scripts)

**File:** `.github/hooks/scripts/enforce-edit-gate.py`  
**Purpose:** Block UI file edits until accessibility review completed  
**Platform Support:** Windows, macOS, VS Code, Claude Code

```python
#!/usr/bin/env python3
"""
Cross-platform PreToolUse hook: Block UI file edits until accessibility review.
Compatible with VS Code 1.110+ and Claude Code.
"""
import sys
import json
import os
from pathlib import Path

def main():
    # Read hook input from stdin
    input_data = json.load(sys.stdin)
    
    tool_name = input_data.get("tool_name", "")
    
    # Handle both VS Code camelCase and Claude Code snake_case
    tool_input = input_data.get("tool_input", {})
    
    # Extract file path - try both naming conventions
    file_path = (
        tool_input.get("filePath") or 
        tool_input.get("file_path") or
        tool_input.get("files", [None])[0]
    )
    
    if not file_path:
        # No file path found - allow operation
        output = {
            "continue": True,
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "allow"
            }
        }
        json.dump(output, sys.stdout)
        sys.exit(0)
    
    # Check if file is a UI file
    ui_extensions = {".jsx", ".tsx", ".vue", ".svelte", ".html", ".css"}
    file_ext = Path(file_path).suffix.lower()
    
    if file_ext not in ui_extensions:
        # Not a UI file - allow operation
        output = {
            "continue": True,
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "allow"
            }
        }
        json.dump(output, sys.stdout)
        sys.exit(0)
    
    # Check if accessibility review marker exists
    marker_path = Path.cwd() / ".github" / ".a11y-reviewed"
    
    if marker_path.exists():
        # Review completed - allow edit
        output = {
            "continue": True,
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "allow",
                "additionalContext": "Accessibility review completed - UI edits allowed"
            }
        }
        json.dump(output, sys.stdout)
        sys.exit(0)
    else:
        # Review not completed - block edit
        output = {
            "continue": True,  # Don't stop session, just block this tool
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": (
                    f"UI file edit blocked: {file_path} requires accessibility review. "
                    "Please consult accessibility-lead agent before modifying web UI files."
                )
            }
        }
        json.dump(output, sys.stdout)
        sys.exit(0)

if __name__ == "__main__":
    main()
```

**Design Patterns:**

1. ✅ Read JSON from stdin
2. ✅ Handle both `camelCase` (VS Code) and `snake_case` (Claude Code) property names
3. ✅ Use `Path` for cross-platform file operations
4. ✅ Output valid JSON to stdout
5. ✅ Exit with code 0 (success) or 2 (blocking error)
6. ✅ Use `permissionDecision` for granular blocking (doesn't stop session)

### Layer 3: Hook Installation

**Installer must:**

1. Detect platform (VS Code vs Claude Code)
2. Copy hook configuration to appropriate location
3. Copy Python hook scripts to `.github/hooks/scripts/`
4. Ensure Python 3.x is available
5. Set execute permissions on Unix systems

**VS Code Installation:**

```bash
# Copy hook config to workspace
cp templates/hooks-consolidated.json .github/hooks/hooks-consolidated.json

# Copy Python scripts
mkdir -p .github/hooks/scripts
cp templates/hooks-scripts/*.py .github/hooks/scripts/

# Set execute permissions (Unix only)
if [ "$(uname)" != "Windows_NT" ]; then
  chmod +x .github/hooks/scripts/*.py
fi
```

**Claude Code Installation:**

```bash
# Copy hook config to Claude Code settings
CLAUDE_HOOKS_CONFIG="$HOME/.claude/settings.json"

# Merge hooks into existing settings.json (requires Python/jq)
python scripts/merge-claude-hooks.py

# Copy Python scripts (shared location)
mkdir -p ~/.claude/hooks/scripts
cp templates/hooks-scripts/*.py ~/.claude/hooks/scripts/
```

---

## Gemini CLI Hook Support

**Status:** Implemented - confirmed supported via `hooks/hooks.json` in extension directory

**Key Differences from Claude Code / VS Code:**

| Aspect | Claude / VS Code | Gemini CLI |
|--------|-----------------|------------|
| Config location | `hooks-consolidated.json` | `hooks/hooks.json` inside extension directory |
| Event name for prompt | `UserPromptSubmit` | `BeforeAgent` |
| Event name for pre-tool | `PreToolUse` | `BeforeTool` |
| Event name for post-tool | `PostToolUse` | `AfterTool` |
| Session cleanup | `SessionEnd` / `Stop` | `SessionEnd` |
| Blocking mechanism | `permissionDecision: "deny"` | `decision: "deny"` |
| Context injection | `contextToInject` | `hookSpecificOutput.additionalContext` |
| Timeout unit | seconds | milliseconds |
| Tool matchers | exact strings | regular expressions |
| Path variable | N/A | `${extensionPath}` for extension files |

**Implementation:**
Gemini CLI hooks are defined in `.gemini/extensions/a11y-agents/hooks/hooks.json`. Each event entry
contains a nested structure: an array of hook groups, where each group has an optional `matcher`,
optional `sequential` flag, and a `hooks` array of command definitions.

Gemini-specific Python scripts in `.gemini/extensions/a11y-agents/hooks/` output the correct Gemini
format and handle the `activate_skill` tool as the accessibility-lead completion signal (replacing the
`agent_name` / `subagent_type` fields that Claude Code provides).

---

## Implementation Phases

### Phase 1: Create Portable Hook Scripts (2 hours)

**Deliverables:**

- `session-start.py` - Session initialization
- `detect-web-project.py` - Proactive web project detection
- `enforce-edit-gate.py` - Block UI edits until review
- `mark-reviewed.py` - Create review marker
- `session-end.py` - Session cleanup

**Testing:**

- Run each script standalone with sample JSON input
- Verify output format matches VS Code/Claude Code expectations
- Test on Windows (PowerShell) and macOS (Terminal)

### Phase 2: Create Hook Configuration Templates (1 hour)

**Deliverables:**

- `templates/hooks-consolidated.json` - VS Code format
- `templates/hooks-claude.json` - Claude Code format (with matchers)
- `templates/hooks-scripts/` - Directory with Python scripts

**Testing:**

- Validate JSON syntax
- Check hook event names match platform requirements

### Phase 3: Update Installers (2 hours)

**Deliverables:**

- Update `install.sh` (lines 430-680) to use Python scripts
- Update `install.ps1` (lines 161-254) to use Python scripts
- Add Python dependency check
- Add platform detection (VS Code vs Claude Code)
- Add Gemini CLI detection and conditional install

**Testing:**

- Test install.sh on macOS
- Test install.ps1 on Windows (PowerShell 5.1 and 7.x)
- Verify hooks work after installation

### Phase 4: Platform-Specific Testing (4 hours)

**Test Matrix:**

| Platform | OS | Hook Events Tested | Expected Result |
|----------|----|--------------------|-----------------|
| VS Code 1.110 | Windows | SessionStart, PreToolUse, Stop | All hooks fire correctly |
| VS Code 1.110 | macOS | SessionStart, PreToolUse, Stop | All hooks fire correctly |
| Claude Code | Windows | SessionStart, PreToolUse, SessionEnd | All hooks fire correctly |
| Claude Code | macOS | SessionStart, PreToolUse, SessionEnd | All hooks fire correctly |
| Gemini CLI | Windows | TBD | Determine hook support |
| Gemini CLI | macOS | TBD | Determine hook support |

**Test Procedure:**

1. Install hooks using installer
2. Start agent session
3. Trigger each hook event
4. Verify hook output in platform logs
5. Verify hook behavior (blocking, allowing, injecting context)

### Phase 5: Documentation Updates (1 hour)

**Deliverables:**

- Update `docs/hooks-guide.md` with cross-platform instructions
- Update `README.md` with hook feature description
- Update `prd.md` Phase 4 section to mark completion
- Create `docs/hooks-troubleshooting.md` for common issues

---

## Testing Strategy

### Unit Tests (Python Hook Scripts)

```python
# tests/test_enforce_edit_gate.py
import json
import subprocess
from pathlib import Path

def test_allow_non_ui_file():
    """Hook should allow edits to non-UI files."""
    input_data = {
        "tool_name": "replace_string_in_file",
        "tool_input": {"filePath": "README.md"},
        "hookEventName": "PreToolUse"
    }
    
    result = subprocess.run(
        ["python", ".github/hooks/scripts/enforce-edit-gate.py"],
        input=json.dumps(input_data),
        capture_output=True,
        text=True
    )
    
    output = json.loads(result.stdout)
    assert output["hookSpecificOutput"]["permissionDecision"] == "allow"

def test_block_ui_file_without_review():
    """Hook should block UI file edits when no review marker exists."""
    # Remove marker if exists
    marker = Path(".github/.a11y-reviewed")
    marker.unlink(missing_ok=True)
    
    input_data = {
        "tool_name": "replace_string_in_file",
        "tool_input": {"filePath": "src/App.jsx"},
        "hookEventName": "PreToolUse"
    }
    
    result = subprocess.run(
        ["python", ".github/hooks/scripts/enforce-edit-gate.py"],
        input=json.dumps(input_data),
        capture_output=True,
        text=True
    )
    
    output = json.loads(result.stdout)
    assert output["hookSpecificOutput"]["permissionDecision"] == "deny"

def test_allow_ui_file_with_review():
    """Hook should allow UI file edits when review marker exists."""
    # Create marker
    marker = Path(".github/.a11y-reviewed")
    marker.parent.mkdir(parents=True, exist_ok=True)
    marker.touch()
    
    input_data = {
        "tool_name": "replace_string_in_file",
        "tool_input": {"filePath": "src/App.jsx"},
        "hookEventName": "PreToolUse"
    }
    
    result = subprocess.run(
        ["python", ".github/hooks/scripts/enforce-edit-gate.py"],
        input=json.dumps(input_data),
        capture_output=True,
        text=True
    )
    
    output = json.loads(result.stdout)
    assert output["hookSpecificOutput"]["permissionDecision"] == "allow"
```

### Integration Tests

**Test 1: VS Code Windows**

```powershell
# Install hooks
.\install.ps1 --project

# Verify hook files exist
Test-Path .github\hooks\hooks-consolidated.json
Test-Path .github\hooks\scripts\enforce-edit-gate.py

# Start VS Code agent session and trigger hook
# (Manual verification for Preview features)
```

**Test 2: Claude Code macOS**

```bash
# Install hooks
bash install.sh --global

# Verify hook files exist
test -f ~/.claude/settings.json
test -f ~/.claude/hooks/scripts/enforce-edit-gate.py

# Trigger hook via Claude Code
# (Manual verification)
```

---

## Rollout Strategy

### Stage 1: Experimental Release (v3.1-alpha)

**Audience:** Early adopters, team members  
**Platforms:** VS Code (Windows, macOS), Claude Code (macOS)  
**Hook Events:** SessionStart, PreToolUse, PostToolUse, Stop/SessionEnd  
**Documentation:** Full implementation guide, troubleshooting steps  
**Support Channel:** GitHub Discussions for feedback

### Stage 2: Beta Release (v3.1-beta)

**Audience:** Public beta users  
**Platforms:** VS Code (all OS), Claude Code (all OS), Gemini CLI (if supported)  
**Hook Events:** All 7 cross-platform events  
**Documentation:** Video tutorials, example repositories  
**Support Channel:** GitHub Issues for bug reports

### Stage 3: Stable Release (v3.1.0)

**Audience:** All users  
**Platforms:** VS Code, Claude Code, Gemini CLI (if supported)  
**Hook Events:** All compatible events  
**Documentation:** Complete with FAQ, troubleshooting, advanced patterns  
**Support Channel:** Standard GitHub support

---

## Risk Assessment

### High Risk

**Issue:** Python dependency not available on user machine  
**Probability:** Medium  
**Impact:** High (hooks completely broken)  
**Mitigation:**

- Installer checks for Python 3.x before enabling hooks
- Provide clear error message with installation instructions
- Fallback to always-on instructions if Python unavailable

### Medium Risk

**Issue:** VS Code 1.110 hooks API changes in future releases  
**Probability:** Medium  
**Impact:** Medium (hooks break after VS Code update)  
**Mitigation:**

- Monitor VS Code release notes for hook API changes
- Subscribe to VS Code Insiders for early warning
- Add version detection to installer
- Create adapter layer for API changes

### Resolved Risk (previously Medium)

**Issue:** ~~Gemini CLI does not support hooks~~ - Resolved: Gemini CLI confirmed to support hooks
**Mitigation:** Hooks implemented in `.gemini/extensions/a11y-agents/hooks/hooks.json`

### Low Risk

**Issue:** Hook scripts have bugs in edge cases  
**Probability:** Medium  
**Impact:** Low (individual hook failures, not systemic)  
**Mitigation:**

- Comprehensive unit tests for all hook scripts
- Integration tests on all platforms
- Clear error messages in hook output
- Graceful fallbacks (e.g., if marker file missing, assume no review)

---

## Open Questions

1. **Gemini CLI Hook Support:** ~~Does Gemini CLI support lifecycle hooks?~~ Resolved: Yes, confirmed supported. Hooks defined in `hooks/hooks.json` within extension directory.
2. **VS Code Remote Development:** Do hooks work in SSH, Containers, WSL scenarios? (Documentation mentions extension host platform detection)
3. **Copilot CLI Compatibility:** Does Copilot CLI use same hook format as VS Code? (Release notes mention hook format compatibility)
4. **Hook Performance:** What is acceptable hook execution time before it degrades UX?
5. **Hook Error Handling:** What happens if hook script crashes? Does agent session continue or stop?

---

## Success Metrics

### Technical Metrics

- **Hook Reliability:** 99%+ successful hook executions (no crashes, timeouts, or JSON parse errors)
- **Cross-Platform Parity:** All 7 core hooks work identically on Windows and macOS
- **Platform Coverage:** Hooks work on VS Code (confirmed), Claude Code (confirmed), Gemini CLI (confirmed)
- **Installation Success Rate:** 95%+ successful installations (Python dependency satisfied)

### User Experience Metrics

- **Hook Latency:** <500ms average execution time per hook (measured in Agent Debug panel)
- **False Positive Rate:** <5% of legitimate operations blocked by hooks
- **User Complaints:** <10% of users disable hooks due to friction
- **Adoption Rate:** 50%+ of teams enable hooks after stable release

### Quality Metrics

- **Test Coverage:** 90%+ code coverage for Python hook scripts
- **Bug Reports:** <5 critical bugs per release
- **Documentation Quality:** 90%+ of users can install hooks without support

---

## References

### Authoritative Sources

1. **VS Code 1.110 Release Notes** (Feb 2026)  
   URL: <https://code.visualstudio.com/updates/v1_110>  
   Date Accessed: March 5, 2026  
   Key Sections: Agent hooks, hook lifecycle events, hook configuration format

2. **VS Code Hooks Documentation** (Preview)  
   URL: <https://code.visualstudio.com/docs/copilot/customization/hooks>  
   Date Accessed: March 5, 2026  
   Key Sections: Hook events, input/output format, PreToolUse hook, OS-specific commands

3. **Claude Code Hooks Documentation**  
   URL: <https://code.claude.com/docs/en/hooks>  
   Date Retrieved: February 2026 (via Context7)  
   Key Sections: 18 hook events, handler types, configuration locations

4. **Platform References Document**  
   File: `docs/advanced/platform-references.md`  
   Last Updated: March 5, 2026  
   Key Sections: Hook feature-to-source mapping (lines 1-150)

---

## Next Steps

1. **Review this strategy document** with team stakeholders
2. **Validate assumptions** by testing current Claude Code hooks on VS Code 1.110
3. **Investigate Gemini CLI** hook support (requires testing)
4. **Create proof-of-concept** Python hook script to verify cross-platform execution
5. **Decide on Phase 1 start date** (earliest: after review approval)

---

**Document Status:** Ready for Review  
**Approval Required From:** Project maintainers, platform experts  
**Questions/Feedback:** Post in GitHub Discussions or create issue with `hooks` label
