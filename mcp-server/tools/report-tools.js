/**
 * report-tools.js - render an accessibility report from findings.
 *
 * The skills write findings JSON and a script renders the report. Clients that
 * cannot run a shell command reach the same renderer through this tool, so a
 * Codex, Copilot or Gemini session produces byte-identical reports to a Claude
 * Code session rather than typing its own.
 *
 * This is the difference between a report that always carries its seven
 * required sections and one that carries whatever the model remembered.
 */

import { z } from "zod";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const RENDERER = resolve(HERE, "..", "..", "skills", "a11y-core", "scripts", "render-report.mjs");

export function registerReportTools(server) {
  server.registerTool(
    "render_accessibility_report",
    {
      title: "Render an accessibility report",
      description:
        "Render a complete audit report from findings JSON. Produces every required section, computes the score and grade, and embeds the merged findings so the next run can show a delta.",
      inputSchema: z.object({
        findings: z
          .array(z.record(z.any()))
          .min(1)
          .describe("Findings payloads, each matching skills/a11y-core/schemas/findings.schema.json."),
        template: z
          .enum(["web", "document", "markdown"])
          .default("web")
          .describe("Which report shape to render."),
        outputPath: z
          .string()
          .optional()
          .describe("Where to write the report. Defaults to the template's standard filename in the working directory."),
      }),
    },
    async ({ findings, template = "web", outputPath }) => {
      const { renderReport, readPreviousMerge } = await import(RENDERER.replace(/\\/g, "/") + "?tool");
      const { mergeFindings, loadPayloads } = await import(
        resolve(HERE, "..", "..", "skills", "a11y-core", "scripts", "merge-findings.mjs").replace(/\\/g, "/")
      );

      // Validate through the same loader the command line uses, so a payload
      // that would be rejected there is rejected here for the same reason.
      const scratch = mkdtempSync(join(tmpdir(), "a11y-render-"));
      try {
        const files = findings.map((payload, i) => {
          const file = join(scratch, `payload-${i}.json`);
          writeFileSync(file, JSON.stringify(payload), "utf8");
          return file;
        });

        const { payloads, problems } = loadPayloads(files);
        if (!payloads.length) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text:
                  "No valid findings payloads. Each must match findings.schema.json.\n" +
                  problems.map((p) => "- " + p.replace(scratch, "")).join("\n"),
              },
            ],
          };
        }

        const merged = mergeFindings(payloads);
        const defaultName = {
          web: "WEB-ACCESSIBILITY-AUDIT.md",
          document: "DOCUMENT-ACCESSIBILITY-AUDIT.md",
          markdown: "MARKDOWN-ACCESSIBILITY-AUDIT.md",
        }[template];
        const out = resolve(process.cwd(), outputPath || defaultName);

        const report = renderReport({
          merged,
          template,
          scope: merged.scope,
          previous: readPreviousMerge(out),
          toolVersions: `node ${process.version}, a11y mcp server`,
          configs: [],
        });
        writeFileSync(out, report, "utf8");

        const summary =
          `Wrote ${out}\n` +
          `${merged.findings.length} findings, score ${merged.score}, grade ${merged.grade}\n` +
          `critical ${merged.counts.critical}, serious ${merged.counts.serious}, ` +
          `moderate ${merged.counts.moderate}, minor ${merged.counts.minor}` +
          (problems.length ? `\n${problems.length} payloads were rejected as invalid` : "");

        return {
          content: [{ type: "text", text: summary }],
          structuredContent: { path: out, format: "markdown", detail: summary },
        };
      } finally {
        rmSync(scratch, { recursive: true, force: true });
      }
    },
  );
}
