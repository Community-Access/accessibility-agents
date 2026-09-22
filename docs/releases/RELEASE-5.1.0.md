# Accessibility Agents 5.1: Leaner, Smarter, Faster on Claude Code

## The Problem We Solved

If you were using Accessibility Agents on Claude Code, you were paying a hidden tax.

Every conversation turn, Claude Code serialized every registered agent definition into the schema it sends to the model. With 80 agents defined, that was **12,000 to 16,000 tokens per turn** — before you typed a single word. On a typical audit session, that overhead added up fast.

Version 5.1 eliminates that tax entirely.

---

## The Fix: On-Demand Specialists

The root cause was architectural: all 73 specialist agents were registered in the Claude Code schema, so they were always serialized — even when you never needed them.

The solution is the **specialist dispatch pattern**:

- 7 orchestrators remain registered in `.claude/agents/` — they coordinate work and appear in Claude's schema (1,500 tokens, down from 16,000)
- 73 specialists move to `.claude/specialists/` — they are loaded on demand, only when an orchestrator actually needs them

When an orchestrator needs a specialist, it does two things:

```text
1. Read(".claude/specialists/contrast-master.md")    # load the specialist
2. Task(prompt="<specialist_body>\n\n<your context>") # invoke it as a subagent
```

That's it. The specialist runs with full capability, reads no more schema than it needs, and costs nothing until it is actually used.

**Result: 89% reduction in per-turn schema token cost** — from ~14,000 tokens to ~1,500 tokens.

---

## What Else Is in 5.1

### All 80 Copilot Agents Are Structurally Clean

Every `.github/agents/` file now passes the full validation suite:

- All required `tools:` fields present
- No empty body sections
- No emoji in prose content
- All descriptions under 200 characters (per [agentskills.io](https://agentskills.io) spec)
- All markdownlint rules satisfied

The pre-commit hook enforces this on every future commit — no regressions.

### New Severity Mapping Skill

A new `severity-mapping` skill provides canonical severity level definitions shared across web, document, and markdown audits. Previously each audit domain defined its own severity thresholds. Now there is one source of truth, and cross-format severity normalization is consistent.

### Gemini CLI Parity

All 25 GitHub Copilot skills are now synced to `.gemini/extensions/a11y-agents/skills/`. Gemini CLI users get the same knowledge modules as Copilot users, with no manual sync required.

### New Agent Terminology Instruction File

`agent-terminology.instructions.md` applies to all `.md` and `.agent.md` files. It enforces consistent vocabulary — specialist vs. orchestrator, dispatch vs. invoke, loaded vs. registered — so agent documentation reads as a coherent whole rather than a patchwork of individual authors.

---

## Upgrade Guide

### For Claude Code Users

No action required. The specialist move is transparent — orchestrators handle dispatch automatically. If you have custom agents that import from `.claude/agents/`, update those paths to `.claude/specialists/` for the moved files.

### For Copilot Users

No changes. `.github/agents/` is unchanged in functionality; only the internal structure was cleaned up.

### For Gemini CLI Users

Pull the latest `.gemini/extensions/` directory. The `skills/` subfolder is new in this release.

---

## Numbers

Each metric, with its 5.0, 5.1 and change.

| Metric | 5.0 | 5.1 | Change |
|--------|-----|-----|--------|
| Claude Code schema tokens/turn | ~14,000 | ~1,500 | -89% |
| Registered Claude Code agents | 80 | 7 | -91% |
| On-demand Claude Code specialists | 0 | 73 | +73 |
| .github/agents/ files with 0 lint errors | ~70 | 80 | 100% |
| GitHub Skills with spec-compliant descriptions | ~20 | 25 | 100% |
| markdownlint errors in staged files | 100 | 0 | -100% |

---

## Full Changelog

See [CHANGELOG.md](CHANGELOG.md) for the complete list of changes in this release.

---

## What's Next

The 5.2 roadmap focuses on:

- Playwright-based behavioral scanning fully wired into the web-accessibility-wizard audit loop
- ePub accessibility specialist reaching parity with Word/Excel/PowerPoint specialists
- Codex CLI role definitions aligned with the `.claude/specialists/` on-demand pattern
- VS Code extension (planned in 5.0 roadmap) — scaffolding begins

See [ROADMAP.md](ROADMAP.md) for details.
