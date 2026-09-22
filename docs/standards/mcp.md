# Model Context Protocol

The protocol the scanner server speaks, and the parts of it this package
depends on.

| | |
|---|---|
| Specification | <https://modelcontextprotocol.io/specification/latest> |
| Version relied on | 2025-06-18 handshake, with the tool metadata that carries forward into 2026-07-28 |
| SDK | `@modelcontextprotocol/sdk` 1.x, `server.registerTool` throughout |
| Governs here | the 39 tools in `mcp-server/` |
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

The latest revision makes sessions stateless, adds `server/discover`, returns
`ttlMs` and `cacheScope` from `tools/list` for client-side caching, and
deprecates Roots, Sampling, Logging and HTTP with SSE. This server uses none
of the deprecated features, runs Streamable HTTP and stdio, and already keeps
its listing deterministic. Adopting the stateless transport and the caching
fields is on the roadmap; nothing about the tool surface changes when it lands.

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
- MCP changelog: <https://modelcontextprotocol.io/specification/latest/changelog>
- Claude Code MCP guidance, including result size: <https://code.claude.com/docs/en/mcp>
