# Lifecycle Hooks Guide

## Authoritative References

This guide is maintained against official platform documentation and release notes.

- [VS Code updates and release notes](https://code.visualstudio.com/updates)
- [VS Code Copilot customization docs](https://code.visualstudio.com/docs/copilot/customization/overview)
- [GitHub Copilot docs](https://docs.github.com/copilot)
- [Gemini CLI hooks reference](https://github.com/google-gemini/gemini-cli/blob/main/docs/hooks/reference.md)
- [Gemini CLI extensions reference](https://github.com/google-gemini/gemini-cli/blob/main/docs/extensions/reference.md)

## Overview

Accessibility Agents v3.0 includes cross-platform lifecycle hooks that automate accessibility enforcement during agent sessions. Hooks run at key moments (session start, tool execution, session end) to ensure WCAG AA compliance is never skipped.

## What Hooks Do

1. Session Start: Detect project type and inject context.
2. Web Project Detection: Recognize web UI work and suggest accessibility review.
3. Edit Gate Enforcement: Block UI file edits until `accessibility-lead` reviews.
4. Review Marker: Unlock edits after accessibility review completes.
5. Session End: Clean up markers for next session.

## Supported Platforms

The following table lists each supported platform, whether hooks are active, and where the hook configuration file is located.

| Platform | Hook Support | Configuration Location |
|----------|--------------|------------------------|
| GitHub Copilot (VS Code 1.110+) | Yes (Preview) | `.github/hooks/hooks-consolidated.json` |
| Claude Code | Yes (Full Support) | `.claude/hooks/hooks-consolidated.json` |
| Gemini CLI | Yes | `.gemini/extensions/a11y-agents/hooks/hooks.json` |
| Codex CLI | Not yet | TBD |

## Installation

Hooks are installed automatically when you run `install.sh` or `install.ps1` with project installation.

macOS/Linux:

```bash
bash install.sh --project
```

Windows (PowerShell):

```powershell
.\install.ps1 -Project
```

This creates:

- `.github/hooks/scripts/` (Python hook scripts)
- `.github/hooks/hooks-consolidated.json` (VS Code hook configuration)
- `.claude/hooks/hooks-consolidated.json` (Claude Code hook configuration)
- `.gemini/extensions/a11y-agents/hooks/hooks.json` (Gemini CLI hook configuration)
- `.gemini/extensions/a11y-agents/hooks/*.py` (Gemini-specific Python hook scripts)

## Hook Flow

### Session Start Hook

When: agent session begins.
Action: detect platform and inject startup context.

### Web Project Detection Hook

When: user submits a prompt.
Action: detect UI-related task/project and inject accessibility reminder.

### Edit Gate Enforcement Hook

When: agent attempts to edit files.
Action: block UI file edits if `.github/.a11y-reviewed` marker is missing.

### Review Marker Hook

When: tool execution completes.
Action: create `.github/.a11y-reviewed` only after explicit `accessibility-lead` completion.

### Session End Hook

When: session ends.
Action: remove `.github/.a11y-reviewed` marker.

## Configuration

VS Code (`.github/hooks/hooks-consolidated.json`) uses hook events such as `SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, and `Stop`.

Claude Code (`.claude/hooks/hooks-consolidated.json`) uses the same script set with `SessionEnd` compatibility and matcher support.

Gemini CLI (`.gemini/extensions/a11y-agents/hooks/hooks.json`) uses Gemini-native event names and a nested hook definition structure:

| Gemini Event | Purpose | Equivalent (Claude/VS Code) |
|---|---|---|
| `SessionStart` | Announce loaded skills | `SessionStart` |
| `BeforeAgent` | Detect web project, inject context | `UserPromptSubmit` |
| `BeforeTool` | Block `write_file`/`replace` on UI files | `PreToolUse` |
| `AfterTool` | Set review marker on `activate_skill` | `PostToolUse` |
| `SessionEnd` | Remove review marker | `SessionEnd` / `Stop` |

Gemini hooks use `${extensionPath}` to reference scripts within the installed extension directory, and timeouts are specified in milliseconds. Tool matchers (`BeforeTool`, `AfterTool`) accept regular expressions; lifecycle event matchers accept exact strings.

To verify Gemini hooks are active, run `/hooks panel` inside a Gemini CLI session.

## Troubleshooting

For common issues and fixes, see:

- `docs/guides/hooks-troubleshooting.md`
- `docs/guides/agent-debug-panel.md`

## Related Docs

- `docs/HOOKS-CROSS-PLATFORM-STRATEGY.md`
- `docs/guides/agent-debug-panel.md`
- `docs/guides/hooks-guide.md` (compatibility redirect)
