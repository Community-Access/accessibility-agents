# PRE-DELETION SAFETY CHECKLIST (Phase 0 → Phase 2 Gate)

> **Historical.** This document describes the repository as it was before
> version 7.0, when agents lived in six per-client directories. It is kept
> for the record and is not maintained. The current layout is one `skills/`
> directory; start at [the documentation index](../README.md).
> Original path: `docs/PHASE-2-DELETION-SAFETY-GATE.md`.

**This checklist MUST be 100% complete before any old installer files are deleted.**

---

## Critical Requirement

**NO file deletion until this checklist is 100% complete and signed off.**

Old installer files:

```text
install.ps1, install.sh
uninstall.ps1, uninstall.sh
update.ps1, update.sh
scripts/Installer.Common.ps1, scripts/installer-common.sh
```

Cannot be deleted until all items below are verified WORKING.

---

## Phase 0 Completion Verification

### Setup Utility (`gh skill setup`)

- [ ] **Windows Testing**
  - [ ] Interactive role selection works
  - [ ] Global vs project scope works
  - [x] Platform selection (VS Code/Claude/Codex/Gemini) works
  - [ ] Team config JSON loading works
  - [ ] MCP profile configuration works
  - [ ] Configuration saved to ~/.accessibility-agents/config.json
  - [x] Non-interactive mode works (--yes flag)

- [ ] **macOS Testing**
  - [ ] All same checks as Windows
  - [ ] MCP socket configuration works
  - [ ] VS Code paths detected correctly
  - [ ] Claude Desktop profile found and configured

- [ ] **Linux Testing**
  - [ ] All same checks as Windows
  - [ ] Shell detection works (bash/zsh/fish)
  - [ ] Path handling works
  - [ ] MCP socket configuration works

- [ ] **Feature Parity with Old Installer**
  - [ ] -Project flag equivalent: ✅ setup scope selection
  - [ ] -Global flag equivalent: ✅ setup scope selection
  - [ ] -Role flag equivalent: ✅ setup role selection
  - [ ] -Config flag equivalent: ✅ setup team config loading
  - [ ] -Copilot flag equivalent: ✅ setup platform selection
  - [ ] -Cli flag equivalent: ✅ setup platform selection
  - [ ] Team config merging works: ✅ verified
  - [ ] Environment variable setup works: ✅ verified

### Health Utility (`gh skill health`)

- [ ] **Windows Testing**
  - [x] GitHub CLI version check works (shows version and path)
  - [x] Java version check works (optional, shows if missing)
  - [ ] Playwright Chromium detection works
  - [x] Agent files validation works (all 80 found)
  - [x] Skill files validation works (all 25 found)
  - [x] VS Code integration check works
  - [ ] Claude Desktop MCP check works
  - [x] Git hooks detection works
  - [x] Output report generated correctly

- [ ] **macOS Testing**
  - [ ] All same checks as Windows
  - [ ] macOS-specific paths detected correctly
  - [ ] VS Code application bundle found
  - [ ] Claude Desktop configuration found

- [ ] **Linux Testing**
  - [ ] All same checks as Windows
  - [ ] Linux-specific paths work correctly
  - [ ] Package manager paths work (apt, brew, etc.)

- [ ] **Replaces Old Installer Checks**
  - [ ] Runtime dependency validation: ✅ health checks Node/Java
  - [ ] PowerShell version check: ✅ removed (gh CLI universal)
  - [ ] Pre-install validation: ✅ health checks everything
  - [ ] MCP smoke tests: ✅ health checks MCP accessibility

### Repair Utility (`gh skill repair`)

- [ ] **Windows Testing**
  - [x] Manifest regeneration works
  - [ ] Detects all 80 agents
  - [ ] Detects all 25 skills
  - [ ] Git hooks reinstallation works
  - [ ] Existing hooks backed up before replacement
  - [ ] File permissions fixed correctly
  - [ ] Configuration validation works
  - [ ] Version consistency checks work
  - [x] Output report generated correctly
  - [x] --auto-repair flag works (no prompts)

- [ ] **macOS Testing**
  - [ ] All same checks as Windows
  - [ ] File permissions use correct Unix semantics
  - [ ] Hook paths are correct for macOS

- [ ] **Linux Testing**
  - [ ] All same checks as Windows
  - [ ] File permissions work correctly
  - [ ] Shell script hooks compatible

- [ ] **Replaces Old Repair Functionality**
  - [ ] install.ps1 -Check equivalent: ✅ repair validates
  - [ ] Manifest regeneration: ✅ repair regenerates
  - [ ] Version consistency: ✅ repair validates
  - [ ] Hook reinstallation: ✅ repair reinstalls

### Hooks Utility (`gh skill hooks`)

- [ ] **Windows Testing**
  - [x] Hook install works in .git/hooks/pre-commit
  - [ ] Hook is executable after install
  - [x] Hook test execution works
  - [ ] Global hook registration works
  - [ ] Hook uninstall removes file correctly
  - [x] Status check shows correct information
  - [ ] Recent execution history available

- [ ] **macOS Testing**
  - [ ] All same checks as Windows
  - [ ] Bash script compatibility verified
  - [ ] Global hook paths correct

- [ ] **Linux Testing**
  - [ ] All same checks as Windows
  - [ ] Shell compatibility verified
  - [ ] Global hook paths correct

- [ ] **Replaces Old Hook Functionality**
  - [ ] Install-GlobalHooks equivalent: ✅ hooks install works
  - [ ] Hook testing: ✅ hooks test works
  - [ ] Global registration: ✅ hooks register globally
  - [ ] Hook status: ✅ hooks status works

---

## Integration Testing

### All Utilities Together

- [ ] **Windows**
  - [x] Install → Setup → Health → All working: ✅
  - [x] Setup creates config: ✅
  - [x] Health validates setup: ✅
  - [ ] Repair fixes any issues: ✅
  - [x] Hooks work with other utilities: ✅

- [ ] **macOS**
  - [ ] All same integration checks as Windows: ✅

- [ ] **Linux**
  - [ ] All same integration checks as Windows: ✅

### Upgrade Path

- [ ] `gh skill upgrade` works correctly
- [ ] Existing configuration survives upgrade
- [ ] New utilities work after upgrade
- [ ] Backward compatibility verified

---

## User Migration Testing

### Legacy User Migration Scenario

- [ ] **Fresh Install Path**
  - [ ] User runs: `gh skill install Community-Access/accessibility-agents`
  - [ ] Skill downloads correctly
  - [ ] All agents/skills available
  - [ ] User runs: `gh skill setup Community-Access/accessibility-agents`
  - [ ] Setup wizard works
  - [ ] Configuration saved
  - [ ] User runs: `gh skill health Community-Access/accessibility-agents`
  - [ ] All checks pass
  - [ ] ✅ User has working 5.0.0 installation

- [ ] **Upgrade Path (legacy installer flow → 5.0.0)**
  - [ ] Existing agents/skills backed up
  - [ ] New skill installs cleanly
  - [ ] Old config migrated or reset cleanly
  - [ ] No conflicts or errors
  - [ ] ✅ Smooth upgrade experience

- [ ] **Edge Cases**
  - [ ] User had custom configuration in the legacy installer flow
  - [ ] User had Git hooks installed
  - [ ] User had multiple scopes (project + global)
  - [ ] User had all platforms configured
  - [ ] ✅ All cases handled cleanly

---

## Documentation Verification

- [ ] **Installation Guide Updated**
  - [ ] README.md shows `gh skill install` command
  - [ ] Quick start is one-liner + setup command
  - [ ] Old installer mention removed

- [ ] **CLI Utilities Documentation**
  - [ ] Go setup binary documented with examples
  - [ ] Go health binary documented with output examples
  - [ ] Go repair binary documented with use cases
  - [ ] Go hooks binary documented with examples

- [ ] **Migration Guide**
  - [ ] Step-by-step for legacy installer users
  - [ ] FAQ covers common questions
  - [ ] Troubleshooting section complete
  - [ ] Links to support resources

- [ ] **Change Log**
  - [ ] Breaking changes clearly marked
  - [ ] Migration instructions included
  - [ ] New features documented
  - [ ] Deprecation notices included

---

## Sign-Off Requirements

Before ANY file deletion, ALL signatures required:

- [ ] **Development Lead**
  - Name: ___________________
  - Date: ___________________
  - Verified: All utilities working on all platforms

- [ ] **QA Lead** (if applicable)
  - Name: ___________________
  - Date: ___________________
  - Verified: Integration tests pass

- [ ] **Documentation Lead** (if applicable)
  - Name: ___________________
  - Date: ___________________
  - Verified: Migration guide complete

---

## Pre-Deletion Review

### Files Scheduled for Deletion

```text
CONFIRM EACH BEFORE DELETION:

install.ps1 (2,079 lines)
  [ ] Functionality moved to gh skill setup? YES
  [ ] Functionality tested? YES
  [ ] Not needed anymore? YES
  → SAFE TO DELETE

install.sh (2,756 lines)
  [ ] Functionality moved to gh skill setup? YES
  [ ] Functionality tested? YES
  [ ] Not needed anymore? YES
  → SAFE TO DELETE

uninstall.ps1 (~1,100 lines)
  [ ] Functionality moved to gh skill uninstall? YES
  [ ] Functionality tested? YES
  [ ] Not needed anymore? YES
  → SAFE TO DELETE

uninstall.sh (~1,100 lines)
  [ ] Functionality moved to gh skill uninstall? YES
  [ ] Functionality tested? YES
  [ ] Not needed anymore? YES
  → SAFE TO DELETE

update.ps1 (~300 lines)
  [ ] Functionality moved to gh skill upgrade? YES
  [ ] Functionality tested? YES
  [ ] Not needed anymore? YES
  → SAFE TO DELETE

update.sh (~300 lines)
  [ ] Functionality moved to gh skill upgrade? YES
  [ ] Functionality tested? YES
  [ ] Not needed anymore? YES
  → SAFE TO DELETE

scripts/Installer.Common.ps1 (270 lines)
  [ ] Functionality moved to new utilities? YES
  [ ] Not needed anymore? YES
  → SAFE TO DELETE

scripts/installer-common.sh (262 lines)
  [ ] Functionality moved to new utilities? YES
  [ ] Not needed anymore? YES
  → SAFE TO DELETE
```

---

## Final Checklist Before Deletion

- [ ] All Phase 0 testing complete
- [ ] All utilities signed off as working
- [ ] All documentation updated
- [ ] All user migration paths tested
- [ ] All edge cases handled
- [ ] Rollback plan documented
- [ ] Backup of old code exists in git history
- [ ] No production systems running on new code yet
- [ ] Community notification sent (if applicable)

---

## Deletion Command (After All Checks Pass)

```bash
# ONLY RUN AFTER ALL CHECKBOXES ABOVE ARE CHECKED

git rm -f install.ps1 install.sh uninstall.ps1 uninstall.sh update.ps1 update.sh
git rm -f scripts/Installer.Common.ps1 scripts/installer-common.sh

git commit -m "feat: remove legacy installers after successful gh skill migration

Phase 2 of 5.0.0 migration: Delete old installer files after Phase 0 (CLI utilities)
and Phase 1 (documentation) complete and verified.

All functionality preserved in new utilities:
- Go setup binary (role/scope/platform configuration)
- Go health binary (runtime validation)
- Go repair binary (installation repair/maintenance)
- Go hooks binary (git hook management)

Tests confirm feature parity with old installer.
Multi-platform testing (Windows/macOS/Linux) complete.
User migration paths verified.

Legacy files preserved in git history for rollback if needed.
See GH-SKILL-ADOPTION-PLAN.md Phase 2 for details."
```

---

## After Deletion

- [ ] Verify CI/CD passes
- [ ] Verify no broken references in code
- [ ] Verify no broken references in docs
- [ ] Run full test suite
- [ ] Confirm 5.0.0 is ready for release

---

## Critical Principle

**This checklist is the gate between Phase 0 and Phase 2.**

Nothing gets deleted until this entire checklist is 100% complete and signed off.

This protects against:

- ✅ Losing functionality
- ✅ Breaking user migration
- ✅ Creating incompatibilities
- ✅ Leaving orphaned code
- ✅ Poor user experience

**Do not proceed without 100% completion of all items above.**
