/**
 * Alt text for the pictures in a document, for an assistant that can see
 * images (ChatGPT, Claude, Copilot) and has no file access of its own.
 *
 * extract_document_images   returns every picture in a Word, PowerPoint,
 *   Excel, ePub or PDF file as an image the assistant can look at, with a key
 *   saying where it is, its current alt text and the text around it.
 * write_document_alt_text   puts the alt text the assistant (and the person)
 *   settled on back into a Word, PowerPoint, Excel or ePub file and returns it.
 *
 * Both take the file as base64 or as a public link. The server keeps nothing,
 * except that a written file is held for one hour behind an unguessable
 * download link, because a chat assistant cannot hand a file back otherwise.
 */

import { randomBytes } from "node:crypto";
import { mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, posix } from "node:path";
import zlib from "node:zlib";
import { z } from "../lib/schema.js";
import { crc32, entryData, entryText, readZip, writeZip } from "../lib/zip.js";
import { resolveInput, UPLOAD_ROOT } from "../lib/document-input.js";
import { errorResult } from "../results.js";

export const IMAGE_SOURCE_EXTENSIONS = [".docx", ".pptx", ".xlsx", ".epub", ".pdf"];
export const ALT_WRITABLE_EXTENSIONS = [".docx", ".pptx", ".xlsx", ".epub"];
const MAX_IMAGES_PER_CALL = 20;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_RESPONSE_IMAGE_BYTES = 12 * 1024 * 1024;
const MAX_ALT_CHARS = 1000;
const DOWNLOAD_TTL_MS = 60 * 60 * 1000;
const MAX_DOWNLOAD_BYTES = 120 * 1024 * 1024;
export const DOWNLOAD_ROOT = join(UPLOAD_ROOT, "downloads");

const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp" };
// ---------------------------------------------------------------------------
// XML helpers (the parts are machine-written, so regular expressions suffice)
// ---------------------------------------------------------------------------

const decode = (s) => String(s || "")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&amp;/g, "&");
const encodeAttr = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
  .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/\r?\n/g, " ");

function attr(tag, name) {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*"([^"]*)"`)) || tag.match(new RegExp(`\\s${name}\\s*=\\s*'([^']*)'`));
  return m ? decode(m[1]) : "";
}

/** Set (or add) one attribute on a start tag. */
export function setAttr(tag, name, value) {
  const v = encodeAttr(value);
  const re = new RegExp(`(\\s${name}\\s*=\\s*)("[^"]*"|'[^']*')`);
  if (re.test(tag)) return tag.replace(re, `$1"${v}"`);
  return tag.replace(/\s*(\/?)>$/, ` ${name}="${v}"$1>`);
}

const texts = (xml, tag) => [...String(xml).matchAll(new RegExp(`<${tag}(?:\\s[^>]*)?>([^<]*)</${tag}>`, "g"))]
  .map((m) => decode(m[1])).join(" ").replace(/\s+/g, " ").trim();

function rels(entries, relsPath) {
  const xml = entryText(entries.find((e) => e.name === relsPath));
  const map = {};
  for (const m of xml.matchAll(/<Relationship\b[^>]*>/g)) map[attr(m[0], "Id")] = attr(m[0], "Target");
  return map;
}

function resolvePart(from, target) {
  if (!target) return "";
  if (target.startsWith("/")) return target.slice(1);
  return posix.normalize(posix.join(posix.dirname(from), target));
}

const clip = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}...` : s);

// ---------------------------------------------------------------------------
// Finding the pictures
// ---------------------------------------------------------------------------

function picture(entries, part, mediaPath) {
  const ext = extname(mediaPath).toLowerCase();
  const data = entryData(entries.find((e) => e.name === mediaPath));
  return { ext, data, mime: MIME[ext] || "" };
}

function wordPictures(entries) {
  const part = "word/document.xml";
  const xml = entryText(entries.find((e) => e.name === part));
  const map = rels(entries, "word/_rels/document.xml.rels");
  const out = [];
  let n = 0;
  for (const m of xml.matchAll(/<w:drawing\b[\s\S]*?<\/w:drawing>/g)) {
    n += 1;
    const block = m[0];
    const docPr = (block.match(/<wp:docPr\b[^>]*>/) || [""])[0];
    const embed = (block.match(/r:embed="([^"]+)"/) || [])[1];
    if (!embed) continue;
    const before = texts(xml.slice(Math.max(0, m.index - 4000), m.index), "w:t");
    const after = texts(xml.slice(m.index + block.length, m.index + block.length + 2000), "w:t");
    out.push({
      key: `docx:${n}`,
      label: `Picture ${out.length + 1}`,
      location: `Word document, picture ${out.length + 1}`,
      current_alt: attr(docPr, "descr"),
      context: [before && `Text before: ${clip(before.slice(-300), 300)}`, after && `Text after: ${clip(after, 200)}`].filter(Boolean),
      ...picture(entries, part, resolvePart(part, map[embed])),
    });
  }
  return out;
}

function slideParts(entries) {
  const pres = entryText(entries.find((e) => e.name === "ppt/presentation.xml"));
  const map = rels(entries, "ppt/_rels/presentation.xml.rels");
  return [...pres.matchAll(/<p:sldId\b[^>]*>/g)]
    .map((m) => resolvePart("ppt/presentation.xml", map[attr(m[0], "r:id")]))
    .filter((p) => entries.some((e) => e.name === p));
}

function slideTitle(xml) {
  for (const m of xml.matchAll(/<p:sp\b[\s\S]*?<\/p:sp>/g)) {
    if (/<p:ph\b[^>]*type="(title|ctrTitle)"/.test(m[0])) return texts(m[0], "a:t");
  }
  return "";
}

function powerPointPictures(entries) {
  const out = [];
  slideParts(entries).forEach((part, i) => {
    const xml = entryText(entries.find((e) => e.name === part));
    const map = rels(entries, posix.join(posix.dirname(part), "_rels", `${posix.basename(part)}.rels`));
    const title = slideTitle(xml);
    const words = texts(xml, "a:t");
    let n = 0;
    for (const m of xml.matchAll(/<p:pic\b[\s\S]*?<\/p:pic>/g)) {
      n += 1;
      const cNvPr = (m[0].match(/<p:cNvPr\b[^>]*>/) || [""])[0];
      const embed = (m[0].match(/r:embed="([^"]+)"/) || [])[1];
      if (!embed) continue;
      out.push({
        key: `pptx:${i + 1}:${n}`,
        label: `Slide ${i + 1}, picture ${n}`,
        location: `Slide ${i + 1}${title ? ` (${clip(title, 80)})` : ""}`,
        current_alt: attr(cNvPr, "descr"),
        context: [title && `Slide title: ${title}`, words && `Slide text: ${clip(words, 300)}`].filter(Boolean),
        ...picture(entries, part, resolvePart(part, map[embed])),
      });
    }
  });
  return out;
}

const XLSX_PIC = /<(?:xdr:)?pic\b[\s\S]*?<\/(?:xdr:)?pic>/g;
const XLSX_CNVPR = /<(?:xdr:)?cNvPr\b[^>]*>/;

function excelPictures(entries) {
  const out = [];
  const drawings = entries.map((e) => e.name).filter((n) => /^xl\/drawings\/drawing\d+\.xml$/.test(n)).sort();
  for (const part of drawings) {
    const xml = entryText(entries.find((e) => e.name === part));
    const map = rels(entries, posix.join(posix.dirname(part), "_rels", `${posix.basename(part)}.rels`));
    const label = posix.basename(part, ".xml").replace("drawing", "Drawing ");
    let n = 0;
    // Excel writes xdr:pic; other tools use a default namespace and plain pic.
    for (const m of xml.matchAll(XLSX_PIC)) {
      n += 1;
      const cNvPr = (m[0].match(XLSX_CNVPR) || [""])[0];
      const embed = (m[0].match(/r:embed="([^"]+)"/) || [])[1];
      if (!embed) continue;
      out.push({
        key: `xlsx:${part}:${n}`,
        label: `${label}, picture ${n}`,
        location: `Workbook ${label.toLowerCase()}`,
        current_alt: attr(cNvPr, "descr"),
        context: [],
        ...picture(entries, part, resolvePart(part, map[embed])),
      });
    }
  }
  return out;
}

function epubPictures(entries) {
  const out = [];
  const pages = entries.map((e) => e.name).filter((n) => /\.(x?html?)$/i.test(n)).sort();
  for (const part of pages) {
    const xml = entryText(entries.find((e) => e.name === part));
    let n = 0;
    for (const m of xml.matchAll(/<img\b[^>]*>/gi)) {
      n += 1;
      const src = attr(m[0], "src");
      if (!src || /^(https?:|data:)/i.test(src)) continue;
      const before = xml.slice(Math.max(0, m.index - 2000), m.index).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      out.push({
        key: `epub:${part}:${n}`,
        label: `${posix.basename(part)}, picture ${n}`,
        location: part,
        current_alt: attr(m[0], "alt"),
        context: before ? [`Text before: ${clip(decode(before).slice(-300), 300)}`] : [],
        ...picture(entries, part, resolvePart(part, decodeURIComponent(src.split("#")[0]))),
      });
    }
  }
  return out;
}

/** A PNG from raw 8-bit gray or RGB rows (`filtered`: rows already carry PNG filter bytes). */
function pngFrom(width, height, channels, rows, filtered) {
  let idat;
  if (filtered) {
    idat = rows;
  } else {
    const stride = width * channels;
    const raw = zlib.inflateSync(rows);
    const out = Buffer.alloc(height * (stride + 1));
    for (let y = 0; y < height; y++) raw.copy(out, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
    idat = zlib.deflateSync(out);
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = channels === 3 ? 2 : 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

function pdfPictures(buf) {
  const s = buf.toString("latin1");
  const out = [];
  // The dictionary may not run past its own object (tempered by endobj).
  const re = /(\d+)\s+0\s+obj\s*<<((?:(?!endobj)[\s\S])*?)>>\s*stream\r?\n/g;
  let m;
  while ((m = re.exec(s)) && out.length < 200) {
    const dict = m[2];
    if (!/\/Subtype\s*\/Image\b/.test(dict) || /\/ImageMask\s+true/.test(dict)) continue;
    const start = m.index + m[0].length;
    // "/Length 812" is the size; "/Length 12 0 R" points elsewhere, so find endstream.
    const lenMatch = dict.match(/\/Length\s+(\d+)(\s+\d+\s+R)?/);
    const end = lenMatch && !lenMatch[2] ? start + Number(lenMatch[1]) : s.indexOf("endstream", start);
    if (end <= start) continue;
    const data = buf.subarray(start, end);
    const w = Number((dict.match(/\/Width\s+(\d+)/) || [])[1] || 0);
    const h = Number((dict.match(/\/Height\s+(\d+)/) || [])[1] || 0);
    if (w * h < 64 * 64) continue; // rules, bullets and spacers
    const n = out.length + 1;
    const base = { key: `pdf:${n}`, label: `Picture ${n}`, location: `PDF picture ${n}`, current_alt: "", context: [] };
    try {
      if (/\/DCTDecode/.test(dict)) {
        out.push({ ...base, ext: ".jpg", mime: "image/jpeg", data: Buffer.from(data) });
        continue;
      }
      const cs = /\/ColorSpace\s*\/DeviceRGB/.test(dict) ? 3 : /\/ColorSpace\s*\/DeviceGray/.test(dict) ? 1 : 0;
      const bpc = Number((dict.match(/\/BitsPerComponent\s+(\d+)/) || [])[1] || 0);
      const filters = (dict.match(/\/Filter\s*(\[[^\]]*\]|\/\w+)/) || [])[1] || "";
      if (cs && bpc === 8 && /^(\/FlateDecode|\[\s*\/FlateDecode\s*\])$/.test(filters.trim())) {
        const predictor = Number((dict.match(/\/Predictor\s+(\d+)/) || [])[1] || 1);
        if (predictor >= 10) {
          const colors = Number((dict.match(/\/Colors\s+(\d+)/) || [])[1] || cs);
          if (colors !== cs) throw new Error("colors");
          // PNG-predicted Flate data is exactly a PNG's IDAT stream.
          out.push({ ...base, ext: ".png", mime: "image/png", data: pngFrom(w, h, cs, Buffer.from(data), true) });
        } else if (predictor === 1) {
          out.push({ ...base, ext: ".png", mime: "image/png", data: pngFrom(w, h, cs, Buffer.from(data), false) });
        } else {
          throw new Error("predictor");
        }
        continue;
      }
    } catch {
      /* falls through: listed, not describable */
    }
    out.push({ ...base, ext: ".pdf-image", mime: "", data: null });
  }
  return out;
}

/** Every picture in the file, in document order. */
export function findPictures(ext, buf) {
  if (ext === ".pdf") return pdfPictures(buf);
  const entries = readZip(buf);
  if (ext === ".docx") return wordPictures(entries);
  if (ext === ".pptx") return powerPointPictures(entries);
  if (ext === ".xlsx") return excelPictures(entries);
  if (ext === ".epub") return epubPictures(entries);
  return [];
}

// ---------------------------------------------------------------------------
// Writing alt text back
// ---------------------------------------------------------------------------

const KEY_RE = /^(docx:\d{1,5}|pptx:\d{1,4}:\d{1,4}|xlsx:xl\/drawings\/drawing\d{1,4}\.xml:\d{1,4}|epub:[\w./ -]{1,200}\.x?html?:\d{1,4})$/i;

/** Rewrite the nth element in a part. `edit(block)` returns the new block. */
function editNth(xml, pattern, n, edit) {
  let i = 0;
  return xml.replace(pattern, (block) => {
    i += 1;
    return i === n ? edit(block) : block;
  });
}

export function writeAltText(ext, buf, alts) {
  const clean = Object.entries(alts || {})
    .filter(([k, v]) => KEY_RE.test(k) && typeof v === "string" && v.trim())
    .map(([k, v]) => [k, v.replace(/\s+/g, " ").trim().slice(0, MAX_ALT_CHARS)]);
  if (!clean.length) throw new Error("There is no alt text to write. Send alts as { key: alt text } from extract_document_images.");
  const entries = readZip(buf);
  const replace = new Map();
  const xmlOf = (name) => (replace.has(name) ? replace.get(name).toString("utf8") : entryText(entries.find((e) => e.name === name)));
  const put = (name, xml) => replace.set(name, Buffer.from(xml, "utf8"));
  let written = 0;
  const slides = ext === ".pptx" ? slideParts(entries) : [];

  for (const [key, alt] of clean) {
    const parts = key.split(":");
    let part = "", n = 0, pattern, edit;
    if (ext === ".docx" && parts[0] === "docx") {
      part = "word/document.xml"; n = Number(parts[1]);
      pattern = /<w:drawing\b[\s\S]*?<\/w:drawing>/g;
      edit = (b) => b.replace(/<wp:docPr\b[^>]*>/, (t) => setAttr(t, "descr", alt));
    } else if (ext === ".pptx" && parts[0] === "pptx") {
      part = slides[Number(parts[1]) - 1] || ""; n = Number(parts[2]);
      pattern = /<p:pic\b[\s\S]*?<\/p:pic>/g;
      edit = (b) => b.replace(/<p:cNvPr\b[^>]*>/, (t) => setAttr(t, "descr", alt));
    } else if (ext === ".xlsx" && parts[0] === "xlsx") {
      part = parts[1]; n = Number(parts[2]);
      pattern = XLSX_PIC;
      edit = (b) => b.replace(XLSX_CNVPR, (t) => setAttr(t, "descr", alt));
    } else if (ext === ".epub" && parts[0] === "epub") {
      part = parts.slice(1, -1).join(":"); n = Number(parts[parts.length - 1]);
      pattern = /<img\b[^>]*>/gi;
      edit = (t) => setAttr(t, "alt", alt);
    } else {
      continue;
    }
    if (!part || !entries.some((e) => e.name === part)) continue;
    const before = xmlOf(part);
    const after = editNth(before, pattern, n, edit);
    if (after !== before) { put(part, after); written += 1; }
  }
  if (!written) throw new Error("None of those keys matched a picture in this file. Use the keys from extract_document_images.");
  return { buf: writeZip(entries, replace), written };
}

// ---------------------------------------------------------------------------
// One-hour download links (hosted only)
// ---------------------------------------------------------------------------

async function pruneDownloads() {
  let dirs = [];
  try {
    dirs = await readdir(DOWNLOAD_ROOT, { withFileTypes: true });
  } catch {
    return;
  }
  const now = Date.now();
  const kept = [];
  for (const d of dirs) {
    if (!d.isDirectory()) continue;
    const dir = join(DOWNLOAD_ROOT, d.name);
    try {
      const files = await readdir(dir);
      const info = files.length ? await stat(join(dir, files[0])) : null;
      if (!info || now - info.mtimeMs > DOWNLOAD_TTL_MS) await rm(dir, { recursive: true, force: true });
      else kept.push({ dir, at: info.mtimeMs, size: info.size });
    } catch {
      /* gone already */
    }
  }
  kept.sort((a, b) => a.at - b.at);
  let total = kept.reduce((t, k) => t + k.size, 0);
  while (total > MAX_DOWNLOAD_BYTES && kept.length) {
    const oldest = kept.shift();
    total -= oldest.size;
    await rm(oldest.dir, { recursive: true, force: true });
  }
}

export async function saveDownload(name, buf) {
  await pruneDownloads();
  const token = randomBytes(24).toString("base64url");
  const dir = join(DOWNLOAD_ROOT, token);
  await mkdir(dir, { recursive: true, mode: 0o700 });
  await writeFile(join(dir, name), buf, { mode: 0o600 });
  return `${token}/${encodeURIComponent(name)}`;
}

/** For server.js: the file behind a download link, or null. */
export async function findDownload(token, name) {
  if (!/^[\w-]{32}$/.test(token || "")) return null;
  const file = join(DOWNLOAD_ROOT, token, basename(decodeURIComponent(name || "")));
  if (dirname(file) !== join(DOWNLOAD_ROOT, token)) return null;
  try {
    const info = await stat(file);
    if (Date.now() - info.mtimeMs > DOWNLOAD_TTL_MS) return null;
    return file;
  } catch {
    return null;
  }
}

export { pruneDownloads };

// ---------------------------------------------------------------------------
// The tools
// ---------------------------------------------------------------------------

const FILE_INPUT = {
  filename: z.string().optional().describe("The file's name with its extension, for example syllabus.docx. Needed with content_base64."),
  content_base64: z.string().optional().describe("The file's bytes, base64 encoded, up to 20 MB. Send this or url."),
  url: z.string().optional().describe("A public link to the file instead, such as a OneDrive, Google Drive or Dropbox share link."),
};

const MIME_OF_EXT = {
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".epub": "application/epub+zip",
};

export function registerDocumentImageTools(server) {
  server.registerTool(
    "extract_document_images",
    {
      title: "Extract a document's pictures",
      description:
        "Return the pictures in a Word, PowerPoint, Excel, ePub or PDF file as images you can see, each with a key, " +
        "its place and current alt text, for writing alt text.",
      inputSchema: z.object({
        ...FILE_INPUT,
        start: z.number().int().min(0).optional().describe("Skip this many pictures: for a file with more than 20, call again with start=20."),
      }),
    },
    async ({ filename, content_base64, url, start = 0 }) => {
      let file;
      try {
        file = await resolveInput({ filename, content_base64, url }, IMAGE_SOURCE_EXTENSIONS);
      } catch (err) {
        return errorResult(err.message);
      }
      let pictures;
      try {
        pictures = findPictures(file.ext, file.buf);
      } catch (err) {
        return errorResult(`The pictures in ${file.name} could not be read: ${err.message}`);
      }
      if (!pictures.length) {
        return {
          content: [{ type: "text", text: `${file.name} has no pictures.` }],
          structuredContent: { items: [], total: 0 },
        };
      }
      const page = pictures.slice(start, start + MAX_IMAGES_PER_CALL);
      const content = [];
      const items = [];
      let sent = 0;
      page.forEach((p, i) => {
        const canSend = p.mime && p.data && p.data.length <= MAX_IMAGE_BYTES && sent + p.data.length <= MAX_RESPONSE_IMAGE_BYTES;
        const lines = [
          `Picture ${start + i + 1} of ${pictures.length}: ${p.label}`,
          `Key: ${p.key}`,
          `Where: ${p.location}`,
          p.current_alt ? `Alt text now: ${p.current_alt}` : "Alt text now: none",
          ...p.context,
        ];
        if (!canSend) {
          lines.push(p.mime && p.data
            ? "Not included: too large for one reply. Call again with a start value to get it alone."
            : "Not included: its format (EMF, WMF, TIFF, or a PDF image encoding) cannot be shown. Ask the person to describe it.");
        }
        content.push({ type: "text", text: lines.join("\n") });
        if (canSend) {
          content.push({ type: "image", data: p.data.toString("base64"), mimeType: p.mime });
          sent += p.data.length;
        }
        items.push({ key: p.key, label: p.label, location: p.location, current_alt: p.current_alt, included: Boolean(canSend) });
      });
      const more = start + page.length < pictures.length
        ? ` There are ${pictures.length - start - page.length} more: call again with start=${start + page.length}.` : "";
      const writable = ALT_WRITABLE_EXTENSIONS.includes(file.ext);
      content.push({
        type: "text",
        text: `${pictures.length} pictures in ${file.name}.${more} Write alt text for each one (get_specialist ` +
          "alt-text-headings has the rules: at most 150 characters, what it means here, a long description in the " +
          "text for charts and diagrams, empty only when decorative), show them to the person, then " +
          (writable ? "call write_document_alt_text with the same file and alts as { key: alt text }."
            : "give them the alt text to add in the program the file came from: alt text cannot be written into a PDF here."),
      });
      return { content, structuredContent: { items, total: pictures.length } };
    },
  );

  server.registerTool(
    "write_document_alt_text",
    {
      title: "Write alt text into a document",
      description:
        "Put alt text into the pictures of a Word, PowerPoint, Excel or ePub file, by the keys extract_document_images " +
        "gave, and return the file.",
      inputSchema: z.object({
        ...FILE_INPUT,
        alts: z.record(z.string(), z.string()).describe("Alt text by picture key, for example {\"docx:1\": \"Bar chart of ...\"}."),
      }),
    },
    async ({ filename, content_base64, url, alts }) => {
      let file;
      try {
        file = await resolveInput({ filename, content_base64, url }, ALT_WRITABLE_EXTENSIONS);
      } catch (err) {
        return errorResult(err.message);
      }
      let result;
      try {
        result = writeAltText(file.ext, file.buf, alts);
      } catch (err) {
        return errorResult(err.message);
      }
      const outName = `${file.name.replace(/\.[^.]+$/, "")}-with-alt-text${file.ext}`;
      const base = (process.env.A11Y_MCP_PUBLIC_URL || "").replace(/\/+$/, "");
      const content = [];
      let link = "";
      if (base) {
        link = `${base}/download/${await saveDownload(outName, result.buf)}`;
        content.push({
          type: "text",
          text: `Wrote alt text on ${result.written} picture${result.written === 1 ? "" : "s"}. Download ${outName} ` +
            `within one hour: ${link}\nGive the person this link. Ask them to open the file and check the alt text before sharing it.`,
        });
      } else {
        content.push({ type: "text", text: `Wrote alt text on ${result.written} picture${result.written === 1 ? "" : "s"} into ${outName}.` });
      }
      if (!base || result.buf.length <= 5 * 1024 * 1024) {
        content.push({
          type: "resource",
          resource: { uri: `a11y-file:///${encodeURIComponent(outName)}`, mimeType: MIME_OF_EXT[file.ext], blob: result.buf.toString("base64") },
        });
      }
      return {
        content,
        structuredContent: { path: link || outName, format: file.ext.slice(1), detail: `Alt text on ${result.written} pictures.` },
      };
    },
  );
}
