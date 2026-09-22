/**
 * mcp-conformance.test.js - the tool surface a client actually sees.
 *
 * server-core.test.js proves the tools compute the right answers. This proves
 * they are usable: that a client can tell a scan from a write without asking a
 * person, that it can parse a result instead of pattern-matching prose, and
 * that nothing was added without someone deciding which of those it is.
 *
 * Every assertion here maps to a specific failure a user would feel:
 * an approval prompt per document during a bulk scan, a result that can only be
 * read by a human, a destructive tool that looks safe, or a cache that misses
 * because the tool order changed between calls.
 *
 * Run: node --test mcp-conformance.test.js
 */

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { TOOL_METADATA } from "./tool-metadata.js";
import { SERVER_VERSION } from "./version.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const STDIO = path.join(HERE, "stdio.js");

/** Tools that change something on disk. Everything else must be read-only. */
const WRITERS = new Set([
  "save_audit_result",
  "update_audit_cache",
  "prune_audit_history",
  "fix_document_metadata",
  "fix_document_headings",
  "glow_fix_document",
  "glow_convert_document",
  "convert_pdf_form_to_html",
  "generate_accessibility_statement",
  "render_accessibility_report",
]);

/** The one tool that removes data. It must never be auto-approved. */
const DESTRUCTIVE = new Set([
  "prune_audit_history",
  "fix_document_metadata",
  "fix_document_headings",
  "glow_fix_document",
]);

let client;
let tools;

describe("MCP tool surface", () => {
  before(async () => {
    client = new Client({ name: "conformance", version: "1.0.0" }, { capabilities: {} });
    await client.connect(new StdioClientTransport({ command: process.execPath, args: [STDIO] }));
    tools = (await client.listTools()).tools;
  });

  after(async () => {
    if (client) await client.close();
  });

  test("the server reports the version in its package manifest", () => {
    const info = client.getServerVersion();
    assert.equal(
      info.version,
      SERVER_VERSION,
      "the advertised version drifted from package.json; a client cannot tell which build it is talking to",
    );
  });

  test("every tool declares annotations", () => {
    const missing = tools.filter((t) => !t.annotations || Object.keys(t.annotations).length === 0);
    assert.deepEqual(
      missing.map((t) => t.name),
      [],
      "a tool without annotations forces a client to ask the user before every call",
    );
  });

  test("every tool declares an output schema", () => {
    const missing = tools.filter((t) => !t.outputSchema);
    assert.deepEqual(
      missing.map((t) => t.name),
      [],
      "a tool without an output schema can only be read by a human, not consumed by a script",
    );
  });

  test("read-only tools are marked read-only", () => {
    const wrong = tools
      .filter((t) => !WRITERS.has(t.name))
      .filter((t) => t.annotations.readOnlyHint !== true);
    assert.deepEqual(
      wrong.map((t) => t.name),
      [],
      "these tools only read, so a client should be able to auto-approve them during a bulk scan",
    );
  });

  test("writing tools are not marked read-only", () => {
    const wrong = tools.filter((t) => WRITERS.has(t.name)).filter((t) => t.annotations.readOnlyHint === true);
    assert.deepEqual(
      wrong.map((t) => t.name),
      [],
      "a tool marked read-only that writes would be auto-approved and would change the user's files silently",
    );
  });

  test("destructive tools are marked destructive", () => {
    for (const name of DESTRUCTIVE) {
      const tool = tools.find((t) => t.name === name);
      assert.ok(tool, `${name} is missing from the tool list`);
      assert.equal(
        tool.annotations.destructiveHint,
        true,
        `${name} removes or overwrites data and must say so`,
      );
    }
  });

  test("tools that reach the network say so", () => {
    for (const t of tools) {
      const reachesOut = t.name.startsWith("run_playwright") || t.name === "run_axe_scan" || t.name.startsWith("glow_");
      if (!reachesOut) continue;
      assert.equal(
        t.annotations.openWorldHint,
        true,
        `${t.name} loads a page or calls a service, so openWorldHint must be true`,
      );
    }
  });

  test("descriptions stay to one sentence", () => {
    const verbose = tools.filter((t) => (t.description || "").length > 200);
    assert.deepEqual(
      verbose.map((t) => `${t.name} (${t.description.length})`),
      [],
      "a client shows the description in a picker, where a paragraph is noise",
    );
  });

  test("every tool has a description at all", () => {
    const bare = tools.filter((t) => !t.description || t.description.trim().length < 20);
    assert.deepEqual(bare.map((t) => t.name), [], "a tool nobody can identify will not be chosen");
  });

  test("tool order is stable between calls", async () => {
    const again = (await client.listTools()).tools.map((t) => t.name);
    assert.deepEqual(
      again,
      tools.map((t) => t.name),
      "an unstable listing order breaks prompt caching for every client on every turn",
    );
  });

  test("the metadata table and the registered tools agree", () => {
    const registered = new Set(tools.map((t) => t.name));
    const untabled = [...registered].filter((n) => !TOOL_METADATA[n]);
    const stale = Object.keys(TOOL_METADATA).filter((n) => !registered.has(n));

    assert.deepEqual(untabled, [], "a tool was added without deciding whether it is safe to auto-approve");
    assert.deepEqual(stale, [], "the metadata table names tools that no longer exist");
  });

  test("large-result tools declare a result cap", () => {
    const scanners = tools.filter((t) => t.name.startsWith("scan_") || t.name.startsWith("run_"));
    for (const t of scanners) {
      const cap = t._meta && t._meta["anthropic/maxResultSizeChars"];
      assert.ok(
        typeof cap === "number" && cap > 0,
        `${t.name} can return a whole document, so it should declare a result cap`,
      );
    }
  });
});
