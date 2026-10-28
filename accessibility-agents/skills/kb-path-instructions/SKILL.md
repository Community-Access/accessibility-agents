---
name: kb-path-instructions
description: "Reference data, not a reviewer. Per-file-type accessibility rules: semantic HTML, ARIA patterns, CSS, markdown, testing and terminology."
license: MIT
disable-model-invocation: true
user-invocable: false
metadata:
  tier: reference
  domain: cross-cutting
  output: none
  effort: low
  title: Path Instructions
---
Rules that apply to a particular kind of file. These were path-scoped
instruction files before 7.0; each one still says which files it governs.

## Which file to read

Open the one reference that matches what you are working on. Reading all ten
costs more than the rules are worth on any single task.

| Read | When you are working on |
|---|---|
| `references/agent-terminology.md` | files matching `**/*.{md,agent.md}` |
| `references/aria-patterns.md` | files matching `**/*.{html,jsx,tsx,vue,svelte,astro}` |
| `references/css-accessibility.md` | files matching `**/*.{css,scss,less}` |
| `references/document-generation.md` | files matching `**/*.{py,js,ts,mjs,cjs}` |
| `references/markdown-accessibility.md` | files matching `**/*.md` |
| `references/multi-agent-reliability.md` | files matching `**/*.{md,agent.md}` |
| `references/powershell-terminal-ops.md` | files matching `**` |
| `references/semantic-html.md` | files matching `**/*.{html,jsx,tsx,vue,svelte,astro}` |
| `references/testing-accessibility.md` | files matching `**/*.{test,spec}.{js,ts,jsx,tsx}` |
| `references/web-accessibility-baseline.md` | files matching `**/*.{html,jsx,tsx,vue,svelte,astro}` |
