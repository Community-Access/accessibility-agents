# Modernization conformance

What this package conforms to, which clause of which specification says so, the
tool that proves it, and what a failure would cost a person.

Run everything here with one command:

```bash
npm install
npm run verify
```

Last full run: 2026-09-21. All 15 gates pass, including live sessions on Claude Code, Codex and Copilot.

---

## 1. The standards

Each row names the specification, the part of the package it governs, and the
tool that checks conformance rather than asserting it.

| Standard | Governs | Checked by |
|---|---|---|
| [Agent Skills](https://agentskills.io/specification) | every file under `skills/` | `skills-ref`, the specification authors' own validator, via `npm run verify:spec` |
| [AGENTS.md](https://agents.md/) | the always-on instruction file | size and content asserted by `validate-skills.mjs` |
| [Agent Plugins 1.0](https://agent-plugins.org/) | `plugin.json` | `claude plugin validate .` and `check-release-consistency.js` |
| [Model Context Protocol](https://modelcontextprotocol.io/specification/latest) | the 39 tools in `mcp-server/` | `mcp-conformance.test.js`, which connects a real client over stdio |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | every criterion a finding cites | `test-findings-contract.mjs` against `wcag22-criteria.json` |
| [JSON Schema 2020-12](https://json-schema.org/draft/2020-12/schema) | `findings.schema.json` | `test-findings-contract.mjs` |

### Client documentation this package is built against

- Claude Code skills and hooks: <https://code.claude.com/docs/en/skills>
- Codex skills, plugins, subagents and hooks: <https://learn.chatgpt.com/docs/build-skills>
- Copilot custom agents, skills and hooks: <https://docs.github.com/en/copilot/concepts/agents/about-agent-skills>
- VS Code agent skills: <https://code.visualstudio.com/docs/copilot/customization/agent-skills>
- Gemini CLI skills and hooks: <https://geminicli.com/docs/cli/skills/>

---

## 2. The one deviation, stated plainly

The Agent Skills specification allows six frontmatter fields: `name`,
`description`, `license`, `compatibility`, `metadata` and `allowed-tools`. Its
reference validator rejects anything else.

This package sets two fields the specification does not define:

| Field | What it does | Who reads it |
|---|---|---|
| `disable-model-invocation` | keeps a skill out of the model's catalog | Claude Code, VS Code |
| `user-invocable` | keeps a skill out of the user's slash menu | Claude Code, VS Code |

**Why they stay.** They are the entire mechanism by which 102 of this package's
108 skills cost nothing until a router names one. Removing them would put every
specialist description back into every client's context on every turn, which is
the cost this modernization exists to remove. Clients that do not know these
fields ignore them, which is what the specification requires of unknown keys.

`verify-spec.mjs` is explicit about this rather than silent: a skill whose only
unexpected fields are those two passes with the extension recorded; any other
unexpected field fails. Run it with `--strict` to see the package judged without
the exemption.

```text
skills checked          108
conformant              108
using documented ext    101 (disable-model-invocation, user-invocable)
failures                0
```

---

## 3. The gates

Fifteen gates. Each says what it proves in terms of what breaks without it.

| Gate | Standard | What a failure would cost |
|---|---|---|
| Agent Skills specification | agentskills.io | A skill unreadable by a conforming client |
| Package rules | tiers, catalog budget, dispatch contract | An unreachable specialist, or a router paying for a body twice |
| Frontmatter conformance | slug names, no byte-order marks | A skill that silently loses its name and cannot be routed to |
| Context budgets | `budgets.json` | The package costing more than it claims, unnoticed |
| Findings contract | `findings.schema.json` | A malformed finding reaching a compliance document |
| Report renderer | the seven required sections | An audit report missing the section an auditor needs |
| Enforcement gate | `hooks/guard.mjs` | An unreviewed edit to a user's interface |
| MCP server | Model Context Protocol | An approval prompt per document during a bulk scan |
| Markdown accessibility | this project's own rules | The project failing the standard it enforces on others |
| Markdown linter | unit tests for the linter | A rule that demands markdown which does not render |
| Version consistency | one version per release | A user unable to tell which build they are running |
| Dispatch matrices | generated from skill frontmatter | A new specialist that no router can reach |
| Generated documentation | reference pages derived from source | A catalog that lists skills which no longer exist |
| Dependency advisories | the npm advisory database | Shipping a known-vulnerable dependency to every user |
| Live client session | what Claude Code, Codex and Copilot actually load | The whole cost reduction resting on a field a client might ignore |

### Reproducing any one of them

```bash
npm run verify:spec         # Agent Skills specification
npm run verify:skills       # package rules
npm run verify:conformance  # frontmatter
npm run verify:budgets      # context budgets
npm run verify:findings     # findings contract, including WCAG criteria
npm run verify:report       # report renderer self-test
npm run verify:mcp          # MCP server, 71 tests
npm run verify:markdown     # markdown accessibility
npm run verify:scanner      # the linter's own tests
npm run verify:release      # version consistency
npm run verify:deps         # dependency advisories
npm run verify:live         # a real Claude Code session
node --test hooks/guard.test.mjs
```

---

## 4. Measured results

### Always-on context cost, per client

What the package costs before the user has said anything. Measured by
`skills/a11y-core/scripts/measure-context.mjs`, which reports the same number
CI checks against `budgets.json`.

| Client | Before | After | Reduction |
|---|---:|---:|---:|
| Claude Code | 15,924 | 1,136 | 93% |
| Codex | 15,074 | 2,417 | 84% |
| Copilot | 17,347 | 1,136 | 93% |
| Gemini and Antigravity | 12,848 | 1,136 | 91% |

Codex is higher because it lists user-invocable skills in its catalog, which the
other clients do not. Sixty-three entries at roughly ninety-five characters is
the floor for that client, not slack.

### Dispatch cost

What a router pays to send one specialist to work.

| | Before | After |
|---|---:|---:|
| Worst case, tokens | 26,929 | 100 |

Before, a router read a specialist's body into its own context and pasted it
into the prompt, paying for it twice. Now it sends the skill's name.

### The package

Each measure, with its value.

| Measure | Value |
|---|---:|
| Skills | 108 |
| Model-invocable | 6 |
| Largest dispatchable body | 6,131 bytes |
| Skill catalog | 5,995 of 8,000 characters, the Codex cap |
| Hook injection, per session | 87 tokens, once |

The hook previously injected roughly 570 tokens on every prompt. Over a
forty-turn session that was 22,000 tokens repeating something the model read
the first time.

### Duplication removed

Each before, with its after.

| | Before | After |
|---|---:|---:|
| Copies of each agent | 6 | 1 |
| Files in per-client trees | 843 | 0 |
| Validation scripts and workflows | 29 | 11 gates in 1 workflow |
| Installer size | 215 KB of shell and PowerShell | 8 KB of JavaScript |

---

## 5. The MCP tool surface

Verified by connecting a real client over stdio, not by reading the source.

```text
tools                 39
deterministic order   true
annotations           39 (readOnlyHint 29, destructiveHint 4)
outputSchema          39
descriptions > 200ch  0
```

**Why annotations matter.** Twenty-nine of these tools only read. A client that
cannot tell a scan from a mutation has to ask the user before every call, which
on a server built for bulk scanning is the difference between scanning forty
documents and giving up after six.

**Why output schemas matter.** They let a client parse a result rather than
pattern-match prose, which is what makes these tools usable from a script
instead of only from a conversation.

`mcp-conformance.test.js` asserts that read-only tools are marked read-only,
that writing tools are not, that the one tool which deletes data says so, that
tools reaching the network declare it, and that the listing order is stable
between calls, because an unstable order breaks prompt caching for every client
on every turn.

Reproduce: `npm run probe:mcp`

---

## 6. Defects found and fixed during the work

Every one of these was found by a tool, not by reading. They are listed because
a modernization that found nothing was not looking.

| Defect | Found by | Count |
|---|---|---:|
| Duplicated paragraphs and sections from copy drift | migration dedupe | 21 agents |
| Multiple H1 headings in skill bodies | `validate-skills.mjs` heading check | 16 |
| Bare URLs where a link was meant | markdown accessibility linter | 279 |
| Links resolving to nothing from either old or new location | `validate-skills.mjs` link check | 53 |
| Unquoted YAML descriptions containing a colon | `skills-ref`, the specification's validator | 2 |
| Reference files one directory level short in their links | `validate-skills.mjs` | 1 class, all references |
| Glow tools marked local when they call a service | `mcp-conformance.test.js` | 2 |
| MCP server advertising a version two releases stale | `probe-tools.mjs` | 1, in 3 places |
| Build output gated as if it were a user interface | `guard.test.mjs` | 1 class |
| A linter rule demanding markdown that does not render | markdown linter tests | 1, worth 939 false warnings |

### The linter rule, in detail

`md-table-desc` checked only the line immediately above a table, so the only way
to satisfy it was to delete the blank line between the description and the
table. GitHub Flavored Markdown does not recognise a table that interrupts a
paragraph, so that markdown would not have rendered as a table at all. The rule
now looks back past blank lines. This cut the repository-wide count from 2,251
to 1,312 without touching a single document, and two unit tests hold the
behaviour in place.

---

## 7. Verified in a running client

Every other gate reads files. This one loads the package into a real Claude Code
session and measures what the client does with it.

| Measurement | Result |
|---|---|
| Model-facing skill listing, without this package | 38 skills, 11,664 characters |
| Model-facing skill listing, with it | 44 skills, 12,674 characters |
| This package's contribution to the model's context | 6 skills, 1,010 characters |
| User-invocable skills reachable by name | 63 of 63 |
| Helpers and reference skills kept out of the menu | 45 |

The difference between the two listings is the claim: exactly the six routers
reach the model, measured rather than inferred. Without this, the entire cost
reduction would rest on a frontmatter field the client might be ignoring.

The second row of the table matters for anyone installing this. The test
environment was already over Claude Code's 8,000-character skill budget before
the package loaded. A package that added 63 descriptions there would have pushed
every skill into truncated descriptions. Six costs 1,010 characters.

Reproduce: `npm run verify:live`

---

## 8. Nothing known is left open

The two items this document previously listed as open are closed.

**Markdown accessibility** reports zero issues across 509 files. Getting there
found three separate causes, only one of which was the documents:

| Cause | Count | Resolution |
|---|---:|---|
| The linter scanned the editor's local history | 228 | Excluded; every one duplicated a file checked at its real path |
| The table rule demanded markdown that does not render | 939 | Rule corrected to look past the blank line GitHub requires |
| Tables genuinely lacking a description | 707 | A sentence written for each from its own column headers |

Alongside them, 24 emoji headings were cleaned and 63 malformed code fences
repaired, where \`\`\`text was used to close a block and instead opened a new one,
so everything after it read as code.

**Live client checks** are now the twelfth gate, described in section 7.

What remains is deliberate rather than unfinished: `vscode-extension/` is kept
and marked deprecated so a final version can point existing users at the
package, and `build/drift-report.md` records what differed between the six
legacy copies, for review while that git history is still close at hand.

---

## 9. Reproducing the numbers in this document

```bash
npm install                                    # the validation toolchain
npm run verify                                 # all 11 gates
npm run measure                                # context cost per client
npm run measure:dispatch                       # router dispatch cost
npm run probe:mcp                              # the MCP tool surface
npm run verify:live                            # a real Claude Code session
node scripts/verify.mjs --json                 # machine-readable gate report
```

Historical measurements are committed so the comparison is checkable rather
than remembered:

- `docs/context-baseline-2026-09.json` before any change
- `docs/context-after-phase-1.json` after the migration to skills
- `docs/context-after-phase-6.json` after the legacy trees were removed
