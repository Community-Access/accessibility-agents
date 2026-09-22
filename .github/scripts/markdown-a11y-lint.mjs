#!/usr/bin/env node
/**
 * Markdown accessibility lint script for CI.
 * Uses Node.js built-ins only and supports:
 *   - Config file overrides (.a11y-markdown-config.json)
 *   - Enforcement levels (none | error | warning)
 *   - SARIF export for code-scanning style integrations
 */

import { readFileSync, readdirSync, lstatSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative, extname, dirname } from "node:path";
import { execSync } from "node:child_process";

const EXTENSIONS = new Set([".md", ".mdx"]);
/**
 * Directories this linter does not scan.
 *
 * Three kinds, and the reason matters because a warning about a file nobody
 * edits is a warning nobody will ever clear:
 *
 *   Not ours          dependencies and vendored code
 *   Not source        build output, coverage, generated artifacts
 *   Not the repo's    the editor's local history, which is gitignored and is a
 *                     private record of the user's keystrokes
 *
 * `.history` was the largest single source of findings in this repository:
 * 228 of 934, every one a duplicate of a file that is also scanned at its real
 * path. Scanning it inflated the count by a quarter and pointed every fix at a
 * snapshot instead of the document.
 */
const DEFAULT_IGNORED_DIRS = [
  // Not ours
  "node_modules",
  "vendor",
  ".git",
  // Not source
  "dist",
  "build",
  "out",
  ".next",
  ".nuxt",
  "coverage",
  "artifacts",
  // Not the repository's
  ".history",
  ".vscode-test",
];

const DEFAULT_RULES = {
  "md-img-alt": { enabled: true, severity: "error" },
  "md-multi-h1": { enabled: true, severity: "error" },
  "md-heading-skip": { enabled: true, severity: "error" },
  "md-emoji-heading": { enabled: true, severity: "warning" },
  "md-link-ambiguous": { enabled: true, severity: "warning" },
  "md-bare-url": { enabled: true, severity: "warning" },
  "md-table-desc": { enabled: true, severity: "warning" },
};

function parseArgs(argv) {
  const options = {
    root: process.cwd(),
    configPath: null,
    failOn: "error",
    format: "text",
    output: null,
    // regression mode: only fail on issues present in files changed vs a baseline
    regressionMode: false,
    baselineRef: "HEAD~1",
  };

  const positionals = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--config") {
      options.configPath = argv[++i];
    } else if (arg === "--fail-on") {
      options.failOn = (argv[++i] || "error").toLowerCase();
    } else if (arg === "--format") {
      options.format = (argv[++i] || "text").toLowerCase();
    } else if (arg === "--output") {
      options.output = argv[++i];
    } else if (arg === "--regression") {
      options.regressionMode = true;
    } else if (arg === "--baseline-ref") {
      options.baselineRef = argv[++i] || "HEAD~1";
    } else if (arg.startsWith("-")) {
      // Unknown flag; ignore for backward compatibility.
    } else {
      positionals.push(arg);
    }
  }

  if (positionals.length > 0) {
    options.root = positionals[0];
  }

  if (!["none", "error", "warning"].includes(options.failOn)) {
    options.failOn = "error";
  }
  if (!["text", "sarif", "both"].includes(options.format)) {
    options.format = "text";
  }

  return options;
}

function readJsonFile(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return null;
  }
}

/** Validate structure of .a11y-markdown-config.json and emit warnings for bad fields. */
function validateConfigSchema(fileConfig, configPath) {
  const warnings = [];

  if (typeof fileConfig !== "object" || fileConfig === null || Array.isArray(fileConfig)) {
    warnings.push(`[config] ${configPath}: root must be a JSON object`);
    return warnings;
  }

  const validTopKeys = new Set(["ignoredDirs", "maxIssuesPerRule", "rules", "failOn", "output"]);
  for (const key of Object.keys(fileConfig)) {
    if (!validTopKeys.has(key)) {
      warnings.push(`[config] ${configPath}: unknown key "${key}" (valid: ${[...validTopKeys].join(", ")})`);
    }
  }

  if ("ignoredDirs" in fileConfig && !Array.isArray(fileConfig.ignoredDirs)) {
    warnings.push(`[config] ${configPath}: "ignoredDirs" must be an array of strings`);
  }

  if ("maxIssuesPerRule" in fileConfig && (!Number.isInteger(fileConfig.maxIssuesPerRule) || fileConfig.maxIssuesPerRule < 1)) {
    warnings.push(`[config] ${configPath}: "maxIssuesPerRule" must be a positive integer`);
  }

  if ("failOn" in fileConfig && !["none", "error", "warning"].includes(fileConfig.failOn)) {
    warnings.push(`[config] ${configPath}: "failOn" must be one of none|error|warning, got "${fileConfig.failOn}"`);
  }

  if ("output" in fileConfig) {
    const out = fileConfig.output;
    if (typeof out !== "object" || out === null) {
      warnings.push(`[config] ${configPath}: "output" must be an object`);
    } else {
      if ("format" in out && !["text", "sarif", "both"].includes(out.format)) {
        warnings.push(`[config] ${configPath}: "output.format" must be one of text|sarif|both, got "${out.format}"`);
      }
      if ("sarifPath" in out && typeof out.sarifPath !== "string") {
        warnings.push(`[config] ${configPath}: "output.sarifPath" must be a string`);
      }
    }
  }

  if ("rules" in fileConfig) {
    const rules = fileConfig.rules;
    if (typeof rules !== "object" || Array.isArray(rules)) {
      warnings.push(`[config] ${configPath}: "rules" must be an object`);
    } else {
      for (const [ruleName, ruleCfg] of Object.entries(rules)) {
        if (typeof ruleCfg !== "object" || ruleCfg === null) {
          warnings.push(`[config] ${configPath}: rules.${ruleName} must be an object with enabled/severity`);
          continue;
        }
        if ("enabled" in ruleCfg && typeof ruleCfg.enabled !== "boolean") {
          warnings.push(`[config] ${configPath}: rules.${ruleName}.enabled must be boolean`);
        }
        if ("severity" in ruleCfg && !["error", "warning"].includes(ruleCfg.severity)) {
          warnings.push(`[config] ${configPath}: rules.${ruleName}.severity must be error|warning, got "${ruleCfg.severity}"`);
        }
      }
    }
  }

  return warnings;
}

/** Return the set of markdown file paths changed vs a git ref. Returns null (all files) on error. */
function getChangedFiles(root, baselineRef) {
  try {
    const raw = execSync(`git diff --name-only ${baselineRef} -- "*.md" "*.mdx"`, {
      cwd: root,
      encoding: "utf-8",
      timeout: 10000,
    });
    const files = raw
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && /\.(md|mdx)$/i.test(l))
      .map((l) => join(root, l))
      .filter((f) => existsSync(f));
    return new Set(files);
  } catch {
    // Not a git repo, or ref doesn't exist (shallow clone, first commit, etc.)
    return null; // signals caller to scan all files
  }
}

function loadConfig(root, explicitConfigPath = null) {
  const defaultConfig = {
    ignoredDirs: [...DEFAULT_IGNORED_DIRS],
    maxIssuesPerRule: 20,
    rules: { ...DEFAULT_RULES },
    failOn: "error",
    output: {
      format: "text",
      sarifPath: "artifacts/markdown-a11y.sarif",
    },
  };

  const configPath = explicitConfigPath || join(root, ".a11y-markdown-config.json");
  const fileConfig = readJsonFile(configPath);
  if (!fileConfig) {
    return defaultConfig;
  }

  // Validate schema and emit warnings; validation never throws.
  const schemaWarnings = validateConfigSchema(fileConfig, configPath);
  for (const w of schemaWarnings) {
    console.warn(w);
  }

  const mergedRules = { ...DEFAULT_RULES };
  if (fileConfig.rules && typeof fileConfig.rules === "object") {
    for (const [ruleName, ruleCfg] of Object.entries(fileConfig.rules)) {
      const current = mergedRules[ruleName] || { enabled: true, severity: "warning" };
      mergedRules[ruleName] = {
        enabled: typeof ruleCfg?.enabled === "boolean" ? ruleCfg.enabled : current.enabled,
        severity: ["error", "warning"].includes(ruleCfg?.severity) ? ruleCfg.severity : current.severity,
      };
    }
  }

  return {
    ignoredDirs: Array.isArray(fileConfig.ignoredDirs) ? fileConfig.ignoredDirs : defaultConfig.ignoredDirs,
    maxIssuesPerRule:
      Number.isInteger(fileConfig.maxIssuesPerRule) && fileConfig.maxIssuesPerRule > 0
        ? fileConfig.maxIssuesPerRule
        : defaultConfig.maxIssuesPerRule,
    rules: mergedRules,
    failOn: ["none", "error", "warning"].includes(fileConfig.failOn) ? fileConfig.failOn : defaultConfig.failOn,
    output: {
      format: ["text", "sarif", "both"].includes(fileConfig?.output?.format)
        ? fileConfig.output.format
        : defaultConfig.output.format,
      sarifPath:
        typeof fileConfig?.output?.sarifPath === "string" && fileConfig.output.sarifPath.length > 0
          ? fileConfig.output.sarifPath
          : defaultConfig.output.sarifPath,
    },
  };
}

function walkDir(dir, extensions, ignoredDirsSet) {
  const results = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return results;
  }
  for (const entry of entries) {
    if (ignoredDirsSet.has(entry)) continue;
    const full = join(dir, entry);
    let stat;
    try {
      stat = lstatSync(full);
    } catch {
      continue;
    }
    if (stat.isSymbolicLink()) continue;
    if (stat.isDirectory()) {
      results.push(...walkDir(full, extensions, ignoredDirsSet));
    } else if (extensions.has(extname(entry).toLowerCase())) {
      results.push(full);
    }
  }
  return results;
}

const issues = [];

function addIssue(file, line, rule, message, rulesConfig) {
  const ruleCfg = rulesConfig[rule] || { enabled: true, severity: "warning" };
  if (!ruleCfg.enabled) return;
  issues.push({ file, line, rule, message, severity: ruleCfg.severity });
}

function checkFile(filePath, root, rulesConfig) {
  let content;
  try {
    content = readFileSync(filePath, "utf-8");
  } catch {
    return;
  }

  const rel = relative(root, filePath);
  const lines = content.split("\n");
  let inCodeBlock = false;
  let inFrontMatter = false;
  let lastHeadingLevel = 0;
  let h1Count = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    if (i === 0 && line.replace(/^\uFEFF/, "").trim() === "---") {
      inFrontMatter = true;
      continue;
    }
    if (inFrontMatter) {
      if (line.trim() === "---") inFrontMatter = false;
      continue;
    }

    const trimmedLine = line.trim();
    if (/^```/.test(trimmedLine)) {
      if (inCodeBlock) {
        if (/^`{3,}\s*$/.test(trimmedLine)) {
          inCodeBlock = false;
        }
      } else {
        inCodeBlock = true;
      }
      continue;
    }
    if (inCodeBlock) continue;

    const lineNoCode = line.replace(/`[^`]+`/g, "");

    const imgMatches = [...lineNoCode.matchAll(/!\[([^\]]*)\]\([^)]+\)/g)];
    for (const m of imgMatches) {
      const alt = m[1].trim();
      if (alt.length === 0) {
        addIssue(rel, lineNum, "md-img-alt", "Image missing alt text", rulesConfig);
      }
    }

    const htmlImgMatches = [...lineNoCode.matchAll(/<img\b[^>]*>/gi)];
    for (const m of htmlImgMatches) {
      if (!/\balt\s*=/i.test(m[0])) {
        addIssue(rel, lineNum, "md-img-alt", "<img> in markdown missing alt attribute", rulesConfig);
      }
    }

    const headingMatch = lineNoCode.match(/^(#{1,6})\s+/);
    if (headingMatch) {
      const level = headingMatch[1].length;

      if (level === 1) {
        h1Count++;
        if (h1Count > 1) {
          addIssue(
            rel,
            lineNum,
            "md-multi-h1",
            "Multiple H1 headings; use only one H1 per document",
            rulesConfig
          );
        }
      }

      if (lastHeadingLevel > 0 && level > lastHeadingLevel + 1) {
        addIssue(
          rel,
          lineNum,
          "md-heading-skip",
          `Heading level skipped: H${lastHeadingLevel} to H${level}`,
          rulesConfig
        );
      }

      lastHeadingLevel = level;

      const headingText = line.slice(headingMatch[0].length);
      if (/[\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{200D}\u{FE0F}]/u.test(headingText)) {
        addIssue(rel, lineNum, "md-emoji-heading", "Emoji in heading may cause screen reader issues", rulesConfig);
      }
    }

    const linkMatches = [...lineNoCode.matchAll(/\[([^\]]+)\]\([^)]+\)/g)];
    for (const m of linkMatches) {
      const text = m[1].trim().toLowerCase();
      const ambiguous = [
        "click here",
        "here",
        "read more",
        "more",
        "learn more",
        "link",
        "this link",
        "details",
        "more details",
        "info",
        "more info",
        "this",
        "this page",
      ];
      if (ambiguous.includes(text)) {
        addIssue(
          rel,
          lineNum,
          "md-link-ambiguous",
          `Ambiguous link text "${m[1].trim()}"; use descriptive text`,
          rulesConfig
        );
      }
    }

    const bareUrlMatches = [...lineNoCode.matchAll(/(?<![(<\[])(https?:\/\/[^\s)>\]]+)/g)];
    for (const m of bareUrlMatches) {
      const before = lineNoCode.slice(0, m.index);
      if (/\]\($/.test(before) || /\[.*$/.test(before)) continue;
      addIssue(rel, lineNum, "md-bare-url", "Bare URL in prose; wrap in descriptive link text", rulesConfig);
    }

    // A table needs a sentence introducing it, so a screen reader user knows
    // what the grid holds before entering table navigation.
    //
    // Look back past blank lines to find that sentence. GitHub Flavored
    // Markdown does not recognise a table that interrupts a paragraph, so the
    // blank line between the description and the table is required, not a
    // defect: checking only the immediately preceding line asked authors for
    // markdown that would not render as a table at all.
    if (/^\|/.test(trimmedLine) && i > 0 && !/^\|/.test((lines[i - 1] || "").trim())) {
      let j = i - 1;
      while (j >= 0 && lines[j].trim() === "") j -= 1;

      const introducer = j >= 0 ? lines[j].trim() : "";
      const isProse = introducer !== "" && !/^#{1,6}\s/.test(introducer);

      if (!isProse) {
        addIssue(
          rel,
          lineNum,
          "md-table-desc",
          "Table without preceding description; add a one-sentence summary before the table",
          rulesConfig
        );
      }
    }
  }
}

function printTextSummary(config) {
  if (issues.length === 0) {
    console.log("No markdown accessibility issues found.");
    return;
  }

  const byRule = {};
  for (const issue of issues) {
    if (!byRule[issue.rule]) byRule[issue.rule] = [];
    byRule[issue.rule].push(issue);
  }

  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  console.log(`Found ${issues.length} issue(s): ${errors} error(s), ${warnings} warning(s)\n`);

  for (const [rule, ruleIssues] of Object.entries(byRule)) {
    console.log(`-- ${rule} (${ruleIssues.length}) --`);
    for (const issue of ruleIssues.slice(0, config.maxIssuesPerRule)) {
      const prefix = issue.severity === "error" ? "ERROR" : "WARN";
      console.log(`  ${prefix} ${issue.file}:${issue.line} - ${issue.message}`);
    }
    if (ruleIssues.length > config.maxIssuesPerRule) {
      console.log(`  ... and ${ruleIssues.length - config.maxIssuesPerRule} more`);
    }
    console.log();
  }
}

function buildSarif(rootPath) {
  const rules = [...new Set(issues.map((i) => i.rule))].map((ruleId) => ({
    id: ruleId,
    shortDescription: { text: ruleId },
    help: { text: `Accessibility rule: ${ruleId}` },
  }));

  const results = issues.map((issue) => ({
    ruleId: issue.rule,
    level: issue.severity === "error" ? "error" : "warning",
    message: { text: issue.message },
    locations: [
      {
        physicalLocation: {
          artifactLocation: { uri: issue.file },
          region: { startLine: issue.line },
        },
      },
    ],
  }));

  return {
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: "markdown-a11y-lint",
            version: "2.0.0",
            informationUri: "https://github.com/Community-Access/accessibility-agents",
            rules,
          },
        },
        artifacts: [],
        invocations: [
          {
            executionSuccessful: true,
            workingDirectory: { uri: rootPath },
          },
        ],
        results,
      },
    ],
  };
}

function writeSarifFile(root, outputPath) {
  const sarif = buildSarif(root);
  const fullPath = outputPath ? join(root, outputPath) : join(root, "artifacts", "markdown-a11y.sarif");
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, JSON.stringify(sarif, null, 2));
  console.log(`SARIF report written: ${relative(root, fullPath)}`);
}

function emitGitHubAnnotations() {
  if (!process.env.GITHUB_ACTIONS) return;
  for (const issue of issues) {
    const level = issue.severity === "error" ? "error" : "warning";
    console.log(`::${level} file=${issue.file},line=${issue.line}::${issue.rule}: ${issue.message}`);
  }
}

function shouldFail(failOnLevel) {
  if (failOnLevel === "none") return false;
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  if (failOnLevel === "warning") {
    return errorCount + warningCount > 0;
  }
  return errorCount > 0;
}

function main() {
  const cli = parseArgs(process.argv.slice(2));
  const config = loadConfig(cli.root, cli.configPath);

  const effectiveFailOn = process.env.A11Y_MARKDOWN_FAIL_ON || cli.failOn || config.failOn || "error";
  const effectiveFormat = process.env.A11Y_MARKDOWN_FORMAT || cli.format || config.output.format || "text";
  const effectiveOutput = cli.output || process.env.A11Y_MARKDOWN_OUTPUT || config.output.sarifPath;

  const regressionMode = cli.regressionMode || process.env.A11Y_REGRESSION_MODE === "true";
  const baselineRef = cli.baselineRef || process.env.A11Y_BASELINE_REF || "HEAD~1";

  const ignoredDirsSet = new Set(config.ignoredDirs);
  let mdFiles = walkDir(cli.root, EXTENSIONS, ignoredDirsSet);

  if (regressionMode) {
    const changedSet = getChangedFiles(cli.root, baselineRef);
    if (changedSet !== null) {
      mdFiles = mdFiles.filter((f) => changedSet.has(f));
      console.log(`Regression mode (baseline: ${baselineRef}): scanning ${mdFiles.length} changed markdown file(s)...\n`);
    } else {
      console.log(`Regression mode requested but git diff unavailable; scanning all ${mdFiles.length} file(s)...\n`);
    }
  } else {
    console.log(`Scanning ${mdFiles.length} markdown files...\n`);
  }

  for (const f of mdFiles) {
    checkFile(f, cli.root, config.rules);
  }

  if (effectiveFormat === "text" || effectiveFormat === "both") {
    printTextSummary(config);
  }
  if (effectiveFormat === "sarif" || effectiveFormat === "both") {
    writeSarifFile(cli.root, effectiveOutput);
  }

  emitGitHubAnnotations();

  const fail = shouldFail(effectiveFailOn);
  if (fail) {
    console.log(`\nMarkdown accessibility gate failed (fail-on=${effectiveFailOn}).`);
    process.exit(1);
  }

  console.log(`\nMarkdown accessibility gate passed (fail-on=${effectiveFailOn}).`);
  process.exit(0);
}

main();
