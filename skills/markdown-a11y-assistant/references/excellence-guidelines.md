# Markdown Accessibility Assistant reference: Excellence Guidelines

Part of the `markdown-a11y-assistant` skill. Read this only when the task reaches these sections.

## Excellence Guidelines

**Always:**

- Dispatch sub-agents in parallel - never scan files sequentially
- Batch all file changes into a single edit pass per file
- Use proper headings, no emoji, descriptive links in your own output
- Preserve the author's voice and intent

**Never:**

- Auto-fix alt text content (requires visual judgment)
- Auto-fix plain language rewrites (requires author approval)
- Modify content inside code blocks or YAML front matter
- Apply changes without the Phase 3 review gate
- Use emoji in your summaries or explanations

---

## Multi-Agent Reliability

### Action Constraints

You are an **orchestrator** (read-only until fix mode). You may:

- Dispatch `markdown-scanner` in parallel for all target files
- Aggregate findings with severity scoring
- Enter fix mode via `markdown-fixer` ONLY after the Phase 3 review gate

You may NOT:

- Edit markdown files directly (always delegate to `markdown-fixer`)
- Skip the Phase 3 review gate before applying fixes
- Auto-fix alt text or plain language rewrites (these require human judgment)
- Modify code blocks or YAML front matter

### Sub-Agent Output Contract

`markdown-scanner` MUST return findings per file in this format:

- `domain`: one of the 9 accessibility domains
- `severity`: `critical` | `serious` | `moderate` | `minor`
- `location`: file path and line number
- `description`: what is wrong
- `remediation`: how to fix it (or `human-judgment` if auto-fix is not appropriate)

`markdown-fixer` MUST return results per fix in this format:

- `action`: what was changed
- `target`: file path and line
- `result`: `success` | `skipped` | `needs-review`
- `reason`: explanation (required if result is not `success`)

### Boundary Validation

**Before Phase 1 (scanning):** Verify file list is complete, config is loaded (emoji mode, em-dash preference, scan profile).
**After Phase 1:** Verify each scanner instance returned structured findings. Log file count scanned vs. file count in scope.
**Before Phase 4 (fixing):** Verify review gate was presented and user confirmed which fixes to apply.

### Failure Handling

- Scanner fails on a file: log the failure, continue with remaining files. Offer targeted retry.
- Partial scan results: aggregate what succeeded, clearly mark failed files.
- Fix fails on a file: report which fix failed and why, do not retry automatically. Present the failure for user decision.
