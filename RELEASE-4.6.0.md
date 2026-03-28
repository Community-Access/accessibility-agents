# Accessibility Agents 4.6.0

**Released:** March 27, 2026 | MCP server: 14 new tools + trend dashboard | VS Code extension: 7 commands, diagnostics, code actions | GitHub Action for CI/CD | Security: 6 hardening fixes | npm publish ready | APCA contrast (WCAG 3.0 draft)

---

## What's New

4.6.0 extends the MCP server with EPUB and markdown scanning, adds machine-readable SARIF output for veraPDF, ships a full VS Code extension with diagnostics and code actions, introduces audit persistence with trend tracking for compliance evidence, adds APCA contrast analysis (WCAG 3.0 draft), ships a reusable GitHub Action for CI/CD accessibility scanning, ships a veraPDF installer helper, prepares the npm package for public publish, hardens the server against six security vectors, and fixes sub-agent delegation for Claude Code orchestrators.

---

## EPUB Accessibility Scanning

Three new MCP tools bring EPUB Accessibility 1.1 auditing to any MCP client.

### scan_epub

Full document scan covering:

- Language declaration
- Navigation documents (NCX and XHTML TOC)
- Accessibility metadata (schema.org conformsTo, accessMode, accessibilityFeature, accessibilityHazard)
- Image alt text across all content documents
- Heading hierarchy validation
- Table structure and header association

### scan_epub_reading_order

Validates that the spine reading order matches the TOC navigation document. Detects orphaned spine items and unreferenced content documents.

### check_epub_metadata

Focused metadata check for the schema.org accessibility properties required by EPUB Accessibility 1.1 and recommended by the W3C Publishing Community Group.

### Configuration

New `.a11y-epub-config.json` with three pre-built profiles in `templates/`:

- **strict** -- All rules enabled, all severities
- **moderate** -- All rules enabled, errors and warnings only
- **minimal** -- Errors only, for quick triage

---

## Markdown Accessibility Scanning

Two new MCP tools scan markdown documentation for accessibility issues that markdownlint alone does not catch.

### scan_markdown

Nine-domain audit covering: heading hierarchy, image alt text, link text quality, table structure, emoji detection, Mermaid/ASCII diagrams, em-dash normalization, anchor link validation, and language markers.

### scan_markdown_links

Dedicated link checker: catches ambiguous text patterns ("click here", "read more", "learn more"), validates internal anchor targets, and flags bare URLs without descriptive text.

---

## veraPDF SARIF Output

### run_verapdf_sarif

Runs veraPDF and produces SARIF 2.1.0 output. Each PDF/UA clause maps to a SARIF rule object with help URIs. Output integrates directly with:

- GitHub code scanning (upload as SARIF)
- VS Code SARIF Viewer extension
- CI/CD pipelines for automated PDF accessibility gates

---

## VS Code Extension

The VS Code extension (`vscode-extension/`) ships a full accessibility toolkit inside the editor.

### Chat Participant

The `@a11y` chat participant registers 64 slash commands, each routing to a specialist agent. Agent discovery scans the workspace at activation and falls back to bundled agent definitions.

### Commands

| Command | What It Does |
|---------|-------------|
| `A11y: Quick Scan` | Runs axe-core against a URL and populates the Problems panel via SARIF |
| `A11y: Import SARIF` | Imports any `.sarif` file into the Problems panel |
| `A11y: Clear Diagnostics` | Clears all accessibility diagnostics |
| `A11y: Check Contrast` | Calculates WCAG 2.x contrast ratio and APCA Lightness Contrast (Lc) between two hex colors |
| `A11y: Show Dashboard` | Opens a WebView panel with audit score history |

### Diagnostics and Code Actions

SARIF findings map directly to VS Code Diagnostics. The Code Action provider offers Quick Fix suggestions for common violations:

- Missing `alt` attribute on images
- Missing labels on form inputs
- SARIF-sourced fixes with before/after previews

Supported file types: HTML, JSX, TSX, Vue, Svelte, Astro, CSS.

### Settings

| Setting | Default | Purpose |
|---------|---------|---------|
| `a11y.scanProfile` | `moderate` | Scan rule profile (strict, moderate, minimal) |
| `a11y.autoScanOnSave` | `false` | Run axe-core scan when saving HTML/JSX/TSX files |
| `a11y.mcpServerUrl` | `http://localhost:3000` | MCP server connection URL |
| `a11y.mcpTransport` | `streamable-http` | MCP transport protocol (streamable-http or stdio) |

---

## Audit Cache Enhancement

### Content-Based Invalidation

`check_audit_cache` now computes SHA-256 hashes of file content instead of relying on modification timestamps. Files that are touched but unchanged no longer trigger unnecessary re-scans.

### Configurable Expiry

New `maxAgeDays` parameter (default: 30) controls cache freshness. Set lower values for active remediation workflows, higher values for stable document libraries.

### Severity Breakdown

`update_audit_cache` now stores per-file severity counts (critical, serious, moderate, minor). Enables trend analysis and dashboard reporting without re-scanning.

---

## Sub-Agent Delegation Fix

Claude Code orchestrator agents can now spawn specialist sub-agents via the Task tool.

**Before 4.6.0:** Five of six Claude Code orchestrators (web-accessibility-wizard, document-accessibility-wizard, github-hub, nexus, developer-hub) were missing the Task tool from their frontmatter, causing silent delegation failures and inline fallback behavior.

**Now:** All orchestrators include Task with platform-aware delegation sections. Each agent detects whether it is running in a Copilot or Claude Code environment and uses the appropriate delegation mechanism. Graceful inline fallback is preserved for environments that do not support sub-agent spawning.

Documentation updated in `docs/subagent-architecture.md` with a Claude Code delegation section, platform comparison table, and affected orchestrators reference.

---

## Security Hardening

Six security improvements address findings from a comprehensive MCP server audit:

| Finding | Severity | Fix |
|---------|----------|-----|
| XSS via PDF field names in generated HTML | Medium | HTML escaping for all interpolated values (CWE-79) |
| ZIP bomb via inflateRawSync | Medium | 500 MB uncompressed size limit before decompression (CWE-409) |
| No CORS protection | Medium | `Access-Control-Allow-Origin: null` deny-all policy (CWE-942) |
| Session memory exhaustion | Medium | 100 session cap, 30-minute TTL, periodic cleanup sweep (CWE-770) |
| Non-loopback bind without warning | Info | Console warning when bound to non-loopback address (CWE-306) |
| Misleading SSRF JSDoc | Medium | Comment corrected to match actual behavior |

---

## Audit Persistence

Four new MCP tools store scan results in `.a11y-history/` for compliance evidence, trend tracking, and VPAT generation.

### save_audit_result

Persist any scan result (web, office, pdf, epub, markdown) to the audit history directory. Stores results in a SARIF-compatible JSON format with timestamps, scores, grades, and individual findings. Files are named `{ISO-timestamp}-{type}-{target-hash}.json` -- git-trackable for evidence trails. Auto-prunes old results when retention limit is exceeded (default: 30 audits per target).

### list_audit_history

List stored audit results with optional filtering by scan type, target, and result count. Returns summaries with timestamps, scores, grades, and finding counts -- useful for quick trend checks.

### get_audit_result

Retrieve the full detail of a specific stored audit by ID, including all individual findings with rule IDs, severity, WCAG criteria, and locations.

### prune_audit_history

Manually prune old audit results beyond the retention limit for each target. Keeps the newest N audits per target and deletes the rest.

### Storage format

```
.a11y-history/
  2026-03-27T10-30-00-000Z-web-a1b2c3d4e5f6.json
  2026-03-27T11-00-00-000Z-pdf-f6e5d4c3b2a1.json
```

Each file contains: version, ID, timestamp, type, target, target hash, score, grade, summary (finding/error/warning counts), tool version, and optionally the full findings array.

---

## veraPDF Installer Helper

New MCP tool for guided veraPDF installation.

### check_verapdf_installation

Health check that auto-detects veraPDF CLI availability, reports the installed version, checks the Java dependency (required by veraPDF), and provides platform-specific installation commands if anything is missing.

Platform-specific guidance covers:

- **Windows:** winget/Chocolatey for Java; Chocolatey/MSI installer for veraPDF
- **macOS:** Homebrew for both Java and veraPDF
- **Linux:** apt/dnf for Java; snap/manual installer for veraPDF

---

## npm Publish Readiness

The MCP server package (`@a11y-agent-team/mcp-server`) is ready for npm publication.

- Scoped public package: `publishConfig.access` set to `public`
- Zero-install quickstart: `npx @a11y-agent-team/mcp-server`
- Global install: `npm install -g @a11y-agent-team/mcp-server`
- Binary entry points: `a11y-mcp-server` (HTTP) and `a11y-mcp-stdio` (stdio)
- Pre-publish validation: `npm test` runs automatically via `prepublishOnly`
- Files array includes all tools: `server.js`, `server-core.js`, `stdio.js`, `tools/`, `README.md`, `LICENSE`

---

## Anthropic Directory Update

`anthropic-directory.json` fully synced with all 37 MCP tools and 4 resources. Adds entries for audit persistence tools (`save_audit_result`, `list_audit_history`, `get_audit_result`, `prune_audit_history`), trend dashboard (`get_audit_trend`), APCA contrast (`check_apca_contrast`), and previously missing tools (`check_color_blindness`, `check_reading_level`, `validate_caption_file`, `generate_accessibility_statement`, `check_verapdf_installation`). Server description updated to reference WCAG 3.0 draft support and 40+ tools.

---

## Trend Dashboard

Score tracking and regression detection across audit history.

### get_audit_trend

Computes score progression for a specific audit target. Returns a timeline of scores, finding counts, and computed trend metadata:

- **Direction:** improving, stable, or declining (based on score delta across the window)
- **Score delta:** difference between newest and oldest audit in the window
- **Issue velocity:** change in total findings between the two most recent audits
- **Statistics:** average score, best score, worst score across the window

Requires at least two saved audits for the target. Accepts an optional `limit` parameter to control the analysis window size (default: 10).

### a11y://dashboard/summary (MCP Resource)

Read-only MCP resource that aggregates trends across all audit targets. Returns a markdown summary table with per-target statistics and an "Attention Needed" section that highlights any targets with declining scores.

MCP clients that support resources can read `a11y://dashboard/summary` to display a live dashboard without invoking any tools.

---

## APCA Contrast (WCAG 3.0 Draft)

Experimental APCA (Accessible Perceptual Contrast Algorithm) support for forward-looking contrast analysis.

### check_apca_contrast

Calculates the APCA Lightness Contrast (Lc) value between text and background colors. The APCA algorithm from the WCAG 3.0 working draft provides more perceptually accurate contrast measurement than the WCAG 2.x luminance ratio.

Key differences from `check_contrast`:

- **Polarity-aware:** "dark on light" and "light on dark" produce different Lc values because human perception is asymmetric
- **Font-size recommendations:** Returns minimum font sizes for body text, large text, and non-text UI based on the Lc value
- **Comparison output:** Shows both the APCA Lc value and the traditional WCAG 2.x ratio for side-by-side evaluation

**Status:** Experimental. Based on the APCA-W3 0.0.98G-4g specification. The WCAG 3.0 standard is still in working draft; Lc thresholds may change before final publication. Use alongside `check_contrast` (WCAG 2.x) for production compliance decisions.

---

## GitHub Action for CI/CD

New reusable GitHub Action (`action/`) brings accessibility scanning to any CI/CD pipeline.

### Quick Start

Add one step to a workflow file:

```yaml
- uses: Community-Access/accessibility-agents/action@v4.6.0
  with:
    scan-type: web
```

### Inputs

| Input | Default | Description |
|-------|---------|-------------|
| `scan-type` | `web` | What to scan: `web`, `office`, `pdf`, or `all` |
| `profile` | `moderate` | Rule profile: `strict`, `moderate`, or `minimal` |
| `fail-on` | `serious` | Minimum severity to fail: `critical`, `serious`, `moderate`, `minor`, or `none` |
| `paths` | *(auto)* | Directory or glob to scan. Defaults to changed files in PRs |
| `sarif-file` | `a11y-results.sarif` | SARIF output path |
| `upload-sarif` | `true` | Upload SARIF to GitHub Code Scanning |

### Outputs

`violations`, `critical`, `serious`, `moderate`, `minor`, and `result` (pass/fail) -- usable in subsequent workflow steps.

### What It Scans

- **Web:** Static analysis of HTML/JSX/TSX/Vue/Svelte/CSS for 9 rule categories (img-alt, tabindex, heading structure, focus indicators, link text, form labels, keyboard handlers, autocomplete, semantic elements)
- **Office/PDF:** Spawns the MCP server via stdio and runs `scan_office_document` / `scan_pdf_document` for full document accessibility audits

### SARIF Integration

Results upload to the repository's Security > Code Scanning tab (requires `security-events: write` permission). Findings also appear as inline PR annotations.

### PR File Detection

In pull request contexts, only files changed in the PR are scanned (via `git diff`). Set `paths: .` to scan the entire repository.

See [action/README.md](action/README.md) for full documentation and examples.

---

## Upgrade

For npm installations:

```sh
npm update @a11y-agent-team/mcp-server
```

For Copilot/Claude Code agent files, run the installer:

```sh
# Windows
.\install.ps1

# macOS / Linux
./install.sh
```

---

## Full Changelog

See [CHANGELOG.md](CHANGELOG.md) for the complete list of changes.
