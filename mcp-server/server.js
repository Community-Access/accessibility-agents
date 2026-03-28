#!/usr/bin/env node
/**
 * A11y Agent Team — HTTP MCP Server Entry Point
 *
 * Starts the MCP server over Streamable HTTP transport (with SSE fallback).
 * Compatible with any MCP client that supports HTTP transport.
 *
 * Usage:
 *   node server.js                    # Starts on port 3100
 *   PORT=8080 node server.js          # Custom port
 *   A11Y_MCP_STATELESS=1 node server.js  # Stateless mode (no sessions)
 *
 * Environment variables:
 *   PORT              - HTTP port (default: 3100)
 *   A11Y_MCP_STATELESS - Set to "1" for stateless mode (default: stateful)
 *   A11Y_MCP_HOST     - Bind address (default: 127.0.0.1)
 */

import express from "express";
import { randomUUID } from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "./server-core.js";

const PORT = parseInt(process.env.PORT || "3100", 10);
const HOST = process.env.A11Y_MCP_HOST || "127.0.0.1";
const STATELESS = process.env.A11Y_MCP_STATELESS === "1";

const app = express();
app.use(express.json());

// Deny cross-origin requests (CWE-942)
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "null");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, DELETE");
  next();
});

if (STATELESS) {
  // ---- Stateless mode: new server per request ----
  app.post("/mcp", async (req, res) => {
    const server = createServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless
    });
    res.on("close", () => { transport.close(); server.close(); });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  app.get("/mcp", (_req, res) => {
    res.status(405).json({ error: "SSE not available in stateless mode. Use POST." });
  });

  app.delete("/mcp", (_req, res) => {
    res.status(405).json({ error: "Session termination not available in stateless mode." });
  });
} else {
  // ---- Stateful mode: sessions with SSE support ----
  const MAX_SESSIONS = 100;
  const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes
  const sessions = new Map();

  // Periodic sweep: remove expired sessions
  setInterval(() => {
    const now = Date.now();
    for (const [id, session] of sessions) {
      if (now - session.lastActivity > SESSION_TTL_MS) {
        session.transport.close();
        session.server.close();
        sessions.delete(id);
      }
    }
  }, 60_000).unref();

  app.post("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"];
    if (sessionId && sessions.has(sessionId)) {
      // Existing session
      const session = sessions.get(sessionId);
      session.lastActivity = Date.now();
      await session.transport.handleRequest(req, res, req.body);
      return;
    }
    if (sessionId && !sessions.has(sessionId)) {
      res.status(404).json({ error: "Session not found. Start a new session without mcp-session-id header." });
      return;
    }
    // New session
    if (sessions.size >= MAX_SESSIONS) {
      res.status(503).json({ error: "Too many active sessions. Try again later." });
      return;
    }
    const server = createServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (id) => {
        sessions.set(id, { server, transport, lastActivity: Date.now() });
      },
    });
    transport.onclose = () => {
      const id = transport.sessionId;
      if (id) sessions.delete(id);
    };
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  app.get("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"];
    if (!sessionId || !sessions.has(sessionId)) {
      res.status(400).json({ error: "Invalid or missing session ID for SSE." });
      return;
    }
    const { transport } = sessions.get(sessionId);
    await transport.handleRequest(req, res);
  });

  app.delete("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"];
    if (!sessionId || !sessions.has(sessionId)) {
      res.status(404).json({ error: "Session not found." });
      return;
    }
    const { transport, server } = sessions.get(sessionId);
    await transport.handleRequest(req, res);
    transport.close();
    await server.close();
    sessions.delete(sessionId);
  });
}

// ---- Health check ----
app.get("/health", (_req, res) => {
  res.json({ status: "ok", name: "a11y-agent-team", version: "4.6.0", mode: STATELESS ? "stateless" : "stateful" });
});

if (HOST !== "127.0.0.1" && HOST !== "localhost" && HOST !== "::1") {
  console.warn("WARNING: Server bound to non-loopback address. No authentication is configured.");
}

app.listen(PORT, HOST, () => {
  console.log(`A11y Agent Team MCP server listening on http://${HOST}:${PORT}/mcp`);
  console.log(`Mode: ${STATELESS ? "stateless" : "stateful (sessions + SSE)"}`);
  console.log(`Health check: http://${HOST}:${PORT}/health`);
});
