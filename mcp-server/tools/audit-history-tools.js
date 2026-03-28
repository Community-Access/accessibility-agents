/**
 * Audit Persistence tools for storing and querying scan history.
 *
 * Stores scan results in `.a11y-history/` with SARIF-compatible JSON format.
 * Git-trackable for compliance evidence. Configurable retention per target.
 *
 * Tools:
 *   save_audit_result  - Persist a scan result to the audit history
 *   list_audit_history - List stored audits with optional filtering
 *   get_audit_result   - Retrieve a specific stored audit by ID
 *   prune_audit_history - Remove old audits beyond retention limit
 */

import { z } from "zod";
import { readFile as fsReadFile, writeFile as fsWriteFile, readdir, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, basename, resolve } from "node:path";
import { createHash } from "node:crypto";
import { validateFilePath } from "../server-core.js";

/** Default max audits to retain per target. */
const DEFAULT_RETENTION = 30;

/** History directory name. */
const HISTORY_DIR = ".a11y-history";

/**
 * Get the audit history directory, creating it if needed.
 * Always under the current working directory.
 */
async function getHistoryDir() {
  const dir = join(process.cwd(), HISTORY_DIR);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  return dir;
}

/**
 * Build a filename from scan metadata.
 * Format: {ISO timestamp}-{type}-{target hash}.json
 */
function buildFilename(type, target) {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const hash = createHash("sha256").update(target).digest("hex").slice(0, 12);
  const safeType = type.replace(/[^a-z0-9-]/gi, "-").slice(0, 20);
  return `${ts}-${safeType}-${hash}.json`;
}

/**
 * Parse an audit filename back into metadata.
 */
function parseFilename(name) {
  // Format: 2026-03-27T10-30-00-000Z-web-abc123def456.json
  const match = name.match(/^(\d{4}-\d{2}-\d{2}T[\d-]+Z)-([a-z0-9-]+)-([a-f0-9]+)\.json$/i);
  if (!match) return null;
  return {
    timestamp: match[1].replace(/-(\d{2})-(\d{2})-(\d{3})Z/, ":$1:$2.$3Z"),
    type: match[2],
    targetHash: match[3],
  };
}

export function registerAuditHistoryTools(server) {
  // ---- Tool: save_audit_result ----
  server.registerTool(
    "save_audit_result",
    {
      title: "Save Audit Result",
      description:
        "Persist an accessibility scan result to the audit history (.a11y-history/). " +
        "Stores results in SARIF-compatible JSON format, git-trackable for compliance evidence. " +
        "Auto-prunes old results when retention limit is exceeded.",
      inputSchema: z.object({
        type: z
          .enum(["web", "office", "pdf", "epub", "markdown"])
          .describe("Type of scan that produced these results"),
        target: z
          .string()
          .describe("Target that was scanned (URL, file path, or folder path)"),
        score: z
          .number()
          .min(0)
          .max(100)
          .optional()
          .describe("Overall accessibility score (0-100)"),
        grade: z
          .enum(["A", "B", "C", "D", "F"])
          .optional()
          .describe("Letter grade (A-F)"),
        findingCount: z
          .number()
          .describe("Total number of findings"),
        errorCount: z
          .number()
          .optional()
          .describe("Number of error-severity findings"),
        warningCount: z
          .number()
          .optional()
          .describe("Number of warning-severity findings"),
        findings: z
          .array(
            z.object({
              ruleId: z.string(),
              severity: z.enum(["critical", "serious", "moderate", "minor"]).optional(),
              message: z.string(),
              location: z.string().optional(),
              wcagCriterion: z.string().optional(),
            })
          )
          .optional()
          .describe("Array of individual findings (optional, for detailed storage)"),
        toolVersion: z
          .string()
          .optional()
          .describe("Version of the scanning tool"),
        retention: z
          .number()
          .min(1)
          .max(1000)
          .optional()
          .describe(`Max audits to keep per target (default: ${DEFAULT_RETENTION})`),
      }),
    },
    async ({ type, target, score, grade, findingCount, errorCount, warningCount, findings, toolVersion, retention }) => {
      try {
        const historyDir = await getHistoryDir();
        const filename = buildFilename(type, target);
        const targetHash = createHash("sha256").update(target).digest("hex").slice(0, 12);

        const auditRecord = {
          version: "1.0",
          id: filename.replace(".json", ""),
          timestamp: new Date().toISOString(),
          type,
          target,
          targetHash,
          score: score ?? null,
          grade: grade ?? null,
          summary: {
            findings: findingCount,
            errors: errorCount ?? 0,
            warnings: warningCount ?? 0,
          },
          toolVersion: toolVersion ?? "4.6.0",
          findings: findings ?? [],
        };

        const outPath = join(historyDir, filename);
        // Validate write path is within cwd
        const safePath = validateFilePath(outPath, { write: true });
        await fsWriteFile(safePath, JSON.stringify(auditRecord, null, 2), "utf-8");

        // Auto-prune: remove oldest audits for this target beyond retention limit
        const maxRetention = retention ?? DEFAULT_RETENTION;
        const allFiles = await readdir(historyDir);
        const targetFiles = allFiles
          .filter((f) => f.endsWith(".json") && f.includes(targetHash))
          .sort()
          .reverse(); // newest first

        let pruned = 0;
        if (targetFiles.length > maxRetention) {
          const toRemove = targetFiles.slice(maxRetention);
          for (const old of toRemove) {
            const oldPath = join(historyDir, old);
            try {
              const safeOld = validateFilePath(oldPath, { write: true });
              await rm(safeOld);
              pruned++;
            } catch {
              // Skip files that can't be removed
            }
          }
        }

        const lines = [
          `Audit saved: ${filename}`,
          `Type: ${type} | Target: ${target}`,
          `Score: ${score ?? "N/A"} | Grade: ${grade ?? "N/A"} | Findings: ${findingCount}`,
          `Stored in: ${HISTORY_DIR}/`,
          `History for this target: ${Math.min(targetFiles.length, maxRetention)} audits retained`,
        ];
        if (pruned > 0) {
          lines.push(`Pruned: ${pruned} old audit(s) beyond retention limit of ${maxRetention}`);
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Error saving audit: ${err.message}` }] };
      }
    }
  );

  // ---- Tool: list_audit_history ----
  server.registerTool(
    "list_audit_history",
    {
      title: "List Audit History",
      description:
        "List stored accessibility audit results from .a11y-history/. " +
        "Filter by scan type, target, or date range. Returns summaries with scores and finding counts.",
      inputSchema: z.object({
        type: z
          .enum(["web", "office", "pdf", "epub", "markdown"])
          .optional()
          .describe("Filter by scan type"),
        target: z
          .string()
          .optional()
          .describe("Filter by target (exact match on path/URL)"),
        limit: z
          .number()
          .min(1)
          .max(100)
          .optional()
          .describe("Max results to return (default: 20, newest first)"),
      }),
    },
    async ({ type, target, limit }) => {
      try {
        const historyDir = join(process.cwd(), HISTORY_DIR);
        if (!existsSync(historyDir)) {
          return { content: [{ type: "text", text: "No audit history found. Run a scan and save results first." }] };
        }

        const allFiles = await readdir(historyDir);
        const jsonFiles = allFiles.filter((f) => f.endsWith(".json")).sort().reverse();

        if (jsonFiles.length === 0) {
          return { content: [{ type: "text", text: "Audit history directory is empty." }] };
        }

        let targetHash;
        if (target) {
          targetHash = createHash("sha256").update(target).digest("hex").slice(0, 12);
        }

        const maxResults = limit ?? 20;
        const results = [];

        for (const file of jsonFiles) {
          if (results.length >= maxResults) break;

          // Quick filename-based filtering before reading the file
          if (type) {
            const parsed = parseFilename(file);
            if (parsed && parsed.type !== type) continue;
          }
          if (targetHash && !file.includes(targetHash)) continue;

          try {
            const content = await fsReadFile(join(historyDir, file), "utf-8");
            const record = JSON.parse(content);
            results.push({
              id: record.id || file.replace(".json", ""),
              timestamp: record.timestamp,
              type: record.type,
              target: record.target,
              score: record.score,
              grade: record.grade,
              findings: record.summary?.findings ?? 0,
              errors: record.summary?.errors ?? 0,
            });
          } catch {
            // Skip malformed files
          }
        }

        if (results.length === 0) {
          return { content: [{ type: "text", text: "No matching audits found." }] };
        }

        const lines = [
          `Audit History: ${results.length} result(s)${type ? ` (type: ${type})` : ""}${target ? ` (target: ${target})` : ""}`,
          "",
        ];

        for (const r of results) {
          const scoreStr = r.score != null ? `Score: ${r.score}` : "Score: N/A";
          const gradeStr = r.grade ? ` (${r.grade})` : "";
          lines.push(`  ${r.timestamp} | ${r.type} | ${scoreStr}${gradeStr} | ${r.findings} findings | ${r.target}`);
        }

        const totalFiles = jsonFiles.length;
        if (totalFiles > results.length) {
          lines.push("", `Showing ${results.length} of ${totalFiles} total audits.`);
        }

        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Error listing history: ${err.message}` }] };
      }
    }
  );

  // ---- Tool: get_audit_result ----
  server.registerTool(
    "get_audit_result",
    {
      title: "Get Audit Result",
      description:
        "Retrieve a specific stored audit result by its ID. Returns the full audit record including all findings.",
      inputSchema: z.object({
        auditId: z.string().describe("Audit ID (filename without .json extension, from list_audit_history)"),
      }),
    },
    async ({ auditId }) => {
      try {
        const historyDir = join(process.cwd(), HISTORY_DIR);
        const filename = auditId.endsWith(".json") ? auditId : `${auditId}.json`;
        const filePath = join(historyDir, filename);

        const safePath = validateFilePath(filePath);
        const content = await fsReadFile(safePath, "utf-8");
        const record = JSON.parse(content);

        const lines = [
          `Audit: ${record.id || auditId}`,
          `Date: ${record.timestamp}`,
          `Type: ${record.type} | Target: ${record.target}`,
          `Score: ${record.score ?? "N/A"} | Grade: ${record.grade ?? "N/A"}`,
          `Findings: ${record.summary?.findings ?? 0} (errors: ${record.summary?.errors ?? 0}, warnings: ${record.summary?.warnings ?? 0})`,
          `Tool Version: ${record.toolVersion ?? "unknown"}`,
        ];

        if (record.findings && record.findings.length > 0) {
          lines.push("", "Findings:");
          for (const f of record.findings.slice(0, 50)) {
            const sev = f.severity ? `[${f.severity.toUpperCase()}]` : "";
            const wcag = f.wcagCriterion ? ` (${f.wcagCriterion})` : "";
            const loc = f.location ? ` @ ${f.location}` : "";
            lines.push(`  ${sev} ${f.ruleId}: ${f.message}${wcag}${loc}`);
          }
          if (record.findings.length > 50) {
            lines.push(`  ... and ${record.findings.length - 50} more`);
          }
        }

        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Error retrieving audit: ${err.message}` }] };
      }
    }
  );

  // ---- Tool: prune_audit_history ----
  server.registerTool(
    "prune_audit_history",
    {
      title: "Prune Audit History",
      description:
        "Remove old audit results beyond the retention limit for each target. " +
        "Keeps the newest N audits per target and deletes the rest.",
      inputSchema: z.object({
        retention: z
          .number()
          .min(1)
          .max(1000)
          .optional()
          .describe(`Max audits to keep per target (default: ${DEFAULT_RETENTION})`),
      }),
    },
    async ({ retention }) => {
      try {
        const historyDir = join(process.cwd(), HISTORY_DIR);
        if (!existsSync(historyDir)) {
          return { content: [{ type: "text", text: "No audit history found." }] };
        }

        const maxRetention = retention ?? DEFAULT_RETENTION;
        const allFiles = await readdir(historyDir);
        const jsonFiles = allFiles.filter((f) => f.endsWith(".json")).sort().reverse();

        // Group by target hash (last segment before .json)
        const groups = new Map();
        for (const file of jsonFiles) {
          const parsed = parseFilename(file);
          const key = parsed ? parsed.targetHash : "unknown";
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key).push(file);
        }

        let pruned = 0;
        let targets = 0;
        for (const [, files] of groups) {
          targets++;
          if (files.length > maxRetention) {
            const toRemove = files.slice(maxRetention);
            for (const old of toRemove) {
              try {
                const oldPath = join(historyDir, old);
                const safeOld = validateFilePath(oldPath, { write: true });
                await rm(safeOld);
                pruned++;
              } catch {
                // Skip files that can't be removed
              }
            }
          }
        }

        return {
          content: [{
            type: "text",
            text: [
              `Prune complete: ${pruned} old audit(s) removed`,
              `Targets tracked: ${targets}`,
              `Retention: ${maxRetention} audits per target`,
              `Remaining files: ${jsonFiles.length - pruned}`,
            ].join("\n"),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: `Error pruning history: ${err.message}` }] };
      }
    }
  );
}
