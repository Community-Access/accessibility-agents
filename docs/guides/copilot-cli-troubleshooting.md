# Copilot CLI Troubleshooting Guide

This guide helps diagnose and fix common issues when using accessibility agents with GitHub Copilot CLI.

## Quick Diagnostics

Run these commands in Copilot CLI to diagnose loading issues:

```bash
# Check if agents are loaded
/agent

# Check if skills are loaded
/skills list

# Check custom instructions status
/instructions

# Enable debug mode for detailed diagnostics
/troubleshoot
```

---

## Agents Not Loading

### Symptoms

- `/agent` command shows empty list or only built-in agents (explore, task, general-purpose, code-review)
- Custom agents don't appear in agent picker
- Agent mentioned in prompt is not recognized

### Diagnosis

**Check agent file locations:**

```bash
# Repository-level agents
ls -la .github/agents/*.agent.md

# User-level agents (global)
ls -la ~/.copilot/agents/*.agent.md
```

**Check file naming:**

- Files MUST end in `.agent.md` (not `.md` alone)
- Filename can only contain: `.`, `-`, `_`, `a-z`, `A-Z`, `0-9`
- Example: `accessibility-lead.agent.md` ✓
- Example: `accessibility lead.agent.md` ✗ (space not allowed)

**Check YAML frontmatter:**

Every agent file must have valid YAML frontmatter with at least a `description`:

```yaml
---
name: My Agent
description: What this agent does and when to use it
---
```

The `description` is **required**. Without it, the agent won't load.

### Solutions

**1. Restart CLI session:**

Exit and restart `copilot` after adding new agents.

**2. Trust the workspace:**

On first launch in a directory, CLI asks if you trust the files. Choose "Yes" to enable custom agents.

**3. Verify YAML syntax:**

Common YAML errors that break agent loading:

```yaml
# BAD - unquoted special characters
description: What's this agent for?  # The apostrophe breaks YAML

# GOOD - quote strings with special characters
description: "What's this agent for?"
```

**4. Check character encoding:**

Agent files must be UTF-8 encoded. Windows users: ensure your editor saves as UTF-8, not Windows-1252.

---

## Skills Not Loading

### Symptoms

- `/skills list` shows empty or missing skills
- Agent can't access domain knowledge it should have
- "Skill not found" messages

### Diagnosis

**Check skill directory structure:**

Each skill must be a folder containing `SKILL.md`:

```
.github/skills/
├── accessibility-rules/
│   └── SKILL.md
├── web-scanning/
│   └── SKILL.md
└── cognitive-accessibility/
    └── SKILL.md
```

**Check SKILL.md format:**

```yaml
---
name: accessibility-rules
description: Cross-format document accessibility rule reference...
---

# Skill content here...
```

Both `name` and `description` are **required** in skill files.

### Solutions

**1. Reload skills:**

```bash
/skills reload
```

**2. Verify skill folder naming:**

- Folder names should be lowercase with hyphens
- Must match the `name` in SKILL.md

**3. Check skill location:**

```bash
/skills info
```

This shows where CLI is looking for skills and which ones are loaded.

---

## Tool Errors

### "Tool not found" or "Unknown tool" errors

**Cause:** Agent files may reference VS Code-specific tools that CLI doesn't support.

**Expected behavior:** CLI ignores unknown tool names. Core functionality works.

**Tool alias mapping:**

| Agent declares | CLI uses |
|----------------|----------|
| `runSubagent` | `agent` |
| `readFile`, `Read` | `read` |
| `editFiles`, `Edit`, `Write` | `edit` |
| `textSearch`, `Grep`, `Glob` | `search` |
| `runInTerminal`, `Bash`, `shell` | `execute` |
| `getDiagnostics` | (not available in CLI) |
| `askQuestions` | (not available in CLI) |

**Solution:** This is informational only. Agents still work for their core tasks.

### Permission denied errors

**Cause:** CLI needs approval for certain tools (edit, execute).

**Solution:** When prompted, choose:
- `1. Yes` - approve this use
- `2. Yes, and approve for session` - approve all uses of this tool in current session

---

## Instructions Not Applied

### Symptoms

- Accessibility guidance not present in responses
- Agent behaves differently than in VS Code
- Custom rules not being followed

### Diagnosis

```bash
/instructions
```

This shows which instruction files are being loaded.

**Expected files:**
- `.github/copilot-instructions.md`
- Any `.github/instructions/**/*.instructions.md` files

### Solutions

**1. Check file exists:**

```bash
cat .github/copilot-instructions.md
```

**2. Verify file is in git root:**

Instructions files must be in the repository root's `.github/` directory, not a subdirectory.

**3. Check file size:**

Instructions are limited to 8,000 characters. Very large files may be truncated.

---

## Performance Issues

### Slow agent responses

**Possible causes:**
- Large instruction files
- Many skills loaded
- Complex agent prompts

**Solutions:**

1. Use `/compact` to compress conversation history
2. Disable unused skills with `/skills` (toggle off)
3. Check context usage with `/context`

### High token usage

```bash
/usage
```

This shows token consumption. High usage may indicate:
- Too many files included in context
- Overly detailed agent instructions
- Skills loading unnecessary content

---

## Session Issues

### Can't resume previous session

```bash
# List available sessions
/resume

# Continue most recent local session
copilot --continue
```

### Session state corrupted

```bash
# Start fresh session
/clear

# Or exit and restart without --continue
copilot
```

---

## Debug Mode

For detailed diagnostics, enable agent debug logging in VS Code settings (these affect CLI too):

```json
{
  "github.copilot.chat.agentDebugLog.enabled": true,
  "github.copilot.chat.agentDebugLog.fileLogging.enabled": true
}
```

Then in CLI:

```bash
/troubleshoot
```

This analyzes debug logs to identify why agents/instructions aren't loading.

### Export debug session

Debug sessions can be exported as JSONL for sharing:

1. Enable file logging (setting above)
2. Run the problematic workflow
3. Find logs in `~/.copilot/logs/`
4. Share the relevant `.jsonl` file for support

---

## Platform-Specific Issues

### Windows

**PowerShell version:**
CLI requires PowerShell v6+. Check with:

```powershell
$PSVersionTable.PSVersion
```

If using Windows PowerShell 5.1, install PowerShell 7:

```powershell
winget install Microsoft.PowerShell
```

**Path issues:**
Ensure `~/.copilot/` resolves correctly. In PowerShell:

```powershell
$HOME + "\.copilot\agents"
# Should show: C:\Users\YourName\.copilot\agents
```

### macOS/Linux

**Permissions:**
Agent files should be readable:

```bash
chmod 644 ~/.copilot/agents/*.agent.md
chmod 755 ~/.copilot/skills/*/
chmod 644 ~/.copilot/skills/*/SKILL.md
```

---

## Getting Help

If issues persist:

1. Run `/feedback` in CLI to submit a bug report
2. Check [GitHub Copilot CLI documentation](https://docs.github.com/copilot/concepts/agents/about-copilot-cli)
3. Open an issue in the [accessibility-agents repo](https://github.com/Community-Access/accessibility-agents/issues)

When reporting issues, include:
- CLI version (`copilot --version`)
- OS and version
- Output of `/agent` and `/skills list`
- Relevant error messages
