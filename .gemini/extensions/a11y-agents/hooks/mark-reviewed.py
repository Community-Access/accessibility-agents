#!/usr/bin/env python3
"""
Mark Reviewed Hook - Gemini CLI (AfterTool event, matcher: activate_skill)
Creates accessibility review marker after the accessibility-lead skill completes.

Input (stdin): JSON with tool_name, tool_input, tool_response, ...
Output (stdout): JSON with hookSpecificOutput.additionalContext
"""
import json
import sys
from pathlib import Path


def main():
    try:
        input_data = json.loads(sys.stdin.read())
    except json.JSONDecodeError as exc:
        print(f"a11y-mark-reviewed: JSON parse error: {exc}", file=sys.stderr)
        print(json.dumps({}))
        sys.exit(0)

    tool_name = input_data.get("tool_name", "")
    tool_input = input_data.get("tool_input", {})

    output = {}

    # Create marker when the accessibility-lead skill has been activated
    if tool_name == "activate_skill" and tool_input.get("name") == "accessibility-lead":
        marker_path = Path(".github/.a11y-reviewed")
        marker_path.parent.mkdir(parents=True, exist_ok=True)
        marker_path.touch()

        output = {
            "hookSpecificOutput": {
                "additionalContext": (
                    "\u2705 Accessibility review completed. "
                    "UI file edits are now unlocked for this session."
                )
            }
        }

    print(json.dumps(output))
    sys.exit(0)


if __name__ == "__main__":
    main()
