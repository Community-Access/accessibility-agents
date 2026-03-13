#!/usr/bin/env python3
"""
Edit Gate Enforcement Hook - Gemini CLI (BeforeTool event)
Blocks UI file edits (write_file, replace) until accessibility-lead has been activated.

Input (stdin): JSON with tool_name, tool_input, ...
Output (stdout): JSON with decision ("allow" or "deny") and optional reason/systemMessage
"""
import json
import sys
from pathlib import Path


UI_EXTENSIONS = {
    ".jsx", ".tsx", ".vue", ".svelte", ".astro",
    ".html", ".htm", ".css", ".scss", ".sass", ".less",
    ".leaf", ".ejs", ".erb", ".hbs", ".mustache", ".pug",
}

# Gemini CLI built-in file editing tools
GEMINI_EDIT_TOOLS = {"write_file", "replace"}


def is_ui_file(file_path):
    """Check if file is a UI file that requires accessibility review."""
    if not file_path:
        return False
    path = Path(file_path)
    return path.suffix.lower() in UI_EXTENSIONS


def has_review_marker():
    """Check if accessibility review marker exists for this session."""
    return Path(".github/.a11y-reviewed").exists()


def main():
    try:
        input_data = json.loads(sys.stdin.read())
    except json.JSONDecodeError as exc:
        print(f"a11y-enforce-edit-gate: JSON parse error: {exc}", file=sys.stderr)
        print(json.dumps({"decision": "allow"}))
        sys.exit(0)

    tool_name = input_data.get("tool_name", "")
    tool_input = input_data.get("tool_input", {})
    file_path = tool_input.get("file_path", "")

    output = {}

    if tool_name in GEMINI_EDIT_TOOLS and is_ui_file(file_path):
        if not has_review_marker():
            output = {
                "decision": "deny",
                "reason": (
                    f"Accessibility review required before editing {file_path}. "
                    "Activate the accessibility-lead skill first by asking: "
                    "'Run the accessibility-lead skill on this component.' "
                    "After the review completes, UI file edits will be unlocked for this session."
                ),
                "systemMessage": (
                    f"\U0001f512 Edit blocked: accessibility review required for {file_path}. "
                    "Ask Gemini to activate the accessibility-lead skill first."
                ),
            }
        else:
            output = {"decision": "allow"}
    else:
        output = {"decision": "allow"}

    print(json.dumps(output))
    sys.exit(0)


if __name__ == "__main__":
    main()
