# Model Context Protocol

The protocol the scanner server speaks, and the parts of it this package
depends on.

| | |
|---|---|
| Specification | <https://modelcontextprotocol.io/specification/latest> |
| Version relied on | what `@modelcontextprotocol/sdk` 1.32.2 implements: protocol revisions up to 2025-11-25 (it also negotiates 2025-06-18, 2025-03-26 and 2024-11-05). It does not implement 2026-07-28 |
| SDK | `@modelcontextprotocol/sdk` 1.32.2 with zod 4; `server.registerTool` and `server.registerPrompt` throughout, two resource templates |
| Transports | stdio (`mcp-server/stdio.js`, shipped bundled as `mcp-server/dist/stdio.mjs`) and Streamable HTTP (`mcp-server/server.js`). The legacy HTTP+SSE transport is not offered |
| Governs here | the 39 tools in `mcp-server/` |
| Distribution | the bundle inside the plugins, the Gemini extension archive, and, from 7.1.0 once published, npm (`@community-access/accessibility-agents-mcp`, bin `accessibility-agents-mcp`, the bundle only) and the MCP Registry (`io.github.Community-Access/accessibility-agents`, described by `server.json`, schema 2025-12-11) |
| Checked by | `mcp-server/mcp-conformance.test.js`, which connects a real client over stdio |

## The clauses this package depends on

**Tool annotations.** A tool may declare `readOnlyHint`, `destructiveHint`,
`idempotentHint` and `openWorldHint`. They are hints, not a security boundary;
a client uses them to decide what to interrupt a person for. Twenty-nine of the
39 tools only read. Without the hint, a client had to ask before every one of
them, which on a server built for bulk scanning was the difference between
scanning forty documents and giving up after six.

**Structured content.** A tool may declare an `outputSchema`, and return
`structuredContent` matching it. Every tool here does, and the scanners return
the same findings shape the skills do, so a result can be parsed by a script
rather than read by a person.

**Deterministic listing.** Servers should return tools in a stable order, so
the prompt prefix a client caches does not change between calls. The
conformance test lists twice and asserts the order is identical.

**Result size.** A tool that can return a whole document declares
`_meta["anthropic/maxResultSizeChars"]`, so a client can plan for it.

## What 2026-07-28 changes, and where this server stands

The latest revision, 2026-07-28, removes `initialize`, the `Mcp-Session-Id`
header and the HTTP GET endpoint, adds `server/discover`, requires `ttlMs` and
`cacheScope` on list results for client-side caching, and deprecates Roots,
Sampling, Logging and the HTTP+SSE transport.

This server does not conform to that revision. It implements what the SDK
provides. Its Streamable HTTP entry point is stateful by default, with
`Mcp-Session-Id` sessions and a GET event stream, which 2026-07-28 removes; a
stateless mode (POST only, no sessions) is available with
`A11Y_MCP_STATELESS=1`. It does not use the legacy HTTP+SSE transport, and it
already keeps its tool listing deterministic. Adopting the 2026-07-28 model and
the caching fields is on the [roadmap](../../ROADMAP.md); nothing about the
tool surface changes when it lands.

## The tool surface, measured

From a connected client, not from the source:

```text
tools                 39
deterministic order   true
annotations           39 (readOnlyHint 29, destructiveHint 4)
outputSchema          39
descriptions > 200ch  0
```

The full table with each tool's hints is generated into
[MCP tools](../reference/mcp-tools.md).

## How the metadata is kept honest

All annotations and output schemas live in one table,
`mcp-server/tool-metadata.js`, applied when the server is built. A tool
registered without an entry there is reported by the conformance test, so a
tool cannot be added without someone deciding whether it is safe to
auto-approve. The test also asserts the reverse: no table entry for a tool that
no longer exists.

The test found two mistakes in the first version of that table. The Glow
tools call a remote service and write the result back; they had been marked
local. That is what the test is for.

## The version

The server used to hard-code its version in three places while its manifest
said something else, so the handshake reported a build two releases stale.
It now reads `SERVER_VERSION` from `mcp-server/version.js`, which reads
`package.json`, and `scripts/check-release-consistency.js` fails on any
hard-coded version string.

## Sources

- MCP specification, tools: <https://modelcontextprotocol.io/specification/2026-07-28/server/tools>
- MCP changelog: <https://modelcontextprotocol.io/specification/2026-07-28/changelog>
- MCP versioning: <https://modelcontextprotocol.io/docs/learn/versioning>
- SDK releases: <https://registry.npmjs.org/@modelcontextprotocol/sdk>
- Claude Code MCP guidance, including result size: <https://code.claude.com/docs/en/mcp>
