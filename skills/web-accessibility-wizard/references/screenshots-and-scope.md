# Web Accessibility Wizard reference: MANDATORY: Screenshot Capture

Part of the `web-accessibility-wizard` skill. Read this only when the task reaches these sections.

## MANDATORY: Screenshot Capture

**If the user opted for screenshots in Phase 0, you MUST capture them. DO NOT skip this step. DO NOT substitute with descriptions or code review alone. You MUST run Bash commands to capture actual screenshot files.**

If no URL was provided or the user declined screenshots, skip this section entirely.

### Tool Selection

Try tools in this order - use the first one that works:

1. **capture-website-cli** (lightest, no install needed via npx)
2. **Playwright** (fallback, heavier but more capable)

### Setup

Create a `screenshots/` directory in the project root:

```bash
mkdir -p screenshots
```

Test which tool is available:

```bash
# Try capture-website-cli first (runs via npx, no global install needed)
npx capture-website-cli --version 2>/dev/null && echo "capture-website available" || echo "capture-website not available"

# Fallback: try Playwright
npx playwright --version 2>/dev/null && echo "playwright available" || echo "playwright not available"
```

### How to Capture

**With capture-website-cli (preferred):**

```bash
# Full-page screenshot
npx capture-website-cli "<URL>" --output="screenshots/<page-name>.png" --full-page --type=png

# With specific viewport
npx capture-website-cli "<URL>" --output="screenshots/<name>.png" --full-page --width=1280 --height=720

# Mobile viewport
npx capture-website-cli "<URL>" --output="screenshots/<name>-mobile.png" --full-page --width=375 --height=812

# Wait for page to load
npx capture-website-cli "<URL>" --output="screenshots/<name>.png" --full-page --delay=3
```

**With Playwright (fallback):**

```bash
npx playwright screenshot --browser chromium --full-page --wait-for-timeout 3000 "<URL>" "screenshots/<page-name>.png"
```

### When to Capture - MANDATORY if screenshots were requested

You MUST take screenshots at these points. DO NOT skip any of them:

1. **Before the audit starts** - Run the Bash command to capture each page in the audit scope as a baseline. DO NOT SKIP THIS.
2. **For each visual issue found** - Run the Bash command to capture the relevant page for contrast, focus indicators, and layout issues. Name files: `screenshots/issue-01-contrast.png`, `screenshots/issue-05-new-tab-link.png`, etc.
3. **For axe-core violations** - Run the Bash command to capture the page that was scanned.

**If you finish the audit without having run any screenshot commands and the user requested screenshots, you have failed. Go back and capture them.**

### Include in Report

When writing `ACCESSIBILITY-AUDIT.md`, reference screenshots inline:

```markdown
### 1. Primary brand color fails contrast

![Contrast issue on home page](screenshots/issue-01-contrast.png)
```

If no URL was provided or no screenshot tool is available, skip screenshots and note it in the report.

---

## Audit Scope Rules

Before starting Phase 1, apply the choices from Phase 0:

### Audit Method Rules - CRITICAL

- **Runtime scan only** - Skip Phases 1-8 entirely. Go straight to Phase 9 and run axe-core. DO NOT open, read, or review any source code files. The entire audit is the axe-core scan output.
- **Code review only** - Run Phases 1-8 as normal. Skip the axe-core scan in Phase 9 (but still provide testing recommendations).
- **Both** - Run Phase 9 (axe-core) FIRST, then run Phases 1-8 for code review. This gives the most complete picture.

**DO NOT silently fall back to code review.** If the user chose runtime scan, run the terminal command. Period.

### Crawl Depth Rules

- **Current page only** - Scan only the single URL provided.
- **Key pages** - Scan each page the user listed. Report findings per page.
- **Full site crawl** - Crawl internal links (same domain) up to 50 pages. Scan each discovered page.

### Large Crawl Handling

If a full site crawl discovers more than 50 pages:

1. **Warn the user:** "Found X pages reachable from the starting URL. Scanning all may take significant time."
2. **Offer sampling:** Ask using AskUserQuestion:
   - **Scan all** - proceed with the full crawl
   - **Scan a sample of 15-20 pages** - select proportionally across URL patterns and page types
   - **Let me pick pages** - show the discovered URL list and let the user select
   - **Exclude URL patterns** - let the user specify patterns to skip (e.g., `/blog/*`, `/api/*`)
3. **Proportional sampling strategy:** Select pages representing each major URL pattern/section:
   - Top-level pages (/, /about, /contact)
   - One page from each URL pattern group (/products/*, /blog/*, /docs/*)
   - Pages with unique layouts (login, dashboard, checkout)
   - The deepest nested page found
4. **Extrapolation reporting:** After scanning the sample, report:
   - "Based on a sample of N pages from X total, here are the most common issues."
   - "Systemic issues found in the sample likely affect all X pages."
   - "Run a full crawl to find all instances and page-specific issues."

### Thoroughness Rules

For **Quick scan**, run only Phases 1, 3, 4, and 9 (adjusted by audit method). For **Standard review**, run all phases. For **Deep dive**, run all phases plus additional checks noted in each phase.

When reporting findings, always note which page the issue was found on if auditing multiple pages.

---
