# Privacy Policy

**Last updated:** May 25, 2026
**Applies to:** A11y Agent Team MCP Server, distributed as `@a11y-agent-team/mcp-server` and as an Anthropic MCPB desktop extension.

## Summary

The A11y Agent Team MCP Server is a local, self-hosted accessibility scanning tool. It does not collect, transmit, or store personal information on any server operated by the project maintainers. All scanning happens on the user's own machine. Files, URLs, and scan results never leave the user's device unless the user explicitly directs them elsewhere (for example, by configuring the server to call a third-party browser automation service, or by sharing exported reports themselves).

## Information the server processes

When the user invokes a tool, the server processes only the inputs the user supplies for that invocation. Typical inputs are:

- File paths to local Office documents, PDFs, ePub files, and markdown files
- URLs the user asks the server to scan with axe-core or Playwright
- Color values, text strings, and short configuration objects
- Audit history entries the user chooses to persist to a local `.a11y-history/` directory

The server does not transmit these inputs to a remote service operated by the project. The server runs entirely on the user's device. The only outbound network traffic the server initiates is:

1. Fetching URLs the user explicitly asks it to scan, using a local browser controlled by Playwright
2. Optional veraPDF validation, which runs locally via the user-installed veraPDF CLI

## Information the server stores

The server stores data only in files the user explicitly opts into:

- `.a11y-cache.json` in the user's project directory, used to skip re-scanning unchanged files
- `.a11y-history/` in the user's project directory, used to track audit results over time

Both locations are under the user's control. The user can delete them at any time. The server never writes outside the working directory the user provides.

## Information the server does not collect

The server does not include analytics, telemetry, crash reporting, or any background phone-home behavior. It does not transmit usage data to the project maintainers or to any third party. It does not require an account, API key, or authentication of any kind.

## Third-party services

When the user runs Playwright-based tools, the local Playwright browser may load resources from the URL the user provided, including any third-party scripts or trackers on the scanned page. The project does not control or process that traffic. When the user runs veraPDF-based tools, the locally installed veraPDF CLI processes the supplied PDF on the user's machine.

## Data retention

Because the server does not transmit data to the project, there is no retention policy on the project's side. Local cache and history files persist until the user removes them.

## Children's privacy

The server is a developer tool and is not directed at children. The project does not knowingly process information from children under 13.

## Changes to this policy

Updates to this policy will be published in this file and reflected in the `mcp-server/manifest.json` `privacy_policies` array. The "Last updated" date at the top of this document will be revised when the policy changes.

## Contact

Privacy questions and reports can be filed at: <https://github.com/Community-Access/accessibility-agents/issues>
