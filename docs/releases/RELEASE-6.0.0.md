# Accessibility Agents 6.0: Codex, Extensions, and Enforced Specialist Dispatch

## Overview

Accessibility Agents 6.0 is a major platform release. It gives Codex a first-class implementation with native plugin packaging, router skills, custom subagents, lifecycle hooks, extension manifests, and universal installer support.

The release also introduces the v6 extension model so built-in and third-party standards can participate as first-class accessibility rules without forking the core project.

Most importantly, 6.0 changes Codex support from "the model can read an accessibility skill" to "Codex is guided and gated into using the Accessibility Agents workflow." UI edits are blocked until the accessibility lead starts, and final answers are blocked until the lead and required specialists complete.

## Highlights

### Native Codex Plugin

The new Codex plugin includes:

- router skills for web, documents, GitHub workflows, developer tools, and markdown
- Codex custom subagents for the Accessibility Agents specialist team
- lazy-loaded specialist references to avoid crowding the initial skill context
- built-in extension manifests
- hook scripts for lifecycle enforcement

Codex now gets a small router surface instead of a large wall of specialist skills. The routers load deeper instructions and dispatch specialists only when the task needs them.

### Lead-First Specialist Dispatch

The web accessibility router now treats `accessibility-lead` as the first stop for user-facing web accessibility work.

The lead selects relevant specialists from the task domain. Examples:

- Targeted ARIA cleanup: `aria-specialist` and `keyboard-navigator`
- New modal/dialog/overlay: `modal-specialist`, `keyboard-navigator`, `aria-specialist`, and `alt-text-headings`
- Broad audit: ARIA, keyboard, contrast, forms, modals, live regions, headings, tables, and links

If nested dispatch is unavailable inside the lead, the root Codex session is instructed to spawn the lead and selected specialists directly, then ask the lead to synthesize results.

### Codex Lifecycle Hook Guard

Codex 6.0 support includes a lifecycle hook guard registered once in `~/.codex/hooks.json` by the universal installer.

The guard uses:

- `UserPromptSubmit` to inject model-visible dispatch requirements for UI and web tasks
- `SubagentStart` to record lead and specialist starts
- `SubagentStop` to record lead and specialist completions
- `PreToolUse` to block UI edits until `accessibility-lead` starts
- `Stop` to block final answers until required reviews complete

The hook marker logic now handles Codex child sessions and parent thread identifiers, so valid lead dispatches are recognized even when lifecycle events do not share the exact same turn ID as edit hooks.

### Extension Model

Accessibility Agents 6.0 introduces extension manifests for project, organization, and marketplace standards.

Extensions can define:

- agents
- references
- rules
- compliance profiles
- trigger terms
- file patterns
- author metadata

Built-in extensions now use the same structure:

- core
- web
- documents
- markdown
- GitHub
- developer tools

Built-in extensions are authored by Community Access and are installed automatically. Third-party extensions can use the same structure for company standards, design-system rules, regional compliance, or product-specific accessibility requirements.

### Marketplace Groundwork

6.0 adds the groundwork for an Accessibility Agents Extension Marketplace.

The marketplace model is pull-request based. Community extensions can be submitted for review, checked for quality and safety, and listed for users to discover. Review rules prohibit malware, spam, unsafe behavior, and undocumented extension behavior.

Private administrator review guidance is kept separate from public contributor documentation.

### Universal Installer Support

The universal installer now handles Codex as a full platform target:

- copies the Codex plugin payload
- installs router skills
- installs custom subagents
- installs built-in extensions
- configures subagent nesting
- registers and repairs the Codex personal plugin marketplace entry
- enables the plugin
- stamps installed Codex agents with the configured compatible model
- writes the single user-level lifecycle hook guard

The installer also repairs earlier marketplace path mistakes. Codex resolves personal marketplace paths relative to the home directory, so the correct path is:

```text
./.agents/plugins/a11y-agents-codex
```

### Verification and Release Safety

6.0 adds Codex-specific checks to release readiness:

- `scripts/validate-codex-plugin.js`
- `scripts/codex-accessibility-dispatch-smoke.mjs`
- Codex plugin validation in release readiness
- Codex dispatch source smoke validation in release readiness
- workflow path triggers for Codex plugin and dispatch smoke files

The live smoke target verifies the behavior that matters:

```text
A11Y_DISPATCH_SMOKE accessibilityLeadSpawned=yes specialistsSpawned=yes waitedForAgents=yes toolSearchUsed=yes localFallback=no
```

## Full Changelog

- Added native Codex plugin packaging under `codex-plugin/`.
- Added Codex router skills for web, documents, GitHub workflows, developer tools, and markdown.
- Added Codex custom subagents and specialist references for the Accessibility Agents team.
- Added built-in extension manifests for core, web, documents, markdown, GitHub, and developer tools.
- Added Codex lifecycle hook guard with prompt, subagent lifecycle, edit, and final-answer enforcement.
- Added source and live smoke testing for Codex accessibility dispatch.
- Added installer-managed Codex plugin marketplace registration and repair.
- Added installer-managed `~/.codex/hooks.json` guard registration.
- Added Codex plugin validation to release readiness.
- Added `manifest.json` to local release consistency checks.
- Changed Codex hook registration to avoid duplicate plugin-manifest and user-level hook execution.
- Changed legacy Codex role templates to avoid hard-pinning an unsupported model.
- Fixed Codex lead dispatch not being treated as mandatory for UI work.
- Fixed final answers completing before lead and specialist review completion.
- Fixed child-session and parent-thread marker mismatch in Codex hook state.
- Fixed targeted ARIA prompts not triggering dispatch.
- Fixed targeted ARIA reviews selecting the entire broad web audit team.
