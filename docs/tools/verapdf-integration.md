# veraPDF Integration

## Overview

The `run_verapdf_scan` MCP tool integrates [veraPDF](https://verapdf.org/) — the reference implementation for PDF/UA (ISO 14289) validation — into the accessibility agent ecosystem. veraPDF is used by the PDF Association, Library of Congress, and EU accessibility bodies.

## How It Works

1. The tool shells out to the `verapdf` CLI with `--format json` output
2. Parses the structured JSON report
3. Maps veraPDF findings to our internal PDFUA rule IDs (Matterhorn Protocol)
4. Returns findings compatible with the document-accessibility-wizard workflow

## Two-Tier PDF Scanning

| Tier | Tool | Speed | Coverage | Dependency |
|------|------|-------|----------|------------|
| **Tier 1** (always) | `scan_pdf_document` | <100ms | ~30 rules, heuristic | None (built-in regex parser) |
| **Tier 2** (if available) | `run_verapdf_scan` | 2-10s | All 136 Matterhorn Protocol failure conditions | veraPDF CLI + Java 11+ |

When both tiers run, findings are correlated by rule ID. Issues confirmed by both tiers receive a **Confirmed** confidence rating (1.2x weight in severity scoring).

## What veraPDF Catches That the Regex Parser Cannot

| Capability | Regex Parser | veraPDF |
|---|---|---|
| Detect missing structure tree | Yes | Yes |
| Validate structure tree parent-child semantics | No | Yes |
| Parse content streams for marked content | No | Yes |
| Follow cross-reference tables to validate object linkage | No | Yes |
| Verify role maps resolve to standard types | No | Yes |
| Validate Headers attribute points to valid TH cells | No | Yes |
| Check font embedding completeness | Heuristic | Full |
| Full Matterhorn Protocol (136 failure conditions) | ~30 rules | All 136 |

## Installation

veraPDF requires Java 11 or later.

### macOS

```bash
brew install verapdf
```

### Windows

```bash
choco install verapdf
```

### Linux

```bash
snap install verapdf
```

### Manual Download

Download from <https://docs.verapdf.org/install/>

### Verify Installation

```bash
verapdf --version
```

## Validation Flavours

| Flavour | Standard | Use Case |
|---------|----------|----------|
| `ua1` (default) | PDF/UA-1 (ISO 14289-1) | Accessibility validation |
| `ua2` | PDF/UA-2 (ISO 14289-2) | Updated accessibility standard |
| `1a`, `1b` | PDF/A-1 | Archival level 1 |
| `2a`, `2b`, `2u` | PDF/A-2 | Archival level 2 |
| `3a`, `3b`, `3u` | PDF/A-3 | Archival level 3 |
| `4`, `4e`, `4f` | PDF/A-4 | Archival level 4 |

## Graceful Degradation

If veraPDF is not installed, the tool returns installation instructions. The existing `scan_pdf_document` tool continues to work independently — veraPDF is purely additive.

## MCP Tool API

### `run_verapdf_scan`

**Input:**

- `filePath` (string, required) — Path to the PDF file
- `flavour` (string, optional, default `"ua1"`) — Validation flavour
- `maxFindings` (number, optional, default 200) — Maximum findings to return

**Output:** Structured text with per-finding details including rule ID, severity, message, clause reference, and element context.

## Related Components

| Component | Role |
|-----------|------|
| `scan_pdf_document` | Built-in Tier 1 regex-based PDF scanner |
| `document-accessibility-wizard` | Orchestrator that can invoke both PDF scanning tiers |
| Web severity scoring skill | Confidence levels including Confirmed tier for dual-source validation |
