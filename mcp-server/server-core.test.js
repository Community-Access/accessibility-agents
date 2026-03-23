/**
 * A11y Agent Team — MCP Server Tests
 *
 * Tests for server-core.js: path validation, contrast calculation,
 * HTML analysis helpers, ZIP/Office parsing, PDF parsing, and MCP tool
 * integration via the SDK client.
 *
 * Run:  node --test server-core.test.js
 */

import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { join, resolve, sep } from "node:path";
import { homedir } from "node:os";
import { writeFile, mkdir, rm } from "node:fs/promises";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Import the public export for path validation
import { validateFilePath, createServer } from "./server-core.js";

// =========================================================================
// Path Validation (CWE-22 / CWE-59)
// =========================================================================

describe("validateFilePath", () => {
  const cwd = process.cwd();
  const home = homedir();

  it("allows files under cwd for reads", () => {
    const result = validateFilePath(join(cwd, "package.json"));
    assert.equal(result, resolve(cwd, "package.json"));
  });

  it("allows files under home directory for reads", () => {
    const result = validateFilePath(join(home, "somefile.txt"));
    assert.equal(result, resolve(home, "somefile.txt"));
  });

  it("rejects paths outside home and cwd for reads", () => {
    // Use a path guaranteed to be outside both
    const outsidePath =
      process.platform === "win32" ? "Z:\\nonexistent\\evil.txt" : "/tmp/evil.txt";

    // Only reject if it's actually outside home and cwd
    const resolved = resolve(outsidePath);
    const underHome =
      resolved === home || resolved.startsWith(home + sep);
    const underCwd = resolved === cwd || resolved.startsWith(cwd + sep);

    if (!underHome && !underCwd) {
      assert.throws(() => validateFilePath(outsidePath), /must be within/);
    }
  });

  it("rejects traversal sequences", () => {
    // Try to escape cwd via ../../../
    const traversal = join(cwd, "..", "..", "..", "etc", "passwd");
    const resolved = resolve(traversal);
    const underHome =
      resolved === home || resolved.startsWith(home + sep);
    const underCwd = resolved === cwd || resolved.startsWith(cwd + sep);

    if (!underHome && !underCwd) {
      assert.throws(() => validateFilePath(traversal), /must be within/);
    }
  });

  it("restricts writes to cwd only", () => {
    // Writes under home (but not cwd) should fail
    if (!home.startsWith(cwd) && !cwd.startsWith(home)) {
      assert.throws(
        () => validateFilePath(join(home, "test.txt"), { write: true }),
        /current working directory/
      );
    }
  });

  it("allows writes under cwd", () => {
    const result = validateFilePath(join(cwd, "test-output.txt"), {
      write: true,
    });
    assert.ok(result.startsWith(cwd));
  });
});

// =========================================================================
// Contrast Calculation (via check_contrast tool)
// =========================================================================

describe("check_contrast tool", () => {
  let server;
  let callTool;

  before(async () => {
    server = createServer();
    callTool = async (name, args) => {
      const tool = server._registeredTools[name];
      if (!tool) throw new Error(`Tool not found: ${name}`);
      return tool.handler(args, {});
    };
  });

  it("calculates black on white as 21:1", async () => {
    const result = await callTool("check_contrast", {
      foreground: "#000000",
      background: "#ffffff",
    });
    const text = result.content[0].text;
    assert.ok(text.includes("21:1"), `Expected 21:1 ratio, got: ${text}`);
    assert.ok(text.includes("PASS"));
  });

  it("calculates white on white as 1:1", async () => {
    const result = await callTool("check_contrast", {
      foreground: "#ffffff",
      background: "#ffffff",
    });
    const text = result.content[0].text;
    assert.ok(text.includes("1:1"), `Expected 1:1 ratio, got: ${text}`);
    assert.ok(text.includes("FAIL"));
  });

  it("handles 3-digit hex", async () => {
    const result = await callTool("check_contrast", {
      foreground: "#000",
      background: "#fff",
    });
    const text = result.content[0].text;
    assert.ok(text.includes("21:1"));
  });

  it("reports fail for low contrast", async () => {
    const result = await callTool("check_contrast", {
      foreground: "#777777",
      background: "#888888",
    });
    const text = result.content[0].text;
    assert.ok(text.includes("FAIL"));
  });

  it("handles invalid input gracefully", async () => {
    const result = await callTool("check_contrast", {
      foreground: "not-a-color",
      background: "#fff",
    });
    const text = result.content[0].text;
    // Invalid colors produce NaN ratio and FAIL verdicts
    assert.ok(text.includes("NaN") || text.includes("FAIL"));
  });
});

// =========================================================================
// Heading Structure Analysis
// =========================================================================

describe("check_heading_structure tool", () => {
  let callTool;

  before(async () => {
    const server = createServer();
    callTool = async (name, args) => {
      const tool = server._registeredTools[name];
      return tool.handler(args, {});
    };
  });

  it("detects proper heading hierarchy", async () => {
    const html = "<h1>Title</h1><h2>Section</h2><h3>Sub</h3>";
    const result = await callTool("check_heading_structure", { html });
    const text = result.content[0].text;
    assert.ok(text.includes("H1: Title"));
    assert.ok(text.includes("No heading issues"));
  });

  it("detects skipped heading levels", async () => {
    const html = "<h1>Title</h1><h3>Skipped</h3>";
    const result = await callTool("check_heading_structure", { html });
    const text = result.content[0].text;
    assert.ok(text.includes("Skipped heading level"));
  });

  it("detects multiple H1 elements", async () => {
    const html = "<h1>First</h1><h1>Second</h1>";
    const result = await callTool("check_heading_structure", { html });
    const text = result.content[0].text;
    assert.ok(text.includes("2") && text.includes("h1"));
  });

  it("detects missing H1", async () => {
    const html = "<h2>No H1</h2>";
    const result = await callTool("check_heading_structure", { html });
    const text = result.content[0].text;
    assert.ok(text.includes("No <h1>"));
  });

  it("handles no headings", async () => {
    const html = "<p>No headings here</p>";
    const result = await callTool("check_heading_structure", { html });
    const text = result.content[0].text;
    assert.ok(text.includes("No headings"));
  });
});

// =========================================================================
// Link Text Analysis
// =========================================================================

describe("check_link_text tool", () => {
  let callTool;

  before(async () => {
    const server = createServer();
    callTool = async (name, args) => {
      const tool = server._registeredTools[name];
      return tool.handler(args, {});
    };
  });

  it("passes good link text", async () => {
    const html = '<a href="/about">About our company</a>';
    const result = await callTool("check_link_text", { html });
    const text = result.content[0].text;
    assert.ok(text.includes("No link text issues"));
  });

  it("detects ambiguous link text", async () => {
    const html = '<a href="/page">click here</a>';
    const result = await callTool("check_link_text", { html });
    const text = result.content[0].text;
    assert.ok(text.includes("Ambiguous"));
  });

  it("detects links with no accessible name", async () => {
    const html = '<a href="/page"></a>';
    const result = await callTool("check_link_text", { html });
    const text = result.content[0].text;
    assert.ok(text.includes("no accessible name"));
  });

  it("accepts aria-label on links", async () => {
    const html = '<a href="/page" aria-label="Go to product page"><img src="icon.png"></a>';
    const result = await callTool("check_link_text", { html });
    const text = result.content[0].text;
    assert.ok(text.includes("No link text issues"));
  });

  it("detects read more as ambiguous", async () => {
    const html = '<a href="/more">Read more</a>';
    const result = await callTool("check_link_text", { html });
    const text = result.content[0].text;
    assert.ok(text.includes("Ambiguous"));
  });
});

// =========================================================================
// Form Label Analysis
// =========================================================================

describe("check_form_labels tool", () => {
  let callTool;

  before(async () => {
    const server = createServer();
    callTool = async (name, args) => {
      const tool = server._registeredTools[name];
      return tool.handler(args, {});
    };
  });

  it("passes properly labeled inputs", async () => {
    const html = '<label for="email">Email</label><input type="text" id="email">';
    const result = await callTool("check_form_labels", { html });
    const text = result.content[0].text;
    assert.ok(text.includes("All inputs have accessible labels"));
  });

  it("detects unlabeled inputs", async () => {
    const html = '<input type="text" name="search">';
    const result = await callTool("check_form_labels", { html });
    const text = result.content[0].text;
    assert.ok(text.includes("no accessible label"));
  });

  it("accepts aria-label as valid label", async () => {
    const html = '<input type="text" aria-label="Search">';
    const result = await callTool("check_form_labels", { html });
    const text = result.content[0].text;
    assert.ok(text.includes("All inputs have accessible labels"));
  });

  it("warns about placeholder-only inputs", async () => {
    const html = '<input type="text" placeholder="Search...">';
    const result = await callTool("check_form_labels", { html });
    const text = result.content[0].text;
    assert.ok(text.includes("placeholder"));
  });

  it("skips hidden and submit inputs", async () => {
    const html =
      '<input type="hidden" name="csrf"><input type="submit" value="Go">';
    const result = await callTool("check_form_labels", { html });
    const text = result.content[0].text;
    assert.ok(text.includes("No form inputs"));
  });
});

// =========================================================================
// Guidelines Reference
// =========================================================================

describe("get_accessibility_guidelines tool", () => {
  let callTool;

  before(async () => {
    const server = createServer();
    callTool = async (name, args) => {
      const tool = server._registeredTools[name];
      return tool.handler(args, {});
    };
  });

  const components = [
    "modal",
    "tabs",
    "accordion",
    "combobox",
    "carousel",
    "form",
    "live-region",
    "navigation",
    "general",
  ];

  for (const component of components) {
    it(`returns guidelines for ${component}`, async () => {
      const result = await callTool("get_accessibility_guidelines", {
        component,
      });
      const text = result.content[0].text;
      assert.ok(text.length > 50, `Guidelines for ${component} should be substantial`);
      assert.ok(!text.includes("No guidelines found"));
    });
  }
});

// =========================================================================
// Server creation and tool registration
// =========================================================================

describe("createServer", () => {
  it("returns an MCP server instance", () => {
    const server = createServer();
    assert.ok(server instanceof McpServer);
  });

  it("registers all expected tools", () => {
    const server = createServer();
    const tools = server._registeredTools;

    const expectedCore = [
      "check_contrast",
      "get_accessibility_guidelines",
      "check_heading_structure",
      "check_link_text",
      "check_form_labels",
      "check_color_blindness",
      "check_reading_level",
    ];
    const expectedDocument = [
      "scan_office_document",
      "scan_pdf_document",
      "extract_document_metadata",
      "batch_scan_documents",
      "fix_document_metadata",
      "fix_document_headings",
    ];
    const expectedMedia = [
      "validate_caption_file",
    ];
    const expectedStatement = [
      "generate_accessibility_statement",
    ];
    const expectedCaching = [
      "check_audit_cache",
      "update_audit_cache",
    ];
    const expectedPlaywright = [
      "run_axe_scan",
      "run_playwright_a11y_tree",
      "run_playwright_keyboard_scan",
      "run_playwright_contrast_scan",
      "run_playwright_viewport_scan",
    ];
    const expectedPdf = ["run_verapdf_scan", "convert_pdf_form_to_html"];

    const allExpected = [
      ...expectedCore,
      ...expectedDocument,
      ...expectedMedia,
      ...expectedStatement,
      ...expectedCaching,
      ...expectedPlaywright,
      ...expectedPdf,
    ];

    for (const name of allExpected) {
      assert.ok(name in tools, `Tool "${name}" should be registered`);
    }

    const toolCount = Object.keys(tools).length;
    assert.ok(
      toolCount >= allExpected.length,
      `Expected at least ${allExpected.length} tools, got ${toolCount}`
    );
  });
});

// =========================================================================
// check_color_blindness tool
// =========================================================================

describe("check_color_blindness tool", () => {
  let callTool;
  before(() => {
    const server = createServer();
    callTool = async (name, args) => {
      const tool = server._registeredTools[name];
      return tool.handler(args, {});
    };
  });

  it("simulates color blindness for a pair of colors", async () => {
    const result = await callTool("check_color_blindness", {
      colors: ["#FF0000", "#00FF00"],
    });
    const data = JSON.parse(result.content[0].text);
    assert.ok(data.protanopia, "Should have protanopia simulation");
    assert.ok(data.deuteranopia, "Should have deuteranopia simulation");
    assert.ok(data.tritanopia, "Should have tritanopia simulation");
    assert.ok(data.achromatopsia, "Should have achromatopsia simulation");
    assert.ok(data.protanopia[0].simulated.length === 2, "Should return simulated color pair");
    assert.ok(typeof data.protanopia[0].deltaE === "number", "Should return deltaE");
  });

  it("handles three or more colors", async () => {
    const result = await callTool("check_color_blindness", {
      colors: ["#FF0000", "#00FF00", "#0000FF"],
    });
    const data = JSON.parse(result.content[0].text);
    // 3 colors = 3 pairs
    assert.strictEqual(data.protanopia.length, 3);
  });
});

// =========================================================================
// check_reading_level tool
// =========================================================================

describe("check_reading_level tool", () => {
  let callTool;
  before(() => {
    const server = createServer();
    callTool = async (name, args) => {
      const tool = server._registeredTools[name];
      return tool.handler(args, {});
    };
  });

  it("analyzes simple text at a low reading level", async () => {
    const result = await callTool("check_reading_level", {
      text: "The cat sat on the mat. The dog ran in the park. It was a nice day.",
    });
    const data = JSON.parse(result.content[0].text);
    assert.ok(data.scores.fleschReadingEase.score > 60, "Simple text should be easy to read");
    assert.ok(data.scores.fleschKincaidGrade < 10, "Simple text should be low grade level");
    assert.ok(data.statistics.words > 0, "Should count words");
    assert.ok(data.statistics.sentences > 0, "Should count sentences");
  });

  it("returns WCAG 3.1.5 pass/fail", async () => {
    const result = await callTool("check_reading_level", {
      text: "Click the button to submit your form. Enter your name and email address.",
    });
    const data = JSON.parse(result.content[0].text);
    assert.strictEqual(data.wcag.criterion, "3.1.5 Reading Level (AAA)");
    assert.ok(typeof data.wcag.passes === "boolean");
  });
});

// =========================================================================
// generate_accessibility_statement tool
// =========================================================================

describe("generate_accessibility_statement tool", () => {
  let callTool;
  before(() => {
    const server = createServer();
    callTool = async (name, args) => {
      const tool = server._registeredTools[name];
      return tool.handler(args, {});
    };
  });

  it("generates a W3C model statement", async () => {
    const result = await callTool("generate_accessibility_statement", {
      organization: "Test Corp",
      websiteUrl: "https://example.com",
      contactEmail: "a11y@example.com",
      conformanceStatus: "partially",
    });
    const text = result.content[0].text;
    assert.ok(text.includes("# Accessibility Statement"));
    assert.ok(text.includes("Test Corp"));
    assert.ok(text.includes("partially conformant"));
    assert.ok(text.includes("a11y@example.com"));
    assert.ok(!text.includes("Enforcement"), "W3C format should not include EU enforcement section");
  });

  it("generates an EU model statement with enforcement section", async () => {
    const result = await callTool("generate_accessibility_statement", {
      organization: "EU Org",
      websiteUrl: "https://eu-example.com",
      contactEmail: "contact@eu-example.com",
      conformanceStatus: "fully",
      format: "eu",
    });
    const text = result.content[0].text;
    assert.ok(text.includes("fully conformant"));
    assert.ok(text.includes("Enforcement"), "EU format should include enforcement section");
    assert.ok(text.includes("Annual Review"), "EU format should include annual review");
  });

  it("includes known limitations when provided", async () => {
    const result = await callTool("generate_accessibility_statement", {
      organization: "Test",
      websiteUrl: "https://example.com",
      contactEmail: "test@example.com",
      conformanceStatus: "partially",
      knownLimitations: [
        { description: "Video captions incomplete", wcag: "1.2.2", workaround: "Transcripts available" },
      ],
    });
    const text = result.content[0].text;
    assert.ok(text.includes("Video captions incomplete"));
    assert.ok(text.includes("1.2.2"));
    assert.ok(text.includes("Transcripts available"));
  });
});

// =========================================================================
// Office document scanning (integration with test fixtures)
// =========================================================================

describe("scan_office_document tool", () => {
  let callTool;

  before(async () => {
    const server = createServer();
    callTool = async (name, args) => {
      const tool = server._registeredTools[name];
      return tool.handler(args, {});
    };
  });

  it("rejects unsupported file types", async () => {
    const result = await callTool("scan_office_document", {
      filePath: "/tmp/test.txt",
    });
    const text = result.content[0].text;
    assert.ok(text.includes("Unsupported"));
  });

  it("handles missing files gracefully", async () => {
    const result = await callTool("scan_office_document", {
      filePath: join(process.cwd(), "nonexistent.docx"),
    });
    const text = result.content[0].text;
    assert.ok(
      text.includes("Cannot read") || text.includes("ENOENT"),
      `Expected read error, got: ${text}`
    );
  });
});

// =========================================================================
// PDF scanning
// =========================================================================

describe("scan_pdf_document tool", () => {
  let callTool;

  before(async () => {
    const server = createServer();
    callTool = async (name, args) => {
      const tool = server._registeredTools[name];
      return tool.handler(args, {});
    };
  });

  it("rejects non-PDF files", async () => {
    const result = await callTool("scan_pdf_document", {
      filePath: "/tmp/test.docx",
    });
    const text = result.content[0].text;
    assert.ok(text.includes("must be a .pdf"));
  });

  it("handles missing files gracefully", async () => {
    const result = await callTool("scan_pdf_document", {
      filePath: join(process.cwd(), "nonexistent.pdf"),
    });
    const text = result.content[0].text;
    assert.ok(
      text.includes("Cannot read") || text.includes("ENOENT"),
      `Expected read error, got: ${text}`
    );
  });
});

// =========================================================================
// Batch scanning
// =========================================================================

describe("batch_scan_documents tool", () => {
  let callTool;

  before(async () => {
    const server = createServer();
    callTool = async (name, args) => {
      const tool = server._registeredTools[name];
      return tool.handler(args, {});
    };
  });

  it("returns empty result for no files", async () => {
    const result = await callTool("batch_scan_documents", { filePaths: [] });
    const text = result.content[0].text;
    assert.ok(text.includes("No files"));
  });

  it("rejects too many files", async () => {
    const paths = Array.from({ length: 51 }, (_, i) => `/tmp/file${i}.docx`);
    const result = await callTool("batch_scan_documents", {
      filePaths: paths,
    });
    const text = result.content[0].text;
    assert.ok(text.includes("Too many") || text.includes("Maximum"));
  });
});

// =========================================================================
// Metadata extraction
// =========================================================================

describe("extract_document_metadata tool", () => {
  let callTool;

  before(async () => {
    const server = createServer();
    callTool = async (name, args) => {
      const tool = server._registeredTools[name];
      return tool.handler(args, {});
    };
  });

  it("rejects unsupported file types", async () => {
    const result = await callTool("extract_document_metadata", {
      filePath: "/tmp/test.txt",
    });
    const text = result.content[0].text;
    assert.ok(text.includes("Unsupported"));
  });
});

// =========================================================================
// MCP Prompts
// =========================================================================

describe("MCP Prompts", () => {
  let server;

  before(() => {
    server = createServer();
  });

  it("registers audit-page, check-component, and explain-wcag prompts", () => {
    const prompts = server._registeredPrompts;
    assert.ok("audit-page" in prompts, "audit-page prompt registered");
    assert.ok("check-component" in prompts, "check-component prompt registered");
    assert.ok("explain-wcag" in prompts, "explain-wcag prompt registered");
  });

  it("audit-page returns structured audit instruction", async () => {
    const prompt = server._registeredPrompts["audit-page"];
    const result = await prompt.callback({ url: "https://example.com", level: "AA" }, {});
    assert.ok(result.messages.length > 0);
    const text = result.messages[0].content.text;
    assert.ok(text.includes("WCAG 2.2 Level AA"));
    assert.ok(text.includes("https://example.com"));
    assert.ok(text.includes("run_axe_scan"));
  });

  it("check-component returns guidelines for known component", async () => {
    const prompt = server._registeredPrompts["check-component"];
    const result = await prompt.callback({ component: "modal" }, {});
    const text = result.messages[0].content.text;
    assert.ok(text.includes("Modal"));
    assert.ok(text.includes("<dialog>"));
  });

  it("explain-wcag returns explanation request", async () => {
    const prompt = server._registeredPrompts["explain-wcag"];
    const result = await prompt.callback({ criterion: "1.4.3" }, {});
    const text = result.messages[0].content.text;
    assert.ok(text.includes("1.4.3"));
    assert.ok(text.includes("common violations"));
  });
});

// =========================================================================
// MCP Resources
// =========================================================================

describe("MCP Resources", () => {
  let server;

  before(() => {
    server = createServer();
  });

  it("registers wcag-guidelines, supported-tools, and scan-config-template resources", () => {
    const resources = server._registeredResources;
    const uris = Object.keys(resources);
    assert.ok(uris.some((u) => u.includes("guidelines")), "wcag-guidelines registered");
    assert.ok(uris.some((u) => u.includes("tools")), "supported-tools registered");
    assert.ok(uris.some((u) => u.includes("config")), "scan-config-template registered");
  });

  it("wcag-guidelines returns markdown content for modal", async () => {
    const resource = server._registeredResources["a11y://guidelines/{component}"];
    const result = await resource.readCallback(new URL("a11y://guidelines/modal"), {});
    assert.ok(result.contents.length > 0);
    assert.ok(result.contents[0].text.includes("Modal"));
    assert.equal(result.contents[0].mimeType, "text/markdown");
  });

  it("supported-tools returns tool listing", async () => {
    const resource = server._registeredResources["a11y://tools"];
    const result = await resource.readCallback(new URL("a11y://tools"), {});
    const text = result.contents[0].text;
    assert.ok(text.includes("check_contrast"));
    assert.ok(text.includes("check_heading_structure"));
  });

  it("scan-config-template returns JSON for moderate profile", async () => {
    const resource = server._registeredResources["a11y://config/{profile}"];
    const result = await resource.readCallback(new URL("a11y://config/moderate"), {});
    assert.equal(result.contents[0].mimeType, "application/json");
    const config = JSON.parse(result.contents[0].text);
    assert.ok(Array.isArray(config.severity));
    assert.ok(config.severity.includes("critical"));
  });
});
