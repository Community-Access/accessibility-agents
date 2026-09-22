# Accessibility Agents 5.0.0: Migration to `gh skill` Paradigm

> **Historical.** This document describes the repository as it was before
> version 7.0, when agents lived in six per-client directories. It is kept
> for the record and is not maintained. The current layout is one `skills/`
> directory; start at [the documentation index](../README.md).
> Original path: `docs/GH-SKILL-MIGRATION.md`.

## Executive Summary

**Version 5.0.0 transitions Accessibility Agents from complex custom installers to GitHub's native `gh skill` distribution.**

- **Before:** 5,367 lines of installer scripts across platforms
- **After:** Single `gh skill install` command, handled by GitHub
- **Result:** 90% code reduction, automatic updates, professional GitHub integration

---

## Why This Change Makes Sense

### Current State (Legacy Installer-Based Builds)

```text
┌─────────────────┐
│  Custom Scripts │  2,079 lines (Windows PowerShell)
│                 │  2,756 lines (Bash)
│  + Helpers      │  532 lines (common logic)
└────────────────┬┘
                 │
        ┌────────▼─────────┐
        │ User's Machine   │
        └──────────────────┘
```

**Challenges:**

- Scripts must handle Windows/Mac/Linux differences
- Version consistency manually checked
- Update process is manual or complex
- Testing burden across platforms
- Security concerns with `irm | iex` pattern
- Hard to discover (not in GitHub marketplace)

### New State (5.0.0+)

```text
┌──────────────────┐
│  GitHub Releases │
│  (source of truth)
└────────┬─────────┘
         │
    ┌────▼─────────┐
    │  gh skill CLI │  (user's machine)
    │  (automatic)  │
    └───────────────┘
```

**Benefits:**

- GitHub handles platform differences
- Automatic, transparent updates
- Version enforcement
- Discoverable in `gh skill` marketplace
- Single command, infinite platforms
- Secure, official distribution

---

## What You Need to Do

### For End Users

**Upgrade requirement:**

- Install/update GitHub CLI: `brew install gh` or [github.com/cli/cli](https://github.com/cli/cli)
- Minimum version: `gh v2.47.0` (2024-09-17 or later)

**Installation (new):**

```bash
gh skill install Community-Access/accessibility-agents
```

**What happens:**

1. GitHub CLI validates your authentication
2. Downloads agent/skill manifests from GitHub
3. Installs to your machine
4. Ready to use in Copilot, Claude, or Codex CLI

**Updates (automatic):**

```bash
gh skill upgrade Community-Access/accessibility-agents
```

Or enable auto-updates:

```bash
gh skill upgrade --auto-update Community-Access/accessibility-agents
```

### For Current Legacy Installer Users

**Migration path:**

1. Uninstall old version: `gh skill uninstall Community-Access/accessibility-agents`
2. Install `gh` CLI (see above)
3. Install 5.0.0: `gh skill install Community-Access/accessibility-agents`

**Your previous configuration:**

- Accessibility Agents settings are preserved
- Agent customizations transfer automatically
- Agents/skills are re-installed fresh

---

## Architecture Changes for 5.0.0

### Files We're Removing

These 5,367 lines of installer code are **deleted** in 5.0.0:

```text
install.ps1 ........................... 2,079 lines ❌
install.sh ............................ 2,756 lines ❌
scripts/Installer.Common.ps1 ............ 270 lines ❌
scripts/installer-common.sh ............ 262 lines ❌
scripts/pre-commit (Git hook install) ... ~50 lines ❌
uninstall.ps1 ......................... ~400 lines ❌
uninstall.sh .......................... ~400 lines ❌
update.ps1 ............................ ~300 lines ❌
update.sh ............................ ~300 lines ❌
```

**Total cleanup: 6,767 lines**

### Files We're Keeping

```text
plugin.yaml ........................... ✅ GitHub Skills manifest
manifest.json ......................... ✅ Auto-generated index
scripts/validate-agents.js ............ ✅ Quality gate (CI)
scripts/check-release-consistency.js .. ✅ Version alignment (CI)
.github/agents/*.agent.md ............. ✅ 80 agent definitions
.github/skills/*/SKILL.md ............. ✅ 25 skill definitions
docs/getting-started.md ............... ✅ Updated for gh skill
docs/installation.md .................. ✅ New (gh skill focused)
```

### CI/CD Changes

**Old pipeline:**

- Validate agents (still do this)
- Check versions (still do this)
- Build installers (DELETED)
- Test on 3 platforms (DELETED)
- Publish to multiple CDNs (SIMPLIFIED)

**New pipeline:**

- Validate agents ✅
- Check versions ✅
- Publish GitHub release with manifests ✅
- GitHub CLI automatically distributes ✅

---

## For Developers & Contributors

### If You're Maintaining This Repo

**No changes to:**

- Agent development workflow
- Skill creation process
- CI validation

**New responsibilities:**

- Keep `plugin.yaml` in sync with agent count
- Ensure `manifest.json` auto-generates correctly
- Test `gh skill install` before releases

### If You're Building on This

Use this integration path:

```bash
gh skill install Community-Access/accessibility-agents
```

Or in your CI/CD:

```yaml
- name: Install Accessibility Agents
  run: gh skill install Community-Access/accessibility-agents
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## GitHub Skills Specification Compliance

### What This Means

Accessibility Agents 5.0.0 **fully complies** with [GitHub Skills Specification](./GITHUB-SKILLS-SPEC-QUICK-REFERENCE.md) requirements:

| Requirement | Status | Notes |
|-------------|--------|-------|
| Valid `plugin.yaml` | ✅ | agentskills.io compliant |
| Agent frontmatter | ✅ | All 80 agents have name/description/tools |
| Skill frontmatter | ✅ | All 25 skills have name/description |
| Version pinning | ✅ | Semantic versioning enforced |
| Documentation | ✅ | Discoverable in marketplace |
| License | ✅ | MIT - permissive |
| Security | ✅ | No external dependencies beyond gh CLI |

### Marketplace Discovery

Once published, users can find us:

```bash
gh skill search accessibility
# Returns: Community-Access/accessibility-agents (5.0.0)
# 80 specialized AI agents for web, document, and desktop accessibility
```

---

## Frequently Asked Questions

### Q: Does this break my existing installer-based setup?

**A:** No. Existing script-installed setups continue to work while you migrate. The unreleased 4.6 work was rolled into 5.0, so 5.0 is the supported target.

### Q: Can I use both old and new installers?

**A:** Not recommended. They manage the same agents. Use one or the other. Migration is straightforward.

### Q: What if I don't want to install `gh` CLI?

**A:** 5.0.0 requires `gh` CLI. If you need the legacy installer flow, use the archived script-based setup from git history or a legacy branch.

### Q: Do I lose my agent customizations?

**A:** No. Your configurations are in `~/.accessibility-agents/`. They persist.

### Q: How often do updates happen?

**A:** You control this. Manual updates: `gh skill upgrade`. Auto-updates: enable with `--auto-update`.

### Q: Is this more secure?

**A:** Yes. GitHub Signs releases cryptographically. Distribution is via trusted GitHub infrastructure, not raw script downloads.

### Q: What about air-gapped environments?

**A:** `gh skill` requires internet access to GitHub. For air-gapped setups, use the archived installer-based flow from a legacy branch or internal mirror.

---

## Timeline

Each date, with its event.

| Date | Event |
|------|-------|
| **2026-03-26** | Version 5.0.0 released with `gh skill` as primary installation method |
| **2026-06-26** | Old installers moved to `legacy/` branch (read-only) |
| **2026-09-26** | Old installers removed from main branch (still in git history) |
| **2027-01-01** | Support for old installer ends (legacy branch frozen) |

---

## Benefits Summary

### For Users

- **Simpler:** One command, works everywhere
- **Safer:** GitHub-signed releases
- **Automatic:** Updates without lifting a finger
- **Discoverable:** Find us in the marketplace

### For Maintainers

- **Less code:** 90% reduction in installer complexity
- **Fewer bugs:** Platform-specific issues eliminated
- **Better CI:** Simpler, faster release pipeline
- **Better support:** GitHub handles distribution

### For the Community

- **Standardization:** Accessibility Agents fits the GitHub ecosystem
- **Visibility:** Discoverable in official marketplace
- **Professionalism:** Native GitHub integration
- **Sustainability:** Lower maintenance = more time on features

---

## Next Steps

1. **Install `gh` CLI** (v2.47.0+)
2. **Try the new installer:** `gh skill install Community-Access/accessibility-agents`
3. **Remove any legacy installer deployment** (optional, they can coexist temporarily)
4. **Provide feedback:** GitHub Issues or Discussions

---

## Support

- **Docs:** [GitHub Wiki](https://github.com/Community-Access/accessibility-agents/wiki)
- **Issues:** [GitHub Issues](https://github.com/Community-Access/accessibility-agents/issues)
- **Discussions:** [Community Forum](https://github.com/Community-Access/accessibility-agents/discussions)

---

**Accessibility Agents 5.0.0: Simpler. Safer. Better.**
