/**
 * Tools that let a remote client (ChatGPT, Claude, GLOW's Ask page) use the
 * document scanners and the specialists without the server reading any file
 * of its own.
 *
 * scan_uploaded_document  the client sends the file's bytes (base64). The
 *   server writes them to a private folder of its own, runs the same scanner
 *   a local install runs (Office, PDF, ePub, Markdown; the markup checks for
 *   HTML; reading level for text), and deletes the folder before it answers.
 *   No path is accepted, so nothing else on the server can be reached.
 *
 * get_specialist  returns one Accessibility Agents skill (its SKILL.md), so a
 *   client can follow the same instructions the installed specialist does,
 *   for example word-accessibility before reviewing a .docx.
 */

import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "../lib/schema.js";
import { errorResult, okResult } from "../results.js";

/** Largest upload accepted, after base64 decoding. */
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

/**
 * Where uploads are written while they are scanned. It sits under the home
 * directory because the scanners only read paths under home or the working
 * directory. The hosted container mounts a tmpfs here.
 */
export const UPLOAD_ROOT = process.env.A11Y_MCP_UPLOAD_DIR || join(homedir(), ".a11y-uploads");

const SKILLS_DIR = fileURLToPath(new URL("../../skills/", import.meta.url));

/** Extension -> the scanner tool that reads it. */
export const UPLOAD_SCANNERS = {
  ".docx": "scan_office_document",
  ".xlsx": "scan_office_document",
  ".pptx": "scan_office_document",
  ".pdf": "scan_pdf_document",
  ".epub": "scan_epub_document",
  ".md": "scan_markdown_document",
  ".markdown": "scan_markdown_document",
};
const HTML_EXTENSIONS = [".html", ".htm", ".xhtml"];
/** Only the formats a scanner here reads; anything else is refused. */
export const UPLOAD_EXTENSIONS = [...Object.keys(UPLOAD_SCANNERS), ...HTML_EXTENSIONS];

/** Extension -> the specialist whose instructions fit that file. */
export const SPECIALIST_FOR = {
  ".docx": "word-accessibility",
  ".xlsx": "excel-accessibility",
  ".pptx": "powerpoint-accessibility",
  ".pdf": "pdf-accessibility",
  ".epub": "epub-accessibility",
  ".md": "markdown-a11y-assistant",
  ".markdown": "markdown-a11y-assistant",
  ".html": "accessibility-lead",
  ".htm": "accessibility-lead",
  ".xhtml": "accessibility-lead",
};

function safeName(filename) {
  const name = basename(String(filename || "")).replace(/[^\w.\- ]/g, "_").slice(-120);
  return name && !name.startsWith(".") ? name : `upload${extname(name)}`;
}

/** Replace the private temp path with the file's own name in a result. */
function hidePath(result, path, name) {
  const text = JSON.stringify(result).split(path.replaceAll("\\", "\\\\")).join(name).split(path).join(name);
  return JSON.parse(text);
}

async function listSkills() {
  try {
    const entries = await readdir(SKILLS_DIR, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
  } catch {
    return [];
  }
}

/**
 * Register both tools. `handlers` maps the scanner and markup tool names to
 * their handlers, taken before the hosted filter removes them from the list.
 */
export function registerHostedDocumentTools(server, handlers) {
  server.registerTool(
    "scan_uploaded_document",
    {
      title: "Scan an uploaded document",
      description:
        "Scan a document for accessibility problems by sending its contents, base64 encoded. " +
        "Accepts Word (.docx), Excel (.xlsx), PowerPoint (.pptx), PDF, ePub, Markdown and HTML, " +
        `up to ${MAX_UPLOAD_BYTES / 1024 / 1024} MB. Runs the same structural checks as a local install ` +
        "(title, language, headings, alt text, table headers, tags and more) and returns WCAG-mapped findings. " +
        "The file is deleted as soon as the scan finishes. Use get_specialist with the returned specialist " +
        "name for the review instructions that fit this kind of file.",
      inputSchema: z.object({
        filename: z.string().describe("The file's name, with its extension, for example syllabus.docx"),
        content_base64: z.string().describe("The file's bytes, base64 encoded"),
      }),
    },
    async ({ filename, content_base64 }, extra) => {
      const name = safeName(filename);
      const ext = extname(name).toLowerCase();
      if (!UPLOAD_EXTENSIONS.includes(ext)) {
        return errorResult(`Unsupported file type "${ext || "none"}". Accepted: ${UPLOAD_EXTENSIONS.join(", ")}.`);
      }
      const b64 = String(content_base64 || "").replace(/^data:[^,]*,/, "").replace(/\s+/g, "");
      if (b64.length > Math.ceil((MAX_UPLOAD_BYTES * 4) / 3) + 8) {
        return errorResult(`The file is larger than ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`);
      }
      const buf = Buffer.from(b64, "base64");
      if (!buf.length) return errorResult("The file is empty, or its contents are not base64.");
      const specialist = SPECIALIST_FOR[ext] || "accessibility-lead";
      const note = `\n\nSpecialist for this file: ${specialist} (load it with get_specialist).`;

      if (HTML_EXTENSIONS.includes(ext)) {
        const text = buf.toString("utf8");
        const names = ["check_heading_structure", "check_link_text", "check_form_labels"];
        const arg = { html: text };
        const parts = [];
        const findings = [];
        const passed = [];
        for (const tool of names) {
          const r = await handlers[tool](arg, extra);
          parts.push(`## ${tool}\n\n` + (r.content || []).map((c) => c.text || "").join("\n"));
          const sc = r.structuredContent || {};
          if (Array.isArray(sc.findings)) {
            findings.push(...sc.findings.map((f) => ({ ...f, location: `${name}: ${f.location}` })));
            if (!sc.findings.length) passed.push(tool);
          } else if (!r.isError) {
            passed.push(tool);
          }
        }
        return okResult(`Scan of ${name}\n\n${parts.join("\n\n")}${note}`, {
          scope: [name],
          findings,
          passed,
        });
      }

      await mkdir(UPLOAD_ROOT, { recursive: true, mode: 0o700 });
      const dir = await mkdtemp(join(UPLOAD_ROOT, "scan-"));
      const path = join(dir, name);
      try {
        await writeFile(path, buf, { mode: 0o600 });
        const result = hidePath(await handlers[UPLOAD_SCANNERS[ext]]({ filePath: path }, extra), path, name);
        if (!result.isError && Array.isArray(result.content)) {
          result.content = [...result.content, { type: "text", text: note.trim() }];
        }
        return result;
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    },
  );

  server.registerTool(
    "get_specialist",
    {
      title: "Get a specialist's instructions",
      description:
        "Return the full instructions of one Accessibility Agents specialist, so you can review the way it does. " +
        "For documents: word-accessibility, excel-accessibility, powerpoint-accessibility, pdf-accessibility, " +
        "epub-accessibility, markdown-a11y-assistant. For web work: accessibility-lead. " +
        "Call with no name to list every specialist.",
      inputSchema: z.object({
        name: z.string().optional().describe("The specialist's name, for example word-accessibility"),
      }),
    },
    async ({ name }) => {
      const all = await listSkills();
      if (!name) {
        return okResult(`Specialists (${all.length}):\n${all.join("\n")}`, {
          ok: true,
          detail: `${all.length} specialists available.`,
        });
      }
      const wanted = String(name).trim().replace(/^\//, "");
      if (!all.includes(wanted)) {
        return errorResult(`No specialist named "${wanted}". Call get_specialist with no name for the list.`);
      }
      const text = await readFile(join(SKILLS_DIR, wanted, "SKILL.md"), "utf8");
      return okResult(text, { ok: true, detail: `Instructions for ${wanted}.` });
    },
  );
}
