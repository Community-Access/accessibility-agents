# Plugin Packaging Guide

How to package, distribute, and install a11y-agent-team agents in different environments.

## Distribution Formats

### 1. Git Clone (Recommended)

The primary distribution method. All agents, skills, and configuration are stored in the repository.

**Install:**

```bash
# macOS
curl -fsSL https://raw.githubusercontent.com/Community-Access/accessibility-agents/main/install.sh | bash

# Windows (PowerShell)
irm https://raw.githubusercontent.com/Community-Access/accessibility-agents/main/install.ps1 | iex
```

**Update:**

```bash
# macOS
bash update.sh

# Windows
.\update.ps1
```

**Advantages:**

- Full agent set with all configuration
- Auto-update support via `update.sh` / `update.ps1`
- Works for Claude Code, Copilot, Claude Desktop, and Codex CLI simultaneously
- Git-based versioning and rollback

### 2. MCP Server (HTTP or stdio)

Standalone MCP server providing accessibility scanning tools via Streamable HTTP or stdio transport.

**Install and run:**

```bash
cd mcp-server
npm install
npm start          # HTTP on port 3100
npm run start:stdio # stdio for Claude Desktop
```

**Claude Desktop config (`claude_desktop_config.json`):**

```json
{
  "mcpServers": {
    "a11y-agent-team": {
      "command": "node",
      "args": ["<path-to>/mcp-server/stdio.js"]
    }
  }
}
```

**What's included (24 tools):**

- Core analysis: `check_contrast`, `get_accessibility_guidelines`, `check_heading_structure`, `check_link_text`, `check_form_labels`, `check_color_blindness`, `check_reading_level`
- Documents: `scan_office_document`, `scan_pdf_document`, `extract_document_metadata`, `batch_scan_documents`, `fix_document_metadata`, `fix_document_headings`
- Media and reporting: `validate_caption_file`, `generate_accessibility_statement`
- Cache helpers: `check_audit_cache`, `update_audit_cache`
- Playwright (optional): `run_axe_scan`, `run_playwright_a11y_tree`, `run_playwright_keyboard_scan`, `run_playwright_contrast_scan`, `run_playwright_viewport_scan`
- PDF extras (optional): `run_verapdf_scan` (requires veraPDF CLI), `convert_pdf_form_to_html` (requires pdf-lib)

**What's NOT included:**

- Agent files (Claude Desktop uses tools, not agent files)
- Agent Skills

### 3. Per-Project Install (Copilot)

Copy only the GitHub Copilot files into an existing project:

```bash
# Copy agents
cp -r .github/agents/ /path/to/project/.github/agents/

# Copy workspace instructions
cp .github/copilot-instructions.md /path/to/project/.github/

# Copy skills (optional)
cp -r .github/skills/ /path/to/project/.github/skills/

# Copy prompts (optional)
cp -r .github/prompts/ /path/to/project/.github/prompts/

# Copy VS Code config
cp -r .vscode/ /path/to/project/.vscode/
```

**Minimal install (agents only):**

```bash
cp -r .github/agents/ /path/to/project/.github/agents/
cp .github/copilot-instructions.md /path/to/project/.github/
```

### 4. Per-Project Install (Claude Code)

Copy only the Claude Code files into an existing project:

```bash
# Copy agents
cp -r .claude/agents/ /path/to/project/.claude/agents/
```

## Creating Custom Agent Packages

### Subset Packages

Create a focused package with only the agents you need:

**Web-only package** (no document agents):

```text
.github/agents/
  accessibility-lead.agent.md
  aria-specialist.agent.md
  modal-specialist.agent.md
  contrast-master.agent.md
  keyboard-navigator.agent.md
  live-region-controller.agent.md
  forms-specialist.agent.md
  alt-text-headings.agent.md
  tables-data-specialist.agent.md
  link-checker.agent.md
  web-accessibility-wizard.agent.md
  testing-coach.agent.md
  wcag-guide.agent.md
```

**Document-only package:**

```text
.github/agents/
  document-accessibility-wizard.agent.md
  document-inventory.agent.md
  cross-document-analyzer.agent.md
  word-accessibility.agent.md
  excel-accessibility.agent.md
  powerpoint-accessibility.agent.md
  pdf-accessibility.agent.md
  office-scan-config.agent.md
  pdf-scan-config.agent.md
.github/skills/
  accessibility-rules/SKILL.md
  document-scanning/SKILL.md
  report-generation/SKILL.md
```

### Custom Agent Extensions

To add organization-specific rules or agents:

1. Fork the repository
2. Add custom agents in `.github/agents/` or `.claude/agents/`
3. Update `copilot-instructions.md` with your custom agents
4. Add organization-specific scan configuration in `templates/`
5. Distribute the fork URL to your team

## Version Management

### Pinning to a Version

Use git tags for specific versions:

```bash
git clone --branch v1.0.0 https://github.com/Community-Access/accessibility-agents.git
```

### Auto-Update

The `update.sh` / `update.ps1` scripts pull the latest from the default branch. To pin:

```bash
# Edit update.sh to specify a branch or tag
git -C "$INSTALL_DIR" fetch origin
git -C "$INSTALL_DIR" checkout v1.0.0
```

## File Size Reference

Approximate sizes for planning distribution:

| Component | Files | Size |
|-----------|-------|------|
| Claude Code agents | 20 `.md` files | ~350 KB |
| Copilot agents | 22 `.agent.md` files | ~400 KB |
| Agent Skills | 3 `SKILL.md` files | ~30 KB |
| Prompts | 9 `.prompt.md` files | ~15 KB |
| Templates | 7 config files | ~10 KB |
| MCP server | `mcp-server/` (7 files) | ~120 KB |
| VS Code config | 4 files | ~5 KB |
| Documentation | Various | ~120 KB |
| **Total** | **~70 files** | **~1 MB** |
