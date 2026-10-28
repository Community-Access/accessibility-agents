# Accessibility Agents documentation

One package of Agent Skills, read natively by Claude Code, Codex, GitHub
Copilot, Gemini CLI and Antigravity. This index is the front door; every page
below is reachable from here, and every section says what kind of page it holds
so you can skip what you do not need.

## Start here

Four places to begin, matched to what you are trying to do.

| If you want to | Read |
|---|---|
| Install it and run a first audit | [Getting started](getting-started/README.md) |
| Understand what the six entry points do | [Skills reference](reference/skills/README.md) |
| See what it conforms to and what proves it | [Conformance](standards/conformance.md) |
| Know how it fits together and why | [Architecture](architecture/README.md) |

## Sections

**[Getting started](getting-started/)** - install on each client, run a first
audit, apply a first fix, and what to expect from the enforcement gate.

**[Guides](guides/)** - one task per page: troubleshooting, browser tools,
scanning workflows, custom skills, context management, authoritative sources.

**[Reference](reference/)** - the facts, generated where they can be:

- [Skills catalog](reference/skills/README.md), every skill by tier and domain,
  built from frontmatter by `scripts/build-docs.mjs`
- [Per-skill pages](reference/skills/), when to use each, what it catches, how to
  launch it
- [Knowledge domains](reference/knowledge-domains/), the reference-tier skills
  and which reviewers cite them
- [MCP tools](reference/mcp-tools.md), all 39 with their annotations
- [Hooks](reference/hooks.md), the enforcement gate and its client manifests
- [Configuration](reference/configuration.md), scan config files, workspace preferences, budgets, settings
- [Tools](reference/tools/), Playwright, veraPDF, the PDF form converter

**[Standards](standards/)** - one page per standard this package conforms to,
each with the version relied on, the clauses that matter, how conformance is
checked, and any deviation stated plainly:

- [Agent Skills](standards/agent-skills.md)
- [AGENTS.md](standards/agents-md.md)
- [Agent Plugins 1.0](standards/agent-plugins.md)
- [Model Context Protocol](standards/mcp.md)
- [WCAG 2.2](standards/wcag.md)
- [Hooks, by client](standards/hooks-by-client.md)
- [Conformance dossier](standards/conformance.md), the gates and the measured results
- [Citation policy](standards/citation-policy.md) and [research sources](standards/research-sources.md)

**[Architecture](architecture/)** - the tier model, the dispatch contract, the
findings pipeline, and the decisions behind them.

**[Releases](releases/)** - release notes, one file per version.

**[History](history/)** - the records of how 7.0 and 7.1 came to be. Older
plans, audits, prompt files and superseded guides were removed after 7.1;
they remain in the git history.

The records kept, and what each holds:

- [The 7.0 modernization](history/2026-09-modernization.md), what changed and why
- [The 7.1 standards audit](history/2026-10-standards-audit.md), how it was checked, what was decided, where to go next
- [The first real audit](history/2026-09-first-real-audit.md), what nine
  specialists found against a fixture with a known answer key, and the merge
  defect that only a real run could expose
- [The conformance audit of September 2026](history/CONFORMANCE-AUDIT-2026-09.md),
  the pre-7.0 audit the modernization answered
- [The legacy drift report](history/2026-09-legacy-drift-report.md), the lines
  that differed between the six per-client copies at migration time
- `history/context-*.json`, the context-cost measurements before, during and
  after the migration, cited by the [conformance dossier](standards/conformance.md)

## Conventions

No emoji, no decorative Unicode, plain ASCII punctuation, a sentence before
every table. This is an accessibility project and its documentation is read
aloud. `npm run verify:markdown` holds the line.

## Regenerating what is generated

```bash
node scripts/build-docs.mjs          # skills catalog and MCP tools reference
node scripts/build-dispatch-matrices.mjs
```

Both have a `--check` mode that CI runs, so a generated page cannot drift from
the source it describes.
