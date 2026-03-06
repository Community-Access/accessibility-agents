#!/usr/bin/env python3
"""
Mark Reviewed Hook - Cross-Platform
Creates accessibility review marker after accessibility-lead completes.

Input (stdin): JSON with hookEventName, tool_name, agent_name
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
    
    hook_event = input_data.get("hookEventName", "PostToolUse")
    agent_name = input_data.get("agent_name", "")
    subagent_type = input_data.get("subagent_type", "")
    target_agent = input_data.get("target_agent", "")
    
    # Only unlock after explicit accessibility-lead completion to avoid false positives.
    normalized = {
        str(agent_name).lower(),
        str(subagent_type).lower(),
        str(target_agent).lower(),
    }
    if "accessibility-lead" in normalized:
        marker_path = Path(".github/.a11y-reviewed")
        marker_path.parent.mkdir(parents=True, exist_ok=True)
        marker_path.touch()
        
        context = "✅ Accessibility review completed. UI file edits now unlocked for this session."
    else:
        context = ""
    
    # Output result
    output = {
        "hookSpecificOutput": {
            "hookEventName": hook_event,
            "contextToInject": context
        }
    }
    
    print(json.dumps(output))
    sys.exit(0)


if __name__ == "__main__":
    main()
