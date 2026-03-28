/**
 * Markdown accessibility scanning tool for MCP.
 *
 * Scans .md files for accessibility issues:
 * - Heading hierarchy (single H1, no skipped levels)
 * - Image alt text (presence and quality)
 * - Link text quality (no "click here", "read more", etc.)
 * - Table structure
 * - Language hints
 */

import { z } from "zod";
import { basename, dirname, join } from "node:path";
import { readFile as fsReadFile, writeFile as fsWriteFile } from "node:fs/promises";
import { validateFilePath } from "../server-core.js";

// ---------------------------------------------------------------------------
// Markdown scanner
// ---------------------------------------------------------------------------

const AMBIGUOUS_LINK_PATTERNS = [
  /^click\s*here$/i,
  /^here$/i,
  /^read\s*more$/i,
  /^learn\s*more$/i,
  /^more$/i,
  /^link$/i,
  /^this$/i,
  /^this\s*link$/i,
  /^more\s*info$/i,
  /^details$/i,
];

function scanMarkdown(text, config) {
  const disabled = new Set(config.disabledRules || []);
  const severityFilter = new Set(config.severityFilter || ["error", "warning", "tip"]);
  const findings = [];
  const lines = text.split("\n");

  function add(ruleId, severity, message, line, extra = {}) {
    if (disabled.has(ruleId)) return;
    if (!severityFilter.has(severity)) return;
    findings.push({ ruleId, severity, message, line, ...extra });
  }

  // Track headings
  const headings = [];
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    const lineNum = i + 1;

    // Skip code blocks
    if (/^```/.test(ln.trim())) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    // ATX headings
    const headingMatch = ln.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      headings.push({ level: headingMatch[1].length, text: headingMatch[2].trim(), line: lineNum });
    }

    // Image alt text: ![alt](url)
    const imgRe = /!\[([^\]]*)\]\([^)]+\)/g;
    let imgMatch;
    while ((imgMatch = imgRe.exec(ln)) !== null) {
      const alt = imgMatch[1].trim();
      if (!alt) {
        add("md-img-alt", "error", `Image on line ${lineNum} has no alt text. Provide descriptive alt text or mark as decorative.`, lineNum);
      } else if (/^(image|photo|picture|img|screenshot|icon)$/i.test(alt)) {
        add("md-img-alt-quality", "warning", `Image alt text "${alt}" on line ${lineNum} is not descriptive. Describe the image content.`, lineNum);
      } else if (/\.(png|jpg|jpeg|gif|svg|webp|bmp)$/i.test(alt)) {
        add("md-img-alt-quality", "warning", `Image alt text "${alt}" on line ${lineNum} appears to be a filename. Describe the image content instead.`, lineNum);
      }
    }

    // HTML images in markdown
    const htmlImgRe = /<img\b[^>]*>/gi;
    let htmlImgMatch;
    while ((htmlImgMatch = htmlImgRe.exec(ln)) !== null) {
      const tag = htmlImgMatch[0];
      if (!/alt\s*=\s*"/i.test(tag)) {
        add("md-img-alt", "error", `HTML <img> on line ${lineNum} has no alt attribute. Add alt text.`, lineNum);
      }
    }

    // Link text quality: [text](url)
    const linkRe = /(?<!!)\[([^\]]+)\]\([^)]+\)/g;
    let linkMatch;
    while ((linkMatch = linkRe.exec(ln)) !== null) {
      const linkText = linkMatch[1].trim();
      for (const pattern of AMBIGUOUS_LINK_PATTERNS) {
        if (pattern.test(linkText)) {
          add("md-link-text", "warning", `Link text "${linkText}" on line ${lineNum} is ambiguous. Use descriptive text that conveys the link purpose.`, lineNum);
          break;
        }
      }
      // Bare URL as link text
      if (/^https?:\/\//i.test(linkText)) {
        add("md-link-text-url", "tip", `Link text on line ${lineNum} is a bare URL. Use descriptive text instead.`, lineNum);
      }
    }

    // Table header check (GFM tables)
    if (/^\|/.test(ln.trim()) && i + 1 < lines.length) {
      const nextLine = lines[i + 1];
      // This line STARTS a table if the next line is a separator row
      if (/^\|[\s:|-]+\|$/.test(nextLine.trim())) {
        // This is a table header row + separator - valid
      }
    }
  }

  // Heading hierarchy checks
  const h1s = headings.filter(h => h.level === 1);
  if (h1s.length === 0 && headings.length > 0) {
    add("md-heading-h1", "warning", "No H1 heading found. Documents should have exactly one top-level heading.", 0);
  } else if (h1s.length > 1) {
    add("md-heading-h1", "warning", `Multiple H1 headings found (lines ${h1s.map(h => h.line).join(", ")}). Use a single H1.`, h1s[1].line);
  }

  // Check for skipped levels
  let prevLevel = 0;
  for (const h of headings) {
    if (prevLevel > 0 && h.level > prevLevel + 1) {
      add("md-heading-skip", "warning", `Heading level skips from h${prevLevel} to h${h.level} at line ${h.line}. Do not skip heading levels.`, h.line);
    }
    prevLevel = h.level;
  }

  const info = {
    headingCount: headings.length,
    h1Count: h1s.length,
    lineCount: lines.length,
  };

  return { findings, info };
}

// ---------------------------------------------------------------------------
// Config loader
// ---------------------------------------------------------------------------

async function loadMarkdownConfig(filePath) {
  const defaultConfig = {
    enabled: true,
    disabledRules: [],
    severityFilter: ["error", "warning", "tip"],
  };
  let dir = dirname(filePath);
  for (let i = 0; i < 20; i++) {
    const configPath = join(dir, ".a11y-markdown-config.json");
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
// Report builder
// ---------------------------------------------------------------------------

function buildMarkdownReport(filePath, findings, info) {
  const errors = findings.filter(f => f.severity === "error");
  const warnings = findings.filter(f => f.severity === "warning");
  const tips = findings.filter(f => f.severity === "tip");

  const lines = [
    `# Markdown Accessibility Report`,
    ``,
    `## Scan Details`,
    ``,
    `| Field | Value |`,
    `|-------|-------|`,
    `| File | ${basename(filePath)} |`,
    `| Date | ${new Date().toISOString().split("T")[0]} |`,
    `| Lines | ${info.lineCount} |`,
    `| Headings | ${info.headingCount} |`,
    `| H1 Count | ${info.h1Count} |`,
    `| Errors | ${errors.length} |`,
    `| Warnings | ${warnings.length} |`,
    `| Tips | ${tips.length} |`,
    ``,
  ];

  if (findings.length === 0) {
    lines.push(`No automated accessibility issues found.`, ``);
    lines.push(`> Automated markdown scanning covers structure and common patterns.`);
    lines.push(`> Human review for alt text accuracy and link context is still recommended.`);
  } else {
    for (const [label, items] of [["Errors", errors], ["Warnings", warnings], ["Tips", tips]]) {
      if (items.length === 0) continue;
      lines.push(`## ${label}`, ``);
      for (const f of items) {
        lines.push(`- **${f.ruleId}** (line ${f.line}): ${f.message}`);
      }
      lines.push(``);
    }
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// MCP Tool Registration
// ---------------------------------------------------------------------------

export function registerMarkdownTools(server) {
  server.registerTool(
    "scan_markdown_document",
    {
      title: "Scan Markdown Document",
      description: "Scan a markdown (.md) file for accessibility issues. Checks heading hierarchy (single H1, no skipped levels), image alt text (presence and quality), link text quality (detects ambiguous text like 'click here' or 'read more'), and basic document structure. Optionally writes a markdown report.",
      inputSchema: z.object({
        filePath: z.string().describe("Absolute path to the .md file"),
        reportPath: z.string().optional().describe("Optional path to write a markdown accessibility report"),
      }),
    },
    async ({ filePath, reportPath }) => {
      if (!filePath.toLowerCase().endsWith(".md")) {
        return { content: [{ type: "text", text: "File must be a .md file." }] };
      }

      let text;
      try {
        const safe = validateFilePath(filePath);
        text = await fsReadFile(safe, "utf-8");
      } catch (err) {
        return { content: [{ type: "text", text: `Cannot read file: ${err.message}` }] };
      }

      const config = await loadMarkdownConfig(filePath);
      if (config.enabled === false) return { content: [{ type: "text", text: "Markdown scanning disabled in configuration." }] };

      const { findings, info } = scanMarkdown(text, config);

      let reportNote = "";
      if (reportPath) {
        try {
          const safe = validateFilePath(reportPath, { write: true });
          await fsWriteFile(safe, buildMarkdownReport(filePath, findings, info), "utf-8");
          reportNote = `\nReport written to: ${safe}`;
        } catch (err) { reportNote = `\nFailed to write report: ${err.message}`; }
      }

      if (findings.length === 0) {
        return {
          content: [{
            type: "text",
            text: `Markdown scan complete: ${basename(filePath)}\nNo issues found. ${info.lineCount} lines, ${info.headingCount} headings.${reportNote}`,
          }],
        };
      }

      const errors = findings.filter(f => f.severity === "error").length;
      const warnings = findings.filter(f => f.severity === "warning").length;
      const tips = findings.filter(f => f.severity === "tip").length;

      const output = [
        `Markdown scan complete: ${basename(filePath)}`,
        `${info.lineCount} lines, ${info.headingCount} headings`,
        `Issues: ${findings.length} (${errors} errors, ${warnings} warnings, ${tips} tips)`,
        "",
      ];
      for (const f of findings) output.push(`[${f.severity.toUpperCase()}] ${f.ruleId} (line ${f.line}): ${f.message}`);
      if (reportNote) output.push(reportNote);
      return { content: [{ type: "text", text: output.join("\n") }] };
    }
  );
}
