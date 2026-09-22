# Getting started

Ten minutes from clone to a first audit, on any of the five clients. Nothing
here needs a compiler, an extension, or a per-client layout: the package is one
`skills/` directory that every client reads.

## What you need

- Node.js 20 or later
- One of: Claude Code, Codex CLI, GitHub Copilot CLI or VS Code, Gemini CLI, Antigravity
- For document scanning, nothing extra; for PDF/UA validation, veraPDF; for
  behavioural web scans, Playwright. Each is detected and reported, never assumed.

## Install

### As a plugin, which wires the enforcement hooks for you

```text
Claude Code   /plugin marketplace add Community-Access/accessibility-agents
              /plugin install accessibility-agents
Copilot       copilot plugin install accessibility-agents
Codex         /plugins, then add this repository
```

### As skills, for any client

```bash
git clone https://github.com/Community-Access/accessibility-agents
cd accessibility-agents
npm install
node scripts/install.mjs
```

That copies `skills/` to `~/.agents/skills`, the shared location Codex, Copilot,
Gemini and Antigravity read, and writes a hook manifest for whichever clients it
finds. It never overwrites a hooks file or a skill you have edited, and
`--dry-run` shows what it would do first.

### For developing this repository

```bash
node scripts/dev-link.mjs
```

Links `.agents/skills` to `skills/` so every client reads the checkout directly.
Claude Code needs no link: run it with `--plugin-dir .`.

## Your first audit

Describe the problem. You do not need to name a skill, but you can.

| Say something like | What happens |
|---|---|
| "Review this modal for accessibility" | `accessibility-lead` picks the modal, keyboard and ARIA specialists, runs them in parallel, and tells you whether it ships |
| "Audit the whole site" | `web-accessibility-wizard` asks four questions, then runs every domain and writes `WEB-ACCESSIBILITY-AUDIT.md` |
| "Check these PDFs" | `document-accessibility-wizard` scans each file and writes a scored report |
| "Fix the markdown in docs/" | `markdown-a11y-assistant` scans, shows you the fixes it wants to make, and waits |

Six skills are model-invocable; they are the only ones the model sees. The other
102 are reachable by name, so `/aria-specialist` works in the slash menu, and
each router dispatches them by name without loading their instructions into its
own context.

## What the gate does

Once installed, an edit to a user-facing file is refused until
`accessibility-lead` has completed in the session:

```text
Accessibility review required before editing this file. Dispatch the
accessibility-lead skill, let it finish, then retry the edit.
```

That is the intended behaviour, not a fault. Build output, tests, stories and
dependencies are exempt. The reminder that explains the gate appears once per
session, not on every prompt.

## Reading a report

Every report has the same seven sections, because a script writes them from the
skills' findings rather than the model typing them:

1. Metadata: what was audited, with what, under which settings
2. Executive summary: score out of 100, grade, verdict
3. Severity breakdown
4. Findings: rule, criterion, location, problem, fix
5. Remediation priorities, with repeated components first
6. Next steps
7. Delta against the previous report, when there is one

The merged findings are embedded at the end of the report, which is what makes
the next run's delta free.

## Verify the installation

```bash
npm run verify        # every gate
npm run verify:live   # what a real client session actually loads
npm run measure       # what the package costs, per client
```

## Next

- [Skills reference](../reference/skills/README.md): every skill, by tier and domain
- [Configuration](../reference/configuration.md): scan config files and budgets
- [Hooks](../reference/hooks.md): the gate in detail, per client
- [Troubleshooting](../guides/troubleshooting.md)
