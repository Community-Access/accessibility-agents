---
description: Scaffold a new NVDA screen reader addon project with the correct directory structure, manifest, globalPlugin or appModule boilerplate, and development workflow guidance.
mode: agent
tools:
  - askQuestions
  - readFile
  - editFiles
  - createFile
  - listDirectory
  - runInTerminal
  - getTerminalOutput
---

# Scaffold NVDA Addon

Create a new NVDA screen reader addon project from scratch, with correct structure, manifest, and boilerplate code.

## Instructions

### Step 1: Gather Requirements

Ask the user:

1. **Addon name** -- Human-readable display name (e.g., "Enhanced Web Navigation")
2. **Addon type** -- Which plugin type?
   - `globalPlugin` (default) -- runs everywhere, adds global commands
   - `appModule` -- targets a specific application
   - `synthDriver` -- custom speech synthesizer
   - `brailleDisplayDriver` -- custom braille display support
3. **Target application** (appModule only) -- The executable name (e.g., `notepad`, `chrome`)
4. **Summary** -- One-line description for the manifest
5. **Author name and URL** -- For manifest metadata
6. **Minimum NVDA version** -- Default: `2024.1`
7. **Last tested NVDA version** -- Default: `2025.1`

### Step 2: Create Project Structure

Generate the standard NVDA addon directory layout:

```
addonName/
  manifest.ini
  installTasks.py          (if needed)
  globalPlugins/           (for globalPlugin type)
    addonName.py
  appModules/              (for appModule type)
    targetApp.py
  synthDrivers/            (for synthDriver type)
    addonName.py
  brailleDisplayDrivers/   (for brailleDisplayDriver type)
    addonName.py
  doc/
    en/
      readme.md
```

### Step 3: Generate Manifest

Create `manifest.ini` with all required fields:

- `name`, `summary`, `description`
- `author`, `url`
- `version` (start at `1.0.0`)
- `minimumNVDAVersion`, `lastTestedNVDAVersion`
- `docFileName` (set to `readme.md`)

### Step 4: Generate Plugin Boilerplate

Create the main plugin file with:

- Correct imports (`globalPluginHandler`, `scriptHandler`, `api`, `ui`, etc.)
- Class skeleton with `__init__` and at least one example `@script` decorated method
- Proper `__gestures` dictionary for keyboard bindings
- Comments explaining the NVDA event model and script resolution order

### Step 5: Generate Development Docs

Create `doc/en/readme.md` with:

- Addon description and feature list
- Installation instructions
- Key bindings table
- Changelog placeholder

### Step 6: Development Workflow

Print a summary of next steps:

1. How to install the addon for development (symlink or copy to NVDA scratchpad)
2. How to reload plugins (`NVDA+Ctrl+F3` or restart NVDA)
3. How to view the NVDA log for debugging
4. How to package the addon as a `.nvda-addon` file
5. How to submit to the NVDA Add-on Store
