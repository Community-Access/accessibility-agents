# package-python-app

Package a Python desktop application for distribution using PyInstaller, Nuitka, or cx_Freeze. Handles dependency detection, data files, hidden imports, single-file vs directory builds, and platform-specific signing.

## When to Use It

- You have a working Python app and need to distribute it as a standalone executable
- You are troubleshooting PyInstaller/Nuitka/cx_Freeze build failures
- You need to bundle data files, images, or databases with your application
- You want to set up code signing for your packaged application
- You are choosing between packaging tools and need trade-off guidance

## How to Launch It

**In GitHub Copilot Chat** -- select from the prompt picker:

```text
/package-python-app
```

Then provide the entry point when prompted.

**In Claude Code:**

```text
@python-specialist package my_app/__main__.py with PyInstaller
```

## What to Expect

### Step 1: Requirements Gathering

The agent asks about your preferred packaging tool, build mode, target platform, GUI framework, data files, icon, and signing requirements.

### Step 2: Dependency Analysis

Scans imports to identify third-party packages, hidden imports (common with wxPython, PIL, SQLAlchemy), data files referenced in code, and runtime hooks needed.

### Step 3: Build Configuration

Generates the appropriate configuration:

- **PyInstaller:** A `.spec` file with Analysis paths, hidden imports, datas, excludes, and platform-specific settings
- **Nuitka:** A build script with `--standalone`/`--onefile`, plugins, data includes, and icon settings
- **cx_Freeze:** A `setup.py` with include/exclude lists, data files, and installer options

### Step 4: Build and Test

Runs the build, reports output size, lists warnings, and suggests verification steps.

### Step 5: Distribution Guidance

Covers installer creation (NSIS, Inno Setup, DMG, AppImage), auto-update setup, antivirus false positive handling, and code signing.

## Related Prompts

- [scaffold-wxpython-app](scaffold-wxpython-app.md) -- Start a new app to package
- [audit-desktop-a11y](audit-desktop-a11y.md) -- Audit the app before shipping

## Related Agents

- **python-specialist** -- The specialist agent that powers this prompt
- **developer-hub** -- Routes to the right specialist for any developer task
- **wxpython-specialist** -- wxPython-specific packaging considerations
