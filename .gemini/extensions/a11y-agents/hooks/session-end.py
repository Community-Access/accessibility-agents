#!/usr/bin/env python3
"""
Session End Hook - Gemini CLI (SessionEnd event)
Removes the accessibility review marker at session end.

Input (stdin): JSON with session_id, transcript_path, cwd, hook_event_name, timestamp
Output (stdout): JSON (empty or with systemMessage)
"""
import json
import sys
from pathlib import Path


def main():
    try:
        input_data = json.loads(sys.stdin.read())
    except json.JSONDecodeError as exc:
        print(f"a11y-session-end: JSON parse error: {exc}", file=sys.stderr)
        print(json.dumps({}))
        sys.exit(0)

    marker_path = Path(".github/.a11y-reviewed")
    if marker_path.exists():
        marker_path.unlink()

    print(json.dumps({}))
    sys.exit(0)


if __name__ == "__main__":
    main()
