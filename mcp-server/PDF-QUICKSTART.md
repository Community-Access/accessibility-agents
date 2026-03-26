# PDF Quick Start

This guide is the shortest path from "I have a PDF" to "I can scan it with the open-source MCP server in this repository."

## Server Location

In this repository, the MCP server is located in the top-level `mcp-server/` folder.

If this repository is checked out at `d:/code/agents`, the full path is:

```text
d:/code/agents/mcp-server
```

Use that path locally when running commands in this workspace. Do not hardcode it into shared project documentation unless your team uses the same checkout path.

If you use the guided installers in this repository, the MCP server is copied to one of these stable locations:

| Install mode | MCP server path |
|--------------|-----------------|
| Project install | `./mcp-server` in the target project |
| Global install | `~/.a11y-agent-team/mcp-server` |

Those are the paths the update and uninstall scripts now manage.

## Will It Run Locally Or On A Server?

Both.

- **Local stdio**: good for Claude Desktop and one-user local use
- **Local HTTP**: good for VS Code Copilot and local testing
- **Shared HTTP**: good for teams, CI/CD, and remote clients

If you are just getting started, run it locally first.

## The Smallest Working Setup

PDF scanning works only when a client can call the MCP server.

| Setup | Works? | Notes |
|-------|--------|-------|
| Prompt file only | No | Prompt text alone cannot scan PDFs |
| Agent file only | No | The agent describes the workflow but does not execute scanning alone |
| MCP server only | Yes, via MCP clients | Best if you want the open-source scanning tool first |
| Agent file + MCP server | Yes | Best guided chat experience |

## Step 1: Install Dependencies

You need Node.js 18 or later plus npm before the MCP server can run.

If Node.js is missing, the installers in this repository now offer to install it for you:

- Windows PowerShell installer: tries `winget install --exact --id OpenJS.NodeJS.LTS`
- macOS shell installer: tries Homebrew when it is available

Manual fallback: <https://nodejs.org/en/download>

From the `mcp-server/` folder:

```bash
cd d:/code/agents/mcp-server
npm install
```

Requires Node.js 18 or later.

If `node --version` reports a version older than 18, upgrade Node.js before running `npm install`.

### Prerequisite Matrix

| Class | Requirement | Needed For | Required? |
|------|-------------|------------|-----------|
| Runtime | Node.js 18+ | Running the MCP server | Yes |
| Runtime | npm | Installing MCP server dependencies | Yes |
| Runtime | MCP server dependencies | Core scanning tools | Yes |
| Client | MCP-compatible client | Calling the server tools | Yes |
| Optional feature | Java 11+ + `verapdf` | Deep PDF/UA validation via `run_verapdf_scan` | No |
| Optional feature | `pdf-lib` | `convert_pdf_form_to_html` | No |
| Installer-only | Python 3 | Some shell installer automation on macOS | No |

Python is not required for PDF scanning. It is only an installer helper in some shell-based setup paths.

## Step 2: Start The Server

### Option A: Local HTTP

```bash
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
node stdio.js
```

Use stdio mode when the client wants to launch the server process directly.

## Step 3: Connect A Client

### VS Code Copilot

Add this to your VS Code settings:

```json
{
  "mcp": {
    "servers": {
      "a11y-ag  ent-team": {
        "url": "http://127.0.0.1:3100/mcp"
      }
    }
  }
}
```

### Claude Desktop

HTTP mode:

```json
{
  "mcpServers": {
    "a11y-agent-team": {
      "url": "http://127.0.0.1:3100/mcp"
    }
  }
}
```

stdio mode:

```json
{
  "mcpServers": {
    "a11y-agent-team": {
      "command": "node",
      "args": ["d:/code/agents/mcp-server/stdio.js"]
    }
  }
}
```

Adjust the absolute path for your machine if this repository is checked out somewhere else.

## Step 4: Run A PDF Scan

The open-source tool you are invoking is `scan_pdf_document`.

Natural-language examples:

- `Check report.pdf for accessibility`
- `Scan brochure.pdf for PDF/UA issues`
- `Review this PDF for tagging, title, language, and bookmarks`

If you also copied the PDF agent file, you can use the guided workflow phrasing:

- `@pdf-accessibility scan report.pdf`

## Optional: Add The PDF Agent Layer

If you want the guided PDF workflow in chat, add these files to your project or user customizations:

- `.github/agents/pdf-accessibility.agent.md`
- `.github/agents/pdf-scan-config.agent.md`

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
- `Validate report.pdf using PDF/UA-1 rules`

The server exposes this as `run_verapdf_scan` when `verapdf` is installed on the same machine.

## What To Tell Users

The clearest explanation is:

- The PDF agent tells the model how to help
- The MCP server provides the actual scanning tool
- veraPDF is an optional deeper validator, not a requirement for baseline scanning

## Related Files

- `README.md`
- `server.js`
- `stdio.js`
- `server-core.js`
- `tools/verapdf-tools.js`
