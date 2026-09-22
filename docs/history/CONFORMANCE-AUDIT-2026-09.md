# Conformance audit, September 2026

> **Historical.** This document describes the repository as it was before
> version 7.0, when agents lived in six per-client directories. It is kept
> for the record and is not maintained. The current layout is one `skills/`
> directory; start at [the documentation index](../README.md).
> Original path: `docs/CONFORMANCE-AUDIT-2026-09.md`.

**Audited:** 21 September 2026
**Steps 1-5 applied:** 21 September 2026. All 152 violations cleared;
`node scripts/check-skill-conformance.mjs` now exits 0.
**Scope:** skill and agent frontmatter across all platform trees, and the MCP
server's conformance with the current protocol surface.
**Method:** `node scripts/check-skill-conformance.mjs`, plus manual inspection
of `mcp-server/`. Every number below is reproducible from that command.

---

## 1. Summary

152 frontmatter violations, concentrated almost entirely in one tree, plus two
MCP gaps that cost real usability.

| Tree | Files | BOM | No frontmatter | Non-slug name |
|---|---:|---:|---:|---:|
| `.gemini/extensions/a11y-agents/skills` | 101 | **70** | **3** | **64** |
| `codex-skills` | 80 | 0 | 0 | **7** |
| `claude-code-plugin/agents` | 80 | 0 | 0 | **7** |
| `.claude/agents` | 7 | 0 | 0 | **1** |
| `codex-plugin/skills` | 5 | 0 | 0 | 0 |
| `.github/skills` | 26 | 0 | 0 | 0 |

By rule: 79 non-slug names, 70 byte-order marks, 3 files with no frontmatter.

**None of this is new drift.** It has been there long enough to be invisible,
and the reason is in section 2.

---

## 2. Root cause: a blind spot, not a missing rule

`scripts/validate-agents.js` already has the correct rule. Line 645:

```js
if (frontmatter.name && frontmatter.name !== folderName) {
  errors.push(`${relativePath}: Skill name '${frontmatter.name}' must match folder name '${folderName}' per agentskills.io spec`);
}
```

The rule is right. The problem is **where it looks**. `validate-agents.yml`
and the validator itself scan four trees:

- `.github/agents`
- `.github/skills`
- `.claude/agents`
- `claude-code-plugin/agents`

The Gemini extension and `codex-skills/` are not in that list, and never have
been. Both trees have therefore never been validated by anything, on a
repository that validates its other trees on every pull request.

That explains the distribution exactly: the two unscanned trees hold 144 of
the 152 violations, and the two well-scanned skill trees hold zero.

---

## 3. The three failure modes

### 3.1 Byte-order marks (70 files, Gemini only)

70 of 101 Gemini `SKILL.md` files begin with a UTF-8 BOM (`U+FEFF`) before the
`---` delimiter.

This is not cosmetic. A strict YAML frontmatter parser looks for `---` at
byte zero; with a BOM in front of it, **the frontmatter block is not
recognised at all**, and the skill loses its name and description silently.
Nothing errors. The skill simply does not describe itself.

It is also the failure mode most likely to have been introduced by tooling
rather than by hand - PowerShell's `Out-File` and `Set-Content` write a BOM by
default on Windows, which matches a repository with `.ps1` installers and
generators.

Fix: `node scripts/check-skill-conformance.mjs --fix-bom`. It strips the mark
and leaves everything else untouched.

### 3.2 Non-slug names (79 files)

The Agent Skills frontmatter spec requires `name` to be lowercase letters,
digits and hyphens. 79 files declare Title Case names while sitting in
correctly-slugged folders:

| Declared | Folder |
|---|---|
| `Accessibility Lead` | `accessibility-lead` |
| `Alt Text & Headings` | `alt-text-headings` |
| `ARIA Specialist` | `aria-specialist` |
| `ePub Accessibility` | `epub-accessibility` |
| `i18n Accessibility` | `i18n-accessibility` |
| `PowerPoint Accessibility` | `powerpoint-accessibility` |

The folder name is already correct in every case, so the fix is mechanical:
set `name` to the folder name. The human-readable title belongs in
`description`, or in the body's `#` heading, where it already is.

Seven of these are the same agents mirrored across `claude-code-plugin/agents`
and `codex-skills`, so one decision fixes both:

`a11y-tool-builder`, `desktop-a11y-specialist`, `desktop-a11y-testing-coach`,
`developer-hub`, `nvda-addon-specialist`, `python-specialist`,
`wxpython-specialist`.

`.claude/agents/developer-hub.md` is the eighth, and the same fix.

### 3.3 No frontmatter at all (3 files)

Three Gemini skills have no frontmatter block:

- `.gemini/extensions/a11y-agents/skills/nvda-addon-specialist/SKILL.md`
- `.gemini/extensions/a11y-agents/skills/playwright-testing/SKILL.md`
- `.gemini/extensions/a11y-agents/skills/wxpython-specialist/SKILL.md`

These are not skills as far as any conformant loader is concerned. They need a
`name` and a `description` added, copied from their counterparts in the other
trees.

---

## 4. MCP server

### 4.1 What is already right

- **`server.registerTool` throughout** - all 38 tools, the current API rather
  than the deprecated `server.tool()`.
- **Both transports** - Streamable HTTP (`server.js`) and stdio (`stdio.js`),
  sharing tool implementations through `server-core.js`. Streamable HTTP is
  the current remote transport; nothing here is on the retired SSE-only path.
- **A bundle manifest template** is present (`mcpb-manifest.template.json`).

### 4.2 Gap: no tool annotations (38 of 38)

Not one tool declares annotations. No `readOnlyHint`, no `destructiveHint`, no
`idempotentHint`, anywhere.

This is the highest-value fix in this document, and it is not about
conformance for its own sake. **29 of the 38 tools are read-only scanners.**
A client that cannot tell a scan from a mutation has to prompt the user for
every single call. Marking the scanners `readOnlyHint: true` lets clients
auto-approve them, which is the difference between scanning forty documents
and giving up after six - on a server whose entire purpose is bulk scanning.

Read-only (29): `batch_scan_documents`, `check_apca_contrast`,
`check_audit_cache`, `check_color_blindness`, `check_contrast`,
`check_form_labels`, `check_heading_structure`, `check_link_text`,
`check_reading_level`, `check_verapdf_installation`,
`extract_document_metadata`, `get_accessibility_guidelines`,
`get_audit_result`, `get_audit_trend`, `glow_audit_document`,
`glow_generate_report`, `glow_health_check`, `list_audit_history`,
`run_axe_scan`, `run_playwright_a11y_tree`, `run_playwright_contrast_scan`,
`run_playwright_keyboard_scan`, `run_playwright_viewport_scan`,
`run_verapdf_scan`, `scan_epub_document`, `scan_markdown_document`,
`scan_office_document`, `scan_pdf_document`, `validate_caption_file`.

Writes or creates (8): `convert_pdf_form_to_html`, `fix_document_headings`,
`fix_document_metadata`, `generate_accessibility_statement`,
`glow_convert_document`, `glow_fix_document`, `save_audit_result`,
`update_audit_cache`.

Destructive (1): `prune_audit_history`. This one should carry
`destructiveHint: true` explicitly, because it is the only tool here that
removes data and the only one where an accidental auto-approval would cost
something.

### 4.3 Gap: no structured output (38 of 38)

No tool declares an `outputSchema`. Every result is returned as text for the
model to re-parse. For scanners that already produce structured findings -
severity, WCAG reference, location - this throws away the structure on the way
out and asks the model to reconstruct it.

Worth doing for the scan and check families first; the rest can follow.

### 4.4 Stale GLOW base URL

`mcp-server/tools/glow-tools.js` defaults to `https://glow.bits-acb.org/mcp`.
GLOW now runs at `letitglow.app/mcp`. `mcp-server/README.md` repeats the old
host.

Every GLOW bridge tool - `glow_audit_document`, `glow_fix_document`,
`glow_convert_document`, `glow_generate_report`, `glow_health_check` - points
at a host that is not the service. Two lines, and it fails the first time
anybody tries it.

*Note: `glow-tools.js` is currently untracked in the working copy, so this
should be fixed by whoever is actively working on it rather than by a
drive-by edit.*

---

## 5. SDK: v1.30 now, v2 later

Currently on `@modelcontextprotocol/sdk` `^1.27.1`. The latest v1 is
**1.30.0** - a minor bump with no migration.

**v2 is a real change, and smaller than it sounds here.** The monolithic
`@modelcontextprotocol/sdk` package is replaced by `@modelcontextprotocol/server`
and `@modelcontextprotocol/client`. That is a genuine architecture split, but
this repository's import surface against the SDK is three symbols:

```js
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
```

Three imports across two entry points. Everything else in `mcp-server/` is
tool logic that never touches the SDK directly.

**Honest sizing:** the migration is a day, not a sprint - dominated by
re-testing 38 tools against both transports rather than by rewriting code. It
should be scheduled on its own merits and **should not be attempted in the
same change as the annotation work**, so that if something breaks it is
obvious which change broke it.

---

## 6. Relationship to the AHG workshop, November 2026

An earlier draft of this section said this work does not block the workshop
and belongs entirely on a separate track. That was too narrow. "Does not
block" and "should not be done first" are different claims, and conflating
them missed something real.

**This repository is part of the workshop's credibility surface.** The session
is named *Accessibility Agents in Action*. The take-home artifact points
attendees here. The follow-through design assumes someone curious enough to
look will find something that works. Right now, an attendee who installs the
Gemini extension after the session gets 70 skills that silently lose their
name and description to any strict frontmatter parser.

So the split is not by project. It is by one question: **would a conference
attendee ever encounter this?**

### Before AHG - steps 1 to 5. About two days, all mechanical

The stale GLOW URL, the BOM strip, the 79 name slugs, the three missing
frontmatter blocks, and folding both unscanned trees into
`validate-agents.js`.

Every one is attendee-visible: together they decide whether the extension
works for someone who installs it on Monday. They are also the lowest-risk
changes in this document - no logic, no judgment - and both the new checker
and the existing validator prove them.

Second benefit: the workshop's prompt-card derivation reads these same agent
definitions. Cleaning them first means that work starts from a tidy source.

### After AHG - steps 6 to 9

Tool annotations, `outputSchema`, SDK 1.30, the v2 migration. All valuable;
none of it reachable by anyone in the room. Annotations are the highest
user-value item in this audit and they should still wait, because "highest
value" and "highest value before November" are not the same question.

### The deadline condition

**Do steps 1 to 5 by mid-October, or defer the whole thing to December.**

Two days of mechanical work eight weeks out is free. The same two days in the
final fortnight competes directly with the workshop's timed dry run, and the
readiness plan's freeze rule says ship nothing new in the final week. If it
has not happened by mid-October, the answer changes to "after the conference"
and nothing is lost by saying so.

### What is actually at risk in November

Neither of these lists. The workshop's Phase 5 - load rehearsal at 30
participants, NVDA then JAWS then VoiceOver, the degraded-network run, the
timed facilitator dry run, freeze week - has had no progress since
21 August and is entirely outstanding. It cannot be compressed, because it
needs a room, a calendar and other people. Any scheduling decision here should
be made in that light rather than against this document's own merits.

---

## 7. Recommended order

### Done, 21 September 2026

Each row, with its #, work and result.

| # | Work | Result |
|---|---|---|
| 1 | Stale GLOW base URL | 6 references repointed at `letitglow.app` across `glow-tools.js` and `mcp-server/README.md` |
| 2 | Strip byte-order marks | 70 files |
| 3 | `name` to the folder slug | 79 files. Frontmatter only; body prose untouched |
| 3b | The three files with no frontmatter | Two had a usable paragraph promoted into frontmatter. `playwright-testing/SKILL.md` was **zero bytes** and was replaced from its `.github/skills` counterpart |
| 4 | Stop it recurring | `skill-conformance.yml` now runs on every pull request touching any of the six trees |

**Verification:** `check-skill-conformance.mjs` exits 0 across all 336 files;
`validate-agents.js --strict` still exits 0 on the trees it owns.

### The decision step 5 surfaced

Folding the two trees into `validate-agents.js` was tried and reverted, for a
specific reason worth recording.

It works - 0 errors. But the workflow runs the validator with `--strict`, and
`--strict` fails on **warnings**. Those two trees carry **154** warnings of one
kind: *"Description is N chars; agentskills.io spec recommends <200 chars."*
The spec's hard limit is 1024. 200 is advice.

So folding them in would turn CI red on a recommendation, and going green
would mean rewriting 154 descriptions - the exact text a model reads to decide
whether to invoke a skill. Those descriptions are long because they enumerate
invocation triggers, which is a reasonable thing for them to do.

That is a deliberate editorial decision, not a conformance cleanup, so it is
left to the maintainers. Until it is made, `skill-conformance.yml` gates the
two trees for byte-order marks, frontmatter presence and name slugs, which is
what produced 149 of the 152 violations.

**Open:** trim the 154 descriptions and fold the trees into the main
validator, or agree the 200-character figure is advisory here and leave the
split as it is.

### Remaining order

Each remaining order, with #, work, size and why this order.

| # | Work | Size | Why this order |
|---|---|---|---|
| 1 | Fix the stale GLOW base URL | 2 lines | Live breakage, independent of everything else |
| 2 | `--fix-bom` across the Gemini tree | minutes | Mechanical, no judgment, removes 70 violations |
| 3 | Set `name` to the folder slug in all 79 files | an afternoon | Mechanical; the folder name is already correct in every case |
| 4 | Add frontmatter to the 3 files that lack it | minutes | Copy from the counterpart in another tree |
| 5 | Add the two unscanned trees to `validate-agents.js` and retire this checker | small | **After** 2-4, or CI goes red on main |
| 6 | Tool annotations, read-only first | a day | Highest user-visible payoff in this document |
| 7 | `outputSchema` for the scan and check families | a few days | Do after annotations, separately |
| 8 | SDK 1.27 → 1.30 | trivial | Independent |
| 9 | SDK v2 migration | a day, mostly re-testing | Last, and alone |

Step 5 is the one that keeps this from happening again. Everything before it
is cleanup; without it, the same two trees drift again the moment someone adds
a skill.

Steps 1 to 5 are the pre-conference set (section 6). Steps 6 to 9 wait until
December.

---

## 8. Reproducing this audit

```bash
node scripts/check-skill-conformance.mjs           # the table in section 1
node scripts/check-skill-conformance.mjs --json    # every finding, with paths
node scripts/check-skill-conformance.mjs --fix-bom # step 2 above
```

Exit code is 0 when clean and 1 when anything is found, so it drops into CI as
is. A workflow is in `.github/workflows/skill-conformance.yml`.
