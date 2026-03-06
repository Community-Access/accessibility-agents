#!/usr/bin/env python3
"""
Web Project Detection Hook - Cross-Platform
Detects web UI project structure and injects delegation instruction.

Input (stdin): JSON with hookEventName, userPrompt
Output (stdout): JSON with contextToInject
"""
import json
import sys
from pathlib import Path


def detect_web_project():
    """Check if current workspace is a web project."""
    workspace = Path.cwd()
    
    # Web project indicators
    indicators = [
        workspace / "package.json",
        workspace / "tsconfig.json",
        workspace / "app" / "globals.css",  # Next.js
        workspace / "src" / "App.jsx",  # React
        workspace / "src" / "App.tsx",  # React TS
        workspace / "src" / "App.vue",  # Vue
        workspace / "src" / "app" / "app.component.ts",  # Angular
        workspace / "vite.config.js",  # Vite
        workspace / "svelte.config.js",  # Svelte
    ]
    
    return any(indicator.exists() for indicator in indicators)


def detect_ui_prompt(user_prompt):
    """Check if user prompt involves web UI work."""
    ui_keywords = [
        "html", "jsx", "tsx", "vue", "component", "button", "modal",
        "form", "input", "navigation", "menu", "dialog", "page",
        "ui", "interface", "web page", "website", "css", "style",
        "tailwind", "react", "vue", "angular", "svelte"
    ]
    
    prompt_lower = user_prompt.lower()
    return any(keyword in prompt_lower for keyword in ui_keywords)


def main():
    # Read input from stdin
    try:
        input_data = json.loads(sys.stdin.read())
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON input"}), file=sys.stderr)
        sys.exit(2)
    
    hook_event = input_data.get("hookEventName", "UserPromptSubmit")
    user_prompt = input_data.get("userPrompt", "")
    
    # Check if this is a web UI task
    is_web_project = detect_web_project()
    is_ui_task = detect_ui_prompt(user_prompt)
    
    context = ""
    if is_web_project and is_ui_task:
        context = (
            "🔍 Web UI project detected. Before modifying any HTML, JSX, CSS, or component files, "
            "consult @accessibility-lead to ensure WCAG AA compliance. This includes forms, modals, "
            "navigation, buttons, images, and any user-facing content."
        )
    
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
