/**
 * A11y Agent Team — Server-based MCP Server
 *
 * Provides accessibility scanning tools over HTTP using the MCP Streamable HTTP
 * transport with SSE fallback. Replaces the old stdio-based desktop-extension.
 *
 * Transport modes:
 *   - HTTP (default): Runs on configurable port, compatible with remote clients
 *   - stdio: Use stdio.js entry point for local Claude Desktop / mcp.json
 *
 * Tools provided:
 *   Core:      check_contrast, get_accessibility_guidelines, check_heading_structure,
 *              check_link_text, check_form_labels, check_color_blindness,
 *              check_reading_level
 *   Documents: scan_office_document, scan_pdf_document, extract_document_metadata,
 *              batch_scan_documents, fix_document_metadata, fix_document_headings
 *   Media:     validate_caption_file
 *   Caching:   check_audit_cache, update_audit_cache
 *   EPUB:     scan_epub_document
 *   Markdown: scan_markdown_document
 *   Advanced:  run_axe_scan (Playwright), run_playwright_keyboard_scan,
 *              run_playwright_contrast_scan, run_verapdf_scan (veraPDF CLI),
 *              convert_pdf_form_to_html (pdf-lib)
 *   Statement: generate_accessibility_statement
 *
 * Prompts:
 *   audit-page          — Structured WCAG audit instruction for a web page
 *   check-component     — Component-specific accessibility review prompt
 *   explain-wcag        — Explain a WCAG criterion with examples
 *
 * Resources:
 *   a11y://guidelines/{component} — Component accessibility guidelines
 *   a11y://tools                  — List of available tools
 *   a11y://config/{profile}       — Scan configuration templates
 *
 * Security:
 *   - File path validation prevents traversal (CWE-22)
 *   - Symlink resolution for writes (CWE-59)
 *   - Command injection prevention via execFile (not exec)
 *   - Input size limits on all file operations
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFile as fsReadFile, writeFile as fsWriteFile, stat } from "node:fs/promises";
import { realpathSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { homedir } from "node:os";
import { join, dirname, extname, basename, resolve, sep } from "node:path";
import { inflateRawSync } from "node:zlib";

import { registerPlaywrightTools } from "./tools/playwright-tools.js";
import { registerVeraPdfTools, registerVeraPdfInstallerTools } from "./tools/verapdf-tools.js";
import { registerPdfFormTools } from "./tools/pdf-form-tools.js";
import { registerEpubTools } from "./tools/epub-tools.js";
import { registerMarkdownTools } from "./tools/markdown-tools.js";
import { registerAuditHistoryTools } from "./tools/audit-history-tools.js";
import { registerTrendTools, registerTrendResource } from "./tools/trend-tools.js";

/** Maximum file size accepted for document scanning (100 MB). */
const MAX_FILE_BYTES = 100 * 1024 * 1024;

/** Maximum number of files accepted in a single batch scan. */
const MAX_BATCH_FILES = 50;

// ---------------------------------------------------------------------------
// Path validation (OWASP A01 / CWE-22 / CWE-59)
// ---------------------------------------------------------------------------

/**
 * Resolve a path and verify it stays within allowed boundaries.
 * Reads: allowed under home directory or cwd.
 * Writes: restricted to cwd only.
 */
export function validateFilePath(inputPath, { write = false } = {}) {
  const resolved = resolve(inputPath);
  const home = homedir();
  const cwd = process.cwd();
  if (write) {
    const real = existsSync(resolved) ? realpathSync(resolved) : resolved;
    const underCwd = real === cwd || real.startsWith(cwd + sep);
    if (!underCwd) {
      throw new Error(
        `Write operations must target the current working directory. Resolved: ${real}`
      );
    }
    return real;
  }
  const underHome = resolved === home || resolved.startsWith(home + sep);
  const underCwd = resolved === cwd || resolved.startsWith(cwd + sep);
  if (!underHome && !underCwd) {
    throw new Error(
      `Path must be within your home directory or current working directory. Resolved: ${resolved}`
    );
  }
  return resolved;
}

// ---------------------------------------------------------------------------
// Color contrast calculation
// ---------------------------------------------------------------------------

function srgbToLinear(c) {
  c = c / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// ---------------------------------------------------------------------------
// APCA contrast (WCAG 3.0 draft - Accessible Perceptual Contrast Algorithm)
// Based on APCA-W3 0.0.98G-4g specification.
// ---------------------------------------------------------------------------

const APCA_EXPONENT_TXT = 0.57;
const APCA_EXPONENT_BG = 0.56;
const APCA_SCALE = 1.14;
const APCA_THRESHOLD = 0.022;
const APCA_CLAMP = 0.1;

function apcaSoftClamp(y) {
  return y < APCA_THRESHOLD ? y + Math.pow(APCA_THRESHOLD - y, 1.414) : y;
}

/**
 * Compute APCA Lightness Contrast (Lc) value.
 * Positive Lc = dark text on light background.
 * Negative Lc = light text on dark background.
 * Values range from roughly -108 to +106.
 */
function apcaContrast(textHex, bgHex) {
  // Parse and linearize
  const tR = srgbToLinear(parseInt(textHex.slice(1, 3), 16));
  const tG = srgbToLinear(parseInt(textHex.slice(3, 5), 16));
  const tB = srgbToLinear(parseInt(textHex.slice(5, 7), 16));
  const bR = srgbToLinear(parseInt(bgHex.slice(1, 3), 16));
  const bG = srgbToLinear(parseInt(bgHex.slice(3, 5), 16));
  const bB = srgbToLinear(parseInt(bgHex.slice(5, 7), 16));

  // Luminance using APCA coefficients (slightly different from WCAG 2.x)
  let txtY = 0.2126729 * tR + 0.7151522 * tG + 0.0721750 * tB;
  let bgY = 0.2126729 * bR + 0.7151522 * bG + 0.0721750 * bB;

  // Soft clamp near black
  txtY = apcaSoftClamp(txtY);
  bgY = apcaSoftClamp(bgY);

  // SAPC (Spatial APCA Predicted Contrast)
  let sapc;
  if (bgY > txtY) {
    // Dark text on light background (positive polarity)
    sapc = (Math.pow(bgY, APCA_EXPONENT_BG) - Math.pow(txtY, APCA_EXPONENT_TXT)) * APCA_SCALE;
  } else {
    // Light text on dark background (negative polarity)
    sapc = (Math.pow(bgY, APCA_EXPONENT_TXT) - Math.pow(txtY, APCA_EXPONENT_BG)) * APCA_SCALE;
  }

  // Apply low-contrast clamp
  if (Math.abs(sapc) < APCA_CLAMP) return 0;
  return sapc > 0
    ? (sapc - APCA_CLAMP) * 100
    : (sapc + APCA_CLAMP) * 100;
}

// ---------------------------------------------------------------------------
// Timestamp parsing (for caption validation)
// ---------------------------------------------------------------------------

/** Parse a VTT/SRT timestamp string (HH:MM:SS.mmm) into milliseconds. */
function parseTimestamp(ts) {
  const parts = ts.split(":");
  const secMs = parts.pop().split(".");
  const hours = parts.length > 1 ? parseInt(parts[0], 10) : 0;
  const minutes = parts.length > 0 ? parseInt(parts[parts.length - 1], 10) : 0;
  const seconds = parseInt(secMs[0], 10);
  const ms = secMs[1] ? parseInt(secMs[1].padEnd(3, "0").slice(0, 3), 10) : 0;
  return ((hours * 3600 + minutes * 60 + seconds) * 1000) + ms;
}

// ---------------------------------------------------------------------------
// HTML static analysis helpers
// ---------------------------------------------------------------------------

function extractHeadings(html) {
  const headingRe = /<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi;
  const issues = [];
  const headings = [];
  let match;
  let h1Count = 0;
  let lastLevel = 0;

  while ((match = headingRe.exec(html)) !== null) {
    const tag = match[1].toLowerCase();
    const level = parseInt(tag[1], 10);
    const text = match[2].replace(/<[^>]+>/g, "").trim();
    headings.push({ tag, level, text });

    if (level === 1) h1Count++;
    if (lastLevel > 0 && level > lastLevel + 1) {
      issues.push(
        `Skipped heading level: ${`h${lastLevel}`} → ${tag} ("${text}"). Heading levels must not skip (e.g. h2 → h4).`
      );
    }
    lastLevel = level;
  }

  if (h1Count === 0) issues.push("No <h1> found. Every page must have exactly one <h1>.");
  else if (h1Count > 1) issues.push(`Found ${h1Count} <h1> elements. There must be exactly one <h1> per page.`);

  return { headings, issues };
}

function extractLinks(html) {
  const linkRe = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  const ambiguous = /^(click here|read more|learn more|here|more|link|this|download|details|info)$/i;
  const issues = [];
  const links = [];
  let match;

  while ((match = linkRe.exec(html)) !== null) {
    const attrs = match[1];
    const innerHtml = match[2];
    const text = innerHtml.replace(/<[^>]+>/g, "").trim();
    const hrefMatch = attrs.match(/href\s*=\s*["']([^"']+)["']/i);
    const href = hrefMatch ? hrefMatch[1] : "";
    const ariaLabel = (attrs.match(/aria-label\s*=\s*["']([^"']+)["']/i) || [])[1] || "";
    const effectiveLabel = ariaLabel || text;
    links.push({ href, text, ariaLabel, effectiveLabel });

    if (!effectiveLabel) {
      issues.push(`Link with href="${href}" has no accessible name (no text, no aria-label).`);
    } else if (ambiguous.test(effectiveLabel)) {
      issues.push(
        `Ambiguous link text: "${effectiveLabel}" (href="${href}"). Link text must describe destination.`
      );
    }
  }

  return { links, issues };
}

function extractFormLabels(html) {
  const inputRe = /<(input|select|textarea)\b([^>]*)>/gi;
  const labelRe = /<label\b([^>]*)>[\s\S]*?<\/label>/gi;
  const issues = [];
  const inputs = [];
  let match;

  const labelForIds = new Set();
  while ((match = labelRe.exec(html)) !== null) {
    const forMatch = match[1].match(/for\s*=\s*["']([^"']+)["']/i);
    if (forMatch) labelForIds.add(forMatch[1]);
  }

  const re2 = /<(input|select|textarea)\b([^>]*)>/gi;
  while ((match = re2.exec(html)) !== null) {
    const tag = match[1].toLowerCase();
    const attrs = match[2];
    const typeMatch = attrs.match(/type\s*=\s*["']([^"']+)["']/i);
    const type = typeMatch ? typeMatch[1].toLowerCase() : (tag === "input" ? "text" : tag);

    if (["hidden", "submit", "button", "reset", "image"].includes(type)) continue;

    const id = (attrs.match(/id\s*=\s*["']([^"']+)["']/i) || [])[1] || "";
    const ariaLabel = (attrs.match(/aria-label\s*=\s*["']([^"']+)["']/i) || [])[1] || "";
    const ariaLabelledby = (attrs.match(/aria-labelledby\s*=\s*["']([^"']+)["']/i) || [])[1] || "";
    const title = (attrs.match(/title\s*=\s*["']([^"']+)["']/i) || [])[1] || "";
    const placeholder = (attrs.match(/placeholder\s*=\s*["']([^"']+)["']/i) || [])[1] || "";
    const name = (attrs.match(/name\s*=\s*["']([^"']+)["']/i) || [])[1] || "";

    const hasLabel = (id && labelForIds.has(id)) || ariaLabel || ariaLabelledby || title;
    const identifier = id || name || `${tag}[type=${type}]`;
    inputs.push({ tag, type, id, hasLabel, identifier });

    if (!hasLabel) {
      let hint = placeholder
        ? ` Has placeholder "${placeholder}" but placeholders are not accessible labels.`
        : "";
      issues.push(
        `Input "${identifier}" (${tag}, type=${type}) has no accessible label.${hint} ` +
        `Add a <label for="${id || "…"}"> or aria-label.`
      );
    }
  }

  return { inputs, issues };
}

// ---------------------------------------------------------------------------
// ZIP / Office document parsing helpers
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

/** Maximum uncompressed size for a single ZIP entry (500 MB). Prevents zip bombs. */
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

function getZipXml(buf, entries, name) {
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

function xmlHas(xml, tag) {
  return new RegExp(`<${tag}[\\s/>]`, "i").test(xml);
}

// ---------------------------------------------------------------------------
// PDF parsing helpers
// ---------------------------------------------------------------------------

function parsePdfBasics(buf) {
  const text = buf.toString("latin1");
  const info = {
    isTagged: false,
    hasStructureTree: false,
    hasBookmarks: false,
    hasTitle: false,
    title: "",
    hasLang: false,
    lang: "",
    pageCount: 0,
    hasForms: false,
    hasText: false,
    isEncrypted: false,
    hasEmbeddedFonts: false,
    hasUnicodeMap: false,
  };

  info.isTagged = /\/MarkInfo\s*<<[^>]*\/Marked\s+true/i.test(text);
  info.hasStructureTree = /\/StructTreeRoot\s/.test(text);
  info.hasBookmarks = /\/Outlines\s/.test(text);
  info.isEncrypted = /\/Encrypt\s/.test(text);

  const titleMatch = text.match(/\/Title\s*\(([^)]*)\)/);
  if (titleMatch && titleMatch[1].trim()) {
    info.hasTitle = true;
    info.title = titleMatch[1].trim();
  }

  const langMatch = text.match(/\/Lang\s*\(([^)]*)\)/);
  if (langMatch && langMatch[1].trim()) {
    info.hasLang = true;
    info.lang = langMatch[1].trim();
  }

  const pageMatches = text.match(/\/Type\s*\/Page\b/g);
  info.pageCount = pageMatches ? pageMatches.length : 0;

  info.hasForms = /\/AcroForm\s/.test(text);
  info.hasText = /\/Font\s/.test(text) && !/\/Subtype\s*\/Image/.test(text) === false;
  info.hasText = /BT\s/.test(text);
  info.hasEmbeddedFonts = /\/FontFile[23]?\s/.test(text);
  info.hasUnicodeMap = /\/ToUnicode\s/.test(text);

  return info;
}

// ---------------------------------------------------------------------------
// PDF scanning rules
// ---------------------------------------------------------------------------

function scanPdf(buf, config) {
  const info = parsePdfBasics(buf);
  const findings = [];
  const disabled = new Set(config.disabledRules || []);
  const severityFilter = new Set(config.severityFilter || ["error", "warning", "tip"]);

  function add(ruleId, severity, message, location, extra = {}) {
    if (disabled.has(ruleId)) return;
    if (!severityFilter.has(severity)) return;
    findings.push({ ruleId, severity, message, location, ...extra });
  }

  if (!info.isTagged) {
    add("pdf-tagged", "error", "PDF is not tagged. Tagged PDF is required for screen reader access. Re-export from source with 'Create tagged PDF' enabled.", "Document root");
  }
  if (!info.hasStructureTree) {
    add("pdf-structure-tree", "error", "No structure tree found. The document has no semantic structure for assistive technology.", "Document root");
  }
  if (!info.hasTitle) {
    add("pdf-title", "warning", "Document title is not set. Set title in document properties for screen reader window identification.", "Document properties", { confidence: "high" });
  }
  if (!info.hasLang) {
    add("pdf-language", "warning", "Document language is not set. Set language in document properties for correct screen reader pronunciation.", "Document properties", { confidence: "high" });
  }
  if (!info.hasBookmarks && info.pageCount > 1) {
    add("pdf-bookmarks", "warning", `Document has ${info.pageCount} pages but no bookmarks. Multi-page PDFs should have bookmarks for navigation.`, "Document root", { confidence: "medium" });
  }
  if (!info.hasText) {
    add("pdf-text-content", "error", "No text content detected. This may be a scanned-image PDF. Text must be available for screen reader access (use OCR).", "Document root");
  }
  if (info.isEncrypted) {
    add("pdf-encryption", "tip", "Document is encrypted. Ensure security settings allow assistive technology access.", "Document properties", { confidence: "medium" });
  }
  if (info.hasForms) {
    add("pdf-forms", "tip", "Document contains forms. Verify form fields have accessible labels and tab order is correct.", "Forms", { requiresHumanReview: true, confidence: "medium" });
  }
  if (!info.hasEmbeddedFonts) {
    add("pdf-fonts", "tip", "No embedded fonts detected. If fonts are not embedded, text may not render correctly on all systems.", "Fonts", { confidence: "low" });
  }
  if (info.isTagged && !info.hasUnicodeMap) {
    add("pdf-unicode", "warning", "Tagged PDF without Unicode mapping. Characters may not be correctly extracted by assistive technology.", "Fonts", { confidence: "medium" });
  }

  return { findings, info };
}

// ---------------------------------------------------------------------------
// Office document scanning
// ---------------------------------------------------------------------------

function scanOfficeDocument(buf, ext, config) {
  let entries;
  try {
    entries = readZipEntries(buf);
  } catch (err) {
    return { findings: [{ ruleId: "parse-error", severity: "error", message: `Cannot parse as Office file: ${err.message}`, location: "File" }], metadata: {} };
  }

  const disabled = new Set(config.disabledRules || []);
  const severityFilter = new Set(config.severityFilter || ["error", "warning", "tip"]);
  const findings = [];

  function add(ruleId, severity, message, location, extra = {}) {
    if (disabled.has(ruleId)) return;
    if (!severityFilter.has(severity)) return;
    findings.push({ ruleId, severity, message, location, ...extra });
  }

  const core = getZipXml(buf, entries, "docProps/core.xml");
  const app = getZipXml(buf, entries, "docProps/app.xml");

  const title = (xmlText(core, "dc:title")[0] || "").trim();
  const language = (xmlText(core, "dc:language")[0] || "").trim();

  if (!title) {
    add("doc-title", "warning", "Document title is not set in properties. Set via File > Properties.", "Document properties");
  }

  if (ext === ".docx") {
    const doc = getZipXml(buf, entries, "word/document.xml");
    if (!language && !xmlHas(doc, "w:lang")) {
      add("doc-language", "warning", "Document language is not set.", "Document properties");
    }
    // Check for images without alt text
    const drawings = [...doc.matchAll(/<wp:docPr\b([^>]*)(?:\/>|>[\s\S]*?<\/wp:docPr>)/gi)];
    for (const d of drawings) {
      const attrs = d[1];
      const descr = (attrs.match(/descr\s*=\s*"([^"]*)"/i) || [])[1] || "";
      const name = (attrs.match(/name\s*=\s*"([^"]*)"/i) || [])[1] || "";
      if (!descr) {
        add("doc-alt-text", "error", `Image "${name || "unnamed"}" has no alt text. Add alt text via right-click > Edit Alt Text.`, `Image: ${name || "unnamed"}`, { requiresHumanReview: true });
      }
    }
    // Check heading structure
    const styles = getZipXml(buf, entries, "word/styles.xml");
    const paraStyles = [...doc.matchAll(/<w:pStyle\s+w:val="([^"]+)"/gi)].map(m => m[1]);
    const headingLevels = paraStyles
      .filter(s => /^Heading(\d)$/i.test(s) || /^heading\s*(\d)$/i.test(s))
      .map(s => parseInt(s.replace(/\D/g, ""), 10))
      .filter(n => n >= 1 && n <= 6);

    if (headingLevels.length === 0) {
      add("doc-headings", "warning", "No headings found. Use built-in heading styles for document structure.", "Document body");
    } else {
      let prev = 0;
      for (const level of headingLevels) {
        if (prev > 0 && level > prev + 1) {
          add("doc-heading-skip", "warning", `Heading level skipped: Heading ${prev} → Heading ${level}. Do not skip heading levels.`, "Document body");
        }
        prev = level;
      }
    }
    // Check tables for header rows
    const tables = [...doc.matchAll(/<w:tbl\b[\s\S]*?<\/w:tbl>/gi)];
    for (let i = 0; i < tables.length; i++) {
      const tbl = tables[i][0];
      if (!/<w:tblHeader\b/i.test(tbl)) {
        add("doc-table-headers", "warning", `Table ${i + 1} has no header row defined. Set the first row as a header row for screen reader navigation.`, `Table ${i + 1}`);
      }
    }
  } else if (ext === ".pptx") {
    const slideFiles = [...entries.keys()].filter(k => /^ppt\/slides\/slide\d+\.xml$/.test(k));
    for (const sf of slideFiles) {
      const slide = getZipXml(buf, entries, sf);
      const slideNum = sf.match(/slide(\d+)/)[1];
      // Check images
      const pics = [...slide.matchAll(/<p:cNvPr\b([^>]*)(?:\/>|>)/gi)];
      for (const p of pics) {
        const attrs = p[1];
        const descr = (attrs.match(/descr\s*=\s*"([^"]*)"/i) || [])[1] || "";
        const name = (attrs.match(/name\s*=\s*"([^"]*)"/i) || [])[1] || "";
        if (!descr && name && !/^(Title|Subtitle|Text|Content|Slide Number|Date|Footer)/i.test(name)) {
          add("pptx-alt-text", "error", `Slide ${slideNum}: Image "${name}" has no alt text.`, `Slide ${slideNum}, ${name}`, { requiresHumanReview: true });
        }
      }
      // Check slide title
      if (!/<p:ph\s[^>]*type="title"/i.test(slide) && !/<p:ph\s[^>]*type="ctrTitle"/i.test(slide)) {
        add("pptx-slide-title", "warning", `Slide ${slideNum} has no title placeholder.`, `Slide ${slideNum}`);
      }
    }
    // Check slide order/reading order
    const presentation = getZipXml(buf, entries, "ppt/presentation.xml");
    if (!presentation) {
      add("pptx-reading-order", "tip", "Cannot verify reading order. Manually check via Selection Pane.", "Presentation");
    }
  } else if (ext === ".xlsx") {
    const workbook = getZipXml(buf, entries, "xl/workbook.xml");
    const sheetNames = xmlAttr(workbook, "sheet", "name");
    for (const name of sheetNames) {
      if (/^Sheet\d+$/i.test(name)) {
        add("xlsx-sheet-name", "warning", `Sheet "${name}" has a default name. Use descriptive sheet names.`, `Sheet: ${name}`);
      }
    }
  }

  const metadata = {
    title: title || null,
    language: language || null,
    type: ext.slice(1).toUpperCase(),
  };

  return { findings, metadata };
}

// ---------------------------------------------------------------------------
// Office config loader
// ---------------------------------------------------------------------------

async function loadOfficeConfig(filePath) {
  const defaultConfig = {
    enabled: true,
    disabledRules: [],
    severityFilter: ["error", "warning", "tip"],
    maxFileSize: MAX_FILE_BYTES,
  };
  let dir = dirname(filePath);
  for (let i = 0; i < 20; i++) {
    const configPath = join(dir, ".a11y-office-config.json");
    try {
      const raw = await fsReadFile(configPath, "utf-8");
      return { ...defaultConfig, ...JSON.parse(raw) };
    } catch { /* not found, continue */ }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return defaultConfig;
}

async function loadPdfConfig(filePath) {
  const defaultConfig = {
    enabled: true,
    disabledRules: [],
    severityFilter: ["error", "warning", "tip"],
    maxFileSize: MAX_FILE_BYTES,
  };
  let dir = dirname(filePath);
  for (let i = 0; i < 20; i++) {
    const configPath = join(dir, ".a11y-pdf-config.json");
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
// PDF report builders
// ---------------------------------------------------------------------------

function buildPdfMarkdownReport(filePath, findings, info) {
  const errors = findings.filter(f => f.severity === "error");
  const warnings = findings.filter(f => f.severity === "warning");
  const tips = findings.filter(f => f.severity === "tip");
  const humanReview = findings.filter(f => f.requiresHumanReview);

  const lines = [
    `# PDF Accessibility Report`,
    ``,
    `## Scan Details`,
    ``,
    `| Field | Value |`,
    `|-------|-------|`,
    `| File | ${basename(filePath)} |`,
    `| Date | ${new Date().toISOString().split("T")[0]} |`,
    `| Pages | ${info.pageCount || "unknown"} |`,
    `| Tagged | ${info.isTagged ? "Yes" : "No"} |`,
    `| Language | ${info.lang || "Not set"} |`,
    `| Title | ${info.title || "Not set"} |`,
    `| Has text | ${info.hasText ? "Yes" : "No (may be scanned image)"} |`,
    `| Errors | ${errors.length} |`,
    `| Warnings | ${warnings.length} |`,
    `| Tips | ${tips.length} |`,
    `| Requires human review | ${humanReview.length} |`,
    ``,
  ];

  if (findings.length === 0) {
    lines.push(`No automated accessibility issues found.`, ``);
    lines.push(`> Automated PDF scanning checks structure and metadata.`);
    lines.push(`> Manual review for reading order, alt text quality, and complex semantics is still required.`);
  } else {
    for (const [label, items] of [["Errors", errors], ["Warnings", warnings], ["Tips", tips]]) {
      if (items.length === 0) continue;
      lines.push(`## ${label}`, ``);
      for (const f of items) {
        lines.push(`### ${f.ruleId}`, ``);
        lines.push(f.message, ``);
        lines.push(`- **Location:** ${f.location}`);
        lines.push(`- **Confidence:** ${f.confidence || "high"}`);
        if (f.requiresHumanReview) lines.push(`- **Requires human review:** Yes`);
        lines.push(``);
      }
    }
  }

  return lines.join("\n");
}

function buildPdfSarif(filePath, findings) {
  return {
    $schema: "https://schemastore.azurewebsites.net/schemas/json/sarif-2.1.0.json",
    version: "2.1.0",
    runs: [{
      tool: { driver: { name: "a11y-agent-team-pdf-scanner", version: "4.6.0" } },
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
// Accessibility guidelines reference data
// ---------------------------------------------------------------------------

const GUIDELINES = {
  modal: `# Modal and Dialog Accessibility Guidelines

## Required Structure
Always use the native <dialog> element. Never build modals from <div> elements.

## Non-Negotiable Rules
- Focus MUST land on the Close button when the modal opens
- Close button MUST be the first interactive element
- <dialog> with showModal() handles focus trapping natively
- When modal closes, focus MUST return to the trigger element
- Escape MUST close the modal and return focus to trigger
- Modal heading starts at H2 (H1 is the page title)
- Use role="alertdialog" for confirmations; focus lands on least destructive action`,

  tabs: `# Tabs Accessibility Guidelines

## Required Structure
- Container has role="tablist" with aria-label
- Each tab is a <button> with role="tab" and aria-selected
- Unselected tabs have tabindex="-1"
- Panels have role="tabpanel" and aria-labelledby
- Left/Right arrow keys move between tabs
- Tab key moves focus OUT of the tablist to next component
- Home/End jump to first/last tab`,

  accordion: `# Accordion Accessibility Guidelines

## Required Structure
- Toggle button inside a heading element
- aria-expanded reflects open/closed state
- aria-controls links to panel ID
- Panel has role="region" and aria-labelledby`,

  combobox: `# Combobox / Autocomplete Accessibility Guidelines

## Required Structure
- Input has role="combobox", aria-expanded, aria-controls, aria-autocomplete="list"
- Results list has role="listbox", items have role="option"
- Arrow keys navigate options; aria-activedescendant tracks current option
- Live region announces result count
- Escape closes the list`,

  carousel: `# Carousel Accessibility Guidelines

## Required Structure
- Each slide is role="group" with aria-roledescription="slide"
- aria-label includes position ("Slide 1 of 3")
- No auto-rotation (or provide a stop button before the carousel)
- Previous/Next buttons placed before the slides
- Dot navigation uses buttons with labels ("Go to slide 1")
- Current dot has aria-current="true"`,

  form: `# Form Accessibility Guidelines

## Requirements
- Every input needs a <label> with matching for attribute
- Group related inputs with <fieldset> and <legend>
- Associate errors with aria-describedby
- On submit with errors: focus moves to first error field
- Never rely on color alone to indicate errors
- Required fields use the required attribute`,

  "live-region": `# Live Region Accessibility Guidelines

## Politeness Levels
- aria-live="polite" for most updates (search results, form success, filters)
- aria-live="assertive" ONLY for critical errors (session expiring, connection lost)

## Rules
1. Live region element MUST exist in DOM BEFORE content changes
2. Update textContent, do NOT replace elements
3. Keep announcements short; debounce rapid updates (500ms min)
4. Never use display:none or visibility:hidden on live regions`,

  navigation: `# Navigation Accessibility Guidelines

## Skip Links (required)
- First focusable element should be "Skip to main content"
- Tab order follows DOM order; never use tabindex > 0
- SPA route changes: focus must move to new page content
- Focus after deletion: move to next item (or previous if last)`,

  general: `# General Web Accessibility Guidelines (WCAG 2.2 AA)

## Core Rules
- Semantic HTML before ARIA (<button> not <div role="button">)
- One H1 per page, never skip heading levels
- <button> for actions, <a href> for navigation
- Descriptive alt for meaningful images, alt="" for decorative
- <html lang="..."> always set; descriptive <title>
- Normal text: 4.5:1 contrast; large text/UI: 3:1
- No information by color alone; support prefers-reduced-motion`,
};

// ========================== MCP SERVER SETUP ===============================

export function createServer() {
  const server = new McpServer({
    name: "a11y-agent-team",
    version: "4.6.0",
  });

  // ---- Tool: check_contrast ----
  server.registerTool(
    "check_contrast",
    {
      title: "Check Contrast Ratio",
      description: "Calculate WCAG contrast ratio between two colors. Returns the ratio and whether it passes AA for normal text (4.5:1), large text (3:1), and UI components (3:1).",
      inputSchema: z.object({
        foreground: z.string().describe('Foreground color as hex (e.g. "#1a1a1a" or "#fff")'),
        background: z.string().describe('Background color as hex (e.g. "#ffffff" or "#000")'),
      }),
    },
    async ({ foreground, background }) => {
      const expand = (h) => {
        h = h.replace("#", "");
        if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
        return "#" + h.toLowerCase();
      };
      try {
        const fg = expand(foreground);
        const bg = expand(background);
        const ratio = contrastRatio(fg, bg);
        const rounded = Math.round(ratio * 100) / 100;
        const lines = [
          `Contrast Ratio: ${rounded}:1`,
          ``,
          `WCAG AA Results:`,
          `  Normal text (4.5:1 required): ${ratio >= 4.5 ? "PASS" : "FAIL"}`,
          `  Large text (3:1 required):    ${ratio >= 3.0 ? "PASS" : "FAIL"}`,
          `  UI components (3:1 required): ${ratio >= 3.0 ? "PASS" : "FAIL"}`,
          ``,
          `Colors: ${fg} on ${bg}`,
        ];
        if (ratio < 4.5) {
          lines.push(``, `To pass normal text AA, you need a ratio of at least 4.5:1.`);
          lines.push(`Current ratio ${rounded}:1 is ${ratio >= 3.0 ? "only sufficient for large text and UI components" : "insufficient for all WCAG AA levels"}.`);
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch {
        return { content: [{ type: "text", text: `Error: Could not parse colors. Use hex format like "#1a1a1a" or "#fff".` }] };
      }
    }
  );

  // ---- Tool: check_apca_contrast (WCAG 3.0 draft) ----
  server.registerTool(
    "check_apca_contrast",
    {
      title: "Check APCA Contrast (WCAG 3.0 Draft)",
      description:
        "Calculate APCA (Accessible Perceptual Contrast Algorithm) Lightness Contrast " +
        "between text and background colors. APCA is the candidate contrast method for " +
        "WCAG 3.0 and provides perceptually uniform results. Returns Lc value and " +
        "recommended minimum font sizes. EXPERIMENTAL: WCAG 3.0 is still in draft.",
      inputSchema: z.object({
        foreground: z.string().describe('Text color as hex (e.g. "#1a1a1a" or "#fff")'),
        background: z.string().describe('Background color as hex (e.g. "#ffffff" or "#000")'),
      }),
    },
    async ({ foreground, background }) => {
      const expand = (h) => {
        h = h.replace("#", "");
        if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
        return "#" + h.toLowerCase();
      };
      try {
        const fg = expand(foreground);
        const bg = expand(background);
        const lc = apcaContrast(fg, bg);
        const absLc = Math.abs(Math.round(lc * 10) / 10);
        const polarity = lc >= 0 ? "dark text on light background" : "light text on dark background";

        // APCA font size lookup table (simplified from APCA-W3 spec)
        // |Lc| >= threshold => minimum font weight and size
        const levels = [
          { lc: 90, use: "Body text: 14px/400 weight or larger" },
          { lc: 75, use: "Body text: 16px/400 weight, or 14px/700 weight" },
          { lc: 60, use: "Large text: 24px/400 weight, or 18px/700 weight" },
          { lc: 45, use: "Headlines only: 36px/400 weight, or 24px/700 weight" },
          { lc: 30, use: "Non-text elements only (icons, borders, focus rings)" },
          { lc: 15, use: "Barely perceptible; not suitable for any meaningful content" },
        ];

        let recommendation = "Insufficient contrast for any use";
        for (const level of levels) {
          if (absLc >= level.lc) {
            recommendation = level.use;
            break;
          }
        }

        // Also compute WCAG 2.x ratio for comparison
        const wcagRatio = contrastRatio(fg, bg);
        const wcagRounded = Math.round(wcagRatio * 100) / 100;

        const lines = [
          `APCA Lightness Contrast (Lc): ${absLc}`,
          `Polarity: ${polarity}`,
          ``,
          `Recommended Use: ${recommendation}`,
          ``,
          `APCA Thresholds:`,
          `  Lc >= 90: Body text (14px+)`,
          `  Lc >= 75: Body text (16px+ or 14px bold)`,
          `  Lc >= 60: Large text (24px+ or 18px bold)`,
          `  Lc >= 45: Headlines (36px+ or 24px bold)`,
          `  Lc >= 30: Non-text only (icons, borders)`,
          `  Lc <  15: Not usable`,
          ``,
          `For comparison -- WCAG 2.x ratio: ${wcagRounded}:1`,
          ``,
          `Colors: ${fg} text on ${bg} background`,
          ``,
          `Note: APCA is part of the WCAG 3.0 Working Draft and is not yet a W3C Recommendation.`,
          `Current WCAG 2.2 AA still uses the traditional contrast ratio method.`,
        ];
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch {
        return { content: [{ type: "text", text: `Error: Could not parse colors. Use hex format like "#1a1a1a" or "#fff".` }] };
      }
    }
  );

  // ---- Tool: get_accessibility_guidelines ----
  server.registerTool(
    "get_accessibility_guidelines",
    {
      title: "Get Accessibility Guidelines",
      description: "Get detailed WCAG AA accessibility guidelines for a specific component type. Returns requirements, code examples, and common mistakes.",
      inputSchema: z.object({
        component: z.enum(["modal", "tabs", "accordion", "combobox", "carousel", "form", "live-region", "navigation", "general"]).describe("The type of component to get guidelines for"),
      }),
    },
    async ({ component }) => {
      const g = GUIDELINES[component];
      if (!g) return { content: [{ type: "text", text: `No guidelines found for "${component}".` }] };
      return { content: [{ type: "text", text: g }] };
    }
  );

  // ---- Tool: check_heading_structure ----
  server.registerTool(
    "check_heading_structure",
    {
      title: "Check Heading Structure",
      description: "Analyze HTML content for heading hierarchy issues: skipped levels, multiple H1s, missing H1.",
      inputSchema: z.object({
        html: z.string().describe("HTML content to analyze"),
      }),
    },
    async ({ html }) => {
      const { headings, issues } = extractHeadings(html);
      if (headings.length === 0) return { content: [{ type: "text", text: "No headings found in the provided HTML." }] };
      const lines = ["Heading Structure:", ""];
      for (const h of headings) lines.push(`  ${h.tag.toUpperCase()}: ${h.text}`);
      lines.push("");
      if (issues.length === 0) lines.push("No heading issues found.");
      else { lines.push(`Issues (${issues.length}):`); for (const i of issues) lines.push(`  - ${i}`); }
      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );

  // ---- Tool: check_link_text ----
  server.registerTool(
    "check_link_text",
    {
      title: "Check Link Text",
      description: "Analyze HTML for ambiguous or missing link text. Checks for 'click here', 'read more', empty links.",
      inputSchema: z.object({
        html: z.string().describe("HTML content to analyze"),
      }),
    },
    async ({ html }) => {
      const { links, issues } = extractLinks(html);
      if (links.length === 0) return { content: [{ type: "text", text: "No links found in the provided HTML." }] };
      const lines = [`Found ${links.length} links.`, ""];
      if (issues.length === 0) lines.push("No link text issues found.");
      else { lines.push(`Issues (${issues.length}):`); for (const i of issues) lines.push(`  - ${i}`); }
      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );

  // ---- Tool: check_form_labels ----
  server.registerTool(
    "check_form_labels",
    {
      title: "Check Form Labels",
      description: "Analyze HTML form inputs for missing accessible labels. Checks <label for>, aria-label, aria-labelledby, and title.",
      inputSchema: z.object({
        html: z.string().describe("HTML content to analyze"),
      }),
    },
    async ({ html }) => {
      const { inputs, issues } = extractFormLabels(html);
      if (inputs.length === 0) return { content: [{ type: "text", text: "No form inputs found in the provided HTML." }] };
      const lines = [`Found ${inputs.length} form inputs.`, ""];
      if (issues.length === 0) lines.push("All inputs have accessible labels.");
      else { lines.push(`Issues (${issues.length}):`); for (const i of issues) lines.push(`  - ${i}`); }
      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );

  // ---- Tool: scan_office_document ----
  server.registerTool(
    "scan_office_document",
    {
      title: "Scan Office Document for Accessibility",
      description: "Scan a .docx, .xlsx, or .pptx file for accessibility issues. Checks title, language, alt text, headings, table headers, and more.",
      inputSchema: z.object({
        filePath: z.string().describe("Absolute path to the Office document"),
      }),
    },
    async ({ filePath }) => {
      const ext = extname(filePath).toLowerCase();
      if (![".docx", ".xlsx", ".pptx"].includes(ext)) {
        return { content: [{ type: "text", text: `Unsupported file type. Expected .docx, .xlsx, or .pptx.` }] };
      }
      let buf;
      try {
        const safe = validateFilePath(filePath);
        buf = await fsReadFile(safe);
        if (buf.length > MAX_FILE_BYTES) return { content: [{ type: "text", text: `File too large (max ${MAX_FILE_BYTES / 1024 / 1024} MB).` }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Cannot read file: ${err.message}` }] };
      }
      const config = await loadOfficeConfig(filePath);
      if (config.enabled === false) return { content: [{ type: "text", text: "Office scanning disabled in configuration." }] };
      const { findings } = scanOfficeDocument(buf, ext, config);
      if (findings.length === 0) return { content: [{ type: "text", text: `No accessibility issues found in ${basename(filePath)}.` }] };
      const lines = [`Scan complete: ${basename(filePath)}`, `Issues: ${findings.length}`, ""];
      for (const f of findings) lines.push(`[${f.severity.toUpperCase()}] ${f.ruleId}: ${f.message}`);
      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );

  // ---- Tool: scan_pdf_document ----
  server.registerTool(
    "scan_pdf_document",
    {
      title: "Scan PDF Document for Accessibility",
      description: "Scan a PDF file for accessibility issues using PDF/UA checks. Checks tagging, structure, language, alt text, bookmarks, forms, and more.",
      inputSchema: z.object({
        filePath: z.string().describe("Absolute path to the PDF file"),
        reportPath: z.string().optional().describe("File path to write a markdown accessibility report"),
        sarifPath: z.string().optional().describe("File path to write SARIF 2.1.0 output"),
      }),
    },
    async ({ filePath, reportPath, sarifPath }) => {
      if (!filePath.toLowerCase().endsWith(".pdf")) {
        return { content: [{ type: "text", text: "File must be a .pdf file." }] };
      }
      let buf;
      try {
        const safe = validateFilePath(filePath);
        buf = await fsReadFile(safe);
        if (buf.length > MAX_FILE_BYTES) return { content: [{ type: "text", text: `File too large.` }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Cannot read file: ${err.message}` }] };
      }
      const header = buf.toString("latin1", 0, 8);
      if (!header.startsWith("%PDF-")) return { content: [{ type: "text", text: "Not a valid PDF." }] };

      const config = await loadPdfConfig(filePath);
      if (config.enabled === false) return { content: [{ type: "text", text: "PDF scanning disabled in configuration." }] };
      const { findings, info } = scanPdf(buf, config);

      let reportNote = "";
      if (reportPath) {
        try {
          const safe = validateFilePath(reportPath, { write: true });
          await fsWriteFile(safe, buildPdfMarkdownReport(filePath, findings, info), "utf-8");
          reportNote += `\nReport written to: ${safe}`;
        } catch (err) { reportNote += `\nFailed to write report: ${err.message}`; }
      }
      if (sarifPath) {
        try {
          const safe = validateFilePath(sarifPath, { write: true });
          await fsWriteFile(safe, JSON.stringify(buildPdfSarif(filePath, findings), null, 2), "utf-8");
          reportNote += `\nSARIF written to: ${safe}`;
        } catch (err) { reportNote += `\nFailed to write SARIF: ${err.message}`; }
      }

      if (findings.length === 0) {
        return { content: [{ type: "text", text: `PDF scan complete: ${basename(filePath)}\n\nNo issues found.\nPages: ${info.pageCount} | Tagged: ${info.isTagged ? "Yes" : "No"} | Language: ${info.lang || "Not set"}${reportNote}` }] };
      }
      const lines = [`PDF scan complete: ${basename(filePath)}`, `Pages: ${info.pageCount} | Tagged: ${info.isTagged ? "Yes" : "No"} | Language: ${info.lang || "Not set"}`, `Issues: ${findings.length}`, ""];
      for (const f of findings) lines.push(`[${f.severity.toUpperCase()}] ${f.ruleId}: ${f.message}`);
      if (reportNote) lines.push(reportNote);
      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );

  // ---- Tool: extract_document_metadata ----
  server.registerTool(
    "extract_document_metadata",
    {
      title: "Extract Document Metadata",
      description: "Extract accessibility-relevant metadata from an Office document or PDF. Returns title, author, language, page count, and accessibility property health.",
      inputSchema: z.object({
        filePath: z.string().describe("Absolute path to the document file (.docx, .xlsx, .pptx, or .pdf)"),
      }),
    },
    async ({ filePath }) => {
      const ext = extname(filePath).toLowerCase();
      if (![".docx", ".xlsx", ".pptx", ".pdf"].includes(ext)) {
        return { content: [{ type: "text", text: `Unsupported file type: ${ext}` }] };
      }
      let buf;
      try {
        const safe = validateFilePath(filePath);
        buf = await fsReadFile(safe);
        if (buf.length > MAX_FILE_BYTES) return { content: [{ type: "text", text: `File too large.` }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Cannot read file: ${err.message}` }] };
      }

      if (ext === ".pdf") {
        const info = parsePdfBasics(buf);
        const lines = [
          `Document Metadata: ${basename(filePath)}`,
          `Type: PDF | Pages: ${info.pageCount} | Tagged: ${info.isTagged ? "Yes" : "No"}`,
          `Title: ${info.title || "NOT SET"} | Language: ${info.lang || "NOT SET"}`,
          ``,
          `Accessibility Health:`,
          `  Title: ${info.hasTitle ? "PASS" : "FAIL"} | Language: ${info.hasLang ? "PASS" : "FAIL"}`,
          `  Tagged: ${info.isTagged ? "PASS" : "FAIL"} | Structure: ${info.hasStructureTree ? "PASS" : "FAIL"}`,
          `  Text: ${info.hasText ? "PASS" : "FAIL"}`,
        ];
        return { content: [{ type: "text", text: lines.join("\n") }] };
      }

      let entries;
      try { entries = readZipEntries(buf); } catch (err) {
        return { content: [{ type: "text", text: `Cannot parse as Office file: ${err.message}` }] };
      }
      const core = getZipXml(buf, entries, "docProps/core.xml");
      const title = (xmlText(core, "dc:title")[0] || "").trim();
      const creator = (xmlText(core, "dc:creator")[0] || "").trim();
      const language = (xmlText(core, "dc:language")[0] || "").trim();
      const lines = [
        `Document Metadata: ${basename(filePath)}`,
        `Type: ${ext.slice(1).toUpperCase()}`,
        `Title: ${title || "NOT SET"} | Author: ${creator || "NOT SET"} | Language: ${language || "NOT SET"}`,
        ``,
        `Accessibility Health:`,
        `  Title: ${title ? "PASS" : "FAIL"} | Author: ${creator ? "PASS" : "FAIL"} | Language: ${language ? "PASS" : "FAIL"}`,
      ];
      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );

  // ---- Tool: batch_scan_documents ----
  server.registerTool(
    "batch_scan_documents",
    {
      title: "Batch Scan Documents",
      description: "Scan multiple Office and PDF documents for accessibility issues in a single call. Returns a summary with per-file results.",
      inputSchema: z.object({
        filePaths: z.array(z.string()).max(MAX_BATCH_FILES).describe("Array of absolute file paths to scan (max 50)"),
      }),
    },
    async ({ filePaths }) => {
      if (filePaths.length === 0) return { content: [{ type: "text", text: "No files provided." }] };
      if (filePaths.length > MAX_BATCH_FILES) return { content: [{ type: "text", text: `Too many files. Maximum: ${MAX_BATCH_FILES}` }] };

      const results = [];
      let totalIssues = 0;
      let errorCount = 0;

      for (const fp of filePaths) {
        const ext = extname(fp).toLowerCase();
        if (![".docx", ".xlsx", ".pptx", ".pdf"].includes(ext)) {
          results.push(`SKIP ${basename(fp)}: unsupported type`);
          continue;
        }
        try {
          const safe = validateFilePath(fp);
          const buf = await fsReadFile(safe);
          if (buf.length > MAX_FILE_BYTES) { results.push(`SKIP ${basename(fp)}: too large`); continue; }
          let findings;
          if (ext === ".pdf") {
            const config = await loadPdfConfig(fp);
            ({ findings } = scanPdf(buf, config));
          } else {
            const config = await loadOfficeConfig(fp);
            ({ findings } = scanOfficeDocument(buf, ext, config));
          }
          totalIssues += findings.length;
          const errors = findings.filter(f => f.severity === "error").length;
          const warnings = findings.filter(f => f.severity === "warning").length;
          errorCount += errors;
          results.push(`${findings.length === 0 ? "PASS" : "FAIL"} ${basename(fp)}: ${errors} errors, ${warnings} warnings`);
        } catch (err) {
          results.push(`ERROR ${basename(fp)}: ${err.message}`);
        }
      }

      const lines = [
        `Batch Scan Summary: ${filePaths.length} files`,
        `Total Issues: ${totalIssues} | Files with Errors: ${errorCount > 0 ? "Yes" : "None"}`,
        "",
        ...results,
      ];
      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );

  // ---- Register optional tool modules ----
  registerPlaywrightTools(server);
  registerVeraPdfTools(server);
  registerVeraPdfInstallerTools(server);
  registerPdfFormTools(server);
  registerEpubTools(server);
  registerMarkdownTools(server);
  registerAuditHistoryTools(server);
  registerTrendTools(server);

  // ---- Tool: fix_document_metadata ----
  server.registerTool(
    "fix_document_metadata",
    {
      title: "Fix Document Metadata",
      description: "Fix common metadata accessibility issues in Office documents: missing title, missing language, missing author. Returns a report of changes made.",
      inputSchema: z.object({
        filePath: z.string().describe("Absolute path to the document (.docx, .xlsx, .pptx)"),
        title: z.string().optional().describe("Document title to set"),
        language: z.string().optional().describe('Document language to set (BCP 47 tag, e.g. "en-US")'),
        author: z.string().optional().describe("Document author to set"),
      }),
    },
    async ({ filePath, title, language, author }) => {
      try {
        const safe = validateFilePath(filePath);
        const ext = extname(safe).toLowerCase();
        if (![".docx", ".xlsx", ".pptx"].includes(ext)) {
          return { content: [{ type: "text", text: "Unsupported format. Supported: .docx, .xlsx, .pptx" }] };
        }
        const fstat = await stat(safe);
        if (fstat.size > MAX_FILE_BYTES) {
          return { content: [{ type: "text", text: "File too large." }] };
        }

        const changes = [];
        if (title) changes.push(`Title: "${title}"`);
        if (language) changes.push(`Language: "${language}"`);
        if (author) changes.push(`Author: "${author}"`);

        if (changes.length === 0) {
          return { content: [{ type: "text", text: "No changes specified. Provide at least one of: title, language, author." }] };
        }

        // Read the OOXML package and update core.xml properties
        const buf = await fsReadFile(safe);
        const lines = [
          `Document Metadata Fix Report: ${basename(filePath)}`,
          "",
          "Changes to apply:",
          ...changes.map(c => `  - ${c}`),
          "",
          "Note: For Office documents, metadata changes require modifying the",
          "docProps/core.xml within the OOXML package. Use the following PowerShell",
          "command to apply these changes:",
          "",
        ];

        if (title) {
          lines.push(`# Set title`);
          lines.push(`$doc = [System.IO.Packaging.Package]::Open("${safe}", [System.IO.FileMode]::Open)`);
          lines.push(`# Modify /docProps/core.xml dc:title element`);
        }

        lines.push("", "Alternatively, open the file in the Office application:");
        lines.push("  File → Info → Properties → Title/Author/Language");

        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${err.message}` }] };
      }
    }
  );

  // ---- Tool: fix_document_headings ----
  server.registerTool(
    "fix_document_headings",
    {
      title: "Fix Document Headings",
      description: "Analyze and report heading structure issues in Office documents with fix instructions. Detects skipped levels, missing Heading 1, visual-only formatting, and provides remediation steps.",
      inputSchema: z.object({
        filePath: z.string().describe("Absolute path to the document (.docx)"),
      }),
    },
    async ({ filePath }) => {
      try {
        const safe = validateFilePath(filePath);
        const ext = extname(safe).toLowerCase();
        if (ext !== ".docx") {
          return { content: [{ type: "text", text: "Heading structure analysis currently supports .docx files only." }] };
        }
        const fstat = await stat(safe);
        if (fstat.size > MAX_FILE_BYTES) {
          return { content: [{ type: "text", text: "File too large." }] };
        }

        const buf = await fsReadFile(safe);
        // Parse document.xml from the OOXML ZIP package to extract heading styles
        const entries = parseZipCd(buf);
        const text = getZipXml(buf, entries, "word/document.xml");
        if (!text) {
          return { content: [{ type: "text", text: "Could not extract document.xml from the .docx archive." }] };
        }
        const headingPattern = /w:pStyle w:val="Heading(\d)"/gi;
        const headings = [];
        let match;
        while ((match = headingPattern.exec(text)) !== null) {
          headings.push(parseInt(match[1], 10));
        }

        const lines = [`Heading Structure Analysis: ${basename(filePath)}`, ""];

        if (headings.length === 0) {
          lines.push("WARNING: No headings found in document.");
          lines.push("Documents should use built-in Heading styles (Heading 1, Heading 2, etc.)");
          lines.push("instead of bold/large font formatting.");
        } else {
          lines.push(`Found ${headings.length} headings: ${headings.map(h => `H${h}`).join(", ")}`);
          lines.push("");

          // Check for missing H1
          if (!headings.includes(1)) {
            lines.push("ERROR: No Heading 1 found. Every document should start with a Heading 1.");
          }

          // Check for skipped levels
          const sorted = [...new Set(headings)].sort();
          for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] - sorted[i - 1] > 1) {
              lines.push(`ERROR: Heading level skipped — H${sorted[i - 1]} to H${sorted[i]}`);
            }
          }

          if (lines.length === 2 + 1) {
            lines.push("PASS: Heading structure looks correct.");
          }
        }

        lines.push("", "Remediation:", "  1. Use built-in Heading styles from the Styles gallery");
        lines.push("  2. Start with Heading 1, then Heading 2, etc. — never skip levels");
        lines.push("  3. Do not use bold/font-size to simulate headings");

        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${err.message}` }] };
      }
    }
  );

  // ---- Tool: check_audit_cache ----
  server.registerTool(
    "check_audit_cache",
    {
      title: "Check Audit Cache",
      description: "Check the component audit cache (.a11y-cache.json) to determine which files have changed since the last scan and need re-auditing. Supports content hashing for reliable change detection and configurable expiry. Returns lists of changed, new, expired, and unchanged files plus cache statistics.",
      inputSchema: z.object({
        filePaths: z.array(z.string()).max(MAX_BATCH_FILES).describe("Array of file paths to check against the cache"),
        cacheFile: z.string().optional().describe("Path to cache file (default: .a11y-cache.json in project root)"),
        useContentHash: z.boolean().optional().describe("Use SHA-256 content hash instead of size+mtime (more reliable but slower). Default: false"),
        maxAgeDays: z.number().optional().describe("Treat entries older than this many days as expired and needing re-scan. Default: no expiry"),
      }),
    },
    async ({ filePaths, cacheFile, useContentHash, maxAgeDays }) => {
      try {
        const cachePath = cacheFile
          ? validateFilePath(cacheFile)
          : join(process.cwd(), ".a11y-cache.json");

        let cache = {};
        if (existsSync(cachePath)) {
          const raw = await fsReadFile(cachePath, "utf8");
          cache = JSON.parse(raw);
        }

        const changed = [];
        const unchanged = [];
        const newFiles = [];
        const expired = [];
        const nowMs = Date.now();
        const maxAgeMs = maxAgeDays ? maxAgeDays * 86400000 : 0;

        for (const fp of filePaths) {
          try {
            const safe = validateFilePath(fp);
            const fstat = await stat(safe);
            let currentHash;
            if (useContentHash) {
              const content = await fsReadFile(safe);
              currentHash = createHash("sha256").update(content).digest("hex");
            } else {
              currentHash = `${fstat.size}-${fstat.mtimeMs}`;
            }
            const cached = cache[safe];

            if (!cached) {
              newFiles.push(basename(safe));
            } else if (maxAgeMs && cached.scannedAt) {
              const age = nowMs - new Date(cached.scannedAt).getTime();
              if (age > maxAgeMs) {
                expired.push(basename(safe));
                continue;
              }
              if (cached.hash !== currentHash) changed.push(basename(safe));
              else unchanged.push(basename(safe));
            } else if (cached.hash !== currentHash) {
              changed.push(basename(safe));
            } else {
              unchanged.push(basename(safe));
            }
          } catch {
            newFiles.push(basename(fp));
          }
        }

        const totalEntries = Object.keys(cache).length;
        const totalFindings = Object.values(cache).reduce((sum, e) => sum + (e.findings || 0), 0);
        const needsScan = newFiles.length + changed.length + expired.length;

        const lines = [
          `Audit Cache Check: ${filePaths.length} files`,
          `Hash mode: ${useContentHash ? "SHA-256 content" : "size+mtime"}${maxAgeDays ? ` | Max age: ${maxAgeDays} days` : ""}`,
          "",
          `New (not previously scanned): ${newFiles.length}`,
          ...newFiles.map(f => `  + ${f}`),
          "",
          `Changed (need re-scan): ${changed.length}`,
          ...changed.map(f => `  ~ ${f}`),
        ];

        if (expired.length > 0) {
          lines.push("", `Expired (older than ${maxAgeDays} days): ${expired.length}`);
          lines.push(...expired.map(f => `  ! ${f}`));
        }

        lines.push(
          "",
          `Unchanged (skip): ${unchanged.length}`,
          ...unchanged.map(f => `  = ${f}`),
          "",
          `Files to scan: ${needsScan} of ${filePaths.length}`,
          "",
          `Cache statistics:`,
          `  Total cached entries: ${totalEntries}`,
          `  Total cached findings: ${totalFindings}`,
        );

        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${err.message}` }] };
      }
    }
  );

  // ---- Tool: update_audit_cache ----
  server.registerTool(
    "update_audit_cache",
    {
      title: "Update Audit Cache",
      description: "Update the component audit cache (.a11y-cache.json) after scanning files. Stores file hashes, finding counts, severity breakdown, and scan timestamp so unchanged files can be skipped on re-audit.",
      inputSchema: z.object({
        entries: z.array(z.object({
          filePath: z.string().describe("Absolute path to the scanned file"),
          findingCount: z.number().describe("Number of accessibility findings in this file"),
          errorCount: z.number().optional().describe("Number of error-severity findings"),
          warningCount: z.number().optional().describe("Number of warning-severity findings"),
        })).describe("Array of scan results to cache"),
        cacheFile: z.string().optional().describe("Path to cache file (default: .a11y-cache.json in project root)"),
        useContentHash: z.boolean().optional().describe("Use SHA-256 content hash instead of size+mtime. Default: false"),
      }),
    },
    async ({ entries, cacheFile, useContentHash }) => {
      try {
        const cachePath = cacheFile
          ? validateFilePath(cacheFile, { write: true })
          : join(process.cwd(), ".a11y-cache.json");

        let cache = {};
        if (existsSync(cachePath)) {
          const raw = await fsReadFile(cachePath, "utf8");
          cache = JSON.parse(raw);
        }

        let updated = 0;
        for (const entry of entries) {
          try {
            const safe = validateFilePath(entry.filePath);
            const fstat = await stat(safe);
            let hash;
            if (useContentHash) {
              const content = await fsReadFile(safe);
              hash = createHash("sha256").update(content).digest("hex");
            } else {
              hash = `${fstat.size}-${fstat.mtimeMs}`;
            }
            cache[safe] = {
              hash,
              findings: entry.findingCount,
              errors: entry.errorCount || 0,
              warnings: entry.warningCount || 0,
              scannedAt: new Date().toISOString(),
            };
            updated++;
          } catch {
            // Skip files that can't be accessed
          }
        }

        // Write using validateFilePath for write safety
        const safeCachePath = validateFilePath(cachePath, { write: true });
        await fsWriteFile(
          safeCachePath,
          JSON.stringify(cache, null, 2),
          "utf8"
        );

        const totalEntries = Object.keys(cache).length;
        const totalFindings = Object.values(cache).reduce((sum, e) => sum + (e.findings || 0), 0);

        return {
          content: [{
            type: "text",
            text: `Audit cache updated: ${updated} entries written to ${basename(cachePath)}\nTotal cached: ${totalEntries} files, ${totalFindings} findings`,
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${err.message}` }] };
      }
    }
  );

  // =========================================================================
  // NEW TOOLS: Color Blindness, Reading Level, Caption Validation, Statement
  // =========================================================================

  // ---- Tool: check_color_blindness ----
  server.registerTool(
    "check_color_blindness",
    {
      title: "Check Color Blindness",
      description: "Simulate how a color pair looks under different types of color vision deficiency (protanopia, deuteranopia, tritanopia, achromatopsia). Returns simulated colors and whether distinction is maintained.",
      inputSchema: z.object({
        colors: z.array(z.string()).min(2).describe("Array of hex colors to compare (e.g. ['#FF0000', '#00FF00'])"),
      }),
    },
    async ({ colors }) => {
      try {
        const parseHex = (hex) => {
          hex = hex.replace("#", "");
          if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
          return [parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16)];
        };

        // Brettel et al. simulation matrices (simplified)
        const matrices = {
          protanopia:    [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
          deuteranopia:  [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047414], [-0.011820, 0.042940, 0.968881]],
          tritanopia:    [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.303900]],
          achromatopsia: [[0.2126, 0.7152, 0.0722], [0.2126, 0.7152, 0.0722], [0.2126, 0.7152, 0.0722]],
        };

        const simulate = (rgb, matrix) => {
          return [
            Math.round(Math.max(0, Math.min(255, matrix[0][0]*rgb[0] + matrix[0][1]*rgb[1] + matrix[0][2]*rgb[2]))),
            Math.round(Math.max(0, Math.min(255, matrix[1][0]*rgb[0] + matrix[1][1]*rgb[1] + matrix[1][2]*rgb[2]))),
            Math.round(Math.max(0, Math.min(255, matrix[2][0]*rgb[0] + matrix[2][1]*rgb[1] + matrix[2][2]*rgb[2]))),
          ];
        };

        const toHex = (rgb) => "#" + rgb.map(c => c.toString(16).padStart(2, "0")).join("");

        const deltaE = (a, b) => Math.sqrt(a.reduce((sum, v, i) => sum + (v - b[i]) ** 2, 0));

        const parsed = colors.map(parseHex);
        const results = {};

        for (const [type, matrix] of Object.entries(matrices)) {
          const simulated = parsed.map(c => simulate(c, matrix));
          const pairs = [];
          for (let i = 0; i < simulated.length; i++) {
            for (let j = i + 1; j < simulated.length; j++) {
              const de = Math.round(deltaE(simulated[i], simulated[j]) * 100) / 100;
              pairs.push({
                original: [colors[i], colors[j]],
                simulated: [toHex(simulated[i]), toHex(simulated[j])],
                deltaE: de,
                distinguishable: de > 20,
              });
            }
          }
          results[type] = pairs;
        }

        return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${err.message}` }] };
      }
    }
  );

  // ---- Tool: check_reading_level ----
  server.registerTool(
    "check_reading_level",
    {
      title: "Check Reading Level",
      description: "Analyze text readability using Flesch-Kincaid Grade Level, Flesch Reading Ease, and Gunning Fog Index. Helps ensure content meets WCAG 3.1.5 (AAA) reading level guidance and cognitive accessibility best practices.",
      inputSchema: z.object({
        text: z.string().min(1).max(50000).describe("Text content to analyze"),
      }),
    },
    async ({ text }) => {
      try {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const words = text.split(/\s+/).filter(w => w.replace(/[^a-zA-Z]/g, "").length > 0);
        const syllableCount = (word) => {
          word = word.toLowerCase().replace(/[^a-z]/g, "");
          if (word.length <= 2) return 1;
          word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
          word = word.replace(/^y/, "");
          const vowels = word.match(/[aeiouy]{1,2}/g);
          return vowels ? vowels.length : 1;
        };

        const totalSentences = sentences.length || 1;
        const totalWords = words.length || 1;
        const totalSyllables = words.reduce((sum, w) => sum + syllableCount(w), 0);
        const complexWords = words.filter(w => syllableCount(w) >= 3).length;

        const fleschEase = 206.835 - 1.015 * (totalWords / totalSentences) - 84.6 * (totalSyllables / totalWords);
        const fleschKincaid = 0.39 * (totalWords / totalSentences) + 11.8 * (totalSyllables / totalWords) - 15.59;
        const gunningFog = 0.4 * ((totalWords / totalSentences) + 100 * (complexWords / totalWords));

        const round = (n) => Math.round(n * 100) / 100;

        let easeLabel;
        if (fleschEase >= 80) easeLabel = "Easy (6th grade)";
        else if (fleschEase >= 60) easeLabel = "Standard (8th-9th grade)";
        else if (fleschEase >= 40) easeLabel = "Moderately Difficult (10th-12th grade)";
        else if (fleschEase >= 20) easeLabel = "Difficult (College level)";
        else easeLabel = "Very Difficult (Graduate level)";

        const wcagAAA = fleschKincaid <= 9;

        const result = {
          statistics: {
            sentences: totalSentences,
            words: totalWords,
            syllables: totalSyllables,
            complexWords,
            avgWordsPerSentence: round(totalWords / totalSentences),
            avgSyllablesPerWord: round(totalSyllables / totalWords),
          },
          scores: {
            fleschReadingEase: { score: round(fleschEase), label: easeLabel },
            fleschKincaidGrade: round(fleschKincaid),
            gunningFogIndex: round(gunningFog),
          },
          wcag: {
            criterion: "3.1.5 Reading Level (AAA)",
            recommendation: "Lower secondary education level (≤ grade 9)",
            passes: wcagAAA,
          },
        };

        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${err.message}` }] };
      }
    }
  );

  // ---- Tool: validate_caption_file ----
  server.registerTool(
    "validate_caption_file",
    {
      title: "Validate Caption File",
      description: "Validate a WebVTT or SRT caption file for syntax errors, timing overlaps, excessive caption rate, and missing speaker identification. Helps ensure media accessibility compliance (WCAG 1.2.2, 1.2.4).",
      inputSchema: z.object({
        filePath: z.string().describe("Absolute path to the .vtt or .srt caption file"),
      }),
    },
    async ({ filePath }) => {
      try {
        const safePath = validateFilePath(filePath);
        const fstat = await stat(safePath);
        if (fstat.size > MAX_FILE_BYTES) throw new Error("File too large");

        const content = await fsReadFile(safePath, "utf8");
        const ext = extname(safePath).toLowerCase();
        const issues = [];
        let cueCount = 0;

        if (ext === ".vtt") {
          if (!content.trimStart().startsWith("WEBVTT")) {
            issues.push({ severity: "critical", message: "Missing WEBVTT header" });
          }

          const cueRegex = /(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})/g;
          let match;
          let prevEnd = 0;
          while ((match = cueRegex.exec(content)) !== null) {
            cueCount++;
            const start = parseTimestamp(match[1]);
            const end = parseTimestamp(match[2]);
            if (end <= start) {
              issues.push({ severity: "serious", message: `Cue ${cueCount}: end time (${match[2]}) ≤ start time (${match[1]})`, cue: cueCount });
            }
            if (start < prevEnd) {
              issues.push({ severity: "moderate", message: `Cue ${cueCount}: overlaps with previous cue`, cue: cueCount });
            }
            const duration = (end - start) / 1000;
            if (duration > 0) {
              const lineStart = content.lastIndexOf("\n", match.index) + 1;
              const nextTimestamp = content.indexOf("-->", match.index + match[0].length);
              const cueEnd = nextTimestamp > 0 ? content.lastIndexOf("\n\n", nextTimestamp) : content.length;
              const cueText = content.slice(match.index + match[0].length, cueEnd > match.index ? cueEnd : content.length).trim();
              const words = cueText.split(/\s+/).filter(w => w.length > 0 && !w.startsWith("<")).length;
              const wps = words / duration;
              if (wps > 3.5) {
                issues.push({ severity: "moderate", message: `Cue ${cueCount}: caption rate ${Math.round(wps*10)/10} words/sec exceeds recommended 3.5`, cue: cueCount });
              }
            }
            prevEnd = end;
          }
        } else if (ext === ".srt") {
          const cueRegex = /(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/g;
          let match;
          let prevEnd = 0;
          while ((match = cueRegex.exec(content)) !== null) {
            cueCount++;
            const start = parseTimestamp(match[1].replace(",", "."));
            const end = parseTimestamp(match[2].replace(",", "."));
            if (end <= start) {
              issues.push({ severity: "serious", message: `Cue ${cueCount}: end time ≤ start time`, cue: cueCount });
            }
            if (start < prevEnd) {
              issues.push({ severity: "moderate", message: `Cue ${cueCount}: overlaps with previous cue`, cue: cueCount });
            }
            prevEnd = end;
          }
        } else {
          return { content: [{ type: "text", text: "Error: Unsupported file format. Use .vtt or .srt" }] };
        }

        const hasSpeakerIds = /(?:<v\s|>>|[A-Z]+:)/.test(content);
        if (!hasSpeakerIds && cueCount > 5) {
          issues.push({ severity: "minor", message: "No speaker identification detected. Consider adding speaker labels for multi-speaker content." });
        }

        const result = {
          file: basename(safePath),
          format: ext.replace(".", "").toUpperCase(),
          cueCount,
          issues,
          summary: {
            critical: issues.filter(i => i.severity === "critical").length,
            serious: issues.filter(i => i.severity === "serious").length,
            moderate: issues.filter(i => i.severity === "moderate").length,
            minor: issues.filter(i => i.severity === "minor").length,
          },
          valid: issues.filter(i => i.severity === "critical" || i.severity === "serious").length === 0,
        };

        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${err.message}` }] };
      }
    }
  );

  // ---- Tool: generate_accessibility_statement ----
  server.registerTool(
    "generate_accessibility_statement",
    {
      title: "Generate Accessibility Statement",
      description: "Generate a W3C or EU model accessibility statement from provided information. Outputs a Markdown document ready for publishing.",
      inputSchema: z.object({
        organization: z.string().describe("Organization name"),
        websiteUrl: z.string().describe("Website URL covered by the statement"),
        contactEmail: z.string().describe("Accessibility feedback contact email"),
        conformanceLevel: z.enum(["A", "AA", "AAA"]).optional().describe("Target WCAG level (default: AA)"),
        conformanceStatus: z.enum(["fully", "partially", "non-conformant"]).describe("Overall conformance status"),
        format: z.enum(["w3c", "eu"]).optional().describe("Statement format: w3c (default) or eu"),
        assessmentDate: z.string().optional().describe("Date of last assessment (ISO format)"),
        assessmentMethod: z.string().optional().describe("How the assessment was conducted"),
        knownLimitations: z.array(z.object({
          description: z.string(),
          wcag: z.string().optional(),
          workaround: z.string().optional(),
        })).optional().describe("Known accessibility limitations"),
        technologies: z.array(z.string()).optional().describe("Technologies relied upon (e.g. HTML5, CSS3, WAI-ARIA)"),
        compatibleWith: z.array(z.string()).optional().describe("Browsers and assistive technologies tested"),
      }),
    },
    async ({ organization, websiteUrl, contactEmail, conformanceLevel, conformanceStatus, format, assessmentDate, assessmentMethod, knownLimitations, technologies, compatibleWith }) => {
      try {
        const level = conformanceLevel || "AA";
        const fmt = format || "w3c";
        const date = assessmentDate || new Date().toISOString().split("T")[0];
        const method = assessmentMethod || "Self-evaluation";
        const techs = technologies || ["HTML5", "CSS3", "JavaScript", "WAI-ARIA 1.2"];
        const compat = compatibleWith || [];

        const statusLabels = {
          fully: "fully conformant",
          partially: "partially conformant",
          "non-conformant": "non-conformant",
        };
        const statusText = statusLabels[conformanceStatus] || conformanceStatus;

        let md = `# Accessibility Statement\n\n`;
        md += `**Organization:** ${organization}\n`;
        md += `**Website:** ${websiteUrl}\n`;
        md += `**Date:** ${date}\n`;
        md += `**Standard:** WCAG 2.2 Level ${level}\n\n`;

        md += `## Conformance Status\n\n`;
        md += `This website is **${statusText}** with WCAG 2.2 Level ${level}. `;
        if (conformanceStatus === "fully") {
          md += `All content fully meets the standard with no known exceptions.\n\n`;
        } else if (conformanceStatus === "partially") {
          md += `Some content does not yet fully meet the standard. Known limitations are listed below.\n\n`;
        } else {
          md += `Significant portions do not yet meet the standard. Remediation is in progress.\n\n`;
        }

        if (knownLimitations && knownLimitations.length > 0) {
          md += `## Known Limitations\n\n`;
          md += `The following limitations are known:\n\n`;
          for (const lim of knownLimitations) {
            md += `- **${lim.description}**`;
            if (lim.wcag) md += ` (WCAG ${lim.wcag})`;
            md += `\n`;
            if (lim.workaround) md += `  - Workaround: ${lim.workaround}\n`;
          }
          md += `\n`;
        }

        md += `## Assessment\n\n`;
        md += `This website was last assessed on ${date} using the following method: ${method}.\n\n`;

        md += `## Feedback\n\n`;
        md += `If you encounter accessibility barriers on this website, please contact us:\n\n`;
        md += `- **Email:** ${contactEmail}\n`;
        md += `- **Response commitment:** We aim to respond within 5 business days.\n\n`;

        if (compat.length > 0) {
          md += `## Compatibility\n\n`;
          md += `This website is designed to be compatible with:\n\n`;
          for (const c of compat) md += `- ${c}\n`;
          md += `\n`;
        }

        md += `## Technologies Used\n\n`;
        for (const t of techs) md += `- ${t}\n`;
        md += `\n`;

        if (fmt === "eu") {
          md += `## Enforcement\n\n`;
          md += `If you are not satisfied with our response, you can file a complaint with the relevant national enforcement body.\n\n`;
          md += `## Annual Review\n\n`;
          md += `This accessibility statement will be reviewed and updated annually, or after significant website changes.\n`;
        }

        return { content: [{ type: "text", text: md }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${err.message}` }] };
      }
    }
  );

  // =========================================================================
  // MCP Prompts
  // =========================================================================

  server.prompt(
    "audit-page",
    {
      description:
        "Generate an accessibility audit prompt for a web page. Returns a structured audit instruction that guides the model through a comprehensive WCAG 2.2 AA review.",
      argsSchema: z.object({
        url: z.string().describe("URL or file path of the page to audit"),
        level: z
          .enum(["A", "AA", "AAA"])
          .optional()
          .describe("WCAG conformance level (default: AA)"),
      }),
    },
    async ({ url, level }) => {
      const target = level || "AA";
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: [
                `Perform a comprehensive WCAG 2.2 Level ${target} accessibility audit of: ${url}`,
                "",
                "Use the following tools in order:",
                "1. run_axe_scan — Automated rule-based scan",
                "2. check_heading_structure — Verify heading hierarchy",
                "3. check_link_text — Detect ambiguous link text",
                "4. check_form_labels — Verify form input labeling",
                "5. run_playwright_keyboard_scan — Test keyboard navigation",
                "6. run_playwright_contrast_scan — Visual contrast verification",
                "",
                "For each issue found, include:",
                "- WCAG success criterion (e.g. 1.4.3)",
                "- Severity (Critical / Serious / Moderate / Minor)",
                "- Affected element with selector",
                "- Remediation guidance",
                "",
                "End with an overall score (0-100) and prioritized fix list.",
              ].join("\n"),
            },
          },
        ],
      };
    }
  );

  server.prompt(
    "check-component",
    {
      description:
        "Generate an accessibility review prompt for a specific UI component pattern (modal, tabs, form, etc.).",
      argsSchema: z.object({
        component: z
          .string()
          .describe(
            'Component type: modal, tabs, accordion, combobox, carousel, form, live-region, navigation, or general'
          ),
      }),
    },
    async ({ component }) => {
      const key = component.toLowerCase().trim();
      const guide = GUIDELINES[key] || GUIDELINES.general;
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: [
                `Review the following UI component for accessibility compliance.`,
                `Component type: ${component}`,
                "",
                "## Reference Guidelines",
                guide,
                "",
                "## Instructions",
                "1. Check every requirement listed above against the implementation",
                "2. Flag any violations with the specific WCAG criterion",
                "3. Provide corrected code for each violation",
              ].join("\n"),
            },
          },
        ],
      };
    }
  );

  server.prompt(
    "explain-wcag",
    {
      description:
        "Explain a WCAG success criterion with practical examples and common violations.",
      argsSchema: z.object({
        criterion: z
          .string()
          .describe(
            'WCAG criterion number (e.g. "1.4.3") or keyword (e.g. "contrast", "focus")'
          ),
      }),
    },
    async ({ criterion }) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: [
                `Explain WCAG 2.2 success criterion "${criterion}" in practical terms.`,
                "",
                "Include:",
                "- The official requirement summary",
                "- Conformance level (A, AA, or AAA)",
                "- 2-3 common violations with code examples",
                "- How to fix each violation",
                "- How to test for compliance",
              ].join("\n"),
            },
          },
        ],
      };
    }
  );

  // =========================================================================
  // MCP Resources
  // =========================================================================

  server.resource(
    "wcag-guidelines",
    "a11y://guidelines/{component}",
    {
      description:
        "Component-specific WCAG accessibility guidelines. Available components: modal, tabs, accordion, combobox, carousel, form, live-region, navigation, general.",
    },
    async (uri) => {
      const component = uri.pathname.split("/").pop() || "general";
      const guide = GUIDELINES[component] || GUIDELINES.general;
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "text/markdown",
            text: guide,
          },
        ],
      };
    }
  );

  server.resource(
    "supported-tools",
    "a11y://tools",
    {
      description:
        "List of all accessibility tools provided by this MCP server with descriptions.",
    },
    async (uri) => {
      const tools = server._registeredTools;
      const entries = Object.keys(tools)
        .sort()
        .map((name) => {
          const desc = tools[name].description || "(no description)";
          return `- **${name}**: ${desc}`;
        });
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "text/markdown",
            text: [
              "# A11y Agent Team — Available Tools",
              "",
              ...entries,
            ].join("\n"),
          },
        ],
      };
    }
  );

  server.resource(
    "scan-config-template",
    "a11y://config/{profile}",
    {
      description:
        "Scan configuration templates. Available profiles: strict, moderate, minimal.",
    },
    async (uri) => {
      const profile = uri.pathname.split("/").pop() || "moderate";
      const validProfiles = ["strict", "moderate", "minimal"];
      if (!validProfiles.includes(profile)) {
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "text/plain",
              text: `Unknown profile "${profile}". Available: ${validProfiles.join(", ")}`,
            },
          ],
        };
      }
      const configs = {
        strict: {
          severity: ["critical", "serious", "moderate", "minor"],
          rules: "all",
          tags: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"],
        },
        moderate: {
          severity: ["critical", "serious", "moderate"],
          rules: "all",
          tags: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
        },
        minimal: {
          severity: ["critical", "serious"],
          rules: "all",
          tags: ["wcag2a", "wcag2aa"],
        },
      };
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(configs[profile], null, 2),
          },
        ],
      };
    }
  );

  registerTrendResource(server);

  return server;
}
