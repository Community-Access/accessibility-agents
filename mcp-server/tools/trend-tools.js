/**
 * Trend Dashboard tools for visualising audit score progression.
 *
 * Reads from the `.a11y-history/` directory populated by audit-history-tools
 * and computes per-target and aggregate trend data.
 *
 * Tools:
 *   get_audit_trend - Compute score progression and issue velocity for a target
 *
 * Resources:
 *   a11y://dashboard/summary - Aggregate dashboard across all stored audits
 */

import { z } from "zod";
import { readFile as fsReadFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

const HISTORY_DIR = ".a11y-history";

/**
 * Load all audit records from history, newest first.
 * Returns an empty array if the directory does not exist.
 */
async function loadAllAudits() {
  const dir = join(process.cwd(), HISTORY_DIR);
  if (!existsSync(dir)) return [];

  const files = (await readdir(dir))
    .filter((f) => f.endsWith(".json"))
    .sort()
    .reverse();

  const records = [];
  for (const file of files) {
    try {
      const raw = await fsReadFile(join(dir, file), "utf-8");
      records.push(JSON.parse(raw));
    } catch {
      // Skip malformed files
    }
  }
  return records;
}

/**
 * Group audit records by targetHash.
 */
function groupByTarget(records) {
  const groups = new Map();
  for (const r of records) {
    const key = r.targetHash || "unknown";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }
  return groups;
}

/**
 * Compute trend summary for a list of audits (newest first).
 */
function computeTrend(audits) {
  if (audits.length === 0) return null;

  const latest = audits[0];
  const scores = audits.filter((a) => a.score != null).map((a) => a.score);
  const findingCounts = audits.map((a) => a.summary?.findings ?? 0);

  let direction = "stable";
  let delta = 0;
  if (scores.length >= 2) {
    delta = scores[0] - scores[1];
    if (delta > 2) direction = "improving";
    else if (delta < -2) direction = "declining";
  }

  // Issue velocity: findings change between two most recent scans
  let velocity = 0;
  if (findingCounts.length >= 2) {
    velocity = findingCounts[0] - findingCounts[1];
  }

  return {
    target: latest.target,
    type: latest.type,
    latestScore: latest.score ?? null,
    latestGrade: latest.grade ?? null,
    latestFindings: latest.summary?.findings ?? 0,
    latestErrors: latest.summary?.errors ?? 0,
    latestTimestamp: latest.timestamp,
    scanCount: audits.length,
    direction,
    scoreDelta: delta,
    issueVelocity: velocity,
    averageScore:
      scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
        : null,
    bestScore: scores.length > 0 ? Math.max(...scores) : null,
    worstScore: scores.length > 0 ? Math.min(...scores) : null,
  };
}

export function registerTrendTools(server) {
  // ---- Tool: get_audit_trend ----
  server.registerTool(
    "get_audit_trend",
    {
      title: "Get Audit Score Trend",
      description:
        "Compute score progression and issue velocity for a specific target " +
        "from stored audit history. Shows direction (improving/stable/declining), " +
        "score delta, average, best/worst scores, and finding velocity.",
      inputSchema: z.object({
        target: z
          .string()
          .describe("Target to compute trend for (URL or file path)"),
        limit: z
          .number()
          .min(2)
          .max(100)
          .optional()
          .describe("Max historical scans to include (default: 20)"),
      }),
    },
    async ({ target, limit }) => {
      try {
        const records = await loadAllAudits();
        if (records.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "No audit history found. Run scans and save results with save_audit_result first.",
              },
            ],
          };
        }

        const targetHash = createHash("sha256")
          .update(target)
          .digest("hex")
          .slice(0, 12);
        const maxResults = limit ?? 20;
        const targetAudits = records
          .filter((r) => r.targetHash === targetHash)
          .slice(0, maxResults);

        if (targetAudits.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No audit history found for target: ${target}`,
              },
            ],
          };
        }

        const trend = computeTrend(targetAudits);
        const directionLabel = {
          improving: "[UP] Improving",
          declining: "[DOWN] Declining",
          stable: "[STABLE] Stable",
        };

        const lines = [
          `Audit Trend: ${trend.target}`,
          `Type: ${trend.type} | Scans: ${trend.scanCount}`,
          ``,
          `Latest: Score ${trend.latestScore ?? "N/A"} (${trend.latestGrade ?? "N/A"}) | ${trend.latestFindings} findings (${trend.latestErrors} errors)`,
          `Last Scanned: ${trend.latestTimestamp}`,
          ``,
          `Direction: ${directionLabel[trend.direction]}`,
          `Score Delta (vs previous): ${trend.scoreDelta > 0 ? "+" : ""}${trend.scoreDelta}`,
          `Issue Velocity: ${trend.issueVelocity > 0 ? "+" : ""}${trend.issueVelocity} findings since last scan`,
          ``,
          `Historical:`,
          `  Average Score: ${trend.averageScore ?? "N/A"}`,
          `  Best Score:    ${trend.bestScore ?? "N/A"}`,
          `  Worst Score:   ${trend.worstScore ?? "N/A"}`,
        ];

        // Include timeline (last N scans)
        if (targetAudits.length > 1) {
          lines.push(``, `Timeline (newest first):`);
          for (const a of targetAudits.slice(0, 10)) {
            const date = a.timestamp
              ? a.timestamp.split("T")[0]
              : "unknown";
            lines.push(
              `  ${date}: Score ${a.score ?? "N/A"} | ${a.summary?.findings ?? 0} findings`
            );
          }
          if (targetAudits.length > 10) {
            lines.push(`  ... and ${targetAudits.length - 10} older scans`);
          }
        }

        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (err) {
        return {
          content: [
            { type: "text", text: `Error computing trend: ${err.message}` },
          ],
        };
      }
    }
  );
}

/**
 * Register the a11y://dashboard/summary resource.
 * Provides an aggregate view across all targets.
 */
export function registerTrendResource(server) {
  server.resource(
    "audit-dashboard",
    "a11y://dashboard/summary",
    {
      description:
        "Aggregate accessibility dashboard summarizing all stored audit results. " +
        "Shows per-target trends, overall health, and improvement direction.",
    },
    async (uri) => {
      const records = await loadAllAudits();

      if (records.length === 0) {
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "text/markdown",
              text: "# Accessibility Dashboard\n\nNo audit history found. Run scans and save results with `save_audit_result` to populate this dashboard.",
            },
          ],
        };
      }

      const groups = groupByTarget(records);
      const trends = [];
      for (const [, audits] of groups) {
        const trend = computeTrend(audits);
        if (trend) trends.push(trend);
      }

      // Sort by latest timestamp descending
      trends.sort((a, b) => (b.latestTimestamp || "").localeCompare(a.latestTimestamp || ""));

      // Aggregate stats
      const totalTargets = trends.length;
      const totalScans = records.length;
      const scoredTrends = trends.filter((t) => t.latestScore != null);
      const avgScore =
        scoredTrends.length > 0
          ? Math.round(
              (scoredTrends.reduce((a, t) => a + t.latestScore, 0) /
                scoredTrends.length) *
                10
            ) / 10
          : null;
      const improving = trends.filter((t) => t.direction === "improving").length;
      const declining = trends.filter((t) => t.direction === "declining").length;
      const stable = trends.filter((t) => t.direction === "stable").length;

      let md = `# Accessibility Dashboard\n\n`;
      md += `**Targets:** ${totalTargets} | **Total Scans:** ${totalScans} | **Average Score:** ${avgScore ?? "N/A"}\n\n`;
      md += `**Trends:** ${improving} improving, ${stable} stable, ${declining} declining\n\n`;

      md += `## Per-Target Summary\n\n`;
      md += `| Target | Type | Score | Grade | Findings | Trend | Scans |\n`;
      md += `|--------|------|-------|-------|----------|-------|-------|\n`;

      for (const t of trends) {
        const shortTarget =
          t.target.length > 50 ? t.target.slice(0, 47) + "..." : t.target;
        const dirIcon =
          t.direction === "improving"
            ? "[UP]"
            : t.direction === "declining"
              ? "[DOWN]"
              : "--";
        md += `| ${shortTarget} | ${t.type} | ${t.latestScore ?? "N/A"} | ${t.latestGrade ?? "N/A"} | ${t.latestFindings} | ${dirIcon} | ${t.scanCount} |\n`;
      }

      if (declining > 0) {
        md += `\n## Attention Needed\n\n`;
        md += `The following targets have declining scores:\n\n`;
        for (const t of trends.filter((t) => t.direction === "declining")) {
          md += `- **${t.target}**: Score ${t.latestScore ?? "N/A"} (${t.scoreDelta} since last scan)\n`;
        }
      }

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "text/markdown",
            text: md,
          },
        ],
      };
    }
  );
}
