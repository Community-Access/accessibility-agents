# AGENTS.md

> AI agent guidance for this repository. Generated for AgentRC compatibility.

This repository contains 59 accessibility-focused AI agents across multiple platforms (Copilot, Claude Code, Codex, Gemini). This file provides high-level guidance for AI coding assistants working in this codebase.

## Repository Purpose

**A11y Agent Team** is a collection of accessibility-focused AI agents that enforce WCAG 2.2 AA standards across web, document, and mobile development. The agents work together as specialized teams to catch accessibility issues that LLMs typically miss during code generation.

## Key Directories

| Path | Purpose |
|------|---------|
| `.github/agents/` | Copilot agent definitions (59 agents) |
| `.github/skills/` | Copilot reusable skills (18 skills) |
| `.github/prompts/` | One-click workflow prompts |
| `.github/instructions/` | Always-on instruction files |
| `.claude/agents/` | Claude Code agent definitions |
| `.codex/` | Codex CLI configuration (11 roles) |
| `.gemini/` | Gemini CLI extension |
| `docs/` | Documentation site |
| `mcp-server/` | HTTP-based MCP server (Streamable HTTP + stdio) |
| `vscode-extension/` | VS Code extension (planned) |
| `scripts/` | Build and validation scripts |
| `templates/` | Scan configuration templates |

## Agent Teams

### Web Accessibility Team
Led by `accessibility-lead`, coordinates specialists for comprehensive web audits:
- `aria-specialist` - ARIA roles, states, properties
- `keyboard-navigator` - Tab order, focus management
- `contrast-master` - Color contrast, visual accessibility
- `forms-specialist` - Form labeling, validation, errors
- `modal-specialist` - Dialog focus trapping, escape behavior
- `live-region-controller` - Dynamic content announcements
- `alt-text-headings` - Images, SVGs, heading hierarchy
- `tables-data-specialist` - Data table accessibility
- `link-checker` - Ambiguous link text detection
- `text-quality-reviewer` - Non-visual text quality review

### Document Accessibility Team
Led by `document-accessibility-wizard`, handles Office and PDF audits:
- `word-accessibility` - Microsoft Word (.docx)
- `excel-accessibility` - Microsoft Excel (.xlsx)
- `powerpoint-accessibility` - Microsoft PowerPoint (.pptx)
- `pdf-accessibility` - PDF/UA conformance
- `epub-accessibility` - ePub accessibility

### GitHub Workflow Team
Led by `github-hub` / `nexus`, manages repository operations:
- `daily-briefing` - Morning overview of issues, PRs, CI status
- `pr-review` - Code review with accessibility focus
- `issue-tracker` - Issue triage and priority scoring
- `analytics` - Repository health metrics
- `repo-admin` - Collaborator and branch protection management
- `team-manager` - Organization team membership

### Developer Tools Team
Led by `developer-hub`, handles desktop and Python development:
- `python-specialist` - Python debugging, packaging, testing
- `wxpython-specialist` - wxPython GUI development
- `nvda-addon-specialist` - NVDA screen reader addon development
- `desktop-a11y-specialist` - Desktop accessibility APIs
- `a11y-tool-builder` - Building accessibility scanning tools

## Coding Conventions

### Agent File Format

Copilot agents (`.github/agents/*.agent.md`):
```yaml
---
name: Agent Name
description: What this agent does (required)
tools: ['read', 'edit', 'search', 'runInTerminal', 'askQuestions']
model: ['Claude Sonnet 4.5 (copilot)', 'GPT-5 (copilot)']
---

Agent instructions in markdown...
```

Claude Code agents (`.claude/agents/*.md`):
```yaml
---
name: agent-name
description: What this agent does
tools:
  - Read
  - Edit
  - Grep
  - Task
---

Agent instructions in markdown...
```

### Tool Name Conventions

| Platform | Read | Edit | Search | Shell | Sub-agent |
|----------|------|------|--------|-------|-----------|
| Copilot CLI | `read` | `edit` | `search` | `runInTerminal` | `agent` |
| Claude Code | `Read` | `Edit` | `Grep`/`Glob` | `Bash` | `Task` |

### Skill File Format

Skills must have `SKILL.md` with YAML frontmatter:
```yaml
---
name: skill-name
description: What this skill provides
---

Skill content in markdown...
```

## Build & Test

No build step required - agents are markdown files.

**Validation:**
```bash
# Check agent YAML frontmatter
node scripts/validate-agents.js

# Run AgentRC readiness check
npx github:microsoft/agentrc readiness
```

**Local testing:**
```bash
# Install to local Copilot CLI
./install.sh --global --cli

# Verify agents load
copilot /agent
```

## CI/CD

| Workflow | Purpose |
|----------|---------|
| `a11y-check.yml` | Lint HTML/JSX/CSS for accessibility |
| `verify-sources.yml` | Validate URLs in documentation |
| `update-manifest.yml` | Generate installation manifest |
| `sync-docs-site.yml` | Deploy documentation |

## Contributing

1. Agent changes go in both `.github/agents/` AND `.claude/agents/`
2. Use platform-specific tool names (see conventions above)
3. Every agent needs a `description` field
4. Run validation before committing
5. Update CHANGELOG.md for user-facing changes

## Architecture Decisions

- **Parallel agent definitions**: Each platform has its own agent files because tool names and capabilities differ
- **Skills for reusable knowledge**: Common patterns (WCAG rules, scoring formulas) are in skills, not duplicated in agents
- **Wizard orchestrators**: Complex workflows use wizard agents that delegate to specialists
- **Read-only scanners**: Scanner agents never modify files - they only report findings
- **Fixer agents require confirmation**: Agents that modify code always ask before applying changes

## External Dependencies

- **axe-core**: Web accessibility rule engine
- **Playwright**: Browser automation for behavioral testing
- **markdownlint**: Markdown accessibility linting
- **veraPDF** (planned): PDF/UA validation
