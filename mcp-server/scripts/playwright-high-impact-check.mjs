#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const cur = argv[i];
    if (!cur.startsWith("--")) continue;
    const key = cur.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

function toNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function outFile(outDir, name) {
  const file = join(outDir, name);
  mkdirSync(dirname(file), { recursive: true });
  return file;
}

function impactRank(impact) {
  const map = { critical: 4, serious: 3, moderate: 2, minor: 1 };
  return map[impact] || 0;
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const url = args.url;
  if (!url) {
    console.error("Missing required argument: --url <http(s)://...>");
    process.exit(2);
  }

  const minImpact = args["min-impact"] || "serious";
  const outDir = args["out-dir"] || "artifacts";
  const minImpactThreshold = impactRank(minImpact);

  const viewports = [320, 768, 1024, 1440];
  const report = {
    url,
    minImpact,
    generatedAt: new Date().toISOString(),
    axe: { totalViolations: 0, byImpact: {}, topRules: [] },
    keyboard: { trapDetected: false, stops: [] },
    viewport: { horizontalScroll: [], undersizedTargets: {} },
    pass: true,
    failReasons: [],
  };

  let chromium;
  let AxeBuilder;
  try {
    ({ chromium } = await import("playwright"));
    ({ default: AxeBuilder } = await import("@axe-core/playwright"));
  } catch {
    console.error("Playwright dependencies are missing. Install with: npm install --no-save playwright @axe-core/playwright && npx playwright install chromium");
    process.exit(2);
  }

  const browser = await chromium.launch({ headless: true });
  try {
    // @axe-core/playwright needs a page opened from a browser context.
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    for (const width of viewports) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

      const hScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth - window.innerWidth > 2;
      });
      if (hScroll) report.viewport.horizontalScroll.push(width);

      const undersized = await page.evaluate(() => {
        const nodes = Array.from(
          document.querySelectorAll('a[href], button, input, select, textarea, [role="button"], [tabindex]'),
        );
        let count = 0;
        for (const node of nodes) {
          const rect = node.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
            count += 1;
          }
        }
        return count;
      });
      report.viewport.undersizedTargets[width] = undersized;

      const axeResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();

      for (const v of axeResults.violations || []) {
        const impact = v.impact || "unknown";
        report.axe.byImpact[impact] = (report.axe.byImpact[impact] || 0) + 1;
      }
      report.axe.totalViolations += (axeResults.violations || []).length;
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    const keyboardStops = [];
    let repeats = 0;
    let last = "";
    for (let i = 0; i < 80; i++) {
      await page.keyboard.press("Tab");
      const current = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return "unknown";
        if (el.id) return `#${el.id}`;
        const cls = (el.className || "").toString().trim().split(/\s+/).filter(Boolean)[0];
        if (cls) return `${el.tagName.toLowerCase()}.${cls}`;
        return el.tagName.toLowerCase();
      });
      keyboardStops.push(current);
      if (current === last) {
        repeats += 1;
      } else {
        repeats = 0;
      }
      last = current;
      if (repeats >= 4) {
        report.keyboard.trapDetected = true;
        break;
      }
    }
    report.keyboard.stops = keyboardStops.slice(0, 20);

    // Build a simple top-rules summary by running one final scan on desktop viewport.
    const finalAxe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    report.axe.topRules = (finalAxe.violations || []).slice(0, 10).map((v) => ({
      id: v.id,
      impact: v.impact || "unknown",
      help: v.help,
      count: (v.nodes || []).length,
    }));

    const impactFailures = Object.entries(report.axe.byImpact)
      .filter(([impact, count]) => impactRank(impact) >= minImpactThreshold && count > 0)
      .map(([impact, count]) => `${impact}:${count}`);

    if (impactFailures.length > 0) {
      report.pass = false;
      report.failReasons.push(`Axe violations at or above ${minImpact}: ${impactFailures.join(", ")}`);
    }

    if (report.keyboard.trapDetected) {
      report.pass = false;
      report.failReasons.push("Potential keyboard trap detected during Tab traversal.");
    }

    if (report.viewport.horizontalScroll.length > 0) {
      report.pass = false;
      report.failReasons.push(
        `Horizontal scroll overflow detected at viewport(s): ${report.viewport.horizontalScroll.join(", ")}`,
      );
    }

    const touchFailures = Object.entries(report.viewport.undersizedTargets)
      .filter(([, count]) => Number(count) > 0)
      .map(([vp, count]) => `${vp}px:${count}`);
    if (touchFailures.length > 0) {
      report.failReasons.push(`Undersized touch targets found: ${touchFailures.join(", ")}`);
    }

    const summary = [];
    summary.push("# Playwright High-Impact Accessibility Check");
    summary.push("");
    summary.push(`- URL: ${report.url}`);
    summary.push(`- Generated: ${report.generatedAt}`);
    summary.push(`- Result: ${report.pass ? "PASS" : "FAIL"}`);
    summary.push(`- Minimum failing impact: ${report.minImpact}`);
    summary.push("");
    summary.push("## High-Impact Signals");
    summary.push(`- Axe total violations: ${report.axe.totalViolations}`);
    summary.push(`- Axe by impact: ${JSON.stringify(report.axe.byImpact)}`);
    summary.push(`- Keyboard trap detected: ${report.keyboard.trapDetected ? "yes" : "no"}`);
    summary.push(`- Horizontal scroll viewports: ${report.viewport.horizontalScroll.join(", ") || "none"}`);
    summary.push("");
    summary.push("## Top Rules");
    if (report.axe.topRules.length === 0) {
      summary.push("No violations found in desktop snapshot.");
    } else {
      for (const rule of report.axe.topRules) {
        summary.push(`- ${rule.id} (${rule.impact}) x${rule.count}: ${rule.help}`);
      }
    }
    summary.push("");
    summary.push("## Touch Targets");
    for (const [vp, count] of Object.entries(report.viewport.undersizedTargets)) {
      summary.push(`- ${vp}px: ${count}`);
    }
    summary.push("");
    if (report.failReasons.length > 0) {
      summary.push("## Failure Reasons");
      for (const reason of report.failReasons) summary.push(`- ${reason}`);
    }

    const jsonFile = outFile(outDir, "playwright-high-impact.json");
    const mdFile = outFile(outDir, "playwright-high-impact-summary.md");
    writeFileSync(jsonFile, JSON.stringify(report, null, 2));
    writeFileSync(mdFile, `${summary.join("\n")}\n`);

    console.log(`Wrote ${jsonFile}`);
    console.log(`Wrote ${mdFile}`);
    process.exit(report.pass ? 0 : 1);
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error(err?.stack || err?.message || String(err));
  process.exit(1);
});
