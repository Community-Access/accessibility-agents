# Agent Debug Panel Guide

> **Updated for VS Code 1.112:** The Agent Debug panel now includes the `/troubleshoot` skill, JSONL export/import, and Agent Flow Chart visualization. This guide covers the original features from 1.110 plus all new capabilities.

## Authoritative References

This guide tracks behavior documented in official VS Code/Copilot sources.

References:

- VS Code release notes: `https://code.visualstudio.com/updates`
- VS Code 1.112 Release Notes: `https://code.visualstudio.com/updates/v1_112`
- VS Code Copilot customization docs: `https://code.visualstudio.com/docs/copilot/customization/overview`
- Agent Debug Logs docs: `https://code.visualstudio.com/docs/copilot/chat/chat-debug-view`
- GitHub Copilot docs: `https://docs.github.com/copilot`

## What is the Agent Debug Panel?

The Agent Debug panel gives you deeper insight into how Accessibility Agents work within VS Code. It replaces the old Diagnostics action with a richer, more detailed view that helps you understand and troubleshoot your agent configuration.

## Features

### Real-Time Event Tracking

The panel shows chat events as they happen:

- **Chat customization events** - When skills, prompts, hooks, agents are loaded
- **System prompts** - The actual prompts sent to the model
- **Tool calls** - Which tools agents invoke and their results
- **Hook execution** - When `PreToolUse`, `PostToolUse`, and other hooks fire
- **Session lifecycle** - Session creation, context compaction, forking

### Customization Visibility

See exactly which Accessibility Agents customizations are active:

- ✅ Loaded agents (accessibility-lead, aria-specialist, forms-specialist, etc.)
- ✅ Active skills (markdown-accessibility, cognitive-accessibility, web-severity-scoring, etc.)
- ✅ Applied workspace instructions (web-accessibility-baseline, semantic-html, aria-patterns)
- ✅ Hook execution order and timing
- ✅ Prompt files invoked

### Chart View

Visual hierarchy showing:

- Event sequence and timing
- Tool call dependencies
- Hook trigger chain
- Context compaction points

## How to Open the Agent Debug Panel

**Method 1: Command Palette**

1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type "Developer: Open Agent Debug Panel"
3. Press Enter

**Method 2: Chat View**

1. Click the gear icon at the top of the Chat view
2. Select "View Agent Logs"

## Using the Debug Panel with Accessibility Agents

### Verify Your Agents Are Loaded

When you start a chat session in a web project:

1. Open the Agent Debug panel
2. Look for `UserPromptSubmit` hook event - this should show the accessibility-lead delegation instruction firing
3. Check for loaded agents - you should see accessibility-lead and specialist agents like aria-specialist, forms-specialist, keyboard-navigator
4. Verify workspace instructions are loaded - web-accessibility-baseline.instructions.md, semantic-html.instructions.md, aria-patterns.instructions.md

**What to look for:**

```text
✅ Hook: UserPromptSubmit
   → Action: Inject accessibility-lead delegation
   → Status: Executed

✅ Agents loaded: 25
   - accessibility-lead
   - aria-specialist
   - forms-specialist
   - keyboard-navigator
   - modal-specialist
   - contrast-master
   ... (more)

✅ Instructions loaded: 3
   - web-accessibility-baseline.instructions.md
   - semantic-html.instructions.md
   - aria-patterns.instructions.md

✅ Skills loaded: 17
   - framework-accessibility
   - cognitive-accessibility
   - markdown-accessibility
   - web-severity-scoring
   ... (more)
```

### Debug the Edit Gate

If you're unable to edit UI files, the debug panel shows why:

1. Look for `PreToolUse` hook events
2. Check if `permissionDecision: "deny"` appears for Edit/Write operations on `.jsx`, `.tsx`, `.vue`, `.css`, `.html` files
3. Verify if the session marker exists (set by `PostToolUse` after accessibility-lead completes)

**Troubleshooting edit gate issues:**

```text
⚠️  Hook: PreToolUse
   → Tool: editFile
   → File: src/components/Button.tsx
   → Decision: deny
   → Reason: accessibility-lead review not completed

✅ Next step: Invoke @accessibility-lead to unlock edit gate
```

### Monitor Hook Execution

The three-hook enforcement flow should appear as:

**Hook 1: UserPromptSubmit** (Proactive detection)

```yaml
Event: UserPromptSubmit
Trigger: User sent message "fix the styling"
Action: Inject accessibility delegation instruction
Framework detected: React (package.json, *.jsx files)
Result: Delegation instruction added to prompt
```

**Hook 2: PreToolUse** (Edit gate)

```yaml
Event: PreToolUse
Tool: editFile
Target: src/App.jsx
Session marker present: false
Decision: deny
Message: Please consult @accessibility-lead before editing UI files
```

**Hook 3: PostToolUse** (Session marker)

```yaml
Event: PostToolUse
Agent: accessibility-lead
Action: Create session marker
Result: Edit gate unlocked for remainder of session
```

### Track Tool Calls

When accessibility-lead runs, you'll see tool invocations:

- `readFile` - Reading component files for review
- `grepSearch` - Searching for ARIA patterns, keyboard handlers
- `semanticSearch` - Finding related accessibility code
- `askQuestions` - Interactive clarification from you
- `screenshotPage` - Visual verification (if browser tools enabled)
- `evaluatePage` - Running axe-core audits

### Context Compaction Visibility

During long audits, watch for:

```yaml
Event: ContextCompaction
Trigger: Manual (/compact) or Automatic (context limit)
Before: 45,000 tokens
After: 12,000 tokens
Summary: Audit findings preserved, implementation details compacted
```

## Troubleshooting Common Issues

### Issue: Agents Not Loading

**Symptoms in Debug Panel:**

```text
⚠️  Agents loaded: 0
⚠️  Instructions loaded: 0
```

**Solutions:**

1. Verify `.github/agents/*.agent.md` files exist
2. Check `.github/copilot-instructions.md` exists
3. Reload VS Code window
4. Check extension status: GitHub Copilot and GitHub Copilot Chat should be enabled

### Issue: Hook Not Firing

**Symptoms in Debug Panel:**

```text
✅ Hook: UserPromptSubmit registered
⚠️  No execution events
```

**Solutions:**

1. Verify hooks are enabled in settings (check for disabled hooks)
2. Check workspace trust - hooks may be disabled in untrusted workspaces
3. Update to latest VS Code and Copilot extensions

### Issue: Edit Gate Blocking Legitimate Edits

**Symptoms in Debug Panel:**

```yaml
Event: PreToolUse
Decision: deny
File: src/utils/api.ts  (backend logic, not UI)
```

**Solution:**
The edit gate uses file extension patterns. If it's blocking non-UI files incorrectly, this is a false positive. Report it as an issue so we can refine the pattern matching.

### Issue: Skills Not Loading

**Symptoms in Debug Panel:**

```text
✅ Skills directory exists: .github/skills/
⚠️  Skills loaded: 0
```

**Solutions:**

1. Verify `.github/skills/**/SKILL.md` files have valid YAML frontmatter
2. Check `name:` and `description:` fields are present
3. Ensure no syntax errors in SKILL.md files
4. Reload window after adding new skills

## Chart View Interpretation

The chart view shows event hierarchy. For a typical Accessibility Agents session:

```text
Session Start
 ├─ UserPromptSubmit Hook
 │   └─ Inject delegation instruction
 ├─ Load Customizations
 │   ├─ 25 agents
 │   ├─ 24 skills
 │   └─ 3 workspace instructions
 ├─ Agent: accessibility-lead invoked
 │   ├─ Tool: readFile (component)
 │   ├─ Tool: grepSearch (aria patterns)
 │   ├─ Tool: askQuestions (clarification)
 │   └─ Response generated
 ├─ PostToolUse Hook
 │   └─ Create session marker
 └─ PreToolUse Hook (next edit)
     └─ Decision: allow (marker present)
```

## Performance Analysis

Use the debug panel to measure:

- **Hook execution time** - Should be < 100ms
- **Agent initialization** - How long it takes to load all 25+ agents
- **Tool call latency** - Time for readFile, grepSearch, etc.
- **Context compaction time** - How long summarization takes

**Performance tips:**

- Long hook execution (> 500ms) may indicate file I/O issues
- Slow agent loading suggests too many agents or large agent files
- High tool call latency points to slow file reads or searches

## Feedback

The Agent Debug panel is in **preview** as of VS Code 1.110. Share feedback:

- [VS Code GitHub Issues](https://github.com/microsoft/vscode/issues)
- [Accessibility Agents Discussions](https://github.com/Community-Access/accessibility-agents/discussions)

## Limitations (Current Release)

- **Local sessions only** - Background and Claude agent sessions not yet supported
- ~~**No log persistence** - Logs clear when VS Code restarts~~ (Fixed in 1.112 with export/import)
- ~~**No export** - Cannot save logs for sharing or offline analysis~~ (Fixed in 1.112)

## New in VS Code 1.112

### The `/troubleshoot` Skill

Type `/troubleshoot` in chat followed by a question to analyze agent debug logs directly in the conversation. This is ideal for debugging why Accessibility Agents customizations aren't loading.

**Enable required settings:**

```json
{
  "github.copilot.chat.agentDebugLog.enabled": true,
  "github.copilot.chat.agentDebugLog.fileLogging.enabled": true
}
```

**Example queries:**

```text
/troubleshoot why isn't web-accessibility-baseline.instructions.md loading?
/troubleshoot list all paths you tried to load customizations
/troubleshoot how many tokens did you use?
/troubleshoot which tools were invoked for the last audit?
```

The `/troubleshoot` skill reads the JSONL debug log files and provides insights into:

- Why tools or subagents were used or skipped
- Why instructions or skills did not load
- What contributed to slow response times
- Whether network connectivity problems occurred

### Export and Import Debug Sessions

You can now save agent debug sessions for offline analysis or team sharing.

**To export:**

1. Open the Agent Debug Logs panel
2. Navigate to the session you want to export
3. Click the **Export** icon (download) in the top-right toolbar
4. Save as a JSONL file (OTLP format)

**To import:**

1. Click the **Import** icon (upload) in the Agent Debug Logs panel
2. Select a previously exported JSONL file
3. The session opens with full overview and metrics

**Use cases for Accessibility Agents:**

- Share debug sessions when reporting issues with agent loading
- Save audit sessions for compliance documentation
- Compare hook execution between different configurations
- Analyze slow accessibility scans offline

> **Note:** Files larger than 50 MB trigger a warning. Export shorter sessions or trim large files.

### Agent Flow Chart View

The new Agent Flow Chart view visualizes the sequence of events and interactions between agents, making complex orchestrations easier to understand.

**To open:**

1. Open the Agent Debug Logs panel
2. Select the session description in the breadcrumb
3. Click **Agent Flow Chart** from the Summary view

**What it shows for Accessibility Agents:**

```text
┌─────────────────────┐
│ User Prompt         │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ UserPromptSubmit    │ ← Inject delegation instruction
│ Hook                │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ accessibility-lead  │ ← Orchestrator agent
└─────────┬───────────┘
          │
    ┌─────┴─────┬─────────────┐
    ▼           ▼             ▼
┌────────┐ ┌────────────┐ ┌────────────┐
│aria    │ │keyboard    │ │contrast    │
│special │ │navigator   │ │master      │
└────────┘ └────────────┘ └────────────┘
          │
          ▼
┌─────────────────────┐
│ PostToolUse Hook    │ ← Create session marker
└─────────────────────┘
```

You can pan/zoom the chart and click any node to see event details.

### Summary View

The Summary view shows aggregate statistics for the chat session:

- Total tool calls
- Token usage (input/output)
- Error count
- Overall duration
- Breakdown by agent

**Access it:** Select the session description in the breadcrumb at the top of the Agent Debug panel.

### Three Views in Agent Debug Panel

| View | Purpose |
|------|---------|
| **Logs** | Chronological event list with filtering |
| **Summary** | Aggregate statistics for the session |
| **Agent Flow Chart** | Visual sequence diagram |

### Attach Debug Events to Chat

You can attach a snapshot of debug events to a chat conversation:

1. Open the Logs view for your session
2. Click the sparkle icon in the top-right
3. The Chat view opens with debug events attached

This lets you ask questions about the current session directly, such as "which accessibility agents were invoked?" or "why did the ARIA check fail?"

## Related Documentation

- [Lifecycle Hooks Guide](hooks-guide.md) - Deep dive on the three-hook enforcement system
- [Context Management Guide](context-management.md) - Using `/compact` effectively
- [Agent Customization](../agents/README.md) - Creating custom agents and skills
- [VS Code Agent Documentation](https://code.visualstudio.com/docs/copilot/customization/overview)
