#!/usr/bin/env python3
"""
Session Start Hook - Gemini CLI
Announces Accessibility Agents at session start.

Input (stdin): JSON with session_id, transcript_path, cwd, hook_event_name, timestamp
Output (stdout): JSON with systemMessage
"""
import json
import sys
from pathlib import Path


def main():
    try:
        input_data = json.loads(sys.stdin.read())
    except json.JSONDecodeError as exc:
        print(f"a11y-session-start: JSON parse error: {exc}", file=sys.stderr)
        print(json.dumps({}))
        sys.exit(0)

    workspace_root = Path.cwd()
    has_agents = (
        (workspace_root / ".github" / "agents").exists()
        or (workspace_root / ".gemini" / "extensions" / "a11y-agents").exists()
    )

    output = {}
    if has_agents:
        output["systemMessage"] = (
            "\u2705 Accessibility Agents loaded. "
            "Use the accessibility-lead skill for WCAG AA reviews of web UI components. "
            "Hooks are active: web project detection, edit gate enforcement, and session cleanup."
        )

    print(json.dumps(output))
    sys.exit(0)


if __name__ == "__main__":
    main()
