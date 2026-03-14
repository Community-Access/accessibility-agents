# Experimental Codex Multi-Agent Roles

Accessibility Agents now includes an **experimental** Codex multi-agent layer on top of the stable `.codex/AGENTS.md` baseline.

## Upstream Codex References

- [OpenAI Codex: Multi-agents](https://developers.openai.com/codex/multi-agent/) -- experimental multi-agent workflows, feature flag, and orchestration behavior
- [OpenAI Codex: Custom instructions with AGENTS.md](https://developers.openai.com/codex/guides/agents-md/) -- how Codex discovers and applies `AGENTS.md`
- [OpenAI Codex: Customization](https://developers.openai.com/codex/concepts/customization/) -- where AGENTS.md, skills, MCP, and multi-agents fit together

## What Is Stable vs Experimental

**Stable baseline:** `.codex/AGENTS.md`

- Loads automatically for UI work
- Keeps the condensed WCAG 2.2 AA guardrails already documented in this repo
- Remains the default Codex story

**Experimental layer:** `.codex/config.toml` plus `.codex/roles/*.toml`

- Adds named Codex roles with concise developer instructions
- Lets you switch into a narrower role when you want a focused pass
- Keeps the baseline rules in place rather than replacing them
- Depends on newer Codex builds where multi-agent support is enabled explicitly (for example via `/experimental` or `[features].multi_agent = true`)

This is **Phase 1** support. It intentionally ports a small, high-value set of roles instead of every Claude Code agent in the repository.

## Included Experimental Roles

- `accessibility-lead`
- `web-accessibility-wizard`
- `aria-specialist`
- `forms-specialist`
- `keyboard-navigator`
- `contrast-master`
- `modal-specialist`
- `live-region-controller`
- `desktop-a11y-specialist`
- `nvda-addon-specialist`
- `pr-review`

## Design Notes

- Codex roles are **TOML-based**, not Markdown agent files.
- `.codex/AGENTS.md` stays in place as the shared accessibility baseline.
- Review-heavy roles default to `sandbox_mode = "read-only"` where that fits.
- Roles that are commonly used to implement fixes default to `workspace-write`.
- Instructions are intentionally short and Codex-specific rather than full ports of the Claude agent bodies.

## File Layout

```text
.codex/
  AGENTS.md
  config.toml
  roles/
    accessibility-lead.toml
    web-accessibility-wizard.toml
    aria-specialist.toml
    forms-specialist.toml
    keyboard-navigator.toml
    contrast-master.toml
    modal-specialist.toml
    live-region-controller.toml
    desktop-a11y-specialist.toml
    nvda-addon-specialist.toml
    pr-review.toml
```

## Installation

Use the normal Codex install path:

```bash
bash install.sh --project --codex
bash install.sh --global --codex
```

That installs:

- the stable `.codex/AGENTS.md` baseline
- the experimental `.codex/config.toml`
- the role files under `.codex/roles/`

If you already have a `config.toml`, the installer merges the Accessibility Agents section using TOML comment markers and leaves unrelated content alone.

## How to Use It

Use Codex normally for general UI work and let `.codex/AGENTS.md` enforce the baseline.

Switch to an experimental role when you want a narrower pass, for example:

- `accessibility-lead` for triage and final synthesis
- `aria-specialist` for semantics and custom widgets
- `forms-specialist` for validation and labeling
- `modal-specialist` for overlays and focus trapping
- `pr-review` for risk-focused review passes

## Current Scope

This experiment does **not** try to reproduce every Claude orchestration behavior inside Codex. The goal is to give Codex a useful first set of named accessibility roles while preserving the existing always-on baseline.
