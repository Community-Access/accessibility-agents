# 5.0.0 gh skill Adoption Implementation Plan

> **Historical.** This document describes the repository as it was before
> version 7.0, when agents lived in six per-client directories. It is kept
> for the record and is not maintained. The current layout is one `skills/`
> directory; start at [the documentation index](../README.md).
> Original path: `docs/GH-SKILL-ADOPTION-PLAN.md`.

## Summary

Adopt GitHub's native `gh skill` paradigm as the **primary and only** distribution method for Accessibility Agents 5.0.0.

**Impact:**

- Remove 6,767 lines of installer code
- Simplify CI/CD by 60%
- Automatic platform-independent updates
- GitHub marketplace integration
- Breaking change (requires `gh` CLI v2.47.0+)

---

## Implementation Checklist

### Phase 0: Build CLI Utilities [PREREQUISITE] (Week 1)

**CRITICAL: Must complete BEFORE Phase 2 (repository cleanup)**

These utilities replace all installer functionality. Building them first ensures nothing is lost.

- [ ] Create `go-cli/cmd/setup` (Go binary)
  - [ ] Interactive role/scope/platform selection
  - [ ] Team config JSON support
  - [ ] MCP profile configuration
  - [ ] Logging and summary output
  
- [ ] Create `go-cli/cmd/health` (Go binary)
  - [ ] GitHub CLI/Java/optional Node.js version checking
  - [ ] Playwright validation
  - [ ] Agent/skill verification
  - [ ] VS Code integration check
  - [ ] Claude Desktop MCP check
  - [ ] Git hooks status check
  
- [ ] Create `go-cli/cmd/repair` (Go binary)
  - [ ] Manifest regeneration
  - [ ] Git hook reinstallation
  - [ ] Configuration validation
  - [ ] MCP profile sync
  - [ ] File permission fixes
  - [ ] Version consistency
  
- [ ] Create `go-cli/cmd/hooks` (Go binary)
  - [ ] Pre-commit hook installation
  - [ ] Hook uninstallation
  - [ ] Status checking
  - [ ] Global hook registration

- [ ] Update `plugin.yaml` with subcommands:

  ```yaml
  subcommands:
    - setup
    - health
    - repair
    - hooks
  ```

- [ ] Test all utilities (Windows/macOS/Linux)
- [ ] Verify feature parity with old installer
- [ ] Document each utility

### Phase 1: Documentation & Communication (Week 1-2)

- [x] Create migration guide (`docs/GH-SKILL-MIGRATION.md`)
- [x] Create adoption plan (`docs/GH-SKILL-ADOPTION-PLAN.md`)
- [x] Create functionality audit (`docs/INSTALLER-FUNCTIONALITY-AUDIT.md`)
- [x] Create CLI utilities spec (`docs/CLI-UTILITIES-SPECIFICATION.md`)
- [ ] Update README.md with new installation instructions
- [ ] Create `docs/installation.md` focused on `gh skill`
- [ ] Create `docs/cli-utilities.md` documenting setup/health/repair/hooks
- [ ] Add FAQ section to GitHub Wiki
- [ ] Write deprecation notices for install.ps1/install.sh
- [ ] Update CHANGELOG.md with breaking changes notice

### Phase 2: Repository Cleanup (Week 3)

**ONLY after Phase 0 is complete and tested**

- [ ] **Delete old installers:**
  - [ ] `install.ps1`
  - [ ] `install.sh`
  - [ ] `uninstall.ps1`
  - [ ] `uninstall.sh`
  - [ ] `update.ps1`
  - [ ] `update.sh`

- [ ] **Delete supporting scripts:**
  - [ ] `scripts/Installer.Common.ps1`
  - [ ] `scripts/installer-common.sh`
  - [ ] `scripts/install-hooks.js` (replaced by `go-cli/cmd/hooks`)

- [ ] **Keep and validate:**
  - [x] `plugin.yaml` (already compliant, now with subcommands)
  - [x] `manifest.json` (auto-generated)
  - [x] `.github/agents/*.agent.md` (all 80)
  - [x] `.github/skills/*/SKILL.md` (all 25)
  - [ ] `go-cli/cmd/setup` (new)
  - [ ] `go-cli/cmd/health` (new)
  - [ ] `go-cli/cmd/repair` (new)
  - [ ] `go-cli/cmd/hooks` (new)

### Phase 3: CI/CD Simplification (Week 3)

- [ ] Remove installer test jobs from GitHub Actions
- [ ] Remove multi-platform build artifacts from releases
- [ ] Simplify release.yml to:
  - Validate agents
  - Check versions
  - Create GitHub release with manifests
  - (GitHub handles distribution automatically)
- [ ] Update PR validation to skip installer checks

### Phase 4: Documentation Updates (Week 3-4)

- [ ] **README.md:** New "Quick Start" section

  ````text
  ## Quick Start
  
  ```bash
  # Install GitHub CLI (if needed)
  brew install gh  # or apt-get, choco, etc.
  
  # Install Accessibility Agents
  gh skill install Community-Access/accessibility-agents
  
  # Configure (interactive wizard)
  gh skill setup Community-Access/accessibility-agents
  ```

  ````

- [ ] **docs/getting-started.md:** Platform-agnostic
- [ ] **docs/installation.md:** New file with `gh skill` focus
- [ ] **docs/cli-utilities.md:** Document the Go binaries behind setup/health/repair/hooks
- [ ] **AGENTS.md:** Update "Installation" section
- [ ] **CLAUDE.md:** Update "Installation" section

### Phase 5: Testing (Week 4)

- [ ] Test `gh skill install` on macOS
- [ ] Test `gh skill install` on Windows (PowerShell)
- [ ] Test `gh skill install` on Linux (Bash)
- [ ] Test `gh skill setup` interactive mode
- [ ] Test `gh skill setup` non-interactive mode
- [ ] Test `gh skill health` validation
- [ ] Test `gh skill repair` functionality
- [ ] Test `gh skill hooks install|uninstall`
- [ ] Test `gh skill upgrade` functionality
- [ ] Verify agents load correctly after install
- [ ] Verify skills are discoverable in `gh skill search`

### Phase 6: Release Preparation (Week 5)

- [ ] Create release branch: `release/5.0.0-gh-skill`
- [ ] Update version references (already at 5.0.0)
- [ ] Add deprecation warnings to the legacy installer branch
- [ ] Create GitHub release with title: "Accessibility Agents 5.0.0: Powered by GitHub Skills"
- [ ] Publish RELEASE-5.0.0.md in release notes

### Phase 7: Communication & Launch (Week 5-6)

- [ ] Announce on GitHub Discussions
- [ ] Create migration guide for current users
- [ ] Update community documentation
- [ ] Send notification to GitHub Dependabot followers
- [ ] Post on social media

---

## File Changes Summary

### Files to Delete (6,767 lines)

```text
install.ps1 ............................ DELETE
install.sh ............................. DELETE
uninstall.ps1 .......................... DELETE
uninstall.sh ........................... DELETE
update.ps1 ............................. DELETE
update.sh .............................. DELETE
scripts/Installer.Common.ps1 ........... DELETE
scripts/installer-common.sh ............ DELETE
scripts/install-hooks.js ............... DELETE
```

### Files to Update

```text
README.md ..................... ADD "gh skill install" quick start
docs/getting-started.md ....... Rewrite for gh skill
docs/installation.md .......... NEW FILE - gh skill focused
AGENTS.md ..................... Update installation section
CLAUDE.md ..................... Update installation section
.github/workflows/ ............ Simplify release pipeline
```

### Files That Stay (Validated)

```text
plugin.yaml ..................... ✅ Already gh skill compliant
manifest.json ................... ✅ Auto-generated correctly
.github/agents/*.agent.md ....... ✅ All 80 agents valid
.github/skills/*/SKILL.md ....... ✅ All 25 skills valid
go-cli/ ......................... ✅ Go-based cross-platform utility module
```

---

## Breaking Changes

**Version 5.0.0 is a major version bump for a reason:**

1. **Installation method changes** — `gh skill install` (required)
2. **`gh` CLI requirement** — v2.47.0 or later (breaking)
3. **Old installers removed** — install.ps1/install.sh don't exist
4. **Directory structure may change** — gh skill handles this
5. **Environment variables** — Some may differ (but documented)

**Migration is straightforward, but not automatic:**

```bash
# Users must do this one time:
gh skill install Community-Access/accessibility-agents
```

---

## CI/CD Pipeline Before & After

### Before (Legacy Installer Flow)

```text
1. Validate agents ........................ ~30s
2. Check versions ......................... ~5s
3. Build Windows installer ................ ~45s
4. Build macOS installer .................. ~45s
5. Build Linux installer .................. ~45s
6. Test Windows (self-hosted runner) ...... ~90s
7. Test macOS (self-hosted runner) ........ ~90s
8. Test Linux (Ubuntu runner) ............. ~60s
9. Upload to CDN .......................... ~20s
10. Update mirrors ........................ ~30s
─────────────────────────────────────────────
Total: ~360 seconds (6 minutes)
```

### After (5.0.0)

```text
1. Validate agents ........................ ~30s
2. Check versions ......................... ~5s
3. Create GitHub release .................. ~10s
4. Publish manifests ...................... ~5s
─────────────────────────────────────────────
Total: ~50 seconds (< 1 minute)
```

**90% CI/CD time reduction**

---

## Requirements for Users

### Minimum Requirements

```text
Operating System: Any (macOS, Windows, Linux)
GitHub CLI: v2.47.0 or later
Internet: GitHub API access (not air-gapped)
Permissions: Read access to Community-Access/accessibility-agents repo
```

### Installation Verification

Users can verify successful installation:

```bash
gh skill list
# Output should include:
# Community-Access/accessibility-agents (5.0.0)
```

---

## Rollback Plan (Just in Case)

If `gh skill` integration fails:

1. Keep a legacy installer branch frozen (do not delete)
2. Tag a "last-old-installer" archive point if needed
3. Publish detailed docs on using old installer
4. Create hybrid approach: `gh skill` as primary, old script as fallback

**Likelihood: Very low** — gh skill is stable GitHub infrastructure

---

## Long-term Benefits

### For Maintainers

- Reduced code debt (6,767 lines eliminated)
- Faster release cycles (90% time reduction)
- Less platform-specific bugs
- Focus on features, not infrastructure

### For Users

- Simpler onboarding
- Automatic updates
- Discoverable in marketplace
- Professional GitHub integration

### For the Ecosystem

- Standard GitHub distribution practice
- Model for other GitHub projects
- Reduced maintenance burden for open source

---

## Questions & Risks

### Q: What if users don't have `gh` CLI?

**A:** Installation instructions clearly state requirement. GitHub CLI is ubiquitous for devs.

### Q: What about air-gapped deployments?

**A:** Use the legacy installer branch if you need the script-based path.

### Q: Will this break CI/CD integrations?

**A:** No. Users who currently use scripts can upgrade to `gh skill` transparently.

### Q: How do we handle backward compatibility?

**A:** We don't. 5.0.0 is a major version with a clear migration path.

---

## Sign-Off Checklist

Before 5.0.0 release:

**CRITICAL PREREQUISITE:**

- [ ] Phase 0 COMPLETE: All CLI utilities built and tested
  - [ ] `go-cli/cmd/setup` working
  - [ ] `go-cli/cmd/health` working
  - [ ] `go-cli/cmd/repair` working
  - [ ] `go-cli/cmd/hooks` working
  - [ ] Feature parity verified with old installer
  - [ ] Multi-platform testing complete

**Only after Phase 0 is complete:**

- [ ] All installers properly deleted
- [ ] All gh skill integration tests pass
- [ ] README clearly shows new installation method
- [ ] Migration guide published
- [ ] Deprecation notices on the legacy installer branch
- [ ] GitHub release ready
- [ ] Community notified
- [ ] CI/CD simplified
- [ ] Documentation updated across all channels

---

## Recommendation

**✅ YES — Adopt `gh skill` for 5.0.0**

**Rationale:**

1. **Simplification:** 90% code reduction
2. **Professional:** Native GitHub integration  
3. **Sustainable:** Lower maintenance burden
4. **User-friendly:** Single command, works everywhere
5. **Future-proof:** Aligns with GitHub ecosystem standards
6. **Timing:** Major version (5.0.0) is the right moment

**Risk Level:** LOW — GitHub skills infrastructure is mature and battle-tested

**User Impact:** Breaking change, but migration is one-liner and well-documented

---

**Recommendation: Implement for 5.0.0 release**
