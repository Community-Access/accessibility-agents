# A11y Agent Team — MCP Server

Server-based MCP (Model Context Protocol) server that provides accessibility scanning tools over HTTP. Works with Claude Desktop, VS Code Copilot, and any MCP-compatible client.

## Architecture

The server supports two transport modes:

| Mode | Entry Point | Transport | Use Case |
|------|-------------|-----------|----------|
| **HTTP** | `server.js` | Streamable HTTP + SSE | Remote clients, shared servers, CI/CD |
| **stdio** | `stdio.js` | stdin/stdout | Claude Desktop `mcp.json`, local use |

Both modes share the same tool implementations via `server-core.js`.

## Quick Start

```bash
cd mcp-server
npm install

# HTTP mode (default)
npm start
# → http://127.0.0.1:3100/mcp

# stdio mode (for Claude Desktop)
node stdio.js
```

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
| `extract_document_metadata` | Extract accessibility-relevant metadata |
| `batch_scan_documents` | Scan multiple documents in one call |

### Advanced Tools (Optional Dependencies)

| Tool | Requires | Description |
|------|----------|-------------|
| `run_axe_scan` | playwright, @axe-core/playwright | Run axe-core against a live URL |
| `run_playwright_a11y_tree` | playwright | Capture accessibility tree |
| `run_playwright_keyboard_scan` | playwright | Test keyboard navigation |
| `run_playwright_contrast_scan` | playwright | Visual contrast analysis |
| `run_playwright_viewport_scan` | playwright | Test reflow at multiple widths |
| `run_verapdf_scan` | veraPDF CLI | PDF/UA-1 conformance validation |
| `convert_pdf_form_to_html` | pdf-lib | Convert PDF forms to accessible HTML |

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

## Health Check

```bash
curl http://127.0.0.1:3100/health
# {"status":"ok","name":"a11y-agent-team","version":"3.2.0","mode":"stateful"}
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
