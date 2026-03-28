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
import { writeFile as fsWriteFile } from "node:fs/promises";
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

/**
 * Parse veraPDF MRR (Machine-Readable Report) XML into structured findings.
 *
 * The MRR format has `<rule>` elements with `<status>` (PASSED/FAILED),
 * `<specification>`, `<clause>`, `<description>`, and `<check>` children.
 */
function parseVeraPdfMrr(xml) {
  const findings = [];
  // Match individual rule result blocks
  const ruleBlocks = xml.match(/<rule\b[\s\S]*?<\/rule>/gi) || [];
  for (const block of ruleBlocks) {
    const statusMatch = block.match(/<status>([^<]+)<\/status>/i);
    const status = statusMatch ? statusMatch[1].trim() : "";
    if (status !== "FAILED") continue;

    const specMatch = block.match(/<specification>([^<]+)<\/specification>/i);
    const clauseMatch = block.match(/<clause>([^<]+)<\/clause>/i);
    const descMatch = block.match(/<description>([^<]+)<\/description>/i);
    const testNumMatch = block.match(/<testNumber>([^<]+)<\/testNumber>/i);

    const specification = specMatch ? specMatch[1].trim() : "";
    const clause = clauseMatch ? clauseMatch[1].trim() : "";
    const description = descMatch ? descMatch[1].trim() : "";
    const testNumber = testNumMatch ? testNumMatch[1].trim() : "";

    // Count failed checks within this rule
    const failedChecks = (block.match(/<status>FAILED<\/status>/gi) || []).length;

    findings.push({
      ruleId: `${specification}-${clause}${testNumber ? "-" + testNumber : ""}`,
      specification,
      clause,
      testNumber,
      description,
      failedChecks: Math.max(failedChecks - 1, 1), // subtract the rule-level FAILED
    });
  }
  return findings;
}

/**
 * Convert veraPDF findings into a SARIF 2.1.0 document.
 */
function buildVeraPdfSarif(filePath, findings) {
  return {
    $schema: "https://schemastore.azurewebsites.net/schemas/json/sarif-2.1.0.json",
    version: "2.1.0",
    runs: [{
      tool: {
        driver: {
          name: "veraPDF",
          version: "4.6.0",
          informationUri: "https://verapdf.org/",
        },
      },
      results: findings.map(f => ({
        ruleId: f.ruleId,
        level: "error",
        message: { text: f.description || `Failed: ${f.specification} clause ${f.clause}` },
        locations: [{
          physicalLocation: {
            artifactLocation: { uri: filePath },
          },
        }],
        properties: {
          specification: f.specification,
          clause: f.clause,
          testNumber: f.testNumber,
          failedChecks: f.failedChecks,
        },
      })),
    }],
  };
}

/**
 * Get veraPDF version string if installed.
 */
async function getVeraPdfVersion() {
  try {
    const { stdout } = await execFileAsync("verapdf", ["--version"], { timeout: 10000 });
    return stdout.trim();
  } catch {
    return null;
  }
}

/**
 * Check if Java is available (required by veraPDF).
 */
async function isJavaAvailable() {
  try {
    const { stdout } = await execFileAsync("java", ["-version"], { timeout: 10000 });
    return stdout.trim() || true;
  } catch (err) {
    // java -version writes to stderr on some platforms
    if (err.stderr && err.stderr.includes("version")) return err.stderr.trim();
    return false;
  }
}

/**
 * Register the veraPDF installer helper tool alongside the scan tool.
 */
export function registerVeraPdfInstallerTools(server) {
  server.registerTool(
    "check_verapdf_installation",
    {
      title: "Check veraPDF Installation",
      description:
        "Health check for veraPDF CLI. Auto-detects installation, reports version, " +
        "checks Java dependency, and provides platform-specific installation guidance if missing.",
      inputSchema: z.object({}),
    },
    async () => {
      const platform = process.platform;
      const version = await getVeraPdfVersion();
      const java = await isJavaAvailable();

      if (version) {
        // veraPDF is installed
        const lines = [
          "[PASS] veraPDF is installed and available on PATH",
          "",
          `  Version: ${version}`,
          `  Java: ${typeof java === "string" ? java : java ? "available" : "not detected (but veraPDF works)"}`,
          `  Platform: ${platform}`,
          "",
          "The run_verapdf_scan tool is ready to use.",
          "Example: run_verapdf_scan with a PDF file path for PDF/UA-1 validation.",
        ];
        return { content: [{ type: "text", text: lines.join("\n") }] };
      }

      // veraPDF is NOT installed - provide platform-specific guidance
      const lines = [
        "[MISSING] veraPDF is not installed or not on PATH",
        "",
      ];

      // Java check
      if (!java) {
        lines.push(
          "Step 1: Install Java 11+ (required by veraPDF)",
          ""
        );
        if (platform === "win32") {
          lines.push(
            "  Option A (winget - recommended):",
            "    winget install --exact --id EclipseAdoptium.Temurin.21.JRE",
            "",
            "  Option B (Chocolatey):",
            "    choco install temurin21-jre",
            "",
            "  Option C (manual):",
            "    Download from https://adoptium.net/",
            ""
          );
        } else if (platform === "darwin") {
          lines.push(
            "  brew install --cask temurin@21",
            ""
          );
        } else {
          lines.push(
            "  sudo apt install openjdk-21-jre   # Debian/Ubuntu",
            "  sudo dnf install java-21-openjdk   # Fedora/RHEL",
            ""
          );
        }
      } else {
        lines.push(
          `[PASS] Java is available: ${typeof java === "string" ? java.split("\n")[0] : "detected"}`,
          ""
        );
      }

      lines.push(
        `Step ${java ? "1" : "2"}: Install veraPDF`,
        ""
      );

      if (platform === "win32") {
        lines.push(
          "  Option A (Chocolatey - recommended):",
          "    choco install verapdf",
          "",
          "  Option B (installer):",
          "    1. Download from https://docs.verapdf.org/install/",
          "    2. Run the .msi installer",
          "    3. Add installation directory to PATH",
          "    4. Restart terminal",
          ""
        );
      } else if (platform === "darwin") {
        lines.push(
          "  brew install verapdf",
          ""
        );
      } else {
        lines.push(
          "  Option A (snap - recommended):",
          "    snap install verapdf",
          "",
          "  Option B (installer):",
          "    1. Download from https://docs.verapdf.org/install/",
          "    2. Run: java -jar verapdf-installer-*.jar",
          "    3. Add installation directory to PATH",
          "",
        );
      }

      lines.push(
        "After installation:",
        "  1. Restart your terminal or editor so verapdf is on PATH",
        "  2. Run this tool again to verify the installation",
        "  3. Then use run_verapdf_scan for PDF/UA validation",
        "",
        "Note: Baseline PDF scanning via scan_pdf_document works without veraPDF.",
        "veraPDF provides deeper PDF/UA conformance validation.",
      );

      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );
}

export function registerVeraPdfTools(server) {
  server.registerTool(
    "run_verapdf_scan",
    {
      title: "Run veraPDF PDF/UA Scan",
      description:
        "Run a veraPDF PDF/UA-1 conformance scan against a local PDF file. Returns validation results in text format by default, or SARIF 2.1.0 when sarifPath is provided. Requires veraPDF CLI installed on the system.",
      inputSchema: z.object({
        filePath: z.string().describe("Absolute path to the PDF file"),
        flavour: z
          .enum(["ua1", "ua2", "1a", "1b", "2a", "2b", "2u", "3a", "3b", "3u", "4", "4e", "4f"])
          .optional()
          .describe('veraPDF validation flavour (default: "ua1" for PDF/UA-1)'),
        sarifPath: z
          .string()
          .optional()
          .describe("Optional path to write SARIF 2.1.0 output for CI/code scanning integration"),
      }),
    },
    async ({ filePath, flavour, sarifPath }) => {
      if (!(await isVeraPdfAvailable())) {
        return {
          content: [{
            type: "text",
            text: "veraPDF is not installed or not on PATH.\n\nBaseline PDF scanning still works with `scan_pdf_document`. For deeper PDF/UA validation through `run_verapdf_scan`, install Java 11+ and veraPDF.\n\nWindows:\n  Java:    winget install --exact --id EclipseAdoptium.Temurin.21.JRE\n  veraPDF: choco install verapdf\n  Manual:  https://docs.verapdf.org/install/\n\nmacOS:\n  brew install verapdf\n\nLinux:\n  snap install verapdf\n\nAfter installation, restart your terminal or editor so `verapdf` is on PATH.",
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
      // Use MRR format when SARIF is requested for structured parsing
      const format = sarifPath ? "mrr" : "text";

      try {
        const { stdout, stderr } = await execFileAsync(
          "verapdf",
          ["--flavour", profile, "--format", format, safePath],
          { timeout: 120000, maxBuffer: 10 * 1024 * 1024 }
        );

        const output = stdout || stderr || "No output from veraPDF.";

        let sarifNote = "";
        if (sarifPath) {
          const findings = parseVeraPdfMrr(output);
          try {
            const sarifSafe = validateFilePath(sarifPath, { write: true });
            await fsWriteFile(sarifSafe, JSON.stringify(buildVeraPdfSarif(filePath, findings), null, 2), "utf-8");
            sarifNote = `\nSARIF written to: ${sarifSafe} (${findings.length} findings)`;
          } catch (err) {
            sarifNote = `\nFailed to write SARIF: ${err.message}`;
          }

          // Still return human-readable summary
          const lines = [
            `veraPDF scan: ${basename(filePath)}`,
            `Flavour: ${profile}`,
            `Findings: ${findings.length} failed rules`,
            sarifNote,
          ];
          if (findings.length > 0) {
            lines.push("");
            for (const f of findings.slice(0, 20)) {
              lines.push(`  [FAIL] ${f.ruleId}: ${f.description}${f.failedChecks > 1 ? ` (${f.failedChecks} checks)` : ""}`);
            }
            if (findings.length > 20) lines.push(`  ... and ${findings.length - 20} more`);
          }
          return { content: [{ type: "text", text: lines.join("\n") }] };
        }

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
