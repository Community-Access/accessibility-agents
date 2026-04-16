# GitHub Agent Skills Spec Compliance Plan
**Date**: April 16, 2026  
**Spec Source**: [agentskills.io/specification](https://agentskills.io/specification)  
**GitHub Blog**: [Manage agent skills with GitHub CLI](https://github.blog/changelog/2026-04-16-manage-agent-skills-with-github-cli/)

---

## Executive Summary

On April 16, 2026, GitHub launched `gh skill`—a new command enabling discovery, installation, management, and publishing of agent skills across multiple platforms (GitHub Copilot, Claude Code, Cursor, Codex, Gemini CLI, Antigravity). The **accessibility-agents** repository contains **25 production skills** and **80 agents** that will benefit from this new CLI tooling and spec compliance.

### Key Impact

- **New Distribution Channel**: Skills can now be published and versioned via `gh skill publish`
- **Version Pinning**: Supply chain integrity via immutable releases and tree SHA tracking
- **Provenance Metadata**: Frontmatter must include repository, ref, and tree SHA
- **Multi-Platform Parity**: Skills work across all major agent hosts
- **Supply Chain Security**: Immutable releases, code scanning, secret scanning recommended

---

## Spec Compliance Status: Current State

### What We Have (Positive)

| Component | Status | Evidence |
|-----------|--------|----------|
| **25 Skills** | ✓ Exist | `.github/skills/*/SKILL.md` structure complete |
| **YAML Frontmatter** | ✓ Present | All skills have `name:` and `description:` |
| **Validation Script** | ✓ Exists | `scripts/validate-agents.js` checks frontmatter |
| **57 Unique Agents** | ✓ Multi-platform | `.claude/agents/`, `.codex-skills/`, `.gemini/extensions/` |
| **Platform Parity** | ✓ Maintained | Agents duplicated across 3-4 platforms with tool mapping |
| **WCAG Rule Systems** | ✓ Documented | Accessibility-rules skill maps 400+ rules |

### What We're Missing (Gaps)

| Requirement | Status | Impact | Notes |
|-------------|--------|--------|-------|
| **Provenance Metadata** | ✗ Missing | Supply chain risk | No `gh:` frontmatter for repo/ref/tree-sha |
| **Version Pinning Fields** | ✗ Missing | Can't track updates | No `gh:pinned-to` tag/sha field |
| **Publishing Workflow** | ✗ Missing | No CLI integration | No `gh skill publish` support in CI |
| **Spec Validation** | ✗ Partial | Incomplete checks | Script validates VS Code format, not agentskills.io |
| **Immutable Releases** | ✗ Not enabled | Security risk | GitHub release protection not mandated |
| **Release Tag Protection** | ✗ Not enabled | Security risk | Tags can be modified post-release |
| **Supply Chain Docs** | ✗ Missing | User trust | No SLSA badge or provenance statement |

---

## Spec Requirements Analysis

### Official agentskills.io Frontmatter Fields

Based on the GitHub blog post and spec link, required and recommended frontmatter fields are:

#### Required
```yaml
---
name: skill-name                    # Must match folder name
description: "Brief description"    # Single-line, <200 chars
---
```

#### Recommended (for `gh skill install`)
```yaml
---
name: skill-name
description: "..."
# GitHub provenance tracking (added by gh skill install)
gh:
  repository: "owner/repo"          # GitHub repo URL
  ref: "main"                       # Git ref (tag/branch/sha)
  tree-sha: "abc123def..."          # Content-addressable tree SHA
  installed-at: "2026-04-16T10:30:00Z"  # Installation timestamp
  version-pinned-to: "v1.2.0"       # If pinned to tag
---
```

#### Best Practices
```yaml
---
name: skill-name
description: "..."
# Additional metadata
gh:
  repository: "owner/repo"
  ref: "main"
  tree-sha: "abc123def..."
  installed-at: "2026-04-16T10:30:00Z"
  version-pinned-to: "v1.2.0"
# Optional but recommended
license: "MIT"                      # License identifier
homepage: "https://github.com/owner/repo"
repository-url: "https://github.com/owner/repo"
repository-type: "git"
---
```

---

## Detailed Compliance Assessment

### Skill-by-Skill Audit Required

**25 Skills to audit:**
1. accessibility-rules
2. ci-integration
3. cognitive-accessibility
4. data-visualization-accessibility
5. design-system
6. document-scanning
7. email-accessibility
8. framework-accessibility
9. github-analytics-scoring
10. github-scanning
11. github-workflow-standards
12. help-url-reference
13. legal-compliance-mapping
14. lighthouse-scanner
15. markdown-accessibility
16. media-accessibility
17. mobile-accessibility
18. office-remediation
19. playwright-testing
20. python-development
21. report-generation
22. testing-strategy
23. web-scanning
24. web-severity-scoring
25. (and 1 more—check `.github/skills/` for complete list)

**For each skill, verify:**
- [ ] Frontmatter has `name:` matching folder name
- [ ] Frontmatter has `description:` <200 chars
- [ ] No `gh:` fields present (OK—these are added by `gh skill install`)
- [ ] Markdown body is comprehensive and well-structured
- [ ] No broken links to external resources
- [ ] WCAG criterion mappings are accurate (if applicable)

### Platform-Specific Agent Parity Check

**Locations to verify:**
- `.github/agents/` (Copilot agents - ~57 .agent.md files)
- `.claude/agents/` (Claude Code agents - ~57 .md files)
- `.codex-skills/` (Codex agents - ~57 SKILL.md files)
- `.gemini/extensions/a11y-agents/skills/` (Gemini agents)

**Check for each agent:**
- [ ] Tool names translated correctly per platform conventions
- [ ] `description` field present and identical across platforms
- [ ] Multi-agent reliability patterns documented
- [ ] Output contracts defined (structured findings format)

---

## Implementation Plan

### Phase 1: Audit & Documentation (Week 1-2)
**Owner**: Accessibility Lead

**Tasks:**
1. [ ] Run current validation script: `node scripts/validate-agents.js --strict`
2. [ ] Document validation results in `COMPLIANCE-AUDIT.md`
3. [ ] Create inventory of all 25 skills with compliance status
4. [ ] Verify platform-specific agent parity
5. [ ] Check that all agents reference correct skills

**Deliverables:**
- `COMPLIANCE-AUDIT.md` (detailed audit report)
- Spreadsheet of 25 skills × compliance requirements
- List of any non-compliant agents/skills

### Phase 2: Validation Script Enhancement (Week 2-3)
**Owner**: Script Maintainer

**Tasks:**
1. [ ] Update `scripts/validate-agents.js` to detect agentskills.io spec violations
2. [ ] Add check for `name` matching folder name
3. [ ] Add check for `description` length (<200 chars)
4. [ ] Add check for WCAG mappings accuracy (sampling)
5. [ ] Add check for broken links (external URLs in skills)
6. [ ] Create `--agentskills` flag to validate against full spec
7. [ ] Add `--check-platforms` flag to verify Copilot/Claude/Codex parity

**Deliverables:**
- Enhanced `validate-agents.js` with agentskills.io checks
- CI workflow: `.github/workflows/validate-spec-compliance.yml`

### Phase 3: Supply Chain Security Setup (Week 3-4)
**Owner**: Repo Admin

**Tasks:**
1. [ ] Enable release immutability for all releases (GitHub Settings > Release)
2. [ ] Enable tag protection on `v*` tags (Branch protection rules)
3. [ ] Enable code scanning (if not already enabled)
4. [ ] Enable secret scanning
5. [ ] Generate SLSA provenance statement
6. [ ] Add security badges to README.md

**Deliverables:**
- Repository security settings updated
- `SECURITY.md` updated with supply chain guarantees
- Provenance badges in README

### Phase 4: CLI Publishing Workflow (Week 4-5)
**Owner**: DevOps / Release Manager

**Tasks:**
1. [ ] Create release workflow: `.github/workflows/publish-skills.yml`
2. [ ] Implement `gh skill publish --fix` auto-remediation (optional)
3. [ ] Add git hook to validate skills before commit
4. [ ] Document skill publishing process in `docs/publishing-skills.md`
5. [ ] Create GitHub Action to validate before releases

**Deliverables:**
- `.github/workflows/publish-skills.yml` (release automation)
- `docs/publishing-skills.md` (publication guide)
- `.git/hooks/pre-commit` (local validation)

### Phase 5: Documentation & Migration (Week 5-6)
**Owner**: Technical Writer

**Tasks:**
1. [ ] Update `AGENTS.md` with agentskills.io spec link
2. [ ] Add skill discovery/installation guide: `docs/guides/install-skills.md`
3. [ ] Document version pinning workflow
4. [ ] Add troubleshooting section for `gh skill` commands
5. [ ] Update README with `gh skill` command examples
6. [ ] Create migration guide for users currently using manual installation

**Deliverables:**
- `docs/guides/install-skills.md` (user guide)
- Updated `README.md` with skill install examples
- Migration guide for existing users

### Phase 6: Testing & Rollout (Week 6-7)
**Owner**: QA / Release Manager

**Tasks:**
1. [ ] Test all 25 skills with `gh skill preview` command
2. [ ] Test `gh skill install` on all supported platforms
3. [ ] Verify version pinning with `--pin` flag
4. [ ] Verify `gh skill update` detects changes via tree SHA
5. [ ] Create GitHub release with immutability enabled
6. [ ] Beta test with early adopters
7. [ ] Public release announcement

**Deliverables:**
- Test report: `TESTING-RESULTS.md`
- First release with spec compliance
- Blog post or announcement

---

## Ongoing Maintenance

### Monthly Compliance Checks
```bash
# Run validation
node scripts/validate-agents.js --strict --agentskills

# Check for spec updates
curl https://agentskills.io/specification | grep -i "frontmatter"

# Review new agent tools/hosts
gh api repos/Community-Access/accessibility-agents/issues --jq '.[] | select(.labels[].name | contains("spec"))'
```

### Quarterly Spec Alignment
- [ ] Review agentskills.io for breaking changes
- [ ] Test with latest `gh skill` CLI version
- [ ] Audit supply chain security settings
- [ ] Update badges and provenance statements

### Community Communication
- [ ] Announce spec compliance in CHANGELOG
- [ ] Publish blog post on supply chain transparency
- [ ] Participate in GitHub Community discussions
- [ ] Link to agentskills.io in all skill documentation

---

## Risk Assessment

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Spec changes break existing workflows | Medium | High | Subscribe to agentskills.io updates; test quarterly |
| Skills published before audit | Low | Medium | Gate releases: only publish after compliance check |
| Provenance data becomes stale | Medium | Low | Add CI job to refresh metadata on each release |
| Platform-specific drift | Medium | Medium | Automated validation across all 4 platforms |
| Supply chain attack via compromised release | Low | Critical | Enable immutable releases + code signing |

---

## Success Criteria

✓ **All 25 skills pass agentskills.io spec validation**  
✓ **All 80 agents maintain platform parity**  
✓ **`gh skill` commands work for install/update/discover**  
✓ **Version pinning works end-to-end**  
✓ **Immutable releases enabled and documented**  
✓ **Supply chain security badges visible in README**  
✓ **Documentation complete and tested**  
✓ **CI/CD pipeline validates spec compliance on every commit**

---

## Resources

- [GitHub Blog: Manage agent skills with GitHub CLI](https://github.blog/changelog/2026-04-16-manage-agent-skills-with-github-cli/)
- [Agent Skills Specification](https://agentskills.io/specification)
- [GitHub Copilot: Custom Agents Configuration](https://docs.github.com/en/copilot/reference/custom-agents-configuration)
- [GitHub: Securing your supply chain](https://docs.github.com/en/code-security/securing-your-organization)
- [SLSA Framework](https://slsa.dev/)

---

## Questions & Decisions

**Open Questions:**
1. Should we enable code signing for releases?
2. Do we need SLSA level 3+ compliance?
3. Should provenance metadata be auto-generated in CI?
4. Which platforms are priority for initial rollout?

**Decisions to Make:**
- [ ] Opt into immutable releases?
- [ ] Enable code signing?
- [ ] Create public accessibility statement?
- [ ] Support both `gh skill` and manual installation?

