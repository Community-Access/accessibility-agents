# CLI Utilities Specification for 5.0.0 Migration

> **Historical.** This document describes the repository as it was before
> version 7.0, when agents lived in six per-client directories. It is kept
> for the record and is not maintained. The current layout is one `skills/`
> directory; start at [the documentation index](../README.md).
> Original path: `docs/CLI-UTILITIES-SPECIFICATION.md`.

## Overview

After migrating to `gh skill`, we replace the monolithic installer with 4 focused CLI utilities:

1. **`setup`** — Interactive configuration post-install
2. **`health`** — Runtime dependency validation
3. **`repair`** — Fix broken installations
4. **`hooks`** — Git hook management

### Building the Go binaries

During development, build the utilities with the provided scripts:

```powershell
pwsh -NoProfile -File scripts/build-go-cli.ps1
```

```bash
bash scripts/build-go-cli.sh
```

This produces native binaries in `go-cli/bin/`:

- `a11y-agents-setup`
- `a11y-agents-health`
- `a11y-agents-repair`
- `a11y-agents-hooks`

On Windows, the outputs are `.exe` files.

---

## 1. Setup Utility (`go-cli/cmd/setup`)

### Purpose

Post-install configuration wizard. Runs after `gh skill install`.

### Usage

```bash
# Interactive mode (wizard)
gh skill setup Community-Access/accessibility-agents

# Or standalone during development
go run ./go-cli/cmd/setup

# Or using the built binary
a11y-agents-setup --role developer --scope global --yes
```

### Functionality

#### Step 1: Detect Current Environment

```text
✓ Checking installed agents/skills...
✓ Found 80 agents at ~/.gh/skills/...
✓ No previous configuration found
```

#### Step 2: Scope Selection

```text
Installation scope:
  1. Global (~/.claude/agents)
  2. Project (./.claude/agents)

Choose: [1] > _
```

#### Step 3: Role Selection

```text
Installation role:
  1. Developer (all agents + CLI tools)
  2. Reviewer (read-only audit agents)
  3. Author (content creation + documentation)
  4. Full (everything)
  5. Custom (pick individual agents)

Choose: [1] > _
```

#### Step 4: Platform Setup

```text
Configure for:
  [ ] VS Code (Copilot) - Stable
  [ ] VS Code (Copilot) - Insiders
  [x] Claude Desktop (MCP)
  [ ] Codex CLI
  [ ] Gemini CLI

Configure: [y/n] > y
```

#### Step 5: MCP Profile Configuration

```text
Configuring VS Code MCP profiles...
  ✓ Detected VS Code Stable at C:\Users\...\AppData\Local\...
  ✓ Detected VS Code Insiders at C:\Users\...\AppData\Local\...
  ✓ Setting up MCP socket connections

Enter MCP server port [8080]: > _
```

#### Step 6: Team Config (Optional)

```text
Team configuration file (optional):
  Path to config.json: > config.json

Validating config...
  ✓ Loaded: role=developer, scope=global, autoUpdate=true
```

#### Step 7: Summary & Confirmation

```text
Configuration Summary:
  Scope: Global (~/.claude/agents)
  Role: developer
  Platforms: Claude Desktop, VS Code Stable
  Team Config: config.json
  Auto-update: enabled

Apply configuration? [y/n] > y
```

#### Step 8: Post-Setup Health Check

```text
Running health checks...
  ✓ GitHub CLI detected
  ✓ Agent files validated
  ✓ Skill files validated
  ✓ MCP profile configured
  ✓ VS Code extension loaded

✅ Setup complete! Ready to use.
```

### Output Files Created

```text
~/.accessibility-agents/
├── config.json                    # User configuration
├── manifests.json                 # Installed agents/skills
├── version.txt                    # Current version
└── logs/
    └── setup-YYYY-MM-DD.log      # Setup log
```

### Return Codes

- `0`: Success
- `1`: User cancelled
- `2`: Configuration error
- `3`: File system error

---

## 2. Health Utility (`go-cli/cmd/health`)

### Purpose

Validate that all runtime dependencies and configurations are working.

### Usage

```bash
# Interactive check
gh skill health Community-Access/accessibility-agents

# Or standalone during development
go run ./go-cli/cmd/health

# Specific check
a11y-agents-health --check runtimes
a11y-agents-health --check agents
a11y-agents-health --check hooks
a11y-agents-health --check all
```

### Checks Performed

#### 1. Runtime Dependencies

```text
Runtime Dependencies:
  ✓ GitHub CLI v2.47.0+ (required)
  ⚠ Java 11.0.15 (optional, for PDF analysis)
  ✓ Git 2.37.0 (required for hooks)
```

Node.js remains optional here. It is only required when a user wants to run the MCP server locally.

#### 2. Playwright Browsers

```text
Playwright Browsers:
  ✓ Chromium (for accessibility scans)
  ✓ Firefox (optional)
  ⚠ WebKit (not installed)
```

#### 3. Agent/Skill Files

```text
Agent & Skill Files:
  ✓ 80 agents found
  ✓ 25 skills found
  ✓ All files readable
  ✓ Manifests consistent
```

#### 4. Configuration

```text
Configuration:
  ✓ User config loaded
  ✓ Role: developer
  ✓ Scope: global
  ✓ Team config: valid
```

#### 5. VS Code Integration

```text
VS Code Integration:
  ✓ Extension installed (Copilot)
  ✓ Settings folder exists
  ✓ MCP profiles configured
  ⚠ VS Code Insiders not detected
```

#### 6. Claude Desktop MCP

```text
Claude Desktop MCP:
  ✓ Configuration exists in claude_desktop_config.json
  ✓ MCP server socket accessible
  ✓ Health check passed
```

#### 7. Git Hooks

```text
Git Hooks:
  ✓ Pre-commit hook installed
  ✓ Hook is executable
  ✓ Hook tests pass
  ✓ Global hook directory: ~/.git/hooks
```

#### 8. Network Connectivity

```text
Network:
  ✓ GitHub API accessible
  ✓ Skills registry accessible
  ✓ Can check for updates
```

### Output Report

```text
Health Check Report
═══════════════════════════════════════════════════════════

Overall Status: ✅ HEALTHY (8/8 checks passed)

Issues Found: 0
Warnings: 1 (Java not installed - optional)
Manual Review Items: 0

Timestamp: 2026-04-16T14:32:15Z
Installation: ~/.claude/agents/
Config: ~/.accessibility-agents/config.json

═══════════════════════════════════════════════════════════

✅ All systems operational. Ready to use!
```

### Return Codes

- `0`: All checks passed
- `1`: 1+ critical issues
- `2`: Issues but functional
- `3`: Uncorrectable problems

---

## 3. Repair Utility (`go-cli/cmd/repair`)

### Purpose

Fix broken or misconfigured installations.

### Usage

```bash
# Interactive repair
gh skill repair Community-Access/accessibility-agents

# Or standalone during development
go run ./go-cli/cmd/repair

# Auto-repair (no prompts)
a11y-agents-repair --auto-repair

# Specific repairs
a11y-agents-repair --fix manifests
a11y-agents-repair --fix hooks
a11y-agents-repair --fix config
a11y-agents-repair --fix all
```

### Repair Actions

#### 1. Regenerate Manifests

```text
Regenerating manifests...
  ✓ Found 80 agents
  ✓ Found 25 skills
  ✓ Validating file integrity
  ✓ Wrote manifests.json
```

#### 2. Reinstall Git Hooks

```text
Reinstalling Git hooks...
  ✓ Found pre-commit hook
  ✓ Backing up existing hooks
  ✓ Installing fresh hook
  ✓ Testing hook execution
  ✓ Registered global hook
```

#### 3. Validate Configuration

```text
Validating configuration...
  ✓ config.json exists
  ✓ config.json valid JSON
  ✓ All required fields present
  ✓ Version alignment check
  ? Missing: "autoUpdate" (using default: true)
  ✓ Configuration valid
```

#### 4. Sync MCP Profiles

```text
Syncing MCP profiles...
  ✓ Claude Desktop profile found
  ✓ MCP socket connection established
  ✓ Skills available to Claude
  ✓ Agents available to Claude
  ✓ MCP profiles synchronized
```

#### 5. Fix File Permissions

```text
Fixing file permissions...
  ✓ Agent files: readable ✓
  ✓ Skill files: readable ✓
  ✓ Config files: readable/writable ✓
  ✓ Hook files: executable ✓
  ✓ All permissions correct
```

#### 6. Version Consistency

```text
Checking version consistency...
  Current: 5.0.0
  ✓ CHANGELOG.md: 5.0.0
  ✓ plugin.yaml: 5.0.0
  ✓ Installed agents: v5.0.0
  ✓ Installed skills: v5.0.0
  ✓ All versions aligned
```

### Output Report

```text
Repair Report
═══════════════════════════════════════════════════════════

Issues Found: 3
  - Missing: Git hook executable bit
  - Stale: Manifests from v4.6.0
  - Warning: Optional Java not installed

Repairs Applied: 2
  ✓ Regenerated manifests
  ✓ Fixed hook permissions

Repairs Skipped: 1
  - Java installation (optional)

Status: REPAIRED
Next step: Run 'gh skill health' to verify

═══════════════════════════════════════════════════════════
```

### Return Codes

- `0`: Repairs completed successfully
- `1`: Some repairs failed, manual intervention needed
- `2`: Unable to repair, reinstall recommended

---

## 4. Hooks Utility (`go-cli/cmd/hooks`)

### Purpose

Manage Git pre-commit hooks for accessibility checks.

### Usage

```bash
# Install hooks (interactive)
gh skill hooks Community-Access/accessibility-agents install

# Uninstall hooks
gh skill hooks Community-Access/accessibility-agents uninstall

# Status check
gh skill hooks Community-Access/accessibility-agents status

# Standalone
go run ./go-cli/cmd/hooks --action status
```

### Install Functionality

```text
Installing Git hooks...

✓ Detected Git repository at /d/code/agents/.git
✓ Detected OS: Windows

Creating pre-commit hook...
  Location: .git/hooks/pre-commit
  Content: Runs 'npm run validate-agents' before commits
  
Register globally? (optional)
  This allows hook to run in all repos
  [y/n] > y

✓ Installing global hook handler
✓ Registered accessibility-agents hook
✓ Hook is executable

Testing hook execution...
  $ npm run validate-agents
  ✓ All agents valid
  ✓ Hook works correctly

✅ Git hooks installed successfully
```

### Uninstall Functionality

```text
Uninstalling Git hooks...

✓ Found pre-commit hook for accessibility-agents
✓ Backing up to ~/.accessibility-agents/hooks/pre-commit.bak
✓ Removed hook from .git/hooks/pre-commit
✓ Removed global hook registration

✅ Git hooks uninstalled
```

### Status Functionality

```text
Git Hooks Status
═══════════════════════════════════════════════════════════

Local Repository: /d/code/agents/.git
  ✓ Pre-commit hook installed
  ✓ Hook is executable
  ✓ Hook tests accessibility
  Version: 5.0.0

Global Registration:
  ✓ Global hook handler active
  ✓ Applies to all repositories
  ✓ Can be disabled: 'gh skill hooks disable'

Recent Hook Executions:
  2026-04-16 14:15:22 - PASSED (0 issues)
  2026-04-16 14:12:10 - WARNING (1 issue found, bypassed)
  2026-04-16 14:05:44 - PASSED (0 issues)

═══════════════════════════════════════════════════════════
```

### Return Codes

- `0`: Success
- `1`: Git repository not found
- `2`: Permission denied
- `3`: Hook already exists/removed

---

## Implementation Phases

### Phase 1: Build Utilities

- [ ] `go-cli/cmd/setup` — interactive configuration binary
- [ ] `go-cli/cmd/health` — dependency validation binary
- [ ] `go-cli/cmd/repair` — fix installations binary
- [ ] `go-cli/cmd/hooks` — Git hook management binary

### Phase 2: Integration with `gh skill`

Each utility is invokable as:

```bash
gh skill setup Community-Access/accessibility-agents
gh skill health Community-Access/accessibility-agents
gh skill repair Community-Access/accessibility-agents
gh skill hooks Community-Access/accessibility-agents [action]
```

This requires entries in `plugin.yaml`:

```yaml
subcommands:
  - name: setup
    description: "Interactive setup wizard"
    command: bin/a11y-agents-setup
  - name: health
    description: "Validate runtime configuration"
    command: bin/a11y-agents-health
  - name: repair
    description: "Fix broken installations"
    command: bin/a11y-agents-repair
  - name: hooks
    description: "Manage Git pre-commit hooks"
    command: bin/a11y-agents-hooks
```

### Phase 3: Testing

- [ ] Test on macOS
- [ ] Test on Windows (PowerShell)
- [ ] Test on Linux (Bash)
- [ ] Test interactive modes
- [ ] Test non-interactive modes
- [ ] Verify all features preserved from 4.6.0 installer

### Phase 4: Documentation

- [ ] Update README with new workflow
- [ ] Document each utility
- [ ] Provide examples
- [ ] Migration guide for existing users

---

## Nothing Gets Lost: Complete Feature Mapping

Each feature, with its 4.6.0, 5.0.0+ and utility.

| Feature | 4.6.0 | 5.0.0+ | Utility |
|---------|-------|--------|---------|
| Installation | install.ps1 | `gh skill install` | GitHub |
| Role selection | -Role flag | `gh skill setup` (interactive) | setup |
| Scope (global/project) | -Project/-Global | `gh skill setup` (interactive) | setup |
| MCP setup | Embedded | `gh skill setup` | setup |
| VS Code Copilot | Embedded | `gh skill setup` | setup |
| Team config | -Config flag | `gh skill setup` (optional) | setup |
| Runtime validation | Built-in | `gh skill health` | health |
| Dependency checks | Built-in | `gh skill health` | health |
| Repair/fix | Embedded | `gh skill repair` | repair |
| Git hooks | Install-GlobalHooks | `gh skill hooks install` | hooks |
| Hook status | install.ps1 -Check | `gh skill hooks status` | hooks |
| Post-install check | Automatic | `gh skill health` (manual) | health |

---

## Summary

### What We're Building

4 focused Go CLI binaries handle all installer responsibilities without introducing a Node.js dependency for setup tooling.

### What We're Removing

6,767 lines of platform-specific installer code.

### What We're Gaining

- ✅ Simpler, more maintainable code
- ✅ Faster releases
- ✅ Professional GitHub distribution
- ✅ Automatic updates
- ✅ Cross-platform support
- ✅ All existing functionality preserved

**Everything works. Just simpler.**
