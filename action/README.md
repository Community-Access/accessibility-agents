# Accessibility Scan GitHub Action

Scan web content and documents for WCAG 2.2 AA accessibility issues. Produces SARIF for GitHub Code Scanning, PR annotations, and a step summary.

Part of the [Accessibility Agents](https://github.com/Community-Access/accessibility-agents) project.

---

## Quick Start

Add one step to any workflow:

```yaml
- uses: Community-Access/accessibility-agents/action@v4.6.0
  with:
    scan-type: web
```

---

## Inputs

| Input | Default | Description |
|-------|---------|-------------|
| `scan-type` | `web` | What to scan: `web`, `office`, `pdf`, or `all` |
| `profile` | `moderate` | Rule profile: `strict`, `moderate`, or `minimal` |
| `fail-on` | `serious` | Minimum severity to fail the check: `critical`, `serious`, `moderate`, `minor`, or `none` |
| `paths` | *(auto)* | Glob pattern or directory to scan. Defaults to changed files in PRs, or `.` for push events |
| `sarif-file` | `a11y-results.sarif` | Path to write the SARIF results file |
| `upload-sarif` | `true` | Upload SARIF to GitHub Code Scanning |

## Outputs

| Output | Description |
|--------|-------------|
| `violations` | Total number of accessibility violations found |
| `critical` | Number of critical violations |
| `serious` | Number of serious violations |
| `moderate` | Number of moderate violations |
| `minor` | Number of minor violations |
| `result` | Overall result: `pass` or `fail` |

---

## Examples

### Web scan on pull requests

```yaml
name: Accessibility
on: pull_request

permissions:
  security-events: write

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: Community-Access/accessibility-agents/action@v4.6.0
        with:
          scan-type: web
          fail-on: serious
```

### Scan Office documents and PDFs

```yaml
- uses: Community-Access/accessibility-agents/action@v4.6.0
  with:
    scan-type: all
    profile: strict
    paths: docs/
```

### Lenient scan (fail on critical only)

```yaml
- uses: Community-Access/accessibility-agents/action@v4.6.0
  with:
    fail-on: critical
    profile: minimal
```

### Use outputs in subsequent steps

```yaml
- uses: Community-Access/accessibility-agents/action@v4.6.0
  id: a11y
  with:
    scan-type: web
    fail-on: none

- run: echo "Found ${{ steps.a11y.outputs.violations }} violations"

- if: steps.a11y.outputs.result == 'fail'
  run: echo "Accessibility check failed"
```

---

## What Gets Scanned

### Web (`scan-type: web`)

Static analysis of HTML, JSX, TSX, Vue, Svelte, and CSS files:

| Rule | Severity | WCAG |
|------|----------|------|
| `img-alt` | Serious | 1.1.1 Non-text Content |
| `tabindex-positive` | Serious | 2.4.3 Focus Order |
| `heading-has-content` | Serious | 1.3.1 Info and Relationships |
| `no-outline-removal` | Serious | 2.4.7 Focus Visible |
| `no-div-button` | Moderate | 4.1.2 Name, Role, Value |
| `click-events-have-key-events` | Moderate | 2.1.1 Keyboard |
| `link-text-ambiguous` | Moderate | 2.4.4 Link Purpose |
| `input-has-label` | Moderate | 1.3.1 Info and Relationships |
| `autocomplete-identity` | Minor | 1.3.5 Identify Input Purpose |

### Office (`scan-type: office`)

Scans `.docx`, `.xlsx`, and `.pptx` files via the MCP server using the selected profile. Checks document title, heading structure, alt text, table headers, hyperlink text, and more.

### PDF (`scan-type: pdf`)

Scans `.pdf` files via the MCP server. Covers tagged structure, language, alt text, bookmarks, reading order, and PDF/UA conformance.

---

## Profiles

| Profile | Included Severities |
|---------|-------------------|
| `strict` | Critical, Serious, Moderate, Minor |
| `moderate` | Critical, Serious, Moderate, Minor |
| `minimal` | Critical, Serious only |

The `fail-on` input independently controls which severities cause a non-zero exit code.

---

## SARIF Integration

When `upload-sarif` is `true` (default), results appear in the repository's **Security > Code scanning** tab. This requires the `security-events: write` permission:

```yaml
permissions:
  security-events: write
```

---

## Badge

Add a dynamic badge using the action's outputs with [shields.io](https://shields.io):

```markdown
![Accessibility](https://img.shields.io/badge/a11y-pass-brightgreen)
```

Or use a workflow that writes a badge JSON file and serves it via GitHub Pages.

---

## PR File Detection

In pull request contexts, the action automatically scans only files changed in the PR (via `git diff`). To scan the entire repository instead, set `paths: .` explicitly.
