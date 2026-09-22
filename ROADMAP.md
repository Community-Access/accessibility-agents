# Roadmap

Where the package goes from 7.0. Each item says what it would change for a
person using the package, what it costs, and how we would know it worked. The
record of how 7.0 came to be is in
[docs/history/2026-09-modernization.md](docs/history/2026-09-modernization.md);
this file is only about what is next.

Current: 7.0.0. Every gate passes, including live sessions on Claude Code, Codex
and Copilot. The package costs about 1,100 tokens before a user has spoken, on
every client, and dispatching a specialist costs about 100.

---

## 1. Review of 7.0, with the reservations stated

Approved as an architecture. The reasons, and what was found on the way, are
in the [conformance dossier](docs/standards/conformance.md). Three things
about it should be said plainly.

**The content is where the quality ceiling now sits.** The 57 specialist
bodies were split mechanically: the first 6 KiB that fit stayed in `SKILL.md`,
the rest went to `references/` under slugified headings. Every one validates.
Not every one reads the way a hand-authored router does. The routers got a
semantic pass; the specialists have not, and that is the largest remaining
quality gap.

**Two of the three cross-client claims rest on live measurement; the other
two do not.** Claude Code, Codex and Copilot were verified in real sessions.
Gemini CLI and Antigravity were not, because neither is installed here. Their
behaviour is inferred from documentation, which is weaker evidence.

**The findings pipeline has now seen one real audit, and it found something.**
Merge, score, delta and render worked first time on nine parallel specialists,
but the merge was deduplicating nothing because specialists do not share rule
identifiers. Fixed, and recorded in
[docs/history/2026-09-first-real-audit.md](docs/history/2026-09-first-real-audit.md).
The audit was a fixture with planted defects; a real site will find more.

---

## 2. Next, in order

### 2.1 Run one real audit end to end - DONE 2026-09-21

Nine specialists against the `example/` fixture, in parallel, through the whole
pipeline: dispatch, schema validation, merge, score, render, delta. Recall was
49 of 49 planted defects.

It found the defect it was meant to find. The merge keyed on rule identifier
plus location, and specialists do not share rule namespaces, so 141 findings
deduplicated to 141: one div used as a button was reported eight times and the
report told the reader to fix it eight times. `collapseSameDefect` now compares
co-located findings on content, bringing that run to 103 findings with 27
clusters merged, and eight tests hold the behaviour.

The full record, including the two defects in the grader itself, is in
[docs/history/2026-09-first-real-audit.md](docs/history/2026-09-first-real-audit.md).

### 2.1a Audit something nobody planted

A fixture's defects are the ones its author thought of. Run the wizard against
a real site or application, ideally one this project did not write, and record
what the specialists miss when the defects are behind interaction, inside
framework output, or only present in a signed-in state.

Costs a day. Proven by a committed run and a note saying what was missed.

### 2.2 A semantic pass over the specialists

For each of the 57: decide what belongs in the core body and what is
reference, name the references for what they hold, and rewrite the core as a
checklist a reviewer would actually follow. Start with the twelve web-team
skills the lead dispatches most.

Costs about two hours per skill for the web team, less for the rest. Proven
by the same validators, plus a reviewer reading each core body in under two
minutes and knowing what the skill checks.

### 2.3 Live gates for Gemini CLI and Antigravity

Install one, extend `scripts/verify-live.mjs` with a probe, and stop inferring.
If the Antigravity CLI exposes something like Codex's prompt-input debug
command, use that; otherwise read the session log the way the Copilot probe
does.

Costs half a day once a client is available. Proven when `npm run verify:live`
reports five clients.

### 2.4 Structured outputs from the client, not the prompt

Today a specialist is asked to return JSON and the merger validates what comes
back. Claude Code's Agent tool, Codex's `--output-schema` and Copilot's
`--output-format` can enforce a schema at the boundary. Use them where they
exist, so a malformed finding is rejected by the client before it reaches the
merger. The prompt still carries the request, as a fallback.

Costs a day. Proven by the findings contract test running against a live
dispatch on each client, not only against example files.

### 2.5 The Workflow tool for parallel audits on Claude Code

The web wizard dispatches eight specialists in parallel through the Agent tool
and merges in its own context. Claude Code's Workflow tool runs that fan-out
in a script, with a schema per agent, and only the merged result enters the
wizard's context. The wizard already has the shape for it; add
`skills/web-accessibility-wizard/workflow.js` and use it when available.

Costs a day. Proven by a full audit finishing with the wizard's own context
under 20,000 tokens, read from `/context`.

### 2.6 Compaction-aware audits on every client

The guard persists review state across compaction on Claude Code, Codex and
Gemini. Extend it to persist the audit phase and findings path too, so a wizard
resumes at the phase it reached rather than the phase it remembers.

Costs half a day. Proven by a test that compacts mid-audit and checks the
next turn does not repeat Phase 0.

---

## 3. Further out

### 3.1 Replace the token estimator

Everything is measured at four characters per token. It is consistent and it
is not exact. Add a real tokenizer behind `estimateTokens()` in
`measure-context.mjs`, keep chars-per-four as the fallback, and re-baseline.
Every number in the dossier gets a second decimal.

### 3.2 MCP 2026-07-28 transport

The server already keeps a deterministic tool order and uses nothing the new
revision deprecates. Adopt the stateless transport and return `ttlMs` and
`cacheScope` from `tools/list`, so clients cache the listing across sessions.
Nothing about the tool surface changes.

### 3.3 One skill per finding rule

The findings schema has a `rule` field. There is no registry of rules: each
specialist invents its own identifiers. A committed rule registry, keyed by
identifier with criterion, severity default and help URL, would let the
renderer link every finding to guidance and let the regression detector
compare across releases without string matching.

### 3.4 Retire the VS Code extension

It is deprecated, not deleted, so a final version can point existing users at
the package. Publish that version, then delete the directory.

### 3.5 Rule registry as a reference skill

Once 3.3 exists, ship it as `kb-rules` so a skill can cite a rule by identifier
and a reader can look one up without leaving the package.

---

## 4. Things we will not do, and why

**Restore per-specialist tool restriction.** The Agent Skills standard has no
field for it, and adding native subagent definitions per client is exactly the
six-copy problem again. The dispatch prompt says "report, do not edit" and the
gate refuses writes until the lead completes. That is the trade.

**Drop the two non-standard frontmatter fields.** They are what keep 102
skills out of every catalog. If the specification adopts an equivalent, one
flag in `verify-spec.mjs` switches the check.

**Hand-maintain any list of skills.** The dispatch matrices, the catalog and
the MCP tools reference are generated, and CI fails when they drift. A list
someone has to remember to update is a list that will be wrong.

**Generate prose that should be authored.** The 707 table descriptions were
generated because they are structural. Router bodies were written by hand
because they are not. The specialists in 2.2 get the same treatment.

---

## 5. How to propose something

Open an issue that says what changes for a person, what it costs, and how we
would know it worked. Those are the three columns every item above has, and
an item without them does not go on this list.
