---
name: package-python-app
description: Package a Python desktop application for distribution using PyInstaller, Nuitka, or cx_Freeze. Handles dependency detection, data files, hidden imports, single-file vs directory builds, and platform-specific signing.
mode: agent
agent: python-specialist
tools:
  - askQuestions
  - readFile
  - editFiles
  - createFile
  - listDirectory
  - runInTerminal
  - getTerminalOutput
---

# Package Python Application

Package a Python desktop application into a standalone distributable using PyInstaller, Nuitka, or cx_Freeze.

## Application Details

**Entry point:** `${input:entryPoint}`

## Instructions

### Step 1: Gather Requirements

Ask the user:

1. **Packaging tool** -- Which tool to use?
   - **PyInstaller** (default) -- Widest compatibility, easiest setup
   - **Nuitka** -- Compiles to C, better performance and smaller size
   - **cx_Freeze** -- Alternative with MSI/DMG installer support
2. **Build mode** -- Single file (`--onefile`) or directory bundle (`--onedir`)?
3. **Target platform** -- Windows, macOS, or both?
4. **GUI framework** -- wxPython, Qt, Tkinter, or console-only? (for hidden import detection)
5. **Additional data files** -- Images, config files, templates, databases to bundle?
6. **Application icon** -- Path to `.ico` (Windows) or `.icns` (macOS) file?
7. **Console window** -- Show console window? (default: hidden for GUI apps)
8. **Code signing** -- Do you have a signing certificate? (Windows Authenticode, macOS codesign)

### Step 2: Analyze Dependencies

Scan the entry point and imports to identify:

- All third-party packages that need bundling
- Hidden imports that the tool might miss (common with wxPython, PIL, sqlalchemy, etc.)
- Data files referenced in code (images, JSON, databases)
- Runtime hooks needed for specific libraries

### Step 3: Generate Build Configuration

**For PyInstaller:** Generate a `.spec` file with:

- Correct `Analysis` paths and hidden imports
- `datas` list for bundled files
- `excludes` for unnecessary modules (to reduce size)
- Platform-specific settings (icon, console mode, signing)
- `a]` resource access using `sys._MEIPASS` pattern

**For Nuitka:** Generate a build script with:

- `--standalone` or `--onefile` flag
- `--include-data-dir` and `--include-data-files` for resources
- `--enable-plugin` for framework support (e.g., `anti-bloat`, `tk-inter`)
- `--windows-icon-from-ico` or `--macos-app-icon`

**For cx_Freeze:** Generate a `setup.py` with:

- `build_exe_options` for includes, excludes, and packages
- `include_files` for data resources
- MSI/DMG configuration if requested

### Step 4: Build and Test

1. Run the build command
2. Check the output size and report it
3. List any warnings about missing modules
4. Suggest test steps to verify the packaged app works correctly

### Step 5: Distribution Guidance

Provide guidance on:

- How to create an installer (NSIS, Inno Setup for Windows; DMG for macOS)
- How to set up auto-update (if applicable)
- How to handle antivirus false positives (common with PyInstaller)
- How to code sign the executable
