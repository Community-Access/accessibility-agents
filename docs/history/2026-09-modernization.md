# Accessibility Agents Modernization Plan

Version target: 7.0.0
Written: 2026-09-21
Status: complete. Phases 0 through 6 applied 2026-09-21. Section 11 records the impact; docs/MODERNIZATION-CONFORMANCE.md holds the evidence.
Scope: replace every harness-specific surface this repo ships (Claude plugin, Codex plugin, Gemini extension, Copilot agents, prompts and instructions, VS Code extension) with one package built on the open agent standards, and cut per-turn and per-dispatch context cost by an order of magnitude on every harness.

Companion documents: `docs/MODERNIZATION-CONFORMANCE.md` (standards, gates, measured results, defects found), `docs/CONFORMANCE-AUDIT-2026-09.md` (the audit that preceded this work).

---

## 1. Goal

Ship one standards-based package that every harness reads natively:

- `AGENTS.md` for always-on instructions (agents.md standard).
- `skills/` for every agent, orchestrator and specialist alike (Agent Skills standard, agentskills.io).
- `plugin.json` for packaging (Agent Plugins 1.0, agent-plugins.org).
- `mcp.json` plus the MCP server on the 2026-07-28 protocol.

No per-harness agent bodies, no per-harness instruction files, no per-harness copies. The only client-specific files left are hook manifests (event names differ per client) and two thin manifests that point at the same `skills/` directory. Token cost is measured and budgeted in CI.

---

## 2. Where the tokens go today (measured 2026-09-21)

Figures are from the working tree at commit `161c60c` plus today's uncommitted conformance fixes. Token estimates use chars/4.

### 2.1 Always-on cost per turn

Each harness, with its item and approx tokens.

| Harness | Item | Approx tokens |
|---|---|---:|
| Claude Code (repo) | `CLAUDE.md` | 5,400 |
| Claude Code (plugin) | 80 registered agent descriptions | 6,200 |
| Codex | 80 `agents/*.toml` descriptions + `AGENTS.md` | 7,600 |
| Copilot | `copilot-instructions.md` + 85 agent descriptions | 11,800 |
| Gemini | `GEMINI.md` + 101 skill descriptions | 2,300 + catalog |

### 2.2 Per-dispatch cost

- Orchestrators read a specialist body into their own context, then paste it into the subagent prompt. A 19 KB specialist costs about 5k tokens to read and 5k to send before any work starts.
- Every spawned Claude subagent loads the project `CLAUDE.md` (5.4k tokens). A ten-specialist audit spends about 54k tokens loading the same file.
- `web-accessibility-wizard.md` is 78 KB (about 20k tokens) and loads whole on every run. `document-accessibility-wizard.md` is 46 KB, `pr-review.md` 54 KB, `daily-briefing.md` 37 KB, `issue-tracker.md` 35 KB.
- Reports are typed by the model from a 400-line template. A 60-finding report costs about 15k output tokens that a script can render from JSON for free.

### 2.3 Duplication

The same specialist body exists in five or six hand-maintained copies that have already drifted (six distinct content hashes for aria-specialist across `.claude/specialists`, `claude-code-plugin/agents`, `codex-skills`, `codex-plugin/references/specialists`, `.gemini/.../skills`, `.github/agents`). About 6.6 MB of agent text is in git for about 1.1 MB of unique content. `scripts/check-platform-parity.js` checks that files exist per platform, not that they match.

### 2.4 Defects found during this survey

- `.claude/agents/accessibility-lead.md` contains its opening paragraph twice.
- `.claude/hooks/hooks-consolidated.json` uses Copilot matcher keys and is not a Claude Code hooks file. `.claude/settings.json` is `{}`, so the repo itself has no active Claude Code hooks.
- Root clutter every harness listing pays for: `.history/`, `markdownlint-output.txt` (88 KB), `source-validation-results.json` (282 KB), `tmp-*.json`, a stray file named `C`, two sample audit outputs, seven `RELEASE-*.md`.
- MCP server: 38 tools, none with `annotations` or `outputSchema`.

---

## 3. Standards adopted and what each client reads

Each standard, with its spec, claude code, codex, copilot (vs code, CLI, cloud) and gemini CLI or antigravity.

| Standard | Spec | Claude Code | Codex | Copilot (VS Code, CLI, cloud) | Gemini CLI / Antigravity |
|---|---|---|---|---|---|
| AGENTS.md | agents.md | via `CLAUDE.md` containing `@AGENTS.md` | native, root down to cwd, 32 KiB cap | native, nearest wins | via `context.fileName` or extension `contextFileName` |
| Agent Skills | agentskills.io/specification | `.claude/skills`, `.agents/skills`, plugin `skills/` | `.agents/skills`, `~/.agents/skills` | `.github/skills`, `.claude/skills`, `.agents/skills` | `.agents/skills`, `.gemini/skills` |
| Agent Plugins 1.0 | agent-plugins.org | reads `.claude-plugin/plugin.json` | reads `.codex-plugin/plugin.json` (has not adopted 1.0 yet) | native 1.0 `plugin.json`, also reads `.claude-plugin/plugin.json` | extensions carry over as Antigravity plugins |
| MCP 2026-07-28 | modelcontextprotocol.io | yes | yes | yes | yes |

Facts that shape the design:

- Every client loads only skill name and description at startup and the body on activation. Codex caps the catalog at 2 percent of the context window (about 8,000 chars) and shortens descriptions under pressure, so descriptions must be short and front-loaded.
- Skill spec limits: name 64 chars matching the directory, description 1,024 chars, body under 5,000 tokens and 500 lines, `references/` one level deep, `scripts/` for deterministic work.
- Codex `AGENTS.md` discovery stops at 32 KiB combined. Copilot asks for under two pages.
- Claude Code and VS Code honour `disable-model-invocation: true` (skill is user-only and its description leaves the model's context). Codex has the equivalent `agents/openai.yaml` with `policy.allow_implicit_invocation: false`. Gemini has neither but only pays about 25 tokens per catalog entry.
- Gemini CLI stopped serving individual users on 2026-06-18 in favour of Antigravity CLI, which reads the same skills and `AGENTS.md`. The Gemini extension format is a legacy target.
- VS Code, Copilot CLI and the Copilot app install Agent Plugins 1.0 natively as of 2026-08-12, which removes the reason for a separate VS Code extension.
- MCP 2026-07-28 is stateless, `tools/list` returns `ttlMs` and `cacheScope`, and servers should return tools in deterministic order to keep prompt caches warm. Tool annotations and `outputSchema` are how clients auto-approve read-only scanners and parse results.

---

## 4. Principles

1. One package, zero copies. Everything lives once at the repo root in standard locations. Anything a client needs in a different path is created by the installer at install time, never committed.
2. Skills are the unit of everything. Orchestrators are router skills; specialists are skills with `references/`; helpers are hidden skills. No harness-native subagent definitions.
3. Tiered catalog. Six router skills are model-invocable. Every other skill is user-invocable only, so it costs the model nothing until a router dispatches it.
4. Pointer dispatch. A router spawns the client's generic subagent with a 300-token prompt that names the skill to activate. The router never reads specialist bodies.
5. Structured findings, scripted reports. Specialists emit JSON matching one schema; `scripts/` render reports, CSV, VPAT and statements.
6. Enforcement stays. The three-hook gate (detect, block edit, mark reviewed) survives on every client that supports hooks, driven by one guard script.
7. Budgets in CI. Numbers in `budgets.json`, checked on every pull request.

---

## 5. Target layout

```text
AGENTS.md                       always-on contract, <= 1,200 tokens
CLAUDE.md                       one line: @AGENTS.md
plugin.json                     Agent Plugins 1.0 manifest
mcp.json                        MCP server registration (stdio, npx)
.claude-plugin/plugin.json      thin: name, version, description (VS Code and Claude read it)
.codex-plugin/plugin.json       thin: name, version, skills: ./skills/, hooks (until Codex adopts 1.0)
skills/
  a11y-core/                    shared assets, never dispatched
    SKILL.md                    what the pack is, output contract, dispatch contract
    references/sources.md       the one "Authoritative Sources" list
    references/report-requirements.md
    schemas/findings.schema.json
    scripts/render-report.mjs
    scripts/merge-findings.mjs
    scripts/measure-context.mjs
  accessibility-lead/           router (model-invocable)
    SKILL.md                    <= 4 KB
    references/dispatch-matrix.md
  web-accessibility-wizard/     router
    SKILL.md                    <= 6 KB: phases, gates, outputs
    references/phase-0-discovery.md
    references/framework-intelligence.md
    references/severity-scoring.md
    references/ci-integration.md
    references/edge-cases.md
  document-accessibility-wizard/   router
  markdown-a11y-assistant/         router
  developer-hub/                   router
  github-hub/                      router (nexus becomes an alias line in AGENTS.md)
  aria-specialist/              specialist (user-invocable only)
    SKILL.md                    <= 4 KB core checklist
    references/apg-patterns.md
    references/violations.md
    agents/openai.yaml          policy.allow_implicit_invocation: false
  ... (about 60 more specialists and helpers, same shape)
hooks/
  guard.mjs                     one script, all events, all clients
  claude.hooks.json             event names for Claude Code
  codex.hooks.json              event names for Codex
  copilot.hooks.json            event names for Copilot (version 1 format)
  gemini.hooks.json             event names for Gemini / Antigravity
mcp-server/                     unchanged location, protocol 2026-07-28
templates/                      scan config profiles, unchanged
docs/
example/
scripts/                        build, validate, install, release
budgets.json
```

Removed after cutover: `.claude/agents`, `.claude/specialists`, `.claude/hooks`, `.claude/AGENTS.md`, `claude-code-plugin/`, `codex-plugin/`, `codex-skills/`, `.codex/`, `.gemini/`, `gemini-extension.json`, `GEMINI.md`, `.github/agents`, `.github/skills`, `.github/prompts`, `.github/instructions`, `.github/copilot-instructions.md`, `plugin.yaml`, `vscode-extension/`, `.a11y-agent-manifest`.

### 5.1 Skill frontmatter

Only spec fields plus the two extension fields that Claude Code and VS Code both honour. Everything else goes in `metadata`, which the spec allows and clients ignore.

```yaml
---
name: aria-specialist
description: ARIA roles, states and properties for custom widgets, dialogs, tabs, comboboxes and live regions. Use when building or checking interactive web components.
disable-model-invocation: true
metadata:
  tier: specialist
  domain: web
  output: findings
  effort: medium
---
```

Router skills omit `disable-model-invocation` and keep descriptions under 160 chars with the trigger first: "Web UI accessibility lead. Use before editing HTML, JSX, TSX, Vue, Svelte, CSS or templates; picks specialists and merges findings."

### 5.2 Dispatch contract

A router dispatches with the client's generic subagent primitive (Claude Code: Agent tool; Codex: spawn a worker; Copilot: subagent; Gemini: generalist). The prompt is fixed at under 300 tokens:

```text
Activate the skill "aria-specialist" (if activation is unavailable, read skills/aria-specialist/SKILL.md) and follow it.
Task: <one paragraph>
Scope: <file list or glob>
Rules: semantic HTML before ARIA; report, do not edit.
Return ONLY JSON matching skills/a11y-core/schemas/findings.schema.json.
```

The specialist reads its own instructions in its own context. The router receives JSON, not prose. The dispatch matrix (`accessibility-lead/references/dispatch-matrix.md`) is the only place the model learns which specialists exist, since their descriptions are out of its catalog.

### 5.3 Findings schema

`skills/a11y-core/schemas/findings.schema.json` (JSON Schema 2020-12):

```json
{
  "type": "object",
  "required": ["skill", "scope", "findings"],
  "properties": {
    "skill": { "type": "string" },
    "scope": { "type": "array", "items": { "type": "string" } },
    "findings": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["rule", "wcag", "severity", "location", "summary", "fix"],
        "properties": {
          "rule": { "type": "string" },
          "wcag": { "type": "string" },
          "severity": { "enum": ["critical", "serious", "moderate", "minor"] },
          "confidence": { "enum": ["high", "medium", "low"] },
          "location": { "type": "string" },
          "summary": { "type": "string", "maxLength": 240 },
          "fix": { "type": "string", "maxLength": 480 },
          "evidence": { "type": "string", "maxLength": 480 }
        }
      }
    },
    "passed": { "type": "array", "items": { "type": "string" } }
  }
}
```

`node skills/a11y-core/scripts/render-report.mjs .a11y-history/<run>/*.json --template web --out WEB-ACCESSIBILITY-AUDIT.md` renders every section required by `references/report-requirements.md` and embeds the merged JSON in a fenced block at the end so delta tracking never re-parses prose. CSV, VPAT and statement generators consume the same JSON. The MCP server exposes the same renderer as `render_accessibility_report` so clients without a shell reach it.

### 5.4 AGENTS.md contents (<= 1,200 tokens)

1. What the pack enforces, in one paragraph.
2. The rule: before editing UI files, dispatch `accessibility-lead`; before touching Office or PDF, dispatch `document-accessibility-wizard`; markdown, `markdown-a11y-assistant`.
3. The six router names with one line each.
4. The non-negotiable standards list (eight lines).
5. Pointer: full agent reference in `docs/agents/`, report requirements in `skills/a11y-core/references/report-requirements.md`.

Everything else in today's `CLAUDE.md` (agent tables, knowledge domains, VS Code feature notes, scan configuration, report requirements) moves to `docs/` or to `a11y-core/references/`.

### 5.5 Hooks

`hooks/guard.mjs` handles every event by reading the event name from stdin JSON and dispatching to one of four behaviours: detect (inject the delegation reminder once per session, capped at 60 words), gate (deny UI edits until a marker exists, reason capped at 40 words), mark (write the marker when the lead subagent stops), persist (write phase and findings path before compaction, re-inject a 100-word state line after). Four manifests map client event names to the same script:

| Behaviour | Claude Code | Codex | Copilot | Gemini |
|---|---|---|---|---|
| detect | UserPromptSubmit | UserPromptSubmit | userPromptSubmitted | BeforeAgent |
| gate | PreToolUse (Edit, Write) | PreToolUse (apply_patch, Edit, Write) | preToolUse | BeforeTool (write_file, replace) |
| mark | SubagentStop (accessibility-lead) | SubagentStop | postToolUse | AfterAgent |
| persist | PreCompact, SessionStart | PreCompact, SessionStart | none | PreCompress, SessionStart |
| finalize | Stop | Stop | none | AfterAgent |

Copilot has no `Stop` event, so the edit gate is the enforcement point there.

---

## 6. Token budgets (enforced from Phase 0)

Each budget, with its now, target and check.

| Budget | Now | Target | Check |
|---|---:|---:|---|
| Always-on, Claude Code (AGENTS.md + 6 router descriptions) | ~11,600 | 1,500 | `measure-context --client claude` |
| Always-on, Codex (AGENTS.md + catalog) | ~7,600 | 1,500 | `measure-context --client codex` |
| Always-on, Copilot | ~11,800 | 1,500 | `measure-context --client copilot` |
| Always-on, Gemini / Antigravity (AGENTS.md + catalog names) | ~2,300 + catalog | 3,000 | `measure-context --client gemini` |
| Router-side cost per specialist dispatch | ~10,000 | 300 | `measure-context --dispatch` |
| Largest `SKILL.md` | 78 KB | 6 KB | `validate-skills --max-body 6144` |
| Copies of any agent body in git | 5-6 | 1 | `validate-skills --no-shadow-trees` |
| Skill catalog under Codex 2 percent cap (about 8,000 chars for 66 skills) | over | under | `measure-context --client codex` |

---

## 7. Phases

### Phase 0: Measure - DONE 2026-09-21

Files: create `skills/a11y-core/scripts/measure-context.mjs`, `budgets.json`; modify `.github/workflows/validate-agents.yml`.

1. `measure-context.mjs` sums, per client: instruction files the client loads (`AGENTS.md`, plus legacy `CLAUDE.md`, `GEMINI.md`, `copilot-instructions.md` while they exist), model-invocable skill descriptions, registered agent descriptions in legacy trees, and the literal strings the hook scripts inject. Output is a table and JSON. The estimator is one function (chars/4) so it can be replaced with a tokenizer later.
2. `budgets.json` starts at the "Now" numbers plus 5 percent so CI passes today and fails on regression.
3. Commit `docs/context-baseline-2026-09.json`.

Verify: `node skills/a11y-core/scripts/measure-context.mjs --check budgets.json` exits 0.

**Shipped.** `measure-context.mjs` reports per client a `current` column (the
standard package) and a `legacy` column (the per-harness trees Phase 6 removes),
so the transition is visible rather than averaged away. `--dispatch` prices
router-side dispatch by naming the specialist that costs the most. Baseline in
`docs/context-baseline-2026-09.json`, ceilings in `budgets.json`, CI step added
to `.github/workflows/validate-agents.yml`.

### Phase 1: Build the standard package - DONE 2026-09-21

Files: create `skills/` (all 80 agents as skills), `AGENTS.md` (new), `plugin.json`, `mcp.json`, thin `.claude-plugin/plugin.json` and `.codex-plugin/plugin.json`; create `scripts/migrate-agents-to-skills.mjs` (one-shot), `scripts/validate-skills.mjs`; modify `CLAUDE.md` to `@AGENTS.md`.

1. Migration script, run once against the `.claude/agents` and `.claude/specialists` copies (the most-edited tree). For each agent: frontmatter to spec fields, tier from `.claude/AGENTS.md` (registered means router), body split at the first `##` heading into `SKILL.md` core and `references/<slug>.md` for any section over 1.5 KB that is not part of the core loop, with a one-line pointer left in place. The script also diffs the six legacy copies and writes `build/drift-report.md` listing lines present in one copy only, for hand review of the web team and the three wizards.
2. `validate-skills.mjs`: wraps `skills-ref validate` (agentskills.io reference validator), then checks body size, description length, router count equals six, every specialist has `disable-model-invocation: true` and `agents/openai.yaml`, every specialist appears in at least one router's dispatch matrix, and no legacy tree shadows a skill name.
3. `plugin.json`:

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  "name": "accessibility-agents",
  "version": "7.0.0",
  "description": "WCAG 2.2 AA enforcement: router and specialist skills, hooks, MCP scanners.",
  "skills": "./skills/",
  "mcp": "./mcp.json"
}
```

Thin `.claude-plugin/plugin.json` and `.codex-plugin/plugin.json` carry name, version, description and point at `./skills/` and the matching hook manifest.
4. `AGENTS.md` per section 5.4; `CLAUDE.md` becomes the single line `@AGENTS.md`.
5. Run every existing validator that still applies, then `claude plugin validate .`, `skills-ref validate skills/*`, and a Copilot plugin install from the local path.

Verify: `node scripts/validate-skills.mjs` exits 0; the six routers appear in the Claude Code skill list and the specialists do not; `/aria-specialist` works as a user command; Codex `$aria-specialist` works and the catalog is under its cap.

**Shipped, with four decisions made during the work.**

1. **Knowledge domains became skills too.** The 26 files in `.github/skills` were
   cited by agents as `../skills/<name>/SKILL.md`, a path that resolved to
   nothing from either the old location or the new one. They migrated as
   `skills/kb-*` at a fourth tier, `reference`: neither user- nor
   model-invocable, so they cost no catalog, and exempt from the 6 KiB body
   budget because splitting a lookup table makes it slower to use. The `kb-`
   prefix keeps `cognitive-accessibility` the knowledge base distinct from
   `cognitive-accessibility` the specialist. 47 dead links repointed.
2. **Authoritative Sources blocks were pulled out early.** Every agent opened
   with the same shape of specification list, about 400 bytes each. They now
   live in `skills/a11y-core/references/sources.md`, grouped by skill, which
   bought back budget the mechanical split spends on real instructions. The
   identity paragraph that shared those sections was preserved.
3. **Dispatch matrices were generated, not deferred.** Splitting routers
   mechanically left 34 specialists named by nobody, and specialists are
   invisible to the model by design, so that would have made them unreachable.
   Each router now carries a pinned dispatch block and a generated
   `references/dispatch-matrix.md` covering its domains. The validator fails if
   a specialist appears in no matrix.
4. **Duplicate content was collapsed.** 21 agents carried a paragraph verbatim
   twice, including `accessibility-lead` and its opening statement. Whole
   sections were duplicated too, usually a title block pasted twice with the two
   link spellings the old trees used; those are dropped when the repeat says
   nothing the first did not. Sections containing a fence are left alone.

**Then the package was held to this project's own accessibility rules**, which
it had never been subject to: the Claude tree is excluded from markdownlint, and
`markdown-a11y-lint.mjs` had never been pointed at it. Running it found real
defects in the migrated output and one in the linter.

- **16 multiple-H1 errors.** A skill's title is its frontmatter name, so the
  body must start at H2. Every body H1 is now demoted, fence-aware, and the
  validator fails on any that come back.
- **278 bare URLs.** The source lists were `**Name** - https://url`. They are
  now `[Name](https://url)`, which also removes the em-dash separators this
  project's own markdown rules flag. One remaining case was an example
  `localhost` address, now in code formatting rather than presented as a link.
- **Dead and misdirected links.** Reference files sit one directory deeper than
  the SKILL.md they came from, so their relative links were one level short;
  they are now reparented on write. Citations of `../skills/<name>/` and
  `../../.github/skills/<name>/` resolved to nothing from either the old or the
  new location and now point at the migrated `kb-` skills. `shared-instructions.md`,
  cited 25 times and 22 KB of real shared behaviour, migrated as
  `kb-github-shared-instructions` rather than being left behind.
- **A bug in the linter.** `md-table-desc` checked only the line immediately
  above a table, so the only way to satisfy it was to delete the blank line
  between the description and the table. GitHub Flavored Markdown does not
  recognise a table that interrupts a paragraph, so that markdown would not have
  rendered as a table at all. The rule now looks back past blank lines. This cut
  the repository-wide count from 2,251 to 1,312 without touching a single
  document, and two unit tests now hold the behaviour in place.

What remains is 191 table-description warnings in the skills tree, one or two
per file across about 150 files, inherited from agent content. Each needs a
sentence written for it, which is content work rather than migration work, so it
is scoped to Phase 2. Everything this migration generates is clean.

Results: 107 skills (6 routers, 57 specialists, 16 helpers, 28 references).
Catalog 5,995 chars against the Codex 8,000 cap. Largest dispatchable body 6,131
bytes, none over budget. Always-on cost, Claude Code, fell from 15,924 tokens to
9,166 with the legacy trees still present, and the standard package alone costs
1,620. `claude plugin validate skills --strict` passes, every existing validator
still passes, and both `check-skill-conformance.mjs` and the conformance workflow
now cover `skills/`. Drift across the six legacy copies is catalogued in
`build/drift-report.md` for hand review before Phase 6 deletes them.

Not run, because they need a live client rather than a script: confirming in a
running session that the six routers appear in the skill list and the
specialists do not, that `/aria-specialist` resolves as a user command, and that
Codex accepts `$aria-specialist`. The static equivalents pass. `skills-ref
validate` from the specification authors was also not run; it is not installed
here and installing it was not in scope.

Two items deliberately left to Phase 2, and reported by the validator as
backlog rather than hidden: `accessibility-lead` and `developer-hub` still
mention the legacy `.claude/specialists/` path in prose, and the routers' phase
structure is still the mechanical split rather than a semantic one.

### Phase 2: Progressive disclosure and pointer dispatch - DONE 2026-09-21

Files: modify the six router `SKILL.md` files and the five largest specialist skills; modify `accessibility-lead/references/dispatch-matrix.md`; rewrite `scripts/validate-orchestrator-dispatch.js` as part of `validate-skills.mjs`.

1. Split every `SKILL.md` over 6 KB. Routers keep role, the question gate, one line per phase, which reference to read per phase, output path, handoffs. Phase instructions say "Read references/phase-0-discovery.md now" so only the active phase is in context.
2. Replace every "Authoritative Sources" block with one pointer line to `a11y-core/references/sources.md`.
3. Fix the duplicated intro paragraph in accessibility-lead while splitting.
4. Rewrite every dispatch to the section 5.2 form. The validator fails on any `Read(".claude/specialists/...")`, any inline body paste, and any router that names a skill missing from the matrix.
5. Effort and model hints go in `metadata` (`effort: low` for inventory, csv and scan-config helpers; `medium` for checklist specialists; `high` for routers). Routers pass the hint through in the dispatch prompt where the client supports it; nothing depends on it.

Verify: no `SKILL.md` over 6 KB; `measure-context --dispatch` reports 300 tokens or less; a wizard run on `example/` shows specialists starting without the router's history.

### Phase 3: Structured findings and scripted reports - DONE 2026-09-21

Files: create `skills/a11y-core/schemas/findings.schema.json`, `scripts/render-report.mjs`, `scripts/merge-findings.mjs`, `scripts/test-findings-contract.mjs`, example findings under `skills/<name>/examples/`; modify every specialist `SKILL.md` ending; modify csv, statement and compliance skills to consume JSON; add MCP tool `render_accessibility_report`.

1. Every specialist ends with "Return only JSON matching the findings schema." `test-findings-contract.mjs` validates each skill's examples against the schema.
2. `render-report.mjs` merges, dedupes by rule plus location, scores with the formula in `docs/skills/web-severity-scoring`, computes delta against the embedded JSON block of a previous report, and renders all required sections. `--self-test` checks its own output against `report-requirements.md`.
3. Wizards write findings to `.a11y-history/<timestamp>/` and call the renderer through the shell or the MCP tool. Only the merged summary (about 500 tokens) returns to the wizard's context.

Verify: contract test passes; `render-report.mjs --self-test` passes; a wizard run on `example/` finishes with the wizard's own context under 40k tokens.

### Phase 4: Hooks - DONE 2026-09-21

Files: create `hooks/guard.mjs` and the four manifests; delete `.claude/hooks/`, `claude-code-plugin/hooks`, `claude-code-plugin/scripts/a11y-*.sh`, `codex-plugin/hooks`, `.gemini/.../hooks`, `.github/hooks/scripts`; create `.claude/settings.json` for repo development that references `hooks/claude.hooks.json`.

1. Port the marker logic from `codex-plugin/hooks/a11y-codex-dispatch-guard.mjs` (it already handles child session and parent thread ids) into `guard.mjs` with a client adapter per event-name set.
2. Inject the detect reminder once per session, not every prompt.
3. Mark on lead completion, not lead start.
4. Persist and restore across compaction on clients that expose the events.

Verify: the test matrix in `docs/hooks-guide.md` executed on Claude Code and Codex with `example/`: edit blocked before lead, allowed after, reminder appears once, compaction resumes with state.

### Phase 5: MCP server - DONE 2026-09-21

Files: modify `mcp-server/server-core.js`, `mcp-server/tools/*.js`, `mcp-server/package.json`; create root `mcp.json`.

1. Add `annotations` (`readOnlyHint: true` on the 29 scanners, `destructiveHint: true` on `prune_audit_history`, `idempotentHint` where true).
2. Add `outputSchema` to all 38 tools; scanners return findings in the section 5.3 shape.
3. Set `_meta["anthropic/maxResultSizeChars"]` on tools that return whole documents; cap every tool description at one sentence.
4. Upgrade the SDK and move to protocol 2026-07-28: stateless transport, `tools/list` with `ttlMs` and `cacheScope`, deterministic tool order.
5. Retire the SSE fallback and Roots, Sampling, Logging usage (deprecated in 2026-07-28).

Verify: conformance audit section 4 reads zero gaps; `mcp-server/server-core.test.js` passes; Claude Code, Codex and Copilot auto-approve a scanner call without a prompt.

### Phase 6: Cut over and remove legacy surfaces - DONE 2026-09-21

Files: delete every tree listed under "Removed after cutover" in section 5; rewrite `install.sh`, `install.ps1`, `scripts/installer-common.sh`, `scripts/Installer.Common.ps1`; modify `go-cli/` (health, repair, hooks commands) to know only the new layout; update `docs/`, `README.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, `UNINSTALL.md`.

1. Installer behaviour: prefer native plugin install (Claude marketplace, Copilot `copilot plugin install`, Codex `/plugins`); otherwise copy `skills/` to `~/.agents/skills` (read by Codex, Copilot, Gemini and Antigravity) and register the client's hook manifest. No harness-specific agent files are written anywhere.
2. VS Code extension: deprecate. VS Code installs Agent Plugins natively; the `@a11y` participant is replaced by `/accessibility-lead` and friends. Publish a final extension version whose only action is to point users at the plugin.
3. Gemini: drop the extension. Document `context.fileName: ["AGENTS.md"]` and `~/.agents/skills` for enterprise Gemini CLI and Antigravity.
4. Repo hygiene: move `RELEASE-*.md` to `docs/releases/`, delete the clutter listed in section 2.4, gitignore generated output.
5. Release 7.0.0 with before and after numbers from `measure-context` in `CHANGELOG.md`.

Verify: `scripts/release-readiness-check.mjs` passes; fresh installs on Windows and macOS for Claude Code, Codex and Copilot CLI; budgets in section 6 met.

---

## 8. Decisions needed before Phase 1

1. Router set. Recommendation: six (accessibility-lead, web-accessibility-wizard, document-accessibility-wizard, markdown-a11y-assistant, developer-hub, github-hub). `nexus` becomes an alias line in `AGENTS.md`, not a skill.
2. Canonical copy when the six drifted copies disagree. Recommendation: `.claude/` copies, with the drift report reviewed by hand for the twelve web-team skills and the three wizards.
3. Native subagent definitions. Recommendation: none. Tool restriction and model pinning per specialist are given up in exchange for zero harness-specific files; the dispatch prompt carries the two rules a specialist needs.
4. VS Code extension. Recommendation: deprecate in 7.0 as described in Phase 6.
5. Reports embedding the findings JSON block. Recommendation: yes; it is what makes delta tracking and regression detection cheap.

---

## 9. Risks

- Mechanical splitting will misplace some sections. Mitigation: the drift report plus hand review of the fifteen high-traffic skills before cutover.
- Specialists are invisible to the model on Claude Code and VS Code by design. Mitigation: the validator requires every specialist to be named in a router's dispatch matrix.
- Codex catalog cap. Sixty-six skills at 120 chars each is under 8,000 chars; `agents/openai.yaml` disables implicit invocation for specialists so the cap only matters for the six routers. Mitigation: `measure-context --client codex` fails CI if the catalog exceeds the cap.
- Loss of per-specialist tool restriction. Mitigation: the dispatch prompt says "report, do not edit" for reviewers; the edit gate still blocks UI writes until the lead completes.
- Hook event coverage differs per client (Copilot has no Stop or compaction events). Mitigation: the edit gate is the floor on every client; the table in section 5.5 is the documented contract.
- Users who customized generated harness trees lose those edits. Mitigation: the 6.0 extension manifests remain the supported customization path; 7.0 release notes say so.

---

## 10. Verification summary

Each check, with its command.

| Check | Command |
|---|---|
| Budgets | `node skills/a11y-core/scripts/measure-context.mjs --check budgets.json` |
| Skill spec, sizes, tiers, dispatch matrix, no shadow trees | `node scripts/validate-skills.mjs` |
| Skill spec reference validator | `skills-ref validate skills/*` |
| Findings contract | `node skills/a11y-core/scripts/test-findings-contract.mjs` |
| Report sections | `node skills/a11y-core/scripts/render-report.mjs --self-test` |
| Claude plugin | `claude plugin validate .` |
| MCP | `node --test mcp-server/server-core.test.js` |
| Release | `node scripts/release-readiness-check.mjs` |

---

## 11. Impact after the work

Written 2026-09-21, after phases 1 through 6 completed. Every number here is
reproducible with `npm run verify` and `npm run measure`; the evidence is in
`docs/MODERNIZATION-CONFORMANCE.md`.

### 11.1 What changed structurally

Each before, with its after.

| | Before | After |
|---|---|---|
| Source of truth | six hand-maintained trees, already drifted | one `skills/` directory |
| Agent format | five: Claude markdown, Copilot agent files, Codex TOML, Gemini skills, plugin copies | one: Agent Skills, the open standard |
| Instruction files | `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `copilot-instructions.md`, ten path-scoped files | `AGENTS.md`, imported by `CLAUDE.md` |
| Hook scripts | four, in three languages, with different marker logic | one `guard.mjs`, four thin manifests |
| Installers | 215 KB of shell and PowerShell covering six layouts | 8 KB of JavaScript covering one |
| Validation | 29 scripts and workflows, several scanning nothing | 11 gates, one workflow, one command |
| Reports | typed by the model from a 400-line template | rendered from findings JSON by a script |

### 11.2 Token and context impact

The thing this was for. Always-on cost is what the package charges before the
user has said anything.

| Client | Before | After | Reduction |
|---|---:|---:|---:|
| Claude Code | 15,924 | 1,136 | 93% |
| Codex | 15,074 | 2,417 | 84% |
| Copilot | 17,347 | 1,136 | 93% |
| Gemini and Antigravity | 12,848 | 1,136 | 91% |

Three other costs fell with it:

- **Dispatching a specialist** went from 26,929 tokens to 100. A router used to
  read a specialist's body into its own context and paste it into the prompt,
  paying for it twice; it now sends the skill's name.
- **Hook injection** went from roughly 570 tokens on every prompt to 87 tokens
  once per session. On a forty-turn session that alone is about 22,000 tokens.
- **Writing a report** went from roughly 15,000 output tokens for a sixty-finding
  audit to zero, because a script renders it from JSON.

A ten-specialist audit that previously spent around 320,000 tokens on
coordination before any analysis now spends under 5,000.

### 11.3 Per-client impact

**Claude Code.** Six skills in the picker instead of eighty agents. The other
102 are reachable by name and cost nothing until one is dispatched. `CLAUDE.md`
is one line importing `AGENTS.md`. Hooks come from one manifest, and the edit
gate now opens on the lead's completion rather than its launch, which closes the
gap where a cancelled review unlocked every edit for the rest of the session.

**Codex.** The skill catalog is 5,995 characters against the 8,000 cap, so
descriptions are no longer silently shortened under pressure and routing stays
reliable. An `agents/openai.yaml` in each non-router skill turns off implicit
invocation, so the model sees six choices rather than 108. The child-session and
parent-thread identifier mismatch that made valid reviews invisible to the edit
gate is fixed in the shared guard.

**Copilot.** One `AGENTS.md` instead of a 6,700-token instructions file plus 85
agent descriptions. The ten path-scoped instruction files survive as
`kb-path-instructions`, one reference each, opened only when working on a
matching file. Copilot exposes no stop or compaction event, so the edit gate is
the enforcement point there; that limit is documented rather than papered over.

**Gemini and Antigravity.** The extension is gone, along with the 70 byte-order
marks and 64 non-slug names it had accumulated unchecked. Both read
`~/.agents/skills` and `AGENTS.md` natively.

**VS Code.** The extension is deprecated rather than deleted. VS Code installs
Agent Plugins natively, so the chat participant is replaced by the skills
themselves appearing in the slash menu with nothing in between.

### 11.4 New capabilities

Things the package could not do before.

- **Findings are structured.** Every scanning skill returns JSON against one
  schema. Reports, CSV exports, conformance statements and VPATs are rendered
  from it, and a malformed finding is rejected before it reaches a compliance
  document.
- **Criteria are validated.** A finding citing a WCAG criterion that does not
  exist, or claiming the wrong conformance level, now fails a test. The
  obsoleted 4.1.1 Parsing is caught specifically.
- **Delta tracking is free.** Each report embeds its merged findings, so the
  next run reports fixed, new, persistent and regressed without re-parsing prose.
- **Repeated defects are grouped.** A defect appearing in forty places under one
  component is reported as one job, not forty findings.
- **Scanners can be auto-approved.** Twenty-nine read-only tools say so, so a
  bulk scan of forty documents no longer asks the user forty times.
- **Results are machine-readable.** All 39 tools declare an output schema, so
  they work from a script rather than only from a conversation.
- **Audits survive compaction.** The guard saves review state before compaction
  and restores it after, so a wizard does not restart and ask the same questions
  twice.
- **Cost is measured and budgeted.** `npm run measure` reports what the package
  costs per client, and continuous integration fails when it regresses.

### 11.5 User experience impact

What a person actually notices.

- **Choosing is easier.** Six named entry points rather than eighty agents whose
  descriptions blur together. Someone who does not know which they want gets
  routed by describing the problem.
- **Reports are complete and comparable.** Every report carries all seven
  required sections because a script writes them, not because the model
  remembered. Two runs compare because both embed their data.
- **Fewer interruptions.** Read-only scans no longer prompt for approval, and
  the reminder appears once per session rather than on every turn.
- **Refusals are actionable.** The edit gate says what to run next in forty
  words rather than restating the policy.
- **Output is readable aloud.** No emoji, no decorative Unicode, no bare URLs
  read out character by character. The package passes the markdown accessibility
  standard it enforces on everyone else.
- **One install.** `npm install` then `node scripts/install.mjs` covers every
  client, detects which are present, and refuses to overwrite a hooks file or a
  skill the user has edited.

### 11.6 Risks accepted, stated plainly

- **Specialists are invisible to the model by design.** If a router's dispatch
  matrix omits one, nothing can reach it. The validator fails when a specialist
  is named by no router, which is the mitigation.
- **Two frontmatter fields sit outside the specification.** Documented in
  section 2 of the conformance dossier, checked explicitly, and reversible with
  one flag if the specification adopts an alternative.
- **Per-specialist tool restriction is gone.** The old agent formats could
  restrict tools per agent; the Agent Skills standard does not. The dispatch
  prompt carries "report, do not edit", and the edit gate still blocks writes to
  user-facing files until the lead completes.
- **Hook coverage differs by client.** Copilot has no stop or compaction event.
  The edit gate is the floor everywhere; the per-client table is in the
  conformance dossier.
- **Users who customised a per-client tree lose those edits.** Everything
  removed is in git history, and `build/drift-report.md` lists what differed
  between the six copies.

### 11.7 Open items, closed

Both items listed here when section 11 was written have been resolved.

**Table descriptions.** 1,028 warnings became zero. Three things caused them:

- 228 were in the editor's local history directory, a gitignored private record
  of the user's keystrokes that the linter should never have scanned. Every one
  was a duplicate of a file already checked at its real path.
- 939 were the linter's own fault. Its table rule checked only the line
  immediately above a table, so the only way to satisfy it was to delete the
  blank line between the description and the table, which GitHub does not render
  as a table at all. Fixing the rule cleared them without editing a document.
- 707 were real. `scripts/describe-tables.mjs` wrote a sentence for each,
  derived from the table's own column headers rather than from a template bank,
  so each one says what a row is and what is recorded about it. Two of the six
  hundred read badly enough to write by hand.

Alongside them, 24 headings carrying emoji were cleaned, keeping the meaning as
a word where the emoji carried status, and 63 malformed code fences were
repaired: several documents closed a block with \`\`\`text, which opens a new
block rather than closing the old one, so everything after it was read as code.

The repository now reports no markdown accessibility issues across 509 files.

**Live client checks.** `npm run verify:live` is now a gate. It loads the
package into a real Claude Code session and measures two things the file-based
checks cannot:

| Measurement | Result |
|---|---|
| Model-facing skill listing, without this package | 38 skills, 11,664 characters |
| Model-facing skill listing, with it | 44 skills, 12,674 characters |
| This package's contribution to the model's context | 6 skills, 1,010 characters |
| User-invocable skills reachable by name | 63 of 63 |
| Helpers and reference skills kept out of the menu | 45 |

Exactly the six routers reach the model and the other 102 do not, measured in a
running client rather than inferred from frontmatter. An earlier version of this
check asked the session to describe its own skills; that answer depended on the
model and on whatever hooks replied first, so it was replaced by reading the two
numbers the client emits itself.

The run also surfaced something worth knowing for anyone installing this: the
test environment was already over Claude Code's 8,000-character skill budget
before this package loaded, at 38 skills and 11,664 characters. A package that
added 63 descriptions to that would have pushed every skill's description into
truncation. Adding six costs 1,010 characters.
