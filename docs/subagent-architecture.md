# Subagent Architecture Guide

## Overview

This repository uses a **coordinator-worker delegation pattern** for agent composition. Orchestrator agents (like `accessibility-lead`, `web-accessibility-wizard`, `document-accessibility-wizard`) coordinate specialized agents to deliver comprehensive accessibility audits.

## Coordination Models

### 1. Explicit Coordinator Pattern (Recommended)

A single orchestrator agent maintains an **allowlisted set of specialized agents** it can delegate to.

**Example: `accessibility-lead`**
```yaml
agents:
  - web-accessibility-wizard
  - cognitive-accessibility
  - design-system-auditor
  - aria-specialist
  - keyboard-navigator
  - forms-specialist
  - modal-specialist
  - contrast-master
  - live-region-controller
  - alt-text-headings
  - tables-data-specialist
  - link-checker
  - testing-coach
  - wcag-guide
  - text-quality-reviewer
```

**Reward:**
- Clear delegation scope — no ambiguity about which agents a coordinator can call
- Prevents cascading failures — specialist agents don't call other agents unpredictably
- Faster development — agents are focused, don't coordinate with each other
- Easier debugging — clear call graph
- Better token efficiency — no redundant parallel discovery

**Risk:**
- Coordinator must maintain accurate allowlist
- Adding new specialists requires coordinator update
- Single point of delegation — can become bottleneck if overloaded

### 2. Internal Helper Pattern

Some agents are **not user-invocable** and only exist to support orchestrators:
- `markdown-scanner` — scans single markdown file (invoked by `markdown-a11y-assistant`)
- `document-inventory` — builds document lists (invoked by `document-accessibility-wizard`)
- `cross-page-analyzer` — aggregates findings (invoked by web-accessibility-wizard)

These agents:
- Have `user-invocable: false` in frontmatter
- Are called via the `agent` or `Task` tool by orchestrators
- Are not exposed directly to users
- Handle narrow, reusable functionality

### 3. Nested Subagent Pattern (VS Code 1.113+, Disabled by Default)

VS Code 1.113 supports nested subagent calls: a specialist agent calling another specialist agent.

**Repo Policy:**
- **Platform capability:** Yes, technically supported
- **Repo recommendation:** Disabled by default
- **When to enable:** Only for intentionally designed orchestration flows (e.g., a coordinator agent that needs to spawn multiple parallel analysis subagents)
- **Config:** `chat.subagents.allowInvocationsFromSubagents` (default: false)

**Why disabled by default?**
1. **Cascade risk** — Wrong agent selection at any level propagates
2. **Token cost** — Nested calls multiply latency and token consumption
3. **Debugging complexity** — Deeper call stacks, harder to trace failures
4. **Ambiguous ownership** — Who owns the final finding — specialist or coordinator?

**When to enable (rare):**
- A coordinator orchestrates multiple parallel analysis agents that themselves delegate to focused specialists
- Example: `web-accessibility-wizard` → spawn `playwright-scanner` AND `axe-core-cli` agents in parallel, each doing focused work

## Delegation Rules

### ✅ Good Patterns

1. **Single Orchestrator Coordinates Specialists**
   ```
   accessibility-lead
   ├── aria-specialist
   ├── keyboard-navigator
   ├── forms-specialist
   └── contrast-master
   ```

2. **Orchestrator Spawns Internal Helpers**
   ```
   document-accessibility-wizard
   ├── document-inventory
   ├── word-accessibility
   ├── excel-accessibility
   ├── powerpoint-accessibility
   └── cross-document-analyzer
   ```

3. **Specialist Does NOT Delegate**
   ```
   aria-specialist (focused, no subagents)
   keyboard-navigator (focused, no subagents)
   forms-specialist (focused, no subagents)
   ```

### ❌ Anti-Patterns

1. **Specialist Calls Another Specialist**
   ```
   aria-specialist → calls keyboard-navigator
   (Confusing: who does the user think is handling this?)
   ```

2. **Nested Delegation Without Clear Ownership**
   ```
   accessibility-lead → web-accessibility-wizard → aria-specialist
   (Three levels, unclear where issue lives if it fails)
   ```

3. **Multiple Coordinators Without Clear Scope**
   ```
   accessibility-lead AND web-accessibility-wizard both claim ARIA
   (Duplicate findings, conflicting guidance)
   ```

## Allowlist Validation

All agents using the `agent` tool to invoke subagents **must** declare an `agents:` list in their frontmatter:

```yaml
---
name: accessibility-lead
agents:
  - web-accessibility-wizard
  - cognitive-accessibility
  - design-system-auditor
  # ... full list of coordinable agents
---
```

**Validator Rule:** If an agent has `tools: [..., 'agent', ...]` but no `agents:` frontmatter, the CI validator (`scripts/validate-agents.js`) will reject it.

This ensures:
- Explicit scope documentation
- No surprise delegations
- Easier code review (PR shows exactly which agents are coordinable)
- Prevents accidental subagent calls

## Framework Integration

### Chat Customizations Editor (VS Code 1.113)

The Chat Customizations Editor displays agents with their allowlists:
- Coordinator agents show their specialist agents in the UI
- Users understand the delegation scope before invoking
- Specialist agents (`user-invocable: false`) don't appear in user picker

### Agent Debug Log (VS Code 1.113)

When debugging an agent orchestration:
1. Open Agent Debug Log (`chat.agentDebugLog.enabled`)
2. Trigger the coordinator agent
3. Watch the call graph: which subagents were invoked, in what order, with what results
4. If findings are duplicated, check the call graph for unexpected parallel calls

### MCP and Subagents

MCP servers are **orthogonal to subagent delegation**:
- MCP provides **tools** (accessibility scanning functions, GitHub API, etc.)
- Agents invoke tools via MCP, not other agents
- Both coordinators and specialists can invoke the same MCP tools
- Example: Both `aria-specialist` and `forms-specialist` invoke the same MCP `axe-core: scan` tool

## Repo Policy Summary

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Coordinator pattern** | Explicit allowlist | Clear scope, debugging simplicity |
| **Specialist delegation** | No subagents | Focused, less token cost |
| **Internal helpers** | `user-invocable: false` | Not in user picker, clear role |
| **Nested subagents** | Disabled by default | Cascade risk, token cost |
| **Tool usage** | MCP preferred | Platform-native, no cascades |
| **Validation** | Require `agents:` frontmatter | Prevent accidental delegation |

## Adding a New Specialist Agent

1. Create the agent file with focused responsibility
2. Set `user-invocable: false` if it's only for coordinators
3. Do NOT include `tools: [..., 'agent', ...]` (specialists don't delegate)
4. If a coordinator needs to call it, add to that coordinator's `agents:` list
5. Document the agent's entry point in the coordinator's instructions
6. Run `scripts/validate-agents.js` to verify

## Adding a New Coordinator Agent

1. Create the orchestrator agent
2. Define the complete `agents:` list in frontmatter (all agents it can invoke)
3. Include `tools: [..., 'agent', ...]` in the tools list
4. Document the delegation flow in the agent's instructions
5. Link to this architecture guide
6. Run `scripts/validate-agents.js` to verify the `agents:` list is complete

## Troubleshooting Orchestration

### Symptom: Duplicate findings

**Cause:** Multiple coordinators are analyzing the same content
**Solution:** Check the call graph — only one coordinator should be active per session

### Symptom: Agent not invoked

**Cause:** Coordinator's `agents:` list doesn't include it, or agent has `user-invocable: false`
**Solution:** Check coordinator's frontmatter `agents:` list; verify specialist is not marked `user-invocable: false` unless intentional

### Symptom: Slow analysis

**Cause:** Nested subagents creating deep call stacks
**Solution:** Flatten to single coordinator; move specialist work to MCP tools if possible

### Symptom: Conflicting guidance

**Cause:** Different specialists giving different recommendations
**Solution:** Ensure only one coordinator is active; have coordinator synthesize findings into one guidance set

## Claude Code Delegation

Claude Code uses a different delegation model than VS Code Copilot. This section documents the key differences and the patterns used in this repository.

### Task Tool

In Claude Code, orchestrators delegate to sub-agents using the **Task** tool. Each Task invocation spawns a focused sub-agent with the instructions from the named agent file. The Task tool is the Claude Code equivalent of Copilot's `agent` tool.

**Critical requirement:** The `Task` tool must be listed in the orchestrator's YAML frontmatter `tools:` field. Without it, all delegation instructions are dead code.

### Single-Level Delegation

Claude Code enforces single-level delegation: sub-agents spawned via Task receive a stripped tool set (Read, Write, Edit, Bash, Grep, Glob). The Task tool is **not** passed to sub-agents. This means:

- Orchestrators can spawn specialists
- Specialists cannot spawn further sub-agents
- Deep delegation chains are structurally impossible (no need for `allowInvocationsFromSubagents`)

### Graceful Fallback Pattern

Because orchestrators may themselves be spawned as sub-agents by higher-level coordinators (e.g., accessibility-lead spawns web-accessibility-wizard), every orchestrator must handle both modes:

```
If Task tool is available (top-level invocation):
    Delegate to specialist sub-agents via Task
    Collect and aggregate their results

If Task tool is unavailable (sub-agent mode):
    Apply specialist domain knowledge inline
    Do not report delegation failure
    Just do the work directly
```

This dual-mode pattern is documented in each orchestrator's "Platform-Aware Delegation" section.

### Platform Comparison

| Feature | VS Code Copilot | Claude Code |
|---|---|---|
| Delegation tool | `agent` | `Task` |
| Agent allowlist | `agents:` frontmatter list | Not available (any agent can be invoked) |
| Handoff declarations | `handoffs:` frontmatter list | Not available |
| Nested delegation | Controlled by `chat.subagents.allowInvocationsFromSubagents` | Structurally prevented (Task stripped from sub-agents) |
| Fallback needed | No (agent tool always available if declared) | Yes (Task unavailable when running as sub-agent) |

### Affected Orchestrators

All six orchestrators in `.claude/agents/` include `Task` in their tools and implement the graceful fallback:

| Agent | Sub-Agents |
|---|---|
| `accessibility-lead.md` | 18 web accessibility specialists |
| `web-accessibility-wizard.md` | 18 scanning/analysis specialists |
| `document-accessibility-wizard.md` | 8 document format specialists |
| `github-hub.md` | 16 GitHub workflow agents |
| `nexus.md` | 16 GitHub workflow agents (auto-routing) |
| `developer-hub.md` | 8 developer tool specialists |

## References

- [Configuration Guide](configuration.md) — How users set subagent behavior
- [Accessibility-Lead Agent](.github/agents/accessibility-lead.agent.md) — Example Copilot orchestrator
- [Web Accessibility Wizard](.github/agents/web-accessibility-wizard.agent.md) — Example with many parallel analysis agents
- [Accessibility-Lead (Claude)](.claude/agents/accessibility-lead.md) — Example Claude Code orchestrator with Task tool
- [Validator Rules](../scripts/validate-agents.js) — Automated enforcement of this policy
