#!/usr/bin/env node
/**
 * Accessibility scan runner for the GitHub Action.
 *
 * Zero external dependencies -- uses only Node.js built-ins.
 * - Web scanning: static analysis of HTML/JSX/TSX/Vue/Svelte/CSS files
 * - Document scanning: spawns the MCP server via stdio and calls
 *   scan_office_document / scan_pdf_document through JSON-RPC 2.0
 * - Outputs: SARIF 2.1.0, GitHub Actions annotations, step summary
 */

import { readFileSync, writeFileSync, readdirSync, lstatSync, existsSync, appendFileSync } from "node:fs";
import { join, relative, extname, resolve, dirname } from "node:path";
import { execSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ---------------------------------------------------------------------------
// Configuration from environment
// ---------------------------------------------------------------------------

const SCAN_TYPE = (process.env.INPUT_SCAN_TYPE || "web").toLowerCase();
const PROFILE = (process.env.INPUT_PROFILE || "moderate").toLowerCase();
const FAIL_ON = (process.env.INPUT_FAIL_ON || "serious").toLowerCase();
const PATHS = process.env.INPUT_PATHS || "";
const SARIF_FILE = process.env.INPUT_SARIF_FILE || "a11y-results.sarif";

const SEVERITY_ORDER = ["minor", "moderate", "serious", "critical"];

function severityAtLeast(severity, threshold) {
  if (threshold === "none") return false;
  return SEVERITY_ORDER.indexOf(severity) >= SEVERITY_ORDER.indexOf(threshold);
}

// ---------------------------------------------------------------------------
// File discovery
// ---------------------------------------------------------------------------

const MARKUP_EXTENSIONS = new Set([".html", ".htm", ".jsx", ".tsx", ".vue", ".svelte"]);
const CSS_EXTENSIONS = new Set([".css", ".scss"]);
const OFFICE_EXTENSIONS = new Set([".docx", ".xlsx", ".pptx"]);
const PDF_EXTENSIONS = new Set([".pdf"]);
const IGNORED_DIRS = new Set([
  "node_modules", ".git", "dist", "build", ".next", ".nuxt",
  "coverage", "vendor", "__pycache__", ".vscode",
]);

function walkDir(dir, extensions) {
  const results = [];
  let entries;
  try { entries = readdirSync(dir); } catch { return results; }
  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    let stat;
    try { stat = lstatSync(full); } catch { continue; }
    if (stat.isSymbolicLink()) continue;
    if (stat.isDirectory()) {
      results.push(...walkDir(full, extensions));
    } else if (extensions.has(extname(entry).toLowerCase())) {
      results.push(full);
    }
  }
  return results;
}

function getChangedFiles() {
  // In a PR context, use git diff to find changed files
  const base = process.env.GITHUB_BASE_REF;
  if (!base) return null;
  try {
    execSync("git fetch --depth=1 origin " + base, { stdio: "ignore" });
    const diff = execSync(`git diff --name-only origin/${base}...HEAD`, { encoding: "utf-8" });
    return diff.trim().split("\n").filter(Boolean).map(f => resolve(f));
  } catch {
    return null;
  }
}

function discoverFiles(scanType) {
  const root = PATHS || process.cwd();
  const changed = PATHS ? null : getChangedFiles();
  const result = { markup: [], css: [], office: [], pdf: [] };

  if (scanType === "web" || scanType === "all") {
    if (changed) {
      result.markup = changed.filter(f => MARKUP_EXTENSIONS.has(extname(f).toLowerCase()));
      result.css = changed.filter(f => CSS_EXTENSIONS.has(extname(f).toLowerCase()));
    } else {
      result.markup = walkDir(root, MARKUP_EXTENSIONS);
      result.css = walkDir(root, CSS_EXTENSIONS);
    }
  }

  if (scanType === "office" || scanType === "all") {
    if (changed) {
      result.office = changed.filter(f => OFFICE_EXTENSIONS.has(extname(f).toLowerCase()));
    } else {
      result.office = walkDir(root, OFFICE_EXTENSIONS);
    }
  }

  if (scanType === "pdf" || scanType === "all") {
    if (changed) {
      result.pdf = changed.filter(f => PDF_EXTENSIONS.has(extname(f).toLowerCase()));
    } else {
      result.pdf = walkDir(root, PDF_EXTENSIONS);
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Web static analysis (mirrors .github/scripts/a11y-lint.mjs)
// ---------------------------------------------------------------------------

function checkMarkupFile(filePath, root) {
  const findings = [];
  let content;
  try { content = readFileSync(filePath, "utf-8"); } catch { return findings; }

  const rel = relative(root, filePath);
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // 1. Images without alt
    for (const m of line.matchAll(/<img\b[^>]*>/gi)) {
      if (!/\balt\s*=/i.test(m[0])) {
        findings.push({ file: rel, line: lineNum, rule: "img-alt", message: "<img> missing alt attribute", severity: "serious" });
      }
    }

    // 2. Positive tabindex
    for (const m of line.matchAll(/tabindex\s*=\s*["']?(\d+)["']?/gi)) {
      if (parseInt(m[1], 10) > 0) {
        findings.push({ file: rel, line: lineNum, rule: "tabindex-positive", message: `tabindex="${m[1]}" disrupts natural tab order`, severity: "serious" });
      }
    }

    // 3. Div/span with role="button"
    if (/(<div|<span)[^>]*role\s*=\s*["']button["']/i.test(line)) {
      findings.push({ file: rel, line: lineNum, rule: "no-div-button", message: 'Use <button> instead of <div role="button"> or <span role="button">', severity: "moderate" });
    }

    // 4. onClick on non-interactive elements without role
    if (/(<div|<span)[^>]*onClick/i.test(line) && !/role\s*=\s*["']button["']/i.test(line)) {
      findings.push({ file: rel, line: lineNum, rule: "click-events-have-key-events", message: "onClick on non-interactive element without role -- use <button> or add role and keyboard handler", severity: "moderate" });
    }

    // 5. Empty headings
    for (const _m of line.matchAll(/<h([1-6])\b[^>]*>\s*<\/h\1>/gi)) {
      findings.push({ file: rel, line: lineNum, rule: "heading-has-content", message: "Empty heading element", severity: "serious" });
    }

    // 6. Ambiguous link text
    const AMBIGUOUS = ["click here", "here", "read more", "more", "learn more", "link", "this link", "details", "more details", "info", "more info", "go", "continue"];
    for (const m of line.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)) {
      const text = m[1].replace(/<[^>]*>/g, "").trim().toLowerCase();
      if (AMBIGUOUS.includes(text)) {
        findings.push({ file: rel, line: lineNum, rule: "link-text-ambiguous", message: `Ambiguous link text "${m[1].trim()}"`, severity: "moderate" });
      }
    }

    // 7. Form inputs without labels
    for (const m of line.matchAll(/<(input|select|textarea)\b([^>]*)>/gi)) {
      const attrs = m[2];
      if (/type\s*=\s*["'](hidden|submit|button|reset|image)["']/i.test(attrs)) continue;
      if (/aria-label\s*=|aria-labelledby\s*=|\bid\s*=|title\s*=/i.test(attrs)) continue;
      findings.push({ file: rel, line: lineNum, rule: "input-has-label", message: `<${m[1]}> may be missing an associated label`, severity: "moderate" });
    }

    // 8. Autocomplete on identity fields
    for (const m of line.matchAll(/<input\b([^>]*)>/gi)) {
      const attrs = m[1];
      const typeMatch = attrs.match(/type\s*=\s*["'](\w+)["']/i);
      const type = typeMatch ? typeMatch[1].toLowerCase() : "text";
      if (!["email", "tel", "password", "text"].includes(type)) continue;
      const nameMatch = attrs.match(/name\s*=\s*["']([^"']+)["']/i);
      if (!nameMatch) continue;
      const name = nameMatch[1].toLowerCase();
      const IDENTITY = ["email", "phone", "tel", "name", "fname", "lname", "first-name", "last-name", "given-name", "family-name", "username", "address", "street", "city", "state", "zip", "postal", "country", "cc-number", "cc-name", "cc-exp"];
      if (IDENTITY.some(n => name.includes(n)) && !/autocomplete\s*=/i.test(attrs)) {
        findings.push({ file: rel, line: lineNum, rule: "autocomplete-identity", message: `Input "${nameMatch[1]}" appears to be an identity field -- add autocomplete (WCAG 1.3.5)`, severity: "minor" });
      }
    }
  }

  return findings;
}

function checkCSSFile(filePath, root) {
  const findings = [];
  let content;
  try { content = readFileSync(filePath, "utf-8"); } catch { return findings; }

  const rel = relative(root, filePath);
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    if (/outline\s*:\s*(none|0)\b/i.test(lines[i])) {
      const context = lines.slice(Math.max(0, i - 5), Math.min(lines.length, i + 5)).join("\n");
      if (!/:focus-visible/i.test(context)) {
        findings.push({ file: rel, line: i + 1, rule: "no-outline-removal", message: "outline: none/0 without :focus-visible alternative", severity: "serious" });
      }
    }
  }

  return findings;
}

// ---------------------------------------------------------------------------
// Minimal MCP JSON-RPC 2.0 stdio client
// ---------------------------------------------------------------------------

class McpStdioClient {
  constructor(serverPath) {
    this._serverPath = serverPath;
    this._proc = null;
    this._buffer = "";
    this._pending = new Map();
    this._nextId = 1;
  }

  async start() {
    this._proc = spawn(process.execPath, [this._serverPath], {
      stdio: ["pipe", "pipe", "ignore"],
      env: { ...process.env, NODE_ENV: "production" },
    });

    this._proc.stdout.on("data", (chunk) => this._onData(chunk.toString()));

    // Initialize handshake
    await this._call("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "a11y-scan-action", version: "1.0.0" },
    });

    this._send("notifications/initialized", {});
  }

  async callTool(name, args) {
    const result = await this._call("tools/call", { name, arguments: args });
    // MCP tool results have a content array; concatenate text items
    if (result && result.content) {
      return result.content
        .filter(c => c.type === "text")
        .map(c => c.text)
        .join("\n");
    }
    return "";
  }

  async stop() {
    if (this._proc) {
      this._proc.stdin.end();
      this._proc.kill();
      this._proc = null;
    }
  }

  _send(method, params) {
    const msg = JSON.stringify({ jsonrpc: "2.0", method, params });
    const frame = `Content-Length: ${Buffer.byteLength(msg)}\r\n\r\n${msg}`;
    this._proc.stdin.write(frame);
  }

  _call(method, params) {
    return new Promise((resolve, reject) => {
      const id = this._nextId++;
      this._pending.set(id, { resolve, reject });
      const msg = JSON.stringify({ jsonrpc: "2.0", id, method, params });
      const frame = `Content-Length: ${Buffer.byteLength(msg)}\r\n\r\n${msg}`;
      this._proc.stdin.write(frame);

      // Timeout after 60 seconds
      setTimeout(() => {
        if (this._pending.has(id)) {
          this._pending.delete(id);
          reject(new Error(`MCP call ${method} timed out`));
        }
      }, 60000);
    });
  }

  _onData(data) {
    this._buffer += data;
    while (true) {
      const headerEnd = this._buffer.indexOf("\r\n\r\n");
      if (headerEnd === -1) break;
      const header = this._buffer.slice(0, headerEnd);
      const match = header.match(/Content-Length:\s*(\d+)/i);
      if (!match) { this._buffer = this._buffer.slice(headerEnd + 4); continue; }
      const len = parseInt(match[1], 10);
      const bodyStart = headerEnd + 4;
      if (this._buffer.length < bodyStart + len) break;
      const body = this._buffer.slice(bodyStart, bodyStart + len);
      this._buffer = this._buffer.slice(bodyStart + len);

      let msg;
      try { msg = JSON.parse(body); } catch { continue; }

      if (msg.id != null && this._pending.has(msg.id)) {
        const { resolve, reject } = this._pending.get(msg.id);
        this._pending.delete(msg.id);
        if (msg.error) {
          reject(new Error(msg.error.message || JSON.stringify(msg.error)));
        } else {
          resolve(msg.result);
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Document scanning via MCP
// ---------------------------------------------------------------------------

function parseDocumentFindings(text, file) {
  const findings = [];
  const rel = relative(process.cwd(), file);
  for (const line of text.split("\n")) {
    const m = line.match(/^\[(CRITICAL|SERIOUS|MODERATE|MINOR)\]\s+(\S+?):\s+(.+)$/i);
    if (m) {
      findings.push({
        file: rel,
        line: 1,
        rule: m[2],
        message: m[3],
        severity: m[1].toLowerCase(),
      });
    }
  }
  return findings;
}

async function scanDocuments(officeFiles, pdfFiles, profile) {
  if (officeFiles.length === 0 && pdfFiles.length === 0) return [];

  const serverPath = resolve(__dirname, "..", "mcp-server", "stdio.js");
  if (!existsSync(serverPath)) {
    console.log("::warning::MCP server not found at " + serverPath + " -- skipping document scan");
    return [];
  }

  const client = new McpStdioClient(serverPath);
  const findings = [];

  try {
    await client.start();

    for (const file of officeFiles) {
      try {
        const text = await client.callTool("scan_office_document", {
          filePath: resolve(file),
          profile,
        });
        findings.push(...parseDocumentFindings(text, file));
      } catch (err) {
        console.log(`::warning::Failed to scan ${file}: ${err.message}`);
      }
    }

    for (const file of pdfFiles) {
      try {
        const text = await client.callTool("scan_pdf_document", {
          filePath: resolve(file),
          profile,
        });
        findings.push(...parseDocumentFindings(text, file));
      } catch (err) {
        console.log(`::warning::Failed to scan ${file}: ${err.message}`);
      }
    }
  } finally {
    await client.stop();
  }

  return findings;
}

// ---------------------------------------------------------------------------
// SARIF generation
// ---------------------------------------------------------------------------

function severityToSarif(severity) {
  switch (severity) {
    case "critical":
    case "serious":
      return "error";
    case "moderate":
      return "warning";
    case "minor":
    default:
      return "note";
  }
}

function buildSarif(findings) {
  const ruleMap = new Map();
  const results = [];

  for (const f of findings) {
    if (!ruleMap.has(f.rule)) {
      ruleMap.set(f.rule, {
        id: f.rule,
        shortDescription: { text: f.rule },
        defaultConfiguration: { level: severityToSarif(f.severity) },
        properties: { severity: f.severity },
      });
    }

    results.push({
      ruleId: f.rule,
      level: severityToSarif(f.severity),
      message: { text: f.message },
      locations: [{
        physicalLocation: {
          artifactLocation: { uri: f.file.replace(/\\/g, "/") },
          region: { startLine: f.line },
        },
      }],
    });
  }

  return {
    $schema: "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/main/sarif-2.1/schema/sarif-schema-2.1.0.json",
    version: "2.1.0",
    runs: [{
      tool: {
        driver: {
          name: "accessibility-scan",
          informationUri: "https://github.com/Community-Access/accessibility-agents",
          version: "4.6.0",
          rules: [...ruleMap.values()],
        },
      },
      results,
    }],
  };
}

// ---------------------------------------------------------------------------
// Threshold evaluation
// ---------------------------------------------------------------------------

function evaluate(findings, failOn) {
  const counts = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  let failed = false;

  for (const f of findings) {
    if (counts[f.severity] != null) counts[f.severity]++;
    if (severityAtLeast(f.severity, failOn)) failed = true;
  }

  return { counts, failed, total: findings.length };
}

// ---------------------------------------------------------------------------
// GitHub Actions output helpers
// ---------------------------------------------------------------------------

function setOutput(name, value) {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    appendFileSync(outputFile, `${name}=${value}\n`);
  }
}

function writeStepSummary(findings, result) {
  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryFile) return;

  const lines = [
    "## Accessibility Scan Results",
    "",
    `**Result:** ${result.failed ? "FAIL" : "PASS"}`,
    `**Total violations:** ${result.total}`,
    "",
    "| Severity | Count |",
    "|----------|-------|",
    `| Critical | ${result.counts.critical} |`,
    `| Serious | ${result.counts.serious} |`,
    `| Moderate | ${result.counts.moderate} |`,
    `| Minor | ${result.counts.minor} |`,
  ];

  if (findings.length > 0) {
    lines.push("", "### Top Findings", "");
    const shown = findings.slice(0, 25);
    for (const f of shown) {
      lines.push(`- **[${f.severity.toUpperCase()}]** \`${f.rule}\` in ${f.file}:${f.line} -- ${f.message}`);
    }
    if (findings.length > 25) {
      lines.push(`- ... and ${findings.length - 25} more (see SARIF for full details)`);
    }
  }

  writeFileSync(summaryFile, lines.join("\n") + "\n");
}

function emitAnnotations(findings) {
  for (const f of findings) {
    const level = f.severity === "critical" || f.severity === "serious" ? "error" : "warning";
    console.log(`::${level} file=${f.file},line=${f.line}::${f.rule}: ${f.message}`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`Accessibility scan: type=${SCAN_TYPE} profile=${PROFILE} fail-on=${FAIL_ON}`);

  const files = discoverFiles(SCAN_TYPE);
  const webCount = files.markup.length + files.css.length;
  const docCount = files.office.length + files.pdf.length;

  console.log(`Files discovered: ${webCount} web, ${files.office.length} office, ${files.pdf.length} PDF`);

  // Run web static analysis
  const root = PATHS || process.cwd();
  let findings = [];

  for (const f of files.markup) findings.push(...checkMarkupFile(f, root));
  for (const f of files.css) findings.push(...checkCSSFile(f, root));

  // Run document scanning via MCP
  const docFindings = await scanDocuments(files.office, files.pdf, PROFILE);
  findings.push(...docFindings);

  // Apply profile filter (minimal = errors only)
  if (PROFILE === "minimal") {
    findings = findings.filter(f => f.severity === "critical" || f.severity === "serious");
  } else if (PROFILE === "moderate") {
    findings = findings.filter(f => f.severity !== "minor" || f.severity === "minor");
    // moderate keeps everything but could be adjusted via config
  }
  // strict keeps everything

  // Sort by severity (critical first)
  findings.sort((a, b) => SEVERITY_ORDER.indexOf(b.severity) - SEVERITY_ORDER.indexOf(a.severity));

  // Generate SARIF
  const sarif = buildSarif(findings);
  writeFileSync(SARIF_FILE, JSON.stringify(sarif, null, 2));
  console.log(`SARIF written to ${SARIF_FILE}`);

  // Evaluate threshold
  const result = evaluate(findings, FAIL_ON);

  // Set outputs
  setOutput("violations", result.total);
  setOutput("critical", result.counts.critical);
  setOutput("serious", result.counts.serious);
  setOutput("moderate", result.counts.moderate);
  setOutput("minor", result.counts.minor);
  setOutput("result", result.failed ? "fail" : "pass");

  // Emit annotations
  emitAnnotations(findings);

  // Write step summary
  writeStepSummary(findings, result);

  // Console summary
  console.log(`\nResults: ${result.total} violation(s) -- ${result.counts.critical} critical, ${result.counts.serious} serious, ${result.counts.moderate} moderate, ${result.counts.minor} minor`);
  console.log(`Threshold: fail-on=${FAIL_ON} => ${result.failed ? "FAIL" : "PASS"}`);

  if (result.failed) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Scan failed:", err.message);
  process.exit(2);
});
