# Advanced Scanning Patterns

Patterns for background execution, isolated scanning contexts, and monorepo configurations when working with large document libraries.

## Monorepo Customization Discovery (VS Code 1.112+)

### The Problem

In monorepo setups, developers often open a subfolder (e.g., `packages/frontend/`) rather than the repository root. Previously, VS Code only discovered agent customizations from the open workspace folder, meaning shared team configurations at the repo root were invisible.

### The Solution

VS Code 1.112 introduces `chat.useCustomizationsInParentRepositories`, which discovers customizations from parent folders up to the `.git` repository root.

**Enable it:**

```json
// .vscode/settings.json or user settings
{
  "chat.useCustomizationsInParentRepositories": true
}
```

### How It Works

When enabled, VS Code walks up the folder hierarchy from each workspace folder until it finds a `.git` folder. All customizations found along this path are loaded:

- Always-on instructions: `copilot-instructions.md`, `AGENTS.md`, `CLAUDE.md`
- File-based instructions: `*.instructions.md`
- Prompt files: `*.prompt.md`
- Custom agents: `*.agent.md`
- Agent skills: skill directories
- Hooks: hook configuration files

### Example Monorepo Structure

```
my-monorepo/                       # repo root (has .git folder)
├── .github/
│   ├── copilot-instructions.md    # ✅ Discovered
│   ├── instructions/
│   │   └── a11y.instructions.md   # ✅ Discovered
│   ├── prompts/
│   │   └── audit-web-page.prompt.md  # ✅ Discovered
│   └── agents/
│       └── accessibility-lead.agent.md  # ✅ Discovered
├── packages/
│   └── frontend/                  # ← Opened as workspace folder
│       ├── .github/
│       │   └── prompts/
│       │       └── local.prompt.md  # ✅ Also discovered (local)
│       └── src/
```

If you open `packages/frontend/` in VS Code with the setting enabled, you get:
- The frontend package's local customizations
- ALL parent repo customizations (instructions, agents, prompts, skills)

### Requirements

For parent discovery to work:
1. Your workspace folder must NOT be a git repository root itself
2. A parent folder must contain a `.git` folder
3. The parent repository must be trusted (VS Code prompts for trust)

### Recommended Monorepo Setup

Place shared accessibility agent configurations at the repo root:

```
my-monorepo/
├── .github/
│   ├── agents/                    # Shared across all packages
│   │   ├── accessibility-lead.agent.md
│   │   ├── aria-specialist.agent.md
│   │   ├── contrast-master.agent.md
│   │   └── ...
│   ├── skills/                    # Shared skills
│   │   ├── framework-accessibility/
│   │   └── web-severity-scoring/
│   ├── prompts/                   # Shared prompts
│   │   ├── audit-web-page.prompt.md
│   │   └── quick-web-check.prompt.md
│   └── instructions/              # Shared instructions
│       └── web-accessibility-baseline.instructions.md
├── packages/
│   ├── frontend/                  # Each package inherits all shared configs
│   ├── admin-dashboard/
│   └── marketing-site/
```

Team members opening any package folder will automatically inherit all accessibility agents.

---

## Background Scanning

### When to Use Background Scanning

- Document libraries with 50+ files where scanning takes several minutes
- Scheduled nightly or weekly audit runs
- CI/CD pipeline integration where scanning runs asynchronously

### Claude Code: Background Task Pattern

Claude Code supports the `Task` tool for spawning parallel sub-agents. For background-style scanning:

```text
Scan these 4 document types in parallel:
1. Task 1: Scan all .docx files in /docs/ -> return findings summary
2. Task 2: Scan all .xlsx files in /docs/ -> return findings summary
3. Task 3: Scan all .pptx files in /docs/ -> return findings summary
4. Task 4: Scan all .pdf files in /docs/ -> return findings summary

Wait for all tasks to complete, then merge results.
```

Each task runs in its own context window, scanning independently. The orchestrator collects results and merges them.

**Limitations:**

- Tasks share the same filesystem - no isolation between tasks
- Each task has its own context window but sees the same working directory
- Progress reporting happens only when tasks complete

### GitHub Copilot: Sub-Agent Pattern

Copilot agents use the `agents` frontmatter to reference sub-agents:

```yaml
agents: ['word-accessibility', 'excel-accessibility', 'powerpoint-accessibility', 'pdf-accessibility', 'document-inventory', 'cross-document-analyzer']
```

The orchestrator (document-accessibility-wizard) delegates to sub-agents sequentially or by type group. True background execution is not yet supported - sub-agents run within the main conversation context.

**Practical pattern for large scans:**

1. Use `document-inventory` to build the file list
2. Group files by type
3. Process each type group as a batch
4. Report progress after each group completes

### CI/CD Background Pattern

For true background execution, use CI/CD pipelines:

```yaml
# GitHub Actions - runs asynchronously on push
name: Document Accessibility Audit
on:
  push:
    paths: ['**/*.docx', '**/*.xlsx', '**/*.pptx', '**/*.pdf']
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: node .github/scripts/office-a11y-scan.mjs
      - run: node .github/scripts/pdf-a11y-scan.mjs
      - uses: actions/upload-artifact@v4
        with:
          name: audit-report
          path: DOCUMENT-ACCESSIBILITY-AUDIT.md
```

This runs the scan in the background. Results are available as build artifacts.

## Worktree Isolation

### When to Use Isolated Scanning

- Scanning documents in a branch without switching your working directory
- Running audits against a specific git tag or release
- Comparing documents across branches

### Git Worktree Pattern

Use `git worktree` to create isolated copies for scanning without affecting your main working directory:

```bash
# Create a worktree for the target branch
git worktree add ../audit-workspace release/v2.0

# Run scan against the worktree
cd ../audit-workspace
# (run scanning tools here)

# Clean up after scanning
cd ..
git worktree remove audit-workspace
```

### Temp Directory Pattern

For non-git scenarios or when you need a clean scanning environment:

```powershell
# PowerShell: Copy documents to temp for isolated scanning
$ScanDir = Join-Path $env:TEMP "a11y-scan-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -ItemType Directory -Path $ScanDir
Copy-Item -Path "docs\*.docx","docs\*.xlsx","docs\*.pptx","docs\*.pdf" -Destination $ScanDir

# Run scan in isolated directory
# (scan commands targeting $ScanDir)

# Clean up
Remove-Item -Recurse -Force $ScanDir
```

```bash
# Bash: Copy documents to temp for isolated scanning
SCAN_DIR=$(mktemp -d)
cp docs/*.docx docs/*.xlsx docs/*.pptx docs/*.pdf "$SCAN_DIR/"

# Run scan in isolated directory
# (scan commands targeting $SCAN_DIR)

# Clean up
rm -rf "$SCAN_DIR"
```

### Branch Comparison Pattern

Compare document accessibility across branches:

```bash
# Scan current branch
node .github/scripts/office-a11y-scan.mjs --output AUDIT-current.md

# Create worktree for comparison branch
git worktree add ../compare-branch main

# Scan comparison branch
cd ../compare-branch
node .github/scripts/office-a11y-scan.mjs --output ../AUDIT-main.md

# Compare results
cd ..
# Use compare-audits prompt or diff the reports
git worktree remove compare-branch
```

## Large Library Strategies

### Tiered Scanning

For very large document libraries (500+ documents):

**Tier 1 - Triage (minimal profile):**
Scan all documents with `errors only` to identify the worst offenders.

**Tier 2 - Priority (moderate profile):**
Re-scan the worst 20% with errors and warnings.

**Tier 3 - Comprehensive (strict profile):**
Full scan of high-priority or public-facing documents.

### Incremental Scanning

Rather than scanning the entire library each time:

1. Run a full baseline scan once
2. On subsequent runs, use delta scanning (changed files only)
3. Compare each delta scan against the baseline
4. Run a full re-scan quarterly to catch configuration drift

### Sampling Strategy

For initial assessment of a large library:

1. Select a proportional sample across document types and folders
2. Scan 10-20 representative files
3. Extrapolate issue rates to estimate total remediation effort
4. Use the sample results to prioritize which folders to scan first
