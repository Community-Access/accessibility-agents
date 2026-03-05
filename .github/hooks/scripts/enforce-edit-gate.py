#!/usr/bin/env python3
"""
Edit Gate Enforcement Hook - Cross-Platform
Blocks UI file edits until accessibility-lead has been consulted.

Input (stdin): JSON with hookEventName, tool_name, tool_input
Output (stdout): JSON with permissionDecision
"""
import json
import sys
from pathlib import Path


def is_ui_file(file_path):
    """Check if file is a UI file that requires accessibility review."""
    ui_extensions = {
        ".jsx", ".tsx", ".vue", ".svelte", ".astro",
        ".html", ".htm", ".css", ".scss", ".sass", ".less",
        ".leaf", ".ejs", ".erb", ".hbs", ".mustache", ".pug"
    }
    
    path = Path(file_path)
    return path.suffix.lower() in ui_extensions


def is_edit_tool(tool_name):
    """Check if tool is an editing/writing tool."""
    edit_tools = {
        "replace_string_in_file",
        "multi_replace_string_in_file", 
        "create_file",
        "edit_notebook_file"
    }
    return tool_name in edit_tools


def has_review_marker():
    """Check if accessibility review marker exists."""
    marker = Path(".github/.a11y-reviewed")
    return marker.exists()


def main():
    # Read input from stdin
    try:
        input_data = json.loads(sys.stdin.read())
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON input"}), file=sys.stderr)
        sys.exit(2)
    
    hook_event = input_data.get("hookEventName", "PreToolUse")
    tool_name = input_data.get("tool_name", "")
    tool_input = input_data.get("tool_input", {})
    
    # Extract file path from tool input
    file_path = tool_input.get("filePath") or tool_input.get("file_path") or ""
    
    # Determine permission
    permission = "allow"
    reason = ""
    
    if is_edit_tool(tool_name) and is_ui_file(file_path):
        if not has_review_marker():
            permission = "deny"
            reason = (
                f"🔒 Accessibility review required before editing {file_path}. "
                "Invoke @accessibility-lead to review this component first. "
                "After review completes, UI file edits will be unlocked for this session."
            )
    
    # Output result
    output = {
        "hookSpecificOutput": {
            "hookEventName": hook_event,
            "permissionDecision": permission,
            "permissionDecisionReason": reason
        }
    }
    
    print(json.dumps(output))
    sys.exit(0 if permission == "allow" else 0)  # Always exit 0 for compatibility


if __name__ == "__main__":
    main()
