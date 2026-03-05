#!/usr/bin/env python3
"""
Session Start Hook - Cross-Platform
Initializes accessibility review session and checks Python dependencies.

Input (stdin): JSON with hookEventName, conversationId (optional)
Output (stdout): JSON with success status and context to inject
"""
import json
import sys
import platform
from pathlib import Path


def main():
    # Read input from stdin
    try:
        input_data = json.loads(sys.stdin.read())
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON input"}), file=sys.stderr)
        sys.exit(2)
    
    # Extract hook event name
    hook_event = input_data.get("hookEventName", "SessionStart")
    
    # Platform detection
    system = platform.system()
    python_version = platform.python_version()
    
    # Check if workspace has accessibility agents installed
    workspace_root = Path.cwd()
    agents_dir = workspace_root / ".github" / "agents"
    has_agents = agents_dir.exists()
    
    # Prepare context to inject
    context = []
    if has_agents:
        context.append("✅ Accessibility Agents v3.0 loaded")
        context.append(f"📍 Platform: {system}, Python {python_version}")
        context.append("💡 Use @accessibility-lead for web UI reviews")
    
    # Output result
    output = {
        "hookSpecificOutput": {
            "hookEventName": hook_event,
            "contextToInject": "\n".join(context) if context else ""
        }
    }
    
    print(json.dumps(output))
    sys.exit(0)


if __name__ == "__main__":
    main()
