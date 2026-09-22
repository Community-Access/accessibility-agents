# 5.0.0 Installation Guide - New Process

> **Historical.** This document describes the repository as it was before
> version 7.0, when agents lived in six per-client directories. It is kept
> for the record and is not maintained. The current layout is one `skills/`
> directory; start at [the documentation index](../README.md).
> Original path: `docs/INSTALLATION-GUIDE-5.0.md`.

**Last Updated:** April 16, 2026  
**Version:** 5.0.0 (GitHub Skills)  
**Status:** ✅ Production Ready

---

## Quick Start (All Platforms)

### Installation in 3 Commands

```bash
# 1. Install the skill from GitHub
gh skill install Community-Access/accessibility-agents

# 2. Run interactive setup wizard (configure your roles and platforms)
gh skill setup Community-Access/accessibility-agents

# 3. Verify everything works
gh skill health Community-Access/accessibility-agents
```

**That's it!** You're ready to use accessibility agents.

Important: you do not need Node.js to run `gh skill install`, `gh skill setup`, `gh skill health`, `gh skill repair`, or `gh skill hooks`. Those commands are backed by native Go binaries. Node.js is only needed if you choose to run the MCP server locally.

---

## What's New in 5.0.0

### Simpler Installation

Each feature, with its legacy flow and 5.0.0.

| Feature | Legacy flow | 5.0.0 |
|---------|-------|-------|
| **Platform** | Separate PS1/SH scripts | Unified `gh` command |
| **Installation** | Run script manually | `gh skill install` |
| **Configuration** | Script flags or prompts | `gh skill setup` wizard |
| **Verification** | Manual checks | `gh skill health` |
| **Updates** | Manual script re-run | `gh skill upgrade` |
| **Uninstall** | Run uninstall script | `gh skill uninstall` |
| **Global setup** | Embedded in script | `gh skill hooks` |
| **Repair** | Not available | `gh skill repair` |

### Better Security

- GitHub cryptographically signs all distributions
- No raw GitHub CDN downloads
- Official GitHub Skills marketplace

### Better Maintenance

- 90% less installer code (6,767 → about 850 lines of focused Go CLI code)
- Unified cross-platform experience
- Professional tooling

---

## Platform-Specific Instructions

### Windows

**Prerequisites:**

- GitHub CLI (gh) installed ([install.cli.github.com](https://cli.github.com))
- PowerShell 5.0+ or Windows Terminal

**If you are building the 5.0 Go utilities locally:**

```powershell
winget install --id GoLang.Go --exact --accept-package-agreements --accept-source-agreements
go version
pwsh -NoProfile -File scripts/build-go-cli.ps1
```

**Installation:**

```powershell
# 1. Install skill
gh skill install Community-Access/accessibility-agents

# 2. Configure (interactive wizard)
gh skill setup Community-Access/accessibility-agents

# 3. Verify
gh skill health Community-Access/accessibility-agents
```

**After setup:**

- VS Code agents/skills installed ✅
- Claude Desktop MCP configured (if selected) ✅
- Git hooks installed (if selected) ✅
- Team configuration applied (if selected) ✅

---

### macOS

**Prerequisites:**

- GitHub CLI (gh) installed (`brew install gh`)
- Bash 4+ or Zsh

**If you are building the 5.0 Go utilities locally:**

```bash
brew install go
go version
bash scripts/build-go-cli.sh
```

**Installation:**

```bash
# 1. Install skill
gh skill install Community-Access/accessibility-agents

# 2. Configure
gh skill setup Community-Access/accessibility-agents

# 3. Verify
gh skill health Community-Access/accessibility-agents
```

**After setup:**

- VS Code agents/skills installed ✅
- Claude Desktop MCP configured (if selected) ✅
- Git hooks installed (if selected) ✅
- Team configuration applied (if selected) ✅

---

### Linux

**Prerequisites:**

- GitHub CLI (gh) installed ([install](https://github.com/cli/cli/blob/trunk/docs/install_linux.md))
- Bash 4+ or Zsh

**Installation:**

```bash
# 1. Install skill
gh skill install Community-Access/accessibility-agents

# 2. Configure
gh skill setup Community-Access/accessibility-agents

# 3. Verify
gh skill health Community-Access/accessibility-agents
```

**After setup:**

- VS Code agents/skills installed ✅
- Claude Desktop MCP configured (if selected) ✅
- Git hooks installed (if selected) ✅
- Team configuration applied (if selected) ✅

---

## The Setup Wizard

When you run `gh skill setup Community-Access/accessibility-agents`, you'll be prompted for:

### 1. Your Role

Choose how you plan to use accessibility agents:

```text
? What's your role? (Use arrow keys)
❯ Developer (write UI code)
  Code Reviewer (review accessibility)
  Author (create accessible content)
  Full Suite (everything)
  Custom (select yourself)
```

**What each role includes:**

- **Developer**: ARIA specialist, keyboard navigator, forms specialist, alt text & headings, contrast master, live region controller, modal specialist
- **Code Reviewer**: Same as developer + Tables specialist, Link checker, Text quality reviewer
- **Author**: Document accessibility, markdown accessibility, media accessibility
- **Full Suite**: All 80+ agents and 25+ skills

### 2. Installation Scope

```text
? Where should agents be installed? (Use arrow keys)
❯ Global (this machine, all projects)
  Project (only this workspace)
```

- **Global**: Available everywhere (recommended)
- **Project**: Only in current folder (useful for team-specific configs)

### 3. Platforms

Select which platforms you use:

```text
? Which platforms? (Press space to select, enter to confirm)
❯ ✔ VS Code
  ✔ Claude Desktop
  ☐ Codex CLI
  ☐ Gemini CLI
```

### 4. Team Configuration (Optional)

```text
? Do you have a team configuration file? (y/n)
```

If yes, provide path to `accessibility-agents.json`:

```json
{
  "team": "your-team-name",
  "roles": ["developer", "reviewer"],
  "strictMode": true,
  "enabledAgents": ["accessibility-lead", "aria-specialist"]
}
```

### 5. Git Hooks (Optional)

```text
? Install git hooks for pre-commit validation? (y/n)
```

If yes, accessibility checks run on every commit.

---

## What the Utilities Do

### `gh skill setup`

Configures agents and skills for your setup.

```bash
# Interactive setup
gh skill setup Community-Access/accessibility-agents

# Non-interactive (use defaults)
gh skill setup Community-Access/accessibility-agents --yes

# With team config
gh skill setup Community-Access/accessibility-agents --config team-config.json
```

**Output:**

```text
✅ Configuration saved to ~/.accessibility-agents/config.json
✅ VS Code agents installed (80 agents)
✅ VS Code skills installed (25 skills)
✅ Claude Desktop MCP configured
✅ Git hooks installed
✅ Setup complete!
```

Implementation note: in 5.0.0 this command is intended to be backed by a native Go binary rather than a Node.js script, which keeps setup lightweight on Windows, macOS, and Linux.

### `gh skill health`

Validates your installation and runtime environment.

```bash
gh skill health Community-Access/accessibility-agents
```

**Checks:**

- GitHub CLI version ✅
- Java version (if needed) ✅
- Playwright Chromium ✅
- Agent files ✅
- Skill files ✅
- VS Code integration ✅
- Claude Desktop MCP ✅
- Git hooks ✅

Node.js is reported only when a user has enabled local MCP server workflows.

**Output:**

```text
Agent Health Report
═══════════════════════════════════════════
Runtime Environment:
  Node.js:        v18.16.0 ✅
  Java:           v17.0.4 ✅
  Playwright:     v1.40.1 ✅

Installation Status:
  Agents:         80/80 ✅
  Skills:         25/25 ✅
  VS Code:        Connected ✅
  Claude Desktop: Configured ✅
  Git Hooks:      Active ✅

Status: ✅ All systems operational
```

### `gh skill repair`

Fixes broken installations or validates configuration.

```bash
gh skill repair Community-Access/accessibility-agents
```

**Can fix:**

- Missing agent/skill files
- Corrupted configuration
- Broken Git hooks
- Incorrect permissions
- Version mismatches

**Output:**

```text
Repair Check
═════════════════════════════════════════════
Issues Found:        1
├─ Missing git hook

Repair Available:    1
├─ Reinstall git hooks

Run with --auto-repair to fix automatically:
  gh skill repair Community-Access/accessibility-agents --auto-repair
```

### `gh skill hooks`

Manages Git hooks for pre-commit accessibility validation.

```bash
# Install hooks
gh skill hooks install Community-Access/accessibility-agents

# Uninstall hooks
gh skill hooks uninstall Community-Access/accessibility-agents

# Check status
gh skill hooks status Community-Access/accessibility-agents

# Test hooks
gh skill hooks test Community-Access/accessibility-agents
```

---

## Migration from 4.5.x to 5.0.0

### Before Migration

You have 4.5.0 or 4.5.1 with:

- `install.ps1` / `install.sh` (old installer)
- Manual configuration
- Agents in `~/.claude/agents/`

### Migration Steps

```bash
# 1. Backup your current config (optional)
cp -r ~/.accessibility-agents ~/.accessibility-agents.backup

# 2. Install the new skill
gh skill install Community-Access/accessibility-agents

# 3. Run setup wizard (configures everything)
gh skill setup Community-Access/accessibility-agents

# 4. Verify new installation
gh skill health Community-Access/accessibility-agents

# 5. Old files no longer needed (can delete)
# The new system is completely separate and cleaner
```

**What stays the same:**

- Your Git history (untouched)
- Your VS Code user settings (untouched)
- Your projects (untouched)

**What changes:**

- Installation method (`gh skill install` instead of script)
- Configuration location (cleaner setup)
- Update method (`gh skill upgrade` instead of manual)

---

## Common Tasks

### Update to Latest Version

```bash
# Automatic update
gh skill upgrade Community-Access/accessibility-agents

# Or specific version
gh skill upgrade Community-Access/accessibility-agents@5.0.1
```

### Reconfigure After Update

```bash
# Re-run setup if configuration needs adjustment
gh skill setup Community-Access/accessibility-agents
```

### Uninstall

```bash
# Complete uninstall
gh skill uninstall Community-Access/accessibility-agents

# This removes:
# - All agents and skills
# - Git hooks
# - Configuration files
# - MCP setup
```

### Check Status Anytime

```bash
# See what's installed and working
gh skill health Community-Access/accessibility-agents
```

### Repair Broken Installation

```bash
# Automatic repair
gh skill repair Community-Access/accessibility-agents --auto-repair

# Or interactive repair
gh skill repair Community-Access/accessibility-agents
```

---

## Troubleshooting

### "command not found: gh"

**Solution:** Install GitHub CLI from [cli.github.com](https://cli.github.com)

### "skill not found"

**Solution:** Run with full specification:

```bash
gh skill install Community-Access/accessibility-agents
```

### Installation stuck or incomplete

**Solution:** Use repair utility:

```bash
gh skill repair Community-Access/accessibility-agents --auto-repair
```

### VS Code agents not showing up

**Solution:** Check health and restart VS Code:

```bash
gh skill health Community-Access/accessibility-agents
# Then restart VS Code (close all windows and reopen)
```

### Git hooks not working

**Solution:** Reinstall hooks:

```bash
gh skill hooks install Community-Access/accessibility-agents
```

### Need to restore old installation

**Solution:** GitHub CLI installations are separate from old system:

```bash
# New system continues working
gh skill setup Community-Access/accessibility-agents

# Old system can be separately removed when ready
# (no conflicts, completely separate)
```

---

## Support & Resources

- **GitHub Issues:** [github.com/Community-Access/accessibility-agents/issues](https://github.com/Community-Access/accessibility-agents/issues)
- **Discussions:** [github.com/Community-Access/accessibility-agents/discussions](https://github.com/Community-Access/accessibility-agents/discussions)
- **Docs:** [github.com/Community-Access/accessibility-agents/tree/main/docs](https://github.com/Community-Access/accessibility-agents/tree/main/docs)
- **GitHub CLI Help:** `gh skill --help`

---

## What's No Longer Needed

These files from the legacy installer flow are **no longer needed** in 5.0.0:

```text
❌ install.ps1        (replaced by gh skill install)
❌ install.sh         (replaced by gh skill install)
❌ uninstall.ps1      (replaced by gh skill uninstall)
❌ uninstall.sh       (replaced by gh skill uninstall)
❌ update.ps1         (replaced by gh skill upgrade)
❌ update.sh          (replaced by gh skill upgrade)
```

The new system is cleaner, simpler, and more reliable.

---

## Installation Process Summary

### 5.0.0 Process (NEW)

```text
1 minute setup:
  gh skill install Community-Access/accessibility-agents
  gh skill setup Community-Access/accessibility-agents
  gh skill health Community-Access/accessibility-agents
  ✅ Done!
```

### Legacy Process (OLD - No longer needed)

```text
Complex setup:
  Run install.ps1 or install.sh with various flags
  Answer multiple prompts or edit configuration files manually
  Run validation scripts
  Troubleshoot issues
  ⚠️ More complexity
```

---

## Ready to Install?

```bash
gh skill install Community-Access/accessibility-agents
```

See you after setup! 🚀
