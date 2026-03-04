# scaffold-nvda-addon

Scaffold a new NVDA screen reader addon project with the correct directory structure, manifest.ini, plugin boilerplate, and development workflow guidance.

## When to Use It

- You are starting a new NVDA addon from scratch
- You need a globalPlugin, appModule, synthDriver, or brailleDisplayDriver skeleton
- You want correct manifest.ini formatting without guessing field names
- You need development workflow guidance (installing, reloading, debugging, packaging)

## How to Launch It

**In GitHub Copilot Chat** -- select from the prompt picker:

```text
/scaffold-nvda-addon
```

**In Claude Code:**

```text
@nvda-addon-specialist scaffold a new globalPlugin for enhanced web navigation
```

## What to Expect

### Step 1: Requirements Gathering

The agent asks for:

- Addon name and type (globalPlugin, appModule, synthDriver, brailleDisplayDriver)
- Target application (for appModules)
- Summary, author, and NVDA version compatibility

### Step 2: Project Structure

Creates the standard NVDA addon directory layout with all required folders and files.

### Step 3: Manifest Generation

Generates `manifest.ini` with all required metadata fields, correctly formatted for the NVDA addon system.

### Step 4: Plugin Boilerplate

Creates the main Python file with:

- Correct imports for the chosen plugin type
- Class skeleton with `__init__` and a sample `@script` decorated method
- `__gestures` dictionary for keyboard bindings
- Comments explaining the NVDA event model

### Step 5: Development Workflow

Prints a quick-start guide covering installation, live reloading, log viewing, packaging, and Add-on Store submission.

## Related Prompts

- [audit-desktop-a11y](audit-desktop-a11y.md) -- Audit an existing desktop app for accessibility
- [test-desktop-a11y](test-desktop-a11y.md) -- Create a desktop accessibility test plan

## Related Agents

- **nvda-addon-specialist** -- The specialist agent that powers this prompt
- **developer-hub** -- Routes to the right specialist for any developer task
- **desktop-a11y-specialist** -- Platform accessibility API expertise
