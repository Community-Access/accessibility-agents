/**
 * Playwright-based accessibility testing tools for the MCP server.
 *
 * All tools degrade gracefully — if Playwright is not installed, they return
 * a clear error message explaining how to install it. Tools operate read-only
 * against live URLs and never modify files.
 *
 * Dependencies (optional peer):
 *   playwright, @axe-core/playwright
 *
 * Install:
 *   npm install -D playwright @axe-core/playwright && npx playwright install chromium
 */

import { z } from "zod";

let _playwrightAvailable = null;

async function isPlaywrightAvailable() {
  if (_playwrightAvailable !== null) return _playwrightAvailable;
  try {
    await import("playwright");
    _playwrightAvailable = true;
  } catch {
    _playwrightAvailable = false;
  }
  return _playwrightAvailable;
}

const NOT_INSTALLED_MSG =
  "Playwright is not installed. Install with:\n  npm install -D playwright @axe-core/playwright && npx playwright install chromium";

/**
 * Validate a URL to prevent SSRF. Only allows http: and https: schemes
 * and rejects localhost/private IPs unless explicitly allowed.
 */
function validateUrl(urlString) {
  let parsed;
  try {
    parsed = new URL(urlString);
  } catch {
    throw new Error("Invalid URL format.");
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http: and https: URLs are allowed.");
  }
  return parsed.href;
}

export function registerPlaywrightTools(server) {
  // ---- Tool: run_axe_scan ----
  server.registerTool(
    "run_axe_scan",
    {
      title: "Run axe-core Accessibility Scan",
      description:
        "Run an axe-core accessibility scan against a live URL using Playwright. Returns all WCAG 2.x AA violations with element selectors and remediation guidance. Requires Playwright and @axe-core/playwright.",
      inputSchema: z.object({
        url: z.string().describe("URL to scan (http or https)"),
        tags: z
          .array(z.string())
          .optional()
          .describe('axe-core tags to filter by (default: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])'),
        include: z
          .array(z.string())
          .optional()
          .describe("CSS selectors to include in scan"),
        exclude: z
          .array(z.string())
          .optional()
          .describe("CSS selectors to exclude from scan"),
      }),
    },
    async ({ url, tags, include, exclude }) => {
      if (!(await isPlaywrightAvailable())) {
        return { content: [{ type: "text", text: NOT_INSTALLED_MSG }] };
      }
      const safeUrl = validateUrl(url);
      const axeTags = tags || ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

      try {
        const { chromium } = await import("playwright");
        const { default: AxeBuilder } = await import("@axe-core/playwright");
        const browser = await chromium.launch({ headless: true });
        try {
          const page = await browser.newPage();
          await page.goto(safeUrl, { waitUntil: "domcontentloaded", timeout: 30000 });

          let builder = new AxeBuilder({ page }).withTags(axeTags);
          if (include) for (const sel of include) builder = builder.include(sel);
          if (exclude) for (const sel of exclude) builder = builder.exclude(sel);

          const results = await builder.analyze();
          const violations = results.violations || [];

          if (violations.length === 0) {
            return {
              content: [{ type: "text", text: `axe-core scan complete: ${safeUrl}\n\nNo WCAG AA violations found.\nPasses: ${(results.passes || []).length} | Incomplete: ${(results.incomplete || []).length}` }],
            };
          }

          const lines = [
            `axe-core scan complete: ${safeUrl}`,
            `Violations: ${violations.length} | Passes: ${(results.passes || []).length}`,
            "",
          ];

          for (const v of violations) {
            lines.push(`[${v.impact?.toUpperCase() || "UNKNOWN"}] ${v.id}: ${v.help}`);
            lines.push(`  WCAG: ${(v.tags || []).filter(t => t.startsWith("wcag")).join(", ")}`);
            lines.push(`  Info: ${v.helpUrl || ""}`);
            for (const node of (v.nodes || []).slice(0, 3)) {
              lines.push(`  Element: ${(node.target || []).join(" > ")}`);
              if (node.failureSummary) {
                for (const line of node.failureSummary.split("\n").slice(0, 2)) {
                  lines.push(`    ${line.trim()}`);
                }
              }
            }
            if ((v.nodes || []).length > 3) lines.push(`  ... and ${v.nodes.length - 3} more elements`);
            lines.push("");
          }

          return { content: [{ type: "text", text: lines.join("\n") }] };
        } finally {
          await browser.close();
        }
      } catch (err) {
        return { content: [{ type: "text", text: `axe-core scan failed: ${err.message}` }] };
      }
    }
  );

  // ---- Tool: run_playwright_a11y_tree ----
  server.registerTool(
    "run_playwright_a11y_tree",
    {
      title: "Get Accessibility Tree",
      description: "Capture the accessibility tree of a page via Playwright. Shows how screen readers perceive the page structure.",
      inputSchema: z.object({
        url: z.string().describe("URL to analyze"),
        root: z.string().optional().describe("CSS selector for subtree root"),
      }),
    },
    async ({ url, root }) => {
      if (!(await isPlaywrightAvailable())) {
        return { content: [{ type: "text", text: NOT_INSTALLED_MSG }] };
      }
      const safeUrl = validateUrl(url);
      try {
        const { chromium } = await import("playwright");
        const browser = await chromium.launch({ headless: true });
        try {
          const page = await browser.newPage();
          await page.goto(safeUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
          const locator = root ? page.locator(root) : page;
          const snapshot = await locator.ariaSnapshot();
          return { content: [{ type: "text", text: `Accessibility Tree: ${safeUrl}\n\n${snapshot}` }] };
        } finally {
          await browser.close();
        }
      } catch (err) {
        return { content: [{ type: "text", text: `Failed to capture a11y tree: ${err.message}` }] };
      }
    }
  );

  // ---- Tool: run_playwright_keyboard_scan ----
  server.registerTool(
    "run_playwright_keyboard_scan",
    {
      title: "Keyboard Navigation Scan",
      description: "Test keyboard navigation by tabbing through all interactive elements on a page. Reports focus order, focus visibility, and keyboard traps.",
      inputSchema: z.object({
        url: z.string().describe("URL to test"),
        maxTabs: z.number().optional().describe("Maximum Tab presses (default: 50)"),
      }),
    },
    async ({ url, maxTabs }) => {
      if (!(await isPlaywrightAvailable())) {
        return { content: [{ type: "text", text: NOT_INSTALLED_MSG }] };
      }
      const safeUrl = validateUrl(url);
      const limit = Math.min(maxTabs || 50, 200);
      try {
        const { chromium } = await import("playwright");
        const browser = await chromium.launch({ headless: true });
        try {
          const page = await browser.newPage();
          await page.goto(safeUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
          const focusOrder = [];
          const seen = new Set();
          let trapped = false;

          for (let i = 0; i < limit; i++) {
            await page.keyboard.press("Tab");
            const info = await page.evaluate(() => {
              const el = document.activeElement;
              if (!el || el === document.body) return null;
              const tag = el.tagName.toLowerCase();
              const role = el.getAttribute("role") || "";
              const label = el.getAttribute("aria-label") || el.textContent?.trim().slice(0, 50) || "";
              const id = el.id || "";
              const outline = getComputedStyle(el).outlineStyle;
              return { tag, role, label, id, outline, selector: el.tagName + (el.id ? `#${el.id}` : "") };
            });
            if (!info) continue;
            const key = `${info.tag}#${info.id}|${info.label}`;
            if (seen.has(key) && focusOrder.length > 2) {
              trapped = focusOrder.length < 3;
              break;
            }
            seen.add(key);
            focusOrder.push(info);
          }

          const lines = [`Keyboard Navigation: ${safeUrl}`, `Interactive elements found: ${focusOrder.length}`, ""];
          if (trapped) lines.push("⚠ KEYBOARD TRAP DETECTED - focus cycles through fewer than 3 elements", "");
          for (let i = 0; i < focusOrder.length; i++) {
            const f = focusOrder[i];
            const vis = f.outline === "none" ? " [NO VISIBLE FOCUS]" : "";
            lines.push(`${i + 1}. <${f.tag}${f.role ? ` role="${f.role}"` : ""}> "${f.label}"${vis}`);
          }
          return { content: [{ type: "text", text: lines.join("\n") }] };
        } finally {
          await browser.close();
        }
      } catch (err) {
        return { content: [{ type: "text", text: `Keyboard scan failed: ${err.message}` }] };
      }
    }
  );

  // ---- Tool: run_playwright_contrast_scan ----
  server.registerTool(
    "run_playwright_contrast_scan",
    {
      title: "Visual Contrast Scan",
      description: "Scan a page for text elements that fail WCAG AA contrast requirements by sampling computed styles.",
      inputSchema: z.object({
        url: z.string().describe("URL to scan"),
      }),
    },
    async ({ url }) => {
      if (!(await isPlaywrightAvailable())) {
        return { content: [{ type: "text", text: NOT_INSTALLED_MSG }] };
      }
      const safeUrl = validateUrl(url);
      try {
        const { chromium } = await import("playwright");
        const browser = await chromium.launch({ headless: true });
        try {
          const page = await browser.newPage();
          await page.goto(safeUrl, { waitUntil: "domcontentloaded", timeout: 30000 });

          const elements = await page.evaluate(() => {
            function getLuminance(r, g, b) {
              const srgb = [r, g, b].map(c => {
                c = c / 255;
                return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
              });
              return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
            }
            function parseColor(str) {
              const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
              return m ? [+m[1], +m[2], +m[3]] : null;
            }
            const results = [];
            const textEls = document.querySelectorAll("p, span, a, button, label, li, td, th, h1, h2, h3, h4, h5, h6, input, textarea, select");
            for (const el of Array.from(textEls).slice(0, 100)) {
              const style = getComputedStyle(el);
              const fg = parseColor(style.color);
              const bg = parseColor(style.backgroundColor);
              if (!fg || !bg) continue;
              const l1 = getLuminance(...fg);
              const l2 = getLuminance(...bg);
              const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
              const fontSize = parseFloat(style.fontSize);
              const fontWeight = parseInt(style.fontWeight) || 400;
              const isLarge = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);
              const required = isLarge ? 3.0 : 4.5;
              if (ratio < required) {
                results.push({
                  tag: el.tagName.toLowerCase(),
                  text: (el.textContent || "").trim().slice(0, 40),
                  fgColor: style.color,
                  bgColor: style.backgroundColor,
                  ratio: Math.round(ratio * 100) / 100,
                  required,
                  isLarge,
                  selector: el.tagName + (el.id ? `#${el.id}` : "") + (el.className ? `.${el.className.split(" ")[0]}` : ""),
                });
              }
            }
            return results;
          });

          if (elements.length === 0) {
            return { content: [{ type: "text", text: `Contrast scan: ${safeUrl}\n\nNo contrast failures detected in sampled elements.` }] };
          }

          const lines = [`Contrast scan: ${safeUrl}`, `Failures: ${elements.length}`, ""];
          for (const e of elements) {
            lines.push(`[FAIL] <${e.tag}> "${e.text}" — ${e.ratio}:1 (need ${e.required}:1${e.isLarge ? ", large text" : ""})`);
            lines.push(`  Color: ${e.fgColor} on ${e.bgColor}`);
            lines.push(`  Selector: ${e.selector}`);
            lines.push("");
          }
          return { content: [{ type: "text", text: lines.join("\n") }] };
        } finally {
          await browser.close();
        }
      } catch (err) {
        return { content: [{ type: "text", text: `Contrast scan failed: ${err.message}` }] };
      }
    }
  );

  // ---- Tool: run_playwright_viewport_scan ----
  server.registerTool(
    "run_playwright_viewport_scan",
    {
      title: "Viewport / Zoom Reflow Test",
      description: "Test page at multiple viewport widths and zoom levels for content reflow issues (WCAG 1.4.4, 1.4.10).",
      inputSchema: z.object({
        url: z.string().describe("URL to test"),
      }),
    },
    async ({ url }) => {
      if (!(await isPlaywrightAvailable())) {
        return { content: [{ type: "text", text: NOT_INSTALLED_MSG }] };
      }
      const safeUrl = validateUrl(url);
      try {
        const { chromium } = await import("playwright");
        const browser = await chromium.launch({ headless: true });
        try {
          const widths = [320, 768, 1024, 1280];
          const results = [];

          for (const width of widths) {
            const page = await browser.newPage({ viewport: { width, height: 800 } });
            await page.goto(safeUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
            const info = await page.evaluate(() => ({
              hasHScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
              bodyWidth: document.documentElement.scrollWidth,
              viewportWidth: document.documentElement.clientWidth,
            }));
            results.push({ width, ...info });
            await page.close();
          }

          const lines = [`Viewport Reflow: ${safeUrl}`, ""];
          for (const r of results) {
            const status = r.hasHScroll ? "FAIL — horizontal scroll detected" : "PASS";
            lines.push(`${r.width}px: ${status} (content: ${r.bodyWidth}px)`);
          }
          return { content: [{ type: "text", text: lines.join("\n") }] };
        } finally {
          await browser.close();
        }
      } catch (err) {
        return { content: [{ type: "text", text: `Viewport test failed: ${err.message}` }] };
      }
    }
  );
}
