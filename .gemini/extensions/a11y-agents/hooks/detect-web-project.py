#!/usr/bin/env python3
"""
Web Project Detection Hook - Gemini CLI (BeforeAgent event)
Detects web UI project structure and injects accessibility reminder into the prompt.

Input (stdin): JSON with prompt
Output (stdout): JSON with hookSpecificOutput.additionalContext
"""
import json
import sys
from pathlib import Path


def detect_web_project():
    """Check if current workspace is a web project."""
    workspace = Path.cwd()

    indicators = [
        workspace / "package.json",
        workspace / "tsconfig.json",
        workspace / "app" / "globals.css",        # Next.js
        workspace / "src" / "App.jsx",             # React
        workspace / "src" / "App.tsx",             # React TS
        workspace / "src" / "App.vue",             # Vue
        workspace / "src" / "app" / "app.component.ts",  # Angular
        workspace / "vite.config.js",              # Vite
        workspace / "svelte.config.js",            # Svelte
    ]

    return any(indicator.exists() for indicator in indicators)


def detect_ui_prompt(prompt):
    """Check if user prompt involves web UI work."""
    ui_keywords = [
        "html", "jsx", "tsx", "vue", "component", "button", "modal",
        "form", "input", "navigation", "menu", "dialog", "page",
        "ui", "interface", "web page", "website", "css", "style",
        "tailwind", "react", "angular", "svelte",
    ]

    prompt_lower = prompt.lower()
    return any(keyword in prompt_lower for keyword in ui_keywords)


def main():
    try:
        input_data = json.loads(sys.stdin.read())
    except json.JSONDecodeError as exc:
        print(f"a11y-detect-web-project: JSON parse error: {exc}", file=sys.stderr)
        print(json.dumps({}))
        sys.exit(0)

    prompt = input_data.get("prompt", "")

    is_web_project = detect_web_project()
    is_ui_task = detect_ui_prompt(prompt)

    output = {}
    if is_web_project and is_ui_task:
        output["hookSpecificOutput"] = {
            "additionalContext": (
                "\U0001f50d Web UI project detected. Before modifying any HTML, JSX, CSS, or "
                "component files, activate the accessibility-lead skill to ensure WCAG AA "
                "compliance. This includes forms, modals, navigation, buttons, images, and "
                "any user-facing content."
            )
        }

    print(json.dumps(output))
    sys.exit(0)


if __name__ == "__main__":
    main()
