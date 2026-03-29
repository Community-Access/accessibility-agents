# Deployment Layout and File Placement

This document explains exactly where Accessibility Agents files are placed on your system for each supported tool. Use it to understand what the installer does, verify your installation, or troubleshoot issues.

## Quick Reference: All Tools at a Glance

The following table summarizes every file type and its destination path for each tool. "Project" installs go inside your repository. "Global" installs go in your home directory and apply to every project. Not every tool supports every file type -- empty cells mean that tool does not use that resource type.

### Project Install Locations

| Resource | Claude Code CLI | VS Code Copilot | Copilot CLI | Codex CLI | Gemini CLI | GitHub Coding Agent |
|---|---|---|---|---|---|---|
| Agent definitions | `.claude/agents/` | `.github/agents/` | `.github/agents/` or `~/.copilot/agents/` | -- | -- | `.github/agents/` |
| Skills | `.claude/skills/` | `.github/skills/` | `.github/skills/` or `~/.copilot/skills/` | -- | `.gemini/extensions/a11y-agents/skills/` | `.github/skills/` |
| Instructions | `.claude/rules/` | `.github/instructions/` | `.github/instructions/` or `~/.copilot/instructions/` | -- | -- | `.github/instructions/` |
| Prompt files | -- | `.github/prompts/` | `.github/prompts/` or `~/.copilot/prompts/` | -- | -- | `.github/prompts/` |
| Context file | `.claude/CLAUDE.md` | `.github/copilot-instructions.md` | `.github/copilot-instructions.md` | `.codex/AGENTS.md` | `.gemini/GEMINI.md` | `.github/copilot-instructions.md` |
| Team workflows | `.claude/AGENTS.md` | -- | -- | -- | -- | -- |
| Configuration | `.claude/settings.json` | -- | -- | `.codex/config.toml` | `.gemini/settings.json` | -- |
| Roles | -- | -- | -- | `.codex/roles/*.toml` | -- | -- |
| Hooks | `.claude/hooks/` | -- | -- | -- | `.gemini/extensions/a11y-agents/hooks/` | -- |
| Extension manifest | -- | -- | -- | -- | `.gemini/extensions/a11y-agents/gemini-extension.json` | -- |

### Global Install Locations

| Resource | Claude Code CLI | VS Code Copilot | Copilot CLI | Codex CLI | Gemini CLI |
|---|---|---|---|---|---|
| Agent definitions | `~/.claude/agents/` | VS Code User profile | `~/.copilot/agents/` | -- | -- |
| Skills | `~/.claude/skills/` | VS Code User profile | `~/.copilot/skills/` | -- | `~/.gemini/extensions/a11y-agents/skills/` |
| Instructions | `~/.claude/rules/` | VS Code User profile | `~/.copilot/instructions/` | -- | -- |
| Prompt files | -- | VS Code User profile | `~/.copilot/prompts/` | -- | -- |
| Context file | `~/.claude/CLAUDE.md` | VS Code User profile settings | -- | `~/.codex/AGENTS.md` | `~/.gemini/GEMINI.md` |
| Team workflows | `~/.claude/AGENTS.md` | -- | -- | -- | -- |
| Configuration | `~/.claude/settings.json` | -- | -- | `~/.codex/config.toml` | `~/.gemini/settings.json` |
| Roles | -- | -- | -- | `~/.codex/roles/*.toml` | -- |
| Hooks | `~/.claude/hooks/` | -- | -- | -- | `~/.gemini/extensions/a11y-agents/hooks/` |

In the table above, `~` represents your home directory: `$HOME` on macOS and Linux, or `%USERPROFILE%` on Windows. "VS Code User profile" refers to the VS Code settings directory, which varies by platform and VS Code edition (Stable, Insiders, or VSCodium).

---

## Tool-by-Tool Narrative

The sections below describe each tool in detail. This narrative format provides full context for screen reader users and anyone who prefers a descriptive explanation over a table.

### Claude Code CLI

Claude Code is the terminal-based Claude agent. It reads configuration from the `.claude/` directory at the project root, or from `~/.claude/` for global settings. Every project you open in Claude Code merges its local `.claude/` configuration with the global `~/.claude/` configuration.

The installer places the following files for Claude Code:

- **Agent definitions** go into `.claude/agents/`. Each agent is a markdown file (for example, `accessibility-lead.md`, `aria-specialist.md`). Claude Code reads these files and makes them available as invokable agents through the `/` picker in the chat interface or via the `--agent` flag on the command line.

- **Skills** go into `.claude/skills/`. Each skill is a folder containing a `SKILL.md` file with domain-specific knowledge (for example, `web-scanning/SKILL.md`). Agents reference skills to get specialized knowledge about topics such as document scanning rules, severity scoring formulas, or framework-specific accessibility patterns.

- **Instructions** go into `.claude/rules/`. These are markdown files that Claude Code loads into context for every conversation. They enforce baseline rules (for example, always use semantic HTML, never skip heading levels) without requiring you to invoke any agent.

- **Context file**: `CLAUDE.md` is placed at the repository root. Claude Code reads this file automatically at the start of every conversation. It contains the project-wide context: which agents are available, the decision matrix for choosing specialists, non-negotiable accessibility standards, and links to relevant documentation.

- **Team workflows**: `AGENTS.md` is placed in the `.claude/` directory. This file defines multi-agent team configurations -- which agents work together on specific workflows such as "Document Accessibility Audit" or "Web Accessibility Audit". Claude Code reads this file to understand how to orchestrate parallel agent invocations.

- **Hooks** go into `.claude/hooks/`. These are enforcement scripts that run automatically on specific events. The three hooks are: a `UserPromptSubmit` hook that detects web projects and adds accessibility instructions, a `PreToolUse` hook that blocks UI file edits until accessibility-lead has reviewed, and a `PostToolUse` hook that creates a session marker when accessibility-lead completes.

- **Configuration**: `.claude/settings.json` contains tool permissions and allowed MCP server settings. The installer merges its configuration section into this file without overwriting your existing settings. The installer uses a marked section (`<!-- a11y-agent-team: start -->` and `<!-- a11y-agent-team: end -->`) to identify its content during updates and uninstallation.

### VS Code Copilot (Editor Extension)

GitHub Copilot in VS Code reads its customization files from the `.github/` directory at the repository root. For global (user-level) configuration, files go into the VS Code User profile directory.

The installer places the following files for VS Code Copilot:

- **Agent definitions** go into `.github/agents/`. Each agent is a markdown file with the `.agent.md` extension (for example, `accessibility-lead.agent.md`). VS Code displays these agents in the chat agent picker, where you can select them from the `@` mentions dropdown or browse them from the Copilot Chat interface.

- **Skills** go into `.github/skills/`. Each skill follows the same folder-with-SKILL.md pattern. VS Code loads skill content when an agent references it, providing domain-specific knowledge on demand.

- **Instructions** go into `.github/instructions/`. These are always-on instruction files with `applyTo` patterns in their YAML frontmatter. For example, `web-accessibility-baseline.instructions.md` fires on every `.html`, `.jsx`, `.tsx`, `.vue`, `.svelte`, or `.astro` file edit. Unlike agents, instructions do not need to be invoked -- they apply automatically when matching files are edited.

- **Prompt files** go into `.github/prompts/`. These are one-click workflow templates (for example, `audit-web-page.prompt.md`) that appear in the prompt picker. Select one to launch a pre-configured audit workflow.

- **Context file**: `.github/copilot-instructions.md` is the Copilot equivalent of Claude Code's `CLAUDE.md`. It provides project-wide context that Copilot loads into every conversation.

- **Additional Copilot config files**: The installer also places `copilot-review-instructions.md` (loaded during code review) and `copilot-commit-message-instructions.md` (loaded when generating commit messages) in `.github/`.

- **VS Code settings**: The installer modifies your VS Code `settings.json` to configure agent discovery. See the [VS Code Settings Changes](#vs-code-settings-changes) section at the end of this document for the full list of settings, their values, the rationale for each, and instructions for reverting.

For global installs, the VS Code profile directory varies by platform:

- **Windows**: `%APPDATA%\Code\User\` (Stable) or `%APPDATA%\Code - Insiders\User\` (Insiders)
- **macOS**: `~/Library/Application Support/Code/User/` or `~/Library/Application Support/Code - Insiders/User/`
- **Linux**: `~/.config/Code/User/` or `~/.config/Code - Insiders/User/`

### Copilot CLI (Terminal-Based Copilot)

GitHub Copilot CLI (`copilot-cli`, previously `github-copilot-cli`) is the terminal version of Copilot. For project-level installs, it shares the same `.github/` files as VS Code Copilot. For global installs, it reads from `~/.copilot/`.

The installer places the following files for Copilot CLI global installs:

- **Agent definitions** go into `~/.copilot/agents/`. These are the same `.agent.md` files used by VS Code, using camelCase tool names.
- **Skills** go into `~/.copilot/skills/`.
- **Instructions** go into `~/.copilot/instructions/`.
- **Prompt files** go into `~/.copilot/prompts/`.

For project installs, Copilot CLI reads the same `.github/` files that VS Code Copilot uses. No separate files are needed.

### Codex CLI

OpenAI Codex CLI reads its configuration from the `.codex/` directory at the project root, or from `~/.codex/` for global settings.

The installer places the following files for Codex CLI:

- **Context file**: `.codex/AGENTS.md` is the primary context document. Codex CLI reads this file and uses its contents to understand the project's accessibility requirements and available agent workflows.

- **Configuration**: `.codex/config.toml` is a TOML-format configuration file. The installer writes a section between `# a11y-agent-team: start` and `# a11y-agent-team: end` markers. This section defines the experimental role pointer that tells Codex to load the accessibility expert role.

- **Roles**: `.codex/roles/*.toml` are role definition files. Each role (for example, `a11y-lead.toml`) defines a specialized persona with instructions and tool permissions. The installer copies role files from the repository's `.codex/roles/` directory.

Note that Codex CLI uses TOML-format markers (`# a11y-agent-team: start/end`) rather than the HTML-style markers (`<!-- a11y-agent-team: start/end -->`) used by other tools. The uninstaller handles both marker formats automatically.

### Gemini CLI

Google Gemini CLI uses an extension-based architecture. Extensions live in the `.gemini/extensions/` directory at the project root, or in `~/.gemini/extensions/` for global installs.

The installer places all Gemini files inside a single extension directory: `.gemini/extensions/a11y-agents/`. This directory contains:

- **Extension manifest**: `gemini-extension.json` declares the extension's name, description, and capabilities. Gemini CLI reads this file to discover the extension.

- **Context file**: `GEMINI.md` provides always-on accessibility context within the extension. It contains the same decision matrix, standards, and workflow guidance as the other tools' context files, adapted for Gemini's extension format.

- **Skills**: The `skills/` subdirectory contains skill folders. Gemini loads these as extension-provided skills that activate when relevant prompts are detected.

- **Hooks**: The `hooks/` subdirectory contains enforcement scripts similar to Claude Code's hooks.

Gemini also supports a hierarchical context system. A `GEMINI.md` file at any directory level provides context to conversations operating in that directory tree. The installer places the extension's `GEMINI.md` inside the extension directory, not at the project root, to avoid conflicts with any project-level `GEMINI.md` the user may have.

### GitHub Coding Agent (Copilot Coding Agent)

The GitHub Coding Agent runs in GitHub's cloud infrastructure on pull requests and issues. It reads the same `.github/` files as VS Code Copilot and Copilot CLI. No special file placement is needed -- if you have a project-level install with `.github/agents/`, `.github/skills/`, `.github/instructions/`, and `.github/prompts/`, the Coding Agent picks them up automatically when it processes your repository.

---

## Why Some Files Are Duplicated

You may notice that agent definitions exist in both `.github/agents/` and `.claude/agents/`. This is not redundant -- each tool requires its own file format:

- **Claude Code agents** use PascalCase tool names (`Read`, `Edit`, `Grep`, `Bash`, `Task`) defined by Anthropic's tool specification.
- **Copilot agents** use camelCase tool names (`read`, `edit`, `search`, `runInTerminal`, `agent`) as defined by GitHub's specification.

An agent file that references `Read` will not work in Copilot (which expects `read`), and a file that references `runInTerminal` will not work in Claude Code (which expects `Bash`). The tools are semantically equivalent but syntactically different on each platform.

To prevent VS Code from showing both sets of agents in the picker (which would double every agent), the installer configures `chat.agentFilesLocations` in VS Code's `settings.json` to exclude `.claude/agents/`. This ensures only the Copilot-format agents appear.

---

## Shared Configuration Files

Several configuration files use a marked-section approach to allow the installer to add, update, and remove its content without disturbing your own customizations. The installer wraps its content between start and end markers:

- **HTML/Markdown files** (CLAUDE.md, AGENTS.md, copilot-instructions.md, settings.json): Uses `<!-- a11y-agent-team: start -->` and `<!-- a11y-agent-team: end -->` markers.
- **TOML files** (config.toml): Uses `# a11y-agent-team: start` and `# a11y-agent-team: end` markers.

If you add your own content to these files outside the marked section, the updater preserves it during upgrades and the uninstaller leaves it intact during removal. Only content between the markers is managed by the installer.

Legacy installations may use older marker names (`<!-- accessibility-agents: start/end -->` or `# accessibility-agents: start/end`). The updater and uninstaller recognize both the current and legacy markers.

---

## Manifest File

The installer creates a manifest file at `.claude/.a11y-agent-manifest` (project) or `~/.claude/.a11y-agent-manifest` (global). This plain-text file lists every resource that was installed, one entry per line. The updater and uninstaller use it to know exactly which files to update or remove.

Example manifest entries:

```
agents/accessibility-lead.md
agents/aria-specialist.md
skills/web-scanning
copilot-agents/accessibility-lead.agent.md
copilot-skills/web-scanning/SKILL.md
copilot-instructions/web-accessibility-baseline.instructions.md
copilot-prompts/audit-web-page.prompt.md
copilot-config/copilot-instructions.md
AGENTS.md
codex/project
codex/config.toml
codex/roles/a11y-lead.toml
gemini/project
gemini/path:.gemini/extensions/a11y-agents
```

Each line uses a prefix to indicate the resource type and tool:

- `agents/` -- Claude Code agent files
- `skills/` -- Claude Code skill directories
- `copilot-agents/` -- VS Code and Copilot CLI agent files
- `copilot-skills/` -- VS Code and Copilot CLI skill files
- `copilot-instructions/` -- VS Code and Copilot CLI instruction files
- `copilot-prompts/` -- VS Code and Copilot CLI prompt files
- `copilot-config/` -- Copilot configuration files
- `codex/` -- Codex CLI files (with sub-paths for config.toml and roles)
- `gemini/` -- Gemini CLI extension (with `path:` prefix for the install location)
- `AGENTS.md` -- Claude team workflow config

---

## Verifying Your Installation

After running the installer, you can verify that files are in the correct locations.

For a project-level install, check for these directories and files:

```
your-project/
  .claude/
    agents/         (80+ .md files)
    skills/         (25+ directories, each with SKILL.md)
    rules/          (instruction files)
    hooks/          (enforcement scripts)
    settings.json   (tool permissions)
    CLAUDE.md       (context file -- also exists at project root)
    AGENTS.md       (team workflows)
    .a11y-agent-manifest  (install manifest)
  .github/
    agents/         (80+ .agent.md files)
    skills/         (25+ directories, each with SKILL.md)
    instructions/   (always-on instruction files)
    prompts/        (one-click workflow templates)
    copilot-instructions.md
  .codex/
    AGENTS.md       (context file)
    config.toml     (role config, if Codex was included)
    roles/          (role definitions, if Codex was included)
  .gemini/
    extensions/
      a11y-agents/  (extension directory, if Gemini was included)
  CLAUDE.md         (project-root context file)
```

For a global install, check your home directory for `~/.claude/`, `~/.codex/`, and `~/.gemini/` with similar contents.

---

## Update Behavior

The updater scripts (`update.ps1` and `update.sh`) handle each tool:

- **Claude Code**: Syncs agents, skills, rules, and hooks by comparing file contents. Only changed files are overwritten. The `CLAUDE.md` and `AGENTS.md` files are merged using the marked-section approach to preserve your customizations.
- **VS Code Copilot**: Syncs agents, skills, instructions, and prompts to both `.github/` and any detected VS Code profiles.
- **Codex CLI**: Merges `AGENTS.md` and `config.toml` using marked sections. Syncs role files by content comparison.
- **Gemini CLI**: Reads the install path from the manifest, then syncs the extension manifest, context file, skills, and hooks by content comparison.

---

## Uninstall Behavior

The uninstaller scripts (`uninstall.ps1` and `uninstall.sh`) use the manifest file to identify installed resources. For each tool:

- **Claude Code**: Removes agent files, skill directories, rules, and hooks listed in the manifest. Cleans marked sections from `CLAUDE.md`, `AGENTS.md`, and `settings.json`, preserving any user content outside the markers.
- **VS Code Copilot**: Removes agents, skills, instructions, and prompts from `.github/` and from detected VS Code profiles. Cleans marked sections from `copilot-instructions.md`.
- **Codex CLI**: Cleans marked sections from `AGENTS.md` (using HTML markers) and `config.toml` (using TOML markers). Removes role files listed in the manifest. Cleans up empty directories.
- **Gemini CLI**: Removes the entire extension directory. If the parent `.gemini/extensions/` directory is empty after removal, it is also cleaned up.

If no manifest file is found (for example, after a manual install or if the manifest was deleted), the uninstaller downloads the repository to build a fallback list of expected files.

---

## VS Code Settings Changes

The installer and updater modify VS Code's `settings.json` file. This section documents every setting that is added or changed, explains the rationale, and describes how to revert each one.

### chat.agentFilesLocations

The installer adds this setting to control which directories VS Code scans for Copilot agent definitions.

**Value set by the installer:**

```json
{
  "chat.agentFilesLocations": {
    ".github/agents": true,
    ".claude/agents": false
  }
}
```

**What it does:**

- `.github/agents: true` -- tells VS Code to discover agent files from `.github/agents/`. This is where the Copilot-format agents live (using camelCase tool names like `read`, `edit`, `search`).
- `.claude/agents: false` -- tells VS Code to ignore `.claude/agents/`. This directory contains Claude Code-format agents (using PascalCase tool names like `Read`, `Edit`, `Grep`). These agents are not functional in VS Code because the tool names do not match.

**Why it is necessary:**

VS Code scans the workspace for any directory containing `.agent.md` files. Because Accessibility Agents ships parallel agent definitions for both Copilot and Claude Code, VS Code would otherwise discover 80+ agents from `.github/agents/` and another 80+ from `.claude/agents/`. Every agent would appear twice in the Copilot Chat picker. Selecting the Claude-format duplicate would silently fail because VS Code does not recognize PascalCase tool names.

This setting eliminates the confusion by telling VS Code which directory to use and which to skip.

**When it is applied:**

- During initial installation (both project and global installs)
- During every updater run, as a repair step for installations that predate version 4.6.0 when this fix was introduced

**Where the file is modified:**

For global installs, the setting is written to each detected VS Code profile's `settings.json`:

- Windows Stable: `%APPDATA%\Code\User\settings.json`
- Windows Insiders: `%APPDATA%\Code - Insiders\User\settings.json`
- macOS Stable: `~/Library/Application Support/Code/User/settings.json`
- macOS Insiders: `~/Library/Application Support/Code - Insiders/User/settings.json`
- Linux Stable: `~/.config/Code/User/settings.json`
- Linux Insiders: `~/.config/Code - Insiders/User/settings.json`

For project installs, the setting is written to `.vscode/settings.json` inside the project.

The installer only adds or updates this specific key. All other settings in `settings.json` are preserved.

**How to verify:**

1. Open the VS Code Command Palette and run `Preferences: Open User Settings (JSON)`.
2. Search for `chat.agentFilesLocations`.
3. Confirm that `.claude/agents` is set to `false`.

Alternatively, open the Copilot Chat agent picker (type `@` in the chat input). Each agent should appear exactly once. If agents are duplicated, the setting is missing.

**How to revert:**

To restore the default behavior (VS Code discovers agents from all directories), remove or edit the setting:

```json
{
  "chat.agentFilesLocations": {
    ".github/agents": true
  }
}
```

Note that reverting this setting means Claude-format agents will appear in the VS Code picker alongside the Copilot-format agents. Only the Copilot-format agents (from `.github/agents/`) function correctly in VS Code.

**The uninstaller removes this setting** during uninstallation, restoring VS Code to its default discovery behavior.

### Settings not modified

The installer does **not** modify any other VS Code settings. Specifically, it does not change:

- `github.copilot.chat.agentDebugLog.enabled` (agent debug logging -- documented in the [Configuration guide](configuration.md#agent-debug-settings-vs-code-1112) as optional)
- `chat.autopilot.enabled` (autonomous operation -- documented in [Configuration guide](configuration.md#permission-levels-vs-code-1112) as optional)
- `chat.useCustomizationsInParentRepositories` (monorepo support -- documented in [Configuration guide](configuration.md#monorepo-configuration-vs-code-1112) as optional)
- `chat.imageSupport.enabled` (image analysis -- documented in [Configuration guide](configuration.md#image-analysis-settings-vs-code-1112) as optional)

Those settings are recommended but not required. They are documented in the [Configuration guide](configuration.md) for users who want to opt in.
