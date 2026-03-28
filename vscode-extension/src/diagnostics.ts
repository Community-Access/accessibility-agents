import * as vscode from "vscode";

// ── SARIF types (subset) ─────────────────────────────────────────────

interface SarifResult {
  ruleId?: string;
  level?: "error" | "warning" | "note" | "none";
  message?: { text?: string };
  locations?: SarifLocation[];
  fixes?: SarifFix[];
}

interface SarifLocation {
  physicalLocation?: {
    artifactLocation?: { uri?: string };
    region?: {
      startLine?: number;
      startColumn?: number;
      endLine?: number;
      endColumn?: number;
    };
  };
}

interface SarifFix {
  description?: { text?: string };
  artifactChanges?: SarifArtifactChange[];
}

interface SarifArtifactChange {
  artifactLocation?: { uri?: string };
  replacements?: SarifReplacement[];
}

interface SarifReplacement {
  deletedRegion?: {
    startLine?: number;
    startColumn?: number;
    endLine?: number;
    endColumn?: number;
  };
  insertedContent?: { text?: string };
}

interface SarifRun {
  results?: SarifResult[];
  tool?: { driver?: { name?: string } };
}

interface SarifLog {
  runs?: SarifRun[];
}

// ── Diagnostics manager ──────────────────────────────────────────────

const DIAGNOSTIC_SOURCE = "A11y Agent Team";

export class A11yDiagnostics implements vscode.Disposable {
  private collection: vscode.DiagnosticCollection;
  private fixMap = new Map<string, SarifFix[]>();

  constructor() {
    this.collection = vscode.languages.createDiagnosticCollection("a11y");
  }

  /** Clear all diagnostics. */
  clear(): void {
    this.collection.clear();
    this.fixMap.clear();
  }

  /** Clear diagnostics for a specific URI. */
  clearUri(uri: vscode.Uri): void {
    this.collection.delete(uri);
    this.fixMap.delete(uri.toString());
  }

  /** Import findings from a SARIF log and populate the Problems panel. */
  importSarif(log: SarifLog): number {
    this.clear();
    let count = 0;
    const byUri = new Map<string, vscode.Diagnostic[]>();

    for (const run of log.runs ?? []) {
      for (const result of run.results ?? []) {
        for (const loc of result.locations ?? []) {
          const phys = loc.physicalLocation;
          if (!phys?.artifactLocation?.uri) continue;

          const uri = resolveUri(phys.artifactLocation.uri);
          const range = regionToRange(phys.region);
          const severity = sarifLevelToSeverity(result.level);

          const diag = new vscode.Diagnostic(
            range,
            result.message?.text ?? result.ruleId ?? "Accessibility issue",
            severity
          );
          diag.source = DIAGNOSTIC_SOURCE;
          diag.code = result.ruleId ?? undefined;

          const arr = byUri.get(uri.toString()) ?? [];
          arr.push(diag);
          byUri.set(uri.toString(), arr);

          // Track fixes for code actions
          if (result.fixes && result.fixes.length > 0) {
            const existing = this.fixMap.get(diagnosticKey(uri, range)) ?? [];
            existing.push(...result.fixes);
            this.fixMap.set(diagnosticKey(uri, range), existing);
          }

          count++;
        }
      }
    }

    for (const [uriStr, diags] of byUri) {
      this.collection.set(vscode.Uri.parse(uriStr), diags);
    }
    return count;
  }

  /** Add a single diagnostic from a rule violation (non-SARIF path). */
  addViolation(
    uri: vscode.Uri,
    range: vscode.Range,
    message: string,
    ruleId: string,
    severity: vscode.DiagnosticSeverity = vscode.DiagnosticSeverity.Warning
  ): void {
    const diag = new vscode.Diagnostic(range, message, severity);
    diag.source = DIAGNOSTIC_SOURCE;
    diag.code = ruleId;

    const existing = this.collection.get(uri) ?? [];
    const updated = [...existing, diag];
    this.collection.set(uri, updated);
  }

  /** Get available SARIF fixes for a diagnostic at a given location. */
  getFixes(uri: vscode.Uri, range: vscode.Range): SarifFix[] {
    return this.fixMap.get(diagnosticKey(uri, range)) ?? [];
  }

  /** Return the underlying DiagnosticCollection for testing. */
  get diagnosticCollection(): vscode.DiagnosticCollection {
    return this.collection;
  }

  dispose(): void {
    this.collection.dispose();
    this.fixMap.clear();
  }
}

// ── Code Action provider ─────────────────────────────────────────────

export class A11yCodeActionProvider implements vscode.CodeActionProvider {
  static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix];

  constructor(private diagnostics: A11yDiagnostics) {}

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    _token: vscode.CancellationToken
  ): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = [];

    for (const diag of context.diagnostics) {
      if (diag.source !== DIAGNOSTIC_SOURCE) continue;

      // Check for SARIF-provided fixes
      const fixes = this.diagnostics.getFixes(document.uri, diag.range);
      for (const fix of fixes) {
        const action = sarifFixToAction(document, diag, fix);
        if (action) actions.push(action);
      }

      // Built-in quick fixes for common patterns
      const builtin = builtinQuickFix(document, diag);
      if (builtin) actions.push(builtin);
    }

    return actions;
  }
}

// ── Built-in quick fixes for common a11y violations ──────────────────

function builtinQuickFix(
  document: vscode.TextDocument,
  diag: vscode.Diagnostic
): vscode.CodeAction | undefined {
  const ruleId = typeof diag.code === "string" ? diag.code : "";
  const lineText = document.lineAt(diag.range.start.line).text;

  // Fix: Add alt text to <img> without alt attribute
  if (
    (ruleId === "image-alt" || ruleId === "WCAG-1.1.1") &&
    /<img\b[^>]*(?!alt=)[^>]*>/i.test(lineText) &&
    !lineText.includes("alt=")
  ) {
    const action = new vscode.CodeAction(
      'Fix: Add alt="" (mark as decorative)',
      vscode.CodeActionKind.QuickFix
    );
    const edit = new vscode.WorkspaceEdit();
    // Insert alt="" before the closing > or />
    const imgMatch = lineText.match(/<img\b/i);
    if (imgMatch && imgMatch.index !== undefined) {
      const insertPos = new vscode.Position(
        diag.range.start.line,
        imgMatch.index + imgMatch[0].length
      );
      edit.insert(document.uri, insertPos, ' alt=""');
    }
    action.edit = edit;
    action.diagnostics = [diag];
    action.isPreferred = false;
    return action;
  }

  // Fix: Add label to form input
  if (
    (ruleId === "label" || ruleId === "WCAG-1.3.1") &&
    /<input\b[^>]*(?!aria-label)[^>]*>/i.test(lineText)
  ) {
    const action = new vscode.CodeAction(
      "Fix: Add aria-label",
      vscode.CodeActionKind.QuickFix
    );
    const edit = new vscode.WorkspaceEdit();
    const inputMatch = lineText.match(/<input\b/i);
    if (inputMatch && inputMatch.index !== undefined) {
      const insertPos = new vscode.Position(
        diag.range.start.line,
        inputMatch.index + inputMatch[0].length
      );
      edit.insert(document.uri, insertPos, ' aria-label="TODO: add label"');
    }
    action.edit = edit;
    action.diagnostics = [diag];
    action.isPreferred = false;
    return action;
  }

  return undefined;
}

// ── SARIF fix to Code Action conversion ──────────────────────────────

function sarifFixToAction(
  document: vscode.TextDocument,
  diag: vscode.Diagnostic,
  fix: SarifFix
): vscode.CodeAction | undefined {
  const label = fix.description?.text ?? `Fix: ${diag.code ?? "accessibility issue"}`;
  const action = new vscode.CodeAction(label, vscode.CodeActionKind.QuickFix);
  const edit = new vscode.WorkspaceEdit();

  for (const change of fix.artifactChanges ?? []) {
    for (const replacement of change.replacements ?? []) {
      const region = replacement.deletedRegion;
      if (!region) continue;
      const range = regionToRange(region);
      const text = replacement.insertedContent?.text ?? "";
      edit.replace(document.uri, range, text);
    }
  }

  action.edit = edit;
  action.diagnostics = [diag];
  action.isPreferred = true;
  return action;
}

// ── Helpers ──────────────────────────────────────────────────────────

function resolveUri(raw: string): vscode.Uri {
  if (raw.startsWith("file://")) return vscode.Uri.parse(raw);
  // Relative path — resolve against workspace
  const folders = vscode.workspace.workspaceFolders;
  if (folders && folders.length > 0) {
    return vscode.Uri.joinPath(folders[0].uri, raw);
  }
  return vscode.Uri.file(raw);
}

function regionToRange(
  region?: { startLine?: number; startColumn?: number; endLine?: number; endColumn?: number }
): vscode.Range {
  if (!region) return new vscode.Range(0, 0, 0, 0);
  // SARIF lines are 1-based; VS Code Range is 0-based
  const startLine = Math.max(0, (region.startLine ?? 1) - 1);
  const startCol = Math.max(0, (region.startColumn ?? 1) - 1);
  const endLine = Math.max(startLine, (region.endLine ?? region.startLine ?? 1) - 1);
  const endCol = Math.max(startCol, (region.endColumn ?? region.startColumn ?? 1) - 1);
  return new vscode.Range(startLine, startCol, endLine, endCol);
}

function sarifLevelToSeverity(
  level?: string
): vscode.DiagnosticSeverity {
  switch (level) {
    case "error":
      return vscode.DiagnosticSeverity.Error;
    case "warning":
      return vscode.DiagnosticSeverity.Warning;
    case "note":
      return vscode.DiagnosticSeverity.Information;
    default:
      return vscode.DiagnosticSeverity.Warning;
  }
}

function diagnosticKey(uri: vscode.Uri, range: vscode.Range): string {
  return `${uri.toString()}:${range.start.line}:${range.start.character}:${range.end.line}:${range.end.character}`;
}
