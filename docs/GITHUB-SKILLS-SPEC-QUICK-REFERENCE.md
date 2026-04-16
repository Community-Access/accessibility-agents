# GitHub Skills Spec: Spec vs. Current Implementation

## Frontmatter Comparison

| Field | Required? | Current Status | Example | Priority |
|-------|-----------|----------------|---------|----------|
| `name` | ✓ Required | ✓ Have | `name: markdown-accessibility` | — |
| `description` | ✓ Required | ✓ Have | `description: "Markdown accessibility rule library..."` | — |
| `gh.repository` | Recommended | ✗ Missing | `gh.repository: Community-Access/accessibility-agents` | **HIGH** |
| `gh.ref` | Recommended | ✗ Missing | `gh.ref: main` or `gh.ref: v1.2.0` | **HIGH** |
| `gh.tree-sha` | Recommended | ✗ Missing | `gh.tree-sha: abc123def...` | **HIGH** |
| `gh.installed-at` | Auto-added | ✗ Not applicable | (Added by `gh skill install`) | — |
| `gh.version-pinned-to` | Auto-added | ✗ Not applicable | (Added if user pins version) | — |
| `license` | Recommended | ✗ Missing | `license: MIT` | Medium |
| `homepage` | Recommended | ✗ Missing | `homepage: https://github.com/...` | Medium |

---

## Agent Parity Matrix

### Platform Distribution

```
Accessibility Agents: 80 unique agents × 4 platforms

Platform          File Location                 Count  Tool Convention
─────────────────────────────────────────────────────────────────────────
GitHub Copilot    .github/agents/*.agent.md      57    execute, read, edit, search, agent, web
Claude Code       .claude/agents/*.md            57    Read, Edit, Grep, Bash, Task
Codex             .codex-skills/*.SKILL.md       57    (TBD - check structure)
Gemini CLI        .gemini/extensions/a11y-agents/57   (TBD - check structure)
```

### Example: ARIA Specialist Agent Tool Mapping

| Platform | Tool Reference | File Location | Status |
|----------|-----------------|---------------|--------|
| **Copilot** | `search`, `read`, `edit`, `agent` | `.github/agents/aria-specialist.agent.md` | ✓ Ready |
| **Claude Code** | `Grep`, `Read`, `Edit`, `Task` | `.claude/agents/aria-specialist.md` | ✓ Ready |
| **Codex** | (Skills-based model) | `.codex-skills/aria-specialist/SKILL.md` | ? Check |
| **Gemini CLI** | (TBD) | `.gemini/extensions/a11y-agents/skills/aria-specialist/SKILL.md` | ? Check |

---

## Validation Gaps

### Current Validation (scripts/validate-agents.js)

✓ **Checks:**
- YAML frontmatter validity
- Required fields: `name`, `description` for skills
- Tool names against VS Code official list
- MCP namespaced tools (`mcp:server/tool`)
- Deprecated properties (e.g., `infer` → `user-invocable`)
- Prompt length (max 30k chars for github.com)

✗ **Missing:**
- agentskills.io spec compliance
- `gh:` frontmatter fields
- Description length validation (<200 chars)
- Broken links in skill documentation
- WCAG criterion accuracy sampling
- Platform-specific tool name parity

### Required Validation Additions

```javascript
// TODO: Add to validate-agents.js

// 1. Check name matches folder name
if (frontmatter.name !== folderName) {
  errors.push(`Skill name must match folder: ${folderName}`);
}

// 2. Check description length
if (frontmatter.description.length > 200) {
  warnings.push(`Description should be <200 chars: ${frontmatter.description.length} chars`);
}

// 3. Check for provenance metadata (optional now, required after rollout)
if (!frontmatter.gh?.repository) {
  info.push(`[FUTURE] Will require gh.repository field for publishing`);
}

// 4. Validate external links
const externalLinks = extractLinks(skillBody);
for (const link of externalLinks) {
  const status = await fetch(link).status;
  if (status >= 400) {
    errors.push(`Broken link: ${link} (HTTP ${status})`);
  }
}
```

---

## Supply Chain Security Checklist

### GitHub Repository Settings

| Setting | Current | Target | Action |
|---------|---------|--------|--------|
| Immutable releases | ✗ Off | ✓ On | Enable in Settings > Release |
| Tag protection | ✗ Off | ✓ On | Protect `v*` tags |
| Code scanning | ? | ✓ On | Enable GitHub Advanced Security |
| Secret scanning | ? | ✓ On | Enable in Settings > Security |
| Require status checks | ? | ✓ On | Require validation in `main` branch |
| Dismiss stale reviews | ✓ On | ✓ On | Keep enabled |
| Require code signing | ✗ Off | ? | Evaluate; may slow releases |

### Release Metadata

| Field | Current | Target | Source |
|-------|---------|--------|--------|
| Release notes | ✓ Have | ✓ Keep | CHANGELOG.md + gh release create |
| Release artifacts | ✓ Have | ? | SLSA provenance? |
| Commit signatures | ? | ? | Evaluate |
| SBOM (Software Bill of Materials) | ✗ No | ? | Generate via cyclonedx-npm |

---

## CLI Command Examples (After Compliance)

### For Users

```bash
# Discover skills
gh skill search accessibility

# Preview before installing
gh skill preview Community-Access/accessibility-agents markdown-accessibility

# Install specific version
gh skill install Community-Access/accessibility-agents markdown-accessibility@v1.2.0

# Pin to prevent accidental updates
gh skill install Community-Access/accessibility-agents markdown-accessibility --pin v1.2.0

# Update all installed skills
gh skill update --all

# List installed skills
gh skill list
```

### For Repository Maintainers

```bash
# Validate skills before publishing
gh skill publish --validate

# Auto-fix metadata issues
gh skill publish --fix

# Publish to GitHub registry
gh skill publish --release v1.2.0
```

---

## Decision Matrix: What Needs to Change

### Immediate (Required for `gh skill` integration)

| Item | Action | Owner | Timeline | Blocking? |
|------|--------|-------|----------|-----------|
| Audit all 25 skills | Verify spec compliance | Accessibility Lead | Week 1 | Yes |
| Update validation script | Add agentskills.io checks | Script Maintainer | Weeks 2-3 | Yes |
| Add `gh:` provenance fields (template) | Document recommended format | Tech Writer | Week 2 | No* |

*Not immediately required (GitHub adds automatically), but recommended for transparency.

### Short-term (Recommended for supply chain security)

| Item | Action | Owner | Timeline | Blocking? |
|------|--------|-------|----------|-----------|
| Enable immutable releases | GitHub Settings | Repo Admin | Week 3 | No |
| Enable tag protection | GitHub Settings | Repo Admin | Week 3 | No |
| Create publishing workflow | `.github/workflows/publish-skills.yml` | DevOps | Weeks 4-5 | No |

### Medium-term (Nice-to-have, improves UX)

| Item | Action | Owner | Timeline | Blocking? |
|------|--------|-------|----------|-----------|
| Write skill install guide | `docs/guides/install-skills.md` | Tech Writer | Week 5 | No |
| Create SLSA badge | Add to README | Repo Admin | Week 6 | No |
| Support `gh skill publish` in CI | GitHub Actions | DevOps | Week 6 | No |

---

## Critical Questions for Repo Maintainers

1. **Should we add `gh:` provenance fields to skills NOW, or wait for `gh skill install` to add them automatically?**
   - **Recommendation**: Add to skills now for transparency; `gh skill install` will overwrite with accurate data.

2. **Do we want to support both manual installation AND `gh skill` installation?**
   - **Recommendation**: Yes—backwards compatibility important for users not on latest CLI.

3. **Should we enable code signing for releases?**
   - **Recommendation**: Optional but recommended; evaluate performance impact.

4. **What's the rollout order for platforms?**
   - **Recommendation**: Copilot first (most users), then Claude Code, then Codex/Gemini.

5. **Do we need SLSA compliance?**
   - **Recommendation**: Aim for SLSA level 2 (automated process); level 3 if users demand it.

---

## Reference: Agent Skills Specification Document

**Location**: [agentskills.io/specification](https://agentskills.io/specification)

**Key Sections**:
1. File Format (YAML frontmatter + markdown body)
2. Required vs. Optional Fields
3. Versioning & Pinning
4. Provenance Metadata
5. Multi-Platform Support
6. Supply Chain Security

**Important Notes**:
- Specification is vendor-neutral (works across 6+ platforms)
- Provenance metadata travels with the skill
- Content-addressed change detection via tree SHA
- Immutable releases recommended but not required
- Community discussion: [GitHub Community Discussions](https://github.com/orgs/community/discussions)
