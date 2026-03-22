/**
 * veraPDF integration tool for PDF/UA validation.
 *
 * Requires veraPDF CLI to be installed and available on PATH.
 * Download: https://verapdf.org/software/
 *
 * Degrades gracefully — returns a clear message if veraPDF is not found.
 */

import { z } from "zod";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { basename } from "node:path";
import { validateFilePath } from "../server-core.js";

const execFileAsync = promisify(execFile);

async function isVeraPdfAvailable() {
  try {
    await execFileAsync("verapdf", ["--version"], { timeout: 10000 });
    return true;
  } catch {
    return false;
  }
}

export function registerVeraPdfTools(server) {
  server.registerTool(
    "run_verapdf_scan",
    {
      title: "Run veraPDF PDF/UA Scan",
      description:
        "Run a veraPDF PDF/UA-1 conformance scan against a local PDF file. Returns machine-readable validation results. Requires veraPDF CLI installed on the system.",
      inputSchema: z.object({
        filePath: z.string().describe("Absolute path to the PDF file"),
        flavour: z
          .enum(["ua1", "ua2", "1a", "1b", "2a", "2b", "2u", "3a", "3b", "3u", "4", "4e", "4f"])
          .optional()
          .describe('veraPDF validation flavour (default: "ua1" for PDF/UA-1)'),
      }),
    },
    async ({ filePath, flavour }) => {
      if (!(await isVeraPdfAvailable())) {
        return {
          content: [{
            type: "text",
            text: "veraPDF is not installed or not on PATH.\n\nInstall from: https://verapdf.org/software/\nThen ensure `verapdf` is available in your terminal.",
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

      const profile = flavour || "ua1";
      try {
        const { stdout, stderr } = await execFileAsync(
          "verapdf",
          ["--flavour", profile, "--format", "text", safePath],
          { timeout: 120000, maxBuffer: 10 * 1024 * 1024 }
        );

        const output = stdout || stderr || "No output from veraPDF.";
        const lines = [
          `veraPDF scan: ${basename(filePath)}`,
          `Flavour: ${profile}`,
          "",
          output.trim(),
        ];
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (err) {
        const output = err.stdout || err.stderr || err.message;
        return { content: [{ type: "text", text: `veraPDF scan completed with issues:\n\n${output}` }] };
      }
    }
  );
}
