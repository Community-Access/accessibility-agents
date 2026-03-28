import * as vscode from "vscode";
import { A11yDiagnostics } from "./diagnostics";

// ── Quick Scan command ───────────────────────────────────────────────

export function registerQuickScan(
  context: vscode.ExtensionContext,
  diagnostics: A11yDiagnostics
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("a11y.quickScan", async () => {
      const url = await vscode.window.showInputBox({
        title: "A11y Quick Scan",
        prompt: "Enter the URL to scan for accessibility issues",
        placeHolder: "https://localhost:3000",
        validateInput: (v) => {
          try {
            new URL(v);
            return undefined;
          } catch {
            return "Enter a valid URL (including protocol)";
          }
        },
      });
      if (!url) return;

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Scanning ${url} for accessibility issues...`,
          cancellable: false,
        },
        async () => {
          try {
            const terminal = vscode.window.createTerminal({
              name: "A11y Quick Scan",
              hideFromUser: true,
            });
            // Write SARIF output to temp file, then import
            const tmpFile = vscode.Uri.joinPath(
              context.globalStorageUri,
              "last-scan.sarif"
            );
            terminal.sendText(
              `npx @axe-core/cli ${url} --tags wcag2a,wcag2aa,wcag21a,wcag21aa --save ${tmpFile.fsPath}`,
              true
            );
            // Wait for the terminal to finish
            await new Promise<void>((resolve) => {
              const disposable = vscode.window.onDidCloseTerminal((t) => {
                if (t === terminal) {
                  disposable.dispose();
                  resolve();
                }
              });
              // Auto-close terminal after command
              setTimeout(() => {
                terminal.sendText("exit", true);
              }, 30_000);
            });

            try {
              const bytes = await vscode.workspace.fs.readFile(tmpFile);
              const sarif = JSON.parse(Buffer.from(bytes).toString("utf-8"));
              const count = diagnostics.importSarif(sarif);
              vscode.window.showInformationMessage(
                `A11y Scan complete: ${count} issue${count === 1 ? "" : "s"} found. See Problems panel.`
              );
            } catch {
              vscode.window.showWarningMessage(
                "Scan completed but no SARIF output was generated. Check that @axe-core/cli is available via npx."
              );
            }
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            vscode.window.showErrorMessage(`Scan failed: ${msg}`);
          }
        }
      );
    })
  );
}

// ── Import SARIF command ─────────────────────────────────────────────

export function registerImportSarif(
  context: vscode.ExtensionContext,
  diagnostics: A11yDiagnostics
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("a11y.importSarif", async () => {
      const files = await vscode.window.showOpenDialog({
        canSelectMany: false,
        filters: { "SARIF files": ["sarif", "json"] },
        title: "Import SARIF Accessibility Report",
      });
      if (!files || files.length === 0) return;

      try {
        const bytes = await vscode.workspace.fs.readFile(files[0]);
        const sarif = JSON.parse(Buffer.from(bytes).toString("utf-8"));
        const count = diagnostics.importSarif(sarif);
        vscode.window.showInformationMessage(
          `Imported ${count} finding${count === 1 ? "" : "s"} from SARIF report. See Problems panel.`
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        vscode.window.showErrorMessage(`Failed to import SARIF: ${msg}`);
      }
    })
  );
}

// ── Clear Diagnostics command ────────────────────────────────────────

export function registerClearDiagnostics(
  context: vscode.ExtensionContext,
  diagnostics: A11yDiagnostics
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("a11y.clearDiagnostics", () => {
      diagnostics.clear();
      vscode.window.showInformationMessage(
        "Accessibility diagnostics cleared."
      );
    })
  );
}

// ── Check Contrast command ───────────────────────────────────────────

export function registerCheckContrast(
  context: vscode.ExtensionContext
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("a11y.checkContrast", async () => {
      const fg = await vscode.window.showInputBox({
        title: "Foreground Color",
        prompt: "Enter foreground color (hex)",
        placeHolder: "#333333",
        validateInput: (v) =>
          /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v.trim())
            ? undefined
            : "Enter a valid 3 or 6-digit hex color",
      });
      if (!fg) return;

      const bg = await vscode.window.showInputBox({
        title: "Background Color",
        prompt: "Enter background color (hex)",
        placeHolder: "#ffffff",
        validateInput: (v) =>
          /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v.trim())
            ? undefined
            : "Enter a valid 3 or 6-digit hex color",
      });
      if (!bg) return;

      const fgNorm = fg.trim();
      const bgNorm = bg.trim();

      const ratio = computeContrastRatio(fgNorm, bgNorm);
      const r = Math.round(ratio * 100) / 100;
      const normalPass = ratio >= 4.5 ? "PASS" : "FAIL";
      const largePass = ratio >= 3 ? "PASS" : "FAIL";

      const lc = computeAPCA(fgNorm, bgNorm);
      const absLc = Math.abs(lc);
      const lcRounded = Math.round(lc * 10) / 10;
      // APCA thresholds: |Lc| >= 75 body text, >= 60 large text, >= 45 non-text UI
      const apcaBody = absLc >= 75 ? "PASS" : "FAIL";
      const apcaLarge = absLc >= 60 ? "PASS" : "FAIL";

      vscode.window.showInformationMessage(
        `WCAG 2: ${r}:1 (Normal ${normalPass}, Large ${largePass}) | APCA: Lc ${lcRounded} (Body ${apcaBody}, Large ${apcaLarge})`
      );
    })
  );
}

// ── Show Dashboard command (WebView stub) ────────────────────────────

export function registerShowDashboard(
  context: vscode.ExtensionContext
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("a11y.showDashboard", () => {
      const panel = vscode.window.createWebviewPanel(
        "a11yDashboard",
        "Accessibility Dashboard",
        vscode.ViewColumn.One,
        { enableScripts: false }
      );

      panel.webview.html = getDashboardHtml();
    })
  );
}

// ── Helpers ──────────────────────────────────────────────────────────

function sRGBtoLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.2126 * sRGBtoLinear(r) + 0.7152 * sRGBtoLinear(g) + 0.0722 * sRGBtoLinear(b);
}

function computeContrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// ── APCA (WCAG 3.0 draft) contrast ──────────────────────────────────
// Based on APCA-W3 0.0.98G-4g specification.

const APCA_EXP_TXT = 0.57;
const APCA_EXP_BG = 0.56;
const APCA_SCALE = 1.14;
const APCA_THRESHOLD = 0.022;
const APCA_CLAMP = 0.1;

function apcaSoftClamp(y: number): number {
  return y < APCA_THRESHOLD ? y + Math.pow(APCA_THRESHOLD - y, 1.414) : y;
}

function computeAPCA(textHex: string, bgHex: string): number {
  let tH = textHex.replace("#", "");
  if (tH.length === 3) tH = tH[0] + tH[0] + tH[1] + tH[1] + tH[2] + tH[2];
  let bH = bgHex.replace("#", "");
  if (bH.length === 3) bH = bH[0] + bH[0] + bH[1] + bH[1] + bH[2] + bH[2];

  let txtY =
    0.2126729 * sRGBtoLinear(parseInt(tH.slice(0, 2), 16)) +
    0.7151522 * sRGBtoLinear(parseInt(tH.slice(2, 4), 16)) +
    0.0721750 * sRGBtoLinear(parseInt(tH.slice(4, 6), 16));
  let bgY =
    0.2126729 * sRGBtoLinear(parseInt(bH.slice(0, 2), 16)) +
    0.7151522 * sRGBtoLinear(parseInt(bH.slice(2, 4), 16)) +
    0.0721750 * sRGBtoLinear(parseInt(bH.slice(4, 6), 16));

  txtY = apcaSoftClamp(txtY);
  bgY = apcaSoftClamp(bgY);

  let sapc: number;
  if (bgY > txtY) {
    sapc = (Math.pow(bgY, APCA_EXP_BG) - Math.pow(txtY, APCA_EXP_TXT)) * APCA_SCALE;
  } else {
    sapc = (Math.pow(bgY, APCA_EXP_TXT) - Math.pow(txtY, APCA_EXP_BG)) * APCA_SCALE;
  }

  if (Math.abs(sapc) < APCA_CLAMP) return 0;
  return sapc > 0
    ? (sapc - APCA_CLAMP) * 100
    : (sapc + APCA_CLAMP) * 100;
}

function getDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Dashboard</title>
  <style>
    body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); background: var(--vscode-editor-background); padding: 1rem; }
    h1 { font-size: 1.4rem; margin-bottom: 0.5rem; }
    .card { border: 1px solid var(--vscode-panel-border); border-radius: 4px; padding: 1rem; margin-bottom: 1rem; }
    .card h2 { font-size: 1.1rem; margin-top: 0; }
    p { line-height: 1.5; }
  </style>
</head>
<body>
  <h1>Accessibility Dashboard</h1>
  <div class="card" role="region" aria-label="Getting started">
    <h2>Getting Started</h2>
    <p>Use the <strong>A11y: Quick Scan</strong> command to scan a URL, or <strong>A11y: Import SARIF</strong> to load an existing report. Findings will appear in the Problems panel with quick-fix suggestions.</p>
  </div>
  <div class="card" role="region" aria-label="Scan history">
    <h2>Scan History</h2>
    <p>No scans recorded yet. Run your first scan to see results here.</p>
  </div>
  <div class="card" role="region" aria-label="Resources">
    <h2>Resources</h2>
    <ul>
      <li>Use <kbd>Ctrl+Shift+P</kbd> and type "A11y" to see all available commands</li>
      <li>Chat with <strong>@a11y</strong> in Copilot Chat for guided accessibility reviews</li>
    </ul>
  </div>
</body>
</html>`;
}
