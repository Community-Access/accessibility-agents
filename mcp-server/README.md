# A11y Agent Team MCP Server

MCP (Model Context Protocol) server that provides 39 accessibility scanning tools over Streamable HTTP or stdio. Works with Claude Code, Claude Desktop, VS Code, the Copilot CLI and any MCP-compatible client. It is built on `@modelcontextprotocol/sdk` 1.32.2 and implements what that SDK provides (protocol revisions up to 2025-11-25); see [the MCP standards page](../docs/standards/mcp.md) for where it stands against 2026-07-28.

In this repository, the MCP server lives in the top-level `mcp-server/` directory. The main entry points are `server.js` (HTTP) and `stdio.js` (stdio).

## What Works Out Of The Box

The MCP server is the executable part of document scanning. The skills (for PDF, `pdf-accessibility` and `pdf-scan-config` under `skills/`) tell the model when to scan; this server provides the actual `scan_pdf_document` tool.

| What you install | What you get | PDF scanning works? |
|------------------|--------------|---------------------|
| Skills only | PDF scanning instructions in chat | No |
| Skills + MCP server | Working `scan_pdf_document` tool | Yes |
| Skills + MCP server + veraPDF | Baseline scan + deep PDF/UA validation | Yes |

A plugin install launches `dist/stdio.mjs`, a single esbuild bundle of the stdio server and its dependencies, so it starts with no `npm install` (`mcp.json`, and `mcpServers` in `.claude-plugin/plugin.json`). Playwright, `@axe-core/playwright` and `pdf-lib` are left out of the bundle and stay optional; the tools that need them say how to install them. Run `npm install` in this folder only for the HTTP server (`server.js`) or to work on the source.

If you change the server's source, run `npm run build` here and commit the rebuilt `dist/stdio.mjs`: the `bundle` gate in `npm run verify` fails when the committed bundle differs from a fresh build.

## Architecture

The server supports two transport modes:

| Mode | Entry Point | Transport | Use Case |
|------|-------------|-----------|----------|
| **HTTP** | `server.js` | Streamable HTTP (stateful with a GET event stream by default; stateless with `A11Y_MCP_STATELESS=1`). The legacy HTTP+SSE transport is not offered | Remote clients, shared servers, CI/CD |
| **stdio** | `stdio.js` (bundled as `dist/stdio.mjs`) | stdin/stdout | Claude Desktop, plugin installs, local use |

Both modes share the same tool implementations via `server-core.js`.

## Quick Start

Before you start, make sure `node --version` reports a supported Node.js LTS line (26, 24 or 22) and that `npm` is available. The repository installer does not install Node.js; get it from <https://nodejs.org/en/download>.

```bash
# stdio, from the bundle: no install needed
node mcp-server/dist/stdio.mjs

# HTTP mode needs the dependencies
cd mcp-server
npm install
npm start
# -> http://127.0.0.1:3100/mcp
```

From npm, with no checkout (from 7.1.0, once published as
`@community-access/accessibility-agents-mcp`; also listed in the MCP Registry
as `io.github.Community-Access/accessibility-agents`):

```bash
npx -y @community-access/accessibility-agents-mcp
claude mcp add accessibility-agents -- npx -y @community-access/accessibility-agents-mcp
```

The npm package is the stdio bundle alone. The browser and PDF form tools need
their optional packages in the same `node_modules`, so for those install the
server into a folder with them and run it from there:
`npm install @community-access/accessibility-agents-mcp playwright @axe-core/playwright pdf-lib`,
`npx playwright install chromium`, then `npx accessibility-agents-mcp`.

For a PDF-only walkthrough, see [PDF-QUICKSTART.md](PDF-QUICKSTART.md).

## Prerequisite Matrix

Each class, with requirement, needed for and required.

| Class | Requirement | Needed For | Required? |
|------|-------------|------------|-----------|
| Runtime | Node.js LTS (26, 24 or 22) | Running the MCP server | Yes |
| Runtime | none for the stdio bundle | `dist/stdio.mjs` carries `@modelcontextprotocol/sdk` and `zod` inside it | No |
| HTTP or development | npm, then `npm install` in this folder (`@modelcontextprotocol/sdk`, `zod`, `express`) | The HTTP server (`server.js`), running the unbundled source and the tests | Only for those |
| Client | MCP-compatible client | Calling the server tools | Yes |
| Optional feature | Java 11+ + `verapdf` | Deep PDF validation with `run_verapdf_scan` | No |
| Optional feature | `playwright`, `@axe-core/playwright`, Chromium | Browser-based scanning tools | No |
| Optional feature | `pdf-lib` | `convert_pdf_form_to_html` | No |
| Installer-only | `git` | Cloning the repository | No |

Python is not required to run the MCP server or to install the package.

## Local Vs Shared Server

You can run this MCP server either locally on your own machine or as a shared HTTP service.

| Mode | Where it runs | Best for |
|------|---------------|----------|
| Local stdio | Your machine, started by the client | Claude Desktop and local-only use |
| Local HTTP | Your machine on `127.0.0.1` | VS Code Copilot, local testing, debugging |
| Shared HTTP | A server or container | Team use, CI/CD, remote clients |

For most users, start locally first. The default HTTP binding is `127.0.0.1`, so it is not exposed to the network unless you deliberately change the host.

## Configuration

Each environment variable, with its default and description.

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `PORT` | `3100` | HTTP server port |
| `A11Y_MCP_HOST` | `127.0.0.1` | Bind address |
| `A11Y_MCP_STATELESS` | (unset) | Set to `1` for stateless mode |
| `GLOW_API_BASE_URL` | `https://letitglow.app/mcp` | Endpoint the GLOW bridge tools call |

### Stateful vs Stateless

- **Stateful** (default): Sessions persist across requests (`Mcp-Session-Id`), and a GET request opens a server-sent event stream for that session. Best for interactive use. The 2026-07-28 MCP revision removes sessions and the GET endpoint; this mode follows the SDK.
- **Stateless**: Each request creates a fresh server instance. No sessions, POST only. Best for CI/CD and serverless deployments.

## Client Configuration

### Claude Desktop (`claude_desktop_config.json`)

Claude Desktop starts local servers from `claude_desktop_config.json` (Settings, Developer, Edit Config), using stdio:

```json
{
  "mcpServers": {
    "a11y-agent-team": {
      "command": "node",
      "args": ["/path/to/mcp-server/dist/stdio.mjs"]
    }
  }
}
```

Remote HTTP servers are added in Claude Desktop as custom connectors rather than in this file; see <https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp>.

### Claude Code

The plugin registers the server for you. Without the plugin:

```bash
claude mcp add --transport stdio a11y-agent-team -- node /path/to/mcp-server/dist/stdio.mjs
```

### VS Code (`.vscode/mcp.json`)

```json
{
  "servers": {
    "a11y-agent-team": {
      "type": "http",
      "url": "http://127.0.0.1:3100/mcp"
    }
  }
}
```

## Using GLOW Bridge Tools

The GLOW bridge tools are part of this MCP server. You do not register a second MCP server for GLOW.

### Default behavior

- The bridge targets `https://letitglow.app/mcp` by default.
- You can call `glow_health_check` immediately after starting this server.

### Use a different GLOW endpoint

Option 1: set server environment variable before startup:

```bash
# Linux/macOS
export GLOW_API_BASE_URL="https://letitglow.app/mcp"
npm start
```

```powershell
# Windows PowerShell
$env:GLOW_API_BASE_URL = "https://letitglow.app/mcp"
npm start
```

Option 2: pass `baseUrl` per tool call (for one-off testing):

- `glow_health_check` with `baseUrl`
- `glow_audit_document` with `baseUrl`
- `glow_fix_document` with `baseUrl`
- `glow_convert_document` with `baseUrl`
- `glow_generate_report` with `baseUrl`

### Example prompts after connection

- `Run glow_health_check`
- `Audit ./docs/sample.md with glow_audit_document using format markdown`
- `Convert ./docs/sample.md from markdown to html with glow_convert_document`
- `Generate an html report for ./docs/sample.md with glow_generate_report`

## PDF-Only Quick Start

If your immediate goal is only PDF accessibility scanning, this is the smallest working path:

1. Install a Node.js LTS release (26, 24 or 22).
2. Open this folder: `mcp-server/`
3. Run `npm install`
4. Start the server with `npm start`
5. Point your MCP client at `http://127.0.0.1:3100/mcp`
6. Install the skills (see [Getting started](../docs/getting-started/README.md)) if you want the guided PDF workflow in chat

Minimum files for the MCP side:

- `package.json`
- `server.js`
- `server-core.js`
- `stdio.js`
- `tools/`

If you also want the chat workflow layer, add:

- the `pdf-accessibility` and `pdf-scan-config` skills (`skills/pdf-accessibility/`, `skills/pdf-scan-config/`), installed with the rest of the package
- `templates/pdf-config-moderate.json` copied to your project as `.a11y-pdf-config.json` (optional)

## Available Tools

### Core Tools

Each tool, with its description.

| Tool | Description |
|------|-------------|
| `check_contrast` | Calculate WCAG contrast ratio between two colors |
| `get_accessibility_guidelines` | Get WCAG AA guidelines for component types |
| `check_heading_structure` | Analyze HTML heading hierarchy |
| `check_link_text` | Detect ambiguous or missing link text |
| `check_form_labels` | Check form inputs for accessible labels |

### Document Tools

Each tool, with its description.

| Tool | Description |
|------|-------------|
| `scan_office_document` | Scan .docx/.xlsx/.pptx for accessibility issues |
| `scan_pdf_document` | Scan PDF using PDF/UA checks |
| `scan_epub_document` | Scan .epub files for EPUB Accessibility 1.1 conformance |
| `extract_document_metadata` | Extract accessibility-relevant metadata |
| `batch_scan_documents` | Scan multiple documents in one call |
| `fix_document_metadata` | Fix document metadata (title, language, author) |
| `fix_document_headings` | Fix heading structure in documents |

### GLOW Bridge Tools

Each tool, with its description.

| Tool | Description |
|------|-------------|
| `glow_health_check` | Check health of a GLOW endpoint (default: `https://letitglow.app/mcp`) |
| `glow_audit_document` | Upload a markdown/html/docx file to GLOW and run `/audit` |
| `glow_fix_document` | Upload a markdown/html/docx file to GLOW and run `/fix` |
| `glow_convert_document` | Upload a markdown/html/docx file to GLOW and run `/convert` |
| `glow_generate_report` | Upload a markdown/html/docx file to GLOW and run `/report` |

### Advanced Tools (Optional Dependencies)

Each tool, with its requires and description.

| Tool | Requires | Description |
|------|----------|-------------|
| `run_axe_scan` | playwright, @axe-core/playwright | Run axe-core against a live URL |
| `run_playwright_a11y_tree` | playwright | Capture accessibility tree |
| `run_playwright_keyboard_scan` | playwright | Test keyboard navigation |
| `run_playwright_contrast_scan` | playwright | Visual contrast analysis |
| `run_playwright_viewport_scan` | playwright | Test reflow at multiple widths |
| `run_verapdf_scan` | veraPDF CLI | PDF/UA-1 (default), PDF/UA-2 or PDF/A validation, chosen with `flavour` (SARIF output) |
| `convert_pdf_form_to_html` | pdf-lib | Convert PDF forms to accessible HTML |

### Markdown Tools

Each tool, with its description.

| Tool | Description |
|------|-------------|
| `scan_markdown_document` | Scan markdown files for accessibility issues (links, alt text, headings, tables, emoji) |

### Caching Tools

Each tool, with its description.

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

For more background, see [veraPDF integration](../docs/reference/tools/verapdf-integration.md).

## Health Check

```bash
curl http://127.0.0.1:3100/health
# {"status":"ok","name":"a11y-agent-team","version":"7.1.0","mode":"stateful"}
```

## MCP Prompts

Pre-built prompt templates that guide the model through accessibility workflows.

| Prompt | Arguments | Description |
|--------|-----------|-------------|
| `audit-page` | `url` (required), `level` (optional: A/AA/AAA) | Structured WCAG audit instruction; walks through axe-core, heading, link, form, keyboard, and contrast scans |
| `check-component` | `component` (required) | Component-specific review using built-in guidelines (modal, tabs, accordion, combobox, carousel, form, live-region, navigation, general) |
| `explain-wcag` | `criterion` (required) | Explain a WCAG criterion with practical examples, common violations, and testing guidance |

## MCP Resources

Read-only data endpoints for accessibility reference material. The two with a `{...}` parameter are resource templates: a client lists or completes them and reads a concrete address such as `a11y://guidelines/modal`.

| Resource URI | Description |
|-------------|-------------|
| `a11y://guidelines/{component}` | Component accessibility guidelines in Markdown (modal, tabs, accordion, combobox, carousel, form, live-region, navigation, general) |
| `a11y://tools` | Auto-generated list of all registered tools with descriptions |
| `a11y://config/{profile}` | Scan configuration templates as JSON (strict, moderate, minimal) |

## Security

- **Path traversal prevention**: File operations validate paths against home directory and CWD boundaries (CWE-22)
- **Symlink resolution**: Write operations resolve symlinks to prevent escape (CWE-59)
- **SSRF protection**: URL-based tools validate schemes (http/https only)
- **Command injection prevention**: External commands use `execFile` (not `exec`) with argument arrays
- **File size limits**: Documents capped at 100 MB, batch operations at 50 files
- **Local binding**: Server binds to `127.0.0.1` by default (not exposed to network)

## Deployment

### Docker

```dockerfile
FROM node:24-slim
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

MIT. See [LICENSE](../LICENSE) in the repository root.
