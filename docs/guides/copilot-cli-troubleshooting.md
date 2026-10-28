# Copilot CLI Troubleshooting Guide

This guide helps diagnose and fix common issues when using accessibility agents with GitHub Copilot CLI.

## Quick Diagnostics

Run these commands in Copilot CLI to diagnose loading issues:

```bash
# Check if skills are loaded
/skills list

# Enable debug mode for detailed diagnostics
/troubleshoot
```

---

## Agents Not Loading

Accessibility Agents 7.x ships no custom agent files (`.agent.md`). Every
accessibility agent is an Agent Skill, so `/agent` listing only the built-in
agents is expected. Look for the skills instead, as below.

---

## Skills Not Loading

### Symptoms

- `/skills list` shows empty or missing skills
- Agent can't access domain knowledge it should have
- "Skill not found" messages

### Diagnosis

**Check where the skills are installed:**

The Copilot CLI reads project skills from `.github/skills`, `.claude/skills` or
`.agents/skills` in the repository, and personal skills from
`~/.copilot/skills` or `~/.agents/skills`. `npm run setup` copies this
package's skills to `~/.agents/skills`; the plugin install
(`copilot plugin install accessibility-agents@community-access`, after
`copilot plugin marketplace add Community-Access/accessibility-agents`) loads
them from the plugin. A root `skills/` folder in a repository is not read.

Each skill is a folder containing `SKILL.md`:

```text
~/.agents/skills/
  accessibility-lead/
    SKILL.md
  kb-web-scanning/
    SKILL.md
```

**Check SKILL.md format:**

```yaml
---
name: accessibility-lead
description: Picks specialists for a web change and merges their findings.
---

# Skill content here...
```

Both `name` and `description` are **required**, and `name` must match the
folder name.

**Only six appear in the model's list:** that is by design. Six routers are
model-invocable; the rest set `disable-model-invocation: true`, and a router
dispatches them.

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

### Permission denied errors

**Cause:** CLI needs approval for certain tools (edit, execute).

**Solution:** When prompted, choose:

- `1. Yes` - approve this use
- `2. Yes, and approve for session` - approve all uses of this tool in current session

---

## Instructions Not Applied

### Symptoms

- Accessibility guidance not present in responses
- The edit gate never refuses a UI edit

### Diagnosis and solutions

This package's always-on contract is `AGENTS.md`; it no longer ships
`.github/copilot-instructions.md` or `*.instructions.md` files.

1. Check that `AGENTS.md` is present at the repository root you are working
   in, or that the plugin is installed.
2. Check the hooks: the plugin wires them through
   `com.github.copilot/hooks/hooks.json`; without the plugin, copy
   `hooks/copilot.hooks.json` to `.github/hooks/` in the repository.

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
$HOME + "\.agents\skills"
# Should show: C:\Users\YourName\.agents\skills
```

### macOS

**Permissions:**
Agent files should be readable:

```bash
chmod 755 ~/.agents/skills/*/
chmod 644 ~/.agents/skills/*/SKILL.md
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
- Output of `/skills list`
- Relevant error messages
