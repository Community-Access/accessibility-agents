#!/usr/bin/env python3
"""
Session End Hook - Cross-Platform
Cleanup on session end - removes review marker.

Input (stdin): JSON with hookEventName
Output (stdout): JSON with success status
"""
import json
import sys
from pathlib import Path


def main():
    # Read input from stdin
    try:
        input_data = json.loads(sys.stdin.read())
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON input"}), file=sys.stderr)
        sys.exit(2)
    
    hook_event = input_data.get("hookEventName", "Stop")
    
    # Remove review marker for next session
    marker_path = Path(".github/.a11y-reviewed")
    if marker_path.exists():
        marker_path.unlink()
    
    # Output result
    output = {
        "hookSpecificOutput": {
            "hookEventName": hook_event,
            "contextToInject": "🔒 Accessibility session ended. Review marker cleared."
        }
    }
    
    print(json.dumps(output))
    sys.exit(0)


if __name__ == "__main__":
    main()
