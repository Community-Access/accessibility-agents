/**
 * EPUB accessibility scanning tool for MCP.
 *
 * Scans .epub files (EPUB 3.x and 2.x) for accessibility issues:
 * - Accessibility metadata (schema.org, DCMI)
 * - Navigation documents (toc.ncx, nav.xhtml)
 * - Language settings
 * - Content document structure (headings, alt text, tables)
 * - Reading order verification
 *
 * EPUB files are ZIP containers, so this reuses the ZIP parsing
 * from server-core.js.
 */

import { z } from "zod";
import { basename, dirname, join } from "node:path";
import { readFile as fsReadFile, writeFile as fsWriteFile } from "node:fs/promises";
import { inflateRawSync } from "node:zlib";
import { validateFilePath } from "../server-core.js";

const MAX_FILE_BYTES = 100 * 1024 * 1024;

// ---------------------------------------------------------------------------
// ZIP helpers (self-contained to avoid coupling to server-core internals)
// ---------------------------------------------------------------------------

function readZipEntries(buf) {
  const entries = new Map();
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let eocdOffset = -1;
  for (let i = buf.length - 22; i >= 0 && i >= buf.length - 65557; i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { eocdOffset = i; break; }
  }
  if (eocdOffset < 0) throw new Error("Not a ZIP file (EOCD not found)");
  const cdOffset = dv.getUint32(eocdOffset + 16, true);
  const cdCount = dv.getUint16(eocdOffset + 10, true);
  let pos = cdOffset;
  for (let i = 0; i < cdCount; i++) {
    if (dv.getUint32(pos, true) !== 0x02014b50) break;
    const method = dv.getUint16(pos + 10, true);
    const cSize = dv.getUint32(pos + 20, true);
    const uSize = dv.getUint32(pos + 24, true);
    const nameLen = dv.getUint16(pos + 28, true);
    const extraLen = dv.getUint16(pos + 30, true);
    const commentLen = dv.getUint16(pos + 32, true);
    const localOffset = dv.getUint32(pos + 42, true);
    const name = new TextDecoder().decode(buf.subarray(pos + 46, pos + 46 + nameLen));
    entries.set(name, { method, cSize, uSize, localOffset });
    pos += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

const MAX_UNCOMPRESSED_BYTES = 500 * 1024 * 1024;

function getZipEntry(buf, entries, name) {
  const entry = entries.get(name);
  if (!entry) return null;
  if (entry.uSize > MAX_UNCOMPRESSED_BYTES) return null;
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const lo = entry.localOffset;
  if (dv.getUint32(lo, true) !== 0x04034b50) return null;
  const nameLen = dv.getUint16(lo + 26, true);
  const extraLen = dv.getUint16(lo + 28, true);
  const dataStart = lo + 30 + nameLen + extraLen;
  const raw = buf.subarray(dataStart, dataStart + entry.cSize);
  if (entry.method === 0) return raw;
  if (entry.method === 8) {
    try { return Buffer.from(inflateRawSync(raw)); }
    catch { return null; }
  }
  return null;
}

function getXml(buf, entries, name) {
  const data = getZipEntry(buf, entries, name);
  return data ? new TextDecoder().decode(data) : "";
}

function xmlText(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "gi");
  const results = [];
  let m;
  while ((m = re.exec(xml)) !== null) results.push(m[1]);
  return results;
}

function xmlAttr(xml, tag, attr) {
  const re = new RegExp(`<${tag}\\b[^>]*\\b${attr}\\s*=\\s*"([^"]*)"`, "gi");
  const results = [];
  let m;
  while ((m = re.exec(xml)) !== null) results.push(m[1]);
  return results;
}

// ---------------------------------------------------------------------------
// EPUB config loader
// ---------------------------------------------------------------------------

async function loadEpubConfig(filePath) {
  const defaultConfig = {
    enabled: true,
    disabledRules: [],
    severityFilter: ["error", "warning", "tip"],
  };
  let dir = dirname(filePath);
  for (let i = 0; i < 20; i++) {
    const configPath = join(dir, ".a11y-epub-config.json");
    try {
      const raw = await fsReadFile(configPath, "utf-8");
      return { ...defaultConfig, ...JSON.parse(raw) };
    } catch { /* not found */ }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return defaultConfig;
}

// ---------------------------------------------------------------------------
// EPUB scanner
// ---------------------------------------------------------------------------

function scanEpub(buf, config) {
  let entries;
  try {
    entries = readZipEntries(buf);
  } catch (err) {
    return {
      findings: [{ ruleId: "epub-parse-error", severity: "error", message: `Cannot parse EPUB: ${err.message}`, location: "File" }],
      info: {},
    };
  }

  const disabled = new Set(config.disabledRules || []);
  const severityFilter = new Set(config.severityFilter || ["error", "warning", "tip"]);
  const findings = [];

  function add(ruleId, severity, message, location, extra = {}) {
    if (disabled.has(ruleId)) return;
    if (!severityFilter.has(severity)) return;
    findings.push({ ruleId, severity, message, location, ...extra });
  }

  // 1. Verify mimetype file
  const mimetype = getZipEntry(buf, entries, "mimetype");
  if (!mimetype) {
    add("epub-mimetype", "error", "Missing mimetype file. EPUB must contain an uncompressed mimetype file as the first entry.", "Container");
  } else {
    const mt = new TextDecoder().decode(mimetype).trim();
    if (mt !== "application/epub+zip") {
      add("epub-mimetype", "error", `Invalid mimetype: "${mt}". Must be "application/epub+zip".`, "Container");
    }
  }

  // 2. Find container.xml and locate OPF
  const container = getXml(buf, entries, "META-INF/container.xml");
  if (!container) {
    add("epub-container", "error", "Missing META-INF/container.xml. Cannot determine package document location.", "Container");
    return { findings, info: {} };
  }

  const opfPaths = xmlAttr(container, "rootfile", "full-path");
  if (opfPaths.length === 0) {
    add("epub-container", "error", "No rootfile found in container.xml.", "Container");
    return { findings, info: {} };
  }

  const opfPath = opfPaths[0];
  const opf = getXml(buf, entries, opfPath);
  if (!opf) {
    add("epub-opf", "error", `Cannot read package document: ${opfPath}`, "Package");
    return { findings, info: {} };
  }

  const opfDir = opfPath.includes("/") ? opfPath.substring(0, opfPath.lastIndexOf("/") + 1) : "";

  // 3. Extract metadata
  const info = {
    title: "",
    language: "",
    creator: "",
    hasAccessibilityMetadata: false,
    hasNav: false,
    hasNcx: false,
    contentFiles: 0,
    imageCount: 0,
    epubVersion: "",
  };

  // Version detection
  const versionMatch = opf.match(/<package[^>]*version\s*=\s*"([^"]*)"/i);
  info.epubVersion = versionMatch ? versionMatch[1] : "unknown";

  // DC metadata
  info.title = (xmlText(opf, "dc:title")[0] || "").trim();
  info.language = (xmlText(opf, "dc:language")[0] || "").trim();
  info.creator = (xmlText(opf, "dc:creator")[0] || "").trim();

  if (!info.title) {
    add("epub-title", "error", "Document title is not set. Set <dc:title> in the OPF metadata.", "Package metadata");
  }
  if (!info.language) {
    add("epub-language", "error", "Document language is not set. Set <dc:language> in the OPF metadata.", "Package metadata");
  }

  // 4. Accessibility metadata (EPUB Accessibility 1.1)
  const metaElements = opf.match(/<meta[^>]*>/gi) || [];
  const accessModes = [];
  const accessFeatures = [];
  const accessHazards = [];
  let hasSummary = false;
  let hasConformsTo = false;

  for (const meta of metaElements) {
    const property = (meta.match(/property\s*=\s*"([^"]*)"/i) || [])[1] || "";
    const name = (meta.match(/name\s*=\s*"([^"]*)"/i) || [])[1] || "";
    const content = (meta.match(/content\s*=\s*"([^"]*)"/i) || [])[1] || "";

    if (property === "schema:accessMode" || name === "schema:accessMode") accessModes.push(content || "present");
    if (property === "schema:accessibilityFeature" || name === "schema:accessibilityFeature") accessFeatures.push(content || "present");
    if (property === "schema:accessibilityHazard" || name === "schema:accessibilityHazard") accessHazards.push(content || "present");
    if (property === "schema:accessibilitySummary" || name === "schema:accessibilitySummary") hasSummary = true;
    if (property === "dcterms:conformsTo" || name === "dcterms:conformsTo") hasConformsTo = true;
  }

  // Also check inline meta text for conformsTo
  const conformsToTexts = xmlText(opf, "meta").filter(t => t.includes("WCAG") || t.includes("EPUB Accessibility"));
  if (conformsToTexts.length > 0) hasConformsTo = true;

  info.hasAccessibilityMetadata = accessModes.length > 0 || accessFeatures.length > 0;

  if (accessModes.length === 0) {
    add("epub-access-mode", "warning", "No schema:accessMode metadata found. Declare access modes (textual, visual, auditory) for discoverability.", "Package metadata", { confidence: "high" });
  }
  if (accessFeatures.length === 0) {
    add("epub-access-features", "warning", "No schema:accessibilityFeature metadata found. Declare features like structuralNavigation, alternativeText, etc.", "Package metadata", { confidence: "high" });
  }
  if (accessHazards.length === 0) {
    add("epub-access-hazards", "tip", "No schema:accessibilityHazard metadata found. Declare hazards (flashing, motionSimulation, sound) or 'none'.", "Package metadata", { confidence: "medium" });
  }
  if (!hasSummary) {
    add("epub-access-summary", "tip", "No schema:accessibilitySummary found. A human-readable summary of accessibility features helps users.", "Package metadata", { confidence: "medium" });
  }
  if (!hasConformsTo) {
    add("epub-conformance", "warning", "No dcterms:conformsTo declaration found. Declare WCAG/EPUB Accessibility conformance level.", "Package metadata", { confidence: "high" });
  }

  // 5. Navigation documents
  const manifestItems = opf.match(/<item\b[^>]*>/gi) || [];
  let navHref = "";
  let ncxHref = "";

  for (const item of manifestItems) {
    const properties = (item.match(/properties\s*=\s*"([^"]*)"/i) || [])[1] || "";
    const href = (item.match(/href\s*=\s*"([^"]*)"/i) || [])[1] || "";
    const mediaType = (item.match(/media-type\s*=\s*"([^"]*)"/i) || [])[1] || "";

    if (properties.includes("nav")) navHref = href;
    if (mediaType === "application/x-dtbncx+xml") ncxHref = href;
  }

  if (navHref) {
    info.hasNav = true;
    const navContent = getXml(buf, entries, opfDir + navHref);
    if (navContent) {
      const tocNav = navContent.match(/<nav[^>]*epub:type\s*=\s*"toc"[^>]*>[\s\S]*?<\/nav>/i);
      if (!tocNav) {
        add("epub-nav-toc", "error", "Navigation document exists but has no toc nav element (epub:type=\"toc\").", `Navigation: ${navHref}`);
      }
      const pageList = navContent.match(/<nav[^>]*epub:type\s*=\s*"page-list"[^>]*>/i);
      if (!pageList) {
        add("epub-page-list", "tip", "No page-list navigation found. Include page-list for print-equivalent page navigation.", `Navigation: ${navHref}`, { confidence: "medium" });
      }
    }
  } else {
    add("epub-nav", "error", "No EPUB 3 navigation document found. EPUB 3 requires a nav document with properties=\"nav\".", "Package manifest");
  }

  if (ncxHref) {
    info.hasNcx = true;
  } else if (info.epubVersion.startsWith("2")) {
    add("epub-ncx", "error", "No NCX file found. EPUB 2 requires a toc.ncx for navigation.", "Package manifest");
  }

  // 6. Content document analysis
  const contentHrefs = [];
  const imageHrefs = [];
  for (const item of manifestItems) {
    const href = (item.match(/href\s*=\s*"([^"]*)"/i) || [])[1] || "";
    const mediaType = (item.match(/media-type\s*=\s*"([^"]*)"/i) || [])[1] || "";
    if (mediaType === "application/xhtml+xml" && href !== navHref) {
      contentHrefs.push(href);
    }
    if (mediaType.startsWith("image/")) {
      imageHrefs.push(href);
    }
  }

  info.contentFiles = contentHrefs.length;
  info.imageCount = imageHrefs.length;

  // Scan a sample of content documents (up to 20 for performance)
  const sampled = contentHrefs.slice(0, 20);
  let totalImages = 0;
  let missingAlt = 0;
  let hasHeadings = false;

  for (const href of sampled) {
    const content = getXml(buf, entries, opfDir + href);
    if (!content) continue;

    // Check language on content documents
    const htmlLang = content.match(/<html[^>]*(?:xml:lang|lang)\s*=\s*"([^"]*)"/i);
    if (!htmlLang && !info.language) {
      add("epub-content-lang", "warning", `Content document ${href} has no language attribute and package has no dc:language.`, `Content: ${href}`);
    }

    // Check images for alt text
    const imgs = content.match(/<img\b[^>]*>/gi) || [];
    for (const img of imgs) {
      totalImages++;
      const alt = img.match(/alt\s*=\s*"([^"]*)"/i);
      if (!alt) {
        missingAlt++;
      } else if (alt[1].trim() === "") {
        // Empty alt is valid for decorative images, not counted as missing
      }
    }

    // Check SVG images for titles
    const svgs = content.match(/<svg\b[\s\S]*?<\/svg>/gi) || [];
    for (const svg of svgs) {
      if (!/<title\b/i.test(svg)) {
        totalImages++;
        missingAlt++;
      }
    }

    // Check heading structure
    const headingRe = /<h([1-6])\b/gi;
    let hMatch;
    const levels = [];
    while ((hMatch = headingRe.exec(content)) !== null) {
      levels.push(parseInt(hMatch[1], 10));
      hasHeadings = true;
    }

    let prev = 0;
    for (const level of levels) {
      if (prev > 0 && level > prev + 1) {
        add("epub-heading-skip", "warning", `Heading level skipped in ${href}: h${prev} to h${level}. Do not skip heading levels.`, `Content: ${href}`);
        break; // one per file to avoid flood
      }
      prev = level;
    }

    // Check tables for headers
    const tables = content.match(/<table\b[\s\S]*?<\/table>/gi) || [];
    for (let i = 0; i < tables.length; i++) {
      if (!/<th\b/i.test(tables[i])) {
        add("epub-table-headers", "warning", `Table in ${href} has no header cells (<th>). Use <th> for column and row headers.`, `Content: ${href}, Table ${i + 1}`);
      }
    }
  }

  if (missingAlt > 0) {
    add("epub-alt-text", "error", `${missingAlt} image(s) across content documents are missing alt text.`, "Content documents", { requiresHumanReview: true });
  }

  if (!hasHeadings && contentHrefs.length > 0) {
    add("epub-headings", "warning", "No headings found in sampled content documents. Use heading elements for document structure.", "Content documents");
  }

  // 7. Reading order (spine check)
  const spineItems = opf.match(/<itemref\b[^>]*>/gi) || [];
  if (spineItems.length === 0) {
    add("epub-spine", "error", "No spine items found. The spine defines reading order and is required.", "Package spine");
  }

  return { findings, info };
}

// ---------------------------------------------------------------------------
// Report builders
// ---------------------------------------------------------------------------

function buildEpubMarkdownReport(filePath, findings, info) {
  const errors = findings.filter(f => f.severity === "error");
  const warnings = findings.filter(f => f.severity === "warning");
  const tips = findings.filter(f => f.severity === "tip");

  const lines = [
    `# EPUB Accessibility Report`,
    ``,
    `## Scan Details`,
    ``,
    `| Field | Value |`,
    `|-------|-------|`,
    `| File | ${basename(filePath)} |`,
    `| Date | ${new Date().toISOString().split("T")[0]} |`,
    `| EPUB Version | ${info.epubVersion || "unknown"} |`,
    `| Title | ${info.title || "Not set"} |`,
    `| Language | ${info.language || "Not set"} |`,
    `| Content Files | ${info.contentFiles || 0} |`,
    `| Images | ${info.imageCount || 0} |`,
    `| Navigation (nav) | ${info.hasNav ? "Yes" : "No"} |`,
    `| Navigation (NCX) | ${info.hasNcx ? "Yes" : "No"} |`,
    `| Accessibility Metadata | ${info.hasAccessibilityMetadata ? "Yes" : "No"} |`,
    `| Errors | ${errors.length} |`,
    `| Warnings | ${warnings.length} |`,
    `| Tips | ${tips.length} |`,
    ``,
  ];

  if (findings.length === 0) {
    lines.push(`No automated accessibility issues found.`, ``);
    lines.push(`> Automated EPUB scanning checks structure, metadata, and content patterns.`);
    lines.push(`> Manual review for reading order quality, alt text accuracy, and complex layouts is still required.`);
  } else {
    for (const [label, items] of [["Errors", errors], ["Warnings", warnings], ["Tips", tips]]) {
      if (items.length === 0) continue;
      lines.push(`## ${label}`, ``);
      for (const f of items) {
        lines.push(`### ${f.ruleId}`, ``);
        lines.push(f.message, ``);
        lines.push(`- **Location:** ${f.location}`);
        if (f.confidence) lines.push(`- **Confidence:** ${f.confidence}`);
        if (f.requiresHumanReview) lines.push(`- **Requires human review:** Yes`);
        lines.push(``);
      }
    }
  }

  return lines.join("\n");
}

function buildEpubSarif(filePath, findings) {
  return {
    $schema: "https://schemastore.azurewebsites.net/schemas/json/sarif-2.1.0.json",
    version: "2.1.0",
    runs: [{
      tool: { driver: { name: "a11y-agent-team-epub-scanner", version: "4.6.0" } },
      results: findings.map(f => ({
        ruleId: f.ruleId,
        level: f.severity === "error" ? "error" : f.severity === "warning" ? "warning" : "note",
        message: { text: f.message },
        locations: [{ physicalLocation: { artifactLocation: { uri: filePath } } }],
        properties: { internalLocation: f.location, confidence: f.confidence, requiresHumanReview: f.requiresHumanReview },
      })),
    }],
  };
}

// ---------------------------------------------------------------------------
// MCP Tool Registration
// ---------------------------------------------------------------------------

export function registerEpubTools(server) {
  server.registerTool(
    "scan_epub_document",
    {
      title: "Scan EPUB Document",
      description: "Scan an EPUB file for accessibility issues. Checks metadata (schema.org accessibility properties, dc:title, dc:language), navigation (nav document, NCX), content structure (headings, alt text, tables), and EPUB Accessibility 1.1 conformance markers. Optionally writes a markdown report or SARIF output.",
      inputSchema: z.object({
        filePath: z.string().describe("Absolute path to the .epub file"),
        reportPath: z.string().optional().describe("Optional path to write a markdown accessibility report"),
        sarifPath: z.string().optional().describe("Optional path to write SARIF 2.1.0 output"),
      }),
    },
    async ({ filePath, reportPath, sarifPath }) => {
      if (!filePath.toLowerCase().endsWith(".epub")) {
        return { content: [{ type: "text", text: "File must be a .epub file." }] };
      }

      let buf;
      try {
        const safe = validateFilePath(filePath);
        buf = await fsReadFile(safe);
        if (buf.length > MAX_FILE_BYTES) return { content: [{ type: "text", text: "File too large." }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Cannot read file: ${err.message}` }] };
      }

      const config = await loadEpubConfig(filePath);
      if (config.enabled === false) return { content: [{ type: "text", text: "EPUB scanning disabled in configuration." }] };

      const { findings, info } = scanEpub(buf, config);

      let reportNote = "";
      if (reportPath) {
        try {
          const safe = validateFilePath(reportPath, { write: true });
          await fsWriteFile(safe, buildEpubMarkdownReport(filePath, findings, info), "utf-8");
          reportNote += `\nReport written to: ${safe}`;
        } catch (err) { reportNote += `\nFailed to write report: ${err.message}`; }
      }
      if (sarifPath) {
        try {
          const safe = validateFilePath(sarifPath, { write: true });
          await fsWriteFile(safe, JSON.stringify(buildEpubSarif(filePath, findings), null, 2), "utf-8");
          reportNote += `\nSARIF written to: ${safe}`;
        } catch (err) { reportNote += `\nFailed to write SARIF: ${err.message}`; }
      }

      if (findings.length === 0) {
        return {
          content: [{
            type: "text",
            text: `EPUB scan complete: ${basename(filePath)}\n\nNo issues found.\nVersion: ${info.epubVersion} | Title: ${info.title || "Not set"} | Language: ${info.language || "Not set"}\nContent files: ${info.contentFiles} | Images: ${info.imageCount} | Nav: ${info.hasNav ? "Yes" : "No"}${reportNote}`,
          }],
        };
      }

      const errors = findings.filter(f => f.severity === "error").length;
      const warnings = findings.filter(f => f.severity === "warning").length;
      const tips = findings.filter(f => f.severity === "tip").length;

      const lines = [
        `EPUB scan complete: ${basename(filePath)}`,
        `Version: ${info.epubVersion} | Title: ${info.title || "Not set"} | Language: ${info.language || "Not set"}`,
        `Content files: ${info.contentFiles} | Images: ${info.imageCount} | Nav: ${info.hasNav ? "Yes" : "No"}`,
        `Issues: ${findings.length} (${errors} errors, ${warnings} warnings, ${tips} tips)`,
        "",
      ];
      for (const f of findings) lines.push(`[${f.severity.toUpperCase()}] ${f.ruleId}: ${f.message}`);
      if (reportNote) lines.push(reportNote);
      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );
}
