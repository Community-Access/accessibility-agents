/**
 * How the hosted document tools receive a file: its bytes as base64, or a
 * public link the server fetches (lib/public-fetch.js). Shared by
 * scan_uploaded_document, extract_document_images and write_document_alt_text.
 */

import { homedir } from "node:os";
import { basename, extname, join } from "node:path";
import { fetchPublicFile } from "./public-fetch.js";

/** Largest file accepted, after base64 decoding or download. */
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

/**
 * Where files are written while they are worked on. It sits under the home
 * directory because the scanners only read paths under home or the working
 * directory. The hosted container mounts a tmpfs here.
 */
export const UPLOAD_ROOT = process.env.A11Y_MCP_UPLOAD_DIR || join(homedir(), ".a11y-uploads");

const TYPE_EXT = {
  "wordprocessingml.document": ".docx",
  "presentationml.presentation": ".pptx",
  "spreadsheetml.sheet": ".xlsx",
  "application/epub+zip": ".epub",
  "application/pdf": ".pdf",
  "text/markdown": ".md",
  "text/html": ".html",
};

export function safeName(filename) {
  return basename(String(filename || "")).replace(/[^\w.\- ]/g, "_").slice(-120);
}

/** The file from base64 or a public link. Returns { name, ext, buf }. */
export async function resolveInput({ filename, content_base64, url }, allowed) {
  let name = safeName(filename);
  let buf;
  if (url) {
    const got = await fetchPublicFile(url);
    buf = got.buf;
    if (!extname(name)) name = safeName(got.filename);
    if (!allowed.includes(extname(name).toLowerCase())) {
      const fromType = Object.entries(TYPE_EXT).find(([k]) => got.type.includes(k));
      if (fromType) name = `${(name || "document").replace(/\.[^.]*$/, "")}${fromType[1]}`;
    }
  } else {
    const b64 = String(content_base64 || "").replace(/^data:[^,]*,/, "").replace(/\s+/g, "");
    if (!b64) throw new Error("Send the file as content_base64, or a public link as url.");
    if (b64.length > Math.ceil((MAX_UPLOAD_BYTES * 4) / 3) + 8) throw new Error("The file is larger than 20 MB.");
    buf = Buffer.from(b64, "base64");
  }
  if (!buf || !buf.length) throw new Error("The file is empty, or its contents are not base64.");
  if (buf.length > MAX_UPLOAD_BYTES) throw new Error("The file is larger than 20 MB.");
  const ext = extname(name).toLowerCase();
  if (!allowed.includes(ext)) {
    throw new Error(`Unsupported file type "${ext || "none"}". Accepted: ${allowed.join(", ")}.`);
  }
  if (!name || name.startsWith(".")) name = `upload${ext}`;
  return { name, ext, buf };
}
