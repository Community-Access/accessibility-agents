/**
 * PDF form accessibility tool — converts PDF form fields to an
 * accessible HTML representation for review.
 *
 * Requires pdf-lib (optional dependency).
 */

import { z } from "zod";
import { readFile as fsReadFile } from "node:fs/promises";
import { basename } from "node:path";
import { validateFilePath } from "../server-core.js";

let _pdfLibAvailable = null;

async function isPdfLibAvailable() {
  if (_pdfLibAvailable !== null) return _pdfLibAvailable;
  try {
    await import("pdf-lib");
    _pdfLibAvailable = true;
  } catch {
    _pdfLibAvailable = false;
  }
  return _pdfLibAvailable;
}

export function registerPdfFormTools(server) {
  server.registerTool(
    "convert_pdf_form_to_html",
    {
      title: "Convert PDF Form to Accessible HTML",
      description:
        "Extract form fields from a PDF and generate an accessible HTML representation. Useful for reviewing PDF form accessibility or migrating paper forms to web.",
      inputSchema: z.object({
        filePath: z.string().describe("Absolute path to the PDF file"),
      }),
    },
    async ({ filePath }) => {
      if (!(await isPdfLibAvailable())) {
        return {
          content: [{
            type: "text",
            text: "pdf-lib is not installed. Install with:\n  npm install pdf-lib",
          }],
        };
      }

      let safePath;
      try {
        safePath = validateFilePath(filePath);
      } catch (err) {
        return { content: [{ type: "text", text: `Path error: ${err.message}` }] };
      }

      if (!safePath.toLowerCase().endsWith(".pdf")) {
        return { content: [{ type: "text", text: "File must be a .pdf file." }] };
      }

      try {
        const buf = await fsReadFile(safePath);
        const { PDFDocument } = await import("pdf-lib");
        const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
        const form = doc.getForm();
        const fields = form.getFields();

        if (fields.length === 0) {
          return { content: [{ type: "text", text: `No form fields found in ${basename(filePath)}.` }] };
        }

        const htmlParts = [
          `<!DOCTYPE html>`,
          `<html lang="en">`,
          `<head>`,
          `  <meta charset="utf-8">`,
          `  <meta name="viewport" content="width=device-width, initial-scale=1">`,
          `  <title>Form: ${basename(filePath)}</title>`,
          `  <style>`,
          `    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 2rem auto; padding: 0 1rem; }`,
          `    fieldset { border: 1px solid #ccc; padding: 1rem; margin-bottom: 1rem; }`,
          `    label { display: block; margin-bottom: 0.5rem; font-weight: 600; }`,
          `    input, select, textarea { display: block; width: 100%; padding: 0.5rem; margin-bottom: 1rem; border: 1px solid #767676; border-radius: 4px; }`,
          `    .required::after { content: " *"; color: #d32f2f; }`,
          `  </style>`,
          `</head>`,
          `<body>`,
          `  <h1>Form: ${basename(filePath)}</h1>`,
          `  <form>`,
        ];

        function esc(str) {
          return str.replace(/&/g, "&amp;").replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
                    .replace(/'/g, "&#39;");
        }

        let fieldNum = 0;
        for (const field of fields) {
          fieldNum++;
          const name = esc(field.getName() || `field-${fieldNum}`);
          const type = field.constructor.name;
          const id = `field-${fieldNum}`;

          if (type === "PDFTextField") {
            htmlParts.push(`    <label for="${id}">${name}</label>`);
            htmlParts.push(`    <input type="text" id="${id}" name="${name}">`);
          } else if (type === "PDFCheckBox") {
            htmlParts.push(`    <label><input type="checkbox" id="${id}" name="${name}"> ${name}</label>`);
          } else if (type === "PDFRadioGroup") {
            htmlParts.push(`    <fieldset><legend>${name}</legend>`);
            const options = field.getOptions();
            for (let i = 0; i < options.length; i++) {
              htmlParts.push(`      <label><input type="radio" name="${name}" value="${esc(options[i])}"> ${esc(options[i])}</label>`);
            }
            htmlParts.push(`    </fieldset>`);
          } else if (type === "PDFDropdown") {
            htmlParts.push(`    <label for="${id}">${name}</label>`);
            htmlParts.push(`    <select id="${id}" name="${name}">`);
            for (const opt of field.getOptions()) {
              htmlParts.push(`      <option value="${esc(opt)}">${esc(opt)}</option>`);
            }
            htmlParts.push(`    </select>`);
          } else {
            htmlParts.push(`    <!-- unsupported field type: ${esc(type)} -->`);
          }
        }

        htmlParts.push(
          `    <button type="submit">Submit</button>`,
          `  </form>`,
          `</body>`,
          `</html>`
        );

        const html = htmlParts.join("\n");
        return {
          content: [
            { type: "text", text: `Converted ${fields.length} form fields from ${basename(filePath)}:\n\n${html}` },
          ],
        };
      } catch (err) {
        return { content: [{ type: "text", text: `PDF form conversion failed: ${err.message}` }] };
      }
    }
  );
}
