#!/usr/bin/env node
/**
 * A11y Agent Team — stdio MCP Server Entry Point
 *
 * Runs the MCP server over stdio transport for use with Claude Desktop
 * mcp.json or any client that expects stdio-based MCP servers.
 *
 * Usage:
 *   node stdio.js
 *
 * Claude Desktop mcp.json configuration:
 *   {
 *     "mcpServers": {
 *       "a11y-agent-team": {
 *         "command": "node",
 *         "args": ["/path/to/mcp-server/stdio.js"]
 *       }
 *     }
 *   }
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server-core.js";

const server = createServer();
const transport = new StdioServerTransport();
await server.connect(transport);
