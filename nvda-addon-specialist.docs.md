# nvda-addon-specialist - NVDA Addon Development

> Expert in NVDA screen reader addon development -- architecture, APIs, plugin types (globalPlugins, appModules, synthDrivers, brailleDisplayDrivers), manifest format, event/script handling, NVDAObject overlays, tree interceptors, addon packaging, Add-on Store submission, testing with NVDA, and internationalization. Grounded in the official NVDA source code and community development guides.

## When to Use It

- Scaffolding a new NVDA addon (globalPlugin, appModule, synthDriver, brailleDisplayDriver)
- Debugging addon loading issues, event handlers, or script binding
- Understanding NVDA's event chain, script resolution order, or NVDAObject system
- Packaging addons with SCons and buildVars.py
- Preparing for NVDA Add-on Store submission (manifest, JSON metadata, SHA256)
- Adding internationalization (i18n) support with gettext
- Migrating from legacy `__gestures` dicts to `@script` decorators
- Adding settings panels, configuration persistence, or extension points
- Reviewing addon code for common anti-patterns (main thread blocking, monkey-patching, missing nextHandler)

## What It Does NOT Do

- Does not build wxPython GUI layouts (routes to wxpython-specialist)
- Does not perform screen reader testing (routes to desktop-a11y-testing-coach)
- Does not handle web or document accessibility auditing
- Does not implement platform accessibility APIs directly (routes to desktop-a11y-specialist for UIA, MSAA, ATK)

## Accessibility Audit Mode

When asked to audit NVDA addon code, the agent uses 16 structured detection rules (NVDA-001 through NVDA-016) covering:

| Rule Range | What It Covers |
|---|---|
| NVDA-001..002 | Critical: Missing nextHandler(), main thread blocking |
| NVDA-003..005 | Serious: Missing initTranslation(), missing terminate(), wrong manifest format |
| NVDA-006..009 | Moderate: Monkey-patching, legacy script binding, missing description, gesture conflicts |
| NVDA-010 | Serious: Background thread UI updates without wx.CallAfter() |
| NVDA-011..012 | Moderate/Minor: Missing check() on drivers, bare except clauses |
| NVDA-013..016 | Serious/Minor/Moderate: Incompatible versions, missing SHA256, wrong config pattern, secure mode vulnerability |

Returns a structured report with NVDA source file references, expected behavior, and specific code fixes.

## Example Prompts

- "Scaffold a new globalPlugin that announces the current Wi-Fi network name"
- "Debug why my appModule for firefox.exe isn't loading"
- "Add a settings panel to my addon with a checkbox and a slider"
- "Prepare my addon for submission to the NVDA Add-on Store"
- "Create a synthDriver wrapper for a custom TTS engine"
- "Why isn't my event_gainFocus handler being called?"
- "Migrate my addon from the legacy __gestures dict to @script decorators"
- "Add internationalization support to my addon"
- "My addon works in NVDA 2024.1 but crashes in 2025.1"
- "Write a braille display driver stub for a new HID device"

## Skills Used

| Skill | Purpose |
|-------|---------|
| [python-development](../skills/python-development.md) | Python packaging, testing, pyproject.toml patterns |

## Related Agents

- [wxpython-specialist](wxpython-specialist.md) -- routes here for addon GUI components (settings panels, dialogs)
- [desktop-a11y-specialist](desktop-a11y-specialist.md) -- routes here for platform API understanding (how NVDA interacts with UIA/MSAA)
- [desktop-a11y-testing-coach](desktop-a11y-testing-coach.md) -- bidirectional: build then test with NVDA
- [a11y-tool-builder](a11y-tool-builder.md) -- routes here for building scanning tools into addons
- [developer-hub](developer-hub.md) -- routes here for NVDA addon development tasks
