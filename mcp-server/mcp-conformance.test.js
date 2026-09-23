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

  /**
   * The gate that was missing in 7.0.2 (issue #205).
   *
   * Every other test here reads the tool listing. None of them issued a call,
   * so when 7.0.0 added output schemas and 7.0.1 moved the SDK to a version
   * that enforces them, every one of the 39 tools failed on invocation and the
   * suite stayed green. The SDK rejects a result with an outputSchema and no
   * structuredContent before it reaches the client, so one real call per tool
   * is what proves a tool works at all.
   *
   * Arguments below are deliberately the cheapest that reach the handler:
   * bad paths and unreachable hosts are fine, because a handler that errors
   * still has to return a shape the SDK accepts.
   */
  const CALL_ARGS = {
    check_contrast: { foreground: "#767676", background: "#ffffff" },
    check_apca_contrast: { foreground: "#767676", background: "#ffffff" },
    check_color_blindness: { colors: ["#ff0000", "#00ff00"] },
    check_reading_level: { text: "The cat sat on the mat. It was a warm day." },
    get_accessibility_guidelines: { component: "modal" },
    check_heading_structure: { html: "<h1>Title</h1><h3>Skipped</h3>" },
    check_link_text: { html: '<a href="/x">click here</a>' },
    check_form_labels: { html: '<input type="text" name="q">' },
    validate_caption_file: { filePath: "no-such-file.vtt" },
    scan_office_document: { filePath: "no-such-file.docx" },
    scan_pdf_document: { filePath: "no-such-file.pdf" },
    scan_epub_document: { filePath: "no-such-file.epub" },
    scan_markdown_document: { filePath: "no-such-file.md" },
    extract_document_metadata: { filePath: "no-such-file.docx" },
    batch_scan_documents: { filePaths: ["no-such-file.docx"] },
    run_axe_scan: { url: "http://127.0.0.1:1/" },
    run_playwright_a11y_tree: { url: "http://127.0.0.1:1/" },
    run_playwright_keyboard_scan: { url: "http://127.0.0.1:1/" },
    run_playwright_contrast_scan: { url: "http://127.0.0.1:1/" },
    run_playwright_viewport_scan: { url: "http://127.0.0.1:1/" },
    run_verapdf_scan: { filePath: "no-such-file.pdf" },
    check_verapdf_installation: {},
    glow_health_check: { baseUrl: "http://127.0.0.1:1", timeoutMs: 1000 },
    glow_audit_document: { filePath: "no-such-file.md", format: "markdown", baseUrl: "http://127.0.0.1:1", timeoutMs: 1000 },
    glow_fix_document: { filePath: "no-such-file.md", format: "markdown", baseUrl: "http://127.0.0.1:1", timeoutMs: 1000 },
    glow_convert_document: { filePath: "no-such-file.md", fromFormat: "markdown", toFormat: "html", baseUrl: "http://127.0.0.1:1", timeoutMs: 1000 },
    glow_generate_report: { filePath: "no-such-file.md", format: "markdown", baseUrl: "http://127.0.0.1:1", timeoutMs: 1000 },
    list_audit_history: {},
    get_audit_result: { auditId: "no-such-audit" },
    get_audit_trend: { target: "no-such-target" },
    check_audit_cache: { filePaths: ["no-such-file.docx"] },
    save_audit_result: null, // writes to .a11y-history; covered by server-core.test.js
    update_audit_cache: null, // writes .a11y-cache.json
    prune_audit_history: null, // deletes files
    convert_pdf_form_to_html: { filePath: "no-such-file.pdf" },
    generate_accessibility_statement: {
      organization: "Example",
      websiteUrl: "https://example.com",
      contactEmail: "a11y@example.com",
      conformanceStatus: "partially",
    },
    fix_document_metadata: { filePath: "no-such-file.docx", title: "T" },
    fix_document_headings: { filePath: "no-such-file.docx" },
    render_accessibility_report: null, // writes a report file
  };

  test("every tool returns a result the SDK accepts", async (t) => {
    const unlisted = tools.map((x) => x.name).filter((n) => !(n in CALL_ARGS));
    assert.deepEqual(unlisted, [], "a tool was added with no entry here, so nothing ever calls it");

    for (const tool of tools) {
      const args = CALL_ARGS[tool.name];
      if (args === null) continue; // skipped: changes state on disk

      await t.test(tool.name, async () => {
        const result = await client.callTool({ name: tool.name, arguments: args });
        assert.ok(result, `${tool.name} returned nothing`);
        assert.ok(Array.isArray(result.content), `${tool.name} returned no content array`);

        // The 7.0.2 failure arrives as isError with the SDK's own complaint in
        // the text, which is indistinguishable from a handler's own error
        // unless the text is read. Checking isError alone is what let it ship.
        const text = result.content.map((c) => c.text || "").join("\n");
        assert.ok(
          !/Output validation error|-32602/.test(text),
          `${tool.name}: the SDK rejected the server's own output: ${text.slice(0, 200)}`,
        );

        if (!result.isError) {
          assert.ok(
            result.structuredContent,
            `${tool.name} declares an output schema, so a successful result must carry structuredContent`,
          );
        }
      });
    }
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
