# A11y Agent Team — MCP Server

Server-based MCP (Model Context Protocol) server that provides accessibility scanning tools over HTTP or stdio. Works with Claude Desktop, VS Code Copilot, and any MCP-compatible client.

In this repository, the MCP server lives in the top-level `mcp-server/` directory. The main entry points are `server.js` (HTTP) and `stdio.js` (stdio).

## What Works Out Of The Box

The MCP server is the executable part of PDF scanning. The PDF agent and prompt files tell the model when to scan; this server provides the actual `scan_pdf_document` tool.

| What you install | What you get | PDF scanning works? |
|------------------|--------------|---------------------|
| Prompt files only | Reusable prompt text | No |
| Agent files only | PDF scanning instructions in chat | No |
| Agent files + MCP server | Working `scan_pdf_document` tool | Yes |
| Agent files + MCP server + veraPDF | Baseline scan + deep PDF/UA validation | Yes |

If you only copy prompt files or agent files into a prompts or agents folder, PDF scanning will not run until a client is configured to talk to this MCP server.

## Architecture

The server supports two transport modes:

| Mode | Entry Point | Transport | Use Case |
|------|-------------|-----------|----------|
| **HTTP** | `server.js` | Streamable HTTP + SSE | Remote clients, shared servers, CI/CD |
| **stdio** | `stdio.js` | stdin/stdout | Claude Desktop `mcp.json`, local use |

Both modes share the same tool implementations via `server-core.js`.

## Quick Start

Before you start, make sure `node --version` reports Node.js 18 or later and that `npm` is available.

If Node.js is missing, the repository installers can now offer to install it:

- Windows PowerShell installer uses `winget` when available
- macOS shell installer uses Homebrew when available

Manual fallback: <https://nodejs.org/en/download>

```bash
cd mcp-server
npm install

# HTTP mode (default)
npm start
# -> http://127.0.0.1:3100/mcp

# stdio mode (local desktop clients)
node stdio.js
```

For a PDF-only walkthrough, see [PDF-QUICKSTART.md](PDF-QUICKSTART.md).

## Prerequisite Matrix

| Class | Requirement | Needed For | Required? |
|------|-------------|------------|-----------|
| Runtime | Node.js 18+ | Running the MCP server | Yes |
| Runtime | npm | Installing MCP server dependencies | Yes |
| Runtime | `@modelcontextprotocol/sdk`, `zod` | Core MCP tool registration and execution | Yes |
| Client | MCP-compatible client | Calling the server tools | Yes |
| Optional feature | Java 11+ + `verapdf` | Deep PDF validation with `run_verapdf_scan` | No |
| Optional feature | `playwright`, `@axe-core/playwright`, Chromium | Browser-based scanning tools | No |
| Optional feature | `pdf-lib` | `convert_pdf_form_to_html` | No |
| Installer-only | `git` | Cloning during install/update flows | No |
| Installer-only | Python 3 | Some shell installer automation and smoke-test fallback paths | No |

Python is not required to run the MCP server. It is only used by the shell installer for a few automatic config updates and as a fallback helper in some install-time checks.

## Local Vs Shared Server

You can run this MCP server either locally on your own machine or as a shared HTTP service.

| Mode | Where it runs | Best for |
|------|---------------|----------|
| Local stdio | Your machine, started by the client | Claude Desktop and local-only use |
| Local HTTP | Your machine on `127.0.0.1` | VS Code Copilot, local testing, debugging |
| Shared HTTP | A server or container | Team use, CI/CD, remote clients |

For most users, start locally first. The default HTTP binding is `127.0.0.1`, so it is not exposed to the network unless you deliberately change the host.

## Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `PORT` | `3100` | HTTP server port |
| `A11Y_MCP_HOST` | `127.0.0.1` | Bind address |
| `A11Y_MCP_STATELESS` | (unset) | Set to `1` for stateless mode |

### Stateful vs Stateless

- **Stateful** (default): Sessions persist across requests. Supports SSE for streaming. Best for interactive use.
- **Stateless**: Each request creates a fresh server instance. No sessions. Best for CI/CD and serverless deployments.

## Client Configuration

### Claude Desktop (`mcp.json`)

**HTTP mode** (recommended):

```json
{
  "mcpServers": {
    "a11y-agent-team": {
      "url": "http://127.0.0.1:3100/mcp"
    }
  }
}
```

**stdio mode** (alternative):

```json
{
  "mcpServers": {
    "a11y-agent-team": {
      "command": "node",
      "args": ["/path/to/mcp-server/stdio.js"]
    }
  }
}
```

### VS Code (settings.json)

```json
{
  "mcp": {
    "servers": {
      "a11y-agent-team": {
        "url": "http://127.0.0.1:3100/mcp"
      }
    }
  }
}
```

## PDF-Only Quick Start

If your immediate goal is only PDF accessibility scanning, this is the smallest working path:

1. Install Node.js 18 or later.
2. Open this folder: `mcp-server/`
3. Run `npm install`
4. Start the server with `npm start`
5. Point your MCP client at `http://127.0.0.1:3100/mcp`
6. Install or copy the PDF agent file if you want the guided PDF workflow in chat

Minimum files for the MCP side:

- `package.json`
- `server.js`
- `server-core.js`
- `stdio.js`
- `tools/`

If you also want the chat workflow layer, add:

- `.github/agents/pdf-accessibility.agent.md`
- `.github/agents/pdf-scan-config.agent.md`
- `templates/pdf-config-moderate.json` copied to your project as `.a11y-pdf-config.json` (optional)

## Available Tools

### Core Tools

| Tool | Description |
|------|-------------|
| `check_contrast` | Calculate WCAG contrast ratio between two colors |
| `get_accessibility_guidelines` | Get WCAG AA guidelines for component types |
| `check_heading_structure` | Analyze HTML heading hierarchy |
| `check_link_text` | Detect ambiguous or missing link text |
| `check_form_labels` | Check form inputs for accessible labels |

### Document Tools

| Tool | Description |
|------|-------------|
| `scan_office_document` | Scan .docx/.xlsx/.pptx for accessibility issues |
| `scan_pdf_document` | Scan PDF using PDF/UA checks |
| `scan_epub_document` | Scan .epub files for EPUB Accessibility 1.1 conformance |
| `extract_document_metadata` | Extract accessibility-relevant metadata |
| `batch_scan_documents` | Scan multiple documents in one call |
| `fix_document_metadata` | Fix document metadata (title, language, author) |
| `fix_document_headings` | Fix heading structure in documents |

### Advanced Tools (Optional Dependencies)

| Tool | Requires | Description |
|------|----------|-------------|
| `run_axe_scan` | playwright, @axe-core/playwright | Run axe-core against a live URL |
| `run_playwright_a11y_tree` | playwright | Capture accessibility tree |
| `run_playwright_keyboard_scan` | playwright | Test keyboard navigation |
| `run_playwright_contrast_scan` | playwright | Visual contrast analysis |
| `run_playwright_viewport_scan` | playwright | Test reflow at multiple widths |
| `run_verapdf_scan` | veraPDF CLI | PDF/UA-1 conformance validation (SARIF output) |
| `convert_pdf_form_to_html` | pdf-lib | Convert PDF forms to accessible HTML |

### Markdown Tools

| Tool | Description |
|------|-------------|
| `lint_markdown` | Lint markdown files for accessibility issues (links, alt text, headings, tables, emoji) |

### Caching Tools

| Tool | Description |
|------|-------------|
| `check_audit_cache` | Check if a cached audit result exists for a file |
| `update_audit_cache` | Store or update an audit result in the cache |

### Installing Optional Dependencies

```bash
# Playwright + axe-core (for web scanning)
npm install playwright @axe-core/playwright
npx playwright install chromium

# pdf-lib (for PDF form conversion)
npm install pdf-lib

# veraPDF (external CLI)
# Download from https://verapdf.org/software/
```

## Actionable veraPDF Setup

veraPDF is optional. The built-in `scan_pdf_document` tool works without it. Install veraPDF when you need deeper PDF/UA validation than the built-in heuristic scan provides.

### What veraPDF is for

- Validate PDF/UA conformance more deeply than the built-in scanner
- Confirm structure and metadata issues against a dedicated PDF validator
- Use as a second pass after baseline scanning

### What veraPDF is not for

- It is not required for baseline PDF scanning
- It is not the primary remediation workflow in this repository
- Do not assume `verapdf --fix` is part of the supported workflow here

### Install veraPDF

veraPDF requires Java 11 or later.

**Windows**

Install Java first if it is not already present:

```bash
winget install --exact --id EclipseAdoptium.Temurin.21.JRE
```

Then install veraPDF using Chocolatey if available:

```bash
choco install verapdf
```

If Chocolatey is not part of your environment, use the manual installer from <https://docs.verapdf.org/install/>.

**macOS**

```bash
brew install verapdf
```

**Manual download**

Download from <https://docs.verapdf.org/install/> and make sure `verapdf` is available on your `PATH`.

### Verify veraPDF

```bash
verapdf --version
```

On Windows, restart your terminal or editor after installing Java or veraPDF so the updated `PATH` is picked up.

### Use veraPDF directly

```bash
verapdf --flavour ua1 --format text path/to/file.pdf
```

### Use veraPDF through this MCP server

Once the server is running and veraPDF is installed on the same machine, an MCP client can call `run_verapdf_scan`.

Example natural-language requests:

- `Run a deep PDF/UA scan on report.pdf using veraPDF`
- `Validate brochure.pdf with veraPDF and summarize the failures`

The tool will return installation guidance if `verapdf` is not installed.

For more background, see [../docs/tools/verapdf-integration.md](../docs/tools/verapdf-integration.md).

## Health Check

```bash
curl http://127.0.0.1:3100/health
# {"status":"ok","name":"a11y-agent-team","version":"4.6.0","mode":"stateful"}
```

## MCP Prompts

Pre-built prompt templates that guide the model through accessibility workflows.

| Prompt | Arguments | Description |
|--------|-----------|-------------|
| `audit-page` | `url` (required), `level` (optional: A/AA/AAA) | Structured WCAG audit instruction — walks through axe-core, heading, link, form, keyboard, and contrast scans |
| `check-component` | `component` (required) | Component-specific review using built-in guidelines (modal, tabs, accordion, combobox, carousel, form, live-region, navigation, general) |
| `explain-wcag` | `criterion` (required) | Explain a WCAG criterion with practical examples, common violations, and testing guidance |

## MCP Resources

Read-only data endpoints for accessibility reference material.

| Resource URI | Description |
|-------------|-------------|
| `a11y://guidelines/{component}` | Component accessibility guidelines in Markdown (modal, tabs, accordion, combobox, carousel, form, live-region, navigation, general) |
| `a11y://tools` | Auto-generated list of all registered tools with descriptions |
| `a11y://config/{profile}` | Scan configuration templates as JSON (strict, moderate, minimal) |

## Security

- **Path traversal prevention** — File operations validate paths against home directory and CWD boundaries (CWE-22)
- **Symlink resolution** — Write operations resolve symlinks to prevent escape (CWE-59)
- **SSRF protection** — URL-based tools validate schemes (http/https only)
- **Command injection prevention** — External commands use `execFile` (not `exec`) with argument arrays
- **File size limits** — Documents capped at 100 MB, batch operations at 50 files
- **Local binding** — Server binds to `127.0.0.1` by default (not exposed to network)

## Deployment

### Docker

```dockerfile
FROM node:20-slim
WORKDIR /app
COPY package.json .
RUN npm install --omit=dev
COPY . .
EXPOSE 3100
CMD ["node", "server.js"]
```

### Systemd

```ini
[Unit]
Description=A11y Agent Team MCP Server
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/node /opt/a11y-mcp/server.js
Environment=PORT=3100
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

## License

MIT — see [LICENSE](../LICENSE) in the repository root.
