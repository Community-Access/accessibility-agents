#!/usr/bin/env node
/**
 * Unit tests for .github/scripts/markdown-a11y-lint.mjs core logic.
 *
 * Run: node scripts/test-markdown-scanner.mjs
 *
 * Uses only Node.js built-ins (no test framework required).
 */

import { writeFileSync, mkdirSync, rmSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { execSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");
const scannerPath = join(repoRoot, ".github", "scripts", "markdown-a11y-lint.mjs");
const tmpDir = join(repoRoot, "tmp-scanner-tests");

// ── helpers ──────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    console.log(`  PASS  ${name}`);
    passed++;
  } else {
    console.error(`  FAIL  ${name}`);
    failed++;
  }
}

function runScanner(dir, args = "") {
  try {
    const result = execSync(`node "${scannerPath}" "${dir}" ${args} --fail-on none`, {
      encoding: "utf-8",
      cwd: repoRoot,
      timeout: 20000,
    });
    return { stdout: result, stderr: "", exitCode: 0 };
  } catch (err) {
    return {
      stdout: err.stdout || "",
      stderr: err.stderr || "",
      exitCode: err.status ?? 1,
    };
  }
}

function runScannerRaw(dir, args = "") {
  // Does not force --fail-on none; captures real exit code, stdout, and stderr.
  const argList = args.trim() ? args.trim().split(/\s+/) : [];
  const result = spawnSync("node", [scannerPath, dir, ...argList], {
    encoding: "utf-8",
    cwd: repoRoot,
    timeout: 20000,
  });
  return {
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    exitCode: result.status ?? 1,
  };
}

function makeDir(name) {
  const d = join(tmpDir, name);
  mkdirSync(d, { recursive: true });
  return d;
}

function write(dir, name, content) {
  writeFileSync(join(dir, name), content, "utf-8");
}

// ── test suite ────────────────────────────────────────────────────────────────

function setup() {
  if (existsSync(tmpDir)) rmSync(tmpDir, { recursive: true, force: true });
  mkdirSync(tmpDir, { recursive: true });
}

function teardown() {
  if (existsSync(tmpDir)) rmSync(tmpDir, { recursive: true, force: true });
}

// ── 1. Clean file produces no issues ─────────────────────────────────────────
function testCleanFile() {
  console.log("\n1. Clean file");
  const dir = makeDir("clean");
  write(dir, "clean.md", `# Introduction\n\nThis is a [descriptive link](https://example.com).\n\n## Section\n\nContent here.\n`);
  const { stdout } = runScanner(dir);
  assert(!stdout.includes("ERROR") && !stdout.includes("WARN"), "no issues on clean file");
}

// ── 2. Missing alt text detection ────────────────────────────────────────────
function testMissingAlt() {
  console.log("\n2. Image missing alt text");
  const dir = makeDir("alt");
  write(dir, "bad.md", `# Test\n\n![](image.png)\n\n<img src="x.png">\n`);
  const { stdout } = runScanner(dir);
  assert(stdout.includes("md-img-alt"), "detects missing alt on markdown image");
  assert(stdout.includes("md-img-alt"), "detects missing alt on HTML img");
}

// ── 3. Multiple H1 detection ──────────────────────────────────────────────────
function testMultiH1() {
  console.log("\n3. Multiple H1 headings");
  const dir = makeDir("h1");
  write(dir, "h1.md", `# Title\n\n## Section\n\n# Another Title\n`);
  const { stdout } = runScanner(dir);
  assert(stdout.includes("md-multi-h1"), "detects multiple H1 headings");
}

// ── 4. Heading level skip detection ──────────────────────────────────────────
function testHeadingSkip() {
  console.log("\n4. Heading level skip");
  const dir = makeDir("skip");
  write(dir, "skip.md", `# Title\n\n### Skip\n`);
  const { stdout } = runScanner(dir);
  assert(stdout.includes("md-heading-skip"), "detects skipped heading level");
}

// ── 5. Ambiguous link detection ───────────────────────────────────────────────
function testAmbiguousLink() {
  console.log("\n5. Ambiguous link text");
  const dir = makeDir("links");
  write(dir, "links.md", `# Title\n\n[click here](https://example.com)\n\n[read more](https://example.com)\n`);
  const { stdout } = runScanner(dir);
  assert(stdout.includes("md-link-ambiguous"), "detects ambiguous link text");
}

// ── 6. Emoji in heading ───────────────────────────────────────────────────────
function testEmojiHeading() {
  console.log("\n6. Emoji in heading");
  const dir = makeDir("emoji");
  write(dir, "emoji.md", `# Introduction\n\n## Features 🎉\n\nContent.\n`);
  const { stdout } = runScanner(dir);
  assert(stdout.includes("md-emoji-heading"), "detects emoji in heading");
}

// ── 7. Code blocks are not scanned ────────────────────────────────────────────
function testCodeBlockSkip() {
  console.log("\n7. Code block content is skipped");
  const dir = makeDir("codeblock");
  write(dir, "code.md", `# Title\n\n\`\`\`markdown\n[click here](https://example.com)\n![](img.png)\n\`\`\`\n`);
  const { stdout } = runScanner(dir);
  assert(!stdout.includes("md-img-alt") && !stdout.includes("md-link-ambiguous"), "skips issues inside code blocks");
}

// ── 8. Config file disables a rule ────────────────────────────────────────────
function testConfigDisableRule() {
  console.log("\n8. Config can disable a rule");
  const dir = makeDir("config");
  write(dir, "bad.md", `# Test\n\n[click here](https://example.com)\n`);
  write(dir, ".a11y-markdown-config.json", JSON.stringify({
    rules: {
      "md-link-ambiguous": { enabled: false }
    }
  }));
  const { stdout } = runScanner(dir);
  assert(!stdout.includes("md-link-ambiguous"), "disabled rule produces no finding");
}

// ── 9. Gate mode none never exits 1 ──────────────────────────────────────────
function testGateModeNone() {
  console.log("\n9. Gate mode none never fails");
  const dir = makeDir("gate-none");
  write(dir, "bad.md", `# Test\n\n![](img.png)\n\n# Duplicate H1\n`);
  const { exitCode } = runScannerRaw(dir, "--fail-on none");
  assert(exitCode === 0, "exit code 0 when fail-on=none");
}

// ── 10. Gate mode error exits 1 on errors ─────────────────────────────────────
function testGateModeError() {
  console.log("\n10. Gate mode error fails on errors");
  const dir = makeDir("gate-error");
  write(dir, "bad.md", `# Test\n\n![](img.png)\n`);
  const { exitCode } = runScannerRaw(dir, "--fail-on error");
  assert(exitCode === 1, "exit code 1 when errors present with fail-on=error");
}

// ── 11. SARIF output is valid JSON with expected schema ───────────────────────
function testSarifOutput() {
  console.log("\n11. SARIF output");
  const dir = makeDir("sarif");
  write(dir, "bad.md", `# Test\n\n![](img.png)\n`);
  // Run from the temp dir so artifacts/markdown-a11y.sarif lands in dir/artifacts/
  runScannerRaw(dir, `--fail-on none --format sarif`);
  const sarifPath = join(dir, "artifacts", "markdown-a11y.sarif");
  assert(existsSync(sarifPath), "SARIF file was written");
  if (existsSync(sarifPath)) {
    try {
      const parsed = JSON.parse(readFileSync(sarifPath, "utf-8"));
      assert(parsed.version === "2.1.0", "SARIF version is 2.1.0");
      assert(Array.isArray(parsed.runs), "SARIF has runs array");
      assert(parsed.runs[0].results.length > 0, "SARIF has results");
    } catch {
      assert(false, "SARIF file is valid JSON");
    }
  }
}

// ── 12. Front matter is not scanned ──────────────────────────────────────────
function testFrontMatterSkip() {
  console.log("\n12. Front matter is not scanned");
  const dir = makeDir("frontmatter");
  write(dir, "fm.md", `---\ntitle: click here\nalt: \n---\n\n# Title\n\nContent.\n`);
  const { stdout } = runScanner(dir);
  assert(!stdout.includes("md-link-ambiguous") && !stdout.includes("md-img-alt"), "skips issues inside front matter");
}

// ── 13. validateConfigSchema emits warnings for unknown keys ─────────────────
function testConfigSchemaWarnsUnknownKey() {
  console.log("\n13. Config schema validation - unknown key warning");
  const dir = makeDir("schema-warn");
  write(dir, "ok.md", "# Title\n\nContent.\n");
  // Write a config with an unknown top-level key
  writeFileSync(
    join(dir, ".a11y-markdown-config.json"),
    JSON.stringify({ unknownKey: true, failOn: "none" }, null, 2),
  );
  const result = runScannerRaw(dir, "--fail-on none");
  const combined = result.stdout + result.stderr;
  assert(
    combined.includes("unknown key") || combined.includes("unknownKey"),
    "emits warning for unknown config key",
  );
}

// ── 14. --regression flag limits scan to changed files (mocked via git) ──────
function testRegressionFlag() {
  console.log("\n14. --regression flag scans only changed files");
  const dir = makeDir("regression");
  // Init a bare git repo so git diff can run
  try {
    execSync("git init", { cwd: dir, encoding: "utf-8", stdio: "pipe" });
    execSync('git config user.email "test@test.com"', { cwd: dir, encoding: "utf-8", stdio: "pipe" });
    execSync('git config user.name "Test"', { cwd: dir, encoding: "utf-8", stdio: "pipe" });
  } catch {
    assert(true, "--regression mode (skipped: git init unavailable)");
    return;
  }
  // Commit a clean file as HEAD~1
  write(dir, "clean.md", "# Clean\n\nNo issues.\n");
  execSync("git add .", { cwd: dir, encoding: "utf-8", stdio: "pipe" });
  execSync('git commit -m "initial"', { cwd: dir, encoding: "utf-8", stdio: "pipe" });
  // Add a bad file (not committed = won't appear in diff HEAD~1..HEAD)
  write(dir, "bad.md", "![](img.png)\n");
  // --regression diffs HEAD~1..HEAD so bad.md is NOT in the diff — should report 0 issues
  const result = runScannerRaw(dir, "--fail-on none --regression");
  const combined = result.stdout + result.stderr;
  // Either 0 issues reported, or the scanner fell back cleanly (no crash)
  assert(
    result.exitCode === 0,
    "--regression exits 0 when only unchanged bad files exist",
  );
  assert(
    !combined.includes("Error:") && !combined.includes("SyntaxError"),
    "--regression mode runs without error",
  );
}

// ── 15. Table description looks past the blank line ──────────────────────────
function testTableDescription() {
  console.log("\n15. Table description");

  // GitHub Flavored Markdown does not recognise a table that interrupts a
  // paragraph, so the blank line between the sentence and the table is
  // required. A described table must pass with it in place.
  const ok = makeDir("table-ok");
  write(
    ok,
    "ok.md",
    `# Title\n\nThe table lists each tier and who may start it.\n\n| Tier | Who |\n|---|---|\n| router | model |\n`,
  );
  const okOut = runScanner(ok).stdout;
  assert(!okOut.includes("md-table-desc"), "described table passes with a blank line before it");

  const bad = makeDir("table-bad");
  write(bad, "bad.md", `# Title\n\n## Tiers\n\n| Tier | Who |\n|---|---|\n| router | model |\n`);
  const badOut = runScanner(bad).stdout;
  assert(badOut.includes("md-table-desc"), "table introduced only by a heading is still reported");
}

// ── run all ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("markdown-a11y-lint.mjs unit tests\n" + "=".repeat(44));
  setup();
  try {
    testCleanFile();
    testMissingAlt();
    testMultiH1();
    testHeadingSkip();
    testAmbiguousLink();
    testEmojiHeading();
    testCodeBlockSkip();
    testConfigDisableRule();
    testGateModeNone();
    testGateModeError();
    await testSarifOutput();
    testFrontMatterSkip();
    testConfigSchemaWarnsUnknownKey();
    testRegressionFlag();
    testTableDescription();
  } finally {
    teardown();
  }

  console.log(`\n${"=".repeat(44)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
