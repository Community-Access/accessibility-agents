# Migration scripts, 2026-09

The one-shot scripts that turned six per-client agent trees into one `skills/`
package. They ran once, on 2026-09-21, and are kept for provenance: together
they document exactly how every file in `skills/` was derived from what came
before, and what was decided along the way.

None of them should be run again. `skills/` has been the source of truth since
Phase 2, and the routers are hand-authored; the migration would overwrite that
work rather than reproduce it. The first script refuses to run against an
existing `skills/` without `--force` for that reason.

| Script | What it did | Ran |
|---|---|---|
| `migrate-agents-to-skills.mjs` | Split 80 agents into spec-conformant skills, moved shared source lists, collapsed 21 duplicated blocks, generated dispatch blocks, wrote the drift report | Phase 1 |
| `agent-catalog.json` | The hand-authored tier, domain and description for every agent; the migration's input. Superseded by each skill's own frontmatter | Phase 1 |
| `phase2-restructure.mjs` | Relocated phase content out of router bodies and named reference files for what they hold, so the routers could be rewritten by hand | Phase 2 |
| `phase6-cutover.mjs` | Preserved non-agent content, then removed the six legacy trees: 843 files | Phase 6 |
| `phase6-retire-tooling.mjs` | Removed 21 scripts and eight workflows whose subject no longer existed | Phase 6 |

The plan they implemented, with the measured results, is
[docs/history/2026-09-modernization.md](../../docs/history/2026-09-modernization.md).
What differed between the six copies before they were removed is
[docs/history/2026-09-legacy-drift-report.md](../../docs/history/2026-09-legacy-drift-report.md).
