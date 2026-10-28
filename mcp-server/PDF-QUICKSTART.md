# PDF Quick Start

This guide is the shortest path from "I have a PDF" to "I can scan it with the open-source MCP server in this repository."

## Server Location

In this repository, the MCP server is located in the top-level `mcp-server/` folder.

The examples below use `/path/to/accessibility-agents` for your checkout; replace it with the real path.

Neither `npm run setup` nor a plugin install copies the server anywhere else: it runs from `mcp-server/` in your checkout, or in your client's installed copy of the plugin. The stdio server ships as a bundle, `mcp-server/dist/stdio.mjs`, which needs no `npm install`; a plugin install launches it directly.

## Will It Run Locally Or On A Server?

Both.

- **Local stdio**: good for Claude Desktop and one-user local use
- **Local HTTP**: good for VS Code and local testing
- **Shared HTTP**: good for teams, CI/CD, and remote clients

If you are just getting started, run it locally first.

## The Smallest Working Setup

PDF scanning works only when a client can call the MCP server.

| Setup | Works? | Notes |
|-------|--------|-------|
| Skills only | No | The `pdf-accessibility` skill describes the workflow but does not execute scanning alone |
| MCP server only | Yes, via MCP clients | Best if you want the open-source scanning tool first |
| Skills + MCP server | Yes | Best guided chat experience |

## Step 1: Install Dependencies

You need a supported Node.js LTS line (26, 24 or 22) plus npm before the MCP server can run. The installer in this repository does not install Node.js; get it from <https://nodejs.org/en/download>.

The stdio bundle needs nothing more. Install the server's dependencies only for
the HTTP server (Option A below) or for the optional `convert_pdf_form_to_html`
tool. From the repository root:

```bash
cd /path/to/accessibility-agents
npm install --prefix mcp-server
```

If `node --version` reports a version older than 22, upgrade Node.js before running `npm install`. Node 18 and 20 are end of life.

### Prerequisite Matrix

Each class, with requirement, needed for and required.

| Class | Requirement | Needed For | Required? |
|------|-------------|------------|-----------|
| Runtime | Node.js LTS (26, 24 or 22) | Running the MCP server | Yes |
| Runtime | none for the stdio bundle | `scan_pdf_document` and the other core tools, from `mcp-server/dist/stdio.mjs` | No |
| HTTP or development | npm and the MCP server dependencies (`npm install --prefix mcp-server`) | The HTTP server (Option A), the unbundled source | Only for those |
| Client | MCP-compatible client | Calling the server tools | Yes |
| Optional feature | Java 11+ + `verapdf` | Deep PDF/UA validation via `run_verapdf_scan` | No |
| Optional feature | `pdf-lib` (an optional dependency, `npm install --prefix mcp-server`) | `convert_pdf_form_to_html` | No |

Python is not required for PDF scanning or for installing the package.

## Step 2: Start The Server

### Option A: Local HTTP

```bash
cd mcp-server
npm start
```

Default endpoint:

```text
http://127.0.0.1:3100/mcp
```

Health endpoint:

```text
http://127.0.0.1:3100/health
```

### Option B: Local stdio

```bash
node mcp-server/dist/stdio.mjs
```

Use stdio mode when the client wants to launch the server process directly.

## Step 3: Connect A Client

### VS Code

Add this to `.vscode/mcp.json` in your workspace (or run **MCP: Open User Configuration** for every workspace):

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

### Claude Desktop

Claude Desktop starts local servers over stdio from `claude_desktop_config.json` (Settings, Developer, Edit Config):

```json
{
  "mcpServers": {
    "a11y-agent-team": {
      "command": "node",
      "args": ["/path/to/accessibility-agents/mcp-server/dist/stdio.mjs"]
    }
  }
}
```

Use the absolute path to your checkout.

## Step 4: Run A PDF Scan

The open-source tool you are invoking is `scan_pdf_document`.

Natural-language examples:

- `Check report.pdf for accessibility`
- `Scan brochure.pdf for PDF/UA issues`
- `Review this PDF for tagging, title, language, and bookmarks`

If you also installed the skills, you can ask for the guided workflow by name, for example `/pdf-accessibility scan report.pdf` in a client's slash menu, or "check these PDFs", which `document-accessibility-wizard` routes.

## Optional: Add The PDF Skill Layer

If you want the guided PDF workflow in chat, install the package's skills (see [Getting started](../docs/getting-started/README.md)). The PDF workflow lives in:

- `skills/pdf-accessibility/`
- `skills/pdf-scan-config/`

Optional project config:

- Copy `templates/pdf-config-moderate.json` to `.a11y-pdf-config.json`

## Optional: Make veraPDF Available

The built-in scanner works without veraPDF. Install veraPDF only if you want deeper PDF/UA validation.

### Install veraPDF

**Windows**

Install Java first if it is not already present:

```bash
winget install --exact --id EclipseAdoptium.Temurin.21.JRE
```

Then install veraPDF using Chocolatey if available:

```bash
choco install verapdf
```

If you do not use Chocolatey, use the manual installer from <https://docs.verapdf.org/install/>.

**macOS**

```bash
brew install verapdf
```

Manual download: <https://docs.verapdf.org/install/>

### Verify veraPDF

```bash
verapdf --version
```

If you just installed Java or veraPDF on Windows, restart your terminal or VS Code before verifying so the updated `PATH` is visible.

### Run veraPDF directly

```bash
verapdf --flavour ua1 --format text path/to/file.pdf
```

### Run veraPDF through MCP

Ask your MCP client to run a deep PDF validation, for example:

- `Run veraPDF on report.pdf and summarize the failures`
- `Validate report.pdf using PDF/UA-1 rules` (PDF/UA-2 is also available through the tool's `flavour` option)

The server exposes this as `run_verapdf_scan` when `verapdf` is installed on the same machine.

## What To Tell Users

The clearest explanation is:

- The PDF skill tells the model how to help
- The MCP server provides the actual scanning tool
- veraPDF is an optional deeper validator, not a requirement for baseline scanning

## Related Files

- `README.md`
- `server.js`
- `stdio.js`
- `server-core.js`
- `tools/verapdf-tools.js`
